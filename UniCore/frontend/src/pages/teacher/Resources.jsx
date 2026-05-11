import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  Modal,
  EmptyState,
} from "../../components/shared/UI";
import { FiPlus, FiTrash2, FiDownload, FiFolder, FiLink } from "react-icons/fi";
import { formatDate, truncate } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function TeacherResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Document",
    course: "",
    externalUrl: "",
    visibility: "enrolled",
  });
  const [file, setFile] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, cRes] = await Promise.all([
        api.get("/resources"),
        api.get("/courses/my/courses"),
      ]);
      setResources(rRes.data.data || []);
      setCourses(cRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.title || !form.type) {
      toast.error("Title and type required");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("file", file);
      await api.post("/resources", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Resource uploaded");
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        type: "Document",
        course: "",
        externalUrl: "",
        visibility: "enrolled",
      });
      setFile(null);
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success("Deleted");
      load();
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

  const cols = [
    {
      key: "title",
      label: "Resource Node",
      render: (r) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl border border-slate-200 shadow-inner">
            {typeIcon[r.type] || "📁"}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm mb-0.5">{r.title}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              {truncate(r.description, 40) || "No Context Provided"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Classification",
      render: (r) => (
        <span className="px-3 py-1 bg-amber-600/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/10">
          {r.type}
        </span>
      ),
    },
    {
      key: "course",
      label: "Node mapping",
      render: (r) => (
        <span className="font-mono text-[10px] font-black text-slate-600 uppercase tracking-widest">
          {r.course?.code || "GLOBAL"}
        </span>
      ),
    },
    {
      key: "downloads",
      label: "Syncs",
      render: (r) => (
        <span className="text-sm font-black text-slate-900">
          {r.downloadCount || 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Authorized",
      render: (r) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-2">
          {r.filePath && (
            <a
              href={r.filePath}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-amber-600 hover:text-slate-900 transition-all border border-slate-200"
            >
              <FiDownload className="w-3.5 h-3.5" />
            </a>
          )}
          {r.externalUrl && (
            <a
              href={r.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-slate-900 transition-all border border-slate-200"
            >
              <FiLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => handleDelete(r._id)}
            className="p-2 bg-slate-100 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-slate-900 transition-all border border-slate-200"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Knowledge Repository"
        subtitle="Centralized management of academic assets and synchronization materials"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-xl shadow-amber-600/20"
          >
            <FiPlus className="w-4 h-4" /> Deploy Resource
          </button>
        }
      />

      <div className="card overflow-hidden border border-slate-200">
        <DataTable
          columns={cols}
          data={resources}
          loading={loading}
          emptyMessage="No academic materials detected in this node."
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Authorize Resource Deployment"
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-8"
            >
              {saving ? "Deploying..." : "Confirm Upload"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="label">Resource Title</label>
            <input
              className="input"
              placeholder="e.g. Lecture Notes - Session 01"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Classification</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value }))
                }
              >
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
            <div>
              <label className="label">Academic Node</label>
              <select
                className="input"
                value={form.course}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course: e.target.value }))
                }
              >
                <option value="">All / Global</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Node Context (Description)</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Provide a brief context for students..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="bg-slate-1000 rounded-[24px] p-6 border border-slate-200 shadow-inner">
            {form.type === "Link" ? (
              <div>
                <label className="label">External Synchronization URL</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://external-resource.com/path"
                  value={form.externalUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, externalUrl: e.target.value }))
                  }
                />
              </div>
            ) : (
              <div>
                <label className="label">Binary Payload (File)</label>
                <div className="relative group">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <div className="input py-8 border-dashed flex flex-col items-center justify-center text-slate-500 group-hover:border-amber-500/50 transition-all">
                    <FiFolder className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {file ? file.name : "Select or Drop Payload"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="label">Authorization Visibility</label>
            <select
              className="input"
              value={form.visibility}
              onChange={(e) =>
                setForm((f) => ({ ...f, visibility: e.target.value }))
              }
            >
              <option value="enrolled">Enrolled Entities Only</option>
              <option value="public">Institutional Public</option>
              <option value="restricted">Registry Restricted</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
