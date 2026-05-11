import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  DataTable,
} from "../../components/shared/UI";
import {
  FiCheck,
  FiX,
  FiEye,
  FiDollarSign,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import { formatDateTime } from "../../utils/helpers";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments");
      setPayments(res.data.data || []);
    } catch (err) {
      console.error("Error loading payments:", err);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    if (
      !window.confirm("Verify this payment and activate premium subscription?")
    )
      return;

    setVerifying(true);
    try {
      const res = await api.post(`/payments/${paymentId}/verify`);
      toast.success("Payment verified! Premium subscription activated.");
      loadPayments();
      setSelectedPayment(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-amber-50 text-amber-600 border border-amber-100",
        icon: FiClock,
      },
      completed: {
        color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        icon: FiCheck,
      },
      failed: {
        color: "bg-rose-50 text-rose-600 border border-rose-100",
        icon: FiX,
      },
      cancelled: {
        color: "bg-slate-50 text-slate-600 border border-slate-100",
        icon: FiX,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color.replace("bg-", "bg-").replace("text-", "text-")} flex items-center gap-1`}
      >
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "user",
      label: "Institutional Entity",
      render: (p) => (
        <div>
          <p className="font-bold text-slate-900 mb-0.5">
            {p.user?.firstName} {p.user?.lastName}
          </p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            {p.user?.email}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Authorized Amount",
      render: (p) => (
        <div className="flex items-center gap-1">
          <span className="font-black text-amber-500">GHS {p.amount}</span>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Mobile Node",
      render: (p) => (
        <span className="font-mono text-[10px] font-black text-slate-600 tracking-widest">
          {p.phoneNumber}
        </span>
      ),
    },
    {
      key: "status",
      label: "Sync Status",
      render: (p) => {
        const colors = {
          pending: "bg-amber-500/10 text-amber-500 border-amber-500/10",
          completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/10",
          failed: "bg-rose-500/10 text-rose-500 border-rose-500/10",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[p.status] || "bg-slate-100 text-slate-500"}`}
          >
            {p.status}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Authorization Date",
      render: (p) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {formatDateTime(p.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPayment(p)}
            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all border border-slate-200 shadow-xl"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
          {p.status === "pending" && (
            <button
              onClick={() => handleVerify(p._id)}
              disabled={verifying}
              className="px-4 py-2 bg-amber-600 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
            >
              {verifying ? "..." : "Verify"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Transaction Verification"
        subtitle="Review and authorize Mobile Money synchronization for institutional subscriptions"
      />

      {loading ? (
        <LoadingSpinner />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={FiDollarSign}
          title="No Pending Nodes"
          subtitle="All transaction synchronization requests have been processed."
        />
      ) : (
        <div className="card border border-slate-200">
          <div className="overflow-hidden rounded-[20px] border border-slate-200 shadow-2xl bg-white/30 backdrop-blur-3xl">
            <DataTable
              columns={columns}
              data={payments}
              searchable
              searchPlaceholder="Search verification logs..."
            />
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-[24px] shadow-3d max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar relative"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-6 flex items-center justify-between z-20">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  Node Detail
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">
                  Ref: {selectedPayment.transactionRef}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all border border-slate-200 shadow-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-10">
              <div className="bg-slate-100 rounded-[20px] p-5 border border-slate-200 shadow-inner">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-6 px-2">
                  Institutional Entity
                </h3>
                <div className="grid grid-cols-2 gap-5 px-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Name
                    </p>
                    <p className="font-bold text-slate-900 text-base">
                      {selectedPayment.user?.firstName}{" "}
                      {selectedPayment.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Email Node
                    </p>
                    <p className="font-bold text-slate-900 text-sm">
                      {selectedPayment.user?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Authority Role
                    </p>
                    <p className="font-bold text-amber-500 text-xs uppercase tracking-widest">
                      {selectedPayment.user?.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Affiliation
                    </p>
                    <p className="font-bold text-slate-900 text-xs uppercase">
                      {selectedPayment.user?.universityId?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 rounded-[20px] p-5 border border-slate-200 shadow-inner">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6 px-2">
                  Synchronization Payload
                </h3>
                <div className="grid grid-cols-2 gap-5 px-2">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Verified Amount
                    </p>
                    <p className="text-3xl font-black text-amber-500 tracking-tighter">
                      GHS {selectedPayment.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Protocol Type
                    </p>
                    <p className="font-black text-slate-900 text-xs uppercase tracking-widest">
                      {selectedPayment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Mobile Authority
                    </p>
                    <p className="font-mono font-black text-slate-900 text-sm tracking-widest">
                      {selectedPayment.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      Target Plan
                    </p>
                    <p className="font-black text-slate-900 text-xs uppercase tracking-widest">
                      {selectedPayment.subscriptionPlan}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPayment.status === "pending" && (
                <div className="bg-amber-600/5 border border-amber-500/10 rounded-[20px] p-5 shadow-inner">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/20">
                      <FiAlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">
                        Verification Protocol
                      </h3>
                      <div className="space-y-3 text-[11px] font-bold text-slate-600">
                        <p className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Recipient Hub:</span>{" "}
                          <span className="text-slate-900">FRANK DARKO</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Target Phone:</span>{" "}
                          <span className="text-slate-900">0536716556</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Reference Key:</span>{" "}
                          <span className="text-slate-900 font-mono uppercase tracking-widest">
                            {selectedPayment.transactionRef}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => handleVerify(selectedPayment._id)}
                    disabled={verifying}
                    className="flex-1 py-5 bg-amber-600 text-slate-900 font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95 text-[11px]"
                  >
                    {verifying
                      ? "Synchronizing Node..."
                      : "Authorize & Activate Node"}
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="px-10 py-5 bg-slate-100 text-slate-600 font-black uppercase tracking-[0.2em] rounded-[24px] border border-slate-200 hover:bg-slate-200 transition-all text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
