# 本地开发

## 安装依赖

```bash
pnpm add -D vercel
```

或全局安装：

```bash
pnpm add -g vercel
```

## 配置环境变量

复制 `env.example` 为 `.env.local`：

```bash
cp env.example .env.local
```

编辑 `.env.local`：

- `GH_TOKEN`：GitHub Personal Access Token
- `API_BASE`：`http://localhost:3000`（本地开发）
- `VERCEL_OIDC_TOKEN`：Vercel OIDC Token（可选）

## 启动开发服务器

```bash
# 全局安装
vercel dev

# 项目依赖
pnpm vercel dev
# 或
npx vercel dev
```

首次运行提示：

- **Set up and develop**：`Y`
- **Which scope**：选择 Vercel 账号
- **Link to existing project**：`Y`（已有项目）或 `N`（新建）
- **What's your project's name**：输入项目名称

访问 `http://localhost:3000` 查看应用。

## 本地开发配置

### config.js

```javascript
VERCEL_API_BASE: 'http://localhost:3000'
```

### api-config.json

```json
{
  "allowedOrigins": [
    "http://localhost:3000"
  ]
}
```

### GitHub OAuth

回调 URL 需要包含本地地址：

```
http://localhost:3000/api/github-oauth?action=callback
```

## 注意事项

- 环境变量优先从 `.env.local` 读取
- 如果没有 `.env.local`，从 Vercel 项目配置读取
- 本地开发时确保 `api-config.json` 包含 `http://localhost:3000`

