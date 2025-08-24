import CustomThemeStudioPlugin from '../main';
import { CSSVariable } from 'src/settings';
import { generateUniqueId } from '../utils';
import obsidianCSSVariables from './obsidianCSSVariables.json';

export interface cssCategory {
	category: string;
	title: string;
	tag: string;
	help: DocumentFragment | null;
}

export interface CssVariable {
	cat: string;
	variable: string;
	default: string;
}

// Utility to build a help fragment
function createHelpFragment(text: string, parent = '', category = ''): DocumentFragment {
	const helpFragment = document.createDocumentFragment();

	if (text !== '') {
		helpFragment.append(text);
		return helpFragment;
	}

	if (parent && category) {
		helpFragment.createEl(
			'a', 
			{
				cls: 'external-link',
				href: `https://docs.obsidian.md/Reference/CSS+variables/${parent}/${category}`,
				text: `${category} - Developer Documentation`,
				attr: {
					'aria-label': `https://docs.obsidian.md/Reference/${parent}/${category}`,
					'data-tooltip-position': 'top',
					tabindex: '0',
				},
			}
		);
	}

	return helpFragment;
}

const variableCategories: Record<string, { text?: string; parent?: string; category?: string }> = {
	animation: { parent: 'Foundations', category: 'Animation', text: 'Animation variables' },
	bases: { parent: 'Editor', category: 'Bases' },
	blockquote: { parent: 'Editor', category: 'Blockquote' },
	borders: { parent: 'Foundations', category: 'Borders' },
	button: { parent: 'Components', category: 'Button' },
	callout: { parent: 'Editor', category: 'Callout' },
	canvas: { parent: 'Plugins', category: 'Canvas' },
	checkbox: { parent: 'Components', category: 'Checkbox' },
	code: { parent: 'Editor', category: 'Code' },
	colorinput: { parent: 'Components', category: 'Color+input' },
	colors: { parent: 'Foundations', category: 'Colors' },
	cts: { parent: 'CTS', category: 'Custom Theme Studio plugin', text: 'Variables for the element picker and highlighted element' },
	cursor: { parent: 'Foundations', category: 'Cursor' },
	custom: { parent: 'CTS', category: 'Custom variables', text: 'Custom variables' },
	dialog: { parent: 'Components', category: 'Dialog' },
	divider: { parent: 'Window', category: 'Dividers', text: 'Dividers between panes' },
	dragging: { parent: 'Components', category: 'Dragging' },
	dropdowns: { parent: 'Components', category: 'Dropdowns' },
	embed: { parent: 'Editor', category: 'Embed' },
	file: { parent: 'Editor', category: 'File' },
	fileexplorer: { parent: 'Plugins', category: 'File+explorer' },
	footnote: { parent: 'Editor', category: 'Footnote' },
	graph: { parent: 'Plugins', category: 'Graph' },
	headings: { parent: 'Editor', category: 'Headings' },
	horizontalrule: { parent: 'Editor', category: 'Horizontal+rule' },
	icons: { parent: 'Foundations', category: 'Icons' },
	indentation: { parent: 'Components', category: 'Indentation+guides' },
	inlinetitle: { parent: 'Editor', category: 'Inline+title' },
	layers: { parent: 'Foundations', category: 'Layers' },
	link: { parent: 'Editor', category: 'Link' },
	list: { parent: 'Editor', category: 'List' },
	modal: { parent: 'Components', category: 'Modal' },
	multiselect: { parent: 'Components', category: 'Multi-select' },
	navigation: { parent: 'Components', category: 'Navigation' },
	popover: { parent: 'Components', category: 'Popover' },
	prompt: { parent: 'Components', category: 'Prompt' },
	properties: { parent: 'Editor', category: 'Properties' },
	radiuses: { parent: 'Foundations', category: 'Radiuses' },
	ribbon: { parent: 'Window', category: 'Ribbon' },
	scrollbar: { parent: 'Window', category: 'Scrollbar' },
	search: { parent: 'Plugins', category: 'Search' },
	sidebar: { parent: 'Window', category: 'Sidebar' },
	slider: { parent: 'Components', category: 'Slider' },
	spacing: { parent: 'Foundations', category: 'Spacing' },
	statusbar: { parent: 'Window', category: 'Status+bar' },
	sync: { parent: 'Plugins', category: 'Sync' },
	table: { parent: 'Editor', category: 'Table' },
	tabs: { parent: 'Components', category: 'Tabs' },
	tag: { parent: 'Editor', category: 'Tag' },
	textinput: { parent: 'Components', category: 'Text+input' },
	toggle: { parent: 'Components', category: 'Toggle' },
	themelight: { parent: 'Theme-light', category: 'Theme - light', text: 'Variables specifically for light theme' },
	themedark: { parent: 'Theme-dark', category: 'Theme - dark', text: 'Variables specifically for dark theme' },
	typography: { parent: 'Foundations', category: 'Typography' },
	vaultprofile: { parent: 'Window', category: 'Vault+profile' },
	windowframe: { parent: 'Window', category: 'Window+frame' },
	workspace: { parent: 'Window', category: 'Workspace' },
};

