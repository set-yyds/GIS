// 引入Viewer对象
import { viewer } from "./initviewer.js";

// 新增洪水模拟函数
function induationAnalysis(viewer, targertWaterHeight, positions, waterHeight) {
  return viewer.entities.add({
    polygon: {
      hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(positions)),
      perPositionHeight: true,
      // 使用回调函数Callback，直接设置extrudedHeight会导致闪烁
      extrudedHeight: new Cesium.CallbackProperty(function() {
        waterHeight += 0.2;
        if (waterHeight > targertWaterHeight) {
          waterHeight = targertWaterHeight;
        }
        return waterHeight;
      }, false),
      material: new Cesium.Color.fromBytes(64, 157, 253, 150),
    }
  });
}

const floodState = {
  entities: [],
  animationHandle: null,
  currentHeight: 0,
  originalTerrain: null,
  drawing: {
    handler: null,
    tempPositions: [],
    tempEntity: null,
  },
  isAnimating: false, // 新增：动画状态标志
};

// 增强版水面材质
const waterMaterial = new Cesium.Material({
  fabric: {
    type: "ProceduralWater",
    uniforms: {
      time: 0,
      frequency: 5.0, // 增加波纹密度
      animationSpeed: 0.8, // 加快动画速度
      waveAmplitude: 1.2, // 增大波纹幅度
      baseColor: new Cesium.Color(0.08, 0.25, 0.7, 0.65), // 调整基础颜色
    },
    source: `
      vec3 generateWaveNormal(vec2 uv, float time) {
        // 增加第三层波纹
        vec2 waveDir1 = vec2(1.0, 0.5);
        vec2 waveDir2 = vec2(-0.7, 0.3);
        vec2 waveDir3 = vec2(0.3, -0.9);
        
        float wave1 = sin(dot(uv*1.2, waveDir1) * 12.0 + time * 2.5);
        float wave2 = sin(dot(uv*0.8, waveDir2) * 10.0 + time * 1.8);
        float wave3 = cos(dot(uv*1.5, waveDir3) * 9.0 + time * 3.2);
        float combined = (wave1 + wave2 + wave3) * 0.4;
        
        // 改进法线计算
        vec2 gradient = vec2(
          dFdx(combined) * 0.15,
          dFdy(combined) * 0.15
        );
        
        return normalize(vec3(-gradient, 1.0));
      }

      czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);
        
        vec3 normal = generateWaveNormal(
          materialInput.st * frequency,
          time * animationSpeed
        );
        
        // 增强高光反射
        vec3 viewDir = normalize(czm_inverseView[3].xyz - materialInput.positionEC.xyz);
        vec3 reflectDir = reflect(-viewDir, normal);
        float specular = pow(max(dot(normalize(vec3(1.0)), reflectDir), 0.0), 64.0);
        
        // 动态颜色混合
        float depth = clamp(materialInput.positionMC.z / 150.0, 0.0, 1.0);
        vec3 deepColor = baseColor.rgb * 0.8;
        vec3 shallowColor = baseColor.rgb * 1.3;
        
        material.diffuse = mix(deepColor, shallowColor, 1.0 - depth);
        material.diffuse += vec3(specular * 0.4); // 增强高光
        
        // 透明度深度渐变
        material.alpha = baseColor.a * (0.6 + depth * 0.4);
        
        material.normal = normal;
        return material;
      }
    `,
  },
  translucent: true,
});

viewer.scene.postUpdate.addEventListener(() => {
  waterMaterial.uniforms.time = Date.now() / 1000;
});

