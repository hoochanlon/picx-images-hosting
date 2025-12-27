# picx-images-hosting 架构流程原理图

## 核心架构流程

```mermaid
flowchart TB
    subgraph "前端层 (Browser)"
        A[用户操作] --> B{操作类型}
        B -->|上传| C[认证检查]
        B -->|浏览| D[获取文件树]
        B -->|删除| C
        
        C -->|已认证| F[文件转Base64]
        C -->|未认证| E[认证流程]
        E -->|GitHub OAuth| E1[OAuth授权]
        E -->|密码| E2[密码验证]
        E1 --> F
        E2 --> F
        
        F --> G[目录检查/创建]
        G --> H[上传文件]
        H --> I[刷新列表]
        
        D --> K[渲染列表]
    end
    
    subgraph "API层 (Vercel)"
        E1 -->|OAuth回调| L1[GitHub OAuth API]
        E2 -->|POST /api/verify-password| L2[密码验证API]
        H -->|POST /api/github| L3[认证验证]
        L3 -->|Token有效| L4[调用GitHub API]
        D -->|GET /api/tree| L5[获取文件树API]
        B -->|GET /api/health| L6[健康检查API]
    end
    
    subgraph "GitHub API"
        L4 -->|PUT/DELETE| M1[Contents API]
        L5 -->|GET| M2[Git Trees API]
        L1 -->|OAuth| M3[User API]
        L6 -->|GET| M4[Repos API / Trees API]
    end
    
    style A fill:#e1f5ff
    style L3 fill:#fff4e6
    style L4 fill:#fff4e6
    style M1 fill:#f0f0f0
    style M2 fill:#f0f0f0
```

## 文件上传时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端
    participant API as Vercel API
    participant GitHub as GitHub API
    
    User->>Frontend: 选择文件上传
    Frontend->>Frontend: 检查认证状态
    
    alt 未认证
        Frontend->>User: 显示认证对话框
        User->>Frontend: 输入密码/授权
        Frontend->>API: 验证密码/OAuth
        API->>Frontend: 返回Token
    end
    
    Frontend->>Frontend: 文件转Base64
    Frontend->>Frontend: 检查目录是否存在
    
    alt 目录不存在
        Frontend->>API: 创建目录(.gitkeep)
        API->>GitHub: PUT创建目录
        GitHub->>API: 201成功
        API->>Frontend: 成功
        Frontend->>Frontend: 等待1-3秒(API同步)
    end
    
    Frontend->>API: POST上传文件
    API->>API: 验证Token
    API->>GitHub: PUT上传文件
    
    alt 上传成功
        GitHub->>API: 201
        API->>Frontend: 成功
        Frontend->>User: 显示成功
    else 409冲突
        GitHub->>API: 409
        API->>Frontend: 409
        Frontend->>Frontend: 创建目录后重试
    else 401未授权
        GitHub->>API: 401
        API->>Frontend: 401
        Frontend->>User: 重新认证
    end
    
    Frontend->>API: GET刷新文件列表
    API->>GitHub: GET文件树
    GitHub->>API: 返回文件树
    API->>Frontend: 返回数据
    Frontend->>Frontend: 渲染列表
```

## 关键处理机制

```mermaid
flowchart TB
    subgraph "文件上传策略"
        A1[多文件上传] --> A2[顺序上传 for+await]
        A2 --> A3[逐个阻塞等待]
        A3 --> A4[实时更新进度]
    end
    
    subgraph "目录创建机制"
        B1[检查目录] --> B2{是否存在}
        B2 -->|否| B3[创建.gitkeep]
        B3 --> B4[等待1-3秒]
        B4 --> B5[验证创建]
        B5 --> B6{成功?}
        B6 -->|否| B7[重试最多3次]
        B7 --> B3
        B6 -->|是| B8[继续上传]
        B2 -->|是| B8
    end
    
    subgraph "错误处理"
        C1[API请求] --> C2{状态码}
        C2 -->|200/201| C3[成功]
        C2 -->|409| C4[创建目录后重试]
        C2 -->|401| C5[重新认证]
        C2 -->|500| C6[延迟重试]
        C4 --> C1
        C6 --> C1
    end
    
    style A2 fill:#fff3e0
    style B3 fill:#fce4ec
    style C1 fill:#e8f5e9
```

## 认证流程

```mermaid
stateDiagram-v2
    [*] --> 未认证
    
    未认证 --> GitHub认证: OAuth授权
    未认证 --> 密码认证: 密码登录
    
    GitHub认证 --> OAuth回调: 跳转GitHub
    OAuth回调 --> 验证Token: 获取Code
    验证Token --> 已认证: 有效
    验证Token --> 认证失败: 无效
    
    密码认证 --> 验证密码: 提交密码
    验证密码 --> 生成Token: 正确
    验证密码 --> 认证失败: 错误
    生成Token --> 已认证: 存储Token
    
    已认证 --> 执行操作: 操作检查
    执行操作 --> 验证Token: API验证
    验证Token --> 已认证: 有效
    验证Token --> 未认证: 过期/无效
    
    认证失败 --> 未认证: 重试
    已认证 --> [*]: 登出
    
    note right of 已认证
        Token有效期24小时
        前端存储localStorage
    end note
```

## 核心机制说明

### 1. 认证机制
- **GitHub OAuth**: 用户授权后获取Token，后端验证Token有效性
- **密码认证**: 前端验证密码后生成Token，后端验证Token格式和时间戳
- **Token存储**: localStorage存储，有效期24小时

### 2. 目录创建策略
- **检查机制**: 通过检查`.gitkeep`文件判断目录是否存在
- **创建方式**: 创建`.gitkeep`文件来确保目录存在（GitHub特性）
- **同步等待**: GitHub API异步处理，需要等待1-3秒确保生效
- **重试机制**: 最多重试3次，每次间隔递增

### 3. 文件上传流程
- **顺序上传**: 使用`for...of + await`实现顺序阻塞上传，避免并发冲突
- **错误重试**: 409冲突时自动创建目录后重试，401时提示重新认证
- **进度反馈**: 实时更新上传进度，完成后自动刷新文件列表

### 4. 技术栈
- **前端**: 纯JavaScript，使用`async/await`处理异步，`fetch`进行API调用
- **后端**: Vercel Serverless Functions，每个请求独立实例
- **存储**: GitHub仓库，通过GitHub Contents API操作文件

### 5. 关键设计
- **安全性**: Token验证在后端完成，前端不存储敏感信息
- **可靠性**: 目录创建和文件上传都有重试机制
- **用户体验**: 实时进度反馈，错误提示清晰

