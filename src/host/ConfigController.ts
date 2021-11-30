// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { workspace } from 'vscode';
import { checkFiles } from './file';

export class ConfigController {
	static relativeSetting = [
		"workbench.editorAssociations",
		"note.turnOn"
	];
	// eslint-disable-next-line @typescript-eslint/naming-convention
	static N = "note.turnOn";
	private configListenMap: Map<Symbol, (e: boolean) => void> = new Map();
	private workspaceURI = workspace.workspaceFolders?.[0].uri.toString() || '';
	private configChangeListener?: vscode.Disposable;
	constructor(private context: vscode.ExtensionContext) {
		if (!this.getHistorySetting()) {
			const r: Record<string, unknown> = {};
			for (const setting of ConfigController.relativeSetting) {
				r[setting] = this.config.inspect(setting)?.workspaceValue;
			}
			this.setHistorySetting(r);
		}

		this.configChangeListener = workspace.onDidChangeConfiguration(this.listenConfiguration);

		// 立即检测下配置
		this.noteModeSwitch();
		context.subscriptions.push(this.configChangeListener);
	}
	get config() {
		return workspace.getConfiguration();
	}
	get isNoteMode() {
		return this.checkConfig(ConfigController.N, true);
	}
	public checkConfig(key: string, value: any) {
		const conf = this.config;
		const v = conf.inspect(key);
		// 非常不严谨的一个对比，先这样吧
		return value === v || JSON.stringify(v) === JSON.stringify(value);
	}


	getHistorySetting() {
		return this.context.workspaceState.get(`${this.workspaceURI}-settingHistory`) as Record<string, unknown>;
	}

	setHistorySetting(n: Record<string, unknown>) {
		this.context.workspaceState.update(`${this.workspaceURI}-settingHistory`, n);
	}

	async turnOff() {
		const conf = this.config;
		for (const func of this.configListenMap.values()) {
			func(false);
		}
		const v = (conf.inspect("workbench.editorAssociations")?.workspaceValue || {}) as Record<string, unknown>;
		Reflect.deleteProperty(v, "*.md");
		const isEmpty = Object.keys(v).length === 0;
		conf.update("workbench.editorAssociations", isEmpty ? undefined : v);
	};


	async turnOn() {
		await checkFiles(this.context);
		for (const func of this.configListenMap.values()) {
			func(true);
		}
		const conf = this.config;
		const v = conf.inspect("workbench.editorAssociations")?.workspaceValue || {};
		// @ts-ignore
		v["*.md"] = "mcswift.vditor";
		conf.update("workbench.editorAssociations", v);
	};

	async noteModeSwitch() {
		const config = workspace.getConfiguration();
		if (typeof config.inspect(ConfigController.N)?.workspaceValue === "undefined") { return; }
		const isOpen = config.get(ConfigController.N);
		isOpen ? await this.turnOn() : this.turnOff().catch(e => { console.log(e); });
	};
	public onConfigChange(func: (e: boolean) => void) {
		const key = Symbol();
		this.configListenMap.set(key, func);
		this.noteModeSwitch();
		return () => this.configListenMap.delete(key);
	}
	listenConfiguration(e: vscode.ConfigurationChangeEvent) {
		if (e.affectsConfiguration(ConfigController.N)) {
			this.noteModeSwitch();
		}
	}

}
