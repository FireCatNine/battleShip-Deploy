import {User, Bot} from "./player.js"
import {createGrid, createToggle, setDisabled, showPopup, createThemeToggle, inputCheck, status, report} from "./util.js"


const standard = document.getElementById("standardButton")
const diffToggle = document.getElementById("diffToggle")
const startButton = document.getElementById("startButton")
const twoShips = document.getElementById("ships2")
const threeShips = document.getElementById("ships3")
const fourShips = document.getElementById("ships4")
const playerGrid = document.getElementById("spieler")
const enemyGrid = document.getElementById("gegner")
const themeToggle = document.getElementById("themeToggle")
const Empty = document.getElementById("empty")
const Delays = document.getElementById("delays")
const Best = document.getElementById("best")
const Help = document.getElementById("help")
const Status = document.getElementById("status")

let gameState = 0 // 0 = Anfang 1 = Platzieren 2 = Gegner platziert 3 = Angreifen 4 = Gegner greift an 5 = Ende
let Difficulty = 1 // 0 = Einfach 1 = Normal
let CountTwoShips
let CountThreeShips
let CountFourShips
let delays = true
let empty = false
let best = false
let PlayerAgain
let EnemyAgain
const user = new User
const bot = new Bot
const cmd = "\u0074\u0075\u0074\u0065\u006C"



export function setEnemyAgain(value) {
    EnemyAgain = value
}

function playerClick(event) {
    if (gameState === 1) {
        const cell = event.target
        const x = parseInt(cell.dataset.x) - 1
        const y = parseInt(cell.dataset.y) - 1
        if (event.button === 0) {
            if (user.shipBoard.Board[y][x] === 0) {
                user.shipBoard.Board[y][x] = 4
            } else if (user.shipBoard.Board[y][x] === 4) {
                user.shipBoard.Board[y][x] = 0
            }
        }
        updateBoard("spieler", user.shipBoard)
        localStorage.setItem("board" + y + x, user.shipBoard.Board[y][x])
    }
}

async function Game() {
    updateAll()
    while (!user.hasWon() && !bot.hasWon()) {
        PlayerAgain = true
        EnemyAgain = true
        gameState = 3
        updateStatus()
        while (PlayerAgain) {
            await waitForAttack()
            updateAll()
            checkWin()
        }
        if (!user.hasWon() && !bot.hasWon()) {
            gameState = 4
            updateStatus()
            while (EnemyAgain) {
            await bot.attack()
            updateAll()
            checkWin()
            }
        }
    }
}

function checkWin() {
    if (user.hasWon()) {
        showPopup("Du hast gewonnen :)", "green")
        status("Du hast gewonnen :)", true)
        gameState = 5
        updateStatus()
        updateAll()
    } else if (bot.hasWon()) {
        showPopup("Du hast leider verloren :(", "red")
        status("Du hast leider verloren :(", true)
        gameState = 5
        updateStatus()
        updateAll()
    }
}

async function ValidateAndStart() {
    if (user.shipBoard.validateBoard(CountTwoShips, CountThreeShips, CountFourShips)) {
        setDisabled("diff", true)
        setDisabled("settings", true)
        playerGrid.classList.add("noClick")
        gameState = 2
        updateStatus()
        if (!await bot.placeShips()) setTimeout(() => {
            window.location.reload()
        }, 3000)
        gameState = 3
        updateStatus()
        setDisabled("gegner", false)
        Game()
    } else {
        showPopup("Schiffe können so nicht angeordnet werden!", "red")
    }
}

function waitForAttack() {
    return new Promise( (resolve) => {
        enemyGrid.addEventListener("click", action)
        function action(event) {
            const cell = event.target.closest(".cell")
            if (cell) {
                const x = parseInt(cell.dataset.x) - 1
                const y = parseInt(cell.dataset.y) - 1
                enemyGrid.removeEventListener("click", action)
                PlayerAgain = user.attack(x, y)
                cell.classList.add("noClick")
                updateAll()
                resolve()
            }
        }
    })
}

function unlockPlacing() {
    if (twoShips.checkValidity() && threeShips.checkValidity() && fourShips.checkValidity() && (parseInt(twoShips.value) !== 0 || parseInt(threeShips.value) !== 0 || parseInt(fourShips.value) !== 0)) {
        CountTwoShips = parseInt(twoShips.value)
        CountThreeShips = parseInt(threeShips.value)
        CountFourShips = parseInt(fourShips.value)
        if (diffToggle.innerText === "Schwierigkeit: Einfach") Difficulty = 0
        if (diffToggle.innerText === "Schwierigkeit: Normal") Difficulty = 1
        user.updateParams(CountTwoShips, CountThreeShips, CountFourShips)
        bot.updateParams(CountTwoShips, CountThreeShips, CountFourShips, Difficulty)
        localStorage.setItem("Ship2", CountTwoShips)
        localStorage.setItem("Ship3", CountThreeShips)
        localStorage.setItem("Ship4", CountFourShips)
        localStorage.setItem("Diff", Difficulty)
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const value = localStorage.getItem("board" + i + j)
                if (value !== null) {
                     user.shipBoard.updateValue(i, j, parseInt(value))
                }
            }
        }
        playerGrid.classList.remove("disabled")
        startButton.classList.remove("disabled")
        standard.innerText = "Zufällig Platzieren"
        setTimeout( () => {
            gameState = 1
            updateStatus()
        }, 1)
    } else {
        playerGrid.classList.add("disabled")
        startButton.classList.add("disabled")
        setTimeout( () => {
            gameState = 0
            updateStatus()
        }, 1)
        standard.innerText = "Standardwerte"
    }
}

