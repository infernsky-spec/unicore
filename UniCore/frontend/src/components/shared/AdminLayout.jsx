import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getInitials } from '../../utils/helpers';
import { FiHome, FiUsers, FiBook, FiCalendar, FiAward, FiDollarSign, FiActivity, FiBell, FiBarChart2, FiLayers, FiMenu, FiX, FiChevronRight, FiLogOut, FiSettings, FiBriefcase, FiCpu, FiUser, FiClipboard, FiPlusCircle, FiFolder, FiFileText, FiZap, FiGrid, FiUserPlus, FiShield, FiGlobe, FiSun, FiMoon } from 'react-icons/fi';
import { HiAcademicCap } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

import { CursorGlow, CommandPalette, AIOrb, NeuralSyncTicker, getGreeting } from './EpicFeatures';

const Floating3DObject = ({ color, size, top, left, delay = 0, duration = 8 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      y: [0, -40, 0]
    }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    style={{
      position: 'fixed', top, left, width: size, height: size,
      background: color, borderRadius: '40% 60% 70% 30% / 40% 40% 60% 60%',
      filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none'
    }}
  />
);

const SideLink = ({ to, icon:Icon, label, end, onClick, theme }) => (
  <NavLink 
    to={to} 
    end={end} 
    onClick={onClick}
    className={({isActive})=>`group flex items-center gap-2.5 px-4 py-2.5 rounded-[18px] text-[11px] font-black transition-all duration-500 ${isActive ? theme.active : theme.inactive}`}
  >
    {({ isActive }) => (
      <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-2.5 w-full">
        <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-500 ${isActive?'scale-110':theme.iconHover}`} />
        <span className="tracking-tighter uppercase">{label}</span>
        {isActive && <motion.div layoutId="activePill" className={`ml-auto w-1 h-1 rounded-full ${theme.pill}`} />}
      </motion.div>
    )}
  </NavLink>
);

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const [open, setOpen]  = useState(false);
  const [uni,  setUni]   = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const s = localStorage.getItem('eb_university');
    if (s) { try { setUni(JSON.parse(s)); } catch {} }
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const themes = {
    neutral: {
      bg: 'bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-[#0a0a0c]',
      sidebar: 'bg-slate-900/60 border-r border-slate-800',
      active: 'bg-amber-500/10 text-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)] border border-amber-500/20',
      inactive: 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
      iconHover: 'group-hover:text-amber-500',
      pill: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
      accent: 'text-amber-500',
      objects: [
        { color: 'rgba(245, 158, 11, 0.03)', size: '500px', top: '-10%', left: '-5%' },
        { color: 'rgba(245, 158, 11, 0.02)', size: '350px', top: '60%', left: '70%' }
      ]
    },
    organic: {
      bg: 'bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-slate-100',
      sidebar: 'bg-white/60 border-r border-slate-200',
      active: 'bg-amber-600 text-slate-900 shadow-2xl shadow-amber-600/20',
      inactive: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
      iconHover: 'group-hover:text-amber-500',
      pill: 'bg-white',
      accent: 'text-amber-500',
      objects: [
        { color: 'rgba(245, 158, 11, 0.04)', size: '400px', top: '20%', left: '10%' },
        { color: 'rgba(245, 158, 11, 0.02)', size: '300px', top: '80%', left: '80%' }
      ]
    }
  };

  const theme = isDark ? themes.neutral : themes.organic;

  let navItems = [];
  if (user?.role === 'super_admin' || user?.role === 'admin') {
    navItems = [
      { to: '/admin/dashboard', icon: FiActivity, label: 'Analytics Core', end: true },
      { to: '/admin/users', icon: FiUsers, label: 'Entity Registry' },
      { to: '/admin/courses', icon: FiBook, label: 'Course Nodes' },
      { to: '/admin/classes', icon: FiLayers, label: 'Class Clusters' },
      { to: '/admin/semesters', icon: FiCalendar, label: 'Academic Cycles' },
      { to: '/admin/exams', icon: FiBook, label: 'Examinations' },
      { to: '/admin/announcements', icon: FiBell, label: 'Broadcasts' },
      { to: '/admin/settings', icon: FiSettings, label: 'System Directives' },
      { to: '/admin/subscription', icon: FiShield, label: 'Protocol License' },
    ];
  } else if (user?.role === 'teacher') {
    navItems = [
      { to: '/teacher/dashboard', icon: FiActivity, label: 'Oversight Terminal', end: true },
      { to: '/teacher/courses', icon: FiBook, label: 'Active Modules' },
      { to: '/teacher/attendance', icon: FiClipboard, label: 'Compliance Registry' },
      { to: '/teacher/grades', icon: FiAward, label: 'Evaluation Metrics' },
      { to: '/teacher/exams', icon: FiBook, label: 'Exams' },
      { to: '/teacher/resources', icon: FiFolder, label: 'Resources' },
    ];
  } else if (user?.role === 'dept_head') {
    navItems = [
      { to: '/dept-head/dashboard', icon: FiActivity, label: 'Department Core', end: true },
      { to: '/dept-head/teachers', icon: FiUsers, label: 'Educator Registry' },
      { to: '/dept-head/courses', icon: FiBook, label: 'Module Matrix' },
      { to: '/dept-head/reports', icon: FiBarChart2, label: 'Performance Logs' },
    ];
  } else if (user?.role === 'faculty_head') {
    navItems = [
      { to: '/faculty-head/dashboard', icon: FiActivity, label: 'Faculty Core', end: true },
      { to: '/faculty-head/departments', icon: FiLayers, label: 'Department Clusters' },
      { to: '/faculty-head/reports', icon: FiBarChart2, label: 'Global Reports' },
    ];
  } else if (user?.role === 'student') {
    navItems = [
      { to: '/student/dashboard', icon: FiActivity, label: 'Core Interface', end: true },
      { to: '/student/courses', icon: FiBook, label: 'Academic Nodes' },
      { to: '/student/attendance', icon: FiClipboard, label: 'Compliance Log' },
      { to: '/student/exams', icon: FiBook, label: 'Evaluations' },
      { to: '/student/results', icon: FiAward, label: 'Performance Metrics' },
      { to: '/student/fees', icon: FiDollarSign, label: 'Fiscal Registry' },
      { to: '/student/resources', icon: FiFolder, label: 'Data Archives' },
      { to: '/student/registration', icon: FiPlusCircle, label: 'Enrollment' },
      { to: '/student/ai', icon: FiZap, label: 'Neural Assistant' },
      { to: '/student/premium', icon: FiAward, label: 'Pro Upgrade' },
      { to: '/student/teacher-posts', icon: FiFileText, label: 'Educator Intel' },
    ];
  }

  const Sidebar = () => (
    <div className={`h-full flex flex-col pt-6 ${theme.sidebar} backdrop-blur-3xl transition-colors duration-1000 relative overflow-hidden`}>
      <div className="px-6 mb-8 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-10 h-10 rounded-[18px] flex items-center justify-center text-lg flex-shrink-0 shadow-lg overflow-hidden bg-white" 
          >
            {(uni?.logo?.startsWith('http') || uni?.logo?.startsWith('/logos/')) ? (
              <img src={uni.logo} alt={uni.shortName} className="w-full h-full object-contain p-1" />
            ) : (
              <img src="/edubridge-logo.png" alt="EduBridge" className="w-full h-full object-cover rounded-[18px]" />
            )}
          </motion.div>
          <div>
            <h1 className={`text-base font-black tracking-tighter uppercase leading-none ${isDark?'text-white':'text-slate-900'}`}>{uni?.shortName || 'EduBridge'}</h1>
            <p className="text-[7px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">Network Node</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar relative z-10">
        {navItems.map((item, index) => (
          <SideLink key={index} {...item} onClick={() => setOpen(false)} theme={theme} />
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-slate-100/10 relative z-10">
        <div 
          onClick={() => navigate((user?.role === 'admin' || user?.role === 'super_admin') ? '/admin/dashboard' : '/student/profile')}
          className={`flex items-center gap-2.5 p-3 rounded-[20px] shadow-sm mb-4 group cursor-pointer transition-all ${isDark?'bg-slate-800 border-slate-700':'bg-white border-slate-100 hover:shadow-md'}`}
        >
          <div className="w-8 h-8 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0 group-hover:scale-105 transition-transform">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="min-w-0">
            <p className={`text-[9px] font-black uppercase tracking-tight truncate leading-none mb-1 ${isDark?'text-white':'text-slate-900'}`}>{user?.firstName}</p>
            <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[15px] text-[8px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-transparent mb-4">
          <FiLogOut className="w-3 h-3"/> Disconnect
        </button>
        <div className="text-center space-y-0.5 opacity-60">
          <p className="text-[6px] font-black text-slate-500 uppercase tracking-[0.3em]">EduBridge Protocol</p>
          <p className="text-[5px] font-black text-slate-600 uppercase tracking-[0.3em]">Powered by NexaVision</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen overflow-hidden relative selection:bg-amber-500/30 transition-colors duration-1000 ${theme.bg}`}>
      
      {/* EPIC FEATURE INJECTIONS */}
      <CursorGlow />
      <CommandPalette />
      <AIOrb />

      {/* 3D Decorative Objects */}
      {theme.objects.map((obj, i) => <Floating3DObject key={i} {...obj} delay={i*2} />)}

      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.01)]">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={()=>setOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="absolute left-0 top-0 bottom-0 w-72 z-20">
              <Sidebar />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className={`backdrop-blur-2xl border-b px-6 py-3 flex items-center justify-between flex-shrink-0 ${isDark?'bg-slate-900/50 border-slate-800':'bg-white/40 border-slate-100'}`}>
          <div className="flex items-center gap-4">
            <button onClick={()=>setOpen(true)} className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isDark?'bg-slate-800 text-white':'bg-slate-50 text-slate-600'}`}><FiMenu className="w-4 h-4"/></button>
            <div>
              <h2 className={`text-[7px] font-black uppercase tracking-[0.4em] leading-none mb-1 ${theme.accent}`}>{getGreeting()}</h2>
              <p className={`text-xs font-black tracking-tight ${isDark?'text-white':'text-slate-900'}`}>Institutional Workspace</p>
            </div>
          </div>
          
          <NeuralSyncTicker />
          
          <div className="flex items-center gap-5">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[14px] border ${isDark?'bg-slate-800 border-slate-700':'bg-white border-slate-100 shadow-sm'}`}>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Link Active</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <motion.button
                onClick={toggle}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${isDark?'bg-slate-800 text-white hover:bg-slate-700':'bg-white border border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FiSun className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <FiMoon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <button 
                onClick={() => navigate((user?.role === 'admin' || user?.role === 'super_admin') ? '/admin/announcements' : '/student/teacher-posts')}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${isDark?'bg-slate-800 text-white hover:bg-slate-700':'bg-white border border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
              >
                <FiBell className="w-4 h-4 group-hover:rotate-12 transition-transform"/>
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 border border-white rounded-full"/>
              </button>
              
              <div 
                onClick={() => navigate((user?.role === 'admin' || user?.role === 'super_admin') ? '/admin/dashboard' : '/student/profile')}
                className="flex items-center gap-3 pl-5 border-l border-slate-100/20 cursor-pointer group"
              >
                <div className="w-9 h-9 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg flex items-center justify-center text-[9px] font-black shadow-lg group-hover:scale-105 transition-transform">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          
          {user?.needsActivation && window.location.pathname !== '/admin/subscription' && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[48px] p-12 text-center max-w-lg shadow-3d border border-amber-500/20"
              >
                <div className="w-24 h-24 bg-amber-500/10 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner text-4xl">🔒</div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">Protocol Restricted</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10">Access to the Institutional Core requires an active node key. Please complete your subscription to initialize full administrative authority.</p>
                <button onClick={() => navigate('/admin/subscription')} className="w-full py-4 bg-amber-600 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-700 transition-all shadow-2xl shadow-amber-600/20 active:scale-95">
                  Initialize Link
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Exports for other layouts that map to the main layout
export { AdminLayout as StudentLayout, AdminLayout as TeacherLayout, AdminLayout as DeptHeadLayout, AdminLayout as FacultyHeadLayout, AdminLayout as ParentLayout };
