let subBtn = document.getElementById("process-save-settings");
let initBtn = document.getElementById("process-init-backuplist");
var instElements = document.querySelectorAll(".institution-form-input");
var dbElements = document.querySelectorAll(".database-form-input");
var bkpElements = document.querySelectorAll(".backup-form-input");

postData("settings",'json',{},loadSettingData)

// if ("confirm(数据同步操作将删除现有的全部数据和重置所有的设置，确定进行?")) {
//   postData("initialization",'json');
// }

function loadSettingData(data) {
  for (var i = 0; i < instElements.length; i++) {
    instElements[i].value = data.institution[instElements[i].name];
  }
  for (var i = 0; i < dbElements.length; i++) {
    dbElements[i].value = data.pgConfig[dbElements[i].name];
  }
  for (var i = 0; i < bkpElements.length; i++) {
    bkpElements[i].value = data.backup[bkpElements[i].name];
  }
  //document.querySelector('#text_area').innerHTML = JSON.stringify(data.logs).replace(/\"/g,'').replace(/\\n/g,"<br>");
  document.querySelector("#showCn").innerHTML = data.pgConfig.max;
  //获取datalist的dom
  var ss = document.getElementById("institutions");
  if (ss.options.length == 0) {
    //定义加载institution列表
    data.institution.institutions.forEach(institution => {
      var op = document.createElement("option");
      op.setAttribute("label", institution.name);
      op.setAttribute("value", institution.id);
      ss.appendChild(op);
    });
  }
  var ssel = document.querySelector('#search_select');
  // ssel.style.width=bi.style.width;
  // ssel.style.top=bi.style.bottom;
  ssel.style.display="none";
  var bi = document.querySelector('[name="backupInstitutions"]');
  bi.addEventListener('focus',function(){
    // console.log(this.style.left,",",this.style.width,",",this.style.bottom)
    if(ssel.style.display=="none"){
      ssel.style.display="inline";
      var listArr = data.institution.institutions;
      var options = '';
      for(var i = 0; i < listArr.length; i++) {
        opt = '<li class="li-select" data-institutionid="' + listArr[i].id + '"><input type="checkbox" class="backup-institution-list" id="' + 'cb' + listArr[i].id + '"/>' + listArr[i].name + '</li>';
        options += opt;
      }
      if(options == ''){
        ssel.style.display="none";
      }else{
        document.querySelector('#select_ul').innerHTML=options;
        if(JSON.stringify(data.institution.backupInstitutions)!='[""]'){
          data.institution.backupInstitutions.forEach(instId=>{
            document.querySelector('#cb'+instId).checked=true;
          })
        }
        data.institution.institutions.forEach(inst=>{
          document.querySelector('#cb'+inst.id).addEventListener("change", function() {
            var biList=[]
            if(bi.value.length!=0){
              biList=bi.value.split(",")
            }
            if(this.checked){
              if(!biList.some(binst=>binst==inst.id)){
                biList.push(inst.id)
                if(biList.length>1){
                  bi.value=biList.join()
                }else{
                  bi.value=biList[0]
                }
              }
            }else{
              if(biList.some(binst=>binst==inst.id)){
                var arrBi=[];
                biList.forEach(binst=>{
                  if(binst!=inst.id)arrBi.push(binst)
                })
                bi.value=arrBi.join()
              }
            }
          })
        })
      }
    }else{
      ssel.style.display="none";
    }
  })
  // ssel.addEventListener('mouseout',function(){
  //   // console.log(document.activeElement.id);
  //   // this.style.display="none";
  // })
  document.querySelector("#autoImportNewImage").checked =
    data.institution.autoImportNewImage == 1 ? true : false;
  document.querySelector("#alwaysCreateNewPatient").checked =
    data.institution.alwaysCreateNewPatient == 1 ? true : false;
  document.querySelector("#deleteImportedImageset").checked =
    data.institution.deleteImportedImageset == 1 ? true : false;
  document.querySelector("#autoSegmentation").checked =
    data.institution.autoSegmentation == 1 ? true : false;
  if (data.backup.deleteAfterBackup == 1) {
    document.querySelector("#deleteAfterBackup").checked = true;
    document.querySelector('#keepDays').removeAttribute("hidden");
    document.getElementById("autoDeleteRestorePatientForm").setAttribute("hidden", true);
  } else {
    document.querySelector("#deleteAfterBackup").checked = false;
    document.querySelector('#keepDays').setAttribute("hidden", true);
    document.getElementById("autoDeleteRestorePatientForm").removeAttribute("hidden");
  }
  if (data.backup.autoDeleteRestorePatient == 1) {
    document.querySelector("#autoDeleteRestorePatient").checked = true;
    document.getElementById("spaceLimit").removeAttribute("hidden");
  } else {
    document.querySelector("#autoDeleteRestorePatient").checked = false;
    document.getElementById("spaceLimit").setAttribute("hidden", true);
  }
  document.querySelector("#backupLockedOnly").checked =
    data.backup.backupLockedOnly == 1 ? true : false;
  document.querySelector("#backupAccordingImageDate").checked =
    data.backup.backupAccordingImageDate == 1 ? true : false;
  document.querySelector("#restoreKeepLastName").checked =
    data.backup.restoreKeepLastName == 1 ? true : false;
  document.querySelector("#deleteAfterBackup").checked =
    data.backup.deleteAfterBackup == 1 ? true : false;
  document.querySelector("#showDB").innerHTML = document.querySelector(
    '[name="backupDaysBefore"]'
  ).value;
  document.querySelector("#showBN").innerHTML = document.querySelector(
    '[name="backupNumberPerDay"]'
  ).value;
  document.querySelector("#showKeepDays").innerHTML =
    document.querySelector('[name="keepDaysBeforeDelete"]').value + "天";
  document.querySelector("#showCapacity").innerHTML =
    document.querySelector('[name="capacityUpperLimit"]').value + "%";
  if(checkLoginStatus()){
    document.getElementById('user-info').innerHTML = userName;
    checkAdmin ()
  }
  
  setEventListeners();
}

