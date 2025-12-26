// tutorial-toc.js - 目录生成

// 生成并更新目录
function updateTOC(stepIndex) {
  const state = window.tutorialState;
  const stepContents = state.stepContents();
  const tocNav = document.getElementById('tutorial-toc-nav');
  if (!tocNav) return;
  
  const activeContent = stepContents[stepIndex];
  
  if (!activeContent) {
    tocNav.innerHTML = '<div class="tutorial-toc-loading">正在生成目录...</div>';
    return;
  }
  
  // 如果内容还未加载，等待加载完成后再生成
  if (activeContent.dataset.loaded !== 'true') {
    tocNav.innerHTML = '<div class="tutorial-toc-loading">正在加载内容...</div>';
    // 等待内容加载后再次尝试
    const checkInterval = setInterval(() => {
      if (activeContent.dataset.loaded === 'true') {
        clearInterval(checkInterval);
        updateTOC(stepIndex);
      }
    }, 100);
    // 最多等待 5 秒
    setTimeout(() => clearInterval(checkInterval), 5000);
    return;
  }

  const headings = activeContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  if (headings.length === 0) {
    tocNav.innerHTML = '<div class="tutorial-toc-loading">暂无目录</div>';
    return;
  }

  let tocHTML = '<ul>';
  let stack = []; // 用于跟踪嵌套级别
  
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1));
    const id = heading.id || `heading-${stepIndex}-${Math.random().toString(36).substr(2, 9)}`;
    heading.id = id;
    const text = heading.textContent.trim();
    
    // 关闭之前的嵌套级别
    while (stack.length > 0 && stack[stack.length - 1] >= level) {
      tocHTML += '</ul></li>';
      stack.pop();
    }
    
    // 开始新的列表项
    tocHTML += '<li><a href="#' + id + '">' + text + '</a>';
    
    // 如果有子标题，开始嵌套列表
    if (level < 6) {
      tocHTML += '<ul>';
      stack.push(level);
    } else {
      tocHTML += '</li>';
    }
  });
  
  // 关闭所有未关闭的标签
  while (stack.length > 0) {
    tocHTML += '</ul></li>';
    stack.pop();
  }
  
  tocHTML += '</ul>';
  tocNav.innerHTML = tocHTML;

  // 添加平滑滚动
  tocNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // 计算正确的滚动位置（考虑固定头部）
        const headerOffset = 120;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // 更新活动状态
        tocNav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        
        // 延迟更新，等待滚动完成
        setTimeout(() => {
          // 确保活动链接在目录中可见
          const linkRect = link.getBoundingClientRect();
          const navRect = tocNav.getBoundingClientRect();
          if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
            link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 500);
      }
    });
  });

  // 监听滚动，高亮当前章节
  const tutorialMain = document.querySelector('.tutorial-main');
  if (tutorialMain) {
    // 清理之前的 observer
    if (window.tocObserver) {
      window.tocObserver.disconnect();
    }
    
    // 使用更合理的 rootMargin，确保定位准确
    // -120px 顶部偏移（考虑固定头部）
    // -50% 底部偏移（当标题滚动到视口下半部分时高亮）
    window.tocObserver = new IntersectionObserver((entries) => {
      // 找到最接近顶部的可见标题
      const visibleHeadings = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => ({
          element: entry.target,
          id: entry.target.id,
          top: entry.boundingClientRect.top
        }))
        .sort((a, b) => a.top - b.top);
      
      if (visibleHeadings.length > 0) {
        // 高亮最接近顶部的标题
        const activeId = visibleHeadings[0].id;
        tocNav.querySelectorAll('a').forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + activeId) {
            a.classList.add('active');
            // 滚动到活动链接（如果不在视口中）
            const linkRect = a.getBoundingClientRect();
            const navRect = tocNav.getBoundingClientRect();
            if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
              a.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        });
      }
    }, {
      root: tutorialMain,
      rootMargin: '-120px 0px -50% 0px',
      threshold: [0, 0.1, 0.5, 1]
    });

    headings.forEach(heading => {
      window.tocObserver.observe(heading);
    });
  }
}

// 导出到全局作用域
window.updateTOC = updateTOC;

