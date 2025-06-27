import { App, PluginSettingTab, Setting, Notice, setIcon } from 'obsidian';
import { AceLightThemesList, AceDarkThemesList, AceKeyboardList } from '../services/AceThemes';
import { confirm } from '../modals/confirmModal';
import CustomThemeStudioPlugin from '../main';
import settingsIO from './settingsIO';

export interface CustomElement {
	uuid: string;
	selector: string;
	css: string;
	name?: string;
	enabled: boolean;
}

export interface CSSVariable {
    parent: string;
	variable: string;
	value: string;
}

export interface CustomThemeStudioSettings {
	themeEnabled: boolean;
	customCSS: string;
	customVariables: CSSVariable[];
	customElements: CustomElement[];
	exportThemeName: string;
	exportAuthor: string;
	exportURL: string;
	exportPrettierFormat: boolean;
	lastSelectedSelector: string;
	collapsedCSSVariables: boolean;
	collapsedElementCustomization: boolean;
	collapsedExportTheme: boolean;
	autoApplyChanges: boolean;
	generateComputedCSS: boolean;
	showConfirmation: boolean;
	enableColorPicker: boolean;
	enableAceColorPicker: boolean;
	EditorLineNumbers: boolean;
	EditorWordWrap: boolean;
	EditorFontSize: number;
	EditorFontFamily: string;
	EditorTabWidth: any;
	EditorTheme: string;
	EditorLightTheme: string;
	EditorDarkTheme: string;
	EditorKeyboard: string;
}

export const DEFAULT_SETTINGS: CustomThemeStudioSettings = {
	themeEnabled: false,
	customCSS: '',
	customVariables: [],
	customElements: [],
	exportThemeName: 'My Custom Theme',
	exportAuthor: '',
	exportURL: '',
	exportPrettierFormat: true,
	lastSelectedSelector: '',
	collapsedCSSVariables: false,
	collapsedElementCustomization: false,
	collapsedExportTheme: false,
	autoApplyChanges: false,
	generateComputedCSS: false,
	showConfirmation: true,
	enableColorPicker: false,
	enableAceColorPicker: true,
	EditorLineNumbers: true,
	EditorWordWrap: false,
	EditorFontSize: 15,
	EditorFontFamily: '',
	EditorTabWidth: 4,
	EditorTheme: 'Auto',
	EditorLightTheme: 'github_light_default',
	EditorDarkTheme: 'github_dark',
	EditorKeyboard: 'default'
};

const THEME_COLOR: any = {
	Auto: 'Auto',
	Light: 'Light',
	Dark: 'Dark',
};

export class CustomThemeStudioSettingTab extends PluginSettingTab {
	plugin: CustomThemeStudioPlugin;

