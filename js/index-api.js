// API 请求相关
async function apiRequest(payload) {
  // 添加认证 token（如果存在）
  if (window.uploadAuth) {
    // 优先使用 GitHub token
    const githubToken = window.uploadAuth.getGitHubToken && window.uploadAuth.getGitHubToken();
    if (githubToken) {
      payload.githubToken = githubToken;
    } else {
      // 如果没有 GitHub token，使用密码认证 token
      const authToken = window.uploadAuth.getAuthToken && window.uploadAuth.getAuthToken();
      if (authToken) {
        payload.authToken = authToken;
      }
    }
  }
  
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API 请求失败: ${res.status}`);
  }
  return res.json();
}

async function fetchTree() {
  const url = `${API_BASE}/api/tree`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const hint = body.message || `HTTP ${res.status}`;
    throw new Error(`获取仓库树失败：${hint}`);
  }
  return res.json();
}

async function fetchFileSha(path) {
  const url = `${API_BASE}/api/file?path=${encodeURIComponent(path)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const hint = body.message || `HTTP ${res.status}`;
    throw new Error(`获取文件信息失败：${hint}`);
  }
  const data = await res.json();
  return data.sha;
}

async function deleteFile(path) {
  const sha = await fetchFileSha(path);
  return apiRequest({
    action: 'delete',
    path,
    sha,
    message: `delete ${path}`,
  });
}

