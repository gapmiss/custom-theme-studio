import { AceDarkThemes, AceKeyboard, AceLightThemes } from '../ace/AceThemes';

export const CODE_EDITOR_VIEW_TYPE = 'ace-code-editor';

export interface ICodeEditorConfig {
	lightTheme: AceLightThemes;
	darkTheme: AceDarkThemes;
	keyboard: AceKeyboard;
	lineNumbers: boolean;
	fontSize: number;
	fontFamily: string;
	tabSize: number;
	wrap: boolean;
}
