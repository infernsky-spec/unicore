import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getUniversityById } from "../utils/universities";
import toast from "react-hot-toast";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiShield,
  FiCpu,
  FiStar,
  FiInfo,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const PORTALS = [
  { value: "", label: "Select Portal", icon: "🏛️" },
  { value: "super_admin", label: "Global Oversighter (Super Admin)", icon: "🌐" },
  { value: "admin", label: "Administrator", icon: "⚙️" },
  { value: "faculty_head", label: "Head of Faculty", icon: "🏛️" },
  { value: "dept_head", label: "Head of Department", icon: "🏢" },
  { value: "teacher", label: "Lecturer / Staff", icon: "👨‍🏫" },
  { value: "student", label: "Student", icon: "🎓" },
  { value: "course_rep", label: "Course Rep", icon: "📋" },
  { value: "parent", label: "Parent / Guardian", icon: "👨‍👩" },
];

// Enhanced 3D-like Floating Asset
const Floating3DAsset = ({
  icon: Icon,
  top,
  left,
  delay = 0,
  duration = 12,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 0, rotate: 0, scale: 0.8 }}
    animate={{
      opacity: [0.1, 0.25, 0.1],
      y: [0, -40, 0],
      rotate: [0, 45, -45, 0],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    className="fixed text-black/80 pointer-events-none z-0 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]"
    style={{ top, left, fontSize: "1.2rem" }}
  >
    <Icon />
  </motion.div>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", credential: "", role: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uni, setUni] = useState(null);
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const { login, isDemo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("eb_university");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        // Merge with frontend data to ensure logo paths are present
        const ref = getUniversityById(u.id || u.shortName?.toLowerCase());
        setUni({ ...ref, ...u });
      } catch {}
    } else {
      setUni(getUniversityById("custom"));
    }
  }, []);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email required";
    if (!form.credential) e.credential = "Credential required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const user = await login(
        form.email,
        form.credential,
        form.role || undefined,
      );
      toast.success(`Welcome, ${user.firstName}! ${isDemo ? '(Demo Mode)' : ''}`);
      const routes = {
        super_admin: "/admin/dashboard",
        admin: "/admin/dashboard",
        teacher: "/teacher/dashboard",
        student: "/student/dashboard",
        parent: "/parent/dashboard",
        faculty_head: "/faculty-head/dashboard",
        dept_head: "/dept-head/dashboard",
        course_rep: "/student/dashboard",
      };
      navigate(routes[user.role] || "/student/dashboard", { replace: true });
    } catch (err) {
      const msg = err.message || err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const schoolColor = uni?.color || "#d97706";

  // Tiny 3D assets for background
  const backgroundAssets = [];
  const icons = [FiMail, FiLock, FiShield, FiCpu, FiStar, FiArrowRight];
  for (let i = 0; i < 15; i++) {
    backgroundAssets.push({
      icon: icons[i % icons.length],
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-700 perspective-1000">
      {/* Floating 3D Tiny Assets */}
      {backgroundAssets.map((asset, i) => (
        <Floating3DAsset key={i} {...asset} />
      ))}

      {/* Institutional Watermark Branding */}
      <AnimatePresence>
        {uni?.logo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.08, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-y-0 left-0 w-1/2 pointer-events-none select-none z-0 flex items-center justify-start pl-10"
          >
            {typeof uni.logo === 'string' && (uni.logo.startsWith('/') || uni.logo.startsWith('http')) ? (
              <img 
                src={uni.logo} 
                alt="" 
                className="max-h-[80%] w-auto object-contain grayscale"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span className="text-[25vh] font-black opacity-10 grayscale">{uni.logo || '🏫'}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 z-10">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-12"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-2xl border border-slate-200 overflow-hidden bg-white"
              style={{ border: `1px solid ${schoolColor}` }}
            >
              {uni?.logo?.startsWith('http') || uni?.logo?.startsWith('/logos/') ? (
                <img src={uni.logo} alt={uni.shortName} className="w-full h-full object-contain p-1.5" />
              ) : (
                uni?.logo || "🎓"
              )}
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tighter leading-none uppercase">
                {uni?.shortName || "UniCore"}
              </h1>
              <p className="text-amber-500 text-[6px] font-black uppercase tracking-[0.4em] mt-0.5 opacity-60">
                Protocol V4.5
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6 uppercase">
              Digital <br />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Empowerment.
              </span>
            </h2>
            <p className="text-slate-500 text-xs font-bold max-w-xs leading-relaxed mb-8 opacity-80">
              Your secure gateway to academic excellence. Manage courses and
              track performance seamlessly.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative">
          {[
            {
              icon: FiCpu,
              title: "Sync Node",
              desc: "Real-time infra",
              color: "text-amber-500",
            },
            {
              icon: FiShield,
              title: "Vault V4",
              desc: "Encrypted link",
              color: "text-orange-500",
            },
          ].map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              key={idx}
              className="p-5 bg-slate-100 border border-slate-200 rounded-3xl shadow-xl backdrop-blur-md"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-3 border border-slate-200">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <h3 className="font-black text-slate-900 text-[10px] tracking-tight mb-0.5 uppercase">
                {item.title}
              </h3>
              <p className="text-slate-600 text-[7px] font-black uppercase tracking-widest leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[340px] bg-white/60 border border-slate-200 rounded-[20px] p-5 shadow-2xl relative overflow-hidden backdrop-blur-2xl"
        >
          {/* Demo Credentials Banner */}
          <AnimatePresence>
            {showDemoBanner && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-5 mt-4 p-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 relative"
              >
                <button
                  onClick={() => setShowDemoBanner(false)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >✕</button>
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1">
                  <FiInfo className="w-3 h-3" /> Demo Credentials
                </p>
                <div className="space-y-0.5 text-[7px] font-bold text-slate-600">
                  <p>🎓 <span className="font-black text-slate-800">Student:</span> student@edubridge.edu / Student@123</p>
                  <p>👨‍🏫 <span className="font-black text-slate-800">Teacher:</span> teacher@edubridge.edu / Teacher@123</p>
                  <p>⚙️ <span className="font-black text-slate-800">Admin:</span> admin@edubridge.edu / Admin@123</p>
                  <p>👨‍👩 <span className="font-black text-slate-800">Parent:</span> parent@edubridge.edu / Parent@123</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-8 relative z-10 pt-4 px-5">
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
            >
              <FiArrowLeft className="w-3 h-3" /> Back
            </motion.button>
            <div
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-lg overflow-hidden bg-white"
              style={{ border: `1px solid ${schoolColor}` }}
            >
              {uni?.logo?.startsWith('http') || uni?.logo?.startsWith('/logos/') ? (
                <img src={uni.logo} alt={uni.shortName} className="w-full h-full object-contain p-1" />
              ) : (
                uni?.logo || "🎓"
              )}
            </div>
          </div>

          <div className="mb-6 relative z-10">
            <h2 className="text-xl font-black text-slate-900 tracking-tighter mb-0.5 uppercase">
              Sign In
            </h2>
            <p className="text-slate-600 text-[7px] font-black uppercase tracking-[0.2em]">
              {uni?.shortName || "UniCore"} Node
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Portal Access
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 appearance-none transition-all"
                required
              >
                {PORTALS.map((portal) => (
                  <option
                    key={portal.value}
                    value={portal.value}
                    className="bg-white"
                  >
                    {portal.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Identity
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5" />
                <input
                  type="email"
                  placeholder="identity@node.edu"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Access Key
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3.5 h-3.5" />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.credential}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, credential: e.target.value }))
                  }
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-amber-500"
                >
                  {showPwd ? (
                    <FiEyeOff className="w-3 h-3" />
                  ) : (
                    <FiEye className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-slate-900 font-black uppercase tracking-[0.2em] py-3.5 rounded-xl shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all text-[9px] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Connect Node <FiArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>

            <div className="pt-4 text-center opacity-60">
              <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                Global administrators can authenticate via <br/>any institutional node for system oversight.
              </p>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between relative z-10">
            <Link
              to="/signup"
              className="text-[7px] font-black uppercase tracking-widest text-amber-500 hover:text-orange-500 transition-colors"
            >
              Create Identity
            </Link>
            <span className="text-[6px] font-black text-slate-700 uppercase tracking-widest">
              Secure Link
            </span>
          </div>
        </motion.div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 py-6 text-center space-y-1">
        <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.5em]">
          UniCore <span className="text-amber-500/40">·</span> Academic
          Governance Network
        </p>
        <p className="text-[5px] font-black text-slate-800 uppercase tracking-[0.4em]">
          Powered by NexaVision
        </p>
      </footer>
    </div>
  );
}
