postData("servers",'json').then(servers=>{
    renderData(servers);
})

function renderData(data){
    try{
        var ss = document.querySelector('[name="selectServer"]');
        if (ss.options.length == 1) {
        //定义加载服务器列表
        data.forEach(server => {
            var op = document.createElement("option");
            op.innerText = server.host;
            op.value = server.id;
            ss.appendChild(op);
        });
        }
        document.querySelector('[name="selectServer"]')
        .addEventListener("change", function() {
            getServLogs(data[this.value])
        });
        getServLogs(data[0])
    }catch(err){console.log(err)}
}
  
function getServLogs(server){
    postData("servLogs",'json',server).then(servLogs=>{
        try{
            // servLogs=JSON.parse(servLogs)
            document.querySelector("#text_area").innerHTML = servLogs.join("<br>");
        }
        catch(err){console.log(err)}
    }).catch(e=>console.log(e))
}

postData("sysInfo",'json').then(sysInfo=>{
    var applogs=sysInfo[0],
        delLogs=sysInfo[1],
        sysStat=sysInfo[2];
    var ss = document.querySelector('[name="selectLogServer"]');
    var su = document.querySelector('[name="selectLogUser"]');
    var servers={},users={}
    applogs.forEach(l=>{
        servers[l.HostName]=l.HostName
        users[l.UserName]=l.UserName
        })
    if (ss.options.length == 1) {
        //定义加载服务器列表
        for(var server in servers) {
            var op = document.createElement("option");
            op.innerText = servers[server];
            op.value = servers[server];
            ss.appendChild(op);
        };
    }
    if (su.options.length == 1) {
        //定义加载用户列表
        for(var user in users) {
            var opu = document.createElement("option");
            opu.innerText = users[user];
            opu.value = users[user];
            su.appendChild(opu);
        };
    }
    var serverFilter=document.querySelector('[name="selectLogServer"]'),
        userFilter=document.querySelector('[name="selectLogUser"]'),
        searchFilter=document.querySelector('[name="search-log"]'),
        searchDelFilter=document.querySelector('[name="search-del"]');
    
    serverFilter.addEventListener("change", function() {
        filterAppLogs(applogs,this.value,userFilter.value,searchFilter.value)
    });
    userFilter.addEventListener("change", function() {
        filterAppLogs(applogs,serverFilter.value,this.value,searchFilter.value)
    });
    searchFilter.addEventListener("change", function() {
        filterAppLogs(applogs,serverFilter.value,userFilter.value,this.value)
    });
    searchDelFilter.addEventListener("change", function() {
        filterDelLogs(delLogs,this.value)
    });
    renderAppLogs(applogs)
    renderDelLogs(delLogs)
    setStat(sysStat);
})

function setStat (sysStat) {
    document.querySelector(".data-patients-usage").innerHTML = `患者数：${sysStat.patNumber} | 存储总容量：${sysStat.disk.total} | 已使用：${sysStat.disk.used} | 已用比例：${sysStat.disk.usage}`;
  }
   
function filterAppLogs(data,server,user,search){
    if(server!=-1){
        data=data.filter(d=>d.HostName==server)
    }
    if(user!=-1){
        data=data.filter(d=>d.UserName==user)
    }
    if(search!=null){
        var reg = new RegExp(search, "ig");
        data=data.filter(d=>d.action.join("\n").match(reg))
    }
    renderAppLogs(data)
}

function renderAppLogs(applogs){
    applogs=applogs.map(m=>{
        var rs=""
        for(var s in m){
            if(s=="action"){
                rs+="Action"+":<br>"+m.action.join("<br>")
            }else{
                rs+=s+":"+m[s]+"<br>"
            }
        }
        return rs
    })
        // console.log(applogs)
    var logStr=applogs.join("<br><br>")
    document.querySelector("#app_log").innerHTML = logStr;
  }

  function renderDelLogs(delLogs){
    delLogs=delLogs.map(m=>{
        var rs=""
        for(var s in m){
        rs+=s+":"+m[s]+"<br>"
        }
        return rs
    })
    var logStr=delLogs.join("<br><br>")
    document.querySelector("#del_log").innerHTML = logStr;
}
  
function filterDelLogs(data,search){
    if(search!=null){
        var reg = new RegExp(search, "ig");
        data=data.filter(d=>d.pat_mrn.match(reg)||d.pat_lastname.match(reg))
    }
    renderDelLogs(data)
}
