import { ref, provide } from "vue";

// @ts-ignore
const vscode = acquireVsCodeApi();
export const usePostMessage = ()=>{
  
  const data = ref<{memo:unknown[], todo:unknown[]}>({
    memo:[],
    todo:[]
  });
  const config = ref<Record<string,unknown>>({});
  provide("config",config);
  provide("data", data);
  const onMessage = (ev:MessageEvent)=>{
    const { name, payload } = ev.data as {
      name:"config"|"memo"|"todo",
      payload:any
    };
    console.log(name,payload);
    ({
      config(){
        config.value = payload;
      },
      memo(){
        data.value.memo = payload||[];
      },
      todo(){
        data.value.todo = payload||[];
      }
    }[name])();
  };

  const send = (type:string, data:any ="")=>{
    vscode.postMessage({
      type,
      data
    });
  };
  window.addEventListener("message",onMessage);
  return {data, config, send};
};