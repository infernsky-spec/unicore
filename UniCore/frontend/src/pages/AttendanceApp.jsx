import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { HiAcademicCap } from "react-icons/hi";
import {
  FiLogIn,
  FiLogOut,
  FiPlus,
  FiX,
  FiRefreshCw,
  FiCheckCircle,
  FiUsers,
  FiClock,
  FiAlertTriangle,
  FiTarget,
  FiActivity,
  FiZap,
  FiLayout,
  FiList,
  FiPlusSquare,
  FiUserCheck,
  FiChevronRight,
} from "react-icons/fi";
import { formatDateTime, getInitials } from "../utils/helpers";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const ATTENDANCE_ROLES = [
  { value: "teacher", label: "Faculty Professor" },
  { value: "course_rep", label: "Unit Representative" },
  { value: "student", label: "Academic Participant" },
];

let socket = null;

export default function AttendanceApp() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("eb_token"));
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [view, setView] = useState("home"); // home | create | sessions | records | live

  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [createForm, setCreateForm] = useState({
    courseId: "",
    semesterId: "",
    venue: "",
    type: "Lecture",
    startTime: "",
  });
  const [creating, setCreating] = useState(false);

  const [pin, setPin] = useState("");
  const [studentCourses, setStudentCourses] = useState([]);
  const [selectedStudentCourse, setSelectedStudentCourse] = useState("");
  const [markLoading, setMarkLoading] = useState(false);
  const [markedSuccess, setMarkedSuccess] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState("");

  const [liveUpdates, setLiveUpdates] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [studentActiveSessions, setStudentActiveSessions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("eb_token");
    if (!stored) return;
    api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem("eb_token");
        delete api.defaults.headers.common["Authorization"];
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    socket = io("/", { transports: ["websocket"] });

    socket.on("attendance_marked", (data) => {
      setLiveUpdates((u) => [{ ...data, time: new Date() }, ...u].slice(0, 20));
      setSessionRecords((r) => {
        if (r.find((rec) => rec.student?._id === data.studentId)) return r;
        return [
          { ...data, markedAt: data.timestamp, status: data.status },
          ...r,
        ];
      });
    });

    socket.on("session_created", (data) => {
      if (user.role === 'student' || user.role === 'course_rep') {
        toast.success(`Active Attendance detected for Unit ${data.courseId}!`, { icon: '⚡' });
        fetchStudentActiveSessions();
      }
    });

    socket.on("session_closed", () => {
      toast("Session Locked", { icon: "🔒" });
      setActiveSession((s) => (s ? { ...s, status: "closed" } : null));
      setStudentActiveSessions([]);
    });

    return () => {
      socket?.disconnect();
    };
  }, [user]);

  const fetchStudentActiveSessions = useCallback(async () => {
    try {
      const res = await api.get("/attendance/active-sessions");
      setStudentActiveSessions(res.data.data || []);
    } catch { }
  }, []);

  useEffect(() => {
    if (user?.role === 'student' || user?.role === 'course_rep') {
      fetchStudentActiveSessions();
    }
  }, [user, fetchStudentActiveSessions]);

  useEffect(() => {
    let timer;
    if (activeSession && activeSession.status === 'open') {
      timer = setInterval(() => {
        const expiry = new Date(activeSession.pinExpiresAt).getTime();
        const now = new Date().getTime();
        const diff = expiry - now;
        if (diff <= 0) {
          setTimeLeft("EXPIRED");
          clearInterval(timer);
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "teacher" || user.role === "course_rep") {
      api.get("/teachers").then(res => setLecturers(res.data.data)).catch(() => { });
      api
        .get("/courses/my/courses")
        .then((r) => setCourses(r.data.data || []))
        .catch(() => { });
      api
        .get("/semesters")
        .then((r) => {
          setSemesters(r.data.data || []);
          const cur = r.data.data?.find((s) => s.isCurrent);
          if (cur) setCreateForm((f) => ({ ...f, semesterId: cur._id }));
        })
        .catch(() => { });
    }
    if (user.role === "student" || user.role === "course_rep") {
      api
        .get("/courses/my/courses")
        .then((r) => setStudentCourses(r.data.data || []))
        .catch(() => { });
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password || !loginForm.role) {
      toast.error("Incomplete Credentials");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await api.post("/auth/login", loginForm);
      localStorage.setItem("eb_token", res.data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      setToken(res.data.token);
      toast.success(`Identity Verified: Welcome ${res.data.user.firstName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification Failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("eb_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    setActiveSession(null);
    setView("home");
    setMarkedSuccess(null);
    toast.success("Session Terminated");
  };

  const handleCreateSession = async () => {
    if (!createForm.courseId || !createForm.semesterId) {
      toast.error("Unit and Period required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/attendance/sessions", createForm);
      setActiveSession(res.data.session);
      socket?.emit("join_course", createForm.courseId);
      toast.success("Intelligence Protocol Initialized");
      setView("live");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Protocol Initialization Failed",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCloseSession = async () => {
    if (
      !activeSession ||
      !window.confirm("Lock this protocol? Finalizing absences...")
    )
      return;
    try {
      await api.post(`/attendance/sessions/${activeSession._id}/close`);
      toast.success("Protocol Finalized");
      setActiveSession(null);
      setView("home");
    } catch { }
  };

  const handleMarkAttendance = async () => {
    if (!pin || pin.length !== 6) {
      toast.error("6-Digit Verification PIN Required");
      return;
    }
    if (!selectedStudentCourse) {
      toast.error("Unit Selection Required");
      return;
    }
    setMarkLoading(true);
    try {
      const res = await api.post("/attendance/mark", {
        pin,
        courseId: selectedStudentCourse,
      });
      setMarkedSuccess(res.data);
      toast.success(res.data.message);
      setPin("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transmission Rejected");
    } finally {
      setMarkLoading(false);
    }
  };

  const loadSessionRecords = async (session) => {
    try {
      const res = await api.get(`/attendance/sessions/${session._id}/records`);
      setSessionRecords(res.data.data || []);
      setActiveSession(session);
      socket?.emit("join_course", session.course?._id || session.course);
      setView("records");
    } catch { }
  };

  const loadSessions = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await api.get(`/attendance/courses/${courseId}`);
      setSessions(res.data.data || []);
    } catch { }
  };

  const [uni, setUni] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("eb_university");
    if (stored) {
      try { setUni(JSON.parse(stored)); } catch { }
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-5 relative overflow-hidden selection:bg-blue-500/30">
        <Toaster position="top-center" />

        {/* Background Ambience - CREAM AESTHETIC */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[var(--cream-bg)]">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/[0.1] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-200/[0.1] blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-sm relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-2xl border border-amber-100 overflow-hidden p-3">
              {uni?.logo?.startsWith('http') || uni?.logo?.startsWith('/logos/') ? (
                <img src={uni.logo} alt={uni.shortName} className="w-full h-full object-contain" />
              ) : (
                <HiAcademicCap className="w-10 h-10 text-amber-600" />
              )}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
              {uni?.shortName || "EduBridge"} Access
            </h1>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">
              {uni?.name || "Institutional Verification"}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleLogin}
            className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] space-y-6"
          >
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                Identity Role
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
                value={loginForm.role}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, role: e.target.value }))
                }
              >
                {ATTENDANCE_ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                Credential Email
              </label>
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="name@university.edu"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                Security Access
              </label>
              <input
                type="password"
                className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-6 py-4 text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:border-amber-500/50 transition-all"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-slate-900 text-slate-900 rounded-[24px] py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/10 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-30"
            >
              {loginLoading ? "Verifying..." : "Initialize Link"}
            </button>
            <p className="text-center pt-4">
              <a
                href="/login"
                className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
              >
                Return to Central Intelligence
              </a>
            </p>
          </motion.form>
        </div>
      </div>
    );
  }

  const isStaff = user.role === "teacher" || user.role === "course_rep";

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      <Toaster position="top-center" />

      {/* Cinematic Header */}
      <header className="bg-white/60 backdrop-blur-xl border-b border-slate-100 px-6 py-5 sticky top-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-900">
              <HiAcademicCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] leading-none mb-1">
                Active Identity
              </p>
              <p className="text-sm font-black text-slate-900 tracking-tight">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <FiLogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 pt-10">
        <AnimatePresence mode="wait">
          {/* ── STUDENT VIEW ── */}
          {user.role === "student" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="student"
            >
              {markedSuccess ? (
                <div className="bg-white rounded-[24px] border border-slate-100 p-12 text-center shadow-xl">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[20px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <FiCheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">
                    Transmission Verified
                  </h2>
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.2em] mb-10 ${markedSuccess.record?.status === "late" ? "text-amber-500" : "text-emerald-500"}`}
                  >
                    {markedSuccess.record?.status === "late"
                      ? `Temporal Variance Detected: LATE`
                      : "Optimal Alignment: PRESENT"}
                  </p>
                  <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                      Time Logged
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {formatDateTime(new Date())}
                    </p>
                  </div>
                  <button
                    onClick={() => setMarkedSuccess(null)}
                    className="w-full bg-slate-900 text-slate-900 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:bg-black transition-all"
                  >
                    New Verification
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm space-y-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                      Attendance Verification
                    </h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                      Synchronize with Faculty Session
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                        Lead Lecturer
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-amber-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
                        value={selectedLecturer}
                        onChange={(e) => setSelectedLecturer(e.target.value)}
                      >
                        <option value="">Select Lecturer</option>
                        {lecturers.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.firstName} {l.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                        Unit Assignment
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-amber-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
                        value={selectedStudentCourse}
                        onChange={(e) =>
                          setSelectedStudentCourse(e.target.value)
                        }
                      >
                        <option value="">Select Target Course</option>
                        {studentCourses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.code} — {c.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {studentActiveSessions.length > 0 && (
                      <div className="bg-amber-50 rounded-[24px] p-6 border border-amber-100 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                          <FiZap className="text-amber-600" />
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-amber-900">Active Protocols Detected</h3>
                        </div>
                        <div className="space-y-3">
                          {studentActiveSessions.map(s => (
                            <button
                              key={s._id}
                              onClick={() => setSelectedStudentCourse(s.course?._id || s.course)}
                              className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border border-amber-200 hover:border-amber-500 transition-all text-left"
                            >
                              <div>
                                <p className="text-[10px] font-black text-slate-900">{s.course?.title}</p>
                                <p className="text-[8px] font-black text-slate-500 uppercase">{s.course?.code} · {s.venue}</p>
                              </div>
                              <FiChevronRight className="text-amber-600" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                        6-Digit Access PIN
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-4 py-8 text-5xl font-black font-mono tracking-[0.4em] text-center text-slate-900 placeholder-slate-200 focus:outline-none focus:border-amber-500/50 transition-all"
                        placeholder="••••••"
                        value={pin}
                        onChange={(e) =>
                          setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                      />
                    </div>
                    <button
                      onClick={handleMarkAttendance}
                      disabled={
                        markLoading ||
                        pin.length !== 6 ||
                        !selectedStudentCourse
                      }
                      className="w-full bg-amber-600 text-slate-900 py-6 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-20 transition-all active:scale-95"
                    >
                      {markLoading ? "Transmitting..." : "Mark Presence"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── TEACHER / COURSE REP VIEW ── */}
          {isStaff && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="staff"
              className="space-y-8"
            >
              {view === "home" && (
                <div className="space-y-10">
                  <div className="bg-slate-900 text-slate-900 rounded-[24px] p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/20 blur-[100px] -mr-32 -mt-32" />
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-4">
                        Protocol Manager
                      </p>
                      <h2 className="text-4xl font-black tracking-tighter mb-8 leading-none">
                        Session <br />
                        Control
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setView("create")}
                          className="bg-amber-600 hover:bg-amber-500 text-slate-900 rounded-[24px] py-4 px-6 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-amber-600/20"
                        >
                          <FiPlusSquare /> New Session
                        </button>
                        <button
                          onClick={() => setView("sessions")}
                          className="bg-slate-200 hover:bg-white/20 text-slate-900 rounded-[24px] py-4 px-6 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                          <FiList /> View History
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4">
                      Managed Units
                    </p>
                    {courses.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          loadSessions(c._id);
                          setView("sessions");
                        }}
                        className="bg-white rounded-[20px] border border-slate-100 p-6 flex items-center gap-5 hover:shadow-xl hover:border-amber-500/20 transition-all cursor-pointer group"
                      >
                        <div className="w-14 h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-xs font-black text-amber-600 group-hover:bg-amber-600 group-hover:text-slate-900 transition-all shadow-inner">
                          {c.code?.slice(0, 3)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">
                            {c.title}
                          </p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            {c.code} · {c.enrolledStudents?.length || 0}{" "}
                            Participants
                          </p>
                        </div>
                        <FiChevronRight className="text-slate-700 group-hover:text-amber-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === "create" && (
                <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                        Initialize Session
                      </h2>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Deployment Configuration
                      </p>
                    </div>
                    <button
                      onClick={() => setView("home")}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-slate-900 transition-all"
                    >
                      <FiX className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                        Target Unit
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
                        value={createForm.courseId}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            courseId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Unit</option>
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.code} — {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                        Academic Period
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
                        value={createForm.semesterId}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            semesterId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Period</option>
                        {semesters.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                        Lead Lecturer
                      </label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
                        value={createForm.leadLecturerId}
                        onChange={(e) =>
                          setCreateForm((f) => ({
                            ...f,
                            leadLecturerId: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Lecturer</option>
                        {lecturers.map((l) => (
                          <option key={l._id} value={l._id}>
                            {l.firstName} {l.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                          Type
                        </label>
                        <select
                          className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
                          value={createForm.type}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              type: e.target.value,
                            }))
                          }
                        >
                          {["Lecture", "Lab", "Tutorial", "Seminar"].map(
                            (t) => (
                              <option key={t}>{t}</option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-4 mb-2 block">
                          Venue
                        </label>
                        <input
                          className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-8 py-5 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-500/50 transition-all"
                          placeholder="e.g. Hall A"
                          value={createForm.venue}
                          onChange={(e) =>
                            setCreateForm((f) => ({
                              ...f,
                              venue: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCreateSession}
                      disabled={creating}
                      className="w-full bg-amber-600 text-slate-900 py-6 rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-20 transition-all active:scale-95"
                    >
                      {creating ? "Initializing..." : "🚀 Launch Protocol"}
                    </button>
                  </div>
                </div>
              )}

              {view === "live" && activeSession && (
                <div className="space-y-8">
                  <div className="bg-emerald-600 text-slate-900 rounded-[24px] p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200 blur-[100px] -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />{" "}
                        Live Transmission
                      </div>
                      <div className="mb-8">
                        <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-1">Time Remaining</p>
                        <p className={`text-2xl font-black ${timeLeft === 'EXPIRED' ? 'text-red-400' : 'text-white'}`}>{timeLeft || '0:00'}</p>
                      </div>
                      <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.3em] mb-2">
                        Session PIN
                      </p>
                      <h2 className="text-6xl font-black font-mono tracking-[0.4em] mb-10 leading-none">
                        {activeSession.sessionPin}
                      </h2>
                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-slate-200 rounded-[20px] p-6">
                          <p className="text-3xl font-black leading-none mb-2">
                            {
                              sessionRecords.filter(
                                (r) =>
                                  r.status === "present" || r.status === "late",
                              ).length
                            }
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100">
                            Present
                          </p>
                        </div>
                        <div className="bg-slate-200 rounded-[20px] p-6">
                          <p className="text-3xl font-black leading-none mb-2">
                            {activeSession.totalEnrolled}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100">
                            Capacity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        Intelligence Feed
                      </h3>
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                        {sessionRecords.length} Detected
                      </span>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {liveUpdates.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 animate-fade-in"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${u.status === "present" ? "bg-emerald-500" : "bg-amber-500"}`}
                          />
                          <p className="text-xs font-black text-slate-700 flex-1">
                            Student Verified: {u.status}
                          </p>
                          <p className="text-[9px] font-black text-slate-600 uppercase">
                            {new Date(u.time).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setView("home")}
                      className="flex-1 bg-white border border-slate-100 text-slate-900 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleCloseSession}
                      className="flex-1 bg-red-500 text-slate-900 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20"
                    >
                      Lock Protocol
                    </button>
                  </div>
                </div>
              )}

              {view === "sessions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                      Session History
                    </h2>
                    <button
                      onClick={() => setView("home")}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600"
                    >
                      <FiX />
                    </button>
                  </div>
                  {sessions.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => loadSessionRecords(s)}
                      className="bg-white rounded-[20px] border border-slate-100 p-5 hover:shadow-xl hover:border-amber-500/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                            {s.course?.title || "Session"}
                          </p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                            {formatDateTime(s.date)} · {s.type}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${s.status === "open" ? "bg-emerald-500 text-slate-900" : "bg-slate-100 text-slate-500"}`}
                        >
                          {s.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-600">
                          <FiUserCheck className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {s.totalPresent} / {s.totalEnrolled}
                          </span>
                        </div>
                        {s.venue && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <FiTarget className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {s.venue}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "records" && activeSession && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 px-4">
                    <button
                      onClick={() => setView("sessions")}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600"
                    >
                      <FiX />
                    </button>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                        Analysis
                      </h2>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {formatDateTime(activeSession.date)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        l: "Present",
                        v: sessionRecords.filter((r) => r.status === "present")
                          .length,
                        c: "text-emerald-500",
                        bg: "bg-emerald-50",
                      },
                      {
                        l: "Late",
                        v: sessionRecords.filter((r) => r.status === "late")
                          .length,
                        c: "text-amber-500",
                        bg: "bg-amber-50",
                      },
                      {
                        l: "Absent",
                        v: sessionRecords.filter((r) => r.status === "absent")
                          .length,
                        c: "text-red-500",
                        bg: "bg-red-50",
                      },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className={`${s.bg} rounded-[20px] p-6 text-center border border-white`}
                      >
                        <p className={`text-2xl font-black mb-1 ${s.c}`}>
                          {s.v}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pb-10">
                    {sessionRecords.map((r, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-[28px] border border-slate-100 p-5 flex items-center gap-4"
                      >
                        <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-600 shadow-inner">
                          {getInitials(
                            r.student?.firstName,
                            r.student?.lastName,
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate leading-none mb-1">
                            {r.student?.firstName} {r.student?.lastName}
                          </p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            {r.student?.studentInfo?.indexNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${r.status === "present" ? "bg-emerald-500/10 text-emerald-500" : r.status === "late" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}
                          >
                            {r.status}
                          </span>
                          {r.minutesLate > 0 && (
                            <p className="text-[8px] font-black text-amber-500 uppercase mt-1">
                              {r.minutesLate}m Variance
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Bottom Navigation */}
      {isStaff && (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-3xl border border-amber-100 rounded-[20px] flex items-center gap-2 p-2 shadow-2xl z-50">
          {[
            { id: "home", icon: FiLayout, label: "Portal" },
            { id: "create", icon: FiPlusSquare, label: "Launch" },
            { id: "sessions", icon: FiList, label: "Logs" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-[24px] transition-all duration-500 ${view === item.id ? "bg-amber-600 text-slate-900 shadow-lg shadow-amber-600/20" : "text-slate-600 hover:text-amber-600"}`}
            >
              <item.icon className="w-5 h-5" />
              {view === item.id && (
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
