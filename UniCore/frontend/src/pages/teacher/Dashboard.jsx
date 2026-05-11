import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { StatCard, LoadingSpinner } from "../../components/shared/UI";
import { formatDate, timeAgo } from "../../utils/helpers";
import { FiBook, FiUsers, FiClipboard, FiCalendar } from "react-icons/fi";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, cRes, aRes] = await Promise.all([
          api.get("/stats/teacher"),
          api.get("/courses/my/courses"),
          api.get("/announcements?limit=4"),
        ]);
        setStats(sRes.data.data);
        setCourses(cRes.data.data || []);
        setAnnouncements(aRes.data.data || []);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
          Welcome, {user?.teacherInfo?.rank || "Lecturer"} {user?.lastName} 👋
        </h1>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
          Institutional oversight terminal for active educators
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Course Load"
          value={stats?.totalCourses || 0}
          icon={FiBook}
          color="text-amber-500"
        />
        <StatCard
          title="Entity Base"
          value={stats?.totalStudents || 0}
          icon={FiUsers}
          color="text-blue-400"
        />
        <StatCard
          title="Sync Sessions"
          value={stats?.attendanceSessions || 0}
          icon={FiClipboard}
          color="text-emerald-500"
        />
        <StatCard
          title="Active Tracks"
          value={courses.length}
          icon={FiCalendar}
          color="text-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-xl backdrop-blur-3xl group">
          <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">
            My Modules
          </h3>
          {!courses.length && (
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center py-8">
              No nodes assigned
            </p>
          )}
          <div className="space-y-4">
            {courses.map((c) => (
              <div
                key={c._id}
                className="flex items-center gap-4 p-4 bg-slate-100 rounded-[20px] border border-slate-200 hover:bg-slate-200 transition-all group/item"
              >
                <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/10 group-hover/item:scale-105 transition-transform">
                  <span className="text-[10px] font-black text-amber-500">
                    {c.code?.slice(0, 3)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-xs text-slate-900 uppercase truncate">
                    {c.title}
                  </p>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                    {c.code} · L-{c.level} · {c.creditHours} CR
                  </p>
                </div>
                <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl text-[7px] font-black uppercase tracking-widest border border-emerald-500/10">
                  {c.enrolledStudents?.length || 0} Nodes
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d backdrop-blur-3xl">
          <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8">
            Recent Transmissions
          </h3>
          <div className="space-y-4">
            {!announcements.length && (
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center py-8">
                No active signals
              </p>
            )}
            {announcements.map((a) => (
              <div
                key={a._id}
                className="p-4 bg-slate-100 rounded-[20px] border border-slate-200 hover:bg-slate-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-black text-slate-900 uppercase leading-tight">
                    {a.title}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest flex-shrink-0 border shadow-inner ${a.priority === "urgent" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" : a.priority === "high" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-slate-500/10 text-slate-600 border-slate-500/10"}`}
                  >
                    {a.priority}
                  </span>
                </div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">
                  {timeAgo(a.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {stats?.recentSessions?.length > 0 && (
          <div className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-xl backdrop-blur-3xl lg:col-span-2">
            <h3 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-8">
              Attendance History Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-4 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2">
                      Course Unit
                    </th>
                    <th className="pb-4 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2 text-center">
                      Sync Date
                    </th>
                    <th className="pb-4 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2 text-center">
                      Live Nodes
                    </th>
                    <th className="pb-4 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2 text-center">
                      Protocol
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentSessions.map((s) => (
                    <tr
                      key={s._id}
                      className="group/row hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-2">
                        <span className="text-xs font-black text-slate-900 uppercase group-hover/row:text-amber-500 transition-colors">
                          {s.course?.title}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                        {formatDate(s.date)}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className="px-4 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">
                          {s.totalPresent} / {s.totalEnrolled}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span
                          className={`px-4 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-inner ${s.status === "open" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : s.status === "closed" ? "bg-slate-500/10 text-slate-600 border-slate-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"}`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