const dynamicCategories: cssCategory[] = Object.entries(variableCategories).map(
	([key, { text = '', parent = '', category = '' }]): cssCategory => ({
		category: key,
		title: category,
		tag: parent.toLowerCase(),
		help: createHelpFragment(text, parent, category),
	})
);

// Sort all categories by title
export const allCategories: cssCategory[] = dynamicCategories.sort((a, b) =>
	a.title.localeCompare(b.title)
);

export interface cssVariable {
	cat: string;
	variable: string;
	default: string;
}

export const cssVariableDefaults: CssVariable[] = Object.entries(obsidianCSSVariables).flatMap(
	([cat, group]) =>
		Object.entries(group).map(([variable, defaultVal]) => ({
			cat,
			variable,
			default: defaultVal,
		}))
);

export class CSSVariableManager {
	plugin: CustomThemeStudioPlugin;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Update a CSS variable value
	 */
	updateVariable(uuid: string | undefined, name: string, value: string, parent: string): void {

		let customVars: CSSVariable[] = this.plugin.settings.cssVariables;

		// Store in settings
		if (!customVars) {
			this.plugin.settings.cssVariables = [];
		}

		// Helper to update an existing variable's name and value
		const updateVar = (target: CSSVariable, name: string, value: string) => {
			target.variable = name;
			target.value = value;
		};

		// Helper to remove a variable by UUID
		const removeVarByUUID = (uuid: string) => {
			const index = customVars.findIndex(el => el.uuid === uuid);
			if (index !== -1) customVars.splice(index, 1);
		};

		if (uuid) {
			// Case 1: We have a UUID — look for the existing variable by UUID
			const existing = customVars.find(el => el.uuid === uuid);
			if (!existing) return; // If not found, do nothing

			if (value !== '') {
				// Update the variable's name and value
				updateVar(existing, name, value);
			} else {
				// If the new value is empty, remove the variable
				removeVarByUUID(uuid);
			}

		} else {
			// Case 2: No UUID — check if a variable already exists with the same name + parent
			const existing = customVars.find(el => el.variable === name && el.parent === parent);

			if (existing) {
				if (value !== '') {
					// Update existing variable
					updateVar(existing, name, value);
				} else {
					// Remove it if the new value is empty
					removeVarByUUID(existing.uuid!);
				}

			} else if (value !== '') {
				// Case 3: New variable (name + parent combination does not exist)
				const obj: CSSVariable = {
					uuid: generateUniqueId(),
					parent,
					variable: name,
					value
				};
				customVars.push(obj); // Add the new variable to the list
			}
		}
		this.plugin.saveSettings();
	}

	snippetManagerVars(): string {
		// https://stackoverflow.com/questions/26089258/ace-editor-manually-adding-snippets/66923593#66923593
		// https://ace.c9.io/build/kitchen-sink.html
		let snippetContent: string = '';
		cssVariableDefaults.forEach((variable) => {
			snippetContent += 'snippet ' + variable.variable + '\n';
			snippetContent += '\t' + variable.variable + '\n';
		});
		return snippetContent;
	}

}

