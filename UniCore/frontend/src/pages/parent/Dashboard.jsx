import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import {
  PageHeader,
  StatCard,
  LoadingSpinner,
  EmptyState,
  AttendanceBar,
} from "../../components/shared/UI";
import { formatCurrency, formatDate, getInitials } from "../../utils/helpers";
import { FiUsers, FiDollarSign, FiClipboard, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

// ─── PARENT DASHBOARD ─────────────────────────────────────────────────────────
export function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feesData, setFeesData] = useState({});
  const [attData, setAttData] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/parents/my-children");
        const kids = res.data.data || [];
        setChildren(kids);
        for (const kid of kids) {
          const [fRes, aRes] = await Promise.all([
            api
              .get(`/parents/children/${kid._id}/fees`)
              .catch(() => ({ data: { data: [] } })),
            api
              .get(`/parents/children/${kid._id}/attendance`)
              .catch(() => ({ data: { data: [] } })),
          ]);
          setFeesData((fd) => ({ ...fd, [kid._id]: fRes.data.data?.[0] }));
          setAttData((ad) => ({ ...ad, [kid._id]: aRes.data.data || [] }));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title={`Guardian Hub: ${user?.firstName}`}
        subtitle="Real-time oversight of linked academic entities"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Active Dependents"
          value={children.length}
          icon={FiUsers}
          color="text-amber-500"
        />
        <StatCard
          title="Monitored Nodes"
          value={children.length}
          icon={FiAward}
          color="text-blue-400"
        />
      </div>

      {!children.length ? (
        <EmptyState
          icon={FiUsers}
          title="No Dependents Linked"
          subtitle="Contact the central registry to associate student nodes."
        />
      ) : (
        children.map((child) => {
          const fees = feesData[child._id];
          const att = attData[child._id] || [];
          const avgAtt =
            att.length > 0
              ? Math.round(
                  att.reduce((s, a) => s + a.attendancePercentage, 0) /
                    att.length,
                )
              : 0;

          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={child._id}
              className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d relative overflow-hidden group backdrop-blur-3xl"
            >
              <div className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <FiUsers className="w-24 h-24 text-amber-500" />
              </div>

              <div className="flex flex-col md:flex-row items-start gap-6 mb-10 relative z-10">
                <div className="w-16 h-16 bg-amber-600/10 rounded-[24px] flex items-center justify-center text-amber-500 text-xl font-black flex-shrink-0 shadow-inner border border-amber-500/10 group-hover:scale-105 transition-transform duration-500">
                  {getInitials(child.firstName, child.lastName)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-1.5 group-hover:text-amber-500 transition-colors">
                    {child.firstName} {child.lastName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-amber-500 text-[8px] font-black uppercase tracking-[0.3em]">
                      {child.studentInfo?.programme?.name}
                    </p>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em]">
                      {child.studentInfo?.indexNumber} · LEVEL{" "}
                      {child.studentInfo?.level}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                <div className="bg-slate-100 rounded-[28px] p-6 border border-slate-200 shadow-inner backdrop-blur-md group-hover:border-amber-500/10 transition-colors">
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] mb-6">
                    Financial Ledger
                  </p>
                  {fees ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          Total Liability
                        </span>
                        <span className="text-base font-black text-slate-900">
                          {formatCurrency(fees.totalBilled)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          Paid Sync
                        </span>
                        <span className="text-base font-black text-emerald-500">
                          {formatCurrency(fees.totalPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-200 px-1">
                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                          Outstanding Balance
                        </span>
                        <span
                          className={`text-2xl font-black tracking-tighter ${fees.balance > 0 ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          {formatCurrency(fees.balance)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest italic p-2">
                      No billing sync'd
                    </p>
                  )}
                </div>

                <div className="bg-slate-100 rounded-[28px] p-6 border border-slate-200 shadow-inner backdrop-blur-md group-hover:border-blue-500/10 transition-colors">
                  <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6">
                    Attendance Analytics
                  </p>
                  <div className="mb-6">
                    <div className="flex justify-between items-end mb-3 px-1">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        Aggregate Score
                      </span>
                      <span
                        className={`text-3xl font-black tracking-tighter ${avgAtt >= 75 ? "text-emerald-500" : avgAtt >= 60 ? "text-amber-500" : "text-rose-500"}`}
                      >
                        {avgAtt}%
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2 shadow-inner overflow-hidden border border-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${avgAtt}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full ${avgAtt >= 75 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : avgAtt >= 60 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.3)]"}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-2">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {att.length} Nodes Tracked
                    </p>
                    {att.some((a) => a.isCritical) && (
                      <div className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                        <div className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">
                          Critical Alert
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

// ─── PARENT CHILDREN ──────────────────────────────────────────────────────────
export function ParentChildren() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/parents/my-children")
      .then((r) => setChildren(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Dependent Registry"
        subtitle="Managed student nodes synchronized with your account"
      />
      {!children.length ? (
        <EmptyState
          icon={FiUsers}
          title="Registry Empty"
          subtitle="Contact the central administration to link your dependent student nodes."
        />
      ) : (
        children.map((child) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={child._id}
            className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d hover:shadow-amber-500/10 transition-all backdrop-blur-3xl group"
          >
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-amber-600/10 rounded-[24px] flex items-center justify-center text-amber-500 text-xl font-black shadow-inner border border-amber-500/10 group-hover:scale-105 transition-transform duration-500">
                {getInitials(child.firstName, child.lastName)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1.5 group-hover:text-amber-500 transition-colors">
                  {child.firstName} {child.lastName}
                </h3>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  {child.studentInfo?.indexNumber} · IDENTITY NODE
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                ["Academic Programme", child.studentInfo?.programme?.name],
                ["Current Level", `LEVEL ${child.studentInfo?.level}`],
                ["Institutional Dept.", child.studentInfo?.department?.name],
                ["Registry Email", child.email],
              ].map(([l, v]) => (
                <div
                  key={l}
                  className="bg-slate-100 rounded-[20px] p-5 border border-slate-200 shadow-inner group-hover:bg-slate-200 transition-all"
                >
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {l}
                  </p>
                  <p className="text-xs font-black text-slate-900 truncate uppercase leading-none">
                    {v || "NOT SYNCED"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ─── PARENT FEES ──────────────────────────────────────────────────────────────
export function ParentFees() {
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState("");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/parents/my-children")
      .then((r) => {
        setChildren(r.data.data || []);
        if (r.data.data?.[0]) {
          setSelected(r.data.data[0]._id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api
      .get(`/parents/children/${selected}/fees`)
      .then((r) => setBills(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Financial Registry"
        subtitle="Historical and current fee liabilities for linked students"
      />

      <div className="max-w-xs">
        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1 mb-2.5 block">
          Dependent Node
        </label>
        <select
          className="input h-10 bg-white/40 border-slate-200 text-[11px]"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {children.map((c) => (
            <option key={c._id} value={c._id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !bills.length ? (
        <EmptyState
          title="Financial Clear"
          subtitle="No outstanding or historical bills detected."
        />
      ) : (
        bills.map((bill) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={bill._id}
            className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d hover:shadow-emerald-500/10 transition-all group backdrop-blur-3xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
              <FiDollarSign className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-1.5 group-hover:text-emerald-500 transition-colors">
                  {bill.semester?.name}
                </h2>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  BILL: {bill.billNumber}
                </p>
              </div>
              <span
                className={`px-5 py-2 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] border shadow-2xl ${bill.status === "paid" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : bill.status === "partial" ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"}`}
              >
                {bill.status} Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
              <div className="bg-slate-100 rounded-[24px] p-6 text-center border border-slate-200 shadow-inner">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2.5">
                  Total Liability
                </p>
                <p className="text-lg font-black text-slate-900">
                  {formatCurrency(bill.totalBilled)}
                </p>
              </div>
              <div className="bg-emerald-500/5 rounded-[24px] p-6 text-center border border-emerald-500/10 shadow-inner">
                <p className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest mb-2.5">
                  Paid Sync
                </p>
                <p className="text-lg font-black text-emerald-500">
                  {formatCurrency(bill.totalPaid)}
                </p>
              </div>
              <div
                className={`rounded-[24px] p-6 text-center border shadow-inner ${bill.balance > 0 ? "bg-rose-500/5 border-rose-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}
              >
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2.5">
                  Delta Delta
                </p>
                <p
                  className={`text-lg font-black ${bill.balance > 0 ? "text-rose-500" : "text-emerald-500"}`}
                >
                  {formatCurrency(bill.balance)}
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

// ─── PARENT ATTENDANCE ────────────────────────────────────────────────────────
export function ParentAttendance() {
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/parents/my-children")
      .then((r) => {
        setChildren(r.data.data || []);
        if (r.data.data?.[0]) setSelected(r.data.data[0]._id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api
      .get(`/parents/children/${selected}/attendance`)
      .then((r) => setSummaries(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <PageHeader
        title="Attendance Registry"
        subtitle="Compliance logs for dependent student nodes"
      />

      <div className="max-w-xs">
        <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1 mb-2.5 block">
          Dependent Node
        </label>
        <select
          className="input h-10 bg-white/40 border-slate-200 text-[11px]"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {children.map((c) => (
            <option key={c._id} value={c._id}>
              {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !summaries.length ? (
        <EmptyState
          icon={FiClipboard}
          title="Logs Zero"
          subtitle="No attendance detected for this node."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summaries.map((s) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={s._id}
              className="bg-white/40 p-5 rounded-[20px] border border-slate-200 shadow-3d hover:shadow-blue-500/10 transition-all backdrop-blur-3xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <FiClipboard className="w-20 h-20 text-blue-400" />
              </div>
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-lg font-black text-slate-900 leading-tight uppercase mb-1.5 group-hover:text-blue-400 transition-colors truncate">
                    {s.course?.title}
                  </h3>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    {s.course?.code}
                  </p>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border shadow-inner ${s.attendancePercentage >= 75 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : s.attendancePercentage >= 60 ? "bg-amber-500/10 text-amber-500 border-amber-500/10" : "bg-rose-500/10 text-rose-500 border-rose-500/10"}`}
                >
                  {s.attendancePercentage}%
                </span>
              </div>

              <div className="mb-8 relative z-10">
                <div className="w-full bg-white rounded-full h-2 shadow-inner overflow-hidden border border-slate-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.attendancePercentage}%` }}
                    transition={{ duration: 1.2 }}
                    className={`h-full rounded-full ${s.attendancePercentage >= 75 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : s.attendancePercentage >= 60 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : "bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.3)]"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 relative z-10">
                {[
                  ["Live", s.present, "text-emerald-500", "bg-emerald-500/5"],
                  ["Abs", s.absent, "text-rose-500", "bg-rose-500/5"],
                  ["Late", s.late, "text-amber-500", "bg-amber-500/5"],
                  ["Exc", s.excused, "text-blue-400", "bg-blue-400/5"],
                ].map(([l, v, cl, bg]) => (
                  <div
                    key={l}
                    className={`${bg} rounded-xl p-4 text-center border border-slate-200 shadow-inner group-hover:scale-105 transition-transform`}
                  >
                    <p className={`text-sm font-black leading-none mb-1 ${cl}`}>
                      {v}
                    </p>
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">
                      {l}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ParentDashboard;
