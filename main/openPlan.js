const {ipcMain} = require('electron')
const os = require('os')
const settings = require('electron-settings')
var cp = require("child_process")
var fs = require("fs")
const path = require('path')

var scriptPath = path.join(__dirname, '/../public/script')
var batFileName = path.join(os.tmpdir(),'openplan.bat')
var server = '114.112.84.158'
var user = 'demoa'
var password = 'demo123'
var batCmd = `taskkill /IM ovdc.exe -f
taskkill /IM java.exe -f
cd ${scriptPath}
openplan.vbs ${server} ${user} ${password}`

ipcMain.on('openPlan-message', (event,arg) => {
    console.log(arg)
    event.returnValue='正在打开'
    var ws = fs.createWriteStream(batFileName, { start: 0 });
    var buffer = new Buffer.from(batCmd);
    ws.write(buffer, "utf8", function(err, buf) {
      if(err){
        console.log(err)
      }
      else{
        cp.exec(batFileName,function(err,stdout,stderr){
            if(err){
                console.error(err);
            }
            console.log("stdout:",stdout)
            console.log("stderr:",stderr);
        });
      }
    });
    ws.end("");
})
