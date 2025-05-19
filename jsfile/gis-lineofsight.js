import { viewer } from './initviewer.js';
let sightEntity = null;

export function renderLineOfSightPanel(container) {
  container.innerHTML = `
    <div>
      <button id="lineofsight-start">选择两点通视</button>
      <button id="lineofsight-clear" style="margin-left:10px;">清除</button>
    </div>
    <div style="margin-top:12px;color:#aaa;font-size:13px;">
      在地图上依次点击起点和终点，显示通视直线。
    </div>
  `;
  document.getElementById('lineofsight-start').onclick = () => {
    if (sightEntity) {
      viewer.entities.remove(sightEntity);
      sightEntity = null;
    }
    let positions = [];
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      const cartesian = viewer.scene.pickPosition(event.position);
      if (cartesian) {
        positions.push(cartesian);
        if (positions.length === 2) {
          sightEntity = viewer.entities.add({
            polyline: {
              positions: positions,
              width: 4,
              material: Cesium.Color.LIME.withAlpha(0.8)
            }
          });
          handler.destroy();
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  document.getElementById('lineofsight-clear').onclick = () => {
    if (sightEntity) {
      viewer.entities.remove(sightEntity);
      sightEntity = null;
    }
  };
} 