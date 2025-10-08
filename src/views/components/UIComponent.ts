import { App } from 'obsidian';
import CustomThemeStudioPlugin from '../../main';
import { CustomThemeStudioSettings } from '../../settings';
import { SettingsManager } from '../../managers/SettingsManager';
import { CSSEditorManager } from '../../managers/css/CSSEditorManager';
import { ElementSelectorManager } from '../../managers/element/ElementSelectorManager';
import { CSSVariableManager } from '../../managers/cssVariabManager';
import { DOMReferences } from '../../utils/DOMReferences';

export interface ComponentContext {
	app: App;
	plugin: CustomThemeStudioPlugin;
	settings: CustomThemeStudioSettings;
	containerEl: HTMLElement;
	cssEditorManager: CSSEditorManager;
	elementSelectorManager: ElementSelectorManager;
	cssVariableManager: CSSVariableManager;
}

export abstract class UIComponent {
	protected app: App;
	protected plugin: CustomThemeStudioPlugin;
	protected settings: CustomThemeStudioSettings;
	protected settingsManager: SettingsManager;
	protected container: HTMLElement;
	protected element: HTMLElement | null = null;
	protected cssEditorManager: CSSEditorManager;
	protected elementSelectorManager: ElementSelectorManager;
	protected cssVariableManager: CSSVariableManager;
	protected domRefs: DOMReferences;

	constructor(context: ComponentContext) {
		this.app = context.app;
		this.plugin = context.plugin;
		this.settings = context.settings;
		this.settingsManager = context.plugin.settingsManager;
		this.container = context.containerEl;
		this.cssEditorManager = context.cssEditorManager;
		this.elementSelectorManager = context.elementSelectorManager;
		this.cssVariableManager = context.cssVariableManager;
		this.domRefs = new DOMReferences(context.containerEl);
	}

	abstract render(): HTMLElement;

	destroy(): void {
		this.domRefs.destroy();
		this.element?.remove();
	}

	protected createSection(className: string): HTMLElement {
		this.element = this.container.createDiv(className);
		this.domRefs = new DOMReferences(this.element);
		return this.element;
	}

	protected saveSettings(): Promise<void> {
		return this.plugin.saveSettings();
	}

	protected isVisible(): boolean {
		return this.element ? !this.element.hasClass('hide') : false;
	}

	protected toggle(show?: boolean): void {
		if (!this.element) return;

		const shouldShow = show ?? this.element.hasClass('hide');
		this.element.toggleClass('show', shouldShow);
		this.element.toggleClass('hide', !shouldShow);
	}

	/**
	 * Get a DOM element with caching, scoped to this component
	 *
	 * BEST PRACTICES:
	 * - Use for elements that are accessed multiple times
	 * - Call invalidateCache() after DOM modifications
	 * - Prefer this over direct querySelector() for repeated queries
	 *
	 * @example
	 * const header = this.getElement<HTMLDivElement>('.header');
	 */
	protected getElement<T extends HTMLElement = HTMLElement>(selector: string): T | null {
		return this.domRefs.get<T>(selector);
	}

	/**
	 * Get multiple DOM elements, scoped to this component
	 *
	 * NOTE: This is NOT cached and always returns fresh results.
	 * Use for dynamic collections that change frequently.
	 *
	 * @example
	 * const items = this.getElements('.item'); // Always fresh
	 */
	protected getElements<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
		return this.domRefs.getAll<T>(selector);
	}

	/**
	 * Get a required DOM element with error handling
	 *
	 * Throws an error if element not found. Use for critical elements
	 * that must exist for the component to function.
	 */
	protected getRequiredElement<T extends HTMLElement = HTMLElement>(selector: string): T {
		return this.domRefs.getRequired<T>(selector);
	}

	/**
	 * Invalidate DOM cache when structure changes
	 *
	 * Call this after:
	 * - Adding/removing elements from the DOM
	 * - Replacing element content
	 * - Any operation that changes the DOM structure
	 *
	 * @param selector Specific selector to invalidate, or omit to clear all
	 * @example
	 * this.invalidateCache('.variable-list'); // Clear specific
	 * this.invalidateCache(); // Clear all cache
	 */
	protected invalidateCache(selector?: string): void {
		if (selector) {
			this.domRefs.invalidate(selector);
		} else {
			this.domRefs.clearCache();
		}
	}
}