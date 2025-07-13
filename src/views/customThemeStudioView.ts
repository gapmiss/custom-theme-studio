import { ItemView, WorkspaceLeaf, setIcon, Workspace, ColorComponent, Scope } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { type cssVariable, CSSVariableManager, allCategories, cssCategory, cssVariableDefaults } from '../managers/cssVariabManager';
import { ElementSelectorManager } from '../managers/elementSelectorManager';
import { CSSEditorManager } from '../managers/cssEditorManager';
import { ICodeEditorConfig } from '../interfaces/types';
import { confirm } from '../modals/confirmModal';
import { CSSVariable, CustomThemeStudioSettings, DEFAULT_SETTINGS } from '../settings';
import { copyStringToClipboard, getCurrentTheme } from '../utils';
import { FontImportModal } from "../modals/fontImportModal";

export const VIEW_TYPE_CTS = 'cts-view';

export class CustomThemeStudioView extends ItemView {

	plugin: CustomThemeStudioPlugin;
	settings: CustomThemeStudioSettings;
	cssVariableManager: CSSVariableManager;
	elementSelectorManager: ElementSelectorManager;
	cssEditorManager: CSSEditorManager;
	workspace: Workspace;
	variableSearch: string;
	elementSearch: string;
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
		this.elementSearch = '';
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
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('cts-view');

		// Render main sections
		this.renderHeader();
		this.renderCSSVariables();
		this.renderCustomElements();
		this.renderExportSection();

		// Make filters <a> tags act as buttons for "Enter" key and "Spacebar"
		containerEl.addEventListener('keydown', function (e) {
			const target: EventTarget | null = e.target;
			// Check if the target is an 'A' tag with role="button"
			if (target && (target as HTMLElement).getAttribute('role') === 'button' && (target as HTMLElement).tagName === 'A') {
				const key: string | number = e.key !== undefined ? e.key : e.keyCode;
				const isEnter: boolean = key === 'Enter' || key === 13;
				const isSpace: boolean = key === ' ' || key === 'Spacebar' || key === 32;
				if (isEnter || isSpace) {
					e.preventDefault(); // Prevent scrolling on space
					(target as HTMLElement).click();
				}
			}
		});

