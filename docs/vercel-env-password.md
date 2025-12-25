# 在 Vercel 环境变量中配置密码

## 概述

现在支持在 Vercel 环境变量中配置密码，这样密码就不会暴露在前端代码中，更加安全。

## 配置方式

### 方式 1：Vercel 环境变量（推荐）

1. **进入 Vercel 项目设置**
   - 登录 Vercel
   - 选择你的项目
   - 进入 **Settings** → **Environment Variables**

2. **添加环境变量**
   - 变量名：`DELETE_PASSWORD`
   - 值：你的强密码（建议至少 32 个字符）
   - 选择环境：**Production**、**Preview**、**Development**（建议全选）

3. **保存并重新部署**
   - 点击 **Save** 保存
   - 进入 **Deployments** 页面
   - 点击 **Redeploy** 重新部署项目

### 方式 2：本地 config.js（备用）

如果 Vercel 环境变量中未设置 `DELETE_PASSWORD`，系统会回退到 `config.js` 中的 `DELETE_PASSWORD` 值。

**注意**：这种方式不安全，密码会暴露在代码中，仅作为备用方案。

## 工作原理

1. **用户输入密码** → 前端发送密码到 API
2. **API 验证** → 后端从 Vercel 环境变量读取 `DELETE_PASSWORD` 并验证
3. **返回 Token** → 验证成功后，返回一个临时 token（24小时有效）
4. **保存 Token** → 前端保存 token，后续操作自动使用

## 优势

### ✅ 使用 Vercel 环境变量

- **更安全**：密码不会暴露在前端代码中
- **易管理**：可以在 Vercel 控制台统一管理
- **多环境**：可以为不同环境设置不同的密码
- **不泄露**：即使代码公开，密码也不会泄露

### ❌ 使用 config.js

- **不安全**：密码暴露在代码中
- **易泄露**：如果代码公开，密码也会公开
- **难管理**：需要修改代码才能更改密码

## 配置示例

### Vercel 环境变量配置

```
DELETE_PASSWORD = your_strong_password_here_min_32_chars
```

### config.js 配置（备用）

```javascript
DELETE_PASSWORD: 'admin123',  // 仅作为备用，不推荐
```

## 验证配置

配置完成后，测试一下：

1. 访问你的 Vercel 部署地址
2. 进入上传管理页面
3. 尝试上传或删除操作
4. 输入密码
5. 应该能正常验证并操作

## 优先级

系统会按以下优先级验证密码：

1. **Vercel 环境变量** `DELETE_PASSWORD`（如果设置了）
2. **config.js** 中的 `DELETE_PASSWORD`（备用）
3. **GitHub OAuth**（如果配置了 `GITHUB_OAUTH_CLIENT_ID`，会优先使用）

## 安全建议

1. **使用强密码**：至少 32 个字符，包含大小写字母、数字和特殊字符
2. **定期更换**：建议定期更换密码
3. **使用 GitHub OAuth**：更推荐使用 GitHub OAuth 认证，更安全
4. **不要提交密码**：不要在代码中硬编码密码

## 常见问题

### Q: 设置了 Vercel 环境变量，但还是使用 config.js 的密码？

A: 检查以下几点：
1. 环境变量名是否正确：`DELETE_PASSWORD`（区分大小写）
2. 是否已重新部署项目
3. 浏览器是否清除了缓存

### Q: 可以同时使用 Vercel 环境变量和 config.js 吗？

A: 可以，但 Vercel 环境变量的优先级更高。如果 Vercel 环境变量中设置了 `DELETE_PASSWORD`，会优先使用它。

### Q: 密码验证失败怎么办？

A: 检查以下几点：
1. Vercel 环境变量中的密码是否正确
2. 是否已重新部署项目
3. 尝试清除浏览器缓存后重试

### Q: 如何生成强密码？

A: 可以使用以下方法：
- 在线密码生成器
- 命令行：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- 密码管理器

## 相关文档

- [安全配置指南](./security-config.md)
- [GitHub OAuth 配置指南](./github-oauth-setup.md)
- [Vercel 环境变量配置](./step-3-config-vercel.md)

