import { useCallback, useEffect, useState } from "react";
import { GetMemberFromUID } from "../functions/dbhelper";
import { useGlobal } from "../hooks/useGlobal";
import { sendLog, setRootVariablesBulk } from "../functions/scripts";
import SmartImage from "./SmartImage";
import { useEscape } from "../hooks/useEscape";
import TabMembers from "./TabMembers";
import TabRoles from "./TabRoles";
import logo from "/logo.png"
import TabTask from "./TabTask";
import TabOutfits from "./TabOutfits";
import TabLocations from "./TabLocations";
import TabFunds from "./TabFunds";
import TabLineup from "./TabLineup";
import TabLoa from "./TabLoa";
import TabFamiliySettings from "./TabFamiliySettings";
import { usePopup } from "../hooks/usePopup";
import { supabase } from "../functions/supabase";
import TabStash from "./TabStash";
import TabGallery from "./TabGallery";
export default function Tab({ name, backFunction }: { name: string, backFunction: (arg: null) => void }) {
  const { user, setFrameLogoUrl,setPopupInfo,setCurrentFamily } = useGlobal();
  const [memberDetails, setMemberDetails] = useState<Record<string, any>>({});
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem("lastTab") || "members";
  });
  const {showPopup,resetPopup} = usePopup();
  
  useEffect(() => {
    localStorage.setItem("lastTab", currentTab);
  }, [currentTab]);


  useEscape(() => {
    setFrameLogoUrl(logo);backFunction(null);setRootVariablesBulk([
      {key: "--bg", value: "var(--def-bg)"},
      {key:"--main3", value: "var(--def-main3)"}
    ])
    setCurrentFamily(null);
  });


  useEffect(()=> {
    function isUserInGroup(userId: string, groupName : string, joinedGroups = [], createdGroups = []) {

      const normalizedName = groupName.trim().toLowerCase();
  

      const joinedGroup: any = joinedGroups.find(
        (g : any) => g.name.trim().toLowerCase() === normalizedName
      );
  

      if (joinedGroup) {
        const isInValidRole = Object.keys(joinedGroup?.roles).some(role => {
          return joinedGroup?.members[role]?.includes(userId);
        });
        if (isInValidRole) return true;
      }
  

      const createdGroup: any = createdGroups.find(
        (g: any) => g.name.trim().toLowerCase() === normalizedName
      );
      if (createdGroup?.creator === userId) return true;
  

      return false;
    }

    if (!isUserInGroup(user?.uid,name,user?.joinedFamilies,user?.families)) {
      console.log("Family not found returning")
      setFrameLogoUrl(logo);backFunction(null);setRootVariablesBulk([
        {key: "--bg", value: "var(--def-bg)"},
        {key:"--main3", value: "var(--def-main3)"}
      ])
    }
  // eslint-disable-next-line  
  },[user?.joinedFamilies,user?.families,user?.uid,name])

  const getFamily = useCallback((familyName: string) => {
    const allFamilies = [...(user?.families || []), ...(user?.joinedFamilies || [])];
  
    for (const family of allFamilies) {
      if (family?.name === familyName) {
        return family;
      }
    }
  
    return {};
  }, [user]);


  useEffect(() => {
    const family = getFamily(name);
    setFrameLogoUrl(family?.logoUrl || logo);
    const fetchMembers = async () => {
      const allMemberIds = Object.values(family.members || {}).flat();
      const uniqueIds = [...new Set(allMemberIds)];

      const entries = await Promise.all(
        uniqueIds.map(async (uid : any) => {
          const data = await GetMemberFromUID(uid);
          return [uid, data];
        })
      );

      setMemberDetails(Object.fromEntries(entries));
    };

    fetchMembers();
    // eslint-disable-next-line
  }, [name]);

  const family = getFamily(name);

  useEffect(()=> {
    setCurrentFamily(getFamily(name) || null);
  },[setCurrentFamily,name,getFamily])


  function handleLeaveFamily() {

    async function confirm() {
      if (family?.creator === user?.uid) {
        setPopupInfo("You are the creator of this family, you cannot leave it.", "red")
        return
      }
      resetPopup()

      const updatedFamily = Object.fromEntries(
        Object.entries(family?.members).map(([role, ids] : any) => [role, [...ids].filter(id => id !== user?.uid)])
      );

      const { error } = await supabase
        .from("families")
        .update({ members: updatedFamily })
        .eq("name", family?.name)
        .maybeSingle();
      
      if (error) {
        console.error("Error leaving family:", error);
        showPopup({
          title: "Error",
          description: "An error occurred while leaving the family.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        })
        return;
      }
      
      showPopup({
        title: "Success",
        description: "You have successfully left " + family?.name,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"User", {
          userName: user?.name,
          userId: user?.uid,
      },"User Left The Family",16711680)
    }

    

    showPopup({
      title: "Leave Family",
      description: "Are you sure you want to leave this family?",
      buttonsArray: [
        {
          text: "Cancel",
          className: "btn-d",
          onClick: resetPopup
        },
        {
          text: "Leave",
          className: "btn-r",
          onClick: confirm
        }
      ]
  })
  }

  const [cooldown, setCooldown] = useState(false);

  function handleTabChange(tab: string) {
    if (cooldown) return;
    setCurrentTab(tab);
    setCooldown(true);
    setTimeout(() => {
      setCooldown(false);
    },1000)  
  }

  return (
    <div className="flex w-full h-full">
      <div className="left w-full h-full flex">
        <div className="sidebar gap-5 flex flex-col items-center h-full border-r-[1px] border-main-3/5 backdrop-blur-xl">
        <i title="Current Task" onClick={() => handleTabChange("task")} className={`fa-solid fa-list-check ${cooldown && "opacity-50"}` + (currentTab === "task" ? " active" : "")}></i>
        <i title="Members" onClick={() => handleTabChange("members")} className={`fa-solid fa-users ${cooldown && "opacity-50"}` + (currentTab === "members" ? " active" : "")}></i>
        <i title="Roles" onClick={() => handleTabChange("roles")} className={`fa-solid fa-user-gear ${cooldown && "opacity-50"}` + (currentTab === "roles" ? " active" : "")}></i>
        <i title="Outfits" onClick={() => handleTabChange("outfits")} className={`fa-solid fa-clothes-hanger ${cooldown && "opacity-50"}` + (currentTab === "outfits" ? " active" : "")}></i>
        <i title="Family Gallery" onClick={() => handleTabChange("gallery")} className={`fa-solid fa-image ${cooldown && "opacity-50"}` + (currentTab === "gallery" ? " active" : "")}></i>
        <i title="Locations" onClick={() => handleTabChange("locations")} className={`fa-solid fa-location-dot ${cooldown && "opacity-50"}` + (currentTab === "locations" ? " active" : "")}></i>
        <i title="Family Stash" onClick={() => handleTabChange("stash")} className={`fa-solid fa-treasure-chest ${cooldown && "opacity-50"}` + (currentTab === "stash" ? " active" : "")}></i>
        <i title="Family Funds" onClick={() => handleTabChange("funds")} className={`fa-solid fa-piggy-bank ${cooldown && "opacity-50"}` + (currentTab === "funds" ? " active" : "")}></i>
        <i title="Family List" onClick={() => handleTabChange("family list")} className={`fa-solid fa-person-rifle ${cooldown && "opacity-50"}` + (currentTab === "family list" ? " active" : "")}></i>
        <i title="Leave Of Absence (LOA)" onClick={() => handleTabChange("loa")} className={`fa-solid fa-face-sleeping ${cooldown && "opacity-50"}` + (currentTab === "loa" ? " active" : "")}></i>


        {(getFamily(name)?.creator === user?.uid || 
          getFamily(name)?.managerRoles?.some((role : string) => 
            getFamily(name)?.members?.[role]?.includes(user?.uid)
          )) && (
          <>
            <div className="sep"></div>  
            <i title="Family Settings" onClick={() => handleTabChange("settings")} className={`fa-solid fa-gear ${cooldown && "opacity-50"}` + (currentTab === "settings" ? " active" : "")}></i>
          </>
        )}

        <i onClick={handleLeaveFamily} title="Leave Family" className="fa-solid fa-left-from-bracket mt-auto !text-red-500"></i>

        </div>

        <div className="tabScreen w-full h-full relative">
          <div className="title text-xl uppercase font-bold text-fore w-full h-12 text-center border-b-[1px] border-main-3/5 backdrop-blur-xl">{currentTab}</div>
          <div className="w-full" style={{ height: 'calc(100% - 3rem)' }}>
          {currentTab === "members" && <TabMembers family={family} />}
          {currentTab === "roles" && <TabRoles family={family} />}
          {currentTab === "task" && <TabTask family={family} />}
          {currentTab === "outfits" && <TabOutfits family={family}/>}
          {currentTab === "locations" && <TabLocations family={family}/>}
          {currentTab === "stash" && <TabStash family={family}/>}
          {currentTab === "funds" && <TabFunds family={family}/>}
          {currentTab === "family list" && <TabLineup family={family}/>}
          {currentTab === "loa" && <TabLoa family={family}/>}
          {currentTab === "settings" && <TabFamiliySettings family={family}/>}
          {currentTab === "gallery" && <TabGallery family={family}/>}
          </div>
        </div>
      </div>

      <div className="right border-l-[1px] border-main-3/5 membersList flex flex-col h-full max-h-full w-[clamp(min(200px,100%),40%,250px)] p-4">
        <div onClick={()=> {setFrameLogoUrl(logo);backFunction(null); setRootVariablesBulk([
                {key: "--bg", value: "var(--def-bg)"},
                {key:"--main3", value: "var(--def-main3)"}
    ]);setCurrentFamily(null)}} className="title text-center text-lg btn-d flex gap-2 items-center justify-center sticky top-0"><i className="fa-solid fa-turn-left"></i> Dashboard</div>
        <div className="list w-full h-full max-h-full overflow-y-auto pr-1 mt-1">
        {Object.entries(family.roles || {})
          .sort((a: any, b: any) => b[1].weight - a[1].weight)
          .map(([roleName]) => {
            const membersInRole = family.members?.[roleName] || [];
            if (membersInRole.length === 0) return null;

            return (
              <div key={roleName} className="flex flex-col gap-2 mt-2">
                <div className="text-sm flex gap-2 items-center text-main/40 text-nowrap">
                  {roleName} <div className="line w-full h-[2px] bg-main/40 rounded"></div>
                </div>
                <div className="flex flex-col gap-1">
                  {membersInRole.map((memberId: string) => (
                    <div
                      key={memberId}
                      className="bg-bg/5 cursor-pointer transition-all text-main p-2 rounded border border-main-3/3 flex items-center gap-2 hover:bg-bg/10"
                    >
                      
                      <div className="pfp overflow-hidden aspect-square w-[25%] rounded-full"><SmartImage className="w-full h-full object-cover" src={memberDetails[memberId]?.image} fallback="defaultUser.png" />  </div>
                      <div key={family?.members} className="name w-full text-ellipsis overflow-hidden">{memberDetails[memberId]?.name || "Loading..."}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
      </div>
    </div>
  );
}
