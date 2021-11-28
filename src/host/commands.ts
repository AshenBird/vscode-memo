
import * as vscode from 'vscode';
const N = "note.turnOn";

export const turnOnCMD = vscode.commands.registerCommand('mcswift.turnOnNoteMode', () => {
  const config = vscode.workspace.getConfiguration();
  config.update(N, true);
});

export const turnOffCMD = vscode.commands.registerCommand('mcswift.turnOffNoteMode', () => {
  const config = vscode.workspace.getConfiguration();
  config.update(N, false);
});


export const commandsRegister = (context:vscode.ExtensionContext)=>{
  context.subscriptions.push(turnOnCMD,turnOffCMD);
};