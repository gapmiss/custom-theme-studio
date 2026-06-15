import { App, PluginSettingTab, Notice, setIcon, SliderComponent, SettingDefinitionItem } from 'obsidian';
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

function themesToRecord(themes: Record<string, string>[]): Record<string, string> {
	const result: Record<string, string> = {};
	for (const theme of themes) {
		result[theme.value] = theme.name;
	}
	return result;
}

function stringsToRecord(items: string[]): Record<string, string> {
	const result: Record<string, string> = {};
	for (const item of items) {
		result[item] = item;
	}
	return result;
}

export class CustomThemeStudioSettingTab extends PluginSettingTab {
	plugin: CustomThemeStudioPlugin;

	constructor(app: App, plugin: CustomThemeStudioPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/* eslint-disable @typescript-eslint/no-deprecated -- super.display() needed to add CSS scope class */
	display(): void {
		super.display();
		this.containerEl.addClass('cts-settings-tab');
	}
	/* eslint-enable @typescript-eslint/no-deprecated -- re-enable after display() override */

	getSettingDefinitions(): SettingDefinitionItem[] {
		const doc = this.app.workspace.containerEl.ownerDocument;

		return [
			// ── Enable custom theme ──
			{
				name: 'Enable custom theme',
				desc: 'Toggle your custom theme on or off.',
				render: (setting) => {
					setting.addToggle(toggle => toggle
						.setValue(this.plugin.settings.themeEnabled)
						.onChange(async (value) => {
							this.plugin.settings.themeEnabled = value;
							if (value) {
								this.plugin.themeManager.applyCustomTheme();
							} else {
								this.plugin.themeManager.removeCustomTheme();
							}
							await this.plugin.saveSettings();
							const themeToggle: HTMLInputElement | null = doc.querySelector('.cts-view [id="theme-toggle-switch"]');
							if (themeToggle) {
								themeToggle.checked = value;
							}
						})
					);
				},
			},

			// ── CSS variables ──
			{
				type: 'group',
				heading: 'CSS variables',
				items: [
					{
						name: 'Variable update trigger',
						desc: 'When to update CSS after changing variable values. Choose "input" for live updates (every keystroke) or "change" to update only when you finish editing (clicking away from the field).',
						control: {
							type: 'dropdown',
							key: 'variableInputListener',
							options: { 'input': 'input', 'change': 'change' },
						},
					},
					{
						name: 'Variable color picker',
						desc: 'Enable a color picker for CSS variables that have a default hex color value.',
						control: { type: 'toggle', key: 'enableColorPicker' },
					},
				],
			},

			// ── CSS rules ──
			{
				type: 'group',
				heading: 'CSS rules',
				items: [
					{
						name: 'Font import',
						desc: 'Enable font imports to create @font-face CSS rules.',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.enableFontImport)
								.onChange(async (value) => {
									await this.plugin.settingsManager.update('enableFontImport', value);
								})
							);
						},
					},
					{
						name: 'Warn before discarding changes',
						desc: 'Warn before discarding unsaved changes when closing or switching between CSS editors.',
						control: { type: 'toggle', key: 'showConfirmation' },
					},
				],
			},

			// ── Element selector ──
			{
				type: 'group',
				heading: 'Element selector',
				items: [
					{
						name: 'Selector style preset',
						desc: 'Choose the style of CSS selectors generated when picking elements. "minimal" creates short selectors, "balanced" includes the tag name, and "specific" includes all attributes.',
						control: {
							type: 'dropdown',
							key: 'selectorStyle',
							options: {
								'minimal': 'Minimal (clean & short)',
								'balanced': 'Balanced (moderate specificity)',
								'specific': 'Specific (maximum detail)',
							},
						},
					},
					{
						name: 'Prefer classes over attributes',
						desc: 'When enabled, prioritize class selectors (e.g., .my-class) over data attributes.',
						control: { type: 'toggle', key: 'selectorPreferClasses' },
					},
					{
						name: 'Always include tag names',
						desc: 'When enabled, always include the HTML tag (e.g., div[data-foo] instead of [data-foo]).',
						control: { type: 'toggle', key: 'selectorAlwaysIncludeTag' },
					},
					{
						name: 'Excluded attribute patterns',
						desc: 'Attributes matching these patterns will be excluded from minimal and balanced selectors (one per line). Supports wildcards like "data-tooltip-*". Specific mode includes all attributes.',
						control: {
							type: 'textarea',
							key: 'selectorExcludedAttributes',
							placeholder: 'Data-tooltip-*',
							rows: 5,
						},
					},
					{
						name: 'Generate CSS',
						desc: 'Automatically populate the CSS editor with common properties (color, background, font, etc.) when selecting an element.',
						control: { type: 'toggle', key: 'generateComputedCSS' },
					},
				],
			},

