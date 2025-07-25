import { App, setIcon, Workspace } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { CustomThemeStudioView } from '../views/customThemeStudioView';
import { CustomThemeStudioSettings, CustomElement } from '../settings';
import { AceService } from '../ace/AceService';
import { ICodeEditorConfig } from '../interfaces/types';
import * as ace from 'ace-builds';
import { confirm } from '../modals/confirmModal';
import { CSSVariableManager } from './cssVariabManager';
import { generateUniqueId, showNotice } from "../utils";

export class CSSEditorManager {
	plugin: CustomThemeStudioPlugin;
	view: CustomThemeStudioView;
	currentSelector: string = '';
	editorEl: HTMLTextAreaElement | null = null;
	selectorInputEl: HTMLInputElement | null = null;
	nameInputEl: HTMLInputElement | null = null;
	editorUUID: HTMLInputElement;
	enabledToggleEl: HTMLInputElement | null = null;
	editorSection: HTMLElement | null = null;
	currentEditingElement: HTMLElement | null = null;
	isEditingExisting: boolean = false;
	app: App;
	settings: CustomThemeStudioSettings;
	workspace: Workspace;
	private aceService: AceService;
	editor: ace.Ace.Editor;
	cssVariableManager: CSSVariableManager;


	constructor(workspace: Workspace, plugin: CustomThemeStudioPlugin, view: CustomThemeStudioView, private config: ICodeEditorConfig) {
		this.plugin = plugin;
		this.view = view;
		this.app = this.app;
		this.workspace = workspace;
		this.settings = this.settings;
		this.aceService = new AceService(this.plugin);
		this.cssVariableManager = new CSSVariableManager(this.plugin);
	}

	showEditorSection(show: boolean): void {
		if (this.editorSection) {
			if (show) {
				this.editorSection.addClass('css-editor-section-show');
				this.editorSection.removeClass('css-editor-section-hide');
			} else {
				this.editorSection.addClass('css-editor-section-hide');
				this.editorSection.removeClass('css-editor-section-show');
			}
		}
	}

