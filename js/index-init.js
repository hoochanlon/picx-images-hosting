// 初始化
async function init() {
  // 初始化 DOM 元素引用
  initElements();
  
  // 确保所有DOM元素都已加载
  if (!statusEl || !gridEl || !lightboxEl) {
    console.error('DOM元素未加载完成，请检查HTML结构');
    return;
  }
  
  // 初始化事件监听器
  initEvents();
  
  setupLightbox();
  // 确保初始状态展开
  initCollapsible();
  setupInfiniteScroll();
  await loadImages();
  // 加载完成后再次确保状态正确
  initCollapsible();
  setupLazyLoad();
}

// 启动应用 - 等待DOM加载完成
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM已经加载完成
  init();
}

