/**
 * SpritemateX - Commander X16 sprite & tile editor (VS Code extension wrapper)
 *
 * Wraps the unmodified upstream SpritemateX app (OldSkoolCoder/SpriteMateX) in a
 * VS Code webview panel, so it runs "as-is" in the editor.
 *
 * The app is included as a git submodule (pointing directly at the upstream repo)
 * and built with `vite build --base=./` so all assets resolve relative to the
 * webview's media folder.
 */
const vscode = require("vscode");
const fs = require("fs");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("spritematex.open", () => {
      openPanel(context);
    })
  );
}

/**
 * Reads the built index.html and injects a CSP (allowing the jQuery CDN and
 * Google Fonts) plus a <base> tag so every relative asset resolves against the
 * webview's local media directory.
 *
 * @param {vscode.Webview} webview
 * @param {vscode.Uri} extensionUri
 * @returns {string}
 */
function getWebviewContent(webview, extensionUri) {
  const mediaUri = vscode.Uri.joinPath(extensionUri, "media", "spritematex");
  const indexPath = vscode.Uri.joinPath(mediaUri, "index.html");

  let html = fs.readFileSync(indexPath.fsPath, "utf8");

  const base = webview.asWebviewUri(mediaUri).toString();
  const cspSource = webview.cspSource;

  const csp = [
    "default-src 'none'",
    `img-src ${cspSource} data: blob: https:`,
    `style-src ${cspSource} 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src ${cspSource} https://fonts.gstatic.com`,
    `script-src ${cspSource} 'unsafe-inline' https://code.jquery.com`,
    `connect-src ${cspSource} https: data: blob:`,
  ].join("; ");

  const injection = `<meta http-equiv="Content-Security-Policy" content="${csp}">\n    <base href="${base}/">`;

  return html.replace("<head>", `<head>\n    ${injection}`);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function openPanel(context) {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : vscode.ViewColumn.One;

  const panel = vscode.window.createWebviewPanel(
    "spritematex",
    "SpritemateX",
    column || vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, "media", "spritematex"),
      ],
    }
  );

  panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
