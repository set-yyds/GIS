import { viewer } from './initviewer.js';

document.addEventListener('DOMContentLoaded', () => {
    const coordDisplay = document.getElementById("coordinate-display");
    if (!coordDisplay) console.error("坐标显示容器未找到");
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
        // 获取点击位置的笛卡尔坐标
        const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
        if (cartesian) {
        // 将笛卡尔坐标转换为经纬度和高度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude); // 经度
        const latitude = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
        const height = cartographic.height; // 高度
        // 更新网页上的容器内容
        coordDisplay.innerHTML = ` 
        <strong>经度</strong>: ${longitude.toFixed(2)}<br> 
        <strong>纬度</strong>: ${latitude.toFixed(2)}<br> 
        `;
        console.log("DOMContentLoaded222");
        }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        console.log("DOMContentLoaded111");
});