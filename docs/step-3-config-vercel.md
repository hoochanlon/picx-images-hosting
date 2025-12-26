---
title: 配置 Vercel 环境变量
---

# ③ 第三步：配置 Vercel 环境变量

将 GitHub Token 配置到 Vercel，使 API 能够访问仓库。

## 操作步骤：

1. 登录 [Vercel](https://vercel.com)，使用 GitHub 账号登录
2. 点击 **"Add New..."** → **"Project"**
3. 导入你的 GitHub 仓库
4. 进入项目 → **"Settings"** → **"Environment Variables"**
5. 添加环境变量：

   | 变量名 | 值 | 说明 | 必需 |
   |--------|-----|------|------|
   | `GH_TOKEN` | 你的 GitHub Token | GitHub Personal Access Token，需要 `repo` 权限 | ✅ 必需 |
   | `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth Client ID | GitHub OAuth App 的 Client ID（推荐使用） | ⚠️ 推荐 |
   | `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth Client Secret | GitHub OAuth App 的 Client Secret（推荐使用） | ⚠️ 推荐 |
   | `API_SECRET` | 强密码（至少32字符） | API 密钥，用于后端验证写操作（备用方案） | 可选 |
   | `ALLOWED_ORIGINS` | 允许的域名（逗号分隔） | CORS 配置，如果不设置则从 `api-config.json` 读取 | 可选 |

   :::tip GitHub OAuth vs 密码认证
   - **GitHub OAuth**（推荐）：更安全、更专业，使用 GitHub 官方 OAuth
   - **密码认证**（备用）：简单但不安全，密码会暴露在代码中
   
   详细配置指南请查看：[GitHub OAuth 配置指南](./github-oauth-setup.md)
   :::

   :::warning 安全提示
   - **推荐使用 GitHub OAuth**：更安全，密码不会暴露
   - 如果使用密码认证：`API_SECRET` 用于保护写操作，强烈建议设置
   - 生成强密码：可以使用在线工具或运行命令：
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - 密码长度建议至少 32 个字符
   :::

6. 选择环境：**Production**、**Preview**、**Development**（建议全选）
7. 点击 **"Save"** 保存
8. 进入 **"Deployments"** 标签，点击 **"Redeploy"** 重新部署

:::tip
如果修改了环境变量，必须重新部署项目才能生效。可以在 Vercel 控制台点击 **"Redeploy"**。
:::

:::note
`ALLOWED_ORIGINS` 用于配置 CORS，如果只在本域名使用可以留空。多个域名用逗号分隔，如：`https://example.com,https://www.example.com`
:::

## 前端安全配置

除了 Vercel 环境变量，还需要配置前端密码：

1. 打开项目根目录的 `config.js` 文件
2. 找到 `PASSWORD` 配置项
3. 将默认值 `'admin123'` 修改为你的强密码
4. 保存文件并提交到仓库

:::important
- 此密码用于所有写操作（上传、删除、重命名、创建文件夹）的前端验证
- 授权后 24 小时内无需重复输入
- 请务必修改默认密码，否则任何人都可以操作你的仓库
:::

**完整安全配置流程：**

**方案 A：GitHub OAuth（推荐）**
1. ✅ 在 GitHub 创建 OAuth App（获取 Client ID 和 Client Secret）
2. ✅ 在 Vercel 设置 `GH_TOKEN`（必需）
3. ✅ 在 Vercel 设置 `GITHUB_OAUTH_CLIENT_ID` 和 `GITHUB_OAUTH_CLIENT_SECRET`（推荐）
4. ✅ 在 `config.js` 设置 `GITHUB_OAUTH_CLIENT_ID`
5. ✅ 重新部署项目

**方案 B：密码认证（备用）**
1. ✅ 在 Vercel 设置 `GH_TOKEN`（必需）
2. ✅ 在 Vercel 设置 `API_SECRET`（强烈推荐）
3. ✅ 在 `config.js` 修改 `PASSWORD`（必需）
4. ✅ 重新部署项目

详细配置指南请查看：[GitHub OAuth 配置指南](./github-oauth-setup.md)
