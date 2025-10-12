import { setIcon, ColorComponent, debounce } from 'obsidian';
import { SimpleDebouncer } from '../../utils/Debouncer';
import { UIComponent, ComponentContext } from './UIComponent';
import { createCollapsibleSection, createIconButton, createSearchInput } from '../../utils/uiHelpers';
import { type cssVariable, allCategories, cssCategory, cssVariableDefaults } from '../../managers/cssVariabManager';
import { CSSVariable } from '../../settings';
import { copyStringToClipboard, showNotice, Logger } from '../../utils';
import { AddVariableModal } from '../../modals/addVariableModal';
import { VariableItem, VariableData } from './ui/VariableItem';
import { EventManager, DOMEventManager } from '../../utils/EventManager';
import { Selectors } from '../../utils/DOMReferences';
import { UI_CONSTANTS, TIMEOUT_DELAYS } from '../../constants';

export class CSSVariablesSection extends UIComponent {
	public variableSearch: string = '';
	private activeTag: string | null = 'all';
	private debounceUpdate: SimpleDebouncer;
	private eventManager: EventManager;
	private domEventManager: DOMEventManager;
	private variableItems = new Map<string, VariableItem>();

	constructor(context: ComponentContext) {
		super(context);
		this.eventManager = new EventManager();
		// Load saved tag filter
		this.activeTag = this.plugin.settings.activeVariableTagFilter || 'all';
		this.setupDebounceUpdate();
		this.setupEventListeners();
	}

	private setupDebounceUpdate(): void {
		this.debounceUpdate = new SimpleDebouncer(
			() => {
				this.plugin.themeManager.applyIfEnabled();
				this.eventManager.emit('variable:updated', {
					name: 'bulk',
					value: 'updated',
					category: 'multiple'
				});
				showNotice('Variable updated successfully', 1500, 'success');
			},
			500,
			true
		);
	}

	private setupEventListeners(): void {
		// Set up event listeners after DOM is created
		this.eventManager.on('variable:updated', (data) => {
			Logger.debug('Variable updated:', data);
		});

		this.eventManager.on('variable:deleted', (data) => {
			this.handleVariableDeleted(data.uuid);
		});
	}

	render(): HTMLElement {
		const section = this.createSection('variables-section');

		const { content } = createCollapsibleSection(section, {
			title: 'CSS variables',
			expanded: this.plugin.settings.expandCSSVariables,
			onToggle: (expanded) => {
				this.plugin.settings.expandCSSVariables = expanded;
				this.eventManager.emit('section:toggled', {
					section: 'variables',
					expanded
				});
				this.saveSettings();
			}
		});

		// Initialize DOM event manager after section is created
		this.domEventManager = new DOMEventManager(section, this.eventManager);
		this.setupDOMEventDelegation();

		this.renderButtons(content);
		this.renderTagFilters(content);
		this.renderSearch(content);
		this.renderCategories(content);

		return section;
	}

	private setupDOMEventDelegation(): void {
		// Variable name click events are now handled directly by VariableItem components

		// Delegate tag filter clicks
		this.domEventManager.delegate('click', '.tag[data-tag-filter]', (event, target) => {
			const filterTag = target.getAttribute('data-tag-filter');
			if (filterTag) {
				this.handleTagFilterClick(filterTag, target);
			}
		});
	}

	private renderButtons(container: HTMLElement): void {
		const buttonContainer = container.createDiv('css-variables-button-container');

		createIconButton(buttonContainer, {
			icon: 'square-pen',
			label: 'Add CSS variable',
			classes: ['new-variable-button'],
			onClick: () => {
				new AddVariableModal(this.app, this.plugin).open();
			}
		});
	}

