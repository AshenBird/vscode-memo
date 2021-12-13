import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const currentIconThemeConf = (() => {
  const themeName = vscode.workspace
    .getConfiguration()
    .get("workbench.iconTheme");

  const themes = [];
  for (const ex of vscode.extensions.all) {
    const ts = ex.packageJSON?.contributes?.iconThemes;
    if (ts) {
      themes.push(...ts.map((t: any) => ({ theme: t, extension: ex })));
    }
  }
  const currentTheme = themes.find((item) => item.theme.id === themeName);

  const currentThemeExtensionPath = currentTheme.extension.extensionPath;
  const currentThemeConfPath = currentTheme.theme.path;

  const themeConfPath = path.join(
    currentThemeExtensionPath,
    currentThemeConfPath
  );

  const c = JSON.parse(fs.readFileSync(themeConfPath, { encoding: "utf-8" }));
  console.log(themeConfPath);
  return {path: themeConfPath, ...c};
})();
const getIcon = (exn: string, name?: string) => {
  let iconName = currentIconThemeConf.fileExtensions[exn];
  if (iconName) {
    const { iconPath } = currentIconThemeConf.iconDefinitions[iconName];
    
    // console.log(path.resolve(currentIconThemeConf.path, "../",iconPath));
    return vscode.Uri.file(path.resolve(currentIconThemeConf.path ,"../", iconPath));
  }
  if(name){
    return new vscode.ThemeIcon(name);
  }
  return new vscode.ThemeIcon("file");
};

console.log("dio");

const fileTypes = {
  md: {
    icon: getIcon("md","markdown"),//new vscode.ThemeIcon("markdown"),
    selection: async (item: NoteItem) => {
      const uri = vscode.Uri.file(item.path);
      await vscode.commands.executeCommand("vscode.openWith", uri, "MarkSwift");
    },
  },
  dio: {
    icon: getIcon("dio"),
    selection: async (item: NoteItem) => {
      const uri = vscode.Uri.file(item.path);
      await vscode.commands.executeCommand("vscode.open", uri);
    },
  },
  pdf: {
    icon: getIcon("pdf"),
    selection: async (item: NoteItem) => {
      const uri = vscode.Uri.file(item.path);
      await vscode.commands.executeCommand("vscode.open", uri);
    },
  },
};

export class NoteExplorerProvider implements vscode.TreeDataProvider<NoteItem> {
  static fileTypeMap = new Map(Object.entries(fileTypes));
  constructor() {
    // console.log(extensions);
  }
  async register() {
    const noteExplorer = await vscode.window.createTreeView("note-explorer", {
      treeDataProvider: new NoteExplorerProvider(),
    });

    noteExplorer.onDidChangeSelection(async ({ selection }) => {
      if (selection.length === 0) {
        return;
      }
      const item = selection[0];
      if (item.collapsibleState === 0) {
        const type = item.label.split(".").pop() as string;
        NoteExplorerProvider.fileTypeMap.get(type)?.selection(item);
      }
    });

    return noteExplorer;
  }
  getTreeItem(element: NoteItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: NoteItem) {
    if (!element) {
      const folders = vscode.workspace.workspaceFolders;
      if (folders?.length) {
        return folders.map((item) => {
          const rootPath = item.uri.fsPath;
          return new NoteItem({
            label: item.name,
            collapsibleState: 2,
            path: rootPath,
          });
        });
      }
    }
    if (element?.collapsibleState === 0) {
      return [];
    }
    if (element) {
      const dir = fs.opendirSync(element.path);
      const result = [];
      for await (const dirent of dir) {
        const name = dirent.name;

        const _path = path.join(element.path, dirent.name);

        if (!(await this.check(dirent, _path))) {
          continue;
        }

        // 如果是文件夹，要预检
        result.push(
          new NoteItem({
            label: name,
            collapsibleState: dirent.isFile() ? 0 : 1,
            path: _path,
          })
        );
      }
      // dir.close();
      return result;
    }
    return [];
  }
  async check(dirent: fs.Dirent, p: string) {
    const name = dirent.name;
    const fileArg = () => {
      const suffix = name.split(".").pop();
      if (!suffix) {
        return false;
      }
      return NoteExplorerProvider.fileTypeMap.has(suffix);
    };
    if (dirent.isFile() && fileArg()) {
      return true;
    }

    if (dirent.isDirectory()) {
      //   const dir = fs.opendirSync(p);
      //   const _p = dir.path;
      //   // 开始递归遍历，只要找到一个就行
      //   for await (const _dn of fs.opendirSync(p)) {
      //     if (await this.check(_dn, path.join(_p, _dn.name))) { return true; }
      //   };
      return true;
    }
    return false;
  }
}
class NoteItem extends vscode.TreeItem {
  public readonly label: string;
  // private version: string,
  public readonly collapsibleState: vscode.TreeItemCollapsibleState;
  public dir?: fs.Dir;
  public path: string;

  constructor(option: {
    label: string;
    collapsibleState: vscode.TreeItemCollapsibleState;
    dir?: fs.Dir;
    path: string;
  }) {
    super(option.label, option.collapsibleState);
    this.label = option.label;
    this.collapsibleState = option.collapsibleState;
    this.dir = option.dir;
    this.path = option.path;
    if (this.collapsibleState === 0) {
      // this.command = ;
      const type = this.label.split(".").pop() as string;
      this.iconPath = NoteExplorerProvider.fileTypeMap.get(type)?.icon;
    } else {
      this.iconPath = vscode.ThemeIcon.Folder;
    }
    // this.tooltip = `${this.label}-${this.version}`;
    // this.description = this.version;
  }

  // iconPath = {
  //   light: path.join(__filename, '..', '..', 'resources', 'light', 'NoteItem.svg'),
  //   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'NoteItem.svg')
  // };
}
