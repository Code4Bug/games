// 游戏配置
const BOARD_SIZE = 19; // 19路棋盘
const CELL_SIZE = 30;
const STONE_RADIUS = 13;
const BOARD_PADDING = 20;

// 游戏状态
let currentPlayer = 'black'; // 'black' 或 'white'
let board = []; // 棋盘状态
let history = []; // 历史记录用于悔棋
let blackCaptures = 0; // 黑方提子数
let whiteCaptures = 0; // 白方提子数
let passCount = 0; // 连续虚手次数
let lastBoardState = null; // 上一步棋盘状态，用于打劫判断
let aiEnabled = false; // AI是否启用
let aiColor = 'white'; // AI执子颜色
let isAiThinking = false; // AI是否正在思考
let aiVsAiMode = false; // AI对战AI模式
let aiVsAiRunning = false; // AI对战是否正在运行
let moveDelay = 800; // AI落子延迟（毫秒）
let speedSetting = 3; // 速度设置 1-5

// 获取DOM元素
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const currentPlayerSpan = document.getElementById('current-player');
const blackCapturesSpan = document.getElementById('black-captures');
const whiteCapturesSpan = document.getElementById('white-captures');
const blackStonesSpan = document.getElementById('black-stones');
const whiteStonesSpan = document.getElementById('white-stones');
const passBtn = document.getElementById('pass-btn');
const restartBtn = document.getElementById('restart-btn');
const undoBtn = document.getElementById('undo-btn');
const aiToggleBtn = document.getElementById('ai-toggle-btn');
const aiVsAiBtn = document.getElementById('ai-vs-ai-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModalBtn = document.getElementById('close-modal');
const speedSlider = document.getElementById('speed-slider');
const speedLabel = document.getElementById('speed-label');

// 初始化游戏
function init() {
    // 初始化棋盘
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    history = [];
    currentPlayer = 'black';
    blackCaptures = 0;
    whiteCaptures = 0;
    passCount = 0;
    lastBoardState = null;
    isAiThinking = false;
    aiVsAiRunning = false;
    
    updateUI();
    drawBoard();
    
    // 如果是AI对战模式，自动开始
    if (aiVsAiMode) {
        setTimeout(() => {
            aiVsAiRunning = true;
            aiMove();
        }, 1000);
    }
}

// 绘制棋盘
function drawBoard() {
    // 清空画布
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(BOARD_PADDING + i * CELL_SIZE, BOARD_PADDING);
        ctx.lineTo(BOARD_PADDING + i * CELL_SIZE, BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(BOARD_PADDING, BOARD_PADDING + i * CELL_SIZE);
        ctx.lineTo(BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE, BOARD_PADDING + i * CELL_SIZE);
        ctx.stroke();
    }
    
    // 绘制星位
    const starPoints = [
        [3, 3], [3, 9], [3, 15],
        [9, 3], [9, 9], [9, 15],
        [15, 3], [15, 9], [15, 15]
    ];
    
    ctx.fillStyle = '#000';
    starPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(BOARD_PADDING + x * CELL_SIZE, BOARD_PADDING + y * CELL_SIZE, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制棋子
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j]) {
                drawStone(i, j, board[i][j]);
            }
        }
    }
}

