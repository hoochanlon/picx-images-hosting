// tutorial-animations.js - 页面动画效果控制

(function() {
  'use strict';

  /**
   * 初始化页面动画
   */
  function initAnimations() {
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupAnimations);
    } else {
      setupAnimations();
    }
  }

  /**
   * 设置动画
   */
  function setupAnimations() {
    // 为内容区域添加进入动画
    observeContentAnimations();
    
    // 为目录项添加滚动动画
    observeTOCAnimations();
    
    // 为代码块添加复制动画
    setupCodeBlockAnimations();
    
    // 为图片添加懒加载动画
    setupImageAnimations();
  }

  /**
   * 观察内容区域，添加进入动画
   */
  function observeContentAnimations() {
    const contentElements = document.querySelectorAll('.tutorial-step-content, .tutorial-content');
    
    if (!window.IntersectionObserver) {
      // 如果不支持 IntersectionObserver，直接添加动画类
      contentElements.forEach(el => {
        el.classList.add('tutorial-animated');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('tutorial-animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    contentElements.forEach(el => {
      observer.observe(el);
    });
  }

  /**
   * 观察目录项，添加滚动动画
   */
  function observeTOCAnimations() {
    const tocNav = document.getElementById('tutorial-toc-nav');
    if (!tocNav) return;
    
    // 使用 MutationObserver 监听目录更新
    if (!window.tocMutationObserver) {
      window.tocMutationObserver = new MutationObserver(() => {
        applyTOCAnimations();
      });
      
      window.tocMutationObserver.observe(tocNav, {
        childList: true,
        subtree: true
      });
    }
    
    // 立即应用动画
    applyTOCAnimations();
  }

  /**
   * 应用目录动画
   */
  function applyTOCAnimations() {
    const tocLinks = document.querySelectorAll('.tutorial-toc-nav a');
    
    tocLinks.forEach((link, index) => {
      // 移除之前的动画类，重新添加以触发动画
      link.classList.remove('tutorial-toc-item');
      
      // 使用 requestAnimationFrame 确保 DOM 更新后再添加动画
      requestAnimationFrame(() => {
        link.style.animationDelay = `${index * 0.05}s`;
        link.classList.add('tutorial-toc-item');
      });
    });
  }

  /**
   * 设置代码块动画
   */
  function setupCodeBlockAnimations() {
    const codeBlocks = document.querySelectorAll('.tutorial-step-content pre, .tutorial-content pre');
    
    codeBlocks.forEach((block, index) => {
      block.style.animationDelay = `${0.4 + index * 0.1}s`;
    });
  }

  /**
   * 设置图片懒加载动画
   */
  function setupImageAnimations() {
    const images = document.querySelectorAll('.tutorial-step-content img, .tutorial-content img');
    
    if (!window.IntersectionObserver) {
      images.forEach(img => {
        img.classList.add('tutorial-image-loaded');
      });
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('tutorial-image-loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      threshold: 0.1
    });

    images.forEach(img => {
      if (img.complete) {
        img.classList.add('tutorial-image-loaded');
      } else {
        img.addEventListener('load', () => {
          img.classList.add('tutorial-image-loaded');
        });
      }
      imageObserver.observe(img);
    });
  }

  /**
   * 步骤切换动画
   */
  function animateStepTransition(oldStep, newStep, callback) {
    if (!oldStep || !newStep) {
      if (callback) callback();
      return;
    }

    // 旧步骤淡出
    oldStep.classList.add('leaving');
    
    setTimeout(() => {
      oldStep.style.display = 'none';
      
      // 新步骤淡入
      newStep.style.display = 'block';
      newStep.classList.add('entering');
      
      // 触发重排，确保动画生效
      void newStep.offsetHeight;
      
      setTimeout(() => {
        newStep.classList.remove('entering');
        oldStep.classList.remove('leaving');
        if (callback) callback();
      }, 400);
    }, 300);
  }

  /**
   * 平滑滚动到元素
   */
  function smoothScrollTo(element, offset = 120) {
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * 添加点击波纹效果
   */
  function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(102, 126, 234, 0.3);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  /**
   * 为按钮添加波纹效果
   */
  function setupRippleEffects() {
    const buttons = document.querySelectorAll(
      '.tutorial-sidebar-nav-item, .tutorial-step, .tutorial-toc-nav a, .icon-label'
    );

    buttons.forEach(button => {
      addRippleEffect(button);
    });
  }

  /**
   * 添加图片加载动画样式
   */
  function addImageAnimationStyles() {
    if (document.getElementById('tutorial-image-animations')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'tutorial-image-animations';
    style.textContent = `
      .tutorial-step-content img,
      .tutorial-content img {
        opacity: 0;
        transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        transform: scale(0.98);
      }

      .tutorial-step-content img.tutorial-image-loaded,
      .tutorial-content img.tutorial-image-loaded {
        opacity: 1;
        transform: scale(1);
      }

      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * 监听步骤切换，添加动画
   */
  function watchStepChanges() {
    const state = window.tutorialState;
    if (!state) return;

    let previousStep = null;

    // 监听步骤变化
    const stepContents = state.stepContents();
    if (stepContents && stepContents.length > 0) {
      stepContents.forEach((content, index) => {
        if (index === state.currentStep()) {
          previousStep = content;
        }
      });
    }

    // 重写 updateStep 函数以添加动画
    const originalUpdateStep = window.updateStep;
    if (originalUpdateStep) {
      window.updateStep = function(stepIndex) {
        const stepContents = state.stepContents();
        const oldStep = previousStep;
        const newStep = stepContents[stepIndex];

        if (oldStep && newStep && oldStep !== newStep) {
          animateStepTransition(oldStep, newStep, () => {
            originalUpdateStep.call(this, stepIndex);
            previousStep = newStep;
          });
        } else {
          originalUpdateStep.call(this, stepIndex);
          previousStep = newStep;
        }
      };
    }
  }

  // 初始化
  initAnimations();
  
  // 延迟执行一些需要 DOM 完全加载的功能
  setTimeout(() => {
    setupRippleEffects();
    addImageAnimationStyles();
    watchStepChanges();
  }, 100);

  // 导出到全局作用域
  window.tutorialAnimations = {
    animateStepTransition: animateStepTransition,
    smoothScrollTo: smoothScrollTo,
    addRippleEffect: addRippleEffect,
    applyTOCAnimations: applyTOCAnimations
  };

})();

