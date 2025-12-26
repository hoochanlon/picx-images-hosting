// 测试图片压缩 API
// 使用方法: node test-compress-api.js <图片路径>

const fs = require('fs');
const path = require('path');

async function testCompress(imagePath) {
  if (!imagePath) {
    console.error('请提供图片路径');
    console.log('使用方法: node test-compress-api.js <图片路径>');
    console.log('示例: node test-compress-api.js test.jpg');
    process.exit(1);
  }

  // 检查文件是否存在
  if (!fs.existsSync(imagePath)) {
    console.error(`错误: 文件不存在: ${imagePath}`);
    process.exit(1);
  }

  try {
    console.log(`\n正在读取图片: ${imagePath}`);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const originalSize = imageBuffer.length;
    
    // 根据文件扩展名确定 MIME 类型
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    
    const fileName = path.basename(imagePath);
    
    console.log(`原始大小: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`图片类型: ${mimeType}`);
    console.log(`\n正在发送压缩请求到 http://localhost:3000/api/compress...`);
    
    const response = await fetch('http://localhost:3000/api/compress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: `data:${mimeType};base64,${base64}`,
        fileName: fileName,
      }),
    });
    
    const result = await response.json();
    
    console.log(`\n响应状态: ${response.status} ${response.statusText}`);
    
    if (result.success) {
      console.log(`\n✅ 压缩成功！`);
      console.log(`原始大小: ${(result.originalSize / 1024).toFixed(2)} KB`);
      console.log(`压缩后: ${(result.compressedSize / 1024).toFixed(2)} KB`);
      console.log(`节省: ${(result.saved / 1024).toFixed(2)} KB (${result.savedPercent}%)`);
      console.log(`压缩率: ${result.savedPercent}%`);
    } else {
      console.error(`\n❌ 压缩失败:`);
      console.error(`错误: ${result.error}`);
      if (result.message) {
        console.error(`详情: ${result.message}`);
      }
      process.exit(1);
    }
  } catch (err) {
    console.error(`\n❌ 测试失败:`);
    console.error(err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('\n提示: 请确保开发服务器正在运行 (vercel dev)');
    }
    
    process.exit(1);
  }
}

// 获取命令行参数
const imagePath = process.argv[2];
testCompress(imagePath);

