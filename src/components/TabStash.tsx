import { useEffect, useState } from "react";
import { IsStaff } from "../functions/dbhelper";
import { supabase } from "../functions/supabase";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import { isValidUrl, sendLog, sendStashNotification, sendStashUpdate } from "../functions/scripts";
import defaultItem from "/defaultItem.png"
import SmartImage from "./SmartImage";

export default function TabStash({ family }: { family: any }) {
    const { showPopup, resetPopup } = usePopup();
    const { popupInputs, user, setPopupInfo } = useGlobal();

    const [totalItems, setTotalItems] = useState(0);

    const [filteringBy, setFilteringBy] = useState(
        localStorage.getItem("stash-filteringBy") || "name"
    )
    const [searchInput, setSearchInput] = useState("")

    useEffect(() => {
        let total = 0
        Object.keys(family?.stash).forEach((key: string) => {
            const item = family?.stash[key]
            if (item?.amount) {
                total += item.amount
            }
        })

        setTotalItems(total)
    }, [family?.stash])


    function setFilterBy(type: string) {
        setFilteringBy(type)
        localStorage.setItem("stash-filteringBy", type)
    }

    function handleCreateItem() {
        async function confirm() {
            const name = popupInputs.current["stash-create-item-name-input"]
            const logo = popupInputs.current["stash-create-item-logo-input"]

            const oldStash = family?.stash || {}

            if (!name) {
                setPopupInfo("Item name is required.", "red")
                return
            }

            if (family?.stash[name]) {
                setPopupInfo("Item already exists.", "red")
                return
            }

            if (logo && !isValidUrl(logo)) {
                setPopupInfo("Logo url is not valid.", "red")
                return
            }

            const { error } = await supabase
                .from("families")
                .update({ stash: { ...family.stash, [name]: { logo: logo || "", amount: 0 } } })
                .eq("name", family.name)
                .maybeSingle()
            if (error) {
                setPopupInfo("Error creating item.", "red")
                return
            }

            resetPopup()

            showPopup({
                title: "Success",
                description: "Item created successfully.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })

            sendLog(family, `stash`, {
                name: name,
                logo: logo || "Not Set",
                oldStash: oldStash,
                newStash: { ...oldStash, [name]: { logo: logo || "", amount: 0 } },
                staffName: user?.name,
                staffUID: user?.uid,
            }, "Item Created", 3093090)

            await sendStashUpdate({...family, stash: { ...oldStash, [name]: { logo: logo || "", amount: 0 } } })
        }

        if (Object.keys(family?.stash).length >= 25) {
            showPopup({
                title: "Error",
                description: "You cannot have more than 25 items.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return
        }

        showPopup({
            title: "Create Item",
            description: "To create a new item enter the details bellow.",
            inputsArray: [
                { name: "stash-create-item-name-input", title: "Item Name", type: "text", className: "input-d", maxLength: 25, placeholder: "item name..." },
                { name: "stash-create-item-logo-input", title: "Item Logo Url", type: "text", className: "input-d", placeholder: "( Optional ) logo url..." },
            ],
            buttonsArray: [
                { text: "Close", className: "btn-d", onClick: resetPopup },
                { text: "Create", className: "btn-g", onClick: confirm },
            ]
        })
    }

    function handleIncrementItem(key: string) {
        async function confirm() {

            const reason = popupInputs.current["stash-increment-item-reason-input"]
            const amount = parseInt(popupInputs.current["stash-increment-item-amount-input"])

            const oldStash = family?.stash || {}

            if (!amount || amount <= 0) {
                setPopupInfo("Positive amount is required.", "red")
                return
            }
            
            const { error } = await supabase
                .from("families")
                .update({ stash: { ...family.stash, [key]: { ...family.stash[key], amount: (family.stash[key]?.amount || 0) + amount } } })
                .eq("name", family.name)
                .maybeSingle()
            if (error) {
                setPopupInfo("Error incrementing item.", "red")
                return
            }

            resetPopup()

            showPopup({
                title: "Success",
                description: "Item incremented successfully.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            
            await sendLog(family, `stash`, {
                name: key,
                reason: reason || "Not Given",
                amount: amount,
                oldItem: oldStash[key],
                newItem: { ...oldStash[key], amount: (oldStash[key]?.amount || 0) + amount },
                staffName: user?.name,
                staffUID: user?.uid,
            }, `Item Incremented`, 3093090)


            await sendStashNotification(family, {
                type: "add",
                itemName: key,
                amount: amount,
                reason: reason,
            })
            await sendStashUpdate({...family, stash: { ...oldStash, [key]: { ...oldStash[key], amount: (oldStash[key]?.amount || 0) + amount } } })
        }

        showPopup({
            title: "Increment Item",
            description: "Are you sure you want to increment this item?",
            inputsArray: [
                {title: "Amount", type: "number", className: "input-d", placeholder: "amount...", name: "stash-increment-item-amount-input"},
                {title: "Reason", type: "text", className: "input-d", maxLength: 50, placeholder: "reason for increment...", name: "stash-increment-item-reason-input"},
            ],
            buttonsArray: [
                { text: "Cancel", className: "btn-d", onClick: resetPopup },
                { text: "Increment", className: "btn-g", onClick: confirm },
            ]
        })
    }

    function handleDecrementItem(key: string) {
        async function confirm() {
            const amount = parseInt(popupInputs.current["stash-decrement-item-amount-input"])
            const reason = popupInputs.current["stash-decrement-item-reason-input"]
            const oldStash = family?.stash || {}

            if (!amount || amount <= 0) {
                setPopupInfo("Positive amount is required.", "red")
                return
            }

            const { error } = await supabase
                .from("families")
                .update({ stash: { ...family.stash, [key]: { ...family.stash[key], amount: (family.stash[key]?.amount || 0) - amount } } })
                .eq("name", family.name)
                .maybeSingle()
            if (error) {
                setPopupInfo("Error decrementing item.", "red")
                return
            }

            resetPopup()

            showPopup({
                title: "Success",
                description: "Item decremented successfully.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })

            await sendLog(family, `stash`, {
                name: key,
                reason: reason || "Not Given",
                amount: amount,
                oldItem: oldStash[key],
                newItem: { ...oldStash[key], amount: (oldStash[key]?.amount || 0) - amount },
                staffName: user?.name,
                staffUID: user?.uid,
            }, `Item Decremented`, 3093090)

            await sendStashNotification(family, {
                type: "remove",
                itemName: key,
                amount: amount,
                reason: reason,
            })
            await sendStashUpdate({...family, stash: { ...oldStash, [key]: { ...oldStash[key], amount: (oldStash[key]?.amount || 0) - amount } } })  
        }

        showPopup({
            title: "Decrement Item",
            description: "Are you sure you want to decrement this item?",
            inputsArray: [

                {title: "Amount", type: "number", className: "input-d", placeholder: "amount...", name: "stash-decrement-item-amount-input"},
                {title: "Reason", type: "text", className: "input-d", maxLength: 50, placeholder: "reason for decrement...", name: "stash-decrement-item-reason-input"},
            ],
            buttonsArray: [
                { text: "Cancel", className: "btn-d", onClick: resetPopup },
                { text: "Decrement", className: "btn-g", onClick: confirm },
            ]
        })
    }

    function handleDeleteItem(key: string) {
        async function confirm() {
            const oldStash = family?.stash || {}
            const newStash = { ...oldStash }
            delete newStash[key]
            
            const { error } = await supabase
                .from("families")
                .update({ stash: { ...newStash } })
                .eq("name", family.name)
                .maybeSingle()
            if (error) {
                setPopupInfo("Error deleting item.", "red")
                return
            }

            resetPopup()

            showPopup({
                title: "Success",
                description: "Item deleted successfully.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })

            sendLog(family, `stash`, {
                itemData: oldStash[key],
                staffName: user?.name,
                staffUID: user?.uid,
            }, `Item Deleted`, 3093090)

            await sendStashUpdate({...family, stash: { ...newStash } })
        }

        showPopup({
            title: "Delete Item",
            description: "Are you sure you want to delete this item?",
            buttonsArray: [
                { text: "Cancel", className: "btn-d", onClick: resetPopup },
                { text: "Delete", className: "btn-r", onClick: confirm },
            ]
        })
    }
    
    function handleEditItem(key: string) {
        const oldStash = family?.stash || {}
        popupInputs.current["stash-edit-item-name-input"] = key
        popupInputs.current["stash-edit-item-logo-input"] = family?.stash[key]?.logo

        async function confirm() {
            if (!popupInputs.current["stash-edit-item-name-input"]) {
                setPopupInfo("Item name is required.", "red")
                return
            }

            if (!isValidUrl(popupInputs.current["stash-edit-item-logo-input"])) {
                setPopupInfo("Logo url is not valid.", "red")
                return
            }

            const oldData = family?.stash?.[key]

            delete oldStash[key]

            const newStash: any = {...oldStash, [popupInputs.current["stash-edit-item-name-input"]]: { ...oldData, logo: popupInputs.current["stash-edit-item-logo-input"]}}

            const { error } = await supabase
                .from("families")
                .update({ stash: { ...newStash } })
                .eq("name", family.name)
                .maybeSingle()
            if (error) {
                setPopupInfo("Error editing item.", "red")
                return
            }

            resetPopup()

            sendLog(family, `stash`, {
                oldData: {
                    name: key,
                    logo: oldData?.logo},
                newData: {
                    name: popupInputs.current["stash-edit-item-name-input"],
                    logo: popupInputs.current["stash-edit-item-logo-input"]
                },    
                staffName: user?.name,
                staffUID: user?.uid,
            }, `Item Edited`, 3093090)

            await sendStashUpdate({...family, stash: { ...newStash } })
        }

        showPopup({
            title: "Edit Item",
            description: "Edit the name and image of this item.",
            inputsArray: [
                {title: "Name", type: "text", className: "input-d", placeholder: "name...", name: "stash-edit-item-name-input", defaultValue: key},
                {title: "Logo", type: "text", className: "input-d", placeholder: "logo url...", name: "stash-edit-item-logo-input", defaultValue: family?.stash[key]?.logo},
            ],
            buttonsArray: [
                { text: "Cancel", className: "btn-d", onClick: resetPopup },
                { text: "Edit", className: "btn-g", onClick: confirm },
            ]
        })
    }

    return (
        <div className="w-full h-full min-h-[300px] overflow-hidden shadow relative flex items-center justify-center">
            <div className="taskBox flex flex-col gap-3 !p-4 overflow-y-auto backdrop-blur-md min-w-[300px] w-[100%] max-w-[100%] h-[100%] input-d !border-none !rounded-none">
                <div className="upper flex items-center gap-2">
                    <div className="label input-d text-nowrap !p-2">Total Items</div>
                    <div className="sep-y !bg-fore/10"></div>
                    <div className="amount w-full input-d !p-2">{totalItems.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                    {IsStaff(family, user) && <div onClick={handleCreateItem} title="Create item" className="plusicon !w-max rounded text-white text-base bg-green-300/20 hover:bg-green-300/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all"><i className="fa-regular fa-plus"></i></div>}
                </div>
                <div className="filtering flex items-center gap-2 justify-between w-full">
                    <div className="search w-full">
                        <input type="text" className="input-d w-full !p-1" placeholder={`Search by ${filteringBy === "name" ? "name" : "amount"}`} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
                    </div>
                    <div className="filter flex items-center gap-2">
                        <div title="Filter by name" onClick={() => {setFilteringBy("name");setFilterBy("name")}} className={`name !text-sm ${filteringBy === "name" ? "btn-g pointer-events-none" : "btn-d"}`}>N</div>
                        <div title="Filter by amount" onClick={() => {setFilteringBy("amount");setFilterBy("amount")}} className={`amount !text-sm ${filteringBy === "amount" ? "btn-g pointer-events-none" : "btn-d"}`}>A</div>
                    </div>
                </div>
                <div className={`heading text-sm relative grid ${IsStaff(family,user) ? "grid-cols-3" : "grid-cols-2"} w-full h-max rounded !p-3 !pl-6 !pr-6`}>
                    <div className="name">
                        Item
                    </div>
                    <div className={`amount ${IsStaff(family,user) ? "text-center" : "text-end"}`}>
                        Amount
                    </div>
                    {IsStaff(family,user) && (
                        <div className="btns text-end">
                        Actions
                        </div>
                    )}
                </div>
                <div className="lower flex-1 w-full bg-fore-2/2 rounded overflow-y-auto flex flex-col gap-3 p-2">
                    {Object.keys(family?.stash)
                        .filter((key: string) => {
                            const item = family?.stash[key]
                            if (filteringBy === "name") {
                                return key.toLowerCase().includes(searchInput.toLowerCase())
                            } else if (filteringBy === "amount") {
                                return item?.amount.toString().includes(searchInput)
                            }
                            return true
                        })
                        .sort((a: string, b: string) => {   
                            const itemA = family?.stash[a]
                            const itemB = family?.stash[b]
                            if (filteringBy === "name") {
                                return a.localeCompare(b)
                            } else if (filteringBy === "amount") {
                                return itemB?.amount - itemA?.amount
                            }
                            return 0
                        })
                    .map((key: string,index: number) => {
                        const item = family?.stash[key]
                        return (
                            <div style={{ "--index":  `${index / 10}s`} as any} key={key} className={`item animte-listViewItemsAnimate relative grid ${IsStaff(family,user) ? "grid-cols-3" : "grid-cols-2"} items-center w-full h-max input-d rounded !p-2`}>
                                <div className="flex items-center gap-2 justify-start">
                                    <div className="logo h-14 aspect-square rounded overflow-hidden flex items-center justify-center">
                                        <SmartImage src={item?.logo} fallback={defaultItem} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="name text-sm text-white/80 whitespace-nowrap">{key}</div>
                                </div>

                                <div className={`amount ${IsStaff(family,user) ? "text-center" : "text-end"} text-fore text-base p-2`}>
                                    x{item?.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </div>

                                {IsStaff(family,user) && (
                                    <div className="btns flex items-center gap-2 justify-end">
                                        <i onClick={() => handleIncrementItem(key)} title="Add amount" className="fa-solid fa-plus btn-g"></i>
                                        <i onClick={() => handleDecrementItem(key)} title="Remove amount" className="fa-solid fa-minus btn-r"></i>
                                        <i onClick={() => handleEditItem(key)} title="Edit item" className="fa-solid fa-edit btn-d ml-2"></i>
                                        <i onClick={() => handleDeleteItem(key)} title="Delete item" className="fa-solid fa-trash btn-r"></i>
                                    </div>
                                )}
                            </div>
                        )
                    }
                    )}
                </div>
            </div>
        </div>
    )
}
