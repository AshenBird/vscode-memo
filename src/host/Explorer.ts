import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

const fileTypes = ["md"];

export class NoteExplorerProvider implements vscode.TreeDataProvider<NoteItem> {
  constructor() {
    // console.log(extensions);
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
    const fileArg = () =>
      fileTypes.some((item) => {
        return name.endsWith(`.${item}`);
      });

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
const iconMap:Record<string,vscode.ThemeIcon> = {
  ".md":new vscode.ThemeIcon("markdown")
};
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
      for (const [type, icon] of Object.entries(iconMap)) {
        if(!this.label.endsWith(type)){continue;}
        this.iconPath = icon;
        break;
      }
    }else{
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
