import { debounce } from 'obsidian';
import { UIComponent, ComponentContext } from './UIComponent';
import { createCollapsibleSection, createIconButton, createSearchInput, smoothScrollToElement } from '../../utils/uiHelpers';
import { FontImportModal } from '../../modals/fontImportModal';

export class CSSRulesSection extends UIComponent {
	public ruleSearch: string = '';
	ruleSearchCounter: HTMLElement;

	constructor(context: ComponentContext) {
		super(context);
	}

	render(): HTMLElement {
		const section = this.createSection('rules-section');

		const { content } = createCollapsibleSection(section, {
			title: 'CSS rules',
			expanded: this.plugin.settings.expandCSSRules,
			onToggle: (expanded) => {
				this.plugin.settings.expandCSSRules = expanded;
				this.saveSettings();
			}
		});

		this.renderButtons(content);
		this.renderEditorSection(content);
		this.renderSearch(content);
		this.renderRuleList(content);

		return section;
	}

	private renderButtons(container: HTMLElement): void {
		const buttonContainer = container.createDiv('css-rules-button-container');

		createIconButton(buttonContainer, {
			icon: 'square-pen',
			label: 'Add CSS rule',
			classes: ['add-rule-button'],
			onClick: async () => {
				await this.handleAddRule();
			}
		});

		createIconButton(buttonContainer, {
			icon: 'mouse-pointer-square-dashed',
			label: 'Select an element',
			classes: ['select-element-button'],
			onClick: async () => {
				await this.handleSelectElement();
			}
		});

		if (this.plugin.settings.enableFontImport) {
			createIconButton(buttonContainer, {
				icon: 'file-type',
				label: 'Import font',
				classes: ['add-font-face-button'],
				onClick: () => {
					new FontImportModal(this.app, this.plugin).open();
				}
			});
		}
	}

	private async handleAddRule(): Promise<void> {
		const editorSection = this.container.querySelector('.css-editor-section');
		const isEditorVisible = editorSection && getComputedStyle(editorSection).display !== 'none';

		if (isEditorVisible && this.plugin.settings.showConfirmation) {
			const { confirm } = await import('../../modals/confirmModal');
			if (!await confirm('You have an unsaved CSS rule form open. Creating a new rule will discard your changes. Continue?', this.plugin.app)) {
				return;
			}
		}

		this.removeInlineEditors();
		this.cssEditorManager.resetEditor();
		this.cssEditorManager.clearAppliedChanges();
		this.cssEditorManager.showEditorSection(true);

		this.positionEditorSection(editorSection);

		if (this.plugin.settings.viewScrollToTop) {
			window.setTimeout(() => {
				this.scrollToElement(editorSection as HTMLElement);
			}, 100);
		}

		// Focus rule name input after UI is rendered and scroll completes
		const focusRuleInput = debounce(() => {
			this.cssEditorManager.focusRuleInput();
		}, 250, false);
		focusRuleInput();
	}

	private async handleSelectElement(): Promise<void> {
		const editorSection = this.container.querySelector('.css-editor-section');
		const isEditorVisible = editorSection && getComputedStyle(editorSection).display !== 'none';

		if (isEditorVisible && this.plugin.settings.showConfirmation) {
			const { confirm } = await import('../../modals/confirmModal');
			if (!await confirm('You have an unsaved CSS rule form open. Creating a new rule will discard your changes. Continue?', this.plugin.app)) {
				return;
			}
		}

		this.removeInlineEditors();
		this.cssEditorManager.resetEditor();
		this.cssEditorManager.clearAppliedChanges();
		this.cssEditorManager.showEditorSection(false);

		this.elementSelectorManager.startElementSelection();
	}

	private removeInlineEditors(): void {
		const inlineEditors = document.querySelectorAll('.inline-rule-editor');
		inlineEditors.forEach(editor => editor.remove());
	}

	private positionEditorSection(editorSection: Element | null): void {
		const buttonContainer = this.container.querySelector('.css-rules-button-container');
		if (buttonContainer && editorSection) {
			buttonContainer.after(editorSection);
		}
	}

