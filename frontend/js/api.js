// ==========================================================================
// TASKFLOW - API CLIENT & AUTH STATE
// ==========================================================================

const API_BASE = '/api';

const API = {
  getToken: () => localStorage.getItem('taskflow_token'),
  setToken: (token) => localStorage.setItem('taskflow_token', token),
  clearToken: () => localStorage.removeItem('taskflow_token'),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem('taskflow_user'));
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('taskflow_user', JSON.stringify(user)),
  clearUser: () => localStorage.removeItem('taskflow_user'),

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await res.json();

      if (res.status === 401 && !endpoint.includes('/auth/')) {
        this.clearToken();
        this.clearUser();
        window.location.reload();
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      return { success: false, message: 'Network error or server unavailable.' };
    }
  },

  // Auth endpoints
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  async register(name, email, password) {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (res.success && res.token) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  async getMe() {
    return await this.request('/auth/me');
  },

  // Task endpoints
  async getTasks(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.dueDate) query.append('dueDate', params.dueDate);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return await this.request(`/tasks${qs}`);
  },

  async getTask(id) {
    return await this.request(`/tasks/${id}`);
  },

  async createTask(taskData) {
    return await this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async updateTask(id, updates) {
    return await this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(id) {
    return await this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  // Stats
  async getDashboardStats() {
    return await this.request('/stats/dashboard');
  }
};
