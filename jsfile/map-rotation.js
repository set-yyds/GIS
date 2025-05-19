export class MapRotationController {
    constructor(viewer) {
      this.viewer = viewer;
      this.isRotating = false;
      this.rotationSpeed = 0.2;
      this._initController();
    }
  
    _initController() {
      // 配置场景参数
      this.viewer.scene.globe.enableLighting = true;
      this.viewer.scene.screenSpaceCameraController.enableRotate = false;
      
      // 绑定原生事件
      this._bindEvents();
    }
  
    _bindEvents() {
      this.viewer.screenSpaceEventHandler.setInputAction(() => {
        if (this.isRotating) this.stopRotation();
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  
    toggleRotation() {
      return this.isRotating ? this.stopRotation() : this.startRotation();
    }
  
    async startRotation() {
      if (!this.isRotating) {
        this.isRotating = true;
        await this._flyToGlobalView();
        this._startAnimation();
      }
      return this.isRotating;
    }
  
    stopRotation() {
      if (this.isRotating) {
        this.isRotating = false;
        cancelAnimationFrame(this.animationFrame);
      }
      return this.isRotating;
    }
  
    async _flyToGlobalView() {
        return new Promise((resolve) => {
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    0,          // 中心经度
                    0,          // 中心纬度
                    20000000    // 调整高度为2000万米（完整显示地球
                ),
                orientation: {
                    heading: Cesium.Math.toRadians(0),  // 正北方向
                    pitch: Cesium.Math.toRadians(-90),   // 垂直俯视
                    roll: 0.0
                },
                duration: 1.5,   // 缩短过渡时间
                complete: resolve
            });
        });
    }
  
    _startAnimation() {
      const rotate = () => {
        if (!this.isRotating) return;
        
        this.viewer.camera.rotateRight(
          Cesium.Math.toRadians(this.rotationSpeed)
        );
        
        this.animationFrame = requestAnimationFrame(rotate);
      };
      rotate();
    }
  }