import { Notice, setIcon } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { CSSVariableManager } from './cssVariabManager';
import { CSSVariable, CustomThemeStudioSettings, DEFAULT_SETTINGS } from '../settings';
import { saveAs } from 'file-saver';
import * as prettier from 'prettier';
import * as css from 'prettier/plugins/postcss';
import { showNotice } from "../utils";

export class ThemeManager {
	plugin: CustomThemeStudioPlugin;
	cssVariableManager: CSSVariableManager;
	styleEl: HTMLStyleElement | null = null;
	settings: CustomThemeStudioSettings;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
		this.cssVariableManager = new CSSVariableManager(plugin);
	}

	applyCustomTheme(): void {
		// Remove existing style element if it exists
		this.removeCustomTheme();

		// Create style element
		this.styleEl = document.createElement('style');
		this.styleEl.id = 'custom-theme-studio-css';

		// Generate CSS from variables and custom elements
		const variablesCSS: string = this.generateVariablesCSS();
		const elementsCSS: string = this.plugin.settings.customCSS || '';

		this.styleEl.textContent = (variablesCSS !== '' ? (variablesCSS + '\n\n') : '') + elementsCSS;

		// Add to document
		document.head.appendChild(this.styleEl);
	}

	removeCustomTheme(): void {
		if (this.styleEl) {
			this.styleEl.remove();
			this.styleEl = null;
		} else {
			const existingStyle: HTMLElement | null = document.getElementById('custom-theme-studio-css');
			if (existingStyle) {
				existingStyle.remove();
			}
		}
	}

	toggleCustomTheme(): void {
		this.plugin.settings.themeEnabled = !this.plugin.settings.themeEnabled;

		if (this.plugin.settings.themeEnabled) {
			this.applyCustomTheme();
			showNotice('Custom theme enabled', 5000, 'success');
		} else {
			this.removeCustomTheme();
			showNotice('Custom theme disabled', 5000, 'error');
		}

		this.plugin.saveSettings();

		let themeToggle: HTMLInputElement | null = window.document.querySelector('.cts-view [id="theme-toggle-switch"]');
		if (themeToggle) {
			if (this.plugin.settings.themeEnabled) {
				themeToggle.checked = true;
			} else {
				themeToggle.checked = false;
			}
		}
	}

	generateVariablesCSS(): string {
		const variables: CSSVariable[] = this.plugin.settings.customVariables;
		if (!variables.length) {
			return '';
		}

		let css: string = '';

		let bodyVars: string = 'body {\n';
		let lightVars: string = '.theme-light {\n';
		let darkVars: string = '.theme-dark {\n';
		let foundBodyVars: boolean = false;
		let foundLightVars: boolean = false;
		let foundDarkVars: boolean = false;

		variables.forEach(v => {
			if (v.parent === 'themedark') {
				if (v.value !== '') {
					darkVars += `  ${v.variable}: ${v.value};\n`;
					foundDarkVars = true;
				}
			} else if (v.parent === 'themelight') {
				if (v.value !== '') {
					lightVars += `  ${v.variable}: ${v.value};\n`;
					foundLightVars = true;
				}
			} else {
				if (v.value !== '') {
					bodyVars += `  ${v.variable}: ${v.value};\n`;
					foundBodyVars = true;
				}
			}
		});

		if (foundBodyVars) {
			css += bodyVars + '}\n\n'
		}
		if (foundLightVars) {
			css += lightVars + '}\n\n'
		}
		if (foundDarkVars) {
			css += darkVars + '}'
		}

		return css;
	}

	startElementSelection(): void {
		// Find the view if it's open
		const leaves = this.plugin.app.workspace.getLeavesOfType('cts-view');
		if (leaves.length > 0) {
			const view: any = leaves[0].view;
			if (view && view.elementSelectorManager) {
				view.elementSelectorManager.startElementSelection();
				// Expand "Element customization" section
				const section: HTMLDivElement | null = window.activeDocument.querySelector('.element-section');
				const collapsibleIcon: HTMLDivElement | null | undefined = section?.querySelector('.collapse-icon');
				const collapsibleContent: HTMLDivElement | null | undefined = section?.querySelector('.collapsible-content');
				collapsibleContent!.removeClass('collapsible-content-hide');
				collapsibleContent!.addClass('collapsible-content-show');
				setIcon(collapsibleIcon!, 'chevron-down');
				collapsibleIcon!.setAttr('aria-label', 'Collapse section');
				collapsibleIcon!.setAttr('data-tooltip-position', 'top');
			}
		} else {
			// Open the view first, then start selection
			this.plugin.activateView().then(() => {
				setTimeout(() => {
					const newLeaves = this.plugin.app.workspace.getLeavesOfType('cts-view');
					if (newLeaves.length > 0) {
						const view: any = newLeaves[0].view;
						if (view && view.elementSelectorManager) {
							view.elementSelectorManager.startElementSelection();
							// Expand "Element customization" section
							const section: HTMLDivElement | null = window.activeDocument.querySelector('.element-section');
							const collapsibleIcon: HTMLDivElement | null | undefined = section?.querySelector('.collapse-icon');
							const collapsibleContent: HTMLDivElement | null | undefined = section?.querySelector('.collapsible-content');
							collapsibleContent!.removeClass('collapsible-content-hide');
							collapsibleContent!.addClass('collapsible-content-show');
							setIcon(collapsibleIcon!, 'chevron-down');
							collapsibleIcon!.setAttr('aria-label', 'Collapse section');
							collapsibleIcon!.setAttr('data-tooltip-position', 'top');
						}
					}
				}, 300);
			});
		}
	}

	async exportThemeCSS(): Promise<void> {
		try {
			// Generate theme.css content
			const variablesCSS: string = this.generateVariablesCSS();
			const elementsCSS: string = this.plugin.settings.customCSS || '';
			const themeCSS: string = `/* ${this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName} for Obsidian */
/* by ${this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor} */
/* ${this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL} */

${variablesCSS}

${elementsCSS}`;

			new Notice('Exporting theme CSS file…', 5000);
			let prettierCSS: string = (this.plugin.settings.exportPrettierFormat) ? await this.formatCSS(themeCSS) : themeCSS;
			saveAs(new Blob([prettierCSS], { type: 'text/css' }), 'theme.css');
		} catch (error) {
			console.error('Failed to export theme:\n', error);
			showNotice('Failed to export theme. Check the developer console for details', 10000, 'error');
		}
	}

	exportThemeManifest(): void {
		try {
			// Generate manifest.json content
			const themeId: string = (this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName)
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-');

			const manifest: any = {
				name: themeId,
				version: '1.0.0',
				minAppVersion: '0.15.0',
				author: this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor,
				authorUrl: this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL
			};

			const manifestJSON: string = JSON.stringify(manifest, null, 2);

			new Notice('Exporting theme manifest file…', 5000);

			saveAs(new Blob([manifestJSON], { type: 'application/json' }), 'manifest.json');
		} catch (error) {
			console.error('Failed to export manifest:', error);
			showNotice('Failed to export manifest. Check the developer console for details', 10000, 'error');
		}
	}

	async copyThemeToClipboard(): Promise<void> {
		try {
			const variablesCSS: string = this.generateVariablesCSS();
			const elementsCSS: string = this.plugin.settings.customCSS || '';
			const themeCSS: string = `/* ${this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName} for Obsidian */
/* by ${this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor} */
/* ${this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL} */

${variablesCSS}

${elementsCSS}`;

			let prettierCSS: string = (this.plugin.settings.exportPrettierFormat) ? await this.formatCSS(themeCSS) : themeCSS;
			navigator.clipboard.writeText(prettierCSS).then(() => {
				showNotice('Theme CSS copied to clipboard', 5000, 'success');
			});
		} catch (error) {
			console.error('Failed to copy theme to clipboard:\n', error);
			showNotice('Failed to copy theme to clipboard. Check the developer console for details', 10000, 'error');
		}
	}

	copyManifestToClipboard(): void {
		try {
			// Generate manifest.json content
			const themeId: string = (this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName)
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-');

			const manifest: any = {
				name: themeId,
				version: '1.0.0',
				minAppVersion: '0.15.0',
				author: this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor,
				authorUrl: this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL
			};

			navigator.clipboard.writeText(JSON.stringify(manifest, null, 2)).then(() => {
				showNotice('Manifest JSON copied to clipboard', 5000, 'success');
			});

		} catch (error) {
			console.error('Failed to copy manifest JSON to clipboard:', error);
			showNotice('Failed to copy manifest JSON to clipboard. Check the developer console for details', 10000, 'error');
		}
	}

	formatCSS(code: string) {
		// https://prettier.io/docs/options#end-of-line
		return prettier.format(code, {
			parser: 'css',
			plugins: [css],
			tabWidth: Number(this.plugin.settings.editorTabWidth)
		});
	}

}