---
title: 配置 Vercel 环境变量
---

# ③ 第三步：配置 Vercel 环境变量

将你的 GitHub Token 配置到 Vercel 项目中，以便 API 能够访问 GitHub 仓库。

## 操作步骤：

1. 登录 [Vercel](https://vercel.com) 账号
2. 导入你的 GitHub 仓库到 Vercel
3. 进入项目设置（Settings）
4. 点击左侧菜单的 "Environment Variables"
5. 添加以下环境变量：
   - `GH_TOKEN` = 你的 GitHub Personal Access Token
   - `ALLOWED_ORIGINS` = 允许的域名（可选，用逗号分隔）
6. 选择环境（Production, Preview, Development）
7. 点击 "Save" 保存
8. 重新部署项目使环境变量生效

> **提示：** 如果修改了环境变量，需要重新部署项目才能生效。可以在 Vercel 控制台点击 "Redeploy"。

## 配置 CORS（可选）：

如果你需要从其他域名访问 API，可以在 `api-config.json` 中配置允许的域名列表。

```json
{
  "allowedOrigins": [
    "https://your-domain.com",
    "https://another-domain.com"
  ]
}
```

