// Exams.jsx
import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  LoadingSpinner,
} from "../../components/shared/UI";
import { formatDate, formatDateTime } from "../../utils/helpers";
import { FiPlus, FiEdit, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    course: "",
    semester: "",
    type: "End-of-Semester",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    chiefInvigilator: "",
    totalMarks: 100,
    passMark: 50,
    instructions: "",
    isPublished: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const [exRes, cRes, tRes, sRes] = await Promise.all([
        api.get("/exams"),
        api.get("/courses"),
        api.get("/teachers"),
        api.get("/semesters"),
      ]);
      setExams(exRes.data.data || []);
      setCourses(cRes.data.data || []);
      setTeachers(tRes.data.data || []);
      setSemesters(sRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.course || !form.date) {
      toast.error("Course and date required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/exams", form);
      toast.success("Exam scheduled");
      setShowModal(false);
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id, publish) => {
    try {
      await api.patch(`/exams/${id}/publish`, { publish });
      toast.success(publish ? "Exam published" : "Exam unpublished");
      load();
    } catch {}
  };

  const columns = [
    {
      key: "course",
      label: "Academic Node",
      render: (e) => (
        <div>
          <p className="font-bold text-slate-900 mb-0.5 group-hover:text-amber-500 transition-colors">
            {e.course?.title}
          </p>
          <span className="font-mono text-[10px] font-black text-amber-500 uppercase tracking-widest">
            {e.course?.code}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Classification",
      render: (e) => (
        <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-amber-600/10 text-amber-500 border border-amber-500/10 shadow-inner">
          {e.type}
        </span>
      ),
    },
    {
      key: "date",
      label: "Synchronization Window",
      render: (e) => (
        <div>
          <p className="text-sm font-black text-slate-900 mb-0.5 uppercase tracking-tighter">
            {formatDate(e.date)}
          </p>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            {e.startTime} — {e.endTime}
          </p>
        </div>
      ),
    },
    {
      key: "venue",
      label: "Venue Node",
      render: (e) => (
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
          {e.venue || "—"}
        </span>
      ),
    },
    {
      key: "invigilator",
      label: "Authority (Chief)",
      render: (e) =>
        e.chiefInvigilator ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-700">
              {e.chiefInvigilator.firstName[0]}
            </div>
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
              {e.chiefInvigilator.firstName} {e.chiefInvigilator.lastName}
            </span>
          </div>
        ) : (
          <span className="text-slate-600 italic font-black text-[10px] uppercase tracking-widest">
            Unassigned
          </span>
        ),
    },
    {
      key: "published",
      label: "Visibility",
      render: (e) => (
        <span
          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${e.isPublished ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-100 text-slate-500 border-slate-200"}`}
        >
          {e.isPublished ? "Live Node" : "Draft Protocol"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (e) => (
        <div className="flex gap-3 justify-end">
          {!e.isPublished ? (
            <button
              onClick={() => handlePublish(e._id, true)}
              className="px-6 py-2 bg-emerald-600 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 hover:bg-emerald-500 transition-all"
            >
              Authorize
            </button>
          ) : (
            <button
              onClick={() => handlePublish(e._id, false)}
              className="px-6 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Retract
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Assessment Registry"
        subtitle="Global coordination of institutional examination nodes and invigilation layers"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-2xl shadow-amber-600/20 px-8 py-5"
          >
            <FiPlus className="w-4 h-4" /> Initialize Assessment
          </button>
        }
      />

      <div className="card border border-slate-200 bg-white/30 backdrop-blur-3xl rounded-[24px] overflow-hidden">
        <div className="overflow-hidden">
          <DataTable
            columns={columns}
            data={exams}
            loading={loading}
            emptyMessage="No active assessment protocols detected in the current session."
          />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Initialize Assessment Node Protocol"
        size="lg"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Abort Session
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-12"
            >
              {saving ? "Synchronizing..." : "Authorize Schedule"}
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="label">Course Node Mapping</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.course}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course: e.target.value }))
                }
              >
                <option value="">Select Course Node</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Institutional Session</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.semester}
                onChange={(e) =>
                  setForm((f) => ({ ...f, semester: e.target.value }))
                }
              >
                <option value="">Select Academic Session</option>
                {semesters.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Assessment Classification</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {[
                  "Mid-Semester",
                  "End-of-Semester",
                  "Resit",
                  "Supplementary",
                  "Quiz",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Synchronization Date</label>
              <input
                type="date"
                className="input bg-slate-1000 border-slate-200"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Node Window Start</label>
              <input
                type="time"
                className="input bg-slate-1000 border-slate-200"
                value={form.startTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Node Window End</label>
              <input
                type="time"
                className="input bg-slate-1000 border-slate-200"
                value={form.endTime}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endTime: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Venue Node Assignment</label>
              <input
                className="input bg-slate-1000 border-slate-200"
                placeholder="e.g. Hall 04, North Block"
                value={form.venue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, venue: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Authority Assignment (Chief)</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.chiefInvigilator}
                onChange={(e) =>
                  setForm((f) => ({ ...f, chiefInvigilator: e.target.value }))
                }
              >
                <option value="">Assign Personnel Authority</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Max Mark Payload</label>
              <input
                type="number"
                className="input bg-slate-1000 border-slate-200"
                value={form.totalMarks}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totalMarks: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Authorization Threshold</label>
              <input
                type="number"
                className="input bg-slate-1000 border-slate-200"
                value={form.passMark}
                onChange={(e) =>
                  setForm((f) => ({ ...f, passMark: parseInt(e.target.value) }))
                }
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="label">
                Candidate Protocols (Instructions)
              </label>
              <textarea
                className="input h-32 resize-none bg-slate-1000 border-slate-200"
                placeholder="Provide essential protocols for candidates..."
                value={form.instructions}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instructions: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center gap-6 p-6 bg-slate-100 rounded-[20px] border border-slate-200 shadow-inner">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="pub"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isPublished: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
              </div>
              <label
                htmlFor="pub"
                className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]"
              >
                Protocol Visibility:{" "}
                {form.isPublished ? "Public Registry" : "Admin Draft"}
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
