"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AttendanceChart = ({ data = [
  { name: "Mon", present: 85, absent: 15 },
  { name: "Tue", present: 92, absent: 8 },
  { name: "Wed", present: 78, absent: 22 },
  { name: "Thu", present: 95, absent: 5 },
  { name: "Fri", present: 88, absent: 12 }
] }) => {
  return (
    <div className="bg-transparent w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em]">Node Attendance Log</h3>
        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-200">
          <span className="text-[10px] font-black">⋮⋮</span>
        </div>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={data} barSize={16} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 900 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9, fontWeight: 900 }} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#121214", fontSize: '10px' }} />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
            <Bar dataKey="present" fill="#10b981" radius={[4,4,0,0]} name="Synchronized" />
            <Bar dataKey="absent" fill="#f43f5e" radius={[4,4,0,0]} name="Offline" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;

