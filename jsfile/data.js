// 引入ECharts库
import 'https://cdn.jsdelivr.net/npm/echarts@5.4.0/dist/echarts.min.js';

// 变量初始化
let dataChart = null;
let currentChart = 'line';
let dashboardCharts = {
  topLeft: null,
  topRight: null,
  bottomLeft: null,
  bottomRight: null,
  visitorMap: null
};

// 省会经纬度
const geoCoordMap = {
  '北京': [116.405285, 39.904989],
  '天津': [117.190182, 39.125596],
  '河北': [114.502461, 38.045474],
  '山西': [112.549248, 37.857014],
  '内蒙古': [111.670801, 40.818311],
  '辽宁': [123.429096, 41.796767],
  '吉林': [125.3245, 43.886841],
  '黑龙江': [126.642464, 45.756967],
  '上海': [121.472644, 31.231706],
  '江苏': [118.767413, 32.041544],
  '浙江': [120.153576, 30.287459],
  '安徽': [117.283042, 31.86119],
  '福建': [119.306239, 26.075302],
  '江西': [115.892151, 28.676493],
  '山东': [117.000923, 36.675807],
  '河南': [113.665412, 34.757975],
  '湖北': [114.298572, 30.584355],
  '湖南': [112.982279, 28.19409],
  '广东': [113.280637, 23.125178],
  '广西': [108.320004, 22.82402],
  '海南': [110.33119, 20.031971],
  '重庆': [106.504962, 29.533155],
  '四川': [104.065735, 30.659462],
  '贵州': [106.713478, 26.578343],
  '云南': [102.712251, 25.040609],
  '西藏': [91.132212, 29.660361],
  '陕西': [108.948024, 34.263161],
  '甘肃': [103.823557, 36.058039],
  '青海': [101.778916, 36.623178],
  '宁夏': [106.278179, 38.46637],
  '新疆': [87.617733, 43.792818]
};

// 游客数据
const visitorData = [
  { name: '北京', value: 15000 },
  { name: '天津', value: 8200 },
  { name: '河北', value: 6800 },
  { name: '山西', value: 3500 },
  { name: '内蒙古', value: 2100 },
  { name: '辽宁', value: 5600 },
  { name: '吉林', value: 3200 },
  { name: '黑龙江', value: 2800 },
  { name: '上海', value: 18000 },
  { name: '江苏', value: 12500 },
  { name: '浙江', value: 14300 },
  { name: '安徽', value: 6500 },
  { name: '福建', value: 8700 },
  { name: '江西', value: 4200 },
  { name: '山东', value: 9800 },
  { name: '河南', value: 7400 },
  { name: '湖北', value: 8500 },
  { name: '湖南', value: 7200 },
  { name: '广东', value: 16800 },
  { name: '广西', value: 5300 },
  { name: '海南', value: 4100 },
  { name: '重庆', value: 7800 },
  { name: '四川', value: 9500 },
  { name: '贵州', value: 3600 },
  { name: '云南', value: 4900 },
  { name: '西藏', value: 1200 },
  { name: '陕西', value: 5700 },
  { name: '甘肃', value: 2400 },
  { name: '青海', value: 1100 },
  { name: '宁夏', value: 1500 },
  { name: '新疆', value: 2700 }
];

// 初始化数据图表
export function initDataCharts() {
  try {
    // 创建主面板DOM
    createDataPanelDOM();
    
    // 初始化各个图表
    setTimeout(() => {
      initAllCharts();
    }, 100);
    
    // 绑定控制按钮事件
    bindControlEvents();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Error initializing data charts:', error);
  }
}

