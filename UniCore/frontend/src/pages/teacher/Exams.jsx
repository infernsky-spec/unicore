import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  LoadingSpinner,
} from "../../components/shared/UI";
import { formatDate } from "../../utils/helpers";
import { FiAward } from "react-icons/fi";

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/exams")
      .then((r) => setExams(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cols = [
    {
      key: "course",
      label: "Course Node",
      render: (e) => (
        <div>
          <p className="font-bold text-slate-900 mb-0.5">{e.course?.title}</p>
          <span className="font-mono text-[10px] font-black text-amber-500 uppercase tracking-widest">
            {e.course?.code}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Assessment",
      render: (e) => (
        <span className="px-3 py-1 bg-amber-600/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/10">
          {e.type}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (e) => (
        <span className="text-slate-600 font-bold">{formatDate(e.date)}</span>
      ),
    },
    {
      key: "time",
      label: "Window",
      render: (e) => (
        <span className="text-slate-600 font-bold">
          {e.startTime || "—"} — {e.endTime || "—"}
        </span>
      ),
    },
    {
      key: "venue",
      label: "Venue Node",
      render: (e) => (
        <span className="text-slate-600 font-bold">{e.venue || "—"}</span>
      ),
    },
    {
      key: "marks",
      label: "Marks",
      render: (e) => (
        <span className="font-black text-slate-900">{e.totalMarks}</span>
      ),
    },
    {
      key: "published",
      label: "Status",
      render: (e) => (
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${e.isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-500"}`}
        >
          {e.isPublished ? "Published" : "Draft"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Assessment Timeline"
        subtitle="Verified examination schedules for your academic course load"
      />
      <div className="card overflow-hidden border border-slate-200">
        <DataTable
          columns={cols}
          data={exams}
          loading={loading}
          emptyMessage="No academic assessments detected."
        />
      </div>
    </div>
  );
}
