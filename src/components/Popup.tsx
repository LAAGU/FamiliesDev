import React from "react";
import { useEscape } from "../hooks/useEscape";
import { useGlobal } from "../hooks/useGlobal";
import { inputTypes, buttonTypes, lableTypes } from "../types/popupTypes";
import CopyableLabel from "./CopyableLabel";
import { obscureString } from "../functions/scripts";


export default function Popup() {
  const { popupActive, popupData, popupInputs, resetPopupData, popupInfoData,setPopupInfo} = useGlobal();

  useEscape(() => {
    resetPopupData();
  }, popupActive);


  return (
    <div className={`${popupActive ? "active" : ""} GlobalPopUpShadow backdrop-blur-xs flex items-center justify-center absolute z-30 w-full h-full left-0 top-0 bg-[#00000099]`}>
    <div className={`popup-${popupData?.type || "default"} GlobalPopUp overflow-x-hidden`}>
        <div className="title text-2xl text-[var(--secondary)] font-semibold !uppercase">{popupData?.title}</div>
        <div className="description text-[white] text-lg relative">{popupData?.description || "description not found"}</div>
        {popupData?.inputsArray?.length > 0 && (
            <div className="inputsContainer mt-auto flex flex-col w-full gap-2 p-1">
                {popupData?.inputsArray?.map((input : inputTypes, index : number) => (
                    <React.Fragment key={index}>
                    {input?.title && 
                    <div  className="w-full text-white text-base border-b-white border-b-[1px]">
                        <div>{input?.title}{input?.required && "*"}</div>
                    </div>}
                    <input onChange={(e) => popupInputs.current = {
                    ...popupInputs.current,[input?.name] : e.target.value}} 
                    className={`w-full ${input?.className}`} 
                    minLength={input?.minLength} 
                    maxLength={input?.maxLength || 300} 
                    min={input?.min} 
                    max={input?.max} 
                    pattern={input?.pattern} 
                    type={input?.type} 
                    name={input?.name} 
                    placeholder={input?.placeholder} 
                    onKeyDown={input?.onKeyDown} 
                    onKeyUp={input?.onKeyUp} 
                    onWheel={input?.onWheel}
                    onInput={input?.onInput}
                    value={input?.value}
                    defaultValue={input?.defaultValue} />
                    </React.Fragment>
                ))}
            </div>
        )}
        {popupData?.labelsArray?.length > 0 && (
          <div className="lablesHolder flex flex-col gap-2">
            {popupData?.labelsArray.map((label : lableTypes,index : number)=> (
              <React.Fragment key={index}>
                {label ?.title && 
                    <div  className="w-full text-white text-base border-b-white border-b-[1px]">
                        <div>{label?.title}</div>
                    </div>}
              <div className={label?.className + " label overflow-hidden flex items-center justify-between gap-2 !bg-transparent !border-0"}>
                <div className={`text bg-main-2/30 w-full p-1 rounded overflow-hidden text-ellipsis text-nowrap`}>{label?.hidden ? obscureString(label?.text) : label?.text}</div>
                {label?.canCopy && (
                  <CopyableLabel className="p-2 cursor-pointer btn-g" key={index} label={label} />
                )}
              </div>
              </React.Fragment>
            ))}
          </div>
        )}
        
        {popupData?.buttonsArray?.length > 0 && (
            <>
            <div className="bg-w-2/50 backdrop-blur-md p-2 !rounded border-1 border-main/3 sticky bottom-0 mt-auto flex flex-col gap-2">



            <div className={`popupInfoBox relative ${popupInfoData?.text ? "active" : "not-active"} ${popupInfoData?.className} text-white text-base p-3 rounded overflow-x-hidden flex items-center justify-between min-h-14 max-h-40`}>
              <div key={popupInfoData?.same} className="errorBox flex-1 min-w-0 overflow-x-hidden overflow-y-auto max-h-full">
                <div className="text max-w-full break-words">{popupInfoData?.text}</div>
                {popupInfoData?.same !== 0 && (
                  <span key={popupInfoData?.same}>
                    ({popupInfoData?.same})
                  </span>
                )}
              </div>
              <i
                onClick={() => setPopupInfo("", "red")}
                className="fa-thin fa-circle-xmark cursor-pointer hover:scale-110 text-lg shrink-0 ml-2"
              ></i>
            </div>
   

            <div className="buttonsContainer w-full grid grid-cols-3 gap-3">
            {popupData?.buttonsArray?.length === 1 && <div />}
            {popupData?.buttonsArray?.length === 2 && <div />}
          
            {popupData?.buttonsArray?.map((button: buttonTypes, index: number) => (
              <button key={index} onClick={button?.onClick} className={`text-nowrap ${button?.className}`}>
                {button?.text}
              </button>
            ))}
          </div>
            </div>
            
            </>
            
        )}
    </div>
    </div>
  )
}
