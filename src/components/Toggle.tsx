


export default function Toggle({style,className,title,description,active, onClick, outerClick, rounded}:{style?:React.CSSProperties,className?:string,title:string,description?:string,active:boolean,onClick:()=>void,outerClick?:boolean,rounded?:boolean}) {
  return (
    <div onClick={outerClick ? onClick : ()=> null} style={{...style,...{cursor: outerClick ? "pointer" : "default"}}} className={`w-full relative flex items-center justify-between gap-2 p-2 text-sm transition-all hover:brightness-125 ${className} ${rounded ? "rounded" : ""}`}>
      <div className="flex flex-col gap-1 relative">
        <div className="font-straight tracking-widest">{title}</div>
        <div className="opacity-95 text-xs">{description || ""}</div>
      </div>

      <div onClick={!outerClick ? onClick : ()=> null} style={{cursor: !outerClick ? "pointer" : "unset"}} className={`h-8 aspect-2/1 relative p-2 ${rounded ? "rounded" : ""} bg-main-2/30 mr-2`}>
        <div style={{marginLeft: active ? "50%" : "0"}} className={`w-1/2 h-full transition-all ${rounded ? "rounded" : ""} ${!active ? "bg-main/20" : "bg-main/50"}`}></div>
      </div>
    </div>
  )
}
