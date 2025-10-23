import { GetTotalMembers, IsInRoles, IsStaff } from "../functions/dbhelper";
import { isValidHexColor, isValidUrl, obscureString, sendLog } from "../functions/scripts";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import { supabase } from "../functions/supabase";
import { Fragment } from "react/jsx-runtime";

export default function TabFamiliySettings({family} : {family : any}) {
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal(); 

  function handleNameChange() {
    const oldName = family?.name
    async function confirm() {
      if (!popupInputs?.current["family-settings-name-input"]) {
        setPopupInfo("Please enter a family name.", "red");
        return;
      }
      if (popupInputs?.current["family-settings-name-input"] === oldName) {
        setPopupInfo("Family name is unchanged.", "red");
        return;
      }

      const {data,error} = await supabase
      .from("families")
      .select("*")
      .eq("name",popupInputs?.current["family-settings-name-input"])
      .maybeSingle()

      if (error) {
        setPopupInfo("Error checking family name.", "red");
        return;
      }
      if (data) {
        setPopupInfo("Family name already exists.", "red");
        return;
      }

      const {error:err} = await supabase
      .from("families")
      .update({
        name: popupInputs?.current["family-settings-name-input"],
      })
      .eq("name",family?.name)
      .maybeSingle()

      if (err) {
        setPopupInfo("Error updating family name.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: "Family name updated successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        oldFamilyName: oldName,
        newFamilyName: popupInputs?.current["family-settings-name-input"],
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family Name Changed",16776960)
    }


    popupInputs.current["family-settings-name-input"] = oldName

    showPopup({
      title: "Change Family Name",
      description: "Enter the new family name.",
      inputsArray: [
        {
          title: "Name",
          type: "text",
          className: "input-d",
          name: "family-settings-name-input",
          placeholder: "Enter new family name",
          defaultValue: family?.name,
          maxLength:25,
        }
      ],
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Save", className: "btn-g", onClick:confirm}
      ]
    })
  }

  function handlePasswordChange() {
    const oldPassword = family?.password
    async function confirm() {
      if (popupInputs?.current["family-settings-password-input"] === oldPassword) {
        setPopupInfo("Family password is unchanged.", "red");
        return;
      }

      const {error} = await supabase
      .from("families")
      .update({
        password: popupInputs?.current["family-settings-password-input"] || null,
      })
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        setPopupInfo("Error updating family password.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: "Family password updated successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        oldPassword: oldPassword,
        newPassword: obscureString(popupInputs?.current["family-settings-password-input"]),
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family Password Changed",16776960)
    }


    popupInputs.current["family-settings-password-input"] = oldPassword

    showPopup({
      title: "Change Family Password",
      description: "Enter the new family password.",
      inputsArray: [
        {
          title: "Password",
          type: "text",
          className: "input-d",
          name: "family-settings-password-input",
          placeholder: "Enter new family password",
          defaultValue: family?.password,
          maxLength:50,
        }
      ],
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Save", className: "btn-g", onClick:confirm}
      ]
    }) 
  }

  function handleLogoChange() {
    const oldLogo = family?.logoUrl
    async function confirm() {
      if (popupInputs?.current["family-settings-logo-input"] === oldLogo) {
        setPopupInfo("Family logo is unchanged.", "red");
        return;
      }

      if (!isValidUrl(popupInputs?.current["family-settings-logo-input"])) {
        setPopupInfo("Invalid logo URL.", "red");
        return;
      }

      const {error} = await supabase
      .from("families")
      .update({
        logoUrl: popupInputs?.current["family-settings-logo-input"] || null,
      })
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        setPopupInfo("Error updating family logo.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: "Family logo updated successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        oldLogo: oldLogo,
        newLogo: popupInputs?.current["family-settings-logo-input"],
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family Logo Changed",16776960)
    }


    popupInputs.current["family-settings-logo-input"] = oldLogo

    showPopup({
      title: "Change Family Logo",
      description: "Enter the new family logo URL.",
      inputsArray: [
        {
          title: "Logo URL",
          type: "text",
          className: "input-d",
          name: "family-settings-logo-input",
          placeholder: "Enter new family logo URL",
          defaultValue: family?.logoUrl,
        }
      ],
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Save", className: "btn-g", onClick:confirm}
      ]
    })
  }

  function handleColorChange() {
    const oldColor = family?.color
    async function confirm() {
      if (popupInputs?.current["family-settings-color-input"] === oldColor) {
        setPopupInfo("Family color is unchanged.", "red");
        return;
      }

      if (!popupInputs?.current["family-settings-color-input"].startsWith("#")) {
        setPopupInfo("Add a # before the code.", "red");
        return;
      }

      if (!isValidHexColor(popupInputs?.current["family-settings-color-input"])) {
        setPopupInfo("Invalid color format.", "red");
        return;
      }

      const {error} = await supabase
      .from("families")
      .update({
        color: popupInputs?.current["family-settings-color-input"] || null,
      })
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        setPopupInfo("Error updating family color.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: "Family color updated successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        oldColor: oldColor,
        newColor: popupInputs?.current["family-settings-color-input"],
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family Color Changed",16776960)
    }


    popupInputs.current["family-settings-color-input"] = oldColor

    showPopup({
      title: "Change Family Color",
      description: "Enter the new family color.",
      inputsArray: [
        {
          title: "Color",
          type: "text",
          className: "input-d",
          name: "family-settings-color-input",
          placeholder: "Enter new family color",
          defaultValue: family?.color,
        }
      ],
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Save", className: "btn-g", onClick:confirm}
      ]
    })
  }

  function handleDefaultRoleChange() {
    const oldRole = family?.defaultRole
    const roles = Object.keys(family?.roles || {})


    async function setDefaultRole(role: string) {
      const {error} = await supabase
      .from("families")
      .update({
        defaultRole: role || null,
      })
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        setPopupInfo("Error updating family default role.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: "Family default role updated successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        oldRole: oldRole,
        newRole: role,
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family Default Role Changed",16776960)
    }

    showPopup({
      title: "Change Default Role",
      description: "Default role is the role assigned to new members and is also used as a fallback role, You cannot delete or rename it.",
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        ...roles
        .filter((role : string) => role !== oldRole)
        .map((role : string) => {
          return {
            text: role,
            className: "btn-g",
            onClick: ()=> setDefaultRole(role),
          }
        }) 
      ]
    })
  }

  function handleMaxCountChange() {
    const oldCount = family?.maxMembers
    async function confirm() {
      if (popupInputs?.current["family-settings-maxcount-input"] === oldCount) {
        setPopupInfo("Family max count is unchanged.", "red");
        return;
      }

      if (isNaN(popupInputs?.current["family-settings-maxcount-input"])) {
        setPopupInfo("Invalid max count format.", "red");
        return;
      }

      if (parseInt(popupInputs?.current["family-settings-maxcount-input"]) < 1) {
        setPopupInfo("Max count must be greater than 0.", "red");
        return;
      }

      if (parseInt(popupInputs?.current["family-settings-maxcount-input"]) > 30) {
        setPopupInfo("Max count must be less than 30.", "red");
        return;
      }


      if (parseInt(popupInputs?.current["family-settings-maxcount-input"]) < GetTotalMembers(family)) {
        setPopupInfo(`This family already has ${GetTotalMembers(family)} Members, You cannot set the max count less than that.`, "red");
        return;
      }

      const {error} = await supabase
      .from("families")
      .update({
        maxMembers: parseInt(popupInputs?.current["family-settings-maxcount-input"]) || 30,
      })
      .eq("name",family?.name)
      .maybeSingle()

      if (error) {
        setPopupInfo("Error updating family max count.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: "Family max count updated successfully.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        oldCount: oldCount,
        newCount: parseInt(popupInputs?.current["family-settings-maxcount-input"]),
        staffName: user?.name,
        staffUID: user?.uid,
      },"Family Max Count Changed",16776960)
    }


    popupInputs.current["family-settings-maxcount-input"] = oldCount

    showPopup({
      title: "Change Family Max Count",
      description: "Enter the new family max count.",
      inputsArray: [
        {
          title: "Max Count",
          type: "number",
          className: "input-d",
          name: "family-settings-maxcount-input",
          placeholder: "Enter new family max count",
          defaultValue: family?.maxMembers,
        }
      ],
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Save", className: "btn-g", onClick:confirm}
      ]
    })
  }

  async function removeManagerRole(role: string) {
    const oldArray = family?.managerRoles || []
    const newArray = oldArray.filter((r : string) => r !== role)

    showPopup({
      title: "Remove Manager Role",
      description: `Are you sure you want to remove ${role} from the manager roles?`,
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Remove", className: "btn-g", onClick:async () => {
          const {error} = await supabase
          .from("families")
          .update({
            managerRoles: newArray || [],
          })
          .eq("name",family?.name)
          .maybeSingle()

          if (error) {
            setPopupInfo("Error removing manager role.", "red");
            return;
          }

          resetPopup()

          showPopup({
            title: "Success",
            description: `${role} removed from manager roles successfully.`,
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
          })

          sendLog(family,"Family", {
            role: role,
            oldArray: oldArray,
            newArray: newArray,
            staffName: user?.name,
            staffUID: user?.uid,
          },"Manager Role Removed",16776960)
        }}
      ]
    })
  }

  function handleAddManagerRole() {
    showPopup({
      title: "Add Manager Role",
      description: "Select a role to add to the manager roles.",
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        ...Object.keys(family?.roles || {})
        .filter((role : string) => !family?.managerRoles?.includes(role))
        .map((role : string) => {
          return {
            text: role,
            className: "btn-g",
            onClick: async () => {
              const oldArray = family?.managerRoles || []
              const newArray = [...(family?.managerRoles || []), role]
              const {error} = await supabase
              .from("families")
              .update({
                managerRoles: newArray || [],
              })
              .eq("name",family?.name)
              .maybeSingle()

              if (error) {
                setPopupInfo("Error adding manager role.", "red");
                return;
              }

              resetPopup()

              showPopup({
                title: "Success",
                description: `${role} added to manager roles successfully.`,
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
              })

              sendLog(family,"Family", {
                role: role,
                oldArray: oldArray,
                newArray: newArray,
                staffName: user?.name,
                staffUID: user?.uid,
              },"Manager Role Added",16776960)
            }
          }
        })
      ]
    })
  }

  async function unbanMember(id: string) {
    showPopup({
      title: "Unban Member",
      description: `Are you sure you want to unban ${family?.bannedUsers[id]?.name}?`,
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Unban", className: "btn-r", onClick:async () => {
          const oldData = family?.bannedUsers || {}
          const newData = {...oldData}
          delete newData[id]

          const {error} = await supabase
          .from("families")
          .update({
            bannedUsers: newData || {},
          })
          .eq("name",family?.name)
          .maybeSingle()

          if (error) {
            setPopupInfo("Error unbanning member.", "red");
            return;
          }

          resetPopup()

          showPopup({
            title: "Success",
            description: `${oldData[id]?.name} unbanned successfully.`,
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
          })

          sendLog(family,"Family", {
            username: oldData[id]?.name,
            banData: oldData[id],
            staffName: user?.name,
            staffUID: user?.uid,
          },"Member Unbanned",16776960)
        }}
      ]
    })
  }

  async function handleChangeWebhook(type: string) {
    if (popupInputs && popupInputs.current) {
      popupInputs.current[`family-settings-${type}-webhook-input`] = family?.webhooks[type] || "";
    }

    showPopup({
      title: "Change Webhook",
      description: `Enter the new ${type} webhook URL.`,
      inputsArray: [
        {
          title: "Webhook URL",
          type: "text",
          className: "input-d",
          name: `family-settings-${type}-webhook-input`,
          placeholder: `Enter new ${type} webhook URL`,
          defaultValue: family?.webhooks[type],
        }
      ],
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Save", className: "btn-g", onClick:async () => {


          if (popupInputs?.current[`family-settings-${type}-webhook-input`] && !isValidUrl(popupInputs?.current[`family-settings-${type}-webhook-input`])) {
            setPopupInfo("Invalid webhook URL.", "red");
            return;
          }

          const oldWebhook = family?.webhooks[type]

          const {error} = await supabase
          .from("families")
          .update({
            webhooks: {
              ...family?.webhooks,
              [type]: popupInputs?.current[`family-settings-${type}-webhook-input`],
            }
          })
          .eq("name",family?.name)
          .maybeSingle()

          if (error) {
            setPopupInfo("Error updating family webhook.", "red");
            return;
          }

          resetPopup()

          showPopup({
            title: "Success",
            description: `Family ${type} webhook updated successfully.`,
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
          })


          
          await sendLog(family,"Family", {
            type: type,
            oldWebhook: oldWebhook,
            newWebhook: popupInputs?.current[`family-settings-${type}-webhook-input`],
            staffName: user?.name,
            staffUID: user?.uid,
          },`Webhook Changed`,16776960)
        }}
      ]
    })
  }


  function transferOwership() {
    async function transfer() {
      if (!popupInputs?.current["family-settings-transfer-fn-input"]) {
        setPopupInfo("Please the family name.", "red");
        return;
      }
      if (popupInputs?.current["family-settings-transfer-fn-input"] !== family?.name) {
        setPopupInfo(`"${popupInputs?.current["family-settings-transfer-fn-input"]}" is not the current family name.`, "red");
        return;
      }
      if (!popupInputs?.current["family-settings-transfer-id-input"]) {
        setPopupInfo("Please enter the new owner's uid.", "red");
        return;
      }

      if (!IsInRoles(popupInputs?.current["family-settings-transfer-id-input"], family?.members)) {
        setPopupInfo("The new owner must be a member of this family.", "red");
        return;
      }

      if (popupInputs?.current["family-settings-transfer-id-input"] === user?.uid) {
        setPopupInfo("You cannot transfer ownership to yourself.", "red");
        return;
      }

      

      const {data,error} = await supabase
      .from("users")
      .select("*")
      .eq("uid",popupInputs?.current["family-settings-transfer-id-input"])
      .maybeSingle()

      if (error || !data) {
        console.log(error)
        setPopupInfo("Error transferring ownership.", "red");
        return;
      }

      const {error:err} = await supabase
      .from("families")
      .update({
        creator: popupInputs?.current["family-settings-transfer-id-input"] || user?.uid,
      })
      .eq("name",family?.name)
      .maybeSingle()
      
      if (err) {
        setPopupInfo("Error transferring ownership.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: `Ownership transferred to ${data?.name} (${popupInputs?.current["family-settings-transfer-id-input"]}) successfully.`,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })

      sendLog(family,"Family", {
        newOwner: popupInputs?.current["family-settings-transfer-id-input"],
        oldOwner: {
          name: user?.name,
          uid: user?.uid
        }
      },"Ownership Transferred",16711680)

    }

    if (family?.creator !== user?.uid) {
      showPopup({
        title: "Error",
        description: "You are not the owner of this family.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return;
    }

    showPopup({
      title: "Transfer Ownership",
      description: "Enter the family name and the uid of the user you want to make the new owner of this family, After the transfer you cannot give yourself the ownership back unless the new owner gives it to you.",
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Transfer", className: "btn-r", onClick:transfer}
      ],
      inputsArray: [
        {title: "Family Name", type: "text", className: "input-d", name: "family-settings-transfer-fn-input", placeholder: "Enter family name", maxLength:25},
        {title: "User Id", type: "text", className: "input-d", name: "family-settings-transfer-id-input", placeholder: "Enter new owner's uid", maxLength:100},
      ],
      type: "red"
    })
  }

  function handleDeleteFamily() {

    async function deleteFamily() {
      if (!popupInputs?.current["family-settings-delete-fn-input"]) {
        setPopupInfo("Please enter the family name.", "red");
        return;
      }
      if (popupInputs?.current["family-settings-delete-fn-input"] !== family?.name) {
        setPopupInfo(`"${popupInputs?.current["family-settings-delete-fn-input"]}" is not the current family name.`, "red");
        return;
      }


      await sendLog(family,"Family", {
        familyName: family?.name,
        deletedBy: {
          name: user?.name,
          uid: user?.uid
        },
      },"Family Deleted",16711680)

      const {error} = await supabase
      .from("families")
      .delete()
      .eq("name",popupInputs?.current["family-settings-delete-fn-input"])

      if (error) {
        setPopupInfo("Error deleting family.", "red");
        return;
      }

      resetPopup()

      showPopup({
        title: "Success",
        description: `Family ${family?.name} deleted successfully.`,
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      
    }


    if (family?.creator !== user?.uid) {
      showPopup({
        title: "Error",
        description: "You are not the owner of this family.",
        buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
      })
      return;
    }

    showPopup({
      title: "Delete Family",
      description: "Are you sure you want to delete this family? This action cannot be undone.",
      buttonsArray: [
        {text: "Close", className: "btn-d", onClick:resetPopup},
        {text: "Delete", className: "btn-r", onClick:deleteFamily}
      ],
      inputsArray: [
        {title: "Family Name", type: "text", className: "input-d", name: "family-settings-delete-fn-input", placeholder: "Enter family name", maxLength:25},
      ],
      type: "red"
    })
  }

  return (
    <>
    {IsStaff(family,user) && 
    <div className="relative w-full h-full animte-fade-F-Y-T-B-in-ALL-CHILD">
        <div className="flex flex-col gap-5 w-full h-full p-2 overflow-y-auto">
      <div className="title text-xl rounded text-fore-2/80 uppercase  bg-main-2/20 w-full flex justify-center items-center gap-3">
      <i className="fa-solid fa-circle-info"></i> Family Info
      </div>
      <div className="info w-full grid grid-cols-[repeat(2,minmax(200px,1fr))] gap-5 text-fore-2/70">
        <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
          <div className="left flex flex-col">
           <div className="label text-sm text-fore/70">
             Family Name
           </div>
           <div className="inner flex items-center text-lg">
             {family?.name}
           </div>
          </div>
          <div onClick={handleNameChange}  className="right flex items-center">
            <div title="Change Name" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
          </div>
        </div>

        <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
          <div className="left flex flex-col">
           <div className="label text-sm text-fore/70">
             Family Password
           </div>
           <div className="inner flex items-center text-lg">
             {obscureString(family?.password) || "Not Set"}
           </div>
          </div>
          <div onClick={handlePasswordChange} className="right flex items-center">
            <div title="Change Password" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
            </div>
          </div>
        </div>

      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Family Logo
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.logoUrl || "Not Set"}
            </div>
          </div>
        </div>
        <div onClick={handleLogoChange} className="right flex items-center">
          <div title="Change Logo Url" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>

      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Family Color
          </div>
          <div className="inner flex items-center text-lg">
            <div style={{
              color: family?.color || "currentcolor",
            }} className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.color || "Not Set"}
            </div>
          </div>
        </div>
        <div onClick={handleColorChange} className="right flex items-center">
          <div title="Change Color" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Default Role
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.defaultRole || "Error"}
            </div>
          </div>
        </div>
        <div onClick={handleDefaultRoleChange} className="right flex items-center">
          <div title="Change Default Role" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Max Members Count
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.maxMembers || "Error"}
            </div>
          </div>
        </div>
        <div onClick={handleMaxCountChange} className="right flex items-center">
          <div title="Change Max Members Count" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>


      <div className="family-settings-dropdown item relative flex items-center justify-between bg-main-2/10 rounded border-1 border-main/10">
        <div className="left flex flex-col w-full overflow-y-auto">
          <div className="label text-lg text-fore/70 p-2">
            Manager Roles
          </div>
          <div style={{
            background: "var(--w-2)"
          }} className="inner backdrop-blur-3xl z-5 border-1 border-main/10 bg-main-2/10 rounded-b absolute flex-col gap-2 p-2 overflow-y-auto text-lg top-[102%] left-[-1px] max-h-[500px]">
          {family?.managerRoles?.map((role : string, index : number) => (
              <Fragment key={role}>
                {index > 0 && <div className="sep !bg-main/10"></div>}
                <div className="flex items-center justify-between p-2">{role}<i onClick={() => removeManagerRole(role)} title={`Remove ${role}`} className="fa-regular fa-xmark btn-r"></i></div>
              </Fragment>
            ))}
          </div>
        </div>
        <div className="right flex items-center p-2">
          <div onClick={handleAddManagerRole} title="Add Manager Role" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-plus"></i>
          </div>
        </div>
      </div>

      <div className="family-settings-dropdown item relative flex items-center justify-between bg-main-2/10 rounded border-1 border-main/10">
        <div className="left flex flex-col w-full overflow-y-auto">
          <div className="label text-lg text-fore/70 p-2 text-center">
            Banned Users
          </div>
          <div style={{
            background: "var(--w-2)"
          }} className="inner z-5 border-1 border-main/10 rounded-b absolute flex-col gap-2 p-2 overflow-y-auto text-lg top-[102%] left-[-1px] max-h-[500px]">
          {Object.keys(family?.bannedUsers).map((id, index : number) => (
              <>
                {index > 0 && <div className="sep !bg-main/10"></div>}
                <div className="flex items-center justify-between p-2">{family?.bannedUsers[id]?.name}<i onClick={() => unbanMember(id)} title={`Unban ${family?.bannedUsers[id]?.name}`} className="fa-regular fa-xmark btn-r"></i></div>
              </>
            ))}
          </div>
        </div>
      </div>

      </div>

      <div className="title text-xl rounded text-fore-2/80 uppercase  bg-main-2/20 w-full flex justify-center items-center gap-3">
      <i className="fa-solid fa-webhook"></i> WebHooks
      </div>
      <div className="info w-full grid grid-cols-[repeat(2,minmax(200px,1fr))] gap-5 text-fore-2/70">


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Logs Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["logs"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("logs")} title="Change Logs Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Family List Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["family_list"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("family_list")} title="Change family list Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>      


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Task Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["task"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("task")} title="Change task Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Stash Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["stash"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("stash")} title="Change stash Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>

       <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Stash Logs Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["stash_logs"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("stash_logs")} title="Change stash logs Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>       


      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Funds Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["funds"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("funds")} title="Change funds Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>

      <div className="item flex items-center justify-between bg-main-2/10 p-2 rounded border-1 border-main/10">
        <div className="left flex flex-col max-w-[70%]">
          <div className="label text-sm text-fore/70">
            Loa Webhook
          </div>
          <div className="inner flex items-center text-lg">
            <div className="text text-ellipsis text-nowrap overflow-hidden max-w-full">
              {family?.webhooks["loa"] || "Not Set"}
            </div>
          </div>
        </div>
        <div className="right flex items-center">
          <div onClick={() => handleChangeWebhook("loa")} title="Change loa Webhook" className="btn btn-d flex items-center gap-2 uppercase !p-4">
            <i className="fa-thin fa-wrench"></i>
          </div>
        </div>
      </div>


      </div>

      <div className="title text-xl rounded text-red-500 uppercase bg-main-2/20 w-full flex justify-center items-center gap-3">
      <i className="fa-solid fa-triangle-exclamation"></i> Danger Zone
      </div>
      <div className="info w-full grid grid-cols-[repeat(2,minmax(200px,1fr))] gap-5 text-fore-2/70">
          <div onClick={transferOwership} className="ownershiptransfer btn-r text-center !p-1 flex items-center gap-2 justify-center">
          <i className="fa-solid fa-people-arrows"></i> Transfer Ownership
          </div>

          <div onClick={handleDeleteFamily} className="deleteFamily btn-r text-center !p-1 flex items-center gap-2 justify-center">
          <i className="fa-solid fa-trash"></i> Delete Family
          </div>
      </div>  
    </div>
    </div>
    }
    </>
    
  )
}
