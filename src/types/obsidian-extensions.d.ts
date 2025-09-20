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

		/**
		 * Access to plugin management functionality
		 */
		plugins: {
			/**
			 * Disable a plugin by its ID
			 * @param pluginId The plugin identifier
			 */
			disablePlugin(pluginId: string): Promise<void>;

			/**
			 * Enable a plugin by its ID
			 * @param pluginId The plugin identifier
			 */
			enablePlugin(pluginId: string): Promise<void>;
		};

		/**
		 * Access to settings management functionality
		 */
		setting: {
			/**
			 * Open a specific settings tab by ID
			 * @param tabId The settings tab identifier
			 * @returns Object with display method
			 */
			openTabById(tabId: string): {
				display(): void;
			};
		};
	}
}

export {};