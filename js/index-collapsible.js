// 折叠/展开功能
function toggleCollapsible(targetId) {
  const target = document.getElementById(targetId);
  const toggle = document.querySelector(`[data-target="${targetId}"]`);
  if (!target || !toggle) return;
  
  const isCollapsed = target.classList.contains('collapsed');
  if (isCollapsed) {
    target.classList.remove('collapsed');
    toggle.classList.add('active');
    localStorage.setItem(`collapsed_${targetId}`, 'false');
  } else {
    target.classList.add('collapsed');
    toggle.classList.remove('active');
    localStorage.setItem(`collapsed_${targetId}`, 'true');
  }
}

function initCollapsible() {
  document.querySelectorAll('.collapsible').forEach(el => {
    const targetId = el.id;
    const savedState = localStorage.getItem(`collapsed_${targetId}`);
    const toggle = document.querySelector(`[data-target="${targetId}"]`);
    
    // 默认展开，只有明确保存为 'true' 时才收缩
    if (savedState === 'true') {
      el.classList.add('collapsed');
      if (toggle) toggle.classList.remove('active');
    } else {
      // 默认展开状态
      el.classList.remove('collapsed');
      if (toggle) toggle.classList.add('active');
    }
  });
}

