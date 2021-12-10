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
  const markdown = vscode.extensions.getExtension<{
    editor: MarkdownEditorProvider;
  }>("mcswift.markdown");
	
  const noteExplorer = await vscode.window.createTreeView("note-explorer", {
    treeDataProvider: new NoteExplorerProvider(),
  });

	// if(markdown&&!markdown.isActive){
	// 	await markdown.activate();
	// }
  noteExplorer.onDidChangeSelection(async ({ selection }) => {
    if (selection.length === 0) {
      return;
    }
    const item = selection[0];
    if (item.collapsibleState === 0 && item.label.endsWith(".md")) {
      // if (markdown) {
				const uri = vscode.Uri.file(item.path);
				// if(noteMap.has(uri.path)){
				// 	const panel = noteMap.get(uri.path); 
				// 	panel.reveal(panel.viewColumn);
				// 	return;
				// }
        // const document = await vscode.workspace.openTextDocument(uri);
        // const panel = await markdown.exports.editor.createAsWebviewPanel(document);
				
				// noteMap.set(uri.path, panel);
				await vscode.commands.executeCommand('vscode.openWith', uri, "MarkSwift" );
      // }
    }
  });
  // {
  // 	"id": "mcswift-sidebar",
  // 	"name": "",
  // 	"type": "webview"
  // }
};
