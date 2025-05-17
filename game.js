// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GAME_SPEED = {
    easy: 150,
    medium: 100,
    hard: 70
};

// 游戏变量
let canvas, ctx;
let snake, food;
let direction, nextDirection;
let score, highScore;
let gameInterval;
let isPaused = false;
let gameOver = false;
let currentSpeed;

// DOM 元素
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const difficultySelect = document.getElementById('difficulty');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');

// 初始化游戏
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 从本地存储获取最高分
    highScore = localStorage.getItem('snakeHighScore') || 0;
    highScoreElement.textContent = highScore;
    
    // 事件监听器
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', startGame);
    difficultySelect.addEventListener('change', updateDifficulty);
    document.addEventListener('keydown', handleKeyPress);
    
    // 移动端触摸控制
    setupTouchControls();
    
    // 绘制初始画面
    drawGrid();
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('按开始游戏按钮开始', canvas.width / 2, canvas.height / 2);
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    isPaused = false;
    pauseBtn.textContent = '暂停';
    gameOverElement.classList.add('hidden');
    
    // 设置游戏速度
    updateDifficulty();
    
    // 清除之前的游戏循环
    if (gameInterval) clearInterval(gameInterval);
    
    // 开始新的游戏循环
    gameInterval = setInterval(gameLoop, currentSpeed);
}

// 游戏主循环
function gameLoop() {
    if (isPaused || gameOver) return;
    
    // 更新蛇的方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        endGame();
        return;
    }
    
    // 检查是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    } else {
        // 如果没吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 绘制游戏
    draw();
}

// 移动蛇
function moveSnake() {
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 添加新的头部
    snake.unshift(head);
}

// 生成食物
function generateFood() {
    // 创建一个可能的食物位置列表
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    const possiblePositions = [];
    
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            // 检查该位置是否被蛇占据
            let isSnake = false;
            for (const segment of snake) {
                if (segment.x === x && segment.y === y) {
                    isSnake = true;
                    break;
                }
            }
            
            if (!isSnake) {
                possiblePositions.push({x, y});
            }
        }
    }
    
    // 随机选择一个位置
    if (possiblePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * possiblePositions.length);
        food = possiblePositions[randomIndex];
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查墙壁碰撞
    const gridWidth = canvas.width / GRID_SIZE;
    const gridHeight = canvas.height / GRID_SIZE;
    
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 吃食物
function eatFood() {
    // 增加分数
    score += 10;
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    
    // 生成新食物
    generateFood();
}

// 结束游戏
function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
    
    // 清除游戏循环
    clearInterval(gameInterval);
}

// 绘制游戏
function draw() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    drawRect(food.x, food.y);
    
    // 绘制蛇
    for (let i = 0; i < snake.length; i++) {
        // 头部使用不同颜色
        if (i === 0) {
            ctx.fillStyle = '#2ecc71';
        } else {
            ctx.fillStyle = '#27ae60';
        }
        drawRect(snake[i].x, snake[i].y);
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制矩形
function drawRect(x, y) {
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 添加边框
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// 处理键盘输入
function handleKeyPress(e) {
    // 防止按键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    // 空格键暂停/继续游戏
    if (e.key === ' ' && !gameOver) {
        togglePause();
        return;
    }
    
    // 如果游戏暂停或结束，不处理方向键
    if (isPaused || gameOver) return;
    
    // 处理方向键
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// 设置触摸控制
function setupTouchControls() {
    let touchStartX, touchStartY;
    
    canvas.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, false);
    
    canvas.addEventListener('touchmove', function(e) {
        if (!touchStartX || !touchStartY || isPaused || gameOver) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        // 确定滑动方向
        if (Math.abs(dx) > Math.abs(dy)) {
            // 水平滑动
            if (dx > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (dx < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (dy > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (dy < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        // 重置触摸起点
        touchStartX = touchEndX;
        touchStartY = touchEndY;
        
        e.preventDefault();
    }, false);
}

// 切换暂停状态
function togglePause() {
    if (gameOver) return;
    
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
    
    if (!isPaused) {
        // 如果从暂停状态恢复，绘制一次游戏状态
        draw();
    }
}

// 更新难度
function updateDifficulty() {
    const difficulty = difficultySelect.value;
    currentSpeed = GAME_SPEED[difficulty];
    
    // 如果游戏正在运行，更新游戏速度
    if (gameInterval && !gameOver) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('load', init);