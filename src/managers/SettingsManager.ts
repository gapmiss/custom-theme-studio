import { CustomThemeStudioSettings } from '../settings';
import CustomThemeStudioPlugin from '../main';
import { Logger } from '../utils';

export type SettingKey = keyof CustomThemeStudioSettings;
export type SettingValue<K extends SettingKey> = CustomThemeStudioSettings[K];
export type SettingChangeCallback<K extends SettingKey> = (
	value: SettingValue<K>,
	oldValue: SettingValue<K>,
	key: K
) => void;

export interface SettingValidationResult {
	valid: boolean;
	error?: string;
	sanitizedValue?: unknown;
}

export type SettingValidator<K extends SettingKey> = (
	value: SettingValue<K>,
	key: K
) => SettingValidationResult;

/**
 * Reactive settings manager with type-safe updates and automatic persistence
 */
export class SettingsManager {
	private plugin: CustomThemeStudioPlugin;
	private listeners = new Map<SettingKey, Set<SettingChangeCallback<SettingKey>>>();
	private validators = new Map<SettingKey, SettingValidator<SettingKey>>();
	private isUpdating = false;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
		this.setupDefaultValidators();
	}

	/**
	 * Get a setting value with type safety
	 */
	get<K extends SettingKey>(key: K): SettingValue<K> {
		return this.plugin.settings[key];
	}

	/**
	 * Update a setting with validation, persistence, and reactive notifications
	 */
	async update<K extends SettingKey>(
		key: K,
		value: SettingValue<K>,
		options: {
			validate?: boolean;
			persist?: boolean;
			notify?: boolean;
		} = {}
	): Promise<boolean> {
		const { validate = true, persist = true, notify = true } = options;

		// Prevent infinite loops during batch updates
		if (this.isUpdating) {
			return false;
		}

		const oldValue = this.plugin.settings[key];

		// Skip if value hasn't changed
		if (oldValue === value) {
			return true;
		}

		// Validate if requested
		if (validate) {
			const validation = this.validateSetting(key, value);
			if (!validation.valid) {
				Logger.error(`Settings validation failed for ${key}:`, validation.error);
				return false;
			}
			// Use sanitized value if provided
			if (validation.sanitizedValue !== undefined) {
				value = validation.sanitizedValue as SettingValue<K>;
			}
		}

		// Update the setting
		this.plugin.settings[key] = value;

		// Persist if requested
		if (persist) {
			try {
				await this.plugin.saveSettings();
			} catch (error) {
				Logger.error(`Failed to save settings:`, error);
				// Revert on save failure
				this.plugin.settings[key] = oldValue;
				return false;
			}
		}

		// Notify listeners if requested
		if (notify) {
			this.notifyListeners(key, value, oldValue);
		}

		return true;
	}

	/**
	 * Update multiple settings atomically
	 */
	async updateBatch(
		updates: Partial<CustomThemeStudioSettings>,
		options: {
			validate?: boolean;
			persist?: boolean;
			notify?: boolean;
		} = {}
	): Promise<boolean> {
		const { validate = true, persist = true, notify = true } = options;

		this.isUpdating = true;
		const oldValues = new Map<SettingKey, unknown>();

		try {
			// Validate all updates first
			if (validate) {
				for (const [key, value] of Object.entries(updates)) {
					const validation = this.validateSetting(key as SettingKey, value);
					if (!validation.valid) {
						Logger.error(`Batch validation failed for ${key}:`, validation.error);
						return false;
					}
					if (validation.sanitizedValue !== undefined) {
						(updates as Record<string, unknown>)[key] = validation.sanitizedValue;
					}
				}
			}

			// Store old values and apply updates
			for (const [key, value] of Object.entries(updates)) {
				const settingKey = key as SettingKey;
				oldValues.set(settingKey, this.plugin.settings[settingKey]);
				(this.plugin.settings as unknown as Record<string, unknown>)[settingKey] = value;
			}

			// Persist if requested
			if (persist) {
				await this.plugin.saveSettings();
			}

			// Notify all listeners if requested
			if (notify) {
				for (const [key, value] of Object.entries(updates)) {
					const settingKey = key as SettingKey;
					const oldValue = oldValues.get(settingKey);
					this.notifyListeners(settingKey, value as SettingValue<typeof settingKey>, oldValue as SettingValue<typeof settingKey>);
				}
			}

			return true;
		} catch (error) {
			Logger.error('Batch settings update failed:', error);
			// Revert all changes
			for (const [key, oldValue] of oldValues) {
				(this.plugin.settings as unknown as Record<string, unknown>)[key] = oldValue;
			}
			return false;
		} finally {
			this.isUpdating = false;
		}
	}

	/**
	 * Subscribe to setting changes
	 */
	onChange<K extends SettingKey>(
		key: K,
		callback: SettingChangeCallback<K>
	): () => void {
		if (!this.listeners.has(key)) {
			this.listeners.set(key, new Set());
		}

		this.listeners.get(key)!.add(callback);

		// Return unsubscribe function
		return () => {
			const listeners = this.listeners.get(key);
			if (listeners) {
				listeners.delete(callback);
				if (listeners.size === 0) {
					this.listeners.delete(key);
				}
			}
		};
	}

	/**
	 * Subscribe to changes on multiple settings
	 */
	onAnyChange(
		keys: SettingKey[],
		callback: (key: SettingKey, value: unknown, oldValue: unknown) => void
	): () => void {
		const unsubscribers = keys.map(key =>
			this.onChange(key, (value, oldValue) => callback(key, value, oldValue))
		);

		return () => {
			unsubscribers.forEach(unsub => unsub());
		};
	}

	/**
	 * Add custom validator for a setting
	 */
	addValidator<K extends SettingKey>(
		key: K,
		validator: SettingValidator<K>
	): void {
		this.validators.set(key, validator);
	}

	/**
	 * Validate a setting value
	 */
	private validateSetting<K extends SettingKey>(
		key: K,
		value: SettingValue<K>
	): SettingValidationResult {
		const validator = this.validators.get(key);
		if (validator) {
			return validator(value, key);
		}

		// Default validation - just check for undefined/null
		if (value === undefined || value === null) {
			return {
				valid: false,
				error: `Setting ${key} cannot be null or undefined`
			};
		}

		return { valid: true };
	}

	/**
	 * Notify all listeners for a setting change
	 */
	private notifyListeners<K extends SettingKey>(
		key: K,
		value: SettingValue<K>,
		oldValue: SettingValue<K>
	): void {
		const listeners = this.listeners.get(key);
		if (listeners) {
			listeners.forEach(callback => {
				try {
					callback(value, oldValue, key);
				} catch (error) {
					Logger.error(`Error in settings listener for ${key}:`, error);
				}
			});
		}
	}

	/**
	 * Setup default validators for common settings
	 */
	private setupDefaultValidators(): void {
		// String validators
		this.addValidator('exportThemeName', (value: string) => ({
			valid: true,
			sanitizedValue: value.trim()
		}));

		this.addValidator('exportThemeAuthor', (value: string) => ({
			valid: true,
			sanitizedValue: value.trim()
		}));

		// Number validators
		this.addValidator('editorFontSize', (value: number) => {
			if (value < 8 || value > 72) {
				return {
					valid: false,
					error: 'Font size must be between 8 and 72'
				};
			}
			return { valid: true };
		});

		this.addValidator('editorTabWidth', (value: number) => {
			if (value < 1 || value > 16) {
				return {
					valid: false,
					error: 'Tab width must be between 1 and 16'
				};
			}
			return { valid: true };
		});

		// Array validators
		this.addValidator('cssVariables', (value: unknown[]) => ({
			valid: Array.isArray(value),
			error: Array.isArray(value) ? undefined : 'cssVariables must be an array'
		}));

		this.addValidator('cssRules', (value: unknown[]) => ({
			valid: Array.isArray(value),
			error: Array.isArray(value) ? undefined : 'cssRules must be an array'
		}));
	}

	/**
	 * Get all current listeners (for debugging)
	 */
	getListeners(): Map<SettingKey, number> {
		const result = new Map<SettingKey, number>();
		for (const [key, listeners] of this.listeners) {
			result.set(key, listeners.size);
		}
		return result;
	}

	/**
	 * Clean up all listeners
	 */
	destroy(): void {
		this.listeners.clear();
		this.validators.clear();
	}
}