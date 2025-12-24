// 配置文件示例
// 复制此文件为 config.js 并修改相应的值

window.APP_CONFIG = {
  // Vercel API 基础地址
  // 修改为你的 Vercel 项目地址
  VERCEL_API_BASE: 'https://your-project.vercel.app',
  
  // 自定义域名列表（需要使用 Vercel API 的域名）
  // 添加你的自定义域名
  CUSTOM_DOMAINS: [
    'blog.hoochanlon.moe',
    // 'your-custom-domain.com'
  ],
  
  // GitHub Pages 域名模式（匹配所有 github.io 域名）
  // 通常不需要修改
  GITHUB_PAGES_PATTERN: /\.github\.io$/
};

