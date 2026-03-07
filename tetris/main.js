// 粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 2;
        this.gravity = 0.3;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 6 + 3;
        this.color = color;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // 绘制碎片
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size / 2, this.size / 2);
        
        ctx.restore();
    }
}

// 方块形状定义 - 简易模式
const SHAPES_BASIC = {
    I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    O: [[1,1], [1,1]],
    T: [[0,1,0], [1,1,1], [0,0,0]],
    S: [[0,1,1], [1,1,0], [0,0,0]],
    Z: [[1,1,0], [0,1,1], [0,0,0]],
    J: [[1,0,0], [1,1,1], [0,0,0]],
    L: [[0,0,1], [1,1,1], [0,0,0]]
};

// 方块形状定义 - 高阶模式（包含基础 + 额外形状）
const SHAPES_ADVANCED = {
    ...SHAPES_BASIC,
    // 小L形
    L2: [[1,0], [1,1]],
    // 小反L形
    J2: [[0,1], [1,1]],
    // 十字形
    PLUS: [[0,1,0], [1,1,1], [0,1,0]],
    // 单格
    DOT: [[1]],
    // 三格直线
    I3: [[0,0,0], [1,1,1], [0,0,0]],
    // 五格直线
    I5: [[0,0,0,0,0,0], [1,1,1,1,1,1], [0,0,0,0,0,0], [0,0,0,0,0,0], [0,0,0,0,0,0], [0,0,0,0,0,0]]
};

// 当前使用的形状集合
let SHAPES = SHAPES_BASIC;

// 方块颜色
const COLORS = {
    I: ['#00d4ff', '#0099cc'],
    O: ['#ffd700', '#ffaa00'],
    T: ['#a855f7', '#7c3aed'],
    S: ['#22c55e', '#16a34a'],
    Z: ['#ef4444', '#dc2626'],
    J: ['#3b82f6', '#2563eb'],
    L: ['#f97316', '#ea580c'],
    // 高阶模式额外颜色
    L2: ['#ec4899', '#db2777'],
    J2: ['#06b6d4', '#0891b2'],
    PLUS: ['#8b5cf6', '#7c3aed'],
    DOT: ['#ffffff', '#cccccc'],
    I3: ['#10b981', '#059669'],
    I5: ['#f59e0b', '#d97706']
};

// 游戏配置
const CONFIG = {
    COLS: 10,
    ROWS: 20,
    BLOCK_SIZE: 30,
    SPEEDS: {
        easy: 1000,
        normal: 800,
        hard: 600
    }
};

// 动态更新画布尺寸
function updateCanvasSize() {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = CONFIG.COLS * CONFIG.BLOCK_SIZE;
    canvas.height = CONFIG.ROWS * CONFIG.BLOCK_SIZE;
}

// 方块类
class Tetromino {
    constructor(type) {
        this.type = type;
        this.shape = SHAPES[type];
        this.color = COLORS[type];
        this.x = Math.floor(CONFIG.COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
        this.rotation = 0;
    }

    // 获取当前旋转状态的形状
    getShape() {
        const shape = this.shape;
        const size = shape.length;
        let rotated = shape;

        for (let i = 0; i < this.rotation; i++) {
            const newShape = [];
            for (let y = 0; y < size; y++) {
                newShape[y] = [];
                for (let x = 0; x < size; x++) {
                    newShape[y][x] = rotated[size - 1 - x][y];
                }
            }
            rotated = newShape;
        }
        return rotated;
    }

    // 旋转
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    // 撤销旋转
    unrotate() {
        this.rotation = (this.rotation + 3) % 4;
    }
}

// 游戏棋盘类
class Board {
    constructor() {
        this.grid = Array(CONFIG.ROWS).fill(null).map(() => Array(CONFIG.COLS).fill(0));
    }

