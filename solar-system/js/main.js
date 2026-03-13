// 主程序入口
class SolarSystemApp {
    constructor() {
        this.sceneManager = null;
        this.planetManager = null;
        this.controlsManager = null;
        this.animationManager = null;
        
        this.init();
    }

    init() {
        // 初始化场景
        this.sceneManager = new SceneManager();
        
        // 初始化行星系统
        this.planetManager = new PlanetManager(this.sceneManager.getScene());
        
        // 初始化控制系统
        this.controlsManager = new ControlsManager(
            this.sceneManager.getCamera(),
            this.sceneManager.getRenderer(),
            this.sceneManager.getSun(),
            this.planetManager
        );
        
        // 初始化动画系统
        this.animationManager = new AnimationManager(
            this.sceneManager,
            this.planetManager
        );
        
        // 开始动画循环
        this.animate();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.sceneManager.onWindowResize();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新动画
        this.animationManager.update();
        
        // 更新相机
        this.controlsManager.updateCamera();
        
        // 渲染场景
        this.sceneManager.render();
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystemApp();
});