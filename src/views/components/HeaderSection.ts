import { setIcon } from 'obsidian';
import { UIComponent, ComponentContext } from './UIComponent';
import { createToggleSwitch } from '../../utils/uiHelpers';
import { getCurrentTheme } from '../../utils';

export class HeaderSection extends UIComponent {
	constructor(context: ComponentContext) {
		super(context);
	}

	render(): HTMLElement {
		const section = this.createSection('theme-studio-header');
		this.renderControls(section);
		return section;
	}

	private renderControls(container: HTMLElement): void {
		const toggleContainer = container.createDiv('theme-toggle-container');

		this.renderThemeEnabledToggle(toggleContainer);
		this.renderLightDarkToggle(toggleContainer);
	}

	private renderThemeEnabledToggle(container: HTMLElement): void {
		const { toggle, label } = createToggleSwitch(
			container,
			'theme-toggle-switch',
			'Enable theme',
			this.plugin.settings.themeEnabled,
			async () => {
				this.plugin.themeManager.toggleCustomTheme();
			}
		);
	}

	private renderLightDarkToggle(container: HTMLElement): void {
		const toggleThemeWrapper = container.createDiv('toggle-theme-wrapper');
		const toggleThemeButton = toggleThemeWrapper.createEl('button', {
			cls: 'toggle-theme-mode clickable-icon'
		});

		toggleThemeButton.setAttr('aria-label', 'Toggle light/dark mode');
		toggleThemeButton.setAttr('data-tooltip-position', 'top');
		setIcon(toggleThemeButton, getCurrentTheme(this.app) === 'obsidian' ? 'sun' : 'moon');

		toggleThemeButton.addEventListener('click', async () => {
			this.handleThemeToggle(toggleThemeButton);
		});
	}

	private async handleThemeToggle(toggleButton: HTMLElement): Promise<void> {
		this.app.changeTheme(getCurrentTheme(this.app) === 'obsidian' ? 'moonstone' : 'obsidian');
		setIcon(toggleButton, getCurrentTheme(this.app) === 'obsidian' ? 'sun' : 'moon');
	}

	destroy(): void {
		this.element?.remove();
	}
}