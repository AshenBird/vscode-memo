import * as vscode from 'vscode';
import { createMemo } from "./Memo";
export const createExtensions = (context: vscode.ExtensionContext)=>{
	console.log("Create Mcswift Extensions");
	createMemo(context);
};

