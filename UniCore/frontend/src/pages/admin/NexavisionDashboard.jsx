import CountChart from "../../components/NexavisionCharts/CountChart";
import AttendanceChart from "../../components/NexavisionCharts/AttendanceChart";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import TiltCard from "../../components/shared/TiltCard";

const NexavisionDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/stats/admin");
        setStats(res.data.data);
      } catch (err) {
        toast.error("Failed to load oversight metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const att = stats?.attendance || {};

  return (
    <div className="p-0 space-y-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
          Oversight Terminal
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Entities",
            value: overview.totalStudents || 0,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            ),
            color: "text-amber-500",
            bg: "bg-amber-600/10",
            bar: "bg-amber-600",
            w: "100%",
          },
          {
            label: "Personnel",
            value: overview.totalTeachers || 0,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
            ),
            color: "text-orange-500",
            bg: "bg-orange-600/10",
            bar: "bg-orange-600",
            w: "100%",
          },
          {
            label: "Active Modules",
            value: overview.totalCourses || 0,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4 7h1m-1-4h1m-1-4h1"
              />
            ),
            color: "text-blue-400",
            bg: "bg-blue-600/10",
            bar: "bg-blue-500",
            w: "100%",
          },
          {
            label: "Integrity",
            value: `${Math.round(att.avgAttendance || 0)}%`,
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
            color: "text-emerald-400",
            bg: "bg-emerald-600/10",
            bar: "bg-emerald-500",
            w: `${Math.round(att.avgAttendance || 0)}%`,
          },
        ].map((s, i) => (
          <TiltCard
            key={i}
            className="bg-white/40 backdrop-blur-xl p-4 rounded-[16px] border border-slate-200 hover:border-amber-500/30 transition-all shadow-xl group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest">
                  {s.label}
                </p>
                <p className="text-xl font-black text-slate-900 mt-0.5 tracking-tighter">
                  {s.value}
                </p>
              </div>
              <div
                className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {s.icon}
                </svg>
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div
                className={`${s.bar} h-full rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                style={{ width: s.w }}
              ></div>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-100/40 backdrop-blur-2xl p-4 rounded-[20px] border border-slate-200 shadow-xl">
          <CountChart />
        </div>
        <div className="bg-slate-100/40 backdrop-blur-2xl p-4 rounded-[20px] border border-slate-200 shadow-xl">
          <AttendanceChart />
        </div>
      </div>

      {/* Institutional Quick Links */}
      <div className="bg-gradient-to-br from-amber-600/10 via-[#111113] to-[#0c0c0e] p-6 rounded-[20px] border border-slate-200 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/5 blur-[80px] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-6 h-6 bg-amber-600 rounded-[8px] flex items-center justify-center shadow-lg shadow-amber-600/20">
              <svg
                className="w-3 h-3 text-slate-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              Access Control Hub
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Manage Units",
                icon: "📚",
                path: "courses",
                color: "bg-amber-600/10",
              },
              {
                label: "Sessions",
                icon: "📅",
                path: "semesters",
                color: "bg-blue-600/10",
              },
              {
                label: "Results",
                icon: "📊",
                path: "results",
                color: "bg-purple-600/10",
              },
              {
                label: "Analytics",
                icon: "📈",
                path: "statistics",
                color: "bg-emerald-600/10",
              },
            ].map((b, i) => (
              <button
                key={i}
                onClick={() =>
                  navigate(
                    `/${window.location.pathname.split("/")[1]}/${b.path}`,
                  )
                }
                className="p-4 rounded-[16px] bg-slate-100 border border-slate-200 hover:border-amber-500/50 hover:bg-slate-200 transition-all flex flex-col items-center gap-2 group/btn"
              >
                <div
                  className={`w-10 h-10 ${b.color} rounded-[10px] flex items-center justify-center text-lg group-hover/btn:scale-110 transition-transform shadow-inner`}
                >
                  {b.icon}
                </div>
                <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-500 group-hover/btn:text-slate-900 transition-colors">
                  {b.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NexavisionDashboard;
