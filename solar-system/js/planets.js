// 行星管理模块
class PlanetManager {
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.orbits = [];
        this.orbitsVisible = true; // 轨道默认可见
        this.textureManager = new TextureManager(); // 贴图管理器
        
        this.createPlanets();
    }

    createPlanets() {
        PLANETS_DATA.forEach((data, index) => {
            this.createOrbit(data);
            this.createPlanet(data);
        });
    }

    createOrbit(data) {
        // 使用线条创建轨道，更明显
        const orbitPoints = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            orbitPoints.push(new THREE.Vector3(
                Math.cos(angle) * data.distance,
                0,
                Math.sin(angle) * data.distance
            ));
        }
        
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({ 
            color: 0x888888,
            transparent: true,
            opacity: 0.5
        });
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        this.scene.add(orbit);
        this.orbits.push(orbit);
    }

    createPlanet(data) {
        // 创建行星几何体
        const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
        
        // 先创建基础材质
        const planetMaterial = new THREE.MeshStandardMaterial({ 
            color: data.color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // 异步加载贴图
        const planetKey = this.textureManager.getPlanetKey(data.name);
        this.textureManager.loadTexture(
            planetKey,
            // 成功回调
            (texture) => {
                planet.material.map = texture;
                planet.material.needsUpdate = true;
            },
            // 失败回调
            (error) => {
                console.warn(`${data.name} 贴图加载失败，使用纯色材质:`, error);
            }
        );
        
        // 创建行星容器用于旋转
        const planetContainer = new THREE.Object3D();
        planet.position.x = data.distance;
        planetContainer.add(planet);
        this.scene.add(planetContainer);

        // 为土星添加光环
        if (data.name === '土星') {
            this.addSaturnRings(planet, data.size);
        }

        const planetObj = {
            container: planetContainer,
            mesh: planet,
            data: data,
            angle: Math.random() * Math.PI * 2,
            moons: []
        };

        // 添加卫星
        this.addMoons(planet, data.name, planetObj);
        
        this.planets.push(planetObj);
    }

    addSaturnRings(planet, planetSize) {
        const ringGeometry = new THREE.RingGeometry(planetSize * 1.5, planetSize * 2.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xc9b181, 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }

    addMoons(planet, planetName, planetObj) {
        // 添加主要卫星
        if (MOONS_DATA[planetName]) {
            MOONS_DATA[planetName].forEach(moonData => {
                this.createMoon(planet, moonData, planetObj);
            });
        }

        // 添加小卫星
        if (SMALL_MOONS_CONFIG[planetName]) {
            this.createSmallMoons(planet, planetName, planetObj);
        }
    }

    createMoon(planet, moonData, planetObj) {
        const moonGeometry = new THREE.SphereGeometry(moonData.size, 16, 16);
        
        // 先创建基础材质
        const moonMaterial = new THREE.MeshStandardMaterial({ 
            color: moonData.color,
            roughness: 0.9,
            metalness: 0.1
        });
        
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        
        // 如果有贴图，异步加载
        if (moonData.hasTexture) {
            const moonKey = this.textureManager.getPlanetKey(moonData.name);
            this.textureManager.loadTexture(
                moonKey,
                // 成功回调
                (texture) => {
                    moon.material.map = texture;
                    moon.material.needsUpdate = true;
                },
                // 失败回调
                (error) => {
                    console.warn(`${moonData.name} 贴图加载失败，使用纯色材质:`, error);
                }
            );
        }
        
        const moonContainer = new THREE.Object3D();
        moon.position.x = moonData.distance;
        moonContainer.add(moon);
        moonContainer.rotation.y = Math.random() * Math.PI * 2;
        
        planet.add(moonContainer);
        
        planetObj.moons.push({
            container: moonContainer,
            mesh: moon,
            angle: Math.random() * Math.PI * 2,
            speed: moonData.speed,
            name: moonData.name,
            info: moonData.info,
            realSize: moonData.realSize,
            color: moonData.color
        });
    }

    createSmallMoons(planet, planetName, planetObj) {
        const config = SMALL_MOONS_CONFIG[planetName];
        
        for (let i = 0; i < config.count; i++) {
            const smallMoonSize = 0.15 + Math.random() * 0.25;
            const smallMoonDistance = config.baseDistance + Math.random() * config.distanceRange;
            const smallMoonSpeed = 0.02 + Math.random() * 0.08;
            
            const smallMoonGeometry = new THREE.SphereGeometry(smallMoonSize, 8, 8);
            const smallMoonMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x999999,
                roughness: 0.9,
                metalness: 0.1
            });
            const smallMoon = new THREE.Mesh(smallMoonGeometry, smallMoonMaterial);
            
            const smallMoonContainer = new THREE.Object3D();
            smallMoon.position.x = smallMoonDistance;
            smallMoonContainer.add(smallMoon);
            smallMoonContainer.rotation.y = Math.random() * Math.PI * 2;
            smallMoonContainer.rotation.x = (Math.random() - 0.5) * 0.3;
            smallMoonContainer.rotation.z = (Math.random() - 0.5) * 0.3;
            
            planet.add(smallMoonContainer);
            
            planetObj.moons.push({
                container: smallMoonContainer,
                mesh: smallMoon,
                angle: Math.random() * Math.PI * 2,
                speed: smallMoonSpeed,
                name: `${planetName}小卫星 #${i + 1}`,
                info: `${planetName}的众多小型不规则卫星之一，大多是被引力捕获的小行星。`,
                realSize: '< 10 km',
                color: 0x999999,
                isSmall: true
            });
        }
    }

    // 更新行星和卫星位置
    update(speedMultiplier, isPaused) {
        if (isPaused) return;

        this.planets.forEach(planet => {
            // 行星公转（绕太阳）
            planet.angle += planet.data.speed * speedMultiplier;
            planet.container.rotation.y = planet.angle;
            
            // 行星自转（绕自身轴心）
            const rotationSpeed = planet.data.rotationSpeed || 0.01; // 默认自转速度
            planet.mesh.rotation.y += rotationSpeed * speedMultiplier;
            
            // 卫星公转（绕行星）
            planet.moons.forEach(moon => {
                moon.angle += moon.speed * speedMultiplier;
                moon.container.rotation.y = moon.angle;
                // 卫星自转（通常与公转同步，潮汐锁定）
                moon.mesh.rotation.y += moon.speed * speedMultiplier * 0.5;
            });
        });
    }

    // 切换轨道显示
    toggleOrbits() {
        this.orbitsVisible = !this.orbitsVisible;
        this.orbits.forEach(orbit => {
            orbit.visible = this.orbitsVisible;
        });
        return this.orbitsVisible;
    }

    // 切换小卫星显示
    toggleSmallMoons() {
        let showSmallMoons = true;
        this.planets.forEach(planet => {
            planet.moons.forEach(moon => {
                if (moon.isSmall) {
                    moon.mesh.visible = !moon.mesh.visible;
                    showSmallMoons = moon.mesh.visible;
                }
            });
        });
        return showSmallMoons;
    }

    // 获取所有行星网格对象（用于射线检测）
    getAllMeshes() {
        const meshes = [];
        this.planets.forEach(planet => {
            meshes.push(planet.mesh);
            planet.moons.forEach(moon => {
                meshes.push(moon.mesh);
            });
        });
        return meshes;
    }

    // 根据网格对象查找对应的天体数据
    findCelestialBody(mesh) {
        // 查找行星
        for (const planet of this.planets) {
            if (planet.mesh === mesh) {
                return planet.data;
            }
            // 查找卫星
            for (const moon of planet.moons) {
                if (moon.mesh === mesh) {
                    return moon;
                }
            }
        }
        return null;
    }

    getPlanets() {
        return this.planets;
    }

    getOrbitsVisible() {
        return this.orbitsVisible;
    }
}