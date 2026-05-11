import {GameBoard, ShipBoard, HeatBoard} from "./board.js"
import {showPopup, sleep} from "./util.js"
import {setEnemyAgain} from "./singleplayer.js"

export class Player {
    gameBoard
    shipBoard
    heatBoard
    countTwoShips
    countThreeShips
    countFourShips
    TempCountTwoShips
    TempCountThreeShips
    TempCountFourShips
    enemy

    constructor(countTwoShips, countThreeShips, countFourShips) {
        this.gameBoard = new GameBoard
        this.shipBoard = new ShipBoard
        this.heatBoard = new HeatBoard
        this.countTwoShips = countTwoShips
        this.countThreeShips = countThreeShips
        this.countFourShips = countFourShips
        this.TempCountTwoShips = countTwoShips
        this.TempCountThreeShips = countThreeShips
        this.TempCountFourShips = countFourShips
    }

    updateParams(countTwoShips, countThreeShips, countFourShips) {
        this.countTwoShips = countTwoShips
        this.countThreeShips = countThreeShips
        this.countFourShips = countFourShips
        this.TempCountTwoShips = countTwoShips
        this.TempCountThreeShips = countThreeShips
        this.TempCountFourShips = countFourShips
    }

    setEnemy(Enemy) {
        this.enemy = Enemy
    }

