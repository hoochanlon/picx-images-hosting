// upload-select.js - 全选和批量删除功能

(function() {
  'use strict';

// 获取所有选中的项目
function getSelectedItems() {
  const checkboxes = document.querySelectorAll('.file-checkbox:checked');
  return Array.from(checkboxes).map(checkbox => ({
    type: checkbox.dataset.type,
    path: checkbox.dataset.path
  }));
}

// 更新批量删除按钮状态
function updateBatchDeleteButton() {
  const batchDeleteBtn = document.getElementById('batch-delete-btn');
  if (!batchDeleteBtn) return;
  
  const selectedCount = getSelectedItems().length;
  batchDeleteBtn.disabled = selectedCount === 0;
  if (selectedCount > 0) {
    batchDeleteBtn.title = `删除选中的 ${selectedCount} 项`;
  } else {
    batchDeleteBtn.title = '删除选中项';
  }
}

// 更新全选复选框状态
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  if (!selectAllCheckbox) return;
  
  const allCheckboxes = document.querySelectorAll('.file-checkbox');
  const checkedCheckboxes = document.querySelectorAll('.file-checkbox:checked');
  
  if (allCheckboxes.length === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCheckboxes.length === allCheckboxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCheckboxes.length > 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  }
}

// 全选/取消全选
function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  if (!selectAllCheckbox) return;
  
  const allCheckboxes = document.querySelectorAll('.file-checkbox');
  const isChecked = selectAllCheckbox.checked;
  
  allCheckboxes.forEach(checkbox => {
    checkbox.checked = isChecked;
  });
  
  updateBatchDeleteButton();
}

