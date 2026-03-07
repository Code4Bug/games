// 游戏状态
const gameState = {
    type: 'addsubtract',
    mode: 'card', // 'card' 或 'exam'
    range: 20, // 难度范围：10, 20, 50, 100
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    questions: [],
    currentAnswer: null,
    examAnswers: [], // 试卷模式的答案
    startTime: null, // 开始时间
    endTime: null, // 结束时间
    timerInterval: null // 计时器间隔
};

// DOM 元素
const settingsPanel = document.getElementById('settingsPanel');
const gamePanel = document.getElementById('gamePanel');
const examPanel = document.getElementById('examPanel');
const resultPanel = document.getElementById('resultPanel');
const formulaModal = document.getElementById('formulaModal');
const formulaPanel = document.getElementById('formulaPanel');
const historyModal = document.getElementById('historyModal');

// 设置面板元素
const typeButtons = document.querySelectorAll('.btn-type');
const numberButtons = document.querySelectorAll('.btn-number');
const difficultyButtons = document.querySelectorAll('.btn-difficulty');
const modeButtons = document.querySelectorAll('.btn-mode');
const startBtn = document.getElementById('startBtn');
const showAdditionTableBtn = document.getElementById('showAdditionTable');
const showMultiplicationTableBtn = document.getElementById('showMultiplicationTable');

// 游戏面板元素
const currentQuestionEl = document.getElementById('currentQuestion');
const totalQuestionsEl = document.getElementById('totalQuestions');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const questionNumEl = document.getElementById('questionNum');
const answerInput = document.getElementById('answerInput');
const feedbackEl = document.getElementById('feedback');
const submitBtn = document.getElementById('submitBtn');
const helpBtn = document.getElementById('helpBtn');
const quitBtn = document.getElementById('quitBtn');

// 试卷模式元素
const examTotalEl = document.getElementById('examTotal');
const examQuestionsEl = document.getElementById('examQuestions');
const submitExamBtn = document.getElementById('submitExamBtn');
const quitExamBtn = document.getElementById('quitExamBtn');

// 结果面板元素
const finalScoreEl = document.getElementById('finalScore');
const correctCountEl = document.getElementById('correctCount');
const accuracyEl = document.getElementById('accuracy');
const timeUsedEl = document.getElementById('timeUsed');
const restartBtn = document.getElementById('restartBtn');

// 模态框元素
const formulaContent = document.getElementById('formulaContent');
const formulaPanelTitle = document.getElementById('formulaPanelTitle');
const formulaPanelContent = document.getElementById('formulaPanelContent');
const formulaPanelClose = document.querySelector('.formula-panel-close');
const modalClose = document.querySelector('.modal-close');
const historyContent = document.getElementById('historyContent');
const showHistoryBtn = document.getElementById('showHistory');
const closeHistoryBtn = document.getElementById('closeHistory');
const clearHistoryBtn = document.getElementById('clearHistory');

// 初始化事件监听
function initEventListeners() {
    // 题目类型选择
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.type = btn.dataset.type;
        });
    });
    
    // 题目数量选择
    numberButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            numberButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.totalQuestions = parseInt(btn.dataset.count);
        });
    });
    
    // 难度范围选择
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.range = parseInt(btn.dataset.range);
        });
    });
    
    // 模式选择
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.mode = btn.dataset.mode;
        });
    });
    
    // 开始游戏
    startBtn.addEventListener('click', startGame);
    
    // 卡片模式 - 提交答案
    submitBtn.addEventListener('click', submitAnswer);
    
    // 卡片模式 - 回车提交
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
    
    // 卡片模式 - 帮助按钮
    helpBtn.addEventListener('click', showHelp);
    
    // 卡片模式 - 退出游戏
    quitBtn.addEventListener('click', quitGame);
    
    // 试卷模式 - 提交试卷
    submitExamBtn.addEventListener('click', submitExam);
    
    // 试卷模式 - 退出游戏
    quitExamBtn.addEventListener('click', quitGame);
    
    // 重新开始
    restartBtn.addEventListener('click', () => {
        resultPanel.classList.add('hidden');
        settingsPanel.classList.remove('hidden');
    });
    
    // 显示口诀表
    showAdditionTableBtn.addEventListener('click', () => showFormulaTable('addition'));
    showMultiplicationTableBtn.addEventListener('click', () => showFormulaTable('multiplication'));
    
    // 关闭口诀表面板
    formulaPanelClose.addEventListener('click', () => formulaPanel.classList.add('hidden'));
    
    // 关闭口诀表模态框
    modalClose.addEventListener('click', () => formulaModal.classList.add('hidden'));
    formulaModal.addEventListener('click', (e) => {
        if (e.target === formulaModal) formulaModal.classList.add('hidden');
    });
    
    // 历史记录
    showHistoryBtn.addEventListener('click', showHistory);
    closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // 点击遮罩关闭历史记录抽屉
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) historyModal.classList.add('hidden');
    });
}

