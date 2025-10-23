import { useEffect, useState } from "react";
import { IpcRendererEvent } from 'electron';
import { useGlobal } from "../hooks/useGlobal";
import SmartImage from "./SmartImage";
import logo from "/logo.png"
function api(task : string,args : any = {}) {
  (window as any).ipcRenderer.send(task, { ...args });
}

export default function Frame() {

  const [isMaximized, setMaximized] = useState(false)
  const {frameText,frameTitle,frameLogo} = useGlobal();

  useEffect(() => {
    const handleWindowModified = (_: IpcRendererEvent, isMaximized: boolean) => {
      setMaximized(isMaximized);
    };
  
    window.ipcRenderer.on('windowModified', handleWindowModified);
  
    return () => {
      window.ipcRenderer.off('windowModified', handleWindowModified);
    };
  }, []);

  return (
    <div className='Frame z-50 sticky top-0 pr-2 flex items-center justify-between w-full h-8 overflow-hidden border-b-[1px] border-main-3/5 backdrop-blur-3xl'>
      <div key={frameText} className="left ml-1 flex items-center text-fore font-bold text-base animate-left-center gap-1">
        <SmartImage className=" h-6 aspect-square rounded-full" src={frameLogo} fallback={logo} />
        <div  className="text">{frameTitle}</div>
      </div>
      <div className="right flex items-center gap-3 text-fore text-base">
      <i title="Minimize" onClick={() => api('minimize')} className="fa-solid fa-circle text-base cursor-pointer transition-all text-yellow-200/90 hover:text-yellow-200/100"></i>  
      <i title={isMaximized ? "Restore" : "Maximize"} onClick={() => api('maximize')} className={`fa-solid fa-circle text-base cursor-pointer transition-all text-green-300/90 hover:text-green-300/100 ${isMaximized && "scale-75"}`}></i>
      <i title="Close" onClick={() => api('terminateApp')} className="fa-solid fa-circle h-full text-base cursor-pointer transition-all text-red-500/70 hover:text-red-500/100"></i>
      </div>
    </div>
  )
}
