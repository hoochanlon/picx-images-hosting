// tutorial-steps.js - 步骤管理

// 绑定按钮事件监听器（按钮是动态生成的，需要延迟绑定）
function bindButtonEvents() {
  const state = window.tutorialState;
  const prevBtnElement = document.getElementById('prev-btn');
  const nextBtnElement = document.getElementById('next-btn');
  
  if (prevBtnElement) {
    // 移除旧的事件监听器（通过克隆节点）
    const newPrevBtn = prevBtnElement.cloneNode(true);
    prevBtnElement.parentNode.replaceChild(newPrevBtn, prevBtnElement);
    newPrevBtn.addEventListener('click', () => {
      const currentStep = state.currentStep();
      if (currentStep > 0) {
        updateStep(currentStep - 1);
      }
    });
  }

  if (nextBtnElement) {
    // 移除旧的事件监听器（通过克隆节点）
    const newNextBtn = nextBtnElement.cloneNode(true);
    nextBtnElement.parentNode.replaceChild(newNextBtn, nextBtnElement);
    newNextBtn.addEventListener('click', () => {
      const currentStep = state.currentStep();
      const totalSteps = state.totalSteps();
      if (currentStep < totalSteps - 1) {
        updateStep(currentStep + 1);
      } else {
        // 完成教程，返回首页
        window.location.href = 'index.html';
      }
    });
  }
}

function updateStep(step) {
  const state = window.tutorialState;
  const totalSteps = state.totalSteps();
  const stepContents = state.stepContents();
  const stepIndicators = state.stepIndicators();
  const sidebarItems = state.sidebarItems();
  
  if (step < 0 || step >= totalSteps) {
    return;
  }

  state.setCurrentStep(step);

  // 更新内容显示
  stepContents.forEach((content, index) => {
    content.classList.toggle('active', index === step);
  });
  
  // 如果当前步骤内容已加载，立即更新目录
  const activeContent = stepContents[step];
  if (activeContent && activeContent.dataset.loaded === 'true') {
    setTimeout(() => {
      if (window.updateTOC) window.updateTOC(step);
    }, 100);
  }

  // 更新步骤指示器
  if (stepIndicators.length > 0) {
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove('active', 'completed');
      if (index < step) {
        indicator.classList.add('completed');
      } else if (index === step) {
        indicator.classList.add('active');
      }
    });
  }

  // 更新侧边栏
  if (sidebarItems.length > 0) {
    sidebarItems.forEach((item, index) => {
      item.classList.toggle('active', index === step);
    });
  }

  // 更新按钮状态
  const prevBtnElement = document.getElementById('prev-btn');
  const nextBtnElement = document.getElementById('next-btn');
  
  if (prevBtnElement) prevBtnElement.disabled = step === 0;
  if (nextBtnElement) {
    nextBtnElement.innerHTML = step === totalSteps - 1 
      ? '完成 <i class="fas fa-check"></i>' 
      : '下一步 <i class="fas fa-arrow-right"></i>';
  }

  // 加载当前步骤的内容
  if (window.loadMarkdownContent) {
    loadMarkdownContent(step).then(() => {
      // 内容加载完成后，确保目录已更新
      if (stepContents[step] && stepContents[step].dataset.loaded === 'true') {
        setTimeout(() => {
          if (window.updateTOC) window.updateTOC(step);
        }, 150);
      }
    });
  }
}

// 导出到全局作用域
window.bindButtonEvents = bindButtonEvents;
window.updateStep = updateStep;

