/**
 * 扫雷游戏主文件
 * 设置基本的JavaScript模块结构和初始化逻辑
 */

// 游戏状态枚举
const GameState = {
    NOT_STARTED: 'not_started',
    PLAYING: 'playing',
    WON: 'won',
    LOST: 'lost',
    PAUSED: 'paused'
};

// 单元格状态枚举
const CellState = {
    HIDDEN: 'hidden',
    REVEALED: 'revealed',
    FLAGGED: 'flagged',
    QUESTIONED: 'questioned'
};

// 难度配置类
class DifficultyConfig {
    // 预设难度配置
    static BEGINNER = { rows: 9, cols: 9, mines: 10, name: 'beginner' };
    static INTERMEDIATE = { rows: 16, cols: 16, mines: 40, name: 'intermediate' };
    static EXPERT = { rows: 16, cols: 30, mines: 99, name: 'expert' };
    
    // 自定义难度的限制
    static MIN_ROWS = 5;
    static MAX_ROWS = 50;
    static MIN_COLS = 5;
    static MAX_COLS = 50;
    static MIN_MINES = 1;
    static MAX_MINE_RATIO = 0.3; // 最大地雷密度30%
    
    /**
     * 验证自定义难度参数
     * @param {number} rows 行数
     * @param {number} cols 列数
     * @param {number} mines 地雷数
     * @returns {Object} 验证结果 {valid: boolean, error: string}
     */
    static validateCustom(rows, cols, mines) {
        // 验证输入类型
        if (!Number.isInteger(rows) || !Number.isInteger(cols) || !Number.isInteger(mines)) {
            return { valid: false, error: '所有参数必须是整数' };
        }
        
        // 验证行数范围
        if (rows < this.MIN_ROWS || rows > this.MAX_ROWS) {
            return { valid: false, error: `行数必须在${this.MIN_ROWS}-${this.MAX_ROWS}之间` };
        }
        
        // 验证列数范围
        if (cols < this.MIN_COLS || cols > this.MAX_COLS) {
            return { valid: false, error: `列数必须在${this.MIN_COLS}-${this.MAX_COLS}之间` };
        }
        
        // 计算总方格数和最大地雷数
        const totalCells = rows * cols;
        const maxMines = Math.floor(totalCells * this.MAX_MINE_RATIO);
        
        // 验证地雷数范围
        if (mines < this.MIN_MINES) {
            return { valid: false, error: `地雷数不能少于${this.MIN_MINES}个` };
        }
        
        if (mines > maxMines) {
            return { valid: false, error: `地雷数不能超过${maxMines}个（总方格数的30%）` };
        }
        
        // 确保至少有一个非地雷方格
        if (mines >= totalCells) {
            return { valid: false, error: '地雷数不能等于或超过总方格数' };
        }
        
        return { valid: true, error: '' };
    }
    
    /**
     * 获取指定难度的配置
     * @param {string} difficulty 难度名称
     * @returns {Object} 难度配置
     */
    static getConfig(difficulty) {
        switch (difficulty) {
            case 'beginner':
                return { ...this.BEGINNER };
            case 'intermediate':
                return { ...this.INTERMEDIATE };
            case 'expert':
                return { ...this.EXPERT };
            default:
                return { ...this.BEGINNER };
        }
    }
    
    /**
     * 获取难度配置的地雷密度
     * @param {Object} config 难度配置
     * @returns {number} 地雷密度（0-1之间的小数）
     */
    static getMineRatio(config) {
        if (!config || config.rows <= 0 || config.cols <= 0) {
            return 0;
        }
        
        const totalCells = config.rows * config.cols;
        return config.mines / totalCells;
    }
}

// 单元格类
class Cell {
    constructor(row = 0, col = 0) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.neighborMines = 0;
        this.state = CellState.HIDDEN;
        this.element = null; // DOM元素引用，用于UI管理
    }
    
    /**
     * 重置单元格状态到初始状态
     */
    reset() {
        this.isMine = false;
        this.neighborMines = 0;
        this.state = CellState.HIDDEN;
    }
    
    /**
     * 检查单元格是否已被揭示
     * @returns {boolean} 是否已揭示
     */
    isRevealed() {
        return this.state === CellState.REVEALED;
    }
    
    /**
     * 检查单元格是否被标记
     * @returns {boolean} 是否被标记
     */
    isFlagged() {
        return this.state === CellState.FLAGGED;
    }
    
    /**
     * 检查单元格是否被质疑标记
     * @returns {boolean} 是否被质疑标记
     */
    isQuestioned() {
        return this.state === CellState.QUESTIONED;
    }
    
    /**
     * 检查单元格是否隐藏
     * @returns {boolean} 是否隐藏
     */
    isHidden() {
        return this.state === CellState.HIDDEN;
    }
    
    /**
     * 揭示单元格
     */
    reveal() {
        if (this.state === CellState.HIDDEN || this.state === CellState.QUESTIONED) {
            this.state = CellState.REVEALED;
        }
    }
    
    /**
     * 切换标记状态（隐藏 -> 标记 -> 质疑 -> 隐藏）
     */
    toggleFlag() {
        switch (this.state) {
            case CellState.HIDDEN:
                this.state = CellState.FLAGGED;
                break;
            case CellState.FLAGGED:
                this.state = CellState.QUESTIONED;
                break;
            case CellState.QUESTIONED:
                this.state = CellState.HIDDEN;
                break;
            // 已揭示的单元格不能标记
            case CellState.REVEALED:
                break;
        }
    }
    
    /**
     * 设置为地雷
     */
    setMine() {
        this.isMine = true;
    }
    
    /**
     * 设置邻居地雷数量
     * @param {number} count 邻居地雷数量
     */
    setNeighborMines(count) {
        this.neighborMines = Math.max(0, Math.min(8, count));
    }
    
    /**
     * 获取单元格显示内容
     * @returns {string} 显示内容
     */
    getDisplayContent() {
        if (!this.isRevealed()) {
            if (this.isFlagged()) {
                return '🚩';
            } else if (this.isQuestioned()) {
                return '?';
            } else {
                return '';
            }
        }
        
        if (this.isMine) {
            return '💣';
        }
        
        return this.neighborMines > 0 ? this.neighborMines.toString() : '';
    }
    
    /**
     * 获取单元格CSS类名
     * @returns {string} CSS类名
     */
    getCSSClass() {
        let classes = ['cell'];
        
        if (this.isRevealed()) {
            classes.push('revealed');
            if (this.isMine) {
                classes.push('mine');
            } else if (this.neighborMines > 0) {
                classes.push(`number-${this.neighborMines}`);
            }
        } else if (this.isFlagged()) {
            classes.push('flagged');
        } else if (this.isQuestioned()) {
            classes.push('questioned');
        }
        
        return classes.join(' ');
    }
}

// 游戏配置类
class GameConfig {
    constructor(rows, cols, mines, difficulty = 'custom') {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.difficulty = difficulty;
    }
}

// 游戏棋盘类
class GameBoard {
    constructor(rows, cols, mineCount) {
        this.rows = rows;
        this.cols = cols;
        this.mineCount = mineCount;
        this.cells = [];
        this.gameState = GameState.NOT_STARTED;
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.firstClick = true;
        
        this.initializeBoard();
    }
    
