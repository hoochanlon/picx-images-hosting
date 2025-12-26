// 上传功能
async function uploadSelectedFiles() {
  const files = Array.from(uploadFileInput.files || []);
  if (!files.length) {
    alert('请先选择文件');
    return;
  }
  
  // 检查认证状态
  if (window.uploadAuth && typeof window.uploadAuth.isAuthenticated === 'function') {
    if (!window.uploadAuth.isAuthenticated()) {
      // 未认证，提示用户登录
      if (window.uploadAuth.requireAuth) {
        window.uploadAuth.requireAuth((authenticated) => {
          if (authenticated) {
            // 认证成功，重新尝试上传
            uploadSelectedFiles();
          } else {
            setStatus('上传需要认证，请先登录', true);
          }
        });
        return;
      } else {
        alert('上传需要认证，请先点击右上角的锁图标登录');
        setStatus('上传需要认证，请先登录', true);
        return;
      }
    }
  }
  
  const folder = uploadPathInput.value;
  
  // 显示进度区域
  const progressModal = document.getElementById('upload-progress-modal');
  const progressContent = document.getElementById('upload-progress-content-modal');
  if (progressModal && progressContent) {
    progressModal.style.display = 'block';
    progressContent.innerHTML = '';
  }
  
  // 禁用上传按钮
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.textContent = '上传中...';
  }
  
  // 检查是否启用压缩
  const compressionEnabled = isCompressionEnabledModal();
  let filesToUpload = files;
  
  // 如果启用压缩，先压缩图片
  if (compressionEnabled && window.compressImages) {
    try {
      // 显示压缩进度
      if (progressContent) {
        const compressProgressItem = document.createElement('div');
        compressProgressItem.className = 'progress-item-modal';
        compressProgressItem.innerHTML = `
          <div class="file-name-modal">正在压缩图片...</div>
          <div class="progress-bar-modal">
            <div class="progress-fill-modal" style="width: 0%"></div>
          </div>
          <div class="progress-text-modal">0%</div>
        `;
        progressContent.appendChild(compressProgressItem);
        
        const compressProgressFill = compressProgressItem.querySelector('.progress-fill-modal');
        const compressProgressText = compressProgressItem.querySelector('.progress-text-modal');
        
        // 压缩图片
        filesToUpload = await window.compressImages(files, (current, total, fileName, status, info) => {
          const percent = Math.round((current / total) * 100);
          if (compressProgressFill) {
            compressProgressFill.style.width = `${percent}%`;
          }
          
          if (status === 'compressing') {
            if (compressProgressText) {
              compressProgressText.textContent = `压缩中: ${fileName} (${current}/${total})`;
            }
            setStatus(`压缩中: ${fileName} (${current}/${total})`);
          } else if (status === 'completed' && info) {
            const savedMB = (info.saved / 1024 / 1024).toFixed(2);
            if (compressProgressText) {
              compressProgressText.textContent = `${fileName}: 已压缩 ${info.savedPercent}% (节省 ${savedMB}MB)`;
            }
            setStatus(`${fileName}: 已压缩 ${info.savedPercent}% (节省 ${savedMB}MB)`);
          } else if (status === 'skipped') {
            if (compressProgressText) {
              compressProgressText.textContent = `${fileName}: 跳过 (非图片或不可压缩格式)`;
            }
            setStatus(`${fileName}: 跳过压缩`);
          } else if (status === 'failed') {
            if (compressProgressText) {
              compressProgressText.textContent = `${fileName}: 压缩失败，使用原文件`;
            }
            setStatus(`${fileName}: 压缩失败，使用原文件`);
          }
        });
        
        if (compressProgressFill) {
          compressProgressFill.style.width = '100%';
        }
        if (compressProgressText) {
          compressProgressText.textContent = '压缩完成';
        }
        if (compressProgressItem) {
          compressProgressItem.style.opacity = '0.6';
        }
      } else {
        // 如果没有进度区域，使用状态提示
        setStatus('正在压缩图片...');
        filesToUpload = await window.compressImages(files, (current, total, fileName, status, info) => {
          if (status === 'compressing') {
            setStatus(`压缩中: ${fileName} (${current}/${total})`);
          } else if (status === 'completed' && info) {
            const savedMB = (info.saved / 1024 / 1024).toFixed(2);
            setStatus(`${fileName}: 已压缩 ${info.savedPercent}% (节省 ${savedMB}MB)`);
          } else if (status === 'skipped') {
            setStatus(`${fileName}: 跳过压缩`);
          } else if (status === 'failed') {
            setStatus(`${fileName}: 压缩失败，使用原文件`);
          }
        });
      }
      setStatus('压缩完成，开始上传...');
    } catch (err) {
      console.error('压缩失败:', err);
      // 压缩失败时使用原文件
      filesToUpload = files;
      setStatus('压缩失败，使用原文件上传');
    }
  }
  
  try {
    setStatus('上传中...');
    const totalFiles = filesToUpload.length;
    
    // 检查是否启用时间戳重命名
    const timestampRenameEnabled = isTimestampRenameEnabledModal();
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      
      // 根据设置决定是否使用时间戳格式重命名文件
      const timestampFilename = timestampRenameEnabled && window.generateTimestampFilename ? 
        window.generateTimestampFilename(file.name) : 
        file.name;
      
      // 显示上传进度
      if (progressContent) {
        const uploadProgressItem = document.createElement('div');
        uploadProgressItem.className = 'progress-item-modal';
        
        const displayName = timestampRenameEnabled && timestampFilename !== file.name ? 
          `${file.name} → ${timestampFilename}` : file.name;
        uploadProgressItem.innerHTML = `
          <div class="file-name-modal">${displayName}</div>
          <div class="progress-bar-modal">
            <div class="progress-fill-modal" style="width: 0%"></div>
          </div>
          <div class="progress-text-modal">准备上传...</div>
        `;
        progressContent.appendChild(uploadProgressItem);
        
        const uploadProgressFill = uploadProgressItem.querySelector('.progress-fill-modal');
        const uploadProgressText = uploadProgressItem.querySelector('.progress-text-modal');
        
        // 更新进度
        if (uploadProgressFill) {
          uploadProgressFill.style.width = '50%';
        }
        if (uploadProgressText) {
          uploadProgressText.textContent = '上传中...';
        }
        setStatus(`上传中: ${displayName} (${i + 1}/${totalFiles})`);
      } else {
        const displayNameElse = timestampRenameEnabled && timestampFilename !== file.name ? 
          `${file.name} → ${timestampFilename}` : file.name;
        setStatus(`上传中: ${displayNameElse} (${i + 1}/${totalFiles})`);
      }
      
      const content = await toBase64(file);
      const targetPath = buildTargetPath(folder, timestampFilename);
      await apiRequest({
        action: 'upload',
        path: targetPath,
        content,
        message: `upload ${targetPath}`,
      });
      
      // 更新进度为完成
      if (progressContent) {
        const uploadProgressItem = progressContent.querySelectorAll('.progress-item-modal')[i + (compressionEnabled ? 1 : 0)];
        if (uploadProgressItem) {
          const uploadProgressFill = uploadProgressItem.querySelector('.progress-fill-modal');
          const uploadProgressText = uploadProgressItem.querySelector('.progress-text-modal');
          if (uploadProgressFill) {
            uploadProgressFill.style.width = '100%';
          }
          if (uploadProgressText) {
            uploadProgressText.textContent = '完成';
          }
          uploadProgressItem.style.opacity = '0.6';
        }
      }
    }
    
    setStatus('上传完成，正在刷新列表...');
    await loadImages(false);
    setStatus(`共 ${images.length} 张图片，可点击预览与复制链接。`);
    uploadFileInput.value = '';
    
    // 隐藏进度区域
    if (progressModal) {
      setTimeout(() => {
        progressModal.style.display = 'none';
        progressContent.innerHTML = '';
      }, 2000);
    }
  } catch (err) {
    console.error(err);
    const errorMessage = err.message || '上传失败';
    
    // 隐藏进度区域
    if (progressModal) {
      progressModal.style.display = 'none';
    }
    
    // 如果是认证错误，提供更友好的提示
    if (errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication')) {
      setStatus('上传失败：需要认证，请先登录', true);
      if (window.uploadAuth && window.uploadAuth.showAuthDialog) {
        setTimeout(() => {
          window.uploadAuth.showAuthDialog(() => {
            setStatus('认证成功，请重新尝试上传', false);
          });
        }, 500);
      }
    } else {
      setStatus(errorMessage, true);
    }
  } finally {
    // 恢复上传按钮
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.textContent = '上传';
    }
  }
}

