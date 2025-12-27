// 教程页面图片懒加载
(function() {
  'use strict';

  const LOADING_IMAGE = '/imgs/special/loading.gif';
  let imageObserver = null;

  // 初始化懒加载
  function initLazyLoad() {
    // 如果浏览器不支持 IntersectionObserver，直接加载所有图片
    if (!window.IntersectionObserver) {
      const images = document.querySelectorAll('.tutorial-content img, .tutorial-step-content img');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy-load');
          img.classList.add('lazy-loaded');
        }
      });
      return;
    }

    // 创建 IntersectionObserver
    imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.dataset.src;
          
          if (dataSrc) {
            // 创建新的 Image 对象来预加载
            const imageLoader = new Image();
            imageLoader.onload = () => {
              img.src = dataSrc;
              img.classList.remove('lazy-load');
              img.classList.add('lazy-loaded');
              // 移除 loading.gif 的样式
              img.style.opacity = '';
            };
            imageLoader.onerror = () => {
              console.error('Failed to load image:', dataSrc);
              // 加载失败时保持 loading.gif
              img.classList.add('lazy-load-error');
            };
            imageLoader.src = dataSrc;
            
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px' // 提前50px开始加载
    });

    // 观察所有懒加载图片
    observeImages();
  }

  // 将普通图片转换为懒加载图片
  function convertToLazyLoad(img) {
    // 如果已经是懒加载图片，跳过
    if (img.classList.contains('lazy-load') || img.dataset.src) {
      return;
    }

    // 保存原始 src
    const originalSrc = img.src || img.getAttribute('src');
    if (!originalSrc || originalSrc === LOADING_IMAGE) {
      return;
    }

    // 设置 data-src 为原始图片地址
    img.dataset.src = originalSrc;
    
    // 设置占位图
    img.src = LOADING_IMAGE;
    
    // 添加懒加载类
    img.classList.add('lazy-load');
    
    // 添加样式，使占位图居中显示
    img.style.opacity = '0.6';
    img.style.transition = 'opacity 0.3s ease-in-out';
  }

  // 处理所有图片
  function processImages() {
    const images = document.querySelectorAll('.tutorial-content img, .tutorial-step-content img');
    images.forEach(img => {
      convertToLazyLoad(img);
    });
  }

  // 观察图片
  function observeImages() {
    const lazyImages = document.querySelectorAll('.tutorial-content img.lazy-load, .tutorial-step-content img.lazy-load');
    lazyImages.forEach(img => {
      if (imageObserver) {
        imageObserver.observe(img);
      }
    });
  }

  // 处理新添加的图片（当 Markdown 内容动态加载时）
  function observeNewImages() {
    processImages();
    observeImages();
  }

  // 初始化
  function setup() {
    // 初始化 IntersectionObserver
    initLazyLoad();
    
    // 等待 DOM 加载完成后处理现有图片
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        processImages();
        observeImages();
      });
    } else {
      processImages();
      observeImages();
    }

    // 使用 MutationObserver 监听 DOM 变化，自动处理新添加的图片
    if (window.MutationObserver) {
      const mutationObserver = new MutationObserver((mutations) => {
        let hasNewImages = false;
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // 检查是否是图片节点
              if (node.tagName === 'IMG') {
                hasNewImages = true;
              }
              // 检查是否包含图片
              if (node.querySelectorAll && node.querySelectorAll('img').length > 0) {
                hasNewImages = true;
              }
            }
          });
        });
        
        if (hasNewImages) {
          setTimeout(() => {
            observeNewImages();
          }, 50);
        }
      });

      // 观察教程内容区域的变化
      const observeTarget = () => {
        const contentArea = document.querySelector('.tutorial-content') || 
                           document.querySelector('.tutorial-step-content');
        if (contentArea) {
          mutationObserver.observe(contentArea, {
            childList: true,
            subtree: true
          });
        } else {
          // 如果内容区域还未加载，延迟重试
          setTimeout(observeTarget, 100);
        }
      };
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeTarget);
      } else {
        observeTarget();
      }
    }
  }

  // 导出到全局作用域
  window.tutorialLazyLoad = {
    init: initLazyLoad,
    processImages: processImages,
    observeNewImages: observeNewImages
  };

  // 自动初始化
  setup();
})();

