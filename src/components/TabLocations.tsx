import { useState } from "react";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import { supabase } from "../functions/supabase";
import SmartImage from "./SmartImage";
import defaultLocation from "/defaultLocation.jpg"
import LocationPreview from "./LocationPreview";
import { IsStaff } from "../functions/dbhelper";
import { sendLog } from "../functions/scripts";

export default function TabLocations({family} : {family : any}) {
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal();

  const [preview, setPreview] = useState({
      enabled: false,
      name: "",
      map: "",
    });

  
  function handleAddLocation() {
    if (!IsStaff(family,user)) return
    if (Object.keys(family?.locations).length >= 10) {
          showPopup({
            title: "Error",
            description: "You have reached the maximum number of locations that is 10, To add more first delete the old ones.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
          })
          return
        }
    
        async function confirm() {
            if (!popupInputs?.current["add-location-name-input"]) {
                setPopupInfo("Please enter a location name.")
                return
            }
            if (!popupInputs?.current["add-location-image-input"]) {
                setPopupInfo("Location image url is missing.")
                return
            }
            if (!popupInputs?.current["add-location-map-input"]) {
                setPopupInfo("Location map image url is missing.")
                return
            }
    
            if (family?.outfits[popupInputs?.current["add-location-name-input"]]) {
                setPopupInfo(`Location with the name ${popupInputs?.current["add-location-name-input"]} already exists.`)
                return  
            }

            const logsData = {
              locationName: popupInputs?.current["add-location-name-input"],
              locationImage: popupInputs?.current["add-location-image-input"],
              locationMap: popupInputs?.current["add-location-map-input"],
            }
    
            resetPopup()
    
            const {error} = await supabase
            .from("families")
            .update({locations: {...family?.locations,
                [popupInputs?.current["add-location-name-input"]]: {
                    image: popupInputs?.current["add-location-image-input"],
                    map: popupInputs?.current["add-location-map-input"]
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
                title: "Location Added",
                description: "The location was added Successfully.",
                buttonsArray: [
                    {text: "close", className: "btn-d", onClick: resetPopup}
                ]
            })

            await sendLog(family,"Location", {
                    ...logsData,
                    staffName: user?.name,
                    staffUID: user?.uid,
                  },"Location Added",16747931)
        }
    
        showPopup({
          title: "Add Location",
          description: "Add an location to the locations list by setting the bellow values.",
          inputsArray: [
            {title: "Location Name",type:"text", className: "input-d", name: "add-location-name-input"},
            {title: "Location Image Url", type: "text", className: "input-d", name: "add-location-image-input"},
            {title: "Map Image Url", type: "text", className: "input-d", name: "add-location-map-input"},
          ],
          buttonsArray: [
            {text: "Close", onClick: resetPopup, className: "btn-d"},
            {text: "Create", onClick:confirm, className: "btn-g"}
          ]
        })
  }

  function handleDeleteLocation(key:string) {
    if (!IsStaff(family,user)) return
    async function confirm() {
        resetPopup()
    
        const updatedLocations = { ...family?.locations }
    
        delete updatedLocations[key]
    
        const { error } = await supabase
          .from("families")
          .update({ locations: updatedLocations })
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
          title: "Location Deleted",
          description: "The location was deleted successfully.",
          buttonsArray: [
            { text: "close", className: "btn-d", onClick: resetPopup }
          ]
        })

        await sendLog(family,"Location", {
          locationName: key,
          staffName: user?.name,
          staffUID: user?.uid,
        },"Location Deleted",16711680)
      }
    
      showPopup({
        title: "Delete Location",
        description: "Are you sure you want to delete this location?",
        buttonsArray: [
          { text: "Close", onClick: resetPopup, className: "btn-d" },
          { text: "Delete", onClick: confirm, className: "btn-r" }
        ]
      })
  }


  function handleEditLocation(key: string) {
    if (!family || !user || !IsStaff(family, user)) {
      setPopupInfo("Unauthorized access.");
      return;
    }
  
    const oldData = family.locations[key];
    if (!oldData) {
      setPopupInfo("Location data not found.");
      return;
    }
  
    async function confirm() {
      const name = popupInputs.current["edit-location-name-input"];
      const image = popupInputs.current["edit-location-image-input"];
      const map = popupInputs.current["edit-location-map-input"];
  

      if (!name) {
        setPopupInfo("Please enter a location name.");
        return;
      }
      if (!image) {
        setPopupInfo("Location image URL is missing.");
        return;
      }
      if (!map) {
        setPopupInfo("Location map image URL is missing.");
        return;
      }

      try {
        new URL(image);
        new URL(map);
      } catch {
        setPopupInfo("Please enter valid URLs for image and map.");
        return;
      }
      if (key !== name && family.locations[name]) {
        setPopupInfo(`Location with the name "${name}" already exists.`);
        return;
      }
 
      if (
        key === name &&
        oldData.image === image &&
        oldData.map === map
      ) {
        setPopupInfo("No changes were made to the location data.");
        return;
      }

      resetPopup();
  
      const logsData = {
        locationName: name,
        locationImage: image,
        locationMap: map,
      };
  
      const copy = { ...family.locations };
      if (key !== name) {
        delete copy[key];
      }
  
      const newData = {
        ...copy,
        [name]: {
          image: image,
          map: map,
        },
      };
  
      const { error } = await supabase
        .from("families")
        .update({ locations: newData })
        .eq("name", family.name)
        .maybeSingle();
  
      if (error) {
        console.error("Update error:", error);
        showPopup({
          title: "Error",
          description: "Failed to update location. Please try again.",
          buttonsArray: [
            { text: "Close", className: "btn-d", onClick: resetPopup },
          ],
        });
        return;
      }
  
      await sendLog(
        family,
        "Location",
        {
          locationName: key,
          oldData: { ...oldData },
          newData: { ...logsData },
          staffName: user.name,
          staffUID: user.uid,
        },
        "Location Edited",
        16747931
      );
  
      showPopup({
        title: "Location Edited",
        description: "The location was edited successfully.",
        buttonsArray: [
          { text: "Close", className: "btn-d", onClick: resetPopup },
        ],
      });
  
      
    }
  
    popupInputs.current = {
      ...popupInputs.current,
      "edit-location-name-input": key,
      "edit-location-image-input": oldData.image,
      "edit-location-map-input": oldData.map,
    };
  
    showPopup({
      title: "Edit Location",
      description: "Edit the location by setting the values below.",
      inputsArray: [
        {
          title: "Location Name",
          type: "text",
          className: "input-d",
          name: "edit-location-name-input",
          defaultValue: key,
        },
        {
          title: "Location Image URL",
          type: "text",
          className: "input-d",
          name: "edit-location-image-input",
          defaultValue: oldData.image,
        },
        {
          title: "Map Image URL",
          type: "text",
          className: "input-d",
          name: "edit-location-map-input",
          defaultValue: oldData.map,
        },
      ],
      buttonsArray: [
        { text: "Close", className: "btn-d", onClick: resetPopup },
        { text: "Edit", className: "btn-g", onClick: confirm },
      ],
    });
  }

  return (
    <div className="w-full h-full min-h-[300px] overflow-x-hidden shadow relative flex p-5 flex-wrap content-start gap-2">
      {(IsStaff(family,user) && !preview?.enabled) && <div onClick={handleAddLocation} className="plusicon z-10 absolute right-5 top-5 !w-max rounded text-white text-base bg-main-4/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-regular fa-plus"></i></div>}

      {preview?.enabled && (
              <LocationPreview data={preview} setPreview={setPreview}/>
      )}  

      {family?.locations && Object.keys(family?.locations)
      .sort((a, b) => a?.localeCompare(b))
      .map((locationName: string) => (
       <div key={locationName} className="cursor-pointer border-1 border-fore-2/20 bg-fore-2/5 overflow-hidden rounded flex flex-col w-[clamp(min(200px,100%),20%,300px)]">
          <SmartImage fallback={defaultLocation} className="w-full h-[200px] object-cover" src={family?.locations[locationName]?.image}/>
          <div className="name text-lg text-center font-bold text-fore-2 mt-auto">{locationName}</div>
          <div className="buttons p-2 flex gap-3 items-center justify-between">
            <button onClick={() => setPreview({
              enabled: true,
              name: locationName,
              map: family?.locations[locationName]?.map
            })} title="Preview Location" className="w-full btn-g"><i className="fa-solid fa-eye"></i></button>
            {IsStaff(family,user) && <>
              <button onClick={()=> handleEditLocation(locationName)} title="Edit Location" className="w-full btn-d"><i className="fa-solid fa-file-pen"></i></button>
              <button onClick={()=> handleDeleteLocation(locationName)} title="Delete Location" className="w-full btn-r"><i className="fa-solid fa-trash"></i></button>
            </>}
          </div>
       </div> 
      ))}  
    </div>
  )
}
