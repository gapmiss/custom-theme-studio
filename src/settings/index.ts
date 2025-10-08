import { App, PluginSettingTab, Setting, Notice, setIcon, SliderComponent, DropdownComponent } from 'obsidian';
import { AceLightThemesList, AceDarkThemesList, AceKeyboardList } from '../ace/AceThemes';
import { confirm } from '../modals/confirmModal';
import CustomThemeStudioPlugin from '../main';
import settingsIO from './settingsIO';
import { Logger } from '../utils';

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
	version?: number; // Settings schema version for migrations
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
	expandEditorSettings: boolean;
	expandedVariableCategories: string[];
	activeVariableTagFilter: string;
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
	editorTabWidth: number | string;
	editorTheme: string;
	editorLightTheme: string;
	editorDarkTheme: string;
	editorKeyboard: string;
	viewScrollToTop: boolean;
	debugLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
	selectorStyle: 'minimal' | 'balanced' | 'specific';
	selectorPreferClasses: boolean;
	selectorAlwaysIncludeTag: boolean;
	selectorExcludedAttributes: string;
	cssEditorDebounceDelay: number;
}

// Current settings schema version
export const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: CustomThemeStudioSettings = {
	version: SETTINGS_VERSION,
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
	expandEditorSettings: false,
	expandedVariableCategories: [],
	activeVariableTagFilter: 'all',
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
	viewScrollToTop: true,
	debugLevel: 'none',
	selectorStyle: 'minimal',
	selectorPreferClasses: false,
	selectorAlwaysIncludeTag: false,
	selectorExcludedAttributes: `data-tooltip-*
data-delay
aria-expanded
aria-current
aria-controls
aria-describedby`,
	cssEditorDebounceDelay: 500
};

