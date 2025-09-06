import { ItemView, WorkspaceLeaf, setIcon, Workspace, ColorComponent, Scope, debounce } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { type cssVariable, CSSVariableManager, allCategories, cssCategory, cssVariableDefaults } from '../managers/cssVariabManager';
import { ElementSelectorManager } from '../managers/elementSelectorManager';
import { CSSEditorManager } from '../managers/cssEditorManager';
import { ICodeEditorConfig } from '../interfaces/types';
import { confirm } from '../modals/confirmModal';
import { CSSVariable, CustomThemeStudioSettings, DEFAULT_SETTINGS } from '../settings';
import { copyStringToClipboard, getCurrentTheme, showNotice } from '../utils';
import { FontImportModal } from "../modals/fontImportModal";
import { AddVariableModal } from "../modals/addVariableModal";

export const VIEW_TYPE_CTS = 'cts-view';

export class CustomThemeStudioView extends ItemView {

	plugin: CustomThemeStudioPlugin;
	settings: CustomThemeStudioSettings;
	cssVariableManager: CSSVariableManager;
	elementSelectorManager: ElementSelectorManager;
	cssEditorManager: CSSEditorManager;
	workspace: Workspace;
	variableSearch: string;
	ruleSearch: string;
	activeTag: string | null;
	editorScope: Scope;

	constructor(settings: CustomThemeStudioSettings, leaf: WorkspaceLeaf, plugin: CustomThemeStudioPlugin, private config: ICodeEditorConfig) {
		super(leaf);
		this.plugin = plugin;
		this.cssVariableManager = new CSSVariableManager(this.plugin);
		this.elementSelectorManager = new ElementSelectorManager(this.plugin, this);
		this.cssEditorManager = new CSSEditorManager(this.app.workspace, this.plugin, this, this.config);
		this.workspace = this.app.workspace;
		this.settings = settings;
		this.variableSearch = '';
		this.ruleSearch = '';
		this.activeTag = 'all';
		this.editorScope = new Scope();
	}

	getViewType(): string {
		return VIEW_TYPE_CTS;
	}

	getDisplayText(): string {
		return 'Custom Theme Studio';
	}

	getIcon(): string {
		return 'paintbrush';
	}

	// On view open
	async onOpen(): Promise<void> {
		this.prepareContainer();
		this.renderSections();
		this.setupAccessibility();
		this.setupEditorFocusKeymap();
	}

	private prepareContainer(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('cts-view');
	}

	private renderSections(): void {
		this.renderHeader();
		this.renderCSSVariables();
		this.renderCSSRules();
		this.renderExportSection();
	}

