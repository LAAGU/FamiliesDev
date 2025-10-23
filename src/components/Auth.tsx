import { useGlobal } from "../hooks/useGlobal";
import { usePopup } from "../hooks/usePopup"
import {useEffect, useState} from "react"
import LightLoader from "./LightLoader";
import { supabase } from "../functions/supabase";
import { setRootVariablesBulk } from "../functions/scripts";

export default function Auth() {
  const { showPopup, resetPopup} = usePopup()  
  const {setLightLoading,lightLoading, popupInputs,checkUser, user} = useGlobal();
  
  const [errorBox, setErrorBox] = useState({
    message: "",
    same: 0,
    className: "input-r p-2"
  });
  const [passwordShowing, setPasswordShowing] = useState(false)

  interface ErrorState {
    message: string;
    same: number;
  }

  const showError = (message: string, className: string = "input-r p-2") => {
    setErrorBox((prev: ErrorState) => 
      message === prev.message && prev.message !== "" 
        ? { message, same: prev.same + 1, className}
        : { message, same: 0, className }
    );
  };


  const [inputs, setInputs] = useState({username: "", password: ""});

  const [tries, setTries] = useState(0);

  const [timedout, setTimedout] = useState<null | number>(null);


  const getStoredTimeout = (): number => {
    const stored = localStorage.getItem('loginTimeout');
    return stored ? parseInt(stored, 10) : 0;
  };
  
  const setStoredTimeout = (timeout: number) => {
    localStorage.setItem('loginTimeout', timeout.toString());
  };
  
  const clearStoredTimeout = () => {
    localStorage.removeItem('loginTimeout');
  };


  useEffect(() => {
    const storedTimeout = getStoredTimeout();
    if (storedTimeout && storedTimeout > Date.now()) {
      setTimedout(storedTimeout);
    }

    setRootVariablesBulk([
                    {key: "--bg", value: "var(--def-bg)"},
                    {key:"--main3", value: "var(--def-main3)"}
    ])
  }, []);


  const [passwordResetAttempts, setPasswordResetAttempts] = useState(0);
  const [resetRestrictedUntil, setResetRestrictedUntil] = useState<null | number>(null);
  
  const getSavedResetRestriction = (): number => {
    const saved = localStorage.getItem('passwordResetRestriction');
    return saved ? parseInt(saved, 10) : 0;
  };
  
  const setSavedResetRestriction = (restriction: number) => {
    localStorage.setItem('passwordResetRestriction', restriction.toString());
  };
  
  const clearSavedResetRestriction = () => {
    localStorage.removeItem('passwordResetRestriction');
  };
  
  useEffect(() => {
    const savedResetRestriction = getSavedResetRestriction();
    if (savedResetRestriction && savedResetRestriction > Date.now()) {
      setResetRestrictedUntil(savedResetRestriction);
    } else if (savedResetRestriction) {
      clearSavedResetRestriction();
      setResetRestrictedUntil(null);
    }
  }, []);

  async function confirmRegister(name: string, password: string, forgetPasswordQuestion?: string,forgetPasswordAnswer?: string) {
    setLightLoading(true);
    resetPopup();
  
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({ name, password, forgetPasswordQuestion, forgetPasswordAnswer, joinedFamilies: [], mid: user?.mid })
        .select()
        .single();
  
      if (error) {
        console.error('Insert error:', error);
        showError(`Failed to create account: ${error.message}`);
        return false;
      }
  
      if (!data) {
        showError("Something went wrong while creating your account!");
        return false;
      }
  
      showError("");
      return true;
  
    } catch (err: any) {
      console.error('Unexpected error:', err);
      showError(`Error: ${err.message || "Something went wrong"}`);
      return false;
    } finally {
      setLightLoading(false);
    }
  }

  async function askForgetValue(name: string, password : string) {
    showPopup({
      title: "Forget Password Question",
      description: "If you forget your password, You can reset it by setting a recovery QNA below.",
      buttonsArray: [
        { text: "Cancel", className: "btn-r", onClick: resetPopup },
        {
          text: "Proceed",
          className: "btn-g",
          onClick: async () => {
            const forgetQuestion = popupInputs.current["forgetPasswordQuestion"];
            const forgetAnswer = popupInputs.current["forgetPasswordAnswer"];
            if (forgetQuestion && forgetAnswer) {
              const success = await confirmRegister(name, password, forgetQuestion, forgetAnswer);
              if (success) {
                const { data, error } = await supabase.from("users").select("*").eq("name", name).maybeSingle();

                if (error) {
                  showError(`Something went wrong!`);
                  setLightLoading(false)
                  return
                }

                const json = {
                  uid: data?.uid,
                  name: data?.name,
                  password: data?.password,
                }
                
                localStorage.setItem("client",JSON.stringify(json))

                checkUser()
                setTries(0);
                setTimedout(0);
                clearStoredTimeout();
                showError("");
                setLightLoading(false)
              }
            }
          },
        },
      ],
      inputsArray: [
        {
          type: "text",
          className: "input-d",
          placeholder: "Your favorite game / movie etc",
          name: "forgetPasswordQuestion",
          maxLength: 60
        },
        {
          type: "text",
          className: "input-d",
          placeholder: "Answer to upper question.",
          name: "forgetPasswordAnswer",
          maxLength: 40
        },
      ],
      type: "default",
    });
  }

  async function createAccount(name: string, password: string) {

    const storedTimeout = getStoredTimeout();
    const currentTimeout = timedout || storedTimeout;
  
    if (currentTimeout && currentTimeout > Date.now()) {
      const secondsLeft = Math.ceil((currentTimeout - Date.now()) / 1000);
      showError(`You have been timed out. Please wait ${secondsLeft} seconds before trying again.`);
      setLightLoading(false);
      return false;
    }
  
    if (tries >= 8) {
      const newTimeout = Date.now() + 60000;
      setTimedout(newTimeout); 
      setStoredTimeout(newTimeout);
      setTries(0);
    }

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('name')
        .eq('name', name)
        .maybeSingle();
  
      if (checkError) {
        console.error('Check error:', checkError);
        showError(`Database error: ${checkError.message}`);
        return false;
      }
  
      if (existingUser) {
        showError(`"${name}" is already taken! Please choose a different username.`);
        setTries((prev) => prev + 1);
        return false;
      }
  

      await askForgetValue(name, password);
      return true;
  
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setTries((prev) => prev + 1);
      showError(`Error: ${err.message || "Something went wrong"}`);
      return false;
    } finally {
      setLightLoading(false);
    }
  }

  async function login(name: string, password: string) {
    
    const storedTimeout = getStoredTimeout();
    const currentTimeout = timedout || storedTimeout;
  
    if (currentTimeout && currentTimeout > Date.now()) {
      const secondsLeft = Math.ceil((currentTimeout - Date.now()) / 1000);
      showError(`You have been timed out. Please wait ${secondsLeft} seconds before trying again.`);
      setLightLoading(false);
      return false;
    }
  
    if (tries >= 8) {
      const newTimeout = Date.now() + 60000;
      setTimedout(newTimeout); 
      setStoredTimeout(newTimeout);
      setTries(0);
    }
  
  
    try {

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('name', name)
        .maybeSingle()
  
      if (error) {
        setTries((prev) => prev + 1);
        showError("Something went wrong with the database!");
        return false;
      }
  
      if (!data) {
        setTries((prev) => prev + 1);
        showError(`"${name}" is not registered!`);
        return false;
      }

      if (data?.mid !== user?.mid) {
        setTries((prev) => prev + 1);
        showError(`This account was not created on this device!`);
        return false;
      }
  
      if (data.password !== password) {
        setTries((prev) => prev + 1);
        showError("Incorrect password");
        return false;
      }
  
      const json = {
        uid: data.uid,
        name: data.name,
        password: data.password,
      }

      localStorage.setItem("client",JSON.stringify(json))
      checkUser()
      
      setTries(0);
      showError("");
      setLightLoading(false);
      return true;
  
    } catch (err: any) {
      setTries((prev) => prev + 1);
      showError(err?.message || "Something went wrong!");
      return false;
    } finally {
      setLightLoading(false);
    }
  }

  async function resetPassword(name: string) {
   const {data , error} = await supabase.from("users").select("*").eq("name", name).maybeSingle();
   setPasswordResetAttempts((prev) => prev + 1); 
   if (error) {
    showError(`Something went wrong!`);
    console.error(error);
    setLightLoading(false);
    return
   } 

   if (!data) {
    showError(`"${name}" is not registered!`);
    setLightLoading(false);
    return  
   }

   async function doReset(uid : string, answer : string) {
    if (!popupInputs.current["resetPassInput"] || !popupInputs.current["newPassInput"]) return;

    if (popupInputs.current["resetPassInput"] !== answer) {
      resetPopup();
      setLightLoading(false);
      showPopup({title: "Password Reset Failed", description: "Incorrect answer!", buttonsArray: [{text: "Close", className: "btn-r", onClick:resetPopup}],
      inputsArray:[],
      type: "default"})
      return
    }

    const {error} = await supabase.from("users").update({password: popupInputs.current["newPassInput"]}).eq("uid", uid).maybeSingle();

    if (error) {
      resetPopup();
      setLightLoading(false);
      showError("Something went wrong!");
      console.error(error)
      return  
    }


    resetPopup();
    setLightLoading(false);
    showError("Password reset successful!", "btn-g");
    
   }

   showPopup({
    title: "Reset Password",
    description: data?.forgetPasswordQuestion || "Something went wrong!",
    buttonsArray: [
      {text: "Cancel", className: "btn-r", onClick: ()=> {resetPopup(); setLightLoading(false)}},
      {text: "Submit", className: "btn-g", onClick: () => doReset(data?.uid,data?.forgetPasswordAnswer)}
    ],
    inputsArray: [
      {type: "text", className: "input-d", placeholder: "Your answer...", name: "resetPassInput"},
      {type: "password", className: "input-d", placeholder: "Your new password...", name: "newPassInput", maxLength: 50},
    ],
    type: "default"
   })
  }


  const handleLogin = async () => {
    if (!inputs.username || !inputs.password) return;
    setLightLoading(true);
    setTimeout(async()=> {
      const success = await login(inputs.username, inputs.password);
      if (success) {
      console.log("Login successful");
      setTries(0);
      setTimedout(0);
      clearStoredTimeout();
      showError("");
      }
    },1000)
    
  };

  const handleCreateAccount = async () => {
   if (!inputs.username || !inputs.password) return;
   setLightLoading(true);
   setTimeout(async()=> {
    await createAccount(inputs.username, inputs.password);
  },100)

  };

  const handleForgetPassword = async () => {
    setLightLoading(true);
    if (!inputs.username) {
      showError('To reset your password please enter your username.');
      setLightLoading(false);
      return false;
    }

    if (resetRestrictedUntil && resetRestrictedUntil > Date.now()) {
      const secondsRemaining = Math.ceil((resetRestrictedUntil - Date.now()) / 1000);
      showError(`You are currently restricted from password resets. Please wait ${secondsRemaining} seconds before trying again.`);
      setLightLoading(false);
      return false;
    }
  

    if (passwordResetAttempts >= 8) {
      const newResetRestriction = Date.now() + (500 * 1000); // 500 seconds in milliseconds
      setResetRestrictedUntil(newResetRestriction);
      setSavedResetRestriction(newResetRestriction);
      setPasswordResetAttempts(0);
      showError('Too many password reset attempts. Please wait 500 seconds before trying again.');
      setLightLoading(false);
      return false;
    }
  
    
    
    
    try {
      setTimeout(async()=> {
        await resetPassword(inputs.username);
      },1000)
      
      return true;
    } catch (error) {
      showError('Failed to process password reset. Please try again.');
      setLightLoading(false);
      return false;
    }

  };

  return (
    <div className="animate-bright-in flex flex-col gap-3 p-2 rounded bg-main-3/3 absolute left-[50%] top-[50%] transform-[translate(-50%,-50%)] w-[clamp(500px,40vw,600px)] z-10 border-[1px] border-main-3/5">
        <div className="title text-center font-bold text-lg text-fore">Authenticate</div>
        <input value={inputs.username} onChange={(e) => setInputs({...inputs, username: e.target.value})} maxLength={25} type="text" placeholder="Username..." className="input-d" />
        
        <div className="passwordBox w-full relative flex">
        <input value={inputs.password} onChange={(e) => setInputs({...inputs, password: e.target.value})} maxLength={50} type={passwordShowing ? "text" : "password"} placeholder="Password..." className="input-d w-full !rounded-r-none !border-r-0" />
        <i onClick={()=> {setPasswordShowing(prev=> (!prev))}} className={`fa-duotone fa-regular ${passwordShowing ? "fa-eye-slash" : "fa-eye"} min-w-10 border-main-3/3 border-[1px] rounded-r border-l-0 p-3 cursor-pointer text-fore-2 bg-main-2/30`}></i>
        </div>
        {errorBox.message && (
          <div className={`${errorBox?.className} errorbox nohover flex items-center justify-between !cursor-default max-h-20 overflow-y-auto"`}>
            <div key={errorBox.same} className="errorBox">
              {errorBox.message}{" "}
              {errorBox.same !== 0 && (
                <span key={errorBox.same}>
                  ({errorBox.same})
                </span>
              )}
            </div>
            <i
              onClick={() => showError("")}
              className="fa-thin fa-circle-xmark cursor-pointer mr-1 hover:scale-110"
            ></i>
          </div>
        )}
        {lightLoading ? (
          <div className="fogotBtn btn-d !w-max !text-xs !border-none disabled">Forgot Password</div>
        ) : <div onClick={handleForgetPassword} className="fogotBtn btn-d !w-max !text-xs !border-none">Forgot Password</div>}
        <div className="btns flex items-center w-full">
            <div className="right flex ml-auto gap-2 w-full">
            {lightLoading ? (
              <LightLoader className={"text-lg"}/>
            ): (
              <>
              <div onClick={handleCreateAccount} className="create btn-g !w-[100%] !text-sm !border-none text-center">Create</div>
              <div onClick={handleLogin} className="create btn-g !w-[100%] !text-sm !border-none text-center">Login</div>
              </>
            )}
            </div>
        </div>
    </div>
  )
}
