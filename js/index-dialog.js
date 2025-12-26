// index-dialog.js - 首页对话框组件（兼容层）
// 此文件提供向后兼容的 API，实际使用通用的 dialog.js

(function() {
  'use strict';

  // 等待通用对话框模块加载
  function init() {
    // 如果通用对话框已加载，使用它；否则使用本地实现
    if (window.showDeleteConfirmDialog && window.showDeleteConfirmDialog.toString().includes('options')) {
      // 通用对话框已加载，创建兼容层
      const originalShowDeleteConfirmDialog = window.showDeleteConfirmDialog;
      
      // 提供向后兼容的 API
      window.showDeleteConfirmDialog = function(filePath, fileName, callback) {
        originalShowDeleteConfirmDialog({
          filePath: filePath,
          fileName: fileName,
          type: 'file',
          callback: callback
        });
      };
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // 延迟初始化，确保 dialog.js 已加载
    setTimeout(init, 100);
  }

})();

