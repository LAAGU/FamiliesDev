export interface inputTypes {
    title?: string,
    required?: boolean,
    className: "input-d" | "input-g" | "input-r" | string,
    minLength?: number,
    maxLength?: number,
    min?: number,
    max?: number,
    pattern?: string,
    onKeyDown?: (e: Event | any) => void,
    onKeyUp?: (e: Event | any) => void,
    onWheel?: (e: Event | any) => void,
    onInput?: (e: Event | any) => void,
    type: "text" | "password" | "email" | "number",
    name: string,
    placeholder?: string,
    value?: string | number,
    defaultValue?: string | number
}

export interface buttonTypes {
    className: "btn-d" | "btn-g" | "btn-r" | string,
    text: string,
    onClick: () => void,
}

export interface lableTypes {
    title?: string,  
    className: "input-d" | "input-g" | "input-r" | string,
    text: string,
    canCopy?: boolean
    hidden?: boolean

}

export interface popupTypes {
    title: string | boolean, 
    description: string, 
    inputsArray?: inputTypes[], 
    buttonsArray: buttonTypes[],
    labelsArray?: lableTypes[],
    type?: "default" | "green" | "red" | string,
}