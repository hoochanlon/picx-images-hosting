# picx-images-hosting 架构流程原理图

## 系统架构与异步处理流程

```mermaid
graph TB
    subgraph "前端层 (Browser - GitHub Pages)"
        A[用户操作] --> B{操作类型}
        B -->|上传文件| C[upload-upload.js]
        B -->|加载文件| D[upload-files.js]
        B -->|删除文件| E[upload-delete.js]
        B -->|认证| F[upload-auth.js]
        
        C --> C1[requireAuth 认证检查]
        C1 --> C2{认证状态}
        C2 -->|未认证| C3[显示认证对话框]
        C2 -->|已认证| C4[toBase64 文件转换]
        C4 --> C5[ensureDirectoryExists 目录检查]
        C5 --> C6[Promise setTimeout 延迟等待]
        C6 --> C7[fetch API 上传请求]
        
        D --> D1[fetchTree API 调用]
        D1 --> D2[解析文件树结构]
        D2 --> D3[渲染文件列表]
        
        E --> E1[确认对话框 Promise]
        E1 --> E2[fetch API 删除请求]
        
        F --> F1{认证方式}
        F1 -->|GitHub OAuth| F2[OAuth 流程]
        F1 -->|密码| F3[verify-password API]
        F2 --> F4[存储 Token]
        F3 --> F4
    end
    
    subgraph "网络层 (HTTP/HTTPS)"
        C7 -->|POST /api/github| H1[Vercel Serverless Function]
        D1 -->|GET /api/tree| H2[Vercel Serverless Function]
        E2 -->|POST /api/github| H1
        F3 -->|POST /api/verify-password| H3[Vercel Serverless Function]
        F2 -->|GET /api/github-oauth| H4[Vercel Serverless Function]
    end
    
    subgraph "后端层 (Vercel Serverless Functions)"
        H1[github.js] --> H1A{请求方法}
        H1A -->|POST| H1B[认证验证]
        H1B --> H1C{认证类型}
        H1C -->|GitHub Token| H1D[验证 GitHub Token]
        H1C -->|API Secret| H1E[验证 API Secret]
        H1C -->|Password Token| H1F[验证密码 Token]
        H1D --> H1G[GitHub API 调用]
        H1E --> H1G
        H1F --> H1G
        
        H2[tree.js] --> H2A[GitHub API 获取文件树]
        H3[verify-password.js] --> H3A[密码验证]
        H3A --> H3B[生成 Token]
        H4[github-oauth.js] --> H4A[OAuth 回调处理]
    end
    
    subgraph "GitHub API 层"
        H1G -->|PUT/DELETE| G1[GitHub Contents API]
        H2A -->|GET| G2[GitHub Git Trees API]
        H1D -->|GET| G3[GitHub User API]
        H1D -->|GET| G4[GitHub Repo API]
    end
    
    subgraph "异步处理机制"
        I1[async/await] --> I2[Promise 链式调用]
        I2 --> I3[错误处理 catch]
        I3 --> I4[重试机制 retry]
        I4 --> I5[延迟等待 setTimeout]
        
        J1[并发控制] --> J2[for 循环顺序上传]
        J2 --> J3[await 阻塞等待]
        J3 --> J4[进度更新 UI]
    end
    
    subgraph "阻塞处理策略"
        K1[目录创建] --> K2[ensureDirectoryExists]
        K2 --> K3{目录是否存在}
        K3 -->|不存在| K4[创建 .gitkeep]
        K4 --> K5[等待 1-3 秒]
        K5 --> K6[验证目录创建]
        K6 --> K7{验证成功?}
        K7 -->|否| K8[重试 最多3次]
        K8 --> K4
        K7 -->|是| K9[继续上传]
        
        L1[文件上传] --> L2[Base64 转换]
        L2 --> L3[API 请求]
        L3 --> L4{响应状态}
        L4 -->|409 冲突| L5[目录不存在]
        L5 --> L6[创建目录]
        L6 --> L7[延迟 2-3 秒]
        L7 --> L8[重试上传]
        L4 -->|200 成功| L9[更新进度]
        L4 -->|401 未授权| L10[重新认证]
    end
    
    style A fill:#e1f5ff
    style H1 fill:#fff4e6
    style H2 fill:#fff4e6
    style H3 fill:#fff4e6
    style H4 fill:#fff4e6
    style G1 fill:#f0f0f0
    style G2 fill:#f0f0f0
    style I1 fill:#e8f5e9
    style K2 fill:#fff3e0
    style L3 fill:#fff3e0
```

