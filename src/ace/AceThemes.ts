import 'ace-builds/src-noconflict/ace';
// light-theme
import 'ace-builds/src-noconflict/theme-chrome';
import 'ace-builds/src-noconflict/theme-cloud_editor';
import 'ace-builds/src-noconflict/theme-cloud9_day';
import 'ace-builds/src-noconflict/theme-clouds';
import 'ace-builds/src-noconflict/theme-crimson_editor';
import 'ace-builds/src-noconflict/theme-dawn';
import 'ace-builds/src-noconflict/theme-dreamweaver';
import 'ace-builds/src-noconflict/theme-eclipse';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-github_light_default';
import 'ace-builds/src-noconflict/theme-gruvbox_light_hard';
import 'ace-builds/src-noconflict/theme-iplastic';
import 'ace-builds/src-noconflict/theme-katzenmilch';
import 'ace-builds/src-noconflict/theme-kuroir';
import 'ace-builds/src-noconflict/theme-solarized_light';
import 'ace-builds/src-noconflict/theme-sqlserver';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-xcode';
// dark-theme
import 'ace-builds/src-noconflict/theme-ambiance';
import 'ace-builds/src-noconflict/theme-chaos';
import 'ace-builds/src-noconflict/theme-cloud9_night';
import 'ace-builds/src-noconflict/theme-cloud9_night_low_color';
import 'ace-builds/src-noconflict/theme-clouds_midnight';
import 'ace-builds/src-noconflict/theme-cobalt';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-github_dark';
import 'ace-builds/src-noconflict/theme-gob';
import 'ace-builds/src-noconflict/theme-gruvbox';
import 'ace-builds/src-noconflict/theme-gruvbox_dark_hard';
import 'ace-builds/src-noconflict/theme-idle_fingers';
import 'ace-builds/src-noconflict/theme-kr_theme';
import 'ace-builds/src-noconflict/theme-merbivore';
import 'ace-builds/src-noconflict/theme-merbivore_soft';
import 'ace-builds/src-noconflict/theme-mono_industrial';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-nord_dark';
import 'ace-builds/src-noconflict/theme-one_dark';
import 'ace-builds/src-noconflict/theme-pastel_on_dark';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import 'ace-builds/src-noconflict/theme-terminal';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import 'ace-builds/src-noconflict/theme-tomorrow_night_blue';
import 'ace-builds/src-noconflict/theme-tomorrow_night_bright';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-vibrant_ink';

const lightThemes: [string, string][] = [
	['Chrome', 'chrome'],
	['Cloud Editor', 'cloud_editor'],
	['Cloud9 Day', 'cloud9_day'],
	['Clouds', 'clouds'],
	['Crimson Editor', 'crimson_editor'],
	['Dawn', 'dawn'],
	['Dreamweaver', 'dreamweaver'],
	['Eclipse', 'eclipse'],
	['Github (Legacy)', 'github'],
	['Github Light Default', 'github_light_default'],
	['Gruvbox Light Hard', 'gruvbox_light_hard'],
	['iPlastic', 'iplastic'],
	['Katzenmilch', 'katzenmilch'],
	['Kuroir', 'kuroir'],
	['Solarized Light', 'solarized_light'],
	['Sqlserver', 'sqlserver'],
	['Textmate', 'textmate'],
	['Tomorrow', 'tomorrow'],
	['XCode', 'xcode'],
];

export const AceLightThemesList: Record<string, string>[] = lightThemes.map(
	([name, value]) => ({ name, value })
);

export type AceLightThemes = (typeof AceLightThemesList);

const darkThemes: [string, string][] = [
	['Ambiance', 'ambiance'],
	['Chaos', 'chaos'],
	['Cloud Editor Dark', 'cloud_editor_dark'],
	['Cloud9 Night', 'cloud9_night'],
	['Cloud9 Night Low Color', 'cloud9_night_low_color'],
	['Clouds Midnight', 'clouds_midnight'],
	['Cobalt', 'cobalt'],
	['Dracula', 'dracula'],
	['Github Dark', 'github_dark'],
	['Gob', 'gob'],
	['Gruvbox', 'gruvbox'],
	['Gruvbox Dark Hard', 'gruvbox_dark_hard'],
	['idle Fingers', 'idle_fingers'],
	['krTheme', 'kr_theme'],
	['Merbivore', 'merbivore'],
	['Merbivore Soft', 'merbivore_soft'],
	['Mono Industrial', 'mono_industrial'],
	['Monokai', 'monokai'],
	['Nord Dark', 'nord_dark'],
	['One Dark', 'one_dark'],
	['Pastel on Dark', 'pastel_on_dark'],
	['Solarized Dark', 'solarized_dark'],
	['Terminal', 'terminal'],
	['Tomorrow Night', 'tomorrow_night'],
	['Tomorrow Night Blue', 'tomorrow_night_blue'],
	['Tomorrow Night Bright', 'tomorrow_night_bright'],
	['Tomorrow Night Eighties', 'tomorrow_night_eighties'],
	['Twilight', 'twilight'],
	['Vibrant Ink', 'vibrant_ink'],
];

export const AceDarkThemesList: Record<string, string>[] = darkThemes.map(
	([name, value]) => ({ name, value })
);

export type AceDarkThemes = (typeof AceDarkThemesList);

export const AceKeyboardList: string[] = ['default', 'vscode', 'sublime', 'emacs', 'vim'];

export type AceKeyboard = (typeof AceKeyboardList)[number];
