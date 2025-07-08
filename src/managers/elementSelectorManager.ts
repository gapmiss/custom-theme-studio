import { Notice, ButtonComponent } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { CustomThemeStudioView } from '../views/customThemeStudioView';
import { generateUniqueId } from '../utils';
import { copyStringToClipboard } from '../utils';

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
		this.tooltip = document.createElement('div');
		this.tooltip.className = 'cts-element-picker-tooltip';
		this.tooltip.removeClass('cts-element-picker-tooltip-show');
		this.tooltip.addClass('cts-element-picker-tooltip-hide');
		document.body.appendChild(this.tooltip);

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
				e.createDiv({ text: message, cls: 'cts-notice-with-cancel' });
				e.createDiv({ cls: 'cts-notice-cancel-button' }, (div) => {
					this.cancelButton = new ButtonComponent(div)
						.setButtonText(cancelText)
						.setClass('cts-element-picker-cancel')
						.setTooltip('Stop element selection');
					this.cancelButton.onClick((e) => {
						new Notice('Element selection cancelled');
					});
				});
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
			this.tooltip.innerHTML = '';
			this.tooltip.removeClass('cts-element-picker-tooltip-show');
			this.tooltip.addClass('cts-element-picker-tooltip-hide');
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
		let tooltipContent: string = ''
		tooltipContent += `
			<div><strong>Tag:</strong> <code>${tagName}</code></div>
		`;

		// Add aria-label if present (highlight it prominently)
		if (ariaLabel) {
			tooltipContent += `
				<div class="attribute-highlight aria-label-highlight">
					<strong>Aria-Label:</strong> "${ariaLabel}"
					<div class="attribute-note">(High priority selector)</div>
				</div>`;
		}

		// Add data attributes (highlight them)
		if (dataAttributes.length > 0) {
			tooltipContent += `<div class="attribute-highlight"><strong>Data Attributes:</strong></div>`;
			tooltipContent += `<ul class="data-attributes-list">`;
			dataAttributes.forEach(attr => {
				tooltipContent += `<li>${attr.name}="${attr.value}"</li>`;
			});
			tooltipContent += `</ul>`;
		}

		// Add classes if present
		if (classes) {
			tooltipContent += `<div class="tooltip-classes"><strong>Classes:</strong> <span>${classes.replace('.cts-element-picker-hover', '')}</span></div>`;
		}

		// Add both selector options
		tooltipContent += `
			<div><strong>Default selector:</strong> <span class="selector-highlight">${defaultSelector}</span></div>
			<div><strong>Specific selector:</strong> <span class="selector-highlight">${specificSelector}</span></div>
			<div><strong>Specific selector with parent:</strong> <span class="selector-highlight">${parentSelector}</span></div>
			<div class="keys first"><kbd>Click</kbd> to select with default selector</div>
			<div class="keys"><kbd>Alt</kbd> + <kbd>Click</kbd> to select with specific selector</div>
			<div class="keys"><kbd>Command</kbd>+<kbd>Click</kbd> to select the specific selector with parent</div>
			<div class="keys"><kbd>Shift</kbd>+<kbd>Click</kbd> to copy the specific selector with parent to your clipboard</div>
		`;

		this.tooltip.insertAdjacentHTML('afterbegin', tooltipContent);

		// First display the tooltip to get its dimensions
		this.tooltip.removeClass('cts-element-picker-tooltip-hide');
		this.tooltip.addClass('cts-element-picker-tooltip-show');
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

		// Generate selector based on whether alt key is pressed
		const selector = this.generateSelector(element, evt.altKey, evt.metaKey);

		// Save the selector
		this.plugin.settings.lastSelectedSelector = selector;
		this.plugin.saveSettings();

		// Update the CSS editor in the view
		if (this.view.cssEditorManager) {
			// First, make sure any existing inline editors are removed
			this.view.cssEditorManager.removeInlineEditor();

			// Set the selector in the editor
			this.view.cssEditorManager.setSelector(generateUniqueId(), selector, false);

			// Show the editor section
			this.view.cssEditorManager.showEditorSection(true);
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

		if (includeParent) {
			const classes = Array.from(element.parentElement!.classList).filter(cls =>
				!cls.includes('cts-element-picker-highlight')
			).join('.');
			selector = `${element.parentElement?.tagName.toLowerCase()}${(classes.length > 0) ? '.' + classes : ''} > ${selector}`;
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
				selector = `${selector}[aria-label="${escapedAriaLabel}"]`;
			}

			// Add all data attributes
			const dataAttributes = this.getDataAttributes(element);
			if (dataAttributes.length > 0) {
				// Sort data attributes for consistent ordering
				dataAttributes.sort((a, b) => a.name.localeCompare(b.name));
				dataAttributes.forEach(attr => {
					const escapedValue = this.escapeAttributeValue(attr.value);
					selector = `${selector}[${attr.name}="${escapedValue}"]`;
				});
			}

			// Add other significant attributes
			const significantAttrs = ['role', 'type', 'name'];
			significantAttrs.forEach(attrName => {
				if (element.hasAttribute(attrName)) {
					const value = element.getAttribute(attrName);
					const escapedValue = this.escapeAttributeValue(value!);
					selector = `${selector}[${attrName}="${escapedValue}"]`;
				}
			});

		} else {
			// Default mode - prioritize aria-label and data-* attributes
			// Check for aria-label attribute (high priority)
			if (element.hasAttribute('aria-label')) {
				const ariaLabel = element.getAttribute('aria-label');
				const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
				selector = `${selector}[aria-label="${escapedAriaLabel}"]`;
				return selector; // aria-label is specific enough to return immediately
			}

			// Check for data-* attributes (next priority)
			const dataAttributes = this.getDataAttributes(element);
			if (dataAttributes.length > 0) {
				// Use the most specific data attribute (prefer shorter ones as they're usually more specific)
				dataAttributes.sort((a, b) => a.name.length - b.name.length);
				const attr = dataAttributes[0];
				const escapedValue = this.escapeAttributeValue(attr.value);
				return `${selector}[${attr.name}="${escapedValue}"]`;
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
		const classes = Array.from(element.parentElement!.classList).filter(cls =>
			!cls.includes('cts-element-picker-highlight')
		).join('.');
		selector = `${element.parentElement?.tagName.toLowerCase()}${(classes.length > 0) ? '.' + classes : ''} > ${selector}`;

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
			const dataAttributes = this.getDataAttributes(element);
			if (dataAttributes.length > 0) {
				// Sort data attributes for consistent ordering
				dataAttributes.sort((a, b) => a.name.localeCompare(b.name));
				dataAttributes.forEach(attr => {
					const escapedValue = this.escapeAttributeValue(attr.value);
					selector = `${selector}[${attr.name}="${escapedValue}"]`;
				});
			}

			// Add other significant attributes
			const significantAttrs = ['role', 'type', 'name'];
			significantAttrs.forEach(attrName => {
				if (element.hasAttribute(attrName)) {
					const value = element.getAttribute(attrName);
					const escapedValue = this.escapeAttributeValue(value!);
					selector = `${selector}[${attrName}="${escapedValue}"]`;
				}
			});
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

}