			// ── CSS editor ──
			{
				type: 'group',
				heading: 'CSS editor',
				items: [
					{
						name: 'Auto-apply changes',
						desc: 'Automatically preview changes "live" as you make them. Changes become permanent once the CSS is saved.',
						control: { type: 'toggle', key: 'autoApplyChanges' },
					},
					// Auto-apply warning notice
					{
						name: '',
						searchable: false,
						render: (setting) => {
							setting.settingEl.empty();
							const noticeDiv = setting.settingEl.createDiv('cts-auto-apply-changes-notice');
							const noticeIcon = noticeDiv.createDiv('cts-auto-apply-changes-notice-icon');
							noticeIcon.setAttribute('aria-label', 'Notice');
							noticeIcon.setAttribute('data-tooltip-position', 'top');
							const noticeText = noticeDiv.createDiv('cts-auto-apply-changes-notice-text');
							noticeText.textContent = 'When enabled, every keystroke triggers a "live" refresh of your theme. This can lead to unwanted styling and possibly make Obsidian unusable.';
							setIcon(noticeIcon, 'alert-triangle');
						},
					},
					// Debounce delay slider + reset
					{
						name: 'Auto-apply change delay',
						desc: 'Delay before live-previewing CSS changes while typing (requires auto-apply). Lower values = faster feedback but may cause performance issues.',
						render: (setting) => {
							let debounceDelaySlider: SliderComponent;
							setting.addSlider(slider => {
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
									this.plugin.settings.cssEditorDebounceDelay = DEFAULT_SETTINGS.cssEditorDebounceDelay;
									await this.plugin.saveSettings();
								})
							);
						},
					},
				],
			},

			// ── CSS editor preferences ──
			{
				type: 'group',
				heading: 'CSS editor preferences',
				items: [
					{
						name: 'Editor color picker',
						desc: 'Show inline color picker for hex/rgb values.',
						control: { type: 'toggle', key: 'enableAceColorPicker' },
					},
					{
						name: 'Live auto completion',
						desc: 'Show auto-completion suggestions while typing CSS properties and values.',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.enableAceAutoCompletion)
								.onChange(async (value) => {
									if (!value && this.plugin.settings.enableAceSnippets) {
										new Notice('Snippets are enabled and require that "live auto completion" be enabled. Please disable the below "snippets" toggle before disabling this setting.', 10000);
										toggle.setValue(true);
										return;
									}
									this.plugin.settings.enableAceAutoCompletion = value;
									await this.plugin.saveSettings();
								})
							);
						},
					},
					{
						name: 'Snippets',
						desc: 'Show Obsidian CSS variables in auto-completion (requires live auto-completion).',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.enableAceSnippets)
								.onChange(async (value) => {
									if (value && !this.plugin.settings.enableAceAutoCompletion) {
										new Notice('Please enable the above "live auto completion" toggle before enabling this setting.', 10000);
										toggle.setValue(false);
										return;
									}
									this.plugin.settings.enableAceSnippets = value;
									if (!value) {
										new Notice('Disabling this setting requires a reload of the Obsidian window. From the command palette, run the command "reload app without saving." … click this message to dismiss.', 0);
									}
									await this.plugin.saveSettings();
								})
							);
						},
					},
					{
						name: 'Editor theme',
						desc: 'CSS editor color theme. "auto" matches your Obsidian theme.',
						control: {
							type: 'dropdown',
							key: 'editorTheme',
							options: { 'Auto': 'Auto', 'Light': 'Light', 'Dark': 'Dark' },
						},
					},
					{
						name: 'Light mode theme',
						desc: 'Syntax highlighting theme when Obsidian is in light mode.',
						control: {
							type: 'dropdown',
							key: 'editorLightTheme',
							options: themesToRecord(AceLightThemesList),
						},
					},
					{
						name: 'Dark mode theme',
						desc: 'Syntax highlighting theme when Obsidian is in dark mode.',
						control: {
							type: 'dropdown',
							key: 'editorDarkTheme',
							options: themesToRecord(AceDarkThemesList),
						},
					},
					{
						name: 'Keyboard shortcuts',
						desc: 'Keyboard shortcut scheme for the CSS editor.',
						control: {
							type: 'dropdown',
							key: 'editorKeyboard',
							options: stringsToRecord(AceKeyboardList),
						},
					},
					{
						name: 'Font size',
						desc: 'Set the font size of the CSS editor.',
						render: (setting) => {
							let fontSizeSlider: SliderComponent;
							setting.addSlider(slider => {
								fontSizeSlider = slider;
								slider
									.setLimits(5, 30, 1)
									.setValue(this.plugin.settings.editorFontSize)
									.onChange(async (value) => {
										slider.sliderEl.setAttribute('aria-label', value.toString());
										this.plugin.settings.editorFontSize = value;
										void this.plugin.saveSettings();
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
						},
					},
					{
						name: 'Font family',
						desc: 'Font family for the CSS editor (e.g., "fira code", "monaco"). Leave empty for default.',
						control: { type: 'text', key: 'editorFontFamily' },
					},
					{
						name: 'Tab width',
						desc: 'Indentation width (spaces per tab level). Standard is 2 or 4.',
						render: (setting) => {
							setting.addDropdown(dropdown => {
								dropdown
									.addOptions({ '2': '2', '4': '4' })
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
									this.plugin.settings.editorTabWidth = DEFAULT_SETTINGS.editorTabWidth.toString();
									await this.plugin.saveSettings();
									this.update();
								})
							);
						},
					},
					{
						name: 'Word wrap',
						desc: 'Wrap long lines instead of scrolling horizontally.',
						control: { type: 'toggle', key: 'editorWordWrap' },
					},
					{
						name: 'Line numbers',
						desc: 'Show line numbers in the CSS editor.',
						control: { type: 'toggle', key: 'editorLineNumbers' },
					},
				],
			},

			// ── Theme export ──
			{
				type: 'group',
				heading: 'Theme export',
				items: [
					// Export description text
					{
						name: '',
						searchable: false,
						render: (setting) => {
							setting.settingEl.empty();
							setting.settingEl.createDiv({
								cls: 'cts-theme-export-description',
								text: 'These settings can also be changed at time of export.',
							});
						},
					},
					// Theme name (render: syncs view input)
					{
						name: 'Theme name',
						desc: 'The name or title for your exported theme. ',
						render: (setting) => {
							setting.addText(text => text
								.setValue(this.plugin.settings.exportThemeName)
								.onChange(async (value) => {
									this.plugin.settings.exportThemeName = value;
									await this.plugin.saveSettings();
									const varInput: HTMLInputElement | null = doc.querySelector('.cts-view .export-form-theme-name');
									if (varInput) {
										varInput.value = value;
									}
								}));
						},
					},
					// Author name (render: syncs view input)
					{
						name: 'Author name',
						desc: 'Your name as the theme author. ',
						render: (setting) => {
							setting.addText(text => text
								.setValue(this.plugin.settings.exportThemeAuthor)
								.onChange(async (value) => {
									this.plugin.settings.exportThemeAuthor = value;
									await this.plugin.saveSettings();
									const varInput: HTMLInputElement | null = doc.querySelector('.cts-view .export-form-theme-author');
									if (varInput) {
										varInput.value = value;
									}
								}));
						},
					},
					// Author URL (render: syncs view input)
					{
						name: 'Author URL',
						desc: 'URL to your GitHub profile page (e.g. https://github.com/username). ',
						render: (setting) => {
							setting.addText(text => text
								.setValue(this.plugin.settings.exportThemeURL)
								.onChange(async (value) => {
									this.plugin.settings.exportThemeURL = value;
									await this.plugin.saveSettings();
									const varInput: HTMLInputElement | null = doc.querySelector('.cts-view .export-form-theme-url');
									if (varInput) {
										varInput.value = value;
									}
								}));
						},
					},
					// Include disabled CSS rules (render: syncs view checkbox)
					{
						name: 'Include disabled CSS rules when exporting',
						desc: 'Include disabled rules in exported themes (useful for sharing themes with optional features)."',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.exportThemeIncludeDisabled)
								.onChange(async (value) => {
									this.plugin.settings.exportThemeIncludeDisabled = value;
									await this.plugin.saveSettings();
									const includeDisabledToggle: HTMLInputElement | null = doc.querySelector('.cts-view [id="include-disabled-switch"]');
									if (includeDisabledToggle) {
										includeDisabledToggle.checked = value;
									}
								})
							);
						},
					},
					// Prettier formatting (render: syncs view checkbox)
					{
						name: 'Prettier formatting',
						desc: 'Automatically format CSS using prettier formatter.',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.exportPrettierFormat)
								.onChange(async (value) => {
									this.plugin.settings.exportPrettierFormat = value;
									await this.plugin.saveSettings();
									const enabledPrettierToggle: HTMLInputElement | null = doc.querySelector('.cts-view [id="enable-prettier-switch"]');
									if (enabledPrettierToggle) {
										enabledPrettierToggle.checked = value;
									}
								})
							);
						},
					},
				],
			},

			// ── Scroll helper ──
			{
				type: 'group',
				heading: 'Scroll helper',
				items: [
					{
						name: 'Scroll to top',
						desc: 'Auto-scroll to expanded sections or active editors for easier navigation.',
						control: { type: 'toggle', key: 'viewScrollToTop' },
					},
				],
			},

			// ── Backup ──
			{
				type: 'group',
				heading: 'Backup',
				items: [
					{
						name: 'Export & import settings',
						desc: 'Export or import all plugin settings. Import will overwrite current settings. File saved to vault root as cts_settings.json.',
						render: (setting) => {
							setting
								.addButton(button => {
									button.setButtonText('Export');
									button.onClick(() => {
										void settingsIO.exportSettings(this.plugin.settings, this.app);
									});
								})
								.addButton(button => {
									button.setButtonText('Import');
									button.onClick(async () => {
										const importedSettings = await settingsIO.importSettings(this.app);
										if (importedSettings) {
											if (await confirm('This will overwrite your current settings and cannot be undone. Continue?', this.plugin.app)) {
												this.plugin.settings = importedSettings;
												await this.plugin.saveData(this.plugin.settings);

												const leaves = this.app.workspace.getLeavesOfType('cts-view');
												if (leaves.length > 0) {
													void this.plugin.reloadView();
												}

												this.update();
												new Notice('Settings imported successfully');
											}
										}
									});
								});
						},
					},
				],
			},

			// ── Troubleshooting ──
			{
				type: 'group',
				heading: 'Troubleshooting',
				items: [
					{
						name: 'Reload view',
						desc: 'Most settings under CSS variables & CSS rules require the plugin\'s view to be reloaded to take effect.',
						render: (setting) => {
							setting.addButton(button => button
								.setButtonText('Reload')
								.setClass('mod-destructive')
								.onClick(async () => {
									if (await confirm('You may have unsaved changes. Reloading the view will reload all forms. Continue?', this.plugin.app)) {
										try {
											await this.plugin.reloadView();
											new Notice('The custom theme studio view has been reloaded');
										} catch (error) {
											Logger.error(error instanceof Error ? error.message : String(error));
											new Notice('Failed to reload view. Check developer console for details.', 10000);
										}
									}
								})
							);
						},
					},
					{
						name: 'Debug level',
						desc: 'Control console logging verbosity for debugging',
						control: {
							type: 'dropdown',
							key: 'debugLevel',
							options: {
								'none': 'None (no logs)',
								'error': 'Errors only',
								'warn': 'Warnings and errors',
								'info': 'Info, warnings, and errors',
								'debug': 'Debug (all logs)',
							},
						},
					},
				],
			},

			// ── Reset ──
			{
				type: 'group',
				heading: 'Reset',
				cls: 'reset-options-heading',
				items: [
					{
						name: 'Reset theme',
						desc: 'Reset all theme customizations.',
						render: (setting) => {
							setting.addButton(button => button
								.setButtonText('Reset')
								.setClass('mod-destructive')
								.onClick(async () => {
									if (await confirm('Are you sure you want to reset all theme customizations? This cannot be undone.', this.plugin.app)) {
										this.plugin.settings.customCSS = '';
										this.plugin.settings.cssVariables = [];
										this.plugin.settings.cssRules = [];
										this.plugin.settings.themeEnabled = false;

										this.plugin.themeManager.removeCustomTheme();
										this.plugin.themeManager.applyIfEnabled();

										await this.plugin.saveSettings();

										const leaves = this.app.workspace.getLeavesOfType('cts-view');
										if (leaves.length > 0) {
											void this.plugin.reloadView();
										}
										this.update();
										new Notice('Theme has been reset');
									}
								}));
						},
					},
				],
			},
		];
	}
}
