import { useState } from "react";
import { supabase } from "../functions/supabase";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import CopyableLabel from "./CopyableLabel";
import SmartImage from "./SmartImage";
import OutfitPreview from "./OutfitPreview";
import defaultOutfit from "/defaultOutfit.avif"
import { IsStaff } from "../functions/dbhelper";
import { sendLog } from "../functions/scripts";

export default function TabOutfits({family} : {family : any}) {
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal();
  
  const [preview, setPreview] = useState({
    enabled: false,
    url: "",
    url_2: "",
    code:""
  });

  
    
  function handleAddOutfit() {
    if (!IsStaff(family,user)) return
    if (Object.keys(family?.outfits).length >= 5) {
      showPopup({
        title: "Error",
        description: "You have reached the maximum number of outfits that is 5, To add more first delete the old ones.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }

    async function confirm() {
        if (!popupInputs?.current["add-outfit-name-input"]) {
            setPopupInfo("Please enter a outfit name.")
            return
        }
        if (!popupInputs?.current["add-outfit-code-input"]) {
            setPopupInfo("Please enter a outfit code.")
            return
        }
        if (!popupInputs?.current["add-outfit-thumbnail-input"]) {
            setPopupInfo("Please enter a outfit thumbnail url.")
            return
        }
        if (!popupInputs?.current["add-outfit-preview1-input"]) {
            setPopupInfo("Preview url is missing.")
            return
        }
        if (!popupInputs?.current["add-outfit-preview2-input"]) {
            setPopupInfo("Preview url is missing.")
            return
        }

        if (family?.outfits[popupInputs?.current["add-outfit-name-input"]]) {
            setPopupInfo(`Outfit with the name ${popupInputs?.current["add-outfit-name-input"]} already exists.`)
            return  
        }

        const outfitData = {
          name : popupInputs?.current["add-outfit-name-input"],
          code : popupInputs?.current["add-outfit-code-input"],
          thumbnail : popupInputs?.current["add-outfit-thumbnail-input"],
          preview_1 : popupInputs?.current["add-outfit-preview1-input"],
          preview_2 : popupInputs?.current["add-outfit-preview2-input"]
        }

        resetPopup()

        const {error} = await supabase
        .from("families")
        .update({outfits: {...family?.outfits,
            [popupInputs?.current["add-outfit-name-input"]]: {
                code: popupInputs?.current["add-outfit-code-input"],
                thumbnail: popupInputs?.current["add-outfit-thumbnail-input"],
                preview_1: popupInputs?.current["add-outfit-preview1-input"],
                preview_2: popupInputs?.current["add-outfit-preview2-input"]
            }
        }})
        .eq("name",family?.name)
        .maybeSingle()

        if (error) {
            console.log(error)
            showPopup({
                title: "Error",
                description: "There was an error.",
                buttonsArray: [
                    {text: "close", className: "btn-d", onClick: resetPopup}
                ]
            })
            return
        }

        showPopup({
            title: "Outfit Added",
            description: "The outfit was added Successfully.",
            buttonsArray: [
                {text: "close", className: "btn-d", onClick: resetPopup}
            ]
        })

        await sendLog(family,"Outfit", {
                ...outfitData,
                staffName: user?.name,
                staffUID: user?.uid,
              },"Outfit Added",7899647)
    }

    showPopup({
      title: "Add Outfit",
      description: "Add an outfit to the outfit list by setting the bellow values.",
      inputsArray: [
        {title: "Outfit Name",type:"text", className: "input-d", name: "add-outfit-name-input"},
        {title: "Outfit Code",type: "text", className: "input-d", name: "add-outfit-code-input", maxLength:120},
        {title: "Thumbnail Image Url", type: "text", className: "input-d", name: "add-outfit-thumbnail-input"},
        {title: "1. Preview Image Url", type: "text", className: "input-d", name: "add-outfit-preview1-input"},
        {title: "2. Preview Image Url", type: "text", className: "input-d", name: "add-outfit-preview2-input"},
      ],
      buttonsArray: [
        {text: "Close", onClick: resetPopup, className: "btn-d"},
        {text: "Create", onClick:confirm, className: "btn-g"}
      ]
    })
  }
  
  function handleDeleteOutfit(key: string) {
    if (!IsStaff(family,user)) return
    async function confirm() {
      resetPopup()
  
      const updatedOutfits = { ...family?.outfits }
  
      delete updatedOutfits[key]
  
      const { error } = await supabase
        .from("families")
        .update({ outfits: updatedOutfits })
        .eq("name", family?.name)
        .maybeSingle()
  
      if (error) {
        console.log(error)
        showPopup({
          title: "Error",
          description: "There was an error.",
          buttonsArray: [
            { text: "close", className: "btn-d", onClick: resetPopup }
          ]
        })
        return
      }
  
      showPopup({
        title: "Outfit Deleted",
        description: "The outfit was deleted successfully.",
        buttonsArray: [
          { text: "close", className: "btn-d", onClick: resetPopup }
        ]
      })

      await sendLog(family,"Outfit", {
        outfitName: key,
        staffName: user?.name,
        staffUID: user?.uid,
      },"Outfit Deleted",16711680)
    }
  
    showPopup({
      title: "Delete Outfit",
      description: "Are you sure you want to delete this outfit?",
      buttonsArray: [
        { text: "Close", onClick: resetPopup, className: "btn-d" },
        { text: "Delete", onClick: confirm, className: "btn-r" }
      ]
    })
  }


  return (
    <div className="w-full h-full min-h-[300px] overflow-x-hidden shadow relative flex p-5 flex-wrap content-start gap-2">
      {(IsStaff(family,user) && !preview?.enabled) && <div onClick={handleAddOutfit} className="plusicon z-10 absolute right-5 top-5 !w-max rounded text-white text-base bg-main-4/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-regular fa-plus"></i></div>}

      {preview?.enabled && (
        <OutfitPreview data={preview} setPreview={setPreview}/>
      )}

      {family?.outfits && Object.keys(family?.outfits).map((outfitName: string) => (
       <div key={outfitName} className="cursor-pointer border-1 border-fore-2/20 bg-fore-2/5 overflow-hidden rounded flex flex-col w-[clamp(min(200px,100%),20%,300px)]">
          <SmartImage fallback={defaultOutfit} className="w-full h-[200px] object-cover" src={family?.outfits[outfitName]?.thumbnail}/>
          <div className="name text-lg text-center font-bold text-fore-2 tracking-widest">{outfitName}</div>
          <div className="buttons p-2 flex gap-3 items-center justify-between">
            <button onClick={() => setPreview({
              enabled: true,
              url: family?.outfits[outfitName]?.preview_1,
              url_2: family?.outfits[outfitName]?.preview_2,
              code: family?.outfits[outfitName]?.code
            })} title="Preview Outfit" className="w-full btn-g"><i className="fa-solid fa-eye"></i></button>
            <CopyableLabel tooltip={"Copy outfit code to clipboard"} className="btn-g w-full text-center" label={
              { 
                canCopy:true,
                text:family?.outfits[outfitName]?.code,
              }
              }/>
            {IsStaff(family,user) && <button onClick={()=> handleDeleteOutfit(outfitName)} title="Delete Outfit" className="w-full btn-r"><i className="fa-solid fa-trash"></i></button>}
          </div>
       </div> 
      ))}
    </div>
  )
}
