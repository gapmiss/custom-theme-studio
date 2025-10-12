import type { CustomThemeStudioSettings } from '.';
import { Notice, TFile } from 'obsidian';
import type { App } from 'obsidian';
import { Logger } from '../utils';

// source: https://github.com/al0cam/AutoMover/blob/master/IO/SettingsIO.ts
class SettingsIO {
    private static instance: SettingsIO;
    private app: App;

    private constructor() { }

    public static getInstance(): SettingsIO {
        if (!SettingsIO.instance) {
            SettingsIO.instance = new SettingsIO();
        }
        return SettingsIO.instance;
    }

    public init(app: App): void {
        this.app = app;
    }

    /**
     * Exports the plugin settings to a JSON file in the vault.
     * The file will be created as CTS_settings.json in the vault root.
     *
     * @param settings - The settings object to export.
     * @returns A promise that resolves to true if the export was successful, false otherwise.
     */
    public async exportSettings(settings: CustomThemeStudioSettings, app: App) {
        try {
            if (!app) {
                throw new Error('App reference not set');
            }

            const settingsData = JSON.stringify(settings, null, 2);
            return this.exportToVault(settingsData, app);
        } catch (error) {
            Logger.error('Failed to export settings:', error);
            new Notice('Failed to export settings');
            return false;
        }
    }

    /**
     * Exports the settings to the vault.
     * Exports the settings to a file named CTS_settings.json
     *
     * @param settingsData - The settings data to export.
     * @returns A promise that resolves to true if the export was successful, false otherwise.
     */
    private async exportToVault(settingsData: string, app: App): Promise<boolean> {
        try {
            const filename = 'CTS_settings.json';
            const existingFile = app.vault.getAbstractFileByPath(filename);

            if (existingFile instanceof TFile) {
                // Create backup before overwriting
                const backupName = `CTS_settings_backup_${Date.now()}.json`;
                await app.vault.copy(existingFile, backupName);
                await app.vault.modify(existingFile, settingsData);
            } else {
                await app.vault.create(filename, settingsData);
            }

            new Notice(`Settings exported to vault: ${filename}`);
            return true;
        } catch (error) {
            Logger.error('Failed to export to vault:', error);
            new Notice('Failed to export settings to vault');
            return false;
        }
    }

    /**
     * Imports settings from a JSON file in the vault.
     * Looks for CTS_settings.json in the vault root.
     *
     * @returns The imported settings or null if the import failed.
     */
    public async importSettings(app: App): Promise<CustomThemeStudioSettings | null> {
        try {
            if (!app) {
                throw new Error('App reference not set');
            }

            return this.importFromVault(app);
        } catch (error) {
            Logger.error('Failed to import settings:', error);
            new Notice('Failed to import settings');
            return null;
        }
    }

    /**
     * Fallback method to import settings from the vault.
     * from the file CTS_settings.json
     *
     * @returns The imported settings or null if the import failed.
     */
    private async importFromVault(app: App): Promise<CustomThemeStudioSettings | null> {
        try {
            const filename = 'CTS_settings.json';
            const file = app.vault.getAbstractFileByPath(filename);

            if (!file || !(file instanceof TFile)) {
                new Notice(`Could not find ${filename} in vault`);
                return null;
            }

            const fileContent = await app.vault.read(file);
            const importedSettings = JSON.parse(fileContent);

            if (!this.validateSettings(importedSettings)) {
                new Notice('Invalid settings file format');
                return null;
            }

            new Notice('Settings imported from vault successfully');
            return importedSettings;
        } catch (error) {
            Logger.error('Failed to import from vault:', error);
            new Notice('Failed to import settings from vault');
            return null;
        }
    }

    /**
     * Validates the settings object to ensure it has the correct structure.
     *
     * @param settings - The settings object to validate.
     * @return True if the settings object is valid, false otherwise.
     */
    private validateSettings(settings: CustomThemeStudioSettings): settings is CustomThemeStudioSettings {
        if (!settings || typeof settings !== 'object') return false;

        // Required boolean fields
        if (typeof settings.themeEnabled !== 'boolean') return false;
        if (typeof settings.autoApplyChanges !== 'boolean') return false;
        if (typeof settings.exportThemeIncludeDisabled !== 'boolean') return false;
        if (typeof settings.exportPrettierFormat !== 'boolean') return false;
        if (typeof settings.showConfirmation !== 'boolean') return false;
        if (typeof settings.enableFontImport !== 'boolean') return false;
        if (typeof settings.enableColorPicker !== 'boolean') return false;
        if (typeof settings.enableAceAutoCompletion !== 'boolean') return false;
        if (typeof settings.enableAceSnippets !== 'boolean') return false;
        if (typeof settings.enableAceColorPicker !== 'boolean') return false;
        if (typeof settings.editorLineNumbers !== 'boolean') return false;
        if (typeof settings.editorWordWrap !== 'boolean') return false;
        if (typeof settings.viewScrollToTop !== 'boolean') return false;
        if (typeof settings.generateComputedCSS !== 'boolean') return false;
        if (typeof settings.selectorPreferClasses !== 'boolean') return false;
        if (typeof settings.selectorAlwaysIncludeTag !== 'boolean') return false;
        if (typeof settings.expandCSSVariables !== 'boolean') return false;
        if (typeof settings.expandCSSRules !== 'boolean') return false;
        if (typeof settings.expandExportTheme !== 'boolean') return false;
        if (typeof settings.expandEditorSettings !== 'boolean') return false;

        // Required string fields
        if (typeof settings.customCSS !== 'string') return false;
        if (typeof settings.exportThemeName !== 'string') return false;
        if (typeof settings.exportThemeAuthor !== 'string') return false;
        if (typeof settings.exportThemeURL !== 'string') return false;
        if (typeof settings.lastSelectedSelector !== 'string') return false;
        if (typeof settings.activeVariableTagFilter !== 'string') return false;
        if (typeof settings.variableInputListener !== 'string') return false;
        if (typeof settings.editorFontFamily !== 'string') return false;
        if (typeof settings.editorTheme !== 'string') return false;
        if (typeof settings.editorLightTheme !== 'string') return false;
        if (typeof settings.editorDarkTheme !== 'string') return false;
        if (typeof settings.editorKeyboard !== 'string') return false;
        if (typeof settings.debugLevel !== 'string') return false;
        if (typeof settings.selectorStyle !== 'string') return false;
        if (typeof settings.selectorExcludedAttributes !== 'string') return false;

        // Required number fields
        if (typeof settings.editorFontSize !== 'number') return false;
        if (typeof settings.cssEditorDebounceDelay !== 'number') return false;

        // editorTabWidth can be number or string
        if (typeof settings.editorTabWidth !== 'number' && typeof settings.editorTabWidth !== 'string') return false;

        // Required array fields
        if (!Array.isArray(settings.cssVariables)) return false;
        if (!Array.isArray(settings.cssRules)) return false;
        if (!Array.isArray(settings.expandedVariableCategories)) return false;

        // Validate array contents
        if (settings.cssVariables.length > 0) {
            const variable = settings.cssVariables[0];
            if (typeof variable.parent !== 'string' || typeof variable.variable !== 'string' || typeof variable.value !== 'string') {
                return false;
            }
        }

        if (settings.cssRules.length > 0) {
            const rule = settings.cssRules[0];
            if (typeof rule.uuid !== 'string' || typeof rule.rule !== 'string' || typeof rule.css !== 'string' || typeof rule.enabled !== 'boolean') {
                return false;
            }
        }

        return true;
    }
}

const settingsIO = SettingsIO.getInstance();
export default settingsIO;