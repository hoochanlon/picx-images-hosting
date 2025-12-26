// 灯箱功能
function openLightbox(idx) {
  if (idx < 0 || idx >= images.length) return;
  currentIndex = idx;
  const item = images[idx];
  const cdnUrl = `${CDN_BASE}/${item.path}`;

  lbImg.src = cdnUrl;
  resetTransform();

  lightboxEl.classList.remove('hidden');
  document.body.classList.add('lightbox-open');
  if (infoPanel) {
    infoPanel.classList.add('hidden');
  }
}

function closeLightbox() {
  lightboxEl.classList.add('hidden');
  currentIndex = -1;
  document.body.classList.remove('lightbox-open');
  if (infoPanel) {
    infoPanel.classList.add('hidden');
  }
  // 重置控制按钮显示状态
  lightboxEl.classList.remove('lightbox-controls-hidden');
  if (toggleControlsBtn) {
    const icon = toggleControlsBtn.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-eye-slash lightbox-icon-outline';
    }
  }
}

function showPrev() {
  if (currentIndex <= 0) {
    openLightbox(images.length - 1);
    return;
  }
  openLightbox(currentIndex - 1);
}

function showNext() {
  if (currentIndex >= images.length - 1) {
    openLightbox(0);
    return;
  }
  openLightbox(currentIndex + 1);
}

function setupLightbox() {
  if (!lightboxEl) {
    console.error('lightboxEl 未定义，无法设置灯箱功能');
    return;
  }
  
  lightboxEl.addEventListener('click', (e) => {
    const target = e.target;
    if (
      target.dataset.close !== undefined ||
      target.classList.contains('lightbox-backdrop') ||
      target === lightboxEl
    ) {
      closeLightbox();
    }
  });
  lightboxEl.querySelector('.prev').addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });
  lightboxEl.querySelector('.next').addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });
  lightboxEl.querySelector('.lightbox-close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightboxEl.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  lbImg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    scale = Math.min(5, Math.max(0.5, scale + delta));
    applyTransform();
  }, { passive: false });

  lbImg.addEventListener('dblclick', () => {
    scale = scale === 1 ? 2 : 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  });

  lbImg.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isPanning = true;
    panStartX = e.clientX - translateX;
    panStartY = e.clientY - translateY;
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    translateX = e.clientX - panStartX;
    translateY = e.clientY - panStartY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
  });

  zoomResetBtn.addEventListener('click', () => {
    resetTransform();
  });

  rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    applyTransform();
  });

  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        isFullscreen = true;
        fullscreenBtn.textContent = '⏍';
      } else {
        await document.exitFullscreen();
        isFullscreen = false;
        fullscreenBtn.textContent = '⛶';
      }
    } catch (err) {
      console.error(err);
      alert('浏览器阻止了全屏请求，请手动允许。');
    }
  });

  toggleControlsBtn.addEventListener('click', () => {
    lightboxEl.classList.toggle('lightbox-controls-hidden');
    const isHidden = lightboxEl.classList.contains('lightbox-controls-hidden');
    const icon = toggleControlsBtn.querySelector('i');
    if (icon) {
      icon.className = isHidden ? 'fas fa-eye lightbox-icon-outline' : 'fas fa-eye-slash lightbox-icon-outline';
    }
  });

  infoBtn.addEventListener('click', async () => {
    if (!infoPanel || !infoContent) return;
    if (currentIndex < 0 || currentIndex >= images.length) return;
    const item = images[currentIndex];
    const dims =
      lbImg.naturalWidth && lbImg.naturalHeight
        ? `${lbImg.naturalWidth} × ${lbImg.naturalHeight}`
        : '未知';
    const pagesUrl = `${PAGES_BASE}/${item.path}`;
    const cdnUrl = `${CDN_BASE}/${item.path}`;
    
    // 先显示基本信息，文件大小异步加载
    infoContent.innerHTML = `
      文件名：${item.name}<br />
      路径：${item.path}<br />
      目录：${item.dir || '(根目录)'}<br />
      尺寸：${dims}<br />
      文件大小：<span id="file-size-loading">加载中...</span><br />
      Pages：<a href="${pagesUrl}" target="_blank" rel="noreferrer">打开</a> <button class="info-copy-btn" data-url="${pagesUrl}">复制</button><br />
      jsDelivr：<a href="${cdnUrl}" target="_blank" rel="noreferrer">打开</a> <button class="info-copy-btn" data-url="${cdnUrl}">复制</button>
    `;
    
    // 异步获取文件大小
    const fileSizeEl = infoContent.querySelector('#file-size-loading');
    try {
      const fileSize = await getImageFileSize(cdnUrl);
      if (fileSizeEl) {
        fileSizeEl.textContent = fileSize;
      }
    } catch (err) {
      console.error('获取文件大小失败:', err);
      if (fileSizeEl) {
        fileSizeEl.textContent = '获取失败';
      }
    }
    
    // 添加复制按钮事件监听
    infoContent.querySelectorAll('.info-copy-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        try {
          await navigator.clipboard.writeText(url);
          const originalText = btn.textContent;
          btn.textContent = '已复制';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 1500);
        } catch (err) {
          console.error('复制失败:', err);
        }
      });
    });
    infoPanel.classList.toggle('hidden');
  });
}

// 获取图片文件大小
async function getImageFileSize(imageUrl) {
  try {
    // 先尝试使用 HEAD 请求获取 Content-Length（更高效）
    const headResponse = await fetch(imageUrl, { method: 'HEAD' });
    if (headResponse.ok) {
      const contentLength = headResponse.headers.get('Content-Length');
      if (contentLength) {
        return formatFileSize(parseInt(contentLength, 10));
      }
    }
    
    // 如果 HEAD 请求失败或没有 Content-Length，使用 GET 请求获取 blob
    const response = await fetch(imageUrl);
    if (response.ok) {
      const blob = await response.blob();
      return formatFileSize(blob.size);
    }
    
    throw new Error('无法获取文件大小');
  } catch (err) {
    throw err;
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = (bytes / Math.pow(k, i)).toFixed(2);
  return `${size} ${sizes[i]}`;
}

