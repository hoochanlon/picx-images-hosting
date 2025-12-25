// upload-modal.js - 模态框管理

// 显示模态框
function showModal(modalId) {
  const modal = document.getElementById(`${modalId}-modal`);
  if (modal) {
    modal.classList.add('show');
  }
}

// 关闭模态框
function closeModal(modalId) {
  const modal = document.getElementById(`${modalId}-modal`);
  if (modal) {
    modal.classList.remove('show');
  }
}

// 导出到全局作用域
window.showModal = showModal;
window.closeModal = closeModal;

