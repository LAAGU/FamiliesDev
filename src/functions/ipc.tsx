export function SEND(eventName: string, data: any = {}) {
    return window.ipcRenderer.send(eventName, data)
}

export async function INVOKE(eventName: string, ...args: any[]) {
  return await window.ipcRenderer.invoke(eventName, ...args);
}