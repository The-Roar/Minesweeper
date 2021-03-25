'use strict'

const BOOM = '💥';
const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '🕳️';

var gBoard;
var gGame = {
    isAfterFirst: false,
    isOn: false,
    lives: 3,
    markedCount: 0,
    mineCoords: [],
    noMineCount: 0,
    secsPassed: 0,
    shownCount: 0
};
var gLevel = {
    mines: 4,
    size: 4
};

//////////// FUNCTIONS ////////////

function init() {
    gBoard = buildBoard();
    gGame.lives = 3;
    var elLives = document.querySelector('h2 span');
    elLives.innerText = gGame.lives;
    gGame.mineCoords = [];
    gGame.noMineCount = 0;
    // setMines(gBoard);
    // setMinesAroundCount(gBoard);
    renderBoard(gBoard);
    gGame.lives = 3;
    gGame.isOn = true;
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
            strHtml += `<td onclick="cellClicked(this)" data-id="${id}-${i}-${j}"`
            id++;
            if (!board[i][j].isShown) strHtml += ` class="hidden"></td>`;
            else {
                if (board[i][j].isBoom) strHtml += ` class="shown">${BOOM}</td>`;
                else if (board[i][j].isMarked) strHtml += ` class="shown">${FLAG}</td>`;
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

function cellClicked(elCell) {
    var i = parseInt(elCell.dataset.id.split('-')[1]);
    var j = parseInt(elCell.dataset.id.split('-')[2]);
    if (!gGame.isOn || gBoard[i][j].isShown) return;
    if (!gGame.isAfterFirst) {
        gGame.isAfterFirst = true;
        setNoMineZone(gBoard, i, j);
        setMines(gBoard);
        setMinesAroundCount(gBoard);
        showMines()
    }
    if (gBoard[i][j].isMine && !gBoard[i][j].isBoom) {
        gBoard[i][j].isBoom = true;
        gGame.lives--;
        var elLives = document.querySelector('h2 span');
        elLives.innerText = gGame.lives;
        if (gGame.lives <= 0) {
            gGame.isOn = false;
            showMines();
        }
    } else if (gBoard[i][j].minesAroundCount === 0) expand(gBoard, i, j);
    gBoard[i][j].isShown = true;
    renderBoard(gBoard);
}

function expand(board, coordI, coordJ) {
    for (var i = coordI - 1; i <= coordI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = coordJ - 1; j <= coordJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === coordI && j === coordJ) continue;
            if (!board[i][j].isMine) board[i][j].isShown = true;
            //////////// ↓↓ UNSUCCESSFUL ATTEMPT AT FULL EXPANSION ↓↓
            // if (board[i][j].minesAroundCount === 0 && !board[i][j].isExpanded) {
            //     board[i][j].isExpanded = true;
            //     expand(board, i, j);
            //     board[i][j].isExpanded = false;
            // }
            //////////// ↑↑ UNSUCCESSFUL ATTEMPT AT FULL EXPANSION ↑↑
        }
    }
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