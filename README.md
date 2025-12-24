# picx-images-hosting 

## 简介

该repo做为自用图床，搭配 [PicX](https://github.com/XPoet/picx) 实现 1+1 > 2 的体验效果

> [!important]
> * GitHub存储限制最多可以存5G。
> * 只有把图床部署到 GitHub Pages 之后，才能使用 GitHub Pages 规则的图片链接。
> * 图床的repo名称不要与站点项目存放资源的路径相同，这会造成网页资源路径冲突。
> * 国内GitHub的链接很慢，所以上传的照片需要用到[jsdelivr cdn](https://www.jsdelivr.com)、[statically.io](https://statically.io/)、[webcache](https://www.webcache.cn)保证加载速度。
> * 其他免费相关托管方案：[cf-pages/Telegraph-Image](https://github.com/cf-pages/Telegraph-Image)、兰空图床（需服务器）等

## 快速使用

* https://picx.xpoet.cn/#/upload
* http://hoochanlon.github.io/picx-images-hosting

> [!TIP]
> 我的图床分类规划：
> * category-covers：分类封面图
> * photos：个人照片为主
> * visuals：视觉艺术收藏图
> * anime：动漫收藏图
> * special：存放调试相关页面的默认图
> * uploads/${YEAR}：用于个人自由上传，题材不限


## 部署

fork 这个仓库


```bash
pnpn install
pnpm i -g vercel
vercel dev
```

vercel 变量

* `GH_TOKEN`:`YOUR-PERSONAL-ACCESS-TOKEN` (必需)
* `ALLOWED_ORIGINS`:`https://your-domain.com,https://another-domain.com` (可选，用逗号分隔多个域名，如果不设置则从 `api-config.json` 读取)

配置文件

* `config.js`: 前端配置
  - `VERCEL_API_BASE`: Vercel API 基础地址
  - `CUSTOM_DOMAINS`: 自定义域名列表（需要使用 Vercel API 的域名）
  - `GITHUB_PAGES_PATTERN`: GitHub Pages 域名匹配模式
  - `DEFAULT_UPLOAD_DIR`: 默认上传目录（例如：`'imgs/uploads/kate/'`），如果用户没有在 UI 中设置默认路径，将使用此值
* `api-config.json`: API CORS 配置（允许的域名列表）
  - 优先级：环境变量 `ALLOWED_ORIGINS` > `api-config.json` > 默认值
  - 可以复制 `api-config.example.json` 为 `api-config.json` 并修改

默认图片文件夹

项目会按以下优先级识别默认图片文件夹：
1. 用户在上传时输入的路径（最高优先级）
2. 用户在 UI 中设置并保存到 localStorage 的默认路径
3. `config.js` 中的 `DEFAULT_UPLOAD_DIR` 配置（默认值：`'imgs/uploads/kate/'`）

要修改默认图片文件夹，可以：
* 在 `config.js` 中修改 `DEFAULT_UPLOAD_DIR` 的值
* 或者在应用界面中通过"设置默认路径"功能设置（会保存到浏览器 localStorage）


## 网络图床

有关图床的详细信息，请参考：：

* [几乎不受审查的图床标记](https://hoochanlon.github.io/posts/20250821144721)
* [壁纸资源及图床整合笔记](https://hoochanlon.github.io/posts/20250821071908)

















