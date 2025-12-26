# 认证配置

## GitHub OAuth（推荐）

### 优势

- ✅ 更安全：使用 GitHub 官方 OAuth
- ✅ 无需密码：用户使用 GitHub 账号授权
- ✅ 权限可控：可控制仓库访问权限

### 配置步骤

1. **创建 OAuth App**
   - GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
   - **Application name**：`picx-images-hosting`
   - **Homepage URL**：`https://your-vercel-app.vercel.app`
   - **Authorization callback URL**：`https://your-vercel-app.vercel.app/api/github-oauth?action=callback`

2. **配置环境变量**
   - Vercel：`GITHUB_OAUTH_CLIENT_ID`、`GITHUB_OAUTH_CLIENT_SECRET`
   - `config.js`：`GITHUB_OAUTH_CLIENT_ID`

3. **重新部署**

## 密码认证（备用）

### 配置方式

**方式 1：Vercel 环境变量（推荐）**

- 变量名：`PASSWORD`
- 值：强密码（至少 32 字符）
- 优先级：最高

**方式 2：config.js（不推荐）**

```javascript
PASSWORD: 'your-strong-password'
```

> [!warning]
> 密码会暴露在代码中，仅作为备用方案。

### 安全建议

- 使用强密码（至少 32 字符）
- 优先使用 Vercel 环境变量
- 推荐使用 GitHub OAuth

## 认证优先级

1. GitHub OAuth（如果配置了 `GITHUB_OAUTH_CLIENT_ID`）
2. Vercel 环境变量 `PASSWORD`
3. `config.js` 中的 `PASSWORD`

