import { viewer } from './initviewer.js';
let skylineEntity = null;

export function renderSkylinePanel(container) {
  container.innerHTML = `
    <div>
      <button id="skyline-start">绘制天际线</button>
      <button id="skyline-clear" style="margin-left:10px;">清除</button>
    </div>
    <div style="margin-top:12px;color:#aaa;font-size:13px;">
      在地图上点击多个点，右键结束，显示天际线（连线演示）。
    </div>
  `;
  document.getElementById('skyline-start').onclick = () => {
    if (skylineEntity) {
      viewer.entities.remove(skylineEntity);
      skylineEntity = null;
    }
    let positions = [];
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      const cartesian = viewer.scene.pickPosition(event.position);
      if (cartesian) {
        positions.push(cartesian);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function () {
      if (positions.length >= 2) {
        skylineEntity = viewer.entities.add({
          polyline: {
            positions: positions,
            width: 4,
            material: Cesium.Color.PURPLE
          }
        });
      }
      handler.destroy();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  };
  document.getElementById('skyline-clear').onclick = () => {
    if (skylineEntity) {
      viewer.entities.remove(skylineEntity);
      skylineEntity = null;
    }
  };
} 