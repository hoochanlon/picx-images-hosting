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
    
    // 第一步：上传图片到 TinyJPG API
    // 构造 multipart/form-data 请求体
    const boundary = `----WebKitFormBoundary${Date.now()}${Math.random().toString(36).substring(2, 15)}`;
    const CRLF = '\r\n';
    
    const formDataParts = [
      `--${boundary}${CRLF}`,
      `Content-Disposition: form-data; name="file"; filename="${fileName || 'image.jpg'}"${CRLF}`,
      `Content-Type: image/jpeg${CRLF}`,
      `${CRLF}`,
      buffer,
      `${CRLF}--${boundary}--${CRLF}`
    ];
    
    // 将各部分合并为单个 Buffer
    const formDataBuffers = formDataParts.map(part => 
      Buffer.isBuffer(part) ? part : Buffer.from(part, 'utf8')
    );
    const formDataBuffer = Buffer.concat(formDataBuffers);

    const uploadResponse = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': formDataBuffer.length.toString(),
      },
      body: formDataBuffer,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      const errorMsg = errorData.message || errorData.error || `HTTP ${uploadResponse.status}`;
      return res.status(uploadResponse.status).json({ 
        error: `TinyJPG upload failed: ${errorMsg}` 
      });
    }

    const uploadData = await uploadResponse.json();
    
    if (!uploadData.output || !uploadData.output.url) {
      return res.status(500).json({ error: 'Invalid response from TinyJPG API' });
    }

    // 第二步：下载压缩后的图片
    const downloadResponse = await fetch(uploadData.output.url, {
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
