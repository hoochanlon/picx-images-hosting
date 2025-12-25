// CORS 配置
// 允许的域名列表，可以从环境变量、配置文件或默认值读取

import fs from 'fs';
import path from 'path';

// 从环境变量读取，如果没有则从配置文件读取，最后使用默认值
const getAllowedOrigins = () => {
  // 优先级1: 环境变量（用逗号分隔）
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  
  // 优先级2: 从配置文件读取
  try {
    const configPath = path.join(process.cwd(), 'api-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    if (config.allowedOrigins && Array.isArray(config.allowedOrigins)) {
      return config.allowedOrigins;
    }
  } catch (error) {
    // 配置文件不存在或读取失败，使用默认值
    console.warn('无法读取 api-config.json，使用默认配置:', error.message);
  }
  
  // 优先级3: 默认允许的域名
  return [
    'https://hoochanlon.github.io',
    'https://blog.hoochanlon.moe',
    'https://picx-images-hosting-brown.vercel.app',
    'http://localhost:3000',
    'http://localhost:8000'
  ];
};

// 设置 CORS 头的辅助函数
export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  // 检查 origin 是否在允许列表中（支持精确匹配和通配符）
  let isAllowed = false;
  if (origin) {
    // 精确匹配
    if (allowedOrigins.includes(origin)) {
      isAllowed = true;
    } else {
      // 支持通配符匹配（如 https://*.example.com）
      for (const allowedOrigin of allowedOrigins) {
        if (allowedOrigin.includes('*')) {
          const pattern = allowedOrigin.replace(/\*/g, '.*');
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(origin)) {
            isAllowed = true;
            break;
          }
        }
      }
    }
  }
  
  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // 返回 true 表示已处理 OPTIONS 请求
  }
  
  return false; // 返回 false 表示继续处理其他请求
}

