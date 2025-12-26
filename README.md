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

:::warning 安全提示
部署前请务必配置安全设置，否则任何人都可以操作你的仓库！
- 修改 `config.js` 中的 `PASSWORD`（默认值不安全）
- 在 Vercel 环境变量中设置 `API_SECRET`（强烈推荐）
- 详细说明请查看 [安全配置指南](./docs/security-config.md)
:::

### 快速克隆（排除图片目录）

如果仓库图片很多，克隆会很慢。可以使用以下方法：

#### 方法 1：使用稀疏检出（推荐）

只克隆必要的代码文件，排除 `imgs` 等图片目录：

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

#### 方法 2：浅克隆 + 稀疏检出

结合浅克隆和稀疏检出，速度更快：

```bash
# 浅克隆（只克隆最新提交）
git clone --depth=1 --no-checkout https://github.com/YOUR-USERNAME/picx-images-hosting.git
cd picx-images-hosting

# 启用稀疏检出
git sparse-checkout init --cone

# 设置要检出的文件
git sparse-checkout set api css index.html upload.html config.js api-config.json README.md .gitignore package.json

# 检出文件
git checkout
```

#### 方法 3：完整克隆

如果需要所有文件（包括图片）：

```bash
git clone https://github.com/YOUR-USERNAME/picx-images-hosting.git
cd picx-images-hosting
```

> [!TIP]
> 如果后续需要图片文件，可以运行 `git sparse-checkout disable` 然后 `git pull` 来获取所有文件。

### 安装和运行

```bash
pnpn install
pnpm i -g vercel
vercel dev
```

### Vercel 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 | 必需 |
|--------|-----|------|------|
| `GH_TOKEN` | 你的 GitHub Token | GitHub Personal Access Token，需要 `repo` 权限 | ✅ 必需 |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth Client ID | GitHub OAuth App 的 Client ID（推荐使用） | ⚠️ 推荐 |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth Client Secret | GitHub OAuth App 的 Client Secret（推荐使用） | ⚠️ 推荐 |
| `API_SECRET` | 强密码（至少32字符） | API 密钥，用于后端验证写操作（备用方案） | 可选 |
| `ALLOWED_ORIGINS` | 允许的域名（逗号分隔） | CORS 配置，如果不设置则从 `api-config.json` 读取 | 可选 |

:::tip 认证方式选择
- **GitHub OAuth**（推荐）：更安全、更专业，使用 GitHub 官方 OAuth
- **密码认证**（备用）：简单但不安全，密码会暴露在代码中

详细配置指南请查看：[GitHub OAuth 配置指南](./docs/github-oauth-setup.md)
:::

**配置步骤：**
1. 进入 Vercel 项目 → **Settings** → **Environment Variables**
2. 添加上述环境变量
3. 选择环境：**Production**、**Preview**、**Development**（建议全选）
4. 点击 **Save** 保存
5. 进入 **Deployments** 标签，点击 **Redeploy** 重新部署

:::warning 安全提示
- **推荐使用 GitHub OAuth**：更安全，密码不会暴露，详细配置见 [GitHub OAuth 配置指南](./docs/github-oauth-setup.md)
- 如果使用密码认证：`API_SECRET` 用于保护写操作，强烈建议设置
- 生成强密码：可以使用在线工具或运行 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- 修改环境变量后必须重新部署才能生效
:::

**本地开发：**
- 创建 `.env.local` 文件（参考 `env.example`）
- 注意：前端 `config.js` 中的 `PASSWORD` 也需要配置（见下方说明）

### 配置文件说明

#### `config.js` - 前端配置

**基础配置：**
- `VERCEL_API_BASE`: Vercel API 基础地址
- `CUSTOM_DOMAINS`: 自定义域名列表（需要使用 Vercel API 的域名）
- `GITHUB_PAGES_PATTERN`: GitHub Pages 域名匹配模式
- `DEFAULT_UPLOAD_DIR`: 默认上传目录（例如：`'imgs/uploads/kate/'`），如果用户没有在 UI 中设置默认路径，将使用此值
- `INCLUDED_DIRS`: 允许显示的图片目录列表（例如：`['imgs']` 只显示 imgs 目录下的图片，`['imgs', 'example']` 显示多个目录，`[]` 显示所有目录）

**安全配置（重要）：**
- `PASSWORD`: 操作密码，用于前端验证
  - ⚠️ **必须修改**：默认值为 `'admin123'`，请修改为强密码
  - 此密码用于所有写操作（上传、删除、重命名、创建文件夹）的前端验证
  - 授权后 24 小时内无需重复输入
  - 注意：此密码存储在客户端代码中，仅作为基础防护
- `API_SECRET`: API 密钥（可选）
  - 如果设置了此值，需要与 Vercel 环境变量 `API_SECRET` 保持一致
  - 用于后端 API 验证，提供额外的安全层
  - 建议留空，仅在后端环境变量中配置

#### `api-config.json` - API CORS 配置

- 允许的域名列表
- 优先级：环境变量 `ALLOWED_ORIGINS` > `api-config.json` > 默认值
- 可以复制 `api-config.example.json` 为 `api-config.json` 并修改

:::important 安全配置检查清单
部署前请确认：
- [ ] 已修改 `config.js` 中的 `PASSWORD` 为强密码
- [ ] 已在 Vercel 环境变量中设置 `GH_TOKEN`
- [ ] 已在 Vercel 环境变量中设置 `API_SECRET`（强烈推荐）
- [ ] 已重新部署项目使配置生效
:::

默认图片文件夹

项目会按以下优先级识别默认图片文件夹：
1. 用户在上传时输入的路径（最高优先级）
2. 用户在 UI 中设置并保存到 localStorage 的默认路径
3. `config.js` 中的 `DEFAULT_UPLOAD_DIR` 配置（默认值：`'imgs/uploads/kate/'`）

要修改默认图片文件夹，可以：
* 在 `config.js` 中修改 `DEFAULT_UPLOAD_DIR` 的值
* 或者在应用界面中通过"设置默认路径"功能设置（会保存到浏览器 localStorage）

图片目录过滤

项目默认只显示 `imgs` 目录下的图片。要修改允许显示的目录：
* 在 `config.js` 中修改 `INCLUDED_DIRS` 数组
  - `['imgs']`: 只显示 imgs 目录下的图片（默认）
  - `['imgs', 'example']`: 显示 imgs 和 example 目录下的图片
  - `[]`: 显示所有目录下的图片（不限制）


## 网络图床

有关图床的详细信息，请参考：

* [几乎不受审查的图床标记](https://hoochanlon.github.io/posts/20250821144721)
* [壁纸资源及图床整合笔记](https://hoochanlon.github.io/posts/20250821071908)

















