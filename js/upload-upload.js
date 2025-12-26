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
  
  // 检查是否启用压缩
  const compressionEnabled = isCompressionEnabled();
  
  // 如果启用压缩，先压缩所有图片
  let filesToUpload = filesArray;
  if (compressionEnabled) {
    try {
      // 显示压缩进度
      const compressProgressItem = document.createElement('div');
      compressProgressItem.className = 'progress-item';
      compressProgressItem.innerHTML = `
        <div class="file-name">正在压缩图片...</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-text">0%</div>
      `;
      uploadProgressEl.appendChild(compressProgressItem);
      
      const compressProgressFill = compressProgressItem.querySelector('.progress-fill');
      const compressProgressText = compressProgressItem.querySelector('.progress-text');
      
      // 压缩图片
      filesToUpload = await compressImages(filesArray, (current, total, fileName, status, info) => {
        const percent = Math.round((current / total) * 100);
        compressProgressFill.style.width = `${percent}%`;
        
        if (status === 'compressing') {
          compressProgressText.textContent = `压缩中: ${fileName} (${current}/${total})`;
        } else if (status === 'completed' && info) {
          const savedMB = (info.saved / 1024 / 1024).toFixed(2);
          compressProgressText.textContent = `${fileName}: 已压缩 ${info.savedPercent}% (节省 ${savedMB}MB)`;
        } else if (status === 'skipped') {
          compressProgressText.textContent = `${fileName}: 跳过 (非图片或不可压缩格式)`;
        } else if (status === 'failed') {
          compressProgressText.textContent = `${fileName}: 压缩失败，使用原文件`;
        }
      });
      
      compressProgressFill.style.width = '100%';
      compressProgressText.textContent = '压缩完成';
      compressProgressItem.style.opacity = '0.6';
    } catch (err) {
      console.error('批量压缩失败:', err);
      // 压缩失败时使用原文件
      filesToUpload = filesArray;
    }
  }
  
  // 检查是否启用时间戳重命名
  const timestampRenameEnabled = isTimestampRenameEnabled();
  
  // 上传所有文件
  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    // 根据设置决定是否使用时间戳格式重命名文件
    const timestampFilename = timestampRenameEnabled ? generateTimestampFilename(file.name) : file.name;
    
    const progressItem = document.createElement('div');
    progressItem.className = 'progress-item';
    const displayName = timestampRenameEnabled && timestampFilename !== file.name ? 
      `${file.name} → ${timestampFilename}` : file.name;
    progressItem.innerHTML = `
      <div class="file-name">${displayName}</div>
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
    // 使用时间戳格式重命名文件
    const timestampFilename = generateTimestampFilename(file.name);
      const filePath = buildPath(targetPath, timestampFilename);
      
      if (!filePath) {
        throw new Error('文件路径不能为空');
      }
      
      // 构建上传请求体
      const uploadPayload = {
        action: 'upload',
        path: filePath,
        content: content,
        message: `Upload: ${filePath}`
      };
      
      // 添加认证token（优先使用 GitHub token）
      if (window.uploadAuth) {
        const githubToken = window.uploadAuth.getGitHubToken && window.uploadAuth.getGitHubToken();
        if (githubToken) {
          uploadPayload.githubToken = githubToken;
        } else {
          const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
          if (authToken) {
            uploadPayload.authToken = authToken;
          }
        }
      }
      
      // 上传文件
      const uploadRes = await fetch(state.API_ENDPOINT(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadPayload),
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
          const fileDir = getParentPath(filePath);
          if (fileDir) {
            const normalizedFileDir = fileDir.replace(/^\/+|\/+$/g, '');
            if (normalizedFileDir) {
              await ensureDirectoryExists(normalizedFileDir, 2);
              // 等待目录生效
              await new Promise(resolve => setTimeout(resolve, state.isLocalhost() ? 3000 : 2000));
              
              // 重试上传（使用相同的时间戳文件名）
              const retryContent = await toBase64(file);
              const retryFilePath = filePath; // 使用相同的时间戳文件名
              
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

// 检查是否启用压缩
function isCompressionEnabled() {
  const checkbox = document.getElementById('enable-compression-checkbox');
  if (checkbox) {
    return checkbox.checked;
  }
  // 从 localStorage 读取，如果没有则使用配置的默认值
  const savedState = localStorage.getItem('enableImageCompression');
  if (savedState !== null) {
    return savedState === 'true';
  }
  // 默认从配置读取，如果未设置则返回 false
  return window.APP_CONFIG?.ENABLE_IMAGE_COMPRESSION === true;
}

// 检查是否启用时间戳重命名
function isTimestampRenameEnabled() {
  const checkbox = document.getElementById('enable-timestamp-rename-checkbox');
  if (checkbox) {
    return checkbox.checked;
  }
  // 从 localStorage 读取，如果没有则使用配置的默认值
  const savedState = localStorage.getItem('enableTimestampRename');
  if (savedState !== null) {
    return savedState === 'true';
  }
  // 默认从配置读取，如果未设置则返回 false
  return window.APP_CONFIG?.ENABLE_TIMESTAMP_RENAME === true;
}

// 导出到全局作用域
window.getUploadPath = getUploadPath;
window.saveUploadPath = saveUploadPath;
window.uploadFiles = uploadFiles;
window.isCompressionEnabled = isCompressionEnabled;
window.isTimestampRenameEnabled = isTimestampRenameEnabled;

})();
