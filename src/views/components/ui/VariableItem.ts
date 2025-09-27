import { setIcon, App } from 'obsidian';
import { SimpleDebouncer } from '../../../utils/Debouncer';
import { ColorInput, ClearableInput, VariableColorInput, VariableClearableInput } from './FormInput';
import { createIconButton } from '../../../utils/uiHelpers';
import { copyStringToClipboard, showNotice } from '../../../utils';
import { CSSVariableManager } from '../../../managers/cssVariabManager';
import { CustomThemeStudioSettings } from '../../../settings';

export interface VariableData {
	name: string;
	value: string;
	defaultValue?: string;
	uuid?: string;
}

export interface VariableItemConfig {
	data: VariableData;
	category: string;
	settings: CustomThemeStudioSettings;
	cssVariableManager: CSSVariableManager;
	app: App;
	isCustom?: boolean;
	onUpdate?: (data: VariableData) => void;
	onDelete?: (uuid: string) => void;
}

export class VariableItem {
	private container: HTMLElement;
	private config: VariableItemConfig;
	private element: HTMLElement;
	private nameInput?: VariableClearableInput | {
		getValue(): string;
		setValue(value: string): void;
		focus(): void;
		blur(): void;
		getElement(): HTMLInputElement;
		getContainer(): HTMLElement | undefined;
		destroy(): void;
	};
	private valueInput?: VariableColorInput;
	private debounceUpdate: SimpleDebouncer;

	constructor(container: HTMLElement, config: VariableItemConfig) {
		this.container = container;
		this.config = config;
		this.element = this.createElement();
		this.setupDebounceUpdate();
		this.render();
	}

	private createElement(): HTMLElement {
		const className = this.config.isCustom ? 'custom-variable-item' : 'variable-item';
		return this.container.createDiv({
			cls: className,
			attr: {
				'data-var-name': this.config.data.name,
				'data-var-value': this.config.data.value
			}
		});
	}

	private setupDebounceUpdate(): void {
		this.debounceUpdate = new SimpleDebouncer(
			() => {
				if (this.config.settings.themeEnabled) {
					// Apply theme changes
					this.applyThemeChanges();
				}
				showNotice('Variable updated successfully', 1500, 'success');
			},
			500,
			true
		);
	}

	private applyThemeChanges(): void {
		// This would typically call the theme manager
		// For now, we'll use a placeholder
		console.log('Applying theme changes for variable:', this.config.data.name);
	}

	private render(): void {
		if (this.config.isCustom) {
			this.renderCustomVariable();
		} else {
			this.renderStandardVariable();
		}
	}

	private renderStandardVariable(): void {
		this.createVariableName();
		this.createVariableInput();
		this.createCopyDefaultButton();
	}

	private renderCustomVariable(): void {
		const inputWrapper = this.element.createDiv('custom-variable-input-wrapper');
		this.createCustomNameInput(inputWrapper);
		this.createCustomValueInput(inputWrapper);
		this.createDeleteButton(inputWrapper);
	}

	private createVariableName(): void {
		const nameEl = this.element.createDiv('variable-name');
		const nameSpan = nameEl.createSpan({
			text: this.config.data.name + ': ',
			attr: {
				'aria-label': `Copy "var(${this.config.data.name})" to clipboard`,
				'data-tooltip-position': 'top'
			}
		});

		nameSpan.addEventListener('click', () => {
			this.handleVariableNameCopy();
		});
	}

	private createVariableInput(): void {
		// Get current value from settings
		const currentValue = this.getCurrentValue();

		this.valueInput = new VariableColorInput(this.element, {
			type: 'text',
			placeholder: this.config.data.defaultValue || this.config.data.value,
			value: currentValue,
			colorPicker: this.config.settings.enableColorPicker && this.isColorValue(this.config.data.value),
			defaultColor: this.config.data.value,
			onInput: (value) => this.handleValueChange(value),
			onColorChange: (color) => this.handleValueChange(color),
			onClear: () => this.handleValueChange('')
		});
	}

	private createCustomNameInput(container: HTMLElement): void {
		// For custom variables, we need a simple input without the clear container structure
		const nameInput = container.createEl('input', {
			cls: 'variable-name-input',
			attr: {
				type: 'text',
				placeholder: 'Variable name',
				value: this.config.data.name
			}
		});

		nameInput.addEventListener('input', (e) => {
			const value = (e.target as HTMLInputElement).value;
			this.handleNameChange(value);
		});

		// Store a reference that matches the expected interface
		this.nameInput = {
			getValue: () => nameInput.value,
			setValue: (value: string) => { nameInput.value = value; },
			focus: () => nameInput.focus(),
			blur: () => nameInput.blur(),
			getElement: () => nameInput,
			getContainer: () => undefined,
			destroy: () => nameInput.remove()
		};
	}

	private createCustomValueInput(container: HTMLElement): void {
		const buttonWrapper = container.createDiv('custom-variable-input-button-wrapper');

		this.valueInput = new VariableColorInput(buttonWrapper, {
			type: 'text',
			placeholder: 'Variable value',
			value: this.config.data.value,
			colorPicker: this.config.settings.enableColorPicker,
			onInput: (value) => this.handleValueChange(value)
		});
	}