    /**
     * 初始化棋盘，创建所有单元格
     */
    initializeBoard() {
        this.cells = [];
        this.revealedCount = 0;
        this.flaggedCount = 0;
        this.firstClick = true;
        this.gameState = GameState.NOT_STARTED;
        
        // 创建二维数组存储单元格
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = new Cell(row, col);
            }
        }
    }
    
    /**
     * 生成地雷，确保第一次点击的位置不是地雷
     * @param {number} firstClickRow 第一次点击的行
     * @param {number} firstClickCol 第一次点击的列
     */
    generateMines(firstClickRow = -1, firstClickCol = -1) {
        // 重置所有单元格的地雷状态
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col].isMine = false;
            }
        }
        
        // 创建所有可能的位置列表
        const availablePositions = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // 排除第一次点击的位置及其周围8个位置
                if (firstClickRow >= 0 && firstClickCol >= 0) {
                    const rowDiff = Math.abs(row - firstClickRow);
                    const colDiff = Math.abs(col - firstClickCol);
                    if (rowDiff <= 1 && colDiff <= 1) {
                        continue; // 跳过第一次点击位置的3x3区域
                    }
                }
                availablePositions.push({ row, col });
            }
        }
        
        // 随机选择地雷位置
        const actualMineCount = Math.min(this.mineCount, availablePositions.length);
        
        for (let i = 0; i < actualMineCount; i++) {
            const randomIndex = Math.floor(Math.random() * availablePositions.length);
            const position = availablePositions.splice(randomIndex, 1)[0];
            this.cells[position.row][position.col].setMine();
        }
        
        // 计算所有单元格的邻居地雷数
        this.calculateNumbers();
        
        console.log(`生成了 ${actualMineCount} 个地雷`);
    }
    
    /**
     * 计算所有单元格周围的地雷数量
     */
    calculateNumbers() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.cells[row][col].isMine) {
                    const mineCount = this.countAdjacentMines(row, col);
                    this.cells[row][col].setNeighborMines(mineCount);
                }
            }
        }
    }
    
    /**
     * 计算指定位置周围的地雷数量
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {number} 周围地雷数量
     */
    countAdjacentMines(row, col) {
        let count = 0;
        const adjacentCells = this.getAdjacentCells(row, col);
        
        for (const cell of adjacentCells) {
            if (cell.isMine) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * 获取指定位置的相邻单元格
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {Array} 相邻单元格数组
     */
    getAdjacentCells(row, col) {
        const adjacentCells = [];
        
        // 检查8个方向的相邻单元格
        for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
            for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
                // 跳过自身
                if (deltaRow === 0 && deltaCol === 0) {
                    continue;
                }
                
                const newRow = row + deltaRow;
                const newCol = col + deltaCol;
                
                // 检查边界
                if (this.isValidPosition(newRow, newCol)) {
                    adjacentCells.push(this.cells[newRow][newCol]);
                }
            }
        }
        
        return adjacentCells;
    }
    
    /**
     * 检查位置是否在棋盘范围内
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {boolean} 是否有效位置
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    /**
     * 揭示单元格
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {Object} 操作结果 {success: boolean, gameOver: boolean, autoRevealed: Array}
     */
    revealCell(row, col) {
        // 检查位置有效性
        if (!this.isValidPosition(row, col)) {
            return { success: false, gameOver: false, autoRevealed: [] };
        }
        
        const cell = this.cells[row][col];
        
        // 检查单元格是否可以揭示
        if (cell.isRevealed() || cell.isFlagged()) {
            return { success: false, gameOver: false, autoRevealed: [] };
        }
        
        // 如果是第一次点击，生成地雷
        if (this.firstClick) {
            this.generateMines(row, col);
            this.firstClick = false;
            this.gameState = GameState.PLAYING;
        }
        
        // 揭示单元格
        cell.reveal();
        this.revealedCount++;
        
        // 检查是否点击了地雷
        if (cell.isMine) {
            this.gameState = GameState.LOST;
            this.revealAllMines();
            return { success: true, gameOver: true, autoRevealed: [] };
        }
        
        // 如果是空白单元格（周围无地雷），自动展开相邻区域
        const autoRevealed = [];
        if (cell.neighborMines === 0) {
            this.autoRevealAdjacent(row, col, autoRevealed);
        }
        
        // 检查是否获胜
        if (this.checkWinCondition()) {
            this.gameState = GameState.WON;
            return { success: true, gameOver: true, autoRevealed };
        }
        
        return { success: true, gameOver: false, autoRevealed };
    }
    
    /**
     * 自动展开相邻的空白区域
     * @param {number} row 起始行
     * @param {number} col 起始列
     * @param {Array} autoRevealed 自动揭示的单元格列表
     */
    autoRevealAdjacent(row, col, autoRevealed) {
        const adjacentCells = this.getAdjacentCells(row, col);
        
        for (const cell of adjacentCells) {
            if (!cell.isRevealed() && !cell.isFlagged() && !cell.isMine) {
                cell.reveal();
                this.revealedCount++;
                autoRevealed.push({ row: cell.row, col: cell.col });
                
                // 如果相邻单元格也是空白，递归展开
                if (cell.neighborMines === 0) {
                    this.autoRevealAdjacent(cell.row, cell.col, autoRevealed);
                }
            }
        }
    }
    
    /**
     * 切换单元格标记状态
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {Object} 操作结果 {success: boolean, newState: string}
     */
    toggleFlag(row, col) {
        // 检查位置有效性
        if (!this.isValidPosition(row, col)) {
            return { success: false, newState: null };
        }
        
        const cell = this.cells[row][col];
        
        // 已揭示的单元格不能标记
        if (cell.isRevealed()) {
            return { success: false, newState: null };
        }
        
        const oldState = cell.state;
        cell.toggleFlag();
        
        // 更新标记计数
        if (oldState === CellState.HIDDEN && cell.isFlagged()) {
            this.flaggedCount++;
        } else if (oldState === CellState.FLAGGED && !cell.isFlagged()) {
            this.flaggedCount--;
        }
        
        return { success: true, newState: cell.state };
    }
    
    /**
     * 双击数字单元格自动展开
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {Object} 操作结果 {success: boolean, gameOver: boolean, autoRevealed: Array}
     */
    doubleClickReveal(row, col) {
        // 检查位置有效性
        if (!this.isValidPosition(row, col)) {
            return { success: false, gameOver: false, autoRevealed: [] };
        }
        
        const cell = this.cells[row][col];
        
        // 只有已揭示的数字单元格才能双击展开
        if (!cell.isRevealed() || cell.isMine || cell.neighborMines === 0) {
            return { success: false, gameOver: false, autoRevealed: [] };
        }
        
        // 计算周围标记的数量
        const adjacentCells = this.getAdjacentCells(row, col);
        const flaggedCount = adjacentCells.filter(c => c.isFlagged()).length;
        
        // 只有当标记数量等于数字时才能自动展开
        if (flaggedCount !== cell.neighborMines) {
            return { success: false, gameOver: false, autoRevealed: [] };
        }
        
        // 自动揭示所有未标记的相邻单元格
        const autoRevealed = [];
        let gameOver = false;
        
        for (const adjacentCell of adjacentCells) {
            if (!adjacentCell.isRevealed() && !adjacentCell.isFlagged()) {
                const result = this.revealCell(adjacentCell.row, adjacentCell.col);
                if (result.success) {
                    autoRevealed.push({ row: adjacentCell.row, col: adjacentCell.col });
                    autoRevealed.push(...result.autoRevealed);
                    
                    if (result.gameOver) {
                        gameOver = true;
                        break;
                    }
                }
            }
        }
        
        return { success: true, gameOver, autoRevealed };
    }
    
    /**
     * 揭示所有地雷（游戏结束时调用）
     */
    revealAllMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                if (cell.isMine) {
                    cell.reveal();
                }
            }
        }
    }
    
    /**
     * 检查游戏胜利条件
     * @returns {boolean} 是否获胜
     */
    checkWinCondition() {
        // 胜利条件：所有非地雷单元格都被揭示
        const totalCells = this.rows * this.cols;
        const expectedRevealed = totalCells - this.mineCount;
        return this.revealedCount >= expectedRevealed;
    }
    
    /**
     * 检查游戏是否失败
     * @returns {boolean} 是否失败
     */
    isGameLost() {
        return this.gameState === GameState.LOST;
    }
    
    /**
     * 检查游戏是否获胜
     * @returns {boolean} 是否获胜
     */
    isGameWon() {
        return this.gameState === GameState.WON;
    }
    
    /**
     * 获取剩余地雷数量（总地雷数 - 标记数）
     * @returns {number} 剩余地雷数
     */
    getRemainingMines() {
        return Math.max(0, this.mineCount - this.flaggedCount);
    }
    
    /**
     * 获取指定位置的单元格
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {Cell|null} 单元格对象或null
     */
    getCell(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.cells[row][col];
        }
        return null;
    }
    
    /**
     * 获取游戏统计信息
     * @returns {Object} 统计信息
     */
    getGameStats() {
        return {
            totalCells: this.rows * this.cols,
            mineCount: this.mineCount,
            revealedCount: this.revealedCount,
            flaggedCount: this.flaggedCount,
            remainingMines: this.getRemainingMines(),
            gameState: this.gameState
        };
    }
    
    /**
     * 重置棋盘到初始状态
     */
    reset() {
        this.initializeBoard();
    }
}
// 用户界面管理器类
class UIManager {
    constructor(boardElement, settingsElement) {
        this.boardElement = boardElement;
        this.settingsElement = settingsElement;
        this.gameBoard = null;
        this.cellElements = new Map(); // 存储单元格DOM元素的映射
        
        // 绑定事件处理器的上下文
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellRightClick = this.handleCellRightClick.bind(this);
        this.handleCellDoubleClick = this.handleCellDoubleClick.bind(this);
        
        // 事件回调函数
        this.onCellClick = null;
        this.onCellRightClick = null;
        this.onCellDoubleClick = null;
    }
    
