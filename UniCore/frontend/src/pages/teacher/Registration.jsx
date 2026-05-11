import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  LoadingSpinner,
  EmptyState,
} from "../../components/shared/UI";
import { FiBook, FiPlus, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

export default function TeacherRegistration() {
  const [all, setAll] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        api.get("/courses?limit=100"),
        api.get("/courses/my/courses"),
      ]);
      setAll(allRes.data.data || []);
      setMine(myRes.data.data || []);
    } catch {
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
      await api.post("/registration/teacher-register", { courseId });
      toast.success(`Registered for ${title}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setWorking("");
    }
  };

  const myIds = mine.map((c) => (c._id || c).toString());

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Course Registration Hub"
        subtitle="Enroll to authorize and manage courses for the current academic session"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { l: "Assigned Nodes", v: mine.length, c: "text-amber-500" },
          {
            l: "Credit Load",
            v: mine.reduce((s, c) => s + (c.creditHours || 0), 0),
            c: "text-emerald-500",
          },
          {
            l: "Student Entities",
            v: mine.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0),
            c: "text-blue-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="card text-center py-10 border border-slate-200 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 blur-[50px] rounded-full group-hover:bg-amber-500/10 transition-colors" />
            <p
              className={`text-5xl font-black mb-2 tracking-tighter ${stat.c}`}
            >
              {stat.v}
            </p>
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[9px]">
              {stat.l}
            </p>
          </div>
        ))}
      </div>

      <div className="card border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">
            Available Academic Nodes
          </h3>
          <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Synchronized
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : all.length === 0 ? (
          <EmptyState
            icon={FiBook}
            title="No Nodes Detected"
            subtitle="The central registry hasn't initialized any course nodes yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {all.map((c) => {
              const isMine = myIds.includes(c._id.toString());
              return (
                <div
                  key={c._id}
                  className={`flex items-start justify-between gap-4 p-6 rounded-[20px] transition-all border ${isMine ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5" : "bg-slate-100 border-slate-200 hover:border-slate-200 shadow-inner"}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono font-black text-amber-500 text-xs tracking-widest">
                        {c.code}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-200">
                        {c.creditHours} CR
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-200">
                        L{c.level}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-tight mb-1 truncate">
                      {c.title}
                    </p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
                      {c.department?.name}
                    </p>
                  </div>
                  {!isMine ? (
                    <button
                      onClick={() => handleRegister(c._id, c.title)}
                      disabled={!!working}
                      className="btn-primary py-2 px-4 text-[9px] font-black uppercase tracking-widest flex-shrink-0 self-center shadow-lg shadow-amber-600/20"
                    >
                      {working === c._id ? (
                        "SYNC..."
                      ) : (
                        <>
                          <FiPlus className="w-3.5 h-3.5" /> Register
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 self-center px-4 py-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
                      <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                        Enrolled
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
