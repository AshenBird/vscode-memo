import * as vscode from "vscode";
import { NoteExplorerProvider } from "./Explorer";
import { createSidebar } from "./Sidebar";

export interface ExtensionsMap {
  markdown?: vscode.Extension<{ editor: MarkdownEditorProvider }>;
}
export interface MarkdownEditorProvider
  extends vscode.CustomTextEditorProvider {
  createAsWebviewPanel: (
    document: vscode.TextDocument
  ) => Thenable<ReturnType<typeof vscode.window.createWebviewPanel>>;
}

	
const noteMap = new Map();
export const createExtensions = async (context: vscode.ExtensionContext) => {
  createSidebar(context);
  const noteExplorer = await new NoteExplorerProvider().register();
  // {
  // 	"id": "mcswift-sidebar",
  // 	"name": "",
  // 	"type": "webview"
  // }
};