function setEventListeners() {
  initBtn.addEventListener("click", event => {
    postData("synchronization",'json');
  });
  subBtn.onclick = function(e) {
    var data = { institution: {}, pgConfig: {}, backup: {} };
    for (var i = 0; i < instElements.length; i++) {
      data.institution[instElements[i].name] = instElements[i].value;
    }
    for (var i = 0; i < dbElements.length; i++) {
      data.pgConfig[dbElements[i].name] = dbElements[i].value;
    }
    for (var i = 0; i < bkpElements.length; i++) {
      data.backup[bkpElements[i].name] = bkpElements[i].value;
    }
    data.institution.backupInstitutions=data.institution.backupInstitutions.split(",")
    // console.log(data)
    postData("settings",'json', data);
  };
  document.querySelector('[name="max"]').addEventListener("input", function() {
    document.querySelector("#showCn").innerHTML = this.value;
  });
  document.querySelector('[name="max"]').addEventListener("change", function() {
    document.querySelector("#showCn").innerHTML = this.value;
  });
  document
    .querySelector('[name="backupNumberPerDay"]')
    .addEventListener("input", function() {
      document.querySelector("#showBN").innerHTML = this.value;
    });
  document
    .querySelector('[name="backupNumberPerDay"]')
    .addEventListener("change", function() {
      document.querySelector("#showBN").innerHTML = this.value;
    });
    document
      .querySelector('[name="keepDaysBeforeDelete"]')
      .addEventListener("input", function() {
        document.querySelector("#showKeepDays").innerHTML = this.value;
      });
    document
      .querySelector('[name="keepDaysBeforeDelete"]')
      .addEventListener("change", function() {
        document.querySelector("#showKeepDays").innerHTML = this.value;
      });
    document
      .querySelector('[name="backupDaysBefore"]')
      .addEventListener("input", function() {
        document.querySelector("#showDB").innerHTML = this.value;
      });
    document
      .querySelector('[name="backupDaysBefore"]')
      .addEventListener("change", function() {
        document.querySelector("#showDB").innerHTML = this.value;
      });
  document
    .querySelector('[name="capacityUpperLimit"]')
    .addEventListener("input", function() {
      document.querySelector("#showCapacity").innerHTML = this.value + "%";
    });
  document
    .querySelector('[name="capacityUpperLimit"]')
    .addEventListener("change", function() {
      document.querySelector("#showCapacity").innerHTML = this.value + "%";
    });
  document
    .querySelector("#autoDeleteRestorePatient")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="autoDeleteRestorePatient"]').value = 1;
        document.getElementById("spaceLimit").removeAttribute("hidden");
      } else {
        document.querySelector('[name="autoDeleteRestorePatient"]').value = 0;
        document.getElementById("spaceLimit").setAttribute("hidden", true);
      }
    });
  document
    .querySelector("#backupLockedOnly")
    .addEventListener("change", function() {
      document.querySelector('[name="backupLockedOnly"]').value = this.checked
        ? 1
        : 0;
    });
  document
    .querySelector("#backupAccordingImageDate")
    .addEventListener("change", function() {
      document.querySelector('[name="backupAccordingImageDate"]').value = this.checked
        ? 1
        : 0;
    });
  document
    .querySelector("#restoreKeepLastName")
    .addEventListener("change", function() {
      document.querySelector('[name="restoreKeepLastName"]').value = this.checked
        ? 1
        : 0;
    });
  document
    .querySelector("#deleteAfterBackup")
    .addEventListener("change", function() {
      if(this.checked){
        document.querySelector('[name="deleteAfterBackup"]').value = 1
        document.getElementById("autoDeleteRestorePatientForm").setAttribute("hidden", true);
        document.getElementById("keepDays").removeAttribute("hidden");
      }else{
        document.querySelector('[name="deleteAfterBackup"]').value = 0
        document.getElementById("keepDays").setAttribute("hidden", true);
        document.getElementById("autoDeleteRestorePatientForm").removeAttribute("hidden");
      }
    });
  document
    .querySelector("#autoImportNewImage")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="autoImportNewImage"]').value = 1;
      } else {
        document.querySelector('[name="autoImportNewImage"]').value = 0;
      }
  });
  document
    .querySelector("#alwaysCreateNewPatient")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="alwaysCreateNewPatient"]').value = 1;
      } else {
        document.querySelector('[name="alwaysCreateNewPatient"]').value = 0;
      }
    });
  document
    .querySelector("#deleteImportedImageset")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="deleteImportedImageset"]').value = 1;
      } else {
        document.querySelector('[name="deleteImportedImageset"]').value = 0;
      }
    });
  document
    .querySelector("#autoSegmentation")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="autoSegmentation"]').value = 1;
      } else {
        document.querySelector('[name="autoSegmentation"]').value = 0;
      }
    });
}
