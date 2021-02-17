const {ipcMain} = require('electron')
const os = require('os')
const settings = require('electron-settings')
var cp = require("child_process")
var fs = require("fs")
const path = require('path')


ipcMain.on('openPlan-message', (event,arg) => {
    console.log("连接到服务器：",arg.server)
    event.returnValue='正在打开'
    var scriptPath = path.join(__dirname,'/../../third/')
    var batFileName = path.join(scriptPath,'openplan.bat')
    var batCmd = `taskkill /IM jovdc.exe -f
    cd ${scriptPath}
    set PATH=.;%PATH%
    jre6\\bin\\jovdc  -Dhide=visible -Duser=${arg.user} -Dpasswd=${arg.password}  -classpath ovdc.jar;edtftpj.jar;log4j-1.2.9.jar com.oracle.vdc.gui.OVDC ${arg.server}
    `
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
