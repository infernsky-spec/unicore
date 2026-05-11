import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  LoadingSpinner,
  EmptyState,
  Alert,
} from "../../components/shared/UI";
import { formatDate, formatDateTime } from "../../utils/helpers";
import { FiPlus, FiX, FiClipboard, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionRecords, setSessionRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    semesterId: "",
    venue: "",
    type: "Lecture",
    startTime: "",
    notes: "",
  });

  // Safely update state
  const safeSetShowCreate = useCallback((value) => {
    try {
      setShowCreate(value);
    } catch (err) {
      console.error("Error setting showCreate:", err);
    }
  }, []);

  const safeSetShowRecords = useCallback((value) => {
    try {
      setShowRecords(value);
    } catch (err) {
      console.error("Error setting showRecords:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get("/courses/my/courses"),
          api.get("/semesters"),
        ]);
        setCourses(cRes.data.data || []);
        setSemesters(sRes.data.data || []);
        const current = sRes.data.data?.find((s) => s.isCurrent);
        if (current) setForm((f) => ({ ...f, semesterId: current._id }));
      } catch {}
    };
    load();
  }, []);

  const loadSessions = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/attendance/courses/${courseId}`);
      setSessions(res.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (id) => {
    setSelectedCourse(id);
    setForm((f) => ({ ...f, courseId: id }));
    if (id) loadSessions(id);
  };

  const handleCreate = async () => {
    if (!form.courseId || !form.semesterId) {
      toast.error("Course and semester required");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/attendance/sessions", form);
      try {
        setActiveSession(res.data.session);
      } catch (err) {
        console.error("Error setting active session:", err);
      }
      toast.success("Attendance session created!");
      safeSetShowCreate(false);
      loadSessions(form.courseId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create session");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (sessionId) => {
    if (
      !window.confirm("Close this session? Absent students will be recorded.")
    )
      return;
    try {
      await api.post(`/attendance/sessions/${sessionId}/close`);
      toast.success("Session closed. Absences recorded.");
      try {
        setActiveSession(null);
      } catch (err) {
        console.error("Error clearing active session:", err);
      }
      loadSessions(selectedCourse);
    } catch {}
  };

  const viewRecords = async (session) => {
    try {
      const res = await api.get(`/attendance/sessions/${session._id}/records`);
      try {
        setSessionRecords(res.data.data || []);
      } catch (err) {
        console.error("Error setting records:", err);
      }
      safeSetShowRecords(true);
    } catch (err) {
      console.error("Error fetching records:", err);
      toast.error("Failed to load records");
    }
  };

  const recordCols = [
    {
      key: "student",
      label: "Student",
      render: (r) => (
        <div>
          <p className="font-medium text-sm">
            {r.student?.firstName} {r.student?.lastName}
          </p>
          <p className="text-xs text-slate-600">
            {r.student?.studentInfo?.indexNumber}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.status === "present" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : r.status === "absent" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" : "bg-amber-500/10 text-amber-500 border-amber-500/10"}`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "markedAt",
      label: "Time",
      render: (r) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {formatDateTime(r.markedAt)}
        </span>
      ),
    },
    {
      key: "minutesLate",
      label: "Late By",
      render: (r) =>
        r.minutesLate > 0 ? (
          <span className="text-rose-500 font-black text-[10px] uppercase">
            {r.minutesLate} min
          </span>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    {
      key: "method",
      label: "Method",
      render: (r) => (
        <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest">
          {r.method}
        </span>
      ),
    },
  ];

  const sessionCols = [
    { key: "date", label: "Date", render: (s) => formatDate(s.date) },
    {
      key: "type",
      label: "Type",
      render: (s) => (
        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/10">
          {s.type}
        </span>
      ),
    },
    {
      key: "venue",
      label: "Venue",
      render: (s) => (
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          {s.venue || "—"}
        </span>
      ),
    },
    {
      key: "present",
      label: "Present",
      render: (s) => (
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full text-[9px] font-black uppercase tracking-widest font-mono">
          {s.totalPresent}/{s.totalEnrolled}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (s) => (
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === "open" ? "bg-amber-600 text-slate-900 shadow-lg shadow-amber-600/20 animate-pulse border-amber-600" : s.status === "closed" ? "bg-slate-100 text-slate-500 border-slate-200" : "bg-rose-500/10 text-rose-500 border-rose-500/10"}`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (s) => (
        <div className="flex gap-2">
          <button
            onClick={() => viewRecords(s)}
            className="btn-secondary py-1 px-3 text-xs"
          >
            View
          </button>
          {s.status === "open" && (
            <button
              onClick={() => handleClose(s._id)}
              className="btn-danger py-1 px-3 text-xs"
            >
              Close
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Attendance Registry"
        subtitle="Initiate course sessions and synchronize student participation"
        actions={
          <button
            onClick={() => safeSetShowCreate(true)}
            className="btn-primary"
          >
            <FiPlus className="w-4 h-4" /> Initialize Session
          </button>
        }
      />

      {activeSession && (
        <div className="bg-slate-1000 backdrop-blur-3xl rounded-[24px] p-6 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
            <FiClipboard className="w-48 h-48 text-emerald-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <div className="bg-emerald-500/10 rounded-[20px] px-10 py-6 border border-emerald-500/20 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
                  Live Session PIN
                </p>
                <p className="text-5xl font-black font-mono text-emerald-500 tracking-[0.2em]">
                  {activeSession.sessionPin}
                </p>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tighter">
                  Authentication Active
                </p>
                <p className="text-xs text-slate-500 font-bold max-w-xs leading-relaxed uppercase tracking-widest opacity-80">
                  Students must enter this PIN within their portal to
                  synchronize presence.
                </p>
                <p className="text-[10px] font-black text-amber-500 mt-4 uppercase tracking-[0.2em]">
                  Expiraton: {formatDateTime(activeSession.pinExpiresAt)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleClose(activeSession._id)}
              className="btn-danger px-10 py-4 text-[10px] tracking-[0.2em] shadow-xl shadow-rose-600/20"
            >
              Terminate Session
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="label">Active Node (Course)</label>
            <div className="flex gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="input flex-1"
              >
                <option value="">Select a course node...</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
              {selectedCourse && (
                <button
                  onClick={() => loadSessions(selectedCourse)}
                  className="btn-secondary w-14 flex items-center justify-center border-slate-200"
                >
                  <FiRefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {!selectedCourse ? (
          <EmptyState
            icon={FiClipboard}
            title="Node Selection Required"
            subtitle="Choose an academic node to view the synchronized attendance history."
          />
        ) : (
          <div className="rounded-[20px] overflow-hidden border border-slate-200">
            <DataTable
              columns={sessionCols}
              data={sessions}
              loading={loading}
              emptyMessage="No session data logs detected."
            />
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => safeSetShowCreate(false)}
        title="Initialize Attendance Session"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => safeSetShowCreate(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="btn-primary px-8"
            >
              {saving ? "Synchronizing..." : "Finalize & Launch"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Course Node</label>
              <select
                className="input"
                value={form.courseId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, courseId: e.target.value }))
                }
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Academic Semester</label>
              <select
                className="input"
                value={form.semesterId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, semesterId: e.target.value }))
                }
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Session Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {["Lecture", "Lab", "Tutorial", "Seminar"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Start Time</label>
              <input
                type="time"
                className="input"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="label">Venue Node</label>
            <input
              className="input"
              placeholder="e.g. Hall 04, Faculty Block"
              value={form.venue}
              onChange={(e) =>
                setForm((f) => ({ ...f, venue: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Session Parameters (Notes)</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Optional session context..."
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>

          <div className="bg-amber-600/5 rounded-[24px] p-5 border border-amber-500/10 flex gap-4">
            <div className="w-10 h-10 bg-amber-600/10 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
              <FiClipboard />
            </div>
            <p className="text-[10px] font-black text-amber-500/80 leading-relaxed uppercase tracking-widest">
              Security Protocol: A dynamic PIN will be generated upon launch.
              Presence authentication is time-sensitive. Ensure students are
              ready within the portal.
            </p>
          </div>
        </div>
      </Modal>

      {/* Records Modal */}
      <Modal
        isOpen={showRecords}
        onClose={() => safeSetShowRecords(false)}
        title={`Authorization Records — ${sessionRecords.length} Entities`}
        size="lg"
      >
        <div className="rounded-[20px] overflow-hidden border border-slate-200 shadow-inner">
          <DataTable
            columns={recordCols}
            data={sessionRecords}
            emptyMessage="No attendance logs found for this session."
          />
        </div>
      </Modal>
    </div>
  );
}
