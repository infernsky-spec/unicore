import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  LoadingSpinner,
  EmptyState,
} from "../../components/shared/UI";
import { FiEye, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminResults() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");

  useEffect(() => {
    api
      .get("/courses")
      .then((r) => setCourses(r.data.data || []))
      .catch(() => {});
    api
      .get("/semesters")
      .then((r) => {
        setSemesters(r.data.data || []);
        const current = r.data.data?.find((s) => s.isCurrent);
        if (current) setSelectedSemester(current._id);
      })
      .catch(() => {});
  }, []);

  const loadResults = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    try {
      const url = `/exams/results/all?semesterId=${selectedSemester}${selectedCourse ? `&courseId=${selectedCourse}` : ""}`;
      const res = await api.get(url);
      setResults(res.data.data || []);
    } catch {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [selectedCourse, selectedSemester]);

  const handlePublish = async () => {
    if (!selectedCourse || !selectedSemester) return;
    try {
      await api.patch("/exams/results/publish", {
        courseId: selectedCourse,
        semesterId: selectedSemester,
      });
      toast.success("Results published to student portals");
      loadResults();
    } catch {
      toast.error("Failed to publish");
    }
  };

  const columns = [
    {
      key: "student",
      label: "Institutional Entity",
      render: (r) => (
        <div>
          <p className="font-bold text-slate-900 mb-0.5">
            {r.student?.firstName} {r.student?.lastName}
          </p>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            {r.student?.studentInfo?.indexNumber}
          </p>
        </div>
      ),
    },
    {
      key: "ca",
      label: "Assessment",
      render: (r) => (
        <span className="text-slate-600 font-bold">
          {r.continuousAssessment}
        </span>
      ),
    },
    {
      key: "exam",
      label: "Examination",
      render: (r) => (
        <span className="text-slate-600 font-bold">{r.examScore}</span>
      ),
    },
    {
      key: "total",
      label: "Aggregate",
      render: (r) => (
        <span className="font-black text-slate-900">{r.totalScore}</span>
      ),
    },
    {
      key: "grade",
      label: "Auth Grade",
      render: (r) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${r.grade === "F" ? "bg-rose-500/10 text-rose-500 border-rose-500/10" : "bg-amber-500/10 text-amber-500 border-amber-500/10"}`}
        >
          {r.grade}
        </span>
      ),
    },
    {
      key: "status",
      label: "Visibility",
      render: (r) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${r.isPublished ? "bg-blue-500/10 text-blue-400 border-blue-500/10" : "bg-slate-100 text-slate-500 border-slate-200"}`}
        >
          {r.isPublished ? "Live" : "Draft"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Global Result Registry"
        subtitle="Global oversight and authorization of institutional academic performance logs"
        actions={
          results.length > 0 && (
            <button
              onClick={handlePublish}
              className="btn-primary shadow-xl shadow-amber-600/20 px-8 py-4"
            >
              <FiCheckCircle className="w-4 h-4" /> Finalize & Publish
            </button>
          )
        }
      />

      <div className="card border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <label className="label">Academic Node (Course)</label>
            <select
              className="input bg-slate-1000 border-slate-200"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a Course Node...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-80">
            <label className="label">Institutional Session</label>
            <select
              className="input bg-slate-1000 border-slate-200"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <option value="">Select Academic Session</option>
              {semesters.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : selectedSemester ? (
          results.length > 0 ? (
            <div className="overflow-hidden border border-slate-200 rounded-[20px] shadow-2xl bg-white/30 backdrop-blur-3xl">
              <DataTable columns={columns} data={results} />
            </div>
          ) : (
            <EmptyState
              title="No Synchronized Logs"
              subtitle="Instructors haven't uploaded performance data for this academic session yet."
            />
          )
        ) : (
          <EmptyState
            icon={FiEye}
            title="Audit Parameters Required"
            subtitle="Initialize academic session nodes to synchronize the consolidated registry."
          />
        )}
      </div>
    </div>
  );
}