export function renderFloodPanel(container) {
  container.innerHTML = `
    <div class="flood-panel">
      <div class="header">
        <h3>🌊 洪水淹没模拟系统</h3>
        <div class="status">
          <div>当前水位: <span id="current-height">0.0</span>m</div>
          <div>淹没面积: <span id="flood-area">0.00</span>km²</div>
        </div>
      </div>

      <div class="controls">
        <div class="param">
          <label>最大高度(m) <span id="max-height-value">1000</span></label>
          <input type="range" id="max-height" min="0" max="1000" value="1000" class="slider">
        </div>
        <div class="param">
          <label>上涨速度(m/s) <span id="speed-value">1.0</span></label>
          <input type="range" id="speed" min="0.1" max="10" step="0.1" value="1" class="slider">
        </div>
      </div>

      <div class="toolbar">
        <button class="btn draw" id="draw-area">🗺️ 绘制区域</button>
        <button class="btn start" id="start">▶️ 开始模拟</button>
        <button class="btn pause" id="pause" disabled>⏸️ 暂停</button>
        <button class="btn clear" id="clear">❌ 清除</button>
      </div>

      <style>
        .flood-panel {
          background: rgba(16, 24, 39, 0.95);
          border-radius: 10px;
          padding: 15px;
          color: #fff;
          width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          position: absolute;
          left: 3px;
          bottom: -120px;  /* 定位在底部上方 */
          z-index: 500;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .header h3 {
          margin: 0 0 12px 0;
          font-size: 17px;
          color: #6EDC8F;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        .status {
          background: rgba(0,0,0,0.25);
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .controls {
          margin-bottom: 12px;
        }

        .param {
          margin: 12px 0;
        }

        .param label {
          font-size: 14px;
          color: #CBD5E1;
          margin-bottom: 6px;
        }

        .slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #4F46E5;
          cursor: pointer;
        }

        .toolbar {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 15px;
        }

        .btn {
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .btn:active {
          transform: translateY(1px);
        }

        .draw { 
          background: #3B82F6; 
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        .start { 
          background: #10B981;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }
        .pause { 
          background: #F59E0B;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
        }
        .clear { 
          background: #EF4444;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
      </style>
    </div>
  `;
  // 绑定DOM元素
  const drawBtn = document.getElementById("draw-area");
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  const clearBtn = document.getElementById("clear");
  const maxHeightSlider = document.getElementById("max-height");
  const speedSlider = document.getElementById("speed");

  // 实时更新滑块显示
  maxHeightSlider.addEventListener("input", (e) => {
    document.getElementById("max-height-value").textContent = e.target.value;
  });

  speedSlider.addEventListener("input", (e) => {
    document.getElementById("speed-value").textContent = e.target.value;
  });

  // 事件监听
  drawBtn.addEventListener("click", startDrawing);
  startBtn.addEventListener("click", startFloodAnimation);
  pauseBtn.addEventListener("click", toggleFloodAnimation);
  clearBtn.addEventListener("click", clearAll);
}

// 输入验证
function validateInputs() {
  const maxHeight = getMaxHeight();
  const speed = getSpeed();

  if (maxHeight <= 0) {
    alert("最大高度必须大于0");
    return false;
  }

  if (speed <= 0) {
    alert("上升速度必须大于0");
    return false;
  }

  if (floodState.entities.length === 0) {
    alert("请先绘制至少一个淹没区域");
    return false;
  }

  return true;
}

