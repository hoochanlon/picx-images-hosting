// config-loader.js - 从 API 加载配置并合并到 window.APP_CONFIG

(function() {
  'use strict';

  // 从 API 加载配置
  async function loadConfigFromAPI() {
    try {
      // 获取 API 基础地址
      const apiBase = window.APP_CONFIG?.VERCEL_API_BASE || 
                     (window.location.hostname === 'localhost' 
                       ? 'http://localhost:3000' 
                       : window.location.origin);
      
      const response = await fetch(`${apiBase}/api/config`);
      
      if (!response.ok) {
        console.warn('Failed to load config from API, using local config');
        return null;
      }
      
      const apiConfig = await response.json();
      return apiConfig;
    } catch (err) {
      console.warn('Error loading config from API, using local config:', err);
      return null;
    }
  }

  // 合并 API 配置到本地配置
  async function mergeConfig() {
    // 确保 window.APP_CONFIG 已存在
    if (!window.APP_CONFIG) {
      window.APP_CONFIG = {};
    }

    // 从 API 加载配置
    const apiConfig = await loadConfigFromAPI();
    
    if (apiConfig) {
      // 合并 API 配置（API 配置优先级更高）
      Object.assign(window.APP_CONFIG, apiConfig);
      console.log('Config loaded from API');
    } else {
      console.log('Using local config');
    }
  }

  // 在 DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mergeConfig);
  } else {
    mergeConfig();
  }

})();