	private createCopyDefaultButton(): void {
		if (!this.config.data.defaultValue) return;

		const inputWrapper = this.element.querySelector('.variable-input-wrapper');
		if (!inputWrapper) {
			console.error('Variable input wrapper not found for default value button');
			return;
		}

		createIconButton(inputWrapper as HTMLElement, {
			icon: 'copy',
			label: `Copy default value "${this.config.data.defaultValue}" to clipboard`,
			classes: ['copy-default-value'],
			onClick: () => {
				copyStringToClipboard(this.config.data.defaultValue!, this.config.data.defaultValue!);
			}
		});
	}

	private createDeleteButton(container: HTMLElement): void {
		const deleteButton = createIconButton(container, {
			icon: 'trash',
			label: 'Delete this variable',
			classes: ['delete-variable-button', 'mod-destructive'],
			onClick: async () => {
				await this.handleDelete(deleteButton);
			}
		});
	}

	private getCurrentValue(): string {
		const existingVariable = this.config.settings.cssVariables.find(
			v => v.variable === this.config.data.name && v.parent === this.config.category
		);
		return existingVariable?.value || '';
	}

	private isColorValue(value: string): boolean {
		return value.startsWith('#');
	}

	private validateVariableName(name: string): string | null {
		if (!name) {
			return 'Variable name is required';
		}

		if (!name.match(/^--[a-zA-Z0-9-_\p{Emoji}]+/gui)) {
			return 'Please enter a valid variable name (must start with --)';
		}

		return null;
	}

	private handleNameChange(newName: string): void {
		// Validate the variable name
		const validationError = this.validateVariableName(newName);
		if (validationError) {
			showNotice(validationError, 5000, 'error');
			return;
		}

		const valueInput = this.valueInput?.getValue() || '';
		if (!newName || !valueInput) {
			showNotice('Both fields are required', 5000, 'error');
			return;
		}

		this.updateCustomVariable(newName, valueInput);
	}

	private handleValueChange(newValue: string): void {
		if (this.config.isCustom) {
			const nameInput = this.nameInput?.getValue() || '';
			if (!nameInput || !newValue) {
				showNotice('Both fields are required', 5000, 'error');
				return;
			}

			// Validate the name
			const validationError = this.validateVariableName(nameInput);
			if (validationError) {
				showNotice(validationError, 5000, 'error');
				this.nameInput?.focus();
				return;
			}

			this.updateCustomVariable(nameInput, newValue);
		} else {
			this.updateStandardVariable(newValue);
		}
	}

	private updateStandardVariable(value: string): void {
		const existingVariable = this.config.settings.cssVariables.find(
			v => v.variable === this.config.data.name && v.parent === this.config.category
		);

		const existingUUID = existingVariable?.uuid;

		this.config.cssVariableManager.updateVariable(
			value !== '' ? existingUUID : '',
			this.config.data.name,
			value,
			this.config.category
		);

		this.debounceUpdate.execute();

		if (this.config.onUpdate) {
			this.config.onUpdate({
				...this.config.data,
				value
			});
		}
	}

	private updateCustomVariable(name: string, value: string): void {
		this.config.cssVariableManager.updateVariable(
			this.config.data.uuid!,
			name,
			value,
			this.config.category
		);

		this.debounceUpdate.execute();

		if (this.config.onUpdate) {
			this.config.onUpdate({
				...this.config.data,
				name,
				value
			});
		}
	}

	private async handleDelete(button: HTMLElement): Promise<void> {
		if (!this.config.data.uuid) return;

		const { confirm } = await import('../../../modals/confirmModal');

		button.addClass('mod-loading');

		try {
			if (await confirm('Are you sure you want to delete this variable?', this.config.app)) {
				if (this.config.onDelete) {
					this.config.onDelete(this.config.data.uuid);
				}

				this.destroy();
				showNotice('Variable deleted', 5000, 'success');
			}
		} finally {
			button.removeClass('mod-loading');
		}
	}

	// Public API
	getData(): VariableData {
		return {
			...this.config.data,
			name: this.nameInput?.getValue() || this.config.data.name,
			value: this.valueInput?.getValue() || this.config.data.value
		};
	}

	updateData(data: Partial<VariableData>): void {
		this.config.data = { ...this.config.data, ...data };

		if (data.name && this.nameInput) {
			this.nameInput.setValue(data.name);
		}

		if (data.value && this.valueInput) {
			this.valueInput.setValue(data.value);
		}

		// Update DOM attributes
		this.element.setAttr('data-var-name', this.config.data.name);
		this.element.setAttr('data-var-value', this.config.data.value);
	}

	getElement(): HTMLElement {
		return this.element;
	}

	isVisible(): boolean {
		return !this.element.hasClass('hide');
	}

	setVisible(visible: boolean): void {
		this.element.toggleClass('show', visible);
		this.element.toggleClass('hide', !visible);
	}

	matchesSearch(searchTerm: string): boolean {
		const name = this.config.data.name.toLowerCase();
		const value = this.config.data.value.toLowerCase();
		const currentValue = this.valueInput?.getValue().toLowerCase() || '';
		const term = searchTerm.toLowerCase();

		return name.includes(term) || value.includes(term) || currentValue.includes(term);
	}

	// Event Handler Methods
	private handleVariableNameCopy(): void {
		const varReference = `var(${this.config.data.name})`;
		copyStringToClipboard(varReference, varReference);
	}

	destroy(): void {
		// Clean up debounced functions
		this.debounceUpdate.destroy();

		this.nameInput?.destroy();
		this.valueInput?.destroy();
		this.element.remove();
	}
}