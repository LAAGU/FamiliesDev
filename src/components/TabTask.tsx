import { IsStaff } from "../functions/dbhelper";
import { sendLog, sendTaskNotification } from "../functions/scripts";
import { supabase } from "../functions/supabase";
import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup";
import SmartImage from "./SmartImage";
import defaultTaskImg from "/defaultTask.webp"

export default function TabTask({family} : {family : any}) {
  const {showPopup,resetPopup} = usePopup();
  const {popupInputs, user,setPopupInfo} = useGlobal(); 

  
  function handleSetTask() {
    if (!IsStaff(family,user)) return

    async function confirmSetTask() {
        if (!popupInputs?.current["set-task-title-input"] && !family?.task?.title) {
            setPopupInfo("Please enter a task title.", "red");
            return;
        }

        if (!popupInputs?.current["set-task-description-input"] && !family?.task?.description) {
            setPopupInfo("Please enter a task description.", "red");
            return;
        }

        if (!popupInputs?.current["set-task-reward-input"] && !family?.task?.reward) {
            setPopupInfo("Please enter a task reward.", "red");
            return;
        }

        if (!popupInputs?.current["set-task-penalty-input"] && !family?.task?.penalty) {
            setPopupInfo("Please enter a task penalty.", "red");
            return;
        }

        if (!popupInputs?.current["set-task-start-date-input"] && !family?.task?.startDate) {
            setPopupInfo("Please enter a start date.", "red");
            return;
        }

        if (!popupInputs?.current["set-task-end-date-input"] && !family?.task?.endDate) {
            setPopupInfo("Please enter an end date.", "red");
            return;
        }

    
        const task = {
            title: popupInputs?.current["set-task-title-input"] ?? family?.task?.title,
            description: popupInputs?.current["set-task-description-input"] ?? family?.task?.description,
            reward: popupInputs?.current["set-task-reward-input"] ?? family?.task?.reward,
            penalty: popupInputs?.current["set-task-penalty-input"] ?? family?.task?.penalty,
            startDate: popupInputs?.current["set-task-start-date-input"] ?? family?.task?.startDate,
            endDate: popupInputs?.current["set-task-end-date-input"] ?? family?.task?.endDate,
            bannerUrl: popupInputs?.current["set-task-banner-input"] ?? family?.task?.bannerUrl ?? null,
        };


        const existingTask = family?.task ?? {};
        const isUnchanged = 
            task.title === existingTask.title &&
            task.description === existingTask.description &&
            task.reward === existingTask.reward &&
            task.penalty === existingTask.penalty &&
            task.startDate === existingTask.startDate &&
            task.endDate === existingTask.endDate &&
            task.bannerUrl === existingTask.bannerUrl;

        if (isUnchanged) {
            setPopupInfo("Nothing changed to update.", "red");
            return;
        }

        resetPopup();

        const { error } = await supabase
            .from("families")
            .update({ task })
            .eq("name", family?.name)
            .maybeSingle();

        if (error) {
            console.error("Error updating family:", error);
            showPopup({
                title: "Error",
                description: "An error occurred while setting the task.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            });
            return;
        }

        showPopup({
            title: "Success",
            description: "Task set successfully.",
            buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
        });

        await sendLog(family,"Task", {
            staffName: user?.name,
            staffUID: user?.uid,
            task: task
          },"Task Set",16748800)
        await sendTaskNotification(family,{
            title: task?.title,
            description: task?.description,
            penalty: task?.penalty,
            reward: task?.reward,
            startDate: task?.startDate,
            endDate: task?.endDate,
            bannerUrl: task?.bannerUrl,
        })
    }

    async function removeTask() {
        if (!IsStaff(family,user)) return

        if (!family?.task) {
            setPopupInfo("There is no task to remove.", "red");
            return
        }

        const taskData = {
            ...family?.task,
        }

        resetPopup()

        async function confirm() {
            resetPopup()
            const {error} = await supabase
            .from("families")
            .update({task: null})
            .eq("name",family?.name)
            .maybeSingle()
    
            if (error) {
                console.error("Error updating family:", error);
                showPopup({
                    title: "Error",
                    description: "An error occurred while removing the task.",
                    buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
                })
                return
            }
    
            showPopup({
                title: "Success",
                description: "Task removed successfully.",
                buttonsArray: [{ text: "Close", onClick: resetPopup, className: "btn-d" }],
            })

            await sendLog(family,"Task", {
                    staffName: user?.name,
                    staffUID: user?.uid,
                    task: taskData 
                  },"Task Removed",16764928)
        }

        showPopup({
            title: "Remove Task",
            description: "Are you sure you want to remove the task?",
            buttonsArray: [
                { text: "Close", onClick: resetPopup, className: "btn-d" },
                { text: "Remove", onClick: confirm, className: "btn-r" },
            ],
        })
        
    }


    showPopup({
      title: "Set Task",
      description: "Set the family's current task. (It overwrites the previous task)",
      buttonsArray: [
        { text: "Close", onClick: resetPopup, className: "btn-d" },
        { text: "Remove", onClick: removeTask, className: "btn-r" },
        { text: "Set", onClick: confirmSetTask, className: "btn-g" },
      ],
      inputsArray: [
        { defaultValue: family?.task?.title || "" , title: "Task Title", type: "text", name: "set-task-title-input", placeholder: "Task Name", className: "input-d"},
        { defaultValue: family?.task?.description || "" , title: "Task Description", type: "text", name: "set-task-description-input", placeholder: "Task Description", className: "input-d"},
        { defaultValue: family?.task?.reward || "" , title: "Task Reward", type: "text", name: "set-task-reward-input", placeholder: "Task Reward", className: "input-d"},
        { defaultValue: family?.task?.penalty || "" , title: "Task Penalty", type: "text", name: "set-task-penalty-input", placeholder: "Task Penalty", className: "input-d"},
        { defaultValue: family?.task?.startDate || "" , title: "Start Date", type: "text", name: "set-task-start-date-input", placeholder: "Start Date", className: "input-d"},
        { defaultValue: family?.task?.endDate || "" , title: "End Date", type: "text", name: "set-task-end-date-input", placeholder: "End Date", className: "input-d"},
        { defaultValue: family?.task?.bannerUrl || "" , title: "Task Banner Url", type: "text", name: "set-task-banner-input", placeholder: "Task Banner Url (Optional)", className: "input-d"},
      ]
    })
  }


  return (
    <div className="w-full h-full min-h-[300px] overflow-hidden shadow relative flex items-center justify-center">
    {IsStaff(family,user) && <div onClick={handleSetTask} className="plusicon z-10 absolute right-5 top-5 !w-max rounded text-white text-base bg-main-4/30 p-3 border-[1px] border-main-3/10 cursor-pointer uppercase flex items-center justify-center gap-2 transition-all hover:bg-main-3/10"><i className="fa-regular fa-wrench"></i></div> }

    {!family?.task && (
        <div className="text-xl min-lg:!text-2xl min-xl:!text-3xl font-bold text-main-3/90 input-d !p-2 mb-20">Currently there is no task.</div>
    )}    

    {family?.task && (
    <div className="taskBox flex flex-col gap-2 !p-4 backdrop-blur-md min-w-[300px] w-[60%] max-w-[70%] h-[90%] mb-10 input-d">
        <div className="flex flex-col gap-2 w-full h-max">
            <div className="title text-xl font-bold">{family?.task?.title || "Unknown"}</div>
        <div className="label font-bold w-full flex items-center gap-2 text-nowrap text-main-3/70">About The Task</div>
        <div className="sep"></div>
        <div className="description text-lg text-main-3/70 input-d !p-2 select-text">{family?.task?.description || "Unknown"}</div>
        <div className="label font-bold w-full flex items-center gap-2 text-nowrap text-main-3/70">Task Completion Rewards</div>
        <div className="sep"></div>
        <div className="reward input-d !p-2 select-text">{family?.task?.reward || "Unknown"}</div>
        <div className="label font-bold w-full flex items-center gap-2 text-nowrap text-main-3/70">Task Penalty</div>
        <div className="sep"></div>
        <div className="reward input-d !p-2 select-text">{family?.task?.penalty || "Unknown"}</div>
        <div className="label font-bold w-full flex items-center gap-2 text-nowrap text-main-3/70">Task Duration</div>
        <div className="sep"></div>
        <div className="dates flex items-center justify-between">
        <div className="startDate flex flex-col gap-2 w-full text-base"><div className="text-center"><i className="fa-solid fa-hourglass-start"></i> Start Date</div> <div className="input-d !p-2 text-center mr-1">{family?.task?.startDate || "Unknown"}</div></div>
        <div className="endDate flex flex-col gap-2 w-full text-base"><div className="text-center"><i className="fa-solid fa-hourglass-end"></i> End Date</div> <div className="input-d !p-2 text-center ml-1">{family?.task?.endDate || "Unknown"}</div></div>
        </div>
        </div>
        
        <div className="flex shrink w-full h-full overflow-hidden"><SmartImage className="rounded w-full object-center object-cover h-full" src={family?.task?.bannerUrl ? family?.task?.bannerUrl : defaultTaskImg } fallback={defaultTaskImg}/></div>
    
    </div>
    )}
    </div>
  )
}