    // 检查碰撞
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        const shape = piece.getShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    if (newX < 0 || newX >= CONFIG.COLS || newY >= CONFIG.ROWS) {
                        return true;
                    }
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // 固定方块到棋盘
    merge(piece) {
        const shape = piece.getShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = piece.y + y;
                    const boardX = piece.x + x;
                    if (boardY >= 0) {
                        this.grid[boardY][boardX] = piece.type;
                    }
                }
            }
        }
    }

    // 检查并清除满行
    clearLines() {
        const linesToClear = [];
        for (let y = CONFIG.ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            return { lines: linesToClear, count: linesToClear.length };
        }
        
        return { lines: [], count: 0 };
    }
    
    // 实际移除行
    removeLines(lines) {
        // 从大到小排序，从下往上删除，避免索引变化问题
        lines.sort((a, b) => b - a);
        
        // 删除每一行
        for (const lineIndex of lines) {
            this.grid.splice(lineIndex, 1);
        }
        
        // 在顶部添加相同数量的空行
        for (let i = 0; i < lines.length; i++) {
            this.grid.unshift(Array(CONFIG.COLS).fill(0));
        }
    }

    // 重置棋盘
    reset() {
        this.grid = Array(CONFIG.ROWS).fill(null).map(() => Array(CONFIG.COLS).fill(0));
    }
}

// 渲染器类
class Renderer {
    constructor(canvas, nextCanvas, holdCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        this.holdCanvas = holdCanvas;
        this.holdCtx = holdCanvas.getContext('2d');
        this.particles = [];
    }
    
    // 创建碎裂粒子
    createShatterEffect(row, board) {
        for (let x = 0; x < CONFIG.COLS; x++) {
            if (board.grid[row][x]) {
                const blockType = board.grid[row][x];
                const colors = COLORS[blockType];
                const centerX = x * CONFIG.BLOCK_SIZE + CONFIG.BLOCK_SIZE / 2;
                const centerY = row * CONFIG.BLOCK_SIZE + CONFIG.BLOCK_SIZE / 2;
                
                // 每个方块生成多个粒子
                for (let i = 0; i < 8; i++) {
                    this.particles.push(new Particle(centerX, centerY, colors[0]));
                }
            }
        }
    }
    
