"use strict";
// Minimal bridge to the VS Code extension host.
// Only active when the app runs inside a VS Code webview.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVSCode = isVSCode;
exports.post = post;
exports.onMessage = onMessage;
exports.blobToBase64 = blobToBase64;
exports.base64ToBinary = base64ToBinary;
let _api = null;
function api() {
    if (!_api && typeof acquireVsCodeApi === "function") {
        _api = acquireVsCodeApi();
    }
    return _api;
}
function isVSCode() {
    return typeof acquireVsCodeApi === "function";
}
function post(msg) {
    const a = api();
    if (a)
        a.postMessage(msg);
}
function onMessage(handler) {
    window.addEventListener("message", (e) => handler(e.data));
}
// Read a Blob and return its contents as a base64 string.
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1] || "");
        r.onerror = reject;
        r.readAsDataURL(blob);
    });
}
// Decode base64 into a latin1 "binary" string (what readAsBinaryString used to return).
function base64ToBinary(b64) {
    const bin = atob(b64);
    let s = "";
    for (let i = 0; i < bin.length; i++) {
        s += String.fromCharCode(bin.charCodeAt(i));
    }
    return s;
}
//# sourceMappingURL=vscode.js.map