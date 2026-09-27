import { UIComponent, ComponentContext } from './UIComponent';
import { createCollapsibleSection, createIconButton, createToggleSwitch } from '../../utils/uiHelpers';
import { DEFAULT_SETTINGS } from '../../settings';
import { showNotice } from '../../utils';
import { NOTICE_DURATIONS } from '../../constants';

export class ExportSection extends UIComponent {
	private nameInput?: HTMLInputElement;
	private authorInput?: HTMLInputElement;
	private urlInput?: HTMLInputElement;
	private versionInput?: HTMLInputElement;
	private minAppVersionInput?: HTMLInputElement;
	private settingsUnsubscribers: (() => void)[] = [];

	constructor(context: ComponentContext) {
		super(context);
		this.setupReactiveListeners();
	}

	render(): HTMLElement {
		const section = this.createSection('export-section');

		const { content } = createCollapsibleSection(section, {
			title: 'Export theme',
			expanded: this.plugin.settings.expandExportTheme,
			onToggle: (expanded) => {
				this.plugin.settings.expandExportTheme = expanded;
				void this.saveSettings();
			}
		});

		this.renderDescription(content);
		this.renderForm(content);
		this.renderButtons(content);

		return section;
	}

	private renderDescription(container: HTMLElement): void {
		const description = container.createDiv('export-description');
		description.createSpan({
			text: 'Download your variables and rules as a theme you can install or share.'
		});
	}

	private renderForm(container: HTMLElement): void {
		const formContainer = container.createDiv('export-form');

		this.renderThemeNameInput(formContainer);
		this.renderAuthorInput(formContainer);
		this.renderURLInput(formContainer);
		this.renderVersionInput(formContainer);
		this.renderMinAppVersionInput(formContainer);
		this.renderIncludeDisabledToggle(formContainer);
		this.renderPrettierToggle(formContainer);
	}

	private renderThemeNameInput(container: HTMLElement): void {
		const nameContainer = container.createDiv('export-form-item');
		nameContainer.createSpan({ text: 'Theme name:' });

		this.nameInput = nameContainer.createEl('input', {
			cls: 'export-form-theme-name',
			attr: {
				type: 'text',
				value: this.plugin.settings.exportThemeName || DEFAULT_SETTINGS.exportThemeName
			}
		});

		this.nameInput.addEventListener('change', () => {
			this.handleNameInputChange(this.nameInput!.value);
		});
	}

	private renderAuthorInput(container: HTMLElement): void {
		const authorContainer = container.createDiv('export-form-item');
		authorContainer.createSpan({ text: 'Author:' });

		this.authorInput = authorContainer.createEl('input', {
			cls: 'export-form-theme-author',
			attr: {
				type: 'text',
				value: this.plugin.settings.exportThemeAuthor || DEFAULT_SETTINGS.exportThemeAuthor
			}
		});

		this.authorInput.addEventListener('change', () => {
			this.handleAuthorInputChange(this.authorInput!.value);
		});
	}

	private renderURLInput(container: HTMLElement): void {
		const urlContainer = container.createDiv('export-form-item');
		urlContainer.createSpan({ text: 'URL:' });

		this.urlInput = urlContainer.createEl('input', {
			cls: 'export-form-theme-url',
			attr: {
				type: 'text',
				value: this.plugin.settings.exportThemeURL || DEFAULT_SETTINGS.exportThemeURL
			}
		});

		this.urlInput.addEventListener('change', () => {
			this.handleURLInputChange(this.urlInput!.value);
		});
	}

	private renderVersionInput(container: HTMLElement): void {
		const versionContainer = container.createDiv('export-form-item');
		versionContainer.createSpan({ text: 'Version:' });

		this.versionInput = versionContainer.createEl('input', {
			cls: 'export-form-theme-version',
			attr: {
				type: 'text',
				placeholder: DEFAULT_SETTINGS.exportThemeVersion,
				value: this.plugin.settings.exportThemeVersion || DEFAULT_SETTINGS.exportThemeVersion
			}
		});

		this.versionInput.addEventListener('change', () => {
			void this.handleVersionInputChange(this.versionInput!, 'exportThemeVersion');
		});
	}

	private renderMinAppVersionInput(container: HTMLElement): void {
		const minAppVersionContainer = container.createDiv('export-form-item');
		minAppVersionContainer.createSpan({ text: 'Min. Obsidian:' });

		this.minAppVersionInput = minAppVersionContainer.createEl('input', {
			cls: 'export-form-theme-min-app-version',
			attr: {
				type: 'text',
				placeholder: DEFAULT_SETTINGS.exportThemeMinAppVersion,
				'aria-label': 'Minimum Obsidian version',
				'data-tooltip-position': 'top',
				value: this.plugin.settings.exportThemeMinAppVersion || DEFAULT_SETTINGS.exportThemeMinAppVersion
			}
		});

		this.minAppVersionInput.addEventListener('change', () => {
			void this.handleVersionInputChange(this.minAppVersionInput!, 'exportThemeMinAppVersion');
		});
	}

