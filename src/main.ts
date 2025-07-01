import { Plugin, WorkspaceLeaf } from 'obsidian';
import { CustomThemeStudioView, VIEW_TYPE_CTS } from './view';
import { ThemeManager } from './managers/themeManager';
import { DEFAULT_SETTINGS, CustomThemeStudioSettings, CustomThemeStudioSettingTab } from './settings';
import { ICodeEditorConfig } from './interfaces/types';
import { freezeTimer } from "./utils";

export default class CustomThemeStudioPlugin extends Plugin {
	settings: CustomThemeStudioSettings;
	themeManager: ThemeManager;
	config: ICodeEditorConfig;
	freezeDelaySecs = 4; // CONFIG

	async onload() {
		await this.loadSettings();

		// Initialize theme manager
		this.themeManager = new ThemeManager(this);

		// Register view
		this.registerView(
			VIEW_TYPE_CTS,
			(leaf: WorkspaceLeaf) => new CustomThemeStudioView(this.settings, leaf, this, this.config)
		);

		// Add ribbon icon
		this.addRibbonIcon('paintbrush', 'Custom Theme Studio', () => {
			this.activateView();
		});

		// Add command to toggle the view
		this.addCommand({
			id: 'open-theme-studio',
			name: 'Open Custom Theme Studio',
			callback: () => {
				this.activateView();
			}
		});

		// Add command to toggle theme changes
		this.addCommand({
			id: 'toggle-custom-theme',
			name: 'Toggle custom theme',
			callback: () => {
				this.themeManager.toggleCustomTheme();
			}
		});

		// Add command to select elements
		this.addCommand({
			id: 'select-element-for-styling',
			name: 'Select element for styling',
			callback: () => {
				this.themeManager.startElementSelection();
			}
		});

		// https://github.com/chrisgrieser/obsidian-theme-design-utilities/blob/main/src/main.ts#L19
		this.addCommand({
			id: "freeze-obsidian",
			name: "Freeze Obsidian (with " + this.freezeDelaySecs.toString() + "s delay)",
			callback: () => {
				freezeTimer(this.freezeDelaySecs);
			},
		});

		// Add settings tab
		this.addSettingTab(new CustomThemeStudioSettingTab(this.app, this));

		// Update custom CSS
		let fullCSS = '';
		this.settings.customElements.forEach(el => {
			if (el.enabled) {
				fullCSS += `/* ${el.name || el.selector} */\n${el.css}\n\n`;
			}
		});
		this.settings.customCSS = fullCSS;
		this.saveSettings();

		// Apply saved theme if enabled
		if (this.settings.themeEnabled && this.settings.customCSS) {
			this.themeManager.applyCustomTheme();
		}
	}

	async activateView() {
		const { workspace } = this.app;

		// Check if view is already open
		const existingLeaves = workspace.getLeavesOfType(VIEW_TYPE_CTS);
		if (existingLeaves.length > 0) {
			workspace.revealLeaf(existingLeaves[0]);
			return;
		}

		// Open view in right sidebar
		await workspace.getRightLeaf(false)?.setViewState({
			type: VIEW_TYPE_CTS,
			active: true,
		});

		workspace.revealLeaf(
			workspace.getLeavesOfType(VIEW_TYPE_CTS)[0]
		);
	}

	onunload() {
		// Remove any custom styles when plugin is disabled
		this.themeManager.removeCustomTheme();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/* Refresh view */
	async reloadView(): Promise<void> {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CTS);
		leaves.forEach((leaf) => {
			if (leaf.view instanceof CustomThemeStudioView) {
				// Refresh the view if it's open
				(leaf.view as CustomThemeStudioView).onOpen();
				return Promise.resolve;
			}
		});
	}

}
