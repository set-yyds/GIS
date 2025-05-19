import { viewer } from '/jsfile/initviewer.js';

let loadedModel = null; // 存储已加载的模型

/**
 * 加载 3D 模型（返回 Promise）
 * @returns {Promise<Cesium.Cesium3DTileset>}
 */
export function loadModel() {
  return new Promise(async (resolve, reject) => {
    try {
      if (loadedModel) {
        resolve(loadedModel); // 已加载时直接返回
        return;
      }

      // 加载模型
      const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(3273315);
      
      // 设置模型位置和姿态
      const cartesian = Cesium.Cartesian3.fromDegrees(102.85533, 24.86247, 0);
      const heading = Cesium.Math.toRadians(-5.0);
      const pitch = Cesium.Math.toRadians(0.0);
      const roll = Cesium.Math.toRadians(0.0);
      const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        cartesian,
        hpr,
        Cesium.Ellipsoid.WGS84
      );
      tileset.modelMatrix = modelMatrix;

      // 添加到场景并缩放
      viewer.scene.primitives.add(tileset);
      await viewer.zoomTo(tileset);
      
      loadedModel = tileset;
      resolve(tileset);
    } catch (error) {
      console.error('模型加载失败:', error);
      reject(error);
    }
  });
}

/**
 * 移除已加载的模型
 */
export function removeModel() {
  if (loadedModel) {
    viewer.scene.primitives.remove(loadedModel);
    loadedModel = null;
  }
}