// 创建数据面板DOM
function createDataPanelDOM() {
  // 检查是否已存在面板
  if (document.querySelector('.data-dashboard')) return;
  
  // 创建主面板容器
  const mainPanel = document.createElement('div');
  mainPanel.className = 'data-dashboard';
  
  // 四个角落的图表
  const chartPanels = [
    { id: 'top-left', title: '今日游客流量' },
    { id: 'top-right', title: '景区收入分析' },
    { id: 'bottom-left', title: '客源地分布' },
    { id: 'bottom-right', title: '游客满意度' }
  ];
  
  // 创建各图表面板
  chartPanels.forEach(panel => {
    const chartPanel = document.createElement('div');
    chartPanel.className = `chart-panel ${panel.id}`;
    chartPanel.innerHTML = `
      <div class="panel-title">${panel.title}</div>
      <div class="chart-container" id="chart-${panel.id}"></div>
      <div class="panel-stats" id="stats-${panel.id}"></div>
    `;
    mainPanel.appendChild(chartPanel);
  });
  
  // 创建中央地图面板
  const mapPanel = document.createElement('div');
  mapPanel.className = 'map-panel';
  mapPanel.innerHTML = `
    <div class="panel-header">
      <h3>全国游客来源分布</h3>
      <button class="close-btn" id="map-close-btn">×</button>
    </div>
    <div class="map-container" id="visitor-map"></div>
    <div class="map-legend">
      <div class="legend-item">
        <div class="legend-color" style="background:#f52443;"></div>
        <span>高客流(>10000)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background:#ff8800;"></div>
        <span>中客流(5000-10000)</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background:#00f3ff;"></div>
        <span>低客流(<5000)</span>
      </div>
    </div>
  `;
  mainPanel.appendChild(mapPanel);
  
  // 绑定中央地图面板关闭按钮事件
  const mapCloseBtn = mapPanel.querySelector('#map-close-btn');
  if (mapCloseBtn) {
    mapCloseBtn.addEventListener('click', () => {
      const dataDashboard = document.querySelector('.data-dashboard');
      const dataBtn = document.getElementById('data');
      if (dataDashboard && dataBtn) {
        dataDashboard.classList.remove('active');
        dataBtn.classList.remove('active');
        dataBtn.querySelector('.status-indicator').style.backgroundColor = '#8c8c8c';
      }
    });
  }
  
  // 创建关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'dashboard-close-btn';
  closeBtn.innerHTML = '×';
  mainPanel.appendChild(closeBtn);
  
  // 添加到页面
  document.body.appendChild(mainPanel);
}

