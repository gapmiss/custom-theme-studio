import { setIcon } from 'obsidian';

export interface ChevronToggleConfig {
	expandedIcon?: string;
	collapsedIcon?: string;
	animationDuration?: number;
	onStateChange?: (isExpanded: boolean) => void;
}

export class ChevronToggle {
	private element: HTMLElement;
	private config: ChevronToggleConfig;
	private isExpanded: boolean;

	constructor(element: HTMLElement, config: ChevronToggleConfig = {}) {
		this.element = element;
		this.config = {
			expandedIcon: 'chevron-down',
			collapsedIcon: 'chevron-right',
			animationDuration: 150,
			...config
		};
		this.isExpanded = false;
	}

	public setExpanded(expanded: boolean, animate: boolean = true): void {
		if (this.isExpanded === expanded) return;

		this.isExpanded = expanded;
		this.updateIcon(animate);

		if (this.config.onStateChange) {
			this.config.onStateChange(this.isExpanded);
		}
	}

	public toggle(animate: boolean = true): void {
		this.setExpanded(!this.isExpanded, animate);
	}

	public getState(): boolean {
		return this.isExpanded;
	}

	private updateIcon(animate: boolean): void {
		const iconName = this.isExpanded ? this.config.expandedIcon! : this.config.collapsedIcon!;

		if (animate && this.config.animationDuration! > 0) {
			this.element.style.transition = `transform ${this.config.animationDuration}ms ease`;
		}

		setIcon(this.element, iconName);

		if (animate && this.config.animationDuration! > 0) {
			setTimeout(() => {
				this.element.style.transition = '';
			}, this.config.animationDuration);
		}
	}

	public destroy(): void {
		this.element.style.transition = '';
	}
}

export function createChevronToggle(
	container: HTMLElement,
	config: ChevronToggleConfig & {
		initialState?: boolean;
		classes?: string[];
	} = {}
): { element: HTMLElement; toggle: ChevronToggle } {
	const element = container.createSpan({
		cls: ['chevron-toggle', ...(config.classes || [])]
	});

	const toggle = new ChevronToggle(element, config);

	if (config.initialState !== undefined) {
		toggle.setExpanded(config.initialState, false);
	}

	return { element, toggle };
}