    /**
     * 渲染游戏棋盘
     * @param {GameBoard} gameBoard 游戏棋盘对象
     */
    renderBoard(gameBoard) {
        this.gameBoard = gameBoard;
        
        if (!gameBoard) {
            this.boardElement.innerHTML = '';
            return;
        }
        
        const { rows, cols } = gameBoard;
        
        // 清空棋盘
        this.boardElement.innerHTML = '';
        this.cellElements.clear();
        
        // 设置棋盘网格样式
        this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 25px)`;
        this.boardElement.style.gridTemplateRows = `repeat(${rows}, 25px)`;
        
        // 创建方格元素
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cellElement = this.createCellElement(row, col);
                this.boardElement.appendChild(cellElement);
                
                // 保存元素引用
                const key = `${row}-${col}`;
                this.cellElements.set(key, cellElement);
                
                // 保存DOM元素引用到Cell对象
                const cell = gameBoard.getCell(row, col);
                if (cell) {
                    cell.element = cellElement;
                }
            }
        }
    }
    
    /**
     * 创建单元格DOM元素
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @returns {HTMLElement} 单元格DOM元素
     */
    createCellElement(row, col) {
        const cellElement = document.createElement('div');
        
        // 设置基本属性
        cellElement.className = 'cell';
        cellElement.dataset.row = row;
        cellElement.dataset.col = col;
        
        // 绑定事件监听器
        this.bindCellEvents(cellElement, row, col);
        
        // 初始化显示
        this.updateCellElement(cellElement, row, col);
        
        return cellElement;
    }
    
    /**
     * 绑定单元格事件
     * @param {HTMLElement} cellElement 单元格DOM元素
     * @param {number} row 行索引
     * @param {number} col 列索引
     */
    bindCellEvents(cellElement, row, col) {
        // 左键点击 - 揭示单元格
        cellElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleCellClick(row, col, e);
        });
        
        // 右键点击 - 标记单元格
        cellElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleCellRightClick(row, col, e);
        });
        
        // 双击 - 自动展开
        cellElement.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.handleCellDoubleClick(row, col, e);
        });
        
        // 鼠标按下效果
        cellElement.addEventListener('mousedown', (e) => {
            if (!this.gameBoard) return;
            const cell = this.gameBoard.getCell(row, col);
            if (cell && !cell.isRevealed() && e.button === 0) { // 只对左键有效
                cellElement.classList.add('pressed');
            }
        });
        
        // 鼠标释放效果
        cellElement.addEventListener('mouseup', (e) => {
            cellElement.classList.remove('pressed');
        });
        
        // 鼠标离开时移除按下效果
        cellElement.addEventListener('mouseleave', (e) => {
            cellElement.classList.remove('pressed');
        });
        
        // 鼠标悬停效果
        cellElement.addEventListener('mouseenter', () => {
            if (!this.gameBoard) return;
            const cell = this.gameBoard.getCell(row, col);
            if (cell && !cell.isRevealed()) {
                cellElement.classList.add('hover');
            }
        });
        
        cellElement.addEventListener('mouseleave', () => {
            cellElement.classList.remove('hover');
        });
        
        // 防止文本选择
        cellElement.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * 处理单元格左键点击
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {Event} event 事件对象
     */
    handleCellClick(row, col, event) {
        if (this.onCellClick) {
            this.onCellClick(row, col, false, event);
        }
    }
    
    /**
     * 处理单元格右键点击
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {Event} event 事件对象
     */
    handleCellRightClick(row, col, event) {
        if (this.onCellRightClick) {
            this.onCellRightClick(row, col, true, event);
        }
    }
    
    /**
     * 处理单元格双击
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {Event} event 事件对象
     */
    handleCellDoubleClick(row, col, event) {
        if (this.onCellDoubleClick) {
            this.onCellDoubleClick(row, col, event);
        }
    }
    
    /**
     * 更新单个单元格显示
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {string} animationType 可选的动画类型
     */
    updateCell(row, col, animationType = null) {
        const key = `${row}-${col}`;
        const cellElement = this.cellElements.get(key);
        
        if (cellElement) {
            this.updateCellElement(cellElement, row, col);
            
            // 添加动画效果
            if (animationType) {
                this.addCellAnimation(row, col, animationType);
            }
        }
    }
    
    /**
     * 更新单元格DOM元素
     * @param {HTMLElement} cellElement 单元格DOM元素
     * @param {number} row 行索引
     * @param {number} col 列索引
     */
    updateCellElement(cellElement, row, col) {
        if (!this.gameBoard) return;
        
        const cell = this.gameBoard.getCell(row, col);
        if (!cell) return;
        
        // 更新CSS类名
        cellElement.className = cell.getCSSClass();
        
        // 更新显示内容
        cellElement.textContent = cell.getDisplayContent();
        
        // 添加视觉反馈类
        if (!cell.isRevealed() && !cell.isFlagged()) {
            cellElement.classList.add('interactive');
        } else {
            cellElement.classList.remove('interactive');
        }
        
        // 根据状态设置光标样式
        if (cell.isRevealed()) {
            cellElement.style.cursor = 'default';
        } else {
            cellElement.style.cursor = 'pointer';
        }
    }
    
    /**
     * 更新游戏统计显示
     * @param {number} timeElapsed 已用时间（秒）
     * @param {number} minesRemaining 剩余地雷数
     * @param {Object} gameStats 额外的游戏统计信息
     */
    updateGameStats(timeElapsed, minesRemaining, gameStats = {}) {
        // 更新时间显示
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            const formattedTime = Math.min(999, Math.max(0, timeElapsed)).toString().padStart(3, '0');
            timeDisplay.textContent = formattedTime;
        }
        
        // 更新剩余地雷数显示
        const minesCount = document.getElementById('mines-count');
        if (minesCount) {
            // 剩余地雷数可能为负数（当标记数超过实际地雷数时）
            const formattedMines = Math.abs(minesRemaining).toString().padStart(3, '0');
            minesCount.textContent = minesRemaining < 0 ? `-${formattedMines}` : formattedMines;
            
            // 根据剩余地雷数改变颜色
            if (minesRemaining < 0) {
                minesCount.style.color = '#ff6600'; // 橙色表示过度标记
            } else if (minesRemaining === 0) {
                minesCount.style.color = '#00ff00'; // 绿色表示可能完成
            } else {
                minesCount.style.color = '#ff0000'; // 红色表示正常状态
            }
        }
    }
    
    /**
     * 显示游戏结果
     * @param {boolean} isWon 是否获胜
     * @param {number} time 游戏时间
     * @param {Object} gameStats 游戏统计信息
     */
    showGameResult(isWon, time, gameStats = {}) {
        const gameResult = document.getElementById('game-result');
        const resultText = document.getElementById('result-text');
        
        if (!gameResult || !resultText) return;
        
        if (isWon) {
            gameResult.className = 'game-result won';
            const formattedTime = time.toString().padStart(3, '0');
            
            // 构建获胜消息
            let message = `🎉 恭喜获胜！`;
            if (time > 0) {
                message += ` 用时: ${formattedTime}秒`;
            }
            
            // 添加统计信息
            if (gameStats.difficulty) {
                const difficultyNames = {
                    'beginner': '初级',
                    'intermediate': '中等',
                    'expert': '高级',
                    'custom': '自定义'
                };
                message += ` (${difficultyNames[gameStats.difficulty] || '自定义'})`;
            }
            
            resultText.textContent = message;
        } else {
            gameResult.className = 'game-result lost';
            let message = '💥 游戏失败！';
            
            // 添加失败原因或鼓励信息
            if (gameStats.revealedCount && gameStats.totalCells && gameStats.mineCount) {
                const progress = Math.round((gameStats.revealedCount / (gameStats.totalCells - gameStats.mineCount)) * 100);
                if (progress > 80) {
                    message += ` 已完成${progress}%，很接近了！`;
                } else if (progress > 50) {
                    message += ` 已完成${progress}%，继续努力！`;
                }
            }
            
            message += ' 点击新游戏重试';
            resultText.textContent = message;
        }
        
        gameResult.classList.remove('hidden');
        
        // 添加结果显示动画
        gameResult.style.animation = 'fadeIn 0.5s ease-out';
    }
    
    /**
     * 隐藏游戏结果
     */
    hideGameResult() {
        const gameResult = document.getElementById('game-result');
        if (gameResult) {
            gameResult.classList.add('hidden');
        }
    }
    
    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 禁用右键菜单 - 全局禁用
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // 禁用拖拽选择文本 - 全局禁用
        document.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        // 防止双击选择文本 - 全局禁用
        document.addEventListener('mousedown', (e) => {
            if (e.detail > 1) {
                e.preventDefault();
            }
        });
        
        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // 触摸设备优化
        this.setupTouchOptimizations();
        
        // 游戏棋盘特定的事件处理
        this.boardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        this.boardElement.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        this.boardElement.addEventListener('mousedown', (e) => {
            if (e.detail > 1) {
                e.preventDefault();
            }
        });
    }
    
    /**
     * 处理键盘快捷键
     * @param {KeyboardEvent} event 键盘事件
     */
    handleKeyboardShortcuts(event) {
        // 防止在输入框中触发快捷键
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key.toLowerCase()) {
            case 'n':
            case 'f2':
                // N键或F2 - 新游戏
                event.preventDefault();
                if (this.onNewGame) {
                    this.onNewGame();
                }
                break;
                
            case 'r':
                // R键 - 重新开始
                event.preventDefault();
                if (this.onRestart) {
                    this.onRestart();
                }
                break;
                
            case 'p':
            case ' ':
                // P键或空格键 - 暂停/恢复
                event.preventDefault();
                if (this.onPauseToggle) {
                    this.onPauseToggle();
                }
                break;
                
            case '1':
                // 1键 - 初级难度
                event.preventDefault();
                if (this.onDifficultyChange) {
                    this.onDifficultyChange('beginner');
                }
                break;
                
            case '2':
                // 2键 - 中等难度
                event.preventDefault();
                if (this.onDifficultyChange) {
                    this.onDifficultyChange('intermediate');
                }
                break;
                
            case '3':
                // 3键 - 高级难度
                event.preventDefault();
                if (this.onDifficultyChange) {
                    this.onDifficultyChange('expert');
                }
                break;
                
            case 'h':
                // H键 - 显示帮助
                event.preventDefault();
                this.showHelp();
                break;
                
            case 'escape':
                // ESC键 - 关闭帮助或暂停游戏
                event.preventDefault();
                this.handleEscape();
                break;
        }
    }
    
    /**
     * 设置触摸设备优化
     */
    setupTouchOptimizations() {
        // 检测是否为触摸设备
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isTouchDevice) {
            // 添加触摸设备样式类
            document.body.classList.add('touch-device');
            
            // 优化触摸交互
            this.boardElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            this.boardElement.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
            this.boardElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            
            // 长按支持（模拟右键）
            this.setupLongPressSupport();
        }
        
        // 防止双击缩放
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    /**
     * 处理触摸开始事件
     * @param {TouchEvent} event 触摸事件
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.classList.contains('cell')) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            
            // 记录触摸开始信息
            this.touchStartInfo = {
                row,
                col,
                element,
                startTime: Date.now(),
                startX: touch.clientX,
                startY: touch.clientY
            };
            
            // 添加触摸反馈
            element.classList.add('touch-active');
        }
    }
    
    /**
     * 处理触摸结束事件
     * @param {TouchEvent} event 触摸事件
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        if (!this.touchStartInfo) return;
        
        const { row, col, element, startTime } = this.touchStartInfo;
        const touchDuration = Date.now() - startTime;
        
        // 移除触摸反馈
        element.classList.remove('touch-active');
        
        // 判断是否为长按（右键操作）
        if (touchDuration >= 500) {
            // 长按 - 标记操作
            if (this.onCellRightClick) {
                this.onCellRightClick(row, col, true, event);
            }
        } else {
            // 短按 - 点击操作
            if (this.onCellClick) {
                this.onCellClick(row, col, false, event);
            }
        }
        
        this.touchStartInfo = null;
    }
    
    /**
     * 处理触摸移动事件
     * @param {TouchEvent} event 触摸事件
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (!this.touchStartInfo) return;
        
        const touch = event.touches[0];
        const { startX, startY, element } = this.touchStartInfo;
        
        // 计算移动距离
        const deltaX = Math.abs(touch.clientX - startX);
        const deltaY = Math.abs(touch.clientY - startY);
        const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // 如果移动距离超过阈值，取消触摸操作
        if (moveDistance > 10) {
            element.classList.remove('touch-active');
            this.touchStartInfo = null;
        }
    }
    
    /**
     * 设置长按支持
     */
    setupLongPressSupport() {
        let longPressTimer = null;
        let isLongPress = false;
        
        this.boardElement.addEventListener('touchstart', (e) => {
            isLongPress = false;
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                // 触发震动反馈（如果支持）
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                
                // 添加长按视觉反馈
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.classList.contains('cell')) {
                    element.classList.add('long-press-active');
                    setTimeout(() => {
                        element.classList.remove('long-press-active');
                    }, 200);
                }
            }, 500);
        });
        
        this.boardElement.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
        
        this.boardElement.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
    }
    
    /**
     * 显示帮助信息
     */
    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <h3>游戏帮助</h3>
                <div class="help-section">
                    <h4>游戏规则</h4>
                    <ul>
                        <li>左键点击打开方格</li>
                        <li>右键点击标记地雷</li>
                        <li>双击数字自动展开周围方格</li>
                        <li>找出所有地雷即可获胜</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>键盘快捷键</h4>
                    <ul>
                        <li><kbd>N</kbd> 或 <kbd>F2</kbd> - 新游戏</li>
                        <li><kbd>R</kbd> - 重新开始</li>
                        <li><kbd>P</kbd> 或 <kbd>空格</kbd> - 暂停/恢复</li>
                        <li><kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> - 切换难度</li>
                        <li><kbd>H</kbd> - 显示帮助</li>
                        <li><kbd>ESC</kbd> - 关闭帮助</li>
                    </ul>
                </div>
                <div class="help-section">
                    <h4>触摸设备</h4>
                    <ul>
                        <li>短按 - 打开方格</li>
                        <li>长按 - 标记地雷</li>
                        <li>双击 - 自动展开</li>
                    </ul>
                </div>
                <button class="help-close-btn">关闭</button>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // 绑定关闭事件
        const closeBtn = helpModal.querySelector('.help-close-btn');
        const closeHelp = () => {
            document.body.removeChild(helpModal);
        };
        
        closeBtn.addEventListener('click', closeHelp);
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                closeHelp();
            }
        });
        
        // ESC键关闭
        const handleEscClose = (e) => {
            if (e.key === 'Escape') {
                closeHelp();
                document.removeEventListener('keydown', handleEscClose);
            }
        };
        document.addEventListener('keydown', handleEscClose);
    }
    
    /**
     * 处理ESC键
     */
    handleEscape() {
        // 检查是否有打开的模态框
        const modal = document.querySelector('.help-modal');
        if (modal) {
            document.body.removeChild(modal);
            return;
        }
        
        // 如果没有模态框，暂停游戏
        if (this.onPauseToggle) {
            this.onPauseToggle();
        }
    }
    
    /**
     * 设置键盘快捷键回调函数
     * @param {Object} callbacks 回调函数对象
     */
    setKeyboardCallbacks(callbacks) {
        this.onNewGame = callbacks.onNewGame;
        this.onRestart = callbacks.onRestart;
        this.onPauseToggle = callbacks.onPauseToggle;
        this.onDifficultyChange = callbacks.onDifficultyChange;
    }
    
    /**
     * 设置事件回调函数
     * @param {Function} onCellClick 单元格点击回调
     * @param {Function} onCellRightClick 单元格右键点击回调
     * @param {Function} onCellDoubleClick 单元格双击回调
     */
    setEventCallbacks(onCellClick, onCellRightClick, onCellDoubleClick) {
        this.onCellClick = onCellClick;
        this.onCellRightClick = onCellRightClick;
        this.onCellDoubleClick = onCellDoubleClick;
    }
    
    /**
     * 添加单元格动画效果
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {string} animationType 动画类型
     */
    addCellAnimation(row, col, animationType) {
        const key = `${row}-${col}`;
        const cellElement = this.cellElements.get(key);
        
        if (cellElement) {
            cellElement.classList.add(`animate-${animationType}`);
            
            // 动画结束后移除类名
            setTimeout(() => {
                cellElement.classList.remove(`animate-${animationType}`);
            }, 300);
        }
    }
}

// 游戏计时器类
class GameTimer {
    constructor() {
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.onTick = null; // 时间更新回调函数
    }
    
    /**
     * 开始计时
     */
    start() {
        if (this.isRunning && !this.isPaused) {
            return; // 已经在运行中
        }
        
        if (this.isPaused) {
            // 从暂停状态恢复
            this.resume();
        } else {
            // 全新开始
            this.startTime = Date.now();
            this.totalPausedDuration = 0;
            this.isRunning = true;
            this.isPaused = false;
            
            // 启动定时器，每秒更新一次
            this.intervalId = setInterval(() => {
                if (this.onTick) {
                    this.onTick(this.getElapsedTime());
                }
            }, 1000);
            
            console.log('计时器已开始');
        }
    }
    
    /**
     * 停止计时
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('计时器已停止，总用时：', this.getElapsedTime(), '秒');
    }
    
    /**
     * 暂停计时
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        this.isPaused = true;
        this.pausedTime = Date.now();
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        console.log('计时器已暂停');
    }
    
    /**
     * 恢复计时
     */
    resume() {
        if (!this.isRunning || !this.isPaused) {
            return;
        }
        
        // 计算暂停持续时间并累加
        const pauseDuration = Date.now() - this.pausedTime;
        this.totalPausedDuration += pauseDuration;
        
        this.isPaused = false;
        this.pausedTime = 0;
        
        // 重新启动定时器
        this.intervalId = setInterval(() => {
            if (this.onTick) {
                this.onTick(this.getElapsedTime());
            }
        }, 1000);
        
        console.log('计时器已恢复');
    }
    
    /**
     * 重置计时器
     */
    reset() {
        this.stop();
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedDuration = 0;
        
        console.log('计时器已重置');
    }
    
    /**
     * 获取已用时间（秒）
     * @returns {number} 已用时间（秒）
     */
    getElapsedTime() {
        if (!this.startTime) {
            return 0;
        }
        
        let currentTime;
        if (this.isPaused) {
            // 如果当前暂停，使用暂停时的时间
            currentTime = this.pausedTime;
        } else {
            // 如果正在运行或已停止，使用当前时间
            currentTime = Date.now();
        }
        
        // 计算总经过时间，减去暂停时间
        const totalElapsed = currentTime - this.startTime - this.totalPausedDuration;
        return Math.floor(totalElapsed / 1000);
    }
    
    /**
     * 设置时间更新回调函数
     * @param {Function} callback 回调函数，参数为当前经过的秒数
     */
    setOnTick(callback) {
        this.onTick = callback;
    }
    
    /**
     * 获取计时器状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            elapsedTime: this.getElapsedTime(),
            startTime: this.startTime,
            totalPausedDuration: this.totalPausedDuration
        };
    }
    
    /**
     * 销毁计时器，清理资源
     */
    destroy() {
        this.stop();
        this.onTick = null;
        console.log('计时器已销毁');
    }
}

// 存储管理器类
class StorageManager {
    constructor() {
        this.storagePrefix = 'minesweeper_';
        this.isStorageAvailable = this.checkStorageAvailability();
        
        // 存储键名常量
        this.keys = {
            bestTimes: 'best_times',
            settings: 'settings',
            gameStats: 'game_stats'
        };
        
        console.log('存储管理器初始化，存储可用性：', this.isStorageAvailable);
    }
    
    /**
     * 检查本地存储是否可用
     * @returns {boolean} 存储是否可用
     */
    checkStorageAvailability() {
        try {
            const testKey = this.storagePrefix + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('本地存储不可用：', error.message);
            return false;
        }
    }
    
    /**
     * 安全地获取存储项
     * @param {string} key 存储键
     * @param {*} defaultValue 默认值
     * @returns {*} 存储的值或默认值
     */
    safeGetItem(key, defaultValue = null) {
        if (!this.isStorageAvailable) {
            return defaultValue;
        }
        
        try {
            const fullKey = this.storagePrefix + key;
            const item = localStorage.getItem(fullKey);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取存储项失败：', key, error.message);
            return defaultValue;
        }
    }
    
    /**
     * 安全地设置存储项
     * @param {string} key 存储键
     * @param {*} value 要存储的值
     * @returns {boolean} 是否成功存储
     */
    safeSetItem(key, value) {
        if (!this.isStorageAvailable) {
            console.warn('存储不可用，无法保存：', key);
            return false;
        }
        
        try {
            const fullKey = this.storagePrefix + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('保存存储项失败：', key, error.message);
            return false;
        }
    }
    
    /**
     * 保存最佳成绩
     * @param {string} difficulty 难度级别
     * @param {number} time 完成时间（秒）
     * @returns {boolean} 是否为新纪录
     */
    saveBestTimes(difficulty, time) {
        if (!difficulty || time < 0) {
            console.error('无效的最佳成绩参数：', { difficulty, time });
            return false;
        }
        
        // 获取当前最佳成绩
        const bestTimes = this.getBestTimes();
        
        // 检查是否为新纪录
        const currentBest = bestTimes[difficulty];
        const isNewRecord = !currentBest || time < currentBest;
        
        if (isNewRecord) {
            bestTimes[difficulty] = time;
            
            // 保存更新后的最佳成绩
            const success = this.safeSetItem(this.keys.bestTimes, bestTimes);
            
            if (success) {
                console.log(`新的最佳成绩！${difficulty}: ${time}秒`);
            }
            
            return success;
        }
        
        return false;
    }
    
    /**
     * 获取最佳成绩
     * @param {string} difficulty 可选的特定难度
     * @returns {Object|number} 最佳成绩对象或特定难度的成绩
     */
    getBestTimes(difficulty = null) {
        const defaultBestTimes = {
            beginner: null,
            intermediate: null,
            expert: null
        };
        
        const bestTimes = this.safeGetItem(this.keys.bestTimes, defaultBestTimes);
        
        // 确保返回的对象包含所有必要的键
        const completeBestTimes = { ...defaultBestTimes, ...bestTimes };
        
        if (difficulty) {
            return completeBestTimes[difficulty] || null;
        }
        
        return completeBestTimes;
    }
    
    /**
     * 保存用户设置
     * @param {Object} settings 设置对象
     * @returns {boolean} 是否保存成功
     */
    saveSettings(settings) {
        if (!settings || typeof settings !== 'object') {
            console.error('无效的设置对象：', settings);
            return false;
        }
        
        // 获取当前设置并合并
        const currentSettings = this.loadSettings();
        const mergedSettings = { ...currentSettings, ...settings };
        
        // 添加时间戳
        mergedSettings.lastUpdated = Date.now();
        
        const success = this.safeSetItem(this.keys.settings, mergedSettings);
        
        if (success) {
            console.log('用户设置已保存：', mergedSettings);
        }
        
        return success;
    }
    
    /**
     * 加载用户设置
     * @returns {Object} 用户设置对象
     */
    loadSettings() {
        const defaultSettings = {
            difficulty: 'beginner',
            customRows: 9,
            customCols: 9,
            customMines: 10,
            soundEnabled: true,
            animationsEnabled: true,
            showTimer: true,
            showMineCount: true,
            lastUpdated: null
        };
        
        const settings = this.safeGetItem(this.keys.settings, defaultSettings);
        
        // 确保返回的设置包含所有必要的键
        return { ...defaultSettings, ...settings };
    }
    
    /**
     * 保存游戏统计信息
     * @param {Object} stats 统计信息对象
     * @returns {boolean} 是否保存成功
     */
    saveGameStats(stats) {
        if (!stats || typeof stats !== 'object') {
            console.error('无效的统计信息对象：', stats);
            return false;
        }
        
        // 获取当前统计信息
        const currentStats = this.getGameStats();
        
        // 更新统计信息
        const updatedStats = {
            ...currentStats,
            totalGames: (currentStats.totalGames || 0) + 1,
            gamesWon: currentStats.gamesWon || 0,
            gamesLost: currentStats.gamesLost || 0,
            totalTime: (currentStats.totalTime || 0) + (stats.gameTime || 0),
            lastPlayed: Date.now()
        };
        
        // 根据游戏结果更新胜负统计
        if (stats.gameWon) {
            updatedStats.gamesWon++;
        } else if (stats.gameLost) {
            updatedStats.gamesLost++;
        }
        
        const success = this.safeSetItem(this.keys.gameStats, updatedStats);
        
        if (success) {
            console.log('游戏统计信息已保存：', updatedStats);
        }
        
        return success;
    }
    
    /**
     * 获取游戏统计信息
     * @returns {Object} 统计信息对象
     */
    getGameStats() {
        const defaultStats = {
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalTime: 0,
            lastPlayed: null
        };
        
        const stats = this.safeGetItem(this.keys.gameStats, defaultStats);
        
        // 确保返回的统计信息包含所有必要的键
        return { ...defaultStats, ...stats };
    }
}
// 游戏控制器类
class GameController {
    constructor() {
        this.gameBoard = null;
        this.gameTimer = new GameTimer();
        this.storageManager = new StorageManager();
        this.uiManager = null;
        
        this.currentConfig = new GameConfig(9, 9, 10, 'beginner');
        this.gameState = GameState.NOT_STARTED;
        
        // DOM元素引用
        this.elements = {
            gameBoard: document.getElementById('game-board'),
            minesCount: document.getElementById('mines-count'),
            timeDisplay: document.getElementById('time-display'),
            gameResult: document.getElementById('game-result'),
            resultText: document.getElementById('result-text'),
            newGameBtn: document.getElementById('new-game-btn'),
            applySettingsBtn: document.getElementById('apply-settings-btn'),
            customSettings: document.getElementById('custom-settings'),
            customError: document.getElementById('custom-error'),
            customRows: document.getElementById('custom-rows'),
            customCols: document.getElementById('custom-cols'),
            customMines: document.getElementById('custom-mines'),
            bestBeginner: document.getElementById('best-beginner'),
            bestIntermediate: document.getElementById('best-intermediate'),
            bestExpert: document.getElementById('best-expert')
        };
        
        // 创建UI管理器
        this.uiManager = new UIManager(
            this.elements.gameBoard,
            document.querySelector('.settings-section')
        );
        
        // 设置UI管理器的事件回调
        this.uiManager.setEventCallbacks(
            this.handleCellClick.bind(this),
            this.handleCellClick.bind(this),
            this.handleDoubleClick.bind(this)
        );
        
        // 设置计时器回调
        this.gameTimer.setOnTick((elapsedTime) => {
            this.updateTimeDisplay(elapsedTime);
        });
        
        this.init();
    }
    
    /**
     * 初始化游戏控制器
     */
    init() {
        console.log('游戏控制器初始化开始...');
        
        // 加载用户设置
        this.loadUserSettings();
        
        // 绑定事件监听器
        this.bindEventListeners();
        
        // 绑定UI管理器事件监听器
        this.uiManager.bindEventListeners();
        
        // 设置UI管理器的键盘快捷键回调
        this.uiManager.setKeyboardCallbacks({
            onNewGame: () => this.startNewGame(),
            onRestart: () => this.restartGame(),
            onPauseToggle: () => this.togglePause(),
            onDifficultyChange: (difficulty) => this.quickChangeDifficulty(difficulty)
        });
        
        // 初始化UI显示
        this.updateDisplay();
        
        // 加载并显示最佳成绩
        this.loadAndDisplayBestTimes();
        
        // 开始新游戏
        this.startNewGame();
        
        console.log('游戏控制器初始化完成');
    }
    
    /**
     * 开始新游戏
     * @param {Object} difficulty 可选的难度配置
     */
    startNewGame(difficulty = null) {
        console.log('开始新游戏，配置：', difficulty || this.currentConfig);
        
        // 如果提供了新的难度配置，更新当前配置
        if (difficulty) {
            this.currentConfig = difficulty;
        }
        
        // 重置计时器
        this.gameTimer.reset();
        
        // 创建新的游戏棋盘
        this.gameBoard = new GameBoard(
            this.currentConfig.rows,
            this.currentConfig.cols,
            this.currentConfig.mines
        );
        
        // 重置游戏状态
        this.gameState = GameState.NOT_STARTED;
        
        // 隐藏游戏结果显示
        this.uiManager.hideGameResult();
        
        // 更新显示
        this.updateDisplay();
        
        // 渲染棋盘
        this.renderBoard();
        
        console.log('新游戏创建完成');
    }
    
    /**
     * 重新开始当前游戏
     */
    restartGame() {
        console.log('重新开始游戏');
        this.startNewGame();
    }
    
    /**
     * 处理难度切换
     * @param {string} difficultyName 难度名称
     * @param {Object} customConfig 自定义配置（如果是自定义难度）
     */
    changeDifficulty(difficultyName, customConfig = null) {
        console.log('切换难度：', difficultyName, customConfig);
        
        let newConfig;
        
        if (difficultyName === 'custom' && customConfig) {
            // 验证自定义配置
            const validation = DifficultyConfig.validateCustom(
                customConfig.rows,
                customConfig.cols,
                customConfig.mines
            );
            
            if (!validation.valid) {
                console.error('无效的自定义配置：', validation.error);
                return false;
            }
            
            newConfig = new GameConfig(
                customConfig.rows,
                customConfig.cols,
                customConfig.mines,
                'custom'
            );
        } else {
            // 使用预设难度
            const config = DifficultyConfig.getConfig(difficultyName);
            newConfig = new GameConfig(config.rows, config.cols, config.mines, difficultyName);
        }
        
        // 保存设置
        this.currentConfig = newConfig;
        this.saveUserSettings();
        
        // 开始新游戏
        this.startNewGame();
        
        return true;
    }
    
    /**
     * 切换暂停状态
     */
    togglePause() {
        if (this.gameState === GameState.PLAYING) {
            this.manageGameState('pause');
        } else if (this.gameState === GameState.PAUSED) {
            this.manageGameState('resume');
        }
    }
    
    /**
     * 快速切换难度
     * @param {string} difficulty 难度名称
     */
    quickChangeDifficulty(difficulty) {
        // 更新难度选择UI
        const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${difficulty}"]`);
        if (difficultyRadio) {
            difficultyRadio.checked = true;
            this.onDifficultyChange(difficulty);
            this.applySettings();
        }
    }
    
    /**
     * 处理游戏状态管理
     * @param {string} action 操作类型：'pause', 'resume', 'stop'
     */
    manageGameState(action) {
        switch (action) {
            case 'pause':
                if (this.gameState === GameState.PLAYING) {
                    this.gameTimer.pause();
                    this.gameState = GameState.PAUSED;
                    console.log('游戏已暂停');
                }
                break;
                
            case 'resume':
                if (this.gameState === GameState.PAUSED) {
                    this.gameTimer.resume();
                    this.gameState = GameState.PLAYING;
                    console.log('游戏已恢复');
                }
                break;
                
            case 'stop':
                this.gameTimer.stop();
                this.gameState = GameState.NOT_STARTED;
                console.log('游戏已停止');
                break;
        }
        
        this.updateDisplay();
    }
    
    /**
     * 处理单元格点击
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {boolean} isRightClick 是否为右键点击
     */
    handleCellClick(row, col, isRightClick) {
        if (!this.gameBoard || this.gameBoard.isGameWon() || this.gameBoard.isGameLost()) {
            return;
        }
        
        // 如果游戏暂停，不处理点击
        if (this.gameState === GameState.PAUSED) {
            return;
        }
        
        // 如果是第一次点击且游戏未开始，启动计时器
        if (this.gameState === GameState.NOT_STARTED && !isRightClick) {
            this.gameTimer.start();
            this.gameState = GameState.PLAYING;
        }
        
        if (isRightClick) {
            // 右键点击 - 切换标记
            const result = this.gameBoard.toggleFlag(row, col);
            if (result.success) {
                this.updateCellDisplay(row, col, 'flag');
                this.updateDisplay();
            }
        } else {
            // 左键点击 - 揭示单元格
            const result = this.gameBoard.revealCell(row, col);
            if (result.success) {
                // 更新点击的单元格
                const cell = this.gameBoard.getCell(row, col);
                const animationType = cell && cell.isMine ? 'explode' : 'reveal';
                this.updateCellDisplay(row, col, animationType);
                
                // 更新自动揭示的单元格
                for (const pos of result.autoRevealed) {
                    this.updateCellDisplay(pos.row, pos.col, 'reveal');
                }
                
                // 更新游戏状态
                this.gameState = this.gameBoard.gameState;
                this.updateDisplay();
                
                // 检查游戏是否结束
                if (result.gameOver) {
                    this.handleGameEnd();
                }
            }
        }
    }
    
    /**
     * 处理双击事件
     * @param {number} row 行索引
     * @param {number} col 列索引
     */
    handleDoubleClick(row, col) {
        if (!this.gameBoard || this.gameBoard.isGameWon() || this.gameBoard.isGameLost()) {
            return;
        }
        
        // 如果游戏暂停，不处理双击
        if (this.gameState === GameState.PAUSED) {
            return;
        }
        
        const result = this.gameBoard.doubleClickReveal(row, col);
        if (result.success) {
            // 更新自动揭示的单元格
            for (const pos of result.autoRevealed) {
                this.updateCellDisplay(pos.row, pos.col, 'reveal');
            }
            
            // 更新游戏状态
            this.gameState = this.gameBoard.gameState;
            this.updateDisplay();
            
            // 检查游戏是否结束
            if (result.gameOver) {
                this.handleGameEnd();
            }
        }
    }
    
    /**
     * 处理游戏结束
     */
    handleGameEnd() {
        // 停止计时器
        this.gameTimer.stop();
        
        // 获取最终时间
        const finalTime = this.gameTimer.getElapsedTime();
        
        // 获取游戏统计信息
        const gameStats = this.gameBoard.getGameStats();
        gameStats.difficulty = this.currentConfig.difficulty;
        
        if (this.gameBoard.isGameWon()) {
            this.gameState = GameState.WON;
            
            // 保存最佳成绩（仅对预设难度）
            if (['beginner', 'intermediate', 'expert'].includes(this.currentConfig.difficulty)) {
                const isNewRecord = this.storageManager.saveBestTimes(this.currentConfig.difficulty, finalTime);
                if (isNewRecord) {
                    // 更新最佳成绩显示
                    this.loadAndDisplayBestTimes();
                }
            }
            
            // 保存游戏统计
            this.storageManager.saveGameStats({
                gameWon: true,
                gameLost: false,
                gameTime: finalTime,
                difficulty: this.currentConfig.difficulty,
                boardSize: `${this.currentConfig.rows}x${this.currentConfig.cols}`,
                mineCount: this.currentConfig.mines
            });
            
            // 使用UIManager显示游戏结果
            this.uiManager.showGameResult(true, finalTime, gameStats);
            
            // 更新所有地雷单元格显示（显示为已标记）
            this.updateAllMinesDisplay();
        } else if (this.gameBoard.isGameLost()) {
            this.gameState = GameState.LOST;
            
            // 保存游戏统计
            this.storageManager.saveGameStats({
                gameWon: false,
                gameLost: true,
                gameTime: finalTime,
                difficulty: this.currentConfig.difficulty,
                boardSize: `${this.currentConfig.rows}x${this.currentConfig.cols}`,
                mineCount: this.currentConfig.mines
            });
            
            // 使用UIManager显示游戏结果
            this.uiManager.showGameResult(false, finalTime, gameStats);
            
            // 更新所有地雷单元格显示
            this.updateAllMinesDisplay();
        }
    }
    
    /**
     * 渲染游戏棋盘
     */
    renderBoard() {
        if (!this.gameBoard) {
            return;
        }
        
        // 使用UIManager渲染棋盘
        this.uiManager.renderBoard(this.gameBoard);
        
        console.log('棋盘渲染完成');
    }
    
    /**
     * 更新单个单元格显示
     * @param {number} row 行索引
     * @param {number} col 列索引
     * @param {string} animationType 可选的动画类型
     */
    updateCellDisplay(row, col, animationType = null) {
        this.uiManager.updateCell(row, col, animationType);
    }
    
    /**
     * 更新所有地雷单元格的显示
     */
    updateAllMinesDisplay() {
        if (!this.gameBoard) return;
        
        for (let row = 0; row < this.gameBoard.rows; row++) {
            for (let col = 0; col < this.gameBoard.cols; col++) {
                const cell = this.gameBoard.getCell(row, col);
                if (cell && cell.isMine) {
                    this.updateCellDisplay(row, col);
                }
            }
        }
    }
    
    /**
     * 更新时间显示
     * @param {number} elapsedTime 已用时间（秒）
     */
    updateTimeDisplay(elapsedTime) {
        if (this.elements.timeDisplay) {
            const formattedTime = Math.min(999, Math.max(0, elapsedTime)).toString().padStart(3, '0');
            this.elements.timeDisplay.textContent = formattedTime;
        }
    }
    
    /**
     * 更新显示
     */
    updateDisplay() {
        // 获取游戏统计信息
        const remainingMines = this.gameBoard ? this.gameBoard.getRemainingMines() : this.currentConfig.mines;
        const elapsedTime = this.gameTimer.getElapsedTime();
        const gameStats = this.gameBoard ? this.gameBoard.getGameStats() : {};
        
        // 使用UIManager更新游戏统计显示
        this.uiManager.updateGameStats(elapsedTime, remainingMines, gameStats);
    }
    
    /**
     * 加载用户设置
     */
    loadUserSettings() {
        const settings = this.storageManager.loadSettings();
        
        // 应用难度设置
        if (settings.difficulty) {
            const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${settings.difficulty}"]`);
            if (difficultyRadio) {
                difficultyRadio.checked = true;
                this.onDifficultyChange(settings.difficulty);
            }
        }
        
        // 应用自定义设置
        if (settings.difficulty === 'custom') {
            if (this.elements.customRows) this.elements.customRows.value = settings.customRows || 9;
            if (this.elements.customCols) this.elements.customCols.value = settings.customCols || 9;
            if (this.elements.customMines) this.elements.customMines.value = settings.customMines || 10;
            this.validateCustomSettings();
        }
        
        console.log('用户设置已加载：', settings);
    }
    
    /**
     * 保存用户设置
     */
    saveUserSettings() {
        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'beginner';
        
        const settings = {
            difficulty: selectedDifficulty,
            customRows: parseInt(this.elements.customRows?.value) || 9,
            customCols: parseInt(this.elements.customCols?.value) || 9,
            customMines: parseInt(this.elements.customMines?.value) || 10
        };
        
        this.storageManager.saveSettings(settings);
    }
    
    /**
     * 加载并显示最佳成绩
     */
    loadAndDisplayBestTimes() {
        const bestTimes = this.storageManager.getBestTimes();
        
        // 更新最佳成绩显示
        if (this.elements.bestBeginner) {
            this.elements.bestBeginner.textContent = bestTimes.beginner ? `${bestTimes.beginner}秒` : '--';
        }
        if (this.elements.bestIntermediate) {
            this.elements.bestIntermediate.textContent = bestTimes.intermediate ? `${bestTimes.intermediate}秒` : '--';
        }
        if (this.elements.bestExpert) {
            this.elements.bestExpert.textContent = bestTimes.expert ? `${bestTimes.expert}秒` : '--';
        }
        
        console.log('最佳成绩已加载：', bestTimes);
    }
    
    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 新游戏按钮
        if (this.elements.newGameBtn) {
            this.elements.newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        // 应用设置按钮
        if (this.elements.applySettingsBtn) {
            this.elements.applySettingsBtn.addEventListener('click', () => {
                this.applySettings();
            });
        }
        
        // 难度选择变化
        const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        difficultyRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.onDifficultyChange(e.target.value);
            });
        });
        
        // 自定义参数输入变化
        [this.elements.customRows, this.elements.customCols, this.elements.customMines].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.validateCustomSettings();
                });
            }
        });
        
        console.log('事件监听器绑定完成');
    }
    
    /**
     * 难度选择变化处理
     * @param {string} difficulty 选择的难度
     */
    onDifficultyChange(difficulty) {
        if (difficulty === 'custom') {
            if (this.elements.customSettings) {
                this.elements.customSettings.classList.remove('hidden');
            }
            this.validateCustomSettings();
        } else {
            if (this.elements.customSettings) {
                this.elements.customSettings.classList.add('hidden');
            }
            if (this.elements.customError) {
                this.elements.customError.textContent = '';
            }
            
            // 应用预设难度
            const config = DifficultyConfig.getConfig(difficulty);
            this.currentConfig = new GameConfig(config.rows, config.cols, config.mines, difficulty);
        }
    }
    
    /**
     * 验证自定义设置
     */
    validateCustomSettings() {
        if (!this.elements.customRows || !this.elements.customCols || !this.elements.customMines) {
            return;
        }
        
        const rows = parseInt(this.elements.customRows.value);
        const cols = parseInt(this.elements.customCols.value);
        const mines = parseInt(this.elements.customMines.value);
        
        // 检查输入是否为有效数字
        if (isNaN(rows) || isNaN(cols) || isNaN(mines)) {
            if (this.elements.customError) {
                this.elements.customError.textContent = '请输入有效的数字';
            }
            return;
        }
        
        const validation = DifficultyConfig.validateCustom(rows, cols, mines);
        
        if (validation.valid) {
            if (this.elements.customError) {
                this.elements.customError.textContent = '';
            }
            this.currentConfig = new GameConfig(rows, cols, mines, 'custom');
            
            // 更新地雷数输入框的最大值提示
            const maxMines = Math.floor(rows * cols * DifficultyConfig.MAX_MINE_RATIO);
            this.elements.customMines.max = maxMines;
        } else {
            if (this.elements.customError) {
                this.elements.customError.textContent = validation.error;
            }
        }
    }
    
    /**
     * 应用设置
     */
    applySettings() {
        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'beginner';
        
        if (selectedDifficulty === 'custom') {
            const validation = DifficultyConfig.validateCustom(
                this.currentConfig.rows,
                this.currentConfig.cols,
                this.currentConfig.mines
            );
            
            if (!validation.valid) {
                if (this.elements.customError) {
                    this.elements.customError.textContent = validation.error;
                }
                return;
            }
        }
        
        // 保存用户设置
        this.saveUserSettings();
        
        this.startNewGame();
    }
    
    /**
     * 获取当前游戏状态
     * @returns {Object} 游戏状态信息
     */
    getGameStatus() {
        return {
            gameState: this.gameState,
            currentConfig: this.currentConfig,
            elapsedTime: this.gameTimer.getElapsedTime(),
            gameStats: this.gameBoard ? this.gameBoard.getGameStats() : null,
            timerStatus: this.gameTimer.getStatus()
        };
    }
    
    /**
     * 销毁游戏控制器，清理资源
     */
    destroy() {
        // 停止计时器
        this.gameTimer.destroy();
        
        console.log('游戏控制器已销毁');
    }
}
// 游戏主类 - 基础结构
class MinesweeperGame {
    constructor() {
        // 创建游戏控制器实例
        this.gameController = new GameController();
        
        console.log('扫雷游戏主类初始化完成');
    }
    
    /**
     * 获取游戏控制器
     * @returns {GameController} 游戏控制器实例
     */
    getController() {
        return this.gameController;
    }
    
    /**
     * 销毁游戏，清理资源
     */
    destroy() {
        if (this.gameController) {
            this.gameController.destroy();
        }
        console.log('扫雷游戏已销毁');
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，开始初始化扫雷游戏...');
    
    // 创建游戏实例
    window.minesweeperGame = new MinesweeperGame();
    
    console.log('扫雷游戏已准备就绪');
});