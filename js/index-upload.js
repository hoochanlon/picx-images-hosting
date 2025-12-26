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
  try {
    setStatus('上传中...');
    for (const file of files) {
      const content = await toBase64(file);
      const targetPath = buildTargetPath(folder, file.name);
      await apiRequest({
        action: 'upload',
        path: targetPath,
        content,
        message: `upload ${targetPath}`,
      });
    }
    setStatus('上传完成，正在刷新列表...');
    await loadImages(false);
    setStatus(`共 ${images.length} 张图片，可点击预览与复制链接。`);
    uploadFileInput.value = '';
  } catch (err) {
    console.error(err);
    const errorMessage = err.message || '上传失败';
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