	private renderEditorSection(container: HTMLElement): void {
		this.cssEditorManager.createEditorSection(container);
		this.cssEditorManager.showEditorSection(false);
	}

	private renderSearch(container: HTMLElement): void {
		const searchContainer = container.createDiv('search-rules-container');
		const clearInputContainer = searchContainer.createDiv('clear-search-rules-input');

		const { searchInput, clearButton } = createSearchInput(clearInputContainer, {
			placeholder: 'Search CSS rules…',
			onInput: (searchTerm) => {
				this.ruleSearch = searchTerm;
				this.filterCSSRules(searchTerm);
				this.updateSearchInputState(searchInput, searchTerm);
			},
			onClear: () => {
				this.ruleSearch = '';
				this.resetRuleVisibility();
			}
		});

		if (!searchInput.classList.contains('search-rules-input')) {
			searchInput.classList.add('search-rules-input');
		}

		if (clearButton && !clearButton.classList.contains('clear-search-rules-input-button')) {
			clearButton.classList.add('clear-search-rules-input-button');
		}

		this.renderResultsCounter(searchContainer);
	}

	private renderResultsCounter(container: HTMLElement): void {
		const counter = container.createDiv('search-results-counter');
		// Store reference for updates
		this.ruleSearchCounter = counter;
	}

	private updateSearchInputState(input: HTMLInputElement, searchTerm: string): void {
		if (searchTerm && !input.classList.contains('clear-search-rules-input--touched')) {
			input.classList.add('clear-search-rules-input--touched');
		} else if (!searchTerm && input.classList.contains('clear-search-rules-input--touched')) {
			input.classList.remove('clear-search-rules-input--touched');
		}
	}

	private renderRuleList(container: HTMLElement): void {
		const ruleListContainer = container.createDiv('css-rule-container');
		const ruleList = ruleListContainer.createDiv('css-rule');

		// Initialize the rule list manager with incremental update support
		this.cssEditorManager.initializeRuleListManager(ruleList);

		// Initial population of the list
		this.plugin.settings.cssRules
			.sort((a, b) => a.rule!.localeCompare(b.rule!))
			.forEach(rule => {
				this.cssEditorManager.createRuleItem(ruleList, rule);
			});
	}

	public async filterCSSRules(query: string): Promise<void> {
		let matchCount = 0;

		this.plugin.settings.cssRules.forEach((rule) => {
			const matchesQuery =
				rule.rule.toLowerCase()?.includes(query.toLowerCase()) ||
				rule.css.toLowerCase()?.includes(query.toLowerCase());

			const ruleEl = this.container.querySelector(`[data-cts-uuid="${rule.uuid}"]`);
			if (ruleEl) {
				ruleEl.toggleClass('show', matchesQuery);
				ruleEl.toggleClass('hide', !matchesQuery);
				if (matchesQuery) matchCount++;
			}
		});

		this.updateResultsCounter(query, matchCount);
	}

	private updateResultsCounter(term: string, results: number): void {
		const counter = this.ruleSearchCounter as HTMLElement;
		if (counter) {
			if (term) {
				counter.textContent = `${results} rule${results !== 1 ? 's' : ''} found`;
				counter.addClass('active');
				counter.toggleClass('no-results', results === 0);
			} else {
				counter.textContent = '';
				counter.removeClass('active');
				counter.removeClass('no-results');
			}
		}
	}

	private resetRuleVisibility(): void {
		const ruleListEls = this.container.querySelectorAll('.rule-item');
		ruleListEls.forEach((element: HTMLElement) => {
			element.toggleClass('show', true);
			element.toggleClass('hide', false);
		});

		this.updateResultsCounter('', 0);
	}

	private scrollToElement(target: HTMLElement): void {
		if (target && this.container) {
			smoothScrollToElement(this.container, target);
		}
	}

	destroy(): void {
		this.element?.remove();
	}
}