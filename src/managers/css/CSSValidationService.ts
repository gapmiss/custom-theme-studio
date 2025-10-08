import CustomThemeStudioPlugin from '../../main';
import * as prettier from 'prettier';
import * as cssPlugin from 'prettier/plugins/postcss';
import { Logger, showNotice } from '../../utils';

/**
 * Handles CSS validation and theme application.
 * Encapsulates validation logic with documented design decisions.
 */
export class CSSValidationService {
	private plugin: CustomThemeStudioPlugin;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Validate CSS syntax using Prettier's CSS parser.
	 * Only called during manual save operations via saveElement().
	 *
	 * DESIGN DECISION: CSS Variables are NOT validated here.
	 * CSS Variables are simple key-value pairs stored separately and don't
	 * require CSS syntax validation. This method only validates CSS rules.
	 *
	 * @param cssCode The CSS code to validate
	 * @returns true if valid, false if invalid
	 */
	async validateCSS(cssCode: string): Promise<boolean> {
		try {
			await prettier.format(cssCode, {
				parser: 'css',
				plugins: [cssPlugin],
			});
			return true;
		} catch (error) {
			Logger.error('CSS validation failed:', error);
			showNotice('Invalid CSS syntax. Please check your code.', 5000, 'error');
			return false;
		}
	}

	/**
	 * Format CSS code using Prettier.
	 * Returns formatted CSS or null if formatting fails.
	 *
	 * @param cssCode The CSS code to format
	 * @returns Formatted CSS string or null if invalid
	 */
	async formatCSS(cssCode: string): Promise<string | null> {
		try {
			const formatted = await prettier.format(cssCode, {
				parser: 'css',
				plugins: [cssPlugin],
				tabWidth: Number(this.plugin.settings.editorTabWidth) || 4,
				useTabs: false,
			});
			return formatted;
		} catch (error) {
			Logger.error('CSS formatting failed:', error);
			showNotice('Unable to format CSS. Please check syntax.', 5000, 'error');
			return null;
		}
	}

	/**
	 * Update the full customCSS from all enabled rules.
	 * Used when rules are added, updated, or toggled.
	 */
	async updateCustomCSS(uuid: string, rule: string, css: string): Promise<void> {
		let fullCSS = '';
		const existingIndex = this.plugin.settings.cssRules.findIndex(el => el.uuid === uuid);

		if (existingIndex >= 0) {
			if (this.plugin.settings.cssRules[existingIndex].enabled) {
				// First add the current rule
				if (css !== '') {
					fullCSS += `/* ${rule} */\n${css}\n\n`;
				}
			}
		} else {
			// New CSS rule
			if (css !== '') {
				fullCSS += `/* ${rule} */\n${css}\n\n`;
			}
		}

		// Then add all other rules
		this.plugin.settings.cssRules.forEach(cssRule => {
			// Skip the current rule as we already added it
			if (cssRule.uuid === uuid) return;
			if (cssRule.enabled) {
				fullCSS += `/* ${cssRule.rule} */\n${cssRule.css}\n\n`;
			}
		});

		// Update the settings
		this.plugin.settings.customCSS = fullCSS;
		await this.plugin.saveSettings();
	}

	/**
	 * Update customCSS from all rules (for enable/disable operations)
	 */
	async rebuildCustomCSS(): Promise<void> {
		let fullCSS = '';
		this.plugin.settings.cssRules.forEach(rule => {
			if (rule.enabled) {
				fullCSS += `/* ${rule.rule} */\n${rule.css}\n\n`;
			}
		});

		this.plugin.settings.customCSS = fullCSS;
		await this.plugin.saveSettings();
	}

	/**
	 * Apply theme changes to the DOM
	 */
	applyTheme(): void {
		if (this.plugin.settings.themeEnabled) {
			this.plugin.themeManager.applyCustomTheme();
		}
	}
}
