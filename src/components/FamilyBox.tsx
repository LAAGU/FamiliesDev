import { GetTotalMembers } from "../functions/dbhelper";
import SmartImage from "./SmartImage";


export default function FamilyBox({data,index,click} : {data : any, index : number, click : () => void}) {

  



  return (
    <div onClick={click} style={{
      "--family-color": data?.color 
        ? `color-mix(in srgb, ${data?.color}, transparent 95%)`
        : "var(--main4)",
      "--index": `${0.1 + index / 5}s`,
    } as any} 
      className={`familyBox animate-familyBox cursor-pointer flex flex-col rounded p-3 pb-1 w-[clamp(min(150px,100%),100%,250px)]`}>
      <div className="logo overflow-hidden aspect-square rounded self-center w-full h-full">
        <SmartImage className="object-cover w-full h-full object-center" src={data?.logoUrl} fallback="defaultFamily.jpg" />
      </div>
      <div style={{color: data?.color ? `${data?.color}` : "var(--bg)"}} className="name text-lg font-bold text-center mt-auto">{data?.name}</div>
      <div style={{color: data?.color ? `color-mix(in srgb, ${data?.color}, transparent 45%)` : "var(--fore)"}} className="members text-base text-center tracking-widest">{GetTotalMembers(data)}/{data?.maxMembers}</div>
    </div>
  )
}
