// upload-auth.js - 身份验证功能

(function() {
  'use strict';

// 密码存储键名
const AUTH_KEY = 'upload_auth_token';
const AUTH_PASSWORD_KEY = 'upload_auth_password';

// 生成简单的token（基于时间戳和随机数）
function generateToken() {
  return btoa(Date.now().toString() + Math.random().toString()).substring(0, 32);
}

// 验证密码
function verifyPassword(password) {
  // 从配置或环境变量获取密码
  // 这里使用一个默认密码，实际使用时应该从安全的地方获取
  const correctPassword = window.APP_CONFIG?.DELETE_PASSWORD || 'admin123';
  
  if (password === correctPassword) {
    // 生成token并存储
    const token = generateToken();
    const authData = {
      token: token,
      timestamp: Date.now(),
      expiresIn: 24 * 60 * 60 * 1000 // 24小时
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    localStorage.setItem(AUTH_PASSWORD_KEY, btoa(password)); // 加密存储（简单base64）
    return true;
  }
  return false;
}

// 检查是否已认证
function isAuthenticated() {
  const authDataStr = localStorage.getItem(AUTH_KEY);
  if (!authDataStr) return false;
  
  try {
    const authData = JSON.parse(authDataStr);
    const now = Date.now();
    
    // 检查是否过期
    if (now - authData.timestamp > authData.expiresIn) {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_PASSWORD_KEY);
      return false;
    }
    
    return true;
  } catch (err) {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_PASSWORD_KEY);
    return false;
  }
}

// 清除认证信息
function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_PASSWORD_KEY);
}

// 获取认证token（用于API请求）
function getAuthToken() {
  if (!isAuthenticated()) return null;
  
  const authDataStr = localStorage.getItem(AUTH_KEY);
  if (!authDataStr) return null;
  
  try {
    const authData = JSON.parse(authDataStr);
    return authData.token;
  } catch (err) {
    return null;
  }
}

// 显示密码输入对话框
function showPasswordDialog(callback) {
  const password = prompt('请输入删除密码以确认操作：\n\n（密码验证后24小时内有效）');
  
  if (password === null) {
    // 用户取消
    callback(false);
    return;
  }
  
  if (!password) {
    alert('密码不能为空');
    callback(false);
    return;
  }
  
  if (verifyPassword(password)) {
    alert('验证成功！24小时内无需再次输入密码。');
    callback(true);
  } else {
    alert('密码错误，请重试');
    callback(false);
  }
}

// 要求认证（如果未认证则显示密码对话框）
function requireAuth(callback) {
  if (isAuthenticated()) {
    callback(true);
    return;
  }
  
  showPasswordDialog(callback);
}

// 导出到全局作用域
window.uploadAuth = {
  isAuthenticated: isAuthenticated,
  requireAuth: requireAuth,
  clearAuth: clearAuth,
  getAuthToken: getAuthToken,
  showPasswordDialog: showPasswordDialog
};

})();

