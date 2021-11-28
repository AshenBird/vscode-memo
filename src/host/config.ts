// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { workspace } from 'vscode';

const N = "note.turnOn";

const config = workspace.getConfiguration();

const relativeSetting = [
	"workbench.editorAssociations",
	"note.turnOn"
];


export const configCtrl =  (context:vscode.ExtensionContext)=>{
  
	const workspaceURI = workspace.workspaceFolders?.[0].uri.toString() || '';

	const getHistorySetting = () => context.globalState.get(`${workspaceURI}-settingHistory`) as Record<string, unknown>;

	const setHistorySetting = (n: Record<string, unknown>) => context.globalState.update(`${workspaceURI}-settingHistory`, n);

	if (!getHistorySetting()) {
		const r: Record<string, unknown> = {};
		for (const setting of relativeSetting) {
			r[setting] = config.inspect(setting)?.workspaceValue;
		}
		setHistorySetting(r);
	}

	const turnOff = async () => {

		const config = workspace.getConfiguration();
		const v = (config.inspect("workbench.editorAssociations")?.workspaceValue || {}) as Record<string, unknown>;
		Reflect.deleteProperty(v,"*.md");
		const isEmpty = Object.keys(v).length === 0;
		config.update("workbench.editorAssociations", isEmpty ? undefined : v);
	};

	const turnOn = async () => {

		const config = workspace.getConfiguration();
		const v = config.inspect("workbench.editorAssociations")?.workspaceValue || {};
		// @ts-ignore
		v["*.md"] = "mcswift.vditor";
		config.update("workbench.editorAssociations", v);
	};

	const noteModeSwitch = () => {
		const config = workspace.getConfiguration();
		if (typeof config.inspect(N)?.workspaceValue === "undefined") { return; }

		const isOpen = config.get(N);
		isOpen ? turnOn() : turnOff().catch(e => { console.log(e); });
	};




	// 监听配置
	const configChangeListener = workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
		if (e.affectsConfiguration(N)) {

			noteModeSwitch();
		}
	});

	// 立即检测下配置
	noteModeSwitch();

	// 注册命令
	const turnOnCMD = vscode.commands.registerCommand('note-pack.turnOn', () => {
		config.update(N, true);
	});

	const turnOffCMD = vscode.commands.registerCommand('note-pack.turnOff', () => {
		config.update(N, false);
	});
  return [turnOnCMD, turnOffCMD, configChangeListener];
};