import "obsidian";

declare module "obsidian" {
    interface App {
        customCss:
        | {
            snippets: string[] | undefined;
        }
        | undefined;
    }
}