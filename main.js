// only add update server if it's not being run from cli
if (require.main !== module) {
  require('update-electron-app')({
    logger: require('electron-log')
  })
}

const path = require('path')
const {app, BrowserWindow, Menu, Tray, net, ipcMain} = require('electron')
const settings = require('electron-settings')
const glob = require('glob')
// const uri='www.irt.net.cn:8088'

const debug = true//--debug/.test(process.argv[2])
let isDevelopment = true

if(isDevelopment){
  require('electron-reload')(__dirname
  , {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
  })
}

if (process.mas) app.setName('RTPMS')

loadMain ()

let mainWindow = null
let tray = null

function createWindow (uri) {
  const windowOptions = {
    width: 1080,
    minWidth: 680,
    height: 840,
    title: app.name,
    icon:path.join(__dirname, '/public/app-icon/win/favicon.ico'),
  //   transparent: true,
    // frame: false,
    webPreferences: {
      nodeIntegration: true
    }  
  }
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow(windowOptions)
  mainWindow.loadURL(path.join(__dirname, '/views/index.html'))

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

function getLogin(){  
  createWindow()
  // mainWindow.loadURL(path.join(__dirname, '/views/signin.html'))
  // const loginWindowOptions = {
  //   width: 1080,
  //   minWidth: 680,
  //   height: 840,
  //   title: app.name,
  //   icon:path.join(__dirname, '/public/app-icon/win/favicon.ico'),
  //   // transparent: true,
  //   // frame: false,
  //   webPreferences: {
  //     nodeIntegration: true
  //   }  
  // }
  // Menu.setApplicationMenu(null)
  // loginWindow = new BrowserWindow(loginWindowOptions)
  // loginWindow.loadURL(path.join(__dirname, '/views/signin.html'))

  // loginWindow.on('closed', () => {
  //   loginWindow = null
  // })
}

function initialize () {
  settings.delete('login')
  const gotTheLock = requestSingleInstanceLock()
  if (!gotTheLock) return app.quit()


  app.on('ready', () => {
    getLogin()
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

function signin(userInfo){
  const request = net.request({
          method: 'POST',
          protocol: 'https:',
          hostname: 'www.irt.net.cn',
          port: 8088,
          path: '/authenticate'
      })
  return new Promise((resolve,reject)=>{
      request.setHeader('Content-Type','application/json;charset=UTF-8')
      request.on('response', (response) => {
          console.log(`**statusCode:${response.statusCode}`);
          // console.log(response)

          response.on("data", (chunk) => {
              // console.log("Received data:", chunk.toString());
              resolve(chunk.toString())
          })
          response.on('end', () => {
              console.log("Data receive end.");
          })
      });
      request.on('error',error=>reject(error))
      request.write(JSON.stringify(userInfo));
      request.end();
  })
}

// Require each JS file in the main-process dir
function loadMain () {
  const files = glob.sync(path.join(__dirname, 'main/*.js'))
  // console.log(files)
  files.forEach((file) => { require(file) })
}

initialize()


//get login information
ipcMain.on('login-message', (event, arg) => {
  console.log(arg)
  signin(arg).then(authInfo=>{
    if(JSON.parse(authInfo).success){
      mainWindow.loadURL(path.join(__dirname, '/views/index.html'))
    settings.set('login',authInfo)
    // setCookie('rtpmsToken',JSON.parse(authInfo).token)
    event.sender.send('login-reply', authInfo)
    }else{
      console.log(JSON.parse(authInfo).message)
    }
  }).catch(error=>console.log(error))
})

ipcMain.on('logout-message',function() {
  // initialize()
  mainWindow.loadURL(path.join(__dirname, '/views/signin.html'))
})