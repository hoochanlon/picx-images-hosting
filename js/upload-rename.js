// upload-rename.js - 重命名功能

(function() {
  'use strict';
  const state = window.uploadState;

// 显示重命名模态框
function showRenameModal(type, path, currentName) {
  const renameInput = state.renameInput();
  if (!renameInput) return;
  
  renameInput.value = currentName;
  renameInput.dataset.type = type;
  renameInput.dataset.path = path;
  if (window.showModal) window.showModal('rename');
}

// 重命名项目
async function renameItem(type, oldPath, newName) {
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
  
  if (!newName || !newName.trim()) {
    alert('请输入新名称');
    return;
  }
  
  const parentPath = getParentPath(oldPath);
  const newPath = buildPath(parentPath, newName.trim());
  
  if (type === 'folder') {
    // 文件夹重命名需要移动所有文件
    alert('文件夹重命名功能需要移动所有文件，此功能较复杂，建议手动操作');
    return;
  }
  
  try {
    // 获取原文件内容
    const fileRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(oldPath)}`);
    const fileData = await fileRes.json();
    
    // 创建新文件
    await apiRequest({
      action: 'upload',
      path: newPath,
      content: fileData.content,
      message: `Rename: ${oldPath} -> ${newPath}`
    });
    
    // 删除原文件
    await apiRequest({
      action: 'delete',
      path: oldPath,
      sha: fileData.sha,
      message: `Delete old file: ${oldPath}`
    });
    
    if (window.loadFiles) window.loadFiles();
    if (window.closeModal) window.closeModal('rename');
  } catch (err) {
    console.error(err);
    alert('重命名失败：' + err.message);
  }
}

// 导出到全局作用域
window.showRenameModal = showRenameModal;
window.renameItem = renameItem;

})();