	private renderTagFilters(container: HTMLElement): void {
		const filterTags = container.createDiv('filter-tags');
		const tags = [
			'all', 'components', 'editor', 'foundations',
			'plugins', 'window', 'theme-dark', 'theme-light', 'CTS'
		];

		tags.forEach((tag) => {
			const isActive = tag.toLowerCase() === this.activeTag;
			const tagEl = filterTags.createEl('a', {
				text: tag,
				cls: 'tag tag-filter-' + tag + (isActive ? ' tag-filter-active' : ''),
				attr: {
					'data-tag-filter': tag.toLowerCase(),
					tabindex: '0',
					role: 'button',
					'aria-label': 'Show ' + tag + ' variables',
					'data-tooltip-position': 'top'
				}
			});

			tagEl.addEventListener('click', (ev) => {
				this.handleTagFilter(ev, tags, filterTags);
			});
		});
	}

	private handleTagFilter(event: MouseEvent, tags: string[], filterContainer: HTMLElement): void {
		const filterTag = (event.currentTarget as HTMLElement).getAttr('data-tag-filter');
		this.activeTag = filterTag;

		// Save active tag filter to settings
		this.plugin.settings.activeVariableTagFilter = filterTag!;
		this.saveSettings();

		tags.forEach((tag) => {
			const tagButton = filterContainer.querySelector(`[data-tag-filter="${tag.toLowerCase()}"]`);
			tagButton?.removeClass('tag-filter-active');
		});

		(event.currentTarget as HTMLElement).addClass('tag-filter-active');

		const dataFilterTags = this.container.querySelectorAll('[data-filter-tag]');
		dataFilterTags.forEach((element: HTMLElement) => {
			const filter = element.getAttr('data-filter-tag');
			const showCategory =
				(this.activeTag === 'all' && (filterTag === 'all' || filter === filterTag)) ||
				(this.activeTag !== 'all' && filter === filterTag);

			(element as HTMLElement).toggleClass('show', showCategory);
			(element as HTMLElement).toggleClass('hide', !showCategory);
		});

		if (this.variableSearch !== '') {
			this.updateVariableListVisibility();
		}
	}

	private renderSearch(container: HTMLElement): void {
		const searchContainer = container.querySelector('.search-container') as HTMLElement;

		const { searchInput } = createSearchInput(searchContainer || container, {
			placeholder: 'Search CSS variables…',
			onInput: (searchTerm) => {
				this.variableSearch = searchTerm;
				this.filterVariables(searchTerm);
				this.updateVariableListVisibility();
			},
			onClear: () => {
				this.variableSearch = '';
				this.resetVariableListVisibility();
			}
		});

		this.renderResultsCounter(searchContainer || container);
	}

	private renderResultsCounter(container: HTMLElement): void {
		const counter = container.createDiv('search-results-counter');

		this.eventManager.on('search:variable', ({ term, results }) => {
			if (term) {
				counter.textContent = `${results} variable${results !== 1 ? 's' : ''} found`;
				counter.addClass('active');
				counter.toggleClass('no-results', results === 0);
			} else {
				counter.textContent = '';
				counter.removeClass('active');
				counter.removeClass('no-results');
			}
		});
	}

	private renderCategories(container: HTMLElement): void {
		allCategories.forEach((category) => {
			this.renderCategory(container, category);
		});
	}

	private renderCategory(container: HTMLElement, category: cssCategory): void {
		const categoryEl = container.createDiv({
			cls: 'variable-category',
			attr: {
				id: 'variable-category-' + category.category,
				'data-filter-tag': category.tag
			}
		});

		// Apply saved tag filter visibility on initial render
		const showCategory = this.activeTag === 'all' || category.tag === this.activeTag;
		categoryEl.toggleClass('show', showCategory);
		categoryEl.toggleClass('hide', !showCategory);

		const { header, content: variableListEl } = this.createCategoryHeader(categoryEl, category);

		if (category.help) {
			this.addCategoryHelp(variableListEl, category.help);
		}

		this.renderCategoryVariables(variableListEl, category);
	}

