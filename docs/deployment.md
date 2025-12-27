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

权限如图配置

![](https://cdn.jsdelivr.net/gh/hoochanlon/picx-images-hosting@master/example/PixPin_2025-12-27_07-26-25.png)

### 配置步骤

1. 登录 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. **Settings** → **Environment Variables** → 添加变量
4. 选择环境：**Production**、**Preview**、**Development**
5. **Deployments** → **Redeploy**

> [!important]
> 修改环境变量后**必须重新部署**才能生效！

![](https://cdn.jsdelivr.net/gh/hoochanlon/picx-images-hosting@master/example/PixPin_2025-12-27_23-08-54.png)

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

## API 健康状态监控

项目提供了 API 健康状态监控功能，帮助您实时了解各个 API 端点的运行状态。

### 访问健康状态页面

部署后，访问 `/status.html` 查看详细的健康状态信息：

```
https://your-vercel-app.vercel.app/status.html
```

### 功能特性

- **实时监控**: 自动每 30 秒刷新一次状态
- **详细检查**: 显示 GitHub API、仓库树 API、环境配置等各项检查结果
- **响应时间**: 显示每个 API 端点的响应时间
- **状态指示**: 首页导航栏显示状态图标，快速了解系统健康状态

### 状态说明

| 状态 | 说明 | 图标颜色 |
|------|------|---------|
| 正常 (Healthy) | 所有 API 端点正常工作 | 绿色 ✓ |
| 降级 (Degraded) | 部分 API 端点异常，但核心功能可用 | 橙色 ⚠️ |
| 异常 (Unhealthy) | API 端点无法正常工作 | 红色 ✗ |
| 未知 (Unknown) | 无法获取状态信息 | 灰色 ? |

### 健康检查项

1. **GitHub API 连接**: 检查与 GitHub API 的连接状态
2. **仓库树 API**: 检查获取仓库文件树的能力
3. **环境配置**: 检查必需的环境变量（如 `GH_TOKEN`）是否配置

## 验证部署

- [ ] 页面能正常加载
- [ ] 认证功能正常
- [ ] 上传功能正常
- [ ] API 请求正常
- [ ] （可选）图片压缩功能正常
- [ ] 健康状态页面可访问 (`/status.html`)
- [ ] 健康状态检查正常（所有项显示"正常"）

