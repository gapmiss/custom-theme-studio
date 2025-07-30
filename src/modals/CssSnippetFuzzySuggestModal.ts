import { type App, normalizePath, setIcon, FuzzySuggestModal } from "obsidian";
import type CustomThemeStudioPlugin from "../main";
import { generateUniqueId, showNotice } from "../utils";
import { CustomThemeStudioView, VIEW_TYPE_CTS } from "../views/customThemeStudioView";
import { ICodeEditorConfig } from '../interfaces/types';
import { confirm } from '../modals/confirmModal';

interface Snippets {
    basename: string,
    extension: string,
    name: string
}

// https://github.com/Zachatoo/obsidian-css-editor/blob/main/src/modals/CssSnippetFuzzySuggestModal.ts
export class CssSnippetFuzzySuggestModal extends FuzzySuggestModal<Snippets> {
    plugin: CustomThemeStudioPlugin;
    view: CustomThemeStudioView;

    constructor(app: App, plugin: CustomThemeStudioPlugin, private config: ICodeEditorConfig) {
        super(app);
        this.plugin = plugin;
        this.setPlaceholder("Search and choose a snippet to import");
        this.setInstructions([
            {
                command: "↑↓",
                purpose: "to navigate",
            },
            {
                command: "↵",
                purpose: "to choose a snippet",
            },
            {
                command: "esc",
                purpose: "to cancel",
            },
        ]);
    }

    getItems(): Snippets[] {
        if (this.app.customCss?.snippets) {
            return this.app.customCss.snippets.map((x) => new CssFile(x));
        }
        return [];
    }

    getItemText(item: Snippets): string {
        return item.basename;
    }

    async onChooseItem(item: Snippets, _evt: MouseEvent | KeyboardEvent) {
        let css = await this.readSnippetFile(this.app, item);
        let uuid = generateUniqueId();
        let rule = "Snippet: " + item.name;
        // Add new rule
        this.plugin.settings.cssRules.push({
            uuid,
            rule,
            css,
            enabled: false
        });
        this.plugin.saveSettings();

        let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS).first();
        if (leaf) {
            if (!await confirm('The snippet has been saved as a new CSS rule. Click "OK" to reload the "Custom Theme Studio" view or if you have unsaved changes, click "Cancel" to reload the view manually at a later time.', this.plugin.app)) {
                return;
            }
            await this.app.workspace.revealLeaf(leaf);
            if (leaf.view instanceof CustomThemeStudioView) {
                let view = leaf.view;
                const ruleList = view.containerEl.querySelector('.css-rule');
                if (ruleList) {
                    ruleList.empty();
                    // Sort by "rule" value ASC
                    this.plugin.settings.cssRules.sort((a, b) => a.rule!.localeCompare(b.rule!));
                    // Re-populate with all rules
                    this.plugin.settings.cssRules.forEach(rule => {
                        view.cssEditorManager.createRuleItem(ruleList as HTMLElement, rule);
                    });

                    const rulesSection = view.containerEl.querySelector('.rules-section');
                    const ruleSection = rulesSection!.querySelector('.collapsible-content');
                    const toggleIcon: HTMLElement | null = rulesSection!.querySelector('.collapse-icon');

                    if (ruleSection && toggleIcon) {
                        ruleSection.classList.replace('hide', 'show');

                        setIcon(toggleIcon, 'chevron-down');
                        toggleIcon.setAttr('aria-label', 'Collapse section');
                        toggleIcon.setAttr('data-tooltip-position', 'top');
                    }

                    // Scroll CSS rule to the top of view
                    if (this.plugin.settings.viewScrollToTop) {
                        setTimeout(() => {
                            const ruleDiv: HTMLElement | null = view.containerEl.querySelector(`[data-cts-uuid="${uuid}"]`);
                            view.scrollToDiv(ruleDiv!);
                        }, 100);
                    }
                }
            }
        } else {
            showNotice('The snippet has been saved as a new CSS rule', 5000, 'success');
        }
    }

    getSnippetDirectory(app: App) {
        return `${app.vault.configDir}/snippets/`;
    }

    async readSnippetFile(
        app: App,
        file: CssFile
    ): Promise<string> {
        const data = await app.vault.adapter.read(
            normalizePath(`${this.getSnippetDirectory(app)}${file.name}`)
        );
        return data;
    }

}

// https://github.com/Zachatoo/obsidian-css-editor/blob/main/src/CssFile.ts
class CssFile {
    /** Full name of file. */
    name: string;
    /** Name without extension. */
    basename: string;
    /** File extension. */
    extension = "css";

    constructor(name: string) {
        if (typeof name !== "string" || name.length === 0) {
            throw new Error("Invalid file name.");
        }
        const extensionWithDot = `.${this.extension}`;
        const basename = name.endsWith(extensionWithDot)
            ? name.slice(0, name.length - extensionWithDot.length)
            : name;

        this.name = `${basename}.${this.extension}`;
        this.basename = basename;
    }
}