	private createCategoryHeader(container: HTMLElement, category: cssCategory) {
		const header = container.createDiv('var-cat');
		const catTitle = header.createDiv('collapsible-header');
		catTitle.createSpan({ text: category.title.replace('+', ' ') });

		// Add item count badge
		const itemCount = this.getCategoryItemCount(category.category);
		catTitle.createSpan({
			cls: 'category-item-count',
			text: `${itemCount}`
		});

		const catToggleIcon = catTitle.createEl('button', {
			cls: 'collapse-icon clickable-icon',
			attr: {
				tabindex: '0',
				'aria-label': 'Expand category',
				'data-tooltip-position': 'top'
			}
		});
		setIcon(catToggleIcon, 'chevron-right');

		const variableListEl = container.createDiv({
			cls: 'variable-list',
			attr: {
				'data-var-category': category.category,
				'data-var-tag': category.tag
			}
		});
		variableListEl.addClass('hide');

		// Check if this category should be expanded based on saved settings
		const categoryId = 'variable-category-' + category.category;
		const shouldBeExpanded = this.plugin.settings.expandedVariableCategories.includes(categoryId);

		if (shouldBeExpanded) {
			variableListEl.removeClass('hide');
			variableListEl.addClass('show');
			setIcon(catToggleIcon, 'chevron-down');
			catToggleIcon.setAttr('aria-label', 'Collapse category');
		}

		header.addEventListener('click', () => {
			this.handleCategoryToggle(variableListEl, catToggleIcon, container);
		});

		return { header, content: variableListEl };
	}

	private addCategoryHelp(container: HTMLElement, help: DocumentFragment): void {
		const helpContainer = container.createDiv('variable-category-help-container');
		const helpIcon = helpContainer.createSpan('variable-category-help-icon');
		setIcon(helpIcon, 'info');
		const helpSpan = helpContainer.createSpan({
			cls: 'variable-category-help'
		});
		// Clone the DocumentFragment to prevent it from being emptied after first use
		helpSpan.appendChild(help.cloneNode(true));
	}

	private getCategoryItemCount(category: string): number {
		if (category === 'custom') {
			return this.plugin.settings.cssVariables.filter(v => v.parent === 'custom').length;
		} else {
			return cssVariableDefaults.filter(cat => cat.cat === category).length;
		}
	}

	private updateCategoryItemCount(category: string): void {
		const categoryEl = this.container.querySelector(`#variable-category-${category}`);
		if (categoryEl) {
			const countBadge = categoryEl.querySelector('.category-item-count');
			if (countBadge) {
				const newCount = this.getCategoryItemCount(category);
				countBadge.textContent = `${newCount}`;
			}
		}
	}

	private renderCategoryVariables(container: HTMLElement, category: cssCategory): void {
		if (category.category === 'custom') {
			this.renderCustomVariables(container, category.category);
		} else {
			this.renderDefaultVariables(container, category.category);
		}
	}

	private renderCustomVariables(container: HTMLElement, category: string): void {
		const items = this.plugin.settings.cssVariables
			.filter(v => v.parent === 'custom')
			.sort((a, b) => a.variable!.localeCompare(b.variable!));

		items.forEach((item) => {
			this.createVariableItemComponent(container, {
				uuid: item.uuid!,
				name: item.variable,
				value: item.value
			}, category, true);
		});
	}

	private renderDefaultVariables(container: HTMLElement, category: string): void {
		const items = cssVariableDefaults
			.filter(cat => cat.cat === category)
			.sort((a, b) => a.variable!.localeCompare(b.variable!));

		items.forEach((item) => {
			this.createVariableItemComponent(container, {
				name: item.variable,
				value: item.default,
				defaultValue: item.default
			}, category, false);
		});
	}

	/**
	 * Create a variable item using the new VariableItem component
	 */
	private createVariableItemComponent(
		container: HTMLElement,
		data: VariableData,
		category: string,
		isCustom: boolean
	): void {
		const variableItem = new VariableItem(container, {
			data,
			category,
			settings: this.plugin.settings,
			cssVariableManager: this.cssVariableManager,
			app: this.app,
			isCustom,
			onUpdate: (updatedData) => {
				this.eventManager.emit('variable:updated', {
					name: updatedData.name,
					value: updatedData.value,
					category
				});
			},
			onDelete: (uuid) => {
				this.handleVariableDelete(uuid);
			}
		});

		// Store reference for management
		const key = isCustom ? data.uuid! : `${category}:${data.name}`;
		this.variableItems.set(key, variableItem);
	}

