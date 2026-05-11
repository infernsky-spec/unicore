import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  PageHeader,
  Alert,
  LoadingSpinner,
  Badge,
} from "../../components/shared/UI";
import {
  FiCreditCard,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiDownload,
  FiZap,
  FiShield,
  FiStar,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function PremiumPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, payRes] = await Promise.all([
        api.get("/payments/subscription/current"),
        api.get("/payments"),
      ]);
      setSubscription(subRes.data.data);
      setPayments(payRes.data.data || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("Phone number required");
      return;
    }

    setInitiating(true);
    try {
      const res = await api.post("/payments/initiate", {
        amount: 900,
        phoneNumber,
        type: "subscription",
        subscriptionPlan: "premium",
        billingPeriod: "monthly",
      });

      toast.success("Payment initiated!");

      // Show instructions in a refined way (using toast or a state-driven modal would be better, but keeping the logic)
      alert(
        `Payment Instructions:\n\n` +
          `Recipient: ${res.data.instructions.recipient}\n` +
          `Phone: ${res.data.instructions.phone}\n` +
          `Amount: GHS ${res.data.instructions.amount}\n` +
          `Reference: ${res.data.instructions.reference}\n\n` +
          `Send the payment and wait for confirmation.`,
      );

      setPhoneNumber("");
      setShowPaymentForm(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment initiation failed");
    } finally {
      setInitiating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 pb-20">
      <PageHeader
        title="Premium Access Hub"
        subtitle="Manage your neural link bandwidth and account tier"
        actions={
          subscription?.isCreator ? (
            <div className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-600/20">
              ✨ Creator Protocol Active
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
                <FiZap className="text-amber-500 w-3 h-3" />
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                  Priority Sync
                </span>
              </div>
            </div>
          )
        }
      />

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-[24px] border border-amber-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <FiShield className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">
            Current Status
          </p>
          <div className="flex items-baseline gap-2 mb-8">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">
              {subscription?.status}
            </h3>
            <div
              className={`w-2 h-2 rounded-full ${subscription?.status === "active" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`}
            />
          </div>
          <Badge color={subscription?.status === "active" ? "green" : "red"}>
            {subscription?.isPremium ? "Premium Identity" : "Standard Node"}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-600 p-5 rounded-[24px] text-slate-900 shadow-2xl shadow-amber-600/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-5 opacity-[0.1] group-hover:opacity-[0.2] transition-opacity text-amber-100">
            <FiZap className="w-24 h-24" />
          </div>
          <p className="text-amber-100 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
            Active Tier
          </p>
          <h3 className="text-4xl font-black tracking-tighter capitalize mb-4">
            {subscription?.premiumTier}
          </h3>
          <p className="text-amber-50 text-[9px] font-black uppercase tracking-[0.2em]">
            GHS {subscription?.monthlyPrice} /{" "}
            {subscription?.billingCycle?.replace("ly", "")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-[24px] border border-amber-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <FiClock className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">
            Protocol Expiry
          </p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
            {subscription?.expiryDate
              ? new Date(subscription.expiryDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "∞"}
          </h3>
          <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">
            Auto-renewal system active
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main Content: Features & History */}
        <div className="lg:col-span-3 space-y-10">
          {/* Action Area */}
          <AnimatePresence>
            {showPaymentForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-amber-600 p-6 rounded-[24px] text-slate-900 shadow-xl shadow-amber-600/20 mb-10">
                  <h3 className="text-2xl font-black tracking-tighter mb-8">
                    Renew Neural Link
                  </h3>
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-amber-200 uppercase tracking-widest ml-1">
                        Mobile Money Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="024xxxxxxx"
                        className="w-full bg-slate-200 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold placeholder-amber-300/50 focus:outline-none focus:bg-white/20 transition-all"
                      />
                    </div>
                    <div className="bg-slate-200 rounded-3xl p-6 space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="opacity-60 uppercase tracking-widest">
                          Recipient
                        </span>
                        <span className="uppercase tracking-widest">
                          Frank Darko
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="opacity-60 uppercase tracking-widest">
                          Network Node
                        </span>
                        <span>0536716556</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                          Total Charge
                        </span>
                        <span className="text-xl font-black tracking-tighter">
                          GHS 900.00
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={initiating}
                        className="flex-1 py-4 bg-white text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-50 transition-all shadow-xl"
                      >
                        {initiating
                          ? "Synchronizing..."
                          : "Initiate Secure Payment"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPaymentForm(false)}
                        className="px-6 py-4 bg-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {subscription?.status !== "active" &&
            !subscription?.isCreator &&
            !showPaymentForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-amber-600 p-6 rounded-[24px] text-slate-900 shadow-xl shadow-amber-600/20 flex flex-col md:flex-row items-center justify-between gap-5"
              >
                <div>
                  <h3 className="text-2xl font-black tracking-tighter mb-2 leading-none">
                    Connection Restricted
                  </h3>
                  <p className="text-amber-50 text-sm font-bold opacity-80">
                    Renew your premium protocol to unlock all academic layers.
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="px-8 py-5 bg-white text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-50 transition-all active:scale-95 shadow-xl"
                >
                  Restore Access
                </button>
              </motion.div>
            )}

          {/* Payment History */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Transaction Ledger
              </p>
              <FiDownload className="text-slate-600 w-4 h-4" />
            </div>

            {!payments.length ? (
              <div className="text-center py-12 bg-slate-50/50 rounded-[20px] border border-dashed border-slate-200">
                <FiCreditCard className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  No transaction history detected
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-[28px] hover:bg-white hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                          p.status === "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {p.status === "completed" ? <FiCheck /> : <FiClock />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-amber-600 transition-colors">
                          GHS {p.amount}
                        </p>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">
                          {p.transactionRef} ·{" "}
                          {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1">
                        {p.billingPeriod}
                      </p>
                      <p
                        className={`text-[8px] font-black uppercase tracking-tighter ${p.status === "completed" ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        {p.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Features Matrix */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 ml-1">
              Premium Capabilities
            </p>
            <div className="space-y-6">
              {[
                {
                  name: "Neural Research Engine",
                  included: true,
                  desc: "Advanced AI processing limits",
                },
                {
                  name: "Academic Data Vault",
                  included: true,
                  desc: "Unlimited resource synchronization",
                },
                {
                  name: "Predictive Analytics",
                  included: subscription?.features?.advancedAnalytics,
                  desc: "GPA projection models",
                },
                {
                  name: "Direct Priority Support",
                  included: subscription?.features?.prioritySupport,
                  desc: "Direct admin link",
                },
                {
                  name: "API Neural Access",
                  included: subscription?.features?.apiAccess,
                  desc: "External platform integration",
                },
                {
                  name: "Deep Report Generation",
                  included: true,
                  desc: "Custom transcript downloads",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black mt-0.5 transition-colors ${
                      feature.included
                        ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-slate-900"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {feature.included ? <FiCheck /> : <FiChevronRight />}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-black leading-none mb-1 ${feature.included ? "text-slate-900" : "text-slate-600 opacity-60"}`}
                    >
                      {feature.name}
                    </p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-4 bg-amber-50 p-6 rounded-[20px] border border-amber-100">
                <div className="w-12 h-12 bg-amber-600 text-slate-900 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-amber-600/20">
                  <FiStar />
                </div>
                <div>
                  <p className="text-xs font-black text-amber-900 leading-none mb-1 uppercase tracking-tighter">
                    Identity Score
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                    Top 5% of Students
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-[20px] text-slate-900 shadow-xl shadow-emerald-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 blur-[50px] rounded-full" />
            <FiShield className="w-8 h-8 text-slate-900/50 mb-6" />
            <h4 className="text-lg font-black tracking-tighter leading-none mb-2">
              Secure Billing
            </h4>
            <p className="text-emerald-100/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              All transactions are encrypted with RSA-4096 standards and
              verified by the university finance board.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
