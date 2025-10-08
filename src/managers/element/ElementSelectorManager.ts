import { Notice, ButtonComponent, debounce } from 'obsidian';
import CustomThemeStudioPlugin from '../../main';
import { CustomThemeStudioView } from '../../views/customThemeStudioView';
import { generateUniqueId } from '../../utils';
import { TIMEOUT_DELAYS } from '../../constants';
import { SelectorGenerator } from './SelectorGenerator';
import { ElementHighlighter } from './ElementHighlighter';

/**
 * Main Element Selector Manager - orchestrates element selection functionality.
 * Refactored to use specialized classes for selector generation and highlighting.
 */
export class ElementSelectorManager {
	plugin: CustomThemeStudioPlugin;
	view: CustomThemeStudioView;
	isSelecting: boolean = false;
	cancelButton: ButtonComponent;
	noticeElement: Notice;

	// Specialized managers
	private selectorGenerator: SelectorGenerator;
	private highlighter: ElementHighlighter;

	constructor(plugin: CustomThemeStudioPlugin, view: CustomThemeStudioView) {
		this.plugin = plugin;
		this.view = view;
		this.cancelButton = this.cancelButton;

		// Initialize specialized managers
		// Pass plugin reference so SelectorGenerator can access settings dynamically
		this.selectorGenerator = new SelectorGenerator(this.plugin);
		this.highlighter = new ElementHighlighter(this.selectorGenerator);
	}

	startElementSelection(): void {
		if (this.isSelecting) {
			return;
		}

		this.isSelecting = true;

		// Add class to body for cursor styling
		document.body.classList.add('cts-element-selector-active');

		// Create tooltip
		this.highlighter.createTooltip();

		// Add event listeners
		document.addEventListener('mouseover', this.handleMouseOver);
		document.addEventListener('mouseout', this.handleMouseOut);

		// Add click listener in capture phase to prevent default actions early
		document.addEventListener('click', this.handleClick, true);
		document.addEventListener('keydown', this.handleKeyDown);

		// Notice with cancel button
		this.noticeElement = this.noticeWithCancel({
			message: 'Element selection mode active. Click on an element to select it, or press Escape to cancel.',
			cancelText: 'Cancel',
			timeout: 0
		});
	}

	noticeWithCancel({
		message,
		cancelText = 'Cancel',
		timeout,
	}: {
		message: string;
		cancelText?: string;
		timeout?: number;
	}) {
		const notice = new Notice(
			createFragment((e) => {
				e.createDiv(
					{
						text: message,
						cls: 'cts-notice-with-cancel'
					}
				);
				e.createDiv(
					{
						cls: 'cts-notice-cancel-button'
					},
					(div) => {
						this.cancelButton = new ButtonComponent(div)
							.setButtonText(cancelText)
							.setClass('cts-element-selector-cancel')
							.setTooltip('Stop element selection');
						this.cancelButton.onClick((e) => {
							new Notice('Element selection cancelled');
						});
					}
				);
			}),
			timeout
		);
		notice.containerEl.setAttr('data-notice-element', 'cts-element-selector-notice');
		return notice;
	}

	stopElementSelection(): void {
		if (!this.isSelecting) {
			return;
		}

		this.isSelecting = false;

		// Remove class from body
		document.body.classList.remove('cts-element-selector-active');

		// Remove tooltip
		this.highlighter.destroyTooltip();

		// Unhighlight the current element
		this.highlighter.unhighlightElement();

		// Remove any hover classes that might be left
		document.querySelectorAll('.cts-element-selector-hover').forEach(el => {
			el.classList.remove('cts-element-selector-hover');
		});

		// Remove event listeners
		document.removeEventListener('mouseover', this.handleMouseOver);
		document.removeEventListener('mouseout', this.handleMouseOut);
		document.removeEventListener('click', this.handleClick, true);
		document.removeEventListener('keydown', this.handleKeyDown);

		this.noticeElement.hide();
	}

