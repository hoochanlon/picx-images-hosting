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

// 预处理 callout 语法（同时支持 Docusaurus 和 GitHub 风格）
// Docusaurus 格式: :::note 或 :::note Title
// GitHub 格式: > [!NOTE] 或 > **Note**
function preprocessCallouts(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // 1. 检测 Docusaurus callout 开始: :::type 或 :::type Title（必须整行匹配）
    const docusaurusMatch = trimmedLine.match(/^:::\s*([a-zA-Z]+)(?:\s+(.+))?$/);
    
    if (docusaurusMatch) {
      const calloutType = docusaurusMatch[1].trim().toLowerCase();
      const customTitle = docusaurusMatch[2] ? docusaurusMatch[2].trim() : '';
      
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
    
    // 2. 检测 GitHub 风格 callout: > [!TYPE] 或 > **Type**
    // 格式: > [!NOTE] 或 > **Note** 或 > **Note:**
    if (trimmedLine.startsWith('>')) {
      // 检测 GitHub callout 标记: > [!NOTE] 或 > **Note** 或 > **Note:**
      // 使用 i 标志使匹配不区分大小写
      const githubBracketMatch = trimmedLine.match(/^>\s*\[!([a-zA-Z]+)\]\s*$/i);
      const githubBoldMatch = trimmedLine.match(/^>\s*\*\*([^*]+)\*\*:?\s*$/);
      
      if (githubBracketMatch || githubBoldMatch) {
        // 提取 callout 标签
        const calloutLabel = (githubBracketMatch ? githubBracketMatch[1] : githubBoldMatch[1]).trim();
        const upperLabel = calloutLabel.toUpperCase();
        
        // 映射 GitHub callout 类型到内部类型
        const githubTypeMap = {
          'NOTE': 'note',
          'TIP': 'tip',
          'INFO': 'note',
          'IMPORTANT': 'important',
          'WARNING': 'warning',
          'DANGER': 'caution',
          'CAUTION': 'caution'
        };
        
        // 也支持中文标签
        const chineseTypeMap = {
          '注意': 'note',
          '提示': 'tip',
          '信息': 'note',
          '重要': 'important',
          '警告': 'warning',
          '危险': 'caution',
          '小心': 'caution'
        };
        
        // 优先匹配大写标签，然后匹配中文标签，最后匹配原始标签
        let mappedType = githubTypeMap[upperLabel] || 
                         chineseTypeMap[calloutLabel] || 
                         githubTypeMap[calloutLabel] ||
                         'note';
        
        const contentLines = [];
        i++; // 跳过 callout 标记行
        
        // 收集后续的 blockquote 行（以 > 开头的行）
        while (i < lines.length) {
          const contentLine = lines[i];
          const trimmedContentLine = contentLine.trim();
          
          // 如果遇到空行，检查下一行是否还是 blockquote
          if (trimmedContentLine === '') {
            // 检查下一行是否是 blockquote
            if (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
              contentLines.push(''); // 保留空行
              i++;
              continue;
            } else {
              // 空行且下一行不是 blockquote，结束 callout
              break;
            }
          }
          
          // 如果行以 > 开头，提取内容（移除 > 和可能的空格）
          if (trimmedContentLine.startsWith('>')) {
            // 移除开头的 > 和后续的空格
            const content = trimmedContentLine.replace(/^>\s*/, '');
            contentLines.push(content);
            i++;
          } else {
            // 不是 blockquote 行，结束 callout
            break;
          }
        }
        
        // 渲染 callout
        const content = contentLines.join('\n').trim();
        if (content) {
          result.push(renderCallout(mappedType, content, ''));
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
      console.log('Markdown 解析完成，HTML 长度:', html.length);
      // 替换 callout 占位符为实际 HTML
      html = replaceCalloutPlaceholders(html);
      contentDiv.innerHTML = html;
      console.log('内容已插入到 DOM，开始处理代码块');
      
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
      console.log('找到代码块数量:', codeBlocks.length);
      
      codeBlocks.forEach((pre, index) => {
        const codeEl = pre.querySelector('code');
        
        // 检查是否是 Mermaid 代码块
        // marked.js 会将 ```mermaid 转换为 class="language-mermaid"
        if (!codeEl) {
          console.log(`代码块 ${index}: 没有 code 元素`);
          return; // 跳过没有 code 元素的 pre
        }
        
        const codeText = codeEl.textContent.trim();
        const codeClass = codeEl.className || '';
        
        console.log(`代码块 ${index}: class="${codeClass}", 内容开头="${codeText.substring(0, 30)}"`);
        
        // 检测 Mermaid 代码块的多种方式
        // 优先检查类名，然后检查内容
        const isMermaidByClass = 
          codeClass.includes('language-mermaid') ||
          codeClass.includes('mermaid');
        
        const isMermaidByContent = 
          codeText.startsWith('graph ') ||
          codeText.startsWith('flowchart ') ||
          codeText.startsWith('sequenceDiagram') ||
          codeText.startsWith('stateDiagram') ||
          codeText.startsWith('classDiagram') ||
          codeText.startsWith('erDiagram') ||
          codeText.startsWith('gantt') ||
          codeText.startsWith('pie');
        
        const isMermaid = isMermaidByClass || isMermaidByContent;
        
        console.log(`代码块 ${index}: 是 Mermaid? ${isMermaid} (类名: ${isMermaidByClass}, 内容: ${isMermaidByContent})`);
        
        if (isMermaid) {
          console.log(`开始处理 Mermaid 代码块 ${index}`);
          // Mermaid 图表渲染
          const mermaidContent = codeText;
          if (!mermaidContent) {
            console.warn('Mermaid 代码块为空');
            return;
          }
          
          console.log('Mermaid 内容长度:', mermaidContent.length);
          console.log('Mermaid 内容前50字符:', mermaidContent.substring(0, 50));
          
          if (typeof mermaid === 'undefined') {
            console.error('Mermaid 库未加载');
            pre.innerHTML = '<p style="color: red;">Mermaid 库未加载，请刷新页面重试。</p>';
            return;
          }
          
          console.log('Mermaid 库已加载，开始创建容器');
          
          // 创建 Mermaid 容器
          const mermaidDiv = document.createElement('div');
          mermaidDiv.className = 'mermaid';
          mermaidDiv.textContent = mermaidContent;
          mermaidDiv.style.textAlign = 'center';
          mermaidDiv.style.margin = '20px 0';
          
          // 替换 pre 元素
          console.log('替换 pre 元素为 mermaid div');
          pre.parentNode.replaceChild(mermaidDiv, pre);
          
          // 延迟渲染，确保 DOM 完全准备好
          setTimeout(() => {
            try {
              // 初始化 Mermaid（只初始化一次）
              if (typeof window.mermaidInitialized === 'undefined') {
                const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
                mermaid.initialize({ 
                  startOnLoad: false,
                  theme: isDarkMode ? 'dark' : 'default',
                  securityLevel: 'loose',
                  flowchart: {
                    useMaxWidth: true,
                    htmlLabels: false,
                    curve: 'basis',
                    padding: 20,
                    nodeSpacing: 80,
                    rankSpacing: 100
                  },
                  sequence: {
                    useMaxWidth: true,
                    diagramMarginX: 50,
                    diagramMarginY: 10,
                    actorMargin: 50,
                    width: 150,
                    height: 65,
                    boxMargin: 10,
                    boxTextMargin: 5,
                    noteMargin: 10,
                    messageMargin: 35
                  },
                  gantt: {
                    useMaxWidth: true
                  }
                });
                window.mermaidInitialized = true;
              }
              
              // 渲染 Mermaid 图表
              // Mermaid 11.x 使用 run() 方法
              console.log('检查 Mermaid API:', {
                hasRun: typeof mermaid.run === 'function',
                hasInit: typeof mermaid.init === 'function',
                hasParse: typeof mermaid.parse === 'function',
                hasRender: typeof mermaid.render === 'function'
              });
              
              if (typeof mermaid.run === 'function') {
                console.log('使用 mermaid.run() 渲染');
                // 使用 run() 方法渲染
                mermaid.run({
                  nodes: [mermaidDiv],
                  suppressError: false
                }).then(() => {
                  console.log('Mermaid 图表渲染成功');
                }).catch(err => {
                  console.error('Mermaid rendering error:', err);
                  mermaidDiv.innerHTML = `<div style="color: #d1242f; padding: 20px; background: rgba(255, 235, 238, 0.5); border-radius: 6px; border: 1px solid rgba(255, 0, 0, 0.2);">
                    <p style="margin: 0; font-weight: 600;">⚠️ Mermaid 图表渲染失败</p>
                    <p style="margin: 8px 0 0 0; font-size: 0.9em;">错误信息：${err.message || err.str || '未知错误'}</p>
                    <details style="margin-top: 12px;">
                      <summary style="cursor: pointer; color: #0969da;">查看图表代码</summary>
                      <pre style="margin-top: 8px; padding: 12px; background: rgba(0, 0, 0, 0.05); border-radius: 4px; overflow-x: auto; font-size: 0.85em;"><code>${mermaidContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                    </details>
                  </div>`;
                });
              } else if (typeof mermaid.parse === 'function' && typeof mermaid.render === 'function') {
                // Mermaid 9.x 及以下版本使用 parse + render
                try {
                  const id = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                  mermaidDiv.id = id;
                  mermaid.parse(mermaidContent);
                  mermaid.render(id, mermaidContent, (svgCode) => {
                    mermaidDiv.innerHTML = svgCode;
                  });
                } catch (err) {
                  console.error('Mermaid rendering error:', err);
                  mermaidDiv.innerHTML = `<div style="color: #d1242f; padding: 20px;">Mermaid 图表渲染失败：${err.message}</div>`;
                }
              } else if (typeof mermaid.init === 'function') {
                // 兼容旧版本 API
                mermaid.init(undefined, mermaidDiv);
              } else {
                console.error('Mermaid API 不可用，可用方法:', Object.keys(mermaid));
                throw new Error('Mermaid API 不可用');
              }
            } catch (err) {
              console.error('Mermaid rendering error:', err);
              mermaidDiv.innerHTML = `<div style="color: #d1242f; padding: 20px; background: rgba(255, 235, 238, 0.5); border-radius: 6px; border: 1px solid rgba(255, 0, 0, 0.2);">
                <p style="margin: 0; font-weight: 600;">⚠️ Mermaid 图表渲染失败</p>
                <p style="margin: 8px 0 0 0; font-size: 0.9em;">错误信息：${err.message}</p>
              </div>`;
            }
          }, 100);
          return; // 跳过后续的代码高亮处理
        }
        
        // 普通代码块处理
        pre.classList.add('tutorial-code-block');

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
      
      // Mermaid 图表已经在代码块处理时单独渲染，这里不需要再次渲染
      // 但我们需要确保 Mermaid 已初始化（如果还没有初始化的话）
      const mermaidElements = contentDiv.querySelectorAll('.mermaid');
      if (mermaidElements.length > 0 && typeof mermaid !== 'undefined' && typeof window.mermaidInitialized === 'undefined') {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        try {
          mermaid.initialize({ 
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            flowchart: {
              useMaxWidth: true,
              htmlLabels: true,
              curve: 'basis',
              padding: 20,
              nodeSpacing: 50,
              rankSpacing: 50
            },
            sequence: {
              useMaxWidth: true,
              diagramMarginX: 50,
              diagramMarginY: 10,
              actorMargin: 50,
              width: 150,
              height: 65,
              boxMargin: 10,
              boxTextMargin: 5,
              noteMargin: 10,
              messageMargin: 35
            },
            gantt: {
              useMaxWidth: true
            }
          });
          window.mermaidInitialized = true;
        } catch (err) {
          console.error('Mermaid initialization error:', err);
        }
      }
      
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

