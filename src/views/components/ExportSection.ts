import { UIComponent, ComponentContext } from './UIComponent';
import { createCollapsibleSection, createIconButton, createToggleSwitch } from '../../utils/uiHelpers';
import { DEFAULT_SETTINGS } from '../../settings';

export class ExportSection extends UIComponent {
	private nameInput?: HTMLInputElement;
	private authorInput?: HTMLInputElement;
	private urlInput?: HTMLInputElement;
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
				this.saveSettings();
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
			text: 'Export your custom variables and rules as CSS and manifest files to create a shareable theme.'
		});
	}

	private renderForm(container: HTMLElement): void {
		const formContainer = container.createDiv('export-form');

		this.renderThemeNameInput(formContainer);
		this.renderAuthorInput(formContainer);
		this.renderURLInput(formContainer);
		this.renderIncludeDisabledToggle(formContainer);
		this.renderPrettierToggle(formContainer);
	}

	private renderThemeNameInput(container: HTMLElement): void {
		const nameContainer = container.createDiv('export-form-item');
		nameContainer.createSpan({ text: 'Theme Name:' });

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

	private renderIncludeDisabledToggle(container: HTMLElement): void {
		const includeDisabledContainer = container.createDiv('export-form-item include-disabled-toggle');

		const { toggle } = createToggleSwitch(
			includeDisabledContainer,
			'include-disabled-switch',
			'Include disabled CSS rules when exporting',
			this.plugin.settings.exportThemeIncludeDisabled,
			async (checked) => {
				this.plugin.settings.exportThemeIncludeDisabled = checked;
				await this.saveSettings();
			}
		);
	}

	private renderPrettierToggle(container: HTMLElement): void {
		const enablePrettierContainer = container.createDiv('export-form-item enable-prettier-toggle');

		const { toggle } = createToggleSwitch(
			enablePrettierContainer,
			'enable-prettier-switch',
			'Format CSS with Prettier formatter',
			this.plugin.settings.exportPrettierFormat,
			async (checked) => {
				this.plugin.settings.exportPrettierFormat = checked;
				await this.saveSettings();
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
			onClick: async () => {
				this.plugin.themeManager.exportThemeCSS();
			}
		});

		createIconButton(exportCSSButtons, {
			icon: 'copy',
			label: 'Copy CSS to clipboard',
			classes: ['copy-css-button'],
			onClick: () => {
				this.plugin.themeManager.copyThemeToClipboard();
			}
		});
	}

	private renderManifestButtons(container: HTMLElement): void {
		const exportManifestButtons = container.createDiv('export-manifest-buttons');
		exportManifestButtons.createSpan({ text: 'Manifest: ' });

		createIconButton(exportManifestButtons, {
			icon: 'download',
			label: 'Export manifest JSON',
			onClick: async () => {
				this.plugin.themeManager.exportThemeManifest();
			}
		});

		createIconButton(exportManifestButtons, {
			icon: 'copy',
			label: 'Copy manifest JSON to clipboard',
			classes: ['copy-manifest-button'],
			onClick: () => {
				this.plugin.themeManager.copyManifestToClipboard();
			}
		});
	}

	// Event Handler Methods
	private handleNameInputChange(value: string): void {
		this.settingsManager.update('exportThemeName', value);
	}

	private handleAuthorInputChange(value: string): void {
		this.settingsManager.update('exportThemeAuthor', value);
	}

	private handleURLInputChange(value: string): void {
		this.settingsManager.update('exportThemeURL', value);
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