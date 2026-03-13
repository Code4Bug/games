// 动画和时间管理模块
class AnimationManager {
    constructor(sceneManager, planetManager) {
        this.sceneManager = sceneManager;
        this.planetManager = planetManager;
        
        // 控制变量
        this.isPaused = false;
        this.speedMultiplier = 1;
        
        // 时间模拟变量
        this.simulationTime = 0;
        
        // UI元素
        this.earthYearsDisplay = document.getElementById('earth-years');
        this.earthDaysDisplay = document.getElementById('earth-days');
        this.simulationDateDisplay = document.getElementById('simulation-date');
        this.speedValue = document.getElementById('speed-value');
        
        this.initUI();
    }

    initUI() {
        // 暂停/继续按钮
        document.getElementById('pause-btn').addEventListener('click', (e) => {
            this.isPaused = !this.isPaused;
            e.target.textContent = this.isPaused ? '继续' : '暂停';
        });

        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetSimulation();
        });

        // 轨道切换
        const orbitBtn = document.getElementById('toggle-orbits');
        // 初始化按钮文本
        orbitBtn.textContent = this.planetManager.getOrbitsVisible() ? '隐藏轨道' : '显示轨道';
        orbitBtn.addEventListener('click', (e) => {
            const showOrbits = this.planetManager.toggleOrbits();
            e.target.textContent = showOrbits ? '隐藏轨道' : '显示轨道';
        });

        // 小卫星切换
        document.getElementById('toggle-small-moons').addEventListener('click', (e) => {
            const showSmallMoons = this.planetManager.toggleSmallMoons();
            e.target.textContent = showSmallMoons ? '隐藏小卫星' : '显示小卫星';
        });

        // 速度控制
        const speedSlider = document.getElementById('speed');
        speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            this.speedValue.textContent = this.speedMultiplier.toFixed(1) + 'x';
        });
    }

    // 更新时间显示
    updateTimeDisplay() {
        const totalDays = Math.floor(this.simulationTime);
        const years = Math.floor(totalDays / TIME_CONFIG.earthYearDays);
        const remainingDays = Math.floor(totalDays % TIME_CONFIG.earthYearDays);
        
        this.earthYearsDisplay.textContent = years;
        this.earthDaysDisplay.textContent = remainingDays;
        
        // 计算当前模拟日期
        const currentDate = new Date(TIME_CONFIG.startDate);
        currentDate.setDate(currentDate.getDate() + totalDays);
        
        const dateString = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
        this.simulationDateDisplay.textContent = `当前: ${dateString}`;
    }

    // 重置模拟
    resetSimulation() {
        this.simulationTime = 0;
        this.updateTimeDisplay();
    }

    // 动画更新
    update() {
        if (!this.isPaused) {
            // 太阳自转 - 增强旋转效果
            this.sceneManager.getSun().rotation.y += 0.005; // 增加旋转速度
            this.sceneManager.getSun().rotation.x += 0.001; // 添加轻微的X轴旋转
            
            // 更新太阳动态效果
            this.sceneManager.updateSunEffects();

            // 更新模拟时间 - 基于地球自转计算天数
            // 地球自转速度对应 24小时（1天）
            // 一个完整自转 (2π) = 1天
            const dayIncrement = (TIME_CONFIG.earthRotationSpeed / (Math.PI * 2)) * this.speedMultiplier;
            this.simulationTime += dayIncrement;
            
            // 每30帧更新一次时间显示（优化性能）
            if (Math.floor(this.simulationTime * 10) % 3 === 0) {
                this.updateTimeDisplay();
            }

            // 更新行星和卫星
            this.planetManager.update(this.speedMultiplier, this.isPaused);
        }
    }

    // 获取状态
    getState() {
        return {
            isPaused: this.isPaused,
            speedMultiplier: this.speedMultiplier,
            simulationTime: this.simulationTime
        };
    }
}