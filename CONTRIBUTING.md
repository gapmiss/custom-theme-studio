# Contributing

Thanks for your interest in contributing!

## Bug reports

Open an issue with steps to reproduce, what you expected, and what happened instead. If you can, set **Debug level** to `Debug (all logs)` in the plugin settings and include the console output.

## Pull requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` and `npx eslint .` to verify
5. Test in Obsidian (1.13.0 or later, desktop)
6. If you changed the UI, commands, or settings, update [USER-GUIDE.md](USER-GUIDE.md)
7. Submit a PR with a clear description

## Development

```bash
npm install
npm run dev    # Watch mode
npm run build  # Production build
```
