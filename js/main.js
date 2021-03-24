'use strict'

const BOOM = '💥';
const EMPTY = ' ';
const FLAG = '🚩';
const MINE = '🕳️';

var gBoard;
// ↳ {minesAroundCount: ,
// ↳ isShown: ,
// ↳ isMine: ,
// ↳ isMarked: }
var gLevel = {
    size: 4,
    mines: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    makredCount: 0,
    secsPassed: 0
};

function init() {
    gBoard = buildboard();
    // renderBoard(gBoard);
};

function buildboard() {

}