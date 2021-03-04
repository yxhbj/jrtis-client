var institutionTable = document.querySelector("#institution-data-table");
var patientTable = document.querySelector("#patient-data-table");
var planTable = document.querySelector("#plan-data-table");
var imgTable = document.querySelector("#planimage-data-table");
var imageTable = document.querySelector("#image-data-table");

function postData(route,type,data,func){
  var typeList={
    "json":"application/json; charset=UTF-8",
    "form":"multipart/form-data"
  }
  const xhr = new XMLHttpRequest();
  return new Promise((resolve,reject)=>{
    xhr.open("POST", uri+"app/"+route);
    xhr.setRequestHeader("Content-Type",typeList[type]);
    xhr.setRequestHeader('x-access-token',token)
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
        var resData=JSON.parse(xhr.response)
        if(typeof func == "function") func(resData)
        resolve(resData)
      }else {
        reject(xhr);
      }
    }
    if(type=="json"){
      xhr.send(JSON.stringify(data))
    }else if(type=="form"){
      let formData = "";
      for (let key in data) {
        if (formData !== "") {
          formData += "&";
        }
        formData += key + "=" + data[key];
      }
      xhr.send(formData);
    }
  })
}

const {net} = require('electron').remote;

function ftechData(route,type,data){
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
      request.write(type=="multipart/form-data"?data:data==undefined?"":JSON.stringify(data));
      request.end();
  })
}

function postDataElectron(route,type,data,func){
  var typeList={
    "json":"application/json; charset=UTF-8",
    "form":"multipart/form-data"
  }  
  var sendData;
  if(type=="json"){
    var sendData=data
  }else if(type=="form"){
    let formData = "";
    for (let key in data) {
      if (formData !== "") {
        formData += "&";
      }
      formData += key + "=" + data[key];
    }
    sendData=formData
  }
  // ipcRenderer.send('post-message', {route:route,type:typeList[type],data:sendData,token:token})

  return new Promise((resolve,reject)=>{
    // ipcRenderer.on('post-reply', (event, arg) => {
    ftechData(route,typeList[type],sendData).then(data=>{
      // console.log(typeof arg)
      // if(arg.success){
        var resData=type=='json'?JSON.parse(data):data
        if(route==="servLogs") console.log("Received data:", resData,typeof resData);
        if(typeof func == "function"){
          func(resData)
        }
        resolve(resData)
      // }else{
      //   reject(arg.data)
      // }
    }).catch(e=>reject(e))
  })
}

// 获取Institution数据后处理数据
function instPostProcess(postResponse) {
  var result = postResponse;
  patientInit(result.data[0].institutionid);
};

function institutionInit() {
  institutionTable.GM(
    "init",
    {
      disableBorder:false,
      supportRemind: false,
      gridManagerName: "institution-table",
      isCombSorting: false,
      height: "auto",
      supportCheckbox: true,
      useRowCheck: true,
      useRadio: true,
      supportAjaxPage: false,
      supportSorting: true,
      emptyTemplate: '<div class="gm-emptyTemplate">没有符合当前要求的数据</div>',
      ajaxData: function(settings, params) {
        // 传入参数信息
        return postData("institution","form",params,instPostProcess);
      },
      query: {},
      pageSize: 20,
      columnData: [
        {
          key: "institutionid",
          remind: "编号",
          text: "编号",
          sorting: ""
        },
        {
          key: "name",
          remind: "机构名称",
          text: "机构名称",
          sorting: ""
        },
        {
          key: "institutionpath",
          remind: "文件路径",
          text: "文件路径",
          sorting: ""
        },
        {
          key: "lastmodifiedtimestamp",
          remind: "最近修改时间",
          text: "最近修改",
          sorting: ""
        }
      ],
      checkedAfter: function(checkedList, isChecked, rowData) {
        var _query = {
          institutionid: rowData.institutionid
        };
        patientTable.GM("setQuery", _query).GM("refreshGrid", function() {
          console.log("选择了分组" + rowData.name);
        });
      }
    },
    cb => console.log(cb)
  );
}

