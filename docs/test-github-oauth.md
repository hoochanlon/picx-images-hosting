# GitHub OAuth 测试指南

## 前置条件

在开始测试之前，请确保已完成以下配置：

### 1. 创建 GitHub OAuth App

1. 登录 GitHub，进入 **Settings** → **Developer settings** → **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写以下信息：

   | 字段 | 值 | 说明 |
   |------|-----|------|
   | **Application name** | picx-images-hosting | 应用名称（可自定义） |
   | **Homepage URL** | `https://picx-images-hosting-brown.vercel.app` | 你的 Vercel 部署地址 |
   | **Authorization callback URL** | `https://picx-images-hosting-brown.vercel.app/api/github-oauth?action=callback` | 回调地址（重要！） |

4. 点击 **Register application**
5. **记录生成的 Client ID**（例如：`Iv1.8a61f9b3a7aba766`）
6. 点击 **Generate a new client secret**，**记录 Client secret**（只显示一次，请妥善保存）

:::warning 重要
- **Client secret** 只显示一次，请立即保存
- 如果丢失，需要重新生成
- 回调 URL 必须完全匹配，包括协议（https）和路径
:::

### 2. 配置 Vercel 环境变量

1. 进入 Vercel 项目 → **Settings** → **Environment Variables**
2. 添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `GITHUB_OAUTH_CLIENT_ID` | 你的 Client ID | 从步骤 1 获取 |
   | `GITHUB_OAUTH_CLIENT_SECRET` | 你的 Client secret | 从步骤 1 获取 |
   | `GITHUB_OAUTH_REDIRECT_URI` | `https://picx-images-hosting-brown.vercel.app/api/github-oauth?action=callback` | 回调地址（可选，默认自动生成） |

3. 选择环境：**Production**、**Preview**、**Development**（建议全选）
4. 点击 **Save** 保存

### 3. 配置前端 config.js

1. 打开项目根目录的 `config.js` 文件
2. 找到 `GITHUB_OAUTH_CLIENT_ID` 配置项（约第 49 行）
3. 填入你的 GitHub OAuth App 的 Client ID：

```javascript
GITHUB_OAUTH_CLIENT_ID: 'Iv1.8a61f9b3a7aba766',  // 替换为你的实际 Client ID
```

4. 保存文件

### 4. 重新部署

1. 提交代码更改到 GitHub
2. Vercel 会自动重新部署
3. 或者手动进入 Vercel 项目 → **Deployments** → **Redeploy**

## 测试步骤

### 测试 1：检查配置是否正确

1. 打开浏览器开发者工具（F12）
2. 进入 **Console** 标签
3. 刷新页面
4. 检查是否有以下日志：
   - 如果看到 `GitHub OAuth not configured, will use password authentication`，说明配置未生效
   - 如果没有这条日志，说明 GitHub OAuth 已正确配置

### 测试 2：测试登录功能

1. 点击右上角的**锁图标**（🔒）
2. 应该弹出 **GitHub 授权验证** 对话框（而不是密码输入框）
3. 对话框应该显示：
   - ✅ 安全可靠，使用 GitHub 官方 OAuth
   - 🔒 仅需要仓库访问权限
   - ⏰ 授权后长期有效，无需重复授权
4. 点击 **使用 GitHub 授权** 按钮

### 测试 3：测试 OAuth 授权流程

1. 点击 **使用 GitHub 授权** 后，应该：
   - 打开一个新窗口（或标签页）
   - 跳转到 GitHub 授权页面
   - URL 类似：`https://github.com/login/oauth/authorize?client_id=...`
2. 在 GitHub 授权页面：
   - 确认应用名称和权限范围
   - 点击 **Authorize** 按钮
3. 授权成功后：
   - 窗口应该自动关闭
   - 主页面应该显示授权成功的提示
   - 锁图标应该变成**绿色解锁状态**（🔓）

### 测试 4：测试上传功能

1. 确保已通过 GitHub OAuth 授权（锁图标为绿色）
2. 点击**上传图标**（☁️）
3. 选择文件并上传
4. 应该能够成功上传，不会出现 "Unauthorized" 错误

### 测试 5：测试 token 持久化

1. 刷新页面
2. 锁图标应该仍然是**绿色解锁状态**（🔓）
3. 说明 token 已正确保存到 localStorage
4. 尝试上传文件，应该仍然可以成功

### 测试 6：测试 token 验证

