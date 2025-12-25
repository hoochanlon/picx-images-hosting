// upload-ui.js - UI 更新（面包屑、文件列表）

(function() {
  'use strict';
  const state = window.uploadState;

// 更新面包屑导航
function updateBreadcrumb(path) {
  const breadcrumbEl = state.breadcrumbEl();
  if (!breadcrumbEl) return;
  
  breadcrumbEl.innerHTML = '';
  const parts = path ? path.split('/').filter(p => p) : [];
  
  // 根目录
  const rootItem = document.createElement('div');
  rootItem.className = 'breadcrumb-item';
  const rootLink = document.createElement('a');
  rootLink.href = 'javascript:void(0)';
  rootLink.textContent = '根目录';
  rootLink.dataset.path = '';
  rootLink.style.cursor = 'pointer';
  rootLink.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.navigateTo) window.navigateTo('');
    return false;
  });
  rootItem.appendChild(rootLink);
  breadcrumbEl.appendChild(rootItem);

  // 路径部分
  let breadcrumbPath = '';
  parts.forEach((part, index) => {
    const separator = document.createElement('span');
    separator.className = 'breadcrumb-separator';
    separator.textContent = ' / ';
    breadcrumbEl.appendChild(separator);

    breadcrumbPath = buildPath(breadcrumbPath, part);
    const item = document.createElement('div');
    item.className = 'breadcrumb-item';
    const link = document.createElement('a');
    link.href = 'javascript:void(0)';
    link.textContent = part;
    link.dataset.path = breadcrumbPath;
    link.style.cursor = 'pointer';
    
    // 使用闭包保存 breadcrumbPath 的值
    (function(path) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.navigateTo) window.navigateTo(path);
        return false;
      });
    })(breadcrumbPath);
    item.appendChild(link);
    breadcrumbEl.appendChild(item);
  });
}

// 导航到指定路径
function navigateTo(path) {
  const normalizedPath = (path || '').trim();
  state.setCurrentPath(normalizedPath);
  updateBreadcrumb(state.currentPath());
  // 使用 setTimeout 确保 currentPath 已经更新
  setTimeout(() => {
    if (window.loadFiles) window.loadFiles();
  }, 0);
}

// 渲染文件列表
function renderFiles() {
  const fileListEl = state.fileListEl();
  if (!fileListEl) return;
  
  const folders = state.folders();
  const files = state.files();
  
  fileListEl.innerHTML = '';
  
  if (folders.length === 0 && files.length === 0) {
    fileListEl.innerHTML = `
      <li class="empty-state">
        <div class="empty-state-icon">📁</div>
        <div>当前目录为空</div>
      </li>
    `;
    return;
  }

  // 显示文件夹
  folders.forEach(folder => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      <label class="file-checkbox-label">
        <input type="checkbox" class="file-checkbox" data-type="folder" data-path="${folder.path}" />
      </label>
      <div class="file-icon"><i class="fas fa-folder"></i></div>
      <div class="file-name">${folder.name}</div>
      <div class="file-actions">
        <button class="btn-rename" data-type="folder" data-path="${folder.path}" title="重命名">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete btn-danger" data-type="folder" data-path="${folder.path}" title="删除">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    li.querySelector('.file-name').addEventListener('click', () => {
      navigateTo(folder.path);
    });
    
    li.querySelector('.btn-rename').addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.showRenameModal) window.showRenameModal('folder', folder.path, folder.name);
    });
    
    li.querySelector('.btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.deleteItem) window.deleteItem('folder', folder.path);
    });
    
    fileListEl.appendChild(li);
  });

  // 显示文件
  files.forEach(file => {
    const li = document.createElement('li');
    li.className = 'file-item';
    const isImage = state.IMAGE_EXT().test(file.name);
    const pagesUrl = `${state.PAGES_BASE()}/${file.path}`;
    const cdnUrl = `${state.CDN_BASE()}/${file.path}`;
    
    li.innerHTML = `
      <label class="file-checkbox-label">
        <input type="checkbox" class="file-checkbox" data-type="file" data-path="${file.path}" />
      </label>
      <div class="file-icon">
        <i class="fas ${isImage ? 'fa-image' : 'fa-file'}"></i>
      </div>
      <div class="file-name">${file.name}</div>
      <div class="file-actions">
        <button class="btn-copy-pages" data-url="${pagesUrl}" title="复制 Pages 链接">
          <i class="fas fa-link"></i>
        </button>
        <button class="btn-copy-cdn" data-url="${cdnUrl}" title="复制 CDN 链接">
          <i class="fas fa-cloud"></i>
        </button>
        <button class="btn-rename" data-type="file" data-path="${file.path}" title="重命名">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete btn-danger" data-type="file" data-path="${file.path}" title="删除">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    // 复制 Pages 链接
    li.querySelector('.btn-copy-pages').addEventListener('click', async (e) => {
      e.stopPropagation();
      const url = li.querySelector('.btn-copy-pages').dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        const btn = li.querySelector('.btn-copy-pages');
        const originalTitle = btn.title;
        btn.title = '已复制';
        setTimeout(() => {
          btn.title = originalTitle;
        }, 1500);
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      }
    });
    
    // 复制 CDN 链接
    li.querySelector('.btn-copy-cdn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const url = li.querySelector('.btn-copy-cdn').dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        const btn = li.querySelector('.btn-copy-cdn');
        const originalTitle = btn.title;
        btn.title = '已复制';
        setTimeout(() => {
          btn.title = originalTitle;
        }, 1500);
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
      }
    });
    
    li.querySelector('.btn-rename').addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.showRenameModal) window.showRenameModal('file', file.path, file.name);
    });
    
    li.querySelector('.btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.deleteItem) window.deleteItem('file', file.path);
    });
    
    fileListEl.appendChild(li);
  });
}

// 导出到全局作用域
window.updateBreadcrumb = updateBreadcrumb;
window.navigateTo = navigateTo;
window.renderFiles = renderFiles;

})();
