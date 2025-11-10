# picx-images-hosting 


> [!important]
> 该repo做为自用图床存储，[PicX](https://github.com/XPoet/picx) 是一款基于 GitHub API 开发的图床工具，提供图片上传托管、生成图片链接和常用图片工具箱服，对于只使用GitHub的图床来说，比picgo方便。目前版本不支持完全哈希、完全时间戳将图片重命名，可参考方案：[图片重命名](/imgrename.md)。
> * 快速使用：https://picx.xpoet.cn/#/upload
> * 其他免费图片托管解决方案：[cf-pages/Telegraph-Image](https://github.com/cf-pages/Telegraph-Image)
> * 批量重命名工具：https://rename.jgrass.xyz （`<date.modify:YYYY-MMDD-HHmmss>`）


> [!CAUTION]
> * 只有把图床部署到 GitHub Pages 之后，才能使用 GitHub Pages 规则的图片链接。
> * 图床的repo名称不要与站点项目存放资源的路径相同，这会造成网页资源路径冲突。


> [!TIP]
> 我的图床分类规划：
> * category-covers：分类封面图
> * photos：个人照片为主
> * visuals：视觉艺术收藏图
> * anime：动漫收藏图
> * special：存放调试相关页面的默认图
> * uploads/${YEAR}：用于个人自由上传，题材不限



> [!TIP]
> 图片压缩工具
> * https://compressor.io （最大文件大小上传10MB，压缩50次数/天，可选有损/无损压缩）
> * https://tinypng.com （由第三方客户端版，API每月前 500 次按压是免费的）
> * https://docsmall.com/image-compress
> * https://zh.recompressor.com
> * https://saerasoft.com/caesium

> [!TIP]
> 以下是我的图床收集：
> 
> 新发现的图床，没用过不清楚稳定性
> 
> * https://img.remit.ee 
> * https://111666.best
> * https://www.picgo.net （picgo自带图床)
> * https://image.aibochinese.com （不时半夜会停机维护）
>   
> 稳定的图床
> 
> * https://tu.zbhz.org （自用了几年的）
> * https://postimages.org （很稳，但被墙了）
> * https://imgchr.com （需要注册，以前不用）
> * https://sm.ms （需要注册，以前不用）
>   
> 适合临时贴图
> 
> * https://meee.com.tw （网址在国外，会慢一些）
> * https://imgtu.com （访客48小时删除图片）
> * https://img.scdn.io (单张图片连续60天未访问则自动清理)



> [!note]
> 1. GitHub存储限制最多可以存5G左右
> 1. 一般电脑截图1-2M，Mac差不多翻倍，手机照片甚至十兆几十兆不等，所以需要 squoosh 进行图片压缩
> 1. 国内GitHub的链接很慢，所以上传的照片需要用到[jsdelivr cdn](https://www.jsdelivr.com)、[statically.io](https://statically.io/)保证加载速度，单个文件最大限制20M
> 1. jsdelivr cdn也被国内污染了，可以考虑使用：[Vercel-Netlify-JsDelivr-Mirror](https://github.com/JanePHPDev/Vercel-Netlify-JsDelivr-Mirror)，网站：https://cdn.mengze.vip
> 1. 使用[cloudflare](https://www.cloudflare.com/zh-cn/)代理: https://github.com/XPoet/picx/issues/260#issuecomment-1845003856


---

<p align="center">
  <strong><span style="font-size: 1.2em;">参考文章</span></strong>
</p>

<p align="center">
  <a href="https://blog.jsdmirror.com/2.html">jsdmirror目介绍与使用教程</a>
</p>
<p align="center">
  <a href="https://wlcheng.cc/posts/github_picture_bed/">Github 图床 PicGo 使用</a>
</p>
<p align="center">
  <a href="https://sspai.com/post/98911">2025 年，我们还有哪些免费图床可用？（长期更新）</a>
</p>
<p align="center">
  <a href="https://www.tianlejin.top/blog/exiftool/">【实用工具】使用exiftool批量按拍摄时间重命名照片</a>
</p>
<p align="center">
  <a href="https://wzfou.com/tupia-yasuo-gongju/">十五个免费的图片压缩工具整理汇总-免费在线图片压缩工具和图片优化软件</a>
</p>




