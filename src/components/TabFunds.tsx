import { IsStaff } from "../functions/dbhelper";
import { supabase } from "../functions/supabase";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import { sendFundNotification, sendLog } from "../functions/scripts";
import { useState } from "react";

export default function TabFunds({family} : {family : any}) {
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal(); 

 


  
  function handleAddFunds() {
    async function confirm() {
        if (!popupInputs?.current["add-funds-input"]) {
            setPopupInfo("Please enter a amount.")
            return
        }

        resetPopup()

        const oldValue = family?.funds?.total

        const {error} = await supabase
        .from("families")
        .update({funds:{...family?.funds,total:family?.funds?.total + Number(popupInputs?.current["add-funds-input"])}})
        .eq("name",family?.name)
        .maybeSingle()

        if (error) {
            console.error("Error updating family:", error);
            showPopup({
                title: "Error",
                description: "An error occurred while adding funds.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return
        }
        
        showPopup({
            title: "Success",
            description: "Funds added successfully.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            ...(popupInputs?.current["add-funds-reason"] ? {labelsArray: [
              {title: "Reason",text: popupInputs?.current["add-funds-reason"],className: "input-d"}
            ]} : {})
        })

        await sendLog(family,"Fund", {
          amount: Number(popupInputs?.current["add-funds-input"]),
          oldValue: oldValue,
          newValue: oldValue + Number(popupInputs?.current["add-funds-input"]),
          staffName: user?.name,
          staffUID: user?.uid,
          reason: popupInputs?.current["add-funds-reason"] || "Not Given."
        },"Funds Added",16776960)

        await sendFundNotification(family, {
          type: "add",
          amount: Number(popupInputs?.current["add-funds-input"]),
          total: oldValue + Number(popupInputs?.current["add-funds-input"]),
          reason: popupInputs?.current["add-funds-reason"]
        })
    }

    showPopup({
      title: "Add Funds",
      description: "Enter the amount of funds you want to add.",
      buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }, {text: "Confirm", onClick: confirm, className: "btn-g"}],
      inputsArray: [
        { title: "Amount", type: "number", placeholder: "Amount", name: "add-funds-input", className: "input-d" },
        { title: "Reason ( Optional )", type: "text", placeholder: "Reason for adding funds", name: "add-funds-reason", className: "input-d" }
      ]
    })
  }

  function handleRemoveFunds() {
    async function confirm() {
        if (!popupInputs?.current["remove-funds-input"]) {
            setPopupInfo("Please enter a amount.")
            return
        }

        resetPopup()

        const oldValue = family?.funds?.total

        const {error} = await supabase
        .from("families")
        .update({funds:{...family?.funds,total:family?.funds?.total - Number(popupInputs?.current["remove-funds-input"])}})
        .eq("name",family?.name)
        .maybeSingle()

        if (error) {
            console.error("Error updating family:", error);
            showPopup({
                title: "Error",
                description: "An error occurred while removing funds.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return
        }
        
        showPopup({
            title: "Success",
            description: "Funds removed successfully.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            ...(popupInputs?.current["remove-funds-reason"] ? {labelsArray: [
              {title: "Reason",text: popupInputs?.current["remove-funds-reason"],className: "input-d"}
            ]} : {})
        })

        await sendLog(family,"Fund", {
          amount: Number(popupInputs?.current["remove-funds-input"]),
          oldValue: oldValue,
          newValue: oldValue - Number(popupInputs?.current["remove-funds-input"]),
          staffName: user?.name,
          staffUID: user?.uid,
          reason: popupInputs?.current["remove-funds-reason"] || "Not Given."
        },"Funds Removed",16725248)

        await sendFundNotification(family, {
          type: "remove",
          amount: Number(popupInputs?.current["remove-funds-input"]),
          total: oldValue - Number(popupInputs?.current["remove-funds-input"]),
          reason: popupInputs?.current["remove-funds-reason"]
        })  
    }

    showPopup({
      title: "Remove Funds",
      description: "Enter the amount of funds you want to remove.",
      buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }, {text: "Confirm", onClick: confirm, className: "btn-g"}],
      inputsArray: [
        { title: "Amount", type: "number", placeholder: "Amount", name: "remove-funds-input", className: "input-d" },
        { title: "Reason ( Optional )", type: "text", placeholder: "Reason for removing funds", name: "remove-funds-reason", className: "input-d" }
      ]
      
    })

    
  }

  function handleAddUserFunds(uid: string) {
    async function confirm() {
        if (!popupInputs?.current["add-user-funds-input"]) {
            setPopupInfo("Please enter a amount.")
            return
        }

        resetPopup()

        const oldValue = family?.funds?.total
        const oldUserValue = family?.funds?.users?.[uid]

        const {error} = await supabase
        .from("families")
        .update({funds:{
            ...family?.funds,
            total:family?.funds?.total + Number(popupInputs?.current["add-user-funds-input"]),
            users: {
                ...family?.funds?.users,
                [uid]: (family?.funds?.users?.[uid] || 0) + Number(popupInputs?.current["add-user-funds-input"])}}})
        .eq("name",family?.name)
        .maybeSingle()

        if (error) {
            console.error("Error updating family:", error);
            showPopup({
                title: "Error",
                description: "An error occurred while adding funds.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return
        }
        
        showPopup({ 
            title: "Success",
            description: "Funds added successfully form this user.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })

        await sendLog(family,"Fund", {
          amount: Number(popupInputs?.current["add-user-funds-input"]),
          oldValue: oldValue,
          newValue: oldValue + Number(popupInputs?.current["add-user-funds-input"]),
          oldUserValue: oldUserValue,
          newUserValue: oldUserValue + Number(popupInputs?.current["add-user-funds-input"]),
          userID: uid,
          staffName: user?.name,
          staffUID: user?.uid,  
        },"User Funds Modified",16739182)
      
      await sendFundNotification(family, {
        type: Number(popupInputs?.current["add-user-funds-input"]) < 0 ? "remove" : "add",
        targetName: uid,
        amount: Number(popupInputs?.current["add-user-funds-input"]) < 0 ? Math.abs(Number(popupInputs?.current["add-user-funds-input"])) : Number(popupInputs?.current["add-user-funds-input"]),
        total: Number(popupInputs?.current["add-user-funds-input"]) < 0 ? Math.abs(oldValue + Number(popupInputs?.current["add-user-funds-input"])) : oldValue + Number(popupInputs?.current["add-user-funds-input"])
      })
    }

    showPopup({
      title: "Modify User Funds",
      description: "Enter the amount of funds you want to modify from this user.",
      buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }, {text: "Confirm", onClick: confirm, className: "btn-g"}],
      inputsArray: [{ title: "Amount", type: "number", placeholder: "-20 / 20", name: "add-user-funds-input", className: "input-d" }]
    })
  }

  function handleAddUser() {
    async function confirm() {
      
      if (!popupInputs?.current["funds-add-user-input"]) {
        setPopupInfo("Please enter a username.")
        return
      }

      if (family?.funds?.users?.[popupInputs?.current["funds-add-user-input"]]) {
        setPopupInfo("User already exists.")
        return
      }

      resetPopup()

      const {error} = await supabase
      .from("families")
      .update({funds:{...family?.funds, users: {...family?.funds?.users, [popupInputs?.current["funds-add-user-input"]]: 0}}})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        console.error("Error updating family:", error);
        showPopup({
          title: "Error",
          description: "An error occurred while adding funds.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return
      }

      showPopup({
        title: "Success",
        description: "User added successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

       sendLog(family,"Fund", {
        name: popupInputs?.current["funds-add-user-input"],
        staffName: user?.name,
        staffUID: user?.uid
       },"User Added",3093151)
    }

    if (Object.keys(family?.funds?.users || {}).length >= 40) {
      showPopup({
        title: "Error",
        description: "You cannot have more than 40 users.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return
    }

    showPopup({
      title: "Add User",
      description: "Enter the username of the user you want to add.",
      buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }, {text: "Confirm", onClick: confirm, className: "btn-g"}],
      inputsArray: [{ title: "Username", type: "text", placeholder: "Username", name: "funds-add-user-input", className: "input-d" }]
    })
  }

  function handleDeleteUser(key: string) {
    async function confirm() {
      resetPopup()

      delete family?.funds?.users?.[key]

      const {error} = await supabase
      .from("families")
      .update({funds:{...family?.funds, users: family?.funds?.users}})
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        console.error("Error updating family:", error);
        showPopup({
          title: "Error",
          description: "An error occurred while adding funds.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })

        return
      }

      showPopup({ 
        title: "Success",
        description: "User deleted successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Fund", {
        name: key,
        staffName: user?.name,
        staffUID: user?.uid
       },"User Deleted",16739182)
     
    }

    showPopup({
      title: "Delete User",
      description: "Are you sure you want to delete this user?",
      buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }, {text: "Confirm", onClick: confirm, className: "btn-g"}],
    })
  }

  const [search, setSearch] = useState("")

  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden shadow relative flex items-center justify-center">
     <div className="taskBox flex flex-col gap-3 !p-4 overflow-y-auto backdrop-blur-md min-w-[300px] w-[100%] max-w-[100%] h-[100%] input-d !border-none !rounded-none">
       <div className="upper flex items-center gap-2">
       <div className="label input-d text-nowrap !p-2">Total Money</div>
       <div className="sep-y !bg-fore/10"></div>  
       <div className="fundsvalue w-full input-d !p-2">${family?.funds?.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
       {IsStaff(family,user) && <div onClick={handleRemoveFunds} className="plusicon bg-red-600/20 hover:bg-red-600/30 !w-max rounded text-white text-base p-2 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all"><i className="fa-regular fa-minus"></i></div>} 
       {IsStaff(family,user) && <div onClick={handleAddFunds} className="plusicon !w-max rounded text-white text-base bg-green-300/20 hover:bg-green-300/30 p-2 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all"><i className="fa-regular fa-plus"></i></div>}
       {IsStaff(family,user) && <div onClick={handleAddUser} className="plusicon !w-max rounded text-white text-base bg-green-300/20 hover:bg-green-300/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all"><i className="fa-regular fa-user-plus"></i></div>}      
       </div>
       <input onChange={(e) => setSearch(e.target.value)} className="input-d w-1/3 ml-auto" placeholder="Search by name..." type="text" />
       <div className="lower flex-1 w-full bg-fore-2/2 rounded overflow-y-auto flex flex-col gap-3 p-2">
       {Object.keys(family?.funds?.users || {})
         .filter((key) => key.toLowerCase().includes(search.toLowerCase()))
         .sort((a, b) => a.localeCompare(b))
         .map((key, index : number) => {
           return IsStaff(family, user) ? (
            <div style={{ "--index":  `${index / 10}s`} as any} key={key} className={`user animte-listViewItemsAnimate w-full grid [grid-template-columns:_3fr_1fr_1fr_1fr] gap-5 items-center input-d !p-2 text-ellipsis`}><div className="name">{key}</div> <i className="fa-solid fa-arrow-right"></i> ${family?.funds?.users?.[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {IsStaff(family,user) && <div className="flex items-center justify-end gap-2"><i onClick={() => handleAddUserFunds(key)} className="fa-regular fa-function !text-base !pl-2 !pr-2 btn-g"></i><i onClick={() => handleDeleteUser(key)} className="fa-regular fa-trash !text-sm !pl-2 !pr-2 btn-r"></i></div>}</div>
           ): 
           (<div style={{ "--index":  `${index / 10}s`} as any} key={key} className={`user animte-listViewItemsAnimate w-full grid [grid-template-columns:_3fr_1fr_1fr] gap-5 items-center input-d !p-2 text-ellipsis`}><div className="name">{key}</div> <i className="fa-solid fa-arrow-right"></i> <div className="amount text-end">${family?.funds?.users?.[key].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div></div>)
         })}
       </div>
     </div>
    </div>
  )
}
