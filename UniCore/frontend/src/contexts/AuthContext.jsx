import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { mockLogin, mockRegister, mockGetMe, isBackendReachable } from '../utils/mockAuth';

const AuthContext = createContext(null);

// ──────────────────────────────────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────────────────────────────────
function saveSession(token, refreshToken) {
  localStorage.setItem('eb_token', token);
  if (refreshToken) localStorage.setItem('eb_refresh', refreshToken);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function clearSession() {
  localStorage.removeItem('eb_token');
  localStorage.removeItem('eb_refresh');
  delete api.defaults.headers.common['Authorization'];
}

// ──────────────────────────────────────────────────────────────────────────
//  Provider
// ──────────────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false); // true = running in offline demo mode
  const backendChecked = useRef(false);
  const backendAvailable = useRef(false);

  // ── Check backend availability once on mount ──────────────────────────
  const checkBackend = useCallback(async () => {
    if (backendChecked.current) return backendAvailable.current;
    const reachable = await isBackendReachable();
    backendChecked.current = true;
    backendAvailable.current = reachable;
    if (!reachable) {
      console.warn('[UniCore] Backend unreachable — switching to Demo Mode.');
      setIsDemo(true);
    }
    return reachable;
  }, []);

  // ── Load user from stored token ────────────────────────────────────────
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('eb_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const live = await checkBackend();

    if (live) {
      // ── Live backend path ──────────────────────────────────────────────
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await Promise.race([
          api.get('/auth/me'),
          new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 6000)),
        ]);
        setUser(data.user);
      } catch (_) {
        clearSession();
        setUser(null);
      }
    } else {
      // ── Demo / offline path ────────────────────────────────────────────
      const u = mockGetMe(token);
      if (u) setUser(u);
      else { clearSession(); setUser(null); }
    }

    setLoading(false);
  }, [checkBackend]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Login ──────────────────────────────────────────────────────────────
  const login = async (email, passwordOrKey, role) => {
    const uniStr = localStorage.getItem('eb_university');
    let universityId = null;
    try { const u = JSON.parse(uniStr); universityId = u.id || u.shortName || u._id; } catch (_) {}

    const live = await checkBackend();

    if (live) {
      // Live backend login
      try {
        const headers = universityId ? { 'x-university-id': universityId } : {};
        const { data } = await api.post('/auth/login',
          { email, password: passwordOrKey, ...(role && { role }) },
          { headers }
        );
        saveSession(data.token, data.refreshToken);
        setUser(data.user);
        setIsDemo(false);
        return data.user;
      } catch (err) {
        // If backend rejects, fall through to demo as last resort
        const msg = err.response?.data?.message;
        if (msg) throw new Error(msg);
        throw err;
      }
    } else {
      // Demo mode login
      const data = mockLogin(email, passwordOrKey, role);
      saveSession(data.token, data.refreshToken);
      setUser(data.user);
      setIsDemo(true);
      return data.user;
    }
  };

  // ── Register ───────────────────────────────────────────────────────────
  const register = async (payload) => {
    const uniStr = localStorage.getItem('eb_university');
    let universityId = null;
    try { const u = JSON.parse(uniStr); universityId = u.id || u.shortName || u._id; } catch (_) {}

    const live = await checkBackend();

    if (live) {
      try {
        const headers = universityId ? { 'x-university-id': universityId } : {};
        const { data } = await api.post('/auth/register', payload, { headers });
        saveSession(data.token, data.refreshToken);
        setUser(data.user);
        setIsDemo(false);
        return data.user;
      } catch (err) {
        const msg = err.response?.data?.message;
        if (msg) throw new Error(msg);
        throw err;
      }
    } else {
      // Demo mode registration
      const data = mockRegister(payload);
      saveSession(data.token, data.refreshToken);
      setUser(data.user);
      setIsDemo(true);
      return data.user;
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = async () => {
    if (backendAvailable.current) {
      try { await api.post('/auth/logout'); } catch (_) {}
    }
    clearSession();
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const updateUser = (u) => setUser((prev) => ({ ...prev, ...u }));

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isDemo, login, register, logout, updateUser, loadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
