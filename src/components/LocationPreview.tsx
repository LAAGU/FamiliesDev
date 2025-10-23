import { useEscape } from "../hooks/useEscape"
import SmartImage from "./SmartImage"
import defaultLocation from "/defaultLocation.jpg"

export default function LocationPreview({setPreview,data} : {setPreview : any, data : any}) {
  useEscape(()=> {
      setPreview({
        enabled: false,
        name: "",
        map: ""
      })    
    })   


  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 bg-black/30 flex flex-col items-center justify-center gap-5">
        <div onClick={()=> setPreview({enabled: false, name: "", image: ""})} className="exitbtn backdrop-blur-md absolute top-5 right-5 btn-d !text-xl !text-fore">
            <i className="fa-solid fa-circle-xmark"></i>
        </div>
        
        <div className="upper flex items-center justify-center w-full text-lg text-fore font-bold">
            <div className="code input-d !pl-5 !pr-5">{data?.name}</div>
        </div>
        <div className="previewImages flex items-center gap-5 min-w-[350px] w-[50%] h-[60%] overflow-hidden">
            <div className="img1 w-full h-full rounded overflow-hidden border-2 border-fore-2/20">
            <SmartImage fallback={defaultLocation} className="w-full h-full object-cover" src={data?.map}/>
            </div>
        </div>
    </div>
  )
}