	private handleVariableDelete(uuid: string): void {
		// Remove from settings
		this.plugin.settings.cssVariables = this.plugin.settings.cssVariables.filter(
			el => el.uuid !== uuid
		);

		// Update custom CSS
		let fullCSS = '';
		this.plugin.settings.cssRules.forEach(rule => {
			if (rule.enabled) {
				fullCSS += `/* ${rule.rule} */\n${rule.css}\n\n`;
			}
		});

		this.plugin.settings.customCSS = fullCSS;
		this.saveSettings();

		// Apply changes
		this.plugin.themeManager.applyIfEnabled();

		// Remove from local storage
		this.variableItems.delete(uuid);

		this.eventManager.emit('variable:deleted', {
			uuid,
			name: 'deleted'
		});

		// Update category count badge (always for custom category)
		this.updateCategoryItemCount('custom');

		// Update search counter if filtering is active
		if (this.variableSearch !== '') {
			this.filterVariables(this.variableSearch);
		}
	}

	private handleVariableDeleted(uuid: string): void {
		const variableItem = this.variableItems.get(uuid);
		if (variableItem) {
			variableItem.destroy();
			this.variableItems.delete(uuid);
		}
	}

	private handleTagFilterClick(filterTag: string, target: HTMLElement): void {
		this.activeTag = filterTag;

		// Update active tag UI using cached elements
		const filterContainer = target.closest('.filter-tags')!;
		const allTags = filterContainer.querySelectorAll('.tag[data-tag-filter]');
		allTags.forEach(tag => tag.removeClass('tag-filter-active'));
		target.addClass('tag-filter-active');

		// Use efficient filtering with VariableItem components
		this.filterVariablesByTag(filterTag);

		this.eventManager.emit('filter:tag', {
			tag: filterTag,
			count: this.getVisibleVariableCount()
		});
	}

	private filterVariablesByTag(filterTag: string): void {
		// Use DOM references for efficient filtering
		const categoryElements = this.getElements('[data-filter-tag]');

		categoryElements.forEach((element: HTMLElement) => {
			const filter = element.getAttr('data-filter-tag');
			const showCategory =
				(this.activeTag === 'all' && (filterTag === 'all' || filter === filterTag)) ||
				(this.activeTag !== 'all' && filter === filterTag);

			element.toggleClass('show', showCategory);
			element.toggleClass('hide', !showCategory);
		});

		if (this.variableSearch !== '') {
			this.updateVariableListVisibilityOptimized();
		}
	}

	private updateVariableListVisibilityOptimized(): void {
		// Use cached DOM references for better performance
		const variableListEls = this.getElements(Selectors.variablesList);

		variableListEls.forEach((el: HTMLElement) => {
			const hasVisibleChildren = this.hasVisibleVariableItems(el);
			const dataVarTag = el.getAttr('data-var-tag');
			const shouldExpand = (this.activeTag === 'all' || dataVarTag === this.activeTag) && hasVisibleChildren;

			this.toggleCategoryVisibility(el, shouldExpand);
		});
	}

	private hasVisibleVariableItems(container: HTMLElement): boolean {
		// Check VariableItem components for visibility instead of DOM queries
		const containerItems = Array.from(this.variableItems.values()).filter(item =>
			container.contains(item.getElement())
		);

		return containerItems.some(item => item.isVisible());
	}

	private toggleCategoryVisibility(el: HTMLElement, shouldExpand: boolean): void {
		el.toggleClass('show', shouldExpand);
		el.toggleClass('hide', !shouldExpand);
		el.parentElement?.toggleClass('show', shouldExpand);
		el.parentElement?.toggleClass('hide', !shouldExpand);

		// Update collapse icon efficiently
		const previousElement = el.previousSibling as HTMLElement;
		const variableListIcon = previousElement?.querySelector('.collapse-icon.clickable-icon') as HTMLElement;
		if (variableListIcon) {
			const iconName = shouldExpand ? 'chevron-down' : 'chevron-right';
			const ariaLabel = shouldExpand ? 'Collapse category' : 'Expand category';
			setIcon(variableListIcon, iconName);
			variableListIcon.setAttr('aria-label', ariaLabel);
			variableListIcon.setAttr('data-tooltip-position', 'top');
		}
	}

