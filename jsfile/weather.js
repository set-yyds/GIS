// 天气状况与图标映射（可用emoji或SVG）
const weatherIcons = {
  '晴': '☀️',
  '多云': '⛅',
  '阴': '☁️',
  '小雨': '🌧️',
  '中雨': '🌧️',
  '大雨': '🌧️',
  '雷阵雨': '⛈️',
  '雪': '❄️',
  // ...可自行扩展
};

async function getCityCodeByName(cityName) {
  const key = 'a49e1cb39e185e83ae4b6c426f40b5bf';
  const url = `https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(cityName)}&key=${key}&subdistrict=0`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.districts && data.districts[0] && data.districts[0].adcode) {
    return data.districts[0].adcode;
  }
  throw new Error('未找到该城市');
}

export class WeatherController {
  static async getWeatherForecast(cityCode) {
    try {
      const response = await fetch(`/api/weather?city=${cityCode}`);
      if (!response.ok) throw new Error('天气API请求失败');
      const data = await response.json();
      const now = data.lives && data.lives[0] ? data.lives[0] : {};
      const daily = (data.forecasts && data.forecasts[0] && data.forecasts[0].casts) ? data.forecasts[0].casts : [];
      return { now, daily };
    } catch (error) {
      console.error('获取天气数据失败:', error);
      return { now: {}, daily: [] };
    }
  }
}

// 初始化天气功能
document.addEventListener('DOMContentLoaded', () => {
  const weatherBtn = document.getElementById('weather');
  const weatherPanel = document.getElementById('weather-panel');
  const forecastList = document.getElementById('forecast-list');
  const closeBtn = weatherPanel.querySelector('.close-btn');
  const statusIndicator = weatherBtn.querySelector('.status-indicator');
  const cityInput = document.getElementById('weather-city-input');
  const searchBtn = document.getElementById('weather-search-btn');

  let currentCityCode = '510100'; // 默认成都

  async function renderWeather(cityCode) {
    const { now, daily } = await WeatherController.getWeatherForecast(cityCode);
    const icon = weatherIcons[now.weather] || '❓';
    // 今天日期和星期
    let todayDate = '', todayWeek = '';
    if (daily && daily.length > 0) {
      todayDate = daily[0].date;
      todayWeek = daily[0].week;
    }
    forecastList.innerHTML = `
      <div class="current-weather-card">
        <span class="weather-icon">${icon}</span>
        <div class="city-name">${now.city || cityInput.value || ''}</div>
        <div class="main-temp">${now.temperature ? now.temperature + '℃' : '--'}</div>
        <div class="main-desc">${now.weather || '--'}</div>
        <div class="main-extra" style="margin-top:8px;font-size:15px;opacity:0.85;">${todayDate ? `${todayDate}（周${todayWeek}）` : ''}</div>
      </div>
    `;
    if (daily && daily.length > 1) {
      forecastList.innerHTML += '<div class="forecast-item" style="background:none;box-shadow:none;padding:8px 0 0 0;color:#b0c4de;font-size:15px;font-weight:600;">未来预报</div>';
      // 只显示明天及以后
      for (let i = 1; i < daily.length; i++) {
        const forecast = daily[i];
        const iconDay = weatherIcons[forecast.dayweather] || '❓';
        const iconNight = weatherIcons[forecast.nightweather] || '❓';
        forecastList.innerHTML += `
          <div class="forecast-item" style="flex-direction:column;align-items:flex-start;gap:2px;word-break:break-all;white-space:normal;">
            <div><b>${forecast.date}（周${forecast.week}）</b></div>
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
              <span>${iconDay} ${forecast.dayweather} / ${iconNight} ${forecast.nightweather}</span>
              <span>${forecast.nighttemp}~${forecast.daytemp}℃</span>
              <span>${forecast.daywind}风${forecast.daypower}级</span>
            </div>
          </div>
        `;
      }
    }
  }

  weatherBtn.addEventListener('click', async () => {
    const isActive = weatherBtn.classList.toggle('active');
    statusIndicator.style.backgroundColor = isActive ? '#52c41a' : '#8c8c8c';
    weatherPanel.classList.toggle('active', isActive);
    if (isActive) renderWeather(currentCityCode);
    else forecastList.innerHTML = '';
  });

  searchBtn.addEventListener('click', async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    try {
      const code = await getCityCodeByName(cityName);
      currentCityCode = code;
      renderWeather(currentCityCode);
    } catch (e) {
      forecastList.innerHTML = `<div class="forecast-item">未找到该城市</div>`;
    }
  });

  closeBtn.addEventListener('click', () => {
    weatherBtn.classList.remove('active');
    weatherPanel.classList.remove('active');
    statusIndicator.style.backgroundColor = '#8c8c8c';
  });

  // 点击面板外区域关闭
  window.addEventListener('click', (e) => {
    if (e.target === weatherPanel) {
      weatherBtn.classList.remove('active');
      weatherPanel.classList.remove('active');
      statusIndicator.style.backgroundColor = '#8c8c8c';
    }
  });

  function pad2(n) { return n < 10 ? '0' + n : n; }
  function getWeekStr(num) {
    return ['日','一','二','三','四','五','六'][num];
  }
  function updateTime() {
    const now = new Date();
    document.getElementById('weather-time').textContent =
      pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
    setTimeout(updateTime, 1000);
  }

  async function renderWeatherDashboard(cityCode = '510100') {
    // 你已有的天气API请求逻辑
    const res = await fetch(`/api/weather?city=${cityCode}`);
    const data = await res.json();
    const now = data.lives && data.lives[0] ? data.lives[0] : {};
    // 日期
    const dateObj = new Date();
    document.getElementById('weather-date').textContent =
      dateObj.getFullYear() + '.' + pad2(dateObj.getMonth()+1) + '.' + pad2(dateObj.getDate());
    document.getElementById('weather-week').textContent = '星期' + getWeekStr(dateObj.getDay());
    document.getElementById('date-day').textContent = dateObj.getDate();
    document.getElementById('date-month').textContent = (dateObj.getMonth()+1) + '月';
    document.getElementById('date-year').textContent = dateObj.getFullYear() + '年';
    // 天气数据
    document.getElementById('weather-temp').textContent = now.temperature ? now.temperature + '°C' : '--';
    document.getElementById('weather-desc').textContent = now.weather || '--';
    document.getElementById('weather-wind').textContent = (now.windpower ? now.windpower + '级' : '--');
    document.getElementById('weather-humidity').textContent = (now.humidity ? now.humidity + '%' : '--');
  }

  renderWeatherDashboard();
  updateTime();
});