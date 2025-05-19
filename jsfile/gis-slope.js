import { viewer } from './initviewer.js';
let slopeEntity = null;

export function renderSlopePanel(container) {
  container.innerHTML = `
    <div>
      <button id="slope-start">选择两点分析</button>
      <button id="slope-clear" style="margin-left:10px;">清除</button>
    </div>
    <div style="margin-top:12px;color:#aaa;font-size:13px;">
      在地图上点击两点，弹窗显示坡度和坡向（演示）。
    </div>
  `;
  document.getElementById('slope-start').onclick = () => {
    if (slopeEntity) {
      viewer.entities.remove(slopeEntity);
      slopeEntity = null;
    }
    let positions = [];
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      const cartesian = viewer.scene.pickPosition(event.position);
      if (cartesian) {
        positions.push(cartesian);
        if (positions.length === 2) {
          slopeEntity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 3,
              material: Cesium.Color.GREEN
            }
          });
          // 简单坡度坡向演示
          const c1 = Cesium.Cartographic.fromCartesian(positions[0]);
          const c2 = Cesium.Cartographic.fromCartesian(positions[1]);
          const dx = Cesium.Math.toDegrees(c2.longitude - c1.longitude) * 111319.9 * Math.cos((c1.latitude + c2.latitude) / 2);
          const dy = Cesium.Math.toDegrees(c2.latitude - c1.latitude) * 111319.9;
          const dz = c2.height - c1.height;
          const distance = Math.sqrt(dx*dx + dy*dy);
          const slope = Math.atan2(dz, distance) * 180 / Math.PI;
          const aspect = Math.atan2(dx, dy) * 180 / Math.PI;
          alert(`坡度: ${slope.toFixed(2)}°\n坡向: ${aspect.toFixed(2)}°`);
          handler.destroy();
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  document.getElementById('slope-clear').onclick = () => {
    if (slopeEntity) {
      viewer.entities.remove(slopeEntity);
      slopeEntity = null;
    }
  };
} 