import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  DataTable,
  Modal,
  LoadingSpinner,
  EmptyState,
} from "../../components/shared/UI";
import { FiBook, FiUsers } from "react-icons/fi";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api
      .get("/courses/my/courses")
      .then((r) => setCourses(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cols = [
    {
      key: "code",
      label: "Code",
      render: (c) => (
        <span className="font-mono font-black text-amber-500">{c.code}</span>
      ),
    },
    {
      key: "title",
      label: "Course Title",
      render: (c) => <p className="font-bold text-slate-900">{c.title}</p>,
    },
    {
      key: "level",
      label: "Level",
      render: (c) => (
        <span className="text-slate-600 font-bold">Level {c.level}</span>
      ),
    },
    {
      key: "credits",
      label: "Credits",
      render: (c) => (
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">
          {c.creditHours} cr
        </span>
      ),
    },
    {
      key: "enrolled",
      label: "Enrolled",
      render: (c) => (
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
          {c.enrolledStudents?.length || 0} Entities
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (c) => (
        <button
          onClick={() => setSelected(c)}
          className="btn-secondary text-[10px] tracking-widest py-1 px-4 uppercase font-black"
        >
          Audit Node
        </button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Academic Node Registry"
        subtitle="View and audit your assigned course nodes for the current session"
      />
      {!courses.length ? (
        <EmptyState
          icon={FiBook}
          title="No Nodes Assigned"
          subtitle="Contact the central registry to initialize your academic course mapping."
        />
      ) : (
        <div className="card overflow-hidden border border-slate-200">
          <DataTable columns={cols} data={courses} />
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        size="lg"
      >
        {selected && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                ["Node Code", selected.code],
                ["Academic Level", `Level ${selected.level}`],
                ["Credit Payload", `${selected.creditHours} Units`],
                ["Semester", `Session ${selected.semester}`],
                ["Department", selected.department?.name],
                ["Total Enrollment", selected.enrolledStudents?.length || 0],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">
                    {l}
                  </p>
                  <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
                    {v || "—"}
                  </p>
                </div>
              ))}
            </div>

            {selected.description && (
              <div className="bg-slate-100 border border-slate-200 rounded-[20px] p-6 shadow-inner">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Node Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {selected.description}
                </p>
              </div>
            )}

            {selected.schedule?.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.2em] ml-1">
                  Synchronization Schedule
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selected.schedule.map((s, i) => (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-slate-1000 rounded-[24px] border border-slate-200 shadow-inner group hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-amber-600/10 text-amber-500 rounded-xl flex items-center justify-center text-[10px] font-black border border-amber-500/10">
                          {s.day.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">
                            {s.startTime} — {s.endTime}
                          </p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {s.venue || "Global Node"}
                          </p>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 bg-amber-600 text-slate-900 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-600/20">
                        {s.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
