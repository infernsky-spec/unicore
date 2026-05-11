import { FiX, FiAlertCircle, FiCheckCircle, FiInfo, FiSearch } from 'react-icons/fi';
import { HiAcademicCap } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from './TiltCard';
import { NumberTicker, ShinyText, MagneticButton, EvervaultCard } from './GithubFeatures';

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, color = 'bg-amber-600/10 text-amber-500', trend, loading }) {
  if (loading) return (
    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 animate-pulse">
      <div className="h-2 bg-slate-100 rounded w-1/2 mb-2" />
      <div className="h-4 bg-slate-100 rounded w-1/3" />
    </div>
  );
  
  return (
    <TiltCard 
      className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-3xl p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:border-amber-500/30 transition-all group preserve-3d"
    >
      <div className="flex items-start justify-between mb-1.5 relative z-10">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 shadow-inner border border-slate-200 dark:border-slate-700 ${color}`}>
          <Icon className="w-3 h-3" />
        </div>
        {trend && (
          <span className={`px-1.5 py-0.5 rounded-md text-[6px] font-black uppercase tracking-wider ${trend.positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[7px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] leading-none mb-0.5"><EvervaultCard text={title} /></p>
        <p className="text-[13px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">
          {typeof value === 'number' ? <NumberTicker value={value} /> : value}
        </p>
        {subtitle && <p className="text-[6.5px] font-bold text-slate-600 dark:text-slate-500 mt-1 opacity-60 tracking-tight leading-none">{subtitle}</p>}
      </div>
    </TiltCard>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-3xl', full: 'max-w-5xl' };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative bg-white/90 backdrop-blur-3xl rounded-[28px] shadow-3d w-full ${sizes[size]} max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden`}
          >
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tighter uppercase">{title}</h3>
              <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-amber-600 hover:text-slate-900 transition-all active:scale-90"><FiX className="w-3.5 h-3.5"/></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar text-slate-700 text-xs font-medium">{children}</div>
            {footer && <div className="px-6 py-5 bg-slate-100 border-t border-slate-200">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all shadow-lg ${danger ? 'bg-rose-600 shadow-rose-600/20' : 'bg-amber-600 shadow-amber-600/20 hover:bg-amber-700'}`}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      }>
      <p className="text-slate-600 font-bold text-xs leading-relaxed">{message}</p>
    </Modal>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 bg-slate-100 rounded-[22px] flex items-center justify-center mb-4 text-slate-600 border border-slate-200 shadow-inner group">
        {Icon ? <Icon className="w-7 h-7 group-hover:rotate-12 transition-transform" /> : <HiAcademicCap className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-black text-slate-900 mb-1">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-500 max-w-[200px] font-bold leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

// ─── LOADING SPINNER ──────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-14 h-14' };
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 border-3 border-slate-200 rounded-full" />
        <div className="absolute inset-0 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 px-1">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter mb-0.5 uppercase">
          <ShinyText text={title} />
        </h1>
        {subtitle && <p className="text-slate-500 dark:text-slate-400 font-black text-[8px] uppercase tracking-[0.3em] opacity-60">{subtitle}</p>}
      </motion.div>
      {actions && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 flex-wrap">
          {actions}
        </motion.div>
      )}
    </div>
  );
}

// ─── ALERT BANNER ─────────────────────────────────────────────────────────────
export function Alert({ type = 'info', title, message, onClose }) {
  const styles = {
    info: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: <FiInfo className="w-4 h-4 text-blue-400" /> },
    success: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', icon: <FiCheckCircle className="w-4 h-4 text-emerald-400" /> },
    warning: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', icon: <FiAlertCircle className="w-4 h-4 text-amber-400" /> },
    error: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: <FiAlertCircle className="w-4 h-4 text-red-400" /> },
  };
  const s = styles[type];
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-sm ${s.bg} ${s.text}`}>
      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-black text-[9px] uppercase tracking-widest leading-none mb-1.5">{title}</p>}
        {message && <p className="text-xs font-bold leading-relaxed opacity-90">{message}</p>}
      </div>
      {onClose && <button onClick={onClose} className="flex-shrink-0 hover:scale-110 transition-all p-1 hover:bg-slate-100 rounded-lg"><FiX className="w-3.5 h-3.5" /></button>}
    </motion.div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-slate-100 text-slate-600 border border-slate-200', 
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', 
    yellow: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border border-red-500/20', 
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-[0.1em] ${colors[color]}`}>{children}</span>;
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative group ${className}`}>
      <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors w-4 h-4 z-10" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className="input pl-14 w-full" />
    </div>
  );
}

// ─── DATA TABLE ───────────────────────────────────────────────────────────────
export function DataTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) return <LoadingSpinner />;
  return (
    <div className="bg-white/40 backdrop-blur-3xl border border-slate-200 rounded-[16px] overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-[7.5px] font-black text-slate-500 uppercase tracking-[0.3em]" style={col.width ? { width: col.width } : {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {!data?.length ? (
              <tr><td colSpan={columns.length} className="px-5 py-12"><EmptyState title="Neural Gap" subtitle={emptyMessage} /></td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={row._id || i} className="hover:bg-slate-100 transition-all group">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-[10px] font-bold text-slate-700">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ATTENDANCE PERCENTAGE BAR ────────────────────────────────────────────────
export function AttendanceBar({ percentage }) {
  const color = percentage >= 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : percentage >= 60 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Protocol Compliance</span>
        <span className={`text-[10px] font-black ${percentage >= 75 ? 'text-emerald-500' : percentage >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden shadow-inner border border-slate-200">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`${color} h-full rounded-full`} 
        />
      </div>
    </div>
  );
}
