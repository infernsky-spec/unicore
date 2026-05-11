import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiCommand, FiSearch, FiZap, FiBox, FiUser, FiSettings, FiBook } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

// FEATURE: Global Cursor Glow Effect
export const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 hidden lg:block"
      style={{
        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245,158,11,0.03), transparent 40%)`
      }}
    />
  );
};

// FEATURE: Command Palette (Cmd+K)
export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  let commands = [];
  if (user?.role === 'super_admin' || user?.role === 'admin') {
    commands = [
      { label: 'Access Dashboard', icon: FiBox, route: '/admin/dashboard' },
      { label: 'System Settings', icon: FiSettings, route: '/admin/settings' },
      { label: 'User Registry', icon: FiUser, route: '/admin/users' }
    ];
  } else if (user?.role === 'teacher') {
    commands = [
      { label: 'Access Dashboard', icon: FiBox, route: '/teacher/dashboard' },
      { label: 'Active Courses', icon: FiBook, route: '/teacher/courses' },
      { label: 'Attendance Registry', icon: FiUser, route: '/teacher/attendance' }
    ];
  } else {
    commands = [
      { label: 'Access Dashboard', icon: FiBox, route: '/student/dashboard' },
      { label: 'My Courses', icon: FiBook, route: '/student/courses' },
      { label: 'Student Profile', icon: FiUser, route: '/student/profile' }
    ];
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <FiSearch className="text-slate-400 w-5 h-5" />
              <input 
                autoFocus
                placeholder="Search institutional core or command..." 
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400"
              />
              <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase tracking-widest">ESC</span>
            </div>
            <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-900/50">
              {commands.map((cmd, i) => (
                <div key={i} onClick={() => { navigate(cmd.route); setOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer group transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-amber-500/50 group-hover:text-amber-500 transition-colors">
                    <cmd.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{cmd.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// FEATURE: Contextual AI Orb
export const AIOrb = () => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="fixed bottom-8 right-8 z-[90] group"
    >
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center cursor-pointer relative"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full blur-md animate-pulse" />
        <FiZap className="text-white w-6 h-6 relative z-10" />
      </motion.div>
      <div className="absolute bottom-full right-0 mb-4 w-64 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all pointer-events-none group-hover:pointer-events-auto origin-bottom-right">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Aura Sync Active</span>
        </div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
          The system is operating at peak efficiency. Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px]">Cmd+K</kbd> anytime to open the global command palette.
        </p>
      </div>
    </motion.div>
  );
};

// FEATURE: Neural Sync Ticker
export const NeuralSyncTicker = () => {
  return (
    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full overflow-hidden w-64 absolute left-1/2 -translate-x-1/2">
      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping flex-shrink-0" />
      <motion.div 
        animate={{ x: [0, -200, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="whitespace-nowrap flex gap-4 text-[8px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400"
      >
        <span>Global Node Matrix Online</span>
        <span>•</span>
        <span>Latency: 12ms</span>
        <span>•</span>
        <span>Data Encryption: Quantum AES-256</span>
      </motion.div>
    </div>
  );
};

// FEATURE: Time-of-Day Greeting
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning Cycle';
  if (hour < 18) return 'Midday Protocol';
  return 'Evening Oversight';
};
