import * as os from 'os';
import * as vscode from 'vscode';
import { SpriteMateXEditorProvider } from './spritematexEditor';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(SpriteMateXEditorProvider.register(context));

    context.subscriptions.push(
        vscode.commands.registerCommand('spritematex.newSprite', async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            const defaultUri = workspaceFolder
                ? vscode.Uri.joinPath(workspaceFolder.uri, 'sprite.spmx')
                : vscode.Uri.joinPath(vscode.Uri.file(os.homedir()), 'sprite.spmx');
            const uri = await vscode.window.showSaveDialog({
                saveLabel: 'Create Sprite File',
                defaultUri,
                filters: { 'SpritemateX Sprite': ['spmx'] },
            });
            if (!uri) {
                return;
            }
            // Create an empty file; the editor starts blank and the real
            // SpritemateX format is written on the first "Save file...".
            await vscode.workspace.fs.writeFile(uri, Buffer.from('', 'utf8'));
            await vscode.commands.executeCommand('vscode.openWith', uri, SpriteMateXEditorProvider.viewType);
        })
    );
}

export function deactivate(): void {}
