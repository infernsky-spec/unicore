import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiUser, FiMail, FiMapPin, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseRepRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/course-rep/lecturer/requests");
      setRequests(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/course-rep/${id}/${action}`);
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchRequests();
    } catch (err) {
      toast.error(`Action failed: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-amber-600/20 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
          Unit Representative Requests
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
          Verify and authorize course representative candidates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {requests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200"
            >
              <FiActivity className="mx-auto text-4xl text-slate-300 mb-4" />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                No pending signals detected
              </p>
            </motion.div>
          ) : (
            requests.map((req) => (
              <motion.div
                key={req._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200 group-hover:scale-110 transition-transform">
                    <FiUser className="text-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-slate-900 uppercase truncate">
                      {req.studentId?.firstName} {req.studentId?.lastName}
                    </h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {req.studentId?.studentInfo?.indexNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <FiMapPin className="text-amber-500" />
                    {req.department}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <FiMail className="text-blue-500" />
                    {req.studentId?.email}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction(req._id, "approve")}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <FiCheck /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "reject")}
                    className="flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    <FiX /> Reject
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
