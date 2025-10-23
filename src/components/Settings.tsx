import { useGlobal } from "../hooks/useGlobal"
import { useEscape } from "../hooks/useEscape"
import { getRootVariables, resetPermanentVariables, setPermanentRootVariables } from "../functions/scripts"
import { useEffect, useState, useRef } from "react"
import { usePopup } from "../hooks/usePopup";
import { SEND } from "../functions/ipc";
import Toggle from "./Toggle";

export default function Settings() {
  const { showPopup, resetPopup } = usePopup();
  const { setSettingsOpen, currentFamily } = useGlobal();

  const [color1, setColor1] = useState("#ffffff")
  const [color2, setColor2] = useState("#ffffff")
  const [color3, setColor3] = useState("#ffffff")

  const [familyColorsOverlay, setFamilyColorsOverlay] = useState(
    localStorage.getItem("disableFamilyColorsOverlay") === "true"
  )


  const oldColorSet = useRef<{ color1: string; color2: string }>({
    color1: localStorage.getItem("disableFamilyColorsOverlay") !== "true" ? getRootVariables("--def-main3") : currentFamily?.color || getRootVariables("--def-main3"),
    color2: localStorage.getItem("disableFamilyColorsOverlay") !== "true" ? getRootVariables("--def-bg") : currentFamily?.color || getRootVariables("--def-bg"),
  })


  function setColorsOverlay(value: boolean) {
    const root = document.documentElement;

    if (value) {
      oldColorSet.current = {
        color1: getRootVariables("--main3") || "#ffffff",
        color2: getRootVariables("--bg") || "#ffffff",
      };

      root.style.setProperty("--main3", getRootVariables("--def-main3") || "#ffffff");
      root.style.setProperty("--bg", getRootVariables("--def-bg") || "#ffffff");

    } else {
      root.style.setProperty("--main3", oldColorSet?.current?.color1 || "#ffffff");
      root.style.setProperty("--bg", oldColorSet?.current?.color2 || "#ffffff");
    }

    localStorage.setItem("disableFamilyColorsOverlay", value.toString());
    setFamilyColorsOverlay(value);
  }

  useEscape(() => {
    setSettingsOpen(false)
  })

  useEffect(() => {
    setColor1(getRootVariables("--w-1") || "#ffffff")
    setColor2(getRootVariables("--w-2") || "#ffffff")
    setColor3(getRootVariables("--def-bg") || getRootVariables("--def-main3") || "#ffffff")
  }, [])

  const handleChange1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor1(e.target.value)
    setPermanentRootVariables("--w-1", e.target.value)
  }

  const handleChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor2(e.target.value)
    setPermanentRootVariables("--w-2", e.target.value)
  }

  const handleChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor3(e.target.value)
    setPermanentRootVariables("--def-bg", e.target.value)
    setPermanentRootVariables("--def-main3", e.target.value)
  }

  const handleReset = () => {
    showPopup({
      title: "Reset Colors",
      description: "Are you sure you want to reset your colors? This will reset all colors to their default values.",
      buttonsArray: [
        {
          text: "Cancel",
          className: "btn-d",
          onClick: resetPopup
        },
        {
          text: "Reset",
          className: "btn-r",
          onClick: () => {
            resetPermanentVariables(["--w-1", "--w-2", "--def-bg", "--def-main3"])
            setColor1(getRootVariables("--w-1") || "#ffffff")
            setColor2(getRootVariables("--w-2") || "#ffffff")
            setColor3(getRootVariables("--def-bg") || getRootVariables("--def-main3") || "#ffffff")
            resetPopup()

            showPopup({
              title: "Colors Reset",
              description: "All colors have been reset to their default values.",
              buttonsArray: [
                {
                  text: "Close",
                  className: "btn-d",
                  onClick: resetPopup
                }
              ]
            })
          }
        }
      ]})
  }


  function handleResetLocalData() {
    function confirm() {
      resetPopup()
      localStorage.removeItem("client");
      localStorage.removeItem("lastTab");
      localStorage.removeItem("lastFamily");
      SEND("checkUpdate")
      window.location.reload();
    }

    showPopup({
      title: "Reset Local Data",
      description: "Are you sure you want to reset your local data? You will logout from the current account.",
      buttonsArray: [
        {
          text: "Cancel",
          className: "btn-d",
          onClick: resetPopup
        },
        {
          text: "Reset",
          className: "btn-r",
          onClick: confirm
        }
      ]
    })
  }

  return (
    <div className="absolute z-20 w-screen h-screen flex flex-col items-center bg-[#000000a3] backdrop-blur-sm">
      <div style={{ background: "var(--window)" }} className="contentBox animate-SettingsBox border-[1px] border-main-4/80 relative flex flex-col gap-2 mt-[5%] w-[clamp(400px,60%,600px)] min-h-[80%] max-h-[80%] overflow-y-auto p-2 rounded">
        <div className="title text-lg text-fore/80 self-center font-bold">
          App Settings{" "}
          <i
            onClick={() => setSettingsOpen(false)}
            className="fa-thin fa-circle-xmark absolute right-2 top-4 cursor-pointer hover:text-fore"
          ></i>
        </div>

        <div className="bg-colorsChange flex flex-col w-full">
          <div title="Modify your layout colors" className="title text-lg text-fore/80 font-bold flex items-center gap-1">
            Layout Colors{" "}
            <i title="Reset Colors"
              onClick={handleReset}
              className="fa-light fa-rotate-reverse cursor-pointer text-base mt-1 p-2 hover:bg-fore/10 rounded"
            ></i>
          </div>
          <div className="inputs flex items-center gap-2">
            <input title="Background Color"
              className="cursor-pointer"
              value={color1}
              onChange={handleChange1}
              type="color"
            />
            <input title="Background Color 2"
              className="cursor-pointer"
              value={color2}
              onChange={handleChange2}
              type="color"
            />
            <input title="Foreground Color"
              className="cursor-pointer"
              value={color3}
              onChange={handleChange3}
              type="color"
            />
          </div>
        </div>

        <div className="toggles flex w-full gap-5 items-center">
          <Toggle rounded={true} description="Disable the color change that happens when you are viewing a family" outerClick={true} className="input-d !p-2" active={familyColorsOverlay} onClick={() => setColorsOverlay(!familyColorsOverlay)} title="Disable Family Color Overlay"/>
        </div>

        <div onClick={handleResetLocalData} className="resetLocalDataBtn btn-r text-center mt-auto">
          Reset Local Data
        </div>
      </div>
    </div>
  )
}
