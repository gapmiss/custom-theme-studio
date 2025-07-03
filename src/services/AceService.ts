import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/snippets/css.js';
import './AceExtensions';
import 'ace-builds/src-noconflict/keybinding-emacs';
import 'ace-builds/src-noconflict/keybinding-sublime';
import 'ace-builds/src-noconflict/keybinding-vim';
import 'ace-builds/src-noconflict/keybinding-vscode';
import { ICodeEditorConfig } from '../interfaces/types';
import CustomThemeStudioPlugin from '../main';



export class AceService {
	private editor: ace.Ace.Editor | null = null;
	plugin: CustomThemeStudioPlugin;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
	}

	createEditor(element: HTMLElement): ace.Ace.Editor {
		this.editor = ace.edit(element);
		return this.editor;
	}

	async configureEditor(config: ICodeEditorConfig, fileExtension: string) {
		if (!this.editor) return;

		const languageMode = 'css';
		const settings = this.getEditorSettings(languageMode, config, this.plugin);

		this.editor.setOptions(settings);
		this.editor.getSession().setMode(`ace/mode/${languageMode}`, () => {
			if (this.plugin.settings.enableAceColorPicker) {
				const AceColorPicker = require('../lib/ace-colorpicker');
				AceColorPicker.load(ace, this.editor, {
					hideDelay: 2000,
					showDelay: 500,
					type: 'vscode'
				});
			}
		})

		if (this.plugin.settings.editorKeyboard === 'default') {
			this.editor.setKeyboardHandler(null);
		} else {
			this.editor.setKeyboardHandler(`ace/keyboard/${this.plugin.settings.editorKeyboard}`);
		}
		this.updateTheme();
	}

	async updateTheme() {
		if (!this.editor) return;
		let themeName = this.plugin.settings.editorDarkTheme;
		let isObsidianThemeDark = () => document.body.classList.contains('theme-dark');

		if (this.plugin.settings.editorTheme === 'Auto') {
			themeName = isObsidianThemeDark()
				? this.plugin.settings.editorDarkTheme
				: this.plugin.settings.editorLightTheme;
		} else {
			if (this.plugin.settings.editorTheme === 'Dark') {
				themeName = this.plugin.settings.editorDarkTheme;
			} else {
				themeName = this.plugin.settings.editorLightTheme;
			}
		}
		this.editor.setTheme(`ace/theme/${themeName}`);
	}

	getValue(): string {
		return this.editor?.getValue() ?? '';
	}

	setValue(content: string, cursorPos?: number) {
		if (!this.editor) return;

		if (cursorPos !== undefined) {
			const currentPos = this.editor.getCursorPosition();
			this.editor.setValue(content, cursorPos);
			if (cursorPos === -1) {
				this.editor.moveCursorToPosition(currentPos);
				this.editor.clearSelection();
			}
		} else {
			this.editor.setValue(content);
		}

		this.editor.getSession().getUndoManager().reset();
	}

	hasFocus(): boolean {
		return this.editor?.isFocused() ?? false;
	}

	setKeyboardHandler(handler: string): void {
		if (!this.editor) return;
		this.editor.setKeyboardHandler(handler);
	}

	private getEditorSettings(languageMode: string, config: ICodeEditorConfig, plugin: CustomThemeStudioPlugin) {
		return {
			showLineNumbers: this.plugin.settings.editorLineNumbers,
			fontSize: this.plugin.settings.editorFontSize,
			fontFamily: this.plugin.settings.editorFontFamily,
			useWorker: false,
			tabSize: Number(this.plugin.settings.editorTabWidth),
			wrap: this.plugin.settings.editorWordWrap,
			mode: `ace/mode/${languageMode}`,
			enableBasicAutocompletion: this.plugin.settings.enableAceAutoCompletion,
			enableSnippets: this.plugin.settings.enableAceSnippets,
			enableLiveAutocompletion: this.plugin.settings.enableAceAutoCompletion,
			enableMultiselect: true
		};
	}

}
