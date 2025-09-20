import { setIcon } from 'obsidian';
import { applyAccessibility, AccessibilityPresets, AccessibilityConfig } from '../../../utils/accessibilityHelpers';

export interface CollapsibleCategoryConfig {
	title: string;
	categoryKey: string;
	isExpanded?: boolean;
	classes?: string[];
	headerClasses?: string[];
	contentClasses?: string[];
	onToggle?: (categoryKey: string, isExpanded: boolean) => void;
	accessibilityConfig?: Partial<AccessibilityConfig>;
}

export interface ViewStateManager {
	getCategoryState(categoryKey: string): boolean;
	setCategoryState(categoryKey: string, isExpanded: boolean): void;
	getAllStates(): Record<string, boolean>;
	resetStates(): void;
}

export class CollapsibleCategory {
	private container: HTMLElement;
	private config: CollapsibleCategoryConfig;
	private header: HTMLElement;
	private toggleButton: HTMLElement;
	private content: HTMLElement;
	private chevronIcon: HTMLElement;
	private isExpanded: boolean;

	constructor(container: HTMLElement, config: CollapsibleCategoryConfig) {
		this.container = container;
		this.config = config;
		this.isExpanded = config.isExpanded ?? true;
		this.render();
	}

	private render(): void {
		const categoryElement = this.container.createDiv({
			cls: ['collapsible-category', ...(this.config.classes || [])]
		});

		this.createHeader(categoryElement);
		this.createContent(categoryElement);
		this.updateExpandedState();
	}

	private createHeader(categoryElement: HTMLElement): void {
		this.header = categoryElement.createDiv({
			cls: ['category-header', ...(this.config.headerClasses || [])]
		});

		this.toggleButton = this.header.createDiv('category-toggle');

		this.chevronIcon = this.toggleButton.createSpan('category-chevron');
		setIcon(this.chevronIcon, 'chevron-down');

		const titleElement = this.header.createSpan({
			cls: 'category-title',
			text: this.config.title
		});

		this.setupToggleAccessibility();
		this.setupToggleHandlers();
	}

	private createContent(categoryElement: HTMLElement): void {
		this.content = categoryElement.createDiv({
			cls: ['category-content', ...(this.config.contentClasses || [])]
		});
	}

	private setupToggleAccessibility(): void {
		const accessibilityConfig = {
			...AccessibilityPresets.collapseButton(this.isExpanded),
			...this.config.accessibilityConfig
		};

		applyAccessibility(this.toggleButton, accessibilityConfig);
		this.toggleButton.setAttr('role', 'button');
		this.toggleButton.addClass('clickable-icon');
	}

	private setupToggleHandlers(): void {
		this.toggleButton.addEventListener('click', () => {
			this.toggle();
		});

		this.toggleButton.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.toggle();
			}
		});
	}

	private updateExpandedState(): void {
		const chevronDirection = this.isExpanded ? 'chevron-down' : 'chevron-right';
		setIcon(this.chevronIcon, chevronDirection);

		this.content.toggleClass('expanded', this.isExpanded);
		this.content.toggleClass('collapsed', !this.isExpanded);

		const accessibilityConfig = {
			...AccessibilityPresets.collapseButton(this.isExpanded),
			...this.config.accessibilityConfig
		};
		applyAccessibility(this.toggleButton, accessibilityConfig);
	}

	public toggle(): void {
		this.setExpanded(!this.isExpanded);
	}

	public setExpanded(expanded: boolean): void {
		this.isExpanded = expanded;
		this.updateExpandedState();

		if (this.config.onToggle) {
			this.config.onToggle(this.config.categoryKey, this.isExpanded);
		}
	}

	public getContent(): HTMLElement {
		return this.content;
	}

	public getHeader(): HTMLElement {
		return this.header;
	}

	public isCurrentlyExpanded(): boolean {
		return this.isExpanded;
	}

	public getCategoryKey(): string {
		return this.config.categoryKey;
	}

	public destroy(): void {
		this.header.remove();
		this.content.remove();
	}
}

export class SimpleViewStateManager implements ViewStateManager {
	private states: Record<string, boolean> = {};
	private defaultState: boolean;

	constructor(defaultState: boolean = true) {
		this.defaultState = defaultState;
	}

	getCategoryState(categoryKey: string): boolean {
		return this.states[categoryKey] ?? this.defaultState;
	}

	setCategoryState(categoryKey: string, isExpanded: boolean): void {
		this.states[categoryKey] = isExpanded;
	}

	getAllStates(): Record<string, boolean> {
		return { ...this.states };
	}

	resetStates(): void {
		this.states = {};
	}
}