// index-auth.js - 首页登录功能

(function() {
  'use strict';

  // 检查是否已登录
  function checkAuthStatus() {
    // 检查是否有 uploadAuth 对象
    if (!window.uploadAuth) {
      return false;
    }
    
    // 检查是否已认证
    if (typeof window.uploadAuth.isAuthenticated === 'function') {
      return window.uploadAuth.isAuthenticated();
    }
    
    return false;
  }

  // 更新登录图标状态
  function updateAuthIcon() {
    const authBtn = document.getElementById('auth-login-btn');
    const authIcon = document.getElementById('auth-login-icon');
    
    if (!authBtn || !authIcon) {
      return;
    }
    
    const isAuthenticated = checkAuthStatus();
    
    if (isAuthenticated) {
      // 已登录状态
      authIcon.className = 'fas fa-unlock';
      authBtn.removeAttribute('title'); // 移除提示文字
      authBtn.setAttribute('aria-label', '已登录（点击退出）');
      // 移除所有内联样式，使用默认样式
      authBtn.style.cssText = '';
      // 已登录时使用绿色，但通过类名而不是内联样式
      authBtn.classList.add('auth-authenticated');
    } else {
      // 未登录状态
      authIcon.className = 'fas fa-lock';
      authBtn.removeAttribute('title'); // 移除提示文字
      authBtn.setAttribute('aria-label', '登录/授权');
      // 移除所有内联样式，使用默认样式
      authBtn.style.cssText = '';
      authBtn.classList.remove('auth-authenticated');
    }
  }

  // 处理登录按钮点击
  function handleAuthClick() {
    const isAuthenticated = checkAuthStatus();
    
    if (isAuthenticated) {
      // 已登录，显示退出确认
      if (confirm('确定要退出登录吗？')) {
        if (window.uploadAuth && typeof window.uploadAuth.clearAuth === 'function') {
          window.uploadAuth.clearAuth();
          updateAuthIcon();
          alert('已退出登录');
        }
      }
    } else {
      // 未登录，显示登录对话框
      if (window.uploadAuth && typeof window.uploadAuth.showAuthDialog === 'function') {
        window.uploadAuth.showAuthDialog((authenticated) => {
          if (authenticated) {
            updateAuthIcon();
            alert('登录成功！');
          }
        });
      } else if (window.uploadAuth && typeof window.uploadAuth.requireAuth === 'function') {
        // 如果没有 showAuthDialog，使用 requireAuth
        window.uploadAuth.requireAuth((authenticated) => {
          if (authenticated) {
            updateAuthIcon();
            alert('登录成功！');
          }
        });
      } else {
        alert('认证功能未加载，请刷新页面重试');
      }
    }
  }

  // 初始化
  function init() {
    const authBtn = document.getElementById('auth-login-btn');
    
    if (!authBtn) {
      return;
    }
    
    // 绑定点击事件
    authBtn.addEventListener('click', handleAuthClick);
    
    // 初始更新图标状态
    updateAuthIcon();
    
    // 定期检查登录状态（每5秒）
    setInterval(updateAuthIcon, 5000);
    
    // 监听认证状态变化（如果 uploadAuth 支持事件）
    if (window.uploadAuth) {
      // 监听存储变化（localStorage）
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.includes('auth')) {
          updateAuthIcon();
        }
      });
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 延迟初始化，确保 uploadAuth 已加载
    setTimeout(init, 100);
  }

  // 导出更新函数，供其他模块调用
  window.updateAuthIcon = updateAuthIcon;

})();

