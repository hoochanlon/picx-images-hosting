// tutorial-ui.js - UI 交互（回到顶部、移动端菜单）

// 回到顶部按钮
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  
  if (backToTopBtn) {
    // 监听滚动，显示/隐藏按钮
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    };
    
    // 监听窗口滚动
    window.addEventListener('scroll', handleScroll);
    
    // 页面加载时检查一次
    handleScroll();
    
    // 点击回到顶部
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// 移动端菜单切换
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.tutorial-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const state = window.tutorialState;
  
  if (mobileMenuToggle && sidebar) {
    const toggleSidebar = () => {
      sidebar.classList.toggle('open');
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('show');
      }
    };

    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });

    // 点击遮罩层关闭侧边栏
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          sidebarOverlay.classList.remove('show');
        }
      });
    }

    // 点击侧边栏外部时关闭侧边栏（移动端）
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('open')) {
          if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
            if (sidebarOverlay) {
              sidebarOverlay.classList.remove('show');
            }
          }
        }
      }
    });

    // 点击侧边栏导航项后关闭菜单（移动端）
    const sidebarItems = state.sidebarItems();
    if (sidebarItems && sidebarItems.length > 0) {
      sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            if (sidebarOverlay) {
              sidebarOverlay.classList.remove('show');
            }
          }
        });
      });
    }

    // 窗口大小改变时，如果切换到桌面端，关闭移动端菜单
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
        if (sidebarOverlay) {
          sidebarOverlay.classList.remove('show');
        }
      }
    });
  }
}

// 初始化所有 UI 功能
function initTutorialUI() {
  initBackToTop();
  initMobileMenu();
}

// 导出到全局作用域
window.initTutorialUI = initTutorialUI;

