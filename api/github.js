import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, path, content, message, sha } = req.body || {};
  if (!action || !path || !message) {
    return res.status(400).json({ error: 'missing params: action/path/message' });
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

