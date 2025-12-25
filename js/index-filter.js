// 过滤功能
function applyFilter() {
  const keyword = filterInput.value.trim().toLowerCase();
  const folder = folderSelect.value;
  if (!keyword) {
    const base = folder === 'ALL' ? images : images.filter((img) => img.dir === folder);
    render(base, true);
    return;
  }
  const filtered = images
    .filter((img) => img.path.toLowerCase().includes(keyword))
    .filter((img) => (folder === 'ALL' ? true : img.dir === folder));
  render(filtered, true);
}

