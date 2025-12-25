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

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `GH_TOKEN` | 你的 GitHub Token | 必需 |
   | `ALLOWED_ORIGINS` | 允许的域名（逗号分隔） | 可选 |

6. 选择环境：**Production**、**Preview**、**Development**（建议全选）
7. 点击 **"Save"** 保存
8. 进入 **"Deployments"** 标签，点击 **"Redeploy"** 重新部署

:::tip
如果修改了环境变量，必须重新部署项目才能生效。可以在 Vercel 控制台点击 **"Redeploy"**。
:::

:::note
`ALLOWED_ORIGINS` 用于配置 CORS，如果只在本域名使用可以留空。多个域名用逗号分隔，如：`https://example.com,https://www.example.com`
:::
