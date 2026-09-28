// Minimal bridge to the VS Code extension host.
// Only active when the app runs inside a VS Code webview.

declare const acquireVsCodeApi: any;

let _api: any = null;
function api(): any {
  if (!_api && typeof acquireVsCodeApi === "function") {
    _api = acquireVsCodeApi();
  }
  return _api;
}

export function isVSCode(): boolean {
  return typeof acquireVsCodeApi === "function";
}

export function post(msg: any): void {
  const a = api();
  if (a) a.postMessage(msg);
}

export function onMessage(handler: (msg: any) => void): void {
  window.addEventListener("message", (e) => handler(e.data));
}

// Read a Blob and return its contents as a base64 string.
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

// Decode base64 into a latin1 "binary" string (what readAsBinaryString used to return).
export function base64ToBinary(b64: string): string {
  const bin = atob(b64);
  let s = "";
  for (let i = 0; i < bin.length; i++) {
    s += String.fromCharCode(bin.charCodeAt(i));
  }
  return s;
}
