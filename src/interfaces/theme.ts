/**
 * Interface for Obsidian theme manifest
 * https://docs.obsidian.md/Themes/App+themes/Build+a+theme
 */
export interface ThemeManifest {
	name: string;
	version: string;
	minAppVersion: string;
	author: string;
	authorUrl: string;
}