    placeShipsRandom() {
        let trys = 10000
        const nextInt = (start, end) => Math.floor(Math.random() * (end - start) + start)

        this.shipBoard.resetBoard()

        this.TempCountFourShips = this.countFourShips
        this.TempCountThreeShips = this.countThreeShips
        this.TempCountTwoShips = this.countTwoShips

        while (this.TempCountTwoShips > 0 || this.TempCountThreeShips > 0 || this.TempCountFourShips > 0) {
            if (trys === 0 || !this.placementPossible()) {
                showPopup("Es konnten nicht alle Schiffe platziert werden", "red")
                return false
            }

            let length
            do {
                length = nextInt(2, 5)
            } while (
                (length === 2 && this.TempCountTwoShips <= 0) ||
                (length === 3 && this.TempCountThreeShips <= 0) ||
                (length === 4 && this.TempCountFourShips <= 0)
            );

            if (!this.placementValid(length)) {
                trys--
                continue
            }

            let posX = nextInt(0, 8)
            let posY = nextInt(0, 8)
            let dir = nextInt(0, 2)

            if ((dir === 0 && posX + length > 8) || (dir === 1 && posY + length > 8)) {
                trys--
                continue
            }

            if (!this.shipBoard.checkAllIfUsable(posX, posY, dir, length)) {
                trys--
                continue
            }

            this.shipBoard.placeShip(posX, posY, dir, length)

            switch (length) {
                case 2:
                    this.TempCountTwoShips--
                    break;
                case 3:
                    this.TempCountThreeShips--
                    break;
                case 4:
                    this.TempCountFourShips--
                    break;
            }

            trys--
        }

        this.TempCountFourShips = this.countFourShips
        this.TempCountThreeShips = this.countThreeShips
        this.TempCountTwoShips = this.countTwoShips

        let expectedCount = this.countTwoShips * 2 + this.countThreeShips * 3 + this.countFourShips * 4
        let Count = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.shipBoard.Board[i][j] === 4) Count++
            }
        }
        if (Count === expectedCount) {
            return true
        } else {
            showPopup("Es konnten nicht alle Schiffe platziert werden", "red")
            return false
        }
    }

    placementValid(length) {
        switch (length) {
            case (0) : return false
            case (2) :
                if (!(this.TempCountTwoShips == 0)) {
                    return true
                }
            break
            case (3) :
                if (!(this.TempCountThreeShips == 0)) {
                    return true
                }
            break
            case (4) :
                if (!(this.TempCountFourShips == 0)) {
                    return true
                }
            break
        }
        return false
    }

    placementPossible() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.shipBoard.checkIfUsable(i, j)) {
                    if ((this.shipBoard.checkIfUsable(i + 1, j) || this.shipBoard.checkIfUsable(i - 1, j) || this.shipBoard.checkIfUsable(i, j + 1) || this.shipBoard.checkIfUsable(i, j - 1)) && this.countTwoShips != 0) return true
                    if (((this.shipBoard.checkIfUsable(i + 1, j) && this.shipBoard.checkIfUsable(i + 2, j)) || (this.shipBoard.checkIfUsable(i, j + 1) && this.shipBoard.checkIfUsable(i, j + 2)) || (this.shipBoard.checkIfUsable(i - 1, j) && this.shipBoard.checkIfUsable(i - 2, j)) || (this.shipBoard.checkIfUsable(i, j - 1) && this.shipBoard.checkIfUsable(i, j - 2))) && this.countThreeShips != 0) return true
                    if (((this.shipBoard.checkIfUsable(i + 1, j) && this.shipBoard.checkIfUsable(i + 2, j) && this.shipBoard.checkIfUsable(i + 3, j)) || (this.shipBoard.checkIfUsable(i, j + 1) && this.shipBoard.checkIfUsable(i, j + 2) && this.shipBoard.checkIfUsable(i, j + 3)) || (this.shipBoard.checkIfUsable(i - 1, j) && this.shipBoard.checkIfUsable(i - 2, j) && this.shipBoard.checkIfUsable(i - 3, j)) || (this.shipBoard.checkIfUsable(i, j - 1) && this.shipBoard.checkIfUsable(i, j - 2) && this.shipBoard.checkIfUsable(i, j - 3))) && this.countFourShips != 0) return  true
                }
            }
        }
        return false
    }

    hasWon() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.enemy.shipBoard.Board[i][j] == 4) {
                    return false
                }
            }
        }
        return true
    }

    recolorDestroyedShip(PosX, PosY) {
        const directions = [
        [-1, 0], // oben
        [1, 0],  // unten
        [0, -1], // links
        [0, 1]   // rechts
        ]

        for (let i = 0; i < directions.length; i++) {
            let dir = directions[i]
            let posX = PosX + dir[1]
            let posY = PosY + dir[0]
            if (posX >= 0 && posX < 8 && posY >= 0 && posY < 8) {
                if (this.enemy.shipBoard.Board[posY][posX] == 2) {
                    this.gameBoard.Board[posY][posX] = 3
                    this.enemy.shipBoard.Board[posY][posX] = 3
                    this.recolorDestroyedShip(posX, posY)
                }
            }
        }
    }

    fullShipDestroyed(PosX, PosY) {
        return (this.shipIsDestroyed(PosX, PosY, 1, 0) && this.shipIsDestroyed(PosX, PosY, -1, 0) && this.shipIsDestroyed(PosX, PosY, 0, 1) && this.shipIsDestroyed(PosX, PosY, 0, -1))
    }

    shipIsDestroyed(PosX, PosY, DirX, DirY) {
        let posX = PosX + DirX
        let posY = PosY + DirY
        if (posX >= 0 && posX < 8 && posY >= 0 && posY < 8) {
            if (this.enemy.shipBoard.Board[posY][posX] == 2) {
                return this.shipIsDestroyed(posX, posY, DirX, DirY)
            } else return this.enemy.shipBoard.Board[posY][posX] != 4
        }
        return true
    }

    updateCounts(PosX, PosY) {
        const lenght = this.getDestroyedShipLenght(PosX, PosY)
        switch (lenght) {
            case 2 : {
                this.TempCountTwoShips--
                break
            }
            case 3 : {
                this.TempCountThreeShips--
                break
            }
            case 4 : {
                this.TempCountFourShips--
                break
            }
        }
    }

    getDestroyedShipLenght(PosX, PosY, visited = null) {
        if (!visited) {
            visited = []
            for (let i = 0; i < 8; i++) {
                visited[i] = []
                for (let j = 0; j < 8; j++) {
                    visited[i][j] = false
                }
            }
        }

        if (PosX < 0 || PosX >= 8 || PosY < 0 || PosY >= 8) return 0
        if (visited[PosY][PosX]) return 0
        if (this.gameBoard.Board[PosX][PosY] !== 2) return 0

        visited[PosY][PosX] = true
        let length = 1

        const directions = [
            [-1, 0], // oben
            [1, 0],  // unten
            [0, -1], // links
            [0, 1]   // rechts
        ]

        for (let i = 0; i < directions.length; i++) {
            let dy = directions[i][0]
            let dx = directions[i][1]
            length += this.getDestroyedShipLenght(PosX + dx, PosY + dy, visited)
        }

        return length
    }
}


