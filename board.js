export class Board {
    Board

    constructor() {
        this.Board = []
        for (let i = 0; i < 8; i++) {
            this.Board[i] = []
            for (let j = 0; j < 8; j++) {
                this.Board[i][j] = 0
            }
        }
    }

    resetBoard() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                this.Board[i][j] = 0
            }
        }
    }

    updateValue(x, y, value) {
        if (x >= 0 && x < 8 && y >= 0 && y < 8) this.Board[x][y] = value
    }

    print() { //Debug
        for (let i = 0; i < 8; i++) {
            let row = "";
            for (let j = 0; j < 8; j++) {
                row += this.Board[i][j] + "\t";
            }
            console.log(row);
        }
    }
}

export class GameBoard extends Board { // 0 = Wasser 1 = Verfehlt 2 = Treffer 3 = Schiff zerstört

}

export class ShipBoard extends Board { // 0 = Wasser 1 = Versuch des Gegners 2 = Zerstörtes Schiffteil 3 = Zerstörtes Schiff 4 = Schiff

    validateBoard(expectedCount2, expectedCount3, expectedCount4) {
        const computed = new Board
        let found2 = 0, found3 = 0, found4 = 0

        const isValidPos = (x, y) => {return x >= 0 && x < 8 && y >= 0 && y < 8}

        const checkNeighbours = (x, y, dir) => {
            if (dir === 0) {
                if ((y > 0 && this.Board[y - 1][x] !== 0) || (y < 7 && this.Board[y + 1][x] !== 0))
                    return false
            } else if (dir === 1) {
                if ((x > 0 && this.Board[y][x - 1] !== 0) || (x < 7 && this.Board[y][x + 1] !== 0))
                    return false
            }
            return true
        }

        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.Board[y][x] === 4 && computed.Board[y][x] === 0) {
                    computed.Board[y][x] = 1

                    let dir = null
                    if (isValidPos(x + 1, y) && this.Board[y][x + 1] === 4) dir = 0
                    else if (isValidPos(x, y + 1) && this.Board[y + 1][x] === 4) dir = 1

                    let length = 1
                    if (!checkNeighbours(x, y, dir)) return false
                    if (dir === null) return false

                    if (dir === 0) {
                        for (let k = 1; k < 5; k++) {
                            let newX = x + k
                            if (!isValidPos(newX, y) || this.Board[y][newX] !== 4) break
                            if (!checkNeighbours(newX, y, dir)) return false
                            computed.Board[y][newX] = 1
                            length++
                            if (length > 4) return false
                        }
                    } else if (dir === 1) {
                        for (let k = 1; k < 5; k++) {
                            let newY = y + k
                            if (!isValidPos(x, newY) || this.Board[newY][x] !== 4) break
                            if (!checkNeighbours(x, newY, dir)) return false
                            computed.Board[newY][x] = 1
                            length++
                            if (length > 4) return false
                        }
                    }

                    if (length === 2) found2++
                    else if (length === 3) found3++
                    else if (length === 4) found4++
                    else return false;
                }
            }
        }
        return found2 === expectedCount2 && found3 === expectedCount3 && found4 === expectedCount4;
    }

    checkAllIfUsable(posX, posY, dir, length) {
        for (let i = 0; i < length; i++) {
            if (dir == 0) {
                if (!this.checkIfUsable((posX + i), posY)) return false
            } else if (dir == 1) {
                if (!this.checkIfUsable(posX, (posY + i))) return false
            }
        }
        return true
    }

    checkIfUsable(PosX, PosY) {
        const directions = [
        [-1, 0], // oben
        [1, 0],  // unten
        [0, -1], // links
        [0, 1]   // rechts
        ]

        if (PosX < 0 || PosX > 7 || PosY < 0 || PosY > 7) return false
        if (this.Board[PosY][PosX] != 0) return false
        for (let i = 0; i < directions.length; i++) {
            let dir = directions[i]
            let posX = PosX + dir[1]
            let posY = PosY + dir[0]
            if (posX >= 0 && posX < 8 && posY >= 0 && posY < 8) {
                if (this.Board[posY][posX] != 0) return false
            }
        }
        return true
    }

    placeShip(posX, posY, dir, length) {
        for (let i = 0; i < length; i++) {
            if (dir == 1) {
                this.Board[(posY + i)][posX] = 4
            } else if (dir == 0) {
                this.Board[posY][(posX + i)] = 4
            }
        }
    }
}

export class HeatBoard extends Board {

