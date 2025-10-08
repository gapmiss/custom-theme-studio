import { type App, Setting, Modal } from "obsidian";
import type CustomThemeStudioPlugin from "../main";
import { CustomThemeStudioView, VIEW_TYPE_CTS } from "../views/customThemeStudioView";
import { generateUniqueId, showNotice } from "../utils";
import { NOTICE_DURATIONS } from "../constants";

export class AddVariableModal extends Modal {
    plugin: CustomThemeStudioPlugin;
    view: CustomThemeStudioView;
    private variableName: string = '';
    private variableValue: string = '';

    constructor(app: App, plugin: CustomThemeStudioPlugin) {
        super(app);
        this.plugin = plugin;
    }

    async onOpen() {
        const { contentEl } = this;
        if (contentEl.parentElement) {
            contentEl.parentElement.addClass('cts-add-variable-modal');
        }
        contentEl.createEl(
            'h3',
            {
                text: 'Add CSS variable'
            }
        );
        // Variable name input
        const variableNameInput = new Setting(contentEl)
            .setName('Name')
            .setDesc('A variable is prefixed with two dashes --, followed by the variable name.')
            .addText(text => text
                .setValue('')
                .setPlaceholder('Enter name (e.g. --my-variable)')
                .onChange(async (value) => {
                    this.variableName = value;
                })
            );

        // Variable value input
        const variableValueInput = new Setting(contentEl)
            .setName('Value')
            .setDesc('A variable value can be any valid CSS value.')
            .addText(text => text
                .setValue('')
                .setPlaceholder('Enter value (e.g. purple)')
                .onChange(async (value) => {
                    this.variableValue = value;
                })
            );

        // Save varialbe
        new Setting(contentEl)
            .addButton((button) => {
                button.setButtonText('Add variable');
                button.onClick(async () => {

                    let variable = this.variableName;
                    let value = this.variableValue;
                    let parent = 'custom';

                    if (!variable) {
                        showNotice('Please enter a name', NOTICE_DURATIONS.STANDARD, 'error');
                        variableNameInput.settingEl.querySelector('input')?.focus();
                        return;
                    }
                    // https://www.thingsaboutweb.dev/en/posts/css-variables-part-1
                    // https://www.stefanjudis.com/snippets/how-to-detect-emojis-in-javascript-strings/
                    // https://www.npmjs.com/package/emoji-regex
                    // https://stackoverflow.com/questions/18862256/how-to-detect-emoji-using-javascript
                    // Validate custom property variable
                    if (!variable.match(/^--[a-zA-Z0-9-_\p{Emoji}]+/gui)) {
                        showNotice('Please enter a valid variable name', NOTICE_DURATIONS.STANDARD, 'error');
                        variableNameInput.settingEl.querySelector('input')?.focus();
                        return;
                    }
                    if (!value) {
                        showNotice('Please enter a value', NOTICE_DURATIONS.STANDARD, 'error');
                        variableValueInput.settingEl.querySelector('input')?.focus();
                        return;
                    }

                    let uuid: string = generateUniqueId();
                    // Add new variable
                    this.plugin.settings.cssVariables.push({
                        uuid,
                        parent,
                        variable,
                        value
                    });
                    this.plugin.saveSettings();
                    this.plugin.themeManager.applyIfEnabled();
                    this.close();

                    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS).first();
                    if (leaf && leaf.view instanceof CustomThemeStudioView) {
                        showNotice('The variable has been added', NOTICE_DURATIONS.STANDARD, 'success');
                        // Use the clean refresh method to re-render custom variables
                        leaf.view.refreshCustomVariables();
                    }
                });
            });

    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

}