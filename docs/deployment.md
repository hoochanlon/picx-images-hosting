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

## 验证部署

- [ ] 页面能正常加载
- [ ] 认证功能正常
- [ ] 上传功能正常
- [ ] API 请求正常

