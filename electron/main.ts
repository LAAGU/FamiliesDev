import { app, BrowserWindow, ipcMain, shell,dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { fs_read, fs_create, fs_update, fs_delete } from './fs_functions';
import fs from 'node:fs';
import { autoUpdater } from 'electron-updater';

// @ts-expect-error Missing types
import { format } from "bytes"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RPC = require('discord-rpc');
const clientId = '1365098134253863003';
const client = new RPC.Client({ transport: 'ipc' });

client.on('ready', () => {
  client.setActivity({
    details: 'App to manage fivem Families.',
    largeImageKey: 'logo',
    largeImageText: 'Families', 
    smallImageKey: 'creator', 
    smallImageText: 'Created by LAAGU#2351 / Sukrit Thakur', 
    buttons: [
      { label: 'Download', url: 'https://github.com/LAAGU/Families/releases/latest' },
      { label: 'Discord', url: 'https://discord.gg/ZxaDHm6jc4' },
    ],
    startTimestamp: new Date(),
  });
});

client.login({ clientId }).catch(console.error);

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST


const { machineIdSync } = require('node-machine-id');

const logoImgName = 'logo.ico'

function restartApp() {
  app.relaunch();
  app.exit(0);  
}

function getKeyJsonPath(): string {
  const appDataPath = path.join(app.getPath('appData'), 'families');
  return path.resolve(appDataPath, 'key.json');
}

function readKeyJson(): any {
  const keyPath = getKeyJsonPath();

  if (!fs.existsSync(keyPath)) {
    console.log(`key.json not found at ${keyPath}`);
    return null
  }

  const file = fs.readFileSync(keyPath, 'utf-8');
  return file;
}



let win: BrowserWindow | null

let errorWin: BrowserWindow | null = null;

export function createErrorWindow(title: string, message: string, detail: string,extraMsg: string = "") {
  if (errorWin) return;

  errorWin = new BrowserWindow({
    width: 600,
    height: 350,
    minHeight: 350,
    minWidth: 600,
    title,
    icon: path.join(process.env.VITE_PUBLIC, logoImgName),
    autoHideMenuBar:true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    modal: true,
    webPreferences: {
      devTools: false,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });


  const htmlContent = `
  <html>
    <head>
      <title>${title}</title>
      <style>
        * {
          outline: none;
          scrollbar-width: none;
        }

        *::-webkit-scrollbar {
          display: none;
        }

        body {
          height: 100vh;
          margin: 0;
          color: white;
          font-family: sans-serif;
          padding: 20px;
          background: linear-gradient(to top left, #000000, #2e2e2e, #000000);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        h4 {
          margin: 0 0 10px 0;
        }

        textarea, div {
          width: 100%;
          min-height: max-content;
          font-family: monospace;
          font-size: 14px;
          color: white;
          background: transparent;
          padding: 10px;
          box-sizing: border-box;
        }

        textarea {
          resize: none;
        }

        #applyArea {
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
        }

        #applyArea.disabled {
          opacity: 0.5;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 6px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .btns {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        button {
          color: white;
          padding: 6px 14px;
          font-size: 14px;
          cursor: pointer;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        button:hover {
        background: rgba(255, 255, 255, 0.1)
        }
      </style>
    </head>
    <body>
      <h4>${message}</h4>
      <textarea readonly>${detail}</textarea>
      <div id="applyArea">
        <input maxlength="200" type="text" id="applyText" placeholder="Enter a key" />
        <button onclick="applyKey()">Apply</button>
      </div>
      <div>${extraMsg}</div>
      <div class="btns">
        ${title !== "Key Expired." ? `<button onclick="window.openkeypath()">Open Path</button>` : ""}
        <button onclick="window.discord()">Join Discord</button>
      </div>

      <script>
        window.openkeypath = () => {
          window.ipcRenderer.send('openkeypath');
        }

        window.discord = () => {
          window.ipcRenderer.send('joinDiscord');
        }

        function applyKey() {
          const key = document.getElementById('applyText').value;
          if (!key) return;
          document.getElementById('applyArea').classList.add('disabled');
          window.ipcRenderer.send('applyKey', key);
        }
      </script>
    </body>
  </html>
`;

  errorWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
}

function applyKey(key: string) {
  const appDataPath = app.getPath('appData');
  const keyFilePath = path.join(appDataPath, 'families', 'key.json');
  fs.mkdirSync(path.dirname(keyFilePath), { recursive: true });
  const data = {
    code: key
  };
  fs.writeFileSync(keyFilePath, JSON.stringify(data, null, 2), 'utf-8');

  setTimeout(() => restartApp(), 500)
}

function openPath(path: string) {
  shell.openPath(path)
  .then(() => {
    console.log('path opened successfully!');
  })
  .catch((err) => {
    console.error('Error opening folder:', err);
  });
}

function setupAutoUpdater() {
  let updateVersion = ''
  autoUpdater.autoDownload = true

  autoUpdater.checkForUpdates()

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('startUpdate')
    updateVersion = info?.version
  })



  autoUpdater.on('download-progress', (progress) => {
    const { bytesPerSecond, percent, transferred, total } = progress
    const progressPayload = {
      version: updateVersion,
      progress: {
        speed: format(bytesPerSecond),
        total: format(total),
        transferred: format(transferred),
        percent: Math.floor(percent),
      }
    }
    win?.webContents.send('update-progress', progressPayload)
  })

  autoUpdater.on('update-downloaded', () => {
    setTimeout(() => {
      autoUpdater.quitAndInstall()
    }, 1000)
  })

  autoUpdater.on("update-not-available",()=> {
    win?.webContents.send('noUpdate')
  })

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err)
    dialog.showMessageBox({
      type: 'error',
      title: 'Update Failed',
      message: `Error: ${err.message}`,
      buttons: ['Close']
    }).then(result => {
      if (result.response === 0) {
        app.quit()
        win = null
      }
    })
  })

  !app?.isPackaged && win?.webContents.send('noUpdate')
}

