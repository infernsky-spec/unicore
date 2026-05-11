import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  LoadingSpinner,
  EmptyState,
  Alert,
} from "../../components/shared/UI";
import { formatDate } from "../../utils/helpers";
import {
  FiPlus,
  FiEdit,
  FiCalendar,
  FiFlag,
  FiCheckCircle,
  FiList,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminSemesters() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    academicYear: "",
    semesterNumber: 1,
    startDate: "",
    endDate: "",
    examStartDate: "",
    examEndDate: "",
    registrationDeadline: "",
    addDropDeadline: "",
  });
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    targetDate: "",
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    type: "Event",
    venue: "",
    isPublic: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/semesters");
      setSemesters(res.data.data || []);
      if (!selected && res.data.data.length > 0)
        setSelected(res.data.data.find((s) => s.isCurrent) || res.data.data[0]);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post("/semesters", form);
      toast.success("Semester created");
      setShowCreate(false);
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleSetCurrent = async (id) => {
    try {
      await api.patch(`/semesters/${id}/set-current`);
      toast.success("Active semester updated");
      load();
    } catch {}
  };

  const handleAddGoal = async () => {
    if (!goalForm.title) {
      toast.error("Goal title required");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/semesters/${selected._id}/goals`, goalForm);
      toast.success("Goal added");
      setShowGoal(false);
      setGoalForm({ title: "", description: "", targetDate: "" });
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      await api.patch(`/semesters/${selected._id}/goals/${goalId}/complete`);
      toast.success("Goal marked complete");
      load();
    } catch {}
  };

  const handleAddEvent = async () => {
    if (!eventForm.title || !eventForm.date) {
      toast.error("Title and date required");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/semesters/${selected._id}/events`, eventForm);
      toast.success("Event added");
      setShowEvent(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        endDate: "",
        type: "Event",
        venue: "",
        isPublic: true,
      });
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Academic Timeline Registry"
        subtitle="Global management of institutional session nodes, calendar milestones, and operational protocols"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary shadow-2xl shadow-amber-600/20 px-8 py-5"
          >
            <FiPlus className="w-4 h-4" /> Initialize Session
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Semester list */}
        <div className="space-y-6">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
            <FiList className="w-4 h-4" /> Session Registry
          </h3>
          {!semesters.length && (
            <EmptyState
              title="No Sessions Detected"
              subtitle="Initialize the first institutional session node to begin."
            />
          )}
          {semesters.map((s) => (
            <div
              key={s._id}
              onClick={() => setSelected(s)}
              className={`group card cursor-pointer transition-all border p-5 rounded-[20px] shadow-3d ${selected?._id === s._id ? "ring-2 ring-amber-500/50 border-amber-500/20 bg-amber-500/5 backdrop-blur-3xl" : "hover:bg-slate-100 border-slate-200 bg-slate-1000 backdrop-blur-2xl"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className={`font-black text-lg mb-2 tracking-tighter uppercase transition-colors ${selected?._id === s._id ? "text-amber-500" : "text-slate-900 group-hover:text-amber-500"}`}
                  >
                    {s.name}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    {formatDate(s.startDate)} — {formatDate(s.endDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  {s.isCurrent && (
                    <span className="px-4 py-1.5 bg-amber-600 text-slate-900 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20">
                      Active Node
                    </span>
                  )}
                  <span
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${s.status === "active" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : s.status === "upcoming" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-slate-100 text-slate-500 border-slate-200"}`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
              {!s.isCurrent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetCurrent(s._id);
                  }}
                  className="mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60 hover:text-amber-500 transition-all flex items-center gap-2 group-hover:translate-x-1 duration-500"
                >
                  Authorize Protocol Sync <FiCalendar className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Semester detail */}
        {selected && (
          <div className="lg:col-span-2 space-y-10">
            <div className="card border border-slate-200 bg-white/30 backdrop-blur-3xl overflow-hidden relative rounded-[24px] p-6 shadow-3d">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 font-display leading-tight mb-3 uppercase tracking-tighter">
                      {selected.name}
                    </h2>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">
                      {selected.academicYear} · PROTOCOL NODE{" "}
                      {selected.semesterNumber}
                    </p>
                  </div>
                  {selected.isCurrent && (
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
                      Operational Hub
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 p-5 bg-white/[0.02] rounded-[20px] border border-slate-200 shadow-inner backdrop-blur-3xl">
                  {[
                    ["Session Start", selected.startDate],
                    ["Session End", selected.endDate],
                    ["Registry Deadline", selected.registrationDeadline],
                    ["Assessment Period", selected.examStartDate],
                  ].map(([label, date]) => (
                    <div key={label} className="group">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 group-hover:text-amber-500 transition-colors">
                        {label}
                      </p>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {formatDate(date) || "UNDEFINED"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="card border border-slate-200 bg-white/20 backdrop-blur-3xl rounded-[24px] p-6 shadow-3d">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <FiFlag className="w-5 h-5" /> Strategic Objectives
                </h3>
                <button
                  onClick={() => setShowGoal(true)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl"
                >
                  <FiPlus className="w-4 h-4 mr-2 inline" /> Initialize Goal
                </button>
              </div>
              {!selected.goals?.length && (
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] text-center py-12 opacity-50 border border-dashed border-slate-200 rounded-[20px]">
                  No strategic objectives synchronized
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selected.goals?.map((g) => (
                  <div
                    key={g._id}
                    className={`flex items-start gap-5 p-6 rounded-[20px] border transition-all duration-500 ${g.isCompleted ? "bg-emerald-500/5 border-emerald-500/10 opacity-60" : "bg-white/40 border-slate-200 hover:border-slate-200 hover:bg-slate-100 shadow-inner"}`}
                  >
                    <button
                      onClick={() =>
                        !g.isCompleted && handleCompleteGoal(g._id)
                      }
                      className={`mt-1 flex-shrink-0 w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${g.isCompleted ? "border-emerald-500 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-slate-800 hover:border-amber-500"}`}
                    >
                      {g.isCompleted && (
                        <FiCheckCircle className="w-5 h-5 text-slate-900" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[15px] font-black tracking-tight ${g.isCompleted ? "line-through text-slate-500" : "text-slate-900"}`}
                      >
                        {g.title}
                      </p>
                      {g.description && (
                        <p className="text-[11px] text-slate-500 mt-2 font-bold leading-relaxed line-clamp-2">
                          {g.description}
                        </p>
                      )}
                      {g.targetDate && (
                        <p className="text-[9px] font-black text-amber-500/50 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                          <div className="w-1 h-1 bg-amber-500/30 rounded-full" />{" "}
                          Deadline Node: {formatDate(g.targetDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className="card border border-slate-200 bg-white/20 backdrop-blur-3xl rounded-[24px] p-6 shadow-3d">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center gap-3">
                  <FiCalendar className="w-5 h-5" /> Operational Milestones
                </h3>
                <button
                  onClick={() => setShowEvent(true)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl"
                >
                  <FiPlus className="w-4 h-4 mr-2 inline" /> Initialize
                  Milestone
                </button>
              </div>
              {!selected.events?.length && (
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] text-center py-12 opacity-50 border border-dashed border-slate-200 rounded-[20px]">
                  No operational milestones detected
                </p>
              )}
              <div className="space-y-6">
                {selected.events
                  ?.sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((ev) => (
                    <div
                      key={ev._id}
                      className="flex items-center gap-5 p-6 rounded-[20px] bg-white/[0.02] border border-slate-200 hover:border-slate-200 transition-all group shadow-inner"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex-shrink-0 shadow-2xl ${ev.type === "Exam" ? "bg-rose-500 shadow-rose-500/40" : ev.type === "Deadline" ? "bg-amber-500 shadow-amber-500/40" : ev.type === "Holiday" ? "bg-emerald-500 shadow-emerald-500/40" : "bg-blue-500 shadow-blue-500/40"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-black text-slate-900 group-hover:text-amber-500 transition-colors uppercase tracking-tight">
                          {ev.title}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1.5">
                          {ev.venue || "Global Institutional Protocol"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">
                          {formatDate(ev.date)}
                        </p>
                        <span
                          className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border shadow-inner ${ev.type === "Exam" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" : ev.type === "Deadline" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : ev.type === "Holiday" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-blue-500/10 text-blue-400 border-blue-500/10"}`}
                        >
                          {ev.type} Node
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Semester Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Initialize Institutional Session"
        size="lg"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowCreate(false)}
              className="btn-secondary"
            >
              Abort Session
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="btn-primary px-12"
            >
              {saving ? "Synchronizing..." : "Initialize Session"}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 space-y-3">
            <label className="label">Session Registry Name</label>
            <input
              className="input"
              placeholder="e.g. First Semester 2024/2025"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-3">
            <label className="label">Academic Year Protocol</label>
            <input
              className="input"
              placeholder="e.g. 2024/2025"
              value={form.academicYear}
              onChange={(e) =>
                setForm((f) => ({ ...f, academicYear: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Session Order Number</label>
            <select
              className="input bg-slate-1000 border-slate-200"
              value={form.semesterNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  semesterNumber: parseInt(e.target.value),
                }))
              }
            >
              <option value={1}>Semester Node 1</option>
              <option value={2}>Semester Node 2</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="label">Registry Start Date</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Registry End Date</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Assessment Start</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={form.examStartDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, examStartDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Assessment End</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={form.examEndDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, examEndDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Enrollment Deadline</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={form.registrationDeadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, registrationDeadline: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Add/Drop Window End</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={form.addDropDeadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, addDropDeadline: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>

      {/* Goal Modal */}
      <Modal
        isOpen={showGoal}
        onClose={() => setShowGoal(false)}
        title="Add Strategic Objective"
        size="sm"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowGoal(false)}
              className="btn-secondary"
            >
              Abort
            </button>
            <button
              onClick={handleAddGoal}
              disabled={saving}
              className="btn-primary px-10"
            >
              {saving ? "Synchronizing..." : "Finalize Objective"}
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="label">Objective Title</label>
            <input
              className="input"
              placeholder="e.g. Optimize Registry Throughput"
              value={goalForm.title}
              onChange={(e) =>
                setGoalForm((g) => ({ ...g, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Operational Description</label>
            <textarea
              className="input h-32 resize-none bg-slate-1000 border-slate-200"
              placeholder="Detailed objective context..."
              value={goalForm.description}
              onChange={(e) =>
                setGoalForm((g) => ({ ...g, description: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Target Date Node</label>
            <input
              type="date"
              className="input bg-slate-1000 border-slate-200"
              value={goalForm.targetDate}
              onChange={(e) =>
                setGoalForm((g) => ({ ...g, targetDate: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={showEvent}
        onClose={() => setShowEvent(false)}
        title="Initialize Operational Milestone"
        size="md"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowEvent(false)}
              className="btn-secondary"
            >
              Abort
            </button>
            <button
              onClick={handleAddEvent}
              disabled={saving}
              className="btn-primary px-10"
            >
              {saving ? "Synchronizing..." : "Finalize Milestone"}
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="label">Milestone Protocol Title</label>
            <input
              className="input"
              placeholder="e.g. Institutional Convocation"
              value={eventForm.title}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="label">Milestone Date</label>
              <input
                type="date"
                className="input bg-slate-1000 border-slate-200"
                value={eventForm.date}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Window End Date</label>
              <input
                type="date"
                className="input bg-slate-1000 border-slate-200"
                value={eventForm.endDate}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, endDate: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="label">Classification</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={eventForm.type}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {[
                  "Event",
                  "Exam",
                  "Deadline",
                  "Holiday",
                  "Registration",
                  "Other",
                ].map((t) => (
                  <option key={t}>{t} PROTOCOL</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Venue Node Mapping</label>
              <input
                className="input bg-slate-1000 border-slate-200"
                placeholder="e.g. Digital Assembly Hall"
                value={eventForm.venue}
                onChange={(e) =>
                  setEventForm((f) => ({ ...f, venue: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="label">Detailed Protocol Context</label>
            <textarea
              className="input h-32 resize-none bg-slate-1000 border-slate-200"
              placeholder="Provide essential milestone protocols..."
              value={eventForm.description}
              onChange={(e) =>
                setEventForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
