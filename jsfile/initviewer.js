import '/Cesium/Cesium.js';
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZjJjZDM0ZS1hNjNmLTQ3ZWYtYjA2Yi1hNTM3NmUzYTFmZjgiLCJpZCI6MjgxODEyLCJpYXQiOjE3NDQ5NjM1ODB9.QjsmjS1Wc2QfJ9lRzCOXdagkgH9gvHlvITV48kVHCK0';
    
    // 修改容器 ID 为 viewer-container
    export const viewer = new Cesium.Viewer('viewer-container', {
        animation: false, // 动画小组件
        baseLayerPicker: true, // 底图组件
        fullscreenButton: true, // 全屏组件
        vrButton: false, // VR模式
        geocoder: true, // 地理编码（搜索）组件
        homeButton: false, // 首页按钮
        infoBox: false, // 信息框
        sceneModePicker: true, // 场景模式切换
        selectionIndicator: false, // 是否显示选取指示器
        timeline: false, // 时间轴
        navigationHelpButton: false, // 帮助提示
        navigationInstructionsInitiallyVisible: true // 初始不显示导航帮助
    });
    
    // 将隐藏 logo 的逻辑移至 Viewer 创建之后
    viewer.cesiumWidget.creditContainer.style.display = "none";