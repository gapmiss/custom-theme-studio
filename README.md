# Custom Theme Studio

An Obsidian.md plugin that empowers users to create, edit, and export custom themes with a built-in CSS editor and visual styling tools. It streamlines the process of modifying UI styles, managing variables, and styling individual elements—all without leaving Obsidian.

## Features

- Modify Obsidian's CSS variable
    - Modify colors, fonts, UI styles and more
- Integrated CSS editor powered by Ace for live theme customization
- Real-time preview of style changes
- Visual element picker for targeting styles
- Fuzzy search modal for importing CSS snippet
- Freeze UI feature for design inspection
- Theme management (enable, disable)
- Export your customized theme as a shareable theme

### CSS variable customization

- Modify Obsidian's built-in CSS variables
- Variables organized by categories (components, editor, foundations, plugins, window, theme-dark, theme-light)
- Filter and search functionality to easily find specific variables
- Color picker for variables with HEX color values

### CSS rules

- Interactive element picker to target specific UI components
- Advanced CSS editor with syntax highlighting
- Live preview of changes
- Filter and search functionality to easily find specific rules
- Save and manage multiple custom CSS rules

### CSS Editor Features

- Built-in Ace code editor with syntax highlighting
- Customizable editor settings (theme, font size, tab width)
- Optional line numbers and word wrap
- Embedded color picker
- Keyboard shortcuts support
- Auto-completion with snippets
    - Including all Obsidian variables

### Theme Export

- Export custom theme as CSS file
- Generate theme manifest file for distribution
- Copy CSS or manifest to clipboard
- Configure theme metadata (name, author, URL)

### Settings Management

- Import/export settings for backup or sharing
- Reset theme customizations
- Toggle theme on/off globally

## Installation

[Find at Obsidian.md/plugins](https://obsidian.md/plugins?search=custom-theme-studio)

### From Obsidian

1. Open Obsidian Settings
2. Go to Community Plugins and disable Safe Mode
3. Click Browse and search for "Custom Theme Studio"
4. Install the plugin and enable it

### Manual Installation

1. Download `main.js`, `manifest.json` & `styles.css` from the latest [release](https://github.com/gapmiss/custom-theme-studio/releases/)
2. Create a new folder `/path/to/vault/.obsidian/plugins/custom-theme-studio`
3. Move all 3 files to `/path/to/vault/.obsidian/plugins/custom-theme-studio`
4. Settings > Community plugins > Reload plugins
5. Enable the "Custom Theme Studio" plugin in the community plugin list

### Via BRAT (Beta Reviewer's Auto-update Tool):

1. Ensure the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin is installed
2. Trigger the command Obsidian42 - BRAT: Add a beta plugin for testing
3. Enter this repository, gapmiss/custom-theme-studio
4. Enable the "Custom Theme Studio" plugin in the community plugin list

## Credits

Some code inspired by and derived from:

- [RavenHogWarts/obsidian-ace-code-editor](https://github.com/RavenHogWarts/obsidian-ace-code-editor)
- [chrisgrieser/obsidian-theme-design-utilities](https://github.com/chrisgrieser/obsidian-theme-design-utilities)
- [Yuichi-Aragi/Version-Control](https://github.com/Yuichi-Aragi/Version-Control)
- [easylogic/ace-colorpicker](https://github.com/easylogic/ace-colorpicker)
- [Zachatoo/obsidian-css-editor](https://github.com/Zachatoo/obsidian-css-editor)

Thank you!