export class User extends Player {

    constructor(countTwoShips, countThreeShips, countFourShips) {
        super(countTwoShips, countThreeShips, countFourShips)
    }

    attack(posX, posY) {
        if (this.enemy.shipBoard.Board[posY][posX] == 0) {
            //Verfehlt
            this.enemy.shipBoard.Board[posY][posX] = 1
            this.gameBoard.Board[posY][posX] = 1
            return false
        } else if (this.enemy.shipBoard.Board[posY][posX] == 4) {
            //Treffer
            this.enemy.shipBoard.Board[posY][posX] = 2
            this.gameBoard.Board[posY][posX] = 2
            if (this.fullShipDestroyed(posX, posY)) {
                //Schiff zerstört
                this.updateCounts(posY, posX)
                this.recolorDestroyedShip(posX, posY)
            }
            return true
        }
    }
    
}


export class Bot extends Player {
    lastPosX
    lastPosY
    isHunting
    difficulty
    delay = true

    constructor(countTwoShips, countThreeShips, countFourShips, Difficulty) {
        super(countTwoShips, countThreeShips, countFourShips)
        this.difficulty = Difficulty
        this.isHunting = true
    }

    updateParams(countTwoShips, countThreeShips, countFourShips, Difficulty) {
        this.countTwoShips = countTwoShips
        this.countThreeShips = countThreeShips
        this.countFourShips = countFourShips
        this.TempCountTwoShips = countTwoShips
        this.TempCountThreeShips = countThreeShips
        this.TempCountFourShips = countFourShips
        this.difficulty = Difficulty
    }

    updateParamDelay(value) {
        this.delay = value
    }

    async placeShips() {
        let succesfull = false
        let attempts = 0

        while (!succesfull && attempts < 20) {
            if (this.delay) await sleep(1000 + Math.random() * 1000)
            succesfull = this.placeShipsRandom()
            attempts++
        }

        if (succesfull) {
            showPopup("Dein Gegner hat alle Schiffe platziert", "green")
            return true
        } else {
            showPopup("Es konnten nicht alle Schiffe platziert werden. Versuche das Spiel erneut mit weniger Schiffen zu starten", "red")
            return false
        }
    }

