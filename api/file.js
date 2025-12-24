export default async function handler(req, res) {
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