// 绘制棋子
function drawStone(x, y, color) {
    const centerX = BOARD_PADDING + x * CELL_SIZE;
    const centerY = BOARD_PADDING + y * CELL_SIZE;
    
    // 绘制棋子主体
    ctx.beginPath();
    ctx.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
    
    if (color === 'black') {
        ctx.fillStyle = '#000';
        ctx.fill();
        // 添加高光效果
        const gradient = ctx.createRadialGradient(centerX - 4, centerY - 4, 2, centerX, centerY, STONE_RADIUS);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    } else {
        // 白棋底色
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        // 白棋边框
        ctx.strokeStyle = '#d0d0d0';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // 白棋高光效果（左上）
        const highlightGradient = ctx.createRadialGradient(
            centerX - 4, centerY - 4, 1,
            centerX - 2, centerY - 2, STONE_RADIUS * 0.7
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // 白棋阴影效果（右下）
        const shadowGradient = ctx.createRadialGradient(
            centerX + 3, centerY + 3, 1,
            centerX + 2, centerY + 2, STONE_RADIUS * 0.8
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // 白棋中心微妙的渐变
        const centerGradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, STONE_RADIUS
        );
        centerGradient.addColorStop(0, 'rgba(250, 250, 250, 0.3)');
        centerGradient.addColorStop(0.6, 'rgba(245, 245, 245, 0.1)');
        centerGradient.addColorStop(1, 'rgba(240, 240, 240, 0)');
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // 白棋外围轻微阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        
        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}

// 处理点击事件
canvas.addEventListener('click', (e) => {
    // 如果是AI对战模式，不响应点击
    if (aiVsAiMode) {
        return;
    }
    
    // 如果AI正在思考或轮到AI下棋，不响应点击
    if (isAiThinking || (aiEnabled && currentPlayer === aiColor)) {
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // 计算最近的交叉点
    const x = Math.round((clickX - BOARD_PADDING) / CELL_SIZE);
    const y = Math.round((clickY - BOARD_PADDING) / CELL_SIZE);
    
    // 检查是否在棋盘范围内
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        placeStone(x, y);
    }
});

// 放置棋子
function placeStone(x, y) {
    // 检查位置是否已有棋子
    if (board[x][y]) {
        return;
    }
    
    // 保存当前状态用于悔棋
    saveState();
    
    // 临时放置棋子
    board[x][y] = currentPlayer;
    
    // 检查并提掉对方的棋子
    const opponent = currentPlayer === 'black' ? 'white' : 'black';
    let capturedStones = 0;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    
    directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (isValid(nx, ny) && board[nx][ny] === opponent) {
            if (!hasLiberty(nx, ny)) {
                capturedStones += removeGroup(nx, ny);
            }
        }
    });
    
    // 检查自杀规则
    if (!hasLiberty(x, y)) {
        // 如果没有提掉对方棋子，则是自杀，不允许
        if (capturedStones === 0) {
            board[x][y] = null;
            history.pop();
            alert('不能自杀！');
            return;
        }
    }
    
    // 检查打劫规则
    const currentBoardState = getBoardState();
    if (lastBoardState && currentBoardState === lastBoardState) {
        board[x][y] = null;
        history.pop();
        // 恢复被提掉的棋子
        if (capturedStones > 0) {
            restoreLastState();
        }
        alert('禁止全局同形（打劫）！');
        return;
    }
    
    // 更新提子数
    if (currentPlayer === 'black') {
        blackCaptures += capturedStones;
    } else {
        whiteCaptures += capturedStones;
    }
    
    // 保存棋盘状态用于打劫判断
    lastBoardState = getBoardState();
    
    // 切换玩家
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    passCount = 0;
    
    updateUI();
    drawBoard();
    
    // 如果启用AI且轮到AI下棋
    if (aiEnabled && currentPlayer === aiColor && !aiVsAiMode) {
        setTimeout(aiMove, Math.max(moveDelay, 500));
    }
    
    // 如果是AI对战模式，继续下棋
    if (aiVsAiMode && aiVsAiRunning) {
        setTimeout(aiMove, moveDelay);
    }
}

// 检查坐标是否有效
function isValid(x, y) {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

// 检查棋子组是否有气
function hasLiberty(x, y) {
    const color = board[x][y];
    const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    
    function dfs(cx, cy) {
        if (!isValid(cx, cy) || visited[cx][cy]) {
            return false;
        }
        
        if (board[cx][cy] === null) {
            return true;
        }
        
        if (board[cx][cy] !== color) {
            return false;
        }
        
        visited[cx][cy] = true;
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of directions) {
            if (dfs(cx + dx, cy + dy)) {
                return true;
            }
        }
        
        return false;
    }
    
    return dfs(x, y);
}

// 移除无气的棋子组
function removeGroup(x, y) {
    const color = board[x][y];
    let count = 0;
    
    function dfs(cx, cy) {
        if (!isValid(cx, cy) || board[cx][cy] !== color) {
            return;
        }
        
        board[cx][cy] = null;
        count++;
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        directions.forEach(([dx, dy]) => {
            dfs(cx + dx, cy + dy);
        });
    }
    
    dfs(x, y);
    return count;
}

