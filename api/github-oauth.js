// GitHub OAuth 认证 API
import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }

  const { action, code, state } = req.query || req.body || {};

  // 获取授权码（OAuth 回调）
  if (req.method === 'GET' && action === 'callback' && code) {
    try {
      const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
      const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
      
      // 构建回调 URL
      let redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI;
      if (!redirectUri) {
        // 从请求头获取 origin
        const origin = req.headers.origin || req.headers.referer;
        if (origin) {
          // 移除 referer 中的路径部分，只保留 origin
          const originUrl = origin.includes('://') ? origin.split('/').slice(0, 3).join('/') : origin;
          redirectUri = `${originUrl}/api/github-oauth?action=callback`;
        } else {
          return res.status(500).json({ error: 'Unable to determine redirect URI' });
        }
      }

      if (!clientId || !clientSecret) {
        return res.status(500).json({ 
          error: 'GitHub OAuth not configured. Please set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET' 
        });
      }

      // 用授权码换取 access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return res.status(400).json({ error: tokenData.error_description || tokenData.error });
      }

      if (!tokenData.access_token) {
        return res.status(400).json({ error: 'Failed to get access token' });
      }

      // 验证 token 并获取用户信息
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        return res.status(401).json({ error: 'Failed to verify token' });
      }

      const userData = await userResponse.json();

      // 检查用户是否有仓库访问权限
      const owner = process.env.GITHUB_REPO_OWNER || 'hoochanlon';
      const repo = process.env.GITHUB_REPO_NAME || 'picx-images-hosting';
      
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const hasAccess = repoResponse.ok;

      // 返回 token 和用户信息（前端会处理重定向）
      const responseHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>授权成功</title>
          <meta charset="utf-8">
        </head>
        <body>
          <script>
            // 将 token 传递给父窗口
            window.opener.postMessage({
              type: 'github-oauth-success',
              accessToken: '${tokenData.access_token}',
              user: ${JSON.stringify(userData)},
              hasAccess: ${hasAccess}
            }, '*');
            window.close();
          </script>
          <p>授权成功，正在关闭窗口...</p>
        </body>
        </html>
      `;

      return res.status(200).send(responseHtml);
    } catch (err) {
      console.error('OAuth callback error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 验证 token
  if (req.method === 'POST' && action === 'verify') {
    const { token } = req.body || {};
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      // 验证 token 是否有效
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const userData = await userResponse.json();

      // 检查用户是否有仓库访问权限
      const owner = process.env.GITHUB_REPO_OWNER || 'hoochanlon';
      const repo = process.env.GITHUB_REPO_NAME || 'picx-images-hosting';
      
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const hasAccess = repoResponse.ok;

      return res.status(200).json({
        valid: true,
        user: userData,
        hasAccess: hasAccess
      });
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
}

