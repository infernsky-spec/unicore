// ─── ADMIN FEES PAGE ─────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  Modal,
  LoadingSpinner,
  StatCard,
} from "../../components/shared/UI";
import {
  formatCurrency,
  formatDate,
  getFeesStatusBadge,
  getInitials,
} from "../../utils/helpers";
import {
  FiPlus,
  FiDollarSign,
  FiCheck,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminFees() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: "",
    method: "mobile_money",
    reference: "",
    notes: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(statusFilter && { status: statusFilter }),
      });
      const [billsRes, struRes] = await Promise.all([
        api.get(`/fees/bills?${params}`),
        api.get("/fees/structures"),
      ]);
      setBills(billsRes.data.data || []);
      setTotalPages(billsRes.data.pages || 1);
      setStructures(struRes.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, statusFilter]);

  const handleRecordPayment = async () => {
    if (!payForm.amount) {
      toast.error("Amount required");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/fees/bills/${selectedBill._id}/payments`, payForm);
      toast.success("Payment recorded");
      setShowPayment(false);
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: "student",
      label: "Institutional Entity",
      render: (b) => (
        <div className="flex items-center gap-5 group">
          <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-amber-500 rounded-[18px] flex items-center justify-center text-[11px] font-black shadow-inner flex-shrink-0 group-hover:bg-amber-600 group-hover:text-slate-900 transition-all duration-500">
            {getInitials(b.student?.firstName, b.student?.lastName)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 mb-0.5 group-hover:text-amber-500 transition-colors uppercase tracking-tight">
              {b.student?.firstName} {b.student?.lastName}
            </p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] truncate">
              {b.student?.studentInfo?.indexNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "billNumber",
      label: "Registry Bill #",
      render: (b) => (
        <span className="font-mono text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase">
          {b.billNumber}
        </span>
      ),
    },
    {
      key: "totalBilled",
      label: "Aggregate Billed",
      render: (b) => (
        <span className="font-black text-slate-900">
          {formatCurrency(b.totalBilled)}
        </span>
      ),
    },
    {
      key: "totalPaid",
      label: "Authorized Paid",
      render: (b) => (
        <span className="text-emerald-500 font-black">
          {formatCurrency(b.totalPaid)}
        </span>
      ),
    },
    {
      key: "balance",
      label: "Liability Node",
      render: (b) => (
        <span
          className={`font-black tracking-tighter text-[15px] ${b.balance > 0 ? "text-rose-500" : "text-emerald-500"}`}
        >
          {formatCurrency(b.balance)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Sync Status",
      render: (b) => (
        <span
          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${b.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : b.status === "partial" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"}`}
        >
          {b.status} Protocol
        </span>
      ),
    },
    {
      key: "dueDate",
      label: "Sync Deadline",
      render: (b) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {formatDate(b.dueDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (b) =>
        b.status !== "paid" && b.status !== "waived" ? (
          <button
            onClick={() => {
              setSelectedBill(b);
              setShowPayment(true);
            }}
            className="px-6 py-3 bg-amber-600 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-amber-600/20 active:scale-95 hover:bg-amber-700 transition-all"
          >
            Authorize Sync
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <PageHeader
        title="Financial Ledger Registry"
        subtitle="Global oversight of institutional billing nodes and transaction synchronization"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            l: "Pending Liabilities",
            v: bills.filter((b) => b.status === "unpaid").length,
            c: "text-rose-500",
            i: FiAlertTriangle,
            b: "bg-rose-500/10",
          },
          {
            l: "Partial Synchronizations",
            v: bills.filter((b) => b.status === "partial").length,
            c: "text-amber-500",
            i: FiDollarSign,
            b: "bg-amber-500/10",
          },
          {
            l: "Authorized Clearances",
            v: bills.filter((b) => b.status === "paid").length,
            c: "text-emerald-500",
            i: FiCheck,
            b: "bg-emerald-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="card py-12 border border-slate-200 bg-white/30 backdrop-blur-3xl relative overflow-hidden group rounded-[24px] shadow-3d"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 ${stat.b} blur-[60px] rounded-full group-hover:scale-125 transition-transform duration-700`}
            />
            <div className="flex items-center justify-between relative z-10 px-10">
              <div>
                <p
                  className={`text-5xl font-black mb-2 tracking-tighter ${stat.c}`}
                >
                  {stat.v}
                </p>
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
                  {stat.l}
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shadow-inner ${stat.b} border border-slate-200 ${stat.c}`}
              >
                <stat.i />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border border-slate-200 bg-white/30 backdrop-blur-3xl rounded-[24px] overflow-hidden shadow-3d">
        <div className="flex flex-col md:flex-row gap-6 items-center p-6 border-b border-slate-200 bg-white/[0.02]">
          <select
            className="input md:w-80 bg-slate-1000 border-slate-200 backdrop-blur-3xl px-6 py-4 text-[10px] font-black uppercase tracking-widest"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Operational Statuses</option>
            {["unpaid", "partial", "paid", "overdue", "waived"].map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)} Node
              </option>
            ))}
          </select>
          <div className="flex-1" />
          {totalPages > 1 && (
            <div className="flex items-center gap-4 bg-slate-1000 rounded-[24px] p-2 border border-slate-200 backdrop-blur-3xl shadow-xl">
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
        <div className="overflow-hidden">
          <DataTable
            columns={columns}
            data={bills}
            loading={loading}
            emptyMessage="No financial nodes detected in the current registry."
          />
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        title="Authorize Transaction Sync Protocol"
        size="sm"
        footer={
          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setShowPayment(false)}
              className="btn-secondary"
            >
              Abort Session
            </button>
            <button
              onClick={handleRecordPayment}
              disabled={saving}
              className="btn-primary px-12"
            >
              {saving ? "Synchronizing..." : "Authorize Transaction"}
            </button>
          </div>
        }
      >
        {selectedBill && (
          <div className="space-y-8">
            <div className="bg-amber-600/5 border border-amber-500/10 rounded-[20px] p-5 shadow-inner text-center backdrop-blur-3xl">
              <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">
                Institutional Entity Node
              </p>
              <p className="text-2xl font-black text-slate-900 leading-none mb-6 tracking-tight">
                {selectedBill.student?.firstName}{" "}
                {selectedBill.student?.lastName}
              </p>
              <div className="inline-block px-8 py-3 bg-rose-500/10 border border-rose-500/10 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em]">
                  Liability Node: {formatCurrency(selectedBill.balance)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="label">Sync Amount (GHS)</label>
              <input
                type="number"
                className="input bg-slate-1000 border-slate-200"
                placeholder="0.00"
                value={payForm.amount}
                onChange={(e) =>
                  setPayForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Synchronization Protocol</label>
              <select
                className="input bg-slate-1000 border-slate-200"
                value={payForm.method}
                onChange={(e) =>
                  setPayForm((f) => ({ ...f, method: e.target.value }))
                }
              >
                {["mobile_money", "bank", "cash", "online", "cheque"].map(
                  (m) => (
                    <option key={m} value={m}>
                      {m.replace("_", " ").toUpperCase()} INTERFACE
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-3">
              <label className="label">Authorization Reference</label>
              <input
                className="input bg-slate-1000 border-slate-200 font-mono"
                placeholder="Transaction ID or Receipt #"
                value={payForm.reference}
                onChange={(e) =>
                  setPayForm((f) => ({ ...f, reference: e.target.value }))
                }
              />
            </div>
            <div className="space-y-3">
              <label className="label">Node Registry Notes</label>
              <textarea
                className="input h-32 resize-none bg-slate-1000 border-slate-200"
                placeholder="Provide essential transaction context for auditing..."
                value={payForm.notes}
                onChange={(e) =>
                  setPayForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
