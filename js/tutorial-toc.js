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
    // 只在没有内容时才显示加载提示
    if (!tocNav.querySelector('ul')) {
      tocNav.innerHTML = '<div class="tutorial-toc-loading">正在加载内容...</div>';
    }
    // 等待内容加载后再次尝试
    const checkInterval = setInterval(() => {
      if (activeContent.dataset.loaded === 'true') {
        clearInterval(checkInterval);
        updateTOC(stepIndex);
      }
    }, 100);
    // 最多等待 5 秒，超时后清除加载提示
    setTimeout(() => {
      clearInterval(checkInterval);
      // 如果仍然没有内容，显示空状态
      if (activeContent.dataset.loaded !== 'true') {
        const headings = activeContent.querySelectorAll('h2, h3');
        if (headings.length === 0) {
          tocNav.innerHTML = '<div class="tutorial-toc-loading">暂无目录</div>';
        }
      }
    }, 5000);
    return;
  }

  // 只显示 h2 和 h3 标题，减少目录长度
  const headings = activeContent.querySelectorAll('h2, h3');
  
  if (headings.length === 0) {
    // 清除之前的加载提示
    tocNav.innerHTML = '<div class="tutorial-toc-loading">暂无目录</div>';
    return;
  }
  
  // 确保清除所有加载提示
  const loadingElements = tocNav.querySelectorAll('.tutorial-toc-loading');
  loadingElements.forEach(el => el.remove());

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
  
  // 清除所有加载提示，然后设置目录内容
  tocNav.innerHTML = '';
  tocNav.innerHTML = tocHTML;
  
  // 触发目录动画
  if (window.tutorialAnimations && window.tutorialAnimations.applyTOCAnimations) {
    setTimeout(() => {
      window.tutorialAnimations.applyTOCAnimations();
    }, 50);
  }

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
}

// 导出到全局作用域
window.updateTOC = updateTOC;

