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

export const AceLightThemesList: Record<string, string>[] = [
	{ name: 'Chrome', value: 'chrome' },
	{ name: 'Cloud Editor', value: 'cloud_editor' },
	{ name: 'Cloud9 Day', value: 'cloud9_day' },
	{ name: 'Clouds', value: 'clouds' },
	{ name: 'Crimson Editor', value: 'crimson_editor' },
	{ name: 'Dawn', value: 'dawn' },
	{ name: 'Dreamweaver', value: 'dreamweaver' },
	{ name: 'Eclipse', value: 'eclipse' },
	{ name: 'Github (Legacy)', value: 'github' },
	{ name: 'Github Light Default', value: 'github_light_default' },
	{ name: 'Gruvbox Light Hard', value: 'gruvbox_light_hard' },
	{ name: 'iPlastic', value: 'iplastic' },
	{ name: 'Katzenmilch', value: 'katzenmilch' },
	{ name: 'Kuroir', value: 'kuroir' },
	{ name: 'Solarized Light', value: 'solarized_light' },
	{ name: 'Sqlserver', value: 'sqlserver' },
	{ name: 'Textmate', value: 'textmate' },
	{ name: 'Tomorrow', value: 'tomorrow' },
	{ name: 'XCode', value: 'xcode' },
];

export type AceLightThemes = (typeof AceLightThemesList);

export const AceDarkThemesList: Record<string, string>[] = [
	{ name: 'Ambiance', value: 'ambiance' },
	{ name: 'Chaos', value: 'chaos' },
	{ name: 'Cloud Editor Dark', value: 'cloud_editor_dark' },
	{ name: 'Cloud9 Night', value: 'cloud9_night' },
	{ name: 'Cloud9 Night Low Color', value: 'cloud9_night_low_color' },
	{ name: 'Clouds Midnight', value: 'clouds_midnight' },
	{ name: 'Cobalt', value: 'cobalt' },
	{ name: 'Dracula', value: 'dracula' },
	{ name: 'Github Dark', value: 'github_dark' },
	{ name: 'Gob', value: 'gob' },
	{ name: 'Gruvbox', value: 'gruvbox' },
	{ name: 'Gruvbox Dark Hard', value: 'gruvbox_dark_hard' },
	{ name: 'idle Fingers', value: 'idle_fingers' },
	{ name: 'krTheme', value: 'kr_theme' },
	{ name: 'Merbivore', value: 'merbivore' },
	{ name: 'Merbivore Soft', value: 'merbivore_soft' },
	{ name: 'Mono Industrial', value: 'mono_industrial' },
	{ name: 'Monokai', value: 'monokai' },
	{ name: 'Nord Dark', value: 'nord_dark' },
	{ name: 'One Dark', value: 'one_dark' },
	{ name: 'Pastel on Dark', value: 'pastel_on_dark' },
	{ name: 'Solarized Dark', value: 'solarized_dark' },
	{ name: 'Terminal', value: 'terminal' },
	{ name: 'Tomorrow Night', value: 'tomorrow_night' },
	{ name: 'Tomorrow Night Blue', value: 'tomorrow_night_blue' },
	{ name: 'Tomorrow Night Bright', value: 'tomorrow_night_bright' },
	{ name: 'Tomorrow Night Eighties', value: 'tomorrow_night_eighties' },
	{ name: 'Twilight', value: 'twilight' },
	{ name: 'Vibrant Ink', value: 'vibrant_ink' },
];

export type AceDarkThemes = (typeof AceDarkThemesList);

export const AceKeyboardList: string[] = ['default', 'vscode', 'sublime', 'emacs', 'vim'];

export type AceKeyboard = (typeof AceKeyboardList)[number];
