import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import {
  FiSearch,
  FiChevronRight,
  FiShield,
  FiArrowRight,
  FiBookOpen,
  FiStar,
  FiCpu,
  FiAward,
  FiBook,
  FiBriefcase,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import { GHANA_UNIVERSITIES } from "../utils/universities";
import { useTheme } from "../contexts/ThemeContext";

const Floating3DAsset = ({
  icon: Icon,
  initialTop,
  initialLeft,
  delay = 0,
  duration = 15,
  size = 28,
  speed = 0.08,
  mouseX,
  mouseY,
}) => {
  const ref = useRef(null);
  const springX = useSpring(0, { stiffness: speed * 800, damping: 25, mass: 1 });
  const springY = useSpring(0, { stiffness: speed * 800, damping: 25, mass: 1 });

  // Cache base position to avoid getBoundingClientRect in the loop
  const basePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const calculatePosition = () => {
      // Calculate approximate center based on percentage
      basePos.current = {
        x: (initialLeft / 100) * window.innerWidth,
        y: (initialTop / 100) * window.innerHeight,
      };
    };
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
  }, [initialTop, initialLeft]);

  useEffect(() => {
    let animationId;
    const animate = () => {
      const dx = mouseX.current - basePos.current.x;
      const dy = mouseY.current - basePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const ATTRACTION_RADIUS = 300;
      if (distance < ATTRACTION_RADIUS && distance > 20) {
        const pullStrength = 0.25 * (1 - distance / ATTRACTION_RADIUS);
        springX.set(dx * pullStrength);
        springY.set(dy * pullStrength);
      } else {
        springX.set(0);
        springY.set(0);
      }
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mouseX, mouseY, springX, springY]);

  return (
    <motion.div
      ref={ref}
      className="fixed pointer-events-none z-0"
      style={{
        top: `${initialTop}%`,
        left: `${initialLeft}%`,
        x: springX,
        y: springY,
        willChange: "transform",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          y: [0, -20, 0],
          rotate: [0, 20, -20, 0],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration,
          repeat: Infinity,
          delay,
          ease: "easeInOut",
        }}
        style={{ fontSize: size }}
        className="text-slate-900/40 dark:text-amber-500/80 filter drop-shadow-md"
      >
        <Icon />
      </motion.div>
    </motion.div>
  );
};

