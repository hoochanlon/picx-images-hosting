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

  // 实现优化的滚动跟随功能
  setupScrollTracking(headings, tocNav);
}

// 设置滚动跟踪功能
function setupScrollTracking(headings, tocNav) {
  // 清理之前的 observer
  if (window.tocObserver) {
    window.tocObserver.disconnect();
  }

  // 防抖函数，避免频繁切换
  let activeHeadingId = null;
  let updateTimeout = null;
  let lastUpdateTime = 0;
  const HEADER_OFFSET = 120; // 固定头部高度
  const THRESHOLD_DISTANCE = 100; // 标题之间的最小距离阈值，避免过近时反向跳转
  const MIN_UPDATE_INTERVAL = 300; // 最小更新间隔（毫秒），避免过于频繁的切换

  // 更新活动标题的函数
  function updateActiveHeading() {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime;
    
    // 如果距离上次更新时间太短，延迟执行
    const delay = timeSinceLastUpdate < MIN_UPDATE_INTERVAL 
      ? MIN_UPDATE_INTERVAL - timeSinceLastUpdate 
      : 150; // 基础防抖延迟
    
    updateTimeout = setTimeout(() => {
      lastUpdateTime = Date.now();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      let bestHeading = null;
      let bestDistance = Infinity;
      let bestPosition = -Infinity;

      // 遍历所有标题，找到最合适的活动标题
      headings.forEach(heading => {
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + scrollTop;
        const distanceFromTop = rect.top - HEADER_OFFSET;
        
        // 标题在视口内或刚刚经过
        if (rect.top <= HEADER_OFFSET + 50 && rect.bottom >= 0) {
          // 如果标题在固定头部下方，优先选择
          if (rect.top >= HEADER_OFFSET - 20) {
            const distance = Math.abs(rect.top - HEADER_OFFSET);
            // 选择最接近固定头部下方的标题
            if (distance < bestDistance) {
              bestDistance = distance;
              bestHeading = heading;
            }
          } else {
            // 标题在固定头部上方，检查是否是最新的可见标题
            if (headingTop > bestPosition) {
              bestPosition = headingTop;
              // 只有当没有找到更好的标题时才使用这个
              if (!bestHeading || bestDistance > THRESHOLD_DISTANCE) {
                bestHeading = heading;
                bestDistance = Math.abs(rect.top - HEADER_OFFSET);
              }
            }
          }
        }
      });

      // 如果没有找到合适的标题，选择最接近视口顶部的标题
      if (!bestHeading && headings.length > 0) {
        headings.forEach(heading => {
          const rect = heading.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < bestDistance) {
            bestDistance = rect.top;
            bestHeading = heading;
          }
        });
      }

      // 更新活动状态
      if (bestHeading && bestHeading.id !== activeHeadingId) {
        activeHeadingId = bestHeading.id;
        const activeLink = tocNav.querySelector(`a[href="#${bestHeading.id}"]`);
        
        if (activeLink) {
          // 移除所有活动状态
          tocNav.querySelectorAll('a').forEach(a => {
            a.classList.remove('active');
          });
          
          // 添加活动状态（使用平滑过渡）
          activeLink.classList.add('active');
          
          // 确保活动链接在目录中可见
          const linkRect = activeLink.getBoundingClientRect();
          const tocRect = document.querySelector('.tutorial-toc').getBoundingClientRect();
          const navRect = tocNav.getBoundingClientRect();
          
          // 如果链接不在目录视口内，平滑滚动到可见位置
          if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
            activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }, delay);
  }

  // 使用 IntersectionObserver 监听标题可见性
  window.tocObserver = new IntersectionObserver((entries) => {
    // 触发更新
    updateActiveHeading();
  }, {
    root: null, // 使用 viewport
    rootMargin: `-${HEADER_OFFSET}px 0px -50% 0px`, // 顶部偏移，底部偏移50%
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] // 多个阈值，更精确地检测
  });

  // 观察所有标题
  headings.forEach(heading => {
    window.tocObserver.observe(heading);
  });

  // 监听滚动事件（作为 IntersectionObserver 的补充）
  let scrollTimeout = null;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      updateActiveHeading();
    }, 200); // 滚动时使用更长的防抖时间，减少更新频率
  }, { passive: true });

  // 初始检查
  setTimeout(() => {
    updateActiveHeading();
  }, 300);
}

// 导出到全局作用域
window.updateTOC = updateTOC;

