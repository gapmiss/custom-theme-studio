import { ItemView, WorkspaceLeaf, Workspace, Scope } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { ElementSelectorManager } from '../managers/elementSelectorManager';
import { CSSEditorManager } from '../managers/cssEditorManager';
import { CSSVariableManager } from '../managers/cssVariabManager';
import { ICodeEditorConfig } from '../interfaces/types';
import { CustomThemeStudioSettings } from '../settings';
import { HeaderSection } from './components/HeaderSection';
import { CSSVariablesSection } from './components/CSSVariablesSection';
import { CSSRulesSection } from './components/CSSRulesSection';
import { ExportSection } from './components/ExportSection';
import { UIComponent, ComponentContext } from './components/UIComponent';

export const VIEW_TYPE_CTS = 'cts-view';

export class CustomThemeStudioView extends ItemView {
	plugin: CustomThemeStudioPlugin;
	settings: CustomThemeStudioSettings;
	cssVariableManager: CSSVariableManager;
	elementSelectorManager: ElementSelectorManager;
	cssEditorManager: CSSEditorManager;
	workspace: Workspace;
	editorScope: Scope;

	private components: UIComponent[] = [];
	private context: ComponentContext;

	constructor(settings: CustomThemeStudioSettings, leaf: WorkspaceLeaf, plugin: CustomThemeStudioPlugin, private config: ICodeEditorConfig) {
		super(leaf);
		this.plugin = plugin;
		this.cssVariableManager = new CSSVariableManager(this.plugin);
		this.elementSelectorManager = new ElementSelectorManager(this.plugin, this);
		this.cssEditorManager = new CSSEditorManager(this.app.workspace, this.plugin, this, this.config);
		this.workspace = this.app.workspace;
		this.settings = settings;
		this.editorScope = new Scope();

		this.context = {
			app: this.app,
			plugin: this.plugin,
			settings: this.settings,
			containerEl: this.containerEl,
			cssEditorManager: this.cssEditorManager,
			elementSelectorManager: this.elementSelectorManager,
			cssVariableManager: this.cssVariableManager
		};
	}

	getViewType(): string {
		return VIEW_TYPE_CTS;
	}

	getDisplayText(): string {
		return 'Custom Theme Studio';
	}

	getIcon(): string {
		return 'paintbrush';
	}

	async onOpen(): Promise<void> {
		this.prepareContainer();
		this.renderComponents();
		this.setupAccessibility();
		this.setupEditorFocusKeymap();
	}

	private prepareContainer(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass('cts-view');
	}

	private renderComponents(): void {
		this.components = [
			new HeaderSection(this.context),
			new CSSVariablesSection(this.context),
			new CSSRulesSection(this.context),
			new ExportSection(this.context)
		];

		this.components.forEach(component => {
			component.render();
		});
	}

	private setupAccessibility(): void {
		this.containerEl.addEventListener('keydown', (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target?.getAttribute('role') === 'button' &&
				target.tagName === 'A'
			) {
				const key = e.key;
				const isEnter = key === 'Enter' || e.keyCode === 13;
				const isSpace = key === ' ' || key === 'Spacebar' || e.keyCode === 32;
				if (isEnter || isSpace) {
					e.preventDefault();
					target.click();
				}
			}
		});
	}

	private setupEditorFocusKeymap(): void {
		const editorEl = this.cssEditorManager.editor as unknown as HTMLElement;

		this.registerDomEvent(editorEl, 'focus', () => {
			this.app.keymap.pushScope(this.editorScope);
		}, true);

		this.registerDomEvent(editorEl, 'blur', () => {
			this.app.keymap.popScope(this.editorScope);
		}, true);
	}

	async onClose(): Promise<void> {
		this.elementSelectorManager.stopElementSelection();
		this.cssEditorManager.clearAppliedChanges();
		this.destroyComponents();
	}

	private destroyComponents(): void {
		this.components.forEach(component => {
			component.destroy();
		});
		this.components = [];
	}

	scrollToDiv(target: HTMLElement): void {
		if (target) {
			const container = this.containerEl;
			if (container && target) {
				const top = (target as HTMLElement).offsetTop - 10;
				(container as HTMLElement).scrollTo({
					top: top,
					behavior: "smooth"
				});
			}
		}
	}

	createCustomVariableItemInput(container: HTMLElement, variable: { uuid: string, name: string; value: string; }, category: string): void {
		const cssVariablesComponent = this.components.find(component => component instanceof CSSVariablesSection) as CSSVariablesSection;
		if (cssVariablesComponent) {
			cssVariablesComponent.createCustomVariableItemInput(container, variable, category);
		}
	}

	refreshCustomVariables(): void {
		const cssVariablesComponent = this.components.find(component => component instanceof CSSVariablesSection) as CSSVariablesSection;
		if (cssVariablesComponent) {
			cssVariablesComponent.refreshCustomVariables();
		}
	}

	get variableSearch(): string {
		const cssVariablesComponent = this.components.find(component => component instanceof CSSVariablesSection) as CSSVariablesSection;
		return cssVariablesComponent?.variableSearch || '';
	}

	get ruleSearch(): string {
		const cssRulesComponent = this.components.find(component => component instanceof CSSRulesSection) as CSSRulesSection;
		return cssRulesComponent?.ruleSearch || '';
	}

	async filterCSSRules(query: string): Promise<void> {
		const cssRulesComponent = this.components.find(component => component instanceof CSSRulesSection) as CSSRulesSection;
		if (cssRulesComponent) {
			await cssRulesComponent.filterCSSRules(query);
		}
	}
}