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
          // 使用从服务器获取的登录 token（用户必须通过密码登录）
          const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
          if (authToken) {
            payload.authToken = authToken;
          }
          // 注意：不再使用 API_SECRET，因为它存储在客户端，不安全
          // 如果用户未登录，requireAuth 会要求用户输入密码
        }
      } else {
        // 没有 getGitHubToken 方法，使用密码认证
        // 使用从服务器获取的登录 token（用户必须通过密码登录）
        const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
        if (authToken) {
          payload.authToken = authToken;
        }
        // 注意：不再使用 API_SECRET，因为它存储在客户端，不安全
        // 如果用户未登录，requireAuth 会要求用户输入密码
      }
    }
    
    const res = await fetch(state.API_ENDPOINT(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      let errorMessage = `API 请求失败: HTTP ${res.status}`;
      let errorData = null;
      try {
        errorData = await res.json();
        // GitHub API 的错误信息可能在 message 字段中
        errorMessage = errorData.message || errorData.error || errorMessage;
        // 如果是字符串数组，合并它们
        if (Array.isArray(errorData.errors)) {
          const errors = errorData.errors.map(e => e.message || e).join('; ');
          if (errors) errorMessage = errors;
        }
      } catch (e) {
        const text = await res.text().catch(() => '');
        if (text) {
          try {
            // 尝试解析 JSON
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.error || text;
          } catch {
            errorMessage = text;
          }
        }
      }
      
      // 将错误数据和消息一起抛出，方便调用者判断
      const error = new Error(errorMessage);
      if (errorData) {
        error.data = errorData;
      }
      error.status = res.status;
      throw error;
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

// 生成时间戳格式的文件名（yyyyMMddHHmmss）
// 使用静态计数器确保批量上传时文件名唯一
let timestampCounter = 0;
let lastTimestamp = '';

function generateTimestampFilename(originalFilename, index = 0) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // 格式：yyyyMMddHHmmss
  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
  
  // 如果时间戳相同（同一秒内），使用计数器确保唯一性
  if (timestamp === lastTimestamp) {
    timestampCounter++;
  } else {
    timestampCounter = 0;
    lastTimestamp = timestamp;
  }
  
  // 获取原文件扩展名
  const lastDotIndex = originalFilename.lastIndexOf('.');
  const extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : '';
  
  // 如果计数器 > 0，添加序号以确保唯一性（格式：-1, -2, ...）
  const suffix = timestampCounter > 0 ? `-${timestampCounter}` : '';
  
  return `${timestamp}${suffix}${extension}`;
}

// 重置时间戳计数器（可选，用于新上传会话）
function resetTimestampCounter() {
  timestampCounter = 0;
  lastTimestamp = '';
}

// 导出到全局作用域
window.toBase64 = toBase64;
window.apiRequest = apiRequest;
window.fetchTree = fetchTree;
window.buildPath = buildPath;
window.getParentPath = getParentPath;
window.generateTimestampFilename = generateTimestampFilename;
window.resetTimestampCounter = resetTimestampCounter;

})();
