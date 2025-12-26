# 安全说明

> 📖 详细的安全配置指南请查看 [docs/security-config.md](./docs/security-config.md)

## 当前安全机制

### 1. 前端密码验证
- 所有写操作（上传、删除、重命名、创建文件夹）前需要输入密码验证
- 类似 GitHub OAuth 的授权对话框体验
- 密码验证后24小时内有效，无需重复输入
- 密码存储在 `config.js` 的 `PASSWORD` 中
- ⚠️ **必须修改默认密码** `admin123`

### 2. 后端API保护
- GitHub Token存储在Vercel环境变量中，前端无法直接访问
- 可选：在Vercel环境变量中设置 `API_SECRET`，后端会验证所有写操作
- 强烈推荐设置 `API_SECRET` 以提供额外安全层

## 快速配置指南

### ⚠️ 部署前必须完成

1. **修改前端密码**（必需）
   ```javascript
   // 在 config.js 中修改
   PASSWORD: 'your-strong-password-here'
   ```

2. **设置 Vercel 环境变量**（必需）
   - `GH_TOKEN`: GitHub Personal Access Token
   - `API_SECRET`: 强密码（至少32字符，强烈推荐）

3. **重新部署项目**
   - 修改配置后必须重新部署才能生效

详细配置步骤请查看 [安全配置指南](./docs/security-config.md)

3. **限制CORS域名**
   - 在 `api-config.json` 中只添加信任的域名
   - 不要添加 `*` 或过于宽泛的域名

4. **使用GitHub分支保护**
   - 在GitHub仓库设置中启用分支保护规则
   - 要求Pull Request审核后才能合并到主分支

5. **定期更换密码和密钥**
   - 定期更换 `PASSWORD` 和 `API_SECRET`
   - 如果怀疑泄露，立即更换

6. **监控删除操作**
   - 定期检查GitHub仓库的提交历史
   - 如果发现异常删除，立即检查日志

## GitHub OAuth 认证（推荐）

项目已实现完整的 GitHub OAuth 认证系统，提供更安全、更专业的身份验证方式。

### 优势

- ✅ **更安全**：使用 GitHub 官方 OAuth，密码不会暴露在代码中
- ✅ **更专业**：类似 GitHub 的授权体验
- ✅ **权限控制**：可以精确控制哪些用户有权限
- ✅ **长期有效**：授权后长期有效，无需频繁输入密码

### 配置步骤

详细配置指南请查看：[GitHub OAuth 配置指南](./docs/github-oauth-setup.md)

**快速配置：**

1. 在 GitHub 创建 OAuth App（Settings → Developer settings → OAuth Apps）
2. 在 Vercel 环境变量中设置：
   - `GITHUB_OAUTH_CLIENT_ID`
   - `GITHUB_OAUTH_CLIENT_SECRET`
3. 在 `config.js` 中设置 `GITHUB_OAUTH_CLIENT_ID`
4. 重新部署项目

### 回退机制

如果未配置 GitHub OAuth，系统会自动回退到密码认证（`PASSWORD`）。

## 更安全的替代方案

如果需要更高的安全性，建议：

1. **使用GitHub OAuth认证** ✅ **已实现**
   - 只有授权用户才能操作
   - 完整的 OAuth 流程
   - 详细配置见 [GitHub OAuth 配置指南](./docs/github-oauth-setup.md)

2. **使用JWT Token**
   - 后端生成JWT token
   - 前端使用token进行认证
   - Token有过期时间

3. **IP白名单**
   - 在Vercel API中限制允许的IP地址
   - 但这对移动设备不友好

4. **二次确认机制**
   - 删除操作需要两次确认
   - 可以添加验证码或邮箱确认

## 当前实现的局限性

1. **前端密码验证**
   - 密码存储在客户端，可以被查看
   - 仅作为基础防护，不能完全阻止恶意用户

2. **后端验证（可选）**
   - 如果设置了 `API_SECRET`，后端会验证
   - 但密钥也存储在客户端，仍可能被获取

3. **无会话管理**
   - 认证状态存储在localStorage
   - 可以被清除或修改

## 总结

当前实现提供了**基础的安全防护**，适合：
- 个人项目
- 低安全要求的场景
- 内部使用的工具

**不适合**：
- 高安全要求的场景
- 公开访问的生产环境
- 需要严格权限控制的系统

建议根据实际需求选择合适的认证方案。

