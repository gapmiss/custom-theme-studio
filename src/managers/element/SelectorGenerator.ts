import { copyStringToClipboard } from '../../utils';

/**
 * Generates CSS selectors from HTML elements.
 * Handles both simple and specific selector generation modes.
 */
export class SelectorGenerator {
	/**
	 * Generate a CSS selector for an element.
	 * @param element The element to generate a selector for
	 * @param useSpecific Whether to include all possible attributes
	 * @param includeParent Whether to include parent selector
	 * @returns The generated CSS selector
	 */
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

	/**
	 * Copy a comprehensive selector to clipboard with parent context
	 */
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
	private getDataAttributes(element: HTMLElement): Array<{ name: string, value: string }> {
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
	private escapeAttributeValue(value: string): string {
		// Replace quotes, backslashes, and other special characters
		return value.replace(/["\\]/g, '\\$&');
	}
}
