// API 健康状态监控
let healthStatus = 'unknown';
let healthCheckInterval = null;

async function checkHealthStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    healthStatus = data.status;
    updateHealthIndicator();
  } catch (error) {
    healthStatus = 'error';
    updateHealthIndicator();
  }
}

function updateHealthIndicator() {
  const indicator = document.getElementById('health-indicator');
  if (!indicator) return;

  // 移除所有状态类
  indicator.classList.remove('healthy', 'unhealthy', 'degraded', 'error', 'unknown');
  
  // 添加当前状态类
  indicator.classList.add(healthStatus);
  
  // 更新图标和提示
  const icon = indicator.querySelector('i');
  
  switch (healthStatus) {
    case 'healthy':
      icon.className = 'fas fa-circle-check';
      indicator.setAttribute('aria-label', 'API 状态正常');
      break;
    case 'degraded':
      icon.className = 'fas fa-circle-exclamation';
      indicator.setAttribute('aria-label', 'API 状态降级 - 部分功能可能受影响');
      break;
    case 'error':
    case 'unhealthy':
      icon.className = 'fas fa-circle-xmark';
      indicator.setAttribute('aria-label', 'API 状态异常 - 请检查服务');
      break;
    default:
      icon.className = 'fas fa-circle-question';
      indicator.setAttribute('aria-label', 'API 状态未知');
  }
}

function initHealthMonitor() {
  // 只在 status.html 页面创建动态指示器
  const isStatusPage = window.location.pathname.includes('status.html');
  if (!isStatusPage) return;

  // 查找导航容器（支持多种页面结构）
  const controls = document.querySelector('.controls') || 
                   document.querySelector('.upload-header > div') ||
                   document.querySelector('.tutorial-sidebar-footer > div');
  if (!controls) return;

  // 检查是否已经存在健康指示器
  if (document.getElementById('health-indicator')) return;

  const indicator = document.createElement('a');
  indicator.href = 'status.html';
  indicator.id = 'health-indicator';
  indicator.className = 'icon-label health-indicator';
  indicator.setAttribute('aria-label', 'API 健康状态');
  indicator.innerHTML = '<i class="fas fa-circle-question"></i>';
  
  // 插入到 GitHub 链接之前
  const githubLink = document.getElementById('github-link');
  if (githubLink && githubLink.parentNode === controls) {
    controls.insertBefore(indicator, githubLink);
  } else {
    controls.appendChild(indicator);
  }

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .health-indicator.healthy { color: #22c55e; }
    .health-indicator.degraded { color: #f59e0b; }
    .health-indicator.unhealthy,
    .health-indicator.error { color: #ef4444; }
    .health-indicator.unknown { color: #6b7280; }
    .health-indicator:hover { opacity: 0.8; }
  `;
  document.head.appendChild(style);

  // 初始检查
  checkHealthStatus();

  // 每 60 秒检查一次
  healthCheckInterval = setInterval(checkHealthStatus, 60000);
}

// 导出函数供其他模块使用
window.checkHealthStatus = checkHealthStatus;
window.initHealthMonitor = initHealthMonitor;

