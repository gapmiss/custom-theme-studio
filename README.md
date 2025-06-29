# Custom Theme Studio for Obsidian

An Obsidian.md plugin to create and customize themes with a built-in CSS editor. Modify colors, styles, and export your custom theme—all inside Obsidian.

## Features

- Integrated CSS editor for live theme customization
- Modify colors, fonts, and UI styles
- Export customized themes for use or sharing
- Supports real-time preview of style changes

### CSS Variable Customization

- Modify Obsidian's built-in CSS variables
- Variables organized by categories (components, editor, foundations, plugins, window, theme-dark, theme-light)
- Filter and search functionality to easily find specific variables
- Color picker for variables with HEX color values

### Custom Element Styling

- Interactive element selector to target specific UI components
- Advanced CSS editor with syntax highlighting
- Live preview of changes
- Save and manage multiple custom element styles

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

Manually:

1. download `main.js`, `manifest.json` & `styles.css` from the latest [release](https://github.com/gapmiss/custom-theme-studio/releases/)
2. create a new folder `/path/to/vault/.obsidian/plugins/custom-theme-studio`
3. move all 3 files to `/path/to/vault/.obsidian/plugins/custom-theme-studio`
4. Settings > Community plugins > reload **Installed plugins**
5. enable plugin

### Via BRAT (Beta Reviewer's Auto-update Tool):

1. Ensure [BRAT](https://github.com/TfTHacker/obsidian42-brat) is installed
2. Trigger the command Obsidian42 - BRAT: Add a beta plugin for testing
3. Enter this repository, gapmiss/custom-theme-studio
4. Enable the "Custom Theme Studio" plugin in the community plugin list
