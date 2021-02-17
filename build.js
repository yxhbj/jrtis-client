var electronInstaller = require('electron-winstaller');
var path = require("path");

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join('./out/rtpms-client-win32-x64'), //刚才生成打包文件的路径
    outputDirectory: path.join('./build/installer64'), //输出路径
    authors: 'Jingfang', // 作者名称
    iconUrl:`file://${path.join('./app-icon/win/favicon.ico')}`,
    setupIcon:path.join('./app-icon/win/favicon.ico'),
    loadingGif:path.join('./build/install.gif'),
    exe: 'rtpms-client.exe', //在appDirectory寻找exe的名字
    noMsi: true, //不需要mis![这里写图片描述]
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));