# 部署指南

## Vercel 部署

### 必需环境变量

| 变量名 | 说明 | 必需 |
|--------|------|:----:|
| `GH_TOKEN` | GitHub Personal Access Token（需要 repo 权限） | ✅ |

### 推荐环境变量

| 变量名 | 说明 |
|--------|------|
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth Client ID |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth Client Secret |
| `PASSWORD` | 操作密码（备用认证） |
| `TINYJPG_API_KEY` | TinyJPG/TinyPNG API Key（图片压缩功能） |

### 获取 GitHub Token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. 勾选 `repo` 权限
4. 复制 Token（只显示一次）

### 配置步骤

1. 登录 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. **Settings** → **Environment Variables** → 添加变量
4. 选择环境：**Production**、**Preview**、**Development**
5. **Deployments** → **Redeploy**

> [!important]
> 修改环境变量后**必须重新部署**才能生效！

## CORS 配置

### api-config.json

```json
{
  "allowedOrigins": [
    "https://your-domain.com",
    "https://your-vercel-app.vercel.app"
  ]
}
```

### 环境变量（可选）

变量名：`ALLOWED_ORIGINS`

值：逗号分隔的域名列表

```
https://example.com,https://www.example.com
```

## 图片压缩功能配置（可选）

### 获取 TinyJPG API Key

1. 访问 [TinyPNG Developer API](https://tinypng.com/developers)
2. 输入邮箱地址获取 API Key
3. 在 Vercel 环境变量中添加 `TINYJPG_API_KEY`

### 功能特性

- **自动压缩**：上传时自动压缩图片，减小文件大小
- **安全代理**：通过服务器端 API 代理，API Key 不会暴露在前端
- **格式支持**：JPEG、PNG、WebP、AVIF
- **降级处理**：压缩失败时自动使用原文件，不影响上传

### 使用方式

1. 配置 `TINYJPG_API_KEY` 环境变量
2. 重新部署项目
3. 在上传页面或快速上传弹窗中启用"图片压缩"开关

## 验证部署

- [ ] 页面能正常加载
- [ ] 认证功能正常
- [ ] 上传功能正常
- [ ] API 请求正常
- [ ] （可选）图片压缩功能正常

