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
- `media/spritematex/` — the built app (shipped in the extension).
- `spritematex/` — a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) pointing at the fork `Windigo/spritematex-vsc` (upstream SpritemateX + the `vscode.ts` bridge).

## Building

```bash
./build-extension.sh
```

This compiles the extension (tsc), builds the app (vite), copies it into `media/spritematex/`, and produces `spritematex-vsc-plugin-<version>.vsix`.

## Updating the upstream app

The submodule points at the fork `Windigo/spritematex-vsc`, which tracks upstream `OldSkoolCoder/SpriteMateX` plus the VS Code bridge. To update:

1. Merge upstream into the fork (the `git remote add` is a one-time setup):
   ```bash
   cd spritematex
   git remote add upstream https://github.com/OldSkoolCoder/SpriteMateX.git
   git fetch upstream
   git merge upstream/main
   git push origin main
   cd ..
   ```
2. Update the submodule pointer in this repo:
   ```bash
   git add spritematex
   git commit -m "Update spritematex fork"
   git push
   ```

Dependabot opens a pull request for step 2 when the fork gets new commits; merging upstream into the fork (step 1) is a manual step.

## Upstream

<https://github.com/OldSkoolCoder/SpriteMateX> (MIT)

