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
	exportThemeVersion: string;
	exportThemeMinAppVersion: string;
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
	exportThemeVersion: '1.0.0',
	exportThemeMinAppVersion: '0.15.0',
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
		this.containerEl.addClass('cts-settings-tab');
	}

	private async saveVersion(input: HTMLInputElement, key: 'exportThemeVersion' | 'exportThemeMinAppVersion'): Promise<void> {
		const saved = await this.plugin.settingsManager.update(key, input.value);
		if (!saved) {
			new Notice('Use a version like 1.0.0');
			input.value = this.plugin.settings[key] || DEFAULT_SETTINGS[key];
		}
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const doc = this.app.workspace.containerEl.ownerDocument;

		return [
			// ── Enable custom theme ──
			{
				name: 'Enable custom theme',
				desc: 'Turn your customizations on or off.',
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
						desc: 'When a changed variable value is applied to your theme.',
						control: {
							type: 'dropdown',
							key: 'variableInputListener',
							options: { 'change': 'When I leave the field', 'input': 'As I type' },
						},
					},
					{
						name: 'Variable color picker',
						desc: 'Show a color swatch next to variables that have a hex color default.',
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
						desc: 'Show an "import font" button that turns a font file into an @font-face rule.',
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
						desc: 'Ask before closing a CSS editor that has unsaved changes.',
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
						desc: 'How detailed the selectors from the element selector are. Minimal is the shortest that works, balanced adds the tag name, and specific uses every attribute.',
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
						desc: 'Use class selectors like .my-class before data attributes.',
						control: { type: 'toggle', key: 'selectorPreferClasses' },
					},
					{
						name: 'Always include tag names',
						desc: 'Write div[data-foo] instead of [data-foo].',
						control: { type: 'toggle', key: 'selectorAlwaysIncludeTag' },
					},
					{
						name: 'Excluded attribute patterns',
						desc: 'Attributes to leave out of minimal and balanced selectors, one per line. Wildcards work, like data-tooltip-*.',
						control: {
							type: 'textarea',
							key: 'selectorExcludedAttributes',
							placeholder: 'Data-tooltip-*',
							rows: 5,
						},
					},
					{
						name: 'Generate CSS',
						desc: 'Fill new rules with the element\'s current color, background, font, and similar properties.',
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
						desc: 'Preview CSS as you type. Changes are only kept once you save the rule.',
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
							noticeText.textContent = 'Half-finished CSS gets applied too. A bad rule can hide parts of Obsidian until you fix it or run the "toggle custom theme" command.';
							setIcon(noticeIcon, 'alert-triangle');
						},
					},
					// Debounce delay slider + reset
					{
						name: 'Auto-apply change delay',
						desc: 'How long to wait after you stop typing before previewing. Needs auto-apply. Shorter feels faster but can slow Obsidian down.',
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
						desc: 'Show a color swatch next to color values. Click it to pick a new color.',
						control: { type: 'toggle', key: 'enableAceColorPicker' },
					},
					{
						name: 'Live auto completion',
						desc: 'Suggest CSS properties and values as you type.',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.enableAceAutoCompletion)
								.onChange(async (value) => {
									if (!value && this.plugin.settings.enableAceSnippets) {
										new Notice('Turn off "snippets" first. It needs live auto completion.', 10000);
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
						desc: 'Include Obsidian\'s CSS variables in suggestions. Needs live auto completion.',
						render: (setting) => {
							setting.addToggle(toggle => toggle
								.setValue(this.plugin.settings.enableAceSnippets)
								.onChange(async (value) => {
									if (value && !this.plugin.settings.enableAceAutoCompletion) {
										new Notice('Turn on "live auto completion" first.', 10000);
										toggle.setValue(false);
										return;
									}
									this.plugin.settings.enableAceSnippets = value;
									if (!value) {
										new Notice('Reload Obsidian for this to take effect. Run "reload app without saving" from the command palette. Click to dismiss.', 0);
									}
									await this.plugin.saveSettings();
								})
							);
						},
					},
					{
						name: 'Editor theme',
						desc: 'Color theme for the CSS editor. Auto follows Obsidian.',
						control: {
							type: 'dropdown',
							key: 'editorTheme',
							options: { 'Auto': 'Auto', 'Light': 'Light', 'Dark': 'Dark' },
						},
					},
					{
						name: 'Light mode theme',
						desc: 'Syntax colors when Obsidian is in light mode.',
						control: {
							type: 'dropdown',
							key: 'editorLightTheme',
							options: themesToRecord(AceLightThemesList),
						},
					},
					{
						name: 'Dark mode theme',
						desc: 'Syntax colors when Obsidian is in dark mode.',
						control: {
							type: 'dropdown',
							key: 'editorDarkTheme',
							options: themesToRecord(AceDarkThemesList),
						},
					},
					{
						name: 'Keyboard shortcuts',
						desc: 'Key bindings for the CSS editor.',
						control: {
							type: 'dropdown',
							key: 'editorKeyboard',
							options: stringsToRecord(AceKeyboardList),
						},
					},
					{
						name: 'Font size',
						desc: 'Font size in the CSS editor.',
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
						desc: 'Font for the CSS editor, like "fira code". Leave empty for the default.',
						control: { type: 'text', key: 'editorFontFamily' },
					},
					{
						name: 'Tab width',
						desc: 'Spaces per indent level.',
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
								text: 'These are the same fields as in the export theme section of the view.',
							});
						},
					},
					// Theme name (render: syncs view input)
					{
						name: 'Theme name',
						desc: 'Name of your exported theme.',
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
						desc: 'Your name.',
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
						desc: 'Link to your website or GitHub profile.',
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
					// Theme version (render: validates on blur, syncs view via settingsManager)
				{
					name: 'Theme version',
					desc: 'Version number in the manifest, like 1.0.0.',
					render: (setting) => {
						setting.addText(text => {
							text.setPlaceholder(DEFAULT_SETTINGS.exportThemeVersion)
								.setValue(this.plugin.settings.exportThemeVersion || DEFAULT_SETTINGS.exportThemeVersion);
							text.inputEl.addEventListener('change', () => {
								void this.saveVersion(text.inputEl, 'exportThemeVersion');
							});
						});
					},
				},
				// Minimum Obsidian version (render: validates on blur, syncs view via settingsManager)
				{
					name: 'Minimum Obsidian version',
					desc: 'Oldest Obsidian version your theme supports, like 1.13.0.',
					render: (setting) => {
						setting.addText(text => {
							text.setPlaceholder(DEFAULT_SETTINGS.exportThemeMinAppVersion)
								.setValue(this.plugin.settings.exportThemeMinAppVersion || DEFAULT_SETTINGS.exportThemeMinAppVersion);
							text.inputEl.addEventListener('change', () => {
								void this.saveVersion(text.inputEl, 'exportThemeMinAppVersion');
							});
						});
					},
				},
				// Include disabled CSS rules (render: syncs view checkbox)
					{
						name: 'Include disabled CSS rules when exporting',
						desc: 'Add disabled rules to the exported CSS. Handy for optional pieces people can switch on.',
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
						desc: 'Tidy the exported CSS with prettier.',
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
						desc: 'Scroll the view to the section or editor you just opened.',
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
						desc: 'Export saves everything to cts_settings.json in your vault root. Import replaces all current settings with that file.',
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
											if (await confirm('This replaces all your current settings and can\'t be undone. Continue?', this.plugin.app)) {
												// Fill in fields missing from older backups
												this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS, importedSettings);
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
						desc: 'Reload the studio view. Some CSS variables and CSS rules settings only take effect after a reload.',
						render: (setting) => {
							setting.addButton(button => button
								.setButtonText('Reload')
								.setClass('mod-destructive')
								.onClick(async () => {
									if (await confirm('Reloading the view discards any unsaved changes. Continue?', this.plugin.app)) {
										try {
											await this.plugin.reloadView();
											new Notice('View reloaded');
										} catch (error) {
											Logger.error(error instanceof Error ? error.message : String(error));
											new Notice('Couldn\'t reload the view. Check the developer console for details.', 10000);
										}
									}
								})
							);
						},
					},
					{
						name: 'Debug level',
						desc: 'How much to log to the developer console.',
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
						desc: 'Delete all your variables and rules and turn the custom theme off. Other settings are kept.',
						render: (setting) => {
							setting.addButton(button => button
								.setButtonText('Reset')
								.setClass('mod-destructive')
								.onClick(async () => {
									if (await confirm('Delete all your variables and rules? This can\'t be undone.', this.plugin.app)) {
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
