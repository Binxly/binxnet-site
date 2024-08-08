const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 20;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece;
let score = 0;
let gameStarted = false;

const SHAPES = [
    [[1,1,1,1]],
    [[1,1],[1,1]],
    [[1,1,1],[0,1,0]],
    [[1,1,1],[1,0,0]],
    [[1,1,1],[0,0,1]],
    [[1,1,0],[0,1,1]],
    [[0,1,1],[1,1,0]]
];

const COLORS = ['#7c3f58', '#eb6b6f', '#f9a875', '#fff6d3', '#7c3f58', '#eb6b6f', '#f9a875'];
// #799496 #DDDBF1
function newPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    return {
        shape: shape,
        color: COLORS[shapeIndex],
        x: Math.floor((COLS - shape[0].length) / 2),
        y: 0
    };
}

function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#272744';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece() {
    ctx.fillStyle = currentPiece.color;
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                ctx.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#272744';
                ctx.strokeRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function collision() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;
                if (newX < 0 || newX >= COLS || newY >= ROWS || (board[newY] && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[y + currentPiece.y][x + currentPiece.x] = currentPiece.color;
            }
        }
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, index) =>
        currentPiece.shape.map(row => row[index]).reverse()
    );
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    if (collision()) {
        currentPiece.shape = previousShape;
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
    }
}

ctx.fillStyle = '#7c3f58';
ctx.fillRect(0, 0, canvas.width, canvas.height);

function gameLoop() {
    if (!gameStarted) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        clearLines();
        currentPiece = newPiece();
        if (collision()) {
            gameStarted = false;
            ctx.fillStyle = '#272744';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fbf5ef';
            ctx.font = '20px VT323';
            ctx.fillText('Game Over', 50, 100);
            ctx.fillText(`Score: ${score}`, 60, 130);
            return;
        }
    }
    
    drawBoard();
    drawPiece();
    
    ctx.fillStyle = '#fff6d3';
    ctx.font = '16px VT323';
    ctx.fillText(`Score: ${score}`, 5, 20);
    
    setTimeout(gameLoop, 500);
}

function handleKeyDown(e) {
    if (!gameStarted) return;

    switch(e.key) {
        case 'ArrowLeft':
            currentPiece.x--;
            if (collision()) currentPiece.x++;
            break;
        case 'ArrowRight':
            currentPiece.x++;
            if (collision()) currentPiece.x--;
            break;
        case 'ArrowDown':
            currentPiece.y++;
            if (collision()) currentPiece.y--;
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
    e.preventDefault();
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        currentPiece = newPiece();
        score = 0;
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        gameLoop();
    }
}

canvas.addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyDown);

ctx.fillStyle = '#272744';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#fbf5ef';
ctx.font = '20px VT323';
ctx.fillText('Click to Start', 40, 100);