	constructor(app: App, plugin: CustomThemeStudioPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enable custom theme')
			.setDesc('Toggle your custom theme on or off.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.themeEnabled)
				.onChange(async (value) => {
					this.plugin.settings.themeEnabled = value;
					if (value) {
						this.plugin.themeManager.applyCustomTheme();
					} else {
						this.plugin.themeManager.removeCustomTheme();
					}
					await this.plugin.saveSettings();
					let themeToggle: HTMLInputElement | null = window.document.querySelector('.cts-view [id="theme-toggle-switch"]');
					if (themeToggle) {
						if (value) {
							themeToggle.checked = true;
						} else {
							themeToggle.checked = false;
						}
					}
				})
			);

		new Setting(containerEl)
			.setName('Show confirmations')
			.setDesc('Show a confirmation dialog warning about unsaved changes when leaving a CSS editor.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showConfirmation)
				.onChange(async (value) => {
					this.plugin.settings.showConfirmation = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl('h3', { text: 'CSS variables options' });

		new Setting(containerEl)
			.setName('Enable color picker')
			.setDesc('Enable a color picker for CSS variables that have a default HEX color value (requires the plugin\'s view to be reloaded to take effect).')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableColorPicker)
				.onChange(async (value) => {
					this.plugin.settings.enableColorPicker = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl('h3', { text: 'CSS editor options' });

		new Setting(containerEl)
			.setName('Auto-apply changes')
			.setDesc('For custom elements, automatically preview changes "live" as you make them. Changes become permanent once the CSS is saved.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoApplyChanges)
				.onChange(async (value) => {
					this.plugin.settings.autoApplyChanges = value;
					await this.plugin.saveSettings();
				})
			);

		let noticeDiv = this.containerEl.createDiv({cls: 'auto-apply-changes-notice'});
		let noticeIcon = noticeDiv.createDiv({cls: 'auto-apply-changes-notice-icon'});
		noticeIcon.setAttribute('aria-label', 'Notice');
		noticeIcon.setAttribute('data-tooltip-position', 'top');
		let noticeText = noticeDiv.createDiv({cls: 'auto-apply-changes-notice-text'});
		noticeText.textContent = 'When enabled, every keystroke triggers a "live" refresh of your theme. This can lead to unwanted styling and possibly make Obsidian unusable.';
		setIcon((noticeIcon), 'alert-triangle');

		this.containerEl.appendChild(noticeDiv);


		new Setting(containerEl)
			.setName('Generate CSS')
			.setDesc('For custom elements, when selecting an element, automatically generate CSS rules with the most common properties.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.generateComputedCSS)
				.onChange(async (value) => {
					this.plugin.settings.generateComputedCSS = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Color picker')
			.setDesc('For custom elements, enable an inline color picker in the CSS editor.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAceColorPicker)
				.onChange(async (value) => {
					this.plugin.settings.enableAceColorPicker = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Theme')
			.setDesc('Choose a theme for the CSS editor, "Auto" defaults to theme of Obsidian.')
			.addDropdown(async (dropdown) => {
				for (const key in THEME_COLOR) {
					dropdown.addOption(key, key);
				}
				dropdown.setValue(this.plugin.settings.EditorTheme);
				dropdown.onChange(async (option) => {
					this.plugin.settings.EditorTheme = option;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Light theme')
			.setDesc('')
			.addDropdown((dropdown) => {
				AceLightThemesList.forEach((theme) => {
					dropdown
						.addOption(theme.value, theme.display)
				})
				dropdown
					.setValue(this.plugin.settings.EditorLightTheme)
					.onChange(async (newValue) => {
						this.plugin.settings.EditorLightTheme = newValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Dark theme')
			.setDesc('')
			.addDropdown((dropdown) => {
				AceDarkThemesList.forEach((theme) => {
					dropdown
						.addOption(theme.value, theme.display)
				})
				dropdown
					.setValue(this.plugin.settings.EditorDarkTheme)
					.onChange(async (newValue) => {
						this.plugin.settings.EditorDarkTheme = newValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Keyboard')
			.setDesc('')
			.addDropdown((dropdown) => {
				AceKeyboardList.forEach((binding) => {
					dropdown.addOption(binding, binding)
				})
				dropdown
					.setValue(this.plugin.settings.EditorKeyboard)
					.onChange(async (newValue) => {
						this.plugin.settings.EditorKeyboard = newValue;
						await this.plugin.saveSettings();
					});
			});

		let fontSizeText: HTMLDivElement;
		new Setting(containerEl)
			.setName('Font size')
			.setDesc('Set the font size of the CSS editor.')
			.addSlider(slider => slider
				.setLimits(5, 30, 1)
				.setValue(this.plugin.settings.EditorFontSize)
				.onChange(async (value) => {
					fontSizeText.innerText = ' ' + value.toString();
					this.plugin.settings.EditorFontSize = value;
					this.plugin.saveSettings();
				}))
			.settingEl.createDiv('cts-font-size-setting', (el) => {
				fontSizeText = el;
				el.innerText = ' ' + this.plugin.settings.EditorFontSize.toString();
			});

		new Setting(containerEl)
			.setName('Font family')
			.setDesc('Custom font for the CSS editor.')
			.addText(text => text
				.setValue(this.plugin.settings.EditorFontFamily)
				.onChange(async (value) => {
					this.plugin.settings.EditorFontFamily = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Tab width')
			.setDesc('Number of spaces a tab character will render as.')
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						'2': '2',
						'4': '4',
					})
					.setValue(this.plugin.settings.EditorTabWidth)
					.onChange(async (newValue) => {
						this.plugin.settings.EditorTabWidth = newValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Wordwrap')
			.setDesc('Enable word wrapping.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.EditorWordWrap)
				.onChange(async (value) => {
					this.plugin.settings.EditorWordWrap = value;
					await this.plugin.saveSettings();

				}));

		new Setting(containerEl)
			.setName('Line numbers')
			.setDesc('Enable line numbers.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.EditorLineNumbers)
				.onChange(async (value) => {
					this.plugin.settings.EditorLineNumbers = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Reload view')
			.setDesc('CSS editor options require the plugin\'s view to be reloaded to take effect.')
			.addButton(button => button
				.setButtonText('Reload')
				.setClass('mod-destructive')
				.onClick(async () => {
					if (await confirm('You may have unsaved changes. Reloading the view will reload all forms. Continue?', this.plugin.app)) {
						try {
							await this.plugin.reloadView();
							new Notice('The Custom Theme Studio view has been reloaded');
						} catch (error) {
							console.error(error);
							new Notice('Failed to reload view. Check developer console for details.', 10000);
						}
					}
				}));

		containerEl.createEl('h3', { text: 'Export options' });

		new Setting(containerEl)
			.setName('Theme name')
			.setDesc('The name or title for your exported theme.')
			.addText(text => text
				.setValue(this.plugin.settings.exportThemeName)
				.onChange(async (value) => {
					this.plugin.settings.exportThemeName = value;
					await this.plugin.saveSettings();
					let varInput: HTMLInputElement | null = window.document.querySelector('.cts-view .export-form-theme-name');
					varInput!.value = value;
				}));

		new Setting(containerEl)
			.setName('Author name')
			.setDesc('Your name as the theme author.')
			.addText(text => text
				.setValue(this.plugin.settings.exportAuthor)
				.onChange(async (value) => {
					this.plugin.settings.exportAuthor = value;
					await this.plugin.saveSettings();
					let varInput: HTMLInputElement | null = window.document.querySelector('.cts-view .export-form-theme-author');
					if (varInput) {
						varInput!.value = value;
					}
				}));

		new Setting(containerEl)
			.setName('Author URL')
			.setDesc('URL to your github profile page (e.g. https://github.com/username).')
			.addText(text => text
				.setValue(this.plugin.settings.exportURL)
				.onChange(async (value) => {
					this.plugin.settings.exportURL = value;
					await this.plugin.saveSettings();
					let varInput: HTMLInputElement | null = window.document.querySelector('.cts-view .export-form-theme-url');
					if (varInput) {
						varInput!.value = value;
					}
				}));

		new Setting(containerEl)
			.setName('Prettier formatting')
			.setDesc('Automatically format CSS using Prettier formatter.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.exportPrettierFormat)
				.onChange(async (value) => {
					this.plugin.settings.exportPrettierFormat = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl('h3', { text: 'Backup options' });

		new Setting(containerEl)
			.setName('Export/Import settings')
			.setDesc('Import will replace the current settings. If you aren\'t prompted to choose a location, then the file will be exported to/imported from the vault root as CTS_settings.json (json files aren\'t visible in the vault by default).')
			.addButton((button) => {
				button.setButtonText('Export');
				button.onClick(async () => {
					settingsIO.exportSettings(this.plugin.settings, this.app);
				});
			})
			.addButton((button) => {
				button.setButtonText('Import');
				button.onClick(async () => {
					const importedSettings = await settingsIO.importSettings(this.app);
					if (importedSettings) {
						this.plugin.settings = importedSettings;
						await this.plugin.saveData(this.plugin.settings);
						this.reload();
					}
				});
			});

		containerEl.createEl('h3', { text: 'Reset options', cls: 'reset-options-heading' });

		new Setting(containerEl)
			.setName('Reset theme')
			.setDesc('Reset all theme customizations.')
			.addButton(button => button
				.setButtonText('Reset')
				.setClass('mod-destructive')
				.onClick(async () => {
					if (await confirm('Are you sure you want to reset all theme customizations? This cannot be undone.', this.plugin.app)) {
						this.plugin.settings.customCSS = '';
						this.plugin.settings.customVariables = [];
						this.plugin.settings.customElements = [];
						this.plugin.settings.themeEnabled = false;

						// Apply changes
						this.plugin.themeManager.removeCustomTheme();
						if (this.plugin.settings.themeEnabled) {
							this.plugin.themeManager.applyCustomTheme();
						}

						await this.plugin.saveSettings();

						// Refresh the view if it's open
						const leaves = this.app.workspace.getLeavesOfType('cts-view');
						if (leaves.length > 0) {
							this.plugin.reloadView();
						}
						this.display();
						new Notice('Theme has been reset');
					}
				}));

	}

	/** Reloads the plugin */
	async reload() {
		// @ts-ignore
		await this.app.plugins.disablePlugin('custom-theme-studio');
		// @ts-ignore
		await this.app.plugins.enablePlugin('custom-theme-studio');
		// @ts-ignore
		this.app.setting.openTabById('custom-theme-studio').display();
	}

}
