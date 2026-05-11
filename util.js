export function createGrid(containerId, onClick) {
  const container = document.getElementById(containerId)
  container.innerHTML = ""
  container.classList.add("grid")
  container.addEventListener('contextmenu', (event) => {
        event.preventDefault()
      });
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cell = document.createElement("div")
      const img = document.createElement("img")
      img.id = containerId + (i + 1) + (j + 1) + "img"
      img.classList.add("unclickable")
      img.classList.add("cellImg")
      img.classList.add("invisible")
      cell.appendChild(img)
      cell.classList.add("cell")
      cell.id = containerId + (i + 1) + (j + 1)
      cell.dataset.x = j + 1
      cell.dataset.y = i + 1
      cell.dataset.state = 0
      cell.addEventListener("mousedown", (event) => {
        onClick(event)
      })
      container.appendChild(cell)
    }
  }
}

export function createToggle(buttonId, firstButtonValue, secondButtonValue) {
  const button = document.getElementById(buttonId)
  button.innerText = firstButtonValue
  let buttonValue = button.innerText
  button.addEventListener("click", () => {
      if (buttonValue === firstButtonValue) {
          buttonValue = secondButtonValue
      } else if (buttonValue === secondButtonValue) buttonValue = firstButtonValue
      button.innerText = buttonValue
  })
}

export function setDisabled(id, value) {
  const object = document.getElementById(id)
  if (value) object.classList.add("disabled")
  if (!value) object.classList.remove("disabled")
}

export function showPopup(message, color) {
  const popup = document.createElement("div")
  document.body.appendChild(popup)
  popup.classList.add("popup")
  popup.textContent = message;
  popup.style.backgroundColor = color
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      popup.classList.add("popup-shown")
    })
  })    
  setTimeout(() => {
    popup.classList.remove("popup-shown")
    setTimeout(() => {popup.remove()}, 1000)
  }, 3000)
}

export function createThemeToggle(buttonId, iconId, firstButtonValue, secondButtonValue, firstIconPath, secondIconPath) {
  const savedTheme = localStorage.getItem("theme")
  const initTheme = savedTheme || document.body.getAttribute("data-theme") || firstButtonValue
  const themeToggle = document.getElementById(buttonId)
  const themeIcon = document.getElementById(iconId)
  document.body.setAttribute("data-theme", initTheme)
  document.body.classList.remove(firstButtonValue, secondButtonValue)
  document.body.classList.add(initTheme)
  if (initTheme === secondButtonValue) {
    themeIcon.src = secondIconPath
  }
  if (initTheme === firstButtonValue) {
    themeIcon.src = firstIconPath
  }
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme")
    const newTheme = currentTheme === firstButtonValue ? secondButtonValue : firstButtonValue
    document.body.setAttribute("data-theme", newTheme)
    if (newTheme === secondButtonValue) {
      themeIcon.src = secondIconPath
      document.body.classList.replace(firstButtonValue, secondButtonValue)
    }
    if (newTheme === firstButtonValue) {
      themeIcon.src = firstIconPath
      document.body.classList.replace(secondButtonValue, firstButtonValue)
    }
    localStorage.setItem("theme", newTheme)
  })
}

export function inputCheck(inputId) {
  const input = document.getElementById(inputId)
  input.addEventListener("input", () => {
    if (input.checkValidity()) {
      input.classList.remove("invalid")
    }
    if (!input.checkValidity()) {
      input.classList.add("invalid")
    }
  })
}

export function status(message, value) {
  const status = document.getElementById("status")
  if (value) status.classList.remove("invisible")
  if (!value) status.classList.add("invisible")
  status.innerText = message
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function report(buttonID, windowID, reportID, submitID, textID) {
  const button = document.getElementById(buttonID)
  const window = document.getElementById(windowID)
  const report = document.getElementById(reportID)
  const submit = document.getElementById(submitID)
  const text = document.getElementById(textID)
  button.addEventListener("click", () => {
    window.classList.remove("invisible")
  })
  window.addEventListener("mousedown", () => {
    window.classList.add("invisible")
  })
  report.addEventListener("mousedown", (event) => {
    event.stopPropagation()
  })
  //Feedback verarbeiten
}