function patientPostProcess(result){
  //console.log(result)
  if (result.data.length > 0) {
    var _query = {
      patientid: result.data[0].patientid
    };
    if (planTable.getAttribute('class')) {
      planTable.GM("setQuery", _query);
      var imgTable = document.querySelector("#planimage-data-table");
      imgTable.GM("setQuery", _query);
    } 
  }
}

function patientInit(institutionField) {
  var instFildterOption=[],institutionid='';
  if(userInfo.role==="Administrator"){
    instFildterOption=institutionField.institutions.map(m=>({value:m.id,text:m.name}))
    instFildterOption.push({value:"All",text:"全部机构"});
    institutionid=institutionField.defaultInstitution;
  }else{
    instFildterOption.push({value:userInfo.siteCode,text:"默认机构"})
    institutionid=userInfo.siteCode
  }
  var filter = {
    option:instFildterOption,
    selected: institutionid,
    inMultiple:true
  }
  var columnData=[
    {
      key: "institutionid",
      text: "机构",
      sorting: ""
    },
    {
      key: "patientid",
      remind: "TPS内部编号",
      text: "编号",
      sorting: "",
      width:"80px"
    },
    {
      key: "lastname",
      text: "姓氏",
      sorting: "",
      // width:"120px"
    },
    {
      key: "firstname",
      text: "名字",
      sorting: ""
    },
    {
      key: "middlename",
      text: "中间名字",
      sorting: ""
    },
    {
      key: "medicalrecordnumber",
      // remind: "medical record number",
      text: "病历号",
      sorting: "",
      // width:"120px"
    },
    {
      key: "primaryphysician",
      text: "主管医生"
    },
    // {
    //   key: "planLockDate",
    //   text: "计划锁定日期",
    //   sorting: ""
    // },
    // {
    //   key: "backupTimeStamp",
    //   text: "备份时间",
    //   sorting: "",
    //   filter: {
    //     option:[
    //       {value: '1', text: '未备份的数据项'},
    //       {value: '2', text: '已备份的数据项'},
    //       {value: '3', text: '全部'}
    //     ],
    //     selected: '3'
    //   }
    // },
    // {
    //   key: "backupFileName",
    //   text: "备份文件名称",
    //   sorting: ""
    // },
    {
      key: "lastmodifiedtimestamp",
      remind: "",
      text: "最近修改",
      sorting: "",
      // width:"160px"
    },
    // {
    //   key: "patientpath",
    //   remind: "",
    //   text: "文件夹路径",
    //   width:"280px"
    // },
    {
      key: "comment",
      remind: "",
      text: "备注"
    },
  ]
  if(userInfo.role==="Administrator"){
    columnData[0].filter=filter;
  }
  patientTable.GM(
    "init",
    {
      disableBorder:false,
      supportRemind: false,
      gridManagerName: "patient-table",
      isCombSorting: false,
      height: "auto",
      supportCheckbox: true,
      checkboxConfig: {
        useRowCheck: true,
        useRadio: true,
      },
      supportAjaxPage: true,
      supportSorting: true,
      // emptyTemplate: '<div class="gm-emptyTemplate">没有符合当前要求的数据</div>',
      ajaxData: function(settings, params) {
        // 传入参数信息
        return postData("patientDB","form",params,patientPostProcess);
      },
      query: {
        'institutionid':institutionid
      },
      pageSize: 10,
      columnData: columnData,
      checkedAfter: function(checkedList, isChecked, rowData) {
        // console.log(checkedList,isChecked,rowData);
        // console.log("选择了患者" + rowData.lastname + rowData.firstname);
        var _query = {
          patientid: rowData.patientid
        };
        if (planTable.getAttribute('class')) {
          imgTable.GM("setQuery", _query);
          planTable.GM("setQuery", _query);
        } else {
          document.getElementById('open-plan-image-toggle').addEventListener('click', (event) => {
            event.target.parentElement.classList.toggle('is-open')
          })
          document.getElementById('open-plan-image-toggle').click()
          planInit(rowData.patientid);
          planImageInit(imgTable, {patientid:rowData.patientid});
        }
      }
    },
    callBack => {
      // console.log(callBack)
    }
  );
}

