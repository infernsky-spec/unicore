import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  Badge,
} from "../../components/shared/UI";
import { timeAgo, truncate } from "../../utils/helpers";
import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "General",
    priority: "normal",
    targetRoles: ["all"],
    isPublished: true,
    isPinned: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/announcements?limit=50");
      setItems(res.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) {
      toast.error("Title and content required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/announcements", form);
      toast.success("Announcement posted");
      setShowModal(false);
      setForm({
        title: "",
        content: "",
        type: "General",
        priority: "normal",
        targetRoles: ["all"],
        isPublished: true,
        isPinned: false,
      });
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Deleted");
      load();
    } catch {}
  };

  const priorityColors = {
    low: "gray",
    normal: "yellow",
    high: "orange",
    urgent: "red",
  };
  const typeColors = {
    General: "gray",
    Exam: "red",
    Fees: "yellow",
    Event: "orange",
    Emergency: "red",
    Academic: "purple",
  };

  const columns = [
    {
      key: "title",
      label: "Broadcast Node",
      render: (a) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-900 mb-0.5">{a.title}</p>
            {a.isPinned && (
              <span className="text-amber-500 text-[10px]">📌 PINNED</span>
            )}
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {truncate(a.content, 80)}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Protocol Type",
      render: (a) => (
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${a.type === "General" ? "bg-slate-100 text-slate-600 border-slate-200" : a.type === "Exam" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" : a.type === "Fees" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-orange-500/10 text-orange-500 border-orange-500/10"}`}
        >
          {a.type}
        </span>
      ),
    },
    {
      key: "priority",
      label: "Urgency",
      render: (a) => (
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${a.priority === "urgent" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" : a.priority === "high" ? "bg-orange-500/10 text-orange-500 border-orange-500/10" : a.priority === "normal" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
          {a.priority}
        </span>
      ),
    },
    {
      key: "createdBy",
      label: "Authority",
      render: (a) => (
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          {a.createdBy
            ? `${a.createdBy.firstName} ${a.createdBy.lastName}`
            : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Sync Time",
      render: (a) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {timeAgo(a.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (a) => (
        <button
          onClick={() => handleDelete(a._id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-rose-500 transition-all border border-slate-200"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Network Announcements"
        subtitle="Global broadcast management and institutional synchronization of academic feeds"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-xl shadow-amber-600/20 px-8 py-4"
          >
            <FiPlus className="w-4 h-4" /> Initialize Broadcast
          </button>
        }
      />

      <div className="card border border-slate-200">
        <div className="overflow-hidden rounded-[20px] border border-slate-200 shadow-2xl bg-white/30 backdrop-blur-3xl">
          <DataTable
            columns={columns}
            data={items}
            loading={loading}
            emptyMessage="No active broadcasts detected in the network."
          />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Initialize Broadcast Node"
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
              className="btn-primary px-10"
            >
              {saving ? "Synchronizing..." : "Authorize Broadcast"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="label">Broadcast Title</label>
            <input
              className="input"
              placeholder="Enter session-wide title..."
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="label">Transmission Payload (Content)</label>
            <textarea
              className="input h-40 resize-none"
              placeholder="Synchronize global message content..."
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Node Protocol (Type)</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                {[
                  "General",
                  "Exam",
                  "Fees",
                  "Event",
                  "Emergency",
                  "Academic",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority Clearance</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priority: e.target.value }))
                }
              >
                {["low", "normal", "high", "urgent"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-6 bg-slate-100 p-6 rounded-[20px] border border-slate-200 shadow-inner">
            <label className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
                className="w-5 h-5 bg-slate-100 border-slate-200 rounded-lg text-amber-500 focus:ring-0 cursor-pointer"
              />
              Live Deployment
            </label>
            <label className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer group">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPinned: e.target.checked }))
                }
                className="w-5 h-5 bg-slate-100 border-slate-200 rounded-lg text-amber-500 focus:ring-0 cursor-pointer"
              />
              Global Pin
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
