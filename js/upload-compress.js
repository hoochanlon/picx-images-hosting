// upload-compress.js - 图片压缩功能（通过服务器端 API 代理）

(function() {
  'use strict';
  
  // 获取 API_BASE（支持上传页面和首页）
  function getApiBase() {
    // 优先使用 uploadState（上传页面）
    if (window.uploadState && typeof window.uploadState.API_BASE === 'function') {
      return window.uploadState.API_BASE();
    }
    // 否则从全局配置获取（首页）
    const config = window.APP_CONFIG || {};
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isVercelDev = isLocalhost && (window.location.port === '3000' || window.location.port === '3001');
    const isGitHubPages = config.GITHUB_PAGES_PATTERN && config.GITHUB_PAGES_PATTERN.test(window.location.hostname);
    const isCustomDomain = config.CUSTOM_DOMAINS && config.CUSTOM_DOMAINS.includes(window.location.hostname);
    const VERCEL_API_BASE = config.VERCEL_API_BASE || 'https://picx-images-hosting-brown.vercel.app';
    
    if (isLocalhost && !isVercelDev) {
      return VERCEL_API_BASE;
    } else if (isGitHubPages || isCustomDomain) {
      return VERCEL_API_BASE;
    } else {
      return window.location.origin;
    }
  }
  
  const state = window.uploadState;

// 检查文件是否为可压缩的图片格式
function isCompressibleImage(file) {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return imageTypes.includes(file.type.toLowerCase());
}

// 将文件转换为 base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 将 base64 转换为 File 对象
function base64ToFile(base64, fileName, mimeType) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mimeType || mime });
}

// 使用服务器端 API 压缩图片
async function compressImage(file) {
  if (!isCompressibleImage(file)) {
    // 如果不是可压缩的图片格式，直接返回原文件
    return file;
  }

  try {
    // 将文件转换为 base64
    const imageData = await fileToBase64(file);
    
    // 调用服务器端压缩 API
    const apiBase = getApiBase();
    const compressResponse = await fetch(`${apiBase}/api/compress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageData,
        fileName: file.name,
      }),
    });

    if (!compressResponse.ok) {
      const errorData = await compressResponse.json().catch(() => ({}));
      const errorMsg = errorData.error || errorData.message || `HTTP ${compressResponse.status}`;
      throw new Error(`压缩失败: ${errorMsg}`);
    }

    const compressData = await compressResponse.json();
    
    if (!compressData.success || !compressData.imageData) {
      throw new Error('压缩 API 返回数据格式错误');
    }

    // 将 base64 数据转换回 File 对象
    const compressedFile = base64ToFile(
      `data:${file.type};base64,${compressData.imageData}`,
      file.name,
      file.type
    );

    return compressedFile;
  } catch (err) {
    console.error('图片压缩失败:', err);
    // 如果压缩失败，返回原文件（不中断上传流程）
    console.warn('压缩失败，使用原文件上传');
    return file;
  }
}

// 批量压缩图片
async function compressImages(files, onProgress) {
  const results = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress(i + 1, total, file.name, 'compressing');
    }
    
    try {
      if (isCompressibleImage(file)) {
        const compressedFile = await compressImage(file);
        results.push(compressedFile);
        
        if (onProgress) {
          const originalSize = file.size;
          const compressedSize = compressedFile.size;
          const saved = originalSize - compressedSize;
          const savedPercent = ((saved / originalSize) * 100).toFixed(1);
          onProgress(i + 1, total, file.name, 'completed', {
            originalSize,
            compressedSize,
            saved,
            savedPercent,
          });
        }
      } else {
        // 不是图片或不可压缩的格式，直接使用原文件
        results.push(file);
        if (onProgress) {
          onProgress(i + 1, total, file.name, 'skipped');
        }
      }
    } catch (err) {
      console.error(`压缩 ${file.name} 失败:`, err);
      // 压缩失败时使用原文件
      results.push(file);
      if (onProgress) {
        onProgress(i + 1, total, file.name, 'failed');
      }
    }
  }
  
  return results;
}

// 导出到全局作用域
window.isCompressibleImage = isCompressibleImage;
window.compressImage = compressImage;
window.compressImages = compressImages;

})();