// 初始化所有图表
function initAllCharts() {
  try {
    initVisitorFlowChart();
    initIncomeChart();
    initSourceChart();
    initSatisfactionChart();
    initVisitorMapChart();
    console.log('All charts initialized successfully');
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

// 绑定控制按钮事件
function bindControlEvents() {
  // 获取控制元素
  const dataBtn = document.getElementById('data');
  const dataDashboard = document.querySelector('.data-dashboard');
  const closeBtn = document.querySelector('.dashboard-close-btn');
  
  // 数据按钮事件
  if (dataBtn) {
    dataBtn.addEventListener('click', () => {
      const isActive = dataBtn.classList.toggle('active');
      
      if (isActive && dataDashboard) {
        dataDashboard.classList.add('active');
        dataBtn.querySelector('.status-indicator').style.backgroundColor = '#52c41a';
        
        // 更新所有图表尺寸
        setTimeout(() => {
          updateAllCharts();
        }, 300);
      } else if (dataDashboard) {
        dataDashboard.classList.remove('active');
        dataBtn.querySelector('.status-indicator').style.backgroundColor = '#8c8c8c';
      }
    });
  }
  
  // 关闭按钮事件
  if (closeBtn && dataBtn) {
    closeBtn.addEventListener('click', () => {
      dataDashboard.classList.remove('active');
      dataBtn.classList.remove('active');
      dataBtn.querySelector('.status-indicator').style.backgroundColor = '#8c8c8c';
    });
  }
}

// 更新所有图表
function updateAllCharts() {
  try {
    Object.keys(dashboardCharts).forEach(key => {
      if (dashboardCharts[key]) {
        dashboardCharts[key].resize();
      }
    });
  } catch (error) {
    console.error('Error updating charts:', error);
  }
}

// 处理窗口大小变化
function handleResize() {
  updateAllCharts();
}

// 游客流量图表 (左上)
function initVisitorFlowChart() {
  const chartDom = document.getElementById('chart-top-left');
  if (!chartDom) return;
  
  // 初始化或获取图表实例
  dashboardCharts.topLeft = dashboardCharts.topLeft || echarts.init(chartDom);
  
  // 图表配置
  const option = {
    grid: {
      top: 30,
      right: 15,
      bottom: 30,
      left: 50,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(13, 42, 77, 0.9)',
      borderColor: 'rgba(0, 243, 255, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
      axisLine: {
        lineStyle: { color: 'rgba(140, 213, 255, 0.3)' }
      },
      axisLabel: {
        color: '#8cd5ff',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { 
          color: 'rgba(140, 213, 255, 0.1)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#8cd5ff',
        fontSize: 10
      }
    },
    series: [
      {
        data: [820, 1250, 1600, 2000, 1800, 1580],
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00f3ff' },
            { offset: 1, color: '#0066ff' }
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 243, 255, 0.5)' },
            { offset: 1, color: 'rgba(0, 102, 255, 0)' }
          ])
        },
        itemStyle: {
          color: '#00f3ff',
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    ],
    animationDuration: 1000
  };
  
  // 添加统计数据
  const statsContainer = document.getElementById('stats-top-left');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">3,782</div>
        <div class="stat-label">当前人数</div>
      </div>
    `;
  }
  
  // 设置图表配置
  dashboardCharts.topLeft.setOption(option);
}

// 收入分析图表 (右上)
function initIncomeChart() {
  const chartDom = document.getElementById('chart-top-right');
  if (!chartDom) return;
  
  // 初始化或获取图表实例
  dashboardCharts.topRight = dashboardCharts.topRight || echarts.init(chartDom);
  
  // 图表配置
  const option = {
    grid: {
      top: 50,
      right: 15,
      bottom: 30,
      left: 30,
      containLabel: true
    },
    legend: {
      data: ['门票', '餐饮', '纪念品'],
      right: 10,
      top: 10,
      textStyle: {
        color: '#8cd5ff',
        fontSize: 10
      },
      itemWidth: 10,
      itemHeight: 6
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(13, 42, 77, 0.9)',
      borderColor: 'rgba(0, 243, 255, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: {
        lineStyle: { color: 'rgba(140, 213, 255, 0.3)' }
      },
      axisLabel: {
        color: '#8cd5ff',
        fontSize: 10,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#8cd5ff',
        fontSize: 10
      },
      splitLine: {
        lineStyle: { 
          color: 'rgba(140, 213, 255, 0.1)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#8cd5ff',
        fontSize: 10
      }
    },
    series: [
      {
        name: '门票',
        type: 'bar',
        stack: 'total',
        barWidth: '50%',
        emphasis: {
          focus: 'series'
        },
        data: [12, 10, 11, 13, 16, 22, 25],
        itemStyle: {
          color: '#00f3ff'
        }
      },
      {
        name: '餐饮',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [8, 7, 7, 8, 10, 15, 14],
        itemStyle: {
          color: '#0066ff'
        }
      },
      {
        name: '纪念品',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: [3, 2, 3, 4, 5, 7, 8],
        itemStyle: {
          color: '#7a36f0'
        }
      }
    ],
    animationDuration: 1000
  };
  
  // 添加统计数据
  const statsContainer = document.getElementById('stats-top-right');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">42.6</div>
        <div class="stat-label">今日收入(万)</div>
      </div>
    `;
  }
  
  // 设置图表配置
  dashboardCharts.topRight.setOption(option);
}

// 客源分布图表 (左下)
function initSourceChart() {
  const chartDom = document.getElementById('chart-bottom-left');
  if (!chartDom) return;
  
  // 初始化或获取图表实例
  dashboardCharts.bottomLeft = dashboardCharts.bottomLeft || echarts.init(chartDom);
  
  // 预定义数据
  const pieData = [
    { value: 38, name: '本省游客' },
    { value: 26, name: '周边省份' },
    { value: 24, name: '外省游客' },
    { value: 12, name: '国际游客' }
  ];
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(13, 42, 77, 0.9)',
      borderColor: 'rgba(0, 243, 255, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#8cd5ff',
        fontSize: 10
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: 'rgba(10, 26, 50, 0.8)',
          borderWidth: 1
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          }
        },
        data: pieData,
        color: ['#00f3ff', '#0066ff', '#7a36f0', '#f27a03']
      }
    ],
    animationDuration: 1000
  };
  
  // 设置图表配置
  dashboardCharts.bottomLeft.setOption(option);
}

