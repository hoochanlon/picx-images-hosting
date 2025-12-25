// upload-config.js - 配置和状态管理

// 仓库配置
const REPO_OWNER = 'hoochanlon';
const REPO_NAME = 'picx-images-hosting';
const BRANCH = 'master';
const PAGES_BASE = `https://${REPO_OWNER}.github.io/${REPO_NAME}`;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}`;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg)$/i;

// 应用配置
const config = window.APP_CONFIG || {
  VERCEL_API_BASE: 'https://picx-images-hosting-brown.vercel.app',
  CUSTOM_DOMAINS: ['blog.hoochanlon.moe'],
  GITHUB_PAGES_PATTERN: /\.github\.io$/,
  GITHUB_REPO_URL: 'https://github.com/hoochanlon/picx-images-hosting'
};

// 环境检测
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isVercelDev = isLocalhost && (window.location.port === '3000' || window.location.port === '3001');
const isGitHubPages = config.GITHUB_PAGES_PATTERN.test(window.location.hostname);
const isCustomDomain = config.CUSTOM_DOMAINS.includes(window.location.hostname);
const VERCEL_API_BASE = config.VERCEL_API_BASE;

// API 配置
const API_BASE = isLocalhost && !isVercelDev
  ? VERCEL_API_BASE
  : (isGitHubPages || isCustomDomain)
  ? VERCEL_API_BASE
  : window.location.origin;
const API_ENDPOINT = `${API_BASE}/api/github`;

// 状态变量
let currentPath = '';
let files = [];
let folders = [];

// 导出到全局作用域，供其他模块使用
window.uploadState = {
  // 配置常量
  REPO_OWNER: () => REPO_OWNER,
  REPO_NAME: () => REPO_NAME,
  BRANCH: () => BRANCH,
  PAGES_BASE: () => PAGES_BASE,
  CDN_BASE: () => CDN_BASE,
  IMAGE_EXT: () => IMAGE_EXT,
  API_BASE: () => API_BASE,
  API_ENDPOINT: () => API_ENDPOINT,
  isLocalhost: () => isLocalhost,
  isVercelDev: () => isVercelDev,
  
  // 状态管理
  currentPath: () => currentPath,
  setCurrentPath: (path) => { currentPath = path; },
  files: () => files,
  setFiles: (newFiles) => { files = newFiles; },
  folders: () => folders,
  setFolders: (newFolders) => { folders = newFolders; },
  
  // DOM 元素（使用 getter 函数，确保在 DOM 加载后获取）
  fileListEl: () => document.getElementById('file-list'),
  breadcrumbEl: () => document.getElementById('breadcrumb'),
  uploadAreaEl: () => document.getElementById('upload-area'),
  fileInputEl: () => document.getElementById('file-input'),
  uploadProgressEl: () => document.getElementById('upload-progress'),
  createFolderBtn: () => document.getElementById('create-folder-btn'),
  uploadFilesBtn: () => document.getElementById('upload-files-btn'),
  createFolderModal: () => document.getElementById('create-folder-modal'),
  renameModal: () => document.getElementById('rename-modal'),
  folderNameInput: () => document.getElementById('folder-name-input'),
  renameInput: () => document.getElementById('rename-input')
};

// 设置 GitHub 链接（在 DOM 加载后执行）
function setupGitHubLink() {
  const githubLink = document.getElementById('github-link');
  if (githubLink) {
    githubLink.href = config.GITHUB_REPO_URL || 'https://github.com/hoochanlon/picx-images-hosting';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupGitHubLink);
} else {
  setupGitHubLink();
}

