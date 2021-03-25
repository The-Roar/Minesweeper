'use strict'

const BOOM = '💥';
const FLAG = '🚩';
const MINE = '🕳️';

var gBoard;
var gGame = {
    difficulty: 0,
    isAfterFirst: false,
    isOn: false,
    lives: 3,
    markedCount: 0,
    mineCoords: [],
    noMineCount: 0,
    secsPassed: 0,
    shownCount: 0,
};
var gLevel = {
    mines: 2,
    size: 4
};
var gTimeInterval;
var gTime;

//////////// FUNCTIONS ////////////

function init() {
    clearTimeout(gTimeInterval);
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = '🤨'
    gGame.difficulty = 3;
    gGame.markedCount = 0;
    gGame.shownCount = 0;
    gGame.lives = 3;
    var elLives = document.querySelector('h2 span.lives');
    elLives.innerText = gGame.lives;
    var elTime = document.querySelector('h2 span.time');
    elTime.innerText = 0;
    gTime = 0;
    gGame.mineCoords = [];
    gGame.noMineCount = 0;
    gGame.lives = 3;
    gGame.isAfterFirst = false;
    gGame.isOn = true;
    gBoard = buildBoard();
    renderBoard(gBoard);
};

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                isBoom: false,
                isExpanded: false,
                isMarked: false,
                isMine: false,
                isNotMine: false,
                isShown: false,
                minesAroundCount: 0
            };
        };
    };
    return board;
};

function renderBoard(board) {
    var strHtml = '';
    var id = 1;
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board.length; j++) {
            strHtml += `<td onclick="cellClicked(this)" oncontextmenu="mark(event, this)" data-id="${id}-${i}-${j}"`
            id++;
            if (!board[i][j].isShown) {
                strHtml += (board[i][j].isMarked) ? ` class="hidden">${FLAG}</td>` : ' class="hidden"></td>'
            }
            else {
                if (board[i][j].isBoom && board[i][j].isMarked) strHtml += ` class="boom">${FLAG}</td>`;
                else if (board[i][j].isBoom && !board[i][j].isMarked) strHtml += ` class="boom">${BOOM}</td>`;
                else if (board[i][j].isMine) strHtml += ` class="shown">${MINE}</td>`;
                else if (board[i][j].minesAroundCount > 0) strHtml += ` class="shown">${board[i][j].minesAroundCount}</td>`;
                else strHtml += ` class="shown"></td>`;
            }
        }
        strHtml += '</tr>';
    }
    var elMineField = document.querySelector('.mine-field');
    elMineField.innerHTML = strHtml;
}

function mark(ev, elCell) {
    ev.preventDefault()
    if (!gGame.isOn) return;
    var i = parseInt(elCell.dataset.id.split('-')[1]);
    var j = parseInt(elCell.dataset.id.split('-')[2]);
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = false;
        if (gBoard[i][j].isMine) gGame.markedCount--;
    } else {
        gBoard[i][j].isMarked = true;
        if (gBoard[i][j].isMine) gGame.markedCount++;
    }
    renderBoard(gBoard);
    if (gGame.markedCount >= gLevel.mines && gGame.shownCount >= (gLevel.size ** 2) - gLevel.mines) gameOver(true);
}

function cellClicked(elCell) {
    var i = parseInt(elCell.dataset.id.split('-')[1]);
    var j = parseInt(elCell.dataset.id.split('-')[2]);
    if (!gGame.isOn || gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
    if (!gGame.isAfterFirst) {
        gGame.isAfterFirst = true;
        setNoMineZone(gBoard, i, j);
        setMines(gBoard);
        setMinesAroundCount(gBoard);
        gTimeInterval = setInterval(startTime, 1000)
    }
    if (gBoard[i][j].isMine && !gBoard[i][j].isBoom) {
        gBoard[i][j].isBoom = true;
        gGame.lives--;
        var elLives = document.querySelector('h2 span');
        elLives.innerText = gGame.lives;
        var elSmiley = document.querySelector('.smiley');
        switch (gGame.lives) {
            case 2:
                elSmiley.innerText = '😵'
                break
            case 1:
                elSmiley.innerText = '🤕'
                break
            case 0:
                showMines();
                renderBoard(gBoard);
                gameOver(false);
                return
        }
    } else if (gBoard[i][j].minesAroundCount === 0) gGame.shownCount += expand(gBoard, i, j);
    gBoard[i][j].isShown = true;
    gGame.shownCount++;
    renderBoard(gBoard);
    if (gGame.markedCount >= gLevel.mines && gGame.shownCount >= (gLevel.size ** 2) - gLevel.mines) gameOver(true);
}

function startTime() {
    gTime++;
    var elTime = document.querySelector('h2 span.time');
    elTime.innerText = gTime;
}

function expand(board, coordI, coordJ) {
    var expandCount = 0;
    for (var i = coordI - 1; i <= coordI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = coordJ - 1; j <= coordJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === coordI && j === coordJ) continue;
            if (!board[i][j].isMine && !board[i][j].isShown && !board[i][j].isMarked) {
                board[i][j].isShown = true;
                gGame.shownCount++;
                expandCount++;
            }
            //////////// ↓↓ UNSUCCESSFUL ATTEMPT AT FULL EXPANSION ↓↓ ////////////
            // if (board[i][j].minesAroundCount === 0 && !board[i][j].isExpanded) {
            //     board[i][j].isExpanded = true;
            //     expand(board, i, j);
            //     board[i][j].isExpanded = false;
            // }
            //////////// ↑↑ UNSUCCESSFUL ATTEMPT AT FULL EXPANSION ↑↑ ////////////
        }
    }
    return expandCount;
}

function setNoMineZone(board, coordI, coordJ) {
    for (var i = coordI - 1; i <= coordI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = coordJ - 1; j <= coordJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (!board[i][j].isNotMine) {
                board[i][j].isNotMine = true;
                gGame.noMineCount++;
            }
        }
    }
}

function setMines(board) {
    var randomMines = getRandomMines();
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (!board[i][j].isNotMine) {
                var currMine = randomMines.pop();
                board[i][j].isMine = currMine;
                if (currMine) gGame.mineCoords.push({ i: i, j: j });
            }
        };
    };
};

function getRandomMines() {
    var mines = [];
    var mineCount = 0;
    for (var i = 0; i < (gLevel.size ** 2) - gGame.noMineCount; i++) {
        if (mineCount < gLevel.mines) {
            mineCount++;
            mines.push(true);
        }
        else mines.push(false);
    }
    shuffleArray(mines);
    return mines;
};

function setMinesAroundCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = { i: i, j: j }
            board[i][j].minesAroundCount = countMinesAround(board, currCell);
        }
    }
}

function countMinesAround(board, cell) {
    var count = 0;
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i === cell.i && j === cell.j) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) count++;
        }
    }
    return count;
}

function showMines() {
    for (var i = 0; i < gGame.mineCoords.length; i++) {
        var currMine = gGame.mineCoords[i]
        gBoard[currMine.i][currMine.j].isShown = true;
    }
}

function gameOver(victory) {
    gGame.isOn = false;
    clearTimeout(gTimeInterval);
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = (victory) ? '😎' : '💀'
}

function setDifficulty(diffi) {
    switch (diffi) {
        case 0:
            gGame.difficulty = 0
            gLevel.mines = 2
            gLevel.size = 4
            break
        case 1:
            gGame.difficulty = 1
            gLevel.mines = 12
            gLevel.size = 8
            break
        case 2:
            gGame.difficulty = 2
            gLevel.mines = 30
            gLevel.size = 12
            break
    }
    init()
}