# 快速开始

## 1. 克隆仓库

```bash
git clone --filter=blob:none --no-checkout https://github.com/hoochanlon/picx-images-hosting.git
cd picx-images-hosting
git sparse-checkout set --no-cone '/*' '!/imgs/*'
git checkout master
```

## 2. 配置基础文件

### config.js

修改以下配置：

- `VERCEL_API_BASE`：你的 Vercel 部署地址
- `GITHUB_OAUTH_CLIENT_ID`：GitHub OAuth Client ID（如果使用 OAuth）
- `PASSWORD`：操作密码（如果使用密码认证）

### api-config.json

添加允许访问 API 的域名：

```json
{
  "allowedOrigins": [
    "https://your-domain.com",
    "https://your-name.github.io",
    "https://your-vercel-app.vercel.app"
  ]
}
```

## 3. 配置 Vercel 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|:----:|
| `GH_TOKEN` | GitHub Personal Access Token（需要 repo 权限） | ✅ |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth Client ID | ⚠️ 推荐 |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth Client Secret | ⚠️ 推荐 |
| `PASSWORD` | 操作密码（备用认证） | ⚠️ 二选一 |
| `TINYJPG_API_KEY` | TinyJPG/TinyPNG API Key（图片压缩功能） | ⚪ 可选 |

> [!important]
> 环境变量配置后**必须重新部署**才能生效！

## 4. GitHub OAuth 配置（推荐）

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. 填写信息：
   - **Application name**：`picx-images-hosting`
   - **Homepage URL**：`https://your-vercel-app.vercel.app`
   - **Authorization callback URL**：`https://your-vercel-app.vercel.app/api/github-oauth?action=callback`
3. 记录 **Client ID** 和 **Client Secret**（Secret 只显示一次）
4. 将 Client ID 填入 `config.js`，将 Client ID 和 Secret 填入 Vercel 环境变量

## 4. 配置图片压缩（可选）

项目支持使用 TinyJPG/TinyPNG API 自动压缩上传的图片，减小文件大小。

### 获取 API Key

1. 访问 [TinyPNG Developer API](https://tinypng.com/developers)
2. 输入邮箱地址获取 API Key
3. 将 API Key 添加到 Vercel 环境变量 `TINYJPG_API_KEY`

### 功能说明

- **支持的格式**：JPEG、PNG、WebP、AVIF
- **压缩方式**：通过服务器端 API 代理，保护 API Key 安全
- **使用方式**：在上传页面或快速上传弹窗中启用"图片压缩"开关
- **降级处理**：如果压缩失败，自动使用原文件上传，不影响上传流程

> [!note]
> 图片压缩功能需要配置 `TINYJPG_API_KEY` 环境变量。未配置时，压缩开关会被禁用或跳过压缩步骤。

## 验证配置

- [ ] `config.js` 已配置（至少修改了 `VERCEL_API_BASE`）
- [ ] `api-config.json` 已配置（添加了允许的域名）
- [ ] Vercel 环境变量已配置（至少包含 `GH_TOKEN`）
- [ ] 已选择认证方式（密码或 GitHub OAuth）
- [ ] （可选）已配置 `TINYJPG_API_KEY` 启用图片压缩功能
- [ ] 项目已重新部署

## 测试步骤

1. **访问部署地址**：页面应能正常加载
2. **测试认证**：点击右上角锁图标，输入密码或使用 GitHub 授权
3. **测试上传**：认证成功后尝试上传图片

