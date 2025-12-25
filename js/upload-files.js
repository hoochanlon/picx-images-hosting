// upload-files.js - 文件操作（加载、创建文件夹）

(function() {
  'use strict';
  const state = window.uploadState;

// 加载文件列表
async function loadFiles() {
  const fileListEl = state.fileListEl();
  if (!fileListEl) return;
  
  try {
    fileListEl.innerHTML = '<li class="empty-state"><div>正在加载...</div></li>';
    const tree = await fetchTree();
    
    const allItems = (tree.tree || []).filter(item => item.type === 'blob' || item.type === 'tree');
    
    const folders = [];
    const files = [];
    
    // 规范化当前路径
    const normalizedCurrentPath = (state.currentPath() || '').trim();
    
    allItems.forEach(item => {
      const itemPath = item.path;
      
      if (item.type === 'tree') {
        // 对于文件夹（tree），检查其父目录是否等于当前路径
        const itemDir = itemPath.includes('/') ? itemPath.slice(0, itemPath.lastIndexOf('/')) : '';
        const normalizedItemDir = (itemDir || '').trim();
        
        if (normalizedItemDir === normalizedCurrentPath) {
          folders.push({
            name: itemPath.split('/').pop(),
            path: itemPath
          });
        }
      } else {
        // 对于文件（blob），检查其所在目录是否等于当前路径
        const itemDir = itemPath.includes('/') ? itemPath.slice(0, itemPath.lastIndexOf('/')) : '';
        const normalizedItemDir = (itemDir || '').trim();
        
        if (normalizedItemDir === normalizedCurrentPath) {
          files.push({
            name: itemPath.split('/').pop(),
            path: itemPath
          });
        }
      }
    });
    
    folders.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    
    state.setFolders(folders);
    state.setFiles(files);
    
    if (window.renderFiles) window.renderFiles();
  } catch (err) {
    console.error(err);
    fileListEl.innerHTML = `
      <li class="empty-state">
        <div class="empty-state-icon">❌</div>
        <div>加载失败：${err.message}</div>
      </li>
    `;
  }
}

// 创建文件夹
async function createFolder(nameOrPath) {
  if (!nameOrPath || !nameOrPath.trim()) {
    alert('请输入文件夹名称或路径');
    return;
  }
  
  let inputPath = nameOrPath.trim();
  
  // 规范化路径：移除开头的斜杠（如果用户输入了绝对路径，转换为相对路径）
  if (inputPath.startsWith('/')) {
    inputPath = inputPath.substring(1);
  }
  
  // 移除末尾的斜杠（如果有）
  if (inputPath.endsWith('/')) {
    inputPath = inputPath.slice(0, -1);
  }
  
  // 验证路径格式（不能包含非法字符）
  if (inputPath.includes('..') || inputPath.includes('//')) {
    alert('路径格式不正确，不能包含 ".." 或连续的斜杠');
    return;
  }
  
  // 构建完整路径：总是相对于当前目录
  const folderPath = buildPath(state.currentPath(), inputPath);
  
  // 规范化最终路径
  let normalizedPath = folderPath.trim();
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }
  
  if (!normalizedPath) {
    alert('路径不能为空');
    return;
  }
  
  // 使用 ensureDirectoryExists 来创建文件夹（支持创建嵌套文件夹）
  try {
    await ensureDirectoryExists(normalizedPath, 3);
    
    loadFiles();
    if (window.closeModal) window.closeModal('create-folder');
    const folderNameInput = state.folderNameInput();
    if (folderNameInput) folderNameInput.value = '';
  } catch (err) {
    console.error('创建文件夹失败:', err);
    alert('创建文件夹失败：' + (err.message || '未知错误'));
  }
}

// 确保目录存在（通过创建 .gitkeep 文件）
async function ensureDirectoryExists(dirPath, maxRetries = 3) {
  if (!dirPath || dirPath === '') return;
  
  // 规范化路径：移除开头的斜杠和末尾的斜杠
  let normalizedPath = dirPath.trim();
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.substring(1);
  }
  if (normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  // 分割路径为各个部分
  const parts = normalizedPath.split('/').filter(p => p);
  if (parts.length === 0) return;
  
  // 递归创建所有父目录
  let currentPath = '';
  for (let i = 0; i < parts.length; i++) {
    currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
    const gitkeepPath = `${currentPath}/.gitkeep`;
    
    // 检查目录是否已存在（增加重试次数和等待时间）
    let dirExists = false;
    for (let checkRetry = 0; checkRetry < 3; checkRetry++) {
      try {
        const checkRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(gitkeepPath)}`);
        if (checkRes.ok) {
          dirExists = true;
          break;
        }
      } catch (e) {
        // 文件不存在，需要创建
      }
      if (checkRetry < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (checkRetry + 1)));
      }
    }
    
    if (dirExists) {
      // 目录已存在，继续下一个
      continue;
    }
    
    // 如果当前不是第一个目录，确保父目录存在
    if (i > 0) {
      const parentPath = parts.slice(0, i).join('/');
      await ensureDirectoryExists(parentPath, maxRetries);
    }
    
    // 创建 .gitkeep 文件来确保目录存在（增加重试机制）
    let created = false;
    let lastError = null;
    
    for (let createRetry = 0; createRetry < maxRetries; createRetry++) {
      try {
        await apiRequest({
          action: 'upload',
          path: gitkeepPath,
          content: btoa(''),
          message: `Create directory: ${currentPath}/`
        });
        
        // 验证目录是否真正创建成功
        let verified = false;
        const verifyWaitTime = state.isLocalhost() ? 2000 : 1500;
        const maxVerifyRetries = state.isLocalhost() ? 8 : 6;
        
        for (let verifyRetry = 0; verifyRetry < maxVerifyRetries; verifyRetry++) {
          await new Promise(resolve => setTimeout(resolve, verifyWaitTime * (verifyRetry + 1)));
          try {
            const verifyRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(gitkeepPath)}`);
            if (verifyRes.ok) {
              verified = true;
              break;
            }
          } catch (e) {
            // 验证失败，继续重试
          }
        }
        
        if (verified) {
          created = true;
          break;
        }
      } catch (err) {
        console.error(`创建目录 ${currentPath} 失败 (尝试 ${createRetry + 1}/${maxRetries}):`, err);
        lastError = err;
        const errorMsg = err.message || '';
        
        // 如果错误是目录不存在，尝试再次创建父目录
        if (errorMsg.includes('not be found') && i > 0) {
          const parentPath = parts.slice(0, i).join('/');
          await ensureDirectoryExists(parentPath, maxRetries);
          // 等待父目录生效
          await new Promise(resolve => setTimeout(resolve, state.isLocalhost() ? 3000 : 2000));
        }
        
        // 如果不是最后一次重试，等待后继续
        if (createRetry < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, state.isLocalhost() ? 3000 : 2000));
        }
      }
    }
    
    if (!created) {
      const errorMsg = lastError ? lastError.message : '未知错误';
      throw new Error(`无法创建目录 ${currentPath} (已重试 ${maxRetries} 次): ${errorMsg}`);
    }
  }
}

// 导出到全局作用域
window.loadFiles = loadFiles;
window.createFolder = createFolder;
window.ensureDirectoryExists = ensureDirectoryExists;

})();