    // 更新和绘制粒子
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            const alive = particle.update();
            if (alive) {
                particle.draw(this.ctx);
            }
            return alive;
        });
    }
    
    // 检查是否有粒子动画
    hasParticles() {
        return this.particles.length > 0;
    }

    // 绘制方块
    drawBlock(ctx, x, y, type, size = CONFIG.BLOCK_SIZE) {
        const colors = COLORS[type];
        
        // 主体渐变（从左上到右下）
        const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        // 绘制主体
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
        
        // 顶部高光
        const highlightGradient = ctx.createLinearGradient(x, y, x, y + size * 0.3);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        ctx.fillRect(x + 1, y + 1, size - 2, size * 0.3);
        
        // 左侧高光
        const leftHighlight = ctx.createLinearGradient(x, y, x + size * 0.3, y);
        leftHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        leftHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = leftHighlight;
        ctx.fillRect(x + 1, y + 1, size * 0.3, size - 2);
        
        // 底部阴影
        const shadowGradient = ctx.createLinearGradient(x, y + size * 0.7, x, y + size);
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = shadowGradient;
        ctx.fillRect(x + 1, y + size * 0.7, size - 2, size * 0.3 - 1);
        
        // 右侧阴影
        const rightShadow = ctx.createLinearGradient(x + size * 0.7, y, x + size, y);
        rightShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        rightShadow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = rightShadow;
        ctx.fillRect(x + size * 0.7, y + 1, size * 0.3 - 1, size - 2);
        
        // 外边框（亮边）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1.5, y + 1.5, size - 3, size - 3);
        
        // 内边框（暗边）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2.5, y + 2.5, size - 5, size - 5);
    }

    // 绘制棋盘
    drawBoard(board) {
        this.ctx.fillStyle = '#0f0f1e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        for (let y = 0; y < CONFIG.ROWS; y++) {
            for (let x = 0; x < CONFIG.COLS; x++) {
                this.ctx.strokeRect(x * CONFIG.BLOCK_SIZE, y * CONFIG.BLOCK_SIZE, 
                                   CONFIG.BLOCK_SIZE, CONFIG.BLOCK_SIZE);
            }
        }

        // 绘制已固定的方块
        for (let y = 0; y < CONFIG.ROWS; y++) {
            for (let x = 0; x < CONFIG.COLS; x++) {
                if (board.grid[y][x]) {
                    this.drawBlock(this.ctx, x * CONFIG.BLOCK_SIZE, y * CONFIG.BLOCK_SIZE, 
                                 board.grid[y][x]);
                }
            }
        }
    }

    // 绘制当前方块
    drawPiece(piece) {
        const shape = piece.getShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    this.drawBlock(this.ctx, 
                                 (piece.x + x) * CONFIG.BLOCK_SIZE,
                                 (piece.y + y) * CONFIG.BLOCK_SIZE,
                                 piece.type);
                }
            }
        }
    }
    
    // 绘制纵向辅助光条
    drawGhostGuide(piece, board) {
        const shape = piece.getShape();
        const colors = COLORS[piece.type];
        const baseColor = colors[0]; // 使用方块的主色调
        
        // 将十六进制颜色转换为 RGB
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        const rgb = hexToRgb(baseColor);
        if (!rgb) return;
        
        // 为每个方块列绘制纵向光条
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const blockX = piece.x + x;
                    const blockY = piece.y + y;
                    
                    // 绘制从顶部到方块的渐隐光条
                    const gradient = this.ctx.createLinearGradient(
                        blockX * CONFIG.BLOCK_SIZE, 
                        0,
                        blockX * CONFIG.BLOCK_SIZE, 
                        blockY * CONFIG.BLOCK_SIZE
                    );
                    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                    gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
                    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(
                        blockX * CONFIG.BLOCK_SIZE + 1,
                        0,
                        CONFIG.BLOCK_SIZE - 2,
                        blockY * CONFIG.BLOCK_SIZE
                    );
                    
                    // 绘制从方块到底部的渐隐光条
                    const bottomGradient = this.ctx.createLinearGradient(
                        blockX * CONFIG.BLOCK_SIZE,
                        (blockY + 1) * CONFIG.BLOCK_SIZE,
                        blockX * CONFIG.BLOCK_SIZE,
                        this.canvas.height
                    );
                    bottomGradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
                    bottomGradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`);
                    bottomGradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
                    
                    this.ctx.fillStyle = bottomGradient;
                    this.ctx.fillRect(
                        blockX * CONFIG.BLOCK_SIZE + 1,
                        (blockY + 1) * CONFIG.BLOCK_SIZE,
                        CONFIG.BLOCK_SIZE - 2,
                        this.canvas.height - (blockY + 1) * CONFIG.BLOCK_SIZE
                    );
                }
            }
        }
    }

    // 绘制预览方块
    drawNext(piece) {
        this.nextCtx.fillStyle = '#0f0f1e';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (piece) {
            const shape = piece.shape;
            const size = 25;
            const offsetX = (this.nextCanvas.width - shape[0].length * size) / 2;
            const offsetY = (this.nextCanvas.height - shape.length * size) / 2;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(this.nextCtx, offsetX + x * size, offsetY + y * size, 
                                     piece.type, size);
                    }
                }
            }
        }
    }

    // 绘制暂存方块
    drawHold(piece) {
        this.holdCtx.fillStyle = '#0f0f1e';
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        if (piece) {
            const shape = piece.shape;
            const size = 25;
            const offsetX = (this.holdCanvas.width - shape[0].length * size) / 2;
            const offsetY = (this.holdCanvas.height - shape.length * size) / 2;
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(this.holdCtx, offsetX + x * size, offsetY + y * size, 
                                     piece.type, size);
                    }
                }
            }
        }
    }
}

// 分数管理器类
class ScoreManager {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.loadBestScores();
    }

    // 计算消除行得分
    addLines(linesCleared) {
        const points = [0, 100, 300, 500, 800];
        this.score += points[linesCleared] * this.level;
        this.lines += linesCleared;
        
        // 每10行升级
        this.level = Math.floor(this.lines / 10) + 1;
    }

    // 保存最佳成绩
    saveBestScores() {
        const best = this.loadBestScores();
        if (this.score > best.score) {
            localStorage.setItem('tetris_best_score', this.score);
        }
        if (this.lines > best.lines) {
            localStorage.setItem('tetris_best_lines', this.lines);
        }
    }

    // 加载最佳成绩
    loadBestScores() {
        return {
            score: parseInt(localStorage.getItem('tetris_best_score')) || 0,
            lines: parseInt(localStorage.getItem('tetris_best_lines')) || 0
        };
    }

    // 重置分数
    reset() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
    }
}

// 游戏主控制器
class Game {
    constructor() {
        this.board = new Board();
        this.renderer = new Renderer(
            document.getElementById('gameCanvas'),
            document.getElementById('nextCanvas'),
            document.getElementById('holdCanvas')
        );
        this.scoreManager = new ScoreManager();
        
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        
        this.gameState = 'stopped';
        this.dropCounter = 0;
        this.lastTime = 0;
        this.dropInterval = CONFIG.SPEEDS.normal;
        
        // 加载保存的配置
        this.loadConfig();
        
        this.setupControls();
        this.setupKeyboard();
        this.updateDisplay();
    }
    
    // 加载配置
    loadConfig() {
        const savedConfig = localStorage.getItem('tetris_config');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                
                // 恢复难度
                if (config.difficulty) {
                    this.dropInterval = CONFIG.SPEEDS[config.difficulty];
                    this.setSelectValue('difficultySelect', config.difficulty, config.difficulty.toUpperCase());
                }
                
                // 恢复宽度
                if (config.width) {
                    CONFIG.COLS = config.width;
                    updateCanvasSize();
                    this.setSelectValue('widthSelect', config.width.toString(), config.width.toString());
                }
                
                // 恢复模式
                if (config.mode) {
                    SHAPES = config.mode === 'basic' ? SHAPES_BASIC : SHAPES_ADVANCED;
                    this.setSelectValue('modeSelect', config.mode, config.mode.toUpperCase());
                }
            } catch (e) {
                console.error('加载配置失败:', e);
            }
        }
    }
    
    // 保存配置
    saveConfig() {
        const config = {
            difficulty: this.getCurrentDifficulty(),
            width: CONFIG.COLS,
            mode: SHAPES === SHAPES_BASIC ? 'basic' : 'advanced'
        };
        localStorage.setItem('tetris_config', JSON.stringify(config));
    }
    
    // 获取当前难度
    getCurrentDifficulty() {
        for (const [key, value] of Object.entries(CONFIG.SPEEDS)) {
            if (value === this.dropInterval) {
                return key;
            }
        }
        return 'normal';
    }
    
    // 设置下拉选择的值
    setSelectValue(selectId, value, displayText) {
        const selectEl = document.getElementById(selectId);
        if (!selectEl) return;
        
        const displayEl = selectEl.querySelector('.select-display');
        const options = selectEl.querySelectorAll('.select-option');
        
        if (displayEl) {
            displayEl.textContent = displayText;
        }
        
        options.forEach(opt => {
            if (opt.dataset.value === value) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
    }

    // 设置控制按钮
    setupControls() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        
        // 自定义下拉选择
        this.setupCustomSelect();
        
        // 自定义弹窗按钮
        document.getElementById('alertBtn').addEventListener('click', () => {
            this.hideCustomAlert();
        });
    }
    
    // 设置自定义下拉选择
    setupCustomSelect() {
        // 难度选择
        const difficultySelectEl = document.getElementById('difficultySelect');
        const difficultyDisplayEl = difficultySelectEl.querySelector('.select-display');
        const difficultyOptionsEl = difficultySelectEl.querySelector('.select-options');
        const difficultyOptionEls = difficultySelectEl.querySelectorAll('.select-option');
        
        // 点击显示/隐藏选项
        difficultyDisplayEl.addEventListener('click', (e) => {
            e.stopPropagation();
            difficultySelectEl.classList.toggle('active');
            document.getElementById('widthSelect').classList.remove('active');
            document.getElementById('modeSelect').classList.remove('active');
        });
        
        // 选择选项
        difficultyOptionEls.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent;
                
                // 更新显示
                difficultyDisplayEl.textContent = text;
                
                // 更新选中状态
                difficultyOptionEls.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // 更新游戏速度
                this.dropInterval = CONFIG.SPEEDS[value];
                
                // 保存配置
                this.saveConfig();
                
                // 关闭下拉
                difficultySelectEl.classList.remove('active');
            });
        });
        
        // 宽度选择
        const widthSelectEl = document.getElementById('widthSelect');
        const widthDisplayEl = widthSelectEl.querySelector('.select-display');
        const widthOptionsEl = widthSelectEl.querySelector('.select-options');
        const widthOptionEls = widthSelectEl.querySelectorAll('.select-option');
        
        // 点击显示/隐藏选项
        widthDisplayEl.addEventListener('click', (e) => {
            e.stopPropagation();
            widthSelectEl.classList.toggle('active');
            difficultySelectEl.classList.remove('active');
            document.getElementById('modeSelect').classList.remove('active');
        });
        
        // 选择选项
        widthOptionEls.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = parseInt(option.dataset.value);
                const text = option.textContent;
                
                // 更新显示
                widthDisplayEl.textContent = text;
                
                // 更新选中状态
                widthOptionEls.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // 更新游戏宽度
                CONFIG.COLS = value;
                updateCanvasSize();
                
                // 保存配置
                this.saveConfig();
                
                // 如果游戏正在进行，重新开始
                if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.restart();
                }
                
                // 关闭下拉
                widthSelectEl.classList.remove('active');
            });
        });
        
        // 模式选择
        const modeSelectEl = document.getElementById('modeSelect');
        const modeDisplayEl = modeSelectEl.querySelector('.select-display');
        const modeOptionsEl = modeSelectEl.querySelector('.select-options');
        const modeOptionEls = modeSelectEl.querySelectorAll('.select-option');
        
        // 点击显示/隐藏选项
        modeDisplayEl.addEventListener('click', (e) => {
            e.stopPropagation();
            modeSelectEl.classList.toggle('active');
            difficultySelectEl.classList.remove('active');
            widthSelectEl.classList.remove('active');
        });
        
        // 选择选项
        modeOptionEls.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.textContent;
                
                // 更新显示
                modeDisplayEl.textContent = text;
                
                // 更新选中状态
                modeOptionEls.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // 更新游戏模式
                if (value === 'basic') {
                    SHAPES = SHAPES_BASIC;
                } else {
                    SHAPES = SHAPES_ADVANCED;
                }
                
                // 保存配置
                this.saveConfig();
                
                // 如果游戏正在进行，重新开始
                if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.restart();
                }
                
                // 关闭下拉
                modeSelectEl.classList.remove('active');
            });
        });
        
        // 点击外部关闭下拉
        document.addEventListener('click', () => {
            difficultySelectEl.classList.remove('active');
            widthSelectEl.classList.remove('active');
            modeSelectEl.classList.remove('active');
        });
    }
    
    // 显示自定义弹窗
    showCustomAlert(score, lines) {
        document.getElementById('alertScore').textContent = score;
        document.getElementById('alertLines').textContent = lines;
        document.getElementById('customAlert').classList.add('show');
    }
    
    // 隐藏自定义弹窗
    hideCustomAlert() {
        document.getElementById('customAlert').classList.remove('show');
    }

    // 设置键盘控制
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // 允许 Cmd/Ctrl + R 刷新页面
            if ((e.metaKey || e.ctrlKey) && (e.key === 'r' || e.key === 'R')) {
                return;
            }
            
            // 如果结算弹窗显示，Enter 键关闭弹窗
            const alertEl = document.getElementById('customAlert');
            if (alertEl.classList.contains('show') && e.key === 'Enter') {
                e.preventDefault();
                this.hideCustomAlert();
                return;
            }
            
            // 游戏控制快捷键（任何状态都可用）
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.gameState === 'stopped' || this.gameState === 'gameover') {
                    this.start();
                } else if (this.gameState === 'playing' || this.gameState === 'paused') {
                    this.togglePause();
                }
                return;
            }
            
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                this.restart();
                return;
            }
            
            // 游戏进行中的操作
            if (this.gameState !== 'playing') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move(1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveDown();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotate();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.hold();
                    break;
            }
        });
    }

    // 生成随机方块
    randomPiece() {
        const types = Object.keys(SHAPES);
        const type = types[Math.floor(Math.random() * types.length)];
        return new Tetromino(type);
    }

    // 开始游戏
    start() {
        this.gameState = 'playing';
        this.board.reset();
        this.scoreManager.reset();
        this.currentPiece = this.randomPiece();
        this.nextPiece = this.randomPiece();
        this.holdPiece = null;
        this.canHold = true;
        
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.updateDisplay();
        this.lastTime = performance.now();
        this.gameLoop();
    }

    // 暂停/继续
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').textContent = 'RESUME (ENTER)';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseBtn').textContent = 'PAUSE (ENTER)';
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    // 重新开始
    restart() {
        this.start();
    }

    // 游戏循环
    gameLoop(time = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        
        // 根据等级调整下落速度
        const speed = Math.max(200, this.dropInterval - (this.scoreManager.level - 1) * 100);
        
        if (this.dropCounter > speed) {
            this.moveDown();
            this.dropCounter = 0;
        }
        
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // 左右移动
    move(dir) {
        if (!this.board.checkCollision(this.currentPiece, dir, 0)) {
            this.currentPiece.x += dir;
        }
    }

    // 向下移动
    moveDown() {
        if (!this.board.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.lockPiece();
        }
    }

    // 旋转
    rotate() {
        this.currentPiece.rotate();
        if (this.board.checkCollision(this.currentPiece)) {
            // 尝试墙踢
            if (!this.board.checkCollision(this.currentPiece, 1, 0)) {
                this.currentPiece.x++;
            } else if (!this.board.checkCollision(this.currentPiece, -1, 0)) {
                this.currentPiece.x--;
            } else {
                this.currentPiece.unrotate();
            }
        }
    }

    // 瞬间落地
    hardDrop() {
        while (!this.board.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        }
        this.lockPiece();
    }

    // 暂存方块
    hold() {
        if (!this.canHold) return;
        
        if (this.holdPiece === null) {
            this.holdPiece = new Tetromino(this.currentPiece.type);
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.randomPiece();
        } else {
            const temp = new Tetromino(this.currentPiece.type);
            this.currentPiece = new Tetromino(this.holdPiece.type);
            this.holdPiece = temp;
        }
        
        this.canHold = false;
        this.renderer.drawHold(this.holdPiece);
    }

    // 锁定方块
    lockPiece() {
        this.board.merge(this.currentPiece);
        const clearResult = this.board.clearLines();
        
        if (clearResult.count > 0) {
            // 创建碎裂效果（在移除行之前记录位置）
            clearResult.lines.forEach(row => {
                this.renderer.createShatterEffect(row, this.board);
            });
            
            // 立即移除行
            this.board.removeLines(clearResult.lines);
            this.scoreManager.addLines(clearResult.count);
            this.updateDisplay();
        }
        
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.canHold = true;
        
        this.renderer.drawNext(this.nextPiece);
        
        // 检查游戏结束
        if (this.board.checkCollision(this.currentPiece)) {
            this.gameOver();
        }
    }

    // 游戏结束
    gameOver() {
        this.gameState = 'gameover';
        this.scoreManager.saveBestScores();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        this.updateDisplay();
        this.showCustomAlert(this.scoreManager.score, this.scoreManager.lines);
    }

    // 渲染
    render() {
        this.renderer.drawBoard(this.board);
        this.renderer.drawGhostGuide(this.currentPiece, this.board);
        this.renderer.drawPiece(this.currentPiece);
        this.renderer.updateParticles();
    }

    // 更新显示
    updateDisplay() {
        document.getElementById('score').textContent = this.scoreManager.score;
        document.getElementById('level').textContent = this.scoreManager.level;
        document.getElementById('lines').textContent = this.scoreManager.lines;
        
        const best = this.scoreManager.loadBestScores();
        document.getElementById('bestScore').textContent = best.score;
        document.getElementById('bestLines').textContent = best.lines;
        
        if (this.nextPiece) {
            this.renderer.drawNext(this.nextPiece);
        }
        if (this.holdPiece) {
            this.renderer.drawHold(this.holdPiece);
        }
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    updateCanvasSize();
    const game = new Game();
});
