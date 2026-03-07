# Tetris 游戏实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 /Tetris 目录下实现一个现代简约风格的俄罗斯方块游戏

**Architecture:** Canvas + 面向对象架构，使用 Game、Board、Tetromino、Renderer、ScoreManager、InputHandler 六个核心类协同工作，通过 requestAnimationFrame 实现流畅渲染

**Tech Stack:** HTML5 Canvas, 原生 JavaScript (ES6+), CSS3

---

## Task 1: 创建项目基础结构

**Files:**
- Create: `Tetris/index.html`
- Create: `Tetris/styles.css`
- Create: `Tetris/main.js`

**Step 1: 创建 HTML 基础结构**

创建 `Tetris/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>俄罗斯方块</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="background-animation">
        <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
        </div>
    </div>

    <div class="game-container">
        <div class="game-board-section">
            <div class="game-header">
                <h1>🎮 俄罗斯方块</h1>
                <div class="game-stats">
                    <div class="stat-item">
                        <span class="stat-label">分数</span>
                        <span id="score" class="stat-value">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">等级</span>
                        <span id="level" class="stat-value">1</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">行数</span>
                        <span id="lines" class="stat-value">0</span>
                    </div>
                </div>
            </div>

            <canvas id="gameCanvas" width="300" height="600"></canvas>

            <div class="game-controls">
                <button id="newGameBtn" class="btn btn-primary">新游戏</button>
                <button id="pauseBtn" class="btn btn-secondary">暂停</button>
            </div>

            <div id="gameMessage" class="game-message hidden"></div>
        </div>

        <div class="settings-section">
            <div class="preview-panel">
                <h2>下一个</h2>
                <canvas id="nextCanvas" width="120" height="120"></canvas>
            </div>

            <div class="hold-panel">
                <h2>暂存</h2>
                <canvas id="holdCanvas" width="120" height="120"></canvas>
            </div>

            <div class="difficulty-panel">
                <h2>难度设置</h2>
                <div class="difficulty-options">
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="easy" checked>
                        <span>简单</span>
                    </label>
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="normal">
                        <span>普通</span>
                    </label>
                    <label class="difficulty-option">
                        <input type="radio" name="difficulty" value="hard">
                        <span>困难</span>
                    </label>
                </div>
            </div>

            <div class="best-scores-panel">
                <h2>最佳成绩</h2>
                <div class="best-scores">
                    <div class="score-item">
                        <span class="difficulty-name">简单:</span>
                        <span id="best-easy" class="best-score">--</span>
                    </div>
                    <div class="score-item">
                        <span class="difficulty-name">普通:</span>
                        <span id="best-normal" class="best-score">--</span>
                    </div>
                    <div class="score-item">
                        <span class="difficulty-name">困难:</span>
                        <span id="best-hard" class="best-score">--</span>
                    </div>
                </div>
            </div>

            <div class="instructions-panel">
                <h2>操作说明</h2>
                <ul class="instructions-list">
                    <li>← → 左右移动</li>
                    <li>↑ 旋转方块</li>
                    <li>↓ 加速下落</li>
                    <li>空格 瞬间落地</li>
                    <li>C 暂存方块</li>
                </ul>
            </div>
        </div>
    </div>

    <script src="main.js"></script>
</body>
</html>
```

**Step 2: 创建基础 CSS 样式**

创建 `Tetris/styles.css` (第1部分，共50行):

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #1a1a2e;
    color: #ffffff;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.background-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
}

.floating-shapes {
    position: relative;
    width: 100%;
    height: 100%;
}

.shape {
    position: absolute;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1));
    border-radius: 50%;
    animation: float 20s infinite ease-in-out;
}

.shape-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.shape-2 {
    width: 200px;
    height: 200px;
```

**Step 3: 创建空的 JavaScript 文件**

创建 `Tetris/main.js`:

```javascript
// Tetris Game - Main Entry Point
console.log('Tetris game loaded');
```

**Step 4: 在浏览器中验证基础结构**

打开 `Tetris/index.html` 在浏览器中查看，应该看到基本的页面结构和布局。

**Step 5: 提交基础结构**

```bash
git add Tetris/
git commit -m "feat(tetris): add basic project structure with HTML layout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 完善 CSS 样式

**Files:**
- Modify: `Tetris/styles.css`

**Step 1: 添加完整的 CSS 样式**

在 `Tetris/styles.css` 中添加完整样式(替换现有内容):

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #1a1a2e;
    color: #ffffff;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.background-animation {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
}

.floating-shapes {
    position: relative;
    width: 100%;
    height: 100%;
}

.shape {
    position: absolute;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1));
    border-radius: 50%;
    animation: float 20s infinite ease-in-out;
}

