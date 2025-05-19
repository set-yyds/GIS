import { viewer } from './initviewer.js';

let activeShape = null;
let activeHandler = null;
let bufferEntities = [];
let coordinates = [];

export function renderBufferPanel(container) {
  container.innerHTML = `
    <!-- 样式部分已简化，建议移至外部CSS文件 -->
    <style>
.buffer-widget {
  --primary-color: #409EFF;
  --success-color: #67C23A;
  --warning-color: #E6A23C;
  --danger-color: #F56C6C;
  --text-primary: #303133;
  --text-regular: #606266;
  --border-color: #DCDFE6;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.buffer-container {
  padding: 16px;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  border-radius: 8px;
  min-width: 220px;
}

.control-section {
  margin-bottom: 16px;
}

.control-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 14px;
}

.input-field {
  width: 100%;
  padding: 10px 2px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  color: var(--text-primary);
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64,158,255,.3);
}

.btn-group {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.action-btn {
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.draw-point {
  background: var(--primary-color);
  color: white;
}

.draw-polyline {
  background: var(--success-color);
  color: white;
}

.draw-polygon {
  background: var(--warning-color);
  color: white;
}

.clear-btn {
  background: var(--danger-color);
  color: white;
}

.instructions {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  color: var(--text-regular);
  font-size: 12px;
  line-height: 1.6;
}

.instructions ul {
  margin: 8px 0 0 0;
  padding-left: 18px;
}

.instructions li {
  position: relative;
  list-style-type: none;
}

.instructions li:before {
  content: "•";
  position: absolute;
  left: -12px;
  color: var(--primary-color);
}
</style>

<div class="buffer-widget">
  <div class="buffer-container">
    <div class="control-section">
      <label class="control-label">
        缓冲半径（米）
        <input 
          id="buffer-radius" 
          type="number" 
          value="100" 
          class="input-field"
          min="10"
          step="10">
      </label>
    </div>

    <div class="btn-group">
      <button class="action-btn draw-point" data-mode="point">
        <i class="fas fa-map-marker-alt"></i>
        <span>绘制点</span>
      </button>
      <button class="action-btn draw-polyline" data-mode="polyline">
        <i class="fas fa-stream"></i>
        <span>绘制线</span>
      </button>
      <button class="action-btn draw-polygon" data-mode="polygon">
        <i class="fas fa-draw-polygon"></i>
        <span>绘制面</span>
      </button>
      <button class="action-btn clear-btn" id="buffer-clear">
        <i class="fas fa-eraser"></i>
        <span>清除全部</span>
      </button>
    </div>

    <div class="instructions">
      操作说明：
      <ul>
        <li>点击图形按钮开始绘制</li>
        <li>右键结束绘制</li>
        <li>自动生成蓝色缓冲区域</li>
      </ul>
    </div>
  </div>
</div>
  `;

  // 使用更高效的选择器并添加存在性检查
  const drawButtons = container.querySelectorAll('[data-mode]');
  const clearButton = container.querySelector('#buffer-clear');

  // 使用事件委托优化事件绑定
  container.querySelector('.btn-group').addEventListener('click', (e) => {
    const button = e.target.closest('[data-mode]');
    if (button) {
      handleDrawStart(button.dataset.mode);
    } else if (e.target.id === 'buffer-clear') {
      clearAllBuffers();
    }
  });
}

function handleDrawStart(mode) {
  // 移除activeHandler.destroy()调用，让Cesium自动管理资源
  if (activeHandler) {
    // 不再主动销毁handler，而是让Cesium自动管理
    activeHandler = null;
    coordinates = [];
  }

  // 只有当没有激活的handler时才创建新的
  if (!activeHandler) {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    
    switch(mode) {
      case 'point':
        handler.setInputAction(e => createPointBuffer(e.position), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        break;
        
      case 'polyline':
        handler.setInputAction(e => addPolyCoordinate(e.position), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(e => completePolyShape('line'), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        break;
        
      case 'polygon':
        handler.setInputAction(e => addPolyCoordinate(e.position), Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(e => completePolyShape('polygon'), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        break;
    }
    
    activeHandler = handler;
  }
}

function createPointBuffer(position) {
  const radius = getBufferRadius();
  const cartesian = getCartesian(position);
  
  if (cartesian) {
    const buffer = viewer.entities.add({
      position: cartesian,
      ellipse: {
        semiMajorAxis: radius,
        semiMinorAxis: radius,
        material: Cesium.Color.AQUA.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.DEEPSKYBLUE
      }
    });
    bufferEntities.push(buffer);
  }
}

function addPolyCoordinate(position) {
  const cartesian = getCartesian(position);
  if (!cartesian) return;

  if (!activeShape) {
    activeShape = createDynamicShape();
  }
  
  coordinates.push(cartesian);
  activeShape.polyline.positions = new Cesium.CallbackProperty(() => coordinates, false);
}

function completePolyShape(shapeType) {
  if (coordinates.length < 2) return;

  const radius = getBufferRadius();
  const positions = [...coordinates];
  
  // 生成缓冲区多边形
  const bufferPolygon = createBufferPolygon(positions, radius, shapeType);
  bufferEntities.push(bufferPolygon);
  
  // 清除临时图形
  viewer.entities.remove(activeShape);
  coordinates = [];
  activeShape = null;
  activeHandler.destroy();
  activeHandler = null;
}

function createBufferPolygon(positions, radius, type) {
  const bufferOptions = {
    polylinePositions: positions,
    width: radius * 2,
    cornerType: Cesium.CornerType.ROUND
  };

  return viewer.entities.add({
    polylineVolume: {
      positions: positions,
      shape: computeCircularShape(radius),
      material: Cesium.Color.ROYALBLUE.withAlpha(0.4),
      outline: true,
      outlineColor: Cesium.Color.STEELBLUE
    }
  });
}

function computeCircularShape(radius) {
  const shape = [];
  for (let i = 0; i < 360; i += 10) {
    const radians = Cesium.Math.toRadians(i);
    shape.push(new Cesium.Cartesian2(
      radius * Math.cos(radians),
      radius * Math.sin(radians)
    ));
  }
  return shape;
}

function createDynamicShape() {
  return viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(() => coordinates, false),
      material: Cesium.Color.YELLOW,
      width: 2
    }
  });
}

function getCartesian(position) {
  const ray = viewer.camera.getPickRay(position);
  return viewer.scene.globe.pick(ray, viewer.scene);
}

function getBufferRadius() {
  return Number(document.getElementById('buffer-radius').value) || 100;
}

function clearAllBuffers() {
  console.log('清除所有缓冲区', bufferEntities.length);
  
  if (!viewer || !viewer.entities) {
    console.error('Viewer未正确初始化');
    return;
  }
  
  bufferEntities.forEach(e => {
    if (e) {
      viewer.entities.remove(e);
    }
  });
  
  bufferEntities = [];
  
  // 重置绘制状态
  if (activeHandler) {
    activeHandler.destroy();
    activeHandler = null;
  }
  
  if (activeShape) {
    viewer.entities.remove(activeShape);
    activeShape = null;
  }
  
  coordinates = [];
}