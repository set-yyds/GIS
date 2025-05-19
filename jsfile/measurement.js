// measurement.js

// 不再单独引入 measure.js，直接用 window.Cesium.Measure

export class MeasurementTool {
    constructor(viewer) {
        this.viewer = viewer;
        this.measure = new window.Cesium.Measure(viewer); // 使用 cesium-measure.js
        this.activeTool = null;
        this._handlers = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        this._initPanel();
        this._bindMeasureButton();
    }

    _initPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'measure-panel';
        this.panel.innerHTML = `
            <style>
            .measure-panel {
                position: fixed;
                top: 80px;
                right: 40px;
                z-index: 99999;
                background: rgba(20, 40, 70, 0.96);
                border-radius: 18px;
                box-shadow: 0 4px 24px rgba(0,243,255,0.18);
                padding: 18px 22px 16px 22px;
                min-width: 220px;
                color: #fff;
                font-family: 'Microsoft YaHei', Arial, sans-serif;
                user-select: none;
            }
            .measure-panel .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            .measure-panel h3 {
                font-size: 18px;
                color: #00f6ff;
                font-weight: 700;
                margin: 0;
                letter-spacing: 1px;
            }
            .measure-panel .icon-close {
                background: none;
                border: none;
                color: #b6eaff;
                font-size: 22px;
                cursor: pointer;
                border-radius: 50%;
                padding: 2px 8px;
                transition: background 0.2s, color 0.2s;
            }
            .measure-panel .icon-close:hover {
                color: #fff;
                background: rgba(0,243,255,0.12);
            }
            .measure-panel .measure-results {
                margin-bottom: 14px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px 10px;
                background: rgba(0,243,255,0.08);
                border-radius: 10px;
                padding: 10px 8px 6px 8px;
                box-shadow: 0 2px 8px #00f3ff22;
                justify-content: space-between;
            }
            .measure-panel .result-item {
                display: flex;
                align-items: center;
                font-size: 13px;
                margin-bottom: 0;
                min-width: 90px;
            }
            .measure-panel .result-item label {
                color: #b6eaff;
                min-width: 38px;
            }
            .measure-panel .result-item span {
                font-weight: bold;
                color: #00f6ff;
                font-size: 16px;
                margin-left: 4px;
                letter-spacing: 1px;
                transition: opacity 0.3s;
            }
            .measure-panel .tool-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 0;
                justify-content: space-between;
            }
            .measure-panel .tool-btn {
                flex: 1 1 44%;
                background: rgba(0,243,255,0.08);
                border: 1.5px solid #00f6ff44;
                color: #00f6ff;
                border-radius: 8px;
                padding: 6px 0;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s, color 0.2s, border 0.2s;
            }
            .measure-panel .tool-btn.active, .measure-panel .tool-btn:hover {
                background: #00f6ff;
                color: #143861;
                border: 1.5px solid #00f6ff;
            }
            </style>
            <div class="panel-header">
                <h3>量测工具</h3>
                <button class="icon-close">×</button>
            </div>
            <div class="measure-results">
                <div class="result-item"><label>距离:</label><span id="distance-value">--</span></div>
                <div class="result-item"><label>面积:</label><span id="area-value">--</span></div>
                <div class="result-item"><label>高程:</label><span id="height-value">--</span></div>
                <div class="result-item"><label>三角:</label><span id="triangle-value">--</span></div>
            </div>
            <div class="tool-grid">
                <button class="tool-btn" data-type="distance">📏 距离</button>
                <button class="tool-btn" data-type="area">⬛ 面积</button>
                <button class="tool-btn" data-type="height">⛰️ 高程</button>
                <button class="tool-btn" data-type="triangle">🔺 三角测量</button>
                <button class="tool-btn" data-type="clear">🧹 清除</button>
            </div>
        `;
        document.body.appendChild(this.panel);
        this._bindEvents();
    }

    _bindEvents() {
        // 主按钮切换面板
        const measureBtn = document.getElementById('map-measure');
        if (measureBtn) {
            measureBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.panel.classList.toggle('active');
            });
        }

        // 工具按钮点击处理
        this.panel.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = btn.dataset.type;
                if (type === 'clear') {
                    this._clearAll();
                } else {
                    this.setActiveTool(type);
                }
            });
        });

        // 关闭按钮
        const closeBtn = this.panel.querySelector('.icon-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.panel.classList.remove('active');
                this._clearAll();
            });
        }
    }

    setActiveTool(type) {
        console.log('激活工具:', type);

        if (this.activeTool === type) return;

        this._clearMeasurement();

        switch (type) {
            case 'distance':
                this.measure.drawLineMeasureGraphics({
                    callback: (positions) => {
                        if (!positions || positions.length < 2) {
                            this.showResult('distance', null);
                            return;
                        }
                        const distance = this.measure.getPositionDistance(positions);
                        this.showResult('distance', distance);
                    }
                });
                break;

            case 'area':
                this.measure.drawAreaMeasureGraphics({
                    callback: (positions) => {
                        if (!positions || positions.length < 3) {
                            this.showResult('area', null);
                            return;
                        }
                        const area = this.measure.getPositionsArea(positions);
                        this.showResult('area', Math.abs(area));
                    }
                });
                break;

            case 'height':
                this._heightHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
                this._heightHandler.setInputAction(click => {
                    const cartesian = this.viewer.scene.pickPosition(click.position);
                    if (cartesian) {
                        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        this.showResult('height', cartographic.height);
                        this.viewer.entities.add({
                            position: cartesian,
                            point: {
                                color: Cesium.Color.RED,
                                pixelSize: 5
                            }
                        });
                    }
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                break;

            case 'triangle':
                this.measure.drawTrianglesMeasureGraphics({
                    callback: (entities) => {
                        // entities.e, entities.e2, entities.e3 分别为三角、垂线、水平线
                        // 可根据需要显示三角形的边长/高等
                        this.showResult('triangle', '已完成');
                    }
                });
                break;

            default:
                console.warn(`未知工具类型: ${type}`);
        }

        // 更新按钮状态
        this.panel.querySelectorAll('[data-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        this.activeTool = type;
    }

    showResult(type, value) {
        const formatters = {
            distance: v => `${(v / 1000).toFixed(2)}公里`,
            area: v => `${(v / 1e6).toFixed(2)}平方公里`,
            height: v => `${v.toFixed(1)}米`,
            triangle: v => v || '--',
        };

        const element = document.getElementById(`${type}-value`);
        if (!element) return;

        element.style.transition = 'opacity 0.3s';
        element.style.opacity = 0;

        requestAnimationFrame(() => {
            element.textContent = value ? formatters[type](value) : '--';
            element.style.opacity = 1;
        });
    }

    _clearMeasurement() {
        if (this.measure && this.measure.reset) this.measure.reset();
        if (this.viewer && this.viewer.entities) this.viewer.entities.removeAll();
        ['distance', 'area', 'height', 'triangle'].forEach(type => {
            const el = document.getElementById(`${type}-value`);
            if (el) el.textContent = '--';
        });
        if (this._heightHandler) {
            this._heightHandler.destroy();
            this._heightHandler = null;
        }
    }

    _clearAll() {
        this._clearMeasurement();
        this.panel.querySelectorAll('[data-type]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'clear');
        });
        this.activeTool = null;
    }

    _bindMeasureButton() {
        const measureBtn = document.getElementById('map-measure');
        if (measureBtn) {
            measureBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.panel.classList.add('active');
            });
        }
    }
}