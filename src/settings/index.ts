import { App, PluginSettingTab, Setting, Notice, setIcon } from 'obsidian';
import { AceLightThemesList, AceDarkThemesList, AceKeyboardList } from '../ace/AceThemes';
import { confirm } from '../modals/confirmModal';
import CustomThemeStudioPlugin from '../main';
import settingsIO from './settingsIO';

export interface CSSrule {
	uuid: string;
	rule: string;
	css: string;
	enabled: boolean;
}

export interface CSSVariable {
	uuid: string | undefined;
	parent: string;
	variable: string;
	value: string;
}

export interface CustomThemeStudioSettings {
	themeEnabled: boolean;
	customCSS: string;
	cssVariables: CSSVariable[];
	cssRules: CSSrule[];
	exportThemeName: string;
	exportThemeAuthor: string;
	exportThemeURL: string;
	exportThemeIncludeDisabled: boolean;
	exportPrettierFormat: boolean;
	lastSelectedSelector: string;
	expandCSSVariables: boolean;
	expandCSSRules: boolean;
	expandExportTheme: boolean;
	autoApplyChanges: boolean;
	variableInputListener: string;
	generateComputedCSS: boolean;
	showConfirmation: boolean;
	enableFontImport: boolean;
	enableColorPicker: boolean;
	enableAceAutoCompletion: boolean;
	enableAceSnippets: boolean;
	enableAceColorPicker: boolean;
	editorLineNumbers: boolean;
	editorWordWrap: boolean;
	editorFontSize: number;
	editorFontFamily: string;
	editorTabWidth: any;
	editorTheme: string;
	editorLightTheme: string;
	editorDarkTheme: string;
	editorKeyboard: string;
	viewScrollToTop: boolean;
}

