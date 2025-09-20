/**
 * Accessibility and UI pattern helpers to eliminate code duplication
 */

export interface AccessibilityConfig {
	ariaLabel: string;
	tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
	role?: string;
	tabindex?: number;
}

export interface ToggleAccessibilityConfig {
	expandedLabel: string;
	collapsedLabel: string;
	tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Apply standard accessibility attributes to an element
 */
export function applyAccessibility(element: HTMLElement, config: AccessibilityConfig): void {
	element.setAttr('aria-label', config.ariaLabel);
	element.setAttr('data-tooltip-position', config.tooltipPosition || 'top');

	if (config.role) {
		element.setAttr('role', config.role);
	}

	if (config.tabindex !== undefined) {
		element.setAttr('tabindex', config.tabindex.toString());
	}
}

/**
 * Update accessibility labels for toggle states (expanded/collapsed)
 */
export function updateToggleAccessibility(
	element: HTMLElement,
	isExpanded: boolean,
	config: ToggleAccessibilityConfig
): void {
	const label = isExpanded ? config.expandedLabel : config.collapsedLabel;
	element.setAttr('aria-label', label);
	element.setAttr('data-tooltip-position', config.tooltipPosition || 'top');
}

/**
 * Create a button with standard accessibility setup
 */
export function createAccessibleButton(
	container: HTMLElement,
	config: {
		classes?: string[];
		accessibility: AccessibilityConfig;
		onClick?: (event: MouseEvent) => void;
	}
): HTMLButtonElement {
	const button = container.createEl('button', {
		cls: config.classes?.join(' ') || ''
	});

	applyAccessibility(button, config.accessibility);

	if (config.onClick) {
		button.addEventListener('click', config.onClick);
	}

	return button;
}

/**
 * Batch apply accessibility to multiple elements
 */
export function batchApplyAccessibility(
	elements: Array<{ element: HTMLElement; config: AccessibilityConfig }>
): void {
	elements.forEach(({ element, config }) => {
		applyAccessibility(element, config);
	});
}

/**
 * Common accessibility configurations for frequent use cases
 */
export const AccessibilityPresets = {
	collapseButton: (expanded: boolean): AccessibilityConfig => ({
		ariaLabel: expanded ? 'Collapse section' : 'Expand section',
		tooltipPosition: 'top' as const,
		tabindex: 0
	}),

	clearButton: (): AccessibilityConfig => ({
		ariaLabel: 'Clear input',
		tooltipPosition: 'top' as const,
		tabindex: 0
	}),

	copyButton: (content: string): AccessibilityConfig => ({
		ariaLabel: `Copy ${content} to clipboard`,
		tooltipPosition: 'top' as const,
		tabindex: 0
	}),

	deleteButton: (): AccessibilityConfig => ({
		ariaLabel: 'Delete this item',
		tooltipPosition: 'top' as const,
		tabindex: 0
	}),

	settingsButton: (expanded: boolean): AccessibilityConfig => ({
		ariaLabel: expanded ? 'Hide options' : 'Show options',
		tooltipPosition: 'top' as const,
		tabindex: 0
	}),

	addButton: (itemType: string): AccessibilityConfig => ({
		ariaLabel: `Add ${itemType}`,
		tooltipPosition: 'top' as const,
		tabindex: 0
	})
} as const;