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
    
    // 如果 GitHub token 验证失败，回退到 API_SECRET 验证
    if (!isAuthorized && process.env.API_SECRET) {
      const expectedToken = process.env.API_SECRET;
      if (authToken && authToken === expectedToken) {
        isAuthorized = true;
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