	private getVisibleVariableCount(): number {
		return Array.from(this.variableItems.values()).filter(item => item.isVisible()).length;
	}


	private createVariableValueInput(
		container: HTMLElement,
		variable: { name: string; value: string },
		category: string,
		currentValue: string
	): void {
		const inputWrapper = container.createDiv('variable-input-wrapper');
		const clearInputContainer = inputWrapper.createDiv('clear-variable-input');

		const valueInput = clearInputContainer.createEl('input', {
			cls: 'variable-value-input',
			attr: {
				type: 'text',
				placeholder: variable.value,
				value: currentValue
			}
		});

		if (currentValue) {
			valueInput.classList.add('clear-variable-input--touched');
		}

		this.addColorPicker(inputWrapper, valueInput, variable);
		this.addClearButton(clearInputContainer, valueInput);
		this.addInputListener(valueInput, variable, category);
		this.addCopyDefaultButton(inputWrapper, variable.value);
	}

	private addColorPicker(wrapper: HTMLElement, input: HTMLInputElement, variable: { name: string; value: string }): void {
		if (!this.plugin.settings.enableColorPicker || !variable.value.startsWith('#')) {
			return;
		}

		const colorPickerEl = wrapper.createDiv('variable-color-picker');
		const colorPicker = new ColorComponent(colorPickerEl)
			.setValue(variable.value ?? '#000000')
			.onChange((value) => {
				if (variable.value !== value) {
					input.value = value;
					input.classList.add('clear-variable-input--touched');
					input.focus();
					input.trigger(this.plugin.settings.variableInputListener);
				}
			}).then(() => {
				colorPickerEl.setAttr('aria-label', 'Show color picker');
				colorPickerEl.setAttr('data-tooltip-position', 'top');
			});

		input.addEventListener(this.plugin.settings.variableInputListener, (e) => {
			this.handleColorInputSync(e, colorPicker, variable.value);
		});
	}

	private addClearButton(container: HTMLElement, input: HTMLInputElement): void {
		const clearButton = container.createEl('button', {
			cls: 'clear-variable-input-button',
			attr: {
				'aria-label': 'Clear input',
				'data-tooltip-position': 'top',
				tabindex: '0'
			}
		});

		clearButton.addEventListener('click', () => {
			this.handleClearInput(input);
		});
	}

	private addInputListener(input: HTMLInputElement, variable: { name: string; value: string }, category: string): void {
		input.addEventListener(this.plugin.settings.variableInputListener, (e) => {
			this.handleVariableInput(e, variable, category, input);
		});
	}

	private addCopyDefaultButton(container: HTMLElement, defaultValue: string): void {
		const copyButton = createIconButton(container, {
			icon: 'copy',
			label: 'Copy default value "' + defaultValue + '" to clipboard',
			classes: ['copy-default-value'],
			onClick: () => {
				copyStringToClipboard(defaultValue, defaultValue);
			}
		});
	}

	public createCustomVariableItemInput(container: HTMLElement, variable: { uuid: string; name: string; value: string }, category: string): void {
		// Use the new VariableItem component system for consistency and searchability
		this.createVariableItemComponent(container, {
			uuid: variable.uuid,
			name: variable.name,
			value: variable.value
		}, category, true);
	}

