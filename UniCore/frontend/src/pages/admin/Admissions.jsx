import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  LoadingSpinner,
  SearchInput,
} from "../../components/shared/UI";
import { FiPlus, FiUserPlus, FiTrash2, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { ACADEMIC_CONSTANTS } from "../../utils/constants";

export default function AdminAdmissions() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    indexNumber: "",
    firstName: "",
    lastName: "",
    faculty: "",
    department: "",
    level: 100,
  });

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/admissions");
      setRecords(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load admission records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/admin/admissions", form);
      toast.success("Admission record created");
      setShowModal(false);
      setForm({
        indexNumber: "",
        firstName: "",
        lastName: "",
        faculty: "",
        department: "",
        level: 100,
      });
      loadRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admission record?")) return;
    try {
      await api.delete(`/admin/admissions/${id}`);
      toast.success("Record deleted");
      loadRecords();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const columns = [
    {
      key: "indexNumber",
      label: "Institutional Node",
      render: (r) => (
        <span className="font-mono font-black text-amber-500 uppercase tracking-widest">
          {r.indexNumber}
        </span>
      ),
    },
    {
      key: "name",
      label: "Identity Entity",
      render: (r) => (
        <p className="font-bold text-slate-900 mb-0.5">
          {r.firstName} {r.lastName}
        </p>
      ),
    },
    {
      key: "faculty",
      label: "Faculty Hub",
      render: (r) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          {r.faculty}
        </span>
      ),
    },
    {
      key: "department",
      label: "Academic Node",
      render: (r) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          {r.department}
        </span>
      ),
    },
    {
      key: "status",
      label: "Sync Status",
      render: (r) => (
        <span
          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${r.isRegistered ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-amber-500/10 text-amber-500 border-amber-500/10"}`}
        >
          {r.isRegistered ? "Authorized" : "Pending Verification"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <button
          onClick={() => handleDelete(r._id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-rose-500 transition-all border border-slate-200 shadow-xl"
        >
          <FiTrash2 />
        </button>
      ),
    },
  ];

  const filteredRecords = records.filter(
    (r) =>
      r.indexNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.lastName.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredDepts = ACADEMIC_CONSTANTS.DEPARTMENTS.filter(
    (d) =>
      !form.faculty ||
      d.faculty ===
        ACADEMIC_CONSTANTS.FACULTIES.find((f) => f.name === form.faculty)?.code,
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Registry Admissions"
        subtitle="Global management of pre-authorized institutional identity nodes"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary shadow-xl shadow-amber-600/20 px-8 py-4"
          >
            <FiPlus className="w-4 h-4" /> Initialize Entity
          </button>
        }
      />

      <div className="card border border-slate-200">
        <div className="mb-8 max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search identity registry..."
          />
        </div>

        <div className="overflow-hidden rounded-[20px] border border-slate-200 shadow-2xl bg-white/30 backdrop-blur-3xl">
          <DataTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            emptyMessage="No authorized nodes detected in the current registry session."
          />
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Authorize Identity Node"
        size="md"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel Synchronization
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-10"
            >
              {saving ? "Authorizing..." : "Authorize Node"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Given Name</label>
              <input
                className="input"
                placeholder="e.g. John"
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="label">Family Name</label>
              <input
                className="input"
                placeholder="e.g. Doe"
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Institutional Index Node</label>
            <input
              className="input font-mono uppercase tracking-widest"
              placeholder="e.g. EB-2024-SYS-001"
              value={form.indexNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  indexNumber: e.target.value.toUpperCase(),
                }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Faculty Hub</label>
              <select
                className="input"
                value={form.faculty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, faculty: e.target.value }))
                }
                required
              >
                <option value="">Select Faculty Hub</option>
                {ACADEMIC_CONSTANTS.FACULTIES.map((f) => (
                  <option key={f.code} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Academic Dept</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                required
              >
                <option value="">Select Department Node</option>
                {filteredDepts.map((d) => (
                  <option key={d.code} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-amber-600/5 rounded-[20px] p-5 border border-amber-500/10 flex gap-4 shadow-inner">
            <FiUserPlus className="text-amber-500 w-6 h-6 flex-shrink-0 mt-1" />
            <p className="text-[10px] font-black text-amber-500/70 leading-relaxed uppercase tracking-[0.2em]">
              Authorization will initialize a cryptographic identity node. Once
              synchronized with a live entity account, this record will be
              permanently locked to the authorized user.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