// 批量删除
async function batchDelete() {
  const selectedItems = getSelectedItems();
  
  if (selectedItems.length === 0) {
    alert('请先选择要删除的项目');
    return;
  }
  
  // 先进行身份验证
  let authConfirmed = false;
  await new Promise((resolve) => {
    if (window.uploadAuth) {
      window.uploadAuth.requireAuth((authenticated) => {
        authConfirmed = authenticated;
        resolve();
      });
    } else {
      // 如果没有认证模块，直接确认（向后兼容）
      authConfirmed = true;
      resolve();
    }
  });
  
  if (!authConfirmed) {
    return;
  }
  
  // 执行批量删除操作的函数
  async function performBatchDelete() {
    const batchDeleteBtn = document.getElementById('batch-delete-btn');
  if (batchDeleteBtn) {
    batchDeleteBtn.disabled = true;
    batchDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 删除中...';
  }
  
  let successCount = 0;
  let failedItems = [];
  
  for (const item of selectedItems) {
    try {
      if (item.type === 'file') {
        // 删除文件
        const state = window.uploadState;
        const fileRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(item.path)}`);
        if (!fileRes.ok) {
          throw new Error(`获取文件信息失败: HTTP ${fileRes.status}`);
        }
        
        const fileData = await fileRes.json();
        if (!fileData.sha) {
          throw new Error('无法获取文件 SHA');
        }
        
        await window.apiRequest({
          action: 'delete',
          path: item.path,
          sha: fileData.sha,
          message: `Delete: ${item.path}`
        });
      } else {
        // 删除文件夹
        await window.deleteFolder(item.path);
      }
      
      successCount++;
      // 每个删除操作后稍作等待，避免API限流
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`删除失败: ${item.path}`, err);
      failedItems.push({ path: item.path, error: err.message || '未知错误' });
    }
  }
  
  // 恢复按钮状态
  if (batchDeleteBtn) {
    batchDeleteBtn.disabled = false;
    batchDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> 批量删除';
  }
  
  // 清除所有选中状态
  document.querySelectorAll('.file-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  updateSelectAllCheckbox();
  updateBatchDeleteButton();
  
  // 重新加载文件列表
  if (window.loadFiles) {
    window.loadFiles();
  }
  
  // 显示结果
  if (failedItems.length > 0) {
    const failedPaths = failedItems.map(item => item.path).join('\n');
    alert(`删除完成！\n\n成功: ${successCount} 项\n失败: ${failedItems.length} 项\n\n失败的项目:\n${failedPaths}`);
  } else {
    alert(`删除完成！成功删除 ${successCount} 项`);
  }
  
  // 删除完成后退出复选模式
  exitSelectMode();
  }
  
  // 使用现代化批量删除对话框
  await new Promise(async (resolve) => {
    if (window.showBatchDeleteConfirmDialog) {
      window.showBatchDeleteConfirmDialog({
        items: selectedItems,
        callback: async (confirmed) => {
          if (!confirmed) {
            resolve();
            return;
          }
          // 继续执行批量删除操作
          await performBatchDelete();
          resolve();
        }
      });
    } else {
      // 向后兼容：如果没有对话框模块，使用原始 confirm
      const fileCount = selectedItems.filter(item => item.type === 'file').length;
      const folderCount = selectedItems.filter(item => item.type === 'folder').length;
      
      let confirmMessage = `确定要删除选中的 ${selectedItems.length} 项吗？\n\n`;
      if (fileCount > 0) {
        confirmMessage += `文件: ${fileCount} 个\n`;
      }
      if (folderCount > 0) {
        confirmMessage += `文件夹: ${folderCount} 个\n`;
        confirmMessage += `\n注意：删除文件夹将同时删除其所有内容！`;
      }
      
      if (!confirm(confirmMessage)) {
        resolve();
        return;
      }
      await performBatchDelete();
      resolve();
    }
  });
}

// 切换复选模式
function toggleSelectMode() {
  const fileBrowser = document.querySelector('.file-browser');
  const selectControls = document.getElementById('select-controls');
  const toggleBtn = document.getElementById('toggle-select-mode-btn');
  
  if (!fileBrowser || !selectControls || !toggleBtn) return;
  
  const isSelectMode = fileBrowser.classList.contains('select-mode');
  
  if (isSelectMode) {
    // 退出复选模式
    fileBrowser.classList.remove('select-mode');
    selectControls.style.display = 'none';
    toggleBtn.style.display = 'flex';
    // 清除所有选中状态
    document.querySelectorAll('.file-checkbox').forEach(checkbox => {
      checkbox.checked = false;
    });
    updateSelectAllCheckbox();
    updateBatchDeleteButton();
  } else {
    // 进入复选模式
    fileBrowser.classList.add('select-mode');
    selectControls.style.display = 'flex';
    toggleBtn.style.display = 'none';
  }
}

// 退出复选模式
function exitSelectMode() {
  const fileBrowser = document.querySelector('.file-browser');
  const selectControls = document.getElementById('select-controls');
  const toggleBtn = document.getElementById('toggle-select-mode-btn');
  
  if (!fileBrowser || !selectControls || !toggleBtn) return;
  
  fileBrowser.classList.remove('select-mode');
  selectControls.style.display = 'none';
  toggleBtn.style.display = 'flex';
  
  // 清除所有选中状态
  document.querySelectorAll('.file-checkbox').forEach(checkbox => {
    checkbox.checked = false;
  });
  updateSelectAllCheckbox();
  updateBatchDeleteButton();
}

// 初始化事件监听
function initSelectControls() {
  // 切换复选模式按钮
  const toggleBtn = document.getElementById('toggle-select-mode-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSelectMode);
  }
  
  // 退出复选模式按钮
  const exitBtn = document.getElementById('exit-select-mode-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', exitSelectMode);
  }
  
  // 全选复选框
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', toggleSelectAll);
  }
  
  // 批量删除按钮
  const batchDeleteBtn = document.getElementById('batch-delete-btn');
  if (batchDeleteBtn) {
    batchDeleteBtn.addEventListener('click', batchDelete);
  }
  
  // 监听所有文件复选框的变化
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('file-checkbox')) {
      updateSelectAllCheckbox();
      updateBatchDeleteButton();
    }
  });
  
  // 初始状态更新
  updateSelectAllCheckbox();
  updateBatchDeleteButton();
}

// 当文件列表更新时，重新初始化
const originalRenderFiles = window.renderFiles;
if (originalRenderFiles) {
  window.renderFiles = function() {
    originalRenderFiles();
    // 延迟一下，确保DOM已更新
    setTimeout(() => {
      updateSelectAllCheckbox();
      updateBatchDeleteButton();
    }, 0);
  };
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSelectControls);
} else {
  initSelectControls();
}

// 导出到全局作用域
window.getSelectedItems = getSelectedItems;
window.updateSelectAllCheckbox = updateSelectAllCheckbox;
window.updateBatchDeleteButton = updateBatchDeleteButton;
window.toggleSelectAll = toggleSelectAll;
window.batchDelete = batchDelete;
window.toggleSelectMode = toggleSelectMode;
window.exitSelectMode = exitSelectMode;

})();

