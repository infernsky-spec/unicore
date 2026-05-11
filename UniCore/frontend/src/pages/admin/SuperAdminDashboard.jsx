import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from '../../components/shared/TiltCard';
import { 
  FiGlobe, 
  FiUsers, 
  FiBook, 
  FiActivity, 
  FiShield, 
  FiCpu, 
  FiZap,
  FiServer,
  FiLayers
} from "react-icons/fi";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#4ade80', '#60a5fa'];

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await api.get("/stats/global");
        setStats(res.data.data);
      } catch (err) {
        toast.error("Failed to link with global nodes");
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"/>
             <FiGlobe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-600 animate-pulse" />
          </div>
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Global Network...</p>
        </div>
      </div>
    );
  }

  const globalOverview = stats?.globalOverview || { totalUniversities: 0, totalStudents: 0, totalTeachers: 0, totalCourses: 0 };
  const uniBreakdown = stats?.uniBreakdown || [];

  return (
    <div className="p-0 space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">UniCore Global Oversight</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            NexaVision <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Oversight</span> Terminal
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl flex items-center gap-3">
              <FiServer className="text-amber-600" />
              <div>
                 <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Network Status</p>
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter leading-none">All Nodes Active</p>
              </div>
           </div>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Institutional Nodes", value: globalOverview.totalUniversities, icon: FiLayers, color: "amber" },
          { label: "Global Entities", value: globalOverview.totalStudents, icon: FiUsers, color: "orange" },
          { label: "Active Personnel", value: globalOverview.totalTeachers, icon: FiActivity, color: "blue" },
          { label: "Deployed Modules", value: globalOverview.totalCourses, icon: FiCpu, color: "emerald" },
        ].map((s, i) => (
          <TiltCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-3xl p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-3d group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
               <s.icon className="w-20 h-20" />
            </div>
            <div className="relative z-10">
               <p className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-4">{s.label}</p>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{s.value.toLocaleString()}</h3>
               <div className="mt-6 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '70%' }} 
                        className={`h-full bg-${s.color}-500 rounded-full`} 
                     />
                  </div>
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Growth 12%</span>
               </div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* University Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[32px] border border-slate-200 dark:border-slate-700 p-8 shadow-3d">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Node Entity Distribution</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Students</span>
                 </div>
              </div>
           </div>
           <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uniBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="shortName" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }} 
                  />
                  <Bar dataKey="students" fill="#d97706" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Node Registry List */}
        <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-3xl rounded-[32px] border border-slate-200 dark:border-slate-700 p-8 shadow-3d flex flex-col">
           <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-8">Synchronized Nodes</h3>
           <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
              {uniBreakdown.map((u, i) => (
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={u.id} 
                    className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 group hover:border-amber-500/50 transition-all flex items-center justify-between"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white shadow-inner border border-slate-200 dark:border-slate-700 group-hover:bg-amber-600 transition-colors group-hover:text-white">
                          {u.shortName}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none mb-1">{u.name}</p>
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{u.students} Entities Node</p>
                       </div>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 </motion.div>
              ))}
           </div>
           <button className="mt-8 w-full py-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95">
              Node Management Hub
           </button>
        </div>
      </div>

      {/* Network Traffic Simulation (Visual Only) */}
      <div className="bg-gradient-to-br from-[#111113] to-[#0c0c0e] p-10 rounded-[40px] border border-slate-800 shadow-3d relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
               <div className="w-8 h-8 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-600/20">
                  <FiZap className="text-slate-900 w-4 h-4" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white tracking-tighter leading-none mb-1 uppercase">Global Neural Traffic</h3>
                  <p className="text-amber-500 text-[7px] font-black uppercase tracking-[0.4em]">Real-time Event Synchronization</p>
               </div>
            </div>

            <div className="h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                     { time: '00:00', flow: 400 }, { time: '04:00', flow: 300 }, { time: '08:00', flow: 800 }, 
                     { time: '12:00', flow: 1200 }, { time: '16:00', flow: 900 }, { time: '20:00', flow: 1100 }, { time: '23:59', flow: 600 }
                  ]}>
                     <defs>
                        <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="flow" stroke="#d97706" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={3} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 border-t border-slate-800 pt-10">
               {[
                  { label: "API Requests", value: "842.1k", delta: "+12%" },
                  { label: "Data Throughput", value: "1.4 TB", delta: "+5.4%" },
                  { label: "Active Sessions", value: "14.2k", delta: "-2%" },
                  { label: "Neural Load", value: "42%", delta: "Stable" },
               ].map((m, i) => (
                  <div key={i}>
                     <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2">{m.label}</p>
                     <p className="text-2xl font-black text-white tracking-tighter leading-none mb-1">{m.value}</p>
                     <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">{m.delta}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
