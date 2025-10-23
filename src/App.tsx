import { useEffect, useState } from "react";
import Auth from "./components/Auth";
import FamilyBox from "./components/FamilyBox";
import Frame from "./components/Frame"
import HeavyLoader from "./components/HeavyLoader";
import Popup from "./components/Popup"
import { supabase } from "./functions/supabase";
import { useGlobal } from "./hooks/useGlobal"
import { usePopup } from "./hooks/usePopup";
import Tab from "./components/Tab";
import { applySavedPermanentVariables, sendLog, setRootVariablesBulk } from "./functions/scripts";
import SmartImage from "./components/SmartImage";
import Settings from "./components/Settings";
import logo from "/logo.png"
import { GetTotalMembers } from "./functions/dbhelper";
import ConsolePanel from "./components/ConsolePanel";
import PatchNotesBox from "./components/PatchNotesBox";


function App() {
  const {
    heavyLoading,
    user,
    logout,
    popupInputs,
    toggleHeavyLoader,
    setFrameText,
    fetchjoinedFamiliesNames,
    setPopupInfo,
    checkUser,
    settingsOpen,
    setSettingsOpen,
    updateData,
    setFrameLogoUrl,
    showingPatchNotes} = useGlobal();







  





  const {showPopup,resetPopup} = usePopup();
  const [familyTab, setFamilyTab] = useState<null | string>(()=> {
    return localStorage.getItem("lastFamily") || ""
  }
    
  );



  useEffect(()=> {
    setFrameText(familyTab || "Families")
  },[familyTab,setFrameText])

  useEffect(() => {
    localStorage.setItem("lastFamily", familyTab || "");
    {[...user?.families || [], ...user?.joinedFamilies || []]
      .forEach((family : any) => {
        if (family?.name === familyTab && !updateData?.status && localStorage.getItem("disableFamilyColorsOverlay") !== "true") {
          setRootVariablesBulk([
            {key: "--bg", value: family?.color},
            {key:"--main3", value: family?.color}
           ])
        }
    })}
  },[familyTab,user?.families,user?.joinedFamilies,updateData?.status])

  async function handleCreateFamily() {
    async function createFamily(name: string, password: string, maxMembers: number, logoUrl: string, familyColor : string) {
      resetPopup()
      const {data} = await supabase.from("families").select("*").eq("name",name).maybeSingle();
      if (data?.name) {
        showPopup({
          title: "Family Already Exists",
          description: "A family with the same name already exists. Please choose a different name.",
          buttonsArray: [
            {
              text: "Close",
              onClick: resetPopup,
              className: "btn-r"
            }
          ],
          inputsArray: [],
          type: "default"
        })
        return
      }

      
      toggleHeavyLoader("Creating Family", true);
      const { error } = await supabase.from("families").insert({
        name: name,
        creator:user?.uid,
        password: password,
        members: {
          Leader: [user?.uid],
          Member: []
        },
        maxMembers: maxMembers,
        roles: {
          Leader: {
            weight: 1000
          },
          Member: {
            weight: 0
          }
        },
        logoUrl: logoUrl,
        color: familyColor ? familyColor?.startsWith("#") ? familyColor : `#${familyColor}` : null,
        funds: {
          total: 0,
          users: {
            [user?.uid]: 0
          }
        },
        joinedDates: {
          [user?.uid]: new Date().toLocaleString()
        }
      })

      if (error) {
        console.error(error);
        toggleHeavyLoader("Error Creating Family, Returning to Dashboard", true);

        setTimeout(()=> {
          toggleHeavyLoader();
          showPopup({
            title: "Couldn't Create Family",
            description: "An error occurred while creating your family. Please try again later.",
            buttonsArray: [
              {
                text: "Close",
                onClick: resetPopup,
                className: "btn-r"
              }
            ],
            inputsArray: [],
            type: "default"
          })
        },2000)
        return
      }

      toggleHeavyLoader("Family Created Successfully", true);

      setTimeout(()=> {  
        toggleHeavyLoader();
        showPopup({
          title: `${name} Created`,
          description: "You have successfully created a family. You can now see it on the dashboard.",
          buttonsArray: [
            {
              text: "Close",
              onClick: resetPopup,
              className: "btn-g"
            }
          ],
          inputsArray: [],
          type: "default"
        })
      },2000)

    }

    const { data: existingRows, error } : any = await supabase
    .from('families')
    .select('*')
    .eq('creator', user.uid)


    if (error) {
      console.error("Error fetching existing rows:", error);
      showPopup({
        title: "Couldn't Create Family",
        description: "An error occurred while creating your family. Please try again later.",
        buttonsArray: [
          {
            text: "Close",
            onClick: resetPopup,
            className: "btn-r"
          }
        ],
        inputsArray: [],
        type: "default"
      })
      return
    }


    if (!user?.creatorPerm) {
      showPopup({
        title: "No Permission",
        description: `You do not have permission to create a family.`,
        buttonsArray: [
          {
            text: "Close",
            onClick: resetPopup,
            className: "btn-r"
          }
        ]
      })
      return
    }

    const maxFamilyCount = user?.maxFamilies || 1;

    if (existingRows?.length >= maxFamilyCount) {
      showPopup({
        title: "Couldn't Create Family",
        description: `You cannot create more than ${maxFamilyCount} families.`,
        buttonsArray: [
          {
            text: "Close",
            onClick: resetPopup,
            className: "btn-r"
          }
        ]
      })
      return
    }



    showPopup({
      title: "Create Family",
      description: "Enter a name for your family.",
      buttonsArray: [
        {
          text: "Cancel",
          onClick: resetPopup,
          className: "btn-d"
        },
        {
          text: "Create",
          onClick: ()=> {
            const familyName = popupInputs.current["create-family-name"];
            const familyMaxMembers = popupInputs.current["create-family-max-members"];
            const familyPassword = popupInputs.current["create-family-password"];
            const familyLogoUrl = popupInputs.current["create-family-logo-url"];
            const familyColor = popupInputs.current["create-family-color"];

            if (familyName && familyMaxMembers) {
              createFamily(familyName,familyPassword,familyMaxMembers,familyLogoUrl,familyColor);
            }

          },
          className: "btn-g"
        }
      ],
      inputsArray: [
        {type: "text", placeholder: "Family Name", className: "input-d",name: "create-family-name",maxLength:30},
        {
          type: "number",
          placeholder: "Max Members (Max 30)",
          className: "input-d",
          name: "create-family-max-members",
          onInput: (e) => {
            const val = (e.target as HTMLInputElement).value;

            if (e.nativeEvent.data === "-") {
              (e.target as HTMLInputElement).value = "2";
              popupInputs.current["create-family-max-members"] = 2;
              return;
            }
        
            let numVal = parseInt(val);
            if (isNaN(numVal)) return;
        
            numVal = Math.max(1, Math.min(30, numVal));
            (e.target as HTMLInputElement).value = numVal.toString();
            popupInputs.current["create-family-max-members"] = numVal;
          },
          // onWheel: (e) => e.preventDefault(),
        },
        {type: "text", placeholder: "Join Password (Optional)", className: "input-d",name: "create-family-password",maxLength:60},
        {type: "text", placeholder: "Logo Url (Optional)", className: "input-d",name: "create-family-logo-url",maxLength:250},
        {type: "text", placeholder: "Family Color Hex (Optional)", className: "input-d",name: "create-family-color",maxLength:20}
      ],
      type: "default"

  })
}


async function handleJoinFamily() {
  async function joinFamily(name: string) {
    async function confirm(name: string, password: string) {
      resetPopup();

      const { data, error } : { data: any; error: any } = await supabase
        .from("families")
        .select("*")
        .eq("name", name)
        .maybeSingle();

      if (error) {
        console.error(error);
        showPopup({
          title: "Error",
          description: "An error occurred while joining your family. Please try again later.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }],
          inputsArray: [],
          type: "default"
        });
        return;
      }

      if (!data) {
        showPopup({
          title: "Error",
          description: "The family you are trying to join does not exist.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }]
        });
        return;
      }

      if (GetTotalMembers(data) >= data?.maxMembers) {
        showPopup({
          title: "Cannot Join",
          description: "The family you are trying to join is full.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }]
        })
        return
      }

      if (data?.password && data?.password !== password) {
        showPopup({
          title: "Wrong Password",
          description: "Could not join family. Wrong password was given.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }]
        });
        return;
      }

      if (!user?.mid || data?.bannedUsers[user?.mid]) {
        if (!user?.mid) {
          showPopup({
            title: "Error",
            description: "You must be logged in to join a family.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            inputsArray: [],
          });
          return
        }
        if (data?.bannedUsers[user?.mid]) {
          const banData = data?.bannedUsers[user?.mid]
          showPopup({
            title: "Banned",
            description: "You have been banned from this family.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            labelsArray: [
              {title:"Given Reason", text: banData?.reason, className: "input-d"},
              {title: "Ban Date", text: banData?.date || "Can't Fetch", className: "input-d"}
            ],
          });
          return
        }
        return
      }

      toggleHeavyLoader("Joining Family", true);


      const defaultRoleName = data?.defaultRole;

      if (!defaultRoleName) {
        console.error("No default role found!");
        toggleHeavyLoader("Error: No default role found.", false);
        return;
      }

      try {
        const members = data?.members || {};


        if (!members[defaultRoleName]) {
          members[defaultRoleName] = [];
        }

    
        if (!members[defaultRoleName].includes(user?.uid)) {
          members[defaultRoleName].push(user?.uid);


  
          const { error: updateError } = await supabase
            .from("families")
            .update({ members,funds: {...data?.funds, users: {
              ...data?.funds?.users
            }},joinedDates: {
              ...data?.joinedDates,
              [user?.uid]: data?.joinedDates?.[user?.uid] || new Date().toLocaleString()
            }})
            .eq("name", name);
          

          if (updateError) {
            console.error("Error updating members:", updateError);
            toggleHeavyLoader("Error joining family, Returning to dashboard.", true);
            setTimeout(()=> {
              toggleHeavyLoader();
            },2000)
          } else {




            toggleHeavyLoader("Successfully joined family.", true);
            setTimeout(()=> {
              sendLog(data,"User", {
                userName: user?.name,
                userId: user?.uid,
              },"User Joined The Family",3132063)
              toggleHeavyLoader();
            },2000)
          } 
        } else {
          toggleHeavyLoader("Already a member of this family.", false);
        }
      } catch (e) {
        console.error(e);
        showPopup({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }],
          inputsArray: [],
          type: "default"
        });
      }
    }

    resetPopup();

    const { data, error } = await supabase.from("families").select("*").eq("name", name).maybeSingle();

    if (!data || !data?.name) {
      showPopup({
        title: "Error",
        description: "The family you are trying to join does not exist.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }],
        inputsArray: [],
        type: "default"
      });
      return;
    }

    


    const isUserInFamily = Object.values(data.members || {}).some((roleArray : any) => roleArray.includes(user?.uid));

    if (isUserInFamily) {
      showPopup({
        title: "Already a Member",
        description: "You are already part of this family.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }],
        inputsArray: [],
        type: "default"
      });
      return;
    }

    if (error) {
      console.error(error);
      showPopup({
        title: "Couldn't Join Family",
        description: "An error occurred while joining your family. Please try again later.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-r" }],
        inputsArray: [],
        type: "default"
      });
      return;
    }


    if (data?.password) {
      showPopup({
        title: "Family Password",
        description: "Enter the family password below to join.",
        buttonsArray: [
          { text: "Cancel", className: "btn-d", onClick: resetPopup },
          {
            text: "Submit",
            className: "btn-g",
            onClick: () => {
              const familyPassword = popupInputs?.current["join-family-password-value"];
              if (familyPassword) {
                confirm(name, familyPassword);
              }
            }
          }
        ],
        inputsArray: [{ type: "password", placeholder: "Enter the password...", className: "input-d", name: "join-family-password-value" }],
        type: "default"
      });
    } else {
      confirm(name, "");
    }
  }

  showPopup({
    title: "Join Family",
    description: "Enter the name of the family you want to join.",
    buttonsArray: [
      { text: "Close", onClick: resetPopup, className: "btn-d" },
      {
        text: "Join",
        onClick: () => {
          const familyName = popupInputs?.current["join-Family-Name-Input"];
          if (familyName) {
            joinFamily(familyName);
          }
        },
        className: "btn-g"
      }
    ],
    inputsArray: [{ type: "text", placeholder: "Family Name", className: "input-d", name: "join-Family-Name-Input", maxLength: 30 }],
    type: "default"
  });
}



  const [searchInput, setSearchInput] = useState("");


  type UserData = {
    name: string;
    password: string;
    image: string;
    forgetPasswordQuestion: string;
    forgetPasswordAnswer: string;
  };
  
  function changeAccountDetails() {
    const name = (document.querySelector<HTMLInputElement>('[name="account-name-input"]')?.value ?? '').trim();
    const password = (document.querySelector<HTMLInputElement>('[name="account-password-input"]')?.value ?? '').trim();
    const image = (document.querySelector<HTMLInputElement>('[name="account-pfp-input"]')?.value ?? '').trim();
    const forgetQ = (document.querySelector<HTMLInputElement>('[name="account-forget-q-input"]')?.value ?? '').trim();
    const forgetA = (document.querySelector<HTMLInputElement>('[name="account-forget-a-input"]')?.value ?? '').trim();
  
    const changes: Partial<UserData> = {};
  
    if (name !== user?.name) changes.name = name;
    if (password !== user?.password) changes.password = password;
    if (image !== user?.image) changes.image = image;
    if (forgetQ !== user?.forgetPasswordQuestion) changes.forgetPasswordQuestion = forgetQ;
    if (forgetA !== user?.forgetPasswordAnswer) changes.forgetPasswordAnswer = forgetA;
  
    if (Object.keys(changes).length === 0) {
      return setPopupInfo("Nothing Was Changed", "red");
    }
  
    const data = {
      name: changes?.name || user?.name,
      password: changes?.password || user?.password,
      image: changes?.image || user?.image,
      forgetPasswordQuestion: changes?.forgetPasswordQuestion || user?.forgetPasswordQuestion,
      forgetPasswordAnswer: changes?.forgetPasswordAnswer || user?.forgetPasswordAnswer,
    }

    supabase?.from("users").update(data).eq("uid", user?.uid).then((res) => {
      resetPopup()
      toggleHeavyLoader("Updating Account", true);
      if (res.error) {
        console.error(res?.error);
        return setPopupInfo("Couldn't Update Account", "red");
      }


      checkUser(false).then(() => {
        fetchjoinedFamiliesNames();
        localStorage.setItem("client",JSON.stringify({
          uid: user?.uid,
          name: data?.name,
          password: data?.password
        }))
        setTimeout(()=> {
          toggleHeavyLoader();
          showPopup({
            title: "Account Updated",
            description: "Your account has been updated successfully.",
            buttonsArray: [
              {text: "Close", onClick: resetPopup, className: "btn-g"}
            ],
            inputsArray: [],
            type: "default"
          })
        },2000)
      }).catch((e : Error)=> {
        console.error(e);
        return setPopupInfo("Couldn't Update Account", "red");
      })
      
      
      
  
    })
  
    
  }

  useEffect(() => {
    if (updateData?.status) {
      setFrameLogoUrl(logo);
      setFrameText("Families");
      setRootVariablesBulk([
        { key: "--bg", value: "var(--def-bg)" },
        { key: "--main3", value: "var(--def-main3)" }
      ]);
      applySavedPermanentVariables();
    }
  // eslint-disable-next-line 
  }, [updateData?.status]);

  if (updateData?.status) {
    return <><Frame/><HeavyLoader/></>
  }



  return (
    <>
    <Frame/>
    <ConsolePanel/>
    {showingPatchNotes && <PatchNotesBox/>}
    {heavyLoading && <HeavyLoader/>}
    <Popup/>
    {settingsOpen && <Settings/>}
    {user?.uid && user?.name && user?.password && !heavyLoading && 

    <div className="panel flex w-full h-[calc(100vh-28px)] animate-bright-in overflow-hidden">
      <div className="navigation overflow-x-hidden w-[clamp(200px,20vw,250px)] flex flex-col p-[1vw] text-center backdrop-blur-3xl"> 
        <div className="userpfp aspect-square w-full rounded relative transition-all !cursor-default">
          <SmartImage src={user?.image} fallback="defaultUser.png" className="w-full h-full object-cover"/>
        </div>
        <div className="relative z-[2] p-1 min-h-12 cursor-default username text-lg font-bold text-fore bg-main-3/1 transition-all rounded mt-2 backdrop-blur-lg border-[1px] border-main-3/10 text-ellipsis overflow-hidden">{user?.name}</div>
        <div onClick={()=> showPopup({
          title: false,
          description: "Your Account Settings.",
          buttonsArray: [
            { text: "Close", onClick: resetPopup, className: "btn-d" },
            { text: "Change", onClick: changeAccountDetails, className: "btn-g" }
          ],
          inputsArray: [
            { title: "Name", type: "text", placeholder: "Name", className: "input-d", name: "account-name-input", maxLength: 25, defaultValue: user?.name },
            { title: "Password", type: "password", placeholder: "Password", className: "input-d", name: "account-password-input", maxLength: 50, defaultValue: user?.password },
            { title: "Profile Image", type: "text", placeholder: "Profile Image", className: "input-d", name: "account-pfp-input", maxLength: 200, defaultValue: user?.image},
            { title: "Forgot Question", type: "text", placeholder: "Forgot Question", className: "input-d", name: "account-forget-q-input", maxLength: 60, defaultValue: user?.forgetPasswordQuestion},
            { title: "Forgot Answer", type: "password", placeholder: "Forgot Answer", className: "input-d", name: "account-forget-a-input", maxLength: 40, defaultValue: user?.forgetPasswordAnswer},

          ],
          labelsArray: [
            {title: "UID",text: user?.uid, className: "input-d", canCopy:true, hidden: true},
            {title: "MID",text: user?.mid, className: "input-d", canCopy:true, hidden: true},
            {title: "Account Creation Date",text: user?.dateCreated, className: "input-d", canCopy:true},
          ],
          type: "default"
        })} className="account btn-d mt-2"><i className="fa-thin fa-user mr-1"></i> Account</div>
        <div onClick={() => setSettingsOpen(true)} className="settings btn-d mt-2 mb-2"><i className="fa-thin fa-gear mr-1"></i> Settings</div>
        
        
        
        <div onClick={()=> {
          showPopup({
            title: "Logout",
            description: "Are you sure you want to logout?",
            buttonsArray: [
              {
                text: "Cancel",
                onClick: resetPopup,
                className: "btn-d"
              },
              {
                text: "Logout",
                onClick: ()=> {setTimeout(()=>{logout(); resetPopup()},100)}, 
                className: "btn-r"
              }
            ],
            inputsArray: [],
            type: "default"
          })
        }} className="logout rounded text-white bg-main-4/80 p-2 border-[1px] border-main-3/10 mt-auto cursor-pointer uppercase !w-full flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-solid fa-left-from-bracket"></i> Logout</div>
      </div>
      <div className="content flex-1 flex flex-col relative">
        {!familyTab && ( <>
        <div className="interaction flex items-center w-full min-h-10 p-[1vw] gap-3">
            <div className="middle w-full input-d !bg-transparent border-[1px] flex items-center gap-2">
              <input onChange={(e) => setSearchInput(e.target.value)} className="w-full" placeholder="Search via family name..." type="text" />
              <i className="fa-light fa-magnifying-glass mr-1"></i>
            </div>
            <div className="right flex items-center gap-2 ml-auto">
             <div onClick={()=> {
               showPopup({
                 title: "Add FAMILY",
                 description: "Select how you want to add a family.",
                 buttonsArray: [
                   {text: "Cancel",onClick: resetPopup,className: "btn-d"},
                   {text: "Create",onClick: ()=> {
                    resetPopup();
                    handleCreateFamily();
                   },className: "btn-g"},
                   {text: "Join",onClick: () =>{ 
                    resetPopup();
                    handleJoinFamily()
                  }, className: "btn-g"},
                 ],
                 inputsArray: [],
                 type: "default"
               })
             }} className="plusicon rounded text-white bg-main-4/30 p-2 border-[1px] border-main-3/10 mt-auto cursor-pointer uppercase !w-full flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-regular fa-plus-large"></i></div>
            </div>
        </div>

        <div className="familiesContainer flex flex-wrap gap-5 p-5 overflow-x-hidden overflow-y-auto">
         {[...user?.families || [], ...user?.joinedFamilies || []]
         .filter((family : any) => family?.name?.toLowerCase().includes(searchInput.toLowerCase()))
         .sort((a : any, b : any) => a.name.localeCompare(b.name))
         .map((family : any,index : number) => (
           <FamilyBox click={() => {setFamilyTab(family?.name);if (localStorage.getItem("disableFamilyColorsOverlay") !== "true") setRootVariablesBulk([
            {key: "--bg", value: family?.color},
            {key:"--main3", value: family?.color}
           ])}} key={index} index={index} data={family}/>
         ))}
        </div>

        {user?.families?.length === 0 && user?.joinedFamilies?.length === 0 && 
        <div className="pointer-events-none absolute text-3xl max-lg:text-xl max-2xl:text-2xl w-full h-full flex items-center justify-center uppercase font-bold text-bg">
          You have no families yet
        </div>
        }
        </>)}


        {familyTab && (
          <Tab backFunction={setFamilyTab} name={familyTab}/>
        )} 
        
      </div>
    </div>
    }
    {(!user?.uid || !user?.name || !user?.password) && !heavyLoading && <Auth/>}
    
    </>
    
    


  )
}

export default App