	handleMouseOver = (e: MouseEvent): void => {
		if (!this.isSelecting) return;

		// Get the target element
		const target = e.target as HTMLElement;

		// Skip the tooltip and notice cancel button
		const tooltip = this.highlighter.getHighlightedElement();
		if (
			target.closest('.cts-element-selector-tooltip') ||
			target.closest('.cts-element-selector-cancel')
		) {
			return;
		}

		// Skip the theme studio view
		if (target.closest('.cts-view')) {
			return;
		}

		// Highlight the element
		this.highlighter.highlightElement(target);

		// Add hover class to show a border
		target.classList.add('cts-element-selector-hover');

		// Update tooltip
		this.highlighter.updateTooltip(target, e);
	};

	handleMouseOut = (e: MouseEvent): void => {
		if (!this.isSelecting) return;

		// Get the target element
		const target = e.target as HTMLElement;

		// Remove hover class
		target.classList.remove('cts-element-selector-hover');

		// Unhighlight the element
		this.highlighter.unhighlightElement();

		// Hide tooltip
		this.highlighter.hideTooltip();
	};

	handleClick = (e: MouseEvent): void => {
		// Immediately prevent default action and stop propagation if we're in selection mode
		if (this.isSelecting) {
			// Prevent buttons from activating, links from navigating, etc.
			// Skip the Notice "Cancel" button
			if (!(e.target as HTMLElement).hasClass('cts-element-selector-cancel')) {
				e.preventDefault();
				e.stopPropagation();
			}
		} else {
			return;
		}

		// Get the target element
		const target = e.target as HTMLElement;

		// Skip the tooltip itself
		if (target.closest('.cts-element-selector-tooltip')) {
			return;
		}

		// Skip the theme studio view
		if (target.closest('.cts-view')) {
			return;
		}

		// Skip the Notice "Cancel" button
		if (!target.classList.contains('cts-element-selector-cancel')) {
			// Remove hover class from target before selecting
			target.classList.remove('cts-element-selector-hover');

			// Select the element
			this.selectElement(target, e);
		}

		// Stop selection mode
		this.stopElementSelection();
	};

	handleKeyDown = (e: KeyboardEvent): void => {
		if (!this.isSelecting) return;

		// Cancel on Escape
		if (e.key === 'Escape') {
			this.stopElementSelection();
			new Notice('Element selection cancelled');
		}
	};

	selectElement(element: HTMLElement, evt: MouseEvent): void {
		// Shift key for copy 2 clipboard
		if (evt.shiftKey) {
			this.selectorGenerator.copySelectorToClipboard(element);
			return;
		}

		let selector = '';

		// Detect modifier keys for different selector modes
		if (evt.altKey) {
			// Alt/Option: Use specific selector
			selector = this.selectorGenerator.generateSelector(element, true);
		} else if (evt.ctrlKey || evt.metaKey) {
			// Ctrl/Cmd: Use specific selector with parent
			selector = this.selectorGenerator.generateSelector(element, true, true);
		} else {
			// Default: Use default selector
			selector = this.selectorGenerator.generateSelector(element, false);
		}

		// Create new rule with this selector
		const uuid = generateUniqueId();

		// Get the rule list
		const ruleList = this.view.containerEl.querySelector('.css-rule');

		// Set the rule in the CSS editor manager
		const leaves = this.plugin.app.workspace.getLeavesOfType('cts-view');
		if (leaves.length > 0) {
			const view = leaves[0].view as CustomThemeStudioView;
			if (view?.cssEditorManager) {
				// Store current UUID
				const currentUUID = uuid;

				// Show and populate the editor
				view.cssEditorManager.setRule(currentUUID, selector, false);
				view.cssEditorManager.showEditorSection(true);

				// Scroll editor to the top of view
				if (this.plugin.settings.viewScrollToTop) {
					setTimeout(() => {
						this.scrollToDivByUUID(uuid);
					}, TIMEOUT_DELAYS.SCROLL_DELAY);
				}

				// Focus rule name input after UI is rendered and scroll completes
				const focusRuleInput = debounce(() => {
					view.cssEditorManager.focusRuleInput();
				}, 250, false);
				focusRuleInput();
			}
		}
	}

	// Scroll element to the top of view
	scrollToDivByUUID(uuid: string) {
		const target = this.view.containerEl.querySelector(`input[value="${uuid}"]`)?.parentElement;
		if (target) {
			const container = this.view.containerEl;
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