		// Keymap scope
		this.registerDomEvent(
			(this.cssEditorManager.editor as unknown as HTMLElement),
			"focus",
			() => {
				this.app.keymap.pushScope(this.editorScope);
			},
			true
		);
		this.registerDomEvent(
			(this.cssEditorManager.editor as unknown as HTMLElement),
			"blur",
			() => {
				this.app.keymap.popScope(this.editorScope);
			},
			true
		);

	}

	// Render header section
	private renderHeader(): void {
		const headerEl: HTMLDivElement = this.containerEl.createDiv('theme-studio-header');
		headerEl.createEl('h3', { text: 'Custom Theme Studio' });

		// Theme enabled toggle
		const toggleContainer: HTMLDivElement = headerEl.createDiv('theme-toggle-container');
		const toggleLabel: HTMLLabelElement = toggleContainer.createEl('label', { text: 'Theme enabled: ' });
		toggleLabel.setAttr('for', 'theme-toggle-switch');
		const toggleSwitch: HTMLInputElement = toggleContainer.createEl('input', {
			attr: {
				type: 'checkbox',
				id: 'theme-toggle-switch'
			}
		});
		toggleSwitch.checked = this.plugin.settings.themeEnabled;
		toggleSwitch.addEventListener('change', async () => {
			this.plugin.themeManager.toggleCustomTheme();
		});

		// Light/dark theme toggle
		const toggleThemeWrapper = toggleContainer.createDiv({ cls: 'toggle-theme-wrapper' });
		const toggleThemeButton = toggleThemeWrapper.createEl('button', {
			cls: 'toggle-theme-mode clickable-icon'
		});
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
		const section: HTMLDivElement = this.containerEl.createDiv('theme-section');

		// Section header
		const header: HTMLDivElement = section.createDiv('collapsible');
		const headerTitle: HTMLDivElement = header.createDiv('collapsible-header');
		headerTitle.createSpan({ text: 'CSS variables' });

		// Section header toggle button
		const toggleIcon: HTMLButtonElement = headerTitle.createEl('button', {
			attr: {
				'class': 'collapse-icon clickable-icon',
				'tabindex': '0',
				'aria-label': 'Expand section',
				'data-tooltip-position': 'top'
			}
		});

		// Section collapsible content
		const content: HTMLDivElement = header.createDiv('collapsible-content');

		// Check saved toggle state
		if (this.plugin.settings.collapsedCSSVariables === true) {
			content.addClass('collapsible-content-show');
			content.removeClass('collapsible-content-hide');
			setIcon(toggleIcon, 'chevron-down');
			toggleIcon.setAttr('aria-label', 'Collapse section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
		} else {
			content.addClass('collapsible-content-hide');
			content.removeClass('collapsible-content-show');
			setIcon(toggleIcon, 'chevron-right');
			toggleIcon.setAttr('aria-label', 'Expand section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
		}

		// Make header title clickable to toggle visibility
		headerTitle.addEventListener('click', () => {
			if (content.hasClass('collapsible-content-hide')) {
				content.addClass('collapsible-content-show');
				content.removeClass('collapsible-content-hide');
				setIcon(toggleIcon, 'chevron-down');
				toggleIcon.setAttr('aria-label', 'Collapse section');
				toggleIcon.setAttr('data-tooltip-position', 'top');
				this.plugin.settings.collapsedCSSVariables = true;
				this.plugin.saveSettings();
			} else {
				content.addClass('collapsible-content-hide');
				content.removeClass('collapsible-content-show');
				setIcon(toggleIcon, 'chevron-right');
				toggleIcon.setAttr('aria-label', 'Expand section');
				toggleIcon.setAttr('data-tooltip-position', 'top');
				this.plugin.settings.collapsedCSSVariables = false;
				this.plugin.saveSettings();
			}
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
						'data-tag-filter': tag,
						'tabindex': '0',
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
							let tagButton: Element | null = filterTags.querySelector(`[data-tag-filter="${tag}"]`);
							tagButton!.removeClass('tag-filter-active');
						});
						(ev.currentTarget as HTMLElement).addClass('tag-filter-active');
						let dataFilterTags: NodeListOf<Element> = this.containerEl.querySelectorAll('[data-filter-tag]');
						dataFilterTags.forEach((elt: HTMLElement) => {
							let filter: string | null = elt.getAttr('data-filter-tag');

							if (this.activeTag === 'all') {
								if (tag === 'all') {
									elt.addClass('variable-category-show');
									elt.removeClass('variable-category-hide');
								} else {
									if (filter !== filterTag) {
										elt.addClass('variable-category-hide');
										elt.removeClass('variable-category-show');
									} else {
										elt.addClass('variable-category-show');
										elt.removeClass('variable-category-hide');
									}
								}
							} else {
								if (filter !== filterTag) {
									elt.addClass('variable-category-hide');
									elt.removeClass('variable-category-show');
								} else {
									elt.addClass('variable-category-show');
									elt.removeClass('variable-category-hide');
								}
							}
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
									if (children[i].hasClass('variable-item-show')) {
										hasVisibleChildren = true;
										continue;
									}
								}
								// Hide/show
								if (hasVisibleChildren && ((filterTag === dataVarTag) || filterTag === 'all')) {
									el?.addClass('variable-list-show');
									el?.removeClass('variable-list-hide');
									el?.parentElement!.addClass('variable-category-show');
									el?.parentElement!.removeClass('variable-category-hide');
								} else {
									el?.addClass('variable-list-hide');
									el?.removeClass('variable-list-show');
									el?.parentElement!.addClass('variable-category-hide');
									el?.parentElement!.removeClass('variable-category-show');
								}
								// Toggle icon
								let variableListicon: HTMLElement | null = (el.previousSibling as HTMLElement)!.querySelector('.collapse-icon.clickable-icon');
								setIcon(variableListicon!, 'chevron-down')
								variableListicon?.setAttr('aria-label', 'Collapse category');
								variableListicon?.setAttr('data-tooltip-position', 'top');
							});
						}
					});
				}
			)
		});

		// Variables search
		const searchContainer: HTMLDivElement = content.createDiv('search-container');
		const clearInputContainer: HTMLDivElement = searchContainer.createDiv('clear-search-input');

		const searchInput: HTMLInputElement = clearInputContainer.createEl('input', {
			attr: {
				type: 'text',
				placeholder: 'Search variables…',
				class: 'search-input'
			}
		});

		// Search on input event
		searchInput.addEventListener('input', (e) => {
			const searchTerm: string = (e.target as HTMLInputElement).value.trim();
			let activeTagFilter: string | null | undefined = this.containerEl.querySelector('.tag-filter-active')?.getAttr('data-tag-filter');

			this.variableSearch = searchTerm;
			this.filterVariables(searchTerm);

			const variableListEls: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-list');
			if (this.variableSearch === '') {
				variableListEls.forEach((el: HTMLElement) => {
					el.addClass('variable-list-hide');
					el.removeClass('variable-list-show');
					let dataVarTag: string | null | undefined = el.getAttr('data-var-tag');
					let variableListicon: HTMLElement | null = (el.previousSibling as HTMLElement)!.querySelector('.collapse-icon.clickable-icon');
					if (activeTagFilter === 'all') {
						el?.addClass('variable-list-hide');
						el?.removeClass('variable-list-show');
						el?.parentElement!.addClass('variable-category-show');
						el?.parentElement!.removeClass('variable-category-hide');
						setIcon(variableListicon!, 'chevron-right')
						variableListicon?.setAttr('aria-label', 'Expand category');
						variableListicon?.setAttr('data-tooltip-position', 'top');
					} else {
						if (dataVarTag === activeTagFilter) {
							el?.addClass('variable-list-hide');
							el?.removeClass('variable-list-show');
							el?.parentElement!.addClass('variable-category-show');
							el?.parentElement!.removeClass('variable-category-hide');
							setIcon(variableListicon!, 'chevron-right')
							variableListicon?.setAttr('aria-label', 'Expand category');
							variableListicon?.setAttr('data-tooltip-position', 'top');
						} else {
							setIcon(variableListicon!, 'chevron-right')
							variableListicon?.setAttr('aria-label', 'Expand category');
							variableListicon?.setAttr('data-tooltip-position', 'top');
						}
					}
				});
			} else {
				variableListEls.forEach((el: HTMLElement) => {
					let hasVisibleChildren: boolean = false;
					let children: HTMLCollection = el.children;
					for (var i = 0; i < children.length; i++) {
						if (children[i].hasClass('variable-item-show')) {
							hasVisibleChildren = true;
							continue;
						}
					}

					let dataVarTag: string | null | undefined = el.getAttr('data-var-tag');
					let variableListicon: HTMLElement | null = (el.previousSibling as HTMLElement)!.querySelector('.collapse-icon.clickable-icon');
					if (activeTagFilter === 'all') {
						if (hasVisibleChildren) {
							el?.addClass('variable-list-show');
							el?.removeClass('variable-list-hide');
							el?.parentElement!.addClass('variable-category-show');
							el?.parentElement!.removeClass('variable-category-hide');
							setIcon(variableListicon!, 'chevron-down')
							variableListicon?.setAttr('aria-label', 'Collapse category');
							variableListicon?.setAttr('data-tooltip-position', 'top');
						} else {
							el?.addClass('variable-list-hide');
							el?.removeClass('variable-list-show');
							el?.parentElement!.addClass('variable-category-hide');
							el?.parentElement!.removeClass('variable-category-show');
							setIcon(variableListicon!, 'chevron-right')
							variableListicon?.setAttr('aria-label', 'Expand category');
							variableListicon?.setAttr('data-tooltip-position', 'top');
						}
					} else {
						if (dataVarTag === activeTagFilter) {
							if (hasVisibleChildren) {
								el?.addClass('variable-list-show');
								el?.removeClass('variable-list-hide');
								el?.parentElement!.addClass('variable-category-show');
								el?.parentElement!.removeClass('variable-category-hide');
								setIcon(variableListicon!, 'chevron-down')
								variableListicon?.setAttr('aria-label', 'Collapse category');
								variableListicon?.setAttr('data-tooltip-position', 'top');
							} else {
								el?.addClass('variable-list-hide');
								el?.removeClass('variable-list-show');
								el?.parentElement!.addClass('variable-category-hide');
								el?.parentElement!.removeClass('variable-category-show');
								setIcon(variableListicon!, 'chevron-right')
								variableListicon?.setAttr('aria-label', 'Expand category');
								variableListicon?.setAttr('data-tooltip-position', 'top');
							}
						} else {
							setIcon(variableListicon!, 'chevron-right')
							variableListicon?.setAttr('aria-label', 'Expand category');
							variableListicon?.setAttr('data-tooltip-position', 'top');
						}
					}

				});
			}
			// Clear search
			if ((e.currentTarget! as HTMLInputElement).value && !searchInput.classList.contains('clear-search-input--touched')) {
				searchInput.classList.add('clear-search-input--touched')
			} else if (!(e.currentTarget! as HTMLInputElement).value && searchInput.classList.contains('clear-search-input--touched')) {
				searchInput.classList.remove('clear-search-input--touched')
			}

		});

		// Clear search button
		const clearSearchButton: HTMLButtonElement = clearInputContainer.createEl('button', {
			attr: {
				class: 'clear-search-input-button',
				'aria-label': 'Clear search',
				'data-tooltip-position': 'top'
			}
		});
		clearSearchButton.addEventListener('click', (evt) => {
			searchInput.value = '';
			searchInput.focus();
			searchInput.trigger('input');
			searchInput.classList.remove('clear-search-input--touched');
			const variableListEls: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-list');
			variableListEls.forEach((elt: HTMLElement) => {
				elt.addClass('variable-list-hide');
				elt.removeClass('variable-list-show');
				let variableListicon: HTMLElement | null = (elt.previousSibling as HTMLElement)!.querySelector('.collapse-icon.clickable-icon');
				setIcon(variableListicon!, 'chevron-right')
				variableListicon?.setAttr('aria-label', 'Expand category');
				variableListicon?.setAttr('data-tooltip-position', 'top');
			});
		})

		// Render all categories
		allCategories.forEach((category: cssCategory) => {
			const categoryEl: HTMLDivElement = content.createDiv({
				cls: 'variable-category',
				attr: {
					id: 'variable-category-' + category.category,
					'data-filter-tag': category.tag
				}
			});

			const header: HTMLDivElement = categoryEl.createDiv('var-cat');
			const catTitle: HTMLDivElement = header.createDiv('collapsible-header');
			catTitle.createSpan({ text: category.title });
			const catToggleIcon: HTMLButtonElement = catTitle.createEl('button', {
				attr: {
					'class': 'collapse-icon clickable-icon',
					'tabindex': '0',
					'aria-label': 'Expand category',
					'data-tooltip-position': 'top'
				}
			});
			setIcon(catToggleIcon, 'chevron-right');

			// Variable list
			const variableListEl: HTMLDivElement = categoryEl.createDiv({
				cls: 'variable-list',
				attr: {
					'data-var-category': category.category,
					'data-var-tag': category.tag,
				}
			});
			variableListEl.addClass('variable-list-hide');

			// Category help hints
			if (category.help) {
				const variableListHelp = variableListEl.createDiv({
					cls: 'variable-category-help-container',
				});
				const variableListIcon = variableListHelp.createSpan({
					cls: 'variable-category-help-icon',
				});
				setIcon(variableListIcon, 'info')
				variableListHelp.createEl('span', {
					cls: 'variable-category-help',
					text: category.help,
				});
			}

			// Make header title clickable to toggle visibility
			header.addEventListener('click', () => {
				if (variableListEl.hasClass('variable-list-hide')) {
					variableListEl.addClass('variable-list-show');
					variableListEl.removeClass('variable-list-hide');
					setIcon(catToggleIcon, 'chevron-down');
					catToggleIcon.setAttr('aria-label', 'Collapse category');
					catToggleIcon.setAttr('data-tooltip-position', 'top');
				} else {
					variableListEl.addClass('variable-list-hide');
					variableListEl.removeClass('variable-list-show');
					setIcon(catToggleIcon, 'chevron-right');
					catToggleIcon.setAttr('aria-label', 'Expand category');
					catToggleIcon.setAttr('data-tooltip-position', 'top');
				}
			});

			// List variables
			const items: cssVariable[] = cssVariableDefaults.filter(cat => cat.cat === category.category);
			if (items.length) {
				items.forEach((item) => {
					this.createVariableItemInput(variableListEl, { name: item.variable, value: item.default }, category.category);
				});
			}
		});

	}

	// Create variable input elements
	private createVariableItemInput(container: HTMLElement, variable: { name: string; value: string; }, category: string): void {
		const item = container.createDiv({
			cls: 'variable-item',
			attr: {
				'data-var-name': variable.name,
				'data-var-value': variable.value,
			}
		});

		// Get current value
		let currentVarValue: string = '';
		const customVars: CSSVariable[] = this.plugin.settings.customVariables;
		const existingVariable: CSSVariable | undefined = customVars.find(v => v.variable === variable.name && v.parent === category);
		if (existingVariable) {
			currentVarValue = existingVariable.value;
		}

		// Variable name
		const nameEl: HTMLDivElement = item.createDiv('variable-name');
		nameEl.createSpan({
			text: variable.name + ': ', attr: {
				'aria-label': 'Copy "var(' + variable.name + ')" to clipboard',
				'data-tooltip-position': 'top'
			}
		});
		nameEl.addEventListener('click', () => {
			copyStringToClipboard('var(' + variable.name + ')', 'var(' + variable.name + ')');
		});

		// Variable value input
		const inputWrapper: HTMLDivElement = item.createDiv('variable-input-wrapper');
		const clearInputContainer: HTMLDivElement = inputWrapper.createDiv('clear-variable-input');
		const valueInput: HTMLInputElement = clearInputContainer.createEl('input', {
			cls: 'variable-value-input',
			attr: {
				type: 'text',
				placeholder: variable.value as string,
				value: currentVarValue
			}
		});

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
							valueInput.trigger('input');
						}
					}).then(() => {
						colorPickerEl.setAttr('aria-label', 'Show color picker');
						colorPickerEl.setAttr('data-tooltip-position', 'top');
					});

				valueInput.addEventListener('change', (e) => {
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
		const clearInputButton: HTMLButtonElement = clearInputContainer.createEl('button', {
			attr: {
				class: 'clear-variable-input-button',
				'aria-label': 'Clear input',
				'data-tooltip-position': 'top',
				'tabindex': '0'
			}
		});
		clearInputButton.addEventListener('click', (evt) => {
			valueInput.value = '';
			valueInput.focus();
			valueInput.trigger('input');
			valueInput.trigger('change');
			valueInput.classList.remove('clear-variable-input--touched');
		})

		// Listen for input changes and update theme
		// TODO: how do deal with auto-apply changes with variables, maybe instead of on input save on change?
		// or give option in settings
		valueInput.addEventListener(this.plugin.settings.variableInputListener, (e) => {
			const newValue = (e.target as HTMLInputElement).value;
			this.cssVariableManager.updateVariable(variable.name as string, newValue, category);
			if (this.plugin.settings.themeEnabled) {
				this.plugin.themeManager.applyCustomTheme();
			}
			if ((e.currentTarget! as HTMLInputElement).value && !valueInput.classList.contains('clear-variable-input--touched')) {
				valueInput.classList.add('clear-variable-input--touched')
			} else if (!(e.currentTarget! as HTMLInputElement).value && valueInput.classList.contains('clear-variable-input--touched')) {
				valueInput.classList.remove('clear-variable-input--touched')
			}
		});

		// Copy to clipboard button
		const copyDefault = inputWrapper.createEl('button',
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

	// Filer variables
	private async filterVariables(searchTerm: string): Promise<void> {
		// Filter all variables
		const varItems: NodeListOf<Element> = this.containerEl.querySelectorAll('.variable-item');
		varItems.forEach((item: Element) => {
			const varName: string = item.getAttribute('data-var-name') || '';
			const varDefaultValue: string = item.getAttribute('data-var-value') || '';
			const varValue: string = (item.querySelector('.variable-value-input') as HTMLInputElement).value || '';
			if (searchTerm !== '') {
				// Show matches or hide non-matches
				if (
					varName.includes(searchTerm) || 
					varDefaultValue.includes(searchTerm) || 
					varValue.includes(searchTerm)
				) {
					item.addClass('variable-item-show');
					item.removeClass('variable-item-hide');
				} else {
					item.addClass('variable-item-hide');
					item.removeClass('variable-item-show');
				}
			} else {
				// Empty search - show all variables
				item.addClass('variable-item-show');
				item.removeClass('variable-item-hide');
			}
		});
	}

	// Render custom elements section
	private renderCustomElements(): void {
		const section: HTMLDivElement = this.containerEl.createDiv('element-section')
		const header: HTMLDivElement = section.createDiv('collapsible');
		const headerTitle: HTMLDivElement = header.createDiv('collapsible-header');
		headerTitle.createSpan({ text: 'Custom elements' });
		const toggleIcon: HTMLButtonElement = headerTitle.createEl('button', {
			attr: {
				'class': 'collapse-icon clickable-icon',
				'tabindex': '0',
				'aria-label': 'Expand section',
				'data-tooltip-position': 'top'
			}
		});

		const content: HTMLDivElement = header.createDiv('collapsible-content');
		
		// Check saved toggle state
		if (this.plugin.settings.collapsedCustomElements === true) {
			content.addClass('collapsible-content-show');
			content.removeClass('collapsible-content-hide');
			setIcon(toggleIcon, 'chevron-down');
			toggleIcon.setAttr('aria-label', 'Collapse section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
		} else {
			content.addClass('collapsible-content-hide');
			content.removeClass('collapsible-content-show');
			setIcon(toggleIcon, 'chevron-right');
			toggleIcon.setAttr('aria-label', 'Expand section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
		}

		// Make header title clickable to toggle visibility
		headerTitle.addEventListener('click', () => {
			if (content.hasClass('collapsible-content-hide')) {
				content.addClass('collapsible-content-show');
				content.removeClass('collapsible-content-hide');
				setIcon(toggleIcon, 'chevron-down');
				toggleIcon.setAttr('aria-label', 'Collapse section');
				toggleIcon.setAttr('data-tooltip-position', 'top');
				this.plugin.settings.collapsedCustomElements = true;
				this.plugin.saveSettings();
			} else {
				content.addClass('collapsible-content-hide');
				content.removeClass('collapsible-content-show');
				setIcon(toggleIcon, 'chevron-right');
				toggleIcon.setAttr('aria-label', 'Expand section');
				toggleIcon.setAttr('data-tooltip-position', 'top');
				this.plugin.settings.collapsedCustomElements = false;
				this.plugin.saveSettings();
			}
		});

		// Selector button container
		const selectElementButtonContainer: HTMLDivElement = content.createDiv('selector-button-container');

		// "Select element" button
		const selectElementButton: HTMLButtonElement = selectElementButtonContainer.createEl('button', {
			text: 'Select element',
			cls: 'select-element-button'
		});
		selectElementButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection: Element | null = this.containerEl.querySelector('.css-editor-section');
			const isEditorVisible: boolean | null = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved element form open. Creating a new element will discard your changes. Continue?', this.plugin.app)) {
					return;
				}
			}

			// Remove any existing inline editors
			const inlineEditors: NodeListOf<Element> = document.querySelectorAll('.inline-element-editor');
			inlineEditors.forEach(editor => editor.remove());

			// Show the editor section and reset it
			this.cssEditorManager.resetEditor();
			this.cssEditorManager.showEditorSection(false);

			this.elementSelectorManager.startElementSelection();
		});

		// "Add element" button
		const addElementButton = selectElementButtonContainer.createEl('button', {
			text: 'New element',
			cls: 'add-element-button',
		});
		addElementButton.addEventListener('click', async () => {
			// Check if editor section is already visible
			const editorSection: Element | null = this.containerEl.querySelector('.css-editor-section');
			const isEditorVisible: boolean | null = editorSection && getComputedStyle(editorSection).display !== 'none';

			if (isEditorVisible && this.plugin.settings.showConfirmation) {
				if (!await confirm('You have an unsaved element form open. Creating a new element will discard your changes. Continue?', this.plugin.app)) {
					return;
				}
			}

			// Remove any existing inline editors
			const inlineEditors: NodeListOf<Element> = document.querySelectorAll('.inline-element-editor');
			inlineEditors.forEach(editor => editor.remove());

			// Show the editor section and reset it
			this.cssEditorManager.resetEditor();
			this.cssEditorManager.showEditorSection(true);
			setTimeout(async () => {
				this.cssEditorManager.nameInputEl!.focus();
			}, 25);

			// Ensure the new form appears below the buttons
			const buttonContainer: Element | null = this.containerEl.querySelector('.selector-button-container');
			if (buttonContainer && editorSection) {
				buttonContainer.after(editorSection);
			}
		});

		// @font-face rule Modal
		if (this.plugin.settings.enableFontImport) {
			const addFontFaceButton = selectElementButtonContainer.createEl('button', {
				text: 'Import font',
				cls: 'add-font-face-button'
			});
			addFontFaceButton.addEventListener('click', async () => {
				new FontImportModal(this.app, this.plugin).open();
			});
		}

		// CSS Editor section - initially hidden when not adding a new element
		this.cssEditorManager.createEditorSection(content);
		this.cssEditorManager.showEditorSection(false);

		// Custom custom elements search
		const searchContainer: HTMLDivElement = content.createDiv('search-elements-container');
		const clearInputContainer: HTMLDivElement = searchContainer.createDiv('clear-search-elements-input');
		const searchInput: HTMLInputElement = clearInputContainer.createEl('input', {
			attr: {
				type: 'text',
				placeholder: 'Search custom elements…',
				class: 'search-elements-input'
			}
		});
		searchInput.addEventListener('input', async (e) => {
			const searchTerm: string = (e.target as HTMLInputElement).value.trim();
			this.elementSearch = searchTerm;

			await this.filterCustomElements(searchTerm);

			if ((e.currentTarget! as HTMLInputElement).value && !searchInput.classList.contains('clear-search-elements-input--touched')) {
				searchInput.classList.add('clear-search-elements-input--touched')
			} else if (!(e.currentTarget! as HTMLInputElement).value && searchInput.classList.contains('clear-search-elements-input--touched')) {
				searchInput.classList.remove('clear-search-elements-input--touched')
			}
		});

		// Clear search button
		const clearSearchButton: HTMLButtonElement = clearInputContainer.createEl('button', {
			attr: {
				class: 'clear-search-elements-input-button',
				'aria-label': 'Clear search',
				'data-tooltip-position': 'top'
			}
		});
		clearSearchButton.addEventListener('click', (evt) => {
			searchInput.value = '';
			searchInput.focus();
			searchInput.classList.remove('clear-search-elements-input--touched');
			this.elementSearch = '';
			const elementListEls: NodeListOf<Element> = this.containerEl.querySelectorAll('.element-item');
			elementListEls.forEach((elt: HTMLElement) => {
				elt.addClass('element-item-show');
				elt.removeClass('element-item-hide');
			});
		})

		// Element list
		const elementListContainer = content.createDiv('element-list-container');
		const elementList = elementListContainer.createDiv('element-list');

		// Populate with saved elements
		this.plugin.settings.customElements.forEach(element => {
			this.cssEditorManager.createElementItem(elementList, element);
		});

	}

	// Filter custom elements
	async filterCustomElements(query: string) {
		// Filter all custom elements
		this.plugin.settings.customElements.forEach((el) => {
			if (
				el.name?.includes(query) ||
				el.selector?.includes(query) ||
				el.css?.includes(query)
			) {
				this.containerEl.querySelector('[data-cts-uuid="' + el.uuid + '"]')?.addClass('element-item-show');
				this.containerEl.querySelector('[data-cts-uuid="' + el.uuid + '"]')?.removeClass('element-item-hide');
			} else {
				this.containerEl.querySelector('[data-cts-uuid="' + el.uuid + '"]')?.addClass('element-item-hide');
				this.containerEl.querySelector('[data-cts-uuid="' + el.uuid + '"]')?.removeClass('element-item-show');
			}
		});
	}

	// Render export section
	private renderExportSection(): void {
		const section: HTMLDivElement = this.containerEl.createDiv('export-section');
		const header: HTMLDivElement = section.createDiv('collapsible');
		const headerTitle: HTMLDivElement = header.createDiv('collapsible-header');
		headerTitle.createSpan({ text: 'Export theme' });

		const toggleIcon: HTMLButtonElement = headerTitle.createEl('button', {
			attr: {
				'class': 'collapse-icon clickable-icon',
				'tabindex': '0',
				'aria-label': 'Expand section',
				'data-tooltip-position': 'top'
			}
		});

		const content: HTMLDivElement = header.createDiv('collapsible-content');
		// Check saved toggle state
		if (this.plugin.settings.collapsedExportTheme === true) {
			content.addClass('collapsible-content-show');
			content.removeClass('collapsible-content-hide');
			setIcon(toggleIcon, 'chevron-down');
			toggleIcon.setAttr('aria-label', 'Collapse section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
		} else {
			content.addClass('collapsible-content-hide');
			content.removeClass('collapsible-content-show');
			setIcon(toggleIcon, 'chevron-right');
			toggleIcon.setAttr('aria-label', 'Expand section');
			toggleIcon.setAttr('data-tooltip-position', 'top');
		}

		// Make header title clickable to toggle visibility
		headerTitle.addEventListener('click', () => {
			if (content.hasClass('collapsible-content-hide')) {
				content.addClass('collapsible-content-show');
				content.removeClass('collapsible-content-hide');
				setIcon(toggleIcon, 'chevron-down');
				toggleIcon.setAttr('aria-label', 'Collapse section');
				toggleIcon.setAttr('data-tooltip-position', 'top');
				this.plugin.settings.collapsedExportTheme = true;
				this.plugin.saveSettings();
			} else {
				content.addClass('collapsible-content-hide');
				content.removeClass('collapsible-content-show');
				setIcon(toggleIcon, 'chevron-right');
				toggleIcon.setAttr('aria-label', 'Expand section');
				toggleIcon.setAttr('data-tooltip-position', 'top');
				this.plugin.settings.collapsedExportTheme = false;
				this.plugin.saveSettings();
			}
		});

		const description: HTMLDivElement = content.createDiv('export-description');
		description.createSpan({
			text: 'Export your custom variables and elements as CSS and manifest files to create a shareable theme.',
		});

		const formContainer: HTMLDivElement = content.createDiv('export-form');

		// Theme name input
		const nameContainer: HTMLDivElement = formContainer.createDiv('export-form-item');
		nameContainer.createSpan({ text: 'Theme Name:' });
		const nameInput: HTMLInputElement = nameContainer.createEl('input', {
			attr: {
				type: 'text',
				value: this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName,
				class: 'export-form-theme-name'
			}
		});

		// Theme author input
		const authorContainer: HTMLDivElement = formContainer.createDiv('export-form-item');
		authorContainer.createSpan({ text: 'Author:' });
		const authorInput: HTMLInputElement = authorContainer.createEl('input', {
			attr: {
				type: 'text',
				value: this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor,
				class: 'export-form-theme-author'
			}
		});

		// Theme author URL input
		const urlContainer: HTMLDivElement = formContainer.createDiv('export-form-item');
		urlContainer.createSpan({ text: 'URL:' });
		const urlInput: HTMLInputElement = urlContainer.createEl('input', {
			attr: {
				type: 'text',
				value: this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL,
				class: 'export-form-theme-url'
			}
		});

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

		const exportCSSButton: HTMLButtonElement = buttonContainer.createEl('button', {
			text: 'Export CSS'
		});
		exportCSSButton.addEventListener('click', async () => {
			this.plugin.themeManager.exportThemeCSS();

		});
		const copyCSSButton: HTMLButtonElement = buttonContainer.createEl('button', {
			cls: 'copy-css-button clickable-icon'
		});
		copyCSSButton.setAttr('aria-label', 'Copy CSS to clipboard');
		copyCSSButton.setAttr('data-tooltip-position', 'top');
		copyCSSButton.setAttr('tabindex', '0');
		setIcon(copyCSSButton, 'copy');
		copyCSSButton.addEventListener('click', () => {
			this.plugin.themeManager.copyThemeToClipboard();
		});

		const exportManifestButton: HTMLButtonElement = buttonContainer.createEl('button', {
			text: 'Export manifest'
		});
		exportManifestButton.addEventListener('click', async () => {
			this.plugin.themeManager.exportThemeManifest();

		});
		const copyManifestButton: HTMLButtonElement = buttonContainer.createEl('button', {
			cls: 'copy-css-button clickable-icon'
		});
		copyManifestButton.setAttr('aria-label', 'Copy JSON to clipboard');
		copyManifestButton.setAttr('data-tooltip-position', 'top');
		copyManifestButton.setAttr('tabindex', '0');
		setIcon(copyManifestButton, 'copy');
		copyManifestButton.addEventListener('click', () => {
			this.plugin.themeManager.copyManifestToClipboard();
		});

	}

	async onClose(): Promise<void> {
		// Clean up any active element selection
		this.elementSelectorManager.stopElementSelection();
		this.cssEditorManager.clearAppliedChanges();
	}

}