function openUploadModal() {
  const savedPath = getDefaultUploadPath();
  if (defaultUploadPathInput) {
    defaultUploadPathInput.value = savedPath;
  }
  if (defaultPathDisplay) {
    defaultPathDisplay.textContent = savedPath;
  }
  
  // 初始化压缩开关状态
  const compressionCheckbox = document.getElementById('enable-compression-checkbox-modal');
  if (compressionCheckbox) {
    const savedState = localStorage.getItem('enableImageCompression');
    const defaultEnabled = window.APP_CONFIG?.ENABLE_IMAGE_COMPRESSION === true;
    if (savedState !== null) {
      compressionCheckbox.checked = savedState === 'true';
    } else {
      compressionCheckbox.checked = defaultEnabled;
    }
  }
  
  // 初始化自动重命名开关状态
  const timestampRenameCheckbox = document.getElementById('enable-timestamp-rename-checkbox-modal');
  if (timestampRenameCheckbox) {
    const savedState = localStorage.getItem('enableTimestampRename');
    const defaultEnabled = window.APP_CONFIG?.ENABLE_TIMESTAMP_RENAME === true;
    if (savedState !== null) {
      timestampRenameCheckbox.checked = savedState === 'true';
    } else {
      timestampRenameCheckbox.checked = defaultEnabled;
    }
  }
  
  uploadModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
  uploadModal.classList.add('hidden');
  document.body.style.overflow = '';
  uploadFileInput.value = '';
  uploadFileList.innerHTML = '';
  uploadFileList.style.display = 'none';
  uploadPathInput.value = '';
  const fileInputText = document.getElementById('file-input-text');
  if (fileInputText) {
    fileInputText.textContent = '未选择任何文件';
  }
  
  // 隐藏进度区域
  const progressModal = document.getElementById('upload-progress-modal');
  const progressContent = document.getElementById('upload-progress-content-modal');
  if (progressModal) {
    progressModal.style.display = 'none';
  }
  if (progressContent) {
    progressContent.innerHTML = '';
  }
  
  // 恢复上传按钮
  const uploadBtn = document.getElementById('upload-btn');
  if (uploadBtn) {
    uploadBtn.disabled = false;
    uploadBtn.textContent = '上传';
  }
  
  // 保存压缩开关状态
  const compressionCheckbox = document.getElementById('enable-compression-checkbox-modal');
  if (compressionCheckbox) {
    localStorage.setItem('enableImageCompression', compressionCheckbox.checked.toString());
  }
}

