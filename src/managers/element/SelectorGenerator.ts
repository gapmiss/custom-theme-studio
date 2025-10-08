import { copyStringToClipboard } from '../../utils';
import CustomThemeStudioPlugin from '../../main';

/**
 * Generates CSS selectors from HTML elements.
 * Handles both simple and specific selector generation modes.
 *
 * Uses a reference to the plugin to access settings dynamically,
 * ensuring setting changes are immediately recognized.
 */
export class SelectorGenerator {
	private plugin: CustomThemeStudioPlugin;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
	}
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
		const classes = Array.from(element.classList)
			.filter(cls => !cls.includes('cts-element-selector-highlight') && !cls.includes('cts-element-selector-hover'));

		// Determine the effective style based on useSpecific parameter and settings
		let effectiveStyle = this.plugin.settings.selectorStyle;
		if (useSpecific && effectiveStyle !== 'specific') {
			// When useSpecific is true (Alt/Cmd keys), force specific mode
			effectiveStyle = 'specific';
		}

		// Get data attributes (filtered based on effectiveStyle and exclusion patterns)
		const dataAttrs = this.getDataAttributes(element, effectiveStyle);

		let selector = '';

		// Handle parent if requested
		if (includeParent && element.parentElement) {
			const parent = element.parentElement;
			const parentClasses = Array.from(parent.classList)
				.filter(cls => !cls.includes('cts-element-selector-highlight'))
				.map(cls => `.${cls}`)
				.join('');
			selector = `${parent.tagName.toLowerCase()}${parentClasses} > `;
		}

		// Handle ID (highest priority) - always omit tag for IDs unless setting says otherwise
		if (hasId) {
			const idSelector = this.plugin.settings.selectorAlwaysIncludeTag ? `${tagName}#${element.id}` : `#${element.id}`;
			return selector + idSelector;
		}

		// Generate selector based on style
		if (effectiveStyle === 'specific') {
			return selector + this.generateSpecificSelector(element, tagName, hasAriaLabel, dataAttrs, classes);
		} else if (effectiveStyle === 'balanced') {
			return selector + this.generateBalancedSelector(element, tagName, hasAriaLabel, dataAttrs, classes);
		} else {
			// minimal
			return selector + this.generateMinimalSelector(element, tagName, hasAriaLabel, dataAttrs, classes);
		}
	}

	/**
	 * Generate a minimal selector (shortest possible)
	 */
	private generateMinimalSelector(
		element: HTMLElement,
		tagName: string,
		hasAriaLabel: boolean,
		dataAttrs: Array<{ name: string, value: string }>,
		classes: string[]
	): string {
		const alwaysIncludeTag = this.plugin.settings.selectorAlwaysIncludeTag;
		const preferClasses = this.plugin.settings.selectorPreferClasses;

		// OPTION B: aria-label respects preferClasses setting
		// Priority: ID > classes/data-attrs (based on preference) > aria-label > tag

		// Prefer classes over data attributes
		if (preferClasses) {
			// Try classes first
			if (classes.length > 0) {
				const classSelector = classes.map(cls => `.${cls}`).join('');
				return alwaysIncludeTag ? `${tagName}${classSelector}` : classSelector;
			}
			// Fall back to data attributes
			if (dataAttrs.length > 0) {
				const bestAttr = dataAttrs.sort((a, b) => a.name.length - b.name.length)[0];
				let attrSelector = '';
				if (this.shouldOmitAttributeValue(bestAttr.name, bestAttr.value)) {
					attrSelector = `[${bestAttr.name}]`;
				} else {
					const value = this.escapeAttributeValue(bestAttr.value);
					attrSelector = `[${bestAttr.name}="${value}"]`;
				}
				return alwaysIncludeTag ? `${tagName}${attrSelector}` : attrSelector;
			}
		} else {
			// Prefer data attributes over classes
			// Try data attributes first
			if (dataAttrs.length > 0) {
				const bestAttr = dataAttrs.sort((a, b) => a.name.length - b.name.length)[0];
				let attrSelector = '';
				if (this.shouldOmitAttributeValue(bestAttr.name, bestAttr.value)) {
					attrSelector = `[${bestAttr.name}]`;
				} else {
					const value = this.escapeAttributeValue(bestAttr.value);
					attrSelector = `[${bestAttr.name}="${value}"]`;
				}
				return alwaysIncludeTag ? `${tagName}${attrSelector}` : attrSelector;
			}
			// Fall back to classes
			if (classes.length > 0) {
				const classSelector = classes.map(cls => `.${cls}`).join('');
				return alwaysIncludeTag ? `${tagName}${classSelector}` : classSelector;
			}
		}

		// Fallback to aria-label if no classes or data attributes (check if excluded)
		if (hasAriaLabel && !this.isAttributeExcluded('aria-label', 'minimal')) {
			const ariaLabel = element.getAttribute('aria-label');
			const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
			if (escapedAriaLabel) {
				const ariaSelector = `[aria-label="${escapedAriaLabel}"]`;
				return alwaysIncludeTag ? `${tagName}${ariaSelector}` : ariaSelector;
			}
		}

		// Final fallback: just the tag name
		return tagName;
	}

	/**
	 * Generate a balanced selector (tag + one primary attribute)
	 * Balanced mode typically includes the tag, but respects alwaysIncludeTag=false for strong selectors like aria-label
	 */
	private generateBalancedSelector(
		element: HTMLElement,
		tagName: string,
		hasAriaLabel: boolean,
		dataAttrs: Array<{ name: string, value: string }>,
		classes: string[]
	): string {
		const alwaysIncludeTag = this.plugin.settings.selectorAlwaysIncludeTag;
		const preferClasses = this.plugin.settings.selectorPreferClasses;

		// OPTION B: aria-label respects preferClasses setting
		// For balanced mode, we typically include the tag with one attribute
		// This makes it more specific than minimal but shorter than specific
		let selectorParts: string[] = [tagName];

		// Prefer classes or data attributes based on setting
		if (preferClasses) {
			if (classes.length > 0) {
				selectorParts.push(classes.map(cls => `.${cls}`).join(''));
				return selectorParts.join('');
			}
			// Try data attributes if no classes
			if (dataAttrs.length > 0) {
				const bestAttr = dataAttrs.sort((a, b) => a.name.length - b.name.length)[0];
				if (this.shouldOmitAttributeValue(bestAttr.name, bestAttr.value)) {
					selectorParts.push(`[${bestAttr.name}]`);
				} else {
					const value = this.escapeAttributeValue(bestAttr.value);
					selectorParts.push(`[${bestAttr.name}="${value}"]`);
				}
				return selectorParts.join('');
			}
		} else {
			// Prefer data attributes over classes
			if (dataAttrs.length > 0) {
				const bestAttr = dataAttrs.sort((a, b) => a.name.length - b.name.length)[0];
				if (this.shouldOmitAttributeValue(bestAttr.name, bestAttr.value)) {
					selectorParts.push(`[${bestAttr.name}]`);
				} else {
					const value = this.escapeAttributeValue(bestAttr.value);
					selectorParts.push(`[${bestAttr.name}="${value}"]`);
				}
				return selectorParts.join('');
			}
			// Fallback to classes
			if (classes.length > 0) {
				selectorParts.push(classes.map(cls => `.${cls}`).join(''));
				return selectorParts.join('');
			}
		}

		// Fallback to aria-label if no classes or data attributes (check if excluded)
		if (hasAriaLabel && !this.isAttributeExcluded('aria-label', 'balanced')) {
			const ariaLabel = element.getAttribute('aria-label');
			const escapedAriaLabel = this.escapeAttributeValue(ariaLabel!);
			if (escapedAriaLabel) {
				const ariaSelector = `[aria-label="${escapedAriaLabel}"]`;
				// aria-label is specific enough to omit tag if setting allows
				return alwaysIncludeTag ? `${tagName}${ariaSelector}` : ariaSelector;
			}
		}

		return selectorParts.join('');
	}

	/**
	 * Generate a specific selector (all attributes)
	 */
	private generateSpecificSelector(
		element: HTMLElement,
		tagName: string,
		hasAriaLabel: boolean,
		dataAttrs: Array<{ name: string, value: string }>,
		classes: string[]
	): string {
		const omitTag = !this.plugin.settings.selectorAlwaysIncludeTag &&
			this.canOmitTagName(element, false, hasAriaLabel, dataAttrs);
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

		return selectorParts.join('');
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
	 * Check if an attribute name matches a wildcard pattern
	 * Supports * as wildcard (e.g., "data-tooltip-*" matches "data-tooltip-position")
	 * @param attributeName The attribute name to test
	 * @param pattern The pattern with optional wildcards
	 * @returns true if the attribute matches the pattern
	 */
	private matchesPattern(attributeName: string, pattern: string): boolean {
		// Convert wildcard pattern to regex
		// Escape special regex characters, then convert * to .*
		const regexPattern = pattern
			.replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape special chars
			.replace(/\*/g, '.*'); // convert * to .*
		return new RegExp(`^${regexPattern}$`).test(attributeName);
	}

	/**
	 * Check if an attribute should be excluded based on settings
	 * Only applies exclusions in Minimal/Balanced modes
	 * @param attrName The attribute name to check
	 * @param effectiveStyle The current selector style
	 * @returns true if the attribute should be excluded
	 */
	private isAttributeExcluded(attrName: string, effectiveStyle: string): boolean {
		// Only apply exclusions in Minimal/Balanced modes
		// Specific mode includes everything
		if (effectiveStyle === 'specific') {
			return false;
		}

		const patterns = this.plugin.settings.selectorExcludedAttributes
			.split('\n')
			.map(p => p.trim())
			.filter(p => p.length > 0);

		return patterns.some(pattern => this.matchesPattern(attrName, pattern));
	}

	/**
	 * Get all data-* attributes from an element
	 * @param element The HTML element
	 * @param effectiveStyle The current selector style (used for exclusion filtering)
	 */
	private getDataAttributes(element: HTMLElement, effectiveStyle: string): Array<{ name: string, value: string }> {
		const dataAttributes: Array<{ name: string, value: string }> = [];
		// Loop through all attributes
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i];
			if (attr.name.startsWith('data-') &&
			    attr.name !== 'data-reactid' &&
			    !this.isAttributeExcluded(attr.name, effectiveStyle)) {
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
		return value
			// Escape backslashes first (must be done before other escapes)
			.replace(/\\/g, '\\\\')
			// Escape quotes
			.replace(/"/g, '\\"')
			// Replace newlines with CSS escape sequence
			.replace(/\n/g, '\\A ')
			// Replace carriage returns
			.replace(/\r/g, '\\D ')
			// Replace tabs
			.replace(/\t/g, '\\9 ')
			// Replace form feeds
			.replace(/\f/g, '\\C ');
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

		const lowerAttrName = attrName.toLowerCase();

		// Semantic patterns - check FIRST (higher priority)
		// These are meaningful values that should be included
		const semanticPatterns = ['type', 'mode', 'state', 'status', 'variant', 'theme', 'view', 'role', 'path', 'position'];

		// More precise matching: check if attribute ends with -pattern or is exactly data-pattern
		if (semanticPatterns.some(pattern =>
			lowerAttrName.endsWith(`-${pattern}`) || lowerAttrName === `data-${pattern}`
		)) {
			return false;
		}

		// Dynamic patterns - omit these values as they're likely to change
		const dynamicPatterns = [
			'count', 'index', 'idx', 'order', 'number', 'num',
			'id', 'uuid', 'guid', 'key', 'timestamp', 'time'
		];

		// Check if attribute name contains any dynamic pattern
		if (dynamicPatterns.some(pattern => lowerAttrName.includes(pattern))) {
			return true;
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
