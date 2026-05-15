/**
 * Type definitions for undocumented Obsidian API methods
 * These extend the official Obsidian types with additional methods used by the plugin
 */

declare module 'obsidian' {
	interface App {
		/**
		 * Get the current theme name
		 * @returns 'obsidian' for light theme, 'moonstone' for dark theme, or other custom theme names
		 */
		getTheme(): string;

		/**
		 * Change the current theme
		 * @param theme Theme name ('obsidian', 'moonstone', or custom theme name)
		 */
		changeTheme(theme: string): void;
	}
}

export {};