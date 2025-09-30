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
	 */
	protected getElement<T extends HTMLElement = HTMLElement>(selector: string): T | null {
		return this.domRefs.get<T>(selector);
	}

	/**
	 * Get multiple DOM elements, scoped to this component
	 */
	protected getElements<T extends HTMLElement = HTMLElement>(selector: string): NodeListOf<T> {
		return this.domRefs.getAll<T>(selector);
	}

	/**
	 * Get a required DOM element with error handling
	 */
	protected getRequiredElement<T extends HTMLElement = HTMLElement>(selector: string): T {
		return this.domRefs.getRequired<T>(selector);
	}

	/**
	 * Invalidate DOM cache when structure changes
	 */
	protected invalidateCache(selector?: string): void {
		if (selector) {
			this.domRefs.invalidate(selector);
		} else {
			this.domRefs.clearCache();
		}
	}
}