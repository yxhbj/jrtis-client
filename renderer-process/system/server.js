var editTable = require('./editTable')
var backupNumber,backupSize
// 一个简单的promise请求,获取Backup数据
const getServerData = function(paramse) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://127.0.0.1:3000/system/server');
        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
              var ss = document.getElementById("servers");
              if(ss.options.length==0){
                //定义加载服务器列表
                JSON.parse(xhr.response).data.forEach(server=>{
                  var op=document.createElement("option"); 
                  op.setAttribute("label",server.server);
                  op.setAttribute("value",server.id); 
                  ss.appendChild(op);
                })
              }
              document.querySelector('[name="selectedServer"]').addEventListener('input', function () {
                document.querySelector('#text_area').innerHTML = JSON.parse(xhr.response).data[this.value].logs.replace(/\"/g,'').replace(/\r\n/g,"<br>");
              })
              document.querySelector('[name="selectedServer"]').addEventListener('change', function () {
                document.querySelector('#text_area').innerHTML = JSON.parse(xhr.response).data[this.value].logs.replace(/\"/g,'').replace(/\r\n/g,"<br>");
              })
              document.querySelector('#text_area').innerHTML = JSON.parse(xhr.response).data[2].logs.replace(/\"/g,'').replace(/\r\n/g,"<br>");
              resolve(xhr.response);
              //document.querySelector('#text_area').innerHTML = JSON.stringify(body.logs).replace(/\"/g,'').replace(/\\n/g,"<br>");
            } else {
              reject(xhr);
            }
        };

        // 一个简单的处理参数的示例
        let formData = '';
        for (let key in paramse) {
          if(formData !== '') {
            formData += '&';
          }
          formData += key + '=' + paramse[key];
        }
        xhr.send(formData);
    });
};

var serverTable = document.querySelector('#system-server-table');
serverTable.border = "1";
serverTable.width = "100%";

getServerData().then(data=>{
  var servers=JSON.parse(data).data
  var th,thr,thd,tr,td;
  var columnData={
                    id:{text:'编号',editType:"textBox"},
                    server:{text:'名称',editType:"textBox"},
                    ip:{text:'ip地址',editType:"textBox"},
                    backupDirectory:{text:'存储路径',editType:"textBox"},
                    loginName:{text:'登录名',editType:"textBox"},
                    password:{text:'登录密码',editType:"textBox"},
                    type:{text:'服务器类型',editType:"dropDownList"}
                  }
  thr = serverTable.insertRow(serverTable.rows.length);
  for( let j in columnData){
      thd = thr.insertCell(thr.cells.length);
      thd.setAttribute("editType",columnData[j].editType)
      thd.innerHTML = columnData[j].text;
      thd.align = "center";
      thr.style.backgroundColor = "lightgrey";
      if(j=='type'){
        thd.setAttribute("DataItems","{text:'NodeServer',value:'NodeServer'},{text:'PlanningServer',value:'PlanningServer'},{text:'StandaloneServer',value:'StandaloneServer'},{text:'StorageServer',value:'StorageServer'}")
      }
  }
  thd = thr.insertCell(thr.cells.length)
  thd.innerHTML = "操作";
  thd.align = "center";

  for(var i=0;i<servers.length;i++){
    //循环插入元素
    tr = serverTable.insertRow(serverTable.rows.length);
    if(i%2 === 0){
        tr.style.backgroundColor = "white";
    }else{
        tr.style.backgroundColor = "white";
    }
    for( let j in servers[i]){
        if(j!='logs'){
          td = tr.insertCell(tr.cells.length);
          if(j=='password'){
            td.innerHTML=servers[i][j].replace(/./g,'*')
          }else{
            td.innerHTML = servers[i][j];
          }
          td.align = "center";
        }
    }
    td = tr.insertCell(tr.cells.length)
    td.innerHTML = ''//"删除";
    td.align = "center";
  }
  editTable.editTable(serverTable)
}).catch(err=>console.log(err))