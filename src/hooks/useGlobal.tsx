import {
    createContext,
    useContext,
    ReactNode,
    useState,
    useRef,
    useEffect
} from "react";
import { supabase } from "../functions/supabase";
import { INVOKE, SEND } from "../functions/ipc";
import { applySavedPermanentVariables, copyTextToClipboard, SendMessage } from "../functions/scripts";
import logo from "/logo.png"
import { PatchNotesData } from "../functions/patchNotes";
import { GetNameFromUID } from "../functions/dbhelper";


const GlobalStateContext = createContext<any>(null);


export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
    const [lightLoading, setLightLoading] = useState(false);
    const [heavyLoading, setHeavyLoading] = useState(false);
    const [heavyText, setHeavyText] = useState("Loading");
    const [frameTitle, setFrameTitle] = useState("Families");
    const [frameText, setFrameText] = useState("Families");
    const [frameLogo, setFrameLogo] = useState(logo);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [updateCheck, setUpdateCheck] = useState(false);
    const [updateData, setUpdateData] = useState({
        status: false,
        info: {
            "version": "fetching...",
            "progress": {
                "speed": "0 KB",
                "total": "0 MB",
                "transferred": "0 MB",
                "percent": 0
            }
        }
    });

    const [showingPatchNotes, setShowingPatchNotes] = useState<boolean>(false);
    const [version, setVersion] = useState<any>("0.0.0");
    const [patchNotes, setPatchNotes] = useState<any>({});

    const [currentFamily, setCurrentFamily] = useState<any>(null)


    const [consoleItems, setConsoleItems] = useState<any[]>([]);


    const [consoleAutoScroll, setConsoleAutoScroll] = useState<boolean>(
        localStorage.getItem("consoleAutoScroll") === "false" ? false : true
    );


    useEffect(() => {
        if (consoleAutoScroll) document.getElementById("console-chat")?.scrollTo({ top: document.getElementById("console-chat")?.scrollHeight, behavior: "smooth" })
    }, [consoleAutoScroll])

    function addConsoleItem(item: any) {
        setConsoleItems((prev: any[]) => [
            ...prev, <div className="border-b-1 border-main-3/5">{item}</div>])
        if (consoleAutoScroll) {
            setTimeout(() => {
                const consoleDiv = document.getElementById("console-chat");
                if (consoleDiv) {
                    consoleDiv.scrollTo({
                        top: consoleDiv.scrollHeight,
                        behavior: "smooth"
                    });
                }
            }, 100);
        }
    }

    const commands = [
        "quit",
        "clear",
        "mid",
        "reset-local-data",
        "get-name",
    ];

    const UnknownCommandCounter = useRef<any>({
        count: 0,
        phase: 0
    });

    const [terminationCountdown, setTerminationCountdown] = useState<boolean>(false);

    async function runCommand(command: string, args: any = []) {  // args: any left to put in the function
        if (command === "quit") {
            setTimeout(() => {
                SEND("terminateApp")
            }, 1000)
            addConsoleItem(<div className="text-error text-2xl">Quitting Application !</div>)
            return "Quitting Application";
        }


        if (command === "clear") {
            setConsoleItems([]);
            return "Console Cleared";
        }

        if (command === "help") {
            UnknownCommandCounter.current.count = 0;
            UnknownCommandCounter.current.phase = 0;
            addConsoleItem(<div className="text-blue-400 text-lg">Available Commands: <div className="flex flex-col gap-1">{commands.map((cmd: string, index: number) => <span key={cmd} className="text-white">{index + 1}. {cmd}</span>)}</div></div>)
            return "Available Commands: " + commands.join(", ");
        }

        if (command === "mid") {
            addConsoleItem(<div className="flex items-center gap-2 p-2">{user?.mid || "No MID found"} <div onClick={() => {
                copyTextToClipboard(user?.mid || "No MID found");
                addConsoleItem(<div className="text-green-700">Copied MID to clipboard!</div>)
            }} className="copy w-7 h-7 bg-fore/20 relative rounded cursor-pointer hover:bg-fore/30 active:bg-green-300/20"><i className="fa-solid fa-copy absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></i></div></div>)
            return user?.mid || "No MID found";
        }

        if (command === "reset-local-data") {
            localStorage.clear();
            window.location.reload();
            return "Local Data Reset";
        }

        if (command === "get-name") {
            if (!args) {
                addConsoleItem(<div className="text-yellow-200 text-lg">Please provide a name, usage: get-name [name]</div>)
                return "Please provide a name";
            }

            const name: any = await GetNameFromUID(args);

            if (!name) {
                addConsoleItem(<div className="text-error text-lg">Name not found for UID: {args}</div>)
                return "Name not found";
            }

            addConsoleItem(<div className="flex items-center gap-2 p-2">{name || "No Name found"} <div onClick={() => {
                copyTextToClipboard(name || "No MID found");
                addConsoleItem(<div className="text-green-700">Copied MID to clipboard!</div>)
            }} className="copy w-7 h-7 bg-fore/20 relative rounded cursor-pointer hover:bg-fore/30 active:bg-green-300/20"><i className="fa-solid fa-copy absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></i></div></div>)

            return name


        }

        if (UnknownCommandCounter.current.count >= 20 && UnknownCommandCounter.current.phase === 2) {
            setTerminationCountdown(true);
            document.getElementById("console-input")?.blur();

            const messages = [
                { text: "Retard !", className: "text-red-700 text-lg flex gap-2", delay: 0 },
                { text: "Not Fit for this app, Terminating in 5 seconds", className: "text-red-400 text-base flex gap-2", delay: 1000 },
                { text: "Terminating In 5", className: "text-red-400 text-3xl flex gap-2", delay: 2000 },
                { text: "Terminating In 4", className: "text-red-400 text-3xl flex gap-2", delay: 3000 },
                { text: "Terminating In 3", className: "text-red-400 text-3xl flex gap-2", delay: 4000 },
                { text: "Terminating In 2", className: "text-red-400 text-3xl flex gap-2", delay: 5000 },
                { text: "Terminating In 1", className: "text-red-400 text-3xl flex gap-2", delay: 6000 },
                { text: "Terminating In 0", className: "text-red-400 text-3xl flex gap-2", delay: 7000 }
            ];

            messages.forEach(({ text, className, delay }) => {
                setTimeout(() => {
                    addConsoleItem(<div className={className}>{text}</div>);
                }, delay);
            });

            setTimeout(() => {
                SEND("terminateApp");
            }, 7500);

            return "Not Fit for this app, Terminating in 5 seconds";
        }

        if (UnknownCommandCounter.current.count >= 10 && UnknownCommandCounter.current.phase === 1) {
            UnknownCommandCounter.current.phase = 2;
            return addConsoleItem(<div className="text-red-400 text-lg flex gap-2">Stop spamming and try the command <span className="text-white">help</span> !</div>)
        }

        if (UnknownCommandCounter.current.count >= 5 && UnknownCommandCounter.current.phase === 0) {
            UnknownCommandCounter.current.phase = 1;
            return addConsoleItem(<div className="text-blue-400 text-sm flex gap-2">Maybe Try <span className="text-white">help</span>?</div>)
        }



        addConsoleItem(<div className="text-error text-sm flex gap-2">Unknown Command: <div className="text-white">{command}</div></div>)
        UnknownCommandCounter.current.count += 1;

    }

    const [consolePanel, setConsolePanel] = useState<boolean>(false);



    useEffect(() => {
        function handleKeyUp(e: KeyboardEvent) {
            if (e.key === "F8") {
                setConsolePanel(prev => {
                    if (!prev) {
                        setTimeout(() => document.getElementById("console-input")?.focus(), 50)
                    }
                    return !prev
                });

            }
        }

        document.addEventListener("keyup", handleKeyUp);

        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        function handleStartUpdate() {
            setUpdateData(prev => ({ ...prev, status: true }));
            setUpdateCheck(true)
        }
        function handleDownloadProgress(_: any, data: any) {
            setUpdateData(prev => ({ ...prev, info: data }));
        }
        function handleNoUpdate() {
            setUpdateCheck(true)
        }

        async function handleFetchPatchCheck() {
            const version = await INVOKE("getVersion")
            setVersion(version);

            if (version.toString() !== localStorage.getItem("version")) {
                setPatchNotes(PatchNotesData)
                setShowingPatchNotes(true);
                localStorage.setItem("version", version.toString());
            }
        }

        handleFetchPatchCheck()

        window.ipcRenderer.on('startUpdate', handleStartUpdate);
        window.ipcRenderer.on('update-progress', handleDownloadProgress);
        window.ipcRenderer.on("noUpdate", handleNoUpdate)

        return () => {
            window.ipcRenderer.off('startUpdate', handleStartUpdate);
            window.ipcRenderer.off('update-progress', handleDownloadProgress);
            window.ipcRenderer.off('noUpdate', handleNoUpdate);
        };
    }, []);





    function setFrameLogoUrl(url: string) {
        setTimeout(() => {
            setFrameLogo(url);
        }, 200)
    }

    useEffect(() => {
        applySavedPermanentVariables()
    }, [])

    useEffect(() => {
        setTimeout(() => {
            setFrameTitle(frameText || "Families")
        }, 200)
    }, [frameText])

    useEffect(() => {
        SEND("setTitle", frameText || "Families")
    }, [frameText])






    interface userType {
        uid: string;
        name: string;
        password: string;
        families: any[];
        joinedFamilies: any[];
    }

    const [user, setUser] = useState<any>(
        { families: [], joinedFamilies: [] }
    );


    useEffect(() => {
        async function foo() {
            const mid = await INVOKE("getMID")
            setUser((prev: any) => ({ ...prev, mid }))
        }
        foo()
    }, [user?.uid])

    async function fetchjoinedFamiliesNames() {
        if (!user?.uid) return;

        const { data, error } = await supabase.from("families")
            .select("name, creator, password, members, maxMembers, roles, task, outfits, gallery, locations, webhooks, stash, funds, lineup, logoUrl, created_at, color, managerRoles, defaultRole, bannedUsers, joinedDates");

        if (error) {
            console.error("Error fetching families:", error);
            return;
        }

        if (data) {
            const userFamilies = data
                .filter(family => {
                    if (family.creator === user.uid) return false;

                    let isMember = false;
                    if (family.members && typeof family.members === 'object') {
                        for (const role in family.members) {
                            if (Array.isArray(family.members[role]) &&
                                family.members[role].includes(user.uid)) {
                                isMember = true;
                                break;
                            }
                        }
                    }

                    return isMember;
                })
                .map(family => family.name);

            const { error } = await supabase.from("users")
                .update({ joinedFamilies: userFamilies })
                .eq('uid', user?.uid)
                .maybeSingle()

            if (error) {
                console.error("Error inserting user's joined families:", error);
                return
            }


            setUser((prev: userType) => ({
                ...prev,
                joinedFamiliesNames: userFamilies,
                joinedFamilies: data.filter(family => {
                    if (family.creator === user.uid) return false;
                    let isMember = false;
                    if (family.members && typeof family.members === 'object') {
                        for (const role in family.members) {
                            if (Array.isArray(family.members[role]) &&
                                family.members[role].includes(user.uid)) {
                                isMember = true;
                                break;
                            }
                        }
                    }
                    return isMember;
                })
            }));
        }
    }

    useEffect(() => {
        fetchjoinedFamiliesNames();
        // eslint-disable-next-line 
    }, [user?.uid]);



    useEffect(() => {
        async function fetchFamilies(uid: string) {
            if (!uid) return;

            try {
                const { data, error } = await supabase
                    .from('families')
                    .select('*')
                    .eq('creator', uid);

                if (error) {
                    console.error('Error fetching families:', error);
                    return;
                }

                if (data) {
                    setUser((prev: userType) => ({ ...prev, families: data }));
                }


                const channel = supabase
                    .channel('families-changes')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'families',
                        },
                        async (payload) => {
                            const oldFamily: any = payload.old || {};
                            const newFamily: any = payload.new || {};


                            const wasUserInFamily = Object.values(oldFamily?.members || {}).some(
                                (arr: any) => arr.includes(uid)
                            );
                            const isUserInFamily = Object.values(newFamily?.members || {}).some(
                                (arr: any) => arr.includes(uid)
                            );

                            const wasCreator = oldFamily?.creator === uid;
                            const isCreator = newFamily?.creator === uid;

                            if (wasUserInFamily || isUserInFamily || wasCreator || isCreator) {
                                const { data, error } = await supabase
                                    .from('families')
                                    .select('*');

                                if (error) {
                                    console.error('Error fetching families:', error);
                                    return;
                                }


                                const relevant = data?.filter((fam) =>
                                    fam.creator === uid &&
                                    Object.values(fam.members || {}).some((arr: any) => arr.includes(uid))
                                );

                                setUser((prev: userType) => ({ ...prev, families: relevant }));
                                fetchjoinedFamiliesNames();
                            }
                        }
                    )
                    .subscribe((status) => {
                        console.log('Subscription status:', status);
                        if (status === 'SUBSCRIBED') {
                            console.log('Successfully subscribed!');
                        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                            console.log('Subscription failed or closed!');
                        }
                    });

                return () => {
                    console.log('Cleaning up subscription');
                    supabase.removeChannel(channel);
                };
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        }

        fetchFamilies(user?.uid);

        return () => { };
        // eslint-disable-next-line
    }, [user?.uid]);



    function toggleHeavyLoader(text: string = "loading", status: boolean = false) {
        setHeavyLoading(() => { text !== "" ? setHeavyText(text) : setHeavyText("Loading"); return status });
    }


    function logout() {
        toggleHeavyLoader("Logging Out", true);
        setTimeout(() => {
            localStorage.removeItem("client");
            setUser({ families: [] });
            toggleHeavyLoader();
        }, 2000)
    }


    async function checkUser(showLoader: boolean = true) {
        if (!updateCheck) {
            toggleHeavyLoader("Checking For Updates", true);
            return
        }
        if (updateData?.status) return
        if (showLoader) toggleHeavyLoader("Checking User", true);
        const storage = JSON.parse(localStorage.getItem("client") || "{}");
        if (storage?.uid && storage?.name && storage?.password) {
            const { data } = await supabase.from("users")
                .select("*")
                .eq("uid", storage?.uid)
                .maybeSingle();

            if (data && data?.password === storage?.password) {
                setUser((prev: any) => ({ ...prev, ...data }));
                setTimeout(() => {
                    toggleHeavyLoader()
                }, 1000)

            }
            else {
                setFrameText("Families")
                setFrameLogoUrl(logo);
                toggleHeavyLoader("Couldn't find user, Redirecting to login", true);
                setTimeout(() => {
                    toggleHeavyLoader()

                }, 1500)
            }
        }
        else {
            setFrameText("Families")
            setFrameLogoUrl(logo);
            toggleHeavyLoader("Couldn't find user, Redirecting to login", true);
            setTimeout(() => {
                toggleHeavyLoader()
            }, 1000)
        }
    }

    useEffect(() => {
        checkUser()
        // eslint-disable-next-line
    }, [updateCheck])


    const [popupActive, setPopupActive] = useState(false);
    const popupInputs = useRef({});
    const [popupInfoData, setPopupInfoData] = useState({ text: "", same: 0, className: "red" })

    const [popupData, setPopupData] = useState({
        type: "default",
        title: "PopUp",
        description: "PopUp",
        inputsArray: [],
        buttonsArray: [<button onClick={resetPopupData}>Close</button>],
        labelsArray: []
    });

    function resetPopupData() {
        setPopupActive(false);
        setTimeout(() => {
            setPopupData({
                type: "default",
                title: "PopUp",
                description: "If you are seeing this, something went wrong",
                inputsArray: [],
                buttonsArray: [],
                labelsArray: []
            });
            setPopupInfoData({ text: "", same: 0, className: "red" })
            // setTimeout(()=> popupInputs.current = {},500)
        }, 300)

    }







    const setPopupInfo = (text: string, className: string = "red") => {
        setPopupInfoData((prev: any) =>
            text === prev.text && prev.text !== ""
                ? { text, same: prev.same + 1, className }
                : { text, same: 0, className }
        );
    };


    const membersTabCachedUsernames = useRef<any>({});



    return (
        <GlobalStateContext.Provider value={{
            user,
            setUser,
            popupActive,
            setPopupActive,
            popupData,
            setPopupData,
            resetPopupData,
            popupInputs,
            lightLoading,
            setLightLoading,
            heavyLoading,
            toggleHeavyLoader,
            heavyText,
            setHeavyText,
            logout,
            frameText,
            setFrameText,
            frameTitle,
            setFrameTitle,
            fetchjoinedFamiliesNames,
            frameLogo,
            setFrameLogo,
            setFrameLogoUrl,
            setPopupInfo,
            popupInfoData,
            checkUser,
            settingsOpen,
            setSettingsOpen,
            updateData,
            setUpdateData,
            currentFamily,
            setCurrentFamily,
            membersTabCachedUsernames,
            consolePanel,
            runCommand,
            consoleItems,
            consoleAutoScroll, setConsoleAutoScroll,
            terminationCountdown,
            patchNotes, version,
            showingPatchNotes, setShowingPatchNotes,
            addConsoleItem
        }}>


            {children}
        </GlobalStateContext.Provider>
    );
};

//eslint-disable-next-line
export const useGlobal = () => useContext(GlobalStateContext);
