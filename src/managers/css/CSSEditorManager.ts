import { App, setIcon, Workspace, debounce } from 'obsidian';
import CustomThemeStudioPlugin from '../../main';
import { CustomThemeStudioView } from '../../views/customThemeStudioView';
import { CustomThemeStudioSettings, CSSrule } from '../../settings';
import { AceService } from '../../ace/AceService';
import { ICodeEditorConfig } from '../../interfaces/types';
import * as ace from 'ace-builds';
import { CSSVariableManager } from '../cssVariabManager';
import { generateUniqueId, showNotice, Logger } from "../../utils";
import { smoothScrollToElement } from "../../utils/uiHelpers";
import { DEBOUNCE_DELAYS, TIMEOUT_DELAYS, NOTICE_DURATIONS } from '../../constants';
import { CSSRuleItemRenderer } from './CSSRuleItemRenderer';
import { CSSRuleListManager } from './CSSRuleListManager';
import { CSSValidationService } from './CSSValidationService';

/**
 * Main CSS Editor Manager - orchestrates CSS rule editing functionality.
 * Refactored to use specialized classes for rendering, list management, and validation.
 */
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

	// New specialized managers
	private ruleItemRenderer: CSSRuleItemRenderer;
	private ruleListManager: CSSRuleListManager | null = null;
	private validationService: CSSValidationService;

	// Timer tracking for cleanup
	private timers: number[] = [];

	constructor(workspace: Workspace, plugin: CustomThemeStudioPlugin, view: CustomThemeStudioView, private config: ICodeEditorConfig) {
		this.plugin = plugin;
		this.view = view;
		this.app = plugin.app;
		this.workspace = workspace;
		this.settings = plugin.settings;
		this.aceService = new AceService(this.plugin);
		this.cssVariableManager = new CSSVariableManager(this.plugin);

		// Initialize specialized services
		this.validationService = new CSSValidationService(plugin);
		this.ruleItemRenderer = new CSSRuleItemRenderer({
			plugin: this.plugin,
			view: this.view,
			aceService: this.aceService,
			onEdit: (rule, item) => this.handleEditRule(rule, item),
			onToggle: (rule, button) => this.handleToggleRule(rule, button),
			onDelete: (rule, item) => this.handleDeleteRule(rule, item)
		});
	}

	/**
	 * Initialize the rule list manager once the container is available
	 */
	initializeRuleListManager(container: HTMLElement): void {
		this.ruleListManager = new CSSRuleListManager(
			this.plugin,
			this.view,
			this.ruleItemRenderer,
			container
		);
	}

	/**
	 * Shows or hides the CSS editor section.
	 * @param show Whether to show (true) or hide (false) the editor
	 */
	showEditorSection(show: boolean): void {
		this.editorSection?.toggleClass('show', show);
		this.editorSection?.toggleClass('hide', !show);
	}

	/**
	 * Creates the CSS editor section in the DOM.
	 * Initializes the Ace editor, input fields, buttons, and event handlers.
	 * @param containerEl Parent element to create the editor section in
	 */
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

		const formatButton = buttonContainer.createEl(
			'button',
			{
				cls: 'clickable-icon',
				attr: {
					'aria-label': 'Format CSS with Prettier',
					'data-tooltip-position': 'top'
				}
			}
		);
		setIcon(formatButton, 'wand-sparkles');

		formatButton.addEventListener('click', async () => {
			const currentCSS = this.aceService.getValue();
			if (!currentCSS || currentCSS.trim() === '') {
				showNotice('No CSS to format', 2000, 'info');
				return;
			}

			// Store cursor position
			const cursorPosition = this.editor.getCursorPosition();

			// Format the CSS
			const formatted = await this.validationService.formatCSS(currentCSS);
			if (formatted) {
				// Use replace instead of setValue to preserve undo stack
				const Range = ace.require('ace/range').Range;
				const fullRange = new Range(
					0, 0,
					this.editor.session.getLength(),
					this.editor.session.getLine(this.editor.session.getLength() - 1).length
				);

				// Replace content - this is undoable with Ctrl/Cmd+Z
				this.editor.session.replace(fullRange, formatted);

				// Try to restore cursor position (or close to it)
				try {
					this.editor.moveCursorToPosition(cursorPosition);
				} catch {
					// If position is invalid after formatting, just go to start
					this.editor.navigateFileStart();
				}

				showNotice('CSS formatted successfully', 2000, 'success');
			}
		});

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
			if (await this.saveElement()) {
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

		this.plugin.registerEvent(
			this.workspace.on('css-change', async () => {
				this.aceService.updateTheme();
			})
		);
	}

	// Auto-apply changes when typing (with debounce)
	changeListener = (delta: ace.Ace.Delta) => {
		const timeout = window.setTimeout(() => {
			let css = this.aceService.getValue();
			if (this.plugin.settings.autoApplyChanges) {
				const timer = window.setTimeout(() => {
					const css = this.aceService.getValue();
					if (css !== '') {
						this.applyChanges(css);
					}
				}, this.plugin.settings.cssEditorDebounceDelay);
				this.timers.push(timer);
			}
		}, 10);
		this.timers.push(timeout);
	}

	setRule(uuid: string, rule: string, isEditingExisting: boolean): void {
		if (!this.ruleInputEl || !this.editorUUID) return;

		// Try to find existing rule with this UUID
		const existingRule = this.plugin.settings.cssRules.find(el => el.uuid === uuid);

		if (existingRule) {
			// Load ALL data from saved settings (not from parameters) to avoid stale data
			this.currentRule = existingRule.rule;
			this.ruleInputEl.value = existingRule.rule;
			this.editorUUID.value = existingRule.uuid;
			this.editorEl!.value = existingRule.css;
			this.aceService.setValue(existingRule.css, 1);
		} else {
			// New rule - use parameter values
			this.currentRule = rule;
			this.ruleInputEl.value = rule;
			this.editorUUID.value = uuid;
			this.generateDefaultCSS(rule);
			showNotice(`Element selected: ${rule}`, NOTICE_DURATIONS.STANDARD, 'success');
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

			// Add padding and margin
			css += `  padding: ${computedStyle.padding};\n`;
			css += `  margin: ${computedStyle.margin};\n`;

			// Add font properties
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
	}

	/**
	 * Validate and find element by CSS selector
	 *
	 * @param selector CSS selector to validate and query
	 * @returns HTMLElement if found, null if invalid or not found
	 */
	findElementBySelector(selector: string): HTMLElement | null {
		// Validate selector is not empty
		if (!selector || selector.trim().length === 0) {
			Logger.error('Empty selector provided');
			showNotice('Selector cannot be empty', NOTICE_DURATIONS.SHORT, 'error');
			return null;
		}

		// Check for dangerous patterns
		const dangerousPatterns = [
			/javascript:/i,
			/<script/i,
			/on\w+\s*=/i,  // onclick=, onerror=, etc.
		];

		for (const pattern of dangerousPatterns) {
			if (pattern.test(selector)) {
				Logger.error('Potentially dangerous selector:', selector);
				showNotice('Selector contains unsafe content', NOTICE_DURATIONS.SHORT, 'error');
				return null;
			}
		}

		// Attempt to query the selector
		try {
			return document.querySelector(selector) as HTMLElement;
		} catch (error) {
			Logger.error(`Invalid CSS selector: ${selector}`, error);
			showNotice('Invalid CSS selector syntax', NOTICE_DURATIONS.SHORT, 'error');
			return null;
		}
	}

	/**
	 * Apply CSS changes to the theme without validation.
	 * Used for auto-apply/live-preview functionality.
	 *
	 * DESIGN DECISION: This method intentionally does NOT validate CSS syntax.
	 * This preserves the live preview experience where users can see changes
	 * as they type, even with incomplete CSS (e.g., unclosed brackets).
	 * Validation only occurs on manual save via saveElement().
	 */
	applyChanges(css: string): void {
		if (!this.editorEl || !this.ruleInputEl) return;

		const rule = this.ruleInputEl.value.trim();
		const uuid = this.editorUUID.value;

		if (!uuid) {
			return;
		}
		// Update the custom CSS
		this.validationService.updateCustomCSS(uuid, rule, css);

		// Apply the changes
		this.validationService.applyTheme();
	}

	clearAppliedChanges(): void {
		// Update the custom CSS
		this.validationService.updateCustomCSS(generateUniqueId(), '', '');

		// Apply the changes
		this.validationService.applyTheme();
	}

	async saveElement(): Promise<boolean> {
		if (!this.editorEl || !this.ruleInputEl) return false;

		const uuid = this.editorUUID.value;
		const rule = this.ruleInputEl.value.trim();
		const css = this.aceService.getValue();

		if (!rule || !css) {
			showNotice('Please enter both a rule (name) and CSS', NOTICE_DURATIONS.STANDARD, 'error');
			return false;
		}

		// Validate CSS syntax
		if (!await this.validationService.validateCSS(css)) {
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
		await this.validationService.updateCustomCSS(uuid, rule, css);

		// Apply the changes
		this.validationService.applyTheme();

		this.editorEl.value = '';

		// INCREMENTAL UPDATE: Use rule list manager instead of full rebuild
		if (this.ruleListManager) {
			let element: HTMLElement | null;
			if (existingIndex >= 0) {
				// Update existing item
				element = this.ruleListManager.updateRuleItem(uuid, {
					uuid,
					rule,
					css,
					enabled: this.plugin.settings.cssRules[existingIndex].enabled
				});
			} else {
				// Add new item
				element = this.ruleListManager.addRuleItem({
					uuid,
					rule,
					css,
					enabled: true
				});
			}

			// Scroll and highlight - no delay needed!
			if (element) {
				this.ruleListManager.scrollToAndHighlight(element);
			}
		}

		showNotice('Rule saved successfully', NOTICE_DURATIONS.STANDARD, 'success');
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

	/**
	 * Focus the rule name input field
	 */
	focusRuleInput(): void {
		if (this.ruleInputEl) {
			this.ruleInputEl.focus();
		}
	}

	/**
	 * Focus the Ace editor and position cursor optimally
	 * Positions cursor before the last closing brace for easy property addition
	 */
	focusAceEditor(): void {
		if (!this.editor) return;

		this.editor.focus();

		// Find the last closing brace
		const searchOptions = {
			backwards: true,
			wrap: false,
			caseSensitive: true,
			regExp: false
		};

		// Move cursor to end first
		this.editor.navigateFileEnd();

		// Search backwards for the last }
		const range = this.editor.find('}', searchOptions);

		if (range) {
			// Position cursor at the end of the line before the closing brace
			const row = range.start.row;
			if (row > 0) {
				// Go to previous line and position at end
				this.editor.gotoLine(row, Number.MAX_VALUE);

				// Get tab width from settings and create indentation
				const tabWidth = Number(this.plugin.settings.editorTabWidth) || 4;
				const indent = ' '.repeat(tabWidth);

				this.editor.insert('\n' + indent);
			} else {
				// If closing brace is on first line, just position before it
				this.editor.moveCursorTo(range.start.row, range.start.column);
			}
		}
		// If no closing brace found, cursor stays at end of file
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

	// Handler methods for rule item actions
	private async handleEditRule(rule: CSSrule, item: HTMLElement): Promise<void> {
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
				}, TIMEOUT_DELAYS.SCROLL_DELAY);
			}

			// Focus Ace editor and move cursor to end after UI is rendered
			const focusEditor = debounce(() => {
				this.focusAceEditor();
			}, 100, false);
			focusEditor();
		}
	}

	private async handleToggleRule(rule: CSSrule, button: HTMLElement): Promise<void> {
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
			this.plugin.settings.cssRules[existingIndex].enabled = !this.plugin.settings.cssRules[existingIndex].enabled;

			// INCREMENTAL UPDATE: Update button icon without re-render
			if (this.ruleListManager) {
				this.ruleListManager.toggleRuleEnabled(
					rule.uuid,
					this.plugin.settings.cssRules[existingIndex].enabled
				);
			}
		}

		// Update custom CSS
		let fullCSS = '';
		this.plugin.settings.cssRules.forEach((cssRule, index) => {
			if (cssRule.enabled) {
				// Need currently edited index here
				if (index === currentlyEditedIndex) {
					let css = this.aceService.getValue();
					fullCSS += `/* ${cssRule.rule} */\n${css}\n\n`;
				} else {
					fullCSS += `/* ${cssRule.rule} */\n${cssRule.css}\n\n`;
				}

			}
		});

		this.plugin.settings.customCSS = fullCSS;
		this.plugin.saveSettings();

		// Apply changes
		this.validationService.applyTheme();
	}

	private async handleDeleteRule(rule: CSSrule, item: HTMLElement): Promise<void> {
		// Remove from settings
		this.plugin.settings.cssRules = this.plugin.settings.cssRules.filter(
			el => el.uuid !== rule.uuid
		);

		// Update custom CSS
		await this.validationService.rebuildCustomCSS();

		// Apply changes
		this.validationService.applyTheme();

		// remove editor
		const hasEditor: HTMLElement | null | undefined = this.view.containerEl.querySelector(`[data-cts-uuid="${rule.uuid}"]`)?.querySelector('.css-editor-section.show');
		if (hasEditor) {
			this.removeInlineEditor();
		}

		// INCREMENTAL UPDATE: Remove only this item
		if (this.ruleListManager) {
			this.ruleListManager.removeRuleItem(rule.uuid);
		} else {
			// Fallback to DOM removal
			item.remove();
		}

		// Update search counter if filtering is active
		if (this.view.ruleSearch !== '') {
			await this.view.filterCSSRules(this.view.ruleSearch);
		}
	}

	scrollToDivByUUID(uuid: string) {
		const target = this.view.containerEl.querySelector(`[data-cts-uuid="${uuid}"]`);
		if (target) {
			smoothScrollToElement(this.view.containerEl, target as HTMLElement);
		}
	}

	/**
	 * Create a rule item using the renderer (for compatibility)
	 * @deprecated Use ruleListManager.addRuleItem() for incremental updates
	 */
	createRuleItem(containerEl: HTMLElement, rule: CSSrule): HTMLElement {
		return this.ruleItemRenderer.createRuleItem(containerEl, rule);
	}

	/**
	 * Clean up timers and resources
	 */
	destroy(): void {
		this.timers.forEach(timer => clearTimeout(timer));
		this.timers = [];
	}
}
