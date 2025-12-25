// 事件监听器绑定
function initEvents() {
  // 绑定展开/收缩按钮事件
  document.querySelectorAll('.toggle-control').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = toggle.dataset.target;
      // 如果是文件夹控制，确保下拉框在展开时能正常工作
      if (targetId === 'folder-control') {
        const folderControl = document.getElementById('folder-control');
        const isCollapsed = folderControl && folderControl.classList.contains('collapsed');
        toggleCollapsible(targetId);
        // 如果从折叠状态展开，确保下拉框可以正常显示
        if (isCollapsed && folderControl && !folderControl.classList.contains('collapsed')) {
          // 延迟一下，确保动画完成后再允许下拉
          setTimeout(() => {
            // 下拉框现在可以正常工作了
          }, 300);
        }
      } else {
        toggleCollapsible(targetId);
      }
    });
  });

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (folderSelect) {
    folderSelect.addEventListener('change', applyFilter);
  }

  // 自定义下拉框事件处理
  if (customSelectTrigger && customSelect) {
    customSelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // 确保文件夹控制区域是展开的
    const folderControl = document.getElementById('folder-control');
    if (folderControl && folderControl.classList.contains('collapsed')) {
      folderControl.classList.remove('collapsed');
      const toggle = document.querySelector('[data-target="folder-control"]');
      if (toggle) {
        toggle.classList.add('active');
      }
      localStorage.setItem('collapsed_folder-control', 'false');
      // 等待动画完成后再显示下拉选项
      setTimeout(() => {
        customSelect.classList.toggle('active');
      }, 300);
      return;
    }
    customSelect.classList.toggle('active');
    });
  }

  if (customSelectOptions && folderSelect && customSelectValue && customSelect) {
    customSelectOptions.addEventListener('click', (e) => {
    const option = e.target.closest('.custom-select-option');
    if (!option) return;
    
    const value = option.dataset.value;
    folderSelect.value = value;
    customSelectValue.textContent = option.textContent;
    
    // 更新选中状态
    customSelectOptions.querySelectorAll('.custom-select-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    option.classList.add('selected');
    
    customSelect.classList.remove('active');
    applyFilter();
    });
  }

  // 点击外部关闭下拉框
  if (customSelect) {
    document.addEventListener('click', (e) => {
      const folderControl = document.getElementById('folder-control');
      // 如果点击的不是下拉框内的元素，关闭下拉框
      if (!customSelect.contains(e.target) && !e.target.closest('.folder-control-group')) {
        customSelect.classList.remove('active');
      }
    });
  }

  if (openUploadBtn) {
    openUploadBtn.addEventListener('click', openUploadModal);
  }

  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target.dataset.closeUpload !== undefined || e.target.classList.contains('upload-modal-backdrop')) {
        closeUploadModal();
      }
    });
  }

  if (uploadFileInput) {
    uploadFileInput.addEventListener('change', updateFileList);
  }

  // 自定义文件选择按钮
  const fileInputTrigger = document.getElementById('file-input-trigger');
  if (fileInputTrigger) {
    fileInputTrigger.addEventListener('click', () => {
      uploadFileInput.click();
    });
  }

  if (saveDefaultPathBtn) {
    saveDefaultPathBtn.addEventListener('click', () => {
      const path = defaultUploadPathInput.value.trim();
      if (path) {
        const savedPath = saveDefaultUploadPath(path);
        if (savedPath && defaultPathDisplay) {
          defaultPathDisplay.textContent = savedPath;
          alert('默认路径已保存！');
        }
      } else {
        alert('请输入有效的路径');
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      await uploadSelectedFiles();
      closeUploadModal();
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener('click', async () => {
    // 保存当前的过滤条件
    const currentFolder = folderSelect.value;
    const currentKeyword = filterInput.value.trim().toLowerCase();
    
    // 重新加载图片
    await loadImages();
    
    // 恢复过滤条件
    folderSelect.value = currentFolder;
    filterInput.value = currentKeyword;
    
    // 应用过滤条件
    applyFilter();
    });
  }

  // 设置 GitHub 链接
  const githubLink = document.getElementById('github-link');
  if (githubLink) {
    githubLink.href = config.GITHUB_REPO_URL || 'https://github.com/hoochanlon/picx-images-hosting';
  }

  // 标题点击完全刷新
  const brandTitle = document.getElementById('brand-title');
  if (brandTitle) {
    brandTitle.addEventListener('click', async () => {
    // 重置所有过滤条件
    folderSelect.value = 'ALL';
    filterInput.value = '';
    
    // 更新自定义下拉框显示
    const customSelectValue = document.querySelector('.custom-select-value');
    if (customSelectValue) {
      customSelectValue.textContent = '全部目录';
    }
    const customSelectOptions = document.querySelectorAll('.custom-select-option');
    customSelectOptions.forEach(opt => opt.classList.remove('selected'));
    const allOption = Array.from(customSelectOptions).find(opt => opt.dataset.value === 'ALL');
    if (allOption) {
      allOption.classList.add('selected');
    }
    
    // 重新加载图片（会应用过滤条件，此时是全部）
    await loadImages();
    });
  }
}

