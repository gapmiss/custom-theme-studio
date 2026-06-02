# Custom Theme Studio

A complete theme design studio for Obsidian. Create, customize, and export professional themes with visual tools, live CSS editing, and instant feedback—all without leaving your workspace.

> **Requires Obsidian v1.13.0 or later.** For older Obsidian versions, install a previous plugin release manually.

## Installation

[Install from community.obsidian.md](https://community.obsidian.md/plugins/custom-theme-studio)

From Obsidian's settings or preferences:

1. Community Plugins > Browse
2. Search for "Custom Theme Studio"

Manually:

1. download the latest [release](https://github.com/gapmiss/custom-theme-studio/releases/latest) archive
2. uncompress the downloaded archive
3. move the `custom-theme-studio` folder to `/path/to/vault/.obsidian/plugins/` 
4.  Settings > Community plugins > reload **Installed plugins**
5.  enable plugin

or:

1.  download `main.js`, `manifest.json` & `styles.css` from the latest [release](https://github.com/gapmiss/custom-theme-studio/releases/latest)
2.  create a new folder `/path/to/vault/.obsidian/plugins/custom-theme-studio`
3.  move all 3 files to `/path/to/vault/.obsidian/plugins/custom-theme-studio`
4.  Settings > Community plugins > reload **Installed plugins**
5.  enable plugin

## Features at a Glance

| Feature              | Description                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **CSS Variables**    | Edit colors, fonts, and other UI styles. Variables are searchable, filterable by category, with live counter updates. |
| **Font Import**      | Import custom fonts and create base64 `@font-face` rules for your theme.                     |
| **Live Editor**      | Ace editor with syntax highlighting, auto-complete, Prettier formatting, and built-in color picker.               |
| **Visual Tools**     | Pick elements to style with configurable selector generation, preview changes in real-time, freeze UI for inspection.              |
| **Theme Management** | Enable, disable, switch themes, or export as CSS with a manifest and Prettier formatting.                            |
| **Settings**         | Backup, import/export, reset customizations, toggle themes with reactive updates.                                  |

---

## Detailed Features

### CSS Variables

- Edit built-in CSS variables for colors, fonts, and UI components
- Organized into categories: components, editor, foundations, plugins, window, dark/light themes
- **Deprecated category**: Legacy variables (RGB variants, HSL variants) kept for theme compatibility
- Search and filter to quickly find variables with real-time result counter
- Add custom variables with live counter updates
- Color picker for HEX values with reactive updates
- Category badges show item counts that update automatically
- Tag-based filtering for quick navigation

> **Note:** As of Obsidian v1.13.0, many CSS variables now use `color-mix()` instead of `rgba()`/`hsla()`. The deprecated category contains legacy variables for backwards compatibility with older themes.

### CSS Rules

- **Smart Element Selector** with configurable selector generation:
  - Three selector styles: Minimal (short), Balanced (moderate), Specific (detailed)
  - Toggle preference for classes vs. data attributes
  - Configure tag name inclusion
  - Exclude unwanted attributes with wildcard patterns
  - Handles special characters and aria-labels properly
- Advanced CSS editor with syntax highlighting and auto-formatting
- **In-editor Prettier formatting** with preserved undo/redo history
- Smart cursor positioning when editing (auto-places cursor before closing brace)
- Visual focus indicators for active editor
- Live preview while editing with configurable debounce delay
- Search and filter rules with result counter
- Save and manage multiple custom rules with auto-scroll to newly created items
- Apply imported fonts to any element

### CSS Editor

- Built-in Ace editor with syntax highlighting and auto-complete
- **One-click Prettier formatting** with undo support
- Customize editor settings: theme, font size, tab width (2 or 4 spaces)
- Optional line numbers and word wrap
- Embedded color picker for Ace editor
- Visual focus state with accent-colored border
- Smart cursor positioning respects tab width settings
- Keyboard shortcuts for faster editing
- Auto-completion includes all Obsidian variables
- Configurable debounce delay for auto-apply changes

### Theme Export

- Export your theme as a CSS file
- Generate a manifest file for distribution
- Copy CSS or manifest to clipboard
- Configure metadata: name, author, URL

### Settings Management

- Import/export settings for backup or sharing
- Reset theme customizations
- Toggle theme on/off globally

## Usage

### Opening the Theme Studio

After installation, you can access Custom Theme Studio in several ways:

- **Ribbon Icon**: Click the paintbrush icon in the left ribbon
- **Command Palette**: Use `Ctrl/Cmd + P` and search for "Custom Theme Studio: Open view"
- **Hotkey**: Assign a custom hotkey in Settings > Hotkeys for "Custom Theme Studio: Open view"

### Getting Started

1. **Open the plugin view** using one of the methods above
2. **Enable your custom theme** by toggling the switch at the top of the view
3. **Start customizing** using the three main sections:

### CSS Variables

Edit Obsidian's built-in CSS variables to customize colors, fonts, and UI elements:

- **Browse categories**: Variables are organized by components, editor, foundations, plugins, etc.
- **Search variables**: Use the search box to quickly find specific variables
- **Color picker**: Click the color square next to HEX values for visual color selection
- **Real-time preview**: Changes apply immediately when "Auto-apply changes" is enabled

### CSS Rules

Create custom CSS rules to style specific elements:

- **Element selector**: Use `Ctrl/Cmd + P` → "Custom Theme Studio: Select an element for new CSS rule" to visually pick elements
  - Configure selector generation in settings: choose between Minimal, Balanced, or Specific styles
  - Prefer classes over attributes or vice versa
  - Exclude specific attributes using wildcard patterns (e.g., `data-tooltip-*`)
- **CSS editor**: Write custom CSS with syntax highlighting and auto-completion
  - Click the sparkles icon (✨) to format CSS with Prettier (undoable with Ctrl/Cmd+Z)
  - Cursor automatically positions for optimal editing
  - Visual focus indicator shows when editor is active
- **Live preview**: See changes in real-time as you type (configurable debounce delay)
- **Font import**: Import custom fonts and generate @font-face rules

### Theme Export

Export your customizations as a complete Obsidian theme:

- **Theme metadata**: Set name, author, and URL information
- **Export options**: Choose to include/exclude disabled rules and enable Prettier formatting
- **Download files**: Get both CSS and manifest.json files for theme distribution

### Keyboard Shortcuts & Commands

- **Toggle custom theme**: Quickly enable/disable your theme
- **Select element**: Pick UI elements for styling
- **Freeze Obsidian**: Freeze the interface for 5 seconds to inspect hover states
- **Import CSS snippet**: Import existing CSS snippets from your vault

### Pro Tips

- **Backup your work**: Use Settings > Export settings before major changes
- **Element inspection**: Use the "Freeze Obsidian" command to inspect elements that disappear on hover
- **Search efficiently**: Use the search boxes in CSS Variables and CSS Rules sections - counters show results in real-time
- **Test responsively**: Toggle your theme on/off to compare changes
- **Format while editing**: Use the sparkles icon (✨) in the CSS editor to format your code with Prettier - it's undoable!
- **Customize selectors**: Configure element selector behavior in settings for your preferred selector style
- **Exclude noisy attributes**: Add patterns like `data-tooltip-*` to excluded attributes for cleaner selectors
- **Smart cursor**: When editing CSS rules, the cursor automatically positions for adding new properties
- **Adjust debounce**: Fine-tune the auto-apply delay slider in settings for optimal performance
- **Share themes**: Export your theme and share the CSS/manifest files with others

## Credits

Some code inspired by and derived from:

- [RavenHogWarts/obsidian-ace-code-editor](https://github.com/RavenHogWarts/obsidian-ace-code-editor)
- [chrisgrieser/obsidian-theme-design-utilities](https://github.com/chrisgrieser/obsidian-theme-design-utilities)
- [Yuichi-Aragi/Version-Control](https://github.com/Yuichi-Aragi/Version-Control)
- [easylogic/ace-colorpicker](https://github.com/easylogic/ace-colorpicker)
- [Zachatoo/obsidian-css-editor](https://github.com/Zachatoo/obsidian-css-editor)

Thank you!
