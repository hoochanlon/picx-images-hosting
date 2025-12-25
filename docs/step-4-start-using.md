---
title: 开始使用
---

# ④ 第四步：开始使用

配置完成后，访问你的 Vercel 部署地址即可使用图床服务。

## 快速开始

1. 访问你的 Vercel 部署地址（如：`https://your-project.vercel.app`）
2. 点击导航栏的**上传按钮**（云朵图标）上传图片
3. 上传后可以**复制链接**或**复制 CDN 链接**使用

:::tip
CDN 链接加载速度更快，推荐使用。链接格式：
```
https://cdn.jsdelivr.net/gh/你的用户名/仓库名@分支名/图片路径
```
:::

## 主要功能

- **📤 快速上传**：支持单文件、多文件、拖拽上传
- **📁 上传管理**：查看、删除、复制已上传的图片
- **🔍 搜索筛选**：按文件名或文件夹筛选图片
- **📋 链接复制**：一键复制 GitHub Pages 或 CDN 链接
- **🌙 夜间模式**：支持日间/夜间模式切换

## 链接格式说明

**GitHub Pages 链接：**
```
https://你的用户名.github.io/仓库名/图片路径
```

**CDN 链接（推荐，速度更快）：**
```
https://cdn.jsdelivr.net/gh/你的用户名/仓库名@分支名/图片路径
```

:::important
如果创建了 Release，CDN 链接中的分支名可以替换为版本号，如：
```
https://cdn.jsdelivr.net/gh/你的用户名/仓库名@v1.0.0/图片路径
```
这样链接更稳定，不会因为分支更新而改变。
:::

## 配置自定义域名（可选）

如果你有自己的域名，可以在 `config.js` 中配置：

```javascript
CUSTOM_DOMAINS: [
  'your-domain.com',
  'www.your-domain.com'
]
```

然后在 Vercel 项目设置中添加自定义域名。

:::tip
完成！现在你已经成功部署了图床服务，可以开始上传和管理图片了。如有问题，可以查看项目 GitHub 仓库的 Issues。
:::
