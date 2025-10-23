import { useState, useRef } from "react";
import { useGlobal } from "../hooks/useGlobal";

export default function ConsolePanel() {
  const {
    consolePanel,
    consoleItems,
    runCommand,
     consoleAutoScroll, setConsoleAutoScroll,
     terminationCountdown
  }: {
    consolePanel: boolean;
    consoleItems: any[];
    runCommand: (name: string, args: any) => void;
    consoleAutoScroll: boolean;
    setConsoleAutoScroll: (value: boolean) => void;
    terminationCountdown: boolean;
  } = useGlobal();

  const [usedCommands, setUsedCommands] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleArrowUp = () => {
    if (usedCommands.length === 0) return;

    const newIndex =
      historyIndex === null ? usedCommands.length - 1 : Math.max(historyIndex - 1, 0);
    setHistoryIndex(newIndex);
    if (inputRef.current) {
      inputRef.current.value = usedCommands[newIndex];
    }
  };

  const handleArrowDown = () => {
    if (usedCommands.length === 0) return;

    const newIndex =
      historyIndex === null
        ? 0
        : Math.min(historyIndex + 1, usedCommands.length - 1);

    setHistoryIndex(newIndex);
    if (inputRef.current) {
      inputRef.current.value = usedCommands[newIndex];
    }
  };

  return (
    <div
      id="console"
      style={{ display: consolePanel ? "flex" : "none",opacity: terminationCountdown ? "0.9" : "1" }}
      className="absolute p-2 gap-2 left-0 top-8 w-full min-h-[300px] h-[40vh] max-h-[600px] bg-[#00000075] z-60 backdrop-blur-sm border-b-[1px] border-main-3/5 flex flex-col"
    >
      <div
        id="console-chat"
        className="chat flex flex-col overflow-y-auto w-full h-full select-text"
      >
        {consoleItems.map((item: any, index: number) => (
          <div key={index} className="text-white console-chatarea">
            {item}
          </div>
        ))}
      </div>  

      <div style={{ opacity: terminationCountdown ? "0" : "1" }} className="input flex items-center gap-2">
        <input
          type="text"
          id="console-input"
          ref={inputRef}
          className="flex-1 bg-[#9292922a] text-fore-2 outline-none p-0.5 h-7"
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              handleArrowUp();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              handleArrowDown();
            } else if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
              const command = e.currentTarget.value.trim();
              const [cmdName, ...args] = command.split(" ");
              runCommand(cmdName, args.join(" "));

              setUsedCommands((prev) =>
                prev[prev.length - 1] !== command ? [...prev, command] : prev
              );
              setHistoryIndex(null);
              e.currentTarget.value = "";
            }
          }}
        />

        <div className="autoScrollToggle flex items-center gap-2">
          <div onClick={() => {setConsoleAutoScroll(!consoleAutoScroll);localStorage.setItem('consoleAutoScroll', JSON.stringify(!consoleAutoScroll))}} className="toggle bg-[#9292922a] w-7 h-7 cursor-pointer flex justify-center items-center hover:bg-[#c2c2c22a]">
            {consoleAutoScroll && (
              <i className={`fa-solid fa-check text-blue-400`}></i>
            )}
          </div>
          <div className="title text-white text-xs">Auto Scroll</div>
        </div>
      </div>
    </div>
  );
}
