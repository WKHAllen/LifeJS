function init2DArray(width, height) {
    var arr = new Array(width);
    for (var i = 0; i < width; i++)
        arr[i] = new Array(height);
    return arr;
}

function cloneArray(array) {
    return array.map((arr) => {
        return arr.slice();
    });
}

class Game {
    constructor(width, height, toroid, initChance) {
        this.running = false;
        this.width = width;
        this.height = height;
        this.toroid = toroid !== undefined ? toroid : true;
        initChance = initChance !== undefined ? initChance : 0.5;
        this.board = init2DArray(this.width, this.height);
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                this.board[i][j] = Math.random() >= initChance ? 0 : 1;
        this.neighbors = init2DArray(this.width, this.height);
        this.calculateNeighbors();
    }

    numNeighbors(board, x, y) {
        var neighbors = 0;
        for (var i = x - 1; i <= x + 1; i++)
            for (var j = y - 1; j <= y + 1; j++)
                if ((i !== x || j !== y) && ((this.toroid && board[(i + this.width) % this.width][(j + this.height) % this.height] === 1) || (i >= 0 && i < this.width && j >= 0 && j < this.height && board[i][j] === 1)))
                    neighbors++;
        return neighbors;
    }

    calculateNeighbors() {
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                this.neighbors[i][j] = this.numNeighbors(this.board, i, j);
    }

    incNeighbors(x, y) {
        for (var i = x - 1; i <= x + 1; i++)
            for (var j = y - 1; j <= y + 1; j++)
                if (i != x || j != y)
                    if (this.toroid)
                        this.neighbors[(i + this.width) % this.width][(j + this.height) % this.height]++;
                    else if (i >= 0 && i < this.width && j >= 0 && j < this.height)
                        this.neighbors[i][j]++;
    }

    decNeighbors(x, y) {
        for (var i = x - 1; i <= x + 1; i++)
            for (var j = y - 1; j <= y + 1; j++)
                if (i != x || j != y)
                    if (this.toroid)
                        this.neighbors[(i + this.width) % this.width][(j + this.height) % this.height]--;
                    else if (i >= 0 && i < this.width && j >= 0 && j < this.height)
                        this.neighbors[i][j]--;
    }

    step() {
        var oldNeighbors = cloneArray(this.neighbors);
        for (var i = 0; i < this.width; i++)
            for (var j = 0; j < this.height; j++)
                if ((oldNeighbors[i][j] < 2 || oldNeighbors[i][j] > 3) && this.board[i][j] === 1)
                    this.toggle(i, j);
                else if (oldNeighbors[i][j] === 3 && this.board[i][j] === 0)
                    this.toggle(i, j);
    }

    toggle(x, y) {
        if (this.board[x][y] === 0) {
            this.board[x][y] = 1;
            this.incNeighbors(x, y);
        } else if (this.board[x][y] === 1) {
            this.board[x][y] = 0;
            this.decNeighbors(x, y);
        }
    }

    resizeBoard(newWidth, newHeight) {
        var newBoard = init2DArray(newWidth, newHeight);
        for (var i = 0; i < newWidth; i++)
            for (var j = 0; j < newHeight; j++)
                if (i < this.width && j < this.height)
                    newBoard[i][j] = this.board[i][j];
                else
                    newBoard[i][j] = 0;
        this.board = newBoard;
        this.width = newWidth;
        this.height = newHeight;
        this.neighbors = init2DArray(this.width, this.height);
        this.calculateNeighbors();
    }
}