    shipPlaceable(posX, posY, dir, length, gameBoard, CountFourShips, CountThreeShips, CountTwoShips) {
        switch (length) {
            case 2 : {
                if (CountTwoShips === 0) return false
                break
            }
            case 3 : {
                if (CountThreeShips === 0) return false
                break
            }
            case 4 : {
                if (CountFourShips === 0) return false
                break
            }
        }

        if (dir === 0) {
            if (posX + length - 1 > 7) return false
        } else if (dir === 1) {
            if (posY + length - 1 > 7) return false
        }
            for (let i = 0; i < length; i++) {
            if (dir === 1) {
                if (gameBoard.Board[posY + i][posX] !== 0 && gameBoard.Board[posY + i][posX] !== 2) return false
            } else if (dir === 0) {
                if (gameBoard.Board[posY][posX + i] !== 0 && gameBoard.Board[posY][posX + i] !== 2) return false
            }
        }
        return true;
    }

    getShipCountByIndex(index, CountFourShips, CountThreeShips, CountTwoShips) {
        let count = 0;
        switch (index) {
            case (2): {
                count = CountTwoShips;
                break;
            }
            case (3): {
                count = CountThreeShips;
                break;
            }
            case (4): {
                count = CountFourShips;
                break;
            }
        }
        return count;
    }

    placeShip(posX, posY, dir, length, CountShip) {
        for (let i = 0; i < length; i++) {
            if (dir === 1) {
                this.Board[posY + i][posX] += CountShip
            } else if (dir === 0) {
                this.Board[posY][posX + i] += CountShip
            }
        }
    }

    updateHunt(gameBoard, CountFourShips, CountThreeShips, CountTwoShips) {
        this.resetBoard()
        for (let i = 0; i < 2; i++) {
            for (let j = 2; j < 5; j++) {
                if (this.getShipCountByIndex(j, CountFourShips, CountThreeShips, CountTwoShips) > 0) {
                    for (let k = 0; k < 8; k++) {
                        for (let l = 0; l < 8; l++) {
                            if (this.shipPlaceable(l, k, i, j, gameBoard, CountFourShips, CountThreeShips, CountTwoShips)) {
                                this.placeShip(l, k, i, j, this.getShipCountByIndex(j, CountFourShips, CountThreeShips, CountTwoShips))
                            }
                        }
                    }
                }
            }
        }

        const directions = [
        [-1, 0], // oben
        [1, 0],  // unten
        [0, -1], // links
        [0, 1]   // rechts
        ]

        let posX, posY
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (gameBoard.Board[i][j] === 3) {
                    for (let k = 0; k < directions.length; k++) {
                        posX = i + directions[k][0]
                        posY = j + directions[k][1]
                        if (posX >= 0 && posX < 8 && posY >= 0 && posY < 8) this.Board[posX][posY] = 0
                    }
                }
            }
        }
    }

    updateTarget(gameBoard, PosX, PosY) {
        this.resetBoard()
        let dir = -1;
        let posX, posY;

        const directions = [
        [-1, 0], // oben
        [1, 0],  // unten
        [0, -1], // links
        [0, 1]   // rechts
        ]

        for (let i = 0; i < 4; i++) {
            directions[i][0] = PosY + directions[i][0]
            directions[i][1] = PosX + directions[i][1]
        }

        for (let i = 0; i < 4; i++) {

            if (directions[i][1] < 0 || directions[i][1] > 7 || directions[i][0] < 0 || directions[i][0] > 7) continue;

            if (gameBoard.Board[directions[i][0]][directions[i][1]] === 2) {
                if (i === 0 || i === 1) dir = 1;
                else if (i === 2 || i === 3) dir = 0;
            }
        }

        if (dir === 0) {
            for (let i = 0; i < 4; i++) {
                posX = PosX + i + 1;
                if (posX > 7) continue;
                if (gameBoard.Board[PosY][posX] === 1) break;
                if (gameBoard.Board[PosY][posX] === 0) {
                    this.Board[PosY][posX] = 100
                    break
                }
            }
            for (let i = 0; i < 4; i++) {
                posX = PosX - i - 1;
                if (posX< 0) continue;
                if (gameBoard.Board[PosY][posX] === 1) break;
                if (gameBoard.Board[PosY][posX] === 0) {
                    this.Board[PosY][posX] = 100
                    break;
                }
            }
        }

        if (dir === 1) {
            for (let i = 0; i < 4; i++) {
                posY = PosY + i + 1;
                if (posY > 7) continue;
                if (gameBoard.Board[posY][PosX] === 1) break;
                if (gameBoard.Board[posY][PosX] === 0) {
                    this.Board[posY][PosX] = 100
                    break;
                }
            }
            for (let i = 0; i < 4; i++) {
                posY = PosY - i - 1;
                if (posY < 0) continue;
                if (gameBoard.Board[posY][PosX] === 1) break;
                if (gameBoard.Board[posY][PosX] === 0) {
                    this.Board[posY][PosX] = 100
                    break;
                }
            }
        }

        if (dir === -1) {
            for (let i = 0; i < 4; i++) {
                if (directions[i][1] < 0 || directions[i][1] > 7 || directions[i][0] < 0 || directions[i][0] > 7) continue;
                if (gameBoard.Board[directions[i][0]][directions[i][1]] === 0) this.Board[directions[i][0]][directions[i][1]] = 100
            }
        }
    }
}