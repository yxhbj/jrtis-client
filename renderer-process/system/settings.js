const { ipcRenderer } = require("electron");

let subBtn = document.getElementById("process-save-settings");
let initBtn = document.getElementById("process-init-backuplist");
var instElements = document.querySelectorAll(".institution-form-input");
var dbElements = document.querySelectorAll(".database-form-input");
var bkpElements = document.querySelectorAll(".backup-form-input");

postForm("http://127.0.0.1:3000/system/settings");
setEventListeners();

ipcRenderer.on("information-dialog-selection", (event, index) => {
  if (index === 0) {
    postForm("http://127.0.0.1:3000/system/initialization");
  }
});

function postForm(uri, data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", uri);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) {
      return;
    }
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
      var body = data == undefined ? JSON.parse(xhr.response) : xhr.response;
      loadData(body);
    } else {
      reject(xhr);
    }
  };
  xhr.send(JSON.stringify(data));
}

function loadData(data) {
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
  if (data.backup.autoDeletePatient == 1) {
    document.querySelector("#autoDeletePatient").checked = true;
    document.getElementById("spaceLimit").removeAttribute("hidden");
  } else {
    document.querySelector("#autoDeletePatient").checked = false;
    document.getElementById("spaceLimit").setAttribute("hidden", true);
  }
  document.querySelector("#backupLockedOnly").checked =
    data.backup.backupLockedOnly == 1 ? true : false;
  document.querySelector("#showBN").innerHTML = document.querySelector(
    '[name="backupNumberPerDay"]'
  ).value;
  document.querySelector("#showCapacity").innerHTML =
    document.querySelector('[name="capacityUpperLimit"]').value + "%";
}

function setEventListeners() {
  initBtn.addEventListener("click", event => {
    postForm("http://127.0.0.1:3000/system/synchronization");
    //ipcRenderer.send('open-information-dialog')
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
    //console.log(data)
    postForm("http://127.0.0.1:3000/system/settings", data);
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
    .querySelector("#autoDeletePatient")
    .addEventListener("change", function() {
      if (this.checked) {
        document.querySelector('[name="autoDeletePatient"]').value = 1;
        document.getElementById("spaceLimit").removeAttribute("hidden");
      } else {
        document.querySelector('[name="autoDeletePatient"]').value = 0;
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
}
