import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  Modal,
  DataTable,
  LoadingSpinner,
  EmptyState,
} from "../../components/shared/UI";
import { FiUpload, FiFileText, FiFolder, FiAward } from "react-icons/fi";
import toast from "react-hot-toast";

export function TeacherResults() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState("");

  useEffect(() => {
    api
      .get("/courses/my/courses")
      .then((r) => setCourses(r.data.data || []))
      .catch(() => {});
    api
      .get("/semesters")
      .then((r) => {
        setSemesters(r.data.data || []);
        const cur = r.data.data?.find((s) => s.isCurrent);
        if (cur) setSemesterId(cur._id);
      })
      .catch(() => {});
  }, []);

  const handleCourseChange = (id) => {
    setSelectedCourse(id);
    const course = courses.find((c) => c._id === id);
    setStudents(course?.enrolledStudents || []);
    setScores({});
  };

  const handleScoreChange = (studentId, field, value) => {
    setScores((s) => ({
      ...s,
      [studentId]: { ...s[studentId], [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!selectedCourse || !semesterId) {
      toast.error("Select course and semester");
      return;
    }
    const results = students.map((st) => ({
      student: st._id,
      course: selectedCourse,
      semester: semesterId,
      continuousAssessment: parseFloat(scores[st._id]?.ca || 0),
      examScore: parseFloat(scores[st._id]?.exam || 0),
      totalScore:
        parseFloat(scores[st._id]?.ca || 0) +
        parseFloat(scores[st._id]?.exam || 0),
      grade: calculateGrade(
        parseFloat(scores[st._id]?.ca || 0) +
          parseFloat(scores[st._id]?.exam || 0),
      ),
    }));
    setSaving(true);
    try {
      await api.post("/exams/results", { results });
      toast.success(`${results.length} results saved and published`);
    } catch {
      toast.error("Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const calculateGrade = (total) => {
    if (total >= 80) return "A+";
    if (total >= 75) return "A";
    if (total >= 70) return "B+";
    if (total >= 65) return "B";
    if (total >= 60) return "C+";
    if (total >= 55) return "C";
    if (total >= 50) return "D+";
    if (total >= 45) return "D";
    return "F";
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Results Management"
        subtitle="Input student scores and authorize grade distribution"
      />

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="label">Assigned Course</label>
            <select
              className="input"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-64">
            <label className="label">Academic Session</label>
            <select
              className="input"
              value={semesterId}
              onChange={(e) => setSemesterId(e.target.value)}
            >
              {semesters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCourse && students.length > 0 && (
          <div className="space-y-6">
            <div className="overflow-hidden border border-slate-200 rounded-[20px] bg-slate-100 backdrop-blur-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      Student Information
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                      CA (40)
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Exam (60)
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Total
                    </th>
                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((st) => {
                    const ca = parseFloat(scores[st._id]?.ca || 0);
                    const exam = parseFloat(scores[st._id]?.exam || 0);
                    const total = ca + exam;
                    const grade = calculateGrade(total);
                    return (
                      <tr
                        key={st._id}
                        className="hover:bg-slate-100 transition-all group"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 text-sm">
                            {st.firstName} {st.lastName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                            {st.studentInfo?.indexNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            className="w-20 bg-slate-100 border border-slate-200 rounded-xl px-2 py-2 text-center text-slate-900 font-black text-sm focus:border-amber-500 focus:outline-none transition-all shadow-inner"
                            value={scores[st._id]?.ca || ""}
                            onChange={(e) =>
                              handleScoreChange(st._id, "ca", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            className="w-20 bg-slate-100 border border-slate-200 rounded-xl px-2 py-2 text-center text-slate-900 font-black text-sm focus:border-amber-500 focus:outline-none transition-all shadow-inner"
                            value={scores[st._id]?.exam || ""}
                            onChange={(e) =>
                              handleScoreChange(st._id, "exam", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-black text-amber-500">
                            {total.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${total >= 50 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                          >
                            {grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-10 py-4 text-[10px] tracking-[0.2em] shadow-xl shadow-amber-600/20"
              >
                {saving ? "Synchronizing Data..." : "Authorize & Upload"}
              </button>
            </div>
          </div>
        )}
        {selectedCourse && !students.length && (
          <EmptyState
            title="Neural Gap"
            subtitle="No student identities found enrolled in this node."
          />
        )}
        {!selectedCourse && (
          <EmptyState
            icon={FiAward}
            title="Deployment Required"
            subtitle="Select an academic node to begin score authorization."
          />
        )}
      </div>
    </div>
  );
}
export default TeacherResults;
