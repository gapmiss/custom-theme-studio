import { type App, Setting, setIcon, Modal } from "obsidian";
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
	private fontFaceRule: string = '';
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
		
		contentEl.createEl('h3', { text: 'Import font and create @font-face rule' });
		
		// Font name input
		const fontNameInput = new Setting(contentEl)
			.setName('Font name')
			.addText(text => text
				.setValue('')
				.setPlaceholder('Enter font name')
				.onChange(async (value) => {
					this.fontName = value;
				})
			);

		// Choose font file dialog
		new Setting(contentEl)
			.setName('Choose font')
			.addButton((button) => {
				button.setButtonText('Import font');
				button.onClick(async () => {
					this.fontName = fontNameInput.settingEl.querySelector('input')!.value;

					if (!this.fontName) {
						showNotice('Please enter a name for the font you want to import', 5000, 'error');
						return;
					}
					this.base64Content = await this.importFontFile();
					if (this.base64Content) {
						this.fontFaceRule = this.generateFontFaceRule();
						let name = this.fontName;
						let css = this.generateFontFaceRule();
						let uuid = generateUniqueId();
						let selector = name;
						// Add new element
						this.plugin.settings.customElements.push({
							uuid,
							selector,
							css,
							name: "@font-face: " + name || undefined,
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
									// Re-populate with all elements
									this.plugin.settings.customElements.forEach(element => {
										view.cssEditorManager.createElementItem(elementList as HTMLElement, element);
									});
									let elementSection = view.containerEl.querySelector('.element-section')?.querySelector('.collapsible-content');
									let toggleIcon: HTMLElement|null|undefined = view.containerEl.querySelector('.element-section')?.querySelector('.collapse-icon');
									if (elementSection && toggleIcon) {
										elementSection.addClass('collapsible-content-show');
										elementSection.removeClass('collapsible-content-hide');
										setIcon(toggleIcon, 'chevron-down');
										toggleIcon.setAttr('aria-label', 'Collapse section');
										toggleIcon.setAttr('data-tooltip-position', 'top');
									}
								}
							}
						} else {
							showNotice('The @font-face has been saved as a new custom element', 5000, 'success');
						}

					}
				});
			});

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