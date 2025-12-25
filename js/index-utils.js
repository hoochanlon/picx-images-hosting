// 工具函数
function applyTransform() {
  lbImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotation}deg)`;
}

function resetTransform() {
  scale = 1;
  rotation = 0;
  translateX = 0;
  translateY = 0;
  applyTransform();
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle('error', isError);
}

function shouldSkip(path) {
  // 检查是否在排除列表中
  if (EXCLUDES.some((ex) => path.startsWith(ex))) {
    return true;
  }
  
  // 检查是否在允许的目录列表中
  const includedDirs = config.INCLUDED_DIRS || [];
  if (includedDirs.length > 0) {
    // 如果配置了允许的目录，只显示这些目录下的图片
    const isIncluded = includedDirs.some(dir => {
      // 检查路径是否以目录开头（支持根目录文件）
      if (dir === '') {
        // 空字符串表示根目录，检查是否在根目录（不包含斜杠）
        return !path.includes('/');
      }
      return path.startsWith(dir + '/') || path === dir;
    });
    if (!isIncluded) {
      return true;
    }
  }
  
  return false;
}

function getDefaultUploadPath() {
  const saved = localStorage.getItem('defaultUploadPath');
  return saved || DEFAULT_DIR;
}

function saveDefaultUploadPath(path) {
  if (path && path.trim()) {
    let normalizedPath = path.trim();
    if (!normalizedPath.endsWith('/')) normalizedPath += '/';
    localStorage.setItem('defaultUploadPath', normalizedPath);
    return normalizedPath;
  }
  return null;
}

function buildTargetPath(folderInput, fileName) {
  let base = (folderInput || '').trim();
  if (!base) base = getDefaultUploadPath();
  if (!base.endsWith('/')) base += '/';
  return `${base}${fileName}`;
}

async function toBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

