var backupNumber, backupSize;

function backupPostProcess(postResponse){
  var backupNumber = postResponse.backupTotalNumber,
    backupSize = postResponse.backupTotalSize;
  document.querySelector(
    ".data-meta-backup-number"
  ).innerHTML = backupNumber;
  document.querySelector(".data-meta-backup-size").innerHTML = backupSize;
}

var table = document.querySelector("#backup-data-table");
table.GM("init",{
  gridManagerName: "backupData",
  height: "auto",
  disableBorder:false,
  supportRemind: false,
  isCombSorting: false,
  supportSorting: false,
  supportCheckbox: true,
  checkboxConfig: {
    useRowCheck: false,
    useRadio: true,
  },
  supportAjaxPage: true,
  //      ,disableCache:true
  fullColumn: {
    useFold: true,
    fixed: 'left', // 折叠事件列固定方向
    openState: false,
    bottomTemplate: function(row, index){
      // console.log(row)
      var backedInfo = document.createElement("div");
      backedInfo.classList.add("backuped-data-info");
      // backedInfo.classList.add("plan-action");
      backedInfo.setAttribute("data",JSON.stringify(row));
      backedInfo.style.cssText="margin:10px;display:flex;text-align:center;item-align:center;";
      backedInfo.innerHTML="数据库中无该患者的数据"
      return backedInfo
    }
  },
  ajaxData: function(settings, params) {
    // 传入参数信息
    return postData("backupData","form",params,backupPostProcess);
  },
  query: {},
  pageSize: 10,
  columnData: [
    {
      key: "lastName",
      //width: '100px',
      text: "姓氏",
      sorting: ""
    },
    {
      key: "firstName",
      text: "名字",
      sorting: ""
    },
    {
      key: "middleName",
      text: "中间名",
      sorting: ""
    },
    {
      key: "mrn",
      //width: '60px',
      text: "病历号",
      sorting: ""
    },
    {
      key: "radiologist",
      text: "放射肿瘤医生"
    },
    {
      key: "lastModified",
      text: "最后修改时间"
    },
    {
      key: "backupFileName",
      text: "备份文件名称"
    },
    {
      key: "backupVolume",
      text: "备份卷名称"
    },
    {
      key: "size",
      text: "文件大小"
      //width: '60px',
      //sorting: 'ASC'
    },
    {
      key: "backupTimeStamp",
      //width: '60px',
      text: "备份时间",
      sorting: ""
      // template: function(createDate, rowObject){
      //  return new Date(createDate).format('YYYY-MM-DD HH:mm:ss');
      // }
    }
  ],
  // 分页前事件
  pagingBefore: function(query) {
    // console.log("pagingBefore", query);
  },
  // 分页后事件
  pagingAfter: function(data) {
    // addBackupAction()
    // console.log("pagingAfter", data);
  },
  // 排序前事件
  sortingBefore: function(data) {
    console.log("sortBefore", data);
  },
  // 排序后事件
  sortingAfter: function(data) {
    // addBackupAction()
    // console.log("sortAfter", data);
  },
  // 宽度调整前事件
  adjustBefore: function(event) {
    // console.log("adjustBefore", event);
  },
  // 宽度调整后事件
  adjustAfter: function(event) {
    // console.log("adjustAfter", event);
  },
  // 拖拽前事件
  dragBefore: function(event) {
    // console.log("dragBefore", event);
  },
  // 拖拽后事件
  dragAfter: function(event) {
    // console.log("dragAfter", event);
  },
  ajaxComplete: function(event) {
    addBackupAction()
    // console.log("dragAfter", event);
  },
},
callBack => {
  // addBackupAction()
});

