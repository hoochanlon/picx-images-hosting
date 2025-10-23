# picx-images-hosting 

[PicX](https://github.com/XPoet/picx) 是一款基于 GitHub API 开发的图床工具，提供图片上传托管、生成图片链接和常用图片工具箱服，对于只使用GitHub的图床来说，比picgo方便。

快速使用： https://picx.xpoet.cn/#/upload 

> [!CAUTION]
> * 只有把图床部署到 GitHub Pages 之后，才能使用 GitHub Pages 规则的图片链接。
> * 图床的repo名称不要与站点项目存放资源的路径相同，以避免因图床repo发布gh-pages造成网页资源路径冲突。

> [!TIP]
> 以下是我的常用图床：
> * https://www.picgo.net （picgo自带图床）
> * https://img.remit.ee （新发现的图床）
> * https://tu.zbhz.org （用了几年了，还算稳定）
> * https://image.aibochinese.com （有不少上传动漫色图的）
> * https://imgchr.com （需要注册）
> * https://sm.ms （需要注册）
> * https://meee.com.tw （国外图床）
> * https://img.scdn.io (单张图片连续60天未访问则自动清理)
> * [2025 年，我们还有哪些免费图床可用？（长期更新）](https://sspai.com/post/98911)

## 说明

该repo做为自用图床存储。

1. GitHub存储限制最多可以存5G左右
2. 一般电脑截图1-2M，Mac差不多翻倍，手机照片甚至十兆几十兆不等，所以需要 squoosh 进行图片压缩
3. 国内GitHub的链接很慢，所以上传的照片需要用到[jsdelivr cdn](https://www.jsdelivr.com)、[statically.io](https://statically.io/)保证加载速度，单个文件最大限制20M
4. jsdelivr cdn也被国内污染了，可以考虑使用：[Vercel-Netlify-JsDelivr-Mirror](https://github.com/JanePHPDev/Vercel-Netlify-JsDelivr-Mirror)，网站：https://cdn.mengze.vip
5. 使用[cloudflare](https://www.cloudflare.com/zh-cn/)代理: https://github.com/XPoet/picx/issues/260#issuecomment-1845003856



