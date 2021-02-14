var serverTable = document.querySelector("#system-server-table");
serverTable.border = "1";
serverTable.width = "100%";
var thr, thd, tr, td;

serverTableHead();
postData("servers",'json').then(servers => {
  try {
    serversToRender = servers.map(s => {
      delete s.logs;
      delete s.disk;
      return s;
    });
    loadData(serverTable, "servers", servers);
  } catch (err) {
    console.log(err);
  }
  //document.querySelector('#text_area').innerHTML = JSON.stringify(body.logs).replace(/\"/g,'').replace(/\\n/g,"<br>");
});

function serverTableHead() {
  var columnData = {
    id: { text: "编号", editType: "disabled" },
    host: { text: "名称", editType: "textBox" },
    ip: { text: "ip地址", editType: "textBox" },
    backupDirectory: { text: "存储路径", editType: "textBox" },
    storageVolume: { text: "数据区", editType: "textBox" },
    loginName: { text: "登录名", editType: "textBox" },
    password: { text: "登录密码", editType: "password" },
    type: { text: "服务器类型", editType: "dropDownList" },
    os: { text: "操作系统", editType: "dropDownList" }
  };
  thr = serverTable.insertRow(serverTable.rows.length);
  for (let j in columnData) {
    thd = thr.insertCell(thr.cells.length);
    thd.setAttribute("editType", columnData[j].editType);
    thd.innerHTML = columnData[j].text;
    thd.value = j;
    thd.align = "center";
    thr.style.backgroundColor = "lightgrey";
    thr.style.height = "30px";
    if (j == "type") {
      thd.setAttribute(
        "DataItems",
        "{text:'节点服务器',value:'NodeServer'},{text:'计划服务器',value:'PlanningServer'},{text:'独立服务器',value:'StandaloneServer'},{text:'备份服务器',value:'BackupServer'}"
      );
    }
    if (j == "os") {
      thd.setAttribute(
        "DataItems",
        "{text:'Solaris',value:'Solaris'},{text:'Windows',value:'Windows'},{text:'Linux',value:'Linux'},{text:'Mac OS',value:'Mac OS'}"
      );
    }
  }
  thd = thr.insertCell(thr.cells.length);
  thd.innerHTML = "操作";
  thd.align = "center";
  thd.width = "80px";
}
