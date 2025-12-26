// tutorial-mermaid.js - Mermaid 图表渲染模块（优化版）

(function() {
  'use strict';

  // Mermaid 初始化标志
  let mermaidInitialized = false;

  /**
   * 初始化 Mermaid（使用官方配置）
   */
  function initializeMermaid() {
    if (mermaidInitialized || typeof mermaid === 'undefined') {
      return;
    }

    try {
      const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      
      // 使用 Mermaid 官方配置，优化渲染效果
      mermaid.initialize({ 
        startOnLoad: false, // 手动控制渲染时机
        theme: isDarkMode ? 'dark' : 'default',
        securityLevel: 'loose',
        logLevel: 'error', // 只显示错误日志，减少控制台噪音（忽略调试警告）
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
      
      mermaidInitialized = true;
      console.log('Mermaid 初始化成功');
    } catch (err) {
      console.error('Mermaid 初始化失败:', err);
    }
  }

  /**
   * 检测是否是 Mermaid 代码块
   */
  function isMermaidCodeBlock(codeEl) {
    if (!codeEl) {
      return false;
    }

    const codeText = codeEl.textContent.trim();
    const codeClass = codeEl.className || '';

    // 通过类名检测（优先）
    const isMermaidByClass = 
      codeClass.includes('language-mermaid') ||
      codeClass.includes('mermaid');

    // 通过内容检测（支持更多图表类型）
    const isMermaidByContent = 
      codeText.startsWith('graph ') ||
      codeText.startsWith('flowchart ') ||
      codeText.startsWith('sequenceDiagram') ||
      codeText.startsWith('stateDiagram') ||
      codeText.startsWith('classDiagram') ||
      codeText.startsWith('erDiagram') ||
      codeText.startsWith('gantt') ||
      codeText.startsWith('pie') ||
      codeText.startsWith('journey') ||
      codeText.startsWith('gitGraph') ||
      codeText.startsWith('mindmap');

    return isMermaidByClass || isMermaidByContent;
  }

  /**
   * 处理单个 Mermaid 图表渲染
   */
  /**
   * 解码 HTML 实体
   */
  function decodeHtmlEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  async function renderSingleMermaid(div) {
    let originalContent = div.getAttribute('data-mermaid-content') || div.textContent.trim();
    if (!originalContent) {
      console.warn('图表没有可用的源码内容');
      return false;
    }

    // 解码 HTML 实体（如 &gt; 转换为 >）
    originalContent = decodeHtmlEntities(originalContent);

    try {
      // 确保 Mermaid 已初始化
      initializeMermaid();
      
      // 完全清空容器
      div.innerHTML = '';
      
      // 确保 div 有正确的 class
      div.className = 'mermaid';
      
      console.log('准备渲染图表，内容预览:', originalContent.substring(0, 100));
      
      // 直接使用 mermaid.render() 渲染单个图表，这是更可靠的方式
      if (typeof mermaid.render === 'function') {
        try {
          // 确保元素在 DOM 中
          if (!div.isConnected) {
            console.warn('图表元素不在 DOM 中');
            return false;
          }
          
          // 生成唯一 ID
          const chartId = `mermaid-chart-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          // 使用 mermaid.render() 渲染单个图表
          console.log('调用 mermaid.render() 渲染单个图表...');
          const { svg } = await mermaid.render(chartId, originalContent);
          
          // 直接将 SVG 插入到容器中
          div.innerHTML = svg;
          
          // 等待一下，确保 DOM 更新
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 检查渲染结果
          const svgElement = div.querySelector('svg');
          const viewBox = svgElement ? svgElement.getAttribute('viewBox') : null;
          let viewBoxValid = true;
          
          if (viewBox) {
            const viewBoxValues = viewBox.split(' ').map(v => parseFloat(v));
            if (viewBoxValues.length === 4) {
              const [, , width, height] = viewBoxValues;
              if (width < 50 || height < 50) {
                viewBoxValid = false;
              }
            }
          }
          
          const result = {
            hasSvg: !!svgElement,
            svgChildren: svgElement ? svgElement.children.length : 0,
            viewBox: viewBox,
            viewBoxValid: viewBoxValid
          };
          
          console.log('单个图表渲染检查:', result);
          
          if (svgElement && svgElement.children.length > 0) {
            return true;
          } else {
            console.warn('图表渲染不完整');
            // 尝试使用 mermaid.run() 作为备选方案
            console.log('尝试使用 mermaid.run() 作为备选方案...');
            div.innerHTML = '';
            div.textContent = originalContent;
            await mermaid.run();
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const svg2 = div.querySelector('svg');
            if (svg2 && svg2.children.length > 0) {
              console.log('备选方案渲染成功');
              return true;
            }
            console.warn('备选方案渲染失败');
            return false;
          }
        } catch (renderError) {
          console.error('mermaid.render 执行错误:', renderError);
          // 尝试使用 mermaid.run() 作为备选方案
          console.log('尝试使用 mermaid.run() 作为备选方案...');
          div.innerHTML = '';
          div.textContent = originalContent;
          await new Promise(resolve => setTimeout(resolve, 50));
          
          try {
            await mermaid.run();
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const svg = div.querySelector('svg');
            if (svg && svg.children.length > 0) {
              console.log('备选方案渲染成功');
              return true;
            }
          } catch (runError) {
            console.error('备选方案 mermaid.run 执行错误:', runError);
          }
          throw renderError;
        }
      } else if (typeof mermaid.run === 'function') {
        // 回退到 mermaid.run()
        div.textContent = originalContent;
        await new Promise(resolve => setTimeout(resolve, 50));
        await mermaid.run();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const svg = div.querySelector('svg');
        if (svg && svg.children.length > 0) {
          console.log('回退方案 mermaid.run 渲染成功');
          return true;
        }
        return false;
      }
      
      return false;
    } catch (err) {
      console.error('单个图表渲染失败:', err);
      const content = div.getAttribute('data-mermaid-content') || originalContent;
      showMermaidError(div, content, err);
      return false;
    }
  }

  /**
   * 渲染所有 Mermaid 图表
   */
  async function renderAllMermaids(mermaidElements) {
    if (mermaidElements.length === 0) {
      return;
    }

    // 确保所有元素都有正确的文本内容，并且清空之前的渲染结果
    mermaidElements.forEach((div, index) => {
      const content = div.getAttribute('data-mermaid-content');
      if (content) {
        // 清空之前的内容，确保重新渲染
        div.innerHTML = '';
        div.textContent = content;
        console.log(`准备渲染图表 ${index + 1}，内容长度: ${content.length}`);
      } else {
        console.warn(`图表 ${index + 1} 没有保存的源码内容`);
      }
    });

    try {
      // 批量渲染（高性能）- mermaid.run() 会自动查找所有 .mermaid 元素
      console.log(`开始渲染 ${mermaidElements.length} 个图表...`);
      await mermaid.run();
      console.log('Mermaid 批量渲染完成');
      
      // 等待一小段时间，确保SVG完全插入DOM
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 检查渲染结果，为成功的图表添加复制按钮
      const failedElements = [];
      
      mermaidElements.forEach((div, index) => {
        const svg = div.querySelector('svg');
        const content = div.getAttribute('data-mermaid-content') || '';
        
        // 详细调试信息
        console.log(`检查图表 ${index + 1}:`, {
          hasSvg: !!svg,
          svgChildren: svg ? svg.children.length : 0,
          divInnerHTML: div.innerHTML.substring(0, 200),
          divTextContent: div.textContent.substring(0, 100)
        });
        
        if (svg && svg.children.length > 0) {
          // 检查 viewBox 是否正常（如果 viewBox 太小，说明渲染不完整）
          const viewBox = svg.getAttribute('viewBox');
          let isValidViewBox = true;
          
          if (viewBox) {
            const viewBoxValues = viewBox.split(' ').map(v => parseFloat(v));
            if (viewBoxValues.length === 4) {
              const [, , width, height] = viewBoxValues;
              // 如果 viewBox 的宽或高小于 50，认为渲染不完整
              if (width < 50 || height < 50) {
                isValidViewBox = false;
                console.warn(`⚠ 图表 ${index + 1} viewBox 太小 (${width}x${height})，可能渲染不完整`);
              }
            }
          }
          
          const computedStyle = window.getComputedStyle(div);
          const svgStyle = window.getComputedStyle(svg);
          console.log(`✓ 图表 ${index + 1} 渲染成功`, {
            svgWidth: svg.getAttribute('width'),
            svgHeight: svg.getAttribute('height'),
            viewBox: viewBox,
            isValidViewBox: isValidViewBox,
            divDisplay: computedStyle.display,
            divVisibility: computedStyle.visibility,
            divOpacity: computedStyle.opacity,
            svgDisplay: svgStyle.display,
            svgVisibility: svgStyle.visibility,
            svgOpacity: svgStyle.opacity,
            divHeight: computedStyle.height,
            divWidth: computedStyle.width
          });
          
          // 确保容器可见
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            console.warn(`⚠ 图表 ${index + 1} 容器被隐藏，尝试修复`);
            div.style.display = '';
            div.style.visibility = '';
          }
          
          // 如果 viewBox 正常，添加复制按钮；否则加入重试列表
          if (isValidViewBox) {
            if (content) {
              addCopyButton(div, content);
            }
          } else {
            // viewBox 太小，需要重新渲染
            console.warn(`⚠ 图表 ${index + 1} 需要重新渲染（viewBox 异常）`);
            failedElements.push(div);
          }
        } else {
          // 渲染失败，添加到重试列表
          console.warn(`⚠ 图表 ${index + 1} 渲染失败，将重试`, {
            hasSvg: !!svg,
            svgChildren: svg ? svg.children.length : 0,
            divHTML: div.innerHTML.substring(0, 300)
          });
          failedElements.push(div);
        }
      });
      
      // 重试渲染失败的图表
      if (failedElements.length > 0) {
        console.log(`开始重试 ${failedElements.length} 个渲染失败的图表`);
        
        for (let i = 0; i < failedElements.length; i++) {
          const div = failedElements[i];
          const content = div.getAttribute('data-mermaid-content');
          
          if (!content) {
            console.warn(`图表重试 ${i + 1} 没有源码内容，跳过`);
            continue;
          }
          
          // 完全清空并恢复内容
          div.innerHTML = '';
          div.textContent = content;
          
          // 重试渲染，增加延迟
          await new Promise(resolve => setTimeout(resolve, 200));
          const success = await renderSingleMermaid(div);
          
          if (success) {
            console.log(`✓ 图表重试 ${i + 1} 成功`);
            addCopyButton(div, content);
          } else {
            console.error(`✗ 图表重试 ${i + 1} 失败，显示错误信息`);
            // 显示错误信息给用户
            showMermaidError(div, content, new Error('图表渲染失败，请检查图表语法或刷新页面重试'));
          }
          
          // 短暂延迟，避免请求过载
          if (i < failedElements.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
    } catch (err) {
      console.error('Mermaid 批量渲染失败，尝试逐个渲染:', err);
      
      // 逐个渲染所有图表
      for (let i = 0; i < mermaidElements.length; i++) {
        const div = mermaidElements[i];
        const success = await renderSingleMermaid(div);
        if (success) {
          const content = div.getAttribute('data-mermaid-content');
          if (content) {
            addCopyButton(div, content);
          }
        }
        
        // 短暂延迟，避免请求过载
        if (i < mermaidElements.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }
    }
  }

  /**
   * 处理代码块，将 Mermaid 代码块转换为官方格式
   */
  function processCodeBlocks(contentDiv) {
    if (typeof mermaid === 'undefined') {
      console.warn('Mermaid 库未加载');
      return 0;
    }

    const codeBlocks = contentDiv.querySelectorAll('pre code');
    const mermaidElements = [];

    // 1. 转换所有 Mermaid 代码块为官方容器格式
    codeBlocks.forEach(codeEl => {
      if (!isMermaidCodeBlock(codeEl)) {
        return;
      }

      const mermaidContent = codeEl.textContent.trim();
      if (!mermaidContent) {
        return;
      }

      const pre = codeEl.parentElement;
      if (!pre) {
        return;
      }

      // 创建官方标准的 Mermaid 容器
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.textContent = mermaidContent;
      mermaidDiv.style.cssText = `
        text-align: center;
        margin: 20px 0;
        position: relative;
      `;

      // 保存源码到 data 属性
      mermaidDiv.setAttribute('data-mermaid-content', mermaidContent);

      // 替换 pre 元素
      pre.parentNode.replaceChild(mermaidDiv, pre);
      mermaidElements.push(mermaidDiv);
    });

    // 2. 初始化并渲染所有图表
    if (mermaidElements.length > 0) {
      // 确保 Mermaid 已初始化
      initializeMermaid();
      
      // 延迟渲染，确保所有元素都已添加到 DOM 并且内容正确
      setTimeout(() => {
        renderAllMermaids(mermaidElements).catch(err => {
          console.error('渲染 Mermaid 图表时发生错误:', err);
        });
      }, 100);
    }

    return mermaidElements.length;
  }

  /**
   * 添加复制按钮到 Mermaid 图表
   */
  function addCopyButton(mermaidDiv, mermaidContent) {
    // 检查是否已经添加过按钮
    if (mermaidDiv.querySelector('.mermaid-copy-btn')) {
      return;
    }

    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'mermaid-copy-btn';
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = '复制源码到剪贴板';
    copyButton.setAttribute('aria-label', '复制源码');
    copyButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85em;
      transition: all 0.2s ease;
    `;

    // 复制源码功能
    copyButton.addEventListener('click', async (e) => {
      e.stopPropagation();
      
      try {
        await navigator.clipboard.writeText(mermaidContent);
        showCopySuccess(copyButton);
      } catch (err) {
        console.error('复制失败，尝试降级方案:', err);
        // 降级方案：使用传统方法
        const textArea = document.createElement('textarea');
        textArea.value = mermaidContent;
        textArea.style.cssText = 'position: fixed; opacity: 0; pointer-events: none;';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          showCopySuccess(copyButton);
        } catch (fallbackErr) {
          alert('复制失败，请手动复制');
        }
        
        document.body.removeChild(textArea);
      }
    });

    // 悬停效果
    copyButton.addEventListener('mouseenter', () => {
      if (!copyButton.classList.contains('copied')) {
        copyButton.style.background = 'rgba(0, 0, 0, 0.8)';
      }
    });
    
    copyButton.addEventListener('mouseleave', () => {
      if (!copyButton.classList.contains('copied')) {
        copyButton.style.background = 'rgba(0, 0, 0, 0.6)';
      }
    });

    // 将按钮添加到图表容器
    mermaidDiv.appendChild(copyButton);
  }

  /**
   * 显示复制成功状态
   */
  function showCopySuccess(button) {
    const originalHTML = button.innerHTML;
    const originalBg = button.style.background;
    
    button.classList.add('copied');
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.style.background = 'rgba(34, 197, 94, 0.8)';
    
    setTimeout(() => {
      button.classList.remove('copied');
      button.innerHTML = originalHTML;
      button.style.background = originalBg;
    }, 2000);
  }

  /**
   * 显示 Mermaid 渲染错误
   */
  function showMermaidError(container, mermaidContent, err) {
    const errorMessage = err.message || err.str || '未知错误';
    container.innerHTML = `
      <div style="color: #d1242f; padding: 20px; background: rgba(255, 235, 238, 0.5); border-radius: 6px; border: 1px solid rgba(255, 0, 0, 0.2);">
        <p style="margin: 0; font-weight: 600;">⚠️ Mermaid 图表渲染失败</p>
        <p style="margin: 8px 0 0 0; font-size: 0.9em;">错误信息：${errorMessage}</p>
        <details style="margin-top: 12px;">
          <summary style="cursor: pointer; color: #0969da;">查看图表代码</summary>
          <pre style="margin-top: 8px; padding: 12px; background: rgba(0, 0, 0, 0.05); border-radius: 4px; overflow-x: auto; font-size: 0.85em;"><code>${escapeHtml(mermaidContent)}</code></pre>
        </details>
      </div>
    `;
  }

  /**
   * HTML 转义
   */
  function escapeHtml(text) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * 监听主题变化，重新渲染 Mermaid 图表
   */
  function watchThemeChange() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // 主题变化，重新初始化 Mermaid
          mermaidInitialized = false;
          initializeMermaid();
          
          // 重新渲染所有 Mermaid 图表
          const mermaidElements = document.querySelectorAll('.mermaid');
          if (mermaidElements.length > 0 && typeof mermaid !== 'undefined') {
            // 保存所有图表的源码内容
            const mermaidContents = Array.from(mermaidElements).map(div => ({
              div: div,
              content: div.getAttribute('data-mermaid-content') || div.textContent.trim()
            }));
            
            // 清空当前内容，恢复原始源码
            mermaidContents.forEach(({ div, content }) => {
              div.innerHTML = '';
              div.textContent = content;
            });
            
            // 重新渲染
            renderAllMermaids(mermaidContents.map(item => item.div)).catch(err => {
              console.error('主题切换后 Mermaid 重新渲染错误:', err);
            });
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  // 初始化主题监听
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchThemeChange);
  } else {
    watchThemeChange();
  }

  // 导出到全局作用域
  window.tutorialMermaid = {
    processCodeBlocks: processCodeBlocks,
    initialize: initializeMermaid,
    isMermaidCodeBlock: isMermaidCodeBlock
  };

})();
