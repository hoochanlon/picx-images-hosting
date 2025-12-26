// upload-lightbox.js - 上传页面灯箱功能

(function() {
  'use strict';
  const state = window.uploadState;

  // 灯箱相关变量
  let lightboxEl, lbImg, infoPanel, infoContent, fullscreenBtn, zoomResetBtn, rotateBtn, toggleControlsBtn, infoBtn;
  let currentIndex = -1;
  let currentImages = []; // 当前目录的图片列表
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotation = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let isFullscreen = false;

  // 初始化灯箱元素
  function initLightboxElements() {
    lightboxEl = document.getElementById('lightbox');
    lbImg = document.getElementById('lightbox-img');
    infoPanel = document.getElementById('lightbox-info');
    infoContent = document.getElementById('lightbox-info-content');
    fullscreenBtn = document.getElementById('fullscreen-toggle');
    zoomResetBtn = document.getElementById('zoom-reset');
    rotateBtn = document.getElementById('rotate');
    toggleControlsBtn = document.getElementById('toggle-controls');
    infoBtn = document.getElementById('info-btn');
  }

  // 重置变换
  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    rotation = 0;
    applyTransform();
  }

  // 应用变换
  function applyTransform() {
    if (!lbImg) return;
    lbImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
  }

  // 打开灯箱
  function openLightbox(imagePath, imageName) {
    if (!lightboxEl || !lbImg) {
      initLightboxElements();
      if (!lightboxEl || !lbImg) {
        console.error('灯箱元素未找到');
        return;
      }
    }

    // 找到当前图片在列表中的索引
    currentIndex = currentImages.findIndex(img => img.path === imagePath);
    if (currentIndex === -1) {
      currentIndex = 0;
    }

    const cdnUrl = `${state.CDN_BASE()}/${imagePath}`;
    lbImg.src = cdnUrl;
    resetTransform();

    lightboxEl.classList.remove('hidden');
    document.body.classList.add('lightbox-open');
    if (infoPanel) {
      infoPanel.classList.add('hidden');
    }
  }

  // 关闭灯箱
  function closeLightbox() {
    if (!lightboxEl) return;
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

  // 显示上一张
  function showPrev() {
    if (currentImages.length === 0) return;
    if (currentIndex <= 0) {
      currentIndex = currentImages.length - 1;
    } else {
      currentIndex--;
    }
    const item = currentImages[currentIndex];
    const cdnUrl = `${state.CDN_BASE()}/${item.path}`;
    lbImg.src = cdnUrl;
    resetTransform();
  }

  // 显示下一张
  function showNext() {
    if (currentImages.length === 0) return;
    if (currentIndex >= currentImages.length - 1) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    const item = currentImages[currentIndex];
    const cdnUrl = `${state.CDN_BASE()}/${item.path}`;
    lbImg.src = cdnUrl;
    resetTransform();
  }

  // 设置灯箱
  function setupLightbox() {
    initLightboxElements();
    
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
    
    const prevBtn = lightboxEl.querySelector('.prev');
    const nextBtn = lightboxEl.querySelector('.next');
    const closeBtn = lightboxEl.querySelector('.lightbox-close');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
      });
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightboxEl || lightboxEl.classList.contains('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    if (lbImg) {
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
    }

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      translateX = e.clientX - panStartX;
      translateY = e.clientY - panStartY;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
    });

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        resetTransform();
      });
    }

    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        rotation = (rotation + 90) % 360;
        applyTransform();
      });
    }

    if (fullscreenBtn) {
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
    }

    if (toggleControlsBtn) {
      toggleControlsBtn.addEventListener('click', () => {
        lightboxEl.classList.toggle('lightbox-controls-hidden');
        const isHidden = lightboxEl.classList.contains('lightbox-controls-hidden');
        const icon = toggleControlsBtn.querySelector('i');
        if (icon) {
          icon.className = isHidden ? 'fas fa-eye lightbox-icon-outline' : 'fas fa-eye-slash lightbox-icon-outline';
        }
      });
    }

    if (infoBtn && infoPanel && infoContent) {
      infoBtn.addEventListener('click', () => {
        if (currentIndex < 0 || currentIndex >= currentImages.length) return;
        const item = currentImages[currentIndex];
        const dims =
          lbImg.naturalWidth && lbImg.naturalHeight
            ? `${lbImg.naturalWidth} × ${lbImg.naturalHeight}`
            : '未知';
        const pagesUrl = `${state.PAGES_BASE()}/${item.path}`;
        const cdnUrl = `${state.CDN_BASE()}/${item.path}`;
        infoContent.innerHTML = `
          文件名：${item.name}<br />
          路径：${item.path}<br />
          尺寸：${dims}<br />
          Pages：<a href="${pagesUrl}" target="_blank" rel="noreferrer">打开</a> <button class="info-copy-btn" data-url="${pagesUrl}">复制</button><br />
          jsDelivr：<a href="${cdnUrl}" target="_blank" rel="noreferrer">打开</a> <button class="info-copy-btn" data-url="${cdnUrl}">复制</button>
        `;
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
  }

  // 更新当前图片列表（从文件列表提取图片）
  function updateImageList(files) {
    currentImages = files.filter(file => {
      return state.IMAGE_EXT().test(file.name);
    }).map(file => ({
      path: file.path,
      name: file.name
    }));
  }

  // 导出到全局作用域
  window.uploadLightbox = {
    open: openLightbox,
    close: closeLightbox,
    setup: setupLightbox,
    updateImageList: updateImageList
  };

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupLightbox);
  } else {
    setTimeout(setupLightbox, 100);
  }

})();

