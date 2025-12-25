// 渲染相关功能
function buildCard(item) {
  const node = cardTpl.content.firstElementChild.cloneNode(true);
  const imgEl = node.querySelector('img');
  const pathEl = node.querySelector('.path');
  const pagesLink = document.createElement('a');
  pagesLink.href = `${PAGES_BASE}/${item.path}`;
  const cdnLink = document.createElement('a');
  cdnLink.href = `${CDN_BASE}/${item.path}`;
  const delBtn = node.querySelector('.delete-btn');
  const copyButtons = node.querySelectorAll('[data-copy]');

  // 懒加载：使用 data-src 存储真实图片地址，先用 loading.gif 作为占位符
  const loadingGif = `${CDN_BASE}/imgs/special/loading.gif`;
  imgEl.src = loadingGif;
  imgEl.dataset.src = `${CDN_BASE}/${item.path}`;
  imgEl.alt = item.name;
  imgEl.classList.add('lazy-load');
  pathEl.textContent = item.name;
  pathEl.title = item.path;

  pagesLink.href = `${PAGES_BASE}/${item.path}`;
  cdnLink.href = `${CDN_BASE}/${item.path}`;

  imgEl.addEventListener('click', () => openLightbox(item.idx));
  node.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    openLightbox(item.idx);
  });

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.copy;
      const url = type === 'pages' ? pagesLink.href : cdnLink.href;
      navigator.clipboard.writeText(url);
      const old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(() => (btn.textContent = old), 1500);
    });
  });

  delBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const ok = confirm(`确定删除文件：${item.path} 吗？此操作会提交到仓库。`);
    if (!ok) return;
    try {
      setStatus('删除中...');
      await deleteFile(item.path);
      await loadImages(false);
      setStatus('删除完成');
    } catch (err) {
      console.error(err);
      setStatus(err.message || '删除失败', true);
    }
  });

  return node;
}

function render(list, reset = true) {
  if (reset) {
    gridEl.innerHTML = '';
    displayedCount = 0;
  }
  
  if (!list.length) {
    if (reset) {
      setStatus('未找到匹配的图片，请检查过滤条件。', true);
    }
    return;
  }
  
  const total = list.length;
  const toDisplay = Math.min(displayedCount + ITEMS_PER_PAGE, total);
  const itemsToAdd = list.slice(displayedCount, toDisplay);
  
  if (itemsToAdd.length === 0) {
    return;
  }
  
  const frag = document.createDocumentFragment();
  itemsToAdd.forEach((item) => frag.appendChild(buildCard(item)));
  gridEl.appendChild(frag);
  
  // 观察新添加的图片，启用懒加载
  observeNewImages();
  
  displayedCount = toDisplay;
  
  if (reset) {
    setStatus(`共 ${total} 张图片，已显示 ${displayedCount} 张，可点击预览与复制链接。`);
  } else {
    setStatus(`共 ${total} 张图片，已显示 ${displayedCount} 张，可点击预览与复制链接。`);
  }
  
  // 如果还有更多图片，显示加载提示
  if (displayedCount < total) {
    showLoadMoreIndicator();
  } else {
    hideLoadMoreIndicator();
  }
}

function showLoadMoreIndicator() {
  let indicator = document.getElementById('load-more-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'load-more-indicator';
    indicator.className = 'load-more-indicator';
    indicator.textContent = '滚动到底部加载更多...';
    gridEl.appendChild(indicator);
  }
}

function hideLoadMoreIndicator() {
  const indicator = document.getElementById('load-more-indicator');
  if (indicator) {
    indicator.remove();
  }
}

function loadMoreImages() {
  if (isLoadingMore) return;
  
  const keyword = filterInput.value.trim().toLowerCase();
  const folder = folderSelect.value;
  
  let list;
  if (!keyword) {
    list = folder === 'ALL' ? images : images.filter((img) => img.dir === folder);
  } else {
    list = images
      .filter((img) => img.path.toLowerCase().includes(keyword))
      .filter((img) => (folder === 'ALL' ? true : img.dir === folder));
  }
  
  if (displayedCount >= list.length) {
    hideLoadMoreIndicator();
    return;
  }
  
  isLoadingMore = true;
  render(list, false);
  isLoadingMore = false;
}

function setupInfiniteScroll() {
  const backToTopBtn = document.getElementById('back-to-top');
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // 显示/隐藏回到顶部按钮
      if (scrollTop > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
      
      // 当滚动到距离底部 200px 时开始加载
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMoreImages();
      }
    }, 100);
  });
  
  // 回到顶部功能
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

