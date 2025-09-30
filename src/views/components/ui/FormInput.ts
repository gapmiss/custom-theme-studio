import { ColorComponent } from 'obsidian';

export interface FormInputConfig {
	type?: 'text' | 'password' | 'email' | 'url';
	placeholder?: string;
	value?: string;
	label?: string;
	required?: boolean;
	disabled?: boolean;
	classes?: string[];
	validation?: (value: string) => string | null; // Return error message or null
	onChange?: (value: string) => void;
	onInput?: (value: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
}

export interface ClearableInputConfig extends FormInputConfig {
	clearable?: boolean;
	onClear?: () => void;
}

export interface ColorInputConfig extends ClearableInputConfig {
	colorPicker?: boolean;
	defaultColor?: string;
	onColorChange?: (color: string) => void;
}

export class FormInput {
	private container: HTMLElement;
	private input: HTMLInputElement;
	private config: FormInputConfig;
	private errorElement?: HTMLElement;
	private labelElement?: HTMLElement;
	private clearButton?: HTMLButtonElement;
	private colorPicker?: ColorComponent;

	constructor(container: HTMLElement, config: FormInputConfig) {
		this.container = container;
		this.config = config;
		this.input = this.createInput();
		this.setupEventListeners();
	}

	private createInput(): HTMLInputElement {
		const wrapper = this.container.createDiv('form-input-wrapper');

		// Create label if provided
		if (this.config.label) {
			this.labelElement = wrapper.createEl('label', {
				cls: 'form-input-label',
				text: this.config.label
			});
		}

		const inputContainer = wrapper.createDiv('form-input-container');

		// Create input element
		const input = inputContainer.createEl('input', {
			cls: ['form-input', ...(this.config.classes || [])].join(' '),
			attr: {
				type: this.config.type || 'text',
				placeholder: this.config.placeholder || '',
				value: this.config.value || ''
			}
		});

		if (this.config.required) {
			input.setAttribute('required', '');
		}

		if (this.config.disabled) {
			input.setAttribute('disabled', '');
		}

		return input;
	}

	private setupEventListeners(): void {
		if (this.config.onInput) {
			this.input.addEventListener('input', (e) => {
				const value = (e.target as HTMLInputElement).value;
				this.config.onInput!(value);
				this.validateInput(value);
			});
		}

		if (this.config.onChange) {
			this.input.addEventListener('change', (e) => {
				const value = (e.target as HTMLInputElement).value;
				this.config.onChange!(value);
				this.validateInput(value);
			});
		}

		if (this.config.onFocus) {
			this.input.addEventListener('focus', this.config.onFocus);
		}

		if (this.config.onBlur) {
			this.input.addEventListener('blur', this.config.onBlur);
		}
	}

	private validateInput(value: string): boolean {
		if (!this.config.validation) return true;

		const error = this.config.validation(value);
		this.showError(error);
		return error === null;
	}

	private showError(error: string | null): void {
		// Remove existing error
		if (this.errorElement) {
			this.errorElement.remove();
			this.errorElement = undefined;
		}

		if (error) {
			this.errorElement = this.container.createDiv({
				cls: 'form-input-error',
				text: error
			});
			this.input.addClass('form-input-invalid');
		} else {
			this.input.removeClass('form-input-invalid');
		}
	}

	// Public API methods
	getValue(): string {
		return this.input.value;
	}

	setValue(value: string): void {
		this.input.value = value;
		this.validateInput(value);
	}

	focus(): void {
		this.input.focus();
	}

	blur(): void {
		this.input.blur();
	}

	setDisabled(disabled: boolean): void {
		if (disabled) {
			this.input.setAttribute('disabled', '');
		} else {
			this.input.removeAttribute('disabled');
		}
	}

	isValid(): boolean {
		return !this.config.validation || this.validateInput(this.input.value);
	}

	getElement(): HTMLInputElement {
		return this.input;
	}

	destroy(): void {
		this.input.remove();
		this.errorElement?.remove();
		this.labelElement?.remove();
		this.clearButton?.remove();
	}
}

export class ClearableInput extends FormInput {
	private clearButtonEl?: HTMLButtonElement;

	constructor(container: HTMLElement, config: ClearableInputConfig) {
		super(container, config);

		if (config.clearable !== false) {
			this.createClearButton(config);
		}
	}

	private createClearButton(config: ClearableInputConfig): void {
		const inputContainer = this.getElement().parentElement;
		if (!inputContainer) {
			console.error('Input container parent element not found for clear button');
			return;
		}

		this.clearButtonEl = inputContainer.createEl('button', {
			cls: 'form-input-clear-button',
			attr: {
				'aria-label': 'Clear input',
				'data-tooltip-position': 'top',
				tabindex: '0'
			}
		});

		this.clearButtonEl.addEventListener('click', () => {
			this.setValue('');
			this.focus();
			if (config.onClear) {
				config.onClear();
			}
		});

		// Show/hide clear button based on input content
		this.getElement().addEventListener('input', () => {
			this.updateClearButtonVisibility();
		});

		this.updateClearButtonVisibility();
	}

