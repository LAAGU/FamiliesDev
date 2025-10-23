import { useState } from "react";
import { copyTextToClipboard } from "../functions/scripts";

export default function CopyableLabel({ label,className,tooltip } : {label: any,className?: string,tooltip?: string}) {
    const [copied, setCopied] = useState(false);
  
    function handleCopy() {
      copyTextToClipboard(label?.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  
    return label?.canCopy ? (
      <div title={tooltip || "Copy to clipboard"}
        onClick={handleCopy}
        className={"copyBtn h-full rounded cursor-pointer p-1 pl-3 pr-3 text-base bg-main-4/80 text-white hover:bg-main-4/100 border-main-3/5 border-[1px] " + className ? className : ""}
      >
        <i className={`fa-solid ${copied ? "fa-check text-green-700" : "fa-copy"}`}></i>
      </div>
    ) : null;
  }
  