import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
} from "../../components/shared/UI";
import {
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiShield,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";
import TeacherAttendance from "../teacher/Attendance";

export default function StudentAttendance() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("mark"); // 'mark' or 'manage'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, hRes] = await Promise.all([
          api.get("/courses/my/courses"),
          api.get("/attendance/student/me"),
        ]);
        setCourses(cRes.data.data || []);
        if (cRes.data.data?.length > 0)
          setSelectedCourse(cRes.data.data[0]._id);

        // Extract recent records from summaries or endpoint if available
        setHistory(hRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!pin || pin.length !== 6)
      return toast.error("Enter a valid 6-digit session PIN");
    if (!selectedCourse) return toast.error("Select the active course node");

    setSubmitting(true);
    try {
      const res = await api.post("/attendance/mark", {
        pin,
        courseId: selectedCourse,
      });
      toast.success(res.data.message || "Attendance verified successfully");
      setPin("");

      // Reload history
      const hRes = await api.get("/attendance/student/me");
      setHistory(hRes.data.data || []);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Verification failed. PIN may be expired or invalid.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (activeTab === "manage") {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("mark")}
            className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 hover:bg-slate-100 transition-all"
          >
            Verify Presence
          </button>
          <button className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-inner">
            Manage Sessions
          </button>
        </div>
        <TeacherAttendance />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Real-Time Verification"
        subtitle="Secure biometric and cryptographic attendance logging"
      />

      {user?.role === "course_rep" && (
        <div className="flex gap-4 border-b border-slate-200 pb-4">
          <button className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-inner">
            Verify Presence
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <FiSettings /> Manage Sessions
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
                <FiShield className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Active Protocol
                </h3>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                  Enter active session code
                </p>
              </div>
            </div>

            <form onSubmit={handleMarkAttendance} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Select Academic Node
                </label>
                <select
                  className="input h-14 text-sm font-black rounded-2xl bg-slate-100/50 border-slate-200"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                >
                  <option value="">-- Select Active Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Cryptographic PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="input h-20 text-center text-4xl font-black tracking-[0.5em] text-amber-500 placeholder-slate-700/50 rounded-2xl bg-slate-100/50 border-slate-200"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary h-14 text-xs tracking-[0.2em] shadow-xl shadow-amber-600/20"
              >
                {submitting ? "Verifying Protocol..." : "Authenticate Presence"}
              </button>
            </form>

            <div className="mt-8 bg-amber-600/5 p-5 rounded-2xl border border-amber-500/10 flex gap-4">
              <FiAlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
              <p className="text-[9px] font-black text-amber-500/80 leading-relaxed uppercase tracking-widest">
                Verification tokens expire automatically. Ensure you
                authenticate within the operational window set by the
                instructor.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d backdrop-blur-3xl">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">
            Verification Log
          </h3>

          {!history.length ? (
            <EmptyState
              title="No Records Found"
              subtitle="Your cryptographic verifications will appear here."
            />
          ) : (
            <div className="space-y-4">
              {history.map((record, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-100 rounded-[20px] border border-slate-200 hover:bg-slate-200 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${record.attendancePercentage >= 75 ? "bg-emerald-500/10 border-emerald-500/10 text-emerald-500" : "bg-amber-500/10 border-amber-500/10 text-amber-500"}`}
                    >
                      <FiCheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-amber-500 transition-colors">
                        {record.course?.title || "Unknown Node"}
                      </p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                        Integrity: {record.attendancePercentage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[8px] font-black text-slate-600 uppercase tracking-widest">
                      {record.totalSessions} Sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