	private updateClearButtonVisibility(): void {
		if (!this.clearButtonEl) return;

		const hasValue = this.getValue().length > 0;
		this.clearButtonEl.toggleClass('visible', hasValue);
	}

	setValue(value: string): void {
		super.setValue(value);
		this.updateClearButtonVisibility();
	}

	destroy(): void {
		super.destroy();
		this.clearButtonEl?.remove();
	}
}

export class ColorInput extends ClearableInput {
	private colorPickerComponent?: ColorComponent;

	constructor(container: HTMLElement, config: ColorInputConfig) {
		super(container, config);

		if (config.colorPicker && this.isColorValue(config.value || config.defaultColor)) {
			this.createColorPicker(config);
		}
	}

	private isColorValue(value?: string): boolean {
		return value?.startsWith('#') || false;
	}

	private createColorPicker(config: ColorInputConfig): void {
		const inputContainer = this.getElement().parentElement;
		if (!inputContainer) {
			console.error('Input container parent element not found for color picker');
			return;
		}
		const colorPickerContainer = inputContainer.createDiv('form-input-color-picker');

		this.colorPickerComponent = new ColorComponent(colorPickerContainer)
			.setValue(config.defaultColor || '#000000')
			.onChange((color) => {
				this.setValue(color);
				if (config.onColorChange) {
					config.onColorChange(color);
				}
			});

		// Sync input changes to color picker
		this.getElement().addEventListener('input', () => {
			const value = this.getValue();
			if (this.isColorValue(value)) {
				this.colorPickerComponent?.setValue(value);
			}
		});

		colorPickerContainer.setAttr('aria-label', 'Color picker');
		colorPickerContainer.setAttr('data-tooltip-position', 'top');
	}

	setValue(value: string): void {
		super.setValue(value);
		if (this.colorPickerComponent && this.isColorValue(value)) {
			this.colorPickerComponent.setValue(value);
		}
	}

	destroy(): void {
		super.destroy();
		// ColorComponent cleanup is handled automatically by Obsidian
	}
}

/**
 * Specialized input for CSS variables that uses original CSS classes
 */
export class VariableClearableInput {
	private container: HTMLElement;
	private config: ClearableInputConfig;
	private input: HTMLInputElement;
	private clearButtonEl?: HTMLButtonElement;
	private clearContainer?: HTMLElement;

	constructor(container: HTMLElement, config: ClearableInputConfig) {
		this.container = container;
		this.config = config;
		this.input = this.createVariableInput();
		this.createVariableStyleClearButton();
		this.setupEventListeners();
	}

	private createVariableInput(): HTMLInputElement {
		// Create the original variable input structure
		const inputWrapper = this.container.createDiv('variable-input-wrapper');
		this.clearContainer = inputWrapper.createDiv('clear-variable-input');

		const input = this.clearContainer.createEl('input', {
			cls: 'variable-value-input',
			attr: {
				type: this.config.type || 'text',
				placeholder: this.config.placeholder || '',
				value: this.config.value || ''
			}
		});

		if (this.config.required) {
			input.setAttribute('required', '');
		}

		if (this.config.disabled) {
			input.setAttribute('disabled', '');
		}

		return input;
	}

	private createVariableStyleClearButton(): void {
		if (!this.clearContainer) return;

		this.clearButtonEl = this.clearContainer.createEl('button', {
			cls: 'clear-variable-input-button',
			attr: {
				'aria-label': 'Clear input',
				'data-tooltip-position': 'top',
				tabindex: '0'
			}
		});

		this.clearButtonEl.addEventListener('click', () => {
			this.setValue('');
			this.focus();
			if (this.config.onClear) {
				this.config.onClear();
			}
		});
	}

	private setupEventListeners(): void {
		if (this.config.onInput) {
			this.input.addEventListener('input', (e) => {
				const value = (e.target as HTMLInputElement).value;
				this.config.onInput!(value);
				this.updateTouchedState();
			});
		}

		if (this.config.onChange) {
			this.input.addEventListener('change', (e) => {
				const value = (e.target as HTMLInputElement).value;
				this.config.onChange!(value);
				this.updateTouchedState();
			});
		}

		if (this.config.onFocus) {
			this.input.addEventListener('focus', this.config.onFocus);
		}

		if (this.config.onBlur) {
			this.input.addEventListener('blur', this.config.onBlur);
		}

		// Update touched state on input
		this.input.addEventListener('input', () => {
			this.updateTouchedState();
		});

		this.updateTouchedState();
	}

