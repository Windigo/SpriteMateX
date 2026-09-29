# SpritemateX (VS Code Plugin)

A **VS Code plugin** that runs [SpritemateX](https://burghwallis.com/spritematex/) — the Commander X16 sprite & tile editor by OldSkoolCoder — inside VS Code as a custom editor.

This extension embeds the upstream SpritemateX app (from
<https://github.com/OldSkoolCoder/SpriteMateX>) in a webview, so you get the full
original UI: the menu bar (SpritemateX16 / File / Edit / Sprite / View / Help), the
window-based layout (Editor, Tools, Palette, Preview, Sprite List, Animate, Animate
List) and all original features.

## What was changed vs upstream

Only what is strictly needed to run in a VS Code webview:

- jQuery / jQuery UI are bundled locally (the CDN is blocked by the webview CSP).
- A thin `vscode.ts` bridge replaces the browser download / file-input:
  - **Save file…** → writes via VS Code (`.spmx` goes back into the open document,
    other formats open a save dialog).
  - **Load file…** → opens a VS Code open dialog.
- `base` is `./` so all assets load relative to the webview.

Everything else (editor, palette, sprites, animation, export formats, `.spmx` /
`.bin` parsing) is the original code, so files are 100 % compatible with the
browser version.

## Running

1. `npm install`
2. Press **F5** (Run Extension) to open an Extension Development Host.
3. Run **SpritemateX: New Sprite File**, or open any `.spmx` file.

## Project layout

- `src/` — the VS Code extension host (custom editor + file bridge).
- `media/spritematex/` — the built upstream app (shipped in the extension).
- `spritematex/` — the upstream source + a `vscode.ts` bridge (for rebuilding).

## Rebuilding the embedded app

```bash
cd spritematex
npm install
npm run build
cp -R dist/* ../media/spritematex/
```

## Upstream

<https://github.com/OldSkoolCoder/SpriteMateX> (MIT)

