# picx-images-hosting 

## 项目简介

由于 GitHub 上目前鲜有人做基于 GitHub Pages 托管的 Web 图床，加上 PicX 加载器是个人域名难记，并不方便自用浏览，因此就有就了在 GitHub Pages 上实现图床管理的想法。该 [picx-images-hosting](https://blog.hoochanlon.moe/picx-images-hosting) 做为自用图床，搭配 [PicX](https://github.com/XPoet/picx) 实现 1+1 > 2 的体验效果。

> [!important]
> * GitHub存储限制最多可以存5G。
> * 只有把图床部署到 GitHub Pages 之后，才能使用 GitHub Pages 规则的图片链接。
> * 图床的repo名称不要与站点项目存放资源的路径相同，这会造成网页资源路径冲突。
> * 国内GitHub的链接很慢，所以上传的照片需要用到[jsdelivr cdn](https://www.jsdelivr.com)、[statically.io](https://statically.io/)、[webcache](https://www.webcache.cn)保证加载速度。
> * 其他免费相关托管方案：[ling-drag0n/CloudPaste](https://github.com/ling-drag0n/CloudPaste)、[MarSeventh/CloudFlare-ImgBed](https://github.com/MarSeventh/CloudFlare-ImgBed)、兰空图床（需服务器）等

有关图床的详细信息，请参考：

* [几乎不受审查的图床标记](https://hoochanlon.github.io/posts/20250821144721)
* [壁纸资源及图床整合笔记](https://hoochanlon.github.io/posts/20250821071908)


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


## 安全须知

### 敏感信息保护

- ⚠️ **永远不要**将敏感变量值提交到代码仓库
- ⚠️ **永远不要**在代码中硬编码 Client Secret 或 Token
- ✅ 使用 Vercel 环境变量存储所有敏感信息
- ✅ 定期轮换（更换）敏感 token

### 变量命名规范

- ✅ 使用大写字母和下划线：`GITHUB_OAUTH_CLIENT_ID`
- ✅ 使用描述性名称：`PASSWORD` 而不是 `PWD`
- ✅ 保持一致性：所有 GitHub OAuth 相关变量使用 `GITHUB_OAUTH_` 前缀

### 环境变量配置的关键要点

1. **完整性**：确保所有必需变量都已配置
2. **准确性**：变量名和值必须完全正确（区分大小写）
3. **一致性**：OAuth 回调 URL 必须与 GitHub 配置一致
4. **安全性**：敏感信息只存储在环境变量中
5. **及时性**：配置后必须重新部署才能生效

遵循以上要点，可以确保环境变量配置正确且安全。


## 配置

### 1. Git 稀疏检出

由于是自用图床，图片过多存储空间占用过大在所难免，所以需要排除图片目录，进行稀疏检出的克隆模式。

```bash
# 1. 克隆仓库元数据，不下载文件内容
git clone --filter=blob:none --no-checkout https://github.com/hoochanlon/picx-images-hosting.git

# 2. 进入仓库目录
cd picx-images-hosting

# 3. 设置稀疏检出规则：包含所有文件，排除imgs目录
git sparse-checkout set --no-cone '/*' '!/imgs/*'

# 4. 检出主分支
git checkout master
```

### 2. 配置 config.js

打开根目录的 `config.js`，根据自己的部署环境修改以下字段：

- `VERCEL_API_BASE`：填你的 Vercel 线上地址，如 `https://picx-images-hosting-brown.vercel.app`
- `CUSTOM_DOMAINS`：如果有自定义域名（博客、图床入口），在这里填入，便于通过这些域名访问 API
- `DEFAULT_UPLOAD_DIR`：默认上传目录，例如 `imgs/uploads/kate/`
- `INCLUDED_DIRS`：允许在首页展示的图片目录列表，默认 `['imgs']`
- `GITHUB_REPO_URL`：仓库地址，用于右上角 GitHub 按钮
- `GITHUB_OAUTH_CLIENT_ID`：如果启用 GitHub OAuth，在这里填你的 Client ID
- `PASSWORD`：操作密码（备用方案），如果不用 GitHub OAuth，就依赖它做上传/删除前的二次确认

### 3. 配置 api-config.json

`api-config.json` 用来控制后端 API 的 CORS 允许来源：

- 打开根目录的 `api-config.json`
- 在 `allowedOrigins` 中填入允许访问 API 的域名，例如：

  ```
  {
    "allowedOrigins": [
      "https://hoochanlon.github.io",
      "https://blog.hoochanlon.moe",
      "https://picx-images-hosting-brown.vercel.app"
    ]
  }
  ```

- 如果之后新增了前端访问入口域名（比如新绑定的自定义域名），记得同步加到这里并重新部署

### 4. 设置 env.local

复制 将 `env.example` 并重命名成 `env.local`

```bash
cp env.example env.local
```

编辑 env.local 文件填入如下相关信息

```bash
# ============ 必须配置 ============
# GitHub Token（需要 repo 权限）
# 获取地址：https://github.com/settings/tokens
GH_TOKEN="your_github_personal_access_token_here"

# ============ Vercel 配置 ============
# Vercel OIDC Token（Vercel自动生成，勿修改）
VERCEL_OIDC_TOKEN="your_vercel_oidc_token_here"

# API 基础地址（vercel 部署地址）
API_BASE="https://your-project-name.vercel.app"
```


## 部署

### 1. 设定密码 / 设定 GitHub OAuth 认证 （二选一）

#### 1.1 配置密码

配置密码在 vercel 设置环境变量 PASSWORD 填入密码值即可。

#### 1.2 GitHub OAUTH 认证（创建 GitHub OAuth App）

> [!WARNING]
> - **Client secret** 只显示一次，请立即保存
> - 如果丢失，需要重新生成
> - 回调 URL 必须完全匹配，包括协议（https）和路径

1. 登录 GitHub，进入 **Settings** → **Developer settings** → **OAuth Apps**
2. 点击 **New OAuth App**
3. 填写以下信息：

    | 字段 | 示例值 | 说明 |
    |------|--------|------|
    | **Application name** | `picx-images-hosting` | 应用名称（可自定义） |
    | **Homepage URL** | `https://picx-images...` | 你的 Vercel 部署地址 |
    | **Callback URL** | `https://.../callback` | OAuth 回调地址 |

    > **完整 URL：**
    > - 主页地址：`https://picx-images-hosting-brown.vercel.app`
    > - 回调地址：`https://picx-images-hosting-brown.vercel.app/api/github-oauth?action=callback`
   

4. 点击 **Register application**
5. **记录生成的 Client ID**（例如：`Iv1.8a61f9b3a7aba766`）
6. 点击 **Generate a new client secret**，**记录 Client secret**（只显示一次，请妥善保存）

### 2. vercel 环境变量配置

根据项目需求，需要在 Vercel 中配置以下环境变量：

| 变量名 | 说明 | 必要 | 示例值 |
|--------|------|:----:|--------|
| `GH_TOKEN` | GitHub Personal Access Token | **必需** | `ghp_xxx...` |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth App 的 Client ID | *推荐* | `0v231iA5D` |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth App 的 Client Secret | *推荐* | `6d48b48...` |
| `GITHUB_OAUTH_REDIRECT_URI` | OAuth 回调地址 | 可选 | `https://.../callback` |
| `API_BASE` | API 基础地址（vercel 部署地址） | 可选 | `https://picx-images...` |
| `PASSWORD` | 密码（备用认证） | 可选 | `Pass@w0rd` |
