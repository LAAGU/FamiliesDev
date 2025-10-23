import { useEscape } from "../hooks/useEscape"
import SmartImage from "./SmartImage"
import defaultOutfit from "/defaultOutfit.avif"

export default function OutfitPreview({setPreview,data} : {setPreview : any, data : any}) {
  useEscape(()=> {
      setPreview({
        enabled: false,
        url: "",
        url_2: "",
        code:""
      })    
    })   


  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 bg-black/30 flex flex-col items-center justify-center gap-5">
        <div onClick={()=> setPreview({enabled: false, url: "", url_2: "", code:""})} className="exitbtn backdrop-blur-md absolute top-5 right-5 btn-d !text-xl !text-fore">
            <i className="fa-solid fa-circle-xmark"></i>
        </div>
        
        <div className="upper flex items-center justify-center w-full text-lg text-fore font-bold">
            <div className="code input-d !pl-5 !pr-5">{data?.code}</div>
        </div>
        <div className="previewImages flex items-center gap-5 min-w-[350px] w-[50%] h-[60%] overflow-hidden">
            <div className="img1 w-full h-full rounded overflow-hidden border-2 border-fore-2/20">
            <SmartImage fallback={defaultOutfit} className="w-full h-full object-cover" src={data?.url}/>
            </div>
            
            <div className="img2 w-full h-full rounded overflow-hidden border-2 border-fore-2/20">
            <SmartImage fallback={defaultOutfit} className="w-full h-full object-cover" src={data?.url_2}/>
            </div>
        </div>
    </div>
  )
}
