import {env} from "vscode";
import { exec } from "child_process";
import { EventEmitter } from "stream";
export const snip = ()=>{
  return exec("explorer ms-screenclip:");
};

export class SnipEmitter extends EventEmitter{
  private timer?:NodeJS.Timeout;
  private oldContent:string="";
  constructor(){
    super();
    this.begin();
  }
  async begin(){
    this.oldContent = await env.clipboard.readText();
    this.timer = setInterval( async ()=>{
      console.log("listening");
      const currentContent = await env.clipboard.readText();
      console.log(currentContent, this.oldContent);
      if(currentContent!==this.oldContent){
        console.log("change");
        this.emit("change", currentContent );
        this.oldContent = currentContent;
      }
    },300);
  }
  close(){
    if(this.timer){
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}