import { useGlobal } from '../hooks/useGlobal';
import { popupTypes } from '../types/popupTypes';


export function usePopup() {
  const { setPopupActive, setPopupData, resetPopupData, popupInputs } = useGlobal();

  function showPopup({title, description, inputsArray, buttonsArray,labelsArray,type = "default"} : popupTypes) {
    setTimeout(()=> {
      setPopupData({
        type: type,
        title,
        description,
        inputsArray,
        buttonsArray,
        labelsArray,
      });
      setPopupActive(true);
    },400)
    
  }

  function resetPopup() {
    resetPopupData();
  }

  function getInputValue(name: string) {
    return popupInputs.current[name];
  }

  return { showPopup, resetPopup, getInputValue };
}
