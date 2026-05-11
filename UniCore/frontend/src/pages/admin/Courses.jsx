import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  Modal,
  SearchInput,
  LoadingSpinner,
  EmptyState,
  StatCard,
} from "../../components/shared/UI";
import { formatDate } from "../../utils/helpers";
import {
  FiPlus,
  FiEdit,
  FiBook,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({
    title: "",
    code: "",
    creditHours: 3,
    level: 100,
    semester: 1,
    department: "",
    description: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
      });
      const res = await api.get(`/courses?${params}`);
      setCourses(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, search]);
  useEffect(() => {
    api
      .get("/admin/departments")
      .then((r) => setDepartments(r.data.data || []))
      .catch(() => {});
    api
      .get("/teachers")
      .then((r) => setTeachers(r.data.data || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditCourse(null);
    setForm({
      title: "",
      code: "",
      creditHours: 3,
      level: 100,
      semester: 1,
      department: "",
      description: "",
    });
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({
      title: course.title,
      code: course.code,
      creditHours: course.creditHours,
      level: course.level,
      semester: course.semester,
      department: course.department?._id || "",
      description: course.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.code) {
      toast.error("Title and code required");
      return;
    }
    setSaving(true);
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse._id}`, form);
        toast.success("Course updated");
      } else {
        await api.post("/courses", form);
        toast.success("Course created");
      }
      setShowModal(false);
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "code",
      label: "Registry Code",
      render: (c) => (
        <span className="font-mono font-black text-amber-500 tracking-[0.2em] uppercase">
          {c.code}
        </span>
      ),
    },
    {
      key: "title",
      label: "Academic Node Title",
      render: (c) => (
        <div className="group cursor-pointer">
          <p className="font-bold text-slate-900 mb-0.5 group-hover:text-amber-500 transition-colors uppercase tracking-tight">
            {c.title}
          </p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
            {c.department?.name || "Unmapped Node"}
          </p>
        </div>
      ),
    },
    {
      key: "level",
      label: "Protocol Level",
      render: (c) => (
        <span className="text-slate-600 font-black uppercase text-[10px] tracking-widest">
          L{c.level} Node
        </span>
      ),
    },
    {
      key: "creditHours",
      label: "Credit Payload",
      render: (c) => (
        <span className="px-4 py-1.5 bg-amber-600/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-amber-500/10 shadow-inner">
          {c.creditHours} UNITS
        </span>
      ),
    },
    {
      key: "teacher",
      label: "Node Authority",
      render: (c) =>
        c.primaryTeacher ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-600">
              {c.primaryTeacher.firstName[0]}
            </div>
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
              {c.primaryTeacher.firstName} {c.primaryTeacher.lastName}
            </span>
          </div>
        ) : (
          <span className="text-slate-600 italic font-black text-[10px] uppercase tracking-widest">
            Unassigned
          </span>
        ),
    },
    {
      key: "enrolled",
      label: "Entities",
      render: (c) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11px] font-black text-slate-900">
            {c.enrolledStudents?.length || 0}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (c) => (
        <button
          onClick={() => openEdit(c)}
          className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200 shadow-xl"
        >
          <FiEdit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Academic Node Registry"
        subtitle="Global management of institutional course nodes and mapping protocols"
        actions={
          <button
            onClick={openCreate}
            className="btn-primary shadow-2xl shadow-amber-600/20 px-10 py-5"
          >
            <FiPlus className="w-4 h-4" /> Initialize Node
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full relative group">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search academic nodes by title, code, or department..."
          />
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-3 bg-slate-1000 border border-slate-200 rounded-[24px] p-2 backdrop-blur-3xl shadow-3d">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-20 transition-all shadow-xl"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-6">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-20 transition-all shadow-xl"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="card border border-slate-200 bg-white/30 backdrop-blur-3xl rounded-[24px] overflow-hidden shadow-3d">
        <DataTable columns={columns} data={courses} loading={loading} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editCourse
            ? "Modify Academic Node Protocol"
            : "Initialize New Academic Node"
        }
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
              {saving ? "Synchronizing..." : "Finalize Node"}
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-3">
              <label className="label">Institutional Node Title</label>
              <input
                className="input"
                placeholder="e.g. Advanced Quantum Mechanics"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Node Registry Code</label>
              <input
                className="input font-mono tracking-widest"
                placeholder="e.g. IT101"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Credit Payload Units</label>
              <input
                type="number"
                min="1"
                max="6"
                className="input"
                value={form.creditHours}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    creditHours: parseInt(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Academic Protocol Level</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.level}
                onChange={(e) =>
                  setForm((f) => ({ ...f, level: parseInt(e.target.value) }))
                }
              >
                {[100, 200, 300, 400, 500, 600].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Session Semester Window</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.semester}
                onChange={(e) =>
                  setForm((f) => ({ ...f, semester: parseInt(e.target.value) }))
                }
              >
                <option value={1}>Semester Window 1</option>
                <option value={2}>Semester Window 2</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="label">Parent Department Hub Mapping</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              >
                <option value="">Select Department Node</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="label">Node Curriculum Overview</label>
              <textarea
                className="input h-40 resize-none bg-slate-1000 border-slate-200"
                placeholder="Detailed syllabus or node overview protocol..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
