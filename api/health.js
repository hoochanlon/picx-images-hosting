import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const owner = 'hoochanlon';
  const repo = 'picx-images-hosting';
  const branch = 'master';
  const startTime = Date.now();

  // 检查各个 API 端点的健康状态
  const checks = {
    github_api: { status: 'unknown', responseTime: 0, error: null },
    tree_api: { status: 'unknown', responseTime: 0, error: null },
    config_api: { status: 'unknown', responseTime: 0, error: null },
  };

  // 1. 检查 GitHub API 连接
  try {
    const ghStartTime = Date.now();
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'User-Agent': 'vercel-health-check',
        Authorization: `Bearer ${process.env.GH_TOKEN}`,
      },
    });
    checks.github_api.responseTime = Date.now() - ghStartTime;
    checks.github_api.status = ghRes.ok ? 'healthy' : 'unhealthy';
    if (!ghRes.ok) {
      const errorData = await ghRes.json().catch(() => ({}));
      checks.github_api.error = errorData.message || `HTTP ${ghRes.status}`;
    }
  } catch (error) {
    checks.github_api.status = 'error';
    checks.github_api.error = error.message;
  }

  // 2. 检查 Tree API（通过 GitHub API）
  try {
    const treeStartTime = Date.now();
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          'User-Agent': 'vercel-health-check',
          Authorization: `Bearer ${process.env.GH_TOKEN}`,
        },
      }
    );
    checks.tree_api.responseTime = Date.now() - treeStartTime;
    checks.tree_api.status = treeRes.ok ? 'healthy' : 'unhealthy';
    if (!treeRes.ok) {
      const errorData = await treeRes.json().catch(() => ({}));
      checks.tree_api.error = errorData.message || `HTTP ${treeRes.status}`;
    }
  } catch (error) {
    checks.tree_api.status = 'error';
    checks.tree_api.error = error.message;
  }

  // 3. 检查环境变量配置
  try {
    const hasGhToken = !!process.env.GH_TOKEN;
    checks.config_api.status = hasGhToken ? 'healthy' : 'unhealthy';
    checks.config_api.error = hasGhToken ? null : 'GH_TOKEN 环境变量未设置';
  } catch (error) {
    checks.config_api.status = 'error';
    checks.config_api.error = error.message;
  }

  // 计算总体健康状态
  const allHealthy = Object.values(checks).every(
    (check) => check.status === 'healthy'
  );
  const overallStatus = allHealthy ? 'healthy' : 'degraded';

  const totalTime = Date.now() - startTime;

  return res.status(200).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    responseTime: totalTime,
    checks,
    environment: {
      hasGhToken: !!process.env.GH_TOKEN,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  });
}

