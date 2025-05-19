import { viewer } from './initviewer.js';
let overlayEntities = [];

export function renderOverlayPanel(container) {
  container.innerHTML = `
    <div>
      <button id="overlay-start">绘制两个多边形</button>
      <button id="overlay-clear" style="margin-left:10px;">清除</button>
    </div>
    <div style="margin-top:12px;color:#aaa;font-size:13px;">
      依次绘制两个多边形，自动显示简单叠加（交集区域为红色）。
    </div>
  `;
  document.getElementById('overlay-start').onclick = () => {
    overlayEntities.forEach(e => viewer.entities.remove(e));
    overlayEntities = [];
    let polygons = [];
    let current = [];
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      const cartesian = viewer.scene.pickPosition(event.position);
      if (cartesian) {
        current.push(cartesian);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(function () {
      if (current.length >= 3) {
        const entity = viewer.entities.add({
          polygon: {
            hierarchy: current,
            material: polygons.length === 0 ? Cesium.Color.YELLOW.withAlpha(0.4) : Cesium.Color.BLUE.withAlpha(0.4)
          }
        });
        overlayEntities.push(entity);
        polygons.push(current);
        current = [];
        if (polygons.length === 2) {
          // 简单交集演示（仅取第一个点为交集）
          const intersection = [polygons[0][0], polygons[1][0], polygons[0][1]];
          const interEntity = viewer.entities.add({
            polygon: {
              hierarchy: intersection,
              material: Cesium.Color.RED.withAlpha(0.6)
            }
          });
          overlayEntities.push(interEntity);
          handler.destroy();
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  };
  document.getElementById('overlay-clear').onclick = () => {
    overlayEntities.forEach(e => viewer.entities.remove(e));
    overlayEntities = [];
  };
} 