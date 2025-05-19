// measure.js

export class Measure {
    constructor(viewer) {
        this.viewer = viewer;
        this._positions = [];
        this._measureEntities = null;
        this._handler = null;
    }

    drawLineMeasureGraphics({ material, callback }) {
        this._reset();

        this._measureEntities = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return this._positions;
                }, false),
                width: 3,
                material: material
            }
        });

        this._handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        let isDrawing = false;

        this._handler.setInputAction((event) => {
            if (!isDrawing) {
                isDrawing = true;
                this._positions = [];
            }

            const cartesian = this.viewer.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid);
            if (cartesian) {
                this._positions.push(cartesian);

                if (this._positions.length >= 2) {
                    callback(this._positions);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction(() => {
            isDrawing = false;
            this._handler.destroy();
            this._handler = null;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    drawAreaMeasureGraphics({ material, callback }) {
        this._reset();

        this._measureEntities = this.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.CallbackProperty(() => {
                    return new Cesium.PolygonHierarchy(this._positions);
                }, false),
                material: material
            }
        });

        this._handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        let isDrawing = false;

        this._handler.setInputAction((event) => {
            if (!isDrawing) {
                isDrawing = true;
                this._positions = [];
            }

            const cartesian = this.viewer.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid);
            if (cartesian) {
                this._positions.push(cartesian);

                if (this._positions.length >= 3) {
                    callback(this._positions);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction(() => {
            isDrawing = false;
            this._handler.destroy();
            this._handler = null;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    getPositionDistance(positions) {
        let totalDistance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];
            totalDistance += Cesium.Cartesian3.distance(start, end);
        }
        return totalDistance;
    }

getPositionsArea(positions) {
    if (positions.length < 3) return 0;

    const cartographics = Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(positions);
    let area = 0.0;
    const len = cartographics.length;

    for (let i = 0; i < len - 2; i++) {
        const tri = [cartographics[0], cartographics[i + 1], cartographics[i + 2]];
        area += this._sphereTriangleArea(tri);
    }

    return area;
}

_sphereTriangleArea(tri) {
    const radius = Cesium.Ellipsoid.WGS84.maximumRadius;
    const d2r = Cesium.Math.toRadians;

    const [p1, p2, p3] = tri;

    const a = this._angleBetween(p2, p3);
    const b = this._angleBetween(p1, p3);
    const c = this._angleBetween(p1, p2);

    const s = (a + b + c) / 2.0;
    const excess = 4.0 * Math.atan(Math.sqrt(
        Math.tan(s / 2.0) *
        Math.tan((s - a) / 2.0) *
        Math.tan((s - b) / 2.0) *
        Math.tan((s - c) / 2.0)
    ));

    return (excess * radius * radius);
}

_angleBetween(p1, p2) {
    const dLat = p2.latitude - p1.latitude;
    const dLon = p2.longitude - p1.longitude;
    const a = Math.sin(Cesium.Math.toRadians(dLat) / 2) ** 2 +
              Math.cos(Cesium.Math.toRadians(p1.latitude)) *
              Math.cos(Cesium.Math.toRadians(p2.latitude)) *
              Math.sin(Cesium.Math.toRadians(dLon) / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return c;
}

    reset() {
        this._reset();
    }

    _reset() {
        // 清除当前测量实体
        if (this._measureEntities) {
            this.viewer.entities.remove(this._measureEntities);
            this._measureEntities = null;
        }

        // 清除位置数组
        this._positions = [];

        // 销毁并重置事件处理器
        if (this._handler) {
            this._handler.destroy();
            this._handler = null;
        }
    }
}