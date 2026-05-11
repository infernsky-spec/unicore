"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const CountChart = ({ boys = 25, girls = 23 }) => {
  const data = [
    { name: "Total", count: boys + girls, fill: "white" },
    { name: "Girls", count: girls, fill: "#FAE27C" },
    { name: "Boys", count: boys, fill: "#C3EBFA" },
  ];

  return (
    <div className="bg-transparent w-full h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em]">Institutional Entities</h3>
        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 border border-slate-200">
          <span className="text-[10px] font-black">⋮⋮</span>
        </div>
      </div>
      <div className="relative w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <RadialBarChart cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={18} data={data}>
            <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="count" cornerRadius={12} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white border border-slate-200 rounded-full shadow-2xl flex flex-col items-center justify-center p-3">
          <div className="text-2xl font-black text-slate-900 tracking-tighter">{boys + girls}</div>
          <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Total Hub</div>
        </div>
      </div>
      <div className="flex justify-center gap-10 mt-6 pt-6 border-t border-slate-200">
        <div className="text-center group">
          <div className="w-3 h-3 bg-[#C3EBFA] rounded-full mx-auto mb-2 shadow-[0_0_10px_rgba(195,235,250,0.3)]"></div>
          <div className="text-sm font-black text-slate-900">{boys}</div>
          <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Male Nodes</div>
        </div>
        <div className="text-center group">
          <div className="w-3 h-3 bg-[#FAE27C] rounded-full mx-auto mb-2 shadow-[0_0_10px_rgba(250,226,124,0.3)]"></div>
          <div className="text-sm font-black text-slate-900">{girls}</div>
          <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Female Nodes</div>
        </div>
      </div>
    </div>
  );
};

export default CountChart;

