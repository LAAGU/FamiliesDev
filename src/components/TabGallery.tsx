import { useState } from "react";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import { supabase } from "../functions/supabase";
import SmartImage from "./SmartImage";
import { IsStaff } from "../functions/dbhelper";
import { isValidUrl, sendLog } from "../functions/scripts";

import defaultImage from "/defaultImage.webp"
import imgLoader from "/imgTemplate.gif"

export default function TabGallery({family} : {family : any}) {
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal();
  

  const [sortBy, setSortBy] = useState(
    localStorage.getItem("gallery-sortBy") || "new"
  );
  const [viewType, setViewType] = useState(
    localStorage.getItem("gallery-viewType") || "x2"
  );

  const [searchInput, setSearchInput] = useState("");

  function handleAddImage() {
    async function confirm() {
        const url = popupInputs?.current["gallery-image-input"];

        if (!url) {
            setPopupInfo("Please enter a valid url.");
            return;
        }
        if (family?.gallery?.[url]) {
            setPopupInfo(`Image with this url already exists.`);
            return;
        }
        if (!isValidUrl(url)) {
            setPopupInfo("Please enter a valid url.");
            return;
        }

        resetPopup()

        const { error } = await supabase
            .from("families")
            .update({
                gallery: {
                    ...family?.gallery,
                    [url]: new Date().toLocaleString()
                },
            })
            .eq("name", family?.name)
            .maybeSingle();
        
        if (error) {
            console.log(error)
            showPopup({
              title: "Error",
              description: "There was an error.",
              buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return;
        }

        showPopup({
          title: "Image Added",
          description: "The image was added successfully.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        
        sendLog(family,'Gallery',{
            url: url,
            staffName: user?.name,
            staffUID: user?.uid
        },"Image Uploaded",6172415)
    }

    if (!family?.gallery || Object.keys(family?.gallery)?.length >= 50) {
        showPopup({
          title: "Error",
          description: "You have reached the maximum amount of images (50) in your family gallery.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return        
    }
    
    popupInputs.current = {
      ...popupInputs?.current,
      "gallery-image-input": "",
    }
    showPopup({
      title: "Add Image",
      description: "Add an image to your family gallery",
      inputsArray: [
        {
          name: "gallery-image-input",
          type: "text",
          className: "input-d",
          placeholder: "https://example.com/image.jpg",
        },
      ],
      buttonsArray: [
        {
          text: "Cancel",
          onClick: resetPopup,
          className: "btn-d",
        },
        {
          text: "Add",
          onClick: confirm,
          className: "btn-g",   
        }
      ]
    })
  }

  function deleteImage(key: string) {
    async function confirm() {
        resetPopup()
        const dateCreated = family?.gallery[key]  
        const newData = family?.gallery || {};
        delete newData[key];

        const { error } = await supabase
            .from("families")
            .update({
                gallery: {
                    ...newData
                },
            })
            .eq("name", family?.name)
            .maybeSingle();
          
        
        if (error) {
            console.log(error)
            showPopup({
              title: "Error",
              description: "There was an error.",
              buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return;
        }

        showPopup({
          title: "Image Deleted",
          description: "The image was deleted successfully.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        
        sendLog(family,'Gallery',{
            url: key,
            dateUploaded: dateCreated,
            staffName: user?.name,
            staffUID: user?.uid
        },"Image Deleted",16723456)
    }

    showPopup({
      title: "Delete Image",
      description: "Are you sure you want to delete this image?",
      buttonsArray: [
        {
          text: "Cancel",
          onClick: resetPopup,
          className: "btn-d",
        },
        {
          text: "Delete",
          onClick: confirm,
          className: "btn-r",   
        }
      ]
    })


  }
  

  function handleViewTypeChange() {
    const newViewType = viewType === "x2" ? "x3" : viewType === "x3" ? "single" : "x2"
    localStorage.setItem("gallery-viewType", newViewType);
    setViewType(newViewType);
  }

  function handleSortByChange() {
    const newSortBy = sortBy === "new" ? "old" : "new"
    localStorage.setItem("gallery-sortBy", newSortBy);
    setSortBy(newSortBy);
  }

  const [activeImage, setActiveImage] = useState("")

  function handleActiveImage(url:string) {
    if (activeImage === "") {
      setActiveImage(url)
      return
    }
    if (activeImage === url) {
      setActiveImage("")
      return
    }
    setActiveImage(url)
  }

  return (
    <>
        <div className="upper flex items-center justify-between w-full p-2 gap-2">
        <div className="left text-fore text-base text-nowrap">Total {Object.keys(family?.gallery || {}).length} images in the gallery.</div>
        <div className="search w-full">
            <input onChange={(e) => setSearchInput(e.target.value)} type="text" className="input-d w-full" placeholder="search by upload date or time ex: (AM/PM, DD/MM/YYYY, HH:MM:SS)" />
        </div>    
        <div className="right flex items-center gap-2">
         <div onClick={handleViewTypeChange} className="btn-d !border-0 hover:!bg-bg/20" title="Change View"><i className="fa-solid fa-objects-column"></i></div>    
         <div title={sortBy === "new" ? "Sort by oldest" : "Sort by newest"} onClick={handleSortByChange} className="sort btn-d !border-0 hover:!bg-bg/20"><i className={`fa-solid fa-circle-sort-${sortBy === "new" ? "up" : "down"}`}></i></div>    
         {IsStaff(family,user) && <div title="Add Image" onClick={handleAddImage} className="plusicon !w-max rounded text-white text-base bg-main-4/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-regular fa-plus"></i></div>}
        </div>
        </div>   
        

         
    
    <div className="w-full h-[calc(100%-4rem)] min-h-[300px] overflow-x-hidden shadow relative">
      
    <div key={`${viewType}-${sortBy}`} className={`images w-full h-max p-2 pt-0 overflow-y-auto gap-4 ${viewType === "x2" ? "columns-2" : viewType === "x3" ? "columns-3" : "flex flex-col"}`}>  
    {family?.gallery && Object.keys(family?.gallery)
      .filter((key) => family?.gallery[key].includes(searchInput)) 
      .sort((a, b) => {
        const dateA: any = new Date(family?.gallery[a]);
        const dateB: any = new Date(family?.gallery[b]);
        return sortBy === "new" ? dateB - dateA : dateA - dateB;
      })
      .map((url: string) => {
    
        return (
          <div onClick={() => handleActiveImage(url)} key={url} className={`${activeImage === url ? "active" : ""} galleryImageBox relative cursor-pointer transition-all shrink-0`}>
            <SmartImage
              className="block w-full mb-4"
              src={url}
              fallback={defaultImage}
              loading={imgLoader}
               
            />
            <div className="btns absolute right-0 top-0 flex items-center justify-between gap-2 z-2 w-full p-2">
              <div className="text text-fore text-sm uppercase">Uploaded on {family?.gallery[url]}</div>
              {IsStaff(family,user) && (
                <div className="clickable flex items-center gap-2">
                  <div onClick={() => deleteImage(url)} title="Delete" className="delete btn-r !rounded-none"><i className="fa-solid fa-trash"></i></div>
                </div>
              )}
              
            </div>
          </div>
        );
      })}
    </div>
      
    </div>
    </>
  )
}
