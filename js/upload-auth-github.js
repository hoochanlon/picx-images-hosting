// upload-auth-github.js - GitHub OAuth 认证系统

(function() {
  'use strict';

// 认证状态存储键名
const GITHUB_TOKEN_KEY = 'github_oauth_token';
const GITHUB_USER_KEY = 'github_oauth_user';
const GITHUB_EXPIRES_KEY = 'github_oauth_expires';

// 生成随机状态码（用于防止CSRF攻击）
function generateState() {
  return btoa(Date.now().toString() + Math.random().toString()).substring(0, 32);
}

// 检查是否已授权
function isAuthenticated() {
  // 检查是否配置了 GitHub OAuth
  const hasGitHubOAuth = window.APP_CONFIG?.GITHUB_OAUTH_CLIENT_ID;
  
  if (!hasGitHubOAuth) {
    // 如果没有配置 GitHub OAuth，使用密码认证
    if (window.uploadAuth && window.uploadAuth.isAuthenticated) {
      return window.uploadAuth.isAuthenticated();
    }
    return false;
  }
  
  // 使用 GitHub OAuth 认证
  const token = localStorage.getItem(GITHUB_TOKEN_KEY);
  const expiresAt = localStorage.getItem(GITHUB_EXPIRES_KEY);
  
  if (!token || !expiresAt) {
    return false;
  }
  
  // 检查是否过期（GitHub token 通常不过期，但我们设置一个检查时间）
  const now = Date.now();
  const expires = parseInt(expiresAt);
  
  // 如果设置了过期时间且已过期
  if (expires && now > expires) {
    clearAuth();
    return false;
  }
  
  return true;
}

// 清除认证信息
function clearAuth() {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
  localStorage.removeItem(GITHUB_USER_KEY);
  localStorage.removeItem(GITHUB_EXPIRES_KEY);
}

// 获取 GitHub token
function getGitHubToken() {
  // 检查是否配置了 GitHub OAuth
  const hasGitHubOAuth = window.APP_CONFIG?.GITHUB_OAUTH_CLIENT_ID;
  
  if (!hasGitHubOAuth) {
    return null;
  }
  
  if (!isAuthenticated()) {
    return null;
  }
  return localStorage.getItem(GITHUB_TOKEN_KEY);
}

// 获取用户信息
function getUserInfo() {
  const userStr = localStorage.getItem(GITHUB_USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (err) {
    return null;
  }
}

// 启动 GitHub OAuth 流程
function startGitHubOAuth() {
  const clientId = window.APP_CONFIG?.GITHUB_OAUTH_CLIENT_ID;
  const apiBase = window.APP_CONFIG?.VERCEL_API_BASE || window.uploadState?.API_BASE();
  
  if (!clientId) {
    alert('GitHub OAuth 未配置。请在 config.js 中设置 GITHUB_OAUTH_CLIENT_ID');
    return;
  }

  // 生成 state 用于防止 CSRF
  const state = generateState();
  sessionStorage.setItem('github_oauth_state', state);

  // 构建授权 URL
  const redirectUri = `${apiBase}/api/github-oauth?action=callback`;
  const scope = 'repo'; // 需要 repo 权限
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

  // 打开授权窗口
  const width = 600;
  const height = 700;
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  
  const authWindow = window.open(
    authUrl,
    'GitHub授权',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  // 监听来自授权窗口的消息
  const messageHandler = (event) => {
    // 验证来源（生产环境应该验证 origin）
    if (event.data && event.data.type === 'github-oauth-success') {
      const { accessToken, user, hasAccess } = event.data;
      
      if (!hasAccess) {
        alert('授权失败：您没有访问此仓库的权限');
        authWindow.close();
        window.removeEventListener('message', messageHandler);
        return;
      }

      // 保存 token 和用户信息
      localStorage.setItem(GITHUB_TOKEN_KEY, accessToken);
      localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(user));
      // GitHub token 通常不过期，但我们设置一个较长的过期时间（30天）
      localStorage.setItem(GITHUB_EXPIRES_KEY, (Date.now() + 30 * 24 * 60 * 60 * 1000).toString());
      
      authWindow.close();
      window.removeEventListener('message', messageHandler);
      
      // 触发认证成功事件
      if (window.onGitHubAuthSuccess) {
        window.onGitHubAuthSuccess({ user, token: accessToken });
      }
    }
  };

  window.addEventListener('message', messageHandler);

  // 检查窗口是否被关闭（用户取消授权）
  const checkClosed = setInterval(() => {
    if (authWindow.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageHandler);
    }
  }, 1000);
}

// 验证 token 是否有效
async function verifyToken() {
  const token = getGitHubToken();
  if (!token) {
    return false;
  }

  try {
    const apiBase = window.APP_CONFIG?.VERCEL_API_BASE || window.uploadState?.API_BASE();
    const response = await fetch(`${apiBase}/api/github-oauth?action=verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      clearAuth();
      return false;
    }

    const data = await response.json();
    if (data.valid && data.hasAccess) {
      // 更新用户信息
      if (data.user) {
        localStorage.setItem(GITHUB_USER_KEY, JSON.stringify(data.user));
      }
      return true;
    }

    clearAuth();
    return false;
  } catch (err) {
    console.error('Token verification error:', err);
    return false;
  }
}

// 显示授权对话框
function showAuthDialog(callback) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;
  
  const modalContent = document.createElement('div');
  modalContent.className = 'auth-modal-content';
  modalContent.style.cssText = `
    background: ${isDark ? '#161b22' : '#fff'};
    border-radius: 12px;
    padding: 32px;
    max-width: 450px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    border: ${isDark ? '1px solid rgba(48, 54, 61, 0.8)' : 'none'};
  `;
  
  modalContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 3rem; margin-bottom: 12px;">🔐</div>
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: ${isDark ? '#f0f6fc' : '#24292f'};">
        GitHub 授权验证
      </h2>
      <p style="margin: 12px 0 0 0; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.9rem; line-height: 1.5;">
        需要通过 GitHub 授权来验证您的身份<br/>
        只有授权用户才能进行写操作
      </p>
    </div>
    <div style="margin-bottom: 24px; padding: 16px; background: ${isDark ? 'rgba(13, 17, 23, 0.5)' : '#f6f8fa'}; border-radius: 8px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="font-size: 1.2rem;">✅</div>
        <div style="flex: 1; color: ${isDark ? '#f0f6fc' : '#24292f'}; font-size: 0.9rem;">
          安全可靠，使用 GitHub 官方 OAuth
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
        <div style="font-size: 1.2rem;">🔒</div>
        <div style="flex: 1; color: ${isDark ? '#f0f6fc' : '#24292f'}; font-size: 0.9rem;">
          仅需要仓库访问权限
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 1.2rem;">⏰</div>
        <div style="flex: 1; color: ${isDark ? '#f0f6fc' : '#24292f'}; font-size: 0.9rem;">
          授权后长期有效，无需重复授权
        </div>
      </div>
    </div>
    <div style="display: flex; gap: 12px; margin-top: 24px;">
      <button 
        id="auth-cancel-btn"
        style="
          flex: 1;
          padding: 12px 16px;
          border: 1px solid ${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'};
          background: ${isDark ? 'rgba(33, 38, 45, 0.8)' : '#fff'};
          color: ${isDark ? '#f0f6fc' : '#24292f'};
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.background='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#f6f8fa'}'"
        onmouseout="this.style.background='${isDark ? 'rgba(33, 38, 45, 0.8)' : '#fff'}'"
      >取消</button>
      <button 
        id="auth-github-btn"
        style="
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: #24292e;
          color: #fff;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        "
        onmouseover="this.style.background='#2f363d'"
        onmouseout="this.style.background='#24292e'"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        使用 GitHub 授权
      </button>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  const cancelBtn = modalContent.querySelector('#auth-cancel-btn');
  const githubBtn = modalContent.querySelector('#auth-github-btn');
  
  // 取消按钮
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    callback(false);
  });
  
  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      callback(false);
    }
  });
  
  // GitHub 授权按钮
  githubBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
    startGitHubOAuth();
    
    // 监听授权成功事件
    const successHandler = () => {
      callback(true);
      window.removeEventListener('github-auth-success', successHandler);
    };
    window.addEventListener('github-auth-success', successHandler);
    
    // 设置超时，如果用户关闭窗口则取消
    setTimeout(() => {
      window.removeEventListener('github-auth-success', successHandler);
    }, 300000); // 5分钟超时
  });
}

// 要求认证（如果未认证则显示授权对话框）
function requireAuth(callback) {
  // 检查是否配置了 GitHub OAuth
  const hasGitHubOAuth = window.APP_CONFIG?.GITHUB_OAUTH_CLIENT_ID;
  
  if (!hasGitHubOAuth) {
    // 如果没有配置 GitHub OAuth，回退到密码认证
    if (window.uploadAuth && window.uploadAuth.requireAuth) {
      // 使用密码认证（upload-auth-oauth.js 会处理）
      window.uploadAuth.requireAuth(callback);
      return;
    }
    callback(false);
    return;
  }
  
  // 使用 GitHub OAuth 认证
  // 先验证现有 token
  verifyToken().then(valid => {
    if (valid && isAuthenticated()) {
      callback(true);
      return;
    }
    
    // 如果 token 无效或不存在，显示授权对话框
    showAuthDialog(callback);
  }).catch(() => {
    // 验证失败，显示授权对话框
    showAuthDialog(callback);
  });
}

// 显示授权状态信息
function getAuthStatus() {
  if (!isAuthenticated()) {
    return { authenticated: false, user: null };
  }
  
  const user = getUserInfo();
  const expiresAt = parseInt(localStorage.getItem(GITHUB_EXPIRES_KEY));
  const remaining = expiresAt - Date.now();
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  
  return {
    authenticated: true,
    user: user,
    expiresAt: expiresAt,
    remaining: remaining,
    days: days
  };
}

// 监听授权成功事件
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'github-oauth-success') {
    const customEvent = new CustomEvent('github-auth-success');
    window.dispatchEvent(customEvent);
  }
});

// 导出到全局作用域
// 如果配置了 GitHub OAuth，使用 GitHub 认证
// 否则保留原有的 uploadAuth（由 upload-auth-oauth.js 提供）
const hasGitHubOAuth = window.APP_CONFIG?.GITHUB_OAUTH_CLIENT_ID;

if (hasGitHubOAuth) {
  // 使用 GitHub OAuth 认证
  window.uploadAuth = {
    isAuthenticated: isAuthenticated,
    requireAuth: requireAuth,
    clearAuth: clearAuth,
    getGitHubToken: getGitHubToken,
    getUserInfo: getUserInfo,
    getAuthStatus: getAuthStatus,
    showAuthDialog: showAuthDialog,
    startGitHubOAuth: startGitHubOAuth,
    verifyToken: verifyToken
  };
} else {
  // 如果没有配置 GitHub OAuth，等待 upload-auth-oauth.js 加载
  // upload-auth-oauth.js 会在后面加载并设置 window.uploadAuth
  console.log('GitHub OAuth not configured, will use password authentication');
}

})();