	private updateTouchedState(): void {
		const hasValue = this.getValue().length > 0;

		if (hasValue) {
			this.input.classList.add('clear-variable-input--touched');
		} else {
			this.input.classList.remove('clear-variable-input--touched');
		}
	}

	// Public API
	getValue(): string {
		return this.input.value;
	}

	setValue(value: string): void {
		this.input.value = value;
		this.updateTouchedState();
	}

	focus(): void {
		this.input.focus();
	}

	blur(): void {
		this.input.blur();
	}

	getElement(): HTMLInputElement {
		return this.input;
	}

	getContainer(): HTMLElement | undefined {
		return this.clearContainer;
	}

	destroy(): void {
		this.input.remove();
		this.clearButtonEl?.remove();
	}
}

/**
 * Color input for variables that uses original CSS structure
 */
export class VariableColorInput extends VariableClearableInput {
	private colorPickerComponent?: ColorComponent;
	private colorPickerContainer?: HTMLElement;
	private config: ColorInputConfig;
	private isUpdatingFromPicker: boolean = false;

	constructor(container: HTMLElement, config: ColorInputConfig) {
		super(container, config);
		this.config = config;

		if (config.colorPicker) {
			const initialValue = config.value || config.defaultColor;
			if (this.isColorValue(initialValue)) {
				this.createVariableColorPicker();
			}

			// Watch for input changes to dynamically create/destroy picker
			this.getElement().addEventListener('input', () => {
				// Don't update picker if we're in the middle of updating from picker
				if (!this.isUpdatingFromPicker) {
					this.updateColorPicker();
				}
			});
		}
	}

	private isColorValue(value?: string): boolean {
		// Check if value is a valid hex color: # followed by exactly 3 or 6 hex digits
		return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value || '');
	}

	private expandShortHex(color: string): string {
		// Expand 3-digit hex to 6-digit hex (#f00 -> #ff0000)
		if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
			return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
		}
		return color;
	}

	private updateColorPicker(): void {
		const value = this.getValue();
		const isColor = this.isColorValue(value);

		if (isColor && !this.colorPickerComponent) {
			// Value became a color, create picker
			this.createVariableColorPicker();
			if (this.colorPickerComponent) {
				const expandedColor = this.expandShortHex(value);
				this.colorPickerComponent.setValue(expandedColor);
			}
		} else if (!isColor && this.colorPickerComponent) {
			// Value is no longer a color, destroy picker
			this.destroyColorPicker();
		} else if (isColor && this.colorPickerComponent) {
			// Value is still a color, sync it
			const expandedColor = this.expandShortHex(value);
			this.colorPickerComponent.setValue(expandedColor);
		}
	}

	private createVariableColorPicker(): void {
		// Find the variable input wrapper (parent of clear-variable-input)
		const variableInputWrapper = this.getContainer()?.parentElement;
		if (!variableInputWrapper) return;

		this.colorPickerContainer = variableInputWrapper.createDiv('variable-color-picker');

		const currentValue = this.getValue();
		const defaultValue = currentValue || this.config.defaultColor || '#000000';

		// Track if this is the initial setup to avoid triggering onChange during initialization
		let isInitializing = true;

		this.colorPickerComponent = new ColorComponent(this.colorPickerContainer)
			.setValue(defaultValue)
			.onChange((color) => {
				// Don't trigger onChange during initial setup
				if (isInitializing) {
					return;
				}

				// Set flag to prevent input event from triggering updateColorPicker
				this.isUpdatingFromPicker = true;

				// Update the input value directly without triggering events
				const input = this.getElement();
				input.value = color;
				this.updateTouchedState();

				// Call the onInput callback to notify VariableItem
				if (this.config.onInput) {
					this.config.onInput(color);
				}

				// Reset flag after a tick
				setTimeout(() => {
					this.isUpdatingFromPicker = false;
				}, 0);
			});

		// Mark initialization as complete after a tick
		setTimeout(() => {
			isInitializing = false;
		}, 0);

		this.colorPickerContainer.setAttr('aria-label', 'Color picker');
		this.colorPickerContainer.setAttr('data-tooltip-position', 'top');
	}

	private destroyColorPicker(): void {
		if (this.colorPickerContainer) {
			this.colorPickerContainer.remove();
			this.colorPickerContainer = undefined;
		}
		this.colorPickerComponent = undefined;
	}

	setValue(value: string): void {
		super.setValue(value);
		// Update picker state when value is set programmatically
		if (this.config.colorPicker && !this.isUpdatingFromPicker) {
			this.updateColorPicker();
		}
	}

	destroy(): void {
		this.destroyColorPicker();
		super.destroy();
	}
}