// 文件夹构建
function buildFolders() {
  const map = new Map();
  images.forEach((img) => {
    map.set(img.dir, (map.get(img.dir) || 0) + 1);
  });
  folders = Array.from(map.entries())
    .map(([dir, count]) => ({ dir, count }))
    .sort((a, b) => a.dir.localeCompare(b.dir));

  folderSelect.innerHTML = '<option value="ALL">全部目录</option>';
  customSelectOptions.innerHTML = '<div class="custom-select-option selected" data-value="ALL">全部目录</div>';
  
  folders.forEach((f) => {
    const opt = document.createElement('option');
    opt.value = f.dir;
    opt.textContent = f.dir ? `${f.dir} (${f.count})` : `(根目录) (${f.count})`;
    folderSelect.appendChild(opt);
    
    const customOpt = document.createElement('div');
    customOpt.className = 'custom-select-option';
    customOpt.dataset.value = f.dir;
    customOpt.textContent = f.dir ? `${f.dir} (${f.count})` : `(根目录) (${f.count})`;
    customSelectOptions.appendChild(customOpt);
  });
}

