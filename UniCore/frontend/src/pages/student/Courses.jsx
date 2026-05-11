import { useState, useEffect } from "react";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  PageHeader,
  DataTable,
  Modal,
  LoadingSpinner,
  EmptyState,
  AttendanceBar,
  Badge,
} from "../../components/shared/UI";
import {
  formatDate,
  formatCurrency,
  getFeesStatusBadge,
  getGradeColor,
  truncate,
} from "../../utils/helpers";
import {
  FiBook,
  FiClipboard,
  FiDownload,
  FiLink,
  FiInfo,
  FiCheck,
  FiAward,
  FiFolder,
} from "react-icons/fi";

// ─── COURSES ──────────────────────────────────────────────────────────────────
export function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api
      .get("/courses/my/courses")
      .then((r) => setCourses(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Academic Enrollment"
        subtitle="Manage your active course load and schedules"
        actions={
          <div className="flex items-center gap-3 bg-slate-100 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200 shadow-2xl">
            <FiBook className="text-amber-500" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
              {courses.length} Active Courses
            </span>
          </div>
        }
      />

      {!courses.length ? (
        <EmptyState
          icon={FiBook}
          title="No Enrollment Detected"
          subtitle="You haven't been enrolled in any courses for the current session."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              key={c._id}
              onClick={() => setSelected(c)}
              className="bg-slate-1000 p-5 rounded-[20px] border border-slate-200 shadow-2xl hover:border-amber-500/30 hover:shadow-amber-500/10 transition-all cursor-pointer group relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <FiBook className="w-24 h-24 text-amber-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 bg-amber-600/10 rounded-2xl flex items-center justify-center text-amber-500 font-black text-xs shadow-inner border border-amber-500/10">
                    {c.code?.slice(0, 4)}
                  </div>
                  <Badge color="yellow">Level {c.level}</Badge>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-amber-500 transition-colors leading-tight">
                  {c.title}
                </h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">
                  {c.code} · {c.creditHours} Credits
                </p>

                <div className="pt-6 border-t border-slate-200 space-y-3">
                  {c.primaryTeacher && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-black text-slate-600 border border-slate-200">
                        {c.primaryTeacher.firstName[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {c.primaryTeacher.firstName} {c.primaryTeacher.lastName}
                      </span>
                    </div>
                  )}
                  {c.schedule?.slice(0, 1).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      <span className="text-amber-500">📅</span> {s.day} ·{" "}
                      {s.startTime}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        size="lg"
      >
        {selected && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { l: "Course Code", v: selected.code },
                { l: "Academic Level", v: `Level ${selected.level}` },
                { l: "Credit Load", v: `${selected.creditHours} CR` },
                { l: "Semester", v: `SEM ${selected.semester}` },
              ].map(({ l, v }) => (
                <div key={l}>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    {l}
                  </p>
                  <p className="text-sm font-black text-slate-900">{v || "—"}</p>
                </div>
              ))}
            </div>

            {selected.description && (
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Overview
                </p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {selected.description}
                </p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                Instructional Team
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selected.teachers?.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center gap-4 p-4 bg-slate-100 border border-slate-200 rounded-[20px] shadow-inner"
                  >
                    <div className="w-10 h-10 bg-amber-600/10 text-amber-500 rounded-xl flex items-center justify-center text-xs font-black border border-amber-500/10">
                      {t.firstName?.[0]}
                      {t.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">
                        {t.firstName} {t.lastName}
                      </p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        Lecturer
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export function StudentAttendance() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/attendance/student")
      .then((r) => setSummaries(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Attendance Insights"
        subtitle="Detailed analysis of your course participation"
        actions={
          <div className="flex items-center gap-2 bg-amber-600/10 px-4 py-2 rounded-2xl border border-amber-500/10 shadow-2xl">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
              Real-time Sync
            </span>
          </div>
        }
      />

      {!summaries.length ? (
        <EmptyState
          icon={FiClipboard}
          title="No Records Found"
          subtitle="Your attendance data will be populated once course sessions begin."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {summaries.map((s) => (
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              key={s._id}
              className="bg-slate-1000 p-5 rounded-[20px] border border-slate-200 shadow-2xl hover:border-amber-500/30 hover:shadow-amber-500/10 transition-all relative overflow-hidden group backdrop-blur-2xl"
            >
              <div className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <FiClipboard className="w-24 h-24 text-amber-500" />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1 leading-tight group-hover:text-amber-500 transition-colors">
                      {s.course?.title}
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      {s.course?.code}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm font-black tracking-tighter shadow-inner border border-slate-200 ${s.attendancePercentage >= 75 ? "bg-emerald-500/10 text-emerald-500" : s.attendancePercentage >= 60 ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"}`}
                  >
                    {s.attendancePercentage}%
                  </div>
                </div>

                <div className="mb-8">
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.attendancePercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${s.attendancePercentage >= 75 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : s.attendancePercentage >= 60 ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]"}`}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                    <span>Protocol Compliance</span>
                    <span>Target 75%</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    {
                      l: "Present",
                      v: s.present,
                      c: "text-emerald-500",
                      bg: "bg-emerald-500/5",
                    },
                    {
                      l: "Absent",
                      v: s.absent,
                      c: "text-rose-500",
                      bg: "bg-rose-500/5",
                    },
                    {
                      l: "Late",
                      v: s.late,
                      c: "text-amber-500",
                      bg: "bg-amber-500/5",
                    },
                    {
                      l: "Excused",
                      v: s.excused,
                      c: "text-blue-500",
                      bg: "bg-blue-500/5",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className={`${stat.bg} rounded-[24px] p-4 text-center border border-slate-200 shadow-inner transition-transform group-hover:scale-105`}
                    >
                      <p
                        className={`text-lg font-black leading-none mb-1 ${stat.c}`}
                      >
                        {stat.v}
                      </p>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                        {stat.l}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Total Sessions: {s.totalSessions}
                  </p>
                  <div className="flex gap-2">
                    {s.isAtRisk && <Badge color="yellow">At Risk</Badge>}
                    {s.isCritical && <Badge color="red">Critical</Badge>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FEES ─────────────────────────────────────────────────────────────────────
export function StudentFees() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/fees/my-bill")
      .then((r) => setBills(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Financial Hub"
        subtitle="Secure management of your academic billing and history"
      />

      {!bills.length ? (
        <EmptyState
          title="No Billing History"
          subtitle="Your semester fee bills will be displayed here once generated."
        />
      ) : (
        bills.map((bill) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={bill._id}
            className="bg-slate-1000 p-6 rounded-[24px] border border-slate-200 shadow-3d relative overflow-hidden backdrop-blur-3xl"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
              <FiDownload className="w-32 h-32 text-amber-500" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-12 relative z-10">
              <div>
                <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  Statement of Account
                </p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                  {bill.semester?.name}
                </h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  {bill.billNumber} · Due {formatDate(bill.dueDate)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge color={bill.status === "Paid" ? "green" : "yellow"}>
                  {bill.status}
                </Badge>
                <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 shadow-xl">
                  <FiDownload />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
              {/* Left: Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                  Fee Itemization
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bill.feeStructure?.items?.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-slate-100 border border-slate-200 rounded-[24px] shadow-inner transition-all hover:bg-slate-200"
                    >
                      <span className="text-xs font-bold text-slate-600">
                        {item.name}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {bill.payments?.length > 0 && (
                  <div className="mt-12">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                      Verified Transactions
                    </p>
                    <div className="space-y-3">
                      {bill.payments.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-5 bg-slate-100 border border-slate-200 rounded-[20px] shadow-inner group hover:border-emerald-500/30 transition-all backdrop-blur-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/10">
                              <FiCheck />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-none mb-1">
                                {formatCurrency(p.amount)}
                              </p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                {p.method?.replace("_", " ")} · {p.reference}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {formatDate(p.paidAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Summary Card */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">
                  Balance Summary
                </p>
                <div className="bg-amber-600 rounded-[24px] p-5 text-slate-900 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] rounded-full" />
                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center">
                      <p className="text-amber-100/60 text-[10px] font-black uppercase tracking-widest">
                        Total Billed
                      </p>
                      <p className="text-lg font-black">
                        {formatCurrency(bill.totalBilled)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-amber-100/60 text-[10px] font-black uppercase tracking-widest">
                        Authorized Paid
                      </p>
                      <p className="text-lg font-black text-emerald-300">
                        {formatCurrency(bill.totalPaid)}
                      </p>
                    </div>
                    <div className="pt-8 border-t border-slate-200">
                      <p className="text-amber-100/40 text-[10px] font-black uppercase tracking-widest mb-2">
                        Remaining Liability
                      </p>
                      <p
                        className={`text-4xl font-black tracking-tighter ${bill.balance > 0 ? "text-rose-200" : "text-emerald-300"}`}
                      >
                        {formatCurrency(bill.balance)}
                      </p>
                    </div>
                    {bill.balance > 0 && (
                      <button className="w-full py-4 bg-white text-amber-600 text-xs font-black uppercase tracking-widest rounded-[24px] hover:bg-amber-50 transition-all shadow-xl shadow-black/20 active:scale-95">
                        Settle Balance
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ─── EXAMS ────────────────────────────────────────────────────────────────────
export function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/exams/my-timetable")
      .then((r) => setExams(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Examination Schedule"
        subtitle="Official timetable for your upcoming academic assessments"
      />

      {!exams.length ? (
        <EmptyState
          title="Schedule Pending"
          subtitle="Your examination timetable will be released once the registry confirms the session dates."
        />
      ) : (
        <div className="space-y-8">
          {exams.map((e) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={e._id}
              className="bg-slate-1000 p-5 rounded-[24px] border-l-[12px] border-l-amber-600 border border-slate-200 shadow-3d hover:shadow-amber-600/10 transition-all group backdrop-blur-2xl"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge color="yellow">{e.type}</Badge>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {e.course?.code}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8 leading-none group-hover:text-amber-500 transition-colors">
                    {e.course?.title}
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { l: "Assessment Date", v: formatDate(e.date) },
                      {
                        l: "Window",
                        v: `${e.startTime || "—"} - ${e.endTime || "—"}`,
                      },
                      { l: "Venue", v: e.venue || "TBA" },
                      { l: "Threshold", v: `${e.totalMarks} Marks` },
                    ].map(({ l, v }) => (
                      <div key={l}>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          {l}
                        </p>
                        <p className="text-sm font-black text-slate-900">{v}</p>
                      </div>
                    ))}
                  </div>

                  {e.instructions && (
                    <div className="mt-8 p-6 bg-slate-100 border border-slate-200 rounded-[20px] shadow-inner">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FiInfo /> Candidate Protocol
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {e.instructions}
                      </p>
                    </div>
                  )}
                </div>

                {e.chiefInvigilator && (
                  <div className="lg:w-72 bg-slate-100 border border-slate-200 rounded-[20px] p-5 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 blur-[50px] rounded-full" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">
                      Chief Invigilator
                    </p>
                    <div className="w-16 h-16 bg-amber-600 text-slate-900 rounded-[24px] flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-xl shadow-amber-600/20 relative z-10">
                      {e.chiefInvigilator.firstName?.[0]}
                      {e.chiefInvigilator.lastName?.[0]}
                    </div>
                    <p className="text-base font-black text-slate-900 leading-none mb-1 relative z-10">
                      {e.chiefInvigilator.firstName}{" "}
                      {e.chiefInvigilator.lastName}
                    </p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 relative z-10">
                      {e.chiefInvigilator.teacherInfo?.rank || "Staff"}
                    </p>

                    <div className="space-y-2 text-[10px] font-bold text-slate-600 relative z-10">
                      <p className="flex items-center justify-center gap-2">
                        ✉️ {e.chiefInvigilator.email}
                      </p>
                      {e.chiefInvigilator.phone && (
                        <p className="flex items-center justify-center gap-2">
                          📞 {e.chiefInvigilator.phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
export function StudentResults() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.studentInfo?.indexNumber) {
      api
        .get("/exams/results/my")
        .then((r) => setResults(r.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const gpa =
    results.length > 0
      ? (() => {
          let points = 0,
            credits = 0;
          results.forEach((r) => {
            const c = r.course?.creditHours || 3;
            points += (r.gradePoint || 0) * c;
            credits += c;
          });
          return credits > 0 ? (points / credits).toFixed(2) : "0.00";
        })()
      : "—";

  if (loading) return <LoadingSpinner />;

  if (!user?.studentInfo?.indexNumber) {
    return (
      <div className="space-y-10 pb-20">
        <PageHeader
          title="Academic Performance"
          subtitle="Your verified transcript and semester-wise results"
        />
        <div className="bg-slate-1000 backdrop-blur-3xl rounded-[24px] p-16 border border-slate-200 shadow-3d text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
            <FiAward className="w-64 h-64 text-amber-500" />
          </div>
          <div className="relative z-10 max-w-md mx-auto">
            <div className="w-20 h-20 bg-amber-600/10 rounded-[20px] flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner border border-amber-500/10">
              🔒
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
              Identity Verification Required
            </h3>
            <p className="text-slate-500 font-bold leading-relaxed mb-10 text-xs">
              Access to academic results is restricted to students with a
              verified institutional index number. Please update your profile or
              contact the registry to link your ID.
            </p>
            <button 
              onClick={() => navigate("/student/profile")}
              className="bg-amber-600 text-slate-900 font-black uppercase tracking-[0.2em] px-10 py-4 rounded-2xl shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95 text-[10px]"
            >
              Resolve Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Academic Performance"
        subtitle="Your verified transcript and semester-wise results"
      />

      {gpa !== "—" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-600 rounded-[24px] p-6 text-slate-900 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] rounded-full" />
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="text-center md:border-r md:border-slate-200 md:pr-12">
              <p className="text-amber-200 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                Cumulative GPA
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-7xl font-black tracking-tighter leading-none">
                  {gpa}
                </span>
                <span className="text-amber-200/50 text-sm font-bold">
                  / 4.0
                </span>
              </div>
              <p className="text-amber-100 text-[10px] font-black uppercase tracking-widest mt-4">
                Calculated Sessionally
              </p>
            </div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[
                {
                  l: "Total Credits",
                  v: results.reduce(
                    (s, r) => s + (r.course?.creditHours || 0),
                    0,
                  ),
                  c: "bg-slate-100",
                },
                {
                  l: "Courses Passed",
                  v: results.filter((r) => r.remark !== "Fail").length,
                  c: "bg-emerald-500/10 text-emerald-400",
                },
                {
                  l: "Under Review",
                  v: results.filter((r) => !r.grade).length,
                  c: "bg-slate-100",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-[20px] border border-slate-200 ${stat.c}`}
                >
                  <p className="text-2xl font-black mb-1">{stat.v}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-80">
                    {stat.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!results.length ? (
        <EmptyState
          title="No Results Published"
          subtitle="Your grades will be displayed here once your instructors finalize the assessment cycle."
        />
      ) : (
        <div className="bg-slate-1000 backdrop-blur-3xl rounded-[20px] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  {[
                    "Course",
                    "CA",
                    "Exam",
                    "Total",
                    "Grade",
                    "Points",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-slate-100 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900 mb-0.5 group-hover:text-amber-500 transition-colors">
                        {r.course?.title}
                      </p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {r.course?.code}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                      {r.continuousAssessment}
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-600">
                      {r.examScore}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900">
                        {r.totalScore}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`text-xl font-black tracking-tighter ${r.grade === "F" ? "text-rose-500" : "text-amber-500"}`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">
                      {r.gradePoint?.toFixed(1)}
                    </td>
                    <td className="px-8 py-6">
                      <Badge
                        color={
                          r.remark === "Pass" || r.remark === "Distinction"
                            ? "green"
                            : r.remark === "Fail"
                              ? "red"
                              : "gray"
                        }
                      >
                        {r.remark}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    const params = typeFilter ? `?type=${typeFilter}` : "";
    api
      .get(`/resources${params}`)
      .then((r) => setResources(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const trackDownload = async (id) => {
    try {
      await api.patch(`/resources/${id}/download`);
    } catch {}
  };

  const typeIcon = {
    Document: "📄",
    Video: "🎥",
    Link: "🔗",
    Slide: "📊",
    "Past Paper": "📋",
    Assignment: "📝",
    Other: "📦",
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Knowledge Repository"
        subtitle="A centralized vault of all course materials and academic assets"
        actions={
          <div className="flex gap-3">
            <select
              className="bg-slate-100 backdrop-blur-xl border border-slate-200 rounded-2xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:border-amber-500 shadow-2xl transition-all appearance-none cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Materials</option>
              {[
                "Document",
                "Video",
                "Link",
                "Slide",
                "Past Paper",
                "Assignment",
                "Other",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : !resources.length ? (
        <EmptyState
          title="Repository Empty"
          subtitle="Your lecturers haven't uploaded any materials yet. Check back later for updates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              key={r._id}
              className="bg-slate-1000 p-5 rounded-[20px] border border-slate-200 shadow-2xl hover:border-amber-500/30 hover:shadow-amber-500/10 transition-all group backdrop-blur-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <FiFolder className="w-24 h-24 text-amber-500" />
              </div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="w-14 h-14 bg-amber-600/10 rounded-[24px] flex items-center justify-center text-3xl group-hover:bg-amber-600/20 transition-all shadow-inner border border-amber-500/10">
                  {typeIcon[r.type] || "📁"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-slate-900 mb-1 leading-tight group-hover:text-amber-500 transition-colors">
                    {r.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {r.course && (
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                        {r.course.code}
                      </span>
                    )}
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {r.type}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6 line-clamp-2">
                      {r.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      Authored by {r.uploadedBy?.firstName}
                    </p>
                    <div className="flex gap-2">
                      {r.filePath && (
                        <a
                          href={r.filePath}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => trackDownload(r._id)}
                          className="p-2.5 bg-amber-600/10 text-amber-500 rounded-xl hover:bg-amber-600 hover:text-slate-900 transition-all shadow-lg border border-amber-500/10"
                        >
                          <FiDownload className="w-4 h-4" />
                        </a>
                      )}
                      {r.externalUrl && (
                        <a
                          href={r.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-slate-900 transition-all shadow-lg border border-blue-500/10"
                        >
                          <FiLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentCourses;