    placeShipsRandom() {
        let trys = 10000
        const nextInt = (start, end) => Math.floor(Math.random() * (end - start) + start)

        this.shipBoard.resetBoard()

        this.TempCountFourShips = this.countFourShips
        this.TempCountThreeShips = this.countThreeShips
        this.TempCountTwoShips = this.countTwoShips

        while (this.TempCountTwoShips > 0 || this.TempCountThreeShips > 0 || this.TempCountFourShips > 0) {
            if (trys <= 0 || !this.placementPossible()) {
                return false
            }

            let length
            do {
                length = nextInt(2, 5)
            } while (
                (length === 2 && this.TempCountTwoShips <= 0) ||
                (length === 3 && this.TempCountThreeShips <= 0) ||
                (length === 4 && this.TempCountFourShips <= 0)
            );

            if (!this.placementValid(length)) {
                trys--
                continue
            }

            let posX = nextInt(0, 8)
            let posY = nextInt(0, 8)
            let dir = nextInt(0, 2)

            if ((dir === 0 && posX + length > 8) || (dir === 1 && posY + length > 8)) {
                trys--
                continue
            }

            if (!this.shipBoard.checkAllIfUsable(posX, posY, dir, length)) {
                trys--
                continue
            }

            this.shipBoard.placeShip(posX, posY, dir, length)

            switch (length) {
                case 2:
                    this.TempCountTwoShips--
                    break;
                case 3:
                    this.TempCountThreeShips--
                    break;
                case 4:
                    this.TempCountFourShips--
                    break;
            }

            trys--
        }

        this.TempCountFourShips = this.countFourShips
        this.TempCountThreeShips = this.countThreeShips
        this.TempCountTwoShips = this.countTwoShips

        let expectedCount = this.countTwoShips * 2 + this.countThreeShips * 3 + this.countFourShips * 4
        let Count = 0
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.shipBoard.Board[i][j] === 4) Count++
            }
        }
        
        return (Count === expectedCount)
    }

    attackNormal() {
        const nextInt = (start, end) => {return Math.floor(Math.random() * (end - start) + start)}
        let again = true

        while (again) {

            let posX = nextInt(0, 8)
            let posY = nextInt(0, 8)

            if (this.enemy.shipBoard.Board[posY][posX] === 1 || this.enemy.shipBoard.Board[posY][posX] === 2 || this.enemy.shipBoard.Board[posY][posX] === 3) continue

            if (this.enemy.shipBoard.Board[posY][posX] === 0) {
                //Verfehlt
                this.enemy.shipBoard.Board[posY][posX] = 1
                this.gameBoard.Board[posY][posX] = 1
                return false
            } else if (this.enemy.shipBoard.Board[posY][posX] === 4) {
                //Treffer
                this.enemy.shipBoard.Board[posY][posX] = 2
                this.gameBoard.Board[posY][posX] = 2
                if (this.fullShipDestroyed(posX, posY)) {
                    //Schiff zerstört
                    this.updateCounts(posY, posX)
                    this.recolorDestroyedShip(posX, posY)
                }
                return true
            }
            again = false
        }
    }

    attackSmart() {
        this.heatBoard.resetBoard()

        if (this.isHunting) {
            this.heatBoard.updateHunt(this.gameBoard, this.TempCountFourShips, this.TempCountThreeShips, this.TempCountTwoShips)
        } else {
            this.heatBoard.updateTarget(this.gameBoard, this.lastPosX, this.lastPosY)
        }
        let target = this.getBestAim()
        let posX = target[0]
        let posY = target[1]
        if (this.enemy.shipBoard.Board[posY][posX] === 0) {
            //Verfehlt
            this.enemy.shipBoard.Board[posY][posX] = 1
            this.gameBoard.Board[posY][posX] = 1
            return false
        } else if (this.enemy.shipBoard.Board[posY][posX] === 4) {
            //Treffer
            this.lastPosX = posX
            this.lastPosY = posY
            this.isHunting = false
            this.enemy.shipBoard.Board[posY][posX] = 2
            this.gameBoard.Board[posY][posX] = 2
            if (this.fullShipDestroyed(posX, posY)) {
                //Schiff zerstört
                this.updateCounts(posY, posX)
                this.recolorDestroyedShip(posX, posY)
                this.isHunting = true
            }
            return true
        }
    }

    async attack() {
        if (this.delay) await sleep(Math.random() * 2500 + 500)
        if (this.difficulty === 0) {
            setEnemyAgain(this.attackNormal())
        } else setEnemyAgain(this.attackSmart())
    }

    getBestAim() {
        let maxValue = 0
        let out = [0, 0]
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.heatBoard.Board[i][j] > maxValue) {
                    maxValue = this.heatBoard.Board[i][j]
                    out[0] = j
                    out[1] = i
                } else if (this.heatBoard.Board[i][j] == maxValue) {
                    if (this.sumOfNeighbors(j, i) > this.sumOfNeighbors(out[0], out[1])) {
                        out[0] = j
                        out[1] = i
                    }
                    if (this.sumOfNeighbors(j, i) == this.sumOfNeighbors(out[0], out[1])) {
                        if (Math.random() > 0.5) {
                            out[0] = j
                            out[1] = i
                        }
                    }
                }
            }
        }
        return out
    }

    sumOfNeighbors(PosX, PosY) {
        let sum = 0

        const directions = [
        [-1, 0], // oben
        [1, 0],  // unten
        [0, -1], // links
        [0, 1]   // rechts
        ]

        for (let i = 0; i < directions.length; i++) {
            let dir = directions[i]
            let posX = PosX + dir[1]
            let posY = PosY + dir[0]
            if (posX < 0 || posX > 7 || posY < 0 || posY > 7) continue
            sum += this.heatBoard.Board[posY][posX]
        }
        return sum
    }
}