class MazeGame {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 20;
        this.rows = 25;
        this.cols = 25;
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.exit = { x: this.cols - 2, y: this.rows - 2 };
        this.steps = 0;
        this.startTime = null;
        this.gameWon = false;
        this.solution = [];
        this.showingSolution = false;
        this.currentDifficulty = 'normal';
        this.bestTimes = this.loadBestTimes();
        this.offsetX = 0;
        this.offsetY = 0;
        
        // 初始化画布大小和难度设置
        this.setDifficulty(this.currentDifficulty);
        this.setupEventListeners();
    }

    initializeGame() {
        this.generateMaze();
        this.resetGameStats();
        this.draw();
    }

    loadBestTimes() {
        const saved = localStorage.getItem('mazeBestTimes');
        return saved ? JSON.parse(saved) : {
            easy: null,
            normal: null,
            hard: null
        };
    }

    saveBestTimes() {
        localStorage.setItem('mazeBestTimes', JSON.stringify(this.bestTimes));
        this.updateBestTimesDisplay();
    }

    updateBestTimesDisplay() {
        document.getElementById('best-easy').textContent = 
            this.bestTimes.easy ? this.formatTime(this.bestTimes.easy) : '--';
        document.getElementById('best-normal').textContent = 
            this.bestTimes.normal ? this.formatTime(this.bestTimes.normal) : '--';
        document.getElementById('best-hard').textContent = 
            this.bestTimes.hard ? this.formatTime(this.bestTimes.hard) : '--';
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    setDifficulty(difficulty, customSize = null) {
        this.currentDifficulty = difficulty;
        
        // 固定画布大小
        const canvasWidth = 600;
        const canvasHeight = 600;
        
        switch (difficulty) {
            case 'easy':
                this.rows = this.cols = 15;
                break;
            case 'normal':
                this.rows = this.cols = 25;
                break;
            case 'hard':
                this.rows = this.cols = 35;
                break;
            case 'custom':
                if (customSize && customSize >= 10 && customSize <= 50) {
                    this.rows = this.cols = customSize;
                }
                break;
        }
        
        // 计算单元格大小以满铺画布
        this.cellSize = Math.floor(Math.min(canvasWidth / this.cols, canvasHeight / this.rows));
        
        // 更新画布大小（保持固定）
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // 计算实际绘制区域的偏移量，使迷宫居中
        this.offsetX = (canvasWidth - this.cols * this.cellSize) / 2;
        this.offsetY = (canvasHeight - this.rows * this.cellSize) / 2;
        
        // 重新设置出口位置
        this.exit = { x: this.cols - 2, y: this.rows - 2 };
        
        this.initializeGame();
    }

    generateMaze() {
        // 初始化迷宫，全部为墙
        this.maze = Array(this.rows).fill().map(() => Array(this.cols).fill(1));
        
        // 使用递归回溯算法生成迷宫
        const stack = [];
        const start = { x: 1, y: 1 };
        this.maze[start.y][start.x] = 0;
        stack.push(start);
        
        const directions = [
            { x: 0, y: -2 }, // 上
            { x: 2, y: 0 },  // 右
            { x: 0, y: 2 },  // 下
            { x: -2, y: 0 }  // 左
        ];
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];
            
            // 查找未访问的邻居
            for (const dir of directions) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                
                if (newX > 0 && newX < this.cols - 1 && 
                    newY > 0 && newY < this.rows - 1 && 
                    this.maze[newY][newX] === 1) {
                    neighbors.push({ x: newX, y: newY, dir });
                }
            }
            
            if (neighbors.length > 0) {
                // 随机选择一个邻居
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // 打通当前位置到邻居的墙
                this.maze[current.y + next.dir.y / 2][current.x + next.dir.x / 2] = 0;
                this.maze[next.y][next.x] = 0;
                
                stack.push({ x: next.x, y: next.y });
            } else {
                stack.pop();
            }
        }
        
        // 确保出口是通路
        this.maze[this.exit.y][this.exit.x] = 0;
        
        // 重置玩家位置
        this.player = { x: 1, y: 1 };
        this.gameWon = false;
        this.showingSolution = false;
        this.solution = [];
    }

    resetGameStats() {
        this.steps = 0;
        this.startTime = Date.now();
        this.gameWon = false;
        document.getElementById('stepCount').textContent = '0';
        document.getElementById('gameMessage').className = 'game-result hidden';
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.gameWon) return;
            
            let moved = false;
            const newPos = { ...this.player };
            
            switch (e.key) {
                case 'ArrowUp':
                    newPos.y--;
                    moved = true;
                    break;
                case 'ArrowDown':
                    newPos.y++;
                    moved = true;
                    break;
                case 'ArrowLeft':
                    newPos.x--;
                    moved = true;
                    break;
                case 'ArrowRight':
                    newPos.x++;
                    moved = true;
                    break;
            }
            
            if (moved) {
                e.preventDefault();
                this.movePlayer(newPos);
            }
        });
        
        // 按钮事件
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.initializeGame();
        });
        
        document.getElementById('solveMazeBtn').addEventListener('click', () => {
            this.showSolution();
        });
        
        document.getElementById('hideSolutionBtn').addEventListener('click', () => {
            this.hideSolution();
        });
        
        // 难度选择
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const customSettings = document.getElementById('custom-settings');
                if (e.target.value === 'custom') {
                    customSettings.classList.remove('hidden');
                } else {
                    customSettings.classList.add('hidden');
                }
            });
        });
        
        // 应用设置按钮
        document.getElementById('apply-settings-btn').addEventListener('click', () => {
            this.applySettings();
        });
        
        // 初始化最佳成绩显示
        this.updateBestTimesDisplay();
    }

    applySettings() {
        const selectedDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
        const errorDiv = document.getElementById('custom-error');
        errorDiv.textContent = '';
        
        if (selectedDifficulty === 'custom') {
            const customSize = parseInt(document.getElementById('custom-size').value);
            
            if (isNaN(customSize) || customSize < 10 || customSize > 50) {
                errorDiv.textContent = '迷宫大小必须在10-50之间';
                return;
            }
            
            this.setDifficulty('custom', customSize);
        } else {
            this.setDifficulty(selectedDifficulty);
        }
    }

    movePlayer(newPos) {
        // 检查边界和墙壁
        if (newPos.x >= 0 && newPos.x < this.cols && 
            newPos.y >= 0 && newPos.y < this.rows && 
            this.maze[newPos.y][newPos.x] === 0) {
            
            this.player = newPos;
            this.steps++;
            document.getElementById('stepCount').textContent = this.steps;
            
            // 检查是否到达出口
            if (this.player.x === this.exit.x && this.player.y === this.exit.y) {
                this.gameWon = true;
                this.showWinMessage();
            }
            
            this.draw();
        }
    }

    showWinMessage() {
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - this.startTime) / 1000);
        
        // 检查是否创造新纪录
        const currentBest = this.bestTimes[this.currentDifficulty];
        let isNewRecord = false;
        
        if (!currentBest || totalTime < currentBest) {
            this.bestTimes[this.currentDifficulty] = totalTime;
            this.saveBestTimes();
            isNewRecord = true;
        }
        
        const message = document.getElementById('gameMessage');
        const resultText = document.getElementById('result-text');
        
        let messageText = `🎉 恭喜通关！用时 ${this.formatTime(totalTime)}，共 ${this.steps} 步`;
        if (isNewRecord) {
            messageText += ' 🏆 新纪录！';
        }
        
        resultText.textContent = messageText;
        message.className = 'game-result';
        
        // 添加脉冲动画
        this.canvas.classList.add('pulse');
        setTimeout(() => {
            this.canvas.classList.remove('pulse');
        }, 600);
    }

    showSolution() {
        this.solution = this.findSolution();
        this.showingSolution = true;
        document.getElementById('solveMazeBtn').classList.add('hidden');
        document.getElementById('hideSolutionBtn').classList.remove('hidden');
        this.draw();
    }

    hideSolution() {
        this.showingSolution = false;
        this.solution = [];
        document.getElementById('solveMazeBtn').classList.remove('hidden');
        document.getElementById('hideSolutionBtn').classList.add('hidden');
        this.draw();
    }

    findSolution() {
        // 使用A*算法寻找最短路径
        const openSet = [{ ...this.player, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = [];
        const visited = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
        
        while (openSet.length > 0) {
            // 找到f值最小的节点
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < current.f) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            openSet.splice(currentIndex, 1);
            closedSet.push(current);
            visited[current.y][current.x] = true;
            
            // 到达目标
            if (current.x === this.exit.x && current.y === this.exit.y) {
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path;
            }
            
            // 检查四个方向的邻居
            const directions = [
                { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
            ];
            
            for (const dir of directions) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                
                if (newX >= 0 && newX < this.cols && 
                    newY >= 0 && newY < this.rows && 
                    this.maze[newY][newX] === 0 && 
                    !visited[newY][newX]) {
                    
                    const g = current.g + 1;
                    const h = Math.abs(newX - this.exit.x) + Math.abs(newY - this.exit.y);
                    const f = g + h;
                    
                    const existing = openSet.find(node => node.x === newX && node.y === newY);
                    if (!existing || g < existing.g) {
                        const newNode = {
                            x: newX, y: newY, g, h, f,
                            parent: current
                        };
                        
                        if (existing) {
                            Object.assign(existing, newNode);
                        } else {
                            openSet.push(newNode);
                        }
                    }
                }
            }
        }
        
        return []; // 没有找到路径
    }

    updateTimer() {
        if (!this.gameWon && this.startTime) {
            const currentTime = Date.now();
            const elapsed = Math.floor((currentTime - this.startTime) / 1000);
            document.getElementById('timeCount').textContent = this.formatTime(elapsed);
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 填充背景
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制迷宫
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const drawX = this.offsetX + x * this.cellSize;
                const drawY = this.offsetY + y * this.cellSize;
                
                if (this.maze[y][x] === 1) {
                    // 墙壁
                    this.ctx.fillStyle = '#2d3748';
                    this.ctx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
                } else {
                    // 通路
                    this.ctx.fillStyle = '#f7fafc';
                    this.ctx.fillRect(drawX, drawY, this.cellSize, this.cellSize);
                }
            }
        }
        
        // 绘制解决方案路径
        if (this.showingSolution && this.solution.length > 1) {
            this.ctx.strokeStyle = '#48bb78';
            this.ctx.lineWidth = Math.max(2, this.cellSize / 8);
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            
            for (let i = 0; i < this.solution.length; i++) {
                const point = this.solution[i];
                const centerX = this.offsetX + point.x * this.cellSize + this.cellSize / 2;
                const centerY = this.offsetY + point.y * this.cellSize + this.cellSize / 2;
                
                if (i === 0) {
                    this.ctx.moveTo(centerX, centerY);
                } else {
                    this.ctx.lineTo(centerX, centerY);
                }
            }
            
            this.ctx.stroke();
        }
        
        // 绘制出口
        const exitDrawX = this.offsetX + this.exit.x * this.cellSize;
        const exitDrawY = this.offsetY + this.exit.y * this.cellSize;
        
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.fillRect(exitDrawX + 2, exitDrawY + 2, 
                         this.cellSize - 4, this.cellSize - 4);
        
        // 绘制出口标识
        if (this.cellSize >= 12) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${Math.max(8, this.cellSize * 0.5)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('出', exitDrawX + this.cellSize / 2, 
                             exitDrawY + this.cellSize / 2 + this.cellSize * 0.15);
        }
        
        // 绘制玩家
        const playerDrawX = this.offsetX + this.player.x * this.cellSize;
        const playerDrawY = this.offsetY + this.player.y * this.cellSize;
        
        this.ctx.fillStyle = '#3182ce';
        this.ctx.beginPath();
        this.ctx.arc(playerDrawX + this.cellSize / 2, 
                    playerDrawY + this.cellSize / 2, 
                    Math.max(3, this.cellSize / 3), 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 绘制玩家眼睛（仅在格子足够大时）
        if (this.cellSize >= 12) {
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            const eyeSize = Math.max(1, this.cellSize / 12);
            const eyeOffset = Math.max(2, this.cellSize / 8);
            this.ctx.arc(playerDrawX + this.cellSize / 2 - eyeOffset, 
                        playerDrawY + this.cellSize / 2 - eyeOffset, 
                        eyeSize, 0, 2 * Math.PI);
            this.ctx.arc(playerDrawX + this.cellSize / 2 + eyeOffset, 
                        playerDrawY + this.cellSize / 2 - eyeOffset, 
                        eyeSize, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
}

// 游戏初始化
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new MazeGame();
    
    // 定时器更新
    setInterval(() => {
        if (game) {
            game.updateTimer();
        }
    }, 1000);
});

// 防止页面滚动
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});