import { type App, Setting, debounce, Modal } from "obsidian";
import type CustomThemeStudioPlugin from "../main";
import { CustomThemeStudioView, VIEW_TYPE_CTS } from "../views/customThemeStudioView";
import { generateUniqueId, showNotice } from "../utils";
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

		contentEl.parentElement!.addClass('cts-font-import-modal');

		contentEl.createEl('h3', { text: 'Import font' });

		// Help notice regarding performance
		contentEl.createDiv({
			text: 'Embedding assets increases the file size of your theme, which may lead to poor performance in the following situations:'
		})
		let listFragment = contentEl.createEl('ul');
		listFragment.appendChild(contentEl.createEl('li', {
			text: 'Downloading and updating your theme from the community theme directory.',
		}))
		listFragment.appendChild(contentEl.createEl('li', {
			text: 'Loading and using your theme in the Obsidian app.',
		}))
		listFragment.appendChild(contentEl.createEl('li', {
			text: 'Editing your theme in a code editor.',
		}))
		contentEl.appendChild(listFragment);
		contentEl.createDiv('cts-font-import-modal-desc')
			.createSpan({
				text: 'See: '
			})
			.createEl('a', {
				href: 'https://docs.obsidian.md/Themes/App+themes/Embed+fonts+and+images+in+your+theme#Consider+file+size',
				text: 'Embed fonts and images in your theme - Developer Documentation',
				attr: { 'aria-label': 'https://docs.obsidian.md/Themes/App+themes/Embed+fonts+and+images+in+your+theme#Consider+file+size', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
			})

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
			.setDesc('Choose a font file to create a new @font-face custom element')
			.addButton((button) => {
				button.setButtonText('Choose');
				button.onClick(async () => {
					this.fontName = fontNameInput.settingEl.querySelector('input')!.value;

					if (!this.fontName) {
						showNotice('Please enter a name for the font you want to import', 5000, 'error');
						fontNameInput.settingEl.querySelector('input')?.focus();
						return;
					}
					this.base64Content = await this.importFontFile();
					if (this.base64Content) {
						let name = "@font-face: " + this.fontName;
						let css = this.generateFontFaceRule();
						let uuid = generateUniqueId();
						let selector = "@font-face: " + this.fontName;

						// Add new element
						this.plugin.settings.customElements.push({
							uuid,
							selector,
							css,
							name,
							enabled: false
						});
						this.plugin.saveSettings();
						this.close();

						let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS).first();
						if (leaf) {
							if (!await confirm('The @font-face has been saved as a new custom element. Click "OK" to reload the "Custom Theme Studio" view or if you have unsaved changes, click "Cancel" to reload the view manually at a later time.', this.plugin.app)) {
								return;
							}
							await this.app.workspace.revealLeaf(leaf);
							if (leaf.view instanceof CustomThemeStudioView) {
								let view = leaf.view;
								const elementList = view.containerEl.querySelector('.element-list');
								if (elementList) {
									elementList.empty();
									// Sort by "selector" value ASC
									this.plugin.settings.customElements.sort((a, b) => a.selector!.localeCompare(b.selector!));
									// Re-populate with all elements
									this.plugin.settings.customElements.forEach(element => {
										view.cssEditorManager.createElementItem(elementList as HTMLElement, element);
									});
								}
							}
						} else {
							showNotice('The @font-face has been saved as a new custom element', 5000, 'success');
						}

					}
				});
			});

		let debounceFocus = debounce(
			() => {
				console.log(fontNameInput.settingEl.querySelector('input')!);
				fontNameInput.settingEl.querySelector('input')!.focus();
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

	private arrayBufferToBase64(buffer: ArrayBuffer): string {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;

		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}

		return window.btoa(binary);
	}

	private generateFontFaceRule(): string {
		let mimeType: string;
		let ext = path.extname(this.fontFilePath)
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
		const electron = (window as any).require
			? (window as any).require('electron')
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
		const fileContent = fs.readFileSync(filePaths[0]);

		return this.arrayBufferToBase64(fileContent);
	}

}