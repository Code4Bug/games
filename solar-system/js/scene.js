// 场景管理模块
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sun = null;
        this.sunLight = null;
        this.ambientLight = null;
        this.stars = null;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createStars();
        this.createSun();
    }

    createScene() {
        this.scene = new THREE.Scene();
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000
        );
        // 2.5D视角：从斜上方俯视，保持一定高度
        this.camera.position.set(0, 300, 200);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }

    createLights() {
        // 太阳光源 - 调整强度和距离
        this.sunLight = new THREE.PointLight(0xffffff, 1.5, 1200);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // 环境光 - 降低强度，让太阳更突出
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(this.ambientLight);
        
        // 添加方向光增强太阳立体感
        this.directionalLight = new THREE.DirectionalLight(0xffa500, 0.5);
        this.directionalLight.position.set(50, 50, 50);
        this.directionalLight.target.position.set(0, 0, 0);
        this.scene.add(this.directionalLight);
        this.scene.add(this.directionalLight.target);
    }

    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 4000;
            const y = (Math.random() - 0.5) * 4000;
            const z = (Math.random() - 0.5) * 4000;
            starVertices.push(x, y, z);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(20, 64, 64); // 增加细分度
        
        // 使用MeshStandardMaterial增强立体感
        const sunMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xfdb813,
            emissive: 0xfdb813,
            emissiveIntensity: 0.8,
            roughness: 1.0,
            metalness: 0.0
        });
        
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sun);
        
        // 为太阳添加专用光源以增强立体感
        const sunAmbientLight = new THREE.AmbientLight(0xffa500, 0.3);
        this.scene.add(sunAmbientLight);
        
        // 异步加载太阳贴图
        const textureManager = new TextureManager();
        textureManager.loadTexture(
            'sun',
            // 成功回调
            (texture) => {
                this.sun.material.map = texture;
                this.sun.material.emissiveMap = texture; // 使用贴图作为自发光贴图
                this.sun.material.emissiveIntensity = 0.6;
                this.sun.material.needsUpdate = true;
                console.log('太阳贴图加载成功，应用了自发光效果');
            },
            // 失败回调
            (error) => {
                console.warn('太阳贴图加载失败，使用增强的纯色材质:', error);
                // 即使没有贴图，也保持立体感
                this.sun.material.emissiveIntensity = 1.0;
            }
        );
        
        // 添加太阳光晕效果
        this.createSunGlow();
    }

    createSunGlow() {
        // 创建太阳光晕
        const glowGeometry = new THREE.SphereGeometry(22, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide // 只渲染背面，创造光晕效果
        });
        
        const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        sunGlow.name = 'sunGlow'; // 添加名称以便后续访问
        this.sun.add(sunGlow); // 添加到太阳对象中，一起旋转
        
        // 创建更大的外层光晕
        const outerGlowGeometry = new THREE.SphereGeometry(25, 32, 32);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide
        });
        
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        outerGlow.name = 'outerGlow'; // 添加名称以便后续访问
        this.sun.add(outerGlow);
    }

    // 更新太阳动态效果
    updateSunEffects() {
        if (this.sun) {
            const time = Date.now() * 0.001;
            
            // 太阳光晕脉动效果
            const sunGlow = this.sun.getObjectByName('sunGlow');
            const outerGlow = this.sun.getObjectByName('outerGlow');
            
            if (sunGlow) {
                sunGlow.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
                sunGlow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.02);
            }
            
            if (outerGlow) {
                outerGlow.material.opacity = 0.05 + Math.sin(time * 1.5) * 0.02;
                outerGlow.scale.setScalar(1 + Math.cos(time * 1.2) * 0.03);
            }
            
            // 太阳自发光强度变化
            if (this.sun.material.emissiveIntensity !== undefined) {
                this.sun.material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.1;
            }
        }
    }

    // 响应窗口大小变化
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 渲染场景
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    // 获取场景对象
    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getRenderer() {
        return this.renderer;
    }

    getSun() {
        return this.sun;
    }
}