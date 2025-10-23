
import { SEND } from "../functions/ipc";


export default function WaterMark({className} : {className? : string | null}) {
  return (
    <div className={`text-base ${className} text-main-3/20 watermark flex flex-col gap-2 items-center`}>
      <div className="text">Created by Sukrit Thakur or LAAGU#2351 on discord.</div>
      <i onClick={()=> SEND("joinDiscord")} className="fa-brands fa-discord cursor-pointer transition-all hover:text-bg"></i>
    </div>
  )
}

