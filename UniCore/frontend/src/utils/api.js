import axios from 'axios';
import toast  from 'react-hot-toast';

const api = axios.create({ 
  baseURL:'/api', 
headers:{'Content-Type':'application/json'},
  timeout: 10000,
  withCredentials: true
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('eb_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  
  // Add university header
  const u = localStorage.getItem('eb_university');
  if (u) {
    try {
      const uniData = JSON.parse(u);
      cfg.headers['X-University-Id'] = uniData.shortName || uniData.id || 'central';
    } catch {
      cfg.headers['X-University-Id'] = 'central';
    }
  }
  
  return cfg;
}, err => {
  console.error('Request error:', err);
  return Promise.reject(err);
});

api.interceptors.response.use(res => res, async err => {
  const orig = err.config;
  
  // Log timeout errors
  if (err.code === 'ECONNABORTED') {
    console.error('Request timeout:', orig.url);
  }
  
  if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {
    orig._retry = true;
    try {
      const refresh = localStorage.getItem('eb_refresh');
      const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh });
      localStorage.setItem('eb_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      orig.headers.Authorization = `Bearer ${data.token}`;
      return api(orig);
    } catch {
      localStorage.removeItem('eb_token');
      localStorage.removeItem('eb_refresh');
      window.location.href = '/login';
    }
  }
  
  const msg = err.response?.data?.message || err.message || 'Something went wrong';
  if (err.response?.status !== 401 && err.response?.status !== 404) {
    console.error('API error:', msg, err);
  }
  return Promise.reject(err);
});

export default api;
