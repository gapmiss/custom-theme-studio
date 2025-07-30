import { App, setIcon, Workspace } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { CustomThemeStudioView } from '../views/customThemeStudioView';
import { CustomThemeStudioSettings, CSSrule } from '../settings';
import { AceService } from '../ace/AceService';
import { ICodeEditorConfig } from '../interfaces/types';
import * as ace from 'ace-builds';
import { confirm } from '../modals/confirmModal';
import { CSSVariableManager } from './cssVariabManager';
import { generateUniqueId, showNotice } from "../utils";

export class CSSEditorManager {
	plugin: CustomThemeStudioPlugin;
	view: CustomThemeStudioView;
	currentRule: string = '';
	editorEl: HTMLTextAreaElement | null = null;
	ruleInputEl: HTMLInputElement | null = null;
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
		this.editorSection?.toggleClass('show', show);
		this.editorSection?.toggleClass('hide', !show);
	}

	createEditorSection(containerEl: HTMLElement): void {
		this.editorSection = containerEl.createDiv('css-editor-section');

		// UUID
		this.editorUUID = this.editorSection.createEl(
			'input',
			{
				cls: 'css-editor-uuid',
				attr: {
					type: 'hidden'
				}
			}
		);

		// CSS Rule input
		const ruleContainer = this.editorSection.createDiv('editor-rule-container');
		ruleContainer.createSpan(
			{
				text: 'CSS rule:'
			}
		);
		this.ruleInputEl = ruleContainer.createEl(
			'input',
			{
				attr: {
					type: 'text',
					placeholder: 'Enter a descriptive name '
				}
			}
		);

		// CSS editor
		this.editorEl = this.editorSection.createEl(
			'textarea',
			{
				cls: 'css-editor',
				attr: {
					placeholder: 'Enter CSS rules here...'
				}
			}
		);

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
		const editorOptions = this.editorSection.createDiv(
			'editor-options-container',
			(el) => {
				el.addClass('hide');
			}
		);

		// Wordwrap
		const wordwrapOptionContainer = editorOptions.createDiv('wordwrap-toggle-container');
		wordwrapOptionContainer.createEl(
			'label',
			{
				text: 'Wordwrap:',
				attr: {
					'for': 'toggle-wordwrap-checkbox'
				}
			}
		);
		const wordWrapCheckboxContainer = wordwrapOptionContainer.createDiv('checkbox-container');
		const wordWrapCheckbox = wordWrapCheckboxContainer.createEl(
			'input',
			{
				cls: 'toggle-wordwrap-checkbox',
				attr: {
					id: 'toggle-wordwrap-checkbox',
					type: 'checkbox',
				}
			}
		);
		if (this.plugin.settings.editorWordWrap) {
			wordWrapCheckbox.checked = true;
			wordWrapCheckboxContainer.addClass('is-enabled');
		}
		wordWrapCheckboxContainer.addEventListener('click', () => {
			const isEnabled = wordWrapCheckboxContainer.classList.toggle('is-enabled');
			wordWrapCheckbox.checked = isEnabled;
			this.editor?.getSession().setUseWrapMode(isEnabled);
		});

		// Font-size
		const fontsizeOptionContainer = editorOptions.createDiv('font-size-container');
		fontsizeOptionContainer.createEl(
			'label',
			{
				text: 'Font size:',
				attr: {
					'for': 'fontsize-slider'
				}
			}
		);
		const fontsizeSliderContainer = fontsizeOptionContainer.createDiv('slider-container');
		const fontsizeSlider = fontsizeSliderContainer.createEl(
			'input',
			{
				cls: 'slider',
				attr: {
					id: 'fontsize-slider',
					type: 'range',
					min: 5,
					max: 30,
					step: 1,
					value: this.plugin.settings.editorFontSize
				}
			}
		);

		const fontsizeDisplayValue = fontsizeOptionContainer.createDiv(
			'slider-value',
			(el) => {
				el.innerText = ' ' + this.plugin.settings.editorFontSize.toString();
			}
		);

		fontsizeSlider.addEventListener('change', (e) => {
			let sliderValue: number = Number((e.target! as HTMLInputElement).value);
			this.editor?.setFontSize(sliderValue);
			fontsizeDisplayValue.innerText = sliderValue.toString();
		});

		// Button container
		const buttonContainer = this.editorSection.createDiv('button-container');

		if (!this.plugin.settings.autoApplyChanges) {
			const applyButton = buttonContainer.createEl(
				'button',
				{
					text: 'Apply Changes'
				}
			);
			// Apply button
			applyButton.addEventListener('click', () => {
				this.applyChanges(this.aceService.getValue());
			});
		}

		const saveButton = buttonContainer.createEl(
			'button',
			{
				text: 'Save rule',
				cls: 'mod-cta'
			}
		);

		const cancelButton = buttonContainer.createEl(
			'button',
			{
				text: 'Cancel'
			}
		);

		const settingsButton = buttonContainer.createEl(
			'button',
			{
				cls: 'clickable-icon',
				attr: {
					'aria-label': 'Show editor options',
					'data-tooltip-position': 'top'
				}
			}
		);
		setIcon(settingsButton, 'settings-2');

		settingsButton.addEventListener('click', () => {
			const shouldExpand: boolean = editorOptions.hasClass('hide');
			editorOptions.toggleClass('show', shouldExpand);
			editorOptions.toggleClass('hide', !shouldExpand);
			settingsButton.setAttr(
				'aria-label',
				shouldExpand ? 'Hide editor options' : 'Show editor options'
			);
		});

		// Event listeners
		this.ruleInputEl.addEventListener('input', () => {
			this.currentRule = this.ruleInputEl!.value;
		});

		this.ruleInputEl.addEventListener('change', () => {
			this.currentRule = this.ruleInputEl!.value;
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
					// If editing an existing rule, remove the inline editor
					this.removeInlineEditor();
				}
			}

			if (this.view.ruleSearch) {
				await this.view.filterCSSRules(this.view.ruleSearch);
			}
		});

		// Cancel button
		cancelButton.addEventListener('click', () => {
			if (this.isEditingExisting) {
				// If editing an existing rule, remove the inline editor;
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
		});
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

	setRule(uuid: string, rule: string, isEditingExisting: boolean): void {
		if (!this.ruleInputEl || !this.editorUUID) return;

		this.currentRule = rule;
		this.ruleInputEl.value = rule;
		this.editorUUID.value = uuid;

		// Try to find existing rule with this UUID
		const existingRule = this.plugin.settings.cssRules.find(el => el.uuid === uuid);

		if (existingRule) {
			this.editorUUID!.value = existingRule.uuid;
			this.editorEl!.value = existingRule.css;
			this.aceService.setValue(existingRule.css, 1);
		} else {
			// Generate default CSS template
			this.generateDefaultCSS(rule);
			showNotice(`Element selected: ${rule}`, 5000, 'success');
		}
		this.editor!.session.on('change', this.changeListener);
	}

	generateDefaultCSS(selector: string): void {
		if (!this.editorEl) return;

		// Try to find the rule
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
		// if (this.nameInputEl) {
		// 	this.nameInputEl.value = '';
		// }
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
		if (!this.editorEl || !this.ruleInputEl) return;

		const rule = this.ruleInputEl.value.trim();
		const uuid = this.editorUUID.value;

		if (!uuid) {
			return;
		}
		// Update the custom CSS
		this.updateCustomCSS(uuid, rule, css);

		// Apply the changes
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}
	}

	clearAppliedChanges(): void {
		// Update the custom CSS
		// this.updateCustomCSS(generateUniqueId(), '', '', '');
		this.updateCustomCSS(generateUniqueId(), '', '');

		// Apply the changes
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}
	}

	saveElement(): boolean {
		if (!this.editorEl || !this.ruleInputEl) return false;

		const uuid = this.editorUUID.value;
		const rule = this.ruleInputEl.value.trim();
		const css = this.aceService.getValue();

		if (!rule || !css) {
			showNotice('Please enter both a rule (name) and CSS', 5000, 'error');
			return false;
		}

		// Check if rule already exists
		const existingIndex = this.plugin.settings.cssRules.findIndex(el => el.uuid === uuid);

		if (existingIndex >= 0) {
			// Update existing rule
			this.plugin.settings.cssRules[existingIndex] = {
				uuid,
				rule,
				css,
				// name: name || undefined,
				enabled: this.plugin.settings.cssRules[existingIndex].enabled
			};
		} else {
			// Add new rule
			this.plugin.settings.cssRules.push({
				uuid,
				rule,
				css,
				// name: name || undefined,
				enabled: true
			});
		}

		// Save settings
		this.plugin.saveSettings();

		// Update the custom CSS
		this.updateCustomCSS(uuid, rule, css);

		// Apply the changes
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}

		this.editorEl.value = '';

		// Get the rule list
		const ruleList = this.view.containerEl.querySelector('.css-rule');
		if (ruleList) {
			// If we're editing an existing rule, we need to update the list
			if (this.isEditingExisting) {
				// Clear the rule list
				ruleList.empty();
				// Sort by "rule" value ASC
				this.plugin.settings.cssRules.sort((a, b) => a.rule!.localeCompare(b.rule!));
				// Re-populate with all rules
				this.plugin.settings.cssRules.forEach(rule => {
					this.createRuleItem(ruleList as HTMLElement, rule);
				});
			} else {
				// Check if rule already exists in the list
				const existingRules = ruleList.querySelectorAll('.rule-item');
				let ruleExists = false;

				existingRules.forEach(el => {
					if (el.getAttribute('data-cts-uuid') === uuid) {
						ruleExists = true;
					}
				});

				if (!ruleExists) {
					// Create new rule item
					this.createRuleItem(ruleList as HTMLElement, {
						uuid,
						rule,
						css,
						// name: name || undefined,
						enabled: true
					});
				}

				ruleList.empty();
				// Sort by "rule" value ASC
				this.plugin.settings.cssRules.sort((a, b) => a.rule!.localeCompare(b.rule!));
				// Re-populate with all rules
				this.plugin.settings.cssRules.forEach(rule => {
					this.createRuleItem(ruleList as HTMLElement, rule);
				});
			}
		}

		showNotice('Rule saved successfully', 5000, 'success');
		return true;
	}

	resetEditor(): void {
		if (!this.editorEl || !this.ruleInputEl) return;

		// Clear inputs
		this.editorUUID.value = generateUniqueId();
		this.ruleInputEl.value = '';
		this.aceService.setValue('');

		// Reset current rule
		this.currentRule = '';

		// Reset editing state
		this.isEditingExisting = false;
		this.currentEditingElement = null;

		this.editor!.session.on('change', this.changeListener);
	}

	removeInlineEditor(): void {

		this.editor!.session.off('change', this.changeListener);

		// Remove any existing inline editors
		const inlineEditors = document.querySelectorAll('.inline-rule-editor');
		inlineEditors.forEach(editor => editor.remove());

		// Reset editing state
		this.isEditingExisting = false;
		this.currentEditingElement = null;

		// Hide the main editor section
		this.showEditorSection(false);

		// Move the editor section back to its original container
		if (this.editorSection) {
			const content = this.view.containerEl.querySelector('.rules-section .collapsible-content');
			if (content) {
				// Find the rules button container to insert after
				const rulesButtonContainer = content.querySelector('.css-rules-button-container');
				if (rulesButtonContainer && rulesButtonContainer.nextSibling) {
					content.insertBefore(this.editorSection, rulesButtonContainer.nextSibling);
				} else {
					content.appendChild(this.editorSection);
				}
			}
		}
	}

	async updateCustomCSS(uuid: string, rule: string, css: string): Promise<void> {
		// Get all CSS rules
		let fullCSS = '';
		const existingIndex = this.plugin.settings.cssRules.findIndex(el => el.uuid === uuid);
		if (existingIndex >= 0) {
			if (this.plugin.settings.cssRules[existingIndex].enabled) {
				// First add the current rule
				if (css !== '') {
					fullCSS += `/* ${rule} */\n${css}\n\n`;
				}
			}
		} else {
			// New CSS rule
			if (css !== '') {
				fullCSS += `/* ${rule} */\n${css}\n\n`;
			}
		}

		// Then add all other rules
		this.plugin.settings.cssRules.forEach(rule => {
			// Skip the current rule as we already added it
			if (rule.uuid === uuid) return;
			if (rule.enabled) {
				fullCSS += `/* ${rule.rule} */\n${rule.css}\n\n`;
			}
		});

		// Update the settings
		this.plugin.settings.customCSS = fullCSS;
		await this.plugin.saveSettings();
	}

	createRuleItem(containerEl: HTMLElement, rule: CSSrule): HTMLElement {
		const item = containerEl.createDiv(
			{
				cls: 'rule-item',
				attr: {
					'data-cts-uuid': rule.uuid,
					'data-tooltip-position': 'top'
				}
			}
		);

		let currentEnabled = rule.enabled;

		const ruleHeader = item.createDiv('rule-item-header');

		const titleEl = ruleHeader.createDiv('rule-item-title');
		titleEl.createDiv(
			{
				text: rule.rule,
			}
		);

		const actionsEl = ruleHeader.createDiv('rule-item-actions');

		const editButton = actionsEl.createEl(
			'button',
			{
				cls: 'clickable-icon'
			}
		);
		editButton.setAttr('aria-label', 'Edit this rule');
		editButton.setAttr('data-tooltip-position', 'top');
		editButton.setAttr('tabindex', '0');
		setIcon(editButton, 'edit');

		const enabledButton = actionsEl.createEl(
			'button',
			{
				cls: 'clickable-icon'
			}
		);
		enabledButton.setAttr('data-tooltip-position', 'top');
		enabledButton.setAttr('tabindex', '0');
		if (currentEnabled) {
			setIcon(enabledButton, 'eye');
			enabledButton.setAttr('aria-label', 'Disable this rule');
			enabledButton.setAttr('data-tooltip-position', 'top');
		} else {
			setIcon(enabledButton, 'eye-off');
			enabledButton.setAttr('aria-label', 'Enable this rule');
			enabledButton.setAttr('data-tooltip-position', 'top');
		}

		const deleteButton = actionsEl.createEl(
			'button',
			{
				cls: 'rule-item-delete-button clickable-icon mod-destructive'
			}
		);
		deleteButton.setAttr('aria-label', 'Delete this rule');
		deleteButton.setAttr('data-tooltip-position', 'top');
		deleteButton.setAttr('tabindex', '0');
		setIcon(deleteButton, 'trash');

		// Edit button
		editButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection = this.view.containerEl.querySelector('.css-editor-section');
			const isEditorVisible = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved CSS rule form open. Editing another rule will discard your changes. Continue?', this.plugin.app)) {
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
			const inlineEditor = item.createDiv('inline-rule-editor');

			// Clone the editor section into the inline editor
			if (this.editorSection) {
				// Show the editor with the current rule's values
				this.setRule(rule.uuid, rule.rule, true);

				// Move the editor section under this rule
				inlineEditor.appendChild(this.editorSection);
				this.showEditorSection(true);

				// Scroll editor to the top of view
				if (this.plugin.settings.viewScrollToTop) {
					setTimeout(() => {
						this.scrollToDivByUUID(rule.uuid);
						this.ruleInputEl!.focus();
					}, 100);
				}
			}
		});

		// Enabled button
		enabledButton.addEventListener('click', async () => {
			// Enable/disable other rule
			const currentlyEditedIndex = await new Promise<number | boolean>((resolve) => {
				const ruleList = this.view.containerEl.querySelector('.css-rule');
				const existingRules = ruleList!.querySelectorAll('.rule-item');
				existingRules!.forEach((el, index) => {
					const openEditor = el.querySelector('.inline-rule-editor');
					if (openEditor!) {
						return resolve(index);
					}
				});
				return resolve(false);
			});

			const existingIndex = this.plugin.settings.cssRules.findIndex(el => el.uuid === rule.uuid);

			if (existingIndex >= 0) {

				this.plugin.settings.cssRules[existingIndex].enabled = this.plugin.settings.cssRules[existingIndex].enabled ? false : true;
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
			this.plugin.settings.cssRules.forEach((rule, index) => {
				if (rule.enabled) {
					// Need currently edited index here
					if (index === currentlyEditedIndex) {
						let css = this.aceService.getValue();
						fullCSS += `/* ${rule.rule} */\n${css}\n\n`;
					} else {
						fullCSS += `/* ${rule.rule} */\n${rule.css}\n\n`;
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
			deleteButton.addClass('mod-loading');
			// Confirm deletion
			if (await confirm(`Are you sure you want to delete the rule "${rule.rule}"?`, this.plugin.app)) {
				// Remove from settings
				this.plugin.settings.cssRules = this.plugin.settings.cssRules.filter(
					el => el.uuid !== rule.uuid
				);

				// Update custom CSS
				let fullCSS = '';
				this.plugin.settings.cssRules.forEach(el => {
					if (el.enabled) {
						fullCSS += `/* ${el.rule} */\n${el.css}\n\n`;
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
			deleteButton.removeClass('mod-loading');
		});
		return item;
	}

	scrollToDivByUUID(uuid: string) {
		const target = this.view.containerEl.querySelector(`[data-cts-uuid="${uuid}"]`);
		if (target) {
			const container = this.view.containerEl;
			if (container && target) {
				const top = (target as HTMLElement).offsetTop - 10;
				// container.scrollTop = top;
				(container as HTMLElement).scrollTo({
					top: top,
					behavior: "smooth"
				});
			}
		}
	}
}
