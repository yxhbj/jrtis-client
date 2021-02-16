const {ipcMain} = require('electron')
const settings = require('electron-settings')

ipcMain.on('logout-message', (event,arg) => {
    console.log(arg)
    if(arg==='logout'){
        settings.deleteAll()
        // loginWindow.show()
    }
})
