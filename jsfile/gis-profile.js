import { viewer } from './initviewer.js';
let profileEntity = null;

export function renderProfilePanel(container) {
  container.innerHTML = `
    <div>
      <button id="profile-start">绘制剖面线</button>
      <button id="profile-clear" style="margin-left:10px;">清除</button>
    </div>
    <div style="margin-top:12px;color:#aaa;font-size:13px;">
      在地图上点击两点，弹窗显示采样高程（演示）。
    </div>
  `;
  document.getElementById('profile-start').onclick = () => {
    if (profileEntity) {
      viewer.entities.remove(profileEntity);
      profileEntity = null;
    }
    let positions = [];
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      const cartesian = viewer.scene.pickPosition(event.position);
      if (cartesian) {
        positions.push(cartesian);
        if (positions.length === 2) {
          profileEntity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 3,
              material: Cesium.Color.ORANGE
            }
          });
          // 简单采样高程演示
          const carto1 = Cesium.Cartographic.fromCartesian(positions[0]);
          const carto2 = Cesium.Cartographic.fromCartesian(positions[1]);
          alert(`起点高程: ${carto1.height.toFixed(2)}\n终点高程: ${carto2.height.toFixed(2)}`);
          handler.destroy();
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  document.getElementById('profile-clear').onclick = () => {
    if (profileEntity) {
      viewer.entities.remove(profileEntity);
      profileEntity = null;
    }
  };
} 