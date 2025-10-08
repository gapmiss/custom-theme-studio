import { setIcon } from 'obsidian';
import { UI_CONSTANTS } from '../constants';

export interface CollapsibleSectionConfig {
	title: string;
	expanded: boolean;
	onToggle: (expanded: boolean) => void;
}

export interface IconButtonConfig {
	icon: string;
	label: string;
	tooltip?: string;
	onClick: () => void;
	classes?: string[];
}

export interface SearchInputConfig {
	placeholder: string;
	onInput: (value: string) => void;
	onClear?: () => void;
}

export function createCollapsibleSection(
	container: HTMLElement,
	config: CollapsibleSectionConfig
): { header: HTMLElement; content: HTMLElement; toggleIcon: HTMLElement } {
	const section = container.createDiv('collapsible');
	const header = section.createDiv('collapsible-header');

	header.createSpan({ text: config.title });

	const toggleIcon = header.createEl('button', {
		cls: 'collapse-icon clickable-icon',
		attr: {
			tabindex: '0',
			'aria-label': config.expanded ? 'Collapse section' : 'Expand section',
			'data-tooltip-position': 'top'
		}
	});

	const content = section.createDiv('collapsible-content');
	content.toggleClass('show', config.expanded);
	content.toggleClass('hide', !config.expanded);
	setIcon(toggleIcon, config.expanded ? 'chevron-down' : 'chevron-right');

	header.addEventListener('click', () => {
		const shouldExpand = content.hasClass('hide');
		content.toggleClass('show', shouldExpand);
		content.toggleClass('hide', !shouldExpand);
		setIcon(toggleIcon, shouldExpand ? 'chevron-down' : 'chevron-right');
		toggleIcon.setAttr('aria-label', shouldExpand ? 'Collapse section' : 'Expand section');
		config.onToggle(shouldExpand);
	});

	return { header, content, toggleIcon };
}

export function createIconButton(
	container: HTMLElement,
	config: IconButtonConfig
): HTMLButtonElement {
	const button = container.createEl('button', {
		cls: ['clickable-icon', ...(config.classes || [])].join(' '),
		attr: {
			'aria-label': config.label,
			'data-tooltip-position': config.tooltip || 'top',
			tabindex: '0'
		}
	});

	setIcon(button, config.icon);
	button.addEventListener('click', config.onClick);

	return button;
}

export function createSearchInput(
	container: HTMLElement,
	config: SearchInputConfig
): { searchInput: HTMLInputElement; clearButton?: HTMLButtonElement } {
	const searchContainer = container.createDiv('search-container');
	const clearInputContainer = searchContainer.createDiv('clear-search-input');

	const searchInput = clearInputContainer.createEl('input', {
		cls: 'search-input',
		attr: {
			type: 'text',
			placeholder: config.placeholder
		}
	});

	searchInput.addEventListener('input', (e) => {
		const value = (e.target as HTMLInputElement).value.trim();
		config.onInput(value);

		if (value && !searchInput.classList.contains('clear-search-input--touched')) {
			searchInput.classList.add('clear-search-input--touched');
		} else if (!value && searchInput.classList.contains('clear-search-input--touched')) {
			searchInput.classList.remove('clear-search-input--touched');
		}
	});

	let clearButton: HTMLButtonElement | undefined;
	if (config.onClear) {
		clearButton = clearInputContainer.createEl('button', {
			cls: 'clear-search-input-button',
			attr: {
				'aria-label': 'Clear search',
				'data-tooltip-position': 'top',
				tabindex: '0'
			}
		});

		clearButton.addEventListener('click', () => {
			searchInput.value = '';
			searchInput.focus();
			searchInput.trigger('input');
			searchInput.classList.remove('clear-search-input--touched');
			if (config.onClear) {
				config.onClear();
			}
		});
	}

	return { searchInput, clearButton };
}

export function createToggleSwitch(
	container: HTMLElement,
	id: string,
	label: string,
	checked: boolean,
	onChange: (checked: boolean) => void
): { toggle: HTMLInputElement; label: HTMLLabelElement } {
	const toggleContainer = container.createDiv('toggle-container');

	const toggle = toggleContainer.createEl('input', {
		attr: {
			type: 'checkbox',
			id: id
		}
	});
	toggle.checked = checked;

	const labelEl = toggleContainer.createEl('label', {
		text: label
	});
	labelEl.setAttr('for', id);

	toggle.addEventListener('change', () => {
		onChange(toggle.checked);
	});

	return { toggle, label: labelEl };
}

/**
 * Smooth scroll to an element within a container
 * @param container The scrollable container element
 * @param target The target element to scroll to
 * @param offset Offset from the top in pixels
 */
export function smoothScrollToElement(
	container: HTMLElement,
	target: HTMLElement,
	offset: number = UI_CONSTANTS.SCROLL_OFFSET
): void {
	const top = target.offsetTop - offset;
	container.scrollTo({
		top: top,
		behavior: 'smooth'
	});
}