// 获取Plan数据后处理数据
function planPostProcess(postResponse) {
  return (JSON.stringify(postResponse).replace(/\"planislocked\"\:\d{1}/g, m => {
    return m.substr(-1) == 1
      ? '"planislocked":' + '"Yes"'
      : '"planislocked":' + '"No"';
  }));
};

function planInit(patientid) {
  planTable.GM("init", {
    gridManagerName: "plan-table",
    height: "auto",
    disableBorder:true,
    supportRemind: false,
    isCombSorting: false,
    supportCheckbox: false,
    supportAjaxPage: false,
    supportSorting: true,
    fullColumn: {
      useFold: true,
      fixed: 'right', // 折叠事件列固定方向
      openState: false,
      bottomTemplate: function(row, index){
        return `<p class = "imgDes-data ${patientid}:${row.planid}:${row.primaryctimagesetid}" style="margin:10px;"></p>`
      }
    },
    emptyTemplate: '<div class="gm-emptyTemplate">该患者暂无计划数据</div>',
    ajaxData: function(settings, params) {
      // 传入参数信息
      return postData("planDB","form",params,planPostProcess);
    },
    query: {
      patientid: patientid
    },
    pageSize: 10,
    columnData: [
      {
        key: "planname",
        // remind: "计划名称",
        text: "计划名称",
        sorting: ""
      },
      {
        key: "pinnacleversiondescription",
        // remind: "计划软件版本",
        text: "计划软件版本",
        sorting: ""
      },
      {
        key: "dosimetrist",
        // remind: "计划制定剂量师",
        text: "剂量师",
        sorting: ""
      },
      {
        key: "lastmodifiedtimestamp",
        // remind: "最近修改时间",
        text: "最近修改时间",
        sorting: ""
      },
      {
        key: "comment",
        // remind: "备注信息",
        text: "备注",
        sorting: ""
      },
      // {
      //   key: "planLockDate",
      //   text: "计划锁定日期"
      // },
      // {
      //   key: "planpath",
      //   remind: "文件夹路径",
      //   text: "文件夹路径"
      // },
      {
        key: "action",
        //remind: 'the action',
        width: "60px",
        text: "操作",
        template: function(action, rowObject) {
          var actionButton = document.createElement("div");
          actionButton.classList.add("plugin-action");
          actionButton.classList.add("plan-action");
          actionButton.setAttribute("data",JSON.stringify(rowObject));
          actionButton.innerText = '打开';
          return actionButton;
        }
      }
    ],
    cellClick(row,rowIndex,colIndex){
      switch(colIndex){
        case 1:
          // 
          break;
        case 7:
          //
          break;
      }
    },
    ajaxComplete: function(event) {
      addPlanAction();
      refreshPlanImgDes();
    }
  },function(cb){ 
    //
  });
}

function addPlanAction(){
  var planAction = document.querySelectorAll(".plan-action");
  // console.log("plan action:",planAction)
  planAction.forEach(action=>{
    var data = action.getAttribute("data")
    // console.log("plan data:",data)
    action.onclick = function(e) {
      postPlan(JSON.parse(data))
    }
  })
}

function refreshPlanImgDes(){
  var planImageSetDes = document.querySelectorAll(".imgDes-data");
  planImageSetDes.forEach( element=> {
    element.parentNode.style.borderTop="var(--gm-border)";
    var patid=element.classList[1].split(':')[0];
    var imgid=element.classList[1].split(':')[2];
    if(imgid==-1) return;
    var query={
      patientid:patid,
      imagesetid:imgid
    },imgHead="";
    postData("planimageDB","form",query).then(imageSet=>{
      imgHead = imageSet.data.map(img=>
        '计划图像：'+img.dbname+
        ', '+img.imagename+
        ', '+img.mrn+
        ', '+img.modality+
        ', '+img.scantimefromscanner).join("\n")
      // console.log("image:",imgHead)
      element.innerText=imgHead;
    }).catch(e=>e)
  });
}

