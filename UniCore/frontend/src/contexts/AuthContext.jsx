import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    const stored = localStorage.getItem('eb_token');
    console.log('[AuthContext.loadUser] Token exists:', !!stored);
    if (!stored) {
      console.log('[AuthContext.loadUser] No token, skipping load');
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setError(null);
      api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout')), 8000)
      );

      const apiPromise = api.get('/auth/me');
      const { data } = await Promise.race([apiPromise, timeoutPromise]);
      console.log('[AuthContext.loadUser] User loaded successfully:', data.user.email);
      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error('[AuthContext.loadUser] Auth load error:', err.message);
      localStorage.removeItem('eb_token');
      localStorage.removeItem('eb_refresh');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[AuthContext] Mounting - attempting to load user');
    loadUser();
  }, [loadUser]);

  const login = async (email, passwordOrKey, role) => {
    console.log('[AuthContext.login] Role:', role);
    const uniStr = localStorage.getItem('eb_university');
    let universityId = null;
    if (uniStr) {
      try {
        const uniObj = JSON.parse(uniStr);
        // Use the shortName/id slug for the header — the middleware resolves it
        universityId = uniObj.id || uniObj.shortName || uniObj._id;
      } catch { }
    }

    // All roles (including admin and super_admin) use the standard /login endpoint with password
    const endpoint = '/auth/login';
    const bodyData = { email, password: passwordOrKey, ...(role && { role }) };

    // Send university via header so middleware can resolve the DB
    const headers = universityId ? { 'x-university-id': universityId } : {};

    try {
      console.log('[AuthContext.login] Sending request to', endpoint, 'with uni:', universityId);
      const { data } = await api.post(endpoint, bodyData, { headers });
      console.log('[AuthContext.login] Login response received:', { userId: data.user?.id, role: data.user?.role });

      localStorage.setItem('eb_token', data.token);
      localStorage.setItem('eb_refresh', data.refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      console.log('[AuthContext.login] User set successfully');
      return data.user;
    } catch (error) {
      console.error('[AuthContext.login] Login failed:', error);
      throw error;
    }
  };

  const register = async (payload) => {
    const uniStr = localStorage.getItem('eb_university');
    let universityId = null;
    if (uniStr) {
      try {
        const uniObj = JSON.parse(uniStr);
        // Use the shortName/id slug for the header
        universityId = uniObj.id || uniObj.shortName || uniObj._id;
      } catch { }
    }
    const finalPayload = { ...payload };
    // Send university via header so the middleware can correctly resolve it by slug
    const headers = universityId ? { 'x-university-id': universityId } : {};
    const { data } = await api.post('/auth/register', finalPayload, { headers });
    localStorage.setItem('eb_token', data.token);
    localStorage.setItem('eb_refresh', data.refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch { }
    localStorage.removeItem('eb_token');
    localStorage.removeItem('eb_refresh');
    // KEEP the university selection - user stays on same university
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out');
  };

  const updateUser = (u) => setUser(prev => ({ ...prev, ...u }));

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

