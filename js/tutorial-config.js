// tutorial-config.js - 配置和状态管理
// 全局状态变量
let currentStep = 0;
let totalSteps = 0;
let tutorialConfig = null;
let markdownFiles = [];

// 存储步骤信息
const stepMetadata = [];

let stepContents = [];
let stepIndicators = [];
let sidebarItems = [];

// DOM 元素引用（使用 getter 函数，确保在 DOM 加载后获取）
// 不缓存元素，每次都重新获取，确保在 DOM 加载后能正确获取

// 导出到全局作用域，供其他模块使用
window.tutorialState = {
  currentStep: () => currentStep,
  setCurrentStep: (step) => { currentStep = step; },
  totalSteps: () => totalSteps,
  setTotalSteps: (steps) => { totalSteps = steps; },
  tutorialConfig: () => tutorialConfig,
  setTutorialConfig: (config) => { tutorialConfig = config; },
  markdownFiles: () => markdownFiles,
  setMarkdownFiles: (files) => { markdownFiles = files; },
  stepMetadata: () => stepMetadata,
  stepContents: () => stepContents,
  setStepContents: (contents) => { stepContents = contents; },
  stepIndicators: () => stepIndicators,
  setStepIndicators: (indicators) => { stepIndicators = indicators; },
  sidebarItems: () => sidebarItems,
  setSidebarItems: (items) => { sidebarItems = items; },
  // 使用 getter 函数动态获取 DOM 元素（每次调用都重新获取）
  sidebarNav: () => document.getElementById('tutorial-sidebar-nav'),
  stepsContainer: () => document.getElementById('tutorial-steps'),
  tutorialContent: () => document.getElementById('tutorial-content')
};

