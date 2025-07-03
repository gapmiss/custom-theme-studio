import { type App, normalizePath, FuzzySuggestModal } from "obsidian";
import type CustomThemeStudioPlugin from "../main";
import { generateUniqueId } from "../utils";
import { CustomThemeStudioView, VIEW_TYPE_CTS } from "../view";
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
        let name = item.name;
        let css = await this.readSnippetFile(this.app, item);
        let uuid = generateUniqueId();
        let selector = name;
        // Add new element
        this.plugin.settings.customElements.push({
            uuid,
            selector,
            css,
            name: "Snippet: " + name || undefined,
            enabled: false
        });
        this.plugin.saveSettings();

        if (!await confirm('The snippet has been saved as a new custom element. Click "OK" to reload the "Custom Theme Studio" view or if you have unsaved changes, click "Cancel" to reload the view manually at a later time.', this.plugin.app)) {
            return;
        }

        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS);
        leaves.forEach((leaf) => {
            if (leaf.view instanceof CustomThemeStudioView) {
                this.view = (leaf.view as CustomThemeStudioView)
            }
        });
        if (this.view) {
            this.plugin.reloadView();
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