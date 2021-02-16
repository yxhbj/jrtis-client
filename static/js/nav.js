document.body.addEventListener('click', (event) => {
    // console.log(event)
  if (event.target.dataset.section) {
    handleSectionTrigger(event)
  } else if (event.target.dataset.modal) {
    handleModalTrigger(event);
  } else if (event.target.classList.contains('modal-hide')) {  
    hideAllModals();
  // } else if (event.target.classList.contains('modal-login')) {
  //   userCheck();
  }else if(event.target.classList.contains('logout')){
    Settings.delete('login')
    token=null
    userInfo=null
    user=null
    displayLogin();
  }
})

document.onkeydown=function(ev){
  var event=ev ||event
  if(event.keyCode==13){
    // if(checkLoginStatus) document.querySelector(".login-button").click();
  }
}

function handleSectionTrigger (event) {
  hideAllSectionsAndDeselectButtons()

  // Highlight clicked button and show view
  event.target.classList.add('is-selected')

  // Display the current section
  const sectionId = `${event.target.dataset.section}-section`
  const headerId = `${event.target.dataset.section}-header`
  document.getElementById(sectionId).classList.add('is-shown')
  document.getElementById(headerId).classList.add('is-shown')

  // Save currently active button in localStorage
  const buttonId = event.target.getAttribute('id')
  Cookies.set('activeSectionButtonId', buttonId)
}

function activateDefaultSection () {
  document.getElementById('button-institution-data').click()
}

function setProductInfo(){
  var prod=document.querySelectorAll('#product-name');
  var vers=document.querySelectorAll('#product-version');
  // for (var i = 0; i < prod.length; i++) {
    prod[i].innerText = '放射治疗计划数据智能管理系统';
    vers[i].innerText = '0.1.0';
  // }
}

function showMainContent () {
  document.querySelector('.js-nav').classList.add('is-shown')
  document.querySelector('.js-content').classList.add('is-shown')
  checkAdmin ()
}

function handleModalTrigger (event) {
  hideAllModals()
  const modalId = `${event.target.dataset.modal}-modal`
  document.getElementById(modalId).classList.add('is-shown')
}

function hideAllModals () {
  const modals = document.querySelectorAll('.modal.is-shown')
  Array.prototype.forEach.call(modals, (modal) => {
    modal.classList.remove('is-shown')
  })
  showMainContent()
}

function hideAllSectionsAndDeselectButtons () {
  const sections = document.querySelectorAll('.js-section.is-shown')
  Array.prototype.forEach.call(sections, (section) => {
    section.classList.remove('is-shown')
  })

  const headers = document.querySelectorAll('.section-header.is-shown')
  Array.prototype.forEach.call(headers, (header) => {
    header.classList.remove('is-shown')
  })

  const buttons = document.querySelectorAll('.nav-button.is-selected')
  Array.prototype.forEach.call(buttons, (button) => {
    button.classList.remove('is-selected')
  })
}

function displayAbout () {
  document.querySelector('#about-modal').classList.add('is-shown')
  setProductInfo();
}

function displayLogin () {
  ipcRenderer.sendSync('logout-message', 'logout')
  // location.href="./signin.html"
}

function showAdmin () {
  document.querySelectorAll('.admin').forEach(adm=>adm.classList.add('is-shown'))
}

function hideAdmin () {
  document.querySelectorAll('.admin').forEach(adm=>adm.classList.remove('is-shown'))
}

function checkAdmin () {
  if(userInfo.role==="Administrator"){
    showAdmin()
  }else{
    hideAdmin()
  }
  return userInfo.role==="Administrator"
}

// function setUserInfo (userLogin) {
//   Cookies.set('rtpmsLogin',true);
//   Cookies.set('userInfo',userLogin)
//   document.getElementById('user-info').innerHTML = userLogin.userName;
// }

// Default to the view that was active the last time the app was open
const sectionId = Cookies.get('activeSectionButtonId')
if (sectionId) {
  const section = document.getElementById(sectionId)
  if (section) section.click()
} else {
  activateDefaultSection()
}
// user功能

// function userCheck(){
//   var user=document.getElementById('user'),
//     password=document.getElementById('password'),
//     message=document.getElementById('message'),
//     userData={
//         loginName:user.value,
//         password:password.value
//     };

//   if(userData.password==''||userData.password==''){
//       message.innerHTML="输入的用户名或者密码不能为空，请重新输入。";
//   }else{
//     postData("authenticate","json",userData).then(res=>{
//       console.log(res)
//       if(JSON.stringify(res)!="[]"){
//         // hideAllModals ();
//         // checkAdmin ();
//         // setUserInfo(res[0]);
//         // init();
//       }else{
//         message.innerHTML="输入的用户名或者密码错误，请重新输入。";
//       }
//     }).catch(e=>console.log(e))
//   }
// }


showMainContent()