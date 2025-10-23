import { useState } from "react"

export default function ToggleButton({
    tooltip,
    className,
    bool,
    setter,
    cooldown,
    colorChange

    } : {
        tooltip?:string,
        className?:string,
        bool:boolean,
        setter:(bool:boolean) => void,
        cooldown?:number,
        colorChange?:boolean
    }) {
      
    const [cooldownActive, setCooldownActive] = useState(false)

    function handleClick() {
        if (cooldownActive) return;
        setter(!bool)
        setCooldownActive(true)
        setTimeout(() => {
            setCooldownActive(false)
        }, cooldown || 500)
    }    


    return (
    <div onClick={handleClick} title={tooltip || "Toggle"} className={`${className} relative ${cooldownActive && "opacity-50"}`}>

      <div style={{right: bool ? "0" : "52%"}} className={`inner ${colorChange ? (bool ? "bg-green-400" : "bg-red-500") : "bg-bg/70"} top-[50%] transform translate-y-[-50%] absolute flex items-center justify-center h-full aspect-square`}>


      </div>
    </div>
  )
}
