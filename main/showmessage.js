const {ipcMain} = require('electron')

ipcMain.on('show-message', (event,arg) => {
    console.log("Received renderer message:",arg)
})
