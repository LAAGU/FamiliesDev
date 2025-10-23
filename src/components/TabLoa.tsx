import { useRef, useState } from "react"
import { usePopup } from "../hooks/usePopup";
import { useGlobal } from "../hooks/useGlobal";
import { sendLoa } from "../functions/scripts";

export default function TabLoa({family} : {family? : string | null}) {
    const {showPopup,resetPopup} = usePopup();
    const {user} = useGlobal();

    const ref1 = useRef<any>()
    const ref2 = useRef<any>()
    const ref3 = useRef<any>()
    
    const defaultInputValues = {
        buttonText: "Send Report",
        startDate: "",
        endDate: "",
        reason: ""
    }

    const [inputData,setInputData] = useState(defaultInputValues)
    
    const [loading,setLoading] = useState(false)



    async function handleSubmit() {
        const date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear()
        if (localStorage.getItem("loaStatus") === date.toString()) {
            showPopup({
                title: "Error",
                description: "You have already submitted a leave of absence report today.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })
            return
        }

        setLoading(true)
        setInputData(prev=> ({...prev, buttonText: ""}))

        await sendLoa(family,user, inputData)

        localStorage.setItem("loaStatus", date)

        if (ref1.current) ref1.current.value = ""
        if (ref2.current) ref2.current.value = ""
        if (ref3.current) ref3.current.value = ""

        setInputData(prev=> ({
            ...prev,
            buttonText: "Sent !",
            startDate: "",
            endDate: "",
            reason: ""
        }))

        setTimeout(()=> {
            setInputData(defaultInputValues)
            setLoading(false)
        }, 1000)


    }

    return (
    <div className="w-full h-full min-h-[300px] overflow-hidden shadow relative flex flex-col items-center justify-center gap-2">
      {loading && (
        <div className="absolute rounded animate-pulse bg-fore-2/10 z-5 flex flex-col gap-2 overflow-y-auto min-w-[300px] w-[70%] max-w-[100%] h-[70%]"></div>
      )}
      <div className="relative animate-loa-box overflow-y-auto flex flex-col gap-2 backdrop-blur-md min-w-[300px] w-[70%] max-w-[100%] h-[70%] input-d !p-2">
        <div className="title text-fore-2">Send a leave of absence report to family managers.</div>
        <div className="sep !bg-fore-2"></div>
        <div className="startDate w-full">
          <div className="title font-bold text-fore-2">Start Date</div>
          <input ref={ref1} onChange={(e) => setInputData({...inputData, startDate: e.target.value})} maxLength={20} placeholder="dd/mm/yy" type="text" className="input-d w-full" />
        </div>
        <div className="sep !bg-fore-2/20"></div>
        <div className="startDate w-full">
          <div className="title font-bold text-fore-2">End Date</div>
          <input ref={ref2} onChange={(e) => setInputData({...inputData, endDate: e.target.value})} maxLength={20} placeholder="dd/mm/yy" type="text" className="input-d w-full" />
        </div>

        <div className="sep !bg-fore-2/20"></div>    
        <div className="startDate w-full h-full flex flex-col">
          <div className="title font-bold text-fore-2">Reason for Loa</div>
          <textarea ref={ref3} onChange={(e) => setInputData({...inputData, reason: e.target.value})} maxLength={300}  placeholder="cannot work due to...." className="input-d w-full flex-1 resize-none" />
        </div>
        <div className="sep !bg-fore-2/20"></div>
        
      </div>

      <div className="btns flex items-center min-w-[300px] w-[70%] max-w-[100%]">
            <button onClick={handleSubmit} className={`btn-d !p-4 !text-base w-full flex items-center justify-center gap-2 ${!inputData?.startDate || !inputData?.endDate || !inputData?.reason ? "disabled" : ""}`}>{inputData?.buttonText}{inputData?.buttonText !== "Send Report" && <i className="fa-regular fa-spinner-third fa-spin"></i>}</button>
        </div>
    </div>
  )
}
