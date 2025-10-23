import { useGlobal } from "../hooks/useGlobal";
import WaterMark from "./WaterMark";

export default function HeavyLoader() {
  const {heavyText,updateData} = useGlobal();  


  return (
    <div className="w-screen z-40 h-[calc(100vh-28px)] flex flex-col gap-3 items-center justify-center bg-window">
      {!updateData?.status && (
        <div className="heavy_loader w-[clamp(80px,10vw,150px)] aspect-square rounded-full flex items-center justify-center">
        </div>
      )}
      
      <div className="title text-xl text-bg capitalize font-bold flex flex-col items-center justify-center relative">
        {!updateData?.status && <div className="text">{heavyText}</div>}


        {updateData?.status && (
          <div className="progress overflow-hidden relative min-w-[400px] w-[30vw] h-10 btn-d !bg-main-2/20 !hover:bg-main-2/20 !cursor-default rounded mb-2 !p-0">
            <div style={{ width: `${updateData?.info?.progress?.percent}%`, transition: "width 0.5s ease-in-out" }} className="bar -z-1 absolute left-0 top-0 h-full bg-main/10"></div>
            <div className="inner mt-0.5 w-full h-full relative z-1 flex items-center justify-between text-main-3 text-sm pl-2 pr-2">
              <div className="transferred">{updateData?.info?.progress?.transferred}</div>
              <div className="speed">{updateData?.info?.progress?.speed}/s</div>
              <div className="total">{updateData?.info?.progress?.total}</div>
            </div>
          </div>
        )}

        {updateData?.status && <div className="text uppercase text-base">Updating to {updateData?.info?.version || "Latest Version"}</div>}
      </div>
      <WaterMark/>
    </div>
  )
}
