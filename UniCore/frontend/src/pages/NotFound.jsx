import { Link } from "react-router-dom";
import { HiAcademicCap } from "react-icons/hi";
import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-[20px] flex items-center justify-center mx-auto mb-10 shadow-2xl backdrop-blur-xl"
        >
          <HiAcademicCap className="w-12 h-12 text-amber-600" />
        </motion.div>

        <p className="text-amber-500 text-lg font-black uppercase tracking-tighter mb-2">
          UniCore
        </p>
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
          404
        </h1>
        <h2 className="text-[9px] font-black text-amber-600 uppercase tracking-[0.5em] mb-8">
          Node Disconnected
        </h2>

        <p className="text-slate-500 text-xs font-bold leading-relaxed mb-12">
          The coordinates you've requested do not exist within the UniCore
          governance network. The page may have been relocated or de-indexed.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all active:scale-95 group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Re-establish Link
        </Link>

        <p className="mt-12 text-[5px] font-black text-slate-800 uppercase tracking-[0.4em]">
          Powered by NexaVision
        </p>
      </motion.div>
    </div>
  );
}
