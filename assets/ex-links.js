const shell = require('electron').shell

const links = document.querySelectorAll('a[href]')

Array.prototype.forEach.call(links, (link) => {
  const url = link.getAttribute('href')
  console.log(url)
  if (url.indexOf('http') === 0) {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      shell.openExternal(url)
    })
  }
})
