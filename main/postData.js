const {ipcMain,net} = require('electron')

ipcMain.on('post-message', (event, arg) => {
    postData(arg.route,arg.type,arg.data,arg.token).then(res=>{
        event.sender.send('post-reply', {success:true,data:res})
    }).catch(e=>{
        event.sender.send('post-reply', {success:false,data:e})
    })
})  

function postData(route,type,data,token){
    const request = net.request({
            method: 'POST',
            protocol: 'https:',
            hostname: 'www.irt.net.cn',
            port: 8088,
            path: '/app/'+route
        })
    return new Promise((resolve,reject)=>{
        request.setHeader('Content-Type',type)
        request.setHeader('x-access-token',token)
        request.on('response', (response) => {
            console.log(`**statusCode:${response.statusCode}`);
            // console.log(response)
  
            response.on("data", (chunk) => {
                resolve(chunk.toString())
            })
            response.on('end', () => {
                console.log("Data receive end.");
            })
        });

        request.on('error',error=>reject(error))
        // console.log(type,"type of data:",typeof data,data)
        request.write(type=="multipart/form-data"?data:data==undefined?"":JSON.stringify(data));
        request.end();
    })
}