export default function UniversitySelectPage() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentUniConfirm, setCurrentUniConfirm] = useState(null);
  const navigate = useNavigate();
  const mouseX = useRef(window.innerWidth / 2);
  const mouseY = useRef(window.innerHeight / 2);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiBase}/universities`);
        const data = await res.json();
        if (data.success) {
          setUniversities(data.data);
        } else {
          // Fallback to static list if API fails
          setUniversities(GHANA_UNIVERSITIES);
        }
      } catch (err) {
        console.error("Failed to fetch universities:", err);
        setUniversities(GHANA_UNIVERSITIES);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const filteredUniversities = universities.filter((uni) => {
    const nameMatch =
      uni.name.toLowerCase().includes(search.toLowerCase()) ||
      uni.shortName.toLowerCase().includes(search.toLowerCase());
    const filterMatch =
      filter === "all" || uni.type.toLowerCase() === filter.toLowerCase();
    return nameMatch && filterMatch;
  });

  const handleSelect = (uni) => {
    setCurrentUniConfirm(uni);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (currentUniConfirm) {
      // Store the backend ID for tenant isolation
      localStorage.setItem("eb_university", JSON.stringify({
        ...currentUniConfirm,
        id: currentUniConfirm._id || currentUniConfirm.id // Prefer DB _id
      }));
      navigate("/login");
    }
  };

  const filters = [
    { key: "all", label: "All", icon: "🌍" },
    { key: "Public", label: "Public", icon: "🏛️" },
    { key: "Technical", label: "Tech", icon: "🔧" },
    { key: "Private", label: "Private", icon: "🏫" },
  ];

  // Dense grid for tiny 3D floating images - evenly scattered across entire page
  // Memoize to keep the same random positions across renders
  const backgroundAssets = useMemo(() => {
    const icons = [
      FiBook,
      HiAcademicCap,
      FiStar,
      FiAward,
      FiBriefcase,
      FiCpu,
      FiBookOpen,
      FiShield,
    ];

    const assets = [];
    const ROWS = 8; // 8 rows
    const COLS = 6; // 6 columns for better vertical spread

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        assets.push({
          icon: icons[(r * COLS + c) % icons.length],
          // Jittered grid: ensures even distribution with random offsets
          initialTop: (r / ROWS) * 100 + (Math.random() * (100 / ROWS) * 0.8) + 5,
          initialLeft: (c / COLS) * 100 + (Math.random() * (100 / COLS) * 0.8) + 2,
          delay: Math.random() * 10,
          duration: 15 + Math.random() * 12,
          size: 18 + Math.random() * 14,
          speed: 0.06 + Math.random() * 0.08,
        });
      }
    }
    return assets;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500/30 selection:text-amber-500 relative overflow-x-hidden font-sans">
      {/* ── Theme Toggle Button (Top Right) ─────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
        onClick={toggle}
        id="theme-toggle"
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="fixed top-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center
          bg-white/70 dark:bg-white/10 border border-slate-200 dark:border-white/10
          backdrop-blur-xl shadow-lg hover:shadow-xl
          hover:scale-110 active:scale-95
          transition-all duration-300 group cursor-pointer"
        style={{ boxShadow: isDark ? '0 0 20px rgba(251,191,36,0.15)' : '0 4px 20px rgba(0,0,0,0.08)' }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiSun className="w-5 h-5 text-amber-400 group-hover:text-amber-300" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FiMoon className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating 3D Tiny Assets */}
      {backgroundAssets.map((asset, i) => (
        <Floating3DAsset key={i} {...asset} mouseX={mouseX} mouseY={mouseY} />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 lg:py-16">
        {/* Hero Section with UniCore Branding */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 border border-slate-200 rounded-full text-amber-500 text-[9px] font-black uppercase tracking-[0.4em] mb-8 shadow-2xl backdrop-blur-3xl"
          >
            <FiCpu className="w-3.5 h-3.5 animate-pulse" /> Institutional Core
            Interface
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="mb-4"
          >
            <h1 className="text-6xl lg:text-8xl font-black bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 bg-clip-text text-transparent tracking-tighter leading-[0.85] uppercase">
              UniCore
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mb-10"
          >
            Academic Governance Network
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl lg:text-4xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter uppercase"
          >
            Select Your <span className="text-amber-500">Node.</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-lg group mx-auto"
          >
            <div className="relative flex items-center bg-white/60 border border-slate-200 rounded-[18px] p-1 shadow-2xl backdrop-blur-3xl focus-within:border-amber-500/50 transition-all duration-500">
              <FiSearch className="ml-4 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search institutions..."
                className="w-full bg-transparent border-none focus:ring-0 px-3 py-3 text-xs text-slate-900 placeholder-slate-600 font-bold outline-none"
              />
            </div>
          </motion.div>
        </div>

        {/* Small Cute Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {filters.map(({ key, label, icon }) => (
            <motion.button
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={key}
              onClick={() => setFilter(key)}
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 border flex items-center gap-2 ${filter === key
                  ? "bg-amber-600 border-amber-500 text-slate-900 shadow-lg shadow-amber-600/20"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                }`}
            >
              <span className="text-sm">{icon}</span>
              {label}
            </motion.button>
          ))}
        </div>

        {/* Balanced Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 perspective-1000"
        >
          <AnimatePresence>
            {loading ? (
              // Skeleton Loading State
              Array.from({ length: 12 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse p-5 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[20px] h-[180px]">
                  <div className="w-14 h-14 bg-slate-200 dark:bg-white/10 rounded-[22px] mb-8" />
                  <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2 mb-2" />
                  <div className="h-2 bg-slate-200 dark:bg-white/5 rounded w-full mb-4" />
                  <div className="h-6 bg-slate-200 dark:bg-white/10 rounded-xl w-1/3" />
                </div>
              ))
            ) : filteredUniversities.map((uni) => (
              <motion.div
                layout="position"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } }}
                transition={{ 
                  duration: 0.6, 
                  ease: [0.16, 1, 0.3, 1],
                  layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
                }}
                key={uni.id}
                onClick={() => handleSelect(uni)}
                className="group relative p-5 bg-slate-100 border border-slate-200 rounded-[20px] shadow-2xl hover:border-amber-500/40 hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)] transition-colors duration-500 cursor-pointer overflow-hidden backdrop-blur-2xl"
              >
                {/* Book Waterman Effect */}
                <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-30 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform group-hover:scale-150 group-hover:-rotate-45 text-amber-600 pointer-events-none">
                  <FiBookOpen className="w-32 h-32" />
                </div>

                <div className="relative z-10 w-14 h-14 mb-8 bg-white rounded-[22px] border border-slate-200 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-700 overflow-hidden p-2">
                  <span className="group-hover:rotate-12 transition-transform duration-700 flex items-center justify-center w-full h-full">
                    {uni.logo.startsWith('http') || uni.logo.startsWith('/logos/') ? (
                      <img src={uni.logo} alt={uni.shortName} className="w-full h-full object-contain" />
                    ) : (
                      uni.logo
                    )}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-[11px] font-black mb-1.5 text-slate-900 group-hover:text-amber-500 transition-colors uppercase tracking-tight truncate">
                    {uni.shortName}
                  </h3>
                  <p className="text-slate-500 text-[8px] line-clamp-2 font-black uppercase tracking-widest leading-relaxed mb-6 group-hover:text-slate-700 transition-colors">
                    {uni.name}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-tighter border border-slate-200">
                      {uni.type}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-700">
                      <FiChevronRight className="text-lg" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {!loading && filteredUniversities.length === 0 && (
          <div className="text-center py-24 border border-dashed border-slate-200 rounded-[20px] bg-slate-100 dark:bg-white/5 backdrop-blur-md">
            <p className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.3em] text-[8px]">
              Node not found
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-[320px] bg-white border border-slate-200 rounded-[20px] p-5 shadow-3d overflow-hidden"
            >
              <div className="text-center relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center text-3xl border border-slate-200 overflow-hidden p-2">
                  {currentUniConfirm?.logo.startsWith('http') || currentUniConfirm?.logo.startsWith('/logos/') ? (
                    <img src={currentUniConfirm.logo} alt={currentUniConfirm.shortName} className="w-full h-full object-contain" />
                  ) : (
                    currentUniConfirm?.logo
                  )}
                </div>
                <h2 className="text-xl font-black mb-1 text-slate-900 tracking-tighter uppercase">
                  Connect Node?
                </h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-8">
                  Authorizing secure access
                </p>

                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mb-8 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  {currentUniConfirm?.name}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleConfirm}
                    className="w-full py-3.5 rounded-xl bg-amber-600 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    Confirm <FiArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest hover:text-slate-900 transition-all"
                  >
                    Abort
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-10 border-t border-slate-200 text-center space-y-2">
        <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">
          UniCore <span className="text-amber-500/40">·</span> Academic
          Governance Network
        </p>
        <p className="text-[6px] font-black text-slate-800 uppercase tracking-[0.4em]">
          Powered by NexaVision
        </p>
      </footer>
    </div>
  );
}
