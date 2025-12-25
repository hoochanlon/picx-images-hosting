---
title: 获取 GitHub Personal Access Token
---

# ② 第二步：获取 GitHub Personal Access Token

为了能够通过 API 上传和管理图片，你需要创建一个 GitHub Personal Access Token。

## 操作步骤：

1. 点击 GitHub 右上角头像，选择 "Settings"
2. 在左侧菜单中找到 "Developer settings"
3. 点击 "Personal access tokens" → "Tokens (classic)"
4. 点击 "Generate new token" → "Generate new token (classic)"
5. 填写 Token 名称（例如：picx-images-hosting）
6. 选择过期时间（建议选择较长时间）
7. 勾选以下权限：
   - `repo` - 完整仓库访问权限
   - `workflow` - 工作流权限（如果使用 GitHub Actions）
8. 点击 "Generate token"
9. **重要：** 复制生成的 Token，它只会显示一次！

> **安全提示：** Token 就像密码一样重要，请妥善保管，不要泄露给他人。如果 Token 泄露，请立即删除并重新生成。

```
生成的 Token 格式类似：
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

