# picx-images-hosting 

## 项目简介

由于 GitHub 上目前鲜有人做基于 GitHub Pages 托管的 Web 图床，加上 PicX 加载器是个人域名难记，并不方便自用浏览，因此就有就了在 GitHub Pages 上实现图床管理的想法。该 [picx-images-hosting](https://blog.hoochanlon.moe/picx-images-hosting) 做为自用图床，搭配 [PicX](https://github.com/XPoet/picx) 实现 1+1 > 2 的体验效果。

> [!important]
> * GitHub存储限制最多可以存5G。
> * 只有把图床部署到 GitHub Pages 之后，才能使用 GitHub Pages 规则的图片链接。
> * 图床的repo名称不要与站点项目存放资源的路径相同，这会造成网页资源路径冲突。
> * 国内GitHub的链接很慢，所以上传的照片需要用到[jsdelivr cdn](https://www.jsdelivr.com)、[statically.io](https://statically.io/)、[webcache](https://www.webcache.cn)保证加载速度。
> * 其他免费相关托管方案：[ling-drag0n/CloudPaste](https://github.com/ling-drag0n/CloudPaste)、[MarSeventh/CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed)、兰空图床（需服务器）等

## 快速使用

* https://picx.xpoet.cn/#/upload
* http://hoochanlon.github.io/picx-images-hosting

> [!TIP]
> 我的图床分类规划：
> * 图片根目录：`/imgs`
> * category-covers：分类封面图
> * photos：个人照片为主
> * visuals：视觉艺术收藏图
> * anime：动漫收藏图
> * special：存放调试相关页面的默认图
> * uploads/${YEAR}：用于个人自由上传，题材不限


## 部署

### Git 稀疏检出

由于是自用图床，图片过多存储空间占用过大在所难免，所以需要排除图片目录，进行相关克隆。

```bash
# 创建空仓库
git clone --no-checkout https://github.com/YOUR-USERNAME/picx-images-hosting.git
cd picx-images-hosting

# 启用稀疏检出
git sparse-checkout init --cone

# 只克隆必要的目录和文件（排除 imgs 目录）
git sparse-checkout set api css index.html upload.html config.js api-config.json README.md .gitignore package.json

# 检出文件
git checkout
```


### GitHub OATH 认证



### vercel 环境变量配置

![]()