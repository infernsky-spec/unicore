import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  PageHeader,
  StatCard,
  LoadingSpinner,
  EmptyState,
} from "../../components/shared/UI";
import { formatCurrency } from "../../utils/helpers";
import { FiUsers, FiBook, FiDollarSign, FiClipboard } from "react-icons/fi";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stats/admin")
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats)
    return (
      <div className="text-center text-slate-600 py-12">No data available</div>
    );

  const ov = stats.overview || {};
  const fees = stats.fees || {};
  const att = stats.attendance || {};
  const levels = stats.enrollmentByLevel || [];
  const genders = stats.genderStats || [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { family: "Outfit, sans-serif", weight: "900", size: 10 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#64748b",
          font: { family: "Outfit, sans-serif", weight: "900", size: 9 },
        },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#64748b",
          font: { family: "Outfit, sans-serif", weight: "900", size: 9 },
        },
      },
    },
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Intelligence Terminal"
        subtitle="Institutional performance metrics visualization hub"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Entity Total"
          value={ov.totalStudents?.toLocaleString()}
          icon={FiUsers}
          color="bg-amber-600 text-slate-900"
        />
        <StatCard
          title="Personnel Nodes"
          value={ov.totalTeachers}
          icon={FiUsers}
          color="bg-slate-100 text-slate-700 border border-slate-200"
        />
        <StatCard
          title="Active Modules"
          value={ov.totalCourses}
          icon={FiBook}
          color="bg-slate-100 text-slate-700 border border-slate-200"
        />
        <StatCard
          title="Network Integrity"
          value={`${Math.round(att.avgAttendance || 0)}%`}
          icon={FiClipboard}
          color="bg-emerald-600 text-slate-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card border border-slate-200 bg-white/40 backdrop-blur-3xl rounded-[20px] p-5 shadow-3d">
          <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">
            Enrollment Density
          </h3>
          <div className="h-72">
            <Bar
              data={{
                labels: levels.map((l) => `Level ${l._id}`),
                datasets: [
                  {
                    label: "Entities",
                    data: levels.map((l) => l.count),
                    backgroundColor: "#d97706",
                    borderRadius: 20,
                    barThickness: 10,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="card border border-slate-200 bg-white/40 backdrop-blur-3xl rounded-[20px] p-5 shadow-3d">
          <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">
            Identity Distribution
          </h3>
          <div className="h-72">
            {genders.length > 0 ? (
              <Doughnut
                data={{
                  labels: genders.map((g) => g._id || "Unknown"),
                  datasets: [
                    {
                      data: genders.map((g) => g.count),
                      backgroundColor: ["#d97706", "#f59e0b", "#fbbf24"],
                      borderWidth: 0,
                      hoverOffset: 15,
                    },
                  ],
                }}
                options={{ ...chartOptions, cutout: "75%" }}
              />
            ) : (
              <EmptyState
                title="No Data"
                subtitle="Neural patterns not synchronized."
              />
            )}
          </div>
        </div>

        <div className="card border border-slate-200 bg-white/40 backdrop-blur-3xl rounded-[20px] p-5 shadow-3d">
          <h3 className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-8">
            Fiscal Ledger Status
          </h3>
          <div className="h-72">
            <Doughnut
              data={{
                labels: ["Collected", "Outstanding"],
                datasets: [
                  {
                    data: [fees.totalPaid || 0, fees.totalBalance || 0],
                    backgroundColor: ["#059669", "#dc2626"],
                    borderWidth: 0,
                    cutout: "75%",
                    hoverOffset: 15,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200 text-center">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Billed
              </p>
              <p className="font-black text-slate-900 text-xs">
                {formatCurrency(fees.totalBilled)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1">
                Paid
              </p>
              <p className="font-black text-emerald-500 text-xs">
                {formatCurrency(fees.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-rose-500 mb-1">
                Balance
              </p>
              <p className="font-black text-rose-500 text-xs">
                {formatCurrency(fees.totalBalance)}
              </p>
            </div>
          </div>
        </div>

        <div className="card border border-slate-200 bg-white/40 backdrop-blur-3xl rounded-[20px] p-5 shadow-3d">
          <h3 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">
            Integrity Metrics
          </h3>
          <div className="space-y-8 mt-4">
            {[
              {
                label: "Network Average",
                value: Math.round(att.avgAttendance || 0),
                max: 100,
                color: "bg-amber-600",
              },
              {
                label: "At Risk Entities",
                value: att.atRisk || 0,
                max: ov.totalStudents || 1,
                color: "bg-orange-600",
              },
              {
                label: "Critical Failure Nodes",
                value: att.critical || 0,
                max: ov.totalStudents || 1,
                color: "bg-rose-600",
              },
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2.5">
                  <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                    {item.label}
                  </span>
                  <span className="text-slate-900">
                    {item.value}
                    {item.label.includes("Average") ? "%" : ""}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`${item.color} h-full rounded-full shadow-[0_0_15px_rgba(217,119,6,0.3)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
