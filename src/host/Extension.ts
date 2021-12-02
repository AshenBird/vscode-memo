import * as vscode from 'vscode';
import { commandsRegister } from './commands';
import { ConfigController } from './ConfigController';
import { createSidebar } from "./Sidebar";
export const createExtensions = async (context: vscode.ExtensionContext)=>{
	console.log("Create Mcswift Extensions");
	// const configController = await new ConfigController(context);
	commandsRegister(context);
	createSidebar(context);
};