	/**
	 * Refresh the custom variables category by clearing and re-rendering all custom variables.
	 * This ensures all custom variables are properly tracked in this.variableItems.
	 */
	public refreshCustomVariables(): void {
		// Find the custom variables container
		const customVarList = this.container.querySelector('[data-var-category="custom"]') as HTMLElement;
		if (!customVarList) {
			Logger.warn('Custom variables container not found');
			return;
		}

		// Remove existing custom variable items from tracking
		const customKeys = Array.from(this.variableItems.keys()).filter(key =>
			this.variableItems.get(key)?.getData().uuid !== undefined
		);
		customKeys.forEach(key => {
			const item = this.variableItems.get(key);
			item?.destroy();
			this.variableItems.delete(key);
		});

		// Clear the container
		customVarList.empty();

		// Re-render all custom variables using the proper component system
		this.renderCustomVariables(customVarList, 'custom');

		// Ensure the custom category is expanded
		const customVarCategory = this.container.querySelector('#variable-category-custom') as HTMLElement;
		if (customVarCategory) {
			const variableList = customVarCategory.querySelector('[data-var-category="custom"]') as HTMLElement;
			const icon = customVarCategory.querySelector('.collapse-icon.clickable-icon') as HTMLElement;

			if (variableList) {
				variableList.removeClass('hide');
				variableList.addClass('show');
			}

			if (icon) {
				setIcon(icon, 'chevron-down');
				icon.setAttr('aria-label', 'Collapse category');
			}

			// Scroll to category if setting is enabled
			if (this.plugin.settings.viewScrollToTop) {
				// Use debounce to delay scroll until DOM layout is complete
				const scrollDelayed = debounce(() => {
					const top = customVarCategory.offsetTop - UI_CONSTANTS.SCROLL_OFFSET;
					this.container.scrollTo({
						top: top,
						behavior: 'smooth'
					});
				}, TIMEOUT_DELAYS.SCROLL_DELAY, false);
				scrollDelayed();
			}
		}

		// Update the category count badge
		this.updateCategoryItemCount('custom');
	}


	private getCurrentVariableValue(variableName: string, category: string): string {
		const customVars = this.plugin.settings.cssVariables;
		const existingVariable = customVars.find(v => v.variable === variableName && v.parent === category);
		return existingVariable?.value || '';
	}

	private getExistingVariable(variableName: string, category: string): CSSVariable | undefined {
		return this.plugin.settings.cssVariables.find(v => v.variable === variableName && v.parent === category);
	}

	private updateInputTouchedState(input: HTMLInputElement): void {
		if (input.value && !input.classList.contains('clear-variable-input--touched')) {
			input.classList.add('clear-variable-input--touched');
		} else if (!input.value && input.classList.contains('clear-variable-input--touched')) {
			input.classList.remove('clear-variable-input--touched');
		}
	}

	/**
	 * Optimized variable filtering using VariableItem components
	 */
	private async filterVariables(searchTerm: string): Promise<void> {
		let visibleCount = 0;

		// Use VariableItem components for efficient filtering
		this.variableItems.forEach((variableItem) => {
			const matches = searchTerm === '' || variableItem.matchesSearch(searchTerm);
			variableItem.setVisible(matches);

			if (matches) {
				visibleCount++;
			}
		});

		// Emit search event for analytics/debugging
		this.eventManager.emit('search:variable', {
			term: searchTerm,
			results: visibleCount
		});
	}

	private updateVariableListVisibility(): void {
		const activeTagFilter = this.container.querySelector('.tag-filter-active')?.getAttr('data-tag-filter');
		const variableListEls = this.container.querySelectorAll('.variable-list');

		variableListEls.forEach((el: HTMLElement) => {
			const children = Array.from(el.children);
			const hasVisibleChildren = children.some(child => child.hasClass('show'));
			const dataVarTag = el.getAttr('data-var-tag');
			const variableListIcon = (el.previousSibling as HTMLElement)?.querySelector('.collapse-icon.clickable-icon') as HTMLElement;
			const shouldExpand = (activeTagFilter === 'all' || dataVarTag === activeTagFilter) && hasVisibleChildren;

			el.toggleClass('show', shouldExpand);
			el.toggleClass('hide', !shouldExpand);
			el.parentElement?.toggleClass('show', shouldExpand);
			el.parentElement?.toggleClass('hide', !shouldExpand);

			const iconName = shouldExpand ? 'chevron-down' : 'chevron-right';
			const ariaLabel = shouldExpand ? 'Collapse category' : 'Expand category';
			setIcon(variableListIcon!, iconName);
			variableListIcon?.setAttr('aria-label', ariaLabel);
			variableListIcon?.setAttr('data-tooltip-position', 'top');
		});
	}