function updateStatus() {
    if (gameState === 0) status("Definiere die Spielparameter", true)
    if (gameState === 1) status("Platziere deine Schiffe", true)
    if (gameState === 2) status("Der Gegner platziert seine Schiffe, bitte warten", true)
    if (gameState === 3) {
        status("Du bist am Zug", true)
        setDisabled("spieler", true)
        setDisabled("gegner", false)
    }
    if (gameState === 4) {
        status("Der Gegner ist am Zug, bitte warten", true)
        setDisabled("gegner", true)
        setDisabled("spieler", false)
    }
    if (gameState === 5) {
        setDisabled("spieler", false)
        setDisabled("gegner", false)
        playerGrid.classList.add("noClick")
        enemyGrid.classList.add("noClick")
        createResetButton()
    }
}

function createResetButton() {
    setDisabled("diff", false)
    setDisabled("diffToggle", true)
    setDisabled("startButton", true)
    standard.innerText = "Neues Spiel"
    standard.addEventListener("click", () => {
        window.location.reload()
    })
}

function updateBest() {
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            const cell = document.getElementById("gegner" + i + j)
            cell.classList.remove("best")
        }
    }

    if (best && gameState > 2 && gameState < 5) {
        let target = false
        let posX, posY
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (user.gameBoard.Board[i][j] === 2) {
                    target = true
                    posX = i
                    posY = j
                }
            }
        }

        if (target) {
            user.heatBoard.updateTarget(user.gameBoard, posY, posX)
        } else user.heatBoard.updateHunt(user.gameBoard, user.TempCountFourShips, user.TempCountThreeShips, user.TempCountTwoShips)

        user.heatBoard.print()
        let max = 0
        let cells = []
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (user.heatBoard.Board[i][j] === max) {
                    cells.push("gegner" + (i + 1) + (j + 1))
                } else if (user.heatBoard.Board[i][j] > max) {
                    cells.length = 0
                    cells.push("gegner" + (i + 1) + (j + 1))
                    max = user.heatBoard.Board[i][j]
                }
            }
        }
        for (let cell of cells) {
            const Cell = document.getElementById(cell)
            Cell.classList.add("best")
        }

    }
}

function updateEmpty() {
    if (empty && gameState > 2) {
        user.heatBoard.updateHunt(user.gameBoard, user.TempCountFourShips, user.TempCountThreeShips, user.TempCountTwoShips)
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (user.heatBoard.Board[i][j] === 0 && user.gameBoard.Board[i][j] === 0) {
                    user.gameBoard.Board[i][j] = 5
                }
            }
        }
    } else {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (user.gameBoard.Board[i][j] === 5) {
                    user.gameBoard.Board[i][j] = 0
                }
            }
        }
    }
}

function updateAll() {
    updateBoard("spieler", user.shipBoard)
    updateBoard("gegner", user.gameBoard)
}

function updateBoard(boardId, RefferenzBoard) {
    updateEmpty()
    updateBest()
    const color = document.body.dataset.theme
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let id = boardId + (i + 1) + (j + 1) + "img"
            let img = document.getElementById(id)
            switch (RefferenzBoard.Board[i][j]) {
                case 0 : { //Wasser
                    img.classList.add("invisible")
                    break
                }
                case 1 : { //Versuchter Schuss
                    img.classList.remove("invisible")
                    if (color === "light") img.src = "./assets/icons/tryLight.svg"
                    if (color === "dark") img.src = "./assets/icons/tryDark.svg"
                    break
                }
                case 2 : { //Zerstörtes Schiffteil
                    img.classList.remove("invisible")
                    if (color === "light") img.src = "./assets/icons/hitLight.svg"
                    if (color === "dark") img.src = "./assets/icons/hitDark.svg"
                    break
                }
                case 3 : { //Zerstörtes Schiff
                    img.classList.remove("invisible")
                    if (color === "light") img.src = "./assets/icons/destroyedLight.svg"
                    if (color === "dark") img.src = "./assets/icons/destroyedDark.svg"
                    break
                }
                case 4 : { //Schiff
                    img.classList.remove("invisible")
                    if (color === "light") img.src = "./assets/icons/shipLight.svg"
                    if (color === "dark") img.src = "./assets/icons/shipDark.svg"
                    break
                }
                case 5 : { //Leeres Feld
                    img.classList.remove("invisible")
                    if (color === "light") img.src = "./assets/icons/dotLight.svg"
                    if (color === "dark") img.src = "./assets/icons/dotDark.svg"
                    break
                }
            }
        }
    }
}