function postPlan(plan){
  if (plan.primaryctimagesetid == -1) {
    alert("该患者计划没有选择计划图像。")
    return;
  }
  postData("openPlan","json",{'plan':plan,'user':userInfo}).then(res=>{
    if(res=="ok"){
      // window.open("openplan://",'_self')
      var sendInfo = {}
      sendInfo.server = userInfo.appServer
      sendInfo.user = userInfo.loginName
      sendInfo.password = userInfo.password
      const reply = ipcRenderer.sendSync('openPlan-message',sendInfo)
      console.log(reply)
    }else if(res=="locked"){
      alert("该患者已经被其他人打开。")
    }else{
      alert(res)
    }    
  }).catch(e=>alert(e))
}

function planImageInit(table,query) {
  table.GM("init", {
    disableBorder:false,
    supportRemind: false,
    gridManagerName: "planimage-table",
    isCombSorting: false,
    height: "auto",
    supportCheckbox: false,
    supportAjaxPage: false,
    supportSorting: false,
    emptyTemplate: '<div class="gm-emptyTemplate">该患者暂未导入图像</div>',
    ajaxData: function(settings, params) {
      // 传入参数信息
      return postData("planimageDB","form",params);
    },
    query: query,
    pageSize: 20,
    columnData: [
      {
        key: "dbname",
        text: "患者姓名"
      },
      {
        key: "mrn",
        text: "病历号",
        // sorting: ""
      },
      {
        key: "studyid",
        text: "图像组号",
        // sorting: ""
      },
      {
        key: "examid",
        text: "检查号",
        sorting: ""
      },
      {
        key: "seriesdescription",
        text: "检查描述"
      },
      {
        key: "modality",
        text: "影像类型"
      },
      {
        key: "numberofimages",
        text: "图像数"
      },
      {
        key: "scantimefromscanner",
        text: "扫描时间"
      }
    ]
  });
}

function refreshPatientList() {
  var _query = GridManager.get("patient-table").query
  _query.searchString = document
      .querySelector('[name="search-Field"]')
      .value.replace(/[^a-zA-Z0-9\-\_\s\/]/g, "");
  patientTable.GM("setQuery", _query);
}

function init() {
  if(checkLoginStatus()){
    if(userInfo.role==="Administrator"){
      postData("settings","json").then(settings=>{
        patientInit(settings.institution);
      }).catch(e=>console.log(e))
    }else{
      patientInit([userInfo.siteCode]);
    }
  }
}

init();

//绑定搜索事件
document
  .querySelector('[name="search-Field"]')
  .addEventListener("change", function() {
    refreshPatientList();
  });
//绑定搜索事件
document
  .querySelector('[name="search-Field"]')
  .addEventListener("input", function() {
    refreshPatientList();
  });

  
//处理图像
function imageInit() {
  imageTable.GM("init", {
    height: "auto",
    disableBorder:true,
    supportRemind: false,
    gridManagerName: "image-table",
    isCombSorting: false,
    supportCheckbox: false,
    supportAjaxPage: false,
    supportSorting: true,
    supportAutoOrder:false,
    // emptyTemplate: '<div class="gm-emptyTemplate">没有符合当前要求的数据</div>',
    ajaxData: function(settings, params) {
      // 传入参数信息
      return postData("image","form",params);
    },
    query: {
    },
    pageSize: 20,
    columnData: [
      {
        key: "NameFromScanner",
        text: "患者姓名"
      },
      {
        key: "MRN",
        text: "病历号",
        sorting: ""
      },
      {
        key: "StudyID",
        text: "图像组号",
        sorting: ""
      },
      {
        key: "ExamID",
        text: "检查号",
        sorting: ""
      },
      {
        key: "SeriesDescription",
        text: "检查描述"
      },
      // {
      //   key: "bodypart",
      //   text: "扫描部位",
      //   sorting: ""
      // },
      {
        key: "Modality",
        text: "影像类型"
      },
      {
        key: "NumberOfImages",
        text: "图像数"
      },
      {
        key: "ScanTimeFromScanner",
        text: "扫描时间"
      }
    ]
  });
}

imageInit();
