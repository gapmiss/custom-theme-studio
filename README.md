# Custom Theme Studio

Build your own Obsidian theme from inside Obsidian. Change any of Obsidian's CSS variables, write CSS rules with a proper code editor, click on things to get their selectors, and export the result as a theme you can install or share.

> **Requires Obsidian 1.13.0 or later** and a desktop device. For older versions of Obsidian, install an earlier release of the plugin manually.

## What you can do

- **Edit CSS variables.** Every built-in Obsidian variable is listed with its default value, grouped by category and searchable. Change a value and see it right away. Add your own variables too.
- **Write CSS rules.** Save named pieces of CSS that you can switch on and off. The editor has syntax highlighting, Prettier formatting, and optional autocomplete and color picker.
- **Pick elements visually.** Hover over any part of Obsidian to see its classes and attributes, then click to start a rule with a selector already written.
- **Import fonts and snippets.** Embed font files as `@font-face` rules, or pull in CSS snippets you already have.
- **Export a theme.** Download `theme.css` and `manifest.json`, ready to drop into your themes folder.
- **Back up your work.** Export all your settings to a file in your vault and import them again later or in another vault.

See the **[user guide](USER-GUIDE.md)** for how everything works.

## Installation

### From Obsidian

1. Open **Settings > Community plugins** and click **Browse**.
2. Search for "Custom Theme Studio", install it, and enable it.

Or [open it on community.obsidian.md](https://community.obsidian.md/plugins/custom-theme-studio).

### Manually

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/gapmiss/custom-theme-studio/releases/latest).
2. Create the folder `<your vault>/.obsidian/plugins/custom-theme-studio` and put the three files in it.
3. In **Settings > Community plugins**, reload the list of installed plugins and enable Custom Theme Studio.

## Getting started

1. Click the paintbrush icon in the left ribbon, or run **Custom Theme Studio: Open view** from the command palette.
2. Turn on **Enable theme** at the top of the view.
3. Change a variable, or click **Select an element** under **CSS rules** and click something you want to restyle.

A few tips:

- Export your settings (**Settings > Custom Theme Studio > Backup**) before big changes.
- If a rule breaks the layout, run **Toggle custom theme** from the command palette to turn everything off while you fix it.
- For menus and hover states that vanish when you move the mouse, use the **Freeze Obsidian** command.

## Credits

Some code is inspired by or adapted from:

- [RavenHogWarts/obsidian-ace-code-editor](https://github.com/RavenHogWarts/obsidian-ace-code-editor)
- [chrisgrieser/obsidian-theme-design-utilities](https://github.com/chrisgrieser/obsidian-theme-design-utilities)
- [Yuichi-Aragi/Version-Control](https://github.com/Yuichi-Aragi/Version-Control)
- [easylogic/ace-colorpicker](https://github.com/easylogic/ace-colorpicker)
- [Zachatoo/obsidian-css-editor](https://github.com/Zachatoo/obsidian-css-editor)

Thank you!
