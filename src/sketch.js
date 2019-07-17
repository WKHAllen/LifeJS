var game;

const borderColor = [127, 127, 127];
const deadColor   = [255, 255, 255];
const aliveColor  = [  0,   0,   0];

const borderSize = 1;
const cellSize = 16;

const localWidth = "LifeWidth";
const localHeight = "LifeHeight";
const localToroidal = "LifeToroidal";
const localChance = "LifeChance";
const localSpeed = "LifeSpeed";
const localBoard = "LifeBoard";

var toggled = [];

const fps = 60;
var speed = 30;

function newGame(localSave) {
    var boardWidth = parseInt(document.getElementById("width-slider").value);
    var boardHeight = parseInt(document.getElementById("height-slider").value);
    var toroidal = document.getElementById("toroidal-checkbox").checked;
    var initChance = parseInt(document.getElementById("chance-slider").value) / 100;
    var canvasWidth = (borderSize + cellSize) * boardWidth + borderSize;
    var canvasHeight = (borderSize + cellSize) * boardHeight + borderSize;
    var running = game !== undefined ? game.running : false;
    game = new Game(boardWidth, boardHeight, toroidal, initChance);
    game.running = running;
    if (localSave) {
        saveBoard();
        createCanvas(canvasWidth, canvasHeight);
    }
}

function saveBoard() {
    var boardString = JSON.stringify(game.board);
    localStorage.setItem(localBoard, boardString);
}

function loadBoard() {
    var boardString = localStorage.getItem(localBoard);
    var board = JSON.parse(boardString);
    if (board !== null) {
        game.board = board;
        game.width = board.length;
        game.height = board[0].length;
        game.neighbors = init2DArray(game.width, game.height);
        game.calculateNeighbors();
    }
}

function setup() {
    var width = localStorage.getItem(localWidth);
    var height = localStorage.getItem(localHeight);
    var toroidal = JSON.parse(localStorage.getItem(localToroidal));
    var chance = localStorage.getItem(localChance);
    var speed = localStorage.getItem(localSpeed);
    document.getElementById("width-slider").value = width !== null ? width : 40;
    document.getElementById("height-slider").value = height !== null ? height : 30;
    document.getElementById("toroidal-checkbox").checked = toroidal !== null ? toroidal : true;
    document.getElementById("chance-slider").value = chance !== null ? chance : 50;
    document.getElementById("speed-slider").value = speed !== null ? speed : 30;
    updateWidth();
    updateHeight();
    updateToroidal();
    updateChance();
    updateSpeed();
    newGame(false);
    loadBoard();
    saveBoard();
    var canvasWidth = (borderSize + cellSize) * game.width + borderSize;
    var canvasHeight = (borderSize + cellSize) * game.height + borderSize;
    createCanvas(canvasWidth, canvasHeight);
    noStroke();
    frameRate(fps);
}

function drawCell(x, y, fillColor) {
    fill(...fillColor);
    square((borderSize + cellSize) * x + borderSize, (borderSize + cellSize) * y + borderSize, cellSize);
}

function toggleRunning() {
    var startButton = document.getElementById("start-button");
    if (startButton.innerHTML === "Start") {
        game.running = true;
        startButton.innerHTML = "Stop";
    } else if (startButton.innerHTML === "Stop") {
        game.running = false;
        startButton.innerHTML = "Start";
    }
}

function stepFrame() {
    var frame = frameCount % fps;
    if (frame === 0)
        return true;
    var thisFrame = Math.floor(speed / fps * frame);
    var prevFrame = Math.floor(speed / fps * (frame - 1));
    return prevFrame < thisFrame;
}

function draw() {
    if (mouseIsPressed) {
        toggleTile();
    }
    if (game.running && stepFrame()) {
        game.step();
        saveBoard();
    }
    background(...borderColor);
    for (var i = 0; i < game.width; i++)
        for (var j = 0; j < game.height; j++)
            if (game.board[i][j] === 0)
                drawCell(i, j, deadColor);
            else if (game.board[i][j] === 1)
                drawCell(i, j, aliveColor);
}

function inToggled(x, y) {
    for (var tile of toggled)
        if (tile[0] === x && tile[1] === y)
            return true;
    return false;
}

function toggleTile() {
    if (0 <= mouseX && mouseX < width && 0 <= mouseY && mouseY < height) {
        var x = Math.floor((mouseX - borderSize) / (cellSize + borderSize));
        var y = Math.floor((mouseY - borderSize) / (cellSize + borderSize));
        var x1 = (cellSize + borderSize) * x;
        var y1 = (cellSize + borderSize) * y;
        var x2 = x1 + cellSize;
        var y2 = y1 + cellSize;
        if (x1 <= mouseX && mouseX < x2 && y1 <= mouseY && mouseY < y2 && !inToggled(x, y)) {
            game.toggle(x, y);
            toggled.push([x, y]);
        }
    }
}

function mouseReleased() {
    toggled = [];
    saveBoard();
}

function updateWidth() {
    var value = document.getElementById("width-slider").value;
    document.getElementById("width-label").innerHTML = value;
    localStorage.setItem(localWidth, value);
}

function updateHeight() {
    var value = document.getElementById("height-slider").value;
    document.getElementById("height-label").innerHTML = value;
    localStorage.setItem(localHeight, value);
}

function updateChance() {
    var value = document.getElementById("chance-slider").value;
    document.getElementById("chance-label").innerHTML = value + "%";
    localStorage.setItem(localChance, value);
}

function updateToroidal() {
    var value = document.getElementById("toroidal-checkbox").checked;
    localStorage.setItem(localToroidal, value);
}

function updateSpeed() {
    var value = document.getElementById("speed-slider").value;
    document.getElementById("speed-label").innerHTML = value;
    localStorage.setItem(localSpeed, value);
    speed = value;
}
