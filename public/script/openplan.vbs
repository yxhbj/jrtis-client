Set ws=CreateObject("WScript.Shell")
Set args=WScript.Arguments
dim program
program="ovdc.exe "+args.Item(0)
set oexec=ws.exec(program)
wscript.sleep 10000
ws.appactivate "Oracle Virtual Desktop Client"
ws.sendkeys "^a"
ws.sendkeys "{DEL}"
ws.sendkeys args.Item(1)
ws.sendkeys "{ENTER}"
wscript.sleep 1000
ws.sendkeys "{BACKSPACE}"
ws.sendkeys args.Item(2)
ws.sendkeys "{ENTER}"
