// 贴图管理器
class TextureManager {
    constructor() {
        this.loader = new THREE.TextureLoader();
        this.loadedTextures = new Map();
        
        // 贴图URL配置，包含备用链接
        this.textureUrls = {
            sun: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/sun_1024.jpg',
                'https://threejs.org/examples/textures/planets/sun_1024.jpg'
            ],
            mercury: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/mercury_1024.jpg',
                'https://threejs.org/examples/textures/planets/mercury_1024.jpg'
            ],
            venus: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/venus_1024.jpg',
                'https://threejs.org/examples/textures/planets/venus_1024.jpg'
            ],
            earth: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
                'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
            ],
            mars: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/mars_1024.jpg',
                'https://threejs.org/examples/textures/planets/mars_1024.jpg'
            ],
            jupiter: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/jupiter_1024.jpg',
                'https://threejs.org/examples/textures/planets/jupiter_1024.jpg'
            ],
            saturn: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/saturn_1024.jpg',
                'https://threejs.org/examples/textures/planets/saturn_1024.jpg'
            ],
            uranus: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/uranus_1024.jpg',
                'https://threejs.org/examples/textures/planets/uranus_1024.jpg'
            ],
            neptune: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/neptune_1024.jpg',
                'https://threejs.org/examples/textures/planets/neptune_1024.jpg'
            ],
            moon: [
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/moon_1024.jpg',
                'https://threejs.org/examples/textures/planets/moon_1024.jpg'
            ]
        };
    }

    // 加载贴图，支持备用URL
    async loadTexture(planetKey, onSuccess, onError) {
        if (this.loadedTextures.has(planetKey)) {
            const texture = this.loadedTextures.get(planetKey);
            if (onSuccess) onSuccess(texture);
            return texture;
        }

        const urls = this.textureUrls[planetKey];
        if (!urls || urls.length === 0) {
            if (onError) onError(new Error(`No texture URLs found for ${planetKey}`));
            return null;
        }

        return this.tryLoadTexture(planetKey, urls, 0, onSuccess, onError);
    }

    // 尝试从URL列表中加载贴图
    tryLoadTexture(planetKey, urls, index, onSuccess, onError) {
        if (index >= urls.length) {
            if (onError) onError(new Error(`All texture URLs failed for ${planetKey}`));
            return null;
        }

        const url = urls[index];
        console.log(`尝试加载 ${planetKey} 贴图: ${url}`);

        return this.loader.load(
            url,
            // 成功回调
            (texture) => {
                console.log(`${planetKey} 贴图加载成功: ${url}`);
                this.loadedTextures.set(planetKey, texture);
                if (onSuccess) onSuccess(texture);
            },
            // 进度回调
            undefined,
            // 失败回调
            (error) => {
                console.warn(`${planetKey} 贴图加载失败: ${url}`, error);
                // 尝试下一个URL
                this.tryLoadTexture(planetKey, urls, index + 1, onSuccess, onError);
            }
        );
    }

    // 获取行星贴图键名
    getPlanetKey(planetName) {
        const keyMap = {
            '太阳': 'sun',
            '水星': 'mercury',
            '金星': 'venus',
            '地球': 'earth',
            '火星': 'mars',
            '木星': 'jupiter',
            '土星': 'saturn',
            '天王星': 'uranus',
            '海王星': 'neptune',
            '月球': 'moon'
        };
        return keyMap[planetName] || planetName.toLowerCase();
    }

    // 预加载所有贴图
    preloadAllTextures() {
        const promises = [];
        
        Object.keys(this.textureUrls).forEach(key => {
            const promise = new Promise((resolve) => {
                this.loadTexture(key, 
                    (texture) => resolve({ key, texture, success: true }),
                    (error) => resolve({ key, error, success: false })
                );
            });
            promises.push(promise);
        });

        return Promise.all(promises);
    }
}