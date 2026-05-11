import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import AnimatedWallpaper from "../components/shared/AnimatedWallpaper";

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* 3D Animated Wallpaper */}
      <AnimatedWallpaper />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center text-slate-900 pt-16 pb-24">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-7xl font-black font-display bg-gradient-to-r from-white to-blue-200/70 bg-clip-text text-transparent mb-6 leading-tight">
            EduBridge
          </h1>
          <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
            University Management System
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl max-w-3xl mx-auto mb-16 text-blue-100/90 leading-relaxed"
        >
          Complete academic ecosystem for universities - real-time attendance,
          fees management, results with GPA, resources, announcements, and admin
          tools all in one platform.
        </motion.p>

        {/* Feature Panels */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid md:grid-cols-4 gap-6 max-w-6xl w-full mb-20"
        >
          {[
            {
              icon: "📋",
              title: "Smart Attendance",
              desc: "PIN & QR code scanning with live tracking",
            },
            {
              icon: "📊",
              title: "Results & GPA",
              desc: "Auto-calculated GPAs and transcripts",
            },
            {
              icon: "💰",
              title: "Fees Portal",
              desc: "Online payments and billing management",
            },
            {
              icon: "⚙️",
              title: "Admin Control",
              desc: "Users, courses, exams, announcements",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group bg-slate-200 backdrop-blur-xl rounded-3xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              whileHover={{ scale: 1.05, y: -10 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-slate-900">
                {feature.title}
              </h3>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={() => navigate("/select-university")}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="btn-primary text-xl py-6 px-12 font-bold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 group"
        >
          Select Your School
          <FiArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-8 text-sm text-slate-900/60"
        >
          Serving universities across Ghana and beyond
        </motion.p>
      </div>
    </div>
  );
}
