# picx-images-hosting 

## 项目简介

基于 GitHub Pages 托管的 Web 图床管理系统，搭配 [PicX](https://github.com/XPoet/picx) 实现图片上传、管理和 CDN 加速。

> [!important]
> * GitHub 存储限制最多 5G
> * 部署到 GitHub Pages 后才能使用 GitHub Pages 规则的图片链接
> * 国内访问建议使用 [jsdelivr](https://www.jsdelivr.com)、[statically.io](https://statically.io/) 等 CDN 加速

## 快速开始

### 1. 克隆仓库（稀疏检出，排除图片目录）

```bash
git clone --filter=blob:none --no-checkout https://github.com/hoochanlon/picx-images-hosting.git
cd picx-images-hosting
git sparse-checkout set --no-cone '/*' '!/imgs/*'
git checkout master
```

### 2. 配置基础文件

**config.js** - 修改以下关键配置：
- `VERCEL_API_BASE`：你的 Vercel 部署地址
- `GITHUB_OAUTH_CLIENT_ID`：GitHub OAuth Client ID（如果使用 OAuth）
- `PASSWORD`：操作密码（如果使用密码认证）

**api-config.json** - 添加允许访问 API 的域名：
```json
{
  "allowedOrigins": [
    "https://your-domain.com",
    "https://your-name.github.io",
    "https://your-vercel-app.vercel.app"
  ]
}
```

### 3. 配置 Vercel 环境变量

在 Vercel 项目设置中添加：

| 变量名 | 说明 | 必需 |
|--------|------|:----:|
| `GH_TOKEN` | GitHub Personal Access Token（需要 repo 权限） | ✅ |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth Client ID | ⚠️ 推荐 |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth Client Secret | ⚠️ 推荐 |
| `PASSWORD` | 操作密码（备用认证） | ⚠️ 二选一 |

> [!important]
> 环境变量配置后**必须重新部署**才能生效！

### 4. GitHub OAuth 配置（推荐）

如果使用 GitHub OAuth 认证：

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. 填写信息：
   - **Application name**：`picx-images-hosting`
   - **Homepage URL**：`https://your-vercel-app.vercel.app`
   - **Authorization callback URL**：`https://your-vercel-app.vercel.app/api/github-oauth?action=callback`
3. 记录 **Client ID** 和 **Client Secret**（Secret 只显示一次）
4. 将 Client ID 填入 `config.js`，将 Client ID 和 Secret 填入 Vercel 环境变量

## 验证配置

### 快速检查清单

- [ ] `config.js` 已配置（至少修改了 `VERCEL_API_BASE`）
- [ ] `api-config.json` 已配置（添加了允许的域名）
- [ ] Vercel 环境变量已配置（至少包含 `GH_TOKEN`）
- [ ] 已选择认证方式（密码或 GitHub OAuth）
- [ ] 项目已重新部署

### 测试步骤

1. **访问部署地址**：页面应能正常加载
2. **测试认证**：点击右上角锁图标，输入密码或使用 GitHub 授权
3. **测试上传**：认证成功后尝试上传图片

## 常见问题

| 问题 | 解决方法 |
|------|---------|
| 页面无法加载 | 检查 Vercel 部署日志 |
| 认证失败 | 检查环境变量是否正确，是否已重新部署 |
| 上传失败 401 | 重新登录，检查认证状态 |
| 上传失败 403 | 检查 `api-config.json` 中的 `allowedOrigins` |
| OAuth 回调失败 | 检查回调 URL 是否与 GitHub OAuth App 配置一致 |

## 安全提示

- ⚠️ **不要**将敏感信息提交到代码仓库
- ✅ 使用 Vercel 环境变量存储所有敏感信息
- ✅ 推荐使用 GitHub OAuth 认证（更安全）

## 本地开发

### 1. 安装依赖

使用 pnpm 安装 Vercel CLI：

```bash
pnpm add -D vercel
```

或者全局安装：

```bash
pnpm add -g vercel
```

### 2. 配置环境变量

复制 `env.example` 为 `.env.local` 并填写相关配置：

```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：

- `GH_TOKEN`：GitHub Personal Access Token（需要 repo 权限）
- `API_BASE`：你的 Vercel 部署地址（本地开发时可以使用 `http://localhost:3000`）
- `VERCEL_OIDC_TOKEN`：Vercel OIDC Token（可选，用于 Vercel 部署）

### 3. 启动本地开发服务器

使用 Vercel CLI 启动本地开发环境：

```bash
# 如果全局安装了 vercel
vercel dev

# 如果使用项目依赖
pnpm vercel dev
# 或
npx vercel dev
```

首次运行时会提示：
- **Set up and develop**：选择 `Y`
- **Which scope**：选择你的 Vercel 账号
- **Link to existing project**：选择 `Y`（如果已有项目）或 `N`（创建新项目）
- **What's your project's name**：输入项目名称

启动成功后，访问 `http://localhost:3000` 即可看到本地运行的应用。

### 4. 本地开发注意事项

- 本地开发时，`config.js` 中的 `VERCEL_API_BASE` 应设置为 `http://localhost:3000`
- `api-config.json` 中的 `allowedOrigins` 需要包含 `http://localhost:3000`
- GitHub OAuth 回调 URL 需要包含本地地址（开发环境）
- 环境变量优先从 `.env.local` 读取，如果没有则从 Vercel 项目配置读取


