# GitHub OAuth 快速配置指南

## 在哪里填写 GITHUB_OAUTH_CLIENT_ID？

### 位置：`config.js` 文件

打开项目根目录的 `config.js` 文件，找到第 33 行左右的 `GITHUB_OAUTH_CLIENT_ID` 配置项。

## 如何获取 Client ID？

### 步骤 1：创建 GitHub OAuth App

1. **登录 GitHub**，点击右上角头像 → **Settings**

2. 在左侧菜单中找到 **Developer settings**（开发者设置）

3. 点击 **OAuth Apps** → **New OAuth App**

4. **填写应用信息**：

   ```
   Application name: picx-images-hosting
   （应用名称，可以自定义）
   
   Homepage URL: https://your-vercel-app.vercel.app
   （你的 Vercel 部署地址，例如：https://picx-images-hosting-brown.vercel.app）
   
   Authorization callback URL: https://your-vercel-app.vercel.app/api/github-oauth?action=callback
   （回调地址，将 your-vercel-app 替换为你的实际 Vercel 地址）
   ```

5. 点击 **Register application**（注册应用）

6. **记录 Client ID**：
   - 页面会显示 **Client ID**（客户端 ID）
   - 这个就是你要填入 `config.js` 的值
   - 例如：`Iv1.8a61f9b3a7aba766`

7. **生成 Client Secret**：
   - 点击 **Generate a new client secret**（生成新的客户端密钥）
   - ⚠️ **重要**：Client Secret 只显示一次，请立即复制保存
   - 这个需要填入 Vercel 环境变量

### 步骤 2：填写到 config.js

打开 `config.js` 文件，找到：

```javascript
GITHUB_OAUTH_CLIENT_ID: '',
```

将空字符串替换为你的 Client ID：

```javascript
GITHUB_OAUTH_CLIENT_ID: 'Iv1.8a61f9b3a7aba766',  // 你的实际 Client ID
```

### 步骤 3：配置 Vercel 环境变量

1. 进入 Vercel 项目 → **Settings** → **Environment Variables**

2. 添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `GITHUB_OAUTH_CLIENT_ID` | 你的 Client ID | 与 config.js 中的值相同 |
   | `GITHUB_OAUTH_CLIENT_SECRET` | 你的 Client Secret | 从 GitHub OAuth App 获取 |

3. 选择环境：**Production**、**Preview**、**Development**（建议全选）

4. 点击 **Save** 保存

### 步骤 4：重新部署

1. 进入 Vercel 项目 → **Deployments**
2. 点击 **Redeploy** 重新部署项目
3. 等待部署完成

## 配置示例

### config.js 配置示例

```javascript
window.APP_CONFIG = {
  // ... 其他配置 ...
  
  // GitHub OAuth 配置
  GITHUB_OAUTH_CLIENT_ID: 'Iv1.8a61f9b3a7aba766',  // ← 这里填入你的 Client ID
  
  // ... 其他配置 ...
};
```

### Vercel 环境变量配置示例

```
GITHUB_OAUTH_CLIENT_ID = Iv1.8a61f9b3a7aba766
GITHUB_OAUTH_CLIENT_SECRET = your_client_secret_here
```

## 验证配置

配置完成后，测试一下：

1. 访问你的 Vercel 部署地址
2. 点击上传或删除操作
3. 应该会弹出 GitHub 授权对话框
4. 点击 "使用 GitHub 授权"
5. 跳转到 GitHub 授权页面
6. 确认授权后，应该能正常操作

## 常见问题

### Q: Client ID 在哪里找？

A: 在 GitHub OAuth App 创建后的页面顶部，会显示 Client ID。如果找不到，可以：
1. 进入 GitHub Settings → Developer settings → OAuth Apps
2. 点击你创建的应用
3. 在应用详情页面顶部可以看到 Client ID

### Q: Client Secret 在哪里找？

A: Client Secret 需要点击 "Generate a new client secret" 按钮生成。生成后只显示一次，如果丢失需要重新生成。

### Q: 回调 URL 填什么？

A: 格式：`https://你的vercel地址/api/github-oauth?action=callback`

例如：
- 如果 Vercel 地址是 `https://picx-images-hosting-brown.vercel.app`
- 回调 URL 就是：`https://picx-images-hosting-brown.vercel.app/api/github-oauth?action=callback`

### Q: 配置后还是使用密码认证？

A: 检查以下几点：
1. `config.js` 中的 `GITHUB_OAUTH_CLIENT_ID` 是否已填写（不能是空字符串）
2. Vercel 环境变量是否已设置
3. 是否已重新部署项目
4. 浏览器是否清除了缓存

## 详细文档

更多详细信息请查看：
- [GitHub OAuth 完整配置指南](./github-oauth-setup.md)
- [安全配置指南](./security-config.md)