// 绘制多边形功能
function startDrawing() {
  if (floodState.drawing.handler) return;

  floodState.drawing.handler = new Cesium.ScreenSpaceEventHandler(
    viewer.scene.canvas
  );
  floodState.drawing.tempPositions = [];

  floodState.drawing.handler.setInputAction((e) => {
    const cartesian = getCartesianPosition(e.position);
    cartesian && handleLeftClick(cartesian);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  floodState.drawing.handler.setInputAction((e) => {
    if (floodState.drawing.tempPositions.length > 0) {
      updatePreviewPolygon(getCartesianPosition(e.endPosition));
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  floodState.drawing.handler.setInputAction(() => {
    if (floodState.drawing.tempPositions.length > 2) {
      createFloodPolygon();
    }
    cleanupDrawing();
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

function handleLeftClick(cartesian) {
  floodState.drawing.tempPositions.push(cartesian);
  updatePreviewPolygon();
}

// 更新预览多边形
function updatePreviewPolygon(position) {
  if (!floodState.drawing.tempEntity) {
    floodState.drawing.tempEntity = viewer.entities.add({
      polygon: {
        hierarchy: new Cesium.CallbackProperty(
          () =>
            new Cesium.PolygonHierarchy(
              position
                ? [...floodState.drawing.tempPositions, position]
                : floodState.drawing.tempPositions
            ),
          false
        ),
        material: Cesium.Color.BLUE.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.WHITE,
      },
    });
  }
}

// 创建最终洪水多边形
function createFloodPolygon() {
  const positions = floodState.drawing.tempPositions;
  
  // 将Cartesian3坐标转换为经纬度数组
  const degreesArray = [];
  positions.forEach(pos => {
    const cartographic = Cesium.Cartographic.fromCartesian(pos);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    degreesArray.push(lon, lat);
  });
  
  // 调用induationAnalysis进行淹没分析
  const entity = induationAnalysis(
    viewer,
    getMaxHeight(),
    degreesArray,
    0 // 初始水位高度为0
  );
  
  floodState.entities.push(entity);
  updateDisplay();
  
  // 启用开始按钮
  document.getElementById("start").disabled = false;
}

// 动画控制 - 修复暂停/继续功能
function startFloodAnimation() {
  if (!validateInputs()) return;
  
  // 如果动画已暂停，恢复动画
  if (floodState.animationHandle && !floodState.isAnimating) {
    floodState.isAnimating = true;
    viewer.scene.postRender.addEventListener(updateFloodDisplay);
    updateButtonStates();
    return;
  }
  
  // 重置状态并开始新的动画
  stopFloodAnimation();
  floodState.isAnimating = true;
  floodState.lastUpdate = performance.now();
  
  // 开始洪水模拟动画
  viewer.scene.postRender.addEventListener(updateFloodDisplay);
  updateButtonStates();
}

// 切换动画状态（暂停/继续）
function toggleFloodAnimation() {
  if (!floodState.isAnimating) {
    // 继续动画
    floodState.isAnimating = true;
    viewer.scene.postRender.addEventListener(updateFloodDisplay);
    document.getElementById("pause").innerHTML = '⏸️ 暂停';
  } else {
    // 暂停动画
    floodState.isAnimating = false;
    viewer.scene.postRender.removeEventListener(updateFloodDisplay);
    document.getElementById("pause").innerHTML = '▶️ 继续';
  }
}

// 更新按钮状态
function updateButtonStates() {
  const startBtn = document.getElementById("start");
  const pauseBtn = document.getElementById("pause");
  
  startBtn.disabled = floodState.isAnimating;
  pauseBtn.disabled = !floodState.isAnimating;
  
  if (floodState.isAnimating) {
    pauseBtn.innerHTML = '⏸️ 暂停';
  } else {
    pauseBtn.innerHTML = '▶️ 继续';
  }
}

// 停止洪水动画
function stopFloodAnimation() {
  floodState.isAnimating = false;
  viewer.scene.postRender.removeEventListener(updateFloodDisplay);
  updateButtonStates();
}

// 全局定义updateFloodDisplay函数
function updateFloodDisplay() {
  if (!floodState.isAnimating) return;
  
  const now = performance.now();
  const delta = (now - (floodState.lastUpdate || now)) / 1000;
  floodState.lastUpdate = now;

  const maxHeight = getMaxHeight();
  const speed = getSpeed();

  floodState.currentHeight = Math.min(
    floodState.currentHeight + speed * delta,
    maxHeight
  );

  // 更新水面颜色
  const ratio = floodState.currentHeight / maxHeight;
  waterMaterial.uniforms.baseColor = Cesium.Color.fromHsl(
    0.6 - ratio * 0.2,
    0.8,
    0.5 + ratio * 0.3,
    0.6
  );

  // 更新显示
  document.getElementById("current-height").textContent =
    floodState.currentHeight.toFixed(1);
  document.getElementById("flood-area").textContent =
    calculateTotalArea().toFixed(2);

  // 检查是否达到最大高度
  if (floodState.currentHeight >= maxHeight) {
    stopFloodAnimation();
  }
}

// 清除所有
function clearAll() {
  stopFloodAnimation();
  floodState.entities.forEach((e) => viewer.entities.remove(e));
  floodState.entities = [];
  floodState.currentHeight = 0;
  document.getElementById("current-height").textContent = '0.0';
  document.getElementById("flood-area").textContent = '0.00';
  document.getElementById("start").disabled = floodState.entities.length === 0;
}

// 状态显示更新
// 状态显示更新
function startStatusUpdates() {
  const updateInterval = setInterval(() => {
    if (!floodState.animationHandle) {
      clearInterval(updateInterval);
      return;
    }
    updateDisplay();
  }, 500);
}

function updateDisplay() {
  document.getElementById("current-height").textContent =
    floodState.currentHeight.toFixed(1);
  document.getElementById("flood-area").textContent =
    calculateTotalArea().toFixed(2);
}

// 计算总面积
function calculateTotalArea() {
  return floodState.entities.reduce((sum, entity) => {
    try {
      const polygon = entity.entity.polygon.hierarchy.getValue();
      const area = Cesium.PolygonGeometry.computeArea(polygon.positions);
      return sum + Math.abs(area) / 1e6; // 转换为平方公里
    } catch {
      return sum;
    }
  }, 0);
}


// 辅助函数
function getCartesianPosition(screenPosition) {
  const ray = viewer.camera.getPickRay(screenPosition);
  return viewer.scene.globe.pick(ray, viewer.scene);
}

function getMaxHeight() {
  return parseFloat(document.getElementById("max-height").value) || 50;
}

function getSpeed() {
  return parseFloat(document.getElementById("speed").value) || 1;
}

function cleanupDrawing() {
  if (floodState.drawing.tempEntity) {
    viewer.entities.remove(floodState.drawing.tempEntity);
    floodState.drawing.tempEntity = null;
  }
  if (floodState.drawing.handler) {
    floodState.drawing.handler.destroy();
    floodState.drawing.handler = null;
  }
  floodState.drawing.tempPositions = [];
  floodState.drawing.isDrawing = false;
}