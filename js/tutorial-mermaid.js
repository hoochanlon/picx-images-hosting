// tutorial-mermaid.js - Mermaid 图表渲染模块（使用官方自动渲染）

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
      
      // 使用 Mermaid 官方配置
      mermaid.initialize({ 
        startOnLoad: false, // 手动控制渲染时机
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
      
      mermaidInitialized = true;
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

    // 通过类名检测
    const isMermaidByClass = 
      codeClass.includes('language-mermaid') ||
      codeClass.includes('mermaid');

    // 通过内容检测
    const isMermaidByContent = 
      codeText.startsWith('graph ') ||
      codeText.startsWith('flowchart ') ||
      codeText.startsWith('sequenceDiagram') ||
      codeText.startsWith('stateDiagram') ||
      codeText.startsWith('classDiagram') ||
      codeText.startsWith('erDiagram') ||
      codeText.startsWith('gantt') ||
      codeText.startsWith('pie');

    return isMermaidByClass || isMermaidByContent;
  }

  /**
   * 处理代码块，将 Mermaid 代码块转换为官方格式
   */
  function processCodeBlocks(contentDiv) {
    if (typeof mermaid === 'undefined') {
      console.warn('Mermaid 库未加载');
      return 0;
    }

    const codeBlocks = contentDiv.querySelectorAll('pre code.language-mermaid, pre code');
    const mermaidElements = [];

    codeBlocks.forEach(codeEl => {
      if (!isMermaidCodeBlock(codeEl)) {
        return;
      }

      const mermaidContent = codeEl.textContent.trim();
      if (!mermaidContent) {
        return;
      }

      // 获取父元素 pre
      const pre = codeEl.parentElement;
      if (!pre) {
        return;
      }

      // 创建官方标准的 Mermaid 容器
      // Mermaid 官方要求：<div class="mermaid">图表代码</div>
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.textContent = mermaidContent;
      mermaidDiv.style.textAlign = 'center';
      mermaidDiv.style.margin = '20px 0';

      // 替换 pre 元素
      pre.parentNode.replaceChild(mermaidDiv, pre);
      mermaidElements.push(mermaidDiv);
    });

    // 如果有 Mermaid 图表，初始化并渲染
    if (mermaidElements.length > 0) {
      initializeMermaid();
      
      // 延迟渲染，确保所有元素都已添加到 DOM
      setTimeout(() => {
        if (typeof mermaid.run === 'function') {
          // 记录每个图表的信息
          mermaidElements.forEach((div, index) => {
            const content = div.textContent.trim();
            const diagramType = content.split('\n')[0].trim();
            console.log(`准备渲染图表 ${index + 1}: ${diagramType}`);
            console.log(`图表 ${index + 1} 内容长度:`, content.length);
          });
          
          // 使用 Mermaid 官方推荐方式：不传参数，自动查找所有 .mermaid 元素
          mermaid.run()
            .then(() => {
              console.log('Mermaid.run() 完成，检查渲染结果...');
              
              // 检查每个图表是否成功渲染
              mermaidElements.forEach((div, index) => {
                const svg = div.querySelector('svg');
                const content = div.textContent.trim();
                const diagramType = content.split('\n')[0].trim();
                
                if (svg) {
                  const svgWidth = svg.getAttribute('width');
                  const svgHeight = svg.getAttribute('height');
                  const viewBox = svg.getAttribute('viewBox');
                  
                  console.log(`✓ 图表 ${index + 1} (${diagramType}) 渲染成功`, {
                    hasSvg: true,
                    width: svgWidth,
                    height: svgHeight,
                    viewBox: viewBox,
                    svgChildren: svg.children.length
                  });
                  
                  // 如果 SVG 没有内容，尝试重新渲染
                  if (!viewBox && svg.children.length === 0) {
                    console.warn(`⚠ 图表 ${index + 1} SVG 为空，尝试重新渲染`);
                    // 清空并重新设置内容
                    const originalContent = div.textContent;
                    div.innerHTML = '';
                    div.textContent = originalContent;
                    mermaid.run({ nodes: [div] }).catch(err => {
                      console.error(`重新渲染图表 ${index + 1} 失败:`, err);
                      showMermaidError(div, originalContent, err);
                    });
                  }
                } else {
                  console.warn(`⚠ 图表 ${index + 1} (${diagramType}) 未找到 SVG`);
                  console.warn('div.innerHTML:', div.innerHTML.substring(0, 300));
                  
                  // 尝试单独渲染这个图表
                  const originalContent = div.textContent;
                  div.innerHTML = '';
                  div.textContent = originalContent;
                  
                  setTimeout(() => {
                    mermaid.run({ nodes: [div] })
                      .then(() => {
                        const svg = div.querySelector('svg');
                        if (svg) {
                          console.log(`✓ 图表 ${index + 1} 单独渲染成功`);
                        } else {
                          console.error(`✗ 图表 ${index + 1} 单独渲染仍然失败`);
                          showMermaidError(div, originalContent, new Error('SVG 未生成'));
                        }
                      })
                      .catch(err => {
                        console.error(`✗ 图表 ${index + 1} 单独渲染失败:`, err);
                        showMermaidError(div, originalContent, err);
                      });
                  }, 100 * (index + 1));
                }
              });
            })
            .catch(err => {
              console.error('Mermaid.run() 批量渲染失败:', err);
              // 如果批量渲染失败，尝试逐个渲染
              mermaidElements.forEach((div, index) => {
                setTimeout(() => {
                  const content = div.textContent.trim();
                  mermaid.run({ nodes: [div] })
                    .then(() => {
                      const svg = div.querySelector('svg');
                      if (svg) {
                        // 渲染成功
                      } else {
                        showMermaidError(div, content, new Error('SVG 未生成'));
                      }
                    })
                    .catch(renderErr => {
                      console.error(`图表 ${index + 1} 渲染失败:`, renderErr);
                      showMermaidError(div, content, renderErr);
                    });
                }, index * 200);
              });
            });
        } else {
          // 旧版本兼容
          console.warn('Mermaid.run() 不可用，可能需要更新 Mermaid 版本');
          mermaidElements.forEach(div => {
            showMermaidError(div, div.textContent, new Error('Mermaid.run() 不可用'));
          });
        }
      }, 300);
    }

    return mermaidElements.length;
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
          
          // 重新渲染所有 Mermaid 图表（使用官方方法）
          const mermaidElements = document.querySelectorAll('.mermaid');
          if (mermaidElements.length > 0 && typeof mermaid !== 'undefined' && typeof mermaid.run === 'function') {
            mermaid.run().catch(err => {
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
