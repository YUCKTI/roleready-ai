const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
let token = localStorage.getItem('rr_token') || '';
let onUnauthorized = () => {};

export const setToken = (t) => { token = t || ''; t ? localStorage.setItem('rr_token', t) : localStorage.removeItem('rr_token'); };
export const getToken = () => token;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(path, { method = 'POST', body, raw = false, auth = true } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(auth && token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { msg = (await res.json()).error || msg; } catch { /* ignore */ }
    if (res.status === 401 && auth) onUnauthorized();
    throw new Error(msg);
  }
  return raw ? res.blob() : res.json();
}

export const register = (b) => request('/api/auth/register', { body: b, auth: false });
export const login = (b) => request('/api/auth/login', { body: b, auth: false });
export const analyze = (b) => request('/api/analyze', { body: b });
export const evaluate = (b) => request('/api/interview/evaluate', { body: b });
export const downloadResumePdf = async (b) => {
  const blob = await request('/api/resume/pdf', { body: b, raw: true });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RoleReady_ATS_Resume.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