	createEditorSection(containerEl: HTMLElement): void {
		this.editorSection = containerEl.createDiv('css-editor-section');

		// UUID
		this.editorUUID = this.editorSection.createEl('input', {
			cls: 'css-editor-uuid',
			attr: {
				type: 'hidden'
			}
		});

		// Element name input
		const nameContainer = this.editorSection.createDiv('editor-name-container');
		nameContainer.createSpan({ text: 'Element name:' });
		this.nameInputEl = nameContainer.createEl('input', {
			attr: {
				type: 'text',
				placeholder: 'Enter a descriptive name (optional)'
			}
		});

		// Selector input
		const selectorContainer = this.editorSection.createDiv('editor-selector-container');
		selectorContainer.createSpan({ text: 'CSS selector:' });
		this.selectorInputEl = selectorContainer.createEl('input', {
			attr: {
				type: 'text',
				placeholder: 'Enter CSS selector or use element picker'
			}
		});

		// CSS editor
		this.editorEl = this.editorSection.createEl('textarea', {
			attr: {
				placeholder: 'Enter CSS rules here...',
				class: 'css-editor'
			}
		});

		this.editor = this.aceService.createEditor(this.editorEl);

		this.aceService.configureEditor(this.config, 'css');

		// Snippet manager
		// https://stackoverflow.com/questions/26089258/ace-editor-manually-adding-snippets/66923593#66923593
		// https://ace.c9.io/build/kitchen-sink.html
		if (this.plugin.settings.enableAceSnippets) {
			this.editor.setOption('enableSnippets', true);
			const snippetManager = ace.require('ace/snippets').snippetManager;
			const snippetContent = this.cssVariableManager.snippetManagerVars();
			const snippets = snippetManager.parseSnippetFile(snippetContent);
			snippetManager.register(snippets, 'css');
		}
		// Editor options
		const editorOptions = this.editorSection.createDiv('editor-options-container', (el) => {
			el.addClass('editor-options-container-hide');
		});

		// Wordwrap
		const wordwrapOptionContainer = editorOptions.createDiv('wordwrap-toggle-container');
		wordwrapOptionContainer.createEl('label', {
			text: 'Wordwrap:',
			attr: {
				'for': 'toggle-wordwrap-checkbox'
			}
		})
		const wordWrapCheckboxContainer = wordwrapOptionContainer.createDiv('checkbox-container');
		const wordWrapCheckbox = wordWrapCheckboxContainer.createEl('input', {
			attr: {
				class: 'toggle-wordwrap-checkbox',
				id: 'toggle-wordwrap-checkbox',
				type: 'checkbox',
			}
		});
		if (this.plugin.settings.editorWordWrap) {
			wordWrapCheckbox.checked = true;
			wordWrapCheckboxContainer.addClass('is-enabled');
		}
		wordWrapCheckboxContainer.addEventListener('click', () => {
			if (wordWrapCheckboxContainer.classList.contains('is-enabled')) {
				wordWrapCheckboxContainer.removeClass('is-enabled');
				wordWrapCheckbox.checked = false;
				this.editor?.getSession().setUseWrapMode(false)
			} else {
				wordWrapCheckboxContainer.addClass('is-enabled');
				wordWrapCheckbox.checked = true;
				this.editor?.getSession().setUseWrapMode(true)
			}
		})

		// Font-size
		const fontsizeOptionContainer = editorOptions.createDiv('font-size-container');
		fontsizeOptionContainer.createEl('label', {
			text: 'Font size:',
			attr: {
				'for': 'fontsize-slider'
			}
		})
		const fontsizeSliderContainer = fontsizeOptionContainer.createDiv('slider-container');
		const fontsizeSlider = fontsizeSliderContainer.createEl('input', {
			attr: {
				class: 'slider',
				id: 'fontsize-slider',
				type: 'range',
				min: 5,
				max: 30,
				step: 1,
				value: this.plugin.settings.editorFontSize
			}
		});

		const fontsizeDisplayValue = fontsizeOptionContainer.createDiv('slider-value', (el) => {
			el.innerText = ' ' + this.plugin.settings.editorFontSize.toString();
		});

		fontsizeSlider.addEventListener('change', (e) => {
			let sliderValue: number = Number((e.target! as HTMLInputElement).value);
			this.editor?.setFontSize(sliderValue);
			fontsizeDisplayValue.innerText = sliderValue.toString();
		})

		// Button container
		const buttonContainer = this.editorSection.createDiv('button-container');

		if (!this.plugin.settings.autoApplyChanges) {
			const applyButton = buttonContainer.createEl('button', {
				text: 'Apply Changes'
			});
			// Apply button
			applyButton.addEventListener('click', () => {
				this.applyChanges(this.aceService.getValue());
			});
		}

		const saveButton = buttonContainer.createEl('button', {
			text: 'Save Element',
			cls: 'mod-cta'
		});

		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel'
		});

		const settingsButton = buttonContainer.createEl('button', {
			cls: 'clickable-icon',
			attr: {
				'aria-label': 'Show editor options',
				'data-tooltip-position': 'top'
			}
		});
		setIcon(settingsButton, 'settings-2');

		settingsButton.addEventListener('click', () => {
			if (editorOptions.hasClass('editor-options-container-hide')) {
				editorOptions.addClass('editor-options-container-show');
				editorOptions.removeClass('editor-options-container-hide');
				settingsButton.setAttr('aria-label', 'Hide editor options');
			} else {
				editorOptions.addClass('editor-options-container-hide');
				editorOptions.removeClass('editor-options-container-show');
				settingsButton.setAttr('aria-label', 'Show editor options');
			}

		})

		// Event listeners
		this.selectorInputEl.addEventListener('input', () => {
			this.currentSelector = this.selectorInputEl!.value;
		});

		this.selectorInputEl.addEventListener('change', () => {
			this.currentSelector = this.selectorInputEl!.value;
			if (this.plugin.settings.autoApplyChanges) {
				const css = this.aceService.getValue();
				if (css !== '') {
					this.applyChanges(css);
				}
			}
		});

		// Save button
		saveButton.addEventListener('click', async () => {
			if (this.saveElement()) {
				// Hide the editor section after saving
				if (!this.isEditingExisting) {
					this.showEditorSection(false);
				} else {
					// If editing an existing element, remove the inline editor
					this.removeInlineEditor();
				}
			}

			if (this.view.elementSearch) {
				await this.view.filterCustomElements(this.view.elementSearch);
			}
		});

		// Cancel button
		cancelButton.addEventListener('click', () => {
			if (this.isEditingExisting) {
				// If editing an existing element, remove the inline editor;
				this.removeInlineEditor();
			} else {
				// Otherwise only hide the editor section
				this.showEditorSection(false);
			}
			// Reset the editor
			this.resetEditor();
			this.clearAppliedChanges();
		});

		this.workspace.on('css-change', async () => {
			this.aceService.updateTheme();
		})
	}

	// Auto-apply changes when typing (with debounce)
	changeListener = (delta: ace.Ace.Delta) => {
		let timeout;
		timeout ??= setTimeout(() => {

			let css = this.aceService.getValue();
			// if (css && this.plugin.settings.autoApplyChanges) {
			if (this.plugin.settings.autoApplyChanges) {
				this.applyChanges(css!);
			}
		}, 10);
	}

	setSelector(uuid: string, selector: string, isEditingExisting: boolean): void {
		if (!this.selectorInputEl || !this.editorUUID) return;

		this.currentSelector = selector;
		this.selectorInputEl.value = selector;
		this.editorUUID.value = uuid;

		// Try to find existing element with this UUID
		const existingElement = this.plugin.settings.customElements.find(el => el.uuid === uuid);

		if (existingElement) {
			this.editorUUID!.value = existingElement.uuid;
			this.editorEl!.value = existingElement.css;
			this.aceService.setValue(existingElement.css, 1);

			// Populate name if available			
			if (existingElement.name) {
				this.nameInputEl!.value = existingElement.name;
			}
			else {
				this.nameInputEl!.value = '';
			}

		} else {
			// Generate default CSS template
			this.generateDefaultCSS(selector);
			showNotice(`Element selected: ${selector}`, 5000, 'success');
		}
		this.editor!.session.on('change', this.changeListener);
	}

	generateDefaultCSS(selector: string): void {
		if (!this.editorEl) return;

		// Try to find the element
		const element = this.findElementBySelector(selector);
		let css: string = '';

		const computedStyle = getComputedStyle(element!);

		if (element && this.plugin.settings.generateComputedCSS) {
			css += `${selector} {\n`;
			css += `  /* Basic styling */\n`;
			css += `  color: ${computedStyle.color};\n`;
			css += `  background-color: ${computedStyle.backgroundColor};\n`;

			// Add border if it exists
			if (computedStyle.borderWidth !== '0px') {
				css += `  border: ${computedStyle.borderWidth} ${computedStyle.borderStyle} ${computedStyle.borderColor};\n`;
			}

			css += `  \n  /* Spacing */\n`;
			css += `  padding: ${computedStyle.padding};\n`;
			css += `  margin: ${computedStyle.margin};\n`;

			css += `  \n  /* Typography */\n`;
			css += `  font-family: ${computedStyle.fontFamily};\n`;
			css += `  font-size: ${computedStyle.fontSize};\n`;
			css += `  font-weight: ${computedStyle.fontWeight};\n`;

			css += `}\n`;
			css += `\n`;

			// Add hover state template
			css += `${selector}:hover {\n`;
			css += `  /* Hover state styling */\n`;
			css += `  /* background-color: var(--interactive-hover); */\n`;
			css += `}\n`;
		} else {
			css += `${selector} {\n`;
			css += `\t\n`;
			css += `}`;
		}

		this.aceService.setValue(css, 1);

		// Clear name input
		if (this.nameInputEl) {
			this.nameInputEl.value = '';
		}
	}

	findElementBySelector(selector: string): HTMLElement | null {
		try {
			return document.querySelector(selector) as HTMLElement;
		} catch (error) {
			console.error('Invalid selector:', selector);
			return null;
		}
	}

	applyChanges(css: string): void {
		if (!this.editorEl || !this.selectorInputEl) return;

		const name = this.nameInputEl!.value.trim();
		const selector = this.selectorInputEl.value.trim();
		const uuid = this.editorUUID.value;

		// if (!uuid || !css) {
		// 	showNotice('Please enter CSS rules to auto apply your CSS changes', 5000, 'error');
		// 	return;
		// }

		if (!uuid) {
			return;
		}
		// Update the custom CSS
		this.updateCustomCSS(uuid, name, selector, css);

		// Apply the changes
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}
	}

	clearAppliedChanges(): void {
		// Update the custom CSS
		this.updateCustomCSS(generateUniqueId(), '', '', '');

		// Apply the changes
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}
	}

	saveElement(): boolean {
		if (!this.editorEl || !this.selectorInputEl || !this.nameInputEl) return false;

		const uuid = this.editorUUID.value;
		const name = this.nameInputEl.value.trim();
		const selector = this.selectorInputEl.value.trim();
		const css = this.aceService.getValue();

		if (!selector || !css) {
			showNotice('Please enter both a selector and CSS rules', 5000, 'error');
			return false;
		}

		// Check if element already exists
		const existingIndex = this.plugin.settings.customElements.findIndex(el => el.uuid === uuid);

		if (existingIndex >= 0) {
			// Update existing element
			this.plugin.settings.customElements[existingIndex] = {
				uuid,
				selector,
				css,
				name: name || undefined,
				enabled: this.plugin.settings.customElements[existingIndex].enabled
			};
		} else {
			// Add new element
			this.plugin.settings.customElements.push({
				uuid,
				selector,
				css,
				name: name || undefined,
				enabled: true
			});
		}

		// Save settings
		this.plugin.saveSettings();

		// Update the custom CSS
		this.updateCustomCSS(uuid, name, selector, css);

		// Apply the changes
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}

		this.editorEl.value = '';

		// Get the element list
		const elementList = this.view.containerEl.querySelector('.element-list');
		if (elementList) {
			// If we're editing an existing element, we need to update the list
			if (this.isEditingExisting) {
				// Clear the element list
				elementList.empty();

				// Re-populate with all elements
				this.plugin.settings.customElements.forEach(element => {
					this.createElementItem(elementList as HTMLElement, element);
				});
			} else {
				// Check if element already exists in the list
				const existingElements = elementList.querySelectorAll('.element-item');
				let elementExists = false;

				existingElements.forEach(el => {
					// if (el.getAttribute('data-selector') === selector) {
					if (el.getAttribute('data-cts-uuid') === uuid) {
						elementExists = true;
					}
				});

				if (!elementExists) {
					// Create new element item
					this.createElementItem(elementList as HTMLElement, {
						uuid,
						selector,
						css,
						name: name || undefined,
						enabled: true
					});
				}

				elementList.empty();

				// Re-populate with all elements
				this.plugin.settings.customElements.forEach(element => {
					this.createElementItem(elementList as HTMLElement, element);
				});
			}
		}

		showNotice('Element saved successfully', 5000, 'success');
		return true;
	}

	resetEditor(): void {
		if (!this.editorEl || !this.selectorInputEl || !this.nameInputEl) return;

		// Clear inputs
		this.editorUUID.value = generateUniqueId();
		this.selectorInputEl.value = '';
		this.aceService.setValue('');
		this.nameInputEl.value = '';

		// Reset current selector
		this.currentSelector = '';

		// Reset editing state
		this.isEditingExisting = false;
		this.currentEditingElement = null;

		this.editor!.session.on('change', this.changeListener);
	}

	removeInlineEditor(): void {

		this.editor!.session.off('change', this.changeListener);

		// Remove any existing inline editors
		const inlineEditors = document.querySelectorAll('.inline-element-editor');
		inlineEditors.forEach(editor => editor.remove());

		// Reset editing state
		this.isEditingExisting = false;
		this.currentEditingElement = null;

		// Hide the main editor section
		this.showEditorSection(false);

		// Move the editor section back to its original container
		if (this.editorSection) {
			const content = this.view.containerEl.querySelector('.element-section .collapsible-content');
			if (content) {
				// Find the selector button container to insert after
				const selectorButtonContainer = content.querySelector('.selector-button-container');
				if (selectorButtonContainer && selectorButtonContainer.nextSibling) {
					content.insertBefore(this.editorSection, selectorButtonContainer.nextSibling);
				} else {
					content.appendChild(this.editorSection);
				}
			}
		}
	}

	async updateCustomCSS(uuid: string, name: string, selector: string, css: string): Promise<void> {
		// Get all custom elements CSS
		let fullCSS = '';
		const existingIndex = this.plugin.settings.customElements.findIndex(el => el.uuid === uuid);
		if (existingIndex >= 0) {
			if (this.plugin.settings.customElements[existingIndex].enabled) {
				// First add the current element
				if (css !== '') {
					fullCSS += `/* ${name || selector} */\n${css}\n\n`;
				}
			}
		} else {
			// New custom element
			if (css !== '') {
				fullCSS += `/* ${name || selector} */\n${css}\n\n`;
			}
		}

		// Then add all other elements
		this.plugin.settings.customElements.forEach(element => {
			// Skip the current element as we already added it
			if (element.uuid === uuid) return;
			if (element.enabled) {
				fullCSS += `/* ${element.name || element.selector} */\n${element.css}\n\n`;
			}
		});

		// Update the settings
		this.plugin.settings.customCSS = fullCSS;
		await this.plugin.saveSettings();
	}

	createElementItem(containerEl: HTMLElement, element: CustomElement): HTMLElement {
		const item = containerEl.createDiv({
			cls: 'element-item',
			attr: {
				'data-cts-uuid': element.uuid,
				'data-tooltip-position': 'top'
			}
		});

		let currentEnabled = element.enabled;

		const elementHeader = item.createDiv('element-item-header');

		const titleEl = elementHeader.createDiv('element-item-title');
		titleEl.createDiv({
			text: element.name || element.selector,
			attr: { 'aria-label': element.selector, 'data-tooltip-position': 'top' }
		});

		const actionsEl = elementHeader.createDiv('element-item-actions');

		const editButton = actionsEl.createEl('button', {
			cls: 'clickable-icon'
		});
		editButton.setAttr('aria-label', 'Edit this element');
		editButton.setAttr('data-tooltip-position', 'top');
		editButton.setAttr('tabindex', '0');
		setIcon(editButton, 'edit');

		const enabledButton = actionsEl.createEl('button', {
			cls: 'clickable-icon'
		});
		enabledButton.setAttr('data-tooltip-position', 'top');
		enabledButton.setAttr('tabindex', '0');
		if (currentEnabled) {
			setIcon(enabledButton, 'eye');
			enabledButton.setAttr('aria-label', 'Disable this element');
			enabledButton.setAttr('data-tooltip-position', 'top');
		} else {
			setIcon(enabledButton, 'eye-off');
			enabledButton.setAttr('aria-label', 'Enable this element');
			enabledButton.setAttr('data-tooltip-position', 'top');
		}

		const deleteButton = actionsEl.createEl('button', {
			cls: 'clickable-icon element-item-delete-button'
		});
		deleteButton.setAttr('aria-label', 'Delete this element');
		deleteButton.setAttr('data-tooltip-position', 'top');
		deleteButton.setAttr('tabindex', '0');
		setIcon(deleteButton, 'trash');

		// Edit button
		editButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection = containerEl.querySelector('.css-editor-section');
			const isEditorVisible = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved element form open. Editing another element will discard your changes. Continue?', this.plugin.app)) {
					return;
				}
			}

			// Remove any existing inline editors
			this.removeInlineEditor();

			this.resetEditor();

			this.clearAppliedChanges();

			// Set editing state
			this.isEditingExisting = true;
			this.currentEditingElement = item;

			// Create inline editor container
			const inlineEditor = item.createDiv({
				cls: 'inline-element-editor'
			});

			// Clone the editor section into the inline editor
			if (this.editorSection) {
				// Show the editor with the current element's values
				this.setSelector(element.uuid, element.selector, true);

				// Move the editor section under this element
				inlineEditor.appendChild(this.editorSection);
				this.showEditorSection(true);
				setTimeout(async () => {
					this.nameInputEl!.focus();
				}, 25);
			}
		});

		// Enabled button
		enabledButton.addEventListener('click', async () => {
			// Enable/disable other selector
			const currentlyEditedIndex = await new Promise<number | boolean>((resolve) => {
				const elementList = this.view.containerEl.querySelector('.element-list');
				const existingElements = elementList!.querySelectorAll('.element-item');
				existingElements!.forEach((el, index) => {
					const openEditor = el.querySelector('.inline-element-editor');
					if (openEditor!) {
						return resolve(index);
					}
				});
				return resolve(false);
			});

			// const existingIndex = this.plugin.settings.customElements.findIndex(el => el.selector === element.selector);
			const existingIndex = this.plugin.settings.customElements.findIndex(el => el.uuid === element.uuid);

			if (existingIndex >= 0) {

				this.plugin.settings.customElements[existingIndex].enabled = this.plugin.settings.customElements[existingIndex].enabled ? false : true;
			}

			if (currentEnabled) {
				setIcon(enabledButton, 'eye-off');
				currentEnabled = false;
			} else {
				setIcon(enabledButton, 'eye');
				currentEnabled = true;
			}

			// Update custom CSS
			let fullCSS = '';
			this.plugin.settings.customElements.forEach((el, index) => {
				if (el.enabled) {
					// Need currently edited index here
					if (index === currentlyEditedIndex) {
						let css = this.aceService.getValue();
						fullCSS += `/* ${el.name || el.selector} */\n${css}\n\n`;
					} else {
						fullCSS += `/* ${el.name || el.selector} */\n${el.css}\n\n`;
					}

				}
			});

			this.plugin.settings.customCSS = fullCSS;
			this.plugin.saveSettings();

			// Apply changes
			if (this.plugin.settings.themeEnabled) {
				this.plugin.themeManager.applyCustomTheme();
			}
		});

		// Delete button
		deleteButton.addEventListener('click', async () => {
			// Confirm deletion
			if (await confirm(`Are you sure you want to delete the element "${element.name || element.selector}"?`, this.plugin.app)) {
				// Remove from settings
				this.plugin.settings.customElements = this.plugin.settings.customElements.filter(
					el => el.uuid !== element.uuid
				);

				// Update custom CSS
				let fullCSS = '';
				this.plugin.settings.customElements.forEach(el => {
					if (el.enabled) {
						fullCSS += `/* ${el.name || el.selector} */\n${el.css}\n\n`;
					}
				});

				this.plugin.settings.customCSS = fullCSS;
				this.plugin.saveSettings();

				// Apply changes
				if (this.plugin.settings.themeEnabled) {
					this.plugin.themeManager.applyCustomTheme();
				}

				// remove editor
				// NOT necessary ?
				// this.removeInlineEditor();

				// Remove from DOM
				item.remove();

				showNotice('Element deleted', 5000, 'success');
			}
		});
		return item;
	}

}
