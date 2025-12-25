// 配置文件
// 可以根据不同环境修改这些值
// 注意：CORS 允许的域名在 api-config.json 中配置

window.APP_CONFIG = {
  // Vercel API 基础地址
  VERCEL_API_BASE: 'https://picx-images-hosting-brown.vercel.app',
  
  // 自定义域名列表（需要使用 Vercel API 的域名）
  // 这些域名也应该添加到 api-config.json 的 allowedOrigins 中
  CUSTOM_DOMAINS: [
    'blog.hoochanlon.moe'
  ],
  
  // GitHub Pages 域名模式（匹配所有 github.io 域名）
  GITHUB_PAGES_PATTERN: /\.github\.io$/,
  
  // 默认上传目录（如果用户没有设置，将使用此路径）
  DEFAULT_UPLOAD_DIR: 'imgs/uploads/kate/',
  
  // 允许的图片目录列表（只显示这些目录下的图片，为空数组则显示所有目录）
  // 例如：['imgs'] 只显示 imgs 目录下的图片
  // 例如：['imgs', 'example'] 显示 imgs 和 example 目录下的图片
  // 例如：[] 显示所有目录下的图片（默认）
  INCLUDED_DIRS: ['imgs'],
  
  // GitHub 仓库地址（用于导航栏的 GitHub 按钮）
  GITHUB_REPO_URL: 'https://github.com/hoochanlon/picx-images-hosting'
};

