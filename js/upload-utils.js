// upload-utils.js - 工具函数

(function() {
  'use strict';
  const state = window.uploadState;

// 将文件转换为 Base64
async function toBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// API 请求
async function apiRequest(payload) {
  try {
    // 对于所有写操作（上传、删除），添加认证token
    if ((payload.action === 'delete' || payload.action === 'upload') && window.uploadAuth) {
      // 优先使用 GitHub token（如果存在该方法且返回了token）
      if (typeof window.uploadAuth.getGitHubToken === 'function') {
        const githubToken = window.uploadAuth.getGitHubToken();
        if (githubToken) {
          payload.githubToken = githubToken;
        } else {
          // GitHub token 不存在，使用密码认证
          const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
          if (authToken) {
            payload.authToken = authToken;
          }
          // 如果设置了API_SECRET，使用密码hash作为token
          if (window.APP_CONFIG?.API_SECRET) {
            payload.authToken = window.APP_CONFIG.API_SECRET;
          }
        }
      } else {
        // 没有 getGitHubToken 方法，使用密码认证
        const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
        if (authToken) {
          payload.authToken = authToken;
        }
        // 如果设置了API_SECRET，使用密码hash作为token
        if (window.APP_CONFIG?.API_SECRET) {
          payload.authToken = window.APP_CONFIG.API_SECRET;
        }
      }
    }
    
    const res = await fetch(state.API_ENDPOINT(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      let errorMessage = `API 请求失败: HTTP ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const text = await res.text().catch(() => '');
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (err) {
    // 处理网络错误
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络连接或稍后重试');
    }
    throw err;
  }
}

// 获取仓库树
async function fetchTree() {
  const url = `${state.API_BASE()}/api/tree`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const hint = body.message || `HTTP ${res.status}`;
    throw new Error(`获取仓库树失败：${hint}`);
  }
  return res.json();
}

// 构建路径
function buildPath(...parts) {
  const filtered = parts.filter(p => p && p.trim());
  if (filtered.length === 0) return '';
  // 确保路径格式正确，移除多余的斜杠
  let path = filtered.join('/').replace(/\/+/g, '/');
  // 移除开头的斜杠（GitHub API 不需要）
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return path;
}

// 获取父路径
function getParentPath(path) {
  if (!path) return '';
  const parts = path.split('/').filter(p => p);
  parts.pop();
  return parts.join('/');
}

// 导出到全局作用域
window.toBase64 = toBase64;
window.apiRequest = apiRequest;
window.fetchTree = fetchTree;
window.buildPath = buildPath;
window.getParentPath = getParentPath;

})();
