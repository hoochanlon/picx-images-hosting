// upload-upload.js - 上传功能

(function() {
  'use strict';
  const state = window.uploadState;

// 获取和保存上传目录设置
function getUploadPath() {
  const saved = localStorage.getItem('uploadPath');
  return saved || '';
}

function saveUploadPath(path) {
  if (path && path.trim()) {
    localStorage.setItem('uploadPath', path.trim());
  } else {
    localStorage.removeItem('uploadPath');
  }
}

// 上传文件（支持单文件和多文件上传）
async function uploadFiles(fileList, basePath = '') {
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
  
  // 优先级：basePath > 设置的上传目录 > 当前浏览目录 > 默认目录
  let targetPath = basePath || getUploadPath() || state.currentPath() || 'imgs/uploads/kate/';
  // 确保路径格式正确
  if (targetPath && !targetPath.endsWith('/')) {
    targetPath += '/';
  }
  const filesArray = Array.from(fileList);
  
  if (filesArray.length === 0) return;
  
  const uploadProgressEl = state.uploadProgressEl();
  if (!uploadProgressEl) return;
  
  uploadProgressEl.style.display = 'block';
  uploadProgressEl.innerHTML = '';
  
  // 确保目标目录存在
  const normalizedDir = targetPath.replace(/\/$/, '');
  if (normalizedDir) {
    try {
      await ensureDirectoryExists(normalizedDir, 2);
      // 等待目录生效
      await new Promise(resolve => setTimeout(resolve, state.isLocalhost() ? 2000 : 1000));
    } catch (err) {
      console.error('目录创建失败:', err);
    }
  }
  
  // 上传所有文件
  for (let i = 0; i < filesArray.length; i++) {
    const file = filesArray[i];
    const progressItem = document.createElement('div');
    progressItem.className = 'progress-item';
    progressItem.innerHTML = `
      <div class="file-name">${file.name}</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
      <div class="progress-text">0%</div>
    `;
    uploadProgressEl.appendChild(progressItem);
    
    const progressFill = progressItem.querySelector('.progress-fill');
    const progressText = progressItem.querySelector('.progress-text');
    
    try {
      const content = await toBase64(file);
      const filePath = buildPath(targetPath, file.name);
      
      if (!filePath) {
        throw new Error('文件路径不能为空');
      }
      
      // 上传文件
      const uploadRes = await fetch(state.API_ENDPOINT(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          path: filePath,
          content: content,
          message: `Upload: ${filePath}`
        }),
      });
      
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || `HTTP ${uploadRes.status}`;
        throw new Error(errorMsg);
      }
      
      progressFill.style.width = '100%';
      progressText.textContent = '完成';
      progressItem.style.opacity = '0.6';
    } catch (err) {
      let errorMsg = err.message || '上传失败';
      
      // 如果是目录不存在错误，尝试创建目录后重试
      if (errorMsg.includes('not be found')) {
        try {
          const fileDir = getParentPath(buildPath(targetPath, file.name));
          if (fileDir) {
            const normalizedFileDir = fileDir.replace(/^\/+|\/+$/g, '');
            if (normalizedFileDir) {
              await ensureDirectoryExists(normalizedFileDir, 2);
              // 等待目录生效
              await new Promise(resolve => setTimeout(resolve, state.isLocalhost() ? 3000 : 2000));
              
              // 重试上传
              const retryContent = await toBase64(file);
              const retryFilePath = buildPath(targetPath, file.name);
              
              const retryPayload = {
                action: 'upload',
                path: retryFilePath,
                content: retryContent,
                message: `Upload: ${retryFilePath}`
              };
              
              // 添加认证token（优先使用 GitHub token）
              if (window.uploadAuth) {
                const githubToken = window.uploadAuth.getGitHubToken && window.uploadAuth.getGitHubToken();
                if (githubToken) {
                  retryPayload.githubToken = githubToken;
                } else {
                  const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
                  if (authToken) {
                    retryPayload.authToken = authToken;
                  }
                  // 注意：不再使用 API_SECRET，因为它存储在客户端，不安全
                  // 如果用户未登录，requireAuth 会要求用户输入密码
                }
              }
              
              const retryRes = await fetch(state.API_ENDPOINT(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(retryPayload),
              });
              
              if (retryRes.ok) {
                progressFill.style.width = '100%';
                progressText.textContent = '完成';
                progressItem.style.opacity = '0.6';
                continue;
              } else {
                const retryErrorData = await retryRes.json().catch(() => ({}));
                errorMsg = retryErrorData.message || retryErrorData.error || `HTTP ${retryRes.status}`;
              }
            }
          }
        } catch (retryErr) {
          errorMsg = `目录创建失败: ${retryErr.message || '请检查路径是否正确'}`;
        }
      } else if (errorMsg.includes('already exists')) {
        errorMsg = '文件已存在，请重命名后重试';
      }
      
      progressText.textContent = '失败：' + errorMsg;
      progressItem.style.color = '#cf222e';
      console.error('上传失败:', file.name, errorMsg);
    }
  }
  
  // 上传完成后刷新文件列表
  setTimeout(() => {
    if (window.loadFiles) window.loadFiles();
    setTimeout(() => {
      uploadProgressEl.style.display = 'none';
      uploadProgressEl.innerHTML = '';
    }, 2000);
  }, 1000);
}

// 导出到全局作用域
window.getUploadPath = getUploadPath;
window.saveUploadPath = saveUploadPath;
window.uploadFiles = uploadFiles;

})();
