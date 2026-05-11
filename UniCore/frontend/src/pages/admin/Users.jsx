import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  Modal,
  SearchInput,
  ConfirmDialog,
} from "../../components/shared/UI";
import {
  getRoleLabel,
  getRoleBadgeClass,
  formatDate,
  getInitials,
} from "../../utils/helpers";
import {
  FiPlus,
  FiEdit,
  FiToggleLeft,
  FiToggleRight,
  FiLink,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ROLES = ["admin", "teacher", "student", "parent", "course_rep"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showLink, setShowLink] = useState(false);
  const [linkData, setLinkData] = useState({ parentId: "", studentId: "" });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
    phone: "",
    gender: "Male",
    isActive: true,
    studentInfo: {},
    teacherInfo: {},
    parentInfo: {},
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      const r = await api.get(`/admin/users?${p}`);
      setUsers(r.data.data || []);
      setTotalPages(r.data.pages || 1);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);
  useEffect(() => {
    api
      .get("/admin/programmes")
      .then((r) => setProgrammes(r.data.data || []))
      .catch(() => {});
    api
      .get("/admin/departments")
      .then((r) => setDepartments(r.data.data || []))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "student",
      phone: "",
      gender: "Male",
      isActive: true,
      studentInfo: { level: 100 },
      teacherInfo: {},
      parentInfo: {},
    });
    setShowModal(true);
  };
  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      password: "",
      role: u.role,
      phone: u.phone || "",
      gender: u.gender || "Male",
      isActive: u.isActive,
      studentInfo: u.studentInfo || {},
      teacherInfo: u.teacherInfo || {},
      parentInfo: u.parentInfo || {},
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      (!editUser && !form.password)
    ) {
      toast.error("Fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editUser) {
        await api.put(`/admin/users/${editUser._id}`, payload);
        toast.success("User updated");
      } else {
        await api.post("/admin/users", payload);
        toast.success("User created");
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id}/toggle-active`);
      toast.success(`User ${u.isActive ? "deactivated" : "activated"}`);
      load();
    } catch {}
  };

  const handleLink = async () => {
    if (!linkData.parentId || !linkData.studentId) {
      toast.error("Both fields required");
      return;
    }
    try {
      await api.post("/admin/link-parent-student", linkData);
      toast.success("Linked!");
      setShowLink(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const fs = (k, v) =>
    setForm((p) => ({ ...p, studentInfo: { ...p.studentInfo, [k]: v } }));

  const cols = [
    {
      key: "name",
      label: "Institutional Entity",
      render: (u) => (
        <div className="flex items-center gap-5 group">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-amber-500 rounded-[18px] flex items-center justify-center text-[11px] font-black shadow-inner flex-shrink-0 group-hover:bg-amber-600 group-hover:text-slate-900 transition-all duration-500">
            {getInitials(u.firstName, u.lastName)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 mb-0.5 group-hover:text-amber-500 transition-colors uppercase tracking-tight">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] truncate">
              {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "userId",
      label: "Registry ID",
      render: (u) => (
        <span className="font-mono text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
          {u.userId}
        </span>
      ),
    },
    {
      key: "role",
      label: "Authorization",
      render: (u) => (
        <span
          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${u.role === "admin" ? "bg-amber-600/10 text-amber-500 border-amber-500/10" : u.role === "teacher" ? "bg-blue-600/10 text-blue-400 border-blue-500/10" : "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
          {getRoleLabel(u.role)}
        </span>
      ),
    },
    {
      key: "index",
      label: "Index Node",
      render: (u) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {u.studentInfo?.indexNumber || "—"}
        </span>
      ),
    },
    {
      key: "linked",
      label: "Node Integrity",
      render: (u) =>
        u.role === "student" ? (
          u.studentInfo?.parent ? (
            <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/10">
              Synchronized
            </span>
          ) : (
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-slate-200">
              —
            </span>
          )
        ) : null,
    },
    {
      key: "status",
      label: "Operational State",
      render: (u) => (
        <span
          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${u.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-rose-500/10 text-rose-500 border-rose-500/10 shadow-[0_0_15px_rgba(225,29,72,0.1)]"}`}
        >
          {u.isActive ? "Active" : "Offline"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (u) => (
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => openEdit(u)}
            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200 shadow-xl"
            title="Modify Entity"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleToggle(u)}
            className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all border border-slate-200 shadow-xl"
            title="Toggle Sync"
          >
            {u.isActive ? (
              <FiToggleRight className="w-4 h-4 text-emerald-500" />
            ) : (
              <FiToggleLeft className="w-4 h-4 text-rose-500" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Identity & Entity Registry"
        subtitle="Global management of institutional user nodes and authorization layers"
        actions={
          <div className="flex gap-4">
            <button
              onClick={() => setShowLink(true)}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all shadow-2xl backdrop-blur-md"
            >
              <FiLink className="w-4 h-4 inline mr-2" /> Node Mapping
            </button>
            <button
              onClick={openCreate}
              className="btn-primary shadow-2xl shadow-amber-600/20 px-10 py-5"
            >
              <FiPlus className="w-4 h-4" /> Initialize Entity
            </button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 w-full relative group">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search identity node, email, or institutional ID..."
          />
        </div>
        <div className="w-full md:w-80">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input bg-slate-1000 border-slate-200 backdrop-blur-3xl px-6 py-4 text-[10px] font-black uppercase tracking-widest"
          >
            <option value="">All Institutional Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {getRoleLabel(r)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card border border-slate-200 bg-white/30 backdrop-blur-3xl rounded-[24px] overflow-hidden shadow-3d">
        <DataTable
          columns={cols}
          data={users}
          loading={loading}
          emptyMessage="No identity nodes detected in the current registry."
        />
        {totalPages > 1 && (
          <div className="px-10 py-6 border-t border-slate-200 flex items-center justify-between bg-white/[0.02]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Node Page {page} / {totalPages}
            </p>
            <div className="flex gap-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-20 border border-slate-200 transition-all shadow-xl"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-20 border border-slate-200 transition-all shadow-xl"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editUser ? "Modify Entity Identity" : "Initialize New Identity Node"
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
              {saving
                ? "Synchronizing..."
                : editUser
                  ? "Update Node"
                  : "Finalize Entity"}
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="label">Legal First Name</label>
              <input
                className="input"
                placeholder="e.g. Alexander"
                value={form.firstName}
                onChange={(e) => f("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label">Legal Last Name</label>
              <input
                className="input"
                placeholder="e.g. Pierce"
                value={form.lastName}
                onChange={(e) => f("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label">Institutional Email</label>
              <input
                type="email"
                className="input"
                placeholder="email@institution.edu"
                value={form.email}
                onChange={(e) => f("email", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label">
                {editUser ? "Override Security Code" : "Initial Security Code"}
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => f("password", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label">Authorization Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => f("role", e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {getRoleLabel(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Mobile Synchronizer (Phone)</label>
              <input
                className="input"
                placeholder="+233..."
                value={form.phone}
                onChange={(e) => f("phone", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="label">Gender Identification</label>
              <select
                className="input"
                value={form.gender}
                onChange={(e) => f("gender", e.target.value)}
              >
                {["Male", "Female", "Other"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {(form.role === "student" || form.role === "course_rep") && (
            <div className="bg-slate-100 rounded-[20px] p-6 border border-slate-200 space-y-8 shadow-inner backdrop-blur-3xl">
              <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] ml-1">
                Academic Metadata Node
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="label text-[10px]">
                    Academic Index Number
                  </label>
                  <input
                    className="input bg-slate-1000 border-slate-200 font-mono"
                    placeholder="STU-..."
                    value={form.studentInfo?.indexNumber || ""}
                    onChange={(e) => fs("indexNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="label text-[10px]">
                    Current Level Node
                  </label>
                  <select
                    className="input bg-slate-1000 border-slate-200"
                    value={form.studentInfo?.level || 100}
                    onChange={(e) => fs("level", parseInt(e.target.value))}
                  >
                    {[100, 200, 300, 400].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="label text-[10px]">
                    Primary Programme Node
                  </label>
                  <select
                    className="input bg-slate-1000 border-slate-200"
                    value={form.studentInfo?.programme || ""}
                    onChange={(e) => fs("programme", e.target.value)}
                  >
                    <option value="">Select Programme Node</option>
                    {programmes.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="label text-[10px]">
                    Department Hub Mapping
                  </label>
                  <select
                    className="input bg-slate-1000 border-slate-200"
                    value={form.studentInfo?.department || ""}
                    onChange={(e) => fs("department", e.target.value)}
                  >
                    <option value="">Select Department Node</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 p-6 bg-slate-100 rounded-[20px] border border-slate-200 shadow-inner">
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="active"
                checked={form.isActive}
                onChange={(e) => f("isActive", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
            </div>
            <label
              htmlFor="active"
              className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]"
            >
              Operational Status: {form.isActive ? "Live Hub" : "Deactivated"}
            </label>
          </div>
        </div>
      </Modal>

      {/* Link Parent/Student */}
      <Modal
        isOpen={showLink}
        onClose={() => setShowLink(false)}
        title="Institutional Parent Mapping Protocol"
        size="sm"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowLink(false)}
              className="btn-secondary"
            >
              Abort
            </button>
            <button onClick={handleLink} className="btn-primary px-10">
              Establish Node Link
            </button>
          </div>
        }
      >
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed mb-10">
          Synchronize parent authorization with student performance and
          financial data logs via the identity registry.
        </p>
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="label">Parent Entity Node ID</label>
            <input
              className="input font-mono text-[11px] bg-slate-1000 border-slate-200 tracking-widest"
              placeholder="PAR-..."
              value={linkData.parentId}
              onChange={(e) =>
                setLinkData((l) => ({ ...l, parentId: e.target.value }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="label">Student Entity Node ID</label>
            <input
              className="input font-mono text-[11px] bg-slate-1000 border-slate-200 tracking-widest"
              placeholder="STU-..."
              value={linkData.studentId}
              onChange={(e) =>
                setLinkData((l) => ({ ...l, studentId: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
