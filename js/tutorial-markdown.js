// tutorial-markdown.js - Markdown 处理

// 解析 front-matter
function parseFrontMatter(text) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = text.match(frontMatterRegex);
  
  if (!match) {
    return { metadata: null, content: text };
  }
  
  const metadataText = match[1];
  const content = match[2];
  const metadata = {};
  
  metadataText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  });
  
  return { metadata, content };
}

// 存储 callout 数据，用于后续渲染
const calloutStore = [];
let calloutCounter = 0;

// 预处理 Docusaurus callout 语法
// 支持格式: :::note 或 :::note Title
function preprocessCallouts(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // 检测 Docusaurus callout 开始: :::type 或 :::type Title（必须整行匹配）
    const trimmedLine = line.trim();
    const calloutStartMatch = trimmedLine.match(/^:::\s*([a-zA-Z]+)(?:\s+(.+))?$/);
    
    if (calloutStartMatch) {
      const calloutType = calloutStartMatch[1].trim().toLowerCase();
      const customTitle = calloutStartMatch[2] ? calloutStartMatch[2].trim() : '';
      
      // 支持的 callout 类型（映射到现有样式）
      const supportedTypes = {
        'note': 'note',
        'tip': 'tip',
        'info': 'note',
        'important': 'important',
        'warning': 'warning',
        'danger': 'caution',
        'caution': 'caution'
      };
      
      if (supportedTypes.hasOwnProperty(calloutType)) {
        const mappedType = supportedTypes[calloutType];
        const contentLines = [];
        i++; // 跳过 callout 开始行
        
        // 收集内容直到遇到 ::: 结束标记
        while (i < lines.length) {
          const contentLine = lines[i];
          const trimmedContentLine = contentLine.trim();
          
          // 检测 callout 结束: :::（必须整行匹配）
          if (trimmedContentLine === ':::') {
            i++; // 跳过结束标记
            break;
          }
          
          // 收集内容行（包括空行）
          contentLines.push(contentLine);
          i++;
        }
        
        // 渲染 callout
        const content = contentLines.join('\n').trim();
        if (content) {
          result.push(renderCallout(mappedType, content, customTitle));
        }
        
        // 继续处理下一行（不添加当前行，因为已经处理完了）
        continue;
      }
    }
    
    // 不是 callout，直接添加原行
    result.push(line);
    i++;
  }
  
  return result.join('\n');
}

