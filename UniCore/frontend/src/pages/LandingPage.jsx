import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiShield,
  FiGlobe,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";
import { HiAcademicCap } from "react-icons/hi";
import AnimatedWallpaper from "../components/shared/AnimatedWallpaper";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-slate-900 selection:bg-amber-600/30 selection:text-amber-800 relative overflow-hidden font-sans perspective-1000">
      {/* 3D Animated Wallpaper */}
      <AnimatedWallpaper />

      <nav className="relative z-50 container mx-auto px-8 py-8 flex justify-between items-center">
        <div
          className="flex items-center gap-2.5 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-amber-600 rounded-[16px] flex items-center justify-center shadow-xl shadow-amber-600/20 group-hover:rotate-6 transition-transform">
            <HiAcademicCap className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
            EduBridge
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/login")}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-amber-600 transition-colors"
          >
            Portal Access
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-amber-600 text-slate-900 px-6 py-3 rounded-[18px] text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95"
          >
            Connect
          </button>
        </div>
      </nav>
      <main className="relative z-10 container mx-auto px-8 pt-16 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left preserve-3d"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 border border-amber-100 rounded-full text-amber-600 text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Intelligence Network V4.0
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter text-slate-900">
              Education <br />
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 bg-clip-text text-transparent landing-gradient-text">
                Redefined.
              </span>
            </h1>
            <p className="text-slate-600 text-lg max-w-lg leading-relaxed mb-10 font-bold opacity-80 mx-auto lg:mx-0">
              The unified operating system for higher education. Seamlessly
              bridging academic excellence with digital infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/")}
                className="group relative px-10 py-5 bg-amber-600 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-600/30 hover:bg-amber-500 transition-all flex items-center justify-center gap-3 active:scale-95 overflow-hidden text-slate-900"
              >
                Select University{" "}
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-10 py-5 bg-white border border-amber-100 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-amber-900 hover:bg-amber-50 transition-all active:scale-95 shadow-sm"
              >
                Member Portal
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1 }}
            className="flex-1 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[360px] preserve-3d">
              {/* Small Cute Main Card */}
              <div className="relative bg-white/60 backdrop-blur-2xl border border-white rounded-[50px] p-6 shadow-3d overflow-hidden group card-3d">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <HiAcademicCap className="w-40 h-40 text-amber-600" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-amber-600 text-slate-900 rounded-[22px] flex items-center justify-center shadow-2xl shadow-amber-600/30">
                    <HiAcademicCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tighter">
                      Empowering <br />
                      Digital Futures.
                    </h3>
                    <p className="text-slate-600 text-[11px] font-black uppercase tracking-widest mt-4 leading-relaxed opacity-70">
                      Join thousands of students and educators in a seamless
                      experience.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-amber-100/30 flex items-center gap-5">
                    <div>
                      <p className="text-lg font-black text-amber-600">99.9%</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                        Uptime
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-black text-amber-600">
                        Secure
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">
                        Encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative mini cards - Smaller and Cuter */}
              <motion.div
                animate={{ y: [0, -8, 0], rotateZ: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-md p-4 rounded-[22px] shadow-xl border border-amber-50 z-20"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <FiCheckCircle className="text-slate-900 w-4 h-4" />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-700">
                    Verified Access
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid - Small Cute Cards */}
        <div className="mt-40 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FiGlobe,
              title: "Network Hub",
              desc: "Centralized access to all public and private technical universities in Ghana.",
            },
            {
              icon: FiLayers,
              title: "Deep Integration",
              desc: "Seamlessly connects attendance, financials, and academic records in real-time.",
            },
            {
              icon: FiShield,
              title: "Military Grade",
              desc: "Secured with enterprise-level encryption to protect sensitive data.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/60 backdrop-blur-md border border-amber-50 p-5 rounded-[20px] hover:shadow-xl hover:shadow-amber-600/5 transition-all group card-3d"
            >
              <div className="w-12 h-12 bg-amber-50/50 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors shadow-inner border border-amber-100/50">
                <f.icon className="w-6 h-6 text-amber-600 group-hover:text-slate-900 transition-colors" />
              </div>
              <h3 className="text-xl font-black mb-4 tracking-tighter text-slate-900 uppercase">
                {f.title}
              </h3>
              <p className="text-slate-600 text-[11px] font-bold leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
