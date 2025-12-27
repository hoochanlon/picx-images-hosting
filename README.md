# picx-images-hosting 

![](https://cdn.jsdelivr.net/gh/hoochanlon/picx-images-hosting@refs/heads/master/example/PixPin_2025-12-26_23-46-08.png)

## 项目简介

[picx-images-hosting](http://hoochanlon.github.io/picx-images-hosting) 一款基于 GitHub Pages 构建的 Web 图床管理系统，搭配 [PicX](https://picx.xpoet.cn/#/upload) 达成无缝衔接高度定制化的个人公共图片上传及管理。

### 主要功能

* 📤 **图片上传管理**: 支持批量上传、目录管理、文件重命名
* 🔐 **多种认证方式**: 支持 GitHub OAuth 和密码认证
* 🗜️ **图片压缩**: 集成 TinyJPG/TinyPNG API，自动压缩图片
* 📊 **API 健康监控**: 实时监控 API 状态，快速定位问题
* 🌙 **深色模式**: 支持浅色/深色主题切换
* 📱 **响应式设计**: 适配桌面和移动设备

### 注意事项

* GitHub 存储限制最多 5G
* 部署到 GitHub Pages 后才能使用 GitHub Pages 规则的图片链接
* 国内访问建议使用 [jsdelivr](https://www.jsdelivr.com)、[statically.io](https://statically.io/) 等 CDN 加速

网页版图床是图片资产的管理后台，而 PicGo、PicList 等图床扩展软件是写作时的快捷生产工具。它们共享一个GitHub数据仓库，既能享受批量管理的便利，也能拥有写作时一键插图的畅快。

## 部署程式

![](https://cdn.jsdelivr.net/gh/hoochanlon/picx-images-hosting@refs/heads/master/example/PixPin_2025-12-27_00-29-26.png)

> [!tip]
> 详情见部署教程：https://hoochanlon.github.io/picx-images-hosting/tutorial.html

## 高级玩法

![](https://cdn.jsdelivr.net/gh/hoochanlon/picx-images-hosting@refs/heads/master/example/PixPin_2025-12-27_17-10-00.png)

picx-images-hosting 可基于该项目进行二次开发，以支持七牛云、B2、R2 等兼容 S3 的对象存储。以及通过 [CF-Proxy-B2](https://github.com/hoochanlon/CF-Proxy-B2) 来实现 100% 免流的目的。
