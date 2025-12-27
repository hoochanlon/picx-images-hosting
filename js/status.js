// Status 页面 JavaScript
(function() {
  'use strict';

  // 使用 index-config.js 中已经计算好的 API_BASE
  // 如果 index-config.js 还未加载，则使用 config.js 中的配置计算
  function getApiBase() {
    // 优先使用 index-config.js 中已计算的 API_BASE
    if (window.API_BASE) {
      return window.API_BASE;
    }

    // 如果 index-config.js 还未加载，使用 config.js 中的配置计算
    const config = window.APP_CONFIG || {};
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isVercelDev = isLocalhost && window.location.port === '3000';
    const isGitHubPages = config.GITHUB_PAGES_PATTERN && config.GITHUB_PAGES_PATTERN.test(window.location.hostname);
    const isCustomDomain = config.CUSTOM_DOMAINS && config.CUSTOM_DOMAINS.includes(window.location.hostname);
    const VERCEL_API_BASE = config.VERCEL_API_BASE || 'https://picx-images-hosting-brown.vercel.app';
    
    // 与 index-config.js 保持一致的逻辑：
    // - localhost（非 Vercel dev）使用 VERCEL_API_BASE
    // - GitHub Pages 或自定义域名使用 VERCEL_API_BASE
    // - Vercel 部署使用当前域名
    return isLocalhost && !isVercelDev
      ? VERCEL_API_BASE
      : (isGitHubPages || isCustomDomain)
      ? VERCEL_API_BASE
      : window.location.origin;
  }

  // 等待 DOM 和配置加载完成
  const API_BASE = getApiBase();

  async function checkHealth() {
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检查中...';

    try {
      const apiUrl = `${API_BASE}/api/health`;
      console.log('健康检查 API 地址:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      // 检查响应状态
      if (!response.ok) {
        // 如果返回 404，说明 API 路由不存在
        if (response.status === 404) {
          const errorText = await response.text();
          console.error('API 路由不存在 (404):', errorText.substring(0, 100));
          throw new Error(`API 路由不存在 (404)。请确保 ${API_BASE} 已正确部署 Serverless Functions。`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('响应不是 JSON 格式:', errorText.substring(0, 200));
        throw new Error(`API 返回了非 JSON 格式的响应。可能是 HTML 错误页面。`);
      }
      
      const data = await response.json();

      renderStatus(data);
      updateLastUpdate();
    } catch (error) {
      console.error('健康检查失败:', error);
      console.error('使用的 API 地址:', API_BASE);
      renderError(error);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 刷新状态';
    }
  }

  function renderStatus(data) {
    // 渲染总览卡片
    const overviewEl = document.getElementById('status-overview');
    overviewEl.innerHTML = `
      <div class="status-card ${data.status}">
        <div class="status-icon">
          ${data.status === 'healthy' ? '✅' : data.status === 'degraded' ? '⚠️' : '❌'}
        </div>
        <div class="status-title">总体状态</div>
        <div class="status-value">${getStatusText(data.status)}</div>
      </div>
      <div class="status-card">
        <div class="status-icon">⏱️</div>
        <div class="status-title">响应时间</div>
        <div class="status-value">${data.responseTime}ms</div>
      </div>
      <div class="status-card">
        <div class="status-icon">🕐</div>
        <div class="status-title">检查时间</div>
        <div class="status-value">${new Date(data.timestamp).toLocaleTimeString('zh-CN')}</div>
      </div>
    `;

    // 渲染详细检查列表
    const checksListEl = document.getElementById('checks-list');
    checksListEl.innerHTML = Object.entries(data.checks).map(([key, check]) => `
      <div class="check-item">
        <div style="flex: 1;">
          <div class="check-name">${getCheckName(key)}</div>
          ${check.error ? `<div class="check-error">错误: ${check.error}</div>` : ''}
        </div>
        <div class="check-status">
          <span class="status-badge ${check.status}">${getStatusText(check.status)}</span>
          ${check.responseTime > 0 ? `<span class="check-time">${check.responseTime}ms</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  function renderError(error) {
    document.getElementById('status-overview').innerHTML = `
      <div class="status-card unhealthy">
        <div class="status-icon">❌</div>
        <div class="status-title">检查失败</div>
        <div class="status-value">${error.message}</div>
      </div>
    `;
    document.getElementById('checks-list').innerHTML = `
      <div class="check-item">
        <div class="check-name">无法连接到健康检查 API</div>
        <div class="check-status">
          <span class="status-badge error">错误</span>
        </div>
      </div>
    `;
  }

  function getStatusText(status) {
    const statusMap = {
      healthy: '正常',
      unhealthy: '异常',
      error: '错误',
      degraded: '降级',
      unknown: '未知'
    };
    return statusMap[status] || status;
  }

  function getCheckName(key) {
    const nameMap = {
      github_api: 'GitHub API 连接',
      tree_api: '仓库树 API',
      config_api: '环境配置'
    };
    return nameMap[key] || key;
  }

  function updateLastUpdate() {
    const lastUpdateEl = document.getElementById('last-update');
    lastUpdateEl.textContent = `最后更新: ${new Date().toLocaleString('zh-CN')}`;
  }

  // 初始化 GitHub 链接
  function initGitHubLink() {
    const githubLink = document.getElementById('github-link');
    if (githubLink) {
      const config = window.APP_CONFIG || {};
      githubLink.href = config.GITHUB_REPO_URL || 'https://github.com/hoochanlon/picx-images-hosting';
    }
  }

  // 初始化认证图标
  function initAuthIcon() {
    if (typeof window.updateAuthIcon === 'function') {
      window.updateAuthIcon();
    }
  }

  // 初始化：等待 DOM 加载完成
  function init() {
    // 初始化导航栏功能
    initGitHubLink();
    initAuthIcon();
    
    // 初始化健康状态监控（动态指示器）
    if (window.initHealthMonitor) {
      initHealthMonitor();
    }

    // 页面加载时检查
    checkHealth();

    // 点击刷新按钮
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', checkHealth);
    }

    // 每 30 秒自动刷新
    setInterval(checkHealth, 30000);
  }

  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

