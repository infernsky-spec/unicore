import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GHANA_UNIVERSITIES } from "../utils/universities";
import { FiSearch } from "react-icons/fi";

export default function SimpleUniversitySelect() {
  const [universities] = useState(GHANA_UNIVERSITIES);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredUniversities = universities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(search.toLowerCase()) ||
      uni.shortName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (uni) => {
    localStorage.setItem("eb_university", JSON.stringify(uni));
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-200 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to EduBridge
          </h1>
          <p className="text-slate-700 text-lg mb-2">Select your university</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your university..."
              className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 transition-all"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUniversities.slice(0, 20).map((uni) => (
            <button
              key={uni.id}
              onClick={() => handleSelect(uni)}
              className="w-full p-4 bg-slate-200 hover:bg-white/20 border border-white/20 rounded-xl text-left transition-all group hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-lg font-bold">
                  {uni.logo || uni.shortName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {uni.shortName}
                  </p>
                  <p className="text-slate-700 text-sm truncate">{uni.name}</p>
                </div>
                <span className="px-3 py-1 bg-white/20 text-slate-900 text-xs rounded-full font-medium">
                  {uni.type}
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg mb-4">No universities found</p>
            <p className="text-slate-500 text-sm">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
