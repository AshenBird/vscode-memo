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
  WorkspaceFolder
} from "vscode";

import { StringDecoder } from "string_decoder";
import * as path from "path";
import { UniKey } from "./UniKey";
import { ConfigController } from "./ConfigController";


function arr2str(arr: Uint8Array) {
  const decoder = new StringDecoder();
  return decoder.end(Buffer.from(arr));
}



export class Sidebar implements Disposable, WebviewViewProvider {
  private _webview: WebviewView | undefined;
  private _disposable: Disposable | undefined;
  private template: string = "";
  private memoDoc?:TextDocument;
  private todoDoc?:TextDocument;
  constructor(private readonly context: ExtensionContext, private configController:ConfigController) {}

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
    this._webview.webview.onDidReceiveMessage((message: any) => {
      console.log(message);
      if (message.type) {
        switch(message.type){
          case "init":
              this.onViewInit();
        }
      }
    });
    
    this.configController.onConfigChange(this.listenConfigChange.bind(this));
    // 进行渲染
    this._webview.webview.html = await this.getHtml();
  }
  listenConfigChange(v:boolean){
    if(v){
      this.createPrivateDoc();
      return;
    }
    this.destructPrivateDoc();
  }
  private async createPrivateDoc(){
    // 初始化数据
    this.memoDoc = await this.getPrivateDoc("memo");
    this.todoDoc = await this.getPrivateDoc("todo");
    this.updateData();
  }

  // 解构相关数据存储
  private async destructPrivateDoc(){
    if(!this.memoDoc||!this.todoDoc){return;}

    this.memoDoc.save();
    this.memoDoc = undefined;
    
    this.todoDoc.save();
    this.todoDoc = undefined;
  }
  private updateData(){
    if(!this.memoDoc||!this.todoDoc){return;}
    this.send("memo",JSON.parse(this.memoDoc.getText()||'[]'));
    this.send("todo",JSON.parse(this.todoDoc.getText()||'[]'));
    // this._webview?.webview.postMessage();
  }
  private send(name:string, payload:any){
    const bundle = {
      name,
      payload
    };
    this._webview?.webview.postMessage(bundle);
  }
  dispose() {
    this.destructPrivateDoc();
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

  private async getPrivateDoc(type:"memo"|"todo") {
    // if (!workspace.workspaceFolders) { return undefined; }
    const workspaceFolder = (workspace.workspaceFolders as WorkspaceFolder[])[0];
    const doc = await workspace.openTextDocument(workspaceFolder.uri.fsPath + `/.mcswift/${type}.json`);
    return doc;
  }
  private async getHtml(): Promise<string> {

    if (!this.template) {
      const templatePath = path.resolve(__dirname, `../client/sidebar/index.html`);
      const templateUri = Uri.file(templatePath);
      const arr = await workspace.fs.readFile(templateUri);
      this.template = arr2str(arr);
    }

    // @ts-ignore
    const assetsPath = this._webview.webview.asWebviewUri(
      Uri.file(path.resolve(__dirname, `../client/sidebar`))
    );
    const nonce = UniKey.generate();
    const result = this.template
      .replace("{{base}}", assetsPath + "/");
    return result;
  }
  private onViewInit(){
    if(this.configController.isNoteMode){
      this.createPrivateDoc();
    }
    console.log("主题", window.activeColorTheme.kind);
    this.send("config", {
      theme: ({
        1: "light",
        2: "dark",
        3: "light", //HighContrast
      }[window.activeColorTheme.kind]),
    });
    // this._webview?.webview.postMessage
  }
}
export const createSidebar = (context: ExtensionContext, configController:ConfigController) => {
  console.log("Create Memo View");
  const register = ()=>{
    const sidebar = new Sidebar(context, configController);
    const a = window.registerWebviewViewProvider("mcswift-sidebar", sidebar);
    context.subscriptions.push(a);
  };
  register();
};
