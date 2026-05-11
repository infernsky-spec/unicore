import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiShield,
  FiCheck,
  FiInfo,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import { PageHeader } from "../../components/shared/UI";

export default function CourseRepSignup() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get("/courses/my/courses"),
        api.get("/teachers"),
      ]);
      setCourses(cRes.data.data || []);
      setLecturers(lRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load protocol data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedLecturer || !department) {
      return toast.error("All jurisdiction fields are required");
    }

    setSubmitting(true);
    try {
      await api.post("/course-rep/submit", {
        courseId: selectedCourse,
        lecturerId: selectedLecturer,
        department,
      });
      toast.success("Leadership application submitted for verification");
      navigate("/student/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Application transmission failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 animate-fade-in">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-amber-500 transition-all mb-10 group"
      >
        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />{" "}
        Return to Hub
      </motion.button>

      <PageHeader
        title="Leadership Protocol"
        subtitle="Apply for Course Representative authority within your academic units"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-1000 backdrop-blur-3xl rounded-[24px] border border-slate-200 p-6 shadow-3d mt-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
          <FiShield className="w-48 h-48 text-amber-500" />
        </div>

        <div className="relative z-10">
          <div className="bg-amber-600/5 rounded-[20px] p-5 border border-amber-500/10 mb-10 flex gap-6 shadow-inner">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 flex-shrink-0 border border-amber-500/10">
              <FiInfo className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-black text-amber-500/80 leading-relaxed uppercase tracking-widest">
              Security Protocol: Applications require verification from course
              instructors. Verified entities gain administrative oversight for
              communication nodes and participation logs.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                Target Academic Node
              </label>
              <div className="relative group">
                <FiCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-500 transition-colors w-4 h-4" />
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input pl-14"
                  required
                >
                  <option value="">Select Course Unit...</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                Verifying Authority
              </label>
              <div className="relative group">
                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-500 transition-colors w-4 h-4" />
                <select
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  className="input pl-14"
                  required
                >
                  <option value="">Select Lead Lecturer...</option>
                  {lecturers.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.firstName} {l.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">
                Academic Department
              </label>
              <div className="relative group">
                <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-500 transition-colors w-4 h-4" />
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="input pl-14"
                  required
                />
              </div>
            </div>

            <div className="space-y-5 pt-6 px-2">
              <div className="flex items-center gap-4 group">
                <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 text-[10px] shadow-inner border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <FiCheck />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-slate-700 transition-colors">
                  Verify Academic Standing Protocol
                </span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 text-[10px] shadow-inner border border-emerald-500/10 group-hover:scale-110 transition-transform">
                  <FiCheck />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-slate-700 transition-colors">
                  Acknowledge Institutional Leadership Code
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedCourse || !selectedLecturer}
              className="btn-primary w-full py-6 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-amber-600/20 active:scale-95 disabled:opacity-50 mt-4"
            >
              {submitting
                ? "Synchronizing Credentials..."
                : "Authorize Leadership Application"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
