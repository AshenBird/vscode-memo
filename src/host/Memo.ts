import {
  CancellationToken,
  commands,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  TextDocument,
  Uri,
  ViewColumn,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  window,
  workspace,
} from "vscode";

import { StringDecoder } from "string_decoder";
import * as path from "path";


function arr2str(arr: Uint8Array) {
  const decoder = new StringDecoder();
  return decoder.end(Buffer.from(arr));
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


export class Memo implements Disposable, WebviewViewProvider {
  private _webview: WebviewView | undefined;
  private _disposable: Disposable | undefined;
  private template: string = "";
  constructor(private readonly context: ExtensionContext) {
    //
    
  }

  public async refresh() {
    if (!this._webview) {
      // its not available to refresh yet
      return;
    }
    this._webview.webview.html = await this.getHtml();
  }

  private _onDidClose = new EventEmitter<void>();
  get onDidClose(): Event<void> {
    return this._onDidClose.event;
  }

  // this is called when a view first becomes visible. This may happen when the view is first loaded
  // or when the user hides and then shows a view again
  public async resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext<unknown>,
    token: CancellationToken
  ) {
    console.log("begin resolve");
    if (!this._webview) {
      this._webview = webviewView;
    }

    this._webview.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: [this.context.extensionUri],
    };

    // 解构函数
    this._disposable = Disposable.from(
      this._webview.onDidDispose(this.onWebviewDisposed, this)
    );

    // 监听视图事件
    this._webview.webview.onDidReceiveMessage(async (message: any) => {
      // if (message?.action) {
      //   const cmd = message.action.includes('codetime.') ? message.action : `codetime.${message.action}`;
      //   switch (message.command) {
      //     case 'command_execute':
      //       if (message.payload && Object.keys(message.payload).length) {
      //         commands.executeCommand(cmd, message.payload);
      //       } else {
      //         commands.executeCommand(cmd);
      //       }
      //       break;
      //   }
      // }
    });

    // 进行渲染
    this._webview.webview.html = await this.getHtml();
  }

  dispose() {
    this._disposable && this._disposable.dispose();
  }

  private onWebviewDisposed() {
    this._onDidClose.fire();
  }

  get viewColumn(): ViewColumn | undefined {
    return undefined;
  }

  get visible() {
    return this._webview ? this._webview.visible : false;
  }

  private async getHtml(): Promise<string> {
    
    if (!this.template) {
      const templatePath = path.resolve(__dirname, `../client/memo/index.html`);
      const templateUri = Uri.file(templatePath);
      const arr = await workspace.fs.readFile(templateUri);
      this.template = arr2str(arr);
    }

    // @ts-ignore
    const assetsPath = this._webview.webview.asWebviewUri(
      Uri.file(path.resolve(__dirname, `../client/memo`))
    );
    const nonce = getNonce();
    const result = this.template
      .replace("{{base}}", assetsPath + "/")
      // .replace(new RegExp("{{cspSource}}","g"), this.webview.cspSource)
      // .replace(new RegExp("{{nonce}}","g"), nonce)
      .replace(
        "{{init-config}}",
        JSON.stringify({
          theme: {
            1: "light",
            2: "dark",
            3: "light", //HighContrast
          }[window.activeColorTheme.kind],
        })
      );
    return result;
  }
}
export const createMemo = (context: ExtensionContext) => {
  console.log("Create Memo View");
  const memo = new Memo(context);
  const a = window.registerWebviewViewProvider("mcswift-memo",memo);
  context.subscriptions.push(a);
};
