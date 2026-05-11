import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { PageHeader, LoadingSpinner, Alert } from "../../components/shared/UI";
import {
  FiCreditCard,
  FiCheck,
  FiAlertCircle,
  FiPhone,
  FiZap,
  FiShield,
  FiCpu,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminSubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const res = await api.get("/payments/subscription/current");
      setSubscription(res.data.data);
    } catch (err) {
      // Fallback for demo/restricted accounts
      setSubscription({
        status: user?.needsActivation ? "inactive" : "active",
        isPremium: !user?.needsActivation,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!paymentPhone) return toast.error("Phone number required");

    setInitiatingPayment(true);
    try {
      const transactionRef = "EB-" + Date.now();
      toast.success("Payment protocol initialized");

      // Visual feedback
      setTimeout(() => {
        alert(
          `🎉 DEPLOYMENT READY!\n\n` +
            `📱 Transfer GHS 900 to:\n` +
            `FRANK DARKO\n` +
            `0536716556 (MTN / Telecel)\n\n` +
            `💳 Reference ID: ${transactionRef}\n\n` +
            `✅ Upload verification via WhatsApp to 0536716556\n` +
            `Node activation complete in < 5 mins.`,
        );
        setInitiatingPayment(false);
      }, 1000);
    } catch (err) {
      toast.error("Protocol error");
      setInitiatingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const isActive = subscription?.isPremium || !user?.needsActivation;

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Network Activation Hub"
        subtitle="Global oversight and scaling of institutional infrastructure nodes via the EduBridge Protocol"
        actions={
          <div className="flex items-center gap-3 bg-slate-100 px-6 py-3 rounded-2xl border border-slate-200 shadow-xl backdrop-blur-md">
            <FiZap className="text-amber-500 w-4 h-4" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              Protocol Version 4.5.1
            </span>
          </div>
        }
      />

      {/* Activation Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-[56px] p-16 border border-slate-200 relative overflow-hidden shadow-3d ${isActive ? "bg-emerald-600/5" : "bg-amber-600/5"}`}
      >
        <div className="absolute top-0 right-0 p-16 opacity-[0.05] pointer-events-none">
          {isActive ? (
            <FiShield className="w-80 h-80 text-emerald-500" />
          ) : (
            <FiAlertCircle className="w-80 h-80 text-amber-500" />
          )}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-6">
              Institutional Node Authorization
            </p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-8 uppercase">
              {isActive ? "Authorized Node" : "Node Restrictive"}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <span
                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl ${isActive ? "bg-emerald-600 text-slate-900 shadow-emerald-600/20" : "bg-amber-600 text-slate-900 shadow-amber-600/20"}`}
              >
                {isActive ? "LIVE NETWORK ACTIVE" : "AWAITING AUTHORIZATION"}
              </span>
              {subscription?.expiryDate && (
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest border-l border-slate-200 pl-6">
                  Expires:{" "}
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div
            className={`w-28 h-28 rounded-[20px] flex items-center justify-center text-5xl shadow-3d ${isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
          >
            {isActive ? <FiCheck /> : <FiShield />}
          </div>
        </div>
      </motion.div>

      {!isActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Grid */}
          <div className="space-y-8">
            <h3 className="text-[11px] font-black text-amber-500 tracking-[0.4em] uppercase px-4">
              Core Infrastructure Capabilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  t: "Faculty Hub Control",
                  d: "Global management of academic nodes and personnel",
                  i: <FiCpu />,
                },
                {
                  t: "Fiscal Ledger Sync",
                  d: "Automated institutional fee reconciliation engine",
                  i: <FiCreditCard />,
                },
                {
                  t: "Integrity Protocol",
                  d: "Verified grade distribution and result logs",
                  i: <FiCheck />,
                },
                {
                  t: "Network Analytics",
                  d: "Consolidated university performance oversight",
                  i: <FiZap />,
                },
              ].map((b, idx) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="bg-slate-100 border border-slate-200 rounded-[20px] p-5 shadow-2xl hover:bg-white/[0.07] transition-all group backdrop-blur-3xl"
                >
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-600 group-hover:text-slate-900 transition-all shadow-inner border border-slate-200">
                    {b.i}
                  </div>
                  <h4 className="text-[11px] font-black text-slate-900 mb-2 uppercase tracking-widest">
                    {b.t}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                    {b.d}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing & Form */}
          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-[56px] p-12 shadow-3d relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 blur-[100px] -mr-40 -mt-40" />
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] mb-6">
                    Activation Subscription
                  </p>
                  <div className="flex items-baseline justify-center gap-3">
                    <span className="text-7xl font-black text-slate-900 tracking-tighter">
                      GHS 900
                    </span>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      / Node Cycle
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="relative group">
                    <FiPhone className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="tel"
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="Billing Node Authority (Phone)"
                      className="w-full bg-slate-100 border border-slate-200 rounded-[24px] pl-16 pr-8 py-5 text-[11px] font-black tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all text-slate-900 uppercase"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={initiatingPayment}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 py-6 rounded-[24px] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-amber-600/20 transition-all active:scale-95 disabled:opacity-30"
                  >
                    {initiatingPayment
                      ? "Initializing Session..."
                      : "Authorize Activation"}
                  </button>
                </form>

                <div className="mt-10 flex items-center justify-center gap-5 border-t border-slate-200 pt-8">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                      MTN Hub
                    </span>
                  </div>
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                      Telecel Node
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="bg-slate-100 rounded-[56px] p-16 text-center border border-slate-200 shadow-3d backdrop-blur-3xl max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-5xl mx-auto mb-10 shadow-inner text-emerald-500 border border-emerald-500/10">
            ✅
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-6 uppercase">
            Infrastructure Active
          </h3>
          <p className="text-slate-600 font-bold max-w-md mx-auto mb-12 uppercase text-[11px] tracking-widest leading-relaxed">
            Institutional authority verified. Your node is fully synchronized
            and operational within the global EduBridge Network.
          </p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-amber-600 text-slate-900 px-16 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95"
          >
            Enter Network Control →
          </button>
        </div>
      )}
    </div>
  );
}
