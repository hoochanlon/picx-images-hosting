// 配置和常量
const REPO_OWNER = 'hoochanlon';
const REPO_NAME = 'picx-images-hosting';
const BRANCH = 'master';
const PAGES_BASE = `https://${REPO_OWNER}.github.io/${REPO_NAME}`;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}`;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg)$/i;
const EXCLUDES = ['.git/', '.github/'];

// 自动检测 API 基础地址
// vercel dev 运行时（localhost:3000）使用本地 API
// GitHub Pages 和自定义域名使用 Vercel 部署的 API（因为 GitHub Pages 不支持 Serverless Functions）
// Vercel 部署使用当前域名
const config = window.APP_CONFIG || {
  VERCEL_API_BASE: 'https://picx-images-hosting-brown.vercel.app',
  CUSTOM_DOMAINS: ['blog.hoochanlon.moe'],
  GITHUB_PAGES_PATTERN: /\.github\.io$/,
  DEFAULT_UPLOAD_DIR: 'imgs/uploads/kate/',
  INCLUDED_DIRS: ['imgs']
};

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isVercelDev = isLocalhost && window.location.port === '3000';
const isGitHubPages = config.GITHUB_PAGES_PATTERN.test(window.location.hostname);
const isCustomDomain = config.CUSTOM_DOMAINS.includes(window.location.hostname);
const VERCEL_API_BASE = config.VERCEL_API_BASE;

const API_BASE = isLocalhost && !isVercelDev
  ? VERCEL_API_BASE
  : (isGitHubPages || isCustomDomain)
  ? VERCEL_API_BASE
  : window.location.origin;
const API_ENDPOINT = `${API_BASE}/api/github`;

// 将 API_BASE 暴露到全局作用域，供其他脚本使用（如 status.js）
window.API_BASE = API_BASE;

// 默认上传目录，从配置文件读取，如果没有则使用默认值
const DEFAULT_DIR = config.DEFAULT_UPLOAD_DIR || 'imgs/uploads/kate/';

const ITEMS_PER_PAGE = 100;