## 异步操作时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端 (Browser)
    participant API as Vercel API
    participant GitHub as GitHub API
    
    Note over User,GitHub: 文件上传流程
    
    User->>Frontend: 选择文件并上传
    Frontend->>Frontend: requireAuth() 检查认证
    alt 未认证
        Frontend->>User: 显示认证对话框
        User->>Frontend: 输入密码/OAuth
        Frontend->>API: POST /api/verify-password
        API->>Frontend: 返回 Token
    end
    
    Frontend->>Frontend: toBase64(file) 异步转换
    Frontend->>Frontend: ensureDirectoryExists() 检查目录
    
    loop 目录创建重试 (最多3次)
        Frontend->>API: GET /api/file?path=dir/.gitkeep
        API->>GitHub: GET /repos/.../contents/...
        GitHub->>API: 404 Not Found
        API->>Frontend: 404
        Frontend->>API: POST /api/github (创建 .gitkeep)
        API->>GitHub: PUT /repos/.../contents/...
        GitHub->>API: 201 Created
        API->>Frontend: 201
        Frontend->>Frontend: setTimeout(1000-3000ms) 等待
        Frontend->>API: GET /api/file?path=dir/.gitkeep (验证)
        API->>GitHub: GET /repos/.../contents/...
        GitHub->>API: 200 OK
        API->>Frontend: 200 (目录创建成功)
    end
    
    Frontend->>API: POST /api/github (上传文件)
    API->>API: 验证认证 Token
    API->>GitHub: PUT /repos/.../contents/...
    
    alt 上传成功
        GitHub->>API: 201 Created
        API->>Frontend: 201
        Frontend->>Frontend: 更新进度条
        Frontend->>User: 显示上传成功
    else 409 冲突 (目录不存在)
        GitHub->>API: 409 Conflict
        API->>Frontend: 409
        Frontend->>Frontend: 创建目录并重试上传
    else 401 未授权
        GitHub->>API: 401 Unauthorized
        API->>Frontend: 401
        Frontend->>User: 提示重新认证
    end
    
    Frontend->>API: GET /api/tree (刷新文件列表)
    API->>GitHub: GET /repos/.../git/trees/...
    GitHub->>API: 200 OK (文件树)
    API->>Frontend: 200 (文件树数据)
    Frontend->>Frontend: 渲染文件列表
    Frontend->>User: 显示更新后的文件列表
```

## 并发与阻塞处理机制

```mermaid
graph LR
    subgraph "前端异步处理"
        A1[事件循环 Event Loop] --> A2[任务队列]
        A2 --> A3[宏任务 MacroTask]
        A2 --> A4[微任务 MicroTask]
        A3 --> A5[setTimeout/setInterval]
        A4 --> A6[Promise.then/catch]
        A4 --> A7[async/await]
    end
    
    subgraph "文件上传并发控制"
        B1[文件列表] --> B2{并发策略}
        B2 -->|顺序上传| B3[for...of + await]
        B2 -->|并发上传| B4[Promise.all]
        B3 --> B5[逐个阻塞等待]
        B4 --> B6[并行执行]
        B5 --> B7[进度更新]
        B6 --> B7
    end
    
    subgraph "阻塞等待机制"
        C1[目录创建] --> C2[Promise setTimeout]
        C2 --> C3[延迟 1-3 秒]
        C3 --> C4[验证目录存在]
        C4 --> C5{验证结果}
        C5 -->|失败| C6[重试计数 +1]
        C6 --> C7{重试次数 < 3?}
        C7 -->|是| C2
        C7 -->|否| C8[抛出错误]
        C5 -->|成功| C9[继续执行]
    end
    
    subgraph "错误处理与重试"
        D1[API 请求] --> D2{响应状态}
        D2 -->|200/201| D3[成功处理]
        D2 -->|409| D4[目录冲突]
        D2 -->|401| D5[认证失败]
        D2 -->|500| D6[服务器错误]
        D4 --> D7[创建目录后重试]
        D5 --> D8[重新认证]
        D6 --> D9[延迟后重试]
        D7 --> D1
        D9 --> D1
    end
    
    style A1 fill:#e3f2fd
    style B3 fill:#fff3e0
    style C2 fill:#fce4ec
    style D1 fill:#e8f5e9
```

## 认证流程

```mermaid
stateDiagram-v2
    [*] --> 未认证
    
    未认证 --> GitHub认证: 选择 GitHub OAuth
    未认证 --> 密码认证: 选择密码认证
    
    GitHub认证 --> OAuth回调: 跳转 GitHub
    OAuth回调 --> 验证Token: 获取 Code
    验证Token --> 已认证: Token 有效
    验证Token --> 认证失败: Token 无效
    
    密码认证 --> 验证密码: 提交密码
    验证密码 --> 生成Token: 密码正确
    验证密码 --> 认证失败: 密码错误
    生成Token --> 已认证: Token 存储
    
    已认证 --> 操作检查: 执行操作
    操作检查 --> 验证Token: 需要验证
    验证Token --> 已认证: Token 有效
    验证Token --> 未认证: Token 过期
    
    认证失败 --> 未认证: 重新认证
    已认证 --> [*]: 登出
```

## 关键特性说明

### 1. 异步处理
- **前端**: 使用 `async/await` 和 `Promise` 处理所有异步操作
- **API 调用**: 使用 `fetch` API 进行 HTTP 请求
- **文件操作**: 文件读取、Base64 转换都是异步的

### 2. 阻塞处理
- **目录创建**: 使用 `setTimeout` 延迟等待，确保 GitHub API 生效
- **重试机制**: 最多重试 3 次，每次重试间隔递增
- **顺序上传**: 使用 `for...of` 循环配合 `await` 实现顺序阻塞上传

### 3. 并发控制
- **文件上传**: 顺序上传（一个接一个），避免并发冲突
- **API 请求**: 每个请求独立执行，Vercel Serverless Functions 自动处理并发
- **前端渲染**: 使用事件循环和任务队列，非阻塞 UI 更新

### 4. 多进程/多实例
- **前端**: 单线程 JavaScript（浏览器主线程）
- **后端**: Vercel Serverless Functions（每个请求独立实例）
- **GitHub API**: 外部服务，支持并发请求

### 5. 错误处理
- **重试机制**: 自动重试失败的请求
- **错误捕获**: 使用 `try/catch` 和 `Promise.catch`
- **用户反馈**: 显示错误信息和重试提示