// 生成题目
function generateQuestion(type) {
    let num1, num2, operator, answer;
    const range = gameState.range;
    
    if (type === 'mixed') {
        const types = ['addsubtract', 'multiplication'];
        type = types[Math.floor(Math.random() * types.length)];
    }
    
    if (type === 'addsubtract') {
        // 随机选择加法或减法
        const isAddition = Math.random() < 0.5;
        
        if (isAddition) {
            // 加法：结果不超过设定范围
            num1 = Math.floor(Math.random() * (range - 1)) + 1;
            num2 = Math.floor(Math.random() * (range - num1)) + 1;
            operator = '+';
            answer = num1 + num2;
        } else {
            // 减法：被减数不超过设定范围，结果为正数
            num1 = Math.floor(Math.random() * (range - 1)) + 2;
            num2 = Math.floor(Math.random() * num1) + 1;
            operator = '-';
            answer = num1 - num2;
        }
    } else if (type === 'multiplication') {
        // 乘法：根据范围调整
        let maxFactor;
        if (range <= 10) {
            maxFactor = 3; // 3以内的乘法
        } else if (range <= 20) {
            maxFactor = 5; // 5以内的乘法
        } else if (range <= 50) {
            maxFactor = 7; // 7以内的乘法
        } else {
            maxFactor = 9; // 九九乘法表
        }
        
        num1 = Math.floor(Math.random() * maxFactor) + 1;
        num2 = Math.floor(Math.random() * maxFactor) + 1;
        operator = '×';
        answer = num1 * num2;
    }
    
    return { num1, num2, operator, answer, type };
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctCount = 0;
    gameState.questions = [];
    gameState.examAnswers = [];
    gameState.startTime = Date.now();
    gameState.endTime = null;
    
    // 清除之前的计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // 生成所有题目
    for (let i = 0; i < gameState.totalQuestions; i++) {
        gameState.questions.push(generateQuestion(gameState.type));
    }
    
    // 切换到对应模式的面板
    settingsPanel.classList.add('hidden');
    
    if (gameState.mode === 'card') {
        gamePanel.classList.remove('hidden');
        startTimer();
        showQuestion();
    } else {
        examPanel.classList.remove('hidden');
        startTimer();
        showExamQuestions();
    }
}

// 启动计时器
function startTimer() {
    updateTimer();
    gameState.timerInterval = setInterval(updateTimer, 1000);
}

// 更新计时器显示
function updateTimer() {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (timerEl) {
        timerEl.textContent = timeStr;
    }
    
    const examTimerEl = document.getElementById('examTimer');
    if (examTimerEl) {
        examTimerEl.textContent = timeStr;
    }
}

// 停止计时器
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    gameState.endTime = Date.now();
}

// 格式化时间
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
        return `${minutes}分${seconds}秒`;
    } else {
        return `${seconds}秒`;
    }
}

// 显示题目（卡片模式）
function showQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    gameState.currentAnswer = question.answer;
    
    // 更新UI
    currentQuestionEl.textContent = gameState.currentQuestion + 1;
    questionNumEl.textContent = gameState.currentQuestion + 1;
    totalQuestionsEl.textContent = gameState.totalQuestions;
    scoreEl.textContent = gameState.score;
    questionEl.textContent = `${question.num1} ${question.operator} ${question.num2} = `;
    answerInput.value = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    
    // 聚焦输入框
    answerInput.focus();
}

