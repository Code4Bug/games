// 控制管理模块
class ControlsManager {
    constructor(camera, renderer, sun, planetManager) {
        this.camera = camera;
        this.renderer = renderer;
        this.sun = sun;
        this.planetManager = planetManager;
        
        // 相机控制变量
        this.isDragging = false;
        this.isPanning = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.cameraRotation = { x: Math.PI / 6, y: 0 }; // 初始俯视角度
        this.cameraTarget = new THREE.Vector3(0, 0, 0); // 相机目标点
        this.cameraDistance = 360; // 相机距离
        
        // 射线检测
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        
        // UI元素
        this.tooltip = document.getElementById('tooltip');
        this.tooltipName = document.getElementById('tooltip-name');
        this.tooltipInfo = document.getElementById('tooltip-info');
        
        this.initEventListeners();
        this.updateCameraPosition();
    }

    initEventListeners() {
        const canvas = this.renderer.domElement;
        
        // 鼠标事件
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        canvas.addEventListener('wheel', this.onWheel.bind(this));
        canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
        
        // 触摸事件（移动设备支持）
        canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // 窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    onMouseMove(event) {
        if (this.isDragging || this.isPanning) {
            const deltaX = event.clientX - this.previousMousePosition.x;
            const deltaY = event.clientY - this.previousMousePosition.y;
            
            if (this.isPanning) {
                // 右键平移
                this.panCamera(deltaX, deltaY);
            } else {
                // 左键旋转
                this.rotateCamera(deltaX, deltaY);
            }
            
            this.previousMousePosition = { x: event.clientX, y: event.clientY };
        } else {
            this.handleHover(event);
        }
    }

    onMouseDown(event) {
        if (event.button === 0) { // 左键
            this.isDragging = true;
            this.renderer.domElement.style.cursor = 'grabbing';
        } else if (event.button === 2) { // 右键
            this.isPanning = true;
            this.renderer.domElement.classList.add('panning');
        }
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    onMouseUp() {
        this.isDragging = false;
        this.isPanning = false;
        this.renderer.domElement.style.cursor = 'grab';
        this.renderer.domElement.classList.remove('panning');
    }

    onContextMenu(event) {
        event.preventDefault(); // 阻止右键菜单
    }

    // 触摸事件处理
    onTouchStart(event) {
        if (event.touches.length === 1) {
            // 单指触摸 - 旋转
            this.isDragging = true;
            this.previousMousePosition = { 
                x: event.touches[0].clientX, 
                y: event.touches[0].clientY 
            };
        } else if (event.touches.length === 2) {
            // 双指触摸 - 平移
            this.isPanning = true;
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            this.previousMousePosition = { 
                x: (touch1.clientX + touch2.clientX) / 2, 
                y: (touch1.clientY + touch2.clientY) / 2 
            };
        }
        event.preventDefault();
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.isDragging) {
            // 单指旋转
            const deltaX = event.touches[0].clientX - this.previousMousePosition.x;
            const deltaY = event.touches[0].clientY - this.previousMousePosition.y;
            
            this.rotateCamera(deltaX, deltaY);
            
            this.previousMousePosition = { 
                x: event.touches[0].clientX, 
                y: event.touches[0].clientY 
            };
        } else if (event.touches.length === 2 && this.isPanning) {
            // 双指平移
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const currentX = (touch1.clientX + touch2.clientX) / 2;
            const currentY = (touch1.clientY + touch2.clientY) / 2;
            
            const deltaX = currentX - this.previousMousePosition.x;
            const deltaY = currentY - this.previousMousePosition.y;
            
            this.panCamera(deltaX, deltaY);
            
            this.previousMousePosition = { x: currentX, y: currentY };
        }
        event.preventDefault();
    }

    onTouchEnd() {
        this.isDragging = false;
        this.isPanning = false;
    }

    // 旋转相机
    rotateCamera(deltaX, deltaY) {
        this.cameraRotation.y += deltaX * 0.005;
        this.cameraRotation.x += deltaY * 0.005;
        
        // 限制垂直旋转角度，保持2.5D视角
        this.cameraRotation.x = Math.max(0.1, Math.min(Math.PI / 2.5, this.cameraRotation.x));
        
        this.updateCameraPosition();
    }

