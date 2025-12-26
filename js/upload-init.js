// upload-init.js - 初始化逻辑和事件绑定

(function() {
  'use strict';
  const state = window.uploadState;

// 初始化上传功能
function initUpload() {
  const fileInputEl = state.fileInputEl();
  const uploadAreaEl = state.uploadAreaEl();
  const uploadFilesBtn = state.uploadFilesBtn();
  
  if (!fileInputEl || !uploadAreaEl || !uploadFilesBtn) return;
  
  // 文件选择
  fileInputEl.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      if (window.uploadFiles) window.uploadFiles(e.target.files);
      e.target.value = '';
    }
  });
  
  // 上传按钮
  uploadFilesBtn.addEventListener('click', () => {
    fileInputEl.click();
  });
  
  // 拖拽上传
  uploadAreaEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadAreaEl.classList.add('dragover');
  });
  
  uploadAreaEl.addEventListener('dragleave', () => {
    uploadAreaEl.classList.remove('dragover');
  });
  
  uploadAreaEl.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadAreaEl.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (window.uploadFiles) window.uploadFiles(files);
    }
  });
}

// 初始化创建文件夹功能
function initCreateFolder() {
  const createFolderBtn = state.createFolderBtn();
  const folderNameInput = state.folderNameInput();
  
  if (!createFolderBtn || !folderNameInput) return;
  
  createFolderBtn.addEventListener('click', () => {
    folderNameInput.value = '';
    if (window.showModal) window.showModal('create-folder');
  });
  
  const confirmBtn = document.getElementById('confirm-create-folder');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (window.createFolder) window.createFolder(folderNameInput.value);
    });
  }
}

// 初始化重命名功能
function initRename() {
  const renameInput = state.renameInput();
  const confirmBtn = document.getElementById('confirm-rename');
  
  if (!renameInput || !confirmBtn) return;
  
  confirmBtn.addEventListener('click', () => {
    const type = renameInput.dataset.type;
    const path = renameInput.dataset.path;
    if (window.renameItem) window.renameItem(type, path, renameInput.value);
  });
}

// 初始化上传目录设置
function initUploadPathSettings() {
  const settingsUploadPathBtn = document.getElementById('settings-upload-path-btn');
  const uploadPathInput = document.getElementById('upload-path-input');
  const useCurrentPathBtn = document.getElementById('use-current-path-btn');
  const clearUploadPathBtn = document.getElementById('clear-upload-path-btn');
  const confirmSettingsUploadPathBtn = document.getElementById('confirm-settings-upload-path');
  
  // 加载保存的上传目录设置
  const savedUploadPath = getUploadPath();
  if (savedUploadPath && uploadPathInput) {
    uploadPathInput.value = savedUploadPath;
  }
  
  if (settingsUploadPathBtn) {
    settingsUploadPathBtn.addEventListener('click', () => {
      // 打开模态框时，显示当前设置或当前浏览的目录
      const currentSaved = getUploadPath();
      if (uploadPathInput) {
        uploadPathInput.value = currentSaved || state.currentPath() || '';
      }
      if (window.showModal) window.showModal('settings-upload-path');
    });
  }
  
  if (useCurrentPathBtn) {
    useCurrentPathBtn.addEventListener('click', () => {
      if (uploadPathInput) {
        uploadPathInput.value = state.currentPath() || '';
      }
    });
  }
  
  if (clearUploadPathBtn) {
    clearUploadPathBtn.addEventListener('click', () => {
      if (uploadPathInput) {
        uploadPathInput.value = '';
      }
      saveUploadPath('');
      alert('已清除上传目录设置');
    });
  }
  
  if (confirmSettingsUploadPathBtn) {
    confirmSettingsUploadPathBtn.addEventListener('click', () => {
      const path = uploadPathInput ? uploadPathInput.value.trim() : '';
      saveUploadPath(path);
      if (window.closeModal) window.closeModal('settings-upload-path');
      alert('上传目录设置已保存：' + (path || '使用当前浏览目录'));
    });
  }
}

// 初始化模态框关闭
function initModalClose() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      if (window.closeModal) window.closeModal(modalId);
    });
  });
}

// 初始化标题点击
function initTitleClick() {
  const uploadTitle = document.getElementById('upload-title');
  if (uploadTitle) {
    uploadTitle.addEventListener('click', () => {
      // 重置到根目录
      state.setCurrentPath('');
      if (window.updateBreadcrumb) window.updateBreadcrumb(state.currentPath());
      if (window.loadFiles) window.loadFiles();
    });
  }
}

// 初始化压缩开关
function initCompressionToggle() {
  const compressionCheckbox = document.getElementById('enable-compression-checkbox');
  if (!compressionCheckbox) return;
  
  // 从 localStorage 读取保存的状态，如果没有则使用配置的默认值
  const savedState = localStorage.getItem('enableImageCompression');
  const defaultEnabled = window.APP_CONFIG && window.APP_CONFIG.ENABLE_IMAGE_COMPRESSION !== false;
  
  if (savedState !== null) {
    compressionCheckbox.checked = savedState === 'true';
  } else {
    compressionCheckbox.checked = defaultEnabled;
  }
  
  // 监听开关变化并保存到 localStorage
  compressionCheckbox.addEventListener('change', (e) => {
    localStorage.setItem('enableImageCompression', e.target.checked.toString());
    
    // 显示提示
    const status = e.target.checked ? '已启用' : '已禁用';
    const label = compressionCheckbox.closest('.compress-toggle-label');
    if (label) {
      const originalTitle = label.title;
      label.title = `图片压缩：${status}`;
      setTimeout(() => {
        label.title = originalTitle;
      }, 2000);
    }
  });
}

// 初始化所有功能
function initUploadPage() {
  // 等待 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initUpload();
      initCreateFolder();
      initRename();
      initUploadPathSettings();
      initModalClose();
      initTitleClick();
      initCompressionToggle();
      
      // 初始化：确保初始面包屑正确设置
      if (window.updateBreadcrumb) window.updateBreadcrumb(state.currentPath());
      if (window.loadFiles) window.loadFiles();
    });
  } else {
    // DOM 已加载
    initUpload();
    initCreateFolder();
    initRename();
    initUploadPathSettings();
    initModalClose();
    initTitleClick();
    initCompressionToggle();
    
    // 初始化：确保初始面包屑正确设置
    if (window.updateBreadcrumb) window.updateBreadcrumb(state.currentPath());
    if (window.loadFiles) window.loadFiles();
  }
}

// 启动初始化
initUploadPage();

})();
