import { renderBufferPanel } from './gis-buffer.js';
import { renderOverlayPanel } from './gis-overlay.js';
import { renderSlopePanel } from './gis-slope.js';
import { renderProfilePanel } from './gis-profile.js';
import { renderViewshedPanel } from './gis-viewshed.js';
import { renderSkylinePanel } from './gis-skyline.js';
import { renderLineOfSightPanel } from './gis-lineofsight.js';
import { renderFloodPanel } from './gis-flood.js';
// ... 其他分析功能js


const panelHtml = `
  <div class="panel-header">
    <h3>GIS分析</h3>
    <button class="icon-close">×</button>
  </div>
  <div class="gis-tabs">
    <button class="gis-tab-btn active" data-tab="buffer">缓冲区</button>
    <button class="gis-tab-btn" data-tab="overlay">叠加</button>
    <button class="gis-tab-btn" data-tab="slope">坡度坡向</button>
    <button class="gis-tab-btn" data-tab="profile">剖面</button>
    <button class="gis-tab-btn" data-tab="viewshed">可视域</button>
    <button class="gis-tab-btn" data-tab="skyline">天际线</button>
    <button class="gis-tab-btn" data-tab="lineofsight">通视</button>
    <button class="gis-tab-btn" data-tab="flood">淹没</button>
  </div>
  <div class="gis-content" id="gis-content"></div>
`;

const panel = document.createElement('div');
panel.className = 'gis-panel';
panel.innerHTML = panelHtml;
document.body.appendChild(panel);

const content = panel.querySelector('#gis-content');
const tabBtns = panel.querySelectorAll('.gis-tab-btn');

// 默认加载缓冲区分析
renderBufferPanel(content);

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    content.innerHTML = '';
    if (tab === 'buffer') renderBufferPanel(content);
    else if (tab === 'overlay') renderOverlayPanel(content);
    else if (tab === 'slope') renderSlopePanel(content);
    else if (tab === 'profile') renderProfilePanel(content);
    else if (tab === 'viewshed') renderViewshedPanel(content);
    else if (tab === 'skyline') renderSkylinePanel(content);
    else if (tab === 'lineofsight') renderLineOfSightPanel(content);
    else if (tab === 'flood') renderFloodPanel(content);
  });
});

// 关闭按钮
panel.querySelector('.icon-close').onclick = () => {
  panel.classList.remove('active');
  // 关闭时按钮变灰
  const gisBtn = document.getElementById('gis-analysis');
  if (gisBtn) {
    const indicator = gisBtn.querySelector('.status-indicator');
    if (indicator) indicator.style.backgroundColor = '#8c8c8c';
    gisBtn.classList.remove('active');
  }
};

// 按钮弹出面板并变色
const gisBtn = document.getElementById('gis-analysis');
if (gisBtn) {
  const indicator = gisBtn.querySelector('.status-indicator');
  indicator.style.backgroundColor = '#8c8c8c'; // 初始为灰色
  gisBtn.onclick = () => {
    const isActive = panel.classList.toggle('active');
    gisBtn.classList.toggle('active', isActive);
    indicator.style.backgroundColor = isActive ? '#52c41a' : '#8c8c8c';
  };
}
