import { useGlobal } from "../hooks/useGlobal";


export default function PatchNotesBox() {
  const { version, patchNotes, setShowingPatchNotes } = useGlobal();

  return (
    <div style={{background: "var(--window)"}} className="absolute left-0 top-8 w-screen h-[calc(100vh-2rem)] z-40 flex items-center justify-center">
      <div className="box border-[1px] border-white/20 rounded min-w-[500px] w-[60vw] max-w-[700px] h-[80vh] bg-[#ffffff10] flex flex-col p-2">
            <div className="title w-full text-center text-lg text-fore relative">Patch Notes {version} <i onClick={()=> setShowingPatchNotes(false)} className="fa-solid fa-circle-xmark cursor-pointer absolute right-1 top-1 text-xl hover:brightness-110"></i></div>

            <div className="notes flex flex-col gap-2 overflow-y-auto h-full p-2">
                {patchNotes && Object.keys(patchNotes).map((type: string) => (
                    <div key={type} className="note-type">
                        <div className="type-title text-lg font-bold text-fore">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                        <ul className="list-disc pl-5">
                            {patchNotes[type].map((note: string, index: number) => (
                                <li key={index} className="text-fore-2">{note}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
      </div>
    </div>
  )
}
