import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CustomThemeStudioView, VIEW_TYPE_CTS } from './views/customThemeStudioView';
import { ThemeManager } from './managers/themeManager';
import { DEFAULT_SETTINGS, SETTINGS_VERSION, CustomThemeStudioSettings, CustomThemeStudioSettingTab } from './settings';
import { SettingsManager } from './managers/SettingsManager';
import { ICodeEditorConfig } from './interfaces/types';
import { freezeTimer, Logger } from "./utils";
import { CssSnippetFuzzySuggestModal } from "./modals/CssSnippetFuzzySuggestModal";

export default class CustomThemeStudioPlugin extends Plugin {
	settings: CustomThemeStudioSettings;
	settingsManager: SettingsManager;
	themeManager: ThemeManager;
	config: ICodeEditorConfig;
	freezeDelaySecs = 5;

	async onload() {
		await this.loadSettings();

		// Initialize logger with plugin instance
		Logger.init(this);

		// Initialize reactive settings manager
		this.settingsManager = new SettingsManager(this);

		// Initialize theme manager
		this.themeManager = new ThemeManager(this);

		// Register view
		this.registerView(
			VIEW_TYPE_CTS,
			(leaf: WorkspaceLeaf) => new CustomThemeStudioView(this.settings, leaf, this, this.config)
		);

		// Add ribbon icon
		this.addRibbonIcon('paintbrush', 'Custom Theme Studio', () => {
			this.activateView();
		});

		// Add command to open the view
		this.addCommand({
			id: 'open-theme-studio',
			name: 'Open view',
			callback: () => {
				this.activateView();
			}
		});

		// Add command to toggle theme changes
		this.addCommand({
			id: 'toggle-custom-theme',
			name: 'Toggle custom theme',
			callback: () => {
				this.themeManager.toggleCustomTheme();
			}
		});

		// Add command to select element
		this.addCommand({
			id: 'select-element-for-css-rule',
			name: 'Select an element for new CSS rule',
			callback: () => {
				this.themeManager.startElementSelection();
			}
		});

		// Add command to freeze Obsidian
		// https://github.com/chrisgrieser/obsidian-theme-design-utilities/blob/main/src/main.ts#L19
		this.addCommand({
			id: "freeze-obsidian",
			name: "Freeze Obsidian (with " + this.freezeDelaySecs.toString() + "s delay)",
			callback: () => {
				freezeTimer(this.freezeDelaySecs);
			},
		});

		// Add command to import CSS snippet
		this.addCommand({
			id: "import-css-snippet",
			name: "Import CSS snippet",
			callback: () => {
				new CssSnippetFuzzySuggestModal(this.app, this, this.config).open();
			}
		});

		// Add settings tab
		this.addSettingTab(new CustomThemeStudioSettingTab(this.app, this));

		// Update custom CSS
		let fullCSS = '';
		this.settings.cssRules.forEach(rule => {
			if (rule.enabled) {
				fullCSS += `/* ${rule.rule} */\n${rule.css}\n\n`;
			}
		});
		this.settings.customCSS = fullCSS;
		await this.saveSettings();

		// Apply saved theme if enabled
		if (this.settings.customCSS) {
			this.themeManager.applyIfEnabled();
		}
	}

	/**
	 * Activates the Custom Theme Studio view.
	 * If a view already exists, reveals it. Otherwise, creates a new view in the right sidebar.
	 */
	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CTS);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			if (!leaf) {
				Logger.error("custom-theme-studio: failed to get or create leaf");
				return;
			}
			await leaf.setViewState({ type: VIEW_TYPE_CTS, active: true });
		}
		workspace.revealLeaf(leaf);
	}

	onunload() {
		// Clean up settings manager
		this.settingsManager?.destroy();

		// Remove any custom styles when plugin is disabled
		this.themeManager.removeCustomTheme();
	}

	/**
	 * Loads plugin settings from disk and applies migrations if needed.
	 * Merges loaded settings with default values and ensures version is set.
	 */
	async loadSettings() {
		const loadedData = await this.loadData();
		const migratedData = this.migrateSettings(loadedData || {});
		this.settings = Object.assign({}, DEFAULT_SETTINGS, migratedData);

		// Ensure version is set
		if (!this.settings.version) {
			this.settings.version = SETTINGS_VERSION;
			await this.saveSettings();
		}
	}

	/**
	 * Migrate settings from older versions to current schema
	 * Add migration logic here as schema evolves
	 */
	private migrateSettings(oldSettings: any): Partial<CustomThemeStudioSettings> {
		const version = oldSettings.version || 0;

		// Version 0 -> 1: Initial versioning (no actual changes needed)
		if (version < 1) {
			Logger.info(`Migrating settings from version ${version} to version 1`);
		}

		/**
		 * MIGRATION TEMPLATE for future versions:
		 *
		 * if (version < 2) {
		 *     Logger.info(`Migrating settings from version ${version} to version 2`);
		 *     // Example: Rename a property
		 *     if (oldSettings.oldPropertyName) {
		 *         oldSettings.newPropertyName = oldSettings.oldPropertyName;
		 *         delete oldSettings.oldPropertyName;
		 *     }
		 * }
		 */

		// Set current version
		oldSettings.version = SETTINGS_VERSION;

		return oldSettings;
	}

	/**
	 * Persists current plugin settings to disk.
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Refreshes the Custom Theme Studio view by calling onOpen() on all open instances.
	 * Used to update the UI after settings changes.
	 */
	async reloadView(): Promise<void> {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS);
		leaves.forEach((leaf) => {
			if (leaf.view instanceof CustomThemeStudioView) {
				// Refresh the view if it's open
				(leaf.view as CustomThemeStudioView).onOpen();
			}
		});
	}

}