.shape-1 {
    width: 300px;
    height: 300px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.shape-2 {
    width: 200px;
    height: 200px;
    top: 60%;
    right: 15%;
    animation-delay: 5s;
}

.shape-3 {
    width: 250px;
    height: 250px;
    bottom: 10%;
    left: 50%;
    animation-delay: 10s;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(30px, -30px) rotate(90deg); }
    50% { transform: translate(-20px, 20px) rotate(180deg); }
    75% { transform: translate(20px, 30px) rotate(270deg); }
}

.game-container {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 30px;
    padding: 20px;
    max-width: 1200px;
}

.game-board-section {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.game-header {
    text-align: center;
    margin-bottom: 20px;
}

.game-header h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    background: linear-gradient(135deg, #a855f7, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.game-stats {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 15px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 5px;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ffffff;
}

#gameCanvas {
    display: block;
    border: 3px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    margin: 0 auto 20px;
}

.game-controls {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.btn {
    padding: 12px 30px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4);
}

.btn-secondary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
}

.btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.game-message {
    text-align: center;
    margin-top: 20px;
    padding: 15px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.2);
    font-size: 1.2rem;
    font-weight: bold;
}

.game-message.hidden {
    display: none;
}

.settings-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.preview-panel,
.hold-panel,
.difficulty-panel,
.best-scores-panel,
.instructions-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.preview-panel h2,
.hold-panel h2,
.difficulty-panel h2,
.best-scores-panel h2,
.instructions-panel h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
    color: rgba(255, 255, 255, 0.9);
}

#nextCanvas,
#holdCanvas {
    display: block;
    margin: 0 auto;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.3);
}

.difficulty-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.difficulty-option {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.difficulty-option:hover {
    background: rgba(255, 255, 255, 0.1);
}

.difficulty-option input[type="radio"] {
    margin-right: 10px;
}

.best-scores {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.score-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.difficulty-name {
    color: rgba(255, 255, 255, 0.7);
}

.best-score {
    font-weight: bold;
    color: #ffd700;
}

.instructions-list {
    list-style: none;
    padding: 0;
}

.instructions-list li {
    padding: 8px 0;
    color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.instructions-list li:last-child {
    border-bottom: none;
}
```

**Step 2: 在浏览器中验证样式**

刷新浏览器，应该看到完整的现代简约风格界面。

**Step 3: 提交样式**

```bash
git add Tetris/styles.css
git commit -m "style(tetris): add complete CSS styling with modern design

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: 实现 Tetromino 方块类

**Files:**
- Modify: `Tetris/main.js`

**Step 1: 定义方块形状和颜色常量**

在 `Tetris/main.js` 开头添加:

```javascript
// 方块形状定义 (使用 SRS - Super Rotation System)
const SHAPES = {
    I: [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
        [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
        [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
        [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ],
    O: [
        [[1,1], [1,1]],
        [[1,1], [1,1]],
        [[1,1], [1,1]],
        [[1,1], [1,1]]
    ],
    T: [
        [[0,1,0], [1,1,1], [0,0,0]],
        [[0,1,0], [0,1,1], [0,1,0]],
        [[0,0,0], [1,1,1], [0,1,0]],
        [[0,1,0], [1,1,0], [0,1,0]]
    ],
    S: [
        [[0,1,1], [1,1,0], [0,0,0]],
        [[0,1,0], [0,1,1], [0,0,1]],
        [[0,0,0], [0,1,1], [1,1,0]],
        [[1,0,0], [1,1,0], [0,1,0]]
    ],
    Z: [
        [[1,1,0], [0,1,1], [0,0,0]],
        [[0,0,1], [0,1,1], [0,1,0]],
        [[0,0,0], [1,1,0], [0,1,1]],
        [[0,1,0], [1,1,0], [1,0,0]]
    ],
    J: [
        [[1,0,0], [1,1,1], [0,0,0]],
        [[0,1,1], [0,1,0], [0,1,0]],
        [[0,0,0], [1,1,1], [0,0,1]],
        [[0,1,0], [0,1,0], [1,1,0]]
    ],
    L: [
        [[0,0,1], [1,1,1], [0,0,0]],
        [[0,1,0], [0,1,0], [0,1,1]],
        [[0,0,0], [1,1,1], [1,0,0]],
        [[1,1,0], [0,1,0], [0,1,0]]
    ]
};

// 方块颜色 (渐变色)
const COLORS = {
    I: { start: '#00d4ff', end: '#0099cc' },
    O: { start: '#ffd700', end: '#ffaa00' },
    T: { start: '#a855f7', end: '#7c3aed' },
    S: { start: '#22c55e', end: '#16a34a' },
    Z: { start: '#ef4444', end: '#dc2626' },
    J: { start: '#3b82f6', end: '#2563eb' },
    L: { start: '#f97316', end: '#ea580c' }
};

const SHAPE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
```

**Step 2: 实现 Tetromino 类**

