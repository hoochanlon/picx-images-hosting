// DOM 元素引用（延迟初始化）
let statusEl, gridEl, filterInput, folderSelect, customSelect, customSelectTrigger, 
    customSelectValue, customSelectOptions, infoBtn, toggleControlsBtn, cardTpl,
    lightboxEl, lbImg, infoPanel, infoContent, fullscreenBtn, zoomResetBtn, rotateBtn,
    openUploadBtn, uploadModal, uploadFileInput, uploadPathInput, uploadBtn, uploadFileList,
    defaultUploadPathInput, defaultPathDisplay, saveDefaultPathBtn, reloadBtn;

// 初始化 DOM 元素引用
function initElements() {
  statusEl = document.getElementById('status');
  gridEl = document.getElementById('grid');
  filterInput = document.getElementById('filter');
  folderSelect = document.getElementById('folder');
  customSelect = document.getElementById('folder-select');
  customSelectTrigger = customSelect?.querySelector('.custom-select-trigger');
  customSelectValue = customSelect?.querySelector('.custom-select-value');
  customSelectOptions = document.getElementById('folder-options');
  infoBtn = document.getElementById('info-btn');
  toggleControlsBtn = document.getElementById('toggle-controls');
  cardTpl = document.getElementById('card-template');
  lightboxEl = document.getElementById('lightbox');
  lbImg = document.getElementById('lightbox-img');
  infoPanel = document.getElementById('lightbox-info');
  infoContent = document.getElementById('lightbox-info-content');
  fullscreenBtn = document.getElementById('fullscreen-toggle');
  zoomResetBtn = document.getElementById('zoom-reset');
  rotateBtn = document.getElementById('rotate');
  openUploadBtn = document.getElementById('open-upload');
  uploadModal = document.getElementById('upload-modal');
  uploadFileInput = document.getElementById('upload-file');
  uploadPathInput = document.getElementById('upload-path');
  uploadBtn = document.getElementById('upload-btn');
  uploadFileList = document.getElementById('upload-file-list');
  defaultUploadPathInput = document.getElementById('default-upload-path');
  defaultPathDisplay = document.getElementById('default-path-display');
  saveDefaultPathBtn = document.getElementById('save-default-path');
  reloadBtn = document.getElementById('reload-btn');
}

