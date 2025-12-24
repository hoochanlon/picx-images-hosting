export default async function handler(req, res) {
  // 设置 CORS 头，允许跨域请求
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://hoochanlon.github.io',
    'https://blog.hoochanlon.moe',
    'https://picx-images-hosting-brown.vercel.app',
    'http://localhost:3000',
    'http://localhost:8000'
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ error: 'missing param: path' });
  }

  const owner = 'hoochanlon';
  const repo = 'picx-images-hosting';

  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  const ghRes = await fetch(api, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'vercel-fn',
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
    },
  });

  const data = await ghRes.json().catch(() => ({}));
  return res.status(ghRes.status).json(data);
}

