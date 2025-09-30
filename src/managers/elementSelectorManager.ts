import { Notice, ButtonComponent } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { CustomThemeStudioView } from '../views/customThemeStudioView';
import { generateUniqueId } from '../utils';
import { copyStringToClipboard } from '../utils';
import { TIMEOUT_DELAYS } from '../constants';

export class ElementSelectorManager {
	plugin: CustomThemeStudioPlugin;
	view: CustomThemeStudioView;
	isSelecting: boolean = false;
	highlightedElement: HTMLElement | null = null;
	tooltip: HTMLElement | null = null;
	cancelButton: ButtonComponent;
	noticeElement: Notice;

	constructor(plugin: CustomThemeStudioPlugin, view: CustomThemeStudioView) {
		this.plugin = plugin;
		this.view = view;
		this.cancelButton = this.cancelButton;
	}

	startElementSelection(): void {
		if (this.isSelecting) {
			return;
		}

		this.isSelecting = true;

		// Add class to body for cursor styling
		document.body.classList.add('cts-element-picker-active');

		// Create tooltip
		this.tooltip = document.body.appendChild(
			createDiv('cts-element-picker-tooltip hide')
		);

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
							.setClass('cts-element-picker-cancel')
							.setTooltip('Stop element selection');
						this.cancelButton.onClick((e) => {
							new Notice('Element selection cancelled');
						});
					}
				);
			}),
			timeout
		);
		notice.containerEl.setAttr('data-notice-element', 'cts-element-picker-notice');
		return notice;
	}

	stopElementSelection(): void {
		if (!this.isSelecting) {
			return;
		}

		this.isSelecting = false;

		// Remove class from body
		document.body.classList.remove('cts-element-picker-active');

		// Remove tooltip
		if (this.tooltip) {
			this.tooltip.remove();
			this.tooltip = null;
		}

		// Remove highlight from current element
		this.unhighlightElement();

		// Remove any hover classes that might be left
		document.querySelectorAll('.cts-element-picker-hover').forEach(el => {
			el.classList.remove('cts-element-picker-hover');
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
		if (
			(target === this.tooltip || target.closest('.cts-element-picker-tooltip')) ||
			(target === this.cancelButton.buttonEl || target.closest('cts-element-picker-cancel'))
		) {
			return;
		}

		// Skip the theme studio view
		if (target.closest('.cts-view')) {
			return;
		}

		// Highlight the element
		this.highlightElement(target);

		// Add hover class to show a border
		target.classList.add('cts-element-picker-hover');

		// Update tooltip
		this.updateTooltip(target, e);
	};

	handleMouseOut = (e: MouseEvent): void => {
		if (!this.isSelecting) return;

		// Get the target element
		const target = e.target as HTMLElement;

		// Remove hover class
		target.classList.remove('cts-element-picker-hover');

		// Unhighlight the element
		this.unhighlightElement();

		// Hide tooltip
		if (this.tooltip) {
			// Remove tooltip content
			while (this.tooltip.hasChildNodes()) {
				this.tooltip.removeChild(this.tooltip.lastChild!);
			}
			this.tooltip.classList.replace('show', 'hide');
		}
	};

	handleClick = (e: MouseEvent): void => {
		// Immediately prevent default action and stop propagation if we're in selection mode
		if (this.isSelecting) {
			// Prevent buttons from activating, links from navigating, etc.
			// Skip the Notice "Cancel" button
			if (!(e.target as HTMLElement).hasClass('cts-element-picker-cancel')) {
				e.preventDefault();
				e.stopPropagation();
			}
		} else {
			return;
		}

		// Get the target element
		const target = e.target as HTMLElement;

		// Skip the tooltip itself
		if (target === this.tooltip || target.closest('.cts-element-picker-tooltip')) {
			return;
		}

		// Skip the theme studio view
		if (target.closest('.cts-view')) {
			return;
		}

		// Skip the Notice "Cancel" button
		if (!target.classList.contains('cts-element-picker-cancel')) {
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

	highlightElement(element: HTMLElement): void {
		// Remove highlight from previous element
		this.unhighlightElement();

		// Add highlight to new element
		element.classList.add('cts-element-picker-highlight');
		this.highlightedElement = element;
	}

	unhighlightElement(): void {
		if (this.highlightedElement) {
			this.highlightedElement.classList.remove('cts-element-picker-highlight');
			this.highlightedElement = null;
		}
	}

	updateTooltip(element: HTMLElement, event: MouseEvent): void {
		if (!this.tooltip) return;

		// Get element info
		const defaultSelector = this.generateSelector(element, false);
		const specificSelector = this.generateSelector(element, true);
		const parentSelector = this.generateSelector(element, true, true);
		const tagName = element.tagName.toLowerCase();
		const classes = Array.from(element.classList).filter(cls =>
			!cls.includes('cts-element-picker-highlight')
		).join('.');

		// Get aria-label if present
		const ariaLabel = element.getAttribute('aria-label');

		// Get data attributes
		const dataAttributes = this.getDataAttributes(element);

		// Set tooltip content
		this.tooltip.createDiv()
			.createEl(
				'strong',
				{
					text: "Tag: "
				}
			)
			.createEl(
				'code',
				{
					text: tagName
				}
			);

		// Add aria-label if present (highlight it prominently)
		if (ariaLabel) {
			this.tooltip.createDiv('attribute-highlight aria-label-highlight')
				.createEl(
					'strong',
					{
						text: 'aria-label: '
					}
				)
				.createSpan(
					{
						text: `"${ariaLabel}"`
					}
				)
				.createDiv(
					{
						cls: 'attribute-note',
						text: '(High priority selector)'
					}
				);
		}

		// Add data attributes (highlight them)
		if (dataAttributes.length > 0) {
			this.tooltip.createDiv('attribute-highlight')
				.createEl(
					'strong',
					{
						text: 'Data Attributes:'
					}
				);
			let attrList: HTMLElement = this.tooltip.createEl(
				'ul',
				{
					cls: 'data-attributes-list'
				}
			);
			dataAttributes.forEach(attr => {
				attrList.appendChild(
					attrList.createEl(
						'li',
						{
							text: `${attr.name}="${attr.value}"`
						}
					)
				);
			});
		}

		// Add classes if present
		if (classes) {
			this.tooltip.createDiv('tooltip-classes')
				.createEl(
					'strong',
					{
						text: 'Classes: '
					}
				)
				.createSpan(
					{
						text: `${classes.replace('.cts-element-picker-hover', '')}`
					}
				);
		}

		// Add selector options
		// Helper to create a labeled selector line
		const createSelectorLine = (label: string, value: string) => {
			const line = this.tooltip!.createDiv();
			line.createEl(
				'strong',
				{
					text: `${label}: `
				}
			);
			line.createSpan(
				{
					cls: 'selector-highlight',
					text: value
				}
			);
		};

		// Helper to create a shortcut instruction line
		const createShortcutLine = (keys: string[], description: string, isFirst = false) => {
			const line = this.tooltip!.createDiv(
				{
					cls: isFirst ? 'keys first' : 'keys'
				}
			);
			keys.forEach((key, i) => {
				line.createEl(
					'kbd',
					{
						text: key
					}
				);
				if (i < keys.length - 1) {
					line.createSpan(
						{
							text: ' + '
						}
					);
				}
			});
			line.createSpan(
				{
					text: ` ${description}`
				}
			);
		};

		// Add selector info
		createSelectorLine('Default selector', defaultSelector);
		createSelectorLine('Specific selector', specificSelector);
		createSelectorLine('Specific selector with parent', parentSelector);

		// Add keyboard shortcut instructions
		createShortcutLine(['Click'], 'to select with default selector', true);
		createShortcutLine(['Alt', 'Click'], 'to select with specific selector');
		createShortcutLine(['Cmd/Ctrl', 'Click'], 'to select the specific selector with parent');
		createShortcutLine(['Shift', 'Click'], 'to copy the specific selector with parent to your clipboard');

		// First display the tooltip to get its dimensions
		this.tooltip.classList.replace('hide', 'show');
		const tooltipRect = this.tooltip.getBoundingClientRect();

		// Get mouse position and window dimensions
		const mouseX = event.clientX;
		const mouseY = event.clientY;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		// Calculate optimal position
		let left = mouseX + 10; // Default position to the right of cursor
		let top = mouseY + 10;  // Default position below cursor

		const MARGIN = 10; // Minimum distance from window edges

		// Check if tooltip would extend beyond right edge
		if (left + tooltipRect.width > windowWidth - MARGIN) {
			// Position to the left of the cursor instead
			left = mouseX - tooltipRect.width - 10;

			// If that would push it beyond the left edge, center it horizontally
			if (left < MARGIN) {
				left = Math.max(MARGIN, (windowWidth - tooltipRect.width) / 2);
			}
		}

		// Check if tooltip would extend beyond bottom edge
		if (top + tooltipRect.height > windowHeight - MARGIN) {
			// Position above the cursor instead
			top = mouseY - tooltipRect.height - 10;

			// If that would push it beyond the top edge, center it vertically
			if (top < MARGIN) {
				top = Math.max(MARGIN, (windowHeight - tooltipRect.height) / 2);
			}
		}

		// Ensure we're not too close to the left edge
		if (left < MARGIN) {
			left = MARGIN;
		}

		// Ensure we're not too close to the top edge
		if (top < MARGIN) {
			top = MARGIN;
		}

		// Apply the calculated position
		this.tooltip.style.left = `${left}px`;
		this.tooltip.style.top = `${top}px`;
	}

	selectElement(element: HTMLElement, evt: MouseEvent): void {
		// Shift key for copy 2 clipboard
		if (evt.shiftKey) {
			this.copySelectorToClipboard(element);
			return;
		}

		let selector: string;
		if (evt.altKey) {
			// Generate selector based on whether alt key is pressed
			selector = this.generateSelector(element, evt.altKey);
		} else if (evt.metaKey) {
			// Generate selector based on whether cmd/ctrl (meta) key is pressed
			selector = this.generateSelector(element, true, evt.metaKey);
		} else {
			// Generate selector
			selector = this.generateSelector(element);
		}

		// Save the selector
		this.plugin.settings.lastSelectedSelector = selector;
		this.plugin.saveSettings();

		// Update the CSS editor in the view
		if (this.view.cssEditorManager) {
			// First, make sure any existing inline editors are removed
			this.view.cssEditorManager.removeInlineEditor();

			// Set the selector in the editor
			let uuid = generateUniqueId();
			this.view.cssEditorManager.setRule(uuid, selector, false);

			// Show the editor section
			this.view.cssEditorManager.showEditorSection(true);

			// Scroll editor to the top of view
			if (this.plugin.settings.viewScrollToTop) {
				setTimeout(() => {
					this.scrollToDivByUUID(uuid);
				}, TIMEOUT_DELAYS.SCROLL_DELAY);
				// this.view.cssEditorManager.ruleInputEl!.focus();
			}
		}
	}

	generateSelector(element: HTMLElement, useSpecific: boolean = false, includeParent: boolean = false): string {
		// Start with the tag name
		let selector = element.tagName.toLowerCase();

		// Add id if present (highest priority for both modes)
		if (element.id) {
			selector = `${selector}#${element.id}`;
			return selector; // ID is unique, so we can return immediately
		}

		if (includeParent && element.parentElement) {
			const parent = element.parentElement;
			const classSelector = Array.from(parent.classList)
				.filter(cls => !cls.includes('cts-element-picker-highlight'))
				.map(cls => `.${cls}`)
				.join('');
			selector = `${parent.tagName.toLowerCase()}${classSelector} > ${selector}`;
		}

		if (useSpecific) {
			// For specific selector, include everything possible in a consistent order
			// Add all classes first
			if (element.classList.length > 0) {
				const classes = Array.from(element.classList)
					.filter(cls => !cls.includes('cts-element-picker-highlight'))
					.map(cls => `.${cls}`)
					.join('');
				if (classes) {
					selector = `${selector}${classes}`;
				}
			}

			// Add aria-label if present (high priority)
			if (element.hasAttribute('aria-label')) {
				const ariaLabel = element.getAttribute('aria-label');
				const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
				if (escapedAriaLabel) {
					selector = `${selector}[aria-label="${escapedAriaLabel}"]`;
				}
			}

			// Add all data attributes
			this.getDataAttributes(element)
				.sort((a, b) => a.name.localeCompare(b.name))
				.forEach(attr => {
					const value = this.escapeAttributeValue(attr.value);
					selector += `[${attr.name}="${value}"]`;
				});


			// Add other significant attributes
			for (const attr of ['role', 'type', 'name']) {
				const value = element.getAttribute(attr);
				if (value !== null) {
					const escaped = this.escapeAttributeValue(value);
					selector += `[${attr}="${escaped}"]`;
				}
			}
		} else {
			// Default mode - prioritize aria-label and data-* attributes
			// Check for aria-label attribute (high priority)
			if (element.hasAttribute('aria-label')) {
				const ariaLabel = element.getAttribute('aria-label');
				const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
				if (escapedAriaLabel) {
					selector = `${selector}[aria-label="${escapedAriaLabel}"]`;
					return selector; // aria-label is specific enough to return immediately
				}
			}

			// Check for data-* attributes (next priority)
			const attr = this.getDataAttributes(element)
				.sort((a, b) => a.name.length - b.name.length)[0];

			if (attr) {
				const value = this.escapeAttributeValue(attr.value);
				return `${selector}[${attr.name}="${value}"]`;
			}

			// Add classes if no better selectors are available
			if (element.classList.length > 0) {
				const classes = Array.from(element.classList)
					.filter(cls => !cls.includes('cts-element-picker-highlight'))
					.map(cls => `.${cls}`)
					.join('');
				if (classes) {
					selector = `${selector}${classes}`;
				}
			}
		}
		return selector.replace('.cts-element-picker-hover', '');
	}

	copySelectorToClipboard(element: HTMLElement): void {
		// Start with the tag name
		let selector = element.tagName.toLowerCase();

		// Parent
		if (element.parentElement) {
			const parent = element.parentElement;
			const classSelector = Array.from(parent.classList)
				.filter(cls => !cls.includes('cts-element-picker-highlight'))
				.map(cls => `.${cls}`)
				.join('');
			selector = `${parent.tagName.toLowerCase()}${classSelector} > ${selector}`;
		}

		// Add id if present (highest priority for both modes)
		if (element.id) {
			selector = `${selector}#${element.id}`;
		} else {
			// For specific selector, include everything possible in a consistent order
			// Add all classes first
			if (element.classList.length > 0) {
				const classes = Array.from(element.classList)
					.filter(cls => !cls.includes('cts-element-picker-highlight'))
					.map(cls => `.${cls}`)
					.join('');

				if (classes) {
					selector = `${selector}${classes}`;
				}
			}

			// Add aria-label if present (high priority)
			if (element.hasAttribute('aria-label')) {
				const ariaLabel = element.getAttribute('aria-label');
				const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
				selector = `${selector}[aria-label="${escapedAriaLabel}"]`;
			}

			// Add all data attributes
			this.getDataAttributes(element)
				.sort((a, b) => a.name.localeCompare(b.name))
				.forEach(attr => {
					const value = this.escapeAttributeValue(attr.value);
					selector += `[${attr.name}="${value}"]`;
				});

			// Add other significant attributes
			for (const attr of ['role', 'type', 'name']) {
				const value = element.getAttribute(attr);
				if (value !== null) {
					const escaped = this.escapeAttributeValue(value);
					selector += `[${attr}="${escaped}"]`;
				}
			}

		}
		selector = selector.replace('.cts-element-picker-hover', '');
		copyStringToClipboard(selector, selector);
	}

	/**
	 * Get all data-* attributes from an element
	 */
	getDataAttributes(element: HTMLElement): Array<{ name: string, value: string }> {
		const dataAttributes: Array<{ name: string, value: string }> = [];
		// Loop through all attributes
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i];
			if (attr.name.startsWith('data-') && attr.name !== 'data-reactid') {
				dataAttributes.push({
					name: attr.name,
					value: attr.value
				});
			}
		}
		return dataAttributes;
	}

	/**
	 * Escape special characters in attribute values for CSS selectors
	 */
	escapeAttributeValue(value: string): string {
		// Replace quotes, backslashes, and other special characters
		return value.replace(/["\\]/g, '\\$&');
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