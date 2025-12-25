// 懒加载功能
function setupLazyLoad() {
  const lazyImages = document.querySelectorAll('img.lazy-load');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
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
            };
            imageLoader.onerror = () => {
              // 如果加载失败，保持 loading.gif
              console.error('Failed to load image:', dataSrc);
            };
            imageLoader.src = dataSrc;
            
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px' // 提前50px开始加载
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    // 不支持 IntersectionObserver 的浏览器，直接加载所有图片
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy-load');
        img.classList.add('lazy-loaded');
      }
    });
  }
}

function observeNewImages() {
  // 观察新添加的图片
  const newLazyImages = document.querySelectorAll('img.lazy-load:not(.observed)');
  if (newLazyImages.length === 0) return;
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.dataset.src;
          
          if (dataSrc) {
            const imageLoader = new Image();
            imageLoader.onload = () => {
              img.src = dataSrc;
              img.classList.remove('lazy-load');
              img.classList.add('lazy-loaded');
            };
            imageLoader.onerror = () => {
              console.error('Failed to load image:', dataSrc);
            };
            imageLoader.src = dataSrc;
            
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    newLazyImages.forEach(img => {
      img.classList.add('observed');
      imageObserver.observe(img);
    });
  } else {
    newLazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy-load');
        img.classList.add('lazy-loaded');
      }
    });
  }
}

