// tutorial-init.js - 初始化逻辑

// 页面加载时先加载配置，然后加载所有 markdown 内容
// 确保 marked.js 和 DOM 都已加载
async function initializeTutorial() {
  const state = window.tutorialState;
  
  try {
    // 先加载配置文件
    await loadTutorialConfig();
    
    const config = state.tutorialConfig();
    const stepMetadata = state.stepMetadata();
    const tutorialContent = state.tutorialContent();
    
    if (!config || stepMetadata.length === 0) {
      console.error('配置文件加载失败或步骤元数据为空');
      if (tutorialContent) {
        tutorialContent.innerHTML = `<div class="tutorial-header"><h1>picx-images-hosting 部署教程</h1></div><p>配置文件加载失败或步骤元数据为空。请检查控制台获取更多信息。</p>`;
      }
      return;
    }
    
    console.log('配置文件加载成功，步骤数量:', stepMetadata.length);
    
    // 生成导航（确保 stepMetadata 已填充）
    if (stepMetadata.length > 0) {
      if (window.generateSidebarNav) window.generateSidebarNav();
      if (window.generateStepIndicators) window.generateStepIndicators();
      if (window.attachNavEventListeners) window.attachNavEventListeners();
    }
    
    // 等待 marked.js 加载
    if (typeof marked !== 'undefined') {
      if (window.loadAllMarkdown) {
        await loadAllMarkdown();
      }
    } else {
      // 如果 marked.js 还没加载，等待一下
      setTimeout(async () => {
        if (typeof marked !== 'undefined') {
          if (window.loadAllMarkdown) {
            await loadAllMarkdown();
          }
        } else {
          console.error('marked.js 未加载');
          const stepContents = state.stepContents();
          if (stepContents.length > 0) {
            stepContents.forEach(content => {
              if (content) {
                content.innerHTML = '<p>Markdown 解析器加载失败，请刷新页面重试。</p>';
              }
            });
          }
        }
      }, 500);
    }
  } catch (error) {
    console.error('初始化教程失败:', error);
    const tutorialContent = state.tutorialContent();
    if (tutorialContent) {
      tutorialContent.innerHTML = `<div class="tutorial-header"><h1>picx-images-hosting 部署教程</h1></div><p>初始化失败：${error.message}</p>`;
    }
  }
}

// 确保所有元素都已加载
let retryCount = 0;
const MAX_RETRIES = 50; // 最多重试 50 次（5 秒）

function startInitialization() {
  const state = window.tutorialState;
  const tutorialContent = state.tutorialContent();
  const sidebarNav = state.sidebarNav();
  const stepsContainer = state.stepsContainer();
  
  if (!tutorialContent || !sidebarNav || !stepsContainer) {
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      console.log(`等待 DOM 元素加载... (${retryCount}/${MAX_RETRIES})`);
      setTimeout(startInitialization, 100);
      return;
    } else {
      console.error('必要的DOM元素未找到，已达到最大重试次数');
      return;
    }
  }
  
  console.log('开始初始化教程...');
  console.log('tutorialContent:', tutorialContent);
  console.log('sidebarNav:', sidebarNav);
  console.log('stepsContainer:', stepsContainer);
  
  initializeTutorial();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startInitialization();
    // 初始化 UI 功能
    if (window.initTutorialUI) window.initTutorialUI();
  });
} else {
  // DOM 已加载，但可能需要等待一下确保所有元素都准备好
  setTimeout(() => {
    startInitialization();
    // 初始化 UI 功能
    if (window.initTutorialUI) window.initTutorialUI();
  }, 100);
}

// 设置 GitHub 链接（在 DOM 加载后执行）
function setupGitHubLink() {
  const githubLink = document.getElementById('github-link');
  if (githubLink) {
    // 检查是否有全局 config 对象
    if (typeof config !== 'undefined' && config.GITHUB_REPO_URL) {
      githubLink.href = config.GITHUB_REPO_URL;
    } else if (typeof window.APP_CONFIG !== 'undefined' && window.APP_CONFIG.GITHUB_REPO_URL) {
      githubLink.href = window.APP_CONFIG.GITHUB_REPO_URL;
    } else {
      githubLink.href = 'https://github.com/hoochanlon/picx-images-hosting';
    }
  }
}

// 在 DOM 加载后设置 GitHub 链接
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupGitHubLink);
} else {
  setupGitHubLink();
}