// 获取棋盘状态字符串
function getBoardState() {
    return board.map(row => row.map(cell => cell || '-').join('')).join('|');
}

// 保存状态
function saveState() {
    history.push({
        board: board.map(row => [...row]),
        currentPlayer,
        blackCaptures,
        whiteCaptures,
        lastBoardState
    });
}

// 恢复上一步状态
function restoreLastState() {
    if (history.length === 0) return;
    
    const state = history.pop();
    board = state.board;
    currentPlayer = state.currentPlayer;
    blackCaptures = state.blackCaptures;
    whiteCaptures = state.whiteCaptures;
    lastBoardState = state.lastBoardState;
    
    updateUI();
    drawBoard();
}

// 虚手
function pass() {
    if (isAiThinking || (aiEnabled && currentPlayer === aiColor && !aiVsAiMode)) {
        return;
    }
    
    passCount++;
    
    if (passCount >= 2) {
        aiVsAiRunning = false;
        alert('双方连续虚手，游戏结束！');
        updateUI();
        return;
    }
    
    saveState();
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    updateUI();
    
    // 如果启用AI且轮到AI下棋
    if (aiEnabled && currentPlayer === aiColor && !aiVsAiMode) {
        setTimeout(aiMove, Math.max(moveDelay, 500));
    }
    
    // 如果是AI对战模式，继续下棋
    if (aiVsAiMode && aiVsAiRunning) {
        setTimeout(aiMove, moveDelay);
    }
}

// AI下棋
function aiMove() {
    if (!aiVsAiRunning && aiVsAiMode) {
        return; // AI对战已停止
    }
    
    isAiThinking = true;
    updateUI();
    
    // 保存当前AI颜色
    const currentAiColor = currentPlayer;
    aiColor = currentAiColor;
    
    const move = findBestMove();
    
    if (move) {
        placeStone(move.x, move.y);
    } else {
        // 没有合适的位置，虚手
        pass();
    }
    
    isAiThinking = false;
}

// 寻找最佳落子位置
function findBestMove() {
    const moves = [];
    
    // 评估所有可能的落子位置
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            if (board[x][y] === null) {
                const score = evaluateMove(x, y);
                if (score > -5000) { // 排除非法落子（自杀和打劫）
                    moves.push({ x, y, score });
                }
            }
        }
    }
    
    if (moves.length === 0) {
        return null;
    }
    
    // 按分数排序
    moves.sort((a, b) => b.score - a.score);
    
    // 在前10%的位置中随机选择，增加变化性
    const topMoves = moves.slice(0, Math.max(1, Math.floor(moves.length * 0.1)));
    return topMoves[Math.floor(Math.random() * topMoves.length)];
}

