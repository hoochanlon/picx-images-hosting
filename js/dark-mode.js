/**
 * Dark Mode Toggle Functionality
 * 夜间模式切换功能
 */

(function() {
  'use strict';

  const THEME_KEY = 'theme-preference';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';

  /**
   * 获取当前主题
   */
  function getTheme() {
    // 优先从 localStorage 读取
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      return saved;
    }
    
    // 如果没有保存的偏好，检查系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK_THEME;
    }
    
    // 默认使用浅色模式
    return LIGHT_THEME;
  }

  /**
   * 设置主题
   */
  function setTheme(theme) {
    const root = document.documentElement;
    if (theme === DARK_THEME) {
      root.setAttribute('data-theme', DARK_THEME);
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    setTheme(newTheme);
    updateToggleButton(newTheme);
  }

  /**
   * 更新切换按钮图标
   */
  function updateToggleButton(theme) {
    const toggleButtons = document.querySelectorAll('.dark-mode-toggle');
    toggleButtons.forEach(button => {
      const icon = button.querySelector('i');
      if (icon) {
        if (theme === DARK_THEME) {
          icon.className = 'fas fa-sun';
          button.removeAttribute('aria-label');
          button.removeAttribute('title');
        } else {
          icon.className = 'fas fa-moon';
          button.removeAttribute('aria-label');
          button.removeAttribute('title');
        }
      }
    });
  }

  /**
   * 初始化主题
   */
  function initTheme() {
    const theme = getTheme();
    setTheme(theme);
    updateToggleButton(theme);
  }

  /**
   * 监听系统主题变化
   */
  function watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // 只有在用户没有手动设置过主题时才跟随系统
        if (!localStorage.getItem(THEME_KEY)) {
          const theme = e.matches ? DARK_THEME : LIGHT_THEME;
          setTheme(theme);
          updateToggleButton(theme);
        }
      });
    }
  }

  /**
   * 初始化所有切换按钮
   */
  function initToggleButtons() {
    const toggleButtons = document.querySelectorAll('.dark-mode-toggle');
    toggleButtons.forEach(button => {
      // 移除旧的事件监听器（如果有）
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // 添加点击事件
      newButton.addEventListener('click', toggleTheme);
    });
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initTheme();
      initToggleButtons();
      watchSystemTheme();
    });
  } else {
    // DOM 已经加载完成
    initTheme();
    initToggleButtons();
    watchSystemTheme();
  }

  // 导出函数供外部使用（如果需要）
  window.darkMode = {
    toggle: toggleTheme,
    set: setTheme,
    get: getTheme
  };
})();

