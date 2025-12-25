---
title: 获取 GitHub Personal Access Token
---

# ② 第二步：获取 GitHub Personal Access Token

创建 Token 用于 API 访问 GitHub 仓库。

## 操作步骤：

1. 点击 GitHub 右上角**头像** → **"Settings"**
2. 左侧菜单找到 **"Developer settings"**
3. 点击 **"Personal access tokens"** → **"Tokens (classic)"**
4. 点击 **"Generate new token"** → **"Generate new token (classic)"**
5. 填写 Token 名称（如：`picx-images-hosting`）
6. 选择过期时间（建议选择较长时间，如 90 天或 No expiration）
7. 勾选以下权限：
   - ✅ **`repo`** - 完整仓库访问权限（必需）
   - ✅ **`workflow`** - 工作流权限（如果使用 GitHub Actions）
8. 点击 **"Generate token"**
9. **立即复制 Token**（只显示一次，关闭后无法再次查看）

:::warning
Token 生成后只会显示一次！请立即复制并妥善保存。如果丢失，需要重新生成。
:::

:::important
Token 格式类似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

请将 Token 保存在安全的地方，不要泄露给他人。如果 Token 泄露，请立即删除并重新生成。
:::
