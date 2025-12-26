// 图片压缩 API - 代理 TinyJPG/TinyPNG API
import { setCorsHeaders } from './cors.js';

export default async function handler(req, res) {
  // 设置 CORS 头
  if (setCorsHeaders(req, res)) {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageData, fileName } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // 从环境变量读取 TinyJPG API KEY
    const apiKey = process.env.TINYJPG_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'TinyJPG API KEY not configured' });
    }

    // 将 base64 数据转换为 Buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 根据文件名或 base64 前缀确定图片类型
    let contentType = 'image/jpeg'; // 默认
    if (fileName) {
      const ext = fileName.toLowerCase().split('.').pop();
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    } else if (imageData.startsWith('data:image/')) {
      const match = imageData.match(/data:image\/(\w+);/);
      if (match) {
        const type = match[1].toLowerCase();
        if (type === 'png') contentType = 'image/png';
        else if (type === 'webp') contentType = 'image/webp';
        else if (type === 'jpeg' || type === 'jpg') contentType = 'image/jpeg';
      }
    }
    
    // 第一步：上传图片到 TinyJPG API
    // 根据文档：https://tinyjpg.com/developers/reference
    // POST /shrink 时，body 直接是图片的二进制数据
    // 使用 HTTP Basic Auth，格式为：api:YOUR_API_KEY
    const authHeader = Buffer.from(`api:${apiKey}`).toString('base64');
    
    const uploadResponse = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        // 不设置 Content-Type，让 API 自动检测图片类型
        // Content-Length 由 fetch 自动计算
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `HTTP ${uploadResponse.status}`;
      console.error('TinyJPG upload error:', errorMsg, uploadResponse.status);
      return res.status(uploadResponse.status).json({ 
        error: `TinyJPG upload failed: ${errorMsg}` 
      });
    }

    // 根据文档，压缩后的图片 URL 在 Location 头中
    const compressedImageUrl = uploadResponse.headers.get('Location');
    
    if (!compressedImageUrl) {
      console.error('No Location header in response');
      return res.status(500).json({ error: 'Invalid response from TinyJPG API: No Location header' });
    }

    // 第二步：下载压缩后的图片
    // 使用 Location 头中的 URL 下载压缩后的图片
    const downloadResponse = await fetch(compressedImageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
    });

    if (!downloadResponse.ok) {
      return res.status(downloadResponse.status).json({ 
        error: `Failed to download compressed image: HTTP ${downloadResponse.status}` 
      });
    }

    // 获取压缩后的图片数据
    const compressedBuffer = await downloadResponse.arrayBuffer();
    const compressedBase64 = Buffer.from(compressedBuffer).toString('base64');
    
    // 获取原始和压缩后的文件大小
    const originalSize = buffer.length;
    const compressedSize = compressedBuffer.byteLength;
    const saved = originalSize - compressedSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);

    return res.status(200).json({
      success: true,
      imageData: compressedBase64,
      originalSize,
      compressedSize,
      saved,
      savedPercent: parseFloat(savedPercent),
    });
  } catch (err) {
    console.error('Compress API error:', err);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
}
