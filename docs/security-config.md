# 安全配置指南

## 概述

本项目实现了多层安全防护机制，保护你的仓库免受未授权操作。所有写操作（上传、删除、重命名、创建文件夹）都需要授权验证。

## 安全机制

### 1. 前端密码验证
- **作用**：防止误操作和基础防护
- **配置位置**：`config.js` 中的 `PASSWORD`
- **验证方式**：类似 GitHub OAuth 的授权对话框
- **有效期**：授权后 24 小时内有效

### 2. 后端 API 验证（推荐）
- **作用**：后端验证所有写操作请求
- **配置位置**：Vercel 环境变量 `API_SECRET`
- **验证方式**：API 请求必须携带正确的密钥

## 配置步骤

### 步骤 1：配置前端密码

1. 打开项目根目录的 `config.js` 文件
2. 找到 `PASSWORD` 配置项
3. 将默认值 `'admin123'` 修改为你的强密码

```javascript
PASSWORD: 'your-strong-password-here'
```

:::warning 重要
- 默认密码 `admin123` 不安全，必须修改
- 建议使用至少 16 个字符的强密码
- 包含大小写字母、数字和特殊字符
:::

### 步骤 2：配置 Vercel 环境变量

1. 登录 [Vercel](https://vercel.com)
2. 进入你的项目 → **Settings** → **Environment Variables**
3. 添加以下环境变量：

#### 必需配置

**`GH_TOKEN`** (必需)
- 值：你的 GitHub Personal Access Token
- 说明：用于访问 GitHub API，需要 `repo` 权限
- 获取方式：GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)

#### 安全配置（强烈推荐）

**`API_SECRET`** (强烈推荐)
- 值：强密码（至少 32 个字符）
- 说明：用于后端验证所有写操作
- 生成方式：
  ```bash
  # 使用 Node.js 生成
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # 或使用在线工具生成随机字符串
  ```

#### 可选配置

**`ALLOWED_ORIGINS`** (可选)
- 值：允许的域名，用逗号分隔
- 说明：CORS 配置，如果不设置则从 `api-config.json` 读取
- 示例：`https://your-domain.com,https://www.your-domain.com`

4. 选择环境：**Production**、**Preview**、**Development**（建议全选）
5. 点击 **Save** 保存
6. 进入 **Deployments** 标签，点击 **Redeploy** 重新部署

:::tip
修改环境变量后必须重新部署项目才能生效！
:::

### 步骤 3：本地开发配置（可选）

如果需要本地开发，可以创建 `.env.local` 文件（参考 `env.example`）：

```bash
# 复制示例文件
cp env.example .env.local

# 编辑文件，填写实际值
# GH_TOKEN=your_token_here
# API_SECRET=your_secret_here
```

:::note
注意：`.env.local` 文件已在 `.gitignore` 中，不会被提交到仓库。
:::

## 安全配置检查清单

部署前请确认：

- [ ] ✅ 已修改 `config.js` 中的 `PASSWORD` 为强密码
- [ ] ✅ 已在 Vercel 环境变量中设置 `GH_TOKEN`
- [ ] ✅ 已在 Vercel 环境变量中设置 `API_SECRET`（强烈推荐）
- [ ] ✅ 已重新部署项目使配置生效
- [ ] ✅ 测试上传功能，确认授权对话框正常显示
- [ ] ✅ 测试删除功能，确认需要授权

## 安全级别说明

### 基础防护（仅前端密码）
- ✅ 防止误操作
- ✅ 防止普通用户随意操作
- ⚠️ 密码暴露在客户端代码中
- ⚠️ 技术用户可能绕过

**适用场景**：个人项目、低安全要求

### 完整防护（前端密码 + 后端验证）
- ✅ 前端密码验证
- ✅ 后端 API 密钥验证
- ✅ 双重保护
- ✅ 即使绕过前端，后端也会拦截

**适用场景**：生产环境、公开访问的项目

## 密码生成建议

### 前端密码（`PASSWORD`）
- 长度：至少 16 个字符
- 包含：大小写字母、数字、特殊字符
- 示例生成方式：
  ```javascript
  // 在浏览器控制台运行
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  ```

### 后端密钥（`API_SECRET`）
- 长度：至少 32 个字符（推荐 64 字符）
- 类型：十六进制字符串或 Base64
- 生成方式：
  ```bash
  # Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # OpenSSL
  openssl rand -hex 32
  
  # Python
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

## 常见问题

### Q: 为什么需要两个密码？
A: 
- `PASSWORD`：前端验证，防止误操作
- `API_SECRET`：后端验证，提供额外安全层

### Q: 忘记密码怎么办？
A: 
- 前端密码：修改 `config.js` 中的 `PASSWORD` 并重新部署
- 后端密钥：在 Vercel 环境变量中重新设置 `API_SECRET` 并重新部署

### Q: 如何撤销授权？
A: 清除浏览器 localStorage 或等待 24 小时自动过期

### Q: 可以禁用安全验证吗？
A: 不推荐。如果确实需要，可以：
1. 将 `PASSWORD` 设置为空字符串（不推荐）
2. 不设置 `API_SECRET` 环境变量（不推荐）

## 安全最佳实践

1. **定期更换密码**：建议每 3-6 个月更换一次
2. **使用强密码**：避免使用常见密码或个人信息
3. **不要共享密码**：每个环境使用不同的密码
4. **监控操作日志**：定期检查 GitHub 仓库的提交历史
5. **及时撤销授权**：如果怀疑泄露，立即修改密码并重新部署

## 相关文档

- [Vercel 环境变量配置](./step-3-config-vercel.md)
- [开始使用](./step-4-start-using.md)
- [项目 README](../README.md)