    // 平移相机
    panCamera(deltaX, deltaY) {
        const panSpeed = 0.5;
        
        // 获取相机的右向量和上向量
        const cameraRight = new THREE.Vector3();
        const cameraUp = new THREE.Vector3();
        
        this.camera.getWorldDirection(new THREE.Vector3());
        cameraRight.setFromMatrixColumn(this.camera.matrixWorld, 0);
        cameraUp.setFromMatrixColumn(this.camera.matrixWorld, 1);
        
        // 计算平移向量
        const panVector = new THREE.Vector3();
        panVector.addScaledVector(cameraRight, -deltaX * panSpeed);
        panVector.addScaledVector(cameraUp, deltaY * panSpeed);
        
        // 更新相机目标点
        this.cameraTarget.add(panVector);
        
        this.updateCameraPosition();
    }

    // 更新相机位置
    updateCameraPosition() {
        this.camera.position.x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x);
        this.camera.position.y = this.cameraTarget.y + this.cameraDistance * Math.sin(this.cameraRotation.x);
        this.camera.position.z = this.cameraTarget.z + this.cameraDistance * Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x);
        this.camera.lookAt(this.cameraTarget);
    }

    onMouseLeave() {
        this.hideTooltip();
        this.hoveredObject = null;
    }

    onWheel(event) {
        event.preventDefault();
        const zoomSpeed = 20;
        this.cameraDistance += (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        this.cameraDistance = Math.max(150, Math.min(1000, this.cameraDistance));
        
        this.updateCameraPosition();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleHover(event) {
        // 更新鼠标位置
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // 射线检测
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // 获取所有可检测的对象
        const meshes = this.planetManager.getAllMeshes();
        meshes.push(this.sun);
        
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            
            if (intersectedObject === this.sun) {
                this.hoveredObject = {
                    name: '太阳',
                    info: '太阳系的中心恒星，占据太阳系总质量的99.86%。表面温度约5,500°C，核心温度达1,500万°C。',
                    realSize: '1,392,700 km',
                    planets: 8,
                    color: 0xfdb813,
                    isSun: true
                };
            } else {
                this.hoveredObject = this.planetManager.findCelestialBody(intersectedObject);
            }

            this.renderer.domElement.classList.add('hovering');
            this.showTooltip(event, this.hoveredObject);
        } else {
            this.hoveredObject = null;
            this.hideTooltip();
            this.renderer.domElement.classList.remove('hovering');
        }
    }

    showTooltip(event, celestialBody) {
        if (!celestialBody) return;

        this.tooltip.classList.add('visible');
        this.tooltipName.innerHTML = `<span class="planet-icon" style="background-color: #${celestialBody.color.toString(16).padStart(6, '0')}"></span>${celestialBody.name}`;
        
        if (celestialBody.isSun) {
            this.tooltipInfo.innerHTML = `
                ${celestialBody.info}<br><br>
                <strong>直径：</strong>${celestialBody.realSize}<br>
                <strong>行星数：</strong>${celestialBody.planets} 颗
            `;
        } else if (celestialBody.name === '月球' || celestialBody.name.includes('卫星') || celestialBody.name.includes('卫')) {
            this.tooltipInfo.innerHTML = `
                ${celestialBody.info}<br><br>
                <strong>直径：</strong>${celestialBody.realSize}
            `;
        } else {
            this.tooltipInfo.innerHTML = `
                ${celestialBody.info}<br><br>
                <strong>直径：</strong>${celestialBody.realSize}<br>
                <strong>卫星数：</strong>${celestialBody.moons} 颗
            `;
        }
        
        this.tooltip.style.left = (event.clientX + 15) + 'px';
        this.tooltip.style.top = (event.clientY + 15) + 'px';
    }

    hideTooltip() {
        this.tooltip.classList.remove('visible');
    }

    // 更新相机位置
    updateCamera() {
        // 相机位置已在 updateCameraPosition 中处理
        // 这里保持空实现以兼容现有调用
    }

    // 重置相机位置
    resetCamera() {
        this.cameraTarget.set(0, 0, 0);
        this.cameraDistance = 360;
        this.cameraRotation = { x: Math.PI / 6, y: 0 };
        this.updateCameraPosition();
    }
}