function addBackupAction(){
  var backupHandler=document.querySelectorAll(".backuped-data-info")
  // console.log(backupHandler)
  backupHandler.forEach(bh=>{
    bh.parentNode.style.borderTop="var(--gm-border)";
    if(bh!=null){
      var data = JSON.parse(bh.getAttribute("data"));
      var patientid=data.patientPath.match(/\d*$/)[0];
      var input = document.createElement('input');
      input.style.marginLeft="10px";
      postData("patientDB",
               "form",
                {'patientid':patientid,
                  'lastname':data.lastName,
                  'medicalrecordnumber':data.mrn
                }).then(pat=>{
                  if(pat.totals>0){
                    pat=pat.data[0]
                    bh.innerHTML="数据库中存在这个患者，"+
                                  "姓名："+pat.lastname+pat.firstname+
                                  "，病历号："+pat.medicalrecordnumber+
                                  "，最后修改日期："+pat.lastmodifiedtimestamp+                                
                                  "，文件夹大小："+parseInt(pat.dirsize)+"MB"
                    var delAction=bh.appendChild(input);
                    delAction.setAttribute("type","button");
                    delAction.value="从数据库中删除";
                    delAction.classList.add("plugin-action");
                    delAction.addEventListener('click', (event) => {  
                      var r=confirm("此操作将立即删除患者并且不可取消，确定删除！");
                      if (r===true){
                        var patients = [];
                        pat.backupTimeStamp=data.backupTimeStamp;
                        patients.push(pat);
                        postData("deletePatient","json",patients,console.log)
                      }
                    })
                  }
                }).catch(e=>console.log(e));
    }
  })
}

var pendingTable = document.querySelector("#backup-pending-table");

function pendingPostProcess(postResponse){
  var backupPendingNumber = postResponse.number,
    backupPendingSize = postResponse.size;
  document.querySelector(
    ".data-meta-pending-number"
  ).innerHTML = backupPendingNumber;
  document.querySelector(
    ".data-meta-pending-size"
  ).innerHTML = backupPendingSize;
}

pendingTable.GM(
  "init",
  {
    disableBorder:true,
    supportRemind: false,
    gridManagerName: "pending-table",
    isCombSorting: false,
    height: "auto",
    supportCheckbox: false,
    useRowCheck: false,
    useRadio: false,
    supportAjaxPage: false,
    supportSorting: true,
    // emptyTemplate: '<div class="gm-emptyTemplate">没有符合当前要求的数据</div>',
    ajaxData: function(settings, params) {
      // 传入参数信息
      return postData("backupPending","form",params,pendingPostProcess);
    },
    query: {},
    pageSize: 20,
    columnData: [
      {
        key: "patientid",
        remind: "",
        text: "编号",
        sorting: ""
      },
      {
        key: "lastname",
        remind: "",
        text: "姓氏",
        sorting: ""
      },
      {
        key: "firstname",
        remind: "",
        text: "名字",
        sorting: ""
      },
      {
        key: "middlename",
        remind: "",
        text: "中间名字",
        sorting: ""
      },
      {
        key: "medicalrecordnumber",
        remind: "",
        text: "病历号",
        sorting: ""
      },
      {
        key: "primaryphysician",
        remind: "",
        text: "主管医生"
      },
      {
        key: "comment",
        remind: "",
        text: "备注"
      },
      {
        key: "planLockDate",
        text: "计划锁定日期"
      },
      {
        key: "lastmodifiedtimestamp",
        remind: "",
        text: "最近修改",
        sorting: ""
      },
      {
        key: "patientpath",
        remind: "",
        text: "文件夹路径"
      }
    ]
  },
  callBack => {
    //console.log(callBack)
  }
);

//还原已经备份的患者数据
function restorePatient(){
  var r=confirm("此操作将立即还原患者并且不可取消，确定还原吗？");
  if (r==true){
    var selectedPatients=GridManager.getCheckedData("backupData")
    var selectedInstitution=userInfo.role==="Administrator"?document.getElementById('institution-restore').value:userInfo.siteCode;
    var restoreList=selectedPatients.map(sp=>{
          return {
            patientPath:sp.patientPath,
            backupFileName:sp.backupFileName,
            lastName:sp.lastName,
            patientid:sp.mrn,
            instutionid:selectedInstitution==""?9999:+selectedInstitution,
            description:(sp.lastName+'&&'+sp.firstName+'&&'+sp.middleName+'&&'+sp.mrn+'&&'+sp.radiologist+'&&'+sp.lastModified).replace('undefined','')
          }
        })
    // console.log(restoreList)
    postData("restorePatient","json",restoreList).then(res=>console.log("ok:",res)).catch(e=>("error:"+e))
  }
}

// 绑定搜索事件
document
  .querySelector('[name="search-Backup"]')
  .addEventListener("input", function() {
    refreshBackupList();
  });

function refreshBackupList() {
  var _query = {
    searchString: document
      .querySelector('[name="search-Backup"]')
      .value.replace(/[^a-zA-Z0-9\-\_\s\/]/g, "")
  };
  table.GM("setQuery", _query);
}

//绑定还原事件
document
  .querySelector('[name="search-restore"]')
  .addEventListener("click", function() {
    restorePatient();
  });
