import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, path, content, message, sha, authToken, githubToken } = req.body || {};
  if (!action || !path || !message) {
    return res.status(400).json({ error: 'missing params: action/path/message' });
  }

  // 对于所有写操作（上传、删除），验证认证
  if (action === 'delete' || action === 'upload') {
    let isAuthorized = false;
    
    // 优先验证 GitHub token
    if (githubToken) {
      try {
        // 验证 GitHub token 是否有效
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const owner = process.env.GITHUB_REPO_OWNER || 'hoochanlon';
          const repo = process.env.GITHUB_REPO_NAME || 'picx-images-hosting';
          
          // 检查用户是否有仓库访问权限
          const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });

          if (repoResponse.ok) {
            isAuthorized = true;
          }
        }
      } catch (err) {
        console.error('GitHub token verification error:', err);
      }
    }
    
    // 如果 GitHub token 验证失败，回退到 API_SECRET 或密码 token 验证
    if (!isAuthorized) {
      // 优先验证 API_SECRET
      if (process.env.API_SECRET) {
        const expectedToken = process.env.API_SECRET;
        if (authToken && authToken === expectedToken) {
          isAuthorized = true;
        }
      }
      
      // 如果 API_SECRET 验证失败，检查是否是密码验证的 token
      // 如果设置了 PASSWORD 但没有设置 API_SECRET，接受从 verify-password API 返回的 token
      // 因为前端已经通过密码验证获取了这个 token
      if (!isAuthorized && authToken && process.env.PASSWORD && !process.env.API_SECRET) {
        // 验证 token 格式：应该是 base64 编码的字符串
        // 从 verify-password API 返回的 token 格式是：Buffer.from(`${Date.now()}:${Math.random()}`).toString('base64')
        try {
          // 尝试解码 token，如果能解码说明格式正确
          const decoded = Buffer.from(authToken, 'base64').toString();
          // 检查是否包含时间戳（格式应该是 timestamp:random）
          if (decoded.includes(':') && decoded.split(':').length === 2) {
            const parts = decoded.split(':');
            const timestamp = parseInt(parts[0]);
            // 检查时间戳是否在合理范围内（24小时内）
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24小时
            if (!isNaN(timestamp) && (now - timestamp) < maxAge && (now - timestamp) >= 0) {
              isAuthorized = true;
            }
          }
        } catch (e) {
          // token 格式无效，不授权
        }
      }
    }
    
    // 如果都没有通过验证，拒绝请求
    if (!isAuthorized) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
  }

  const owner = 'hoochanlon';
  const repo = 'picx-images-hosting';
  const branch = 'master';

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
  const isDelete = action === 'delete';
  const payload = isDelete
    ? { message, sha, branch }
    : { message, content, branch };

  const ghRes = await fetch(api, {
    method: isDelete ? 'DELETE' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'vercel-fn',
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await ghRes.json().catch(() => ({}));
  return res.status(ghRes.status).json(data);
}

