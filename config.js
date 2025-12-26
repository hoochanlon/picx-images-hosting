// 配置文件
// 可以根据不同环境修改这些值
// 注意：CORS 允许的域名在 api-config.json 中配置
window.APP_CONFIG = {
  // Vercel API 基础地址
  VERCEL_API_BASE: 'https://picx-images-hosting-brown.vercel.app',
  CUSTOM_DOMAINS: [
    'blog.hoochanlon.moe'
  ],
  GITHUB_PAGES_PATTERN: /\.github\.io$/,
  DEFAULT_UPLOAD_DIR: 'imgs/uploads/kate/',
  INCLUDED_DIRS: ['imgs'],
  GITHUB_REPO_URL: 'https://github.com/hoochanlon/picx-images-hosting',
  GITHUB_OAUTH_CLIENT_ID: 'Ov23liA5DyCFqvR93Rae',
  PASSWORD: 'admin123',
  // 默认启用图片压缩
  ENABLE_IMAGE_COMPRESSION: true,
  // 默认启用自动重命名
  ENABLE_TIMESTAMP_RENAME: false,
};

