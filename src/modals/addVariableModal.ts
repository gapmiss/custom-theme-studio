import { type App, Setting, setIcon, Modal } from "obsidian";
import type CustomThemeStudioPlugin from "../main";
import { CustomThemeStudioView, VIEW_TYPE_CTS } from "../views/customThemeStudioView";
import { generateUniqueId, showNotice } from "../utils";

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
                        showNotice('Please enter a name', 5000, 'error');
                        variableNameInput.settingEl.querySelector('input')?.focus();
                        return;
                    }
                    // https://www.thingsaboutweb.dev/en/posts/css-variables-part-1
                    // https://www.stefanjudis.com/snippets/how-to-detect-emojis-in-javascript-strings/
                    // https://www.npmjs.com/package/emoji-regex
                    // https://stackoverflow.com/questions/18862256/how-to-detect-emoji-using-javascript
                    // Validate custom property variable
                    if (!variable.match(/^--[a-zA-Z0-9-_\p{Emoji}]+/gui)) {
                        showNotice('Please enter a valid variable name', 5000, 'error');
                        variableNameInput.settingEl.querySelector('input')?.focus();
                        return;
                    }
                    if (!value) {
                        showNotice('Please enter a value', 5000, 'error');
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
                    if (this.plugin.settings.themeEnabled) {
                        this.plugin.themeManager.applyCustomTheme();
                    }
                    this.close();

                    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS).first();
                    if (leaf) {
                        if (leaf.view instanceof CustomThemeStudioView) {
                            showNotice('The variable has been added', 5000, 'success');
                            let view = leaf.view;
                            const customVarList: HTMLElement | null = view.containerEl.querySelector('[data-var-category="custom"]');
                            if (customVarList) {
                                customVarList.empty();
                                const items = this.plugin.settings.cssVariables
                                    .filter(v => v.parent === 'custom')
                                    .sort((a, b) => a.variable!.localeCompare(b.variable!)); // Sort by "variable" ASC
                                if (items.length) {
                                    items.forEach((item) => {
                                        view.createCustomVariableItemInput(customVarList, { uuid: item.uuid!, name: item.variable, value: item.value }, 'custom');
                                    });
                                }
                            }

                            const customVarListWrapper: HTMLElement | null = view.containerEl.querySelector('#variable-category-custom');
                            if (!customVarListWrapper) return;

                            // Toggle icon
                            const icon = customVarListWrapper.querySelector<HTMLElement>('.collapse-icon.clickable-icon');
                            if (icon) {
                                setIcon(icon, 'chevron-down');
                                icon.setAttr('aria-label', 'Collapse category');
                                icon.setAttr('data-tooltip-position', 'top');
                            }

                            // Variable list
                            const variableList = customVarListWrapper.querySelector<HTMLElement>('[data-var-category="custom"]');
                            variableList?.classList.replace('hide', 'show');

                            // Scroll to top if setting is enabled
                            if (this.plugin.settings.viewScrollToTop) {
                                setTimeout(() => view.scrollToDiv(customVarListWrapper), 100);
                            }
                        }
                    }
                });
            });

    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

}