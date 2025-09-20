export class DOMReferences {
	private container: HTMLElement;
	private cache = new Map<string, HTMLElement | null>();
	private destroyed = false;

	constructor(container: HTMLElement) {
		this.container = container;
	}

	/**
	 * Get a cached DOM element by selector, with lazy loading
	 */
	get<T extends HTMLElement = HTMLElement>(selector: string): T | null {
		if (this.destroyed) {
			throw new Error('DOMReferences has been destroyed');
		}

		if (!this.cache.has(selector)) {
			const element = this.container.querySelector(selector) as T | null;
			this.cache.set(selector, element);
		}

		return this.cache.get(selector) as T | null;
	}

	/**
	 * Get multiple cached DOM elements by selector
	 */
	getAll<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
		if (this.destroyed) {
			throw new Error('DOMReferences has been destroyed');
		}

		return this.container.querySelectorAll(selector) as NodeListOf<T>;
	}

	/**
	 * Get cached element with type safety and null checking
	 */
	getRequired<T extends HTMLElement = HTMLElement>(selector: string): T {
		const element = this.get<T>(selector);
		if (!element) {
			throw new Error(`Required element not found: ${selector}`);
		}
		return element;
	}

	/**
	 * Invalidate cache for a specific selector
	 */
	invalidate(selector: string): void {
		this.cache.delete(selector);
	}

	/**
	 * Clear all cached references
	 */
	clearCache(): void {
		this.cache.clear();
	}

	/**
	 * Create a scoped DOMReferences instance for a child container
	 */
	scope(childSelector: string): DOMReferences | null {
		const childContainer = this.get(childSelector);
		return childContainer ? new DOMReferences(childContainer) : null;
	}

	/**
	 * Check if an element exists without caching
	 */
	exists(selector: string): boolean {
		return this.container.querySelector(selector) !== null;
	}

	/**
	 * Wait for an element to appear in the DOM
	 */
	async waitFor(selector: string, timeout = 5000): Promise<HTMLElement | null> {
		const startTime = Date.now();

		while (Date.now() - startTime < timeout) {
			const element = this.container.querySelector(selector) as HTMLElement;
			if (element) {
				this.cache.set(selector, element);
				return element;
			}
			await new Promise(resolve => setTimeout(resolve, 50));
		}

		return null;
	}

	/**
	 * Clean up all references and mark as destroyed
	 */
	destroy(): void {
		this.cache.clear();
		this.destroyed = true;
	}
}

/**
 * Typed selector helpers for common element patterns
 */
export const Selectors = {
	// Variables section
	variablesList: '.variable-list',
	variableItems: '.variable-item',
	customVariableItems: '.custom-variable-item',
	variableInputs: '.variable-value-input',
	tagFilters: '.tag-filter-active',

	// Rules section
	ruleItems: '.rule-item',
	rulesList: '.css-rule',
	editorSection: '.css-editor-section',

	// Common UI elements
	searchInputs: '.search-input',
	clearButtons: '.clear-search-input-button',
	collapseIcons: '.collapse-icon.clickable-icon',

	// Form elements
	formInputs: 'input[type="text"]',
	toggleSwitches: 'input[type="checkbox"]',
	buttons: 'button',
} as const;

export type SelectorKey = keyof typeof Selectors;