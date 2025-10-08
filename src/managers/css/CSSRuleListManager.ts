import { debounce } from 'obsidian';
import CustomThemeStudioPlugin from '../../main';
import { CustomThemeStudioView } from '../../views/customThemeStudioView';
import { CSSrule } from '../../settings';
import { CSSRuleItemRenderer } from './CSSRuleItemRenderer';

/**
 * Manages the CSS rule list with incremental DOM updates.
 * Avoids full list re-renders by updating only changed items.
 */
export class CSSRuleListManager {
	private plugin: CustomThemeStudioPlugin;
	private view: CustomThemeStudioView;
	private renderer: CSSRuleItemRenderer;
	private container: HTMLElement;

	constructor(
		plugin: CustomThemeStudioPlugin,
		view: CustomThemeStudioView,
		renderer: CSSRuleItemRenderer,
		container: HTMLElement
	) {
		this.plugin = plugin;
		this.view = view;
		this.renderer = renderer;
		this.container = container;
	}

	/**
	 * Add a new rule item to the list in sorted position.
	 * INCREMENTAL UPDATE: Only creates and inserts the new item, no full rebuild.
	 * @returns The created DOM element for scrolling/animation
	 */
	addRuleItem(rule: CSSrule): HTMLElement {
		const sortedRules = [...this.plugin.settings.cssRules].sort((a, b) =>
			a.rule!.localeCompare(b.rule!)
		);
		const position = sortedRules.findIndex(r => r.uuid === rule.uuid);

		// Find the DOM position to insert
		const existingItems = this.container.querySelectorAll('.rule-item');

		let item: HTMLElement;
		if (position === 0 || existingItems.length === 0) {
			// Insert at beginning
			item = this.renderer.createRuleItem(this.container, rule);
			if (existingItems.length > 0) {
				this.container.insertBefore(item, existingItems[0]);
			}
		} else if (position >= existingItems.length) {
			// Insert at end
			item = this.renderer.createRuleItem(this.container, rule);
		} else {
			// Insert at specific position
			item = this.renderer.createRuleItem(this.container, rule);
			this.container.insertBefore(item, existingItems[position]);
		}

		return item;
	}

	/**
	 * Update an existing rule item in place.
	 * INCREMENTAL UPDATE: Only updates the specific item, no full rebuild.
	 * @returns The updated DOM element for scrolling/animation
	 */
	updateRuleItem(uuid: string, rule: CSSrule): HTMLElement | null {
		const item = this.container.querySelector(`[data-cts-uuid="${uuid}"]`) as HTMLElement;
		if (!item) return null;

		// Check if position in sorted list changed
		const sortedRules = [...this.plugin.settings.cssRules].sort((a, b) =>
			a.rule!.localeCompare(b.rule!)
		);
		const newPosition = sortedRules.findIndex(r => r.uuid === uuid);
		const currentPosition = Array.from(this.container.querySelectorAll('.rule-item')).indexOf(item);

		// If position changed, move the element
		if (newPosition !== currentPosition) {
			item.remove();
			const existingItems = this.container.querySelectorAll('.rule-item');
			if (newPosition === 0) {
				this.container.insertBefore(item, existingItems[0]);
			} else if (newPosition >= existingItems.length) {
				this.container.appendChild(item);
			} else {
				this.container.insertBefore(item, existingItems[newPosition]);
			}
		}

		// Update the content
		this.renderer.updateRuleItemContent(item, rule);

		return item;
	}

	/**
	 * Remove a rule item from the list.
	 * INCREMENTAL UPDATE: Only removes the specific item, no full rebuild.
	 */
	removeRuleItem(uuid: string): void {
		const item = this.container.querySelector(`[data-cts-uuid="${uuid}"]`) as HTMLElement;
		if (item) {
			item.remove();
		}
	}

	/**
	 * Toggle a rule's enabled state without re-rendering.
	 * INCREMENTAL UPDATE: Only updates the button icon, no full rebuild.
	 */
	toggleRuleEnabled(uuid: string, enabled: boolean): void {
		const item = this.container.querySelector(`[data-cts-uuid="${uuid}"]`) as HTMLElement;
		if (!item) return;

		const enabledButton = item.querySelector('.rule-item-actions button:nth-child(2)') as HTMLElement;
		if (!enabledButton) return;

		const { setIcon } = require('obsidian');
		if (enabled) {
			setIcon(enabledButton, 'eye');
			enabledButton.setAttr('aria-label', 'Disable this rule');
		} else {
			setIcon(enabledButton, 'eye-off');
			enabledButton.setAttr('aria-label', 'Enable this rule');
		}
	}

	/**
	 * Scroll to an element and apply highlight animation.
	 * Unified method to eliminate duplication and timing workarounds.
	 */
	scrollToAndHighlight(element: HTMLElement): void {
		if (!this.plugin.settings.viewScrollToTop) return;

		// Use debounce to delay scroll until DOM layout is complete
		const scrollDelayed = debounce(() => {
			this.scrollToElement(element);
		}, 100, false);
		scrollDelayed();

		element.addClass('blinking-effect');
		const removeHighlight = debounce(() => {
			element.removeClass('blinking-effect');
		}, 3000, false);
		removeHighlight();
	}

	/**
	 * Scroll to a specific element in the view
	 */
	private scrollToElement(target: HTMLElement): void {
		const container = this.view.containerEl;
		if (container && target) {
			const top = target.offsetTop - 10;
			container.scrollTo({
				top: top,
				behavior: 'smooth'
			});
		}
	}

	/**
	 * Populate the entire list (used for initial render only).
	 * After initial render, use incremental methods.
	 */
	populateList(): void {
		this.container.empty();
		const sortedRules = [...this.plugin.settings.cssRules].sort((a, b) =>
			a.rule!.localeCompare(b.rule!)
		);
		sortedRules.forEach(rule => {
			this.renderer.createRuleItem(this.container, rule);
		});
	}

	/**
	 * Get the container element
	 */
	getContainer(): HTMLElement {
		return this.container;
	}
}