const THEME_COLOR: Record<string, string> = {
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
		containerEl.addClass('cts-settings-tab');

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

		new Setting(containerEl).setName('CSS variables').setHeading();

		new Setting(containerEl)
			.setName('Variable update trigger')
			.setDesc('When to update CSS after changing variable values. Choose "Input" for live updates (every keystroke) or "Change" to update only when you finish editing (clicking away from the field).')
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
			.setName('Variable color picker')
			.setDesc('Enable a color picker for CSS variables that have a default HEX color value.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableColorPicker)
				.onChange(async (value) => {
					this.plugin.settings.enableColorPicker = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName('CSS rules').setHeading();

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
			.setName('Warn before discarding changes')
			.setDesc('Warn before discarding unsaved changes when closing or switching between CSS editors.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showConfirmation)
				.onChange(async (value) => {
					this.plugin.settings.showConfirmation = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName('Element selector').setHeading();

		new Setting(containerEl)
			.setName('Selector style preset')
			.setDesc('Choose the style of CSS selectors generated when picking elements. "Minimal" creates short selectors, "Balanced" includes the tag name, and "Specific" includes all attributes.')
			.addDropdown(dropdown => dropdown
				.addOption('minimal', 'Minimal (Clean & Short)')
				.addOption('balanced', 'Balanced (Moderate Specificity)')
				.addOption('specific', 'Specific (Maximum Detail)')
				.setValue(this.plugin.settings.selectorStyle)
				.onChange(async (value: 'minimal' | 'balanced' | 'specific') => {
					this.plugin.settings.selectorStyle = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Prefer classes over attributes')
			.setDesc('When enabled, prioritize class selectors (e.g., .my-class) over data attributes.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.selectorPreferClasses)
				.onChange(async (value) => {
					this.plugin.settings.selectorPreferClasses = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Always include tag names')
			.setDesc('When enabled, always include the HTML tag (e.g., div[data-foo] instead of [data-foo]).')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.selectorAlwaysIncludeTag)
				.onChange(async (value) => {
					this.plugin.settings.selectorAlwaysIncludeTag = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Excluded attribute patterns')
			.setDesc('Attributes matching these patterns will be excluded from Minimal and Balanced selectors (one per line). Supports wildcards like "data-tooltip-*". Specific mode includes all attributes.')
			.addTextArea(text => text
				.setPlaceholder('data-tooltip-*\ndata-delay\naria-expanded')
				.setValue(this.plugin.settings.selectorExcludedAttributes)
				.onChange(async (value) => {
					this.plugin.settings.selectorExcludedAttributes = value;
					await this.plugin.saveSettings();
				})
			)
			.then(setting => {
				setting.controlEl.querySelector('textarea')?.setAttribute('rows', '5');
			});

		new Setting(containerEl)
			.setName('Generate CSS')
			.setDesc('Automatically populate the CSS editor with common properties (color, background, font, etc.) when selecting an element.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.generateComputedCSS)
				.onChange(async (value) => {
					this.plugin.settings.generateComputedCSS = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName('CSS editor').setHeading();

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

		let debounceDelaySlider: SliderComponent;
		new Setting(containerEl)
			.setName('Auto-apply change delay')
			.setDesc('Delay before live-previewing CSS changes while typing (requires auto-apply). Lower values = faster feedback but may cause performance issues.')
			.addSlider(slider => {
				debounceDelaySlider = slider;
				slider
					.setLimits(0, 2000, 100)
					.setValue(this.plugin.settings.cssEditorDebounceDelay)
					.onChange(async (value) => {
						slider.sliderEl.setAttribute('aria-label', value.toString() + 'ms');
						this.plugin.settings.cssEditorDebounceDelay = value;
						await this.plugin.saveSettings();
					});
				slider.sliderEl.setAttribute('aria-label', this.plugin.settings.cssEditorDebounceDelay.toString() + 'ms');
				slider.sliderEl.setAttribute('data-tooltip-position', 'top');
				slider.sliderEl.setAttribute('data-tooltip-delay', '100');
			})
			.addExtraButton(button => button
				.setIcon('rotate-ccw')
				.setTooltip(`Restore default (${DEFAULT_SETTINGS.cssEditorDebounceDelay.toString()})`)
				.onClick(async () => {
					debounceDelaySlider.setValue(DEFAULT_SETTINGS.cssEditorDebounceDelay);
					debounceDelaySlider.sliderEl.setAttribute('aria-label', DEFAULT_SETTINGS.cssEditorDebounceDelay.toString());
					this.plugin.settings.cssEditorDebounceDelay = 500;
					await this.plugin.saveSettings();
				})
			);

		// CSS editor settings collapsible section
		const editorSettingsHeading = new Setting(containerEl)
			.setName('CSS editor preferences')
			.setHeading()
			.setTooltip('Click to expand/collapse CSS editor preferences');

		editorSettingsHeading.settingEl.addClass('cts-collapsible-heading');

		// Add chevron icon
		const chevronIcon = editorSettingsHeading.nameEl.createDiv('cts-chevron-icon');
		setIcon(chevronIcon, this.plugin.settings.expandEditorSettings ? 'chevron-down' : 'chevron-right');

		const editorSettingsContainer = containerEl.createDiv('cts-editor-settings-container');
		if (!this.plugin.settings.expandEditorSettings) {
			editorSettingsContainer.style.display = 'none';
		}

		editorSettingsHeading.settingEl.addEventListener('click', async () => {
			this.plugin.settings.expandEditorSettings = !this.plugin.settings.expandEditorSettings;
			editorSettingsContainer.style.display = this.plugin.settings.expandEditorSettings ? 'block' : 'none';
			chevronIcon.empty();
			setIcon(chevronIcon, this.plugin.settings.expandEditorSettings ? 'chevron-down' : 'chevron-right');
			await this.plugin.saveSettings();
		});

		new Setting(editorSettingsContainer)
			.setName('Editor color picker')
			.setDesc('Show inline color picker for hex/rgb values.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAceColorPicker)
				.onChange(async (value) => {
					this.plugin.settings.enableAceColorPicker = value;
					await this.plugin.saveSettings();
				})
			);

		let liveAutoCompletiongsToggle = new Setting(editorSettingsContainer)
			.setName('Live auto completion')
			.setDesc('Show auto-completion suggestions while typing CSS properties and values.')
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

		let snippetsToggle = new Setting(editorSettingsContainer)
			.setName('Snippets')
			.setDesc('Show Obsidian CSS variables in auto-completion (requires live auto-completion).')
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
						new Notice('Disabling this setting requires a reload of the Obsidian window. From the command palette, run the command "Reload app without saving." … Click this message to dismiss.', 0);
					}
					await this.plugin.saveSettings();
				})
			);

		new Setting(editorSettingsContainer)
			.setName('Editor theme')
			.setDesc('CSS editor color theme. "Auto" matches your Obsidian theme.')
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

		new Setting(editorSettingsContainer)
			.setName('Light mode theme')
			.setDesc('Syntax highlighting theme when Obsidian is in light mode.')
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

		new Setting(editorSettingsContainer)
			.setName('Dark mode theme')
			.setDesc('Syntax highlighting theme when Obsidian is in dark mode.')
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

		new Setting(editorSettingsContainer)
			.setName('Keyboard shortcuts')
			.setDesc('Keyboard shortcut scheme for the CSS editor.')
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

		let fontSizeSlider: SliderComponent;
		new Setting(editorSettingsContainer)
			.setName('Font size')
			.setDesc('Set the font size of the CSS editor.')
			.addSlider(slider => {
				fontSizeSlider = slider;
				slider
					.setLimits(5, 30, 1)
					.setValue(this.plugin.settings.editorFontSize)
					.onChange(async (value) => {
						slider.sliderEl.setAttribute('aria-label', value.toString());
						this.plugin.settings.editorFontSize = value;
						this.plugin.saveSettings();
					});
				slider.sliderEl.setAttribute('aria-label', this.plugin.settings.editorFontSize.toString());
				slider.sliderEl.setAttribute('data-tooltip-position', 'top');
				slider.sliderEl.setAttribute('data-tooltip-delay', '100');
			})
			.addExtraButton(button => button
				.setIcon('rotate-ccw')
				.setTooltip('Restore default (15)')
				.onClick(async () => {
					fontSizeSlider.setValue(15);
					fontSizeSlider.sliderEl.setAttribute('aria-label', '15');
					this.plugin.settings.editorFontSize = 15;
					await this.plugin.saveSettings();
				})
			);

		new Setting(editorSettingsContainer)
			.setName('Font family')
			.setDesc('Font family for the CSS editor (e.g., "Fira Code", "Monaco"). Leave empty for default.')
			.addText(text => text
				.setValue(this.plugin.settings.editorFontFamily)
				.onChange(async (value) => {
					this.plugin.settings.editorFontFamily = value;
					await this.plugin.saveSettings();
				})
			);

		let tabWidthDropdown: DropdownComponent;
		new Setting(editorSettingsContainer)
			.setName('Tab width')
			.setDesc('Indentation width (spaces per tab level). Standard is 2 or 4.')
			.addDropdown((dropdown) => {
				tabWidthDropdown = dropdown;
				dropdown
					.addOptions({
						'2': '2',
						'4': '4',
					})
					.setValue(this.plugin.settings.editorTabWidth.toString())
					.onChange(async (newValue) => {
						this.plugin.settings.editorTabWidth = newValue;
						await this.plugin.saveSettings();
					});
			})
			.addExtraButton(button => button
				.setIcon('rotate-ccw')
				.setTooltip(`Restore default (${DEFAULT_SETTINGS.editorTabWidth.toString()})`)
				.onClick(async () => {
					tabWidthDropdown.setValue(DEFAULT_SETTINGS.editorTabWidth.toString());
					this.plugin.settings.editorTabWidth = DEFAULT_SETTINGS.editorTabWidth.toString();
					await this.plugin.saveSettings();
				})
			);

		new Setting(editorSettingsContainer)
			.setName('Word wrap')
			.setDesc('Wrap long lines instead of scrolling horizontally.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.editorWordWrap)
				.onChange(async (value) => {
					this.plugin.settings.editorWordWrap = value;
					await this.plugin.saveSettings();

				}));

		new Setting(editorSettingsContainer)
			.setName('Line numbers')
			.setDesc('Show line numbers in the CSS editor.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.editorLineNumbers)
				.onChange(async (value) => {
					this.plugin.settings.editorLineNumbers = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName('Theme export').setHeading();

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
			.setDesc('URL to your Github profile page (e.g. https://github.com/username). ')
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
			.setDesc('Include disabled rules in exported themes (useful for sharing themes with optional features)."')
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

		new Setting(containerEl).setName('Scroll helper').setHeading();

		new Setting(containerEl)
			.setName('Scroll to top')
			.setDesc('Auto-scroll to expanded sections or active editors for easier navigation.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.viewScrollToTop)
				.onChange(async (value) => {
					this.plugin.settings.viewScrollToTop = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName('Settings backup').setHeading();

		new Setting(containerEl)
			.setName('Export & import settings')
			.setDesc('Export or import all plugin settings. Import will overwrite current settings. File saved to vault root as CTS_settings.json.')
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

		// Troubleshooting Section
		new Setting(containerEl).setName('Troubleshooting').setHeading();

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
							Logger.error(error);
							new Notice('Failed to reload view. Check developer console for details.', 10000);
						}
					}
				})
			);

		// Debug Level Setting
		new Setting(containerEl)
			.setName('Debug level')
			.setDesc('Control console logging verbosity for debugging')
			.addDropdown(dropdown => dropdown
				.addOption('none', 'None (No logs)')
				.addOption('error', 'Errors only')
				.addOption('warn', 'Warnings and errors')
				.addOption('info', 'Info, warnings, and errors')
				.addOption('debug', 'Debug (All logs)')
				.setValue(this.plugin.settings.debugLevel)
				.onChange(async (value: 'none' | 'error' | 'warn' | 'info' | 'debug') => {
					this.plugin.settings.debugLevel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl).setName('Reset').setClass('reset-options-heading').setHeading();

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
						this.plugin.themeManager.applyIfEnabled();

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
		await this.app.plugins.disablePlugin('custom-theme-studio');
		await this.app.plugins.enablePlugin('custom-theme-studio');
		this.app.setting.openTabById('custom-theme-studio').display();
	}

}
