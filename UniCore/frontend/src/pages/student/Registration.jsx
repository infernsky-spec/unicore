import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
  Badge,
} from "../../components/shared/UI";
import {
  FiBook,
  FiPlus,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiInfo,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentRegistration() {
  const { user, loadUser } = useAuth();
  const [available, setAvailable] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [indexForm, setIndexForm] = useState(
    user?.studentInfo?.indexNumber || "",
  );
  const [linkLoading, setLinkLoading] = useState(false);
  const [tab, setTab] = useState("available");

  const load = async () => {
    setLoading(true);
    try {
      const [avRes, myRes] = await Promise.all([
        api.get("/registration/available"),
        api.get("/registration/my"),
      ]);
      setAvailable(avRes.data.data || []);
      setRegistered(myRes.data.data || []);
    } catch (e) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRegister = async (courseId, title) => {
    setWorking(courseId);
    try {
      await api.post("/registration/register", { courseId });
      toast.success(`Registered for ${title}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setWorking("");
    }
  };

  const handleDrop = async (courseId, title) => {
    if (!window.confirm(`Drop ${title}?`)) return;
    setWorking(courseId);
    try {
      await api.delete(`/registration/drop/${courseId}`);
      toast.success(`Dropped ${title}`);
      load();
    } catch (e) {
      toast.error("Failed to drop course");
    } finally {
      setWorking("");
    }
  };

  const handleLinkId = async () => {
    if (!indexForm.trim()) return toast.error("Enter your index number");
    setLinkLoading(true);
    try {
      await api.post("/import/self-link", { indexNumber: indexForm.trim() });
      await loadUser();
      toast.success("Index number linked to your account!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to link");
    } finally {
      setLinkLoading(false);
    }
  };

  const creditTotal = registered.reduce((s, c) => s + (c.creditHours || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <PageHeader
        title="Course Registration"
        subtitle="Build your academic semester path"
        actions={
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Total Credits
              </p>
              <p
                className={`text-xl font-black tracking-tighter ${creditTotal > 24 ? "text-red-600" : "text-amber-700"}`}
              >
                {creditTotal}/24
              </p>
            </div>
            <div className="w-[1px] h-8 bg-slate-100" />
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Selected
              </p>
              <p className="text-xl font-black text-slate-900 tracking-tighter">
                {registered.length}
              </p>
            </div>
          </div>
        }
      />

      {/* Identity Link Section */}
      {!user?.studentInfo?.indexNumber ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl flex flex-col md:flex-row items-center gap-6"
        >
          <div className="w-14 h-14 bg-amber-100 rounded-[24px] flex items-center justify-center flex-shrink-0 text-amber-600 shadow-lg shadow-amber-600/10">
            <FiAlertTriangle className="w-7 h-7" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
              Identity Verification Required
            </h3>
            <p className="text-amber-700 text-xs font-bold opacity-80">
              Link your index number to start registration.
            </p>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <input
              className="w-full md:w-64 px-5 py-3 bg-white border border-amber-200 rounded-xl text-sm font-bold shadow-sm"
              placeholder="Index Number"
              value={indexForm}
              onChange={(e) => setIndexForm(e.target.value)}
            />
            <button
              onClick={handleLinkId}
              disabled={linkLoading}
              className="px-8 py-3 bg-amber-600 text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
            >
              Link
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white p-5 border border-slate-100 rounded-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5 leading-none">
                Verified Identity
              </p>
              <p className="text-lg font-black text-slate-800 tracking-tighter leading-none">
                {user.studentInfo.indexNumber}
              </p>
            </div>
          </div>
          <Badge color="green">Active Session</Badge>
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-xl border border-amber-100 rounded-[24px] w-fit">
          {[
            {
              id: "available",
              label: "Course Catalog",
              icon: FiBook,
              count: available.filter((c) => !c.isRegistered).length,
            },
            {
              id: "registered",
              label: "My Selection",
              icon: FiCheckCircle,
              count: registered.length,
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${tab === t.id ? "bg-amber-600 text-slate-900 shadow-xl shadow-amber-600/20" : "text-slate-600 hover:text-amber-600"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span
                className={`px-2 py-0.5 rounded-lg text-[8px] ${tab === t.id ? "bg-white/20 text-slate-900" : "bg-slate-100 text-slate-500"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <AnimatePresence mode="wait">
            {tab === "available" ? (
              <motion.div
                key="av"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {!available.filter((c) => !c.isRegistered).length && (
                  <div className="col-span-2 py-20">
                    <EmptyState
                      title="Catalog Empty"
                      subtitle="All courses have been registered or are currently unavailable."
                    />
                  </div>
                )}
                {available
                  .filter((c) => !c.isRegistered)
                  .map((c) => (
                    <motion.div
                      whileHover={{ y: -5 }}
                      key={c._id}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-100 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <FiBook className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {c.code}
                            </span>
                            <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              L{c.level}
                            </span>
                          </div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            {c.creditHours} Credits
                          </p>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-6 group-hover:text-amber-600 transition-colors leading-tight">
                          {c.title}
                        </h3>
                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <p className="text-slate-600 font-black mb-0.5">
                              {c.primaryTeacher?.firstName}{" "}
                              {c.primaryTeacher?.lastName}
                            </p>
                            <span
                              className={c.spotsLeft < 5 ? "text-rose-500" : ""}
                            >
                              {c.spotsLeft} spots remaining
                            </span>
                          </div>
                          <button
                            onClick={() => handleRegister(c._id, c.title)}
                            disabled={!!working || c.spotsLeft <= 0}
                            className="px-6 py-2.5 bg-slate-900 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:shadow-lg shadow-amber-600/20 active:scale-95 transition-all flex items-center gap-2"
                          >
                            {working === c._id ? (
                              <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <FiPlus /> Add Course
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            ) : (
              <motion.div
                key="rg"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {!registered.length && (
                  <EmptyState
                    title="No Selection"
                    subtitle="Your registered courses list is empty."
                  />
                )}
                {registered.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white p-6 rounded-[24px] border border-emerald-100 flex items-center justify-between gap-6 shadow-sm group"
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FiCheckCircle className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-1 leading-none">
                          {c.code} · {c.creditHours} Credits
                        </p>
                        <h3 className="text-base font-black text-slate-800 truncate leading-none">
                          {c.title}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDrop(c._id, c.title)}
                      disabled={!!working}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all group/btn"
                    >
                      <FiTrash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Academic Support Footer */}
      <div className="bg-amber-600 rounded-[20px] p-6 text-slate-900 relative overflow-hidden shadow-2xl shadow-amber-600/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200 blur-[100px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-amber-100 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Academic Registry
            </p>
            <h3 className="text-2xl font-black tracking-tight mb-2">
              Need Registration Assistance?
            </h3>
            <p className="text-amber-50/80 font-bold text-sm">
              Our team is available to help you manage your course load.
            </p>
          </div>
          <button className="px-10 py-4 bg-slate-200 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-200 flex items-center gap-3">
            <FiInfo className="w-5 h-5" /> Support Center <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