function prepare() {
    createGrid("spieler", playerClick)
    createGrid("gegner", () => {}) 
    createToggle("diffToggle", "Schwierigkeit: Normal", "Schwierigkeit: Einfach")
    createThemeToggle("themeToggle", "themeIcon", "dark", "light", "./assets/icons/moon.svg", "assets/icons/sun.svg")
    themeToggle.addEventListener("click", () => {
        updateAll()
    })
    report("report-button", "report-window", "report", "submit", "report-input")
    setDisabled("spieler", true)
    setDisabled("gegner", true)
    setDisabled("startButton", true)
    startButton.addEventListener("click", ValidateAndStart)
    inputCheck("ships2")
    inputCheck("ships3")
    inputCheck("ships4")
    standard.addEventListener("click", () => {
        if (gameState === 0) {
        diffToggle.innerText = "Schwierigkeit: Normal"
        twoShips.value = "1"
        threeShips.value = "3"
        fourShips.value = "1"
        twoShips.dispatchEvent(new Event("input"))
        threeShips.dispatchEvent(new Event("input"))
        fourShips.dispatchEvent(new Event("input"))
        }
        if (gameState === 1) {
            user.placeShipsRandom()
            updateBoard("spieler", user.shipBoard)
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    localStorage.setItem("board" + i + j, user.shipBoard.Board[i][j])
                }
            }
        }
    })
    twoShips.addEventListener("input", unlockPlacing)
    threeShips.addEventListener("input", unlockPlacing)
    fourShips.addEventListener("input", unlockPlacing)
    diffToggle.addEventListener("click", unlockPlacing)
    user.setEnemy(bot)
    bot.setEnemy(user)
    updateStatus()
    Delays.addEventListener("click", () => {
        delays = Delays.checked
        bot.updateParamDelay(delays)
        localStorage.setItem("delay", delays)
    })
    if (localStorage.getItem("delay") === "false") {
        Delays.checked = false
        delays = false
        bot.updateParamDelay(delays)
    }
    Empty.addEventListener("click", () => {
        empty = Empty.checked
        localStorage.setItem("empty", empty)
        updateAll()
    })
    if (localStorage.getItem("empty") === "true") {
        Empty.checked = true
        empty = true
    }
    Best.addEventListener("click", () => {
        best = Best.checked
        localStorage.setItem("best", best)
        updateAll()
    })
    if (localStorage.getItem("best") === "true") {
        Best.checked = true
        best = true
    }
    twoShips.value = localStorage.getItem("Ship2")
    threeShips.value = localStorage.getItem("Ship3")
    fourShips.value = localStorage.getItem("Ship4")
    if (parseInt(localStorage.getItem("Diff")) === 0) diffToggle.dispatchEvent(new Event("click"))
    unlockPlacing()
    updateAll()
    window[cmd] = function() {
        bot.shipBoard.print()
    }
    Status.addEventListener("mouseover", () => {
        switch (gameState) {
            case 0 : {
                Help.innerText = "Du kannst jetzt entscheiden mit wie vielen Schiffen der jeweiligen Länge du spielen willst. Gib dazu die Anzahl in die Felder links ein. Rechts kannst du die Schwierigkeit ändern."
                break 
            }
            case 1 : {
                Help.innerText = "Schiffsteile können mit der linken Maustaste gesetzt und auch wieder entfernt werden. Platziere so viele Schiffe einer bestimmten Länge wie links angegeben als Ketten aus Schiffsteilen. Schiffe dürfen sich nur diagonal berühren. Zufällig Platzieren ordnet alle Schiffe zufällig an."
                break 
            }
            case 2 : {
                Help.innerText = "Warte bis der Bot alle seine Schiffe platziert hat."
                break 
            }
            case 3 : {
                Help.innerText = "Du bist am Zug. Klicke im rechten Spielfeld auf eines der Felder um deinen Gegenr dort anzugreifen. Wenn du triffst bist du erneut am Zug."
                break 
            }
            case 4 : {
                Help.innerText = "Dein Gegner ist am Zug, warte bis dieser angegriffen hat. Auf dem linken Spielfeld kannst du dessen Züge beobachten."
                break 
            }
            case 5 : {
                Help.innerText = "Das Spiel ist beendet. Um erneut zu spielen, drücke Neues Spiel."
                break 
            }
        }
        Help.classList.remove("invisible")
    })
    Status.addEventListener("mouseout", () => {
        Help.classList.add("invisible")
    })
}

prepare()