// 检查是否启用压缩（模态框版本）
// 检查是否启用时间戳重命名（快速上传模态框）
function isTimestampRenameEnabledModal() {
  const checkbox = document.getElementById('enable-timestamp-rename-checkbox-modal');
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

function isCompressionEnabledModal() {
  const checkbox = document.getElementById('enable-compression-checkbox-modal');
  if (checkbox) {
    return checkbox.checked;
  }
  // 从 localStorage 读取，如果没有则使用配置的默认值
  const savedState = localStorage.getItem('enableImageCompression');
  if (savedState !== null) {
    return savedState === 'true';
  }
  // 默认从配置读取
  return window.APP_CONFIG?.ENABLE_IMAGE_COMPRESSION === true;
}

function updateFileList() {
  const files = Array.from(uploadFileInput.files || []);
  const fileInputText = document.getElementById('file-input-text');
  
  if (files.length === 0) {
    uploadFileList.innerHTML = '';
    uploadFileList.style.display = 'none';
    if (fileInputText) {
      fileInputText.textContent = '未选择任何文件';
    }
    return;
  }
  
  // 更新文件选择提示文本
  if (fileInputText) {
    fileInputText.textContent = `已选择 ${files.length} 个文件`;
  }
  
  // 显示文件列表
  uploadFileList.style.display = 'block';
  uploadFileList.innerHTML = '<div class="upload-file-list-title">已选择文件：</div>' +
    files.map((file, index) => `
      <div class="upload-file-item">
        <span class="upload-file-name">${file.name}</span>
        <span class="upload-file-size">(${(file.size / 1024).toFixed(2)} KB)</span>
      </div>
    `).join('');
}

