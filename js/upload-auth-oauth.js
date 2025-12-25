// upload-auth-oauth.js - GitHub OAuth 风格的认证系统

(function() {
  'use strict';

// 认证状态存储键名
const AUTH_STATE_KEY = 'upload_oauth_state';
const AUTH_TOKEN_KEY = 'upload_oauth_token';
const AUTH_EXPIRES_KEY = 'upload_oauth_expires';

// 生成随机状态码（用于防止CSRF攻击）
function generateState() {
  return btoa(Date.now().toString() + Math.random().toString()).substring(0, 32);
}

// 生成认证token（基于密码、时间戳和随机数）
function generateAuthToken(password) {
  const timestamp = Date.now();
  const random = Math.random().toString();
  const data = `${password}:${timestamp}:${random}`;
  return btoa(data);
}

// 验证token是否有效
function validateToken(token) {
  try {
    const data = atob(token);
    const parts = data.split(':');
    if (parts.length !== 3) return false;
    
    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const expiresIn = 24 * 60 * 60 * 1000; // 24小时
    
    // 检查是否过期
    if (now - timestamp > expiresIn) {
      return false;
    }
    
    return true;
  } catch (err) {
    return false;
  }
}

// 显示授权对话框（类似GitHub OAuth授权页面）
function showAuthDialog(callback) {
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
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  `;
  
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    modalContent.style.background = '#161b22';
    modalContent.style.color = '#f0f6fc';
    modalContent.style.border = '1px solid rgba(48, 54, 61, 0.8)';
  }
  
  modalContent.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 2rem; margin-bottom: 8px;">🔐</div>
      <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">授权验证</h2>
      <p style="margin: 8px 0 0 0; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.9rem;">
        请输入授权密码以继续操作
      </p>
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500; font-size: 0.95rem;">
        授权密码：
      </label>
      <input 
        type="password" 
        id="auth-password-input" 
        placeholder="请输入密码"
        style="
          width: 100%;
          padding: 10px 12px;
          border: 1px solid ${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'};
          border-radius: 6px;
          font-size: 0.95rem;
          background: ${isDark ? 'rgba(13, 17, 23, 0.9)' : '#fff'};
          color: ${isDark ? '#f0f6fc' : '#24292f'};
          outline: none;
          box-sizing: border-box;
        "
        autocomplete="off"
      />
    </div>
    <div style="display: flex; gap: 12px; margin-top: 24px;">
      <button 
        id="auth-cancel-btn"
        style="
          flex: 1;
          padding: 10px 16px;
          border: 1px solid ${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'};
          background: ${isDark ? 'rgba(33, 38, 45, 0.8)' : '#fff'};
          color: ${isDark ? '#f0f6fc' : '#24292f'};
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
        "
      >取消</button>
      <button 
        id="auth-confirm-btn"
        style="
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: #238636;
          color: #fff;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
        "
      >授权</button>
    </div>
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'};">
      <p style="margin: 0; font-size: 0.85rem; color: ${isDark ? '#8b949e' : '#57606a'};">
        💡 授权后24小时内无需重复输入
      </p>
    </div>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  const passwordInput = modalContent.querySelector('#auth-password-input');
  const cancelBtn = modalContent.querySelector('#auth-cancel-btn');
  const confirmBtn = modalContent.querySelector('#auth-confirm-btn');
  
  // 自动聚焦输入框
  setTimeout(() => passwordInput.focus(), 100);
  
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
  
  // 确认按钮
  const handleConfirm = async () => {
    const password = passwordInput.value.trim();
    
    if (!password) {
      passwordInput.style.borderColor = '#cf222e';
      passwordInput.focus();
      setTimeout(() => {
        passwordInput.style.borderColor = isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de';
      }, 1000);
      return;
    }
    
    // 禁用按钮，显示加载状态
    confirmBtn.disabled = true;
    confirmBtn.textContent = '验证中...';
    
    try {
      // 优先使用 API 验证（从 Vercel 环境变量读取）
      const apiBase = window.APP_CONFIG?.VERCEL_API_BASE || 
                     (window.location.hostname === 'localhost' 
                       ? 'http://localhost:3000' 
                       : window.location.origin);
      
      const response = await fetch(`${apiBase}/api/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.token) {
          // 保存服务器返回的 token
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(AUTH_EXPIRES_KEY, data.expiresAt.toString());
          
          document.body.removeChild(modal);
          callback(true);
          return;
        }
      } else if (response.status === 401) {
        // 密码错误，不回退到本地验证
        const errorData = await response.json().catch(() => ({}));
        passwordInput.value = '';
        passwordInput.style.borderColor = '#cf222e';
        passwordInput.placeholder = errorData.error || '密码错误，请重试';
        passwordInput.focus();
        setTimeout(() => {
          passwordInput.style.borderColor = isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de';
          passwordInput.placeholder = '请输入密码';
        }, 2000);
        
        // 恢复按钮
        confirmBtn.disabled = false;
        confirmBtn.textContent = '确认';
        return;
      } else if (response.status === 404) {
        // 服务器未配置密码（404 表示未找到配置），允许回退到本地验证
        const errorData = await response.json().catch(() => ({}));
        console.log('Server password not configured, using local config:', errorData.error);
        // 继续执行后面的本地验证逻辑
      } else {
        // 其他错误（500等），可能是服务器错误，但如果有 Vercel 配置，不应该回退
        // 检查是否是网络错误还是服务器错误
        const errorData = await response.json().catch(() => ({}));
        console.warn('API password verification error:', response.status, errorData);
        // 如果是服务器错误且有配置，不应该回退
        // 只有网络错误或明确未配置时才回退
        if (response.status >= 500) {
          // 服务器错误，可能是临时问题，不回退到本地验证
          passwordInput.value = '';
          passwordInput.style.borderColor = '#cf222e';
          passwordInput.placeholder = '服务器错误，请稍后重试';
          passwordInput.focus();
          setTimeout(() => {
            passwordInput.style.borderColor = isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de';
            passwordInput.placeholder = '请输入密码';
          }, 2000);
          
          // 恢复按钮
          confirmBtn.disabled = false;
          confirmBtn.textContent = '确认';
          return;
        }
      }
    } catch (err) {
      // API 请求失败（网络错误等）
      // 如果是网络错误，可能是 CORS 或连接问题
      // 这种情况下，如果 Vercel 配置了密码，不应该回退到本地验证
      // 只有明确知道服务器未配置密码时，才回退
      console.warn('API password verification network error:', err);
      
      // 检查是否是 CORS 错误或网络错误
      // 如果是，可能是开发环境或配置问题，不回退到本地验证
      passwordInput.value = '';
      passwordInput.style.borderColor = '#cf222e';
      passwordInput.placeholder = '无法连接到服务器，请检查网络';
      passwordInput.focus();
      setTimeout(() => {
        passwordInput.style.borderColor = isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de';
        passwordInput.placeholder = '请输入密码';
      }, 2000);
      
      // 恢复按钮
      confirmBtn.disabled = false;
      confirmBtn.textContent = '确认';
      return;
    }
    
    // 只有在服务器明确返回 404（未配置密码）时，才回退到本地配置验证
    // 这是为了兼容旧版本或开发环境
    // 如果 API 返回了其他状态码（如 401、500），说明服务器已配置密码，不应该回退
    const correctPassword = window.APP_CONFIG?.DELETE_PASSWORD || 'admin123';
    if (password !== correctPassword) {
      passwordInput.value = '';
      passwordInput.style.borderColor = '#cf222e';
      passwordInput.placeholder = '密码错误，请重试';
      passwordInput.focus();
      setTimeout(() => {
        passwordInput.style.borderColor = isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de';
        passwordInput.placeholder = '请输入密码';
      }, 2000);
      
      // 恢复按钮
      confirmBtn.disabled = false;
      confirmBtn.textContent = '确认';
      return;
    }
    
    // 生成token并保存（本地验证成功）
    const token = generateAuthToken(password);
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_EXPIRES_KEY, expiresAt.toString());
    
    document.body.removeChild(modal);
    callback(true);
  };
  
  confirmBtn.addEventListener('click', handleConfirm);
  
  // 回车键确认
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  });
}

