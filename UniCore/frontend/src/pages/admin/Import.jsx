import { useState } from "react";
import api from "../../utils/api";
import { PageHeader, Alert } from "../../components/shared/UI";
import { FiUpload, FiDownload, FiLink, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

const CSV_TEMPLATE = `firstName,lastName,email,indexNumber,level,enrollmentYear
Ama,Mensah,ama.mensah@student.edu,UCU/IT/24/001,100,2024
Kofi,Asante,kofi.asante@student.edu,UCU/IT/24/002,100,2024
Akua,Boateng,akua.boateng@student.edu,UCU/CS/23/001,200,2023`;

export default function AdminImport() {
  const [file, setFile] = useState(null);
  const [jsonText, setJsonText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("csv");
  const [linkForm, setLinkForm] = useState({ userId: "", indexNumber: "" });
  const [linkResult, setLinkResult] = useState(null);

  const handleImport = async () => {
    if (tab === "csv" && !file && !jsonText)
      return toast.error("Upload a file or paste JSON data");
    setLoading(true);
    try {
      let res;
      if (tab === "csv" && file) {
        const fd = new FormData();
        fd.append("file", file);
        res = await api.post("/import/students", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const students = JSON.parse(jsonText);
        res = await api.post("/import/students", { students });
      }
      setResults(res.data.results);
      toast.success(res.data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!linkForm.userId || !linkForm.indexNumber)
      return toast.error("Both fields required");
    try {
      await api.post("/import/link-student", linkForm);
      setLinkResult(
        `Linked index ${linkForm.indexNumber} to user ${linkForm.userId}`,
      );
      toast.success("Linked successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Identity Synchronization"
        subtitle="Institutional migration hub for bulk student ingestion and identity node linking"
      />

      <div className="bg-amber-600/5 border border-amber-500/10 rounded-[20px] p-5 flex gap-6 shadow-inner">
        <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/20">
          <FiUsers className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">
            Migration Protocol
          </h3>
          <p className="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-widest">
            Synchronize external student logs with the UniCore registry. All
            imported entities are initialized with the default security key:{" "}
            <span className="text-slate-900">EduBridge@123</span>. Password rotation
            is mandatory on initial node activation.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 p-2 bg-slate-100 rounded-[24px] border border-slate-200 backdrop-blur-3xl w-fit">
        {[
          { id: "csv", label: "Bulk Ingestion" },
          { id: "link", label: "Node Linking" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-8 py-3 text-[9px] font-black uppercase tracking-widest rounded-[16px] transition-all duration-500 ${tab === t.id ? "bg-amber-600 text-slate-900 shadow-xl shadow-amber-600/20" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "csv" && (
        <div className="card border border-slate-200 p-6 space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">
              Bulk Identity Ingestion
            </h3>
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all shadow-xl"
            >
              <FiDownload className="w-3.5 h-3.5 inline mr-2" /> CSV Protocol
              Template
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="label">Authorization File (CSV/JSON)</label>
              <div className="relative group">
                <FiUpload className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-500 transition-colors" />
                <input
                  type="file"
                  accept=".csv,.json"
                  className="input pl-14 py-4"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              {file && (
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">
                  ✅ Node Ready: {file.name}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <label className="label">Manual JSON Payload Ingestion</label>
              <textarea
                className="input h-32 resize-none font-mono text-[10px] tracking-widest bg-slate-1000"
                placeholder='[{"firstName":"Ama","lastName":"Mensah",...}]'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleImport}
            disabled={loading}
            className="btn-primary w-full py-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-600/20"
          >
            <FiUpload className="w-4 h-4 inline mr-2" />{" "}
            {loading ? "Synchronizing Registry..." : "Authorize Bulk Ingestion"}
          </button>
          {results && (
            <div
              className={`p-5 rounded-[20px] border ${results.failed?.length ? "bg-amber-500/5 border-amber-500/10" : "bg-emerald-500/5 border-emerald-500/10"} shadow-inner`}
            >
              <p className="text-[11px] font-black uppercase tracking-widest mb-4">
                Ingestion Results:
              </p>
              <div className="flex gap-6">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Nodes Created
                  </p>
                  <p className="text-xl font-black text-emerald-500 tracking-tighter">
                    {results.created}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Redundant Nodes
                  </p>
                  <p className="text-xl font-black text-slate-600 tracking-tighter">
                    {results.skipped}
                  </p>
                </div>
              </div>
              {results.errors?.slice(0, 5).map((e, i) => (
                <p
                  key={i}
                  className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4"
                >
                  ERROR: {e}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "link" && (
        <div className="card border border-slate-200 p-6 space-y-10">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">
            Identity Node Association
          </h3>
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
            Map a verified internal identity node to a live institutional
            account using unique identifiers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="label">
                Cryptographic User ID (Registry ID)
              </label>
              <input
                className="input font-mono tracking-widest bg-slate-1000"
                placeholder="e.g. STU-2024-SYS-NODE-0001"
                value={linkForm.userId}
                onChange={(e) =>
                  setLinkForm((f) => ({ ...f, userId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Consolidated Index Node</label>
              <input
                className="input font-mono tracking-widest bg-slate-1000"
                placeholder="e.g. EB/SYS/IT/24/001"
                value={linkForm.indexNumber}
                onChange={(e) =>
                  setLinkForm((f) => ({ ...f, indexNumber: e.target.value }))
                }
              />
            </div>
          </div>
          <button
            onClick={handleLink}
            className="btn-primary w-full py-6 text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-600/20"
          >
            <FiLink className="w-4 h-4 inline mr-2" /> Authorize Association
          </button>
          {linkResult && (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-emerald-500 shadow-inner">
              ✅ Node Synced: {linkResult}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="card border border-slate-200 p-6 bg-white/[0.02] backdrop-blur-3xl rounded-[24px]">
        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-10">
          Ingestion Protocol Documentation
        </h3>
        <div className="space-y-6">
          {[
            "Initialize ingestion by downloading the standardized CSV protocol template.",
            "Populate the node matrix — unique email identifiers are mandatory for synchronization.",
            "Deploy the protocol as a CSV/JSON payload. Redundant nodes are automatically bypassed.",
            "Initial security keys are standardized to EduBridge@123 for all synchronized entities.",
            "Post-ingestion: Assign identity nodes to Faculty Hubs and Academic Depts via the Registry.",
            "Self-Synchronization: Entities can manually link their index nodes via the Profile Protocol.",
          ].map((s, i) => (
            <div key={i} className="flex gap-6 items-center group">
              <span className="w-10 h-10 bg-slate-100 border border-slate-200 text-amber-500 rounded-2xl flex items-center justify-center text-[11px] font-black flex-shrink-0 group-hover:bg-amber-600 group-hover:text-slate-900 transition-all duration-500 shadow-xl">
                {i + 1}
              </span>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed group-hover:text-slate-700 transition-colors">
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
