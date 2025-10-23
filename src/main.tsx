import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './global.css'
import { GlobalStateProvider } from "./hooks/useGlobal.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStateProvider>
    <App />
    </GlobalStateProvider>
  </React.StrictMode>,
)



// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)


})