	private renderIncludeDisabledToggle(container: HTMLElement): void {
		const includeDisabledContainer = container.createDiv('export-form-item include-disabled-toggle');

		createToggleSwitch(
			includeDisabledContainer,
			'include-disabled-switch',
			'Include disabled CSS rules when exporting',
			this.plugin.settings.exportThemeIncludeDisabled,
			(checked) => {
				this.plugin.settings.exportThemeIncludeDisabled = checked;
				void this.saveSettings();
			}
		);
	}

	private renderPrettierToggle(container: HTMLElement): void {
		const enablePrettierContainer = container.createDiv('export-form-item enable-prettier-toggle');

		createToggleSwitch(
			enablePrettierContainer,
			'enable-prettier-switch',
			'Format CSS with prettier',
			this.plugin.settings.exportPrettierFormat,
			(checked) => {
				this.plugin.settings.exportPrettierFormat = checked;
				void this.saveSettings();
			}
		);
	}

	private renderButtons(container: HTMLElement): void {
		const buttonContainer = container.createDiv('button-container');

		this.renderCSSButtons(buttonContainer);
		this.renderManifestButtons(buttonContainer);
	}

	private renderCSSButtons(container: HTMLElement): void {
		const exportCSSButtons = container.createDiv('export-css-buttons');
		exportCSSButtons.createSpan({ text: 'CSS: ' });

		createIconButton(exportCSSButtons, {
			icon: 'download',
			label: 'Export CSS',
			onClick: () => {
				void this.plugin.themeManager.exportThemeCSS();
			}
		});

		createIconButton(exportCSSButtons, {
			icon: 'copy',
			label: 'Copy CSS to clipboard',
			classes: ['copy-css-button'],
			onClick: () => {
				void this.plugin.themeManager.copyThemeToClipboard();
			}
		});
	}

	private renderManifestButtons(container: HTMLElement): void {
		const exportManifestButtons = container.createDiv('export-manifest-buttons');
		exportManifestButtons.createSpan({ text: 'Manifest: ' });

		createIconButton(exportManifestButtons, {
			icon: 'download',
			label: 'Export manifest JSON',
			onClick: () => {
				void this.plugin.themeManager.exportThemeManifest();
			}
		});

		createIconButton(exportManifestButtons, {
			icon: 'copy',
			label: 'Copy manifest JSON to clipboard',
			classes: ['copy-manifest-button'],
			onClick: () => {
				void this.plugin.themeManager.copyManifestToClipboard();
			}
		});
	}

	// Event Handler Methods
	private handleNameInputChange(value: string): void {
		void this.settingsManager.update('exportThemeName', value);
	}

	private handleAuthorInputChange(value: string): void {
		void this.settingsManager.update('exportThemeAuthor', value);
	}

	private handleURLInputChange(value: string): void {
		void this.settingsManager.update('exportThemeURL', value);
	}

	private async handleVersionInputChange(input: HTMLInputElement, key: 'exportThemeVersion' | 'exportThemeMinAppVersion'): Promise<void> {
		const saved = await this.settingsManager.update(key, input.value);
		if (!saved) {
			showNotice('Use a version like 1.0.0', NOTICE_DURATIONS.STANDARD, 'error');
			input.value = this.plugin.settings[key] || DEFAULT_SETTINGS[key];
		}
	}

	private setupReactiveListeners(): void {
		// Listen for settings changes and update UI accordingly
		this.settingsUnsubscribers.push(
			this.settingsManager.onChange('exportThemeName', (value) => {
				if (this.nameInput && this.nameInput.value !== value) {
					this.nameInput.value = value;
				}
			}),

			this.settingsManager.onChange('exportThemeAuthor', (value) => {
				if (this.authorInput && this.authorInput.value !== value) {
					this.authorInput.value = value;
				}
			}),

			this.settingsManager.onChange('exportThemeURL', (value) => {
				if (this.urlInput && this.urlInput.value !== value) {
					this.urlInput.value = value;
				}
			}),

			this.settingsManager.onChange('exportThemeVersion', (value) => {
				if (this.versionInput && this.versionInput.value !== value) {
					this.versionInput.value = value;
				}
			}),

			this.settingsManager.onChange('exportThemeMinAppVersion', (value) => {
				if (this.minAppVersionInput && this.minAppVersionInput.value !== value) {
					this.minAppVersionInput.value = value;
				}
			})
		);
	}

	destroy(): void {
		// Clean up settings listeners
		this.settingsUnsubscribers.forEach(unsub => unsub());
		this.settingsUnsubscribers = [];

		this.element?.remove();
	}
}