	private setupAccessibility(): void {
		this.containerEl.addEventListener('keydown', (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target?.getAttribute('role') === 'button' &&
				target.tagName === 'A'
			) {
				const key = e.key;
				const isEnter = key === 'Enter' || e.keyCode === 13;
				const isSpace = key === ' ' || key === 'Spacebar' || e.keyCode === 32;
				if (isEnter || isSpace) {
					e.preventDefault();
					target.click();
				}
			}
		});
	}

	private setupEditorFocusKeymap(): void {
		const editorEl = this.cssEditorManager.editor as unknown as HTMLElement;

		this.registerDomEvent(editorEl, 'focus', () => {
			this.app.keymap.pushScope(this.editorScope);
		}, true);

		this.registerDomEvent(editorEl, 'blur', () => {
			this.app.keymap.popScope(this.editorScope);
		}, true);
	}

	// Render header section
	private renderHeader(): void {
		const headerEl: HTMLDivElement = this.containerEl.createDiv('theme-studio-header');
		headerEl.createEl(
			'h3',
			{
				text: 'Custom Theme Studio'
			}
		);

		// Theme enabled toggle
		const toggleContainer: HTMLDivElement = headerEl.createDiv('theme-toggle-container');
		const toggleSwitch: HTMLInputElement = toggleContainer.createEl(
			'input',
			{
				attr: {
					type: 'checkbox',
					id: 'theme-toggle-switch'
				}
			}
		);
		toggleSwitch.checked = this.plugin.settings.themeEnabled;
		toggleSwitch.addEventListener('change', async () => {
			this.plugin.themeManager.toggleCustomTheme();
		});
		const toggleLabel: HTMLLabelElement = toggleContainer.createEl(
			'label',
			{
				text: 'Enable theme'
			}
		);
		toggleLabel.setAttr('for', 'theme-toggle-switch');

		// Light/dark theme toggle
		const toggleThemeWrapper = toggleContainer.createDiv('toggle-theme-wrapper');
		const toggleThemeButton = toggleThemeWrapper.createEl(
			'button',
			{
				cls: 'toggle-theme-mode clickable-icon'
			}
		);
		toggleThemeButton.setAttr('aria-label', 'Toggle light/dark mode');
		toggleThemeButton.setAttr('data-tooltip-position', 'top');
		setIcon(toggleThemeButton, getCurrentTheme() === 'obsidian' ? 'sun' : 'moon');

		toggleThemeButton.addEventListener('click', async () => {
			// @ts-ignore
			this.app.changeTheme(getCurrentTheme() === 'obsidian' ? 'moonstone' : 'obsidian');
			setIcon(toggleThemeButton!, getCurrentTheme() === 'obsidian' ? 'sun' : 'moon');
		});

	}

	// Render CSS variables section
	private renderCSSVariables(): void {
		const section: HTMLDivElement = this.containerEl.createDiv('variables-section');

		// Section header
		const header: HTMLDivElement = section.createDiv('collapsible');
		const headerTitle: HTMLDivElement = header.createDiv('collapsible-header');
		headerTitle.createSpan(
			{
				text: 'CSS variables'
			}
		);

		// Section header toggle button
		const toggleIcon: HTMLButtonElement = headerTitle.createEl(
			'button',
			{
				cls: 'collapse-icon clickable-icon',
				attr: {
					tabindex: '0',
					'aria-label': 'Expand section',
					'data-tooltip-position': 'top'
				}
			}
		);

		// Section collapsible content
		const content: HTMLDivElement = header.createDiv('collapsible-content');

		// Check saved toggle state
		const shouldExpand = this.plugin.settings.expandCSSVariables;
		content.toggleClass('show', shouldExpand);
		content.toggleClass('hide', !shouldExpand);
		setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
		toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
		toggleIcon.setAttr('data-tooltip-position', 'top');

		// Make header title clickable to toggle visibility
		headerTitle.addEventListener('click', () => {
			const shouldExpand = content.hasClass('hide');
			// Expand if it's currently hidden
			content.toggleClass('show', shouldExpand);
			content.toggleClass('hide', !shouldExpand);
			setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
			toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
			this.plugin.settings.expandCSSVariables = shouldExpand;
			this.plugin.saveSettings();
		});

		// Variables button container
		const cssVariablesButtonContainer: HTMLDivElement = content.createDiv('css-variables-button-container');

		// "New variable" button
		const newVariableButton: HTMLButtonElement = cssVariablesButtonContainer.createEl(
			'button',
			{
				cls: 'new-variable-button',
				attr: {
					'aria-label': 'Add CSS variable',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		setIcon(newVariableButton, 'square-pen');

		newVariableButton.addEventListener('click', async () => {
			new AddVariableModal(this.app, this.plugin).open();
		});

		// Tags filtering
		const filterTags: HTMLDivElement = content.createDiv('filter-tags');
		const tags: string[] = [
			'all',
			'components',
			'editor',
			'foundations',
			'plugins',
			'window',
			'theme-dark',
			'theme-light',
			'CTS'
		]
		tags.forEach((tag: string) => {
			filterTags.createEl(
				'a',
				{
					text: tag,
					cls: 'tag tag-filter-' + tag + ((tag === 'all') ? ' tag-filter-active' : ''),
					attr: {
						'data-tag-filter': tag.toLowerCase(),
						tabindex: '0',
						'role': 'button',
						'aria-label': 'Show ' + tag + ' variables',
						'data-tooltip-position': 'top'
					}
				},
				(el) => {
					el.addEventListener('click', (ev: MouseEvent) => {
						let filterTag: string | null = (ev.currentTarget as HTMLElement).getAttr('data-tag-filter');
						this.activeTag = filterTag;
						tags.forEach((tag: string) => {
							let tagButton: Element | null = filterTags.querySelector(`[data-tag-filter="${tag.toLowerCase()}"]`);
							tagButton!.removeClass('tag-filter-active');
						});
						(ev.currentTarget as HTMLElement).addClass('tag-filter-active');
						let dataFilterTags: NodeListOf<Element> = this.containerEl.querySelectorAll('[data-filter-tag]');
						dataFilterTags.forEach((elt: HTMLElement) => {
							let filter: string | null = elt.getAttr('data-filter-tag');
							const showCategory =
								(this.activeTag === 'all' && (tag === 'all' || filter === filterTag)) ||
								(this.activeTag !== 'all' && filter === filterTag);
							elt.toggleClass('show', showCategory);
							elt.toggleClass('hide', !showCategory);
						});
						// Check for variable search
						if (this.variableSearch !== '') {
							let variableLists: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-list');
							// Variable categories
							variableLists.forEach((el: HTMLElement) => {
								let dataVarTag: string | null = el.getAttr('data-var-tag');
								let hasVisibleChildren: boolean = false;
								let children: HTMLCollection = el.children;

								// Check for visible children
								for (var i = 0; i < children.length; i++) {
									if (children[i].hasClass('show')) {
										hasVisibleChildren = true;
										continue;
									}
								}

								// Hide/show
								const showCategory = hasVisibleChildren && (filterTag === dataVarTag || filterTag === 'all');
								el?.toggleClass('show', showCategory);
								el?.toggleClass('hide', !showCategory);
								el?.parentElement?.toggleClass('show', showCategory);
								el?.parentElement?.toggleClass('hide', !showCategory);

								// Toggle icon
								let variableListicon: HTMLElement | null = (el.previousSibling as HTMLElement)!.querySelector('.collapse-icon.clickable-icon');
								setIcon(variableListicon!, 'chevron-down');
								variableListicon?.setAttr('aria-label', 'Collapse category');
								variableListicon?.setAttr('data-tooltip-position', 'top');
								// Scroll variable list to the top of view
								if (this.plugin.settings.viewScrollToTop) {
									setTimeout(() => {
										this.scrollToDiv(el);
									}, 100);
								}
							});
						}
					});
				}
			)
		});

		// Variables search
		const searchContainer: HTMLDivElement = content.createDiv('search-container');
		const clearInputContainer: HTMLDivElement = searchContainer.createDiv('clear-search-input');

		const searchInput: HTMLInputElement = clearInputContainer.createEl(
			'input',
			{
				cls: 'search-input',
				attr: {
					type: 'text',
					placeholder: 'Search CSS variables…'
				}
			}
		);

		// Search on input event
		searchInput.addEventListener('input', (e) => {
			const searchTerm: string = (e.target as HTMLInputElement).value.trim();
			let activeTagFilter: string | null | undefined = this.containerEl.querySelector('.tag-filter-active')?.getAttr('data-tag-filter');

			this.variableSearch = searchTerm;
			this.filterVariables(searchTerm);

			const variableListEls: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-list');
			if (this.variableSearch === '') {
				variableListEls.forEach((el: HTMLElement) => {
					const dataVarTag = el.getAttr('data-var-tag');
					const variableListIcon: HTMLElement | null = (el.previousSibling as HTMLElement)?.querySelector('.collapse-icon.clickable-icon');
					const shouldShowCategory = activeTagFilter === 'all' || dataVarTag === activeTagFilter;
					// Always hide the variable list
					el.addClass('hide');
					el.removeClass('show');
					// Show/hide the category based on filter
					el.parentElement?.toggleClass('show', shouldShowCategory);
					el.parentElement?.toggleClass('hide', !shouldShowCategory);
					setIcon(variableListIcon!, 'chevron-right');
					variableListIcon?.setAttr('aria-label', 'Expand category');
					variableListIcon?.setAttr('data-tooltip-position', 'top');
				});
			} else {
				variableListEls.forEach((el: HTMLElement) => {
					const children = Array.from(el.children);
					const hasVisibleChildren = children.some(child =>
						child.hasClass('show')
					);

					const dataVarTag = el.getAttr('data-var-tag');
					const variableListIcon: HTMLElement | null = (el.previousSibling as HTMLElement)?.querySelector('.collapse-icon.clickable-icon');
					const shouldExpand = (activeTagFilter === 'all' || dataVarTag === activeTagFilter) && hasVisibleChildren;

					// Toggle visibility
					el.toggleClass('show', shouldExpand);
					el.toggleClass('hide', !shouldExpand);
					el.parentElement?.toggleClass('show', shouldExpand);
					el.parentElement?.toggleClass('hide', !shouldExpand);

					// Icon and accessibility
					const iconName = shouldExpand ? 'chevron-down' : 'chevron-right';
					const ariaLabel = shouldExpand ? 'Collapse category' : 'Expand category';
					setIcon(variableListIcon!, iconName);
					variableListIcon?.setAttr('aria-label', ariaLabel);
					variableListIcon?.setAttr('data-tooltip-position', 'top');
				});
			}
			// Clear search
			if ((e.currentTarget! as HTMLInputElement).value && !searchInput.classList.contains('clear-search-input--touched')) {
				searchInput.classList.add('clear-search-input--touched');
			} else if (!(e.currentTarget! as HTMLInputElement).value && searchInput.classList.contains('clear-search-input--touched')) {
				searchInput.classList.remove('clear-search-input--touched');
			}

		});

		// Clear search button
		const clearSearchButton: HTMLButtonElement = clearInputContainer.createEl(
			'button',
			{
				cls: 'clear-search-input-button',
				attr: {
					'aria-label': 'Clear search',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		clearSearchButton.addEventListener('click', (evt) => {
			searchInput.value = '';
			searchInput.focus();
			searchInput.trigger('input');
			searchInput.classList.remove('clear-search-input--touched');
			const variableListEls: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-list');
			variableListEls.forEach((elt: HTMLElement) => {
				elt.toggleClass('show', false);
				elt.toggleClass('hide', true);
				const variableListIcon: HTMLElement | null = (elt.previousSibling as HTMLElement)?.querySelector('.collapse-icon.clickable-icon');
				if (variableListIcon) {
					setIcon(variableListIcon, 'chevron-right');
					variableListIcon.setAttr('aria-label', 'Expand category');
					variableListIcon.setAttr('data-tooltip-position', 'top');
				}
			});
		});

		// Render all categories
		allCategories.forEach((category: cssCategory) => {
			const categoryEl: HTMLDivElement = content.createDiv(
				{
					cls: 'variable-category',
					attr: {
						id: 'variable-category-' + category.category,
						'data-filter-tag': category.tag
					}
				}
			);

			const header: HTMLDivElement = categoryEl.createDiv('var-cat');
			const catTitle: HTMLDivElement = header.createDiv('collapsible-header');
			catTitle.createSpan(
				{
					text: category.title.replace('+', ' ')
				}
			);
			const catToggleIcon: HTMLButtonElement = catTitle.createEl(
				'button',
				{
					cls: 'collapse-icon clickable-icon',
					attr: {
						tabindex: '0',
						'aria-label': 'Expand category',
						'data-tooltip-position': 'top'
					}
				}
			);
			setIcon(catToggleIcon, 'chevron-right');

			// Variable list
			const variableListEl: HTMLDivElement = categoryEl.createDiv(
				{
					cls: 'variable-list',
					attr: {
						'data-var-category': category.category,
						'data-var-tag': category.tag
					}
				}
			);
			variableListEl.addClass('hide');

			// Category help hints
			if (category.help) {
				const variableListHelp = variableListEl.createDiv('variable-category-help-container');
				const variableListIcon = variableListHelp.createSpan('variable-category-help-icon');
				setIcon(variableListIcon, 'info');
				variableListHelp.createSpan(
					{
						cls: 'variable-category-help',
						text: category.help,
					}
				);
			}

			// Make header title clickable to toggle visibility
			header.addEventListener('click', () => {
				const shouldExpand = variableListEl.hasClass('hide');

				variableListEl.toggleClass('show', shouldExpand);
				variableListEl.toggleClass('hide', !shouldExpand);

				setIcon(catToggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
				catToggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse category' : 'Expand category');
				catToggleIcon.setAttr('data-tooltip-position', 'top');

				if (shouldExpand && this.plugin.settings.viewScrollToTop) {
					setTimeout(() => {
						this.scrollToDiv(categoryEl);
					}, 100);
				}
			});
			// List variables
			if (category.category === 'custom') {
				const items = this.plugin.settings.cssVariables
					.filter(v => v.parent === 'custom')
					.sort((a, b) => a.variable!.localeCompare(b.variable!)); // Sort by "variable" ASC
				if (items.length) {
					items.forEach((item) => {
						this.createCustomVariableItemInput(variableListEl, { uuid: item.uuid!, name: item.variable, value: item.value }, category.category);
					});
				}
			} else {
				const items: cssVariable[] = cssVariableDefaults
					.filter(cat => cat.cat === category.category)
					.sort((a, b) => a.variable!.localeCompare(b.variable!)); // Sort by "variable" ASC
				if (items.length) {
					items.forEach((item) => {
						this.createVariableItemInput(variableListEl, { name: item.variable, value: item.default }, category.category);
					});
				}
			}
		});
	}

	// Create variable input elements
	private createVariableItemInput(container: HTMLElement, variable: { name: string; value: string; }, category: string): void {
		const item = container.createDiv(
			{
				cls: 'variable-item',
				attr: {
					'data-var-name': variable.name,
					'data-var-value': variable.value,
				}
			}
		);

		// Get current value
		let currentVarValue: string = '';
		const customVars: CSSVariable[] = this.plugin.settings.cssVariables;
		const existingVariable: CSSVariable | undefined = customVars.find(v => v.variable === variable.name && v.parent === category);
		if (existingVariable) {
			currentVarValue = existingVariable.value;
		}

		// Variable name
		const nameEl: HTMLDivElement = item.createDiv('variable-name');
		nameEl.createSpan(
			{
				text: variable.name + ': ',
				attr: {
					'aria-label': 'Copy "var(' + variable.name + ')" to clipboard',
					'data-tooltip-position': 'top'
				}
			}
		);
		nameEl.addEventListener('click', () => {
			copyStringToClipboard('var(' + variable.name + ')', 'var(' + variable.name + ')');
		});

		// Variable value input
		const inputWrapper: HTMLDivElement = item.createDiv('variable-input-wrapper');
		const clearInputContainer: HTMLDivElement = inputWrapper.createDiv('clear-variable-input');
		const valueInput: HTMLInputElement = clearInputContainer.createEl(
			'input',
			{
				cls: 'variable-value-input',
				attr: {
					type: 'text',
					placeholder: variable.value as string,
					value: currentVarValue
				}
			}
		);

		// For clear input button
		if (currentVarValue) {
			valueInput.classList.add('clear-variable-input--touched');
		}

		// Hex color picker
		if (this.plugin.settings.enableColorPicker) {

			if (variable.value.startsWith('#')) {

				const colorPickerEl: HTMLDivElement = inputWrapper.createDiv('variable-color-picker');

				const colorPicker = new ColorComponent(colorPickerEl)
					.setValue(variable.value ?? '#000000')
					.onChange((value) => {
						if (variable.value !== value) {
							valueInput.value = value;
							valueInput.classList.add('clear-variable-input--touched');
							valueInput.focus();
							valueInput.trigger(this.plugin.settings.variableInputListener);
						}
					}).then(() => {
						colorPickerEl.setAttr('aria-label', 'Show color picker');
						colorPickerEl.setAttr('data-tooltip-position', 'top');
					});

				valueInput.addEventListener(this.plugin.settings.variableInputListener, (e) => {
					const newValue = (e.target as HTMLInputElement).value;
					if (newValue !== '') {
						colorPicker.setValue(newValue);
					} else {
						colorPicker.setValue(variable.value);
					}
				});

			}
		}

		// Clear input button
		const clearInputButton: HTMLButtonElement = clearInputContainer.createEl(
			'button',
			{
				cls: 'clear-variable-input-button',
				attr: {
					'aria-label': 'Clear input',
					'data-tooltip-position': 'top',
					tabindex: '0'
				}
			}
		);
		clearInputButton.addEventListener('click', (evt) => {
			valueInput.value = '';
			valueInput.focus();
			valueInput.trigger(this.plugin.settings.variableInputListener);
			valueInput.classList.remove('clear-variable-input--touched');
		});

		// Listen for input changes and update theme
		// TODO: how do deal with auto-apply changes with variables, maybe instead of on input save on change?
		// or give option in settings
		valueInput.addEventListener(this.plugin.settings.variableInputListener, (e) => {
			const newValue = (e.target as HTMLInputElement).value;
			const existingVariable: CSSVariable | undefined = customVars.find(v => v.variable === variable.name && v.parent === category);
			let existingUUID: string | undefined = existingVariable?.uuid;
			this.cssVariableManager.updateVariable(newValue !== '' ? existingUUID : '', variable.name as string, newValue, category);
			this.debounceUpdate();
			if ((e.currentTarget! as HTMLInputElement).value && !valueInput.classList.contains('clear-variable-input--touched')) {
				valueInput.classList.add('clear-variable-input--touched');
			} else if (!(e.currentTarget! as HTMLInputElement).value && valueInput.classList.contains('clear-variable-input--touched')) {
				valueInput.classList.remove('clear-variable-input--touched');
			}
		});

		// Copy to clipboard button
		const copyDefault = inputWrapper.createEl(
			'button',
			{
				cls: 'copy-default-value clickable-icon',
				attr: {
					'aria-label': 'Copy default value "' + variable.value + '" to clipboard',
					'data-tooltip-position': 'top'
				}
			}
		);
		setIcon(copyDefault, 'copy');
		copyDefault.addEventListener('click', () => {
			copyStringToClipboard(variable.value as string, variable.value as string);
		});
	}

	// Create variable input elements
	createCustomVariableItemInput(container: HTMLElement, variable: { uuid: string, name: string; value: string; }, category: string): void {
		const item = container.createDiv(
			{
				cls: 'custom-variable-item',
				attr: {
					'data-var-name': variable.name,
					'data-var-value': variable.value,
				}
			}
		);

		// Variable value input
		const inputWrapper: HTMLDivElement = item.createDiv('custom-variable-input-wrapper');

		const nameInput: HTMLInputElement = inputWrapper.createEl(
			'input',
			{
				cls: 'variable-name-input',
				attr: {
					type: 'text',
					placeholder: 'Variable name',
					value: variable.name
				}
			}
		);

		const inputButtonWrapper: HTMLDivElement = inputWrapper.createDiv('custom-variable-input-button-wrapper');

		const valueInput: HTMLInputElement = inputButtonWrapper.createEl(
			'input',
			{
				cls: 'variable-value-input',
				attr: {
					type: 'text',
					placeholder: 'Variable value',
					value: variable.value
				}
			}
		);

		// Listen for input changes and update theme
		nameInput.addEventListener(this.plugin.settings.variableInputListener, (e) => {
			const newValue = (e.target as HTMLInputElement).value;
			if (newValue === '' || valueInput.value === '') {
				showNotice('Both fields are required', 5000, 'error');
				return;
			}
			if (!newValue.match(/^--[a-zA-Z0-9-_\p{Emoji}]+/gui)) {
				showNotice('Please enter a valid variable name', 5000, 'error');
				nameInput.focus();
				return;
			}
			this.cssVariableManager.updateVariable(variable.uuid, newValue, valueInput.value, category);
			this.debounceUpdate();
		});
		valueInput.addEventListener(this.plugin.settings.variableInputListener, (e) => {
			const newValue = (e.target as HTMLInputElement).value;
			if (newValue === '' || nameInput.value === '') {
				showNotice('Both fields are required', 5000, 'error');
				return;
			}
			if (!nameInput.value.match(/^--[a-zA-Z0-9-_\p{Emoji}]+/gui)) {
				showNotice('Please enter a valid variable name', 5000, 'error');
				nameInput.focus();
				return;
			}
			this.cssVariableManager.updateVariable(variable.uuid, nameInput.value, newValue, category);
			this.debounceUpdate();
		});

		// Delete button
		const deleteVariableButton = inputButtonWrapper.createEl(
			'button',
			{
				cls: 'delete-variable-button clickable-icon mod-destructive',
				attr: {
					'aria-label': 'Delete this variable',
					'data-tooltip-position': 'top'
				}
			}
		);
		setIcon(deleteVariableButton, 'trash');
		deleteVariableButton.addEventListener('click', async () => {
			// copyStringToClipboard(variable.value as string, variable.value as string);
			deleteVariableButton.addClass('mod-loading');
			if (await confirm(`Are you sure you want to delete this variable?`, this.plugin.app)) {
				// Remove from settings
				this.plugin.settings.cssVariables = this.plugin.settings.cssVariables.filter(
					el => el.uuid !== variable.uuid
				);

				// Update custom CSS
				let fullCSS = '';
				this.plugin.settings.cssRules.forEach(rule => {
					if (rule.enabled) {
						fullCSS += `/* ${rule.rule} */\n${rule.css}\n\n`;
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

				showNotice('Variable deleted', 5000, 'success');
			}
			deleteVariableButton.removeClass('mod-loading');
		});
	}

	// Filer variables
	private async filterVariables(searchTerm: string): Promise<void> {
		// Filter all variables
		const varItems: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-item');
		varItems.forEach((item: Element) => {
			const varName = item.getAttribute('data-var-name') || '';
			const varDefaultValue = item.getAttribute('data-var-value') || '';
			const varValue = (item.querySelector('.variable-value-input') as HTMLInputElement)?.value || '';

			const matchesSearch =
				searchTerm === '' ||
				varName.includes(searchTerm) ||
				varDefaultValue.includes(searchTerm) ||
				varValue.includes(searchTerm);

			item.toggleClass('show', matchesSearch);
			item.toggleClass('hide', !matchesSearch);
		});
		// Filter custom variables
		const customVarItems: NodeListOf<Element> = this.containerEl.querySelectorAll('.custom-variable-item');
		customVarItems.forEach((item: Element) => {
			const varName = item.getAttribute('data-var-name') || '';
			const varValue = item.getAttribute('data-var-value') || '';

			const matchesSearch =
				searchTerm === '' ||
				varName.includes(searchTerm) ||
				varValue.includes(searchTerm);

			item.toggleClass('show', matchesSearch);
			item.toggleClass('hide', !matchesSearch);
		});
	}

	// Render CSS rules section
	private renderCSSRules(): void {
		const section: HTMLDivElement = this.containerEl.createDiv('rules-section');
		const header: HTMLDivElement = section.createDiv('collapsible');
		const headerTitle: HTMLDivElement = header.createDiv('collapsible-header');
		headerTitle.createSpan(
			{
				text: 'CSS rules'
			}
		);
		const toggleIcon: HTMLButtonElement = headerTitle.createEl(
			'button',
			{
				cls: 'collapse-icon clickable-icon',
				attr: {
					tabindex: '0',
					'aria-label': 'Expand section',
					'data-tooltip-position': 'top'
				}
			}
		);

		const content: HTMLDivElement = header.createDiv('collapsible-content');
		// Check saved toggle state
		const shouldExpand = this.plugin.settings.expandCSSRules;
		content.toggleClass('show', shouldExpand);
		content.toggleClass('hide', !shouldExpand);
		setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
		toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
		toggleIcon.setAttr('data-tooltip-position', 'top');

		// Make header title clickable to toggle visibility
		headerTitle.addEventListener('click', () => {
			const shouldExpand = content.hasClass('hide');
			// Expand if it's currently hidden
			content.toggleClass('show', shouldExpand);
			content.toggleClass('hide', !shouldExpand);
			setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
			toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
			this.plugin.settings.expandCSSRules = shouldExpand;
			this.plugin.saveSettings();
		});

		// CSS rules button container
		const cssRulesButtonContainer: HTMLDivElement = content.createDiv('css-rules-button-container');

		// "New CSS rule" button
		const addElementButton = cssRulesButtonContainer.createEl(
			'button',
			{
				cls: 'add-rule-button',
				attr: {
					'aria-label': 'Add CSS rule',
					'data-tooltip-position': 'top'
				}
			}
		);
		setIcon(addElementButton, 'square-pen');
		addElementButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection: Element | null = this.containerEl.querySelector('.css-editor-section');
			const isEditorVisible: boolean | null = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved CSS rule form open. Creating a new rule will discard your changes. Continue?', this.plugin.app)) {
					return;
				}
			}

			// Remove any existing inline editors
			const inlineEditors: NodeListOf<Element> = document.querySelectorAll('.inline-rule-editor');
			inlineEditors.forEach(editor => editor.remove());

			// Show the editor section and reset it
			this.cssEditorManager.resetEditor();
			this.cssEditorManager.clearAppliedChanges();

			this.cssEditorManager.showEditorSection(true);

			// Ensure the new form appears below the buttons
			const buttonContainer: Element | null = this.containerEl.querySelector('.css-rules-button-container');
			if (buttonContainer && editorSection) {
				buttonContainer.after(editorSection);
			}

			// Scroll editor to the top of view
			if (this.plugin.settings.viewScrollToTop) {
				setTimeout(() => {
					this.scrollToDiv(editorSection as HTMLElement);
				}, 100);
				// this.cssEditorManager.ruleInputEl!.focus();
			}
		});


		// "Select element" button
		const selectElementButton: HTMLButtonElement = cssRulesButtonContainer.createEl(
			'button',
			{
				cls: 'select-element-button',
				attr: {
					'aria-label': 'Select an element',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		setIcon(selectElementButton, 'mouse-pointer-square-dashed');
		selectElementButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection: Element | null = this.containerEl.querySelector('.css-editor-section');
			const isEditorVisible: boolean | null = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved CSS rule form open. Creating a new rule will discard your changes. Continue?', this.plugin.app)) {
					return;
				}
			}

			// Remove any existing inline editors
			const inlineEditors: NodeListOf<Element> = document.querySelectorAll('.inline-rule-editor');
			inlineEditors.forEach(editor => editor.remove());

			// Show the editor section and reset it
			this.cssEditorManager.resetEditor();
			this.cssEditorManager.clearAppliedChanges();
			this.cssEditorManager.showEditorSection(false);

			this.elementSelectorManager.startElementSelection();
		});

		// @font-face rule Modal
		if (this.plugin.settings.enableFontImport) {
			const addFontFaceButton = cssRulesButtonContainer.createEl(
				'button',
				{
					cls: 'add-font-face-button',
					attr: {
						'aria-label': 'Import font',
						'data-tooltip-position': 'top'
					}
				}
			);
			setIcon(addFontFaceButton, 'file-type');
			addFontFaceButton.addEventListener('click', async () => {
				new FontImportModal(this.app, this.plugin).open();
			});
		}

		// CSS Editor section - initially hidden when not adding a new rule
		this.cssEditorManager.createEditorSection(content);
		this.cssEditorManager.showEditorSection(false);

		// CSS rules search
		const searchContainer: HTMLDivElement = content.createDiv('search-rules-container');
		const clearInputContainer: HTMLDivElement = searchContainer.createDiv('clear-search-rules-input');
		const searchInput: HTMLInputElement = clearInputContainer.createEl(
			'input',
			{
				cls: 'search-rules-input',
				attr: {
					type: 'text',
					placeholder: 'Search CSS rules…'
				}
			}
		);
		searchInput.addEventListener('input', async (e) => {
			const searchTerm: string = (e.target as HTMLInputElement).value.trim();
			this.ruleSearch = searchTerm;

			await this.filterCSSRules(searchTerm);

			if ((e.currentTarget! as HTMLInputElement).value && !searchInput.classList.contains('clear-search-rules-input--touched')) {
				searchInput.classList.add('clear-search-rules-input--touched');
			} else if (!(e.currentTarget! as HTMLInputElement).value && searchInput.classList.contains('clear-search-rules-input--touched')) {
				searchInput.classList.remove('clear-search-rules-input--touched');
			}
		});

		// Clear search button
		const clearSearchButton: HTMLButtonElement = clearInputContainer.createEl(
			'button',
			{
				cls: 'clear-search-rules-input-button',
				attr: {
					'aria-label': 'Clear search',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		clearSearchButton.addEventListener('click', (evt) => {
			searchInput.value = '';
			searchInput.focus();
			searchInput.classList.remove('clear-search-rules-input--touched');
			this.ruleSearch = '';
			const ruleListEls: NodeListOf<Element> = this.containerEl.querySelectorAll('.rule-item');
			ruleListEls.forEach((elt: HTMLElement) => {
				elt.toggleClass('show', true);
				elt.toggleClass('hide', false);
			});

		});

		// Rule list
		const ruleListContainer = content.createDiv('css-rule-container');
		const ruleList = ruleListContainer.createDiv('css-rule');
		// Sort by "rule" value ASC
		// https://www.javascripttutorial.net/array/javascript-sort-an-array-of-objects/
		this.plugin.settings.cssRules.sort((a, b) => a.rule!.localeCompare(b.rule!));
		// Populate with saved rules
		this.plugin.settings.cssRules.forEach(rule => {
			this.cssEditorManager.createRuleItem(ruleList, rule);
		});

	}

	// Filter CSS rules
	async filterCSSRules(query: string) {
		// Filter all rules
		this.plugin.settings.cssRules.forEach((el) => {
			const matchesQuery =
				el.rule?.includes(query) || el.css?.includes(query);

			const ruleEl = this.containerEl.querySelector(`[data-cts-uuid="${el.uuid}"]`);
			if (ruleEl) {
				ruleEl.toggleClass('show', matchesQuery);
				ruleEl.toggleClass('hide', !matchesQuery);
			}
		});

	}

	// Render export section
	private renderExportSection(): void {
		const section: HTMLDivElement = this.containerEl.createDiv('export-section');
		const header: HTMLDivElement = section.createDiv('collapsible');
		const headerTitle: HTMLDivElement = header.createDiv('collapsible-header');
		headerTitle.createSpan(
			{
				text: 'Export theme'
			}
		);

		const toggleIcon: HTMLButtonElement = headerTitle.createEl(
			'button',
			{
				cls: 'collapse-icon clickable-icon',
				attr: {
					tabindex: '0',
					'aria-label': 'Expand section',
					'data-tooltip-position': 'top'
				}
			}
		);

		const content: HTMLDivElement = header.createDiv('collapsible-content');
		// Check saved toggle state
		const shouldExpand = this.plugin.settings.expandExportTheme;
		content.toggleClass('show', shouldExpand);
		content.toggleClass('hide', !shouldExpand);
		setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
		toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
		toggleIcon.setAttr('data-tooltip-position', 'top');

		// Make header title clickable to toggle visibility
		headerTitle.addEventListener('click', () => {
			const shouldExpand = content.hasClass('hide');
			// Expand if it's currently hidden
			content.toggleClass('show', shouldExpand);
			content.toggleClass('hide', !shouldExpand);
			setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
			toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
			this.plugin.settings.expandExportTheme = shouldExpand;
			this.plugin.saveSettings();
		});

		const description: HTMLDivElement = content.createDiv('export-description');
		description.createSpan(
			{
				text: 'Export your custom variables and rules as CSS and manifest files to create a shareable theme.',
			}
		);

		const formContainer: HTMLDivElement = content.createDiv('export-form');

		// Theme name input
		const nameContainer: HTMLDivElement = formContainer.createDiv('export-form-item');
		nameContainer.createSpan(
			{
				text: 'Theme Name:'
			}
		);
		const nameInput: HTMLInputElement = nameContainer.createEl(
			'input',
			{
				cls: 'export-form-theme-name',
				attr: {
					type: 'text',
					value: this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName
				}
			}
		);

		// Theme author input
		const authorContainer: HTMLDivElement = formContainer.createDiv('export-form-item');
		authorContainer.createSpan(
			{
				text: 'Author:'
			}
		);
		const authorInput: HTMLInputElement = authorContainer.createEl(
			'input',
			{
				cls: 'export-form-theme-author',
				attr: {
					type: 'text',
					value: this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor
				}
			}
		);

		// Theme author URL input
		const urlContainer: HTMLDivElement = formContainer.createDiv('export-form-item');
		urlContainer.createSpan(
			{
				text: 'URL:'
			}
		);
		const urlInput: HTMLInputElement = urlContainer.createEl(
			'input',
			{
				cls: 'export-form-theme-url',
				attr: {
					type: 'text',
					value: this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL
				}
			}
		);

		// Toggle for option to include disabled CSS rules
		const includeDisabledContainer: HTMLDivElement = formContainer.createDiv('export-form-item include-disabled-toggle');
		const includeDisabledToggleSwitch: HTMLInputElement = includeDisabledContainer.createEl(
			'input',
			{
				attr: {
					type: 'checkbox',
					id: 'include-disabled-switch'
				}
			}
		);
		includeDisabledToggleSwitch.checked = this.plugin.settings.exportThemeIncludeDisabled;
		// Save export settings when changed
		includeDisabledToggleSwitch.addEventListener('change', async () => {
			this.plugin.settings.exportThemeIncludeDisabled = includeDisabledToggleSwitch.checked;
			await this.plugin.saveSettings();
		});
		const includeDisabledToggleLabel: HTMLLabelElement = includeDisabledContainer.createEl(
			'label',
			{
				text: 'Include disabled CSS rules when exporting'
			}
		);
		includeDisabledToggleLabel.setAttr('for', 'include-disabled-switch');

		// Toggle for option to use prettier
		const enablePrettierContainer: HTMLDivElement = formContainer.createDiv('export-form-item enable-prettier-toggle');
		const enablePrettierToggleSwitch: HTMLInputElement = enablePrettierContainer.createEl(
			'input',
			{
				attr: {
					type: 'checkbox',
					id: 'enable-prettier-switch'
				}
			}
		);
		enablePrettierToggleSwitch.checked = this.plugin.settings.exportPrettierFormat;
		// Save export settings when changed
		enablePrettierToggleSwitch.addEventListener('change', async () => {
			this.plugin.settings.exportPrettierFormat = enablePrettierToggleSwitch.checked;
			await this.plugin.saveSettings();
		});
		const enablePrettierToggleLabel: HTMLLabelElement = enablePrettierContainer.createEl(
			'label',
			{
				text: 'Format CSS with Prettier formatter'
			}
		);
		enablePrettierToggleLabel.setAttr('for', 'enable-prettier-switch');

		// Save export settings when changed
		nameInput.addEventListener('change', () => {
			this.plugin.settings.exportThemeName = nameInput.value;
			this.plugin.saveSettings();
		});
		authorInput.addEventListener('change', () => {
			this.plugin.settings.exportThemeAuthor = authorInput.value;
			this.plugin.saveSettings();
		});
		urlInput.addEventListener('change', () => {
			this.plugin.settings.exportThemeURL = urlInput.value;
			this.plugin.saveSettings();
		});

		// Export buttons
		const buttonContainer: HTMLDivElement = content.createDiv('button-container');

		// Export CSS button
		const exportCSSButtons = buttonContainer.createDiv('export-css-buttons');
		exportCSSButtons.createSpan(
			{
				text: 'CSS: '
			}
		);
		const exportCSSButton: HTMLButtonElement = exportCSSButtons.createEl(
			'button',
			{
				attr: {
					'aria-label': 'Export CSS',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		setIcon(exportCSSButton, 'download');
		exportCSSButton.addEventListener('click', async () => {
			this.plugin.themeManager.exportThemeCSS();

		});
		// Copy CSS button
		const copyCSSButton: HTMLButtonElement = exportCSSButtons.createEl(
			'button',
			{
				cls: 'copy-css-button',
				attr: {
					'aria-label': 'Copy CSS to clipboard',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		setIcon(copyCSSButton, 'copy');
		copyCSSButton.addEventListener('click', () => {
			this.plugin.themeManager.copyThemeToClipboard();
		});
		// Export manifest button
		const exportManifestButtons = buttonContainer.createDiv('export-manifest-buttons');
		exportManifestButtons.createSpan(
			{
				text: 'Manifest: '
			}
		);
		const exportManifestButton: HTMLButtonElement = exportManifestButtons.createEl(
			'button',
			{
				attr: {
					'aria-label': 'Export manifest JSON',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		setIcon(exportManifestButton, 'download');
		exportManifestButton.addEventListener('click', async () => {
			this.plugin.themeManager.exportThemeManifest();

		});
		// Copy manifest button
		const copyManifestButton: HTMLButtonElement = exportManifestButtons.createEl(
			'button',
			{
				cls: 'copy-manifest-button',
				attr: {
					'aria-label': 'Copy manifest JSON to clipboard',
					'data-tooltip-position': 'top',
					tabindex: 0
				}
			}
		);
		setIcon(copyManifestButton, 'copy');
		copyManifestButton.addEventListener('click', () => {
			this.plugin.themeManager.copyManifestToClipboard();
		});

	}

	// debounce applyCustomTheme and showNotice
	debounceUpdate = debounce(
		() => {
			if (this.plugin.settings.themeEnabled) {
				this.plugin.themeManager.applyCustomTheme();
			}
			showNotice('Variable updated successfully', 1500, 'success');
		},
		500,
		true
	);

	async onClose(): Promise<void> {
		// Clean up any active element selection
		this.elementSelectorManager.stopElementSelection();
		this.cssEditorManager.clearAppliedChanges();
	}

	// Scroll element to the top of view
	scrollToDiv(target: HTMLElement) {
		if (target) {
			const container = this.containerEl;
			if (container && target) {
				const top = (target as HTMLElement).offsetTop - 10;
				(container as HTMLElement).scrollTo({
					top: top,
					behavior: "smooth"
				});
			}
		}
	}
}