	private resetVariableListVisibility(): void {
		const activeTagFilter = this.container.querySelector('.tag-filter-active')?.getAttr('data-tag-filter');
		const variableListEls = this.container.querySelectorAll('.variable-list');

		variableListEls.forEach((el: HTMLElement) => {
			const dataVarTag = el.getAttr('data-var-tag');
			const variableListIcon = (el.previousSibling as HTMLElement)?.querySelector('.collapse-icon.clickable-icon') as HTMLElement;
			const shouldShowCategory = activeTagFilter === 'all' || dataVarTag === activeTagFilter;

			el.addClass('hide');
			el.removeClass('show');
			el.parentElement?.toggleClass('show', shouldShowCategory);
			el.parentElement?.toggleClass('hide', !shouldShowCategory);

			setIcon(variableListIcon!, 'chevron-right');
			variableListIcon?.setAttr('aria-label', 'Expand category');
			variableListIcon?.setAttr('data-tooltip-position', 'top');
		});
	}

	private scrollToElement(target: HTMLElement): void {
		if (target && this.container) {
			const top = target.offsetTop - UI_CONSTANTS.SCROLL_OFFSET;
			this.container.scrollTo({
				top: top,
				behavior: "smooth"
			});
		}
	}

	destroy(): void {
		// Clean up debounced functions
		this.debounceUpdate.destroy();

		// Clean up VariableItem components
		this.variableItems.forEach(item => item.destroy());
		this.variableItems.clear();

		// Clean up event managers
		this.eventManager.destroy();
		this.domEventManager?.destroy();

		// Call parent destroy
		super.destroy();
	}

	// Event Handler Methods
	private handleCategoryToggle(variableListEl: HTMLElement, catToggleIcon: HTMLElement, container: HTMLElement): void {
		const categoryId = container.getAttribute('id');
		const shouldExpand = variableListEl.hasClass('hide');

		// Update settings
		if (shouldExpand) {
			if (!this.plugin.settings.expandedVariableCategories.includes(categoryId!)) {
				this.plugin.settings.expandedVariableCategories.push(categoryId!);
			}
		} else {
			this.plugin.settings.expandedVariableCategories =
				this.plugin.settings.expandedVariableCategories.filter(id => id !== categoryId);
		}
		this.saveSettings();

		variableListEl.toggleClass('show', shouldExpand);
		variableListEl.toggleClass('hide', !shouldExpand);

		setIcon(catToggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
		catToggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse category' : 'Expand category');

		if (shouldExpand && this.plugin.settings.viewScrollToTop) {
			window.setTimeout(() => {
				this.scrollToElement(container);
			}, 100);
		}
	}


	private handleClearInput(input: HTMLInputElement): void {
		input.value = '';
		input.focus();
		input.trigger(this.plugin.settings.variableInputListener);
		input.classList.remove('clear-variable-input--touched');
	}

	private handleColorInputSync(event: Event, colorPicker: ColorComponent, defaultValue: string): void {
		const newValue = (event.target as HTMLInputElement).value;
		colorPicker.setValue(newValue || defaultValue);
	}

	private handleVariableInput(event: Event, variable: { name: string; value: string }, category: string, input: HTMLInputElement): void {
		const newValue = (event.target as HTMLInputElement).value;
		const existingVariable = this.getExistingVariable(variable.name, category);
		const existingUUID = existingVariable?.uuid;

		this.cssVariableManager.updateVariable(
			newValue !== '' ? existingUUID : '',
			variable.name,
			newValue,
			category
		);

		this.debounceUpdate.execute();
		this.updateInputTouchedState(input);
	}
}