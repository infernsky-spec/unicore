import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  LoadingSpinner,
} from "../../components/shared/UI";
import {
  FiPlus,
  FiShield,
  FiTrash2,
  FiSearch,
  FiBriefcase,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { ACADEMIC_CONSTANTS } from "../../utils/constants";

export default function AdminStaffRegistry() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    idNumber: "",
    role: "teacher",
    faculty: "",
    department: "",
  });

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/staff-verification");
      setRecords(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load staff records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.idNumber) return toast.error("Access ID is required");
    setSaving(true);
    try {
      await api.post("/admin/staff-verification", form);
      toast.success("Staff access authorized");
      setShowModal(false);
      setForm({ idNumber: "", role: "teacher", faculty: "", department: "" });
      loadRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Revoke this access ID?")) return;
    try {
      await api.delete(`/admin/staff-verification/${id}`);
      toast.success("Access revoked");
      loadRecords();
    } catch (err) {
      toast.error("Failed to revoke access");
    }
  };

  const columns = [
    {
      key: "idNumber",
      label: "Access ID",
      render: (r) => (
        <span className="font-mono font-black text-amber-500">
          {r.idNumber}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
          {r.role.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "faculty",
      label: "Faculty",
      render: (r) => (
        <span className="text-[9px] font-bold text-slate-500 uppercase">
          {r.faculty || "—"}
        </span>
      ),
    },
    {
      key: "department",
      label: "Dept",
      render: (r) => (
        <span className="text-[9px] font-bold text-slate-500 uppercase">
          {r.department || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Usage",
      render: (r) => (
        <span
          className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${r.isUsed ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
        >
          {r.isUsed ? "Consumed" : "Active"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <button
          onClick={() => handleDelete(r._id)}
          className="text-slate-600 hover:text-red-500 transition-colors p-2"
        >
          <FiTrash2 />
        </button>
      ),
    },
  ];

  const filteredRecords = records.filter(
    (r) =>
      r.idNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredDepts = ACADEMIC_CONSTANTS.DEPARTMENTS.filter(
    (d) =>
      !form.faculty ||
      d.faculty ===
        ACADEMIC_CONSTANTS.FACULTIES.find((f) => f.name === form.faculty)?.code,
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Institutional Staff Registry"
        subtitle="Global management of secure Access IDs for academic personnel"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-xl shadow-amber-600/20 px-6 py-3.5 text-[9px]"
          >
            <FiPlus className="w-3.5 h-3.5" /> Authorize Personnel
          </button>
        }
      />

      <div className="card border border-slate-200 bg-white/40 p-6 rounded-[20px] shadow-3d">
        <div className="relative mb-6 max-w-sm group">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Search identity registry..."
            className="input pl-11 h-10 text-[11px] bg-white/40 border-slate-200 focus:border-amber-500/50 rounded-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 shadow-inner bg-white/20">
          <DataTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            emptyMessage="No authorized personnel nodes detected."
          />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Authorize Staff Node"
        size="md"
        footer={
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary h-10 px-6 text-[8px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary h-10 px-8 text-[8px]"
            >
              {saving ? "Syncing..." : "Authorize"}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Network Authority Role
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                className="input pl-11 h-11 text-[11px] rounded-2xl"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value }))
                }
                required
              >
                <option value="teacher">Institutional Lecturer</option>
                <option value="dept_head">Head of Department (HOD)</option>
                <option value="faculty_head">Dean / Head of Faculty</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Access Node (ID)
            </label>
            <div className="relative">
              <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" />
              <input
                className="input pl-11 h-11 text-[11px] font-mono uppercase text-amber-500 tracking-widest rounded-2xl"
                placeholder="e.g. STF-2024-HOD-01"
                value={form.idNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    idNumber: e.target.value.toUpperCase(),
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Faculty Hub
              </label>
              <select
                className="input h-11 text-[11px] rounded-2xl"
                value={form.faculty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, faculty: e.target.value }))
                }
                required
              >
                <option value="">Select Hub</option>
                {ACADEMIC_CONSTANTS.FACULTIES.map((f) => (
                  <option key={f.code} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            {form.role !== "faculty_head" && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Academic Dept
                </label>
                <select
                  className="input h-11 text-[11px] rounded-2xl"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Dept</option>
                  {filteredDepts.map((d) => (
                    <option key={d.code} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-amber-600/5 rounded-[24px] p-6 border border-amber-500/10 flex gap-4 shadow-inner">
            <FiShield className="text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] font-black text-amber-500/70 leading-relaxed uppercase tracking-widest">
              Authorization Protocol: Node is unique. Ensure recipient
              initializes institutional access with this exact key.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
