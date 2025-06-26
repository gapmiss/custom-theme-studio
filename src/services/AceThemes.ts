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
	{ display: 'Chrome', value: 'chrome' },
	{ display: 'Cloud Editor', value: 'cloud_editor' },
	{ display: 'Cloud9 Day', value: 'cloud9_day' },
	{ display: 'Clouds', value: 'clouds' },
	{ display: 'Crimson Editor', value: 'crimson_editor' },
	{ display: 'Dawn', value: 'dawn' },
	{ display: 'Dreamweaver', value: 'dreamweaver' },
	{ display: 'Eclipse', value: 'eclipse' },
	{ display: 'Github (Legacy)', value: 'github' },
	{ display: 'Github Light Default', value: 'github_light_default' },
	{ display: 'Gruvbox Light Hard', value: 'gruvbox_light_hard' },
	{ display: 'iPlastic', value: 'iplastic' },
	{ display: 'Katzenmilch', value: 'katzenmilch' },
	{ display: 'Kuroir', value: 'kuroir' },
	{ display: 'Solarized Light', value: 'solarized_light' },
	{ display: 'Sqlserver', value: 'sqlserver' },
	{ display: 'Textmate', value: 'textmate' },
	{ display: 'Tomorrow', value: 'tomorrow' },
	{ display: 'XCode', value: 'xcode' },
];

export type AceLightThemes = (typeof AceLightThemesList);

export const AceDarkThemesList: Record<string, string>[] = [
	{ display: 'Ambiance', value: 'ambiance' },
	{ display: 'Chaos', value: 'chaos' },
	{ display: 'Cloud Editor Dark', value: 'cloud_editor_dark' },
	{ display: 'Cloud9 Night', value: 'cloud9_night' },
	{ display: 'Cloud9 Night Low Color', value: 'cloud9_night_low_color' },
	{ display: 'Clouds Midnight', value: 'clouds_midnight' },
	{ display: 'Cobalt', value: 'cobalt' },
	{ display: 'Dracula', value: 'dracula' },
	{ display: 'Github Dark', value: 'github_dark' },
	{ display: 'Gob', value: 'gob' },
	{ display: 'Gruvbox', value: 'gruvbox' },
	{ display: 'Gruvbox Dark Hard', value: 'gruvbox_dark_hard' },
	{ display: 'idle Fingers', value: 'idle_fingers' },
	{ display: 'krTheme', value: 'kr_theme' },
	{ display: 'Merbivore', value: 'merbivore' },
	{ display: 'Merbivore Soft', value: 'merbivore_soft' },
	{ display: 'Mono Industrial', value: 'mono_industrial' },
	{ display: 'Monokai', value: 'monokai' },
	{ display: 'Nord Dark', value: 'nord_dark' },
	{ display: 'One Dark', value: 'one_dark' },
	{ display: 'Pastel on Dark', value: 'pastel_on_dark' },
	{ display: 'Solarized Dark', value: 'solarized_dark' },
	{ display: 'Terminal', value: 'terminal' },
	{ display: 'Tomorrow Night', value: 'tomorrow_night' },
	{ display: 'Tomorrow Night Blue', value: 'tomorrow_night_blue' },
	{ display: 'Tomorrow Night Bright', value: 'tomorrow_night_bright' },
	{ display: 'Tomorrow Night Eighties', value: 'tomorrow_night_eighties' },
	{ display: 'Twilight', value: 'twilight' },
	{ display: 'Vibrant Ink', value: 'vibrant_ink' },
];

export type AceDarkThemes = (typeof AceDarkThemesList);

export const AceKeyboardList: string[] = ['default', 'vscode', 'sublime', 'emacs', 'vim'];

export type AceKeyboard = (typeof AceKeyboardList)[number];
