import { useState } from "react";
import { usePopup } from "../hooks/usePopup";
import { useGlobal } from "../hooks/useGlobal";
import { supabase } from "../functions/supabase";
import { IsStaff } from "../functions/dbhelper";
import { sendLineupNotification, sendLog } from "../functions/scripts";

export default function TabLineup({family} : {family : any}) {
  const [searchInput, setSearchInput] = useState("");

  
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal(); 
    

  
  
  function handleDeleteLineup(name: string) {
    async function confirm() {
      resetPopup()

      const userTag = family?.lineup[name];

      const Copy = {...family?.lineup};

      delete Copy[name];

      const { error } = await supabase
        .from("families")
        .update({ lineup: { ...Copy } })
        .eq("name", family?.name)
        .maybeSingle();
      
      if (error) {
        showPopup({
          title: "Error",
          description: "An error occurred while removing this member from the family list.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
      }
      
      showPopup({
        title: "Success",
        description: "Member removed from family list.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      await sendLineupNotification(family, {...Copy})   
      await sendLog(family,"Family List", {
        lineupName: name,
        lineupTag: userTag,
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family List User Removed",16711680)
    }

    showPopup({
      title: "Delete Member",
      description: "Are you sure you want to remove this member from the Family List?",
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Delete", onClick: confirm, className: "btn-r" },
      ],
    })
  }

  function handleAddMember() {
    async function confirm() {
      if (!popupInputs?.current["add-lineup-name-input"]) {
        setPopupInfo("Please enter a username.")
        return
      }

      if (!popupInputs?.current["add-lineup-tag-input"]) {
        setPopupInfo("Please enter a tag.")
        return
      }

      if (Object.keys(family?.lineup).includes(popupInputs?.current["add-lineup-name-input"])) {
        setPopupInfo("This name is already in the family list.")
        return
      }

      resetPopup()

      const {error} = await supabase
      .from("families")
      .update({lineup:{...family?.lineup,[popupInputs?.current["add-lineup-name-input"]]:popupInputs?.current["add-lineup-tag-input"]}})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        showPopup({
          title: "Error",
          description: "An error occurred while adding this member to the family list.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return
      }
      
      showPopup({
          title: "Success",
          description: "Member added to family list.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
      
      await sendLineupNotification(family, {...family?.lineup,[popupInputs?.current["add-lineup-name-input"]]:popupInputs?.current["add-lineup-tag-input"]})    

      await sendLog(family,"Family List", {
        lineupName: popupInputs?.current["add-lineup-name-input"],
        lineupTag: popupInputs?.current["add-lineup-tag-input"],
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family List User Added",5701887)
    }

    if (Object.keys(family?.lineup).length >= 15) {
      showPopup({
        title: "Error",
        description: "The max Family List limit has been reached (15).",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }

    showPopup({
      title: "Add Member",
      description: "Enter the info of the member you want to add to the Family List.",
      inputsArray: [
        { maxLength:25, title: "User Name", className: "input-d", type: "text", name: "add-lineup-name-input", placeholder: "Username"},
        { maxLength:15, title: "User Tag", className:"input-d", type: "text", name: "add-lineup-tag-input", placeholder: "shooter , grinder...." },
      ],
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Add", onClick: confirm, className: "btn-g" },
      ]
    })
}

  function modifyLineupTag(name: string) {
    async function confirm() {

      if (popupInputs?.current["modify-lineup-tag-input"] === family?.lineup[name]) {
        setPopupInfo("Nothing changed.")
        return
      }

      if (!popupInputs?.current["modify-lineup-tag-input"]) {
        setPopupInfo("Please enter a tag.")
        return
      }
      resetPopup()

      const oldTag = family?.lineup[name];

      const {error} = await supabase
      .from("families")
      .update({lineup:{...family?.lineup,[name]:popupInputs?.current["modify-lineup-tag-input"]}})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        showPopup({
          title: "Error",
          description: "An error occurred while modifying this member's tag.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return
      }
      
      showPopup({
          title: "Success",
          description: "Member's tag modified.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
      
      await sendLineupNotification(family, {...family?.lineup,[name]:popupInputs?.current["modify-lineup-tag-input"]})  
      
      await sendLog(family,"Family List", {
        lineupName: name,
        oldTag:oldTag, 
        newTag: popupInputs?.current["modify-lineup-tag-input"],
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family List User Tag Modified",5701693)
    }

    popupInputs.current = {
      ...popupInputs.current,
      "modify-lineup-tag-input": family?.lineup[name]
    }

    showPopup({
      title: "Modify Tag",
      description: "Enter the new tag for this member.",
      inputsArray: [
        { maxLength:15, defaultValue: family?.lineup[name], title: "User Tag", className:"input-d", type: "text", name: "modify-lineup-tag-input", placeholder: "shooter , grinder...." },
      ],
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Modify", onClick: confirm, className: "btn-g" },
      ]

    })
  }


  function modifyLineupName(key:string) {
    async function confirm() {

      if (popupInputs?.current["modify-lineup-name-input"] === key) {
        setPopupInfo("Nothing changed.")
        return
      }

      if (!popupInputs?.current["modify-lineup-name-input"]) {
        setPopupInfo("Please enter a name.")
        return
      }
      resetPopup()

      const oldData = family?.lineup;
      const oldUserData = family?.lineup[key];
      delete oldData[key];

      const newData = {...oldData,[popupInputs?.current["modify-lineup-name-input"]]:oldUserData};

      const {error} = await supabase
      .from("families")
      .update({lineup:newData})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        showPopup({
          title: "Error",
          description: "An error occurred while modifying this member's name.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return
      }

      showPopup({
          title: "Success",
          description: "Member's name modified.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
      
      await sendLineupNotification(family, newData)
      
      await sendLog(family,"Family List", {
        newName: popupInputs?.current["modify-lineup-name-input"],
        oldName: key,
        Tag: oldUserData,
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family List User Name Modified",5701693)




    }

    popupInputs.current = {
      ...popupInputs.current,
      "modify-lineup-name-input": key
    }

    showPopup({
      title: "Modify Name",
      description: "Enter the new name for this member.",
      inputsArray: [
        { maxLength:25, defaultValue: key, title: "User Name", className:"input-d", type: "text", name: "modify-lineup-name-input", placeholder: "shooter , grinder...." },
      ],
      buttonsArray: [
        { text: "Cancel", onClick: resetPopup, className: "btn-d" },
        { text: "Modify", onClick: confirm, className: "btn-g" },
      ]

    })
  }

  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden shadow relative flex flex-col items-center justify-center">
      <div className="search flex w-full sticky top-0 input-d !border-none !rounded-none">
        <input onChange={(e) => setSearchInput(e.target.value)} type="text" className="w-full" placeholder="Search by name or tag" />
        {IsStaff(family,user) && <button onClick={handleAddMember} title="Add member to Family List" className="btn-g"><i className="fa-solid fa-plus"></i></button>}
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto backdrop-blur-md min-w-[300px] w-[100%] max-w-[100%] h-[100%] input-d !p-2 !rounded-none">
        {Object?.keys(family?.lineup || {}).sort((a, b) => a?.localeCompare(b))?.filter((user) => user?.toLowerCase().includes(searchInput?.toLowerCase()) || family?.lineup[user]?.toLowerCase()?.includes(searchInput.toLowerCase()))?.map((name,index) => (
          <div style={{ "--index":  `${index / 10}s`} as any} key={name} className="input-d animte-listViewItemsAnimate flex items-center !p-2">
            <div className="upper w-full grid grid-cols-3">
            <div className="name">{index+1}. {name}</div>
            <div className="tag text-sm flex items-center justify-center">{family?.lineup[name]}</div>
            {IsStaff(family,user) && <div className="btns flex items-center gap-2 ml-auto">
              <div onClick={()=> modifyLineupName(name)} title="Edit username" className="btn-g"><i className="fa-solid fa-pen-to-square"></i></div>
              <div onClick={()=> modifyLineupTag(name)} title="Edit user tag" className="btn-g"><i className="fa-solid fa-user-tag"></i></div>
              <div onClick={() => handleDeleteLineup(name)} title="Remove user from Family List" className="btn-r"><i className="fa-solid fa-trash"></i></div>
            </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