1. 打开浏览器开发者工具（F12）
2. 进入 **Application** 标签 → **Local Storage**
3. 找到你的域名
4. 检查是否有以下键：
   - `github_oauth_token`：应该包含一个 token 字符串
   - `github_oauth_user`：应该包含用户信息的 JSON
   - `github_oauth_expires`：应该包含过期时间戳

### 测试 7：测试退出登录

1. 点击右上角的**绿色锁图标**（🔓）
2. 应该弹出确认对话框："确定要退出登录吗？"
3. 点击 **确定**
4. 锁图标应该变回**灰色锁定状态**（🔒）
5. 尝试上传文件，应该提示需要登录

## 常见问题排查

### 问题 1：仍然显示密码输入框

**原因**：`config.js` 中的 `GITHUB_OAUTH_CLIENT_ID` 未设置或为空字符串

**解决**：
1. 检查 `config.js` 中的 `GITHUB_OAUTH_CLIENT_ID` 是否已填写
2. 确保不是空字符串 `''`
3. 重新部署项目

### 问题 2：授权后窗口不关闭

**原因**：回调 URL 配置不正确或 CORS 问题

**解决**：
1. 检查 GitHub OAuth App 中的回调 URL 是否与 Vercel 环境变量中的一致
2. 检查浏览器控制台是否有错误信息
3. 检查 `api/cors.js` 中的允许域名列表

### 问题 3：授权失败：您没有访问此仓库的权限

**原因**：GitHub 用户没有仓库的访问权限

**解决**：
1. 确保测试账号是仓库的协作者（Collaborator）
2. 或者确保测试账号是仓库的所有者
3. 检查 Vercel 环境变量中的 `GITHUB_REPO_OWNER` 和 `GITHUB_REPO_NAME` 是否正确

### 问题 4：上传时仍然提示 Unauthorized

**原因**：token 未正确传递到 API

**解决**：
1. 检查浏览器控制台，查看 API 请求的 payload
2. 确认 `githubToken` 字段是否存在
3. 检查 `js/index-api.js` 中的认证逻辑是否正确

### 问题 5：Vercel 环境变量未生效

**原因**：环境变量设置后未重新部署

**解决**：
1. 进入 Vercel 项目 → **Deployments**
2. 点击 **Redeploy** 重新部署
3. 等待部署完成后再测试

## 调试技巧

### 查看认证状态

在浏览器控制台运行：

```javascript
// 检查是否配置了 GitHub OAuth
console.log('GitHub OAuth Client ID:', window.APP_CONFIG?.GITHUB_OAUTH_CLIENT_ID);

// 检查认证状态
console.log('Is Authenticated:', window.uploadAuth?.isAuthenticated());

// 获取用户信息
console.log('User Info:', window.uploadAuth?.getUserInfo());

// 获取认证状态详情
console.log('Auth Status:', window.uploadAuth?.getAuthStatus());
```

### 清除认证信息

在浏览器控制台运行：

```javascript
// 清除所有认证信息
window.uploadAuth?.clearAuth();
localStorage.clear();
location.reload();
```

### 查看 API 请求

1. 打开浏览器开发者工具（F12）
2. 进入 **Network** 标签
3. 尝试上传文件
4. 查看 `/api/github` 请求
5. 检查请求的 payload 中是否包含 `githubToken` 字段

## 测试检查清单

- [ ] GitHub OAuth App 已创建
- [ ] Vercel 环境变量已设置（`GITHUB_OAUTH_CLIENT_ID` 和 `GITHUB_OAUTH_CLIENT_SECRET`）
- [ ] `config.js` 中的 `GITHUB_OAUTH_CLIENT_ID` 已填写
- [ ] 项目已重新部署
- [ ] 点击锁图标显示 GitHub 授权对话框（不是密码输入框）
- [ ] 点击 "使用 GitHub 授权" 能正常跳转到 GitHub
- [ ] 授权后窗口自动关闭
- [ ] 锁图标变为绿色解锁状态
- [ ] 可以成功上传文件
- [ ] 刷新页面后认证状态保持
- [ ] 退出登录功能正常

## 下一步

测试通过后，可以：

1. 在生产环境使用 GitHub OAuth 认证
2. 移除或禁用密码认证（可选）
3. 配置更细粒度的权限控制（如果需要）

更多信息请参考：
- [GitHub OAuth 完整配置指南](./github-oauth-setup.md)
- [安全配置文档](./security-config.md)

