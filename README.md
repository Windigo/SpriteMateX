# SpritemateX (VS Code Plugin)

A **VS Code plugin** that runs [SpritemateX](https://burghwallis.com/spritematex/) — the Commander X16 sprite & tile editor by OldSkoolCoder — inside VS Code as a webview panel.

This extension embeds the **unmodified** upstream SpritemateX app (from
<https://github.com/OldSkoolCoder/SpriteMateX>) in a webview, so you get the full
original UI: the menu bar (SpritemateX16 / File / Edit / Sprite / View / Help), the
window-based layout, and all original features.

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **SpritemateX: Open Editor**.
3. Or press `Ctrl+Alt+X` (`Cmd+Alt+X` on macOS).

## Project layout

- `extension.js` — the VS Code extension host (opens a webview panel).
- `media/spritematex/` — the built app (shipped in the extension).
- `spritematex/` — a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) pointing directly at upstream `OldSkoolCoder/SpriteMateX`.

## Building

```bash
./build-extension.sh
```

This builds the app (vite with `--base=./`), copies it into `media/spritematex/`, and produces `spritematex-vsc-plugin-<version>.vsix`.

## Updating the upstream app

The submodule points directly at upstream, so Dependabot opens a pull request automatically when OldSkoolCoder publishes new commits. Just review and merge it.

## Upstream

<https://github.com/OldSkoolCoder/SpriteMateX> (MIT)


