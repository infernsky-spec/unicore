import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  LoadingSpinner,
} from "../../components/shared/UI";
import { FiPlus, FiEdit, FiLayers } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminFaculties() {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("faculties");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("faculty");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    faculty: "",
    department: "",
    duration: 4,
    degreeType: "BSc",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [fRes, dRes, pRes] = await Promise.all([
        api.get("/admin/faculties"),
        api.get("/admin/departments"),
        api.get("/admin/programmes"),
      ]);
      setFaculties(fRes.data.data || []);
      setDepartments(dRes.data.data || []);
      setProgrammes(pRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalType === "faculty") await api.post("/admin/faculties", form);
      else if (modalType === "department")
        await api.post("/admin/departments", form);
      else await api.post("/admin/programmes", form);
      toast.success(
        `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} created`,
      );
      setShowModal(false);
      setForm({
        name: "",
        code: "",
        description: "",
        faculty: "",
        department: "",
        duration: 4,
        degreeType: "BSc",
      });
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const facCols = [
    {
      key: "code",
      label: "Hub Node",
      render: (f) => (
        <span className="font-mono font-black text-amber-500 uppercase tracking-widest">
          {f.code}
        </span>
      ),
    },
    {
      key: "name",
      label: "Faculty Entity",
      render: (f) => <p className="font-bold text-slate-900 mb-0.5">{f.name}</p>,
    },
    {
      key: "description",
      label: "Identity Protocol",
      render: (f) => (
        <span className="text-slate-500 text-[10px] italic font-medium uppercase tracking-widest">
          {f.description || "—"}
        </span>
      ),
    },
  ];
  const deptCols = [
    {
      key: "code",
      label: "Academic Node",
      render: (d) => (
        <span className="font-mono font-black text-orange-500 uppercase tracking-widest">
          {d.code}
        </span>
      ),
    },
    {
      key: "name",
      label: "Department Entity",
      render: (d) => <p className="font-bold text-slate-900 mb-0.5">{d.name}</p>,
    },
    {
      key: "faculty",
      label: "Parent Hub",
      render: (d) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {d.faculty?.name || "—"}
        </span>
      ),
    },
  ];
  const progCols = [
    {
      key: "code",
      label: "Curriculum Node",
      render: (p) => (
        <span className="font-mono font-black text-amber-500 uppercase tracking-widest">
          {p.code}
        </span>
      ),
    },
    {
      key: "name",
      label: "Programme Entity",
      render: (p) => <p className="font-bold text-slate-900 mb-0.5">{p.name}</p>,
    },
    {
      key: "degreeType",
      label: "Auth Type",
      render: (p) => (
        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-500/10">
          {p.degreeType}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Node Timeline",
      render: (p) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {p.duration} Cycles (Years)
        </span>
      ),
    },
    {
      key: "department",
      label: "Department Hub",
      render: (p) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {p.department?.name || "—"}
        </span>
      ),
    },
  ];

  const TABS = [
    { id: "faculties", label: "Faculties Hub" },
    { id: "departments", label: "Academic Depts" },
    { id: "programmes", label: "Programmes Registry" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Academic Infrastructure Hub"
        subtitle="Management of institutional hierarchies: Faculties, Departments, and Program Nodes"
        actions={
          <button
            onClick={() => openModal(tab.slice(0, -1))}
            className="btn-primary shadow-xl shadow-amber-600/20 px-8 py-4"
          >
            <FiPlus className="w-4 h-4" /> Initialize Node
          </button>
        }
      />

      <div className="flex gap-4 p-2 bg-slate-100 rounded-[24px] border border-slate-200 backdrop-blur-3xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-8 py-3 text-[9px] font-black uppercase tracking-widest rounded-[16px] transition-all duration-500 ${tab === t.id ? "bg-amber-600 text-slate-900 shadow-xl shadow-amber-600/20" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card border border-slate-200">
        <div className="overflow-hidden rounded-[20px] border border-slate-200 shadow-2xl bg-white/30 backdrop-blur-3xl">
          {tab === "faculties" && (
            <DataTable
              columns={facCols}
              data={faculties}
              loading={loading}
              emptyMessage="No active faculty hubs detected."
            />
          )}
          {tab === "departments" && (
            <DataTable
              columns={deptCols}
              data={departments}
              loading={loading}
              emptyMessage="No active department nodes detected."
            />
          )}
          {tab === "programmes" && (
            <DataTable
              columns={progCols}
              data={programmes}
              loading={loading}
              emptyMessage="No active programme nodes detected."
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Initialize ${modalType.charAt(0).toUpperCase() + modalType.slice(1)} Node`}
        size="md"
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
              {saving ? "Synchronizing..." : "Authorize Node"}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="label">Node Identifier (Name)</label>
            <input
              className="input"
              placeholder="Enter node name..."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Institutional Key (Code)</label>
            <input
              className="input font-mono uppercase tracking-widest"
              placeholder="e.g. FCIS"
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
            />
          </div>
          {modalType === "department" && (
            <div>
              <label className="label">Parent Faculty Hub</label>
              <select
                className="input"
                value={form.faculty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, faculty: e.target.value }))
                }
              >
                <option value="">Select Parent Hub</option>
                {faculties.map((fc) => (
                  <option key={fc._id} value={fc._id}>
                    {fc.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {modalType === "programme" && (
            <>
              <div>
                <label className="label">Academic Dept Node</label>
                <select
                  className="input"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                >
                  <option value="">Select Dept Node</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Node Lifecycle (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="input"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Degree Authorization Type</label>
                  <select
                    className="input"
                    value={form.degreeType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, degreeType: e.target.value }))
                    }
                  >
                    {[
                      "BSc",
                      "BA",
                      "BEng",
                      "LLB",
                      "MSc",
                      "MA",
                      "PhD",
                      "HND",
                      "Diploma",
                    ].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="label">Node Documentation (Description)</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Provide institutional context..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
