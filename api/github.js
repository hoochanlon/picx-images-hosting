import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, path, content, message, sha, authToken } = req.body || {};
  if (!action || !path || !message) {
    return res.status(400).json({ error: 'missing params: action/path/message' });
  }

  // 对于所有写操作（上传、删除），验证API密钥（可选，如果设置了API_SECRET环境变量）
  if ((action === 'delete' || action === 'upload') && process.env.API_SECRET) {
    const expectedToken = process.env.API_SECRET;
    if (!authToken || authToken !== expectedToken) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
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

