# Custom Theme Studio user guide

This guide walks through everything the plugin can do. If you just want to get going, read [Quick start](#quick-start) and come back to the rest when you need it.

## Contents

- [Quick start](#quick-start)
- [The studio view](#the-studio-view)
- [CSS variables](#css-variables)
- [CSS rules](#css-rules)
- [The element selector](#the-element-selector)
- [The CSS editor](#the-css-editor)
- [Importing fonts](#importing-fonts)
- [Importing CSS snippets](#importing-css-snippets)
- [Exporting your theme](#exporting-your-theme)
- [Commands](#commands)
- [Settings reference](#settings-reference)
- [Backing up and resetting](#backing-up-and-resetting)
- [Troubleshooting](#troubleshooting)

## Quick start

1. Click the paintbrush icon in the left ribbon, or run **Custom Theme Studio: Open view** from the command palette. The studio opens in the right sidebar.
2. Turn on **Enable theme** at the top of the view. Nothing you change will show up until this is on.
3. Open **CSS variables**, find a variable (try searching for `accent`), and type a new value.
4. Open **CSS rules** and click **Select an element**. Click anything in Obsidian and the plugin writes a selector for it. Add some CSS and click **Save rule**.
5. When you're happy, open **Export theme** and download `theme.css` and `manifest.json`.

Your changes sit on top of whatever theme you already use. Turning the custom theme off removes them without losing anything.

## The studio view

The view has four parts, top to bottom:

- **Header.** The **Enable theme** switch turns all your customizations on or off. The sun/moon button flips Obsidian between light and dark mode so you can check both.
- **CSS variables.** Change the values of Obsidian's built-in variables, or add your own.
- **CSS rules.** Write your own CSS, each piece saved as a named rule you can turn on and off.
- **Export theme.** Package everything as a theme you can install or share.

Each section folds open and closed, and the plugin remembers which ones you left open.

## CSS variables

Obsidian's look is driven by hundreds of CSS variables: colors, fonts, spacing, sizes. This section lists them all with their default values so you can override any of them.

### Finding a variable

- **Search.** Type in the search box to filter by name. A counter shows how many matched.
- **Tags.** Click a tag to show one group: `components`, `editor`, `foundations`, `mobile`, `plugins`, `window`, `theme-dark`, `theme-light`, or `CTS` (the plugin's own variables plus any you've added). Click `all` to see everything again.
- **Categories.** Variables are grouped into categories like Button, Callout, or Typography. Each category shows how many variables it holds and links to the matching page in Obsidian's developer docs.

### Changing a value

Type a new value into the field next to a variable. The default value is shown as placeholder text, so an empty field means "use Obsidian's default."

- Click the copy icon to copy the default value to your clipboard. Handy when you only want to tweak it.
- Click the clear icon to go back to the default.
- If you turn on **Variable color picker** in settings, variables with a hex color default get a color swatch you can click.

By default the theme updates when you leave the field. If you'd rather see it change as you type, set **Variable update trigger** to **As I type** in settings.

### Adding your own variable

Click the **Add CSS variable** button (the pencil icon). Give it a name starting with two dashes, like `--my-accent`, and any valid CSS value. Custom variables appear under the `CTS` tag in the **Custom variables** category. You can use them in your CSS rules with `var(--my-accent)`.

### Deprecated variables

Starting with Obsidian 1.13, many colors are built with `color-mix()` instead of the old `rgb`/`hsl` helper variables. Those older variables still work and live in the **Deprecated** category, so themes that rely on them keep working. For new work, prefer the current variables.

## CSS rules

Variables only go so far. CSS rules let you style anything.

Each rule has a name (just a label for you) and some CSS. Rules are listed alphabetically below the editor. For each saved rule you can:

- **Enable or disable** it with the toggle. Disabled rules stay saved but aren't applied.
- **Edit** it. The editor opens right under that rule.
- **Delete** it, after a confirmation.

Use the search box to filter rules. It matches both rule names and the CSS inside them.

### Creating a rule

You have three ways in:

- **Add CSS rule** (pencil icon) opens a blank editor.
- **Select an element** (dashed-pointer icon) lets you click something in Obsidian and fills in a selector for you. See [the element selector](#the-element-selector).
- **Import font** (only shown when **Font import** is on in settings). See [Importing fonts](#importing-fonts).

Give the rule a name, write your CSS, then click **Save rule**. **Cancel** throws away what you typed.

### Previewing before you save

With the default settings, click **Apply changes** to preview the CSS without saving it. If you turn on **Auto-apply changes** in settings, the preview updates as you type, after a short delay you can adjust.

A word of caution about auto-apply: half-typed CSS gets applied too. A stray `display: none` on the wrong selector can hide the very panel you're typing in. If that happens, turn off **Enable theme** from the command palette with **Toggle custom theme**.

## The element selector

The element selector is the fastest way to style something when you don't know its CSS selector.

1. Click **Select an element** in the CSS rules section, or run **Select an element for new CSS rule** from the command palette.
2. Hover over any part of Obsidian. The element under your cursor is outlined, and a tooltip shows its tag, classes, data attributes, and `aria-label`, plus the selectors the plugin would generate.
3. Click to pick it. A new rule opens in the editor with the selector filled in.

Press `Esc` or click **Cancel** on the notice to stop without picking anything.

### Click modifiers

The tooltip lists three selectors. Which one you get depends on how you click:

| Action | Result |
| --- | --- |
| Click | New rule with the default selector |
| `Alt` + click | New rule with the specific selector |
| `Cmd`/`Ctrl` + click | New rule with the specific selector, including the parent element |
| `Shift` + click | Copies the specific selector with parent to your clipboard, no new rule |

### Tuning the generated selectors

The **Element selector** settings control what "default" means:

- **Selector style preset.** `Minimal` makes the shortest selector that works. `Balanced` adds the tag name. `Specific` uses every attribute.
- **Prefer classes over attributes.** Use `.class-name` before `[data-...]` attributes.
- **Always include tag names.** Write `div[data-type]` instead of `[data-type]`.
- **Excluded attribute patterns.** Attributes that change often, like tooltips, make selectors fragile. List them here, one per line, and they're skipped in minimal and balanced selectors. Wildcards work: `data-tooltip-*`.
- **Generate CSS.** Pre-fill the new rule with the element's current color, background, font, and similar properties so you have something to edit.

### Styling things that disappear

Menus, tooltips, and hover states vanish as soon as you move the mouse. The **Freeze Obsidian** command helps here. It opens the developer tools, counts down five seconds, then pauses Obsidian. Use the countdown to open the menu or hover the item, and once it freezes you can inspect it in the developer tools. Resume from the developer tools when you're done.

## The CSS editor

The editor is [Ace](https://ace.c9.io/) with CSS syntax highlighting. Beside the **Save rule** and **Cancel** buttons you'll find:

- **Format CSS** (magic wand icon). Tidies your CSS with Prettier. `Cmd`/`Ctrl` + `Z` undoes it.
- **Editor options** (sliders icon). Word wrap and font size for this editing session only. Permanent defaults live in settings.

Optional extras, all off by default and turned on under **CSS editor preferences** in settings:

- **Editor color picker.** Shows a swatch next to color values in your CSS. Click it to pick a new color.
- **Live auto completion.** Suggests CSS properties and values as you type.
- **Snippets.** Adds every Obsidian CSS variable to the suggestions. Needs live auto completion turned on first.

You can also pick editor color themes for light and dark mode, a keyboard scheme (VS Code, Sublime, Emacs, or Vim), font, font size, tab width, word wrap, and line numbers.

## Importing fonts

To use a font file that isn't installed on every device, you can embed it in your theme.

1. Turn on **Font import** in settings. A **Import font** button appears in CSS rules.
2. Click it, enter a font name, and click **Choose** to pick a `.ttf`, `.otf`, `.woff`, or `.woff2` file.
3. The plugin creates a new rule called `@font-face: <name>` with the font embedded as base64. The rule starts out disabled, so enable it.
4. Use the font anywhere by name, for example in the `--font-text-theme` variable or in a rule.

Embedded fonts make your theme file bigger, sometimes by a lot. Large themes can load slowly, especially on mobile. The import dialog links to Obsidian's guidance on this.

## Importing CSS snippets

Already have snippets in your vault's `.obsidian/snippets` folder? Run **Import CSS snippet** from the command palette and pick one. It becomes a new rule named `Snippet: <file name>`. Imported snippets start out disabled so they don't apply twice while the original snippet is still on.

## Exporting your theme

Open **Export theme** and fill in:

- **Theme name**
- **Author**
- **URL** (usually your GitHub profile)
- **Version**, like `1.0.0`
- **Minimum Obsidian version**, the oldest version your theme supports

Two toggles control the output:

- **Include disabled CSS rules when exporting.** Useful if you want to ship optional pieces that people can switch on.
- **Format CSS with prettier formatter.** Makes the file easier to read.

Then use the buttons:

- **CSS:** download `theme.css`, or copy it to the clipboard.
- **Manifest:** download `manifest.json`, or copy it to the clipboard.

The CSS file contains your variables, then your enabled rules, with your name and URL in a header comment.

### Installing the exported theme

1. Create a folder in `<your vault>/.obsidian/themes/`. Name it exactly what the `name` field in `manifest.json` says. The plugin builds that name from your theme name in lowercase with dashes, so "My Custom Theme" becomes `my-custom-theme`.
2. Put `theme.css` and `manifest.json` inside it.
3. Pick the theme in **Settings > Appearance > Themes**.

Turn off **Enable theme** in the studio when you test this, or your changes will be applied twice.

Bump **Version** each time you release an update. The default **Minimum Obsidian version** is `0.15.0`. If your theme uses variables added in newer releases (anything using `color-mix()`, for example), set it to the version that introduced them, like `1.13.0`.

## Commands

All commands are in the command palette under **Custom Theme Studio**. None have default hotkeys, but you can add your own in **Settings > Hotkeys**.

| Command | What it does |
| --- | --- |
| Open view | Opens the studio in the right sidebar |
| Toggle custom theme | Turns your customizations on or off |
| Select an element for new CSS rule | Starts the element selector |
| Freeze Obsidian (with 5s delay) | Opens developer tools and pauses Obsidian after 5 seconds |
| Import CSS snippet | Turns a snippet from your vault into a CSS rule |

## Settings reference

Open **Settings > Custom Theme Studio**. Some changes to the CSS variables and CSS rules sections only show up after you reload the view (see [Troubleshooting](#troubleshooting)).

### General

| Setting | Default | What it does |
| --- | --- | --- |
| Enable custom theme | Off | Same as the switch at the top of the view |

### CSS variables

| Setting | Default | What it does |
| --- | --- | --- |
| Variable update trigger | When I leave the field | Apply a changed value when you leave the field, or as you type |
| Variable color picker | Off | Shows a color swatch for variables with a hex default |

### CSS rules

| Setting | Default | What it does |
| --- | --- | --- |
| Font import | Off | Shows the **Import font** button |
| Warn before discarding changes | On | Asks before you close an editor with unsaved changes |

### Element selector

| Setting | Default | What it does |
| --- | --- | --- |
| Selector style preset | Minimal | Minimal, balanced, or specific selectors |
| Prefer classes over attributes | Off | Use classes before data attributes |
| Always include tag names | Off | Add the HTML tag to every selector |
| Excluded attribute patterns | `data-tooltip-*`, `data-delay`, and some `aria-*` | Attributes to leave out of selectors, one per line |
| Generate CSS | Off | Pre-fill new rules with the element's current styles |

### CSS editor

| Setting | Default | What it does |
| --- | --- | --- |
| Auto-apply changes | Off | Preview CSS as you type instead of clicking **Apply changes** |
| Auto-apply change delay | 500 ms | How long to wait after you stop typing before previewing |

### CSS editor preferences

| Setting | Default | What it does |
| --- | --- | --- |
| Editor color picker | Off | Inline color picker for color values |
| Live auto completion | Off | Suggestions while typing |
| Snippets | Off | Obsidian variables in suggestions. Turning this off needs an app reload. |
| Editor theme | Auto | Follow Obsidian, or force light or dark |
| Light mode theme | Github Light Default | Syntax colors in light mode |
| Dark mode theme | Github Dark | Syntax colors in dark mode |
| Keyboard shortcuts | default | Key bindings: default, vscode, sublime, emacs, or vim |
| Font size | 15 | Editor font size |
| Font family | (empty) | Editor font. Empty uses the default. |
| Tab width | 4 | Spaces per indent level |
| Word wrap | Off | Wrap long lines |
| Line numbers | On | Show line numbers |

### Theme export

The theme name, author, URL, version, minimum Obsidian version, and the two export toggles. These are the same fields as in the **Export theme** section, and changing one updates the other. Versions must look like `1.0.0`.

### Scroll helper

| Setting | Default | What it does |
| --- | --- | --- |
| Scroll to top | On | Scroll the view to the section or editor you just opened |

### Backup, troubleshooting, and reset

See the next two sections.

## Backing up and resetting

### Export and import settings

Under **Backup**, **Export** saves everything (your variables, rules, and settings) to `cts_settings.json` in the root of your vault. If that file already exists, the old one is kept as `cts_settings_backup_<timestamp>.json` first.

**Import** reads `cts_settings.json` from the vault root and replaces all your current settings with it. You'll be asked to confirm, and it can't be undone, so export first if you're unsure.

This is also how you move your work to another vault: export, copy the file over, import.

### Reset theme

**Reset** under **Reset** deletes all your variables and rules and turns the custom theme off. Your settings (editor preferences and so on) are kept. This can't be undone.

## Troubleshooting

**My changes don't show up.** Check that **Enable theme** is on. If you changed a setting for the CSS variables or CSS rules section, click **Reload** under **Troubleshooting** in settings.

**I broke Obsidian's layout and can't reach the view.** Open the command palette (`Cmd`/`Ctrl` + `P`) and run **Toggle custom theme**. Then fix the rule that caused it.

**The generated selector is too long or too fragile.** Try a different **Selector style preset**, or add the attribute that's getting in the way to **Excluded attribute patterns**.

**Something else is wrong.** Set **Debug level** to `Debug (all logs)`, open the developer console (`Cmd`+`Option`+`I` on macOS, `Ctrl`+`Shift`+`I` on Windows and Linux), reproduce the problem, and include the log in a [bug report](https://github.com/gapmiss/custom-theme-studio/issues).