// 评估落子位置
function evaluateMove(x, y) {
    // 临时放置棋子
    board[x][y] = aiColor;
    
    let score = 0;
    const opponent = aiColor === 'black' ? 'white' : 'black';
    
    // 检查是否能提掉对方棋子
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    let canCapture = 0;
    const capturedGroups = [];
    
    directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (isValid(nx, ny) && board[nx][ny] === opponent) {
            if (!hasLiberty(nx, ny)) {
                const groupSize = countGroupSize(nx, ny);
                canCapture += groupSize;
                capturedGroups.push({ x: nx, y: ny, size: groupSize });
            }
        }
    });
    
    // 检查自杀规则：如果落子后自己无气，且没有提掉对方棋子，则是自杀
    if (!hasLiberty(x, y)) {
        if (canCapture === 0) {
            // 自杀，非法落子
            board[x][y] = null;
            return -10000;
        }
    }
    
    // 检查打劫规则
    if (canCapture > 0) {
        // 模拟提子后的棋盘状态
        const tempBoard = board.map(row => [...row]);
        capturedGroups.forEach(group => {
            removeGroupTemp(group.x, group.y, tempBoard);
        });
        
        const newBoardState = getBoardStateFromArray(tempBoard);
        if (lastBoardState && newBoardState === lastBoardState) {
            // 打劫，非法落子
            board[x][y] = null;
            return -10000;
        }
    }
    
    // 提子得分
    score += canCapture * 30;
    
    // 气的数量
    const liberties = countLiberties(x, y);
    score += liberties * 5;
    
    // 连接己方棋子
    let connections = 0;
    directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (isValid(nx, ny) && board[nx][ny] === aiColor) {
            connections++;
        }
    });
    score += connections * 10;
    
    // 威胁对方棋子
    let threats = 0;
    directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (isValid(nx, ny) && board[nx][ny] === opponent) {
            const oppLiberties = countLiberties(nx, ny);
            if (oppLiberties <= 2) {
                threats += (3 - oppLiberties) * 15;
            }
        }
    });
    score += threats;
    
    // 位置价值（角、边、中心）
    const distFromCenter = Math.abs(x - BOARD_SIZE / 2) + Math.abs(y - BOARD_SIZE / 2);
    const isCorner = (x <= 3 || x >= BOARD_SIZE - 4) && (y <= 3 || y >= BOARD_SIZE - 4);
    const isEdge = x === 0 || x === BOARD_SIZE - 1 || y === 0 || y === BOARD_SIZE - 1;
    
    if (isCorner) score += 15;
    else if (isEdge) score += 5;
    else score += Math.max(0, 10 - distFromCenter);
    
    // 星位加分
    const starPoints = [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]];
    if (starPoints.some(([sx, sy]) => sx === x && sy === y)) {
        score += 20;
    }
    
    // 添加随机性
    score += Math.random() * 5;
    
    board[x][y] = null;
    return score;
}

// 临时移除棋子组（用于模拟）
function removeGroupTemp(x, y, tempBoard) {
    const color = tempBoard[x][y];
    if (!color) return; // 如果位置为空，直接返回
    
    const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    
    function dfs(cx, cy) {
        if (!isValid(cx, cy) || visited[cx][cy] || tempBoard[cx][cy] !== color) {
            return;
        }
        
        visited[cx][cy] = true;
        tempBoard[cx][cy] = null;
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        directions.forEach(([dx, dy]) => {
            dfs(cx + dx, cy + dy);
        });
    }
    
    dfs(x, y);
}

// 从数组获取棋盘状态字符串
function getBoardStateFromArray(boardArray) {
    return boardArray.map(row => row.map(cell => cell || '-').join('')).join('|');
}

// 计算棋子组的大小
function countGroupSize(x, y) {
    const color = board[x][y];
    const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    let count = 0;
    
    function dfs(cx, cy) {
        if (!isValid(cx, cy) || visited[cx][cy] || board[cx][cy] !== color) {
            return;
        }
        visited[cx][cy] = true;
        count++;
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        directions.forEach(([dx, dy]) => dfs(cx + dx, cy + dy));
    }
    
    dfs(x, y);
    return count;
}

// 计算气的数量
function countLiberties(x, y) {
    const color = board[x][y];
    const visited = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false));
    const libertySet = new Set();
    
    function dfs(cx, cy) {
        if (!isValid(cx, cy) || visited[cx][cy]) {
            return;
        }
        
        if (board[cx][cy] === null) {
            libertySet.add(`${cx},${cy}`);
            return;
        }
        
        if (board[cx][cy] !== color) {
            return;
        }
        
        visited[cx][cy] = true;
        
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        directions.forEach(([dx, dy]) => dfs(cx + dx, cy + dy));
    }
    
    dfs(x, y);
    return libertySet.size;
}

// 切换AI
function toggleAI() {
    if (aiVsAiMode) {
        return; // AI对战模式下不能切换单AI
    }
    
    aiEnabled = !aiEnabled;
    aiToggleBtn.textContent = aiEnabled ? 'AI: 开启' : 'AI: 关闭';
    aiToggleBtn.classList.toggle('active', aiEnabled);
    
    if (aiEnabled && currentPlayer === aiColor && !isAiThinking) {
        setTimeout(aiMove, Math.max(moveDelay, 500));
    }
}

