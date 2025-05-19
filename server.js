import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// 模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 指定 Cesium 资源所在目录
const cesiumSource = path.join(__dirname, 'node_modules', 'cesium', 'Build', 'Cesium');

// 允许从 /Cesium 路径访问 cesiumSource 下的所有静态文件
app.use('/Cesium', express.static(cesiumSource));

// 添加这行代码用于指定我们新建的文件地址
app.use('/jsfile', express.static(path.join(__dirname, 'jsfile')));
app.use('/models', express.static(path.join(__dirname, 'models')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// 返回 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle favicon.ico requests to avoid 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).send(); // No Content
});

// 添加天气API代理接口（避免前端直接暴露Key）
app.get('/api/weather', async (req, res) => {
  console.log('收到天气API请求', req.query);
  try {
    const city = req.query.city || req.query.location || '510100';
    const key = 'a49e1cb39e185e83ae4b6c426f40b5bf';

    // 实时天气
    const urlNow = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${key}&extensions=base`;
    // 预报天气
    const urlForecast = `https://restapi.amap.com/v3/weather/weatherInfo?city=${city}&key=${key}&extensions=all`;

    const [resNow, resForecast] = await Promise.all([
      fetch(urlNow),
      fetch(urlForecast)
    ]);
    const dataNow = await resNow.json();
    const dataForecast = await resForecast.json();

    // 合并数据
    res.json({
      lives: dataNow.lives,
      forecasts: dataForecast.forecasts
    });
  } catch (error) {
    console.error('高德天气API代理错误:', error);
    res.status(500).json({ error: '获取天气数据失败', details: error.message });
  }
});

// 启动服务
const port = 8000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});