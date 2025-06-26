import { type App } from 'obsidian';
import CustomThemeStudioPlugin from '../main';
import { CSSVariable } from 'src/settings';

export interface cssCategory {
    category: string;
	title: string;
	tag: string;
	help: DocumentFragment|null;
}

let bordersHelpFragment = document.createDocumentFragment();
bordersHelpFragment.append(
	bordersHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Borders',
	text: 'Borders - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Borders', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);


let blockquoteHelpFragment = document.createDocumentFragment();
blockquoteHelpFragment.append(
	blockquoteHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Blockquote',
	text: 'Blockquote - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Blockquote', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let buttonHelpFragment = document.createDocumentFragment();
buttonHelpFragment.append(
	buttonHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Button',
	text: 'Button - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Button', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let calloutHelpFragment = document.createDocumentFragment();
calloutHelpFragment.append(
	calloutHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Callout',
	text: 'Callout - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Callout', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let canvasHelpFragment = document.createDocumentFragment();
canvasHelpFragment.append(
	canvasHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Canvas',
	text: 'Canvas - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Canvas', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let checkboxHelpFragment = document.createDocumentFragment();
checkboxHelpFragment.append(
	checkboxHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Checkbox',
	text: 'Checkbox - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Checkbox', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let codeHelpFragment = document.createDocumentFragment();
codeHelpFragment.append(
	codeHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Code',
	text: 'Code - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Code', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let colorInputHelpFragment = document.createDocumentFragment();
colorInputHelpFragment.append(
	colorInputHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Color+input',
	text: 'Color input - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Color+input', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let colorsHelpFragment = document.createDocumentFragment();
colorsHelpFragment.append(
	colorsHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors',
	text: 'Colors - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Colors', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let cursorHelpFragment = document.createDocumentFragment();
cursorHelpFragment.append(
	cursorHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Cursor',
	text: 'Cursor - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Cursor', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let dialogHelpFragment = document.createDocumentFragment();
dialogHelpFragment.append(
	dialogHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Dialog',
	text: 'Dialog - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Dialog', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let dividerHelpFragment = document.createDocumentFragment();
dividerHelpFragment.append(
	'Dividers between panes'
);

let draggingHelpFragment = document.createDocumentFragment();
draggingHelpFragment.append(
	draggingHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Dragging',
	text: 'Dragging - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Dragging', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let dropdownsHelpFragment = document.createDocumentFragment();
dropdownsHelpFragment.append(
	dropdownsHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Dropdowns',
	text: 'Dropdowns - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Dropdowns', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let embedHelpFragment = document.createDocumentFragment();
embedHelpFragment.append(
	embedHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Embed',
	text: 'Embed - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Embed', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let fileHelpFragment = document.createDocumentFragment();
fileHelpFragment.append(
	fileHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/File',
	text: 'File - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/File', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let fileExplorerHelpFragment = document.createDocumentFragment();
fileExplorerHelpFragment.append(
	fileExplorerHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/File+explorer',
	text: 'File explorer - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/File+explorer', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let footnoteHelpFragment = document.createDocumentFragment();
footnoteHelpFragment.append(
	footnoteHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Footnote',
	text: 'Footnote - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Footnote', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let graphHelpFragment = document.createDocumentFragment();
graphHelpFragment.append(
	graphHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Graph',
	text: 'Graph - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Graph', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let headingsHelpFragment = document.createDocumentFragment();
headingsHelpFragment.append(
	headingsHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Headings',
	text: 'Headings - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Headings', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let horizontalRuleHelpFragment = document.createDocumentFragment();
horizontalRuleHelpFragment.append(
	horizontalRuleHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Horizontal+rule',
	text: 'Horizontal rule - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Horizontal+rule', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let iconsHelpFragment = document.createDocumentFragment();
iconsHelpFragment.append(
	iconsHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Icons',
	text: 'Icons - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Icons', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let indentationHelpFragment = document.createDocumentFragment();
indentationHelpFragment.append(
	indentationHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Indentation+guides',
	text: 'Indentation guides - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Indentation+guides', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let inlineTitleHelpFragment = document.createDocumentFragment();
inlineTitleHelpFragment.append(
	inlineTitleHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Inline+title',
	text: 'Inline title - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Inline+title', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let layersHelpFragment = document.createDocumentFragment();
layersHelpFragment.append(
	layersHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Layers',
	text: 'Layers - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Layers', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let linkHelpFragment = document.createDocumentFragment();
linkHelpFragment.append(
	linkHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Link',
	text: 'Link - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Link', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let listHelpFragment = document.createDocumentFragment();
listHelpFragment.append(
	listHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/List',
	text: 'List - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/List', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let modalHelpFragment = document.createDocumentFragment();
modalHelpFragment.append(
	modalHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Modal',
	text: 'Modal - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Modal', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let multiSelectHelpFragment = document.createDocumentFragment();
multiSelectHelpFragment.append(
	multiSelectHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Multi-select',
	text: 'Multi-select - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Multi-select', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let navigationHelpFragment = document.createDocumentFragment();
navigationHelpFragment.append(
	navigationHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation',
	text: 'Navigation - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Navigation', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let popoverHelpFragment = document.createDocumentFragment();
popoverHelpFragment.append(
	popoverHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Popover',
	text: 'Popover - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Popover', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let promptHelpFragment = document.createDocumentFragment();
promptHelpFragment.append(
	promptHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Prompt',
	text: 'Prompt - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Prompt', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let propertiesHelpFragment = document.createDocumentFragment();
propertiesHelpFragment.append(
	propertiesHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Properties',
	text: 'Properties - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Properties', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let radiusesHelpFragment = document.createDocumentFragment();
radiusesHelpFragment.append(
	radiusesHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Radiuses',
	text: 'Radiuses - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Radiuses', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let ribbonHelpFragment = document.createDocumentFragment();
ribbonHelpFragment.append(
	ribbonHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Ribbon',
	text: 'Ribbon - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Ribbon', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let scrollbarHelpFragment = document.createDocumentFragment();
scrollbarHelpFragment.append(
	scrollbarHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Scrollbar',
	text: 'Scrollbar - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Scrollbar', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let searchHelpFragment = document.createDocumentFragment();
searchHelpFragment.append(
	searchHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Search',
	text: 'Search - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Search', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let sidebarHelpFragment = document.createDocumentFragment();
sidebarHelpFragment.append(
	sidebarHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Sidebar',
	text: 'Sidebar - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Sidebar', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let sliderHelpFragment = document.createDocumentFragment();
sliderHelpFragment.append(
	sliderHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Slider',
	text: 'Slider - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Slider', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let spacingHelpFragment = document.createDocumentFragment();
spacingHelpFragment.append(
	spacingHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Spacing',
	text: 'Spacing - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Spacing', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let statusBarHelpFragment = document.createDocumentFragment();
statusBarHelpFragment.append(
	statusBarHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Status+bar',
	text: 'Status bar - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Status+bar', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let syncHelpFragment = document.createDocumentFragment();
syncHelpFragment.append(
	syncHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Sync',
	text: 'Sync - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Plugins/Sync', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let tableHelpFragment = document.createDocumentFragment();
tableHelpFragment.append(
	tableHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Table',
	text: 'Table - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Table', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let tabsHelpFragment = document.createDocumentFragment();
tabsHelpFragment.append(
	tabsHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Tabs',
	text: 'Tabs - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Tabs', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let tagHelpFragment = document.createDocumentFragment();
tagHelpFragment.append(
	tagHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Tag',
	text: 'Tag - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Editor/Tag', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let textInputHelpFragment = document.createDocumentFragment();
textInputHelpFragment.append(
	textInputHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Text+input',
	text: 'Text input - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Text+input', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let toggleHelpFragment = document.createDocumentFragment();
toggleHelpFragment.append(
	toggleHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Components/Toggle',
	text: 'Toggle - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Components/Toggle', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let typographyHelpFragment = document.createDocumentFragment();
typographyHelpFragment.append(
	typographyHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography',
	text: 'Typography - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Foundations/Typography', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let vaultProfileHelpFragment = document.createDocumentFragment();
vaultProfileHelpFragment.append(
	vaultProfileHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Vault+profile',
	text: 'Vault profile - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Vault+profile', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let windowFrameHelpFragment = document.createDocumentFragment();
windowFrameHelpFragment.append(
	windowFrameHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Window+frame',
	text: 'Window frame - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Window+frame', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

let workspaceHelpFragment = document.createDocumentFragment();
workspaceHelpFragment.append(
	workspaceHelpFragment.createEl('a', {
	href: 'https://docs.obsidian.md/Reference/CSS+variables/Window/Workspace',
	text: 'Workspace - Developer Documentation',
	attr: { 'aria-label': 'https://docs.obsidian.md/Reference/CSS+variables/Window/Workspace', 'class': 'external-link', 'data-tooltip-position': 'top', 'tabindex': '0' }
	})
);

export const allCategories: cssCategory[] = [
{ category: 'animation', title: 'Animation', tag: 'foundations', help: null},
{ category: 'blockquote', title: 'Blockquote', tag: 'editor', help: blockquoteHelpFragment },
{ category: 'borders', title: 'Borders', tag: 'foundations', help: bordersHelpFragment },
{ category: 'button', title: 'Button', tag: 'components', help: buttonHelpFragment },
{ category: 'callout', title: 'Callout', tag: 'editor', help: calloutHelpFragment },
{ category: 'canvas', title: 'Canvas', tag: 'plugins', help: canvasHelpFragment },
{ category: 'checkbox', title: 'Checkbox', tag: 'components', help: checkboxHelpFragment },
{ category: 'code', title: 'Code', tag: 'editor', help: codeHelpFragment },
{ category: 'colorinput', title: 'Color input', tag: 'components', help: colorInputHelpFragment },
{ category: 'colors', title: 'Colors', tag: 'foundations', help: colorsHelpFragment },
{ category: 'cursor', title: 'Cursor', tag: 'foundations', help: cursorHelpFragment },
{ category: 'dialog', title: 'Dialog', tag: 'components', help: dialogHelpFragment },
{ category: 'divider', title: 'Divider', tag: 'window', help: dividerHelpFragment },
{ category: 'dragging', title: 'Dragging', tag: 'components', help: draggingHelpFragment },
{ category: 'dropdowns', title: 'Dropdowns', tag: 'components', help: dropdownsHelpFragment },
{ category: 'embed', title: 'Embed', tag: 'editor', help: embedHelpFragment },
{ category: 'file', title: 'File', tag: 'editor', help: fileHelpFragment },
{ category: 'fileexplorer', title: 'File explorer', tag: 'plugins', help: fileExplorerHelpFragment },
{ category: 'footnote', title: 'Footnote', tag: 'editor', help: footnoteHelpFragment },
{ category: 'graph', title: 'Graph', tag: 'plugins', help: graphHelpFragment },
{ category: 'heading', title: 'Heading', tag: 'editor', help: headingsHelpFragment },
{ category: 'horizontalrule', title: 'Horizontal rule', tag: 'editor', help: horizontalRuleHelpFragment },
{ category: 'icons', title: 'Icons', tag: 'foundations', help: iconsHelpFragment },
{ category: 'indentation', title: 'Indentation', tag: 'components', help: indentationHelpFragment },
{ category: 'inlinetitle', title: 'Inline title', tag: 'editor', help: inlineTitleHelpFragment },
{ category: 'layers', title: 'Layers', tag: 'foundations', help: layersHelpFragment },
{ category: 'link', title: 'Link', tag: 'editor', help: linkHelpFragment },
{ category: 'list', title: 'List', tag: 'editor', help: listHelpFragment },
{ category: 'modal', title: 'Modal', tag: 'components', help: modalHelpFragment },
{ category: 'multiselect', title: 'Multi-select', tag: 'components', help: multiSelectHelpFragment },
{ category: 'navigation', title: 'Navigation', tag: 'components', help: navigationHelpFragment },
{ category: 'popover', title: 'Popover', tag: 'components', help: popoverHelpFragment },
{ category: 'prompt', title: 'Prompt', tag: 'components', help: promptHelpFragment },
{ category: 'properties', title: 'Properties', tag: 'editor', help: propertiesHelpFragment },
{ category: 'radiuses', title: 'Radiuses', tag: 'foudnations', help: radiusesHelpFragment },
{ category: 'ribbon', title: 'Ribbon', tag: 'window', help: ribbonHelpFragment },
{ category: 'scrollbar', title: 'Scrollbar', tag: 'window', help: scrollbarHelpFragment },
{ category: 'search', title: 'Search', tag: 'plugins', help: searchHelpFragment },
{ category: 'sidebar', title: 'Sidebar', tag: 'window', help: sidebarHelpFragment },
{ category: 'slider', title: 'Slider', tag: 'components', help: sliderHelpFragment },
{ category: 'spacing', title: 'Spacing', tag: 'foundations', help: spacingHelpFragment },
{ category: 'statusbar', title: 'Status bar', tag: 'window', help: statusBarHelpFragment },
{ category: 'sync', title: 'Sync', tag: 'plugins', help: syncHelpFragment },
{ category: 'table', title: 'Table', tag: 'editor', help: tableHelpFragment },
{ category: 'tabs', title: 'Tabs', tag: 'components', help: tabsHelpFragment },
{ category: 'tag', title: 'Tag', tag: 'editor', help: tagHelpFragment },
{ category: 'textinput', title: 'Text input', tag: 'components', help: textInputHelpFragment },
{ category: 'toggle', title: 'Toggle', tag: 'components', help: toggleHelpFragment },
{ category: 'themelight', title: 'Theme - light', tag: 'theme-light', help: null },
{ category: 'themedark', title: 'Theme - dark', tag: 'theme-dark', help: null },
{ category: 'typography', title: 'Typography', tag: 'foundations', help: typographyHelpFragment },
{ category: 'vaultprofile', title: 'Vault profile', tag: 'window', help: vaultProfileHelpFragment },
{ category: 'windowframe', title: 'Window frame', tag: 'window', help: windowFrameHelpFragment },
{ category: 'workspace', title: 'Workspace', tag: 'window', help: workspaceHelpFragment  }
]

export interface cssVariable {
    cat: string;
	variable: string;
	default: string;
}

export const cssVariableDefaults: cssVariable[] = [
	{ cat: 'animation', variable: '--anim-duration-none', default: '0' },
	{ cat: 'animation', variable: '--anim-duration-superfast', default: '70ms' },
	{ cat: 'animation', variable: '--anim-duration-fast', default: '140ms' },
	{ cat: 'animation', variable: '--anim-duration-moderate', default: '300ms' },
	{ cat: 'animation', variable: '--anim-duration-slow', default: '560ms' },
	{ cat: 'animation', variable: '--anim-motion-smooth', default: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)' },
	{ cat: 'animation', variable: '--anim-motion-delay', default: 'cubic-bezier(0.65, 0.05, 0.36, 1)' },
	{ cat: 'animation', variable: '--anim-motion-jumpy', default: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
	{ cat: 'animation', variable: '--anim-motion-swing', default: 'cubic-bezier(0, 0.55, 0.45, 1)' },
	{ cat: 'blockquote', variable: '--blockquote-border-thickness', default: '2px' },
	{ cat: 'blockquote', variable: '--blockquote-border-color', default: 'var(--interactive-accent)' },
	{ cat: 'blockquote', variable: '--blockquote-font-style', default: 'normal' },
	{ cat: 'blockquote', variable: '--blockquote-color', default: 'inherit' },
	{ cat: 'blockquote', variable: '--blockquote-background-color', default: 'transparent' },
	{ cat: 'borders', variable: '--border-width', default: '1px' },
	{ cat: 'button', variable: '--button-radius', default: 'var(--input-radius)' },
	{ cat: 'callout', variable: '--callout-border-width', default: '0px' },
	{ cat: 'callout', variable: '--callout-border-opacity', default: '0.25' },
	{ cat: 'callout', variable: '--callout-padding', default: 'var(--size-4-3) var(--size-4-3) var(--size-4-3) var(--size-4-6)' },
	{ cat: 'callout', variable: '--callout-radius', default: 'var(--radius-s)' },
	{ cat: 'callout', variable: '--callout-blend-mode', default: 'var(--highlight-mix-blend-mode)' },
	{ cat: 'callout', variable: '--callout-title-color', default: 'inherit' },
	{ cat: 'callout', variable: '--callout-title-padding', default: '0' },
	{ cat: 'callout', variable: '--callout-title-size', default: 'inherit' },
	{ cat: 'callout', variable: '--callout-title-weight', default: 'calc(var(--font-weight) + var(--bold-modifier))' },
	{ cat: 'callout', variable: '--callout-content-padding', default: '0' },
	{ cat: 'callout', variable: '--callout-content-background', default: 'transparent' },
	{ cat: 'callout', variable: '--callout-bug', default: 'var(--color-red-rgb)' },
	{ cat: 'callout', variable: '--callout-default', default: 'var(--color-blue-rgb)' },
	{ cat: 'callout', variable: '--callout-error', default: 'var(--color-red-rgb)' },
	{ cat: 'callout', variable: '--callout-example', default: 'var(--color-purple-rgb)' },
	{ cat: 'callout', variable: '--callout-fail', default: 'var(--color-red-rgb)' },
	{ cat: 'callout', variable: '--callout-important', default: 'var(--color-cyan-rgb)' },
	{ cat: 'callout', variable: '--callout-info', default: 'var(--color-blue-rgb)' },
	{ cat: 'callout', variable: '--callout-question', default: 'var(--color-orange-rgb)' },
	{ cat: 'callout', variable: '--callout-success', default: 'var(--color-green-rgb)' },
	{ cat: 'callout', variable: '--callout-summary', default: 'var(--color-cyan-rgb)' },
	{ cat: 'callout', variable: '--callout-tip', default: 'var(--color-cyan-rgb)' },
	{ cat: 'callout', variable: '--callout-todo', default: 'var(--color-blue-rgb)' },
	{ cat: 'callout', variable: '--callout-warning', default: 'var(--color-orange-rgb)' },
	{ cat: 'callout', variable: '--callout-quote', default: '158, 158, 158' },
	{ cat: 'canvas', variable: '--canvas-background', default: 'var(--background-primary)' },
	{ cat: 'canvas', variable: '--canvas-card-label-color', default: 'var(--text-faint)' },
	{ cat: 'canvas', variable: '--canvas-color-1', default: 'var(--color-red-rgb)' },
	{ cat: 'canvas', variable: '--canvas-color-2', default: 'var(--color-orange-rgb)' },
	{ cat: 'canvas', variable: '--canvas-color-3', default: 'var(--color-yellow-rgb)' },
	{ cat: 'canvas', variable: '--canvas-color-4', default: 'var(--color-green-rgb)' },
	{ cat: 'canvas', variable: '--canvas-color-5', default: 'var(--color-cyan-rgb)' },
	{ cat: 'canvas', variable: '--canvas-color-6', default: 'var(--color-purple-rgb)' },
	{ cat: 'canvas', variable: '--canvas-dot-pattern', default: 'var(--color-base-30)' },
	{ cat: 'checkbox', variable: '--checkbox-radius', default: 'var(--radius-s)' },
	{ cat: 'checkbox', variable: '--checkbox-size', default: 'var(--font-text-size)' },
	{ cat: 'checkbox', variable: '--checkbox-marker-color', default: 'var(--background-primary)' },
	{ cat: 'checkbox', variable: '--checkbox-color', default: 'var(--interactive-accent)' },
	{ cat: 'checkbox', variable: '--checkbox-color-hover', default: 'var(--interactive-accent-hover)' },
	{ cat: 'checkbox', variable: '--checkbox-border-color', default: 'var(--text-faint)' },
	{ cat: 'checkbox', variable: '--checkbox-border-color-hover', default: 'var(--text-muted)' },
	{ cat: 'checkbox', variable: '--checkbox-margin-inline-start', default: '0.85em' },
	{ cat: 'checkbox', variable: '--checklist-done-decoration', default: 'line-through' },
	{ cat: 'checkbox', variable: '--checklist-done-color', default: 'var(--text-muted)' },
	{ cat: 'code', variable: '--code-white-space', default: 'pre-wrap' },
	{ cat: 'code', variable: '--code-border-width', default: '0px' },
	{ cat: 'code', variable: '--code-border-color', default: 'var(--background-modifier-border)' },
	{ cat: 'code', variable: '--code-radius', default: 'var(--radius-s)' },
	{ cat: 'code', variable: '--code-size', default: 'var(--font-smaller)' },
	{ cat: 'code', variable: '--code-background', default: 'var(--background-primary-alt)' },
	{ cat: 'code', variable: '--code-normal', default: 'var(--text-normal)' },
	{ cat: 'code', variable: '--code-comment', default: 'var(--text-faint)' },
	{ cat: 'code', variable: '--code-function', default: 'var(--color-yellow)' },
	{ cat: 'code', variable: '--code-important', default: 'var(--color-orange)' },
	{ cat: 'code', variable: '--code-keyword', default: 'var(--color-pink)' },
	{ cat: 'code', variable: '--code-operator', default: 'var(--color-red)' },
	{ cat: 'code', variable: '--code-property', default: 'var(--color-cyan)' },
	{ cat: 'code', variable: '--code-punctuation', default: 'var(--text-muted)' },
	{ cat: 'code', variable: '--code-string', default: 'var(--color-green)' },
	{ cat: 'code', variable: '--code-tag', default: 'var(--color-red)' },
	{ cat: 'code', variable: '--code-value', default: 'var(--color-purple)' },
	{ cat: 'colorinput', variable: '--swatch-radius', default: '14px' },
	{ cat: 'colorinput', variable: '--swatch-height', default: '24px' },
	{ cat: 'colorinput', variable: '--swatch-width', default: '24px' },
	{ cat: 'colorinput', variable: '--swatch-shadow', default: 'inset 0 0 0 1px rgba(var(--mono-rgb-100), 0.15)' },
	{ cat: 'colors', variable: '--accent-h', default: '258' },
	{ cat: 'colors', variable: '--accent-s', default: '88%' },
	{ cat: 'colors', variable: '--accent-l', default: '66%' },
	{ cat: 'colors', variable: '--background-primary', default: 'var(--color-base-00)' },
	{ cat: 'colors', variable: '--background-primary-alt', default: 'var(--color-base-10)' },
	{ cat: 'colors', variable: '--background-secondary', default: 'var(--color-base-20)' },
	{ cat: 'colors', variable: '--background-modifier-hover', default: 'rgba(var(--mono-rgb-100), 0.067)' },
	{ cat: 'colors', variable: '--background-modifier-active-hover', default: 'hsla(var(--interactive-accent-hsl), 0.15)' },
	{ cat: 'colors', variable: '--background-modifier-border', default: 'var(--color-base-30)' },
	{ cat: 'colors', variable: '--background-modifier-border-hover', default: 'var(--color-base-35)' },
	{ cat: 'colors', variable: '--background-modifier-border-focus', default: 'var(--color-base-40)' },
	{ cat: 'colors', variable: '--background-modifier-error-rgb', default: 'var(--color-red-rgb)' },
	{ cat: 'colors', variable: '--background-modifier-error', default: 'var(--color-red)' },
	{ cat: 'colors', variable: '--background-modifier-error-hover', default: 'var(--color-red)' },
	{ cat: 'colors', variable: '--background-modifier-success-rgb', default: 'var(--color-green-rgb)' },
	{ cat: 'colors', variable: '--background-modifier-success', default: 'var(--color-green)' },
	{ cat: 'colors', variable: '--background-modifier-message', default: 'rgba(0, 0, 0, 0.9)' },
	{ cat: 'colors', variable: '--background-modifier-form-field', default: 'var(--color-base-00)' },
	{ cat: 'colors', variable: '--interactive-normal', default: 'var(--color-base-00)' },
	{ cat: 'colors', variable: '--interactive-hover', default: 'var(--color-base-10)' },
	{ cat: 'colors', variable: '--interactive-accent-hsl', default: 'var(--color-accent-hsl)' },
	{ cat: 'colors', variable: '--interactive-accent', default: 'var(--color-accent-1)' },
	{ cat: 'colors', variable: '--interactive-accent-hover', default: 'var(--color-accent-2)' },
	{ cat: 'colors', variable: '--text-normal', default: 'var(--color-base-100)' },
	{ cat: 'colors', variable: '--text-muted', default: 'var(--color-base-70)' },
	{ cat: 'colors', variable: '--text-faint', default: 'var(--color-base-50)' },
	{ cat: 'colors', variable: '--text-on-accent', default: 'white' },
	{ cat: 'colors', variable: '--text-on-accent-inverted', default: 'black' },
	{ cat: 'colors', variable: '--text-error', default: 'var(--color-red)' },
	{ cat: 'colors', variable: '--text-warning', default: 'var(--color-orange)' },
	{ cat: 'colors', variable: '--text-success', default: 'var(--color-green)' },
	{ cat: 'colors', variable: '--text-selection', default: 'hsla(var(--color-accent-hsl), 0.2)' },
	{ cat: 'colors', variable: '--text-highlight-bg-rgb', default: '255, 208, 0' },
	{ cat: 'colors', variable: '--text-highlight-bg', default: 'rgba(var(--text-highlight-bg-rgb), 0.4)' },
	{ cat: 'colors', variable: '--text-accent', default: 'var(--color-accent)' },
	{ cat: 'colors', variable: '--text-accent-hover', default: 'var(--color-accent-2)' },
	{ cat: 'colors', variable: '--caret-color', default: 'var(--text-normal)' },
	{ cat: 'cursor', variable: '--cursor', default: 'default' },
	{ cat: 'cursor', variable: '--cursor-link', default: 'pointer' },
	{ cat: 'dialog', variable: '--dialog-width', default: '560px' },
	{ cat: 'dialog', variable: '--dialog-max-width', default: '80vw' },
	{ cat: 'dialog', variable: '--dialog-max-height', default: '85vh' },
	{ cat: 'divider', variable: '--divider-color', default: 'var(--background-modifier-border)' },
	{ cat: 'divider', variable: '--divider-color-hover', default: 'var(--interactive-accent)' },
	{ cat: 'divider', variable: '--divider-width', default: '1px' },
	{ cat: 'divider', variable: '--divider-width-hover', default: '3px' },
	{ cat: 'divider', variable: '--divider-vertical-height', default: 'calc(100% - var(--header-height))' },
	{ cat: 'dragging', variable: '--drag-ghost-background', default: 'rgba(0, 0, 0, 0.85)' },
	{ cat: 'dragging', variable: '--drag-ghost-text-color', default: '#fff' },
	{ cat: 'dropdowns', variable: '--dropdown-background', default: 'var(--interactive-normal)' },
	{ cat: 'dropdowns', variable: '--dropdown-background-blend-mode', default: 'hard-light' },
	{ cat: 'dropdowns', variable: '--dropdown-background-hover', default: 'var(--interactive-hover)' },
	{ cat: 'dropdowns', variable: '--dropdown-background-position', default: 'right 0.5em top 50%, 0 0' },
	{ cat: 'dropdowns', variable: '--dropdown-background-size', default: '1em auto, 100%' },
	{ cat: 'dropdowns', variable: '--dropdown-padding', default: '0 1.9em 0 0.8em' },
	{ cat: 'embed', variable: '--embed-max-height', default: '4000px' },
	{ cat: 'embed', variable: '--embed-canvas-max-height', default: '400px' },
	{ cat: 'embed', variable: '--embed-background', default: 'inherit' },
	{ cat: 'embed', variable: '--embed-border-start', default: '2px solid var(--interactive-accent)' },
	{ cat: 'embed', variable: '--embed-border-end', default: 'none' },
	{ cat: 'embed', variable: '--embed-border-top', default: 'none' },
	{ cat: 'embed', variable: '--embed-border-bottom', default: 'none' },
	{ cat: 'embed', variable: '--embed-padding', default: '0 0 0 var(--size-4-6)' },
	{ cat: 'embed', variable: '--embed-font-style', default: 'inherit' },
	{ cat: 'file', variable: '--file-line-width', default: '700px' },
	{ cat: 'file', variable: '--file-folding-offset', default: '24px' },
	{ cat: 'file', variable: '--file-margins', default: 'var(--size-4-8)' },
	{ cat: 'file', variable: '--file-header-font', default: 'var(--font-interface)' },
	{ cat: 'file', variable: '--file-header-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'file', variable: '--file-header-font-weight', default: '400' },
	{ cat: 'file', variable: '--file-header-border', default: 'var(--border-width) solid transparent' },
	{ cat: 'file', variable: '--file-header-justify', default: 'center' },
	{ cat: 'fileexplorer', variable: '--vault-profile-display', default: 'flex' },
	{ cat: 'fileexplorer', variable: '--vault-profile-actions-display', default: 'flex' },
	{ cat: 'fileexplorer', variable: '--vault-profile-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'fileexplorer', variable: '--vault-profile-font-weight', default: 'var(--font-medium)' },
	{ cat: 'fileexplorer', variable: '--vault-profile-color', default: 'var(--text-normal)' },
	{ cat: 'fileexplorer', variable: '--vault-profile-color-hover', default: 'var(--vault-profile-color)' },
	{ cat: 'footnote', variable: '--footnote-divider-color-active', default: 'var(--metadata-divider-color-focus)' },
	{ cat: 'footnote', variable: '--footnote-divider-color', default: 'var(--metadata-divider-color)' },
	{ cat: 'footnote', variable: '--footnote-divider-width', default: '1px' },
	{ cat: 'footnote', variable: '--footnote-gap', default: 'var(--size-4-1)' },
	{ cat: 'footnote', variable: '--footnote-id-color-no-occurrences', default: 'var(--text-faint)' },
	{ cat: 'footnote', variable: '--footnote-id-color', default: 'var(--text-muted)' },
	{ cat: 'footnote', variable: '--footnote-id-delimiter', default: '.' },
	{ cat: 'footnote', variable: '--footnote-input-background-active', default: 'var(--metadata-input-background-active)' },
	{ cat: 'footnote', variable: '--footnote-input-background', default: 'var(--metadata-input-background)' },
	{ cat: 'footnote', variable: '--footnote-line-height', default: 'var(--line-height-normal)' },
	{ cat: 'footnote', variable: '--footnote-padding-block', default: 'var(--size-2-3)' },
	{ cat: 'footnote', variable: '--footnote-padding-inline', default: 'var(--size-2-3)' },
	{ cat: 'footnote', variable: '--footnote-radius', default: 'var(--radius-s)' },
	{ cat: 'footnote', variable: '--footnote-size', default: 'var(--font-smaller)' },
	{ cat: 'graph', variable: '--graph-controls-width', default: '240px' },
	{ cat: 'graph', variable: '--graph-text', default: 'var(--text-normal)' },
	{ cat: 'graph', variable: '--graph-line', default: 'var(--color-base-35, var(--background-modifier-border-focus))' },
	{ cat: 'graph', variable: '--graph-node', default: 'var(--text-muted)' },
	{ cat: 'graph', variable: '--graph-node-unresolved', default: 'var(--text-faint)' },
	{ cat: 'graph', variable: '--graph-node-focused', default: 'var(--text-accent)' },
	{ cat: 'graph', variable: '--graph-node-tag', default: 'var(--color-green)' },
	{ cat: 'graph', variable: '--graph-node-attachment', default: 'var(--color-yellow)' },
	{ cat: 'heading', variable: '--heading-formatting', default: 'var(--text-faint)' },
	{ cat: 'heading', variable: '--heading-spacing', default: 'calc(var(--p-spacing) * 2.5)' },
	{ cat: 'heading', variable: '--h1-color', default: 'inherit' },
	{ cat: 'heading', variable: '--h2-color', default: 'inherit' },
	{ cat: 'heading', variable: '--h3-color', default: 'inherit' },
	{ cat: 'heading', variable: '--h4-color', default: 'inherit' },
	{ cat: 'heading', variable: '--h5-color', default: 'inherit' },
	{ cat: 'heading', variable: '--h6-color', default: 'inherit' },
	{ cat: 'heading', variable: '--h1-font', default: 'inherit' },
	{ cat: 'heading', variable: '--h2-font', default: 'inherit' },
	{ cat: 'heading', variable: '--h3-font', default: 'inherit' },
	{ cat: 'heading', variable: '--h4-font', default: 'inherit' },
	{ cat: 'heading', variable: '--h5-font', default: 'inherit' },
	{ cat: 'heading', variable: '--h6-font', default: 'inherit' },
	{ cat: 'heading', variable: '--h1-line-height', default: '1.2' },
	{ cat: 'heading', variable: '--h2-line-height', default: '1.2' },
	{ cat: 'heading', variable: '--h3-line-height', default: '1.3' },
	{ cat: 'heading', variable: '--h4-line-height', default: '1.4' },
	{ cat: 'heading', variable: '--h5-line-height', default: 'var(--line-height-normal)' },
	{ cat: 'heading', variable: '--h6-line-height', default: 'var(--line-height-normal)' },
	{ cat: 'heading', variable: '--h1-size', default: '1.802em' },
	{ cat: 'heading', variable: '--h2-size', default: '1.602em' },
	{ cat: 'heading', variable: '--h3-size', default: '1.424em' },
	{ cat: 'heading', variable: '--h4-size', default: '1.266em' },
	{ cat: 'heading', variable: '--h5-size', default: '1.125em' },
	{ cat: 'heading', variable: '--h6-size', default: '1em' },
	{ cat: 'heading', variable: '--h1-style', default: 'normal' },
	{ cat: 'heading', variable: '--h2-style', default: 'normal' },
	{ cat: 'heading', variable: '--h3-style', default: 'normal' },
	{ cat: 'heading', variable: '--h4-style', default: 'normal' },
	{ cat: 'heading', variable: '--h5-style', default: 'normal' },
	{ cat: 'heading', variable: '--h6-style', default: 'normal' },
	{ cat: 'heading', variable: '--h1-variant', default: 'normal' },
	{ cat: 'heading', variable: '--h2-variant', default: 'normal' },
	{ cat: 'heading', variable: '--h3-variant', default: 'normal' },
	{ cat: 'heading', variable: '--h4-variant', default: 'normal' },
	{ cat: 'heading', variable: '--h5-variant', default: 'normal' },
	{ cat: 'heading', variable: '--h6-variant', default: 'normal' },
	{ cat: 'heading', variable: '--h1-weight', default: '700' },
	{ cat: 'heading', variable: '--h2-weight', default: '600' },
	{ cat: 'heading', variable: '--h3-weight', default: '600' },
	{ cat: 'heading', variable: '--h4-weight', default: '600' },
	{ cat: 'heading', variable: '--h5-weight', default: '600' },
	{ cat: 'heading', variable: '--h6-weight', default: '600' },
	{ cat: 'horizontalrule', variable: '--hr-color', default: 'var(--background-modifier-border)' },
	{ cat: 'horizontalrule', variable: '--hr-thickness', default: '2px' },
	{ cat: 'icons', variable: '--icon-size', default: 'var(--icon-m)' },
	{ cat: 'icons', variable: '--icon-stroke', default: 'var(--icon-m-stroke-width)' },
	{ cat: 'icons', variable: '--icon-xs', default: '14px' },
	{ cat: 'icons', variable: '--icon-s', default: '16px' },
	{ cat: 'icons', variable: '--icon-m', default: '18px' },
	{ cat: 'icons', variable: '--icon-l', default: '18px' },
	{ cat: 'icons', variable: '--icon-xl', default: '32px' },
	{ cat: 'icons', variable: '--icon-xs-stroke-width', default: '2px' },
	{ cat: 'icons', variable: '--icon-s-stroke-width', default: '2px' },
	{ cat: 'icons', variable: '--icon-m-stroke-width', default: '1.75px' },
	{ cat: 'icons', variable: '--icon-l-stroke-width', default: '1.75px' },
	{ cat: 'icons', variable: '--icon-xl-stroke-width', default: '1.25px' },
	{ cat: 'icons', variable: '--icon-color', default: 'var(--text-muted)' },
	{ cat: 'icons', variable: '--icon-color-hover', default: 'var(--text-muted)' },
	{ cat: 'icons', variable: '--icon-color-active', default: 'var(--text-accent)' },
	{ cat: 'icons', variable: '--icon-color-focused', default: 'var(--text-normal)' },
	{ cat: 'icons', variable: '--icon-opacity', default: '0.85' },
	{ cat: 'icons', variable: '--icon-opacity-hover', default: '1' },
	{ cat: 'icons', variable: '--icon-opacity-active', default: '1' },
	{ cat: 'icons', variable: '--clickable-icon-radius', default: 'var(--radius-s)' },
	{ cat: 'indentation', variable: '--indent-size', default: '4' },
	{ cat: 'indentation', variable: '--indent-unit', default: '0.5625em' },
	{ cat: 'indentation', variable: '--indentation-guide-width', default: '1px' },
	{ cat: 'indentation', variable: '--indentation-guide-width-active', default: '1px' },
	{ cat: 'indentation', variable: '--indentation-guide-color', default: 'rgba(var(--mono-rgb-100), 0.12)' },
	{ cat: 'indentation', variable: '--indentation-guide-color-active', default: 'rgba(var(--mono-rgb-100), 0.3)' },
	{ cat: 'indentation', variable: '--indentation-guide-editing-indent', default: '0.85em' },
	{ cat: 'indentation', variable: '--indentation-guide-reading-indent', default: '-0.85em' },
	{ cat: 'indentation', variable: '--indentation-guide-source-indent', default: '0.25em' },
	{ cat: 'inlinetitle', variable: '--inline-title-color', default: 'var(--h1-color)' },
	{ cat: 'inlinetitle', variable: '--inline-title-font', default: 'var(--h1-font)' },
	{ cat: 'inlinetitle', variable: '--inline-title-line-height', default: 'var(--h1-line-height)' },
	{ cat: 'inlinetitle', variable: '--inline-title-size', default: 'var(--h1-size)' },
	{ cat: 'inlinetitle', variable: '--inline-title-style', default: 'var(--h1-style)' },
	{ cat: 'inlinetitle', variable: '--inline-title-variant', default: 'var(--h1-variant)' },
	{ cat: 'inlinetitle', variable: '--inline-title-weight', default: 'var(--h1-weight)' },
	{ cat: 'inlinetitle', variable: '--inline-title-margin-bottom', default: '0.5em' },
	{ cat: 'layers', variable: '--layer-cover', default: '5' },
	{ cat: 'layers', variable: '--layer-sidedock', default: '10' },
	{ cat: 'layers', variable: '--layer-status-bar', default: '15' },
	{ cat: 'layers', variable: '--layer-popover', default: '30' },
	{ cat: 'layers', variable: '--layer-slides', default: '45' },
	{ cat: 'layers', variable: '--layer-modal', default: '50' },
	{ cat: 'layers', variable: '--layer-notice', default: '60' },
	{ cat: 'layers', variable: '--layer-menu', default: '65' },
	{ cat: 'layers', variable: '--layer-tooltip', default: '70' },
	{ cat: 'layers', variable: '--layer-dragged-item', default: '80' },
	{ cat: 'link', variable: '--link-color', default: 'var(--text-accent)' },
	{ cat: 'link', variable: '--link-color-hover', default: 'var(--text-accent-hover)' },
	{ cat: 'link', variable: '--link-decoration', default: 'underline' },
	{ cat: 'link', variable: '--link-decoration-hover', default: 'underline' },
	{ cat: 'link', variable: '--link-decoration-thickness', default: 'auto' },
	{ cat: 'link', variable: '--link-weight', default: 'var(--font-weight)' },
	{ cat: 'link', variable: '--link-external-color', default: 'var(--text-accent)' },
	{ cat: 'link', variable: '--link-external-color-hover', default: 'var(--text-accent-hover)' },
	{ cat: 'link', variable: '--link-external-decoration', default: 'underline' },
	{ cat: 'link', variable: '--link-external-decoration-hover', default: 'underline' },
	{ cat: 'link', variable: '--link-external-filter', default: 'none' },
	{ cat: 'link', variable: '--link-unresolved-color', default: 'var(--text-accent)' },
	{ cat: 'link', variable: '--link-unresolved-opacity', default: '0.7' },
	{ cat: 'link', variable: '--link-unresolved-filter', default: 'none' },
	{ cat: 'link', variable: '--link-unresolved-decoration-style', default: 'solid' },
	{ cat: 'link', variable: '--link-unresolved-decoration-color', default: 'hsla(var(--interactive-accent-hsl), 0.3)' },
	{ cat: 'list', variable: '--list-indent', default: 'calc(var(--indent-unit) * var(--indent-size))' },
	{ cat: 'list', variable: '--list-indent-editing', default: '0.75em' },
	{ cat: 'list', variable: '--list-indent-source', default: '0' },
	{ cat: 'list', variable: '--list-spacing', default: '0.075em' },
	{ cat: 'list', variable: '--list-marker-color', default: 'var(--text-faint)' },
	{ cat: 'list', variable: '--list-marker-color-hover', default: 'var(--text-muted)' },
	{ cat: 'list', variable: '--list-marker-color-collapsed', default: 'var(--text-accent)' },
	{ cat: 'list', variable: '--list-bullet-border', default: 'none' },
	{ cat: 'list', variable: '--list-bullet-radius', default: '50%' },
	{ cat: 'list', variable: '--list-bullet-size', default: '0.3em' },
	{ cat: 'list', variable: '--list-bullet-transform', default: 'none' },
	{ cat: 'list', variable: '--list-numbered-style', default: 'decimal' },
	{ cat: 'list', variable: '--list-bullet-end-padding', default: '1.3rem' },
	{ cat: 'modal', variable: '--modal-background', default: 'var(--background-primary)' },
	{ cat: 'modal', variable: '--modal-width', default: '90vw' },
	{ cat: 'modal', variable: '--modal-height', default: '85vh' },
	{ cat: 'modal', variable: '--modal-max-width', default: '1100px' },
	{ cat: 'modal', variable: '--modal-max-height', default: '1000px' },
	{ cat: 'modal', variable: '--modal-max-width-narrow', default: '800px' },
	{ cat: 'modal', variable: '--modal-border-width', default: 'var(--border-width)' },
	{ cat: 'modal', variable: '--modal-border-color', default: 'var(--color-base-40, var(--background-modifier-border-focus))' },
	{ cat: 'modal', variable: '--modal-radius', default: 'var(--radius-l)' },
	{ cat: 'modal', variable: '--modal-community-sidebar-width', default: '280px' },
	{ cat: 'multiselect', variable: '--pill-color', default: 'var(--text-muted)' },
	{ cat: 'multiselect', variable: '--pill-color-hover', default: 'var(--text-normal)' },
	{ cat: 'multiselect', variable: '--pill-color-remove', default: 'var(--text-faint)' },
	{ cat: 'multiselect', variable: '--pill-color-remove-hover', default: 'var(--text-accent)' },
	{ cat: 'multiselect', variable: '--pill-decoration', default: 'none' },
	{ cat: 'multiselect', variable: '--pill-decoration-hover', default: 'none' },
	{ cat: 'multiselect', variable: '--pill-background', default: 'transparent' },
	{ cat: 'multiselect', variable: '--pill-background-hover', default: 'transparent' },
	{ cat: 'multiselect', variable: '--pill-border-color', default: 'var(--background-modifier-border)' },
	{ cat: 'multiselect', variable: '--pill-border-color-hover', default: 'var(--background-modifier-border-hover)' },
	{ cat: 'multiselect', variable: '--pill-border-width', default: 'var(--border-width)' },
	{ cat: 'multiselect', variable: '--pill-padding-x', default: '0.65em' },
	{ cat: 'multiselect', variable: '--pill-padding-y', default: '0.25em' },
	{ cat: 'multiselect', variable: '--pill-radius', default: '2em' },
	{ cat: 'multiselect', variable: '--pill-weight', default: 'inherit' },
	{ cat: 'navigation', variable: '--nav-item-size', default: 'var(--font-ui-small)' },
	{ cat: 'navigation', variable: '--nav-item-color', default: 'var(--text-muted)' },
	{ cat: 'navigation', variable: '--nav-item-color-hover', default: 'var(--text-normal)' },
	{ cat: 'navigation', variable: '--nav-item-color-active', default: 'var(--text-normal)' },
	{ cat: 'navigation', variable: '--nav-item-color-selected', default: 'var(--text-normal)' },
	{ cat: 'navigation', variable: '--nav-item-color-highlighted', default: 'var(--text-accent)' },
	{ cat: 'navigation', variable: '--nav-item-background-hover', default: 'var(--background-modifier-hover)' },
	{ cat: 'navigation', variable: '--nav-item-background-active', default: 'var(--background-modifier-hover)' },
	{ cat: 'navigation', variable: '--nav-item-background-selected', default: 'hsla(var(--color-accent-hsl), 0.15)' },
	{ cat: 'navigation', variable: '--nav-item-padding', default: 'var(--size-4-1) var(--size-4-2) var(--size-4-1) var(--size-4-6)' },
	{ cat: 'navigation', variable: '--nav-item-parent-padding', default: 'var(--nav-item-padding)' },
	{ cat: 'navigation', variable: '--nav-item-children-padding-start', default: 'var(--size-2-2)' },
	{ cat: 'navigation', variable: '--nav-item-children-margin-start', default: 'var(--size-4-3)' },
	{ cat: 'navigation', variable: '--nav-item-weight', default: 'inherit' },
	{ cat: 'navigation', variable: '--nav-item-weight-hover', default: 'inherit' },
	{ cat: 'navigation', variable: '--nav-item-weight-active', default: 'inherit' },
	{ cat: 'navigation', variable: '--nav-item-white-space', default: 'pre' },
	{ cat: 'navigation', variable: '--nav-indentation-guide-width', default: 'var(--indentation-guide-width)' },
	{ cat: 'navigation', variable: '--nav-indentation-guide-color', default: 'var(--indentation-guide-color)' },
	{ cat: 'navigation', variable: '--nav-collapse-icon-color', default: 'var(--collapse-icon-color)' },
	{ cat: 'navigation', variable: '--nav-collapse-icon-color-collapsed', default: 'var(--text-faint)' },
	{ cat: 'navigation', variable: '--nav-heading-color', default: 'var(--text-normal)' },
	{ cat: 'navigation', variable: '--nav-heading-color-hover', default: 'var(--text-normal)' },
	{ cat: 'navigation', variable: '--nav-heading-color-collapsed', default: 'var(--text-faint)' },
	{ cat: 'navigation', variable: '--nav-heading-color-collapsed-hover', default: 'var(--text-muted)' },
	{ cat: 'navigation', variable: '--nav-heading-weight', default: 'var(--font-medium)' },
	{ cat: 'navigation', variable: '--nav-heading-weight-hover', default: 'var(--font-medium)' },
	{ cat: 'popover', variable: '--popover-width', default: '450px' },
	{ cat: 'popover', variable: '--popover-height', default: '400px' },
	{ cat: 'popover', variable: '--popover-max-height', default: '95vh' },
	{ cat: 'popover', variable: '--popover-pdf-width', default: '450px' },
	{ cat: 'popover', variable: '--popover-pdf-height', default: '400px' },
	{ cat: 'popover', variable: '--popover-font-size', default: 'var(--font-text-size)' },
	{ cat: 'prompt', variable: '--prompt-input-height', default: '40px' },
	{ cat: 'prompt', variable: '--prompt-width', default: '700px' },
	{ cat: 'prompt', variable: '--prompt-max-width', default: '80vw' },
	{ cat: 'prompt', variable: '--prompt-max-height', default: '70vh' },
	{ cat: 'prompt', variable: '--prompt-border-width', default: 'var(--border-width)' },
	{ cat: 'prompt', variable: '--prompt-border-color', default: 'var(--color-base-40, var(--background-modifier-border-focus))' },
	{ cat: 'properties', variable: '--metadata-background', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-display-reading', default: 'block' },
	{ cat: 'properties', variable: '--metadata-display-editing', default: 'block' },
	{ cat: 'properties', variable: '--metadata-max-width', default: 'none' },
	{ cat: 'properties', variable: '--metadata-padding', default: 'var(--size-4-2) 0' },
	{ cat: 'properties', variable: '--metadata-border-color', default: 'var(--background-modifier-border)' },
	{ cat: 'properties', variable: '--metadata-border-radius', default: '0' },
	{ cat: 'properties', variable: '--metadata-border-width', default: '0' },
	{ cat: 'properties', variable: '--metadata-divider-color', default: 'var(--background-modifier-border)' },
	{ cat: 'properties', variable: '--metadata-divider-color-hover', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-divider-color-focus', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-divider-width', default: '0' },
	{ cat: 'properties', variable: '--metadata-gap', default: '3px' },
	{ cat: 'properties', variable: '--metadata-property-padding', default: '0' },
	{ cat: 'properties', variable: '--metadata-property-radius', default: '6px' },
	{ cat: 'properties', variable: '--metadata-property-radius-hover', default: '6px' },
	{ cat: 'properties', variable: '--metadata-property-radius-focus', default: '6px' },
	{ cat: 'properties', variable: '--metadata-property-background', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-property-background-hover', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-property-background-active', default: 'var(--background-modifier-hover)' },
	{ cat: 'properties', variable: '--metadata-property-box-shadow-hover', default: '0 0 0 1px var(--background-modifier-border-hover)' },
	{ cat: 'properties', variable: '--metadata-property-box-shadow-focus', default: '0 0 0 2px var(--background-modifier-border-focus)' },
	{ cat: 'properties', variable: '--metadata-label-background', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-label-background-hover', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-label-background-active', default: 'var(--background-modifier-hover)' },
	{ cat: 'properties', variable: '--metadata-label-font', default: 'var(--font-interface)' },
	{ cat: 'properties', variable: '--metadata-label-font-size', default: 'var(--font-smaller)' },
	{ cat: 'properties', variable: '--metadata-label-font-weight', default: 'inherit' },
	{ cat: 'properties', variable: '--metadata-label-text-color', default: 'var(--text-muted)' },
	{ cat: 'properties', variable: '--metadata-label-text-color-hover', default: 'var(--text-muted)' },
	{ cat: 'properties', variable: '--metadata-label-width', default: '9em' },
	{ cat: 'properties', variable: '--metadata-input-height', default: 'calc(var(--font-text-size) * 1.75)' },
	{ cat: 'properties', variable: '--metadata-input-text-color', default: 'var(--text-normal)' },
	{ cat: 'properties', variable: '--metadata-input-font', default: 'var(--font-interface)' },
	{ cat: 'properties', variable: '--metadata-input-font-size', default: 'var(--font-smaller)' },
	{ cat: 'properties', variable: '--metadata-input-background', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-input-background-hover', default: 'transparent' },
	{ cat: 'properties', variable: '--metadata-input-background-active', default: 'var(--background-modifier-hover)' },
	{ cat: 'properties', variable: '--metadata-input-longtext-lines', default: '3' },
	{ cat: 'properties', variable: '--metadata-sidebar-label-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'properties', variable: '--metadata-sidebar-input-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'radiuses', variable: '--radius-s', default: '4px' },
	{ cat: 'radiuses', variable: '--radius-m', default: '8px' },
	{ cat: 'radiuses', variable: '--radius-l', default: '12px' },
	{ cat: 'radiuses', variable: '--radius-xl', default: '16px' },
	{ cat: 'ribbon', variable: '--ribbon-background', default: 'var(--background-secondary)' },
	{ cat: 'ribbon', variable: '--ribbon-background-collapsed', default: 'var(--background-primary)' },
	{ cat: 'ribbon', variable: '--ribbon-width', default: '44px' },
	{ cat: 'ribbon', variable: '--ribbon-padding', default: 'var(--size-4-2) var(--size-4-1) var(--size-4-3)' },
	{ cat: 'scrollbar', variable: '--scrollbar-active-thumb-bg', default: 'rgba(var(--mono-rgb-100), 0.2)' },
	{ cat: 'scrollbar', variable: '--scrollbar-bg', default: 'rgba(var(--mono-rgb-100), 0.05)' },
	{ cat: 'scrollbar', variable: '--scrollbar-thumb-bg', default: 'rgba(var(--mono-rgb-100), 0.1)' },
	{ cat: 'search', variable: '--search-clear-button-color', default: 'var(--text-muted)' },
	{ cat: 'search', variable: '--search-clear-button-size', default: '13px' },
	{ cat: 'search', variable: '--search-icon-color', default: 'var(--text-muted)' },
	{ cat: 'search', variable: '--search-icon-size', default: '18px' },
	{ cat: 'search', variable: '--search-result-background', default: 'var(--background-primary)' },
	{ cat: 'sidebar', variable: '--sidebar-markdown-font-size', default: 'calc(var(--font-text-size) * 0.9)' },
	{ cat: 'sidebar', variable: '--sidebar-tab-text-display', default: 'none' },
	{ cat: 'slider', variable: '--slider-thumb-border-width', default: '1px' },
	{ cat: 'slider', variable: '--slider-thumb-border-color', default: 'var(--background-modifier-border-hover)' },
	{ cat: 'slider', variable: '--slider-thumb-height', default: '18px' },
	{ cat: 'slider', variable: '--slider-thumb-width', default: '18px' },
	{ cat: 'slider', variable: '--slider-thumb-y', default: '-6px' },
	{ cat: 'slider', variable: '--slider-thumb-radius', default: '50%' },
	{ cat: 'slider', variable: '--slider-s-thumb-size', default: '15px' },
	{ cat: 'slider', variable: '--slider-s-thumb-position', default: '-5px' },
	{ cat: 'slider', variable: '--slider-track-background', default: 'var(--background-modifier-border)' },
	{ cat: 'slider', variable: '--slider-track-height', default: '3px' },
	{ cat: 'spacing', variable: '--size-2-1', default: '2px' },
	{ cat: 'spacing', variable: '--size-2-2', default: '4px' },
	{ cat: 'spacing', variable: '--size-2-3', default: '6px' },
	{ cat: 'spacing', variable: '--size-4-1', default: '4px' },
	{ cat: 'spacing', variable: '--size-4-2', default: '8px' },
	{ cat: 'spacing', variable: '--size-4-3', default: '12px' },
	{ cat: 'spacing', variable: '--size-4-4', default: '16px' },
	{ cat: 'spacing', variable: '--size-4-5', default: '20px' },
	{ cat: 'spacing', variable: '--size-4-6', default: '24px' },
	{ cat: 'spacing', variable: '--size-4-8', default: '32px' },
	{ cat: 'spacing', variable: '--size-4-9', default: '36px' },
	{ cat: 'spacing', variable: '--size-4-10', default: '40px' },
	{ cat: 'spacing', variable: '--size-4-12', default: '48px' },
	{ cat: 'spacing', variable: '--size-4-16', default: '64px' },
	{ cat: 'spacing', variable: '--size-4-18', default: '72px' },
	{ cat: 'statusbar', variable: '--status-bar-background', default: 'var(--background-secondary)' },
	{ cat: 'statusbar', variable: '--status-bar-border-color', default: 'var(--divider-color)' },
	{ cat: 'statusbar', variable: '--status-bar-border-width', default: '1px 0 0 1px' },
	{ cat: 'statusbar', variable: '--status-bar-font-size', default: 'var(--font-ui-smaller)' },
	{ cat: 'statusbar', variable: '--status-bar-text-color', default: 'var(--text-muted)' },
	{ cat: 'statusbar', variable: '--status-bar-position', default: 'fixed' },
	{ cat: 'statusbar', variable: '--status-bar-radius', default: 'var(--radius-m) 0 0 0' },
	{ cat: 'sync', variable: '--sync-avatar-color-current-user', default: 'transparent' },
	{ cat: 'sync', variable: '--sync-avatar-color-1', default: 'var(--color-red)' },
	{ cat: 'sync', variable: '--sync-avatar-color-2', default: 'var(--color-orange)' },
	{ cat: 'sync', variable: '--sync-avatar-color-3', default: 'var(--color-yellow)' },
	{ cat: 'sync', variable: '--sync-avatar-color-4', default: 'var(--color-green)' },
	{ cat: 'sync', variable: '--sync-avatar-color-5', default: 'var(--color-cyan)' },
	{ cat: 'sync', variable: '--sync-avatar-color-6', default: 'var(--color-blue)' },
	{ cat: 'sync', variable: '--sync-avatar-color-7', default: 'var(--color-purple)' },
	{ cat: 'sync', variable: '--sync-avatar-color-8', default: 'var(--color-pink)' },
	{ cat: 'table', variable: '--table-background', default: 'transparent' },
	{ cat: 'table', variable: '--table-border-width', default: '1px' },
	{ cat: 'table', variable: '--table-border-color', default: 'var(--background-modifier-border)' },
	{ cat: 'table', variable: '--table-white-space', default: 'break-spaces' },
	{ cat: 'table', variable: '--table-header-background', default: 'var(--table-background)' },
	{ cat: 'table', variable: '--table-header-background-hover', default: 'inherit' },
	{ cat: 'table', variable: '--table-header-border-width', default: 'var(--table-border-width)' },
	{ cat: 'table', variable: '--table-header-border-color', default: 'var(--table-border-color)' },
	{ cat: 'table', variable: '--table-header-font', default: 'inherit' },
	{ cat: 'table', variable: '--table-header-size', default: 'var(--table-text-size)' },
	{ cat: 'table', variable: '--table-header-weight', default: 'calc(var(--font-weight) + var(--bold-modifier))' },
	{ cat: 'table', variable: '--table-header-color', default: 'var(--text-normal)' },
	{ cat: 'table', variable: '--table-line-height', default: 'var(--line-height-tight)' },
	{ cat: 'table', variable: '--table-text-size', default: 'var(--font-text-size)' },
	{ cat: 'table', variable: '--table-text-color', default: 'inherit' },
	{ cat: 'table', variable: '--table-column-min-width', default: '6ch' },
	{ cat: 'table', variable: '--table-column-max-width', default: 'none' },
	{ cat: 'table', variable: '--table-column-alt-background', default: 'var(--table-background)' },
	{ cat: 'table', variable: '--table-column-first-border-width', default: 'var(--table-border-width)' },
	{ cat: 'table', variable: '--table-column-last-border-width', default: 'var(--table-border-width)' },
	{ cat: 'table', variable: '--table-row-background-hover', default: 'var(--table-background)' },
	{ cat: 'table', variable: '--table-row-alt-background', default: 'var(--table-background)' },
	{ cat: 'table', variable: '--table-row-alt-background-hover', default: 'var(--table-background)' },
	{ cat: 'table', variable: '--table-row-last-border-width', default: 'var(--table-border-width)' },
	{ cat: 'table', variable: '--table-selection', default: 'hsla(var(--color-accent-hsl), 0.1)' },
	{ cat: 'table', variable: '--table-selection-blend-mode', default: 'var(--highlight-mix-blend-mode)' },
	{ cat: 'table', variable: '--table-selection-border-color', default: 'var(--interactive-accent)' },
	{ cat: 'table', variable: '--table-selection-border-width', default: '2px' },
	{ cat: 'table', variable: '--table-selection-border-radius', default: '4px' },
	{ cat: 'table', variable: '--table-cell-vertical-alignment', default: 'top' },
	{ cat: 'table', variable: '--table-drag-handle-background', default: 'transparent' },
	{ cat: 'table', variable: '--table-drag-handle-background-active', default: 'var(--table-selection-border-color)' },
	{ cat: 'table', variable: '--table-drag-handle-color', default: 'var(--text-faint)' },
	{ cat: 'table', variable: '--table-drag-handle-color-active', default: 'var(--text-on-accent)' },
	{ cat: 'table', variable: '--table-add-button-background', default: 'transparent' },
	{ cat: 'table', variable: '--table-add-button-border-width', default: 'var(--table-border-width)' },
	{ cat: 'table', variable: '--table-add-button-border-color', default: 'var(--background-modifier-border)' },
	{ cat: 'tabs', variable: '--tab-background-active', default: 'var(--background-primary)' },
	{ cat: 'tabs', variable: '--tab-text-color', default: 'var(--text-faint)' },
	{ cat: 'tabs', variable: '--tab-text-color-active', default: 'var(--text-muted)' },
	{ cat: 'tabs', variable: '--tab-text-color-focused', default: 'var(--text-muted)' },
	{ cat: 'tabs', variable: '--tab-text-color-focused-active', default: 'var(--text-muted)' },
	{ cat: 'tabs', variable: '--tab-text-color-focused-highlighted', default: 'var(--text-accent)' },
	{ cat: 'tabs', variable: '--tab-text-color-focused-active-current', default: 'var(--text-normal)' },
	{ cat: 'tabs', variable: '--tab-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'tabs', variable: '--tab-font-weight', default: 'inherit' },
	{ cat: 'tabs', variable: '--tab-container-background', default: 'var(--background-secondary)' },
	{ cat: 'tabs', variable: '--tab-divider-color', default: 'var(--background-modifier-border-hover)' },
	{ cat: 'tabs', variable: '--tab-outline-color', default: 'var(--divider-color)' },
	{ cat: 'tabs', variable: '--tab-outline-width', default: '1px' },
	{ cat: 'tabs', variable: '--tab-curve', default: '6px' },
	{ cat: 'tabs', variable: '--tab-radius', default: 'var(--radius-s)' },
	{ cat: 'tabs', variable: '--tab-radius-active', default: '6px 6px 0 0' },
	{ cat: 'tabs', variable: '--tab-width', default: '200px' },
	{ cat: 'tabs', variable: '--tab-max-width', default: '320px' },
	{ cat: 'tabs', variable: '--tab-stacked-pane-width', default: '700px' },
	{ cat: 'tabs', variable: '--tab-stacked-header-width', default: 'var(--header-height)' },
	{ cat: 'tabs', variable: '--tab-stacked-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'tabs', variable: '--tab-stacked-font-weight', default: '400' },
	{ cat: 'tabs', variable: '--tab-stacked-text-align', default: 'start' },
	{ cat: 'tabs', variable: '--tab-stacked-text-transform', default: 'rotate(0deg)' },
	{ cat: 'tabs', variable: '--tab-stacked-text-writing-mode', default: 'vertical-lr' },
	{ cat: 'tabs', variable: '--tab-stacked-shadow', default: '-8px 0 8px 0 rgba(0, 0, 0, 0.05)' },
	{ cat: 'tag', variable: '--tag-size', default: 'var(--font-smaller)' },
	{ cat: 'tag', variable: '--tag-color', default: 'var(--text-accent)' },
	{ cat: 'tag', variable: '--tag-color-hover', default: 'var(--text-accent)' },
	{ cat: 'tag', variable: '--tag-decoration', default: 'none' },
	{ cat: 'tag', variable: '--tag-decoration-hover', default: 'none' },
	{ cat: 'tag', variable: '--tag-background', default: 'hsla(var(--interactive-accent-hsl), 0.1)' },
	{ cat: 'tag', variable: '--tag-background-hover', default: 'hsla(var(--interactive-accent-hsl), 0.2)' },
	{ cat: 'tag', variable: '--tag-border-color', default: 'hsla(var(--interactive-accent-hsl), 0.15)' },
	{ cat: 'tag', variable: '--tag-border-color-hover', default: 'hsla(var(--interactive-accent-hsl), 0.15)' },
	{ cat: 'tag', variable: '--tag-border-width', default: '0px' },
	{ cat: 'tag', variable: '--tag-padding-x', default: '0.65em' },
	{ cat: 'tag', variable: '--tag-padding-y', default: '0.25em' },
	{ cat: 'tag', variable: '--tag-radius', default: '2em' },
	{ cat: 'tag', variable: '--tag-weight', default: 'inherit' },
	{ cat: 'textinput', variable: '--input-height', default: '30px' },
	{ cat: 'textinput', variable: '--input-radius', default: '5px' },
	{ cat: 'textinput', variable: '--input-font-weight', default: 'var(--font-normal)' },
	{ cat: 'textinput', variable: '--input-border-width', default: '1px' },
	{ cat: 'textinput', variable: '--input-placeholder-color', default: 'var(--text-faint)' },
	{ cat: 'textinput', variable: '--input-date-separator', default: 'var(--text-faint)' },
	{ cat: 'toggle', variable: '--toggle-border-width', default: '2px' },
	{ cat: 'toggle', variable: '--toggle-width', default: '40px' },
	{ cat: 'toggle', variable: '--toggle-radius', default: '18px' },
	{ cat: 'toggle', variable: '--toggle-thumb-color', default: 'white' },
	{ cat: 'toggle', variable: '--toggle-thumb-radius', default: '18px' },
	{ cat: 'toggle', variable: '--toggle-thumb-height', default: '18px' },
	{ cat: 'toggle', variable: '--toggle-thumb-width', default: '18px' },
	{ cat: 'toggle', variable: '--toggle-s-border-width', default: '2px' },
	{ cat: 'toggle', variable: '--toggle-s-width', default: '34px' },
	{ cat: 'toggle', variable: '--toggle-s-thumb-height', default: '15px' },
	{ cat: 'toggle', variable: '--toggle-s-thumb-width', default: '15px' },
	{ cat: 'themelight', variable: '--highlight-mix-blend-mode', default: 'darken' },
	{ cat: 'themelight', variable: '--mono-rgb-0', default: '255, 255, 255' },
	{ cat: 'themelight', variable: '--mono-rgb-100', default: '0, 0, 0' },
	{ cat: 'themelight', variable: '--color-red-rgb', default: '233, 49, 71' },
	{ cat: 'themelight', variable: '--color-red', default: '#e93147' },
	{ cat: 'themelight', variable: '--color-orange-rgb', default: '236, 117, 0' },
	{ cat: 'themelight', variable: '--color-orange', default: '#ec7500' },
	{ cat: 'themelight', variable: '--color-yellow-rgb', default: '224, 172, 0' },
	{ cat: 'themelight', variable: '--color-yellow', default: '#e0ac00' },
	{ cat: 'themelight', variable: '--color-green-rgb', default: '8, 185, 78' },
	{ cat: 'themelight', variable: '--color-green', default: '#08b94e' },
	{ cat: 'themelight', variable: '--color-cyan-rgb', default: '0, 191, 188' },
	{ cat: 'themelight', variable: '--color-cyan', default: '#00bfbc' },
	{ cat: 'themelight', variable: '--color-blue-rgb', default: '8, 109, 221' },
	{ cat: 'themelight', variable: '--color-blue', default: '#086ddd' },
	{ cat: 'themelight', variable: '--color-purple-rgb', default: '120, 82, 238' },
	{ cat: 'themelight', variable: '--color-purple', default: '#7852ee' },
	{ cat: 'themelight', variable: '--color-pink-rgb', default: '213, 57, 132' },
	{ cat: 'themelight', variable: '--color-pink', default: '#d53984' },
	{ cat: 'themelight', variable: '--color-base-00', default: '#ffffff' },
	{ cat: 'themelight', variable: '--color-base-05', default: '#fcfcfc' },
	{ cat: 'themelight', variable: '--color-base-10', default: '#fafafa' },
	{ cat: 'themelight', variable: '--color-base-20', default: '#f6f6f6' },
	{ cat: 'themelight', variable: '--color-base-25', default: '#e3e3e3' },
	{ cat: 'themelight', variable: '--color-base-30', default: '#e0e0e0' },
	{ cat: 'themelight', variable: '--color-base-35', default: '#d4d4d4' },
	{ cat: 'themelight', variable: '--color-base-40', default: '#bdbdbd' },
	{ cat: 'themelight', variable: '--color-base-50', default: '#ababab' },
	{ cat: 'themelight', variable: '--color-base-60', default: '#707070' },
	{ cat: 'themelight', variable: '--color-base-70', default: '#5c5c5c' },
	{ cat: 'themelight', variable: '--color-base-100', default: '#222222' },
	{ cat: 'themelight', variable: '--color-accent-hsl', default: 'var(--accent-h), var(--accent-s), var(--accent-l)' },
	{ cat: 'themelight', variable: '--color-accent', default: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))' },
	{ cat: 'themelight', variable: '--color-accent-1', default: 'hsl(calc(var(--accent-h) - 1), calc(var(--accent-s) * 1.01), calc(var(--accent-l) * 1.075))' },
	{ cat: 'themelight', variable: '--color-accent-2', default: 'hsl(calc(var(--accent-h) - 3), calc(var(--accent-s) * 1.02), calc(var(--accent-l) * 1.15))' },
	{ cat: 'themelight', variable: '--background-secondary-alt', default: 'var(--color-base-05)' },
	{ cat: 'themelight', variable: '--background-modifier-box-shadow', default: 'rgba(0, 0, 0, 0.1)' },
	{ cat: 'themelight', variable: '--background-modifier-cover', default: 'rgba(220, 220, 220, 0.4)' },
	{ cat: 'themelight', variable: '--input-shadow', default: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12), 0 2px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 1.5px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 0 0 0 transparent' },
	{ cat: 'themelight', variable: '--input-shadow-hover', default: 'inset 0 0 0 1px rgba(0, 0, 0, 0.17), 0 2px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 1.5px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 0 0 0 transparent' },
	{ cat: 'themelight', variable: '--shadow-s', default: '0px 1px 2px rgba(0, 0, 0, 0.028), 0px 3.4px 6.7px rgba(0, 0, 0, 0.042), 0px 15px 30px rgba(0, 0, 0, 0.07)' },
	{ cat: 'themelight', variable: '--shadow-l', default: '0px 1.8px 7.3px rgba(0, 0, 0, 0.071), 0px 6.3px 24.7px rgba(0, 0, 0, 0.112), 0px 30px 90px rgba(0, 0, 0, 0.2)' },
	{ cat: 'themedark', variable: '--highlight-mix-blend-mode', default: 'lighten' },
	{ cat: 'themedark', variable: '--mono-rgb-0', default: '0, 0, 0' },
	{ cat: 'themedark', variable: '--mono-rgb-100', default: '255, 255, 255' },
	{ cat: 'themedark', variable: '--color-red-rgb', default: '251, 70, 76' },
	{ cat: 'themedark', variable: '--color-red', default: '#fb464c' },
	{ cat: 'themedark', variable: '--color-orange-rgb', default: '233, 151, 63' },
	{ cat: 'themedark', variable: '--color-orange', default: '#e9973f' },
	{ cat: 'themedark', variable: '--color-yellow-rgb', default: '224, 222, 113' },
	{ cat: 'themedark', variable: '--color-yellow', default: '#e0de71' },
	{ cat: 'themedark', variable: '--color-green-rgb', default: '68, 207, 110' },
	{ cat: 'themedark', variable: '--color-green', default: '#44cf6e' },
	{ cat: 'themedark', variable: '--color-cyan-rgb', default: '83, 223, 221' },
	{ cat: 'themedark', variable: '--color-cyan', default: '#53dfdd' },
	{ cat: 'themedark', variable: '--color-blue-rgb', default: '2, 122, 255' },
	{ cat: 'themedark', variable: '--color-blue', default: '#027aff' },
	{ cat: 'themedark', variable: '--color-purple-rgb', default: '168, 130, 255' },
	{ cat: 'themedark', variable: '--color-purple', default: '#a882ff' },
	{ cat: 'themedark', variable: '--color-pink-rgb', default: '250, 153, 205' },
	{ cat: 'themedark', variable: '--color-pink', default: '#fa99cd' },
	{ cat: 'themedark', variable: '--color-base-00', default: '#1e1e1e' },
	{ cat: 'themedark', variable: '--color-base-05', default: '#212121' },
	{ cat: 'themedark', variable: '--color-base-10', default: '#242424' },
	{ cat: 'themedark', variable: '--color-base-20', default: '#262626' },
	{ cat: 'themedark', variable: '--color-base-25', default: '#2a2a2a' },
	{ cat: 'themedark', variable: '--color-base-30', default: '#363636' },
	{ cat: 'themedark', variable: '--color-base-35', default: '#3f3f3f' },
	{ cat: 'themedark', variable: '--color-base-40', default: '#555555' },
	{ cat: 'themedark', variable: '--color-base-50', default: '#666666' },
	{ cat: 'themedark', variable: '--color-base-60', default: '#999999' },
	{ cat: 'themedark', variable: '--color-base-70', default: '#b3b3b3' },
	{ cat: 'themedark', variable: '--color-base-100', default: '#dadada' },
	{ cat: 'themedark', variable: '--color-accent-hsl', default: 'var(--accent-h), var(--accent-s), var(--accent-l)' },
	{ cat: 'themedark', variable: '--color-accent', default: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))' },
	{ cat: 'themedark', variable: '--color-accent-1', default: 'hsl(calc(var(--accent-h) - 3), calc(var(--accent-s) * 1.02), calc(var(--accent-l) * 1.15))' },
	{ cat: 'themedark', variable: '--color-accent-2', default: 'hsl(calc(var(--accent-h) - 5), calc(var(--accent-s) * 1.05), calc(var(--accent-l) * 1.29))' },
	{ cat: 'themedark', variable: '--background-modifier-form-field', default: 'var(--color-base-25)' },
	{ cat: 'themedark', variable: '--background-secondary-alt', default: 'var(--color-base-30)' },
	{ cat: 'themedark', variable: '--interactive-normal', default: 'var(--color-base-30)' },
	{ cat: 'themedark', variable: '--interactive-hover', default: 'var(--color-base-35)' },
	{ cat: 'themedark', variable: '--text-accent', default: 'var(--color-accent-1)' },
	{ cat: 'themedark', variable: '--interactive-accent', default: 'var(--color-accent)' },
	{ cat: 'themedark', variable: '--interactive-accent-hover', default: 'var(--color-accent-1)' },
	{ cat: 'themedark', variable: '--background-modifier-box-shadow', default: 'rgba(0, 0, 0, 0.3)' },
	{ cat: 'themedark', variable: '--background-modifier-cover', default: 'rgba(10, 10, 10, 0.4)' },
	{ cat: 'themedark', variable: '--text-selection', default: 'hsla(var(--interactive-accent-hsl), 0.33)' },
	{ cat: 'themedark', variable: '--input-shadow', default: 'inset 0 0.5px 0.5px 0.5px rgba(255, 255, 255, 0.09), 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 1.5px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.2), 0 0 0 0 transparent' },
	{ cat: 'themedark', variable: '--input-shadow-hover', default: 'inset 0 0.5px 1px 0.5px rgba(255, 255, 255, 0.16), 0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 1.5px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 0 0 0 transparent' },
	{ cat: 'themedark', variable: '--shadow-s', default: '0px 1px 2px rgba(0, 0, 0, 0.121), 0px 3.4px 6.7px rgba(0, 0, 0, 0.179), 0px 15px 30px rgba(0, 0, 0, 0.3)' },
	{ cat: 'themedark', variable: '--shadow-l', default: '0px 1.8px 7.3px rgba(0, 0, 0, 0.071), 0px 6.3px 24.7px rgba(0, 0, 0, 0.112), 0px 30px 90px rgba(0, 0, 0, 0.2)' },
	{ cat: 'themedark', variable: '--pdf-shadow', default: '0 0 0 1px var(--background-modifier-border)' },
	{ cat: 'themedark', variable: '--pdf-thumbnail-shadow', default: '0 0 0 1px var(--background-modifier-border)' },
	{ cat: 'typography', variable: '--font-text-size', default: '16px' },
	{ cat: 'typography', variable: '--font-smallest', default: '0.8em' },
	{ cat: 'typography', variable: '--font-smaller', default: '0.875em' },
	{ cat: 'typography', variable: '--font-small', default: '0.933em' },
	{ cat: 'typography', variable: '--font-ui-smaller', default: '12px' },
	{ cat: 'typography', variable: '--font-ui-small', default: '13px' },
	{ cat: 'typography', variable: '--font-ui-medium', default: '15px' },
	{ cat: 'typography', variable: '--font-ui-large', default: '20px' },
	{ cat: 'typography', variable: '--font-weight', default: 'var(--font-normal)' },
	{ cat: 'typography', variable: '--font-thin', default: '100' },
	{ cat: 'typography', variable: '--font-extralight', default: '200' },
	{ cat: 'typography', variable: '--font-light', default: '300' },
	{ cat: 'typography', variable: '--font-normal', default: '400' },
	{ cat: 'typography', variable: '--font-medium', default: '500' },
	{ cat: 'typography', variable: '--font-semibold', default: '600' },
	{ cat: 'typography', variable: '--font-bold', default: '700' },
	{ cat: 'typography', variable: '--font-extrabold', default: '800' },
	{ cat: 'typography', variable: '--font-black', default: '900' },
	{ cat: 'typography', variable: '--bold-modifier', default: '200' },
	{ cat: 'typography', variable: '--bold-color', default: 'inherit' },
	{ cat: 'typography', variable: '--bold-weight', default: 'calc(var(--font-weight) + var(--bold-modifier))' },
	{ cat: 'typography', variable: '--italic-color', default: 'inherit' },
	{ cat: 'typography', variable: '--italic-weight', default: 'inherit' },
	{ cat: 'typography', variable: '--line-height-normal', default: '1.5' },
	{ cat: 'typography', variable: '--line-height-tight', default: '1.3' },
	{ cat: 'typography', variable: '--heading-spacing', default: 'calc(var(--p-spacing) * 2.5)' },
	{ cat: 'typography', variable: '--p-spacing', default: '1rem' },
	{ cat: 'typography', variable: '--p-spacing-empty', default: '0rem' },
	{ cat: 'vaultprofile', variable: '--vault-profile-display', default: 'flex' },
	{ cat: 'vaultprofile', variable: '--vault-profile-actions-display', default: 'flex' },
	{ cat: 'vaultprofile', variable: '--vault-profile-font-size', default: 'var(--font-ui-small)' },
	{ cat: 'vaultprofile', variable: '--vault-profile-font-weight', default: 'var(--font-medium)' },
	{ cat: 'vaultprofile', variable: '--vault-profile-color', default: 'var(--text-normal)' },
	{ cat: 'vaultprofile', variable: '--vault-profile-color-hover', default: 'var(--vault-profile-color)' },
	{ cat: 'windowframe', variable: '--titlebar-background', default: 'var(--background-secondary)' },
	{ cat: 'windowframe', variable: '--titlebar-background-focused', default: 'var(--background-secondary-alt)' },
	{ cat: 'windowframe', variable: '--titlebar-border-width', default: '0px' },
	{ cat: 'windowframe', variable: '--titlebar-border-color', default: 'var(--background-modifier-border)' },
	{ cat: 'windowframe', variable: '--titlebar-text-color', default: 'var(--text-muted)' },
	{ cat: 'windowframe', variable: '--titlebar-text-color-focused', default: 'var(--text-normal)' },
	{ cat: 'windowframe', variable: '--titlebar-text-weight', default: 'var(--font-bold)' },
	{ cat: 'windowframe', variable: '--header-height', default: '40px' },
	{ cat: 'workspace', variable: '--workspace-background-translucent', default: 'rgba(var(--mono-rgb-0), 0.6)' }
]

export class CSSVariableManager {
	plugin: CustomThemeStudioPlugin;
	app: App;

	constructor(plugin: CustomThemeStudioPlugin) {
		this.plugin = plugin;
	}

	/**
	 * Update a CSS variable value
	 */
	updateVariable(name: string, value: string, parent: string): void {

		let customVars: CSSVariable[] = this.plugin.settings.customVariables;

		// Store in settings
		if (!customVars) {
			this.plugin.settings.customVariables = [];
		}

		const existingVariable = customVars.find(el => el.variable === name && el.parent === parent);

		if (existingVariable) {
			if (value !== '') {
				// Update
				for (const obj of customVars) {
					if (obj.variable === name && obj.parent === parent) {
						obj.value = value;
						break;
					}
				}
			} else {
				// Remove if empty value
				const index = customVars.findIndex(el => el.variable === name && el.parent === parent);
				customVars.splice(index, 1);
			}
		} else {
			// New
			let obj: CSSVariable = {
				'parent': parent,
				'variable': name,
				'value': value
			}
			customVars.push(obj)				
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

