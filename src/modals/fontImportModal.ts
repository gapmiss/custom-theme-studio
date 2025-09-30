import { type App, Setting, debounce, Modal, arrayBufferToBase64 } from "obsidian";
import type CustomThemeStudioPlugin from "../main";
import { CustomThemeStudioView, VIEW_TYPE_CTS } from "../views/customThemeStudioView";
import { generateUniqueId, showNotice, Logger } from "../utils";
import { confirm } from "./confirmModal";
import fs from 'fs';
import path from 'path';

export class FontImportModal extends Modal {
	plugin: CustomThemeStudioPlugin;
	view: CustomThemeStudioView;
	private fontName: string = '';
	private base64Content: string | null = '';
	private fontExtensions: string[];
	private fontFilePath: string;

	constructor(app: App, plugin: CustomThemeStudioPlugin) {
		super(app);
		this.plugin = plugin;
		this.fontExtensions = ['ttf', 'otf', 'woff', 'woff2'];
		this.fontFilePath = '';
	}

	async onOpen() {
		const { contentEl } = this;

		if (contentEl.parentElement) {
			contentEl.parentElement.addClass('cts-font-import-modal');
		}

		contentEl.createEl('h3', { text: 'Import font' });

		// Help notice regarding performance
		contentEl.createDiv(
			{
				text: 'Embedding assets increases the file size of your theme, which may lead to poor performance in the following situations:'
			}
		);

		// Create a <ul> list with <li> items
		const listItems = [
			'Downloading and updating your theme from the community theme directory.',
			'Loading and using your theme in the Obsidian app.',
			'Editing your theme in a code editor.'
		];

		const listFragment = contentEl.createEl('ul');
		listItems.forEach(text => {
			listFragment.appendChild(contentEl.createEl('li', { text }));
		});
		contentEl.appendChild(listFragment);

		// Link with supporting documentation
		const linkContainer = contentEl.createDiv('cts-font-import-modal-desc');
		linkContainer.createSpan(
			{
				text: 'See: '
			}
		);
		linkContainer.createEl(
			'a',
			{
				cls: 'external-link',
				href: 'https://docs.obsidian.md/Themes/App+themes/Embed+fonts+and+images+in+your+theme#Consider+file+size',
				text: 'Embed fonts and images in your theme - Developer Documentation',
				attr: {
					'aria-label': 'https://docs.obsidian.md/Themes/App+themes/Embed+fonts+and+images+in+your+theme#Consider+file+size',
					'data-tooltip-position': 'top',
					tabindex: '0'
				}
			}
		);

		// Font name input
		const fontNameInput = new Setting(contentEl)
			.setName('Font name')
			.setDesc('Enter a font name which is used to identify this font in your CSS rules/variables.')
			.addText(text => text
				.setValue('')
				.setPlaceholder('Enter font name')
				.onChange(async (value) => {
					this.fontName = value;
				})
			);

		// Choose font file
		new Setting(contentEl)
			.setDesc('Choose a font file to create a new @font-face rule')
			.addButton((button) => {
				button.setButtonText('Choose');
				button.onClick(async () => {
					const nameInput = fontNameInput.settingEl.querySelector('input');
					if (!nameInput) {
						Logger.error('Font name input element not found');
						showNotice('Font import interface error - please try again', 5000, 'error');
						return;
					}

					this.fontName = nameInput.value;

					if (!this.fontName) {
						showNotice('Please enter a name for the font you want to import', 5000, 'error');
						nameInput.focus();
						return;
					}
					this.base64Content = await this.importFontFile();
					if (this.base64Content) {
						let css = this.generateFontFaceRule();
						let uuid = generateUniqueId();
						let rule = "@font-face: " + this.fontName;

						// Add new rule
						this.plugin.settings.cssRules.push({
							uuid,
							rule,
							css,
							enabled: false
						});
						this.plugin.saveSettings();
						this.close();

						let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS).first();
						if (leaf) {
							if (!await confirm('The @font-face has been saved as a new CSS rule. Click "OK" to reload the "Custom Theme Studio" view or if you have unsaved changes, click "Cancel" to reload the view manually at a later time.', this.plugin.app)) {
								return;
							}
							await this.app.workspace.revealLeaf(leaf);
							if (leaf.view instanceof CustomThemeStudioView) {
								let view = leaf.view;
								const ruleList = view.containerEl.querySelector('.css-rule');
								if (ruleList) {
									ruleList.empty();
									// Sort by "rule" value ASC
									this.plugin.settings.cssRules.sort((a, b) => a.rule!.localeCompare(b.rule!));
									// Re-populate with all rules
									this.plugin.settings.cssRules.forEach(rule => {
										view.cssEditorManager.createRuleItem(ruleList as HTMLElement, rule);
									});

									// Scroll custom rule to the top of view
									if (this.plugin.settings.viewScrollToTop) {
										setTimeout(() => {
											const ruleDiv: HTMLElement | null = view.containerEl.querySelector(`[data-cts-uuid="${uuid}"]`);
											view.scrollToDiv(ruleDiv!);
										}, 100);
									}
								}
							}
						} else {
							showNotice('The @font-face has been saved as a new CSS rule', 5000, 'success');
						}
					}
				});
			});

		let debounceFocus = debounce(
			() => {
				const nameInput = fontNameInput.settingEl.querySelector('input');
				if (nameInput) {
					nameInput.focus();
				}
			},
			10,
			true
		);
		debounceFocus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private generateFontFaceRule(): string {
		let mimeType: string;
		let ext = path.extname(this.fontFilePath);
		// Determine the MIME type based on file extension
		switch (ext) {
			case '.woff':
				mimeType = 'font/woff';
				break;
			case '.woff2':
				mimeType = 'font/woff2';
				break;
			case '.ttf':
				mimeType = 'font/ttf';
				break;
			case '.otf':
				mimeType = 'font/otf';
				break;
			default:
				mimeType = 'application/octet-stream';
				break;
		}
		return `@font-face {\n\tfont-family: "${this.fontName}";\n\tsrc: url(data:${mimeType};base64,${this.base64Content});\n}`;
	}

	private async importFontFile() {
		const windowWithRequire = window as typeof window & { require?: NodeRequire };
		const electron = windowWithRequire.require
			? windowWithRequire.require('electron')
			: null;
		const remote = electron ? electron.remote : null;

		const { canceled, filePaths } = await remote.dialog.showOpenDialog({
			title: 'Import CFG Settings',
			filters: [{ name: 'Font files', extensions: this.fontExtensions }],
			properties: ['openFile'],
		});

		if (canceled || !filePaths || filePaths.length === 0) {
			return null;
		}

		this.fontFilePath = filePaths[0];
		const fileContent: any = fs.readFileSync(this.fontFilePath);

		return arrayBufferToBase64(fileContent);
	}

}