// 检查是否已授权
function isAuthenticated() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiresAt = localStorage.getItem(AUTH_EXPIRES_KEY);
  
  if (!token || !expiresAt) {
    return false;
  }
  
  // 检查是否过期
  const now = Date.now();
  const expires = parseInt(expiresAt);
  
  if (now > expires) {
    // 已过期，清除
    clearAuth();
    return false;
  }
  
  // 验证token格式
  return validateToken(token);
}

// 清除认证信息
function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRES_KEY);
  localStorage.removeItem(AUTH_STATE_KEY);
}

// 获取认证token
function getAuthToken() {
  if (!isAuthenticated()) {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// 要求认证（如果未认证则显示授权对话框）
function requireAuth(callback) {
  if (isAuthenticated()) {
    callback(true);
    return;
  }
  
  showAuthDialog(callback);
}

// 显示授权状态信息
function getAuthStatus() {
  if (!isAuthenticated()) {
    return { authenticated: false, expiresAt: null };
  }
  
  const expiresAt = parseInt(localStorage.getItem(AUTH_EXPIRES_KEY));
  const remaining = expiresAt - Date.now();
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  return {
    authenticated: true,
    expiresAt: expiresAt,
    remaining: remaining,
    hours: hours,
    minutes: minutes
  };
}

// 导出到全局作用域
// 如果 upload-auth-github.js 已经设置了 window.uploadAuth，则不再覆盖
// 否则设置密码认证的 uploadAuth
if (!window.uploadAuth || !window.uploadAuth.getGitHubToken) {
  window.uploadAuth = {
    isAuthenticated: isAuthenticated,
    requireAuth: requireAuth,
    clearAuth: clearAuth,
    getAuthToken: getAuthToken,
    getAuthStatus: getAuthStatus,
    showAuthDialog: showAuthDialog,
    // 添加一个空的 getGitHubToken 方法，避免调用错误
    getGitHubToken: function() { return null; }
  };
}

})();

