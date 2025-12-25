// upload-delete.js - 删除功能

(function() {
  'use strict';
  const state = window.uploadState;

// 递归删除文件夹及其所有内容
async function deleteFolder(folderPath) {
  // 规范化文件夹路径
  let normalizedPath = folderPath.trim();
  if (normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  // 获取所有文件树
  const tree = await fetchTree();
  const allItems = (tree.tree || []).filter(item => item.type === 'blob' || item.type === 'tree');
  
  // 找到文件夹下的所有文件和直接子文件夹（不包括嵌套内容）
  const directItems = allItems.filter(item => {
    const itemPath = item.path;
    // 检查是否是文件夹的直接子项（不是嵌套的）
    if (!itemPath.startsWith(normalizedPath + '/')) {
      return false;
    }
    // 获取相对于文件夹的路径
    const relativePath = itemPath.substring(normalizedPath.length + 1);
    // 如果是直接子项，相对路径中不应该再有斜杠
    return !relativePath.includes('/');
  });
  
  if (directItems.length === 0) {
    // 文件夹为空，只删除 .gitkeep 文件
    const gitkeepPath = `${normalizedPath}/.gitkeep`;
    try {
      const gitkeepRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(gitkeepPath)}`);
      if (gitkeepRes.ok) {
        const gitkeepData = await gitkeepRes.json();
        if (gitkeepData.sha) {
          await apiRequest({
            action: 'delete',
            path: gitkeepPath,
            sha: gitkeepData.sha,
            message: `Delete folder: ${normalizedPath}`
          });
        }
      }
    } catch (err) {
      // .gitkeep 可能不存在，忽略错误
    }
    return;
  }
  
  // 先删除所有文件，再删除子文件夹（子文件夹会递归删除其内容）
  const filesToDelete = directItems.filter(item => item.type === 'blob');
  const foldersToDelete = directItems.filter(item => item.type === 'tree');
  
  // 删除所有文件
  let deletedCount = 0;
  let failedItems = [];
  
  for (const item of filesToDelete) {
    try {
      const fileRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(item.path)}`);
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        if (fileData.sha) {
          await apiRequest({
            action: 'delete',
            path: item.path,
            sha: fileData.sha,
            message: `Delete: ${item.path}`
          });
          deletedCount++;
        }
      }
      // 每个删除操作后稍作等待，避免API限流
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`删除失败: ${item.path}`, err);
      failedItems.push({ path: item.path, error: err.message });
    }
  }
  
  // 递归删除所有子文件夹
  for (const item of foldersToDelete) {
    try {
      await deleteFolder(item.path);
      deletedCount++;
      // 每个删除操作后稍作等待，避免API限流
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`删除子文件夹失败: ${item.path}`, err);
      failedItems.push({ path: item.path, error: err.message });
    }
  }
  
  // 最后删除文件夹本身的 .gitkeep 文件
  try {
    const gitkeepPath = `${normalizedPath}/.gitkeep`;
    const gitkeepRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(gitkeepPath)}`);
    if (gitkeepRes.ok) {
      const gitkeepData = await gitkeepRes.json();
      if (gitkeepData.sha) {
        await apiRequest({
          action: 'delete',
          path: gitkeepPath,
          sha: gitkeepData.sha,
          message: `Delete folder: ${normalizedPath}`
        });
      }
    }
  } catch (err) {
    // .gitkeep 可能不存在，忽略错误
  }
  
  if (failedItems.length > 0) {
    const failedPaths = failedItems.map(item => item.path).join('\n');
    throw new Error(`部分项目删除失败:\n${failedPaths}`);
  }
}

// 删除项目
async function deleteItem(type, path) {
  if (!confirm(`确定要删除${type === 'folder' ? '文件夹' : '文件'} "${path}" 吗？${type === 'folder' ? '\n\n注意：将删除文件夹及其所有内容！' : ''}`)) {
    return;
  }
  
  try {
    if (type === 'file') {
      // 获取文件信息
      const fileRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(path)}`);
      if (!fileRes.ok) {
        const errorData = await fileRes.json().catch(() => ({}));
        throw new Error(errorData.message || `获取文件信息失败: HTTP ${fileRes.status}`);
      }
      
      const fileData = await fileRes.json();
      if (!fileData.sha) {
        throw new Error('无法获取文件 SHA，文件可能不存在');
      }
      
      // 执行删除
      await apiRequest({
        action: 'delete',
        path: path,
        sha: fileData.sha,
        message: `Delete: ${path}`
      });
    } else {
      // 删除文件夹：需要删除文件夹下的所有文件和子文件夹
      await deleteFolder(path);
    }
    
    if (window.loadFiles) window.loadFiles();
  } catch (err) {
    console.error('删除失败:', err);
    const errorMessage = err.message || '删除失败，请检查网络连接或稍后重试';
    alert('删除失败：' + errorMessage);
  }
}

// 导出到全局作用域
window.deleteFolder = deleteFolder;
window.deleteItem = deleteItem;

})();