// 切换AI对战模式
function toggleAiVsAi() {
    aiVsAiMode = !aiVsAiMode;
    
    if (aiVsAiMode) {
        // 进入AI对战模式
        aiEnabled = false;
        aiVsAiBtn.textContent = '⏸ 暂停对战';
        aiVsAiBtn.classList.add('active');
        aiToggleBtn.disabled = true;
        aiToggleBtn.style.opacity = '0.5';
        
        // 重新开始游戏
        init();
    } else {
        // 退出AI对战模式
        aiVsAiRunning = false;
        aiVsAiBtn.textContent = '🤖 AI对战';
        aiVsAiBtn.classList.remove('active');
        aiToggleBtn.disabled = false;
        aiToggleBtn.style.opacity = '1';
        updateUI();
    }
}

// 暂停/继续AI对战
function toggleAiVsAiPause() {
    if (!aiVsAiMode) {
        toggleAiVsAi();
        return;
    }
    
    aiVsAiRunning = !aiVsAiRunning;
    aiVsAiBtn.textContent = aiVsAiRunning ? '⏸ 暂停对战' : '▶ 继续对战';
    
    if (aiVsAiRunning && !isAiThinking) {
        setTimeout(aiMove, moveDelay);
    }
    
    updateUI();
}

// 计算棋盘上的棋子数量
function countStones() {
    let blackCount = 0;
    let whiteCount = 0;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 'black') {
                blackCount++;
            } else if (board[i][j] === 'white') {
                whiteCount++;
            }
        }
    }
    
    return { black: blackCount, white: whiteCount };
}

// 更新UI
function updateUI() {
    let statusText;
    if (aiVsAiMode) {
        if (isAiThinking) {
            statusText = `AI思考中 (${currentPlayer === 'black' ? '黑方' : '白方'})`;
        } else if (!aiVsAiRunning) {
            statusText = 'AI对战已暂停';
        } else {
            statusText = `AI对战中 (${currentPlayer === 'black' ? '黑方' : '白方'})`;
        }
    } else {
        statusText = isAiThinking ? 'AI思考中...' : (currentPlayer === 'black' ? '黑方' : '白方');
    }
    
    currentPlayerSpan.textContent = statusText;
    currentPlayerSpan.style.color = currentPlayer === 'black' ? '#000' : '#666';
    
    // 更新提子数
    blackCapturesSpan.textContent = blackCaptures;
    whiteCapturesSpan.textContent = whiteCaptures;
    
    // 更新棋子数
    const stoneCount = countStones();
    blackStonesSpan.textContent = stoneCount.black;
    whiteStonesSpan.textContent = stoneCount.white;
    
    // 更新按钮状态
    const isPlayerTurn = !aiEnabled || currentPlayer !== aiColor;
    passBtn.disabled = isAiThinking || !isPlayerTurn || aiVsAiMode;
    undoBtn.disabled = isAiThinking || history.length === 0 || aiVsAiMode;
    
    // 更新AI按钮状态
    if (aiVsAiMode) {
        aiToggleBtn.textContent = 'AI: 关闭';
        aiToggleBtn.classList.remove('active');
    }
}

// 更新AI速度
function updateAiSpeed(speed) {
    speedSetting = parseInt(speed);
    
    // 速度映射：1=很慢(2000ms), 2=慢(1200ms), 3=正常(800ms), 4=快(400ms), 5=很快(100ms)
    const speedMap = {
        1: { delay: 2000, label: '很慢' },
        2: { delay: 1200, label: '慢' },
        3: { delay: 800, label: '正常' },
        4: { delay: 400, label: '快' },
        5: { delay: 100, label: '很快' }
    };
    
    const setting = speedMap[speedSetting];
    moveDelay = setting.delay;
    speedLabel.textContent = setting.label;
}

// 事件监听
passBtn.addEventListener('click', pass);
restartBtn.addEventListener('click', () => {
    if (confirm('确定要重新开始吗？')) {
        if (aiVsAiMode) {
            aiVsAiRunning = false;
        }
        init();
    }
});
undoBtn.addEventListener('click', restoreLastState);
aiToggleBtn.addEventListener('click', toggleAI);
aiVsAiBtn.addEventListener('click', toggleAiVsAiPause);
speedSlider.addEventListener('input', (e) => {
    updateAiSpeed(e.target.value);
});
helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'flex';
});
closeModalBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
});
helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.style.display = 'none';
    }
});

// 启动游戏
init();
