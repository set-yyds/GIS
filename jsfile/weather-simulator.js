document.addEventListener('DOMContentLoaded', function() {
  const seasonChangeBtn = document.getElementById('season-change');
  const simulatorPanel = document.getElementById('weather-simulator-panel');
  const closeBtn = simulatorPanel.querySelector('.close-btn');
  const weatherOptions = document.querySelectorAll('.weather-option');
  
  // 天气效果容器
  const weatherEffects = document.createElement('div');
  weatherEffects.className = 'weather-effects';
  document.body.appendChild(weatherEffects);

  // 绑定天气模拟按钮事件
  seasonChangeBtn.addEventListener('click', function() {
    const isActive = simulatorPanel.classList.toggle('active');
    seasonChangeBtn.querySelector('.status-indicator').style.backgroundColor = 
      isActive ? '#4caf50' : '#8c8c8c';
  });

  // 绑定关闭按钮事件
  closeBtn.addEventListener('click', function() {
    simulatorPanel.classList.remove('active');
    seasonChangeBtn.querySelector('.status-indicator').style.backgroundColor = '#8c8c8c';
  });

  // 绑定天气选项点击事件
  weatherOptions.forEach(option => {
    option.addEventListener('click', function() {
      const weatherType = this.dataset.weather;
      weatherEffects.innerHTML = '';
      
      switch(weatherType) {
        case 'rain':
          createRainEffect(weatherEffects);
          break;
        case 'snow':
          createSnowEffect(weatherEffects);
          break;
        case 'hail':
          createHailEffect(weatherEffects);
          break;
        case 'sunny':
          createSunnyEffect(weatherEffects);
          break;
        case 'fog':
          createFogEffect(weatherEffects);
          break;
        default:
          console.log(`Unknown weather type: ${weatherType}`);
      }
    });
  });

  // 创建各种天气效果函数
  function createRainEffect(container) {
    for(let i = 0; i < 100; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(drop);
    }
  }

  function createSnowEffect(container) {
    for(let i = 0; i < 150; i++) {
      const flake = document.createElement('div');
      flake.className = 'snowflake';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${5 + Math.random() * 10}s`;
      flake.style.animationDelay = `${Math.random() * 5}s`;
      flake.style.opacity = Math.random();
      flake.style.transform = `scale(${0.5 + Math.random()})`;
      container.appendChild(flake);
    }
  }

  function createHailEffect(container) {
    for(let i = 0; i < 80; i++) {
      const hail = document.createElement('div');
      hail.className = 'hailstone';
      hail.style.left = `${Math.random() * 100}%`;
      hail.style.animationDuration = `${0.8 + Math.random() * 0.4}s`;
      hail.style.animationDelay = `${Math.random() * 2}s`;
      container.appendChild(hail);
    }
  }

  function createSunnyEffect(container) {
    const sun = document.createElement('div');
    sun.className = 'sun';
    container.appendChild(sun);
    
    for(let i = 0; i < 12; i++) {
      const ray = document.createElement('div');
      ray.className = 'sun-ray';
      ray.style.transform = `rotate(${i * 30}deg)`;
      sun.appendChild(ray);
    }
  }

  function createFogEffect(container) {
      // 添加雾层背景
      const fogLayer = document.createElement('div');
      fogLayer.className = 'fog-layer';
      container.appendChild(fogLayer);
      
      // 创建雾粒子
      for(let i = 0; i < 30; i++) {
        const fog = document.createElement('div');
        fog.className = 'fog-particle';
        fog.style.setProperty('--direction', Math.random() > 0.5 ? 1 : -1);
        fog.style.left = `${Math.random() * 100}%`;
        fog.style.width = `${80 + Math.random() * 80}px`;
        fog.style.height = fog.style.width;
        fog.style.animationDuration = `${30 + Math.random() * 30}s`;
        fog.style.animationDelay = `${Math.random() * 10}s`;
        container.appendChild(fog);
      }
  }
});

