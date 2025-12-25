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
  GITHUB_REPO_URL: 'https://github.com/hoochanlon/picx-images-hosting',
  
  // GitHub OAuth 配置（推荐使用，更安全）
  // 如果设置了 GITHUB_OAUTH_CLIENT_ID，将使用 GitHub OAuth 认证
  // 否则回退到密码认证（DELETE_PASSWORD）
  // 
  // 如何获取 Client ID：
  // 1. 登录 GitHub → Settings → Developer settings → OAuth Apps
  // 2. 点击 "New OAuth App" 创建新的 OAuth App
  // 3. 填写应用信息：
  //    - Application name: picx-images-hosting（可自定义）
  //    - Homepage URL: https://your-vercel-app.vercel.app（你的 Vercel 地址）
  //    - Authorization callback URL: https://your-vercel-app.vercel.app/api/github-oauth?action=callback
  // 4. 点击 "Register application"
  // 5. 复制生成的 "Client ID" 填入下方
  // 
  // 同时需要在 Vercel 环境变量中设置：
  // - GITHUB_OAUTH_CLIENT_ID（与这里相同）
  // - GITHUB_OAUTH_CLIENT_SECRET（从 GitHub OAuth App 获取）
  // 
  // 详细配置指南：docs/github-oauth-setup.md
  GITHUB_OAUTH_CLIENT_ID: '',
  
  // 删除操作密码（备用方案，如果未配置 GitHub OAuth 则使用此密码）
  // ⚠️ 重要：如果使用密码认证，请务必修改为强密码
  // 
  // 配置方式（推荐方式 1）：
  // 1. 在 Vercel 环境变量中设置 DELETE_PASSWORD（推荐，更安全）
  //    - 进入 Vercel 项目 → Settings → Environment Variables
  //    - 添加变量名：DELETE_PASSWORD
  //    - 设置值为你的强密码
  //    - 系统会自动通过 API 验证密码，密码不会暴露在代码中
  // 
  // 2. 直接在此处修改（简单但不安全，密码会暴露在代码中）
  //    - 如果 Vercel 环境变量中未设置 DELETE_PASSWORD，会使用此处的值
  //    - 仅作为备用方案，不推荐用于生产环境
  // 
  // 3. 推荐：使用 GitHub OAuth 认证（最安全）
  //    - 配置 GITHUB_OAUTH_CLIENT_ID 后，系统会优先使用 GitHub OAuth
  //    - 详细配置见上方 GITHUB_OAUTH_CLIENT_ID 的注释
  DELETE_PASSWORD: 'admin123',
  
  // API密钥（可选，用于后端验证）
  // 如果设置了此值，后端API会验证此密钥
  // ⚠️ 重要：必须在 Vercel 环境变量中设置相同的 API_SECRET 值
  // 注意：此值存储在客户端，仅作为额外防护层
  // 配置方式：在 Vercel 项目设置中添加环境变量 API_SECRET
  API_SECRET: ''
};