// 提交答案（卡片模式）
function submitAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        feedbackEl.textContent = '请输入数字！';
        feedbackEl.className = 'feedback incorrect';
        return;
    }
    
    if (userAnswer === gameState.currentAnswer) {
        // 答对了
        gameState.score += 10;
        gameState.correctCount++;
        feedbackEl.innerHTML = '太棒了！<span style="font-size: 1.8rem;">✨</span>';
        feedbackEl.className = 'feedback correct';
    } else {
        // 答错了
        feedbackEl.textContent = `不对哦，正确答案是 ${gameState.currentAnswer}`;
        feedbackEl.className = 'feedback incorrect';
    }
    
    // 更新分数显示
    scoreEl.textContent = gameState.score;
    
    // 1.5秒后显示下一题或结束游戏
    setTimeout(() => {
        gameState.currentQuestion++;
        
        if (gameState.currentQuestion < gameState.totalQuestions) {
            showQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

// 显示帮助（显示答案）
function showHelp() {
    feedbackEl.innerHTML = `答案是 ${gameState.currentAnswer} <span style="font-size: 1.6rem;">💡</span>`;
    feedbackEl.className = 'feedback';
    feedbackEl.style.color = '#F97316';
}

// 退出游戏
function quitGame() {
    customDialog.confirm('确定要退出游戏吗？', '退出确认').then(confirmed => {
        if (confirmed) {
            stopTimer();
            gamePanel.classList.add('hidden');
            examPanel.classList.add('hidden');
            settingsPanel.classList.remove('hidden');
        }
    });
}

// 显示试卷所有题目
function showExamQuestions() {
    examTotalEl.textContent = gameState.totalQuestions;
    examQuestionsEl.innerHTML = '';
    
    gameState.questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'exam-question-item';
        questionItem.innerHTML = `
            <div class="exam-question-num">${index + 1}</div>
            <div class="exam-question-text">${question.num1} ${question.operator} ${question.num2} = </div>
            <input type="number" class="exam-answer-input" data-index="${index}" placeholder="?">
            <button class="btn-show-answer" data-index="${index}" data-answer="${question.answer}">
                <svg style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
                显示答案
            </button>
        `;
        examQuestionsEl.appendChild(questionItem);
    });
    
    // 为每个"显示答案"按钮添加事件监听
    document.querySelectorAll('.btn-show-answer').forEach(btn => {
        btn.addEventListener('click', function() {
            const answer = this.dataset.answer;
            const index = this.dataset.index;
            const answerDisplay = this.parentElement.querySelector('.exam-answer-display');
            
            if (answerDisplay) {
                // 如果答案已显示，则隐藏
                answerDisplay.remove();
                this.innerHTML = `
                    <svg style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    显示答案
                `;
            } else {
                // 显示答案
                const answerEl = document.createElement('div');
                answerEl.className = 'exam-answer-display';
                answerEl.textContent = answer;
                this.parentElement.appendChild(answerEl);
                
                this.innerHTML = `
                    <svg style="width: 16px; height: 16px; display: inline; vertical-align: middle; margin-right: 4px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                    隐藏答案
                `;
            }
        });
    });
}

// 提交试卷
function submitExam() {
    // 收集所有答案
    const inputs = document.querySelectorAll('.exam-answer-input');
    gameState.examAnswers = [];
    gameState.correctCount = 0;
    gameState.score = 0;
    
    inputs.forEach((input, index) => {
        const userAnswer = parseInt(input.value);
        const correctAnswer = gameState.questions[index].answer;
        
        gameState.examAnswers.push(userAnswer);
        
        if (userAnswer === correctAnswer) {
            gameState.correctCount++;
            gameState.score += 10;
        }
    });
    
    // 显示结果
    endGame();
}

// 结束游戏
function endGame() {
    stopTimer();
    
    gamePanel.classList.add('hidden');
    examPanel.classList.add('hidden');
    resultPanel.classList.remove('hidden');
    
    // 计算正确率和用时
    const accuracy = Math.round((gameState.correctCount / gameState.totalQuestions) * 100);
    const timeUsed = gameState.endTime - gameState.startTime;
    
    // 显示结果
    finalScoreEl.textContent = gameState.score;
    correctCountEl.textContent = gameState.correctCount;
    accuracyEl.textContent = accuracy + '%';
    timeUsedEl.textContent = formatTime(timeUsed);
    
    // 根据正确率显示不同的标题
    const resultTitle = document.getElementById('resultTitle');
    if (accuracy >= 90) {
        resultTitle.textContent = '太棒了！你真是数学天才！';
    } else if (accuracy >= 70) {
        resultTitle.textContent = '很不错！继续加油！';
    } else if (accuracy >= 50) {
        resultTitle.textContent = '还不错！再练习会更好！';
    } else {
        resultTitle.textContent = '加油！多练习就会进步！';
    }
    
    // 保存历史记录
    saveHistory(accuracy, timeUsed);
}

// 保存历史记录到 localStorage
function saveHistory(accuracy, timeUsed) {
    const history = getHistory();
    
    const record = {
        date: new Date().toISOString(),
        type: getTypeLabel(gameState.type),
        mode: gameState.mode === 'card' ? '卡片模式' : '试卷模式',
        range: gameState.range + '以内',
        totalQuestions: gameState.totalQuestions,
        correctCount: gameState.correctCount,
        score: gameState.score,
        accuracy: accuracy,
        timeUsed: timeUsed
    };
    
    history.unshift(record); // 添加到开头
    
    // 只保留最近 50 条记录
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('mathGameHistory', JSON.stringify(history));
}

// 获取历史记录
function getHistory() {
    const historyStr = localStorage.getItem('mathGameHistory');
    return historyStr ? JSON.parse(historyStr) : [];
}

// 获取类型标签
function getTypeLabel(type) {
    const labels = {
        'addsubtract': '加减法',
        'multiplication': '乘法',
        'mixed': '全部混合'
    };
    return labels[type] || type;
}

// 显示历史记录
function showHistory() {
    const history = getHistory();
    
    if (history.length === 0) {
        historyContent.innerHTML = `
            <div class="history-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <p>还没有历史记录哦</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">快去做题吧！</p>
            </div>
        `;
    } else {
        let html = '';
        
        history.forEach((record, index) => {
            const date = new Date(record.date);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            // 根据正确率设置徽章
            let badgeClass = 'needs-practice';
            let badgeText = '需要加油';
            if (record.accuracy >= 90) {
                badgeClass = 'excellent';
                badgeText = '优秀';
            } else if (record.accuracy >= 70) {
                badgeClass = 'good';
                badgeText = '良好';
            } else if (record.accuracy >= 50) {
                badgeClass = 'fair';
                badgeText = '及格';
            }
            
            html += `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-date">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${dateStr}
                        </div>
                        <div class="history-badge ${badgeClass}">
                            ${badgeText}
                        </div>
                    </div>
                    <div class="history-stats">
                        <div class="history-stat type">
                            <div class="history-stat-icon">📚</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">类型</div>
                                <div class="history-stat-value">${record.type}</div>
                            </div>
                        </div>
                        <div class="history-stat difficulty">
                            <div class="history-stat-icon">⚡</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">难度</div>
                                <div class="history-stat-value">${record.range}</div>
                            </div>
                        </div>
                        <div class="history-stat mode">
                            <div class="history-stat-icon">🎯</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">模式</div>
                                <div class="history-stat-value">${record.mode}</div>
                            </div>
                        </div>
                        <div class="history-stat questions">
                            <div class="history-stat-icon">📝</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">题数</div>
                                <div class="history-stat-value">${record.totalQuestions} 题</div>
                            </div>
                        </div>
                        <div class="history-stat score">
                            <div class="history-stat-icon">⭐</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">得分</div>
                                <div class="history-stat-value">${record.score}</div>
                            </div>
                        </div>
                        <div class="history-stat correct">
                            <div class="history-stat-icon">✅</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">答对</div>
                                <div class="history-stat-value">${record.correctCount} 题</div>
                            </div>
                        </div>
                        <div class="history-stat accuracy">
                            <div class="history-stat-icon">🎯</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">正确率</div>
                                <div class="history-stat-value">${record.accuracy}%</div>
                            </div>
                        </div>
                        <div class="history-stat time">
                            <div class="history-stat-icon">⏱️</div>
                            <div class="history-stat-info">
                                <div class="history-stat-label">用时</div>
                                <div class="history-stat-value">${formatTime(record.timeUsed)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        historyContent.innerHTML = html;
    }
    
    historyModal.classList.remove('hidden');
}

// 清空历史记录
function clearHistory() {
    customDialog.confirm('确定要清空所有历史记录吗？', '清空确认').then(confirmed => {
        if (confirmed) {
            localStorage.removeItem('mathGameHistory');
            showHistory(); // 刷新显示
        }
    });
}

// 显示口诀表（阶梯矩阵方式）
function showFormulaTable(type) {
    let html = '';
    let title = '';
    
    if (type === 'addition') {
        title = `
            <svg style="width: 28px; height: 28px; display: inline; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            加法口诀表
        `;
        
        html = '<div class="formula-matrix">';
        
        // 生成阶梯矩阵 - 加法表（1+1 到 10+10，每行递增）
        for (let i = 1; i <= 10; i++) {
            html += '<div class="formula-row">';
            for (let j = 1; j <= i; j++) {
                const sum = i + j;
                if (sum <= 20) {
                    html += `<div class="formula-cell">${j} + ${i} = ${sum}</div>`;
                }
            }
            html += '</div>';
        }
        
        html += '</div>';
    } else if (type === 'multiplication') {
        title = `
            <svg style="width: 28px; height: 28px; display: inline; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            乘法口诀表
        `;
        
        html = '<div class="formula-matrix">';
        
        // 生成阶梯矩阵 - 九九乘法表
        for (let i = 1; i <= 9; i++) {
            html += '<div class="formula-row">';
            for (let j = 1; j <= i; j++) {
                html += `<div class="formula-cell">${j} × ${i} = ${j * i}</div>`;
            }
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    formulaPanelTitle.innerHTML = title;
    formulaPanelContent.innerHTML = html;
    formulaPanel.classList.remove('hidden');
}

// 初始化
initEventListeners();

// 自定义弹窗系统
const customDialog = {
    element: document.getElementById('customDialog'),
    
    // 显示弹窗
    show(options) {
        const {
            type = 'info', // info, success, warning, error
            title = '提示',
            message = '',
            icon = '',
            buttons = []
        } = options;
        
        // 设置图标
        const iconEl = this.element.querySelector('.custom-dialog-icon');
        iconEl.className = `custom-dialog-icon ${type}`;
        iconEl.textContent = icon || this.getDefaultIcon(type);
        
        // 设置标题和消息
        this.element.querySelector('.custom-dialog-title').textContent = title;
        this.element.querySelector('.custom-dialog-message').textContent = message;
        
        // 设置按钮
        const buttonsEl = this.element.querySelector('.custom-dialog-buttons');
        buttonsEl.innerHTML = '';
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `custom-dialog-btn ${btn.type || 'secondary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                this.hide();
                if (btn.onClick) btn.onClick();
            };
            buttonsEl.appendChild(button);
        });
        
        // 显示弹窗
        this.element.classList.remove('hidden');
    },
    
    // 隐藏弹窗
    hide() {
        this.element.classList.add('hidden');
    },
    
    // 获取默认图标
    getDefaultIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || 'ℹ️';
    },
    
    // Alert 替代
    alert(message, title = '提示') {
        return new Promise(resolve => {
            this.show({
                type: 'info',
                title,
                message,
                buttons: [
                    {
                        text: '确定',
                        type: 'primary',
                        onClick: resolve
                    }
                ]
            });
        });
    },
    
    // Confirm 替代
    confirm(message, title = '确认') {
        return new Promise(resolve => {
            this.show({
                type: 'warning',
                title,
                message,
                buttons: [
                    {
                        text: '取消',
                        type: 'secondary',
                        onClick: () => resolve(false)
                    },
                    {
                        text: '确定',
                        type: 'danger',
                        onClick: () => resolve(true)
                    }
                ]
            });
        });
    },
    
    // 成功提示
    success(message, title = '成功') {
        return new Promise(resolve => {
            this.show({
                type: 'success',
                title,
                message,
                buttons: [
                    {
                        text: '好的',
                        type: 'success',
                        onClick: resolve
                    }
                ]
            });
        });
    },
    
    // 错误提示
    error(message, title = '错误') {
        return new Promise(resolve => {
            this.show({
                type: 'error',
                title,
                message,
                buttons: [
                    {
                        text: '知道了',
                        type: 'danger',
                        onClick: resolve
                    }
                ]
            });
        });
    }
};
