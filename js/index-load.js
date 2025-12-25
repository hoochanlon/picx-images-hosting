// 图片加载
async function loadImages(showLoading = true) {
  try {
    if (showLoading) setStatus('正在加载仓库树...');
    const tree = await fetchTree();
    images = (tree.tree || [])
      .filter((item) => item.type === 'blob' && IMAGE_EXT.test(item.path))
      .filter((item) => !shouldSkip(item.path))
      .map((item) => ({
        path: item.path,
        name: item.path.split('/').pop(),
        dir: item.path.includes('/') ? item.path.slice(0, item.path.lastIndexOf('/')) : '',
      }));

    images.sort((a, b) => a.path.localeCompare(b.path));
    images.forEach((item, idx) => {
      item.idx = idx;
    });
    buildFolders();
    
    // 应用当前的过滤条件，而不是直接渲染所有图片
    applyFilter();
  } catch (err) {
    console.error(err);
    setStatus(err.message, true);
  }
}