// 渲染 callout HTML（使用占位符，避免 marked.js 解析）
function renderCallout(type, content, customTitle = '') {
  if (!content || !content.trim()) {
    return '';
  }
  
  // 解析内容为 HTML
  let contentHTML = content.trim();
  if (typeof marked !== 'undefined') {
    try {
      contentHTML = marked.parse(content.trim());
    } catch (e) {
      console.warn('Failed to parse callout content:', e);
      contentHTML = content.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }
  
  // 获取标题（自定义标题优先，否则使用默认标题）
  const title = customTitle || getCalloutTitle(type);
  
  // 生成占位符
  const placeholder = `<!-- CALLOUT_PLACEHOLDER_${calloutCounter} -->`;
  calloutStore.push({
    type,
    title,
    content: contentHTML
  });
  calloutCounter++;
  
  return placeholder;
}

// 替换占位符为实际 HTML
function replaceCalloutPlaceholders(html) {
  let result = html;
  calloutStore.forEach((callout, index) => {
    const placeholder = `<!-- CALLOUT_PLACEHOLDER_${index} -->`;
    const calloutHTML = `\n<div class="markdown-callout markdown-callout-${callout.type}">\n<div class="markdown-callout-header">\n<span class="markdown-callout-icon"></span>\n<span class="markdown-callout-title">${callout.title}</span>\n</div>\n<div class="markdown-callout-content">${callout.content}</div>\n</div>\n`;
    result = result.replace(placeholder, calloutHTML);
  });
  // 清空存储，准备下次使用
  calloutStore.length = 0;
  calloutCounter = 0;
  return result;
}

// 获取 callout 默认标题
function getCalloutTitle(type) {
  const titles = {
    note: 'Note',
    tip: 'Tip',
    important: 'Important',
    warning: 'Warning',
    caution: 'Caution'
  };
  return titles[type] || 'Note';
}

// 配置 marked.js
if (typeof marked !== 'undefined') {
  marked.setOptions({
    breaks: true,
    gfm: true,
    html: true
  });
}

// 加载并渲染 markdown 文件
async function loadMarkdownContent(stepIndex) {
  const state = window.tutorialState;
  const stepContents = state.stepContents();
  const markdownFiles = state.markdownFiles();
  
  const contentDiv = stepContents[stepIndex];
  const markdownFile = markdownFiles[stepIndex];
  
  if (!markdownFile) {
    return Promise.resolve();
  }
  
  // 如果已经加载过，直接返回
  if (contentDiv.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  try {
    const response = await fetch(markdownFile);
    if (!response.ok) {
      throw new Error(`Failed to load ${markdownFile}: ${response.status} ${response.statusText}`);
    }
    
    const markdownText = await response.text();
    const { metadata, content: markdownContent } = parseFrontMatter(markdownText);
    
    // 存储步骤元数据
    // 优先级：front-matter > tutorial-config.json > 默认值
    // front-matter 可以只包含 title，其他字段从配置文件读取
    const stepMetadata = state.stepMetadata();
    if (metadata) {
      // 合并元数据：front-matter 中的字段优先，如果不存在则使用配置文件中的值
      stepMetadata[stepIndex] = {
        title: metadata.title || stepMetadata[stepIndex]?.title || `步骤 ${stepIndex + 1}`,
        shortTitle: metadata.shortTitle || metadata.title || stepMetadata[stepIndex]?.shortTitle || stepMetadata[stepIndex]?.title || `步骤 ${stepIndex + 1}`,
        icon: metadata.icon || stepMetadata[stepIndex]?.icon || 'fa-circle',
        order: metadata.order ? parseInt(metadata.order) : (stepMetadata[stepIndex]?.order || stepIndex + 1)
      };
    } else if (!stepMetadata[stepIndex]) {
      // 如果没有 front-matter 且配置文件中也没有，使用默认值
      stepMetadata[stepIndex] = {
        title: `步骤 ${stepIndex + 1}`,
        shortTitle: `步骤 ${stepIndex + 1}`,
        icon: 'fa-circle',
        order: stepIndex + 1
      };
    }
    
    // 如果是第一次加载，更新导航
    if (stepMetadata.length === markdownFiles.length && stepMetadata.every(m => m)) {
      state.setTotalSteps(stepMetadata.length);
      if (window.generateSidebarNav) window.generateSidebarNav();
      if (window.generateStepIndicators) window.generateStepIndicators();
      if (window.attachNavEventListeners) window.attachNavEventListeners();
    }
    
    if (contentDiv.dataset.loaded === 'true') {
      return;
    }
    
    if (typeof marked !== 'undefined') {
      // 预处理 callout 语法（在 marked.parse 之前）
      const processedContent = preprocessCallouts(markdownContent);
      // 解析 Markdown
      let html = marked.parse(processedContent);
      // 替换 callout 占位符为实际 HTML
      html = replaceCalloutPlaceholders(html);
      contentDiv.innerHTML = html;
      
      // 为标题添加 ID，用于目录锚点
      const headings = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading, index) => {
        if (!heading.id) {
          const text = heading.textContent.trim();
          const id = `heading-${stepIndex}-${index}-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fa5-]/g, '')}`;
          heading.id = id;
        }
      });
      
      // 添加样式类到渲染的内容
      const highlightBlocks = contentDiv.querySelectorAll('blockquote');
      highlightBlocks.forEach(block => {
        if (block.textContent.includes('提示') || block.textContent.includes('安全提示') || block.textContent.includes('完成')) {
          block.classList.add('tutorial-highlight');
        }
      });

      const codeBlocks = contentDiv.querySelectorAll('pre');
      codeBlocks.forEach(pre => {
        pre.classList.add('tutorial-code-block');
        const codeEl = pre.querySelector('code');

        // 代码高亮
        if (codeEl && typeof hljs !== 'undefined') {
          hljs.highlightElement(codeEl);
        }

        // 复制按钮
        if (codeEl && !pre.querySelector('.code-copy-btn')) {
          const copyBtn = document.createElement('button');
          copyBtn.className = 'code-copy-btn';
          copyBtn.type = 'button';
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
          copyBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
              await navigator.clipboard.writeText(codeEl.innerText);
              copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
              setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
              }, 1500);
            } catch (err) {
              copyBtn.innerHTML = '<i class="fas fa-times"></i> 失败';
              setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
              }, 1500);
            }
          });
          pre.appendChild(copyBtn);
        }
      });

      const lists = contentDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        list.classList.add('tutorial-list');
      });
      
      contentDiv.dataset.loaded = 'true';
      
      // 如果当前步骤是激活的，更新目录
      // 使用 setTimeout 确保 DOM 完全渲染后再生成目录
      if (contentDiv.classList.contains('active')) {
        setTimeout(() => {
          if (window.updateTOC) window.updateTOC(stepIndex);
        }, 100);
      }
    } else {
      contentDiv.innerHTML = '<p>Markdown 解析器未加载，请刷新页面重试。</p>';
    }
  } catch (error) {
    console.error('Error loading markdown:', error);
    contentDiv.innerHTML = `<p>加载内容失败：${error.message}</p><p>请检查文件路径是否正确，或查看浏览器控制台获取更多信息。</p>`;
  }
}

// 加载所有 markdown 内容
async function loadAllMarkdown() {
  const state = window.tutorialState;
  let config = state.tutorialConfig();
  
  if (!config) {
    config = await loadTutorialConfig();
  }
  
  if (!config) {
    return;
  }
  
  const markdownFiles = state.markdownFiles();
  
  // 先加载所有文件以获取元数据（如果 Markdown 文件中有 front-matter，会覆盖配置）
  for (let i = 0; i < markdownFiles.length; i++) {
    await loadMarkdownContent(i);
  }
  
  // 确保所有步骤都已加载元数据后再加载内容
  const stepMetadata = state.stepMetadata();
  state.setTotalSteps(stepMetadata.length);
  const totalSteps = state.totalSteps();
  for (let i = 0; i < totalSteps; i++) {
    await loadMarkdownContent(i);
  }
}

// 导出到全局作用域
window.loadMarkdownContent = loadMarkdownContent;
window.loadAllMarkdown = loadAllMarkdown;

