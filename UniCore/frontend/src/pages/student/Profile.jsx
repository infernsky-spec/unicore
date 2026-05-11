import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { PageHeader, Badge } from "../../components/shared/UI";
import { formatDate, getInitials, getRoleLabel } from "../../utils/helpers";
import toast from "react-hot-toast";
import {
  FiEdit,
  FiLock,
  FiCheck,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiAward,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function StudentProfile() {
  const { user, loadUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courseRepStatus, setCourseRepStatus] = useState(null);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    gender: user?.gender || "",
  });
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchCourseRepStatus = async () => {
      try {
        const res = await api.get("/course-rep/my-status");
        setCourseRepStatus(res.data);
      } catch (err) {
        console.error("Error fetching course rep status:", err);
      }
    };
    fetchCourseRepStatus();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/auth/profile", form);
      await loadUser();
      toast.success("Profile updated");
      setEditMode(false);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success("Password changed successfully");
      setShowPwdForm(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const info = user?.studentInfo;

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-fade-in pb-20">
      <PageHeader
        title="Identity Protocol"
        subtitle="Manage your institutional node profile and security parameters"
        actions={
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${editMode ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-amber-600 text-slate-900 shadow-amber-600/20 active:scale-95 hover:bg-amber-700"}`}
          >
            {editMode ? "Abort Profile Sync" : "Edit Identity Node"}
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Identity Card */}
        <div className="lg:col-span-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-1000 border border-slate-200 rounded-[24px] p-6 shadow-3d text-center relative overflow-hidden group backdrop-blur-3xl"
          >
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-amber-600 to-orange-700 opacity-20" />
            <div className="relative z-10">
              <div className="w-36 h-36 bg-slate-100 rounded-[24px] p-2 mx-auto shadow-inner mb-8 border border-slate-200">
                <div className="w-full h-full bg-white rounded-[20px] flex items-center justify-center text-slate-900 text-5xl font-black shadow-2xl">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mt-3">
                {getRoleLabel(user?.role)} NODE
              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <span className="px-5 py-2 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 shadow-inner">
                  {user?.userId}
                </span>
                {info?.level && (
                  <span className="px-5 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10 shadow-inner">
                    L{info.level} NODE
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-1000 border border-slate-200 rounded-[24px] p-6 shadow-3d backdrop-blur-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 relative z-10">
              <FiLock className="text-amber-500 w-4 h-4" /> Security Layer
            </h3>
            {!showPwdForm ? (
              <button
                onClick={() => setShowPwdForm(true)}
                className="w-full py-5 bg-slate-100 border border-slate-200 rounded-[24px] text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-200 transition-all shadow-inner"
              >
                Rotate Security Key
              </button>
            ) : (
              <div className="space-y-6 relative z-10">
                <input
                  type="password"
                  placeholder="Current Node Key"
                  className="input bg-slate-1000 border-slate-200"
                  value={pwdForm.currentPassword}
                  onChange={(e) =>
                    setPwdForm((f) => ({
                      ...f,
                      currentPassword: e.target.value,
                    }))
                  }
                />
                <input
                  type="password"
                  placeholder="New Security Key"
                  className="input bg-slate-1000 border-slate-200"
                  value={pwdForm.newPassword}
                  onChange={(e) =>
                    setPwdForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm Protocol Sync"
                  className="input bg-slate-1000 border-slate-200"
                  value={pwdForm.confirmPassword}
                  onChange={(e) =>
                    setPwdForm((f) => ({
                      ...f,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => setShowPwdForm(false)}
                    className="flex-1 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving}
                    className="flex-1 py-4 bg-slate-100 text-slate-900 border border-slate-200 rounded-[20px] text-[9px] font-black uppercase tracking-widest shadow-2xl active:scale-95 hover:bg-slate-200 transition-all"
                  >
                    Synchronize
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Grid */}
        <div className="lg:col-span-2 space-y-10">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/30 backdrop-blur-3xl border border-slate-200 rounded-[24px] p-6 shadow-3d"
          >
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-10">
              Identity Node Parameters
            </h3>
            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                    Entity First Name
                  </label>
                  <input
                    className="input bg-slate-1000 border-slate-200"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                    Entity Last Name
                  </label>
                  <input
                    className="input bg-slate-1000 border-slate-200"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                    Synchronization Phone
                  </label>
                  <input
                    className="input bg-slate-1000 border-slate-200"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                    Gender Node
                  </label>
                  <select
                    className="input bg-slate-1000 border-slate-200"
                    value={form.gender}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, gender: e.target.value }))
                    }
                  >
                    {["Male", "Female", "Other"].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                    Residency Hub (Address)
                  </label>
                  <textarea
                    className="input h-32 resize-none bg-slate-1000 border-slate-200"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="md:col-span-2 py-6 bg-amber-600 text-slate-900 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-amber-600/20 active:scale-95 border border-amber-500/20"
                >
                  {saving ? "Synchronizing Data..." : "Finalize Profile Sync"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
                {[
                  {
                    label: "Full Node Name",
                    value: `${user?.firstName} ${user?.lastName}`,
                    icon: FiUser,
                  },
                  { label: "Registry Email", value: user?.email, icon: FiMail },
                  {
                    label: "Sync Phone",
                    value: user?.phone || "UNLINKED",
                    icon: FiPhone,
                  },
                  {
                    label: "Gender Protocol",
                    value: user?.gender || "UNDEFINED",
                    icon: FiUser,
                  },
                  {
                    label: "Birth Registry",
                    value: formatDate(user?.dateOfBirth),
                    icon: FiCalendar,
                  },
                  {
                    label: "Institutional Address",
                    value: user?.address || "UNMAPPED",
                    icon: FiMapPin,
                  },
                ].map((item, idx) => (
                  <div key={idx} className="group">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 flex items-center gap-3 group-hover:text-amber-500 transition-colors">
                      <item.icon className="w-3.5 h-3.5" /> {item.label}
                    </p>
                    <p className="text-base font-black text-slate-900 tracking-tight uppercase group-hover:text-amber-500 transition-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Academic Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/30 backdrop-blur-3xl border border-slate-200 rounded-[24px] p-6 shadow-3d relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <FiAward className="w-48 h-48 text-amber-500" />
            </div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 relative z-10 flex items-center gap-3">
              <FiAward className="w-4 h-4" /> Academic Portfolio Node
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {[
                ["Institutional Programme", info?.programme?.name],
                ["Operational Department", info?.department?.name],
                [
                  "Registry Level",
                  info?.level ? `LEVEL ${info.level} NODE` : "—",
                ],
                ["Registry Index Number", info?.indexNumber],
                ["Enrollment Cycle", info?.enrollmentYear],
                ["Expected Graduation Node", info?.expectedGraduation],
              ].map(([l, v]) => (
                <div key={l} className="group/item">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 group-hover/item:text-blue-400 transition-colors">
                    {l}
                  </p>
                  <p className="text-sm font-black text-slate-900 tracking-tighter uppercase group-hover/item:text-blue-300 transition-colors">
                    {v || "NOT SYNCHRONIZED"}
                  </p>
                </div>
              ))}
            </div>

            {/* Course Rep Status */}
            {courseRepStatus?.status && courseRepStatus.status !== "none" && (
              <div
                className={`mt-12 p-5 rounded-[20px] border transition-all duration-500 shadow-inner backdrop-blur-3xl ${courseRepStatus.status === "approved" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    {courseRepStatus.status === "approved" ? (
                      <>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
                        Live Representative Authority
                      </>
                    ) : (
                      <>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />{" "}
                        Authority Under Review
                      </>
                    )}
                  </p>
                  <span
                    className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border shadow-inner ${courseRepStatus.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-amber-500/10 text-amber-500 border-amber-500/10"}`}
                  >
                    {courseRepStatus.status} Protocol
                  </span>
                </div>
                <p className="text-[11px] font-black text-slate-500 leading-relaxed uppercase tracking-widest opacity-80">
                  {courseRepStatus.status === "approved"
                    ? "Elevated node privileges synchronized for your institutional department."
                    : `Identity verification in progress for ${courseRepStatus.department} authority.`}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
