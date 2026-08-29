/**
 * apiClient - HTTP client for CITYMIND backend with token refresh.
 */
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:4000/api/v1';

class ApiClient {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this._loadSession();
  }

  _loadSession() {
    try {
      const raw = localStorage.getItem('citymind_session');
      if (raw) {
        const data = JSON.parse(raw);
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
      }
    } catch (_) {}
  }

  _saveSession() {
    try {
      localStorage.setItem('citymind_session', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        user: this.user
      }));
    } catch (_) {}
  }

  clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    try { localStorage.removeItem('citymind_session'); } catch (_) {}
  }

  async request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401 && this.refreshToken) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        headers.Authorization = `Bearer ${this.accessToken}`;
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      }
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body?.error?.message || res.statusText);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  async tryRefresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      if (!res.ok) { this.clearSession(); return false; }
      const body = await res.json();
      this.accessToken = body.data.accessToken;
      this.refreshToken = body.data.refreshToken;
      this._saveSession();
      return true;
    } catch (_) {
      this.clearSession();
      return false;
    }
  }

  async register({ username, email, password, displayName }) {
    const body = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, displayName })
    });
    this.accessToken = body.data.accessToken;
    this.refreshToken = body.data.refreshToken;
    this.user = body.data.user;
    this._saveSession();
    return body.data;
  }

  async login({ email, password }) {
    const body = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.accessToken = body.data.accessToken;
    this.refreshToken = body.data.refreshToken;
    this.user = body.data.user;
    this._saveSession();
    return body.data;
  }

  logout() { this.clearSession(); }

  async me() {
    const body = await this.request('/auth/me');
    this.user = body.data;
    this._saveSession();
    return body.data;
  }

  async listCities() {
    const body = await this.request('/cities');
    return body.data;
  }

  async createCity(payload) {
    const body = await this.request('/cities', { method: 'POST', body: JSON.stringify(payload) });
    return body.data;
  }

  async getCity(id) {
    const body = await this.request(`/cities/${id}`);
    return body.data;
  }

  async updateCity(id, patch) {
    const body = await this.request(`/cities/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    return body.data;
  }

  async deleteCity(id) {
    const body = await this.request(`/cities/${id}`, { method: 'DELETE' });
    return body.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
