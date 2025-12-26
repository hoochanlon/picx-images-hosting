// dialog.js - 通用对话框组件

(function() {
  'use strict';

  // 添加对话框动画样式（如果还没有）
  function ensureDialogStyles() {
    if (!document.getElementById('dialog-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'dialog-modal-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 显示删除确认对话框（通用版本）
  function showDeleteConfirmDialog(options) {
    const {
      filePath,
      fileName,
      type = 'file', // 'file' 或 'folder'
      message,
      callback
    } = options;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const displayName = fileName || filePath || '项目';
    const isFolder = type === 'folder';
    
    // 确保样式已加载
    ensureDialogStyles();
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'delete-confirm-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'delete-confirm-modal-content';
    modalContent.style.cssText = `
      background: ${isDark ? '#161b22' : '#fff'};
      border-radius: 12px;
      padding: 32px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: ${isDark ? '1px solid rgba(48, 54, 61, 0.8)' : 'none'};
      animation: slideUp 0.3s ease;
    `;
    
    const warningMessage = message || (isFolder 
      ? '此操作不可撤销，文件夹及其所有内容将被永久删除'
      : '此操作不可撤销，文件将被永久删除');
    
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">${isFolder ? '📁' : '🗑️'}</div>
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: ${isDark ? '#f0f6fc' : '#24292f'};">
          确认删除${isFolder ? '文件夹' : '文件'}
        </h2>
        <p style="margin: 12px 0 0 0; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.9rem; line-height: 1.5;">
          ${warningMessage}
        </p>
      </div>
      <div style="margin-bottom: 24px; padding: 16px; background: ${isDark ? 'rgba(248, 81, 73, 0.1)' : '#fff5f5'}; border-radius: 8px; border: 1px solid ${isDark ? 'rgba(248, 81, 73, 0.3)' : '#ffebee'};">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="font-size: 1.2rem; margin-top: 2px;">⚠️</div>
          <div style="flex: 1;">
            <div style="color: ${isDark ? '#f85149' : '#cf222e'}; font-weight: 500; font-size: 0.95rem; margin-bottom: 4px;">
              ${isFolder ? '文件夹路径' : '文件路径'}：
            </div>
            <div style="color: ${isDark ? '#f0f6fc' : '#24292f'}; font-size: 0.9rem; word-break: break-all; font-family: monospace;">
              ${filePath || displayName}
            </div>
          </div>
        </div>
      </div>
      ${isFolder ? `
      <div style="margin-bottom: 20px; padding: 12px; background: ${isDark ? 'rgba(248, 81, 73, 0.08)' : '#fff8f0'}; border-radius: 8px; border-left: 3px solid ${isDark ? '#f85149' : '#cf222e'};">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 1.1rem;">📂</div>
          <div style="flex: 1; color: ${isDark ? '#f85149' : '#cf222e'}; font-size: 0.85rem; font-weight: 500;">
            删除文件夹将同时删除其所有内容，包括所有子文件和子文件夹！
          </div>
        </div>
      </div>
      ` : ''}
      <div style="margin-bottom: 20px; padding: 12px; background: ${isDark ? 'rgba(13, 17, 23, 0.5)' : '#f6f8fa'}; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 1.1rem;">📝</div>
          <div style="flex: 1; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.85rem;">
            删除操作会提交到 GitHub 仓库，请谨慎操作
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button 
          id="delete-cancel-btn"
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
          onmouseover="this.style.background='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#f6f8fa'}'; this.style.borderColor='${isDark ? 'rgba(110, 118, 129, 0.4)' : '#8c959f'}'"
          onmouseout="this.style.background='${isDark ? 'rgba(33, 38, 45, 0.8)' : '#fff'}'; this.style.borderColor='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'}'"
        >取消</button>
        <button 
          id="delete-confirm-btn"
          style="
            flex: 1;
            padding: 12px 16px;
            border: none;
            background: #da3633;
            color: #fff;
            border-radius: 6px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='#b62324'"
          onmouseout="this.style.background='#da3633'"
        >
          <i class="fas fa-trash" style="margin-right: 6px;"></i>
          确认删除
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const cancelBtn = modalContent.querySelector('#delete-cancel-btn');
    const confirmBtn = modalContent.querySelector('#delete-confirm-btn');
    
    // 关闭对话框的通用函数
    const closeModal = (result) => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      document.removeEventListener('keydown', handleEsc);
      if (typeof callback === 'function') {
        callback(result);
      }
    };
    
    // ESC 键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal(false);
      }
    };
    
    // 取消按钮
    cancelBtn.addEventListener('click', () => {
      closeModal(false);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(false);
      }
    });
    
    // 确认按钮
    confirmBtn.addEventListener('click', () => {
      closeModal(true);
    });
    
    // 监听 ESC 键
    document.addEventListener('keydown', handleEsc);
    
    // 自动聚焦取消按钮（更安全）
    setTimeout(() => cancelBtn.focus(), 100);
  }

  // 显示批量删除确认对话框
  function showBatchDeleteConfirmDialog(options) {
    const {
      items,
      callback
    } = options;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const totalCount = items.length;
    const fileCount = items.filter(item => item.type === 'file').length;
    const folderCount = items.filter(item => item.type === 'folder').length;
    const hasFolders = folderCount > 0;
    
    // 确保样式已加载
    ensureDialogStyles();
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'delete-confirm-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'delete-confirm-modal-content';
    modalContent.style.cssText = `
      background: ${isDark ? '#161b22' : '#fff'};
      border-radius: 12px;
      padding: 32px;
      max-width: 550px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: ${isDark ? '1px solid rgba(48, 54, 61, 0.8)' : 'none'};
      animation: slideUp 0.3s ease;
    `;
    
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🗑️</div>
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: ${isDark ? '#f0f6fc' : '#24292f'};">
          确认批量删除
        </h2>
        <p style="margin: 12px 0 0 0; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.9rem; line-height: 1.5;">
          此操作不可撤销，选中的项目将被永久删除
        </p>
      </div>
      <div style="margin-bottom: 24px; padding: 16px; background: ${isDark ? 'rgba(248, 81, 73, 0.1)' : '#fff5f5'}; border-radius: 8px; border: 1px solid ${isDark ? 'rgba(248, 81, 73, 0.3)' : '#ffebee'};">
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="font-size: 1.2rem; margin-top: 2px;">⚠️</div>
          <div style="flex: 1;">
            <div style="color: ${isDark ? '#f85149' : '#cf222e'}; font-weight: 500; font-size: 0.95rem; margin-bottom: 8px;">
              删除统计：
            </div>
            <div style="color: ${isDark ? '#f0f6fc' : '#24292f'}; font-size: 0.9rem; line-height: 1.8;">
              <div>总计：<strong>${totalCount}</strong> 项</div>
              ${fileCount > 0 ? `<div>文件：<strong>${fileCount}</strong> 个</div>` : ''}
              ${folderCount > 0 ? `<div>文件夹：<strong>${folderCount}</strong> 个</div>` : ''}
            </div>
          </div>
        </div>
      </div>
      ${hasFolders ? `
      <div style="margin-bottom: 20px; padding: 12px; background: ${isDark ? 'rgba(248, 81, 73, 0.08)' : '#fff8f0'}; border-radius: 8px; border-left: 3px solid ${isDark ? '#f85149' : '#cf222e'};">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 1.1rem;">📂</div>
          <div style="flex: 1; color: ${isDark ? '#f85149' : '#cf222e'}; font-size: 0.85rem; font-weight: 500;">
            删除文件夹将同时删除其所有内容，包括所有子文件和子文件夹！
          </div>
        </div>
      </div>
      ` : ''}
      <div style="margin-bottom: 20px; padding: 12px; background: ${isDark ? 'rgba(13, 17, 23, 0.5)' : '#f6f8fa'}; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 1.1rem;">📝</div>
          <div style="flex: 1; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.85rem;">
            删除操作会提交到 GitHub 仓库，请谨慎操作
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button 
          id="delete-cancel-btn"
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
          onmouseover="this.style.background='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#f6f8fa'}'; this.style.borderColor='${isDark ? 'rgba(110, 118, 129, 0.4)' : '#8c959f'}'"
          onmouseout="this.style.background='${isDark ? 'rgba(33, 38, 45, 0.8)' : '#fff'}'; this.style.borderColor='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'}'"
        >取消</button>
        <button 
          id="delete-confirm-btn"
          style="
            flex: 1;
            padding: 12px 16px;
            border: none;
            background: #da3633;
            color: #fff;
            border-radius: 6px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='#b62324'"
          onmouseout="this.style.background='#da3633'"
        >
          <i class="fas fa-trash" style="margin-right: 6px;"></i>
          确认删除
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const cancelBtn = modalContent.querySelector('#delete-cancel-btn');
    const confirmBtn = modalContent.querySelector('#delete-confirm-btn');
    
    // 关闭对话框的通用函数
    const closeModal = (result) => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      document.removeEventListener('keydown', handleEsc);
      if (typeof callback === 'function') {
        callback(result);
      }
    };
    
    // ESC 键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal(false);
      }
    };
    
    // 取消按钮
    cancelBtn.addEventListener('click', () => {
      closeModal(false);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(false);
      }
    });
    
    // 确认按钮
    confirmBtn.addEventListener('click', () => {
      closeModal(true);
    });
    
    // 监听 ESC 键
    document.addEventListener('keydown', handleEsc);
    
    // 自动聚焦取消按钮（更安全）
    setTimeout(() => cancelBtn.focus(), 100);
  }

  // 显示退出登录确认对话框
  function showLogoutConfirmDialog(callback) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 确保样式已加载
    ensureDialogStyles();
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'logout-confirm-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'logout-confirm-modal-content';
    modalContent.style.cssText = `
      background: ${isDark ? '#161b22' : '#fff'};
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: ${isDark ? '1px solid rgba(48, 54, 61, 0.8)' : 'none'};
      animation: slideUp 0.3s ease;
    `;
    
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🚪</div>
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: ${isDark ? '#f0f6fc' : '#24292f'};">
          确认退出登录
        </h2>
        <p style="margin: 12px 0 0 0; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.9rem; line-height: 1.5;">
          退出后需要重新登录才能进行写操作
        </p>
      </div>
      <div style="margin-bottom: 20px; padding: 12px; background: ${isDark ? 'rgba(13, 17, 23, 0.5)' : '#f6f8fa'}; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 1.1rem;">ℹ️</div>
          <div style="flex: 1; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.85rem;">
            退出登录后，您的认证信息将被清除
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button 
          id="logout-cancel-btn"
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
          onmouseover="this.style.background='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#f6f8fa'}'; this.style.borderColor='${isDark ? 'rgba(110, 118, 129, 0.4)' : '#8c959f'}'"
          onmouseout="this.style.background='${isDark ? 'rgba(33, 38, 45, 0.8)' : '#fff'}'; this.style.borderColor='${isDark ? 'rgba(48, 54, 61, 0.8)' : '#d0d7de'}'"
        >取消</button>
        <button 
          id="logout-confirm-btn"
          style="
            flex: 1;
            padding: 12px 16px;
            border: none;
            background: #238636;
            color: #fff;
            border-radius: 6px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='#2ea043'"
          onmouseout="this.style.background='#238636'"
        >
          <i class="fas fa-sign-out-alt" style="margin-right: 6px;"></i>
          确认退出
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const cancelBtn = modalContent.querySelector('#logout-cancel-btn');
    const confirmBtn = modalContent.querySelector('#logout-confirm-btn');
    
    // 关闭对话框的通用函数
    const closeModal = (result) => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
      }
      document.removeEventListener('keydown', handleEsc);
      if (typeof callback === 'function') {
        callback(result);
      }
    };
    
    // ESC 键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal(false);
      }
    };
    
    // 取消按钮
    cancelBtn.addEventListener('click', () => {
      closeModal(false);
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(false);
      }
    });
    
    // 确认按钮
    confirmBtn.addEventListener('click', () => {
      closeModal(true);
    });
    
    // 监听 ESC 键
    document.addEventListener('keydown', handleEsc);
    
    // 自动聚焦取消按钮（更安全）
    setTimeout(() => cancelBtn.focus(), 100);
  }

  // 显示成功提示对话框
  function showSuccessDialog(options) {
    const {
      title = '操作成功',
      message = '操作已完成',
      autoClose = true,
      duration = 2000,
      callback
    } = options;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 确保样式已加载
    ensureDialogStyles();
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'success-dialog-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.2s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'success-dialog-modal-content';
    modalContent.style.cssText = `
      background: ${isDark ? '#161b22' : '#fff'};
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: ${isDark ? '1px solid rgba(48, 54, 61, 0.8)' : 'none'};
      animation: slideUp 0.3s ease;
    `;
    
    modalContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">✅</div>
        <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: ${isDark ? '#f0f6fc' : '#24292f'};">
          ${title}
        </h2>
        <p style="margin: 12px 0 0 0; color: ${isDark ? '#8b949e' : '#57606a'}; font-size: 0.9rem; line-height: 1.5;">
          ${message}
        </p>
      </div>
      <div style="display: flex; justify-content: center; margin-top: 24px;">
        <button 
          id="success-confirm-btn"
          style="
            padding: 12px 32px;
            border: none;
            background: #238636;
            color: #fff;
            border-radius: 6px;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          "
          onmouseover="this.style.background='#2ea043'"
          onmouseout="this.style.background='#238636'"
        >
          确定
        </button>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const confirmBtn = modalContent.querySelector('#success-confirm-btn');
    
    // 关闭对话框的通用函数
    const closeModal = () => {
      if (modal.parentNode) {
        modal.style.animation = 'fadeOut 0.2s ease';
        modalContent.style.animation = 'slideDown 0.2s ease';
        setTimeout(() => {
          if (modal.parentNode) {
            document.body.removeChild(modal);
          }
          document.removeEventListener('keydown', handleEsc);
          if (typeof callback === 'function') {
            callback();
          }
        }, 200);
      }
    };
    
    // ESC 键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    
    // 确认按钮
    confirmBtn.addEventListener('click', () => {
      closeModal();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // 监听 ESC 键
    document.addEventListener('keydown', handleEsc);
    
    // 自动聚焦确认按钮
    setTimeout(() => confirmBtn.focus(), 100);
    
    // 如果设置了自动关闭，则在指定时间后自动关闭
    if (autoClose) {
      setTimeout(() => {
        closeModal();
      }, duration);
    }
    
    // 添加关闭动画样式（如果还没有）
    if (!document.getElementById('dialog-close-styles')) {
      const style = document.createElement('style');
      style.id = 'dialog-close-styles';
      style.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideDown {
          from { 
            opacity: 1;
            transform: translateY(0);
          }
          to { 
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 导出到全局作用域
  window.showDeleteConfirmDialog = showDeleteConfirmDialog;
  window.showBatchDeleteConfirmDialog = showBatchDeleteConfirmDialog;
  window.showLogoutConfirmDialog = showLogoutConfirmDialog;
  window.showSuccessDialog = showSuccessDialog;

})();

