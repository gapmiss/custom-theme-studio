import { SelectorGenerator } from './SelectorGenerator';

/**
 * Handles visual highlighting of elements during selection and tooltip display.
 */
export class ElementHighlighter {
	private highlightedElement: HTMLElement | null = null;
	private tooltip: HTMLElement | null = null;
	private selectorGenerator: SelectorGenerator;

	constructor(selectorGenerator: SelectorGenerator) {
		this.selectorGenerator = selectorGenerator;
	}

	/**
	 * Initialize the tooltip element
	 */
	createTooltip(): HTMLElement {
		this.tooltip = document.body.appendChild(
			createDiv('cts-element-selector-tooltip hide')
		);
		return this.tooltip;
	}

	/**
	 * Highlight an element
	 */
	highlightElement(element: HTMLElement): void {
		// Remove highlight from previous element
		this.unhighlightElement();

		// Add highlight to new element
		element.classList.add('cts-element-selector-highlight');
		this.highlightedElement = element;
	}

	/**
	 * Remove highlight from the currently highlighted element
	 */
	unhighlightElement(): void {
		if (this.highlightedElement) {
			this.highlightedElement.classList.remove('cts-element-selector-highlight');
			this.highlightedElement = null;
		}
	}

	/**
	 * Update tooltip content and position
	 */
	updateTooltip(element: HTMLElement, event: MouseEvent): void {
		if (!this.tooltip) return;

		// Clear previous content
		this.tooltip.empty();

		// Get element info
		const defaultSelector = this.selectorGenerator.generateSelector(element, false);
		const specificSelector = this.selectorGenerator.generateSelector(element, true);
		const parentSelector = this.selectorGenerator.generateSelector(element, true, true);
		const tagName = element.tagName.toLowerCase();
		const classes = Array.from(element.classList).filter(cls =>
			!cls.includes('cts-element-selector-highlight')
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
						text: 'Data attributes:'
					}
				);
			let attrList: HTMLElement = this.tooltip.createEl(
				'ul',
				{
					cls: 'data-attributes-list'
				}
			);
			dataAttributes.forEach(attr => {
				const formattedAttr = this.selectorGenerator.formatAttributeForDisplay(attr.name, attr.value);
				attrList.appendChild(
					attrList.createEl(
						'li',
						{
							text: formattedAttr
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
						text: `${classes.replace('.cts-element-selector-hover', '')}`
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

	/**
	 * Hide and clean up tooltip
	 */
	hideTooltip(): void {
		if (this.tooltip) {
			this.tooltip.classList.replace('show', 'hide');
			this.tooltip.empty();
		}
	}

	/**
	 * Remove tooltip from DOM
	 */
	destroyTooltip(): void {
		if (this.tooltip) {
			this.tooltip.remove();
			this.tooltip = null;
		}
	}

	/**
	 * Get the currently highlighted element
	 */
	getHighlightedElement(): HTMLElement | null {
		return this.highlightedElement;
	}

	/**
	 * Get data attributes from an element (helper for tooltip)
	 */
	private getDataAttributes(element: HTMLElement): Array<{ name: string, value: string }> {
		const dataAttributes: Array<{ name: string, value: string }> = [];
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
	 * Clean up all DOM elements and references
	 */
	destroy(): void {
		this.unhighlightElement();
		this.destroyTooltip();
	}
}
