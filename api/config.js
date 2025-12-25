// 配置 API - 从环境变量读取配置并返回给前端
import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 从环境变量读取配置（只返回前端需要的、不敏感的信息）
    const config = {
      // GitHub OAuth Client ID（可以暴露，因为这是公开的）
      GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID || '',
      
      // 注意：DELETE_PASSWORD 和 API_SECRET 不应该通过 API 返回
      // 这些敏感信息应该只在服务器端使用
      // 如果前端需要验证密码，应该通过专门的认证 API
    };

    return res.status(200).json(config);
  } catch (err) {
    console.error('Config API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 密码验证 API - 验证前端提交的密码是否与 Vercel 环境变量中的密码匹配
export async function verifyPassword(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body || {};
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // 从环境变量读取密码（如果设置了）
    const envPassword = process.env.DELETE_PASSWORD;
    
    if (!envPassword) {
      // 如果环境变量中没有设置密码，返回错误
      return res.status(500).json({ error: 'Password not configured on server' });
    }

    // 验证密码
    const isValid = password === envPassword;

    if (isValid) {
      // 生成一个临时 token（24小时有效）
      const token = Buffer.from(`${Date.now()}:${Math.random()}`).toString('base64');
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24小时

      return res.status(200).json({
        valid: true,
        token: token,
        expiresAt: expiresAt
      });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } catch (err) {
    console.error('Password verification error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

