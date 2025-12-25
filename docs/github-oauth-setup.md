# GitHub OAuth 认证配置指南

## 概述

GitHub OAuth 认证提供了更安全、更专业的身份验证方式，使用 GitHub 官方的 OAuth 流程，只有授权用户才能进行写操作。

## 优势

- ✅ **更安全**：使用 GitHub 官方 OAuth，密码不会暴露在代码中
- ✅ **更专业**：类似 GitHub 的授权体验
- ✅ **权限控制**：可以精确控制哪些用户有权限
- ✅ **长期有效**：授权后长期有效，无需频繁输入密码
- ✅ **用户信息**：可以显示授权用户的 GitHub 信息

## 配置步骤

### 步骤 1：创建 GitHub OAuth App

1. 登录 GitHub，进入 **Settings** → **Developer settings** → **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写以下信息：

   | 字段 | 值 | 说明 |
   |------|-----|------|
   | **Application name** | picx-images-hosting | 应用名称（可自定义） |
   | **Homepage URL** | `https://your-vercel-app.vercel.app` | 你的 Vercel 部署地址 |
   | **Authorization callback URL** | `https://your-vercel-app.vercel.app/api/github-oauth?action=callback` | 回调地址（重要！） |

4. 点击 **Register application**
5. 记录生成的 **Client ID**
6. 点击 **Generate a new client secret**，记录 **Client secret**（只显示一次，请妥善保存）

:::warning 重要
- **Client secret** 只显示一次，请立即保存
- 如果丢失，需要重新生成
- 回调 URL 必须完全匹配，包括协议（https）和路径
:::

### 步骤 2：配置 Vercel 环境变量

1. 进入 Vercel 项目 → **Settings** → **Environment Variables**
2. 添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `GITHUB_OAUTH_CLIENT_ID` | 你的 Client ID | 从步骤 1 获取 |
   | `GITHUB_OAUTH_CLIENT_SECRET` | 你的 Client secret | 从步骤 1 获取 |
   | `GITHUB_OAUTH_REDIRECT_URI` | `https://your-vercel-app.vercel.app/api/github-oauth?action=callback` | 回调地址（可选，默认自动生成） |
   | `GITHUB_REPO_OWNER` | 你的 GitHub 用户名 | 仓库所有者（可选，默认从代码读取） |
   | `GITHUB_REPO_NAME` | 你的仓库名 | 仓库名称（可选，默认从代码读取） |

3. 选择环境：**Production**、**Preview**、**Development**（建议全选）
4. 点击 **Save** 保存

### 步骤 3：配置前端

1. 打开项目根目录的 `config.js` 文件
2. 找到 `GITHUB_OAUTH_CLIENT_ID` 配置项
3. 填入你的 GitHub OAuth App 的 Client ID：

```javascript
GITHUB_OAUTH_CLIENT_ID: 'your_client_id_here'
```

:::tip
如果设置了 `GITHUB_OAUTH_CLIENT_ID`，系统会自动使用 GitHub OAuth 认证。
如果未设置，会回退到密码认证（`DELETE_PASSWORD`）。
:::

### 步骤 4：重新部署

1. 进入 Vercel 项目 → **Deployments**
2. 点击 **Redeploy** 重新部署项目
3. 等待部署完成

## 使用流程

### 首次授权

1. 用户点击上传/删除等写操作
2. 弹出 GitHub 授权对话框
3. 点击 **使用 GitHub 授权** 按钮
4. 跳转到 GitHub 授权页面
5. 用户确认授权
6. GitHub 回调并返回授权码
7. 后端用授权码换取 access token
8. 前端保存 token，授权完成

### 后续操作

- 授权后，token 会保存在浏览器 localStorage 中
- 24 小时内无需重复授权
- 如果 token 过期或无效，会自动重新授权

## 权限说明

GitHub OAuth App 需要以下权限：

- **repo**：访问仓库的完整权限（包括读写）

:::note
用户授权时，GitHub 会显示需要哪些权限，用户可以选择是否授权。
只有授权了相应权限的用户才能进行操作。
:::

## 安全特性

### 1. CSRF 保护
- 使用 `state` 参数防止 CSRF 攻击
- 每次授权请求都会生成唯一的 state

### 2. Token 验证
- 后端会验证 GitHub token 是否有效
- 检查用户是否有仓库访问权限
- 只有授权用户才能进行操作

### 3. 权限控制
- 可以精确控制哪些 GitHub 用户有权限
- 通过 GitHub 仓库的协作者设置管理权限

## 回退机制

如果未配置 GitHub OAuth，系统会自动回退到密码认证：

1. 检查 `config.js` 中是否设置了 `GITHUB_OAUTH_CLIENT_ID`
2. 如果未设置，使用 `DELETE_PASSWORD` 进行密码认证
3. 如果已设置，使用 GitHub OAuth 认证

## 故障排查

### 问题 1：授权后提示"没有访问权限"

**原因**：用户没有仓库的访问权限

**解决**：
1. 在 GitHub 仓库设置中添加用户为协作者
2. 或者确保用户是仓库的所有者/组织成员

### 问题 2：授权窗口无法打开

**原因**：浏览器阻止了弹窗

**解决**：
1. 允许网站弹窗
2. 检查浏览器设置

### 问题 3：回调失败

**原因**：回调 URL 配置不正确

**解决**：
1. 检查 GitHub OAuth App 中的回调 URL
2. 确保与 Vercel 环境变量中的 `GITHUB_OAUTH_REDIRECT_URI` 一致
3. 确保使用 HTTPS（生产环境）

### 问题 4：Token 验证失败

**原因**：Token 已过期或无效

**解决**：
1. 清除浏览器 localStorage
2. 重新授权

## 与密码认证的对比

| 特性 | GitHub OAuth | 密码认证 |
|------|-------------|---------|
| 安全性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 用户体验 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 配置复杂度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 权限控制 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 密码暴露 | ❌ 不暴露 | ⚠️ 暴露在代码中 |

## 推荐配置

对于生产环境，强烈推荐使用 GitHub OAuth：

1. ✅ 更安全，密码不暴露
2. ✅ 更好的用户体验
3. ✅ 精确的权限控制
4. ✅ 符合最佳实践

## 相关文档

- [安全配置指南](./security-config.md)
- [Vercel 环境变量配置](./step-3-config-vercel.md)
- [GitHub OAuth Apps 文档](https://docs.github.com/en/apps/oauth-apps)

