# 图片压缩功能测试指南

## 方法 1: 使用 curl 直接测试 API

### 1.1 测试环境变量是否设置

首先确保 `.env.local` 文件存在并包含 API KEY：

```bash
# Windows PowerShell
Get-Content .env.local

# 或 Linux/Mac
cat .env.local
```

应该看到：
```
TINYJPG_API_KEY=TqX2RmGgdFWRWtnpZQVZsmBPfnTmHRNJ
```

### 1.2 使用 curl 测试 TinyJPG API（直接测试）

```bash
# 准备一张测试图片（例如 test.jpg）
curl https://api.tinify.com/shrink \
     --user api:TqX2RmGgdFWRWtnpZQVZsmBPfnTmHRNJ \
     --data-binary @test.jpg \
     --dump-header /dev/stdout
```

如果成功，会返回：
- HTTP 201 Created
- Location 头包含压缩后的图片 URL
- JSON 响应包含输入图片信息

### 1.3 测试我们的代理 API

启动开发服务器后（`vercel dev` 或 `npm run dev`），测试我们的 API：

```bash
# 将图片转换为 base64
# Windows PowerShell
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("test.jpg"))
$json = @{
    imageData = "data:image/jpeg;base64,$base64"
    fileName = "test.jpg"
} | ConvertTo-Json

# 发送请求
Invoke-RestMethod -Uri "http://localhost:3000/api/compress" `
    -Method POST `
    -ContentType "application/json" `
    -Body $json
```

或者使用 curl（需要先转换 base64）：

```bash
# Linux/Mac
base64 test.jpg > test_base64.txt
# 然后构造 JSON 请求
curl -X POST http://localhost:3000/api/compress \
  -H "Content-Type: application/json" \
  -d "{\"imageData\":\"data:image/jpeg;base64,$(cat test_base64.txt)\",\"fileName\":\"test.jpg\"}"
```

## 方法 2: 在浏览器中测试

### 2.1 确保环境变量已设置

1. 在项目根目录创建 `.env.local` 文件
2. 添加内容：
   ```
   TINYJPG_API_KEY=TqX2RmGgdFWRWtnpZQVZsmBPfnTmHRNJ
   ```

### 2.2 启动开发服务器

```bash
# 如果使用 Vercel CLI
vercel dev

# 或使用其他方式启动
npm run dev
```

**重要**：修改 `.env.local` 后必须重启服务器！

### 2.3 在浏览器中测试

1. 打开 `http://localhost:3000/upload.html`
2. 确保"图片压缩"开关已启用（默认已启用）
3. 选择一张图片上传
4. 查看上传进度，应该看到：
   - "正在压缩图片..."
   - "压缩中: 文件名 (1/1)"
   - "文件名: 已压缩 X% (节省 XMB)"

### 2.4 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
- **Console** 标签：查看是否有错误信息
- **Network** 标签：查看 `/api/compress` 请求的响应

## 方法 3: 检查服务器日志

在运行 `vercel dev` 的终端中，查看：
- API 请求日志
- 错误信息
- 环境变量是否加载

## 方法 4: 使用 Node.js 脚本测试

创建一个测试脚本 `test-compress-api.js`：

```javascript
const fs = require('fs');
const path = require('path');

async function testCompress() {
  // 读取测试图片
  const imagePath = path.join(__dirname, 'test.jpg'); // 替换为你的测试图片路径
  const imageBuffer = fs.readFileSync(imagePath);
  const base64 = imageBuffer.toString('base64');
  
  const response = await fetch('http://localhost:3000/api/compress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageData: `data:image/jpeg;base64,${base64}`,
      fileName: 'test.jpg',
    }),
  });
  
  const result = await response.json();
  console.log('Response status:', response.status);
  console.log('Response:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log(`\n压缩成功！`);
    console.log(`原始大小: ${(result.originalSize / 1024).toFixed(2)} KB`);
    console.log(`压缩后: ${(result.compressedSize / 1024).toFixed(2)} KB`);
    console.log(`节省: ${(result.saved / 1024).toFixed(2)} KB (${result.savedPercent}%)`);
  } else {
    console.error('压缩失败:', result.error);
  }
}

testCompress().catch(console.error);
```

运行：
```bash
node test-compress-api.js
```

## 常见问题排查

### 问题 1: "TinyJPG API KEY not configured"

**解决方案**：
1. 确认 `.env.local` 文件存在
2. 确认文件内容正确（没有多余空格）
3. **重启开发服务器**

### 问题 2: "No Location header in response"

**可能原因**：
- API KEY 无效
- 请求格式不正确
- 网络问题

**解决方案**：
- 检查 API KEY 是否正确
- 查看服务器日志中的详细错误信息
- 使用 curl 直接测试 TinyJPG API

### 问题 3: 压缩失败但使用原文件上传

**这是正常的容错机制**：
- 如果压缩失败，会自动使用原文件
- 查看控制台错误信息了解失败原因

## 预期结果

成功时应该看到：
- 上传进度显示压缩信息
- 文件大小明显减小（通常 30-70%）
- 图片质量基本保持不变
- 上传成功

