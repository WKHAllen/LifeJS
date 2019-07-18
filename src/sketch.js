var game;

var bodyPadding = 8;

const borderColor = [127, 127, 127];
const deadColor   = [255, 255, 255];
const aliveColor  = [  0,   0,   0];

var borderSize = 1;
var cellSize = 16;

const localWidth = "LifeWidth";
const localHeight = "LifeHeight";
const localToroidal = "LifeToroidal";
const localChance = "LifeChance";
const localSpeed = "LifeSpeed";
const localBoard = "LifeBoard";
const localStates = "LifeStates";
const localStateSelected = "LifeStateSelected";
const localCellSize = "LifeCellSize";

var toggled = [];

const fps = 60;
var speed = 30;

function canvasResize(boardWidth, boardHeight) {
    boardWidth = boardWidth !== undefined ? boardWidth : game.width;
    boardHeight = boardHeight !== undefined ? boardHeight : game.height;
    var canvasWidth = (borderSize + cellSize) * boardWidth + borderSize;
    var canvasHeight = (borderSize + cellSize) * boardHeight + borderSize;
    resizeCanvas(canvasWidth, canvasHeight);
}

function newGame(localSave) {
    var boardWidth = parseInt(document.getElementById("width-slider").value);
    var boardHeight = parseInt(document.getElementById("height-slider").value);
    var toroidal = document.getElementById("toroidal-checkbox").checked;
    var initChance = parseInt(document.getElementById("chance-slider").value) / 100;
    var running = game !== undefined ? game.running : false;
    game = new Game(boardWidth, boardHeight, toroidal, initChance);
    game.running = running;
    if (localSave) {
        saveBoard();
        canvasResize(boardWidth, boardHeight);
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

function maxWidth() {
    return Math.floor((windowWidth - 2 * bodyPadding - borderSize) / (cellSize + borderSize));
}

function maxHeight() {
    return Math.floor((windowHeight - 2 * bodyPadding - borderSize) / (cellSize + borderSize));
}

function windowResized() {
    document.getElementById("width-slider").max = maxWidth();
    document.getElementById("height-slider").max = maxHeight();
}

function setup() {
    if (localStorage.getItem(localStates) === null)
        localStorage.setItem(localStates, JSON.stringify(initStates));
    populateStates();
    document.getElementsByTagName("body")[0].padding = bodyPadding;
    windowResized();
    // scale
    var savedCellSize = parseInt(localStorage.getItem(localCellSize));
    document.getElementById("size-slider").value = savedCellSize !== null ? savedCellSize : 16;
    updateCellSize();
    // width
    var boardWidth = localStorage.getItem(localWidth);
    document.getElementById("width-slider").value = boardWidth !== null ? boardWidth : 40;
    updateWidth();
    // height
    var boardHeight = localStorage.getItem(localHeight);
    document.getElementById("height-slider").value = boardHeight !== null ? boardHeight : 30;
    updateHeight();
    // toroidal
    var toroidal = JSON.parse(localStorage.getItem(localToroidal));
    document.getElementById("toroidal-checkbox").checked = toroidal !== null ? toroidal : true;
    updateToroidal();
    // chance
    var chance = localStorage.getItem(localChance);
    document.getElementById("chance-slider").value = chance !== null ? chance : 50;
    updateChance();
    // speed
    var speed = localStorage.getItem(localSpeed);
    document.getElementById("speed-slider").value = speed !== null ? speed : 30;
    updateSpeed();
    // state selected
    var stateSelected = parseInt(localStorage.getItem(localStateSelected));
    document.getElementById("state-select").selectedIndex = stateSelected !== null ? stateSelected : 0;
    newGame(false);
    loadBoard();
    saveBoard();
    canvasResize();
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
    var widthValue = document.getElementById("width-slider").value;
    document.getElementById("width-label").innerHTML = widthValue;
    var heightValue = document.getElementById("height-slider").value;
    document.getElementById("height-label").innerHTML = heightValue;
    var chanceValue = document.getElementById("chance-slider").value;
    document.getElementById("chance-label").innerHTML = chanceValue + "%";
    var speedValue = document.getElementById("speed-slider").value;
    document.getElementById("speed-label").innerHTML = speedValue;
    var sizeValue = document.getElementById("size-slider").value;
    document.getElementById("size-label").innerHTML = sizeValue;
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

function updateWidth(preventBoardResize) {
    var value = document.getElementById("width-slider").value;
    document.getElementById("width-label").innerHTML = value;
    localStorage.setItem(localWidth, value);
    if (game !== undefined && !preventBoardResize) {
        game.resizeBoard(parseInt(value), game.height);
        saveBoard();
        canvasResize();
    }
}

function updateHeight(preventBoardResize) {
    var value = document.getElementById("height-slider").value;
    document.getElementById("height-label").innerHTML = value;
    localStorage.setItem(localHeight, value);
    if (game !== undefined && !preventBoardResize) {
        game.resizeBoard(game.width, parseInt(value));
        saveBoard();
        canvasResize();
    }
}

function updateChance() {
    var value = document.getElementById("chance-slider").value;
    document.getElementById("chance-label").innerHTML = value + "%";
    localStorage.setItem(localChance, value);
}

function updateToroidal() {
    var value = document.getElementById("toroidal-checkbox").checked;
    localStorage.setItem(localToroidal, value);
    if (game !== undefined) {
        game.toroid = value;
        game.calculateNeighbors();
    }
}

function updateSpeed() {
    var value = document.getElementById("speed-slider").value;
    document.getElementById("speed-label").innerHTML = value;
    localStorage.setItem(localSpeed, value);
    speed = parseInt(value);
}

function updateStateSelect() {
    var value = document.getElementById("state-select").selectedIndex;
    localStorage.setItem(localStateSelected, value);
}

function updateCellSize() {
    var value = document.getElementById("size-slider").value;
    document.getElementById("size-label").innerHTML = value;
    localStorage.setItem(localCellSize, value);
    cellSize = parseInt(value);
    if (game !== undefined) {
        canvasResize();
    }
    windowResized();
}

function stripWhitespace(str) {
    return str.replace(/^\s+|\s+$/g, "");
}

function populateStates() {
    var states = JSON.parse(localStorage.getItem(localStates));
    if (states === null) {
        states = {};
        localStorage.setItem(localStates, "{}");
    }
    var stateSelect = document.getElementById("state-select");
    var newState;
    for (let state of Object.keys(states)) {
        newState = document.createElement("option");
        newState.innerHTML = state;
        stateSelect.appendChild(newState);
    }
}

function saveState() {
    var states = JSON.parse(localStorage.getItem(localStates));
    var stateName = stripWhitespace(document.getElementById("state-name").value);
    if (stateName === "") {
        alert("Please choose a state name");
        return;
    }
    var exists = Object.keys(states).includes(stateName);
    states[stateName] = game.board;
    localStorage.setItem(localStates, JSON.stringify(states));
    if (!exists) {
        var stateSelect = document.getElementById("state-select");
        var newState = document.createElement("option");
        newState.innerHTML = stateName;
        stateSelect.appendChild(newState);
    }
}

function loadState() {
    var stateSelect = document.getElementById("state-select");
    if (stateSelect.selectedIndex <= 0) {
        alert("Please select a state");
        return;
    }
    var selected = stateSelect.options[stateSelect.selectedIndex].innerHTML;
    var states = JSON.parse(localStorage.getItem(localStates));
    var board = states[selected];
    game.board = board;
    game.width = board.length;
    game.height = board[0].length;
    game.neighbors = init2DArray(game.width, game.height);
    game.calculateNeighbors();
    document.getElementById("width-slider").value = game.width;
    document.getElementById("height-slider").value = game.height;
    updateWidth();
    updateHeight();
    saveBoard();
    canvasResize();
}

function deleteState() {
    var stateSelect = document.getElementById("state-select");
    if (stateSelect.selectedIndex <= 0) {
        alert("Please select a state");
        return;
    }
    var selected = stateSelect.options[stateSelect.selectedIndex].innerHTML;
    var states = JSON.parse(localStorage.getItem(localStates));
    delete states[selected];
    localStorage.setItem(localStates, JSON.stringify(states));
    stateSelect.removeChild(stateSelect.options[stateSelect.selectedIndex]);
}
