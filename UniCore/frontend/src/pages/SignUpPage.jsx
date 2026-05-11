import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiAward,
  FiBook,
  FiBriefcase,
  FiShield,
  FiStar,
  FiCpu,
  FiBookOpen,
} from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { ACADEMIC_CONSTANTS } from "../utils/constants";
import { getUniversityById } from "../utils/universities";

const Floating3DObject = ({
  color,
  size,
  top,
  left,
  delay = 0,
  duration = 8,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.15, 0.35, 0.15],
      scale: [1, 1.15, 1],
      rotate: [0, 180, 360],
      y: [0, -30, 0],
    }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    style={{
      position: "absolute",
      top,
      left,
      width: size,
      height: size,
      background: color,
      borderRadius: "35% 65% 70% 30% / 30% 30% 70% 70%",
      filter: "blur(50px)",
      zIndex: 0,
      pointerEvents: "none",
    }}
  />
);

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

export default function SignUpPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    role: "student",
    indexNumber: "",
    staffID: "",
    faculty: "",
    department: "",
    certificateType: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uni, setUni] = useState(null);
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("eb_university");
    if (!stored) {
      navigate("/");
      return;
    }

    try {
      let u = JSON.parse(stored);
      // Merge with registry to ensure logo/color are present
      const ref = getUniversityById(u.id || u.shortName?.toLowerCase());
      u = { ...ref, ...u };

      if (!u || !u.id) {
        navigate("/");
        return;
      }
      setUni(u);

      // Fetch lecturers for course rep selection
      api.get(`/teachers?university=${u._id}`)
        .then((res) => {
          if (res.data.success) setLecturers(res.data.data);
        })
        .catch(() => {});

      // Fetch departments
      api.get(`/universities/${u._id}/departments`)
        .then((res) => {
          if (res.data.success) setDepartments(res.data.data);
        })
        .catch(() => {});

      // Fetch courses
      api.get(`/course?university=${u._id}`)
        .then((res) => {
          if (res.data.success) setAvailableCourses(res.data.data);
        })
        .catch(() => {});
    } catch (e) {
      navigate("/");
    }
  }, [navigate]);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const payload = { ...form };

      if (form.role === "student") {
        payload.studentInfo = {
          indexNumber: form.indexNumber || undefined,
          faculty: form.faculty,
          department: form.department,
          certificateType: form.certificateType,
          level: 100,
        };
      } else if (form.role === "teacher") {
        payload.teacherInfo = {
          faculty: form.faculty,
          department: form.department,
          courses: form.primaryCourse ? [form.primaryCourse] : [],
        };
        payload.staffID = form.staffID;
      } else if (form.role === "faculty_head") {
        payload.facultyHeadInfo = { faculty: form.faculty };
      } else if (form.role === "dept_head") {
        payload.deptHeadInfo = {
          faculty: form.faculty,
          department: form.department,
        };
      } else if (form.role === "course_rep") {
        payload.courseRepInfo = {
          lecturerId: form.lecturerId,
          department: form.department
        };
      }

      await register(payload);
      toast.success("Identity Created Successfully!");

      const map = {
        admin: "/admin/dashboard",
        teacher: "/teacher/dashboard",
        student: "/student/dashboard",
        parent: "/parent/dashboard",
        faculty_head: "/faculty-head/dashboard",
        dept_head: "/dept-head/dashboard",
      };
      navigate(map[form.role] || "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepts = ACADEMIC_CONSTANTS.DEPARTMENTS.filter(
    (d) =>
      !form.faculty ||
      d.faculty ===
        ACADEMIC_CONSTANTS.FACULTIES.find((f) => f.name === form.faculty)?.code,
  );

  const schoolColor = uni?.color || "#d97706";

  const needsStaffID = ["teacher", "faculty_head", "dept_head"].includes(
    form.role,
  );

  // Tiny 3D assets for background
  const backgroundAssets = [];
  const icons = [
    FiBook,
    HiAcademicCap,
    FiStar,
    FiAward,
    FiBriefcase,
    FiCpu,
    FiBookOpen,
  ];
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

      <Floating3DObject
        color="rgba(0, 0, 0, 0.04)"
        size="300px"
        top="-5%"
        left="-5%"
      />
      <Floating3DObject
        color="rgba(0, 0, 0, 0.03)"
        size="250px"
        top="65%"
        left="75%"
        delay={2}
      />

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
              <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase">
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
              Join the <br />
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Future.
              </span>
            </h2>
            <p className="text-slate-500 text-xs font-bold max-w-xs leading-relaxed mb-8 opacity-80">
              Each node is unique. Register to access your institutional
              advanced academic interface.
            </p>
          </motion.div>
        </div>

        <div className="space-y-3 relative">
          {[
            { text: "Unified Grade Network", color: "text-amber-500" },
            { text: "Automated Attendance", color: "text-orange-500" },
            { text: "Resource Hub Access", color: "text-blue-500" },
          ].map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              key={idx}
              className="flex items-center gap-3 p-3 bg-slate-100 border border-slate-200 rounded-2xl backdrop-blur-md shadow-lg"
            >
              <div
                className={`w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center ${item.color}`}
              >
                <FiCheck className="w-3 h-3" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 z-10 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg bg-white/60 border border-slate-200 rounded-[20px] p-5 shadow-2xl relative backdrop-blur-2xl my-10"
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <motion.button
              whileHover={{ x: -2 }}
              onClick={() => navigate("/login")}
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
              Initialize ID
            </h2>
            <p className="text-slate-600 text-[7px] font-black uppercase tracking-[0.2em]">
              Node Selection: {uni?.shortName || "UniCore"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  First Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3 h-3" />
                  <input
                    value={form.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    placeholder="First"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Last Name
                </label>
                <div className="relative group">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3 h-3" />
                  <input
                    value={form.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    placeholder="Last"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                Institutional Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3 h-3" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="identity@node.edu"
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Network Role
                </label>
                <select
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 appearance-none transition-all cursor-pointer"
                  value={form.role}
                  onChange={(e) => updateForm("role", e.target.value)}
                  required
                >
                  <option value="student" className="bg-white">
                    Student
                  </option>
                  <option value="course_rep" className="bg-white">
                    Course Rep
                  </option>
                  <option value="teacher" className="bg-white">
                    Lecturer
                  </option>
                  <option value="parent" className="bg-white">
                    Parent
                  </option>
                  <option value="faculty_head" className="bg-white">
                    Faculty Head
                  </option>
                  <option value="dept_head" className="bg-white">
                    Dept Head
                  </option>
                </select>
              </div>

              {form.role === "student" ? (
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Index ID
                  </label>
                  <input
                    value={form.indexNumber}
                    onChange={(e) => updateForm("indexNumber", e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              ) : form.role === "course_rep" ? (
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-amber-500 uppercase tracking-widest ml-1">
                    Select Lead Lecturer
                  </label>
                  <select
                    value={form.lecturerId}
                    onChange={(e) => updateForm("lecturerId", e.target.value)}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50"
                    required
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map(l => (
                      <option key={l._id} value={l._id}>{l.firstName} {l.lastName} ({l.teacherInfo?.department?.code || 'Staff'})</option>
                    ))}
                  </select>
                </div>
              ) : form.role === "teacher" ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-amber-500 uppercase tracking-widest ml-1">
                      Assigned Department
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => updateForm("department", e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-amber-500 uppercase tracking-widest ml-1">
                      Primary Course Unit
                    </label>
                    <select
                      value={form.primaryCourse}
                      onChange={(e) => updateForm("primaryCourse", e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50"
                      required
                    >
                      <option value="">Select Course</option>
                      {availableCourses.map(c => (
                        <option key={c._id} value={c._id}>{c.title} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-amber-500 uppercase tracking-widest ml-1">
                      Staff ID / Access Key
                    </label>
                    <input
                      type="text"
                      value={form.staffID}
                      onChange={(e) => updateForm("staffID", e.target.value)}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50"
                      placeholder="AUTH-XXXX"
                      required
                    />
                  </div>
                </div>
              ) : needsStaffID ? (
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-amber-500 uppercase tracking-widest ml-1">
                    Access Key *
                  </label>
                  <input
                    value={form.staffID}
                    onChange={(e) => updateForm("staffID", e.target.value)}
                    placeholder="Required"
                    className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-amber-500/30 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              ) : null}
            </div>

            {(form.role === "student" ||
              form.role === "teacher" ||
              form.role === "faculty_head" ||
              form.role === "dept_head") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Faculty
                  </label>
                  <select
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 appearance-none"
                    value={form.faculty}
                    onChange={(e) => updateForm("faculty", e.target.value)}
                    required
                  >
                    <option value="" className="bg-white">
                      Select
                    </option>
                    {ACADEMIC_CONSTANTS.FACULTIES.map((f) => (
                      <option
                        key={f.code}
                        value={f.name}
                        className="bg-white"
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.role !== "faculty_head" && (
                  <div className="space-y-1">
                    <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                      Department
                    </label>
                    <select
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 appearance-none"
                      value={form.department}
                      onChange={(e) => updateForm("department", e.target.value)}
                      required
                    >
                      <option value="" className="bg-white">
                        Select
                      </option>
                      {filteredDepts.map((d) => (
                        <option
                          key={d.code}
                          value={d.name}
                          className="bg-white"
                        >
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {form.role === "student" && (
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Certificate Program
                </label>
                <select
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500/50 appearance-none"
                  value={form.certificateType}
                  onChange={(e) =>
                    updateForm("certificateType", e.target.value)
                  }
                  required
                >
                  <option value="" className="bg-white">
                    Select Program
                  </option>
                  {ACADEMIC_CONSTANTS.CERTIFICATE_TYPES.map((c) => (
                    <option key={c} value={c} className="bg-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Access Pin
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3 h-3" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">
                  Verify Pin
                </label>
                <div className="relative group">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-3 h-3" />
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => updateForm("confirm", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-[10px] font-bold text-slate-900 placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-slate-900 font-black uppercase tracking-[0.2em] py-3.5 rounded-xl shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all text-[9px] disabled:opacity-50 mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                form.role === 'course_rep' ? "Request Rep Status" : "Authorize Identity"
              )}
            </motion.button>
            
            <div className="flex justify-center pt-2">
              {form.role === 'student' ? (
                <button type="button" onClick={() => updateForm('role', 'course_rep')} className="text-[8px] font-black text-amber-600 uppercase tracking-widest hover:underline">
                  Sign up as a Course Rep
                </button>
              ) : form.role === 'course_rep' ? (
                <button type="button" onClick={() => updateForm('role', 'student')} className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:underline">
                  Sign up as a regular Student
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center relative z-10 space-y-1">
            <p className="text-[7px] font-black text-slate-700 uppercase tracking-[0.4em]">
              UniCore <span className="text-amber-500/40">·</span> Academic
              Governance Network
            </p>
            <p className="text-[5px] font-black text-slate-800 uppercase tracking-[0.4em]">
              Powered by NexaVision
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
