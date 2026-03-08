## Application Icons

The application uses two icon source files located in `src-tauri/icons/source/`:

| File | Usage |
|---|---|
| `icon_large.png` | 1024x1024 — includes "ANIMA CODEX" text. Not used at the moment. |
| `icon_small.png` | 1024x1024 — book and AC letters only, no text. Used for small sizes. |

### Regenerating icons

To regenerate all icon sizes from the small source (recommended as base):
```bash
npm run tauri icon src-tauri/icons/source/icon_small.png
```

> **Note:** After regenerating, delete the `src-tauri/icons/android` and
> `src-tauri/icons/ios` folders — mobile platforms are out of scope for this version.