export default function LightLoader({className} : {className? : string | null}) {
  return (
    <div className="flex items-center justify-center w-full">
      <i className={`fa-duotone fa-solid fa-spinner-third fa-spin text-fore ${className || "text-xl"}`}></i>
    </div>
  )
}
