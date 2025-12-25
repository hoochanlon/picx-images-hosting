// tutorial-config-loader.js - 配置文件加载
async function loadTutorialConfig() {
  const state = window.tutorialState;
  
  try {
    console.log('开始加载配置文件: docs/tutorial-config.json');
    const response = await fetch('docs/tutorial-config.json');
    console.log('配置文件响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
    }
    
    const config = await response.json();
    console.log('配置文件解析成功:', config);
    
    state.setTutorialConfig(config);
    
    // 按 order 排序步骤
    config.steps.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // 提取文件路径
    const files = config.steps.map(step => step.file);
    state.setMarkdownFiles(files);
    console.log('Markdown 文件列表:', files);
    
    // 初始化步骤元数据
    const metadata = [];
    config.steps.forEach((step, index) => {
      metadata[index] = {
        title: step.title || `步骤 ${index + 1}`,
        shortTitle: step.shortTitle || step.title || `步骤 ${index + 1}`,
        icon: step.icon || 'fa-circle',
        order: step.order || index + 1
      };
    });
    
    // 确保 stepMetadata 数组连续
    const sortedMetadata = [];
    for (let i = 0; i < config.steps.length; i++) {
      sortedMetadata[i] = metadata[i] || metadata.find(m => m && m.order === i + 1);
    }
    metadata.length = 0;
    metadata.push(...sortedMetadata);
    
    // 更新全局 stepMetadata
    const globalMetadata = state.stepMetadata();
    globalMetadata.length = 0;
    globalMetadata.push(...metadata);
    
    state.setTotalSteps(config.steps.length);
    console.log('步骤元数据初始化完成，总数:', state.totalSteps(), globalMetadata);
    
    // 生成步骤内容区域
    const tutorialContent = state.tutorialContent();
    if (tutorialContent) {
      generateStepContentAreas();
    } else {
      console.error('tutorialContent 未找到，无法生成步骤内容区域');
    }
    
    return config;
  } catch (error) {
    console.error('Error loading tutorial config:', error);
    const tutorialContent = state.tutorialContent();
    if (tutorialContent) {
      tutorialContent.innerHTML = `<div class="tutorial-header"><h1>picx-images-hosting 部署教程</h1></div><p>加载配置文件失败：${error.message}</p><p>请检查 docs/tutorial-config.json 文件是否存在。</p><p>详细错误信息请查看浏览器控制台。</p>`;
    }
    return null;
  }
}

// 动态生成步骤内容区域
function generateStepContentAreas() {
  const state = window.tutorialState;
  const tutorialContent = state.tutorialContent();
  const config = state.tutorialConfig();
  
  if (!tutorialContent) {
    console.error('tutorialContent 未找到');
    return;
  }
  
  if (!config || !config.steps) {
    console.error('tutorialConfig 或 steps 未定义');
    return;
  }
  
  console.log('开始生成步骤内容区域，步骤数量:', config.steps.length);
  
  // 保存标题和按钮区域
  const headerDiv = tutorialContent.querySelector('.tutorial-header');
  const headerHTML = headerDiv ? headerDiv.outerHTML : '';
  const actionsDiv = tutorialContent.querySelector('.tutorial-actions');
  const actionsHTML = actionsDiv ? actionsDiv.outerHTML : '';
  
  // 清空内容区域（但保留标题）
  const loadingDiv = tutorialContent.querySelector('.tutorial-loading');
  if (loadingDiv) {
    loadingDiv.remove();
  }
  
  // 如果步骤内容区域不存在，生成它们
  if (tutorialContent.querySelectorAll('.tutorial-step-content').length === 0) {
    config.steps.forEach((step, index) => {
      const contentDiv = document.createElement('div');
      contentDiv.className = `tutorial-step-content ${index === 0 ? 'active' : ''}`;
      contentDiv.dataset.step = index;
      contentDiv.innerHTML = '<div class="tutorial-loading">正在加载内容...</div>';
      tutorialContent.appendChild(contentDiv);
    });
    console.log('已生成', config.steps.length, '个步骤内容区域');
  }
  
  // 确保标题存在
  if (!headerDiv && headerHTML) {
    tutorialContent.insertAdjacentHTML('afterbegin', headerHTML);
  }
  
  // 确保按钮区域存在，并放在所有内容之后
  if (!actionsDiv) {
    if (actionsHTML) {
      tutorialContent.insertAdjacentHTML('beforeend', actionsHTML);
    } else {
      const newActionsDiv = document.createElement('div');
      newActionsDiv.className = 'tutorial-actions';
      newActionsDiv.innerHTML = `
        <button class="tutorial-btn tutorial-btn-secondary" id="prev-btn" disabled>
          <i class="fas fa-arrow-left"></i> 上一步
        </button>
        <button class="tutorial-btn tutorial-btn-primary" id="next-btn">
          下一步 <i class="fas fa-arrow-right"></i>
        </button>
      `;
      tutorialContent.appendChild(newActionsDiv);
    }
  } else {
    // 如果按钮已存在，确保它在最后
    tutorialContent.appendChild(actionsDiv);
  }
  
  // 重新获取元素引用
  const stepContents = document.querySelectorAll('.tutorial-step-content');
  state.setStepContents(Array.from(stepContents));
  console.log('步骤内容区域生成完成，找到', stepContents.length, '个区域');
  
  // 绑定按钮事件监听器
  if (window.bindButtonEvents) {
    window.bindButtonEvents();
  }
}

// 导出到全局作用域
window.loadTutorialConfig = loadTutorialConfig;
window.generateStepContentAreas = generateStepContentAreas;

