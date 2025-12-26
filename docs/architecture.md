---
title: 系统架构与流程
shortTitle: 架构流程
icon: fa-sitemap
order: 6
---

# picx-images-hosting 系统架构与流程

本文档详细说明了项目的多进程、同步异步、阻塞处理机制。

## 系统架构与异步处理流程

```mermaid
graph TB
    A[用户操作] --> B{操作类型}
    B --> C[上传]
    B --> D[加载]
    B --> E[删除]
    B --> F[认证]
    
    C --> C1[文件处理]
    C1 --> C2[API请求]
    
    D --> D1[获取数据]
    D1 --> D2[渲染]
    
    E --> E1[确认]
    E1 --> E2[删除请求]
    
    F --> F1[验证]
    F1 --> F2[存储Token]
    
    C2 --> H1[后端API]
    D1 --> H1
    E2 --> H1
    F1 --> H1
    
    H1 --> G1[GitHub API]
    
    style A fill:#e1f5ff
    style H1 fill:#fff4e6
    style G1 fill:#f0f0f0
```

## 异步操作时序图

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端
    participant API as Vercel API
    participant GitHub as GitHub API
    
    Note over User,GitHub: 文件上传流程
    
    User->>Frontend: 选择文件上传
    Frontend->>Frontend: 检查认证
    alt 未认证
        Frontend->>User: 显示对话框
        User->>Frontend: 输入密码
        Frontend->>API: 验证密码
        API->>Frontend: 返回 Token
    end
    
    Frontend->>Frontend: 文件转 Base64
    Frontend->>Frontend: 检查目录
    
    loop 目录创建重试
        Frontend->>API: 检查目录
        API->>GitHub: GET 文件
        GitHub->>API: 404
        API->>Frontend: 404
        Frontend->>API: 创建目录
        API->>GitHub: PUT 创建
        GitHub->>API: 201
        API->>Frontend: 201
        Frontend->>Frontend: 等待 1-3 秒
        Frontend->>API: 验证目录
        API->>GitHub: GET 验证
        GitHub->>API: 200
        API->>Frontend: 200
    end
    
    Frontend->>API: 上传文件
    API->>API: 验证 Token
    API->>GitHub: PUT 文件
    
    alt 上传成功
        GitHub->>API: 201
        API->>Frontend: 201
        Frontend->>User: 显示成功
    else 409 冲突
        GitHub->>API: 409
        API->>Frontend: 409
        Frontend->>Frontend: 重试上传
    else 401 未授权
        GitHub->>API: 401
        API->>Frontend: 401
        Frontend->>User: 重新认证
    end
    
    Frontend->>API: 刷新文件列表
    API->>GitHub: GET 文件树
    GitHub->>API: 200
    API->>Frontend: 200
    Frontend->>Frontend: 渲染列表
    Frontend->>User: 显示列表
```

## 并发与阻塞处理机制

```mermaid
graph TB
    A1[事件循环] --> A2[任务队列]
    A2 --> A3[宏任务]
    A2 --> A4[微任务]
    A3 --> A5[setTimeout]
    A4 --> A6[Promise]
    A4 --> A7[async/await]
    
    B1[文件列表] --> B2{策略}
    B2 --> B3[顺序上传]
    B2 --> B4[并发上传]
    B3 --> B5[阻塞等待]
    B4 --> B6[并行执行]
    B5 --> B7[更新进度]
    B6 --> B7
    
    C1[目录创建] --> C2[延迟等待]
    C2 --> C3[验证目录]
    C3 --> C4{结果}
    C4 --> C5[重试]
    C5 --> C6{次数<3?}
    C6 --> C7[错误]
    C4 --> C8[继续]
    
    D1[API 请求] --> D2{状态}
    D2 --> D3[成功]
    D2 --> D4[冲突]
    D2 --> D5[未授权]
    D2 --> D6[错误]
    D4 --> D7[重试]
    D5 --> D8[认证]
    D6 --> D9[延迟重试]
    
    style A1 fill:#e3f2fd
    style B3 fill:#fff3e0
    style C2 fill:#fce4ec
    style D1 fill:#e8f5e9
```

## 认证流程

```mermaid
graph TB
    A[未认证] --> B[GitHub认证]
    A --> C[密码认证]
    
    B --> D[OAuth回调]
    D --> E{验证Token}
    E --> F[已认证]
    E --> G[认证失败]
    
    C --> H{验证密码}
    H --> I[生成Token]
    H --> G
    I --> F
    
    F --> J[执行操作]
    J --> K{Token检查}
    K --> L[继续操作]
    K --> A1[重新认证]
    
    G --> A1
    F --> M[结束]
    A1 --> A
    
    style F fill:#c8e6c9
    style A fill:#ffcdd2
    style G fill:#ffcdd2
    style M fill:#e1f5ff
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