// 满意度图表 (右下)
function initSatisfactionChart() {
  const chartDom = document.getElementById('chart-bottom-right');
  if (!chartDom) return;
  
  // 初始化或获取图表实例
  dashboardCharts.bottomRight = dashboardCharts.bottomRight || echarts.init(chartDom);
  
  // 图表配置
  const option = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
      backgroundColor: 'rgba(13, 42, 77, 0.9)',
      borderColor: 'rgba(0, 243, 255, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    series: [
      {
        name: '游客满意度',
        type: 'gauge',
        radius: '85%',
        center: ['50%', '58%'],
        detail: {
          formatter: '{value}%',
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
          offsetCenter: [0, '10%']
        },
        title: {
          show: true,
          offsetCenter: [0, '80%'],
          fontSize: 12,
          fontWeight: 'normal',
          color: '#8cd5ff'
        },
        data: [{ value: 92, name: '游客满意度' }],
        axisTick: {
          distance: -25,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 1
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        axisLabel: {
          distance: -20,
          color: '#8cd5ff',
          fontSize: 10
        },
        axisLine: {
          lineStyle: {
            width: 15,
            color: [
              [0.6, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#f52443' },
                { offset: 1, color: '#ff8800' }
              ])],
              [0.8, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#ff8800' },
                { offset: 1, color: '#02eb8f' }
              ])],
              [1, new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#02eb8f' },
                { offset: 1, color: '#00f3ff' }
              ])]
            ]
          }
        },
        progress: {
          show: true,
          width: 15,
          roundCap: true
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 6,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: '#00f3ff'
          }
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 15,
          itemStyle: {
            borderWidth: 3,
            borderColor: '#00f3ff',
            color: '#0a1a32'
          }
        }
      }
    ],
    animationDuration: 1000
  };
  
  // 添加统计数据
  const statsContainer = document.getElementById('stats-bottom-right');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">+7.2%</div>
        <div class="stat-label">同比增长</div>
      </div>
    `;
  }
  
  // 设置图表配置
  dashboardCharts.bottomRight.setOption(option);
}

// 用 D3.js 渲染全国游客来源分布地图
function renderVisitorMapD3() {
  const container = document.getElementById('visitor-map');
  if (!container) return;
  const width = container.offsetWidth;
  const height = container.offsetHeight;
  if (width === 0 || height === 0) {
    setTimeout(renderVisitorMapD3, 300);
    return;
  }
  container.innerHTML = '';

  // 创建SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // 地图投影
  const projection = d3.geoMercator()
    .center([104.0, 37.5])
    .scale(width * 0.8)
    .translate([width / 2, height / 2]);
  const path = d3.geoPath().projection(projection);

  // 加载中国地图GeoJSON
  d3.json('https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000').then(china => {
    if (!china || !china.features || !china.features.length) {
      console.error('GeoJSON 加载失败或无 features');
      return;
    }
    // 绘制地图
    svg.append('g')
      .selectAll('path')
      .data(china.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#143861')
      .attr('stroke', '#00f3ff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.85);

    // 绘制气泡
    svg.append('g')
      .selectAll('circle')
      .data(visitorData.filter(d => geoCoordMap[d.name]))
      .enter()
      .append('circle')
      .attr('cx', d => projection(geoCoordMap[d.name])[0])
      .attr('cy', d => projection(geoCoordMap[d.name])[1])
      .attr('r', d => Math.max(8, d.value / 2000))
      .attr('fill', d => d.value > 10000 ? '#f52443' : d.value > 5000 ? '#ff8800' : '#00f3ff')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke', '#fff').attr('opacity', 1);
        tooltip.style('display', 'block')
          .html(`${d.name}<br>游客数量: ${d.value}`);
      })
      .on('mousemove', function (event) {
        tooltip.style('left', (event.offsetX + 20) + 'px')
          .style('top', (event.offsetY - 10) + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', 0.85);
        tooltip.style('display', 'none');
      });

    // 省份名称
    svg.append('g')
      .selectAll('text')
      .data(visitorData.filter(d => geoCoordMap[d.name]))
      .enter()
      .append('text')
      .attr('x', d => projection(geoCoordMap[d.name])[0])
      .attr('y', d => projection(geoCoordMap[d.name])[1] - 12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8cd5ff')
      .attr('font-size', 12)
      .attr('pointer-events', 'none')
      .text(d => d.name);

    // tooltip
    const tooltip = d3.select(container)
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(13,42,77,0.95)')
      .style('color', '#fff')
      .style('padding', '6px 12px')
      .style('border-radius', '6px')
      .style('pointer-events', 'none')
      .style('display', 'none')
      .style('z-index', 10);
  });
}

// 初始化游客来源地图
function initVisitorMapChart() {
  renderVisitorMapD3();
}

// 导出图表实例
export { dashboardCharts };

window.initVisitorMapChart = initVisitorMapChart;