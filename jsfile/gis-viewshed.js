import { viewer } from './initviewer.js';
let viewshedEntity = null;

export function renderViewshedPanel(container) {
  container.innerHTML = `
    <div>
      <button id="viewshed-start">选择观察点</button>
      <button id="viewshed-clear" style="margin-left:10px;">清除</button>
    </div>
    <div style="margin-top:12px;color:#aaa;font-size:13px;">
      在地图上点击选择观察点，自动绘制可视域扇形（演示）。
    </div>
  `;
  document.getElementById('viewshed-start').onclick = () => {
    if (viewshedEntity) {
      viewer.entities.remove(viewshedEntity);
      viewshedEntity = null;
    }
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      const cartesian = viewer.scene.pickPosition(event.position);
      if (cartesian) {
        viewshedEntity = viewer.entities.add({
          position: cartesian,
          ellipse: {
            semiMajorAxis: 300,
            semiMinorAxis: 150,
            material: Cesium.Color.YELLOW.withAlpha(0.3),
            outline: true,
            outlineColor: Cesium.Color.ORANGE,
            stRotation: Math.PI / 4
          }
        });
      }
      handler.destroy();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  };
  document.getElementById('viewshed-clear').onclick = () => {
    if (viewshedEntity) {
      viewer.entities.remove(viewshedEntity);
      viewshedEntity = null;
    }
  };
} 