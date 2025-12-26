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
        // 404 是预期的（文件不存在），不需要记录错误
        if (checkRes.status === 404) {
          break;
        }
      } catch (e) {
        // 网络错误，忽略（文件不存在是正常的）
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
        const result = await apiRequest({
          action: 'upload',
          path: gitkeepPath,
          content: btoa(''),
          message: `Create directory: ${currentPath}/`
        });
        
        // 如果 API 返回成功，认为创建成功（GitHub API 返回 201 表示创建成功）
        // 即使验证时返回 404，也可能是 GitHub API 同步延迟，不影响实际创建
        created = true;
        
        // 可选：快速验证（不阻塞，仅用于日志）
        // 如果验证失败，不影响创建成功的判断
        setTimeout(async () => {
          try {
            const verifyRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(gitkeepPath)}`);
            if (!verifyRes.ok && verifyRes.status !== 404) {
              console.warn(`目录 ${currentPath} 创建后验证失败，但可能已成功创建`);
            }
          } catch (e) {
            // 验证失败不影响主流程
          }
        }, 1000);
        
        break;
      } catch (err) {
        const errorMsg = err.message || '';
        const errorLower = errorMsg.toLowerCase();
        const errorStatus = err.status || 0;
        
        // 422 错误通常表示文件已存在（需要 SHA 来更新）
        // 如果错误提示文件已存在或需要 SHA，认为目录可能已存在
        if (errorStatus === 422 || 
            errorLower.includes('already exists') || 
            errorLower.includes('file exists') ||
            (errorLower.includes('sha') && (errorLower.includes('wasn\'t supplied') || errorLower.includes('required')))) {
          // 文件已存在，说明目录已存在，认为创建成功
          // 可选：验证文件是否真的存在（不阻塞）
          setTimeout(async () => {
            try {
              const checkRes = await fetch(`${state.API_BASE()}/api/file?path=${encodeURIComponent(gitkeepPath)}`);
              if (!checkRes.ok && checkRes.status !== 404) {
                console.warn(`目录 ${currentPath} 的 .gitkeep 文件检查异常，但目录可能已存在`);
              }
            } catch (e) {
              // 检查失败不影响主流程
            }
          }, 500);
          
          // 认为创建成功（目录已存在）
          created = true;
          break;
        }
        
        console.error(`创建目录 ${currentPath} 失败 (尝试 ${createRetry + 1}/${maxRetries}):`, err);
        lastError = err;
        
        // 如果错误是目录不存在，尝试再次创建父目录
        if ((errorLower.includes('not be found') || errorLower.includes('not found')) && i > 0) {
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
      // 最后检查：如果文件夹可能已经存在（通过检查文件夹本身）
      try {
        const tree = await fetchTree();
        const allItems = (tree.tree || []).filter(item => item.type === 'tree');
        const folderExists = allItems.some(item => item.path === currentPath);
        if (folderExists) {
          // 文件夹已存在，认为成功
          created = true;
        }
      } catch (e) {
        // 检查失败，继续抛出错误
      }
      
      if (!created) {
        const errorMsg = lastError ? lastError.message : '未知错误';
        throw new Error(`无法创建目录 ${currentPath} (已重试 ${maxRetries} 次): ${errorMsg}`);
      }
    }
  }
}

// 导出到全局作用域
window.loadFiles = loadFiles;
window.createFolder = createFolder;
window.ensureDirectoryExists = ensureDirectoryExists;

})();
