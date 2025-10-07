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
		const tagName = element.tagName.toLowerCase();
		const hasId = !!element.id;
		const hasAriaLabel = element.hasAttribute('aria-label');
		const dataAttrs = this.getDataAttributes(element);
		const classes = Array.from(element.classList)
			.filter(cls => !cls.includes('cts-element-picker-highlight') && !cls.includes('cts-element-picker-hover'));

		let selector = '';

		// Handle parent if requested
		if (includeParent && element.parentElement) {
			const parent = element.parentElement;
			const parentClasses = Array.from(parent.classList)
				.filter(cls => !cls.includes('cts-element-picker-highlight'))
				.map(cls => `.${cls}`)
				.join('');
			selector = `${parent.tagName.toLowerCase()}${parentClasses} > `;
		}

		// Handle ID (highest priority) - always omit tag for IDs
		if (hasId) {
			return selector + `#${element.id}`;
		}

		if (useSpecific) {
			// Specific mode: include all attributes
			const omitTag = this.canOmitTagName(element, hasId, hasAriaLabel, dataAttrs);
			let selectorParts: string[] = [];

			// Add tag name (unless we can omit it)
			if (!omitTag) {
				selectorParts.push(tagName);
			}

			// Add all classes
			if (classes.length > 0) {
				selectorParts.push(classes.map(cls => `.${cls}`).join(''));
			}

			// Add aria-label
			if (hasAriaLabel) {
				const ariaLabel = element.getAttribute('aria-label');
				const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
				if (escapedAriaLabel) {
					selectorParts.push(`[aria-label="${escapedAriaLabel}"]`);
				}
			}

			// Add all data attributes with intelligent value handling
			dataAttrs
				.sort((a, b) => a.name.localeCompare(b.name))
				.forEach(attr => {
					if (this.shouldOmitAttributeValue(attr.name, attr.value)) {
						selectorParts.push(`[${attr.name}]`);
					} else {
						const value = this.escapeAttributeValue(attr.value);
						selectorParts.push(`[${attr.name}="${value}"]`);
					}
				});

			// Add other significant attributes
			for (const attrName of ['role', 'type', 'name']) {
				const value = element.getAttribute(attrName);
				if (value !== null) {
					const escaped = this.escapeAttributeValue(value);
					selectorParts.push(`[${attrName}="${escaped}"]`);
				}
			}

			return selector + selectorParts.join('');
		} else {
			// Default mode: prioritize most specific selector
			// For default mode, we omit the tag when using strong selectors

			// Check for aria-label (omit tag - aria-label is very specific)
			if (hasAriaLabel) {
				const ariaLabel = element.getAttribute('aria-label');
				const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
				if (escapedAriaLabel) {
					return selector + `[aria-label="${escapedAriaLabel}"]`;
				}
			}

			// Check for data attributes (omit tag - data attributes are specific)
			if (dataAttrs.length > 0) {
				const bestAttr = dataAttrs.sort((a, b) => a.name.length - b.name.length)[0];
				if (this.shouldOmitAttributeValue(bestAttr.name, bestAttr.value)) {
					return selector + `[${bestAttr.name}]`;
				} else {
					const value = this.escapeAttributeValue(bestAttr.value);
					return selector + `[${bestAttr.name}="${value}"]`;
				}
			}

			// Fallback to tag + classes (keep tag - classes are generic)
			let selectorParts: string[] = [tagName];
			if (classes.length > 0) {
				selectorParts.push(classes.map(cls => `.${cls}`).join(''));
			}

			return selector + selectorParts.join('');
		}
	}

	/**
	 * Copy a comprehensive selector to clipboard with parent context
	 */
	copySelectorToClipboard(element: HTMLElement): void {
		// Use generateSelector with specific mode and parent context
		const selector = this.generateSelector(element, true, true);
		copyStringToClipboard(selector, selector);
	}

	/**
	 * Format an attribute for display (used in tooltips)
	 * @param attrName The attribute name
	 * @param attrValue The attribute value
	 * @returns Formatted string like "data-count" or "data-type=\"folder\""
	 */
	formatAttributeForDisplay(attrName: string, attrValue: string): string {
		if (this.shouldOmitAttributeValue(attrName, attrValue)) {
			return attrName;
		}
		return `${attrName}="${attrValue}"`;
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

	/**
	 * Determine if an attribute value should be omitted (dynamic/non-semantic values)
	 * @param attrName The attribute name
	 * @param attrValue The attribute value
	 * @returns true if value should be omitted, false if value should be included
	 */
	private shouldOmitAttributeValue(attrName: string, attrValue: string): boolean {
		// Always include aria-label values (semantic and specific)
		if (attrName === 'aria-label') {
			return false;
		}

		// Check if the value is purely numeric (likely dynamic)
		if (/^\d+$/.test(attrValue)) {
			return true;
		}

		// Check if the value looks like a UUID or ID (hex strings, guids, etc)
		if (/^[a-f0-9]{8,}(-[a-f0-9]{4,})*$/i.test(attrValue)) {
			return true;
		}

		// Check attribute name for common dynamic patterns
		const dynamicPatterns = [
			'count', 'index', 'idx', 'position', 'order', 'number', 'num',
			'id', 'uuid', 'guid', 'key', 'timestamp', 'time'
		];

		const lowerAttrName = attrName.toLowerCase();
		if (dynamicPatterns.some(pattern => lowerAttrName.includes(pattern))) {
			return true;
		}

		// For data-type, data-mode, data-state etc - keep the value (semantic)
		const semanticPatterns = ['type', 'mode', 'state', 'status', 'variant', 'theme', 'view', 'role'];
		if (semanticPatterns.some(pattern => lowerAttrName.includes(pattern))) {
			return false;
		}

		// Default: include the value for safety
		return false;
	}

	/**
	 * Determine if a selector is strong enough to omit the tag name
	 * @param element The HTML element
	 * @param hasId Whether element has an ID
	 * @param hasAriaLabel Whether element has aria-label
	 * @param dataAttrs Available data attributes
	 * @returns true if tag name can be safely omitted
	 */
	private canOmitTagName(
		element: HTMLElement,
		hasId: boolean,
		hasAriaLabel: boolean,
		dataAttrs: Array<{ name: string, value: string }>
	): boolean {
		// Always omit tag for IDs (IDs are globally unique)
		if (hasId) {
			return true;
		}

		// Omit tag for aria-label (usually specific enough)
		if (hasAriaLabel) {
			return true;
		}

		// Omit tag if we have a unique-looking data attribute
		// (attributes with unique-sounding names like data-section, data-view-type, etc)
		const uniquePatterns = ['section', 'view', 'panel', 'modal', 'dialog', 'menu', 'nav'];
		if (dataAttrs.some(attr =>
			uniquePatterns.some(pattern => attr.name.toLowerCase().includes(pattern))
		)) {
			return true;
		}

		// Keep tag name for classes (too generic to omit)
		return false;
	}
}