async function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, logoImgName),
    frame: false,
    minHeight: 500,
    minWidth: 1000,
    fullscreenable:false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: app.isPackaged ? false : true

    },
  })
  
  if (VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    await win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  setupAutoUpdater()

  

  win?.on("unmaximize", ()=> {
    win?.webContents.send('windowModified', false)

  })

  win.webContents.on('before-input-event', (event, input) => {
    if (!app?.isPackaged) {
      win?.webContents.send('noUpdate')
      return
    }

    if (
      (input.control || input.meta) && 
      (input.key.toLowerCase() === 'r' || input.key === 'F5')
    ) {
      event.preventDefault();
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


ipcMain.on("checkUpdate", ()=> {
  setTimeout(()=> {
    autoUpdater.checkForUpdates()
  },200)
})

ipcMain.on("setTitle", (_,title: string)=> {
  win?.setTitle(title)
})

ipcMain.on("minimize", ()=> {
  win?.minimize()
})

ipcMain.on('maximize', () => {
  if (win?.isMaximized()) {
    win?.unmaximize()
    win?.webContents.send('windowModified', false)
  }
  else {
    win?.maximize()
    win?.webContents.send('windowModified', true)
  }
});

ipcMain.handle('getMID', () => {
  return machineIdSync() || "Can't Fetch"
})

ipcMain.handle('getVersion', () => {
  return app.getVersion() || "Version Not Found"
})


ipcMain.on('terminateApp', () => {
  app.quit();
  win = null
});



ipcMain.on("joinDiscord", ()=> {
  shell.openExternal("https://discord.gg/ZxaDHm6jc4")
})

ipcMain.on("openkeypath",()=> {
  openPath(getKeyJsonPath().replace("key.json",""));
})

ipcMain.on("applyKey", (_event, key: string) => {
  applyKey(key);
})

ipcMain.handle('fs_read', async (_event, collection, id) => {
  return await fs_read(collection, id);
});

ipcMain.handle('fs_create', async (_event, collection, data, docId) => {
  return await fs_create(collection, data, docId);
});

ipcMain.handle('fs_update', async (_event, collection, id, data) => {
  return await fs_update(collection, id, data);
});

ipcMain.handle('fs_delete', async (_event, collection, id) => {
  return await fs_delete(collection, id);
});

app.whenReady().then(async() => {

const key = JSON.parse(readKeyJson());
if (!key || !key?.code) {
    createErrorWindow(
      "key.json not found.", 
      "If you don't have a key contact LAAGU after joining our discord.",
      machineIdSync() || "Error Fetching Code",
      "Your Key Folder : " + getKeyJsonPath()?.replace("key.json", ""))
    return
}
const auth:any = await fs_read("auth-keys", key?.code)
if (!auth || !auth?.MID_HOLDERS || (!Object.values(auth?.MID_HOLDERS)?.includes(machineIdSync()))) {
  createErrorWindow(
    "Invalid key.", 
    "Your key is invalid, If you think this is a mistake, please contact your provider and give them this code.",
    machineIdSync() || "Error Fetching Code",
    "Current Key : " + key?.code
  )
  return
}

if (auth?.expired) {
  createErrorWindow(
    "Key Expired.", 
    "Your key expired on " + auth?.expireDate +",To renew it or If you think this is a mistake, please contact your provider and give them this code.",
    machineIdSync() || "Error Fetching Code",
    "Current Key : " + key?.code
  )
  return
}

await createWindow()

})
