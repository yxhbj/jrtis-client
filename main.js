// only add update server if it's not being run from cli
if (require.main !== module) {
  require('update-electron-app')({
    logger: require('electron-log')
  })
}

const path = require('path')
const {app, BrowserWindow, Menu, Tray, ipcMain} = require('electron')
const settings = require('electron-settings')
// const uri='www.irt.net.cn:8088'

const debug = /--debug/.test(process.argv[2])
let isDevelopment = false

if(isDevelopment){
  require('electron-reload')(__dirname
  , {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
  })
}

if (process.mas) app.setName('RTPMS')

let mainWindow = null
let tray = null

function initialize () {
  const gotTheLock = requestSingleInstanceLock()
  if (!gotTheLock) return app.quit()

  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.name,
      icon:path.join(__dirname, '/public/app-icon/win/favicon.ico'),
//       transparent: true,
      // frame: false,
      webPreferences: {
        nodeIntegration: true
      }  
    }
    Menu.setApplicationMenu(null)
    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      require('devtron').install()
    }
    mainWindow.maximize()

    mainWindow.on('closed', () => {
      mainWindow = null
      app.quit()
    })

    tray = new Tray(path.join(__dirname, '/public/app-icon/win/favicon.ico'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '退出',
           click: function () {
              settings.delete('activeSectionButtonId')
             app.quit();
            }
        }
    ])
    tray.setToolTip('放疗数据管理-客户端')
    tray.setContextMenu(contextMenu)
    tray.on('click',function(){
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.maximize();//mainWindow.show()
      mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false):mainWindow.setSkipTaskbar(true); 
    })
  }

  function getUri(cb){
    const uriWindowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.name,
      icon:path.join(__dirname, '/public/app-icon/win/favicon.ico'),
//       transparent: true,
      // frame: false,
      webPreferences: {
        nodeIntegration: true
      }  
    }
    Menu.setApplicationMenu(null)
    uriWindow = new BrowserWindow(uriWindowOptions)
    uriWindow.loadURL(path.join(__dirname, '/index.html'))

    uriWindow.on('closed', () => {
      uriWindow = null
    })

    ipcMain.on('uri', (event, arg) => {
      //console.log(arg)
      settings.set("uri",arg)
      uriWindow.hide()
      cb(arg)
    })
  }

  app.on('ready', () => {
    var uri = settings.get("uri")
    if(!uri){
      getUri(res=>{
        uri=res
        createWindow(uri)
      })
    } else{
      createWindow(uri)
      settings.delete("uri")
    }    
  })

  app.on('reload', () => {
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function requestSingleInstanceLock () {
  if (process.mas) return false

  return app.requestSingleInstanceLock(() => {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 当运行第二个实例时,将会聚焦到myWindow这个窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  })
}

initialize()