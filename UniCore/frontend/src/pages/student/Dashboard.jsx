import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  StatCard,
  LoadingSpinner,
  AttendanceBar,
  PageHeader,
  Badge,
} from "../../components/shared/UI";
import {
  formatCurrency,
  formatDate,
  timeAgo,
  getInitials,
} from "../../utils/helpers";
import {
  FiBook,
  FiClipboard,
  FiDollarSign,
  FiAward,
  FiAlertTriangle,
  FiBell,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  // Course Rep hooks
  const [courseRepStatus, setCourseRepStatus] = useState(null);
  const [courseRepLoading, setCourseRepLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [stRes, cRes, aRes, semRes] = await Promise.all([
          api.get("/stats/student"),
          api.get("/courses/my/courses"),
          api.get("/announcements?limit=4"),
          api.get("/semesters/current").catch(() => ({ data: { data: null } })),
        ]);
        setStats(stRes.data.data);
        setCourses(cRes.data.data || []);
        setAnnouncements(aRes.data.data || []);
        setSemester(semRes.data.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadCourseRepStatus = async () => {
      try {
        setCourseRepLoading(true);
        const res = await api.get("/course-rep/my-status");
        setCourseRepStatus(res.data);
      } catch {
        // No status
      } finally {
        setCourseRepLoading(false);
      }
    };
    if (user) loadCourseRepStatus();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const fees = stats?.fees;
  const academic = stats?.academic || {};
  const attSummaries = stats?.attendance?.summaries || [];
  const avgAtt = stats?.attendance?.average || 0;

  const renderCourseRepSection = () => {
    if (courseRepLoading) return null;
    if (courseRepStatus?.status === "approved") {
      return (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[24px] p-6 relative overflow-hidden group shadow-inner">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            <FiZap className="w-12 h-12 text-emerald-500" />
          </div>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[7px] font-black uppercase tracking-widest border border-emerald-500/10">
            Representative Node
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-3 mb-1.5 tracking-tighter uppercase">
            Elevated Access
          </h3>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-widest opacity-80">
            Access to attendance proxies and departmental communication nodes.
          </p>
        </div>
      );
    } else if (courseRepStatus?.status === "pending") {
      return (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[24px] p-6 shadow-inner">
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-lg text-[7px] font-black uppercase tracking-widest border border-amber-500/10">
            Pending Sync
          </span>
          <h3 className="text-lg font-black text-slate-900 mt-3 mb-1 tracking-tighter uppercase">
            Awaiting Approval
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-80">
            Request for{" "}
            <strong className="text-amber-500">
              {courseRepStatus.department}
            </strong>{" "}
            is in queue.
          </p>
        </div>
      );
    } else {
      return (
        <Link
          to="/student/course-rep-signup"
          className="block bg-gradient-to-br from-amber-600 to-orange-700 rounded-[24px] p-6 text-slate-900 shadow-2xl shadow-amber-600/20 hover:-translate-y-1 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200 blur-[30px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-slate-200 rounded-xl backdrop-blur-md border border-slate-200">
                <FiZap className="w-5 h-5" />
              </div>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-black tracking-tighter uppercase">
              Join Leadership
            </h3>
            <p className="text-amber-100/70 text-[9px] font-black uppercase tracking-widest mt-0.5">
              Unlock management tools.
            </p>
          </div>
        </Link>
      );
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        subtitle={`${user?.studentInfo?.programme?.name || "Academic Entity"} · Node L${user?.studentInfo?.level || "—"}`}
      />

      {/* Hero highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-3xl rounded-[20px] p-5 text-slate-900 relative overflow-hidden shadow-3d border border-slate-200"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="text-amber-500 text-[9px] font-black uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />{" "}
              Active Node Session
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">
              {semester?.name || "Academic Cycle"}
            </h2>
            {semester && (
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                Final Assessments: {formatDate(semester.examStartDate)}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="px-8 py-5 bg-slate-100 backdrop-blur-3xl border border-slate-200 rounded-[24px] shadow-inner text-center">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5">
                Registry ID Node
              </p>
              <p className="font-black text-xl tracking-tighter text-amber-500 font-mono">
                {user?.studentInfo?.indexNumber}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Enrolled Nodes"
          value={courses.length}
          icon={FiBook}
          color="bg-amber-600/10 text-amber-500"
        />
        <StatCard
          title="Participation Avg"
          value={`${avgAtt}%`}
          icon={FiClipboard}
          color={
            avgAtt >= 75
              ? "bg-emerald-600/10 text-emerald-500"
              : avgAtt >= 60
                ? "bg-amber-600/10 text-amber-500"
                : "bg-rose-600/10 text-rose-500"
          }
        />
        <StatCard
          title="Academic GPA"
          value={academic.gpa || "—"}
          icon={FiAward}
          color="bg-orange-600/10 text-orange-500"
        />
        <StatCard
          title="Fiscal Balance"
          value={fees ? formatCurrency(fees.balance) : "—"}
          icon={FiDollarSign}
          color={
            fees?.balance > 0
              ? "bg-rose-600/10 text-rose-500"
              : "bg-emerald-600/10 text-emerald-500"
          }
        />
      </div>

      {/* Attendance Warning */}
      {avgAtt < 75 && avgAtt > 0 && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-5 p-6 bg-rose-600/5 border border-rose-600/10 rounded-[24px] shadow-inner">
            <div className="w-11 h-11 bg-rose-600 text-slate-900 rounded-xl flex items-center justify-center shadow-2xl shadow-rose-600/20 flex-shrink-0">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-rose-500 text-[9px] uppercase tracking-[0.4em] leading-none mb-1.5">
                Compliance Warning
              </p>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest opacity-80 leading-relaxed">
                Attendance below 75% threshold. Mandatory consultation required.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-sm font-black text-slate-500 tracking-[0.4em] uppercase flex items-center gap-3">
                <FiBook className="text-amber-500" /> Active Course Nodes
              </h3>
              <Link
                to="/student/courses"
                className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-2"
              >
                Full Registry <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {!courses.length && (
                <div className="col-span-2 py-12 bg-white/30 rounded-[20px] border border-dashed border-slate-200 text-center text-slate-600 font-black text-[9px] uppercase tracking-[0.3em]">
                  No academic nodes found
                </div>
              )}
              {courses.slice(0, 4).map((c) => {
                const summary = attSummaries.find(
                  (a) => a.course?._id === c._id || a.course === c._id,
                );
                return (
                  <div
                    key={c._id}
                    className="p-6 bg-white/40 border border-slate-200 rounded-[20px] shadow-3d hover:border-amber-500/20 transition-all group backdrop-blur-3xl"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 truncate tracking-tighter uppercase group-hover:text-amber-500 transition-colors">
                          {c.title}
                        </p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-0.5">
                          {c.code}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[7px] font-black uppercase tracking-widest">
                        L{c.level}
                      </span>
                    </div>
                    {summary && (
                      <AttendanceBar
                        percentage={summary.attendancePercentage}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-sm font-black text-slate-500 tracking-[0.4em] uppercase flex items-center gap-3">
                <FiBell className="text-amber-500" /> Recent Broadcasts
              </h3>
            </div>
            <div className="space-y-4">
              {!announcements.length && (
                <div className="py-16 bg-white/30 rounded-[20px] text-center text-slate-600 font-black text-[10px] uppercase tracking-[0.3em] italic border border-dashed border-slate-200">
                  No active broadcasts
                </div>
              )}
              {announcements.map((a) => (
                <div
                  key={a._id}
                  className="p-5 bg-white/40 border border-slate-200 rounded-[24px] flex items-center gap-5 group hover:bg-slate-100 transition-all shadow-inner backdrop-blur-3xl"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full group-hover:scale-150 transition-all shadow-[0_0_10px] ${a.priority === "urgent" ? "bg-rose-500 shadow-rose-500/50" : "bg-amber-500 shadow-amber-500/50"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 group-hover:text-amber-500 transition-colors uppercase tracking-tight truncate">
                      {a.title}
                    </p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
          <section>
            <h3 className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase mb-6 ml-2">
              Authorization Status
            </h3>
            {renderCourseRepSection()}
          </section>

          <section>
            <h3 className="text-[9px] font-black text-slate-500 tracking-[0.4em] uppercase mb-5 ml-2">
              Fiscal Status Hub
            </h3>
            <div className="bg-white/40 border border-slate-200 rounded-[20px] p-5 shadow-3d relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2" />
              {fees ? (
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start px-1">
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1.5">
                        Liability Balance
                      </p>
                      <p
                        className={`text-2xl font-black tracking-tighter ${fees.balance > 0 ? "text-rose-500" : "text-emerald-500"}`}
                      >
                        {formatCurrency(fees.balance)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] border shadow-inner ${fees.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"}`}
                    >
                      {fees.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        Billed
                      </p>
                      <p className="text-[11px] font-black text-slate-900">
                        {formatCurrency(fees.totalBilled)}
                      </p>
                    </div>
                    <div className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 shadow-inner">
                      <p className="text-[7px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">
                        Authorized
                      </p>
                      <p className="text-[11px] font-black text-emerald-500">
                        {formatCurrency(fees.totalPaid)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/student/fees"
                    className="block text-center py-4 bg-amber-600 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-amber-700 transition-all shadow-2xl shadow-amber-600/20 active:scale-95 border border-amber-500/20"
                  >
                    Authorize Payment
                  </Link>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-600 font-black text-[9px] uppercase tracking-widest italic border border-dashed border-slate-200 rounded-[24px]">
                  No fiscal nodes detected
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
