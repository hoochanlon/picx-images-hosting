// tutorial-navigation.js - 导航和 UI 生成

// 生成步骤编号（阿拉伯数字）
function getStepNumber(order) {
  return order;
}

// 动态生成侧边栏导航
function generateSidebarNav() {
  const state = window.tutorialState;
  const sidebarNav = state.sidebarNav();
  const stepMetadata = state.stepMetadata();
  const currentStep = state.currentStep();
  
  if (!sidebarNav) return;
  
  sidebarNav.innerHTML = '';
  stepMetadata.forEach((meta, index) => {
    const item = document.createElement('div');
    item.className = `tutorial-sidebar-nav-item ${index === currentStep ? 'active' : ''}`;
    item.dataset.step = index;
    item.innerHTML = `
      <i class="fas ${meta.icon || 'fa-circle'}"></i>
      <span>${meta.shortTitle || meta.title || `步骤 ${index + 1}`}</span>
    `;
    sidebarNav.appendChild(item);
  });
  
  const sidebarItems = document.querySelectorAll('.tutorial-sidebar-nav-item');
  state.setSidebarItems(Array.from(sidebarItems));
}

// 动态生成步骤指示器
function generateStepIndicators() {
  const state = window.tutorialState;
  const stepsContainer = state.stepsContainer();
  const stepMetadata = state.stepMetadata();
  const currentStep = state.currentStep();
  
  if (!stepsContainer) return;
  
  stepsContainer.innerHTML = '';
  stepMetadata.forEach((meta, index) => {
    const step = document.createElement('div');
    step.className = `tutorial-step ${index === currentStep ? 'active' : ''}`;
    step.dataset.step = index;
    step.innerHTML = `
      <span>${getStepNumber(meta.order || index + 1)}</span>
      <span>${meta.title || `步骤 ${index + 1}`}</span>
    `;
    stepsContainer.appendChild(step);
  });
  
  const stepIndicators = document.querySelectorAll('.tutorial-step');
  state.setStepIndicators(Array.from(stepIndicators));
}

// 绑定导航事件监听器
function attachNavEventListeners() {
  const state = window.tutorialState;
  
  // 重新获取元素引用
  const sidebarItems = document.querySelectorAll('.tutorial-sidebar-nav-item');
  const stepIndicators = document.querySelectorAll('.tutorial-step');
  state.setSidebarItems(Array.from(sidebarItems));
  state.setStepIndicators(Array.from(stepIndicators));
  
  // 侧边栏导航
  sidebarItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      if (window.updateStep) window.updateStep(index);
      // 移动端点击后关闭菜单
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.tutorial-sidebar');
        if (sidebar) {
          sidebar.classList.remove('open');
          const sidebarOverlay = document.getElementById('sidebar-overlay');
          if (sidebarOverlay) {
            sidebarOverlay.classList.remove('show');
          }
        }
      }
    });
  });

  // 步骤指示器导航
  stepIndicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      if (window.updateStep) window.updateStep(index);
    });
  });
}

// 导出到全局作用域
window.generateSidebarNav = generateSidebarNav;
window.generateStepIndicators = generateStepIndicators;
window.attachNavEventListeners = attachNavEventListeners;