export const DEFAULT_SETTINGS: CustomThemeStudioSettings = {
	themeEnabled: false,
	customCSS: '',
	cssVariables: [],
	cssRules: [],
	exportThemeName: 'My Custom Theme',
	exportThemeAuthor: 'Anonymous',
	exportThemeURL: 'https://github.com/obsidianmd',
	exportThemeIncludeDisabled: false,
	exportPrettierFormat: true,
	lastSelectedSelector: '',
	expandCSSVariables: false,
	expandCSSRules: false,
	expandExportTheme: false,
	autoApplyChanges: false,
	variableInputListener: 'change',
	generateComputedCSS: false,
	showConfirmation: true,
	enableFontImport: false,
	enableColorPicker: false,
	enableAceAutoCompletion: false,
	enableAceSnippets: false,
	enableAceColorPicker: false,
	editorLineNumbers: true,
	editorWordWrap: false,
	editorFontSize: 15,
	editorFontFamily: '',
	editorTabWidth: 4,
	editorTheme: 'Auto',
	editorLightTheme: 'github_light_default',
	editorDarkTheme: 'github_dark',
	editorKeyboard: 'default',
	viewScrollToTop: true
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
					// Update view checkbox
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
			.setName('Reload view')
			.setDesc('Most settings under CSS variables & CSS rules require the plugin\'s view to be reloaded to take effect.')
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
				})
			);

		containerEl.createEl(
			'h3',
			{
				cls: 'cts-settings-h3',
				text: 'CSS variables'
			}
		);

		new Setting(containerEl)
			.setName('Variable input listener')
			.setDesc('When to listen for value changes to trigger a CSS update. "Input" will update the CSS on every keystroke. "Change" will update the CSS when the cursor leaves the text input form.')
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						'input': 'input',
						'change': 'change',
					})
					.setValue(this.plugin.settings.variableInputListener)
					.onChange(async (newValue) => {
						this.plugin.settings.variableInputListener = newValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Color picker')
			.setDesc('Enable a color picker for CSS variables that have a default HEX color value.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableColorPicker)
				.onChange(async (value) => {
					this.plugin.settings.enableColorPicker = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl(
			'h3',
			{
				cls: 'cts-settings-h3',
				text: 'CSS rules'
			}
		);

		new Setting(containerEl)
			.setName('Font import')
			.setDesc('Enable font imports to create @font-face CSS rules.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableFontImport)
				.onChange(async (value) => {
					this.plugin.settings.enableFontImport = value;
					await this.plugin.saveSettings();
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

		new Setting(containerEl)
			.setName('Generate CSS')
			.setDesc('When using the element picker, automatically generate CSS rules with the most common properties.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.generateComputedCSS)
				.onChange(async (value) => {
					this.plugin.settings.generateComputedCSS = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl(
			'h3',
			{
				cls: 'cts-settings-h3',
				text: 'CSS editor'
			}
		);

		new Setting(containerEl)
			.setName('Auto-apply changes')
			.setDesc('Automatically preview changes "live" as you make them. Changes become permanent once the CSS is saved.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoApplyChanges)
				.onChange(async (value) => {
					this.plugin.settings.autoApplyChanges = value;
					await this.plugin.saveSettings();
				})
			);

		let noticeDiv = this.containerEl.createDiv('cts-auto-apply-changes-notice');
		let noticeIcon = noticeDiv.createDiv('cts-auto-apply-changes-notice-icon');
		noticeIcon.setAttribute('aria-label', 'Notice');
		noticeIcon.setAttribute('data-tooltip-position', 'top');
		let noticeText = noticeDiv.createDiv('cts-auto-apply-changes-notice-text');
		noticeText.textContent = 'When enabled, every keystroke triggers a "live" refresh of your theme. This can lead to unwanted styling and possibly make Obsidian unusable.';
		setIcon((noticeIcon), 'alert-triangle');

		this.containerEl.appendChild(noticeDiv);


		new Setting(containerEl)
			.setName('Color picker')
			.setDesc('Enable an inline color picker in the CSS editor.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAceColorPicker)
				.onChange(async (value) => {
					this.plugin.settings.enableAceColorPicker = value;
					await this.plugin.saveSettings();
				})
			);

		let liveAutoCompletiongsToggle = new Setting(containerEl)
			.setName('Live auto completion')
			.setDesc('Enable auto completion of keywords and text including snippets.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAceAutoCompletion)
				.onChange(async (value) => {
					if (!value) {
						if (snippetsToggle.settingEl.querySelector('.checkbox-container')?.hasClass('is-enabled')) {
							new Notice('Snippets are enabled and require that "Live auto completion" be enabled. Please disable the below "Snippets" toggle before disabling this setting.', 10000);
							toggle.setValue(true);
							return;
						}
					}
					this.plugin.settings.enableAceAutoCompletion = value;
					await this.plugin.saveSettings();
				})
			);

		let snippetsToggle = new Setting(containerEl)
			.setName('Snippets')
			.setDesc('Enable inline snippets in the CSS editor. These auto-complete snippets include every CSS variable within Obsidian. Requires the above "Live auto completion" toggle to be enabled.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAceSnippets)
				.onChange(async (value) => {
					this.plugin.settings.enableAceSnippets = value;
					if (value) {
						if (!liveAutoCompletiongsToggle.settingEl.querySelector('.checkbox-container')?.hasClass('is-enabled')) {
							new Notice('Please enable the above "Live auto completion" toggle before enabling this setting.', 10000);
							toggle.setValue(false);
							this.plugin.settings.enableAceSnippets = false;
						}
					} else {
						new Notice('Disabling this setting requires a reload of the Obsidian window. From the command pallete, run the command "Reload app without saving." … Click this message to dismiss.', 0);
					}
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
				dropdown.setValue(this.plugin.settings.editorTheme);
				dropdown.onChange(async (option) => {
					this.plugin.settings.editorTheme = option;
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Light theme')
			.setDesc('')
			.addDropdown((dropdown) => {
				AceLightThemesList.forEach((theme) => {
					dropdown
						.addOption(theme.value, theme.name)
				})
				dropdown
					.setValue(this.plugin.settings.editorLightTheme)
					.onChange(async (newValue) => {
						this.plugin.settings.editorLightTheme = newValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Dark theme')
			.setDesc('')
			.addDropdown((dropdown) => {
				AceDarkThemesList.forEach((theme) => {
					dropdown
						.addOption(theme.value, theme.name)
				})
				dropdown
					.setValue(this.plugin.settings.editorDarkTheme)
					.onChange(async (newValue) => {
						this.plugin.settings.editorDarkTheme = newValue;
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
					.setValue(this.plugin.settings.editorKeyboard)
					.onChange(async (newValue) => {
						this.plugin.settings.editorKeyboard = newValue;
						await this.plugin.saveSettings();
					});
			});

		let fontSizeText: HTMLDivElement;
		new Setting(containerEl)
			.setName('Font size')
			.setDesc('Set the font size of the CSS editor.')
			.addSlider(slider => slider
				.setLimits(5, 30, 1)
				.setValue(this.plugin.settings.editorFontSize)
				.onChange(async (value) => {
					fontSizeText.innerText = ' ' + value.toString();
					this.plugin.settings.editorFontSize = value;
					this.plugin.saveSettings();
				}))
			.settingEl.createDiv(
				'cts-font-size-setting',
				(el) => {
					fontSizeText = el;
					el.innerText = ' ' + this.plugin.settings.editorFontSize.toString();
				}
			);

		new Setting(containerEl)
			.setName('Font family')
			.setDesc('Custom font for the CSS editor.')
			.addText(text => text
				.setValue(this.plugin.settings.editorFontFamily)
				.onChange(async (value) => {
					this.plugin.settings.editorFontFamily = value;
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
					.setValue(this.plugin.settings.editorTabWidth)
					.onChange(async (newValue) => {
						this.plugin.settings.editorTabWidth = newValue;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Wordwrap')
			.setDesc('Enable word wrapping.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.editorWordWrap)
				.onChange(async (value) => {
					this.plugin.settings.editorWordWrap = value;
					await this.plugin.saveSettings();

				}));

		new Setting(containerEl)
			.setName('Line numbers')
			.setDesc('Enable line numbers.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.editorLineNumbers)
				.onChange(async (value) => {
					this.plugin.settings.editorLineNumbers = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl(
			'h3',
			{
				cls: 'cts-settings-h3',
				text: 'Theme export'
			}
		);

		containerEl.createDiv(
			{
				cls: 'cts-theme-export-description',
				text: 'These settings can also be changed at time of export.'
			}
		);

		new Setting(containerEl)
			.setName('Theme name')
			.setDesc('The name or title for your exported theme. ')
			.addText(text => text
				.setValue(this.plugin.settings.exportThemeName)
				.onChange(async (value) => {
					this.plugin.settings.exportThemeName = value;
					await this.plugin.saveSettings();
					let varInput: HTMLInputElement | null = window.document.querySelector('.cts-view .export-form-theme-name');
					if (varInput) {
						varInput!.value = value;
					}
				}));

		new Setting(containerEl)
			.setName('Author name')
			.setDesc('Your name as the theme author. ')
			.addText(text => text
				.setValue(this.plugin.settings.exportThemeAuthor)
				.onChange(async (value) => {
					this.plugin.settings.exportThemeAuthor = value;
					await this.plugin.saveSettings();
					let varInput: HTMLInputElement | null = window.document.querySelector('.cts-view .export-form-theme-author');
					if (varInput) {
						varInput!.value = value;
					}
				}));

		new Setting(containerEl)
			.setName('Author URL')
			.setDesc('URL to your github profile page (e.g. https://github.com/username). ')
			.addText(text => text
				.setValue(this.plugin.settings.exportThemeURL)
				.onChange(async (value) => {
					this.plugin.settings.exportThemeURL = value;
					await this.plugin.saveSettings();
					let varInput: HTMLInputElement | null = window.document.querySelector('.cts-view .export-form-theme-url');
					if (varInput) {
						varInput!.value = value;
					}
				}));

		new Setting(containerEl)
			.setName('Include disabled CSS rules when exporting')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.exportThemeIncludeDisabled)
				.onChange(async (value) => {
					this.plugin.settings.exportThemeIncludeDisabled = value;
					await this.plugin.saveSettings();
					// Update view checkbox
					let includeDisabledToggle: HTMLInputElement | null = window.document.querySelector('.cts-view [id="include-disabled-switch"]');
					if (includeDisabledToggle) {
						if (value) {
							includeDisabledToggle.checked = true;
						} else {
							includeDisabledToggle.checked = false;
						}
					}
				})
			);

		new Setting(containerEl)
			.setName('Prettier formatting')
			.setDesc('Automatically format CSS using Prettier formatter.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.exportPrettierFormat)
				.onChange(async (value) => {
					this.plugin.settings.exportPrettierFormat = value;
					await this.plugin.saveSettings();
					// Update view checkbox
					let enabledPrettierToggle: HTMLInputElement | null = window.document.querySelector('.cts-view [id="enable-prettier-switch"]');
					if (enabledPrettierToggle) {
						if (value) {
							enabledPrettierToggle.checked = true;
						} else {
							enabledPrettierToggle.checked = false;
						}
					}
				})
			);

		containerEl.createEl(
			'h3',
			{
				cls: 'cts-settings-h3',
				text: 'Scroll helper'
			}
		);

		new Setting(containerEl)
			.setName('Scroll to top')
			.setDesc('Automatically scroll sections to the top of the Custom Theme Studio view when expanding or editing.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.viewScrollToTop)
				.onChange(async (value) => {
					this.plugin.settings.viewScrollToTop = value;
					await this.plugin.saveSettings();
				})
			);

		containerEl.createEl(
			'h3',
			{
				cls: 'cts-settings-h3',
				text: 'Settings backup'
			}
		);

		new Setting(containerEl)
			.setName('Export & import settings')
			.setDesc('Import will replace the current settings. If you are not prompted to choose a location, then the file will be exported to/imported from the vault root as CTS_settings.json (json files aren\'t visible in the vault by default).')
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
						if (await confirm('This will overwrite your current settings and cannot be undone. Continue?', this.plugin.app)) {
							this.plugin.settings = importedSettings;
							await this.plugin.saveData(this.plugin.settings);
							new Notice('Settings imported successfully. The plugin will now be reloaded.');
							this.reload();
						}
					}
				});
			});

		containerEl.createEl(
			'h3',
			{
				text: 'Reset',
				cls: 'reset-options-heading'
			}
		);

		new Setting(containerEl)
			.setName('Reset theme')
			.setDesc('Reset all theme customizations.')
			.addButton(button => button
				.setButtonText('Reset')
				.setClass('mod-destructive')
				.onClick(async () => {
					if (await confirm('Are you sure you want to reset all theme customizations? This cannot be undone.', this.plugin.app)) {
						this.plugin.settings.customCSS = '';
						this.plugin.settings.cssVariables = [];
						this.plugin.settings.cssRules = [];
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
