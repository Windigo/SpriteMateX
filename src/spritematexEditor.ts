import * as fs from 'fs';
import * as vscode from 'vscode';

interface Message {
    type: string;
    format?: string;
    name?: string;
    data?: string;
}

export class SpriteMateXEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'spritematex.spriteEditor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            SpriteMateXEditorProvider.viewType,
            new SpriteMateXEditorProvider(context),
            { webviewOptions: { retainContextWhenHidden: true } }
        );
    }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        const distUri = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'spritematex');
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [distUri],
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, distUri);

        webviewPanel.webview.onDidReceiveMessage(async (message: Message) => {
            switch (message.type) {
                case 'ready': {
                    const text = document.getText();
                    if (text && text.trim().length > 0) {
                        const name = document.fileName.split(/[\\/]/).pop() || 'sprite.spmx';
                        webviewPanel.webview.postMessage({ type: 'load', name, data: text });
                    }
                    break;
                }
                case 'save': {
                    await this.handleSave(document, message);
                    break;
                }
                case 'loadRequest': {
                    await this.handleLoadRequest(webviewPanel);
                    break;
                }
            }
        });
    }

    private async handleSave(document: vscode.TextDocument, message: Message): Promise<void> {
        const format = (message.format || '').toLowerCase();
        const data = Buffer.from(message.data ?? '', 'base64');

        // A .spmx save writes back into the open document (native save via Ctrl+S).
        if (format === 'spmx') {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri,
                new vscode.Range(0, 0, document.lineCount, 0),
                data.toString('utf8')
            );
            await vscode.workspace.applyEdit(edit);
            return;
        }

        const uri = await vscode.window.showSaveDialog({
            saveLabel: 'Save',
            defaultUri: vscode.Uri.file(message.name || 'sprite.' + (format || 'txt')),
            filters: this.filtersFor(format),
        });
        if (!uri) {
            return;
        }
        await vscode.workspace.fs.writeFile(uri, data);
        vscode.window.showInformationMessage(`Saved to ${uri.fsPath}`);
    }

    private async handleLoadRequest(webviewPanel: vscode.WebviewPanel): Promise<void> {
        const uris = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            filters: { 'SpritemateX files': ['spmx', 'bin'], 'All files': ['*'] },
        });
        if (!uris || uris.length === 0) {
            return;
        }
        const uri = uris[0];
        const name = uri.path.split('/').pop() || 'file.spmx';
        const bytes = await vscode.workspace.fs.readFile(uri);
        if (name.toLowerCase().endsWith('.bin')) {
            webviewPanel.webview.postMessage({ type: 'load', name, data: Buffer.from(bytes).toString('base64') });
        } else {
            webviewPanel.webview.postMessage({ type: 'load', name, data: Buffer.from(bytes).toString('utf8') });
        }
    }

    private filtersFor(format: string): { [name: string]: string[] } {
        switch (format) {
            case 'png': return { 'PNG Image': ['png'] };
            case 'asm': return { 'Assembly Source': ['asm'] };
            case 'bas': return { 'BASIC Source': ['bas'] };
            case 'txt': return { 'Text': ['txt'] };
            case 'spr': return { 'Sprite Binary': ['spr'] };
            case 'pal': return { 'Palette Binary': ['pal'] };
            case 'bin': return { 'Binary': ['bin'] };
            default: return { 'All files': ['*'] };
        }
    }

    private getHtmlForWebview(webview: vscode.Webview, distUri: vscode.Uri): string {
        const baseUri = webview.asWebviewUri(distUri);
        const nonce = getNonce();

        const indexPath = vscode.Uri.joinPath(distUri, 'index.html').fsPath;
        let html = fs.readFileSync(indexPath, 'utf8');

        // Remove the external Google Fonts link (blocked by the webview CSP anyway).
        html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>\s*/g, '');

        // Give every <script> the CSP nonce.
        html = html.replace(/<script /g, `<script nonce="${nonce}" `);

        const csp = [
            "default-src 'none'",
            `img-src ${webview.cspSource} data: https:`,
            `style-src ${webview.cspSource} 'unsafe-inline'`,
            `script-src 'nonce-${nonce}'`,
            `font-src ${webview.cspSource}`,
        ].join('; ');

        const injected = `<meta http-equiv="Content-Security-Policy" content="${csp}">\n<base href="${baseUri}/">`;
        html = html.replace('<head>', `<head>\n${injected}`);

        return html;
    }
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
