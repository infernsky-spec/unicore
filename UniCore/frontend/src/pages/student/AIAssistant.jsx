import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../utils/api";
import { PageHeader, Badge } from "../../components/shared/UI";
import {
  FiSend,
  FiRefreshCw,
  FiCpu,
  FiBook,
  FiCalendar,
  FiTarget,
  FiUser,
  FiZap,
  FiInfo,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const CONTEXTS = [
  {
    id: "general",
    label: "General",
    icon: <FiCpu />,
    desc: "Ask anything academic",
  },
  {
    id: "study",
    label: "Study Planner",
    icon: <FiBook />,
    desc: "Get a personalised study plan",
  },
  {
    id: "planning",
    label: "Schedule Help",
    icon: <FiCalendar />,
    desc: "Plan your semester",
  },
];

const STARTERS = [
  "Help me create a study plan for my upcoming exams",
  "What are the best revision techniques for IT subjects?",
  "How should I balance my coursework and social life?",
  "Give me tips to improve my GPA",
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("general");
  const [provider, setProvider] = useState("demo");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    setMsgs((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const history = [...msgs, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await api.post("/ai/chat", {
        messages: history,
        context,
        provider: "claude",
      });
      setMsgs((m) => [...m, { role: "assistant", content: res.data.reply }]);
      setProvider(res.data.provider || "demo");
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMsgs([]);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)] animate-fade-in pb-10 relative">
      <PageHeader
        title="AI Research Lab"
        subtitle={`Synchronized with ${provider === "claude" ? "Claude 3.5" : provider === "openai" ? "GPT-4" : "Nexa AI"} Protocol`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
              title="Clear chat"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 shadow-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                Active Link
              </span>
            </div>
          </div>
        }
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-8 overflow-hidden">
        {/* Left: Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-5 space-y-8 scroll-smooth">
            <AnimatePresence mode="popLayout">
              {!msgs.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                >
                  <div className="w-24 h-24 bg-amber-600 text-slate-900 rounded-[20px] flex items-center justify-center mb-8 shadow-2xl shadow-amber-600/30">
                    <FiCpu className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">
                    Identity Recognized: {user?.firstName}
                  </h3>
                  <p className="text-slate-500 text-sm mb-12 max-w-sm font-medium leading-relaxed">
                    I am your neural academic interface. Ready to assist with
                    research, planning, or complex problem solving.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-left p-6 bg-slate-50/50 hover:bg-amber-600 hover:text-slate-900 border border-slate-100 rounded-3xl transition-all group"
                      >
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 group-hover:opacity-60 mb-2">
                          Prompt Starter
                        </p>
                        <p className="text-sm font-bold leading-tight">"{s}"</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: m.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} items-end gap-4`}
                >
                  {m.role === "assistant" && (
                    <div className="w-10 h-10 bg-slate-900 text-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 mb-1 shadow-lg shadow-black/10">
                      <FiCpu className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] lg:max-w-[70%] rounded-[20px] p-6 text-sm font-medium leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-amber-600 text-slate-900 rounded-br-lg shadow-amber-600/20"
                        : "bg-slate-50 text-slate-800 rounded-bl-lg border border-slate-100"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      m.content
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 mb-1 border border-amber-100">
                      <FiUser className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start items-end gap-4"
                >
                  <div className="w-10 h-10 bg-slate-900 text-slate-900 rounded-2xl flex items-center justify-center animate-pulse">
                    <FiCpu className="w-5 h-5" />
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-[20px] rounded-bl-lg px-8 py-5">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} className="h-4" />
          </div>

          {/* Input Panel */}
          <div className="p-6 bg-white border-t border-slate-50">
            <div className="flex gap-4 items-center bg-slate-50 p-2 rounded-[20px] border border-slate-100 focus-within:border-blue-500/50 focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Synchronize request with Nexa AI..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-3 text-sm font-bold text-slate-900 placeholder-slate-400"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-amber-600 text-slate-900 rounded-[24px] flex items-center justify-center shadow-xl shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-30 disabled:shadow-none transition-all"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 opacity-40">
              <div className="h-[1px] flex-1 bg-slate-200" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
                {provider === "demo"
                  ? "Standard Protocol (Demo)"
                  : "Neural Encryption Active"}
              </p>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Right: Sidebar Options */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 ml-1">
              Intelligence Context
            </p>
            <div className="space-y-3">
              {CONTEXTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setContext(c.id);
                    reset();
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border-2 text-left group ${
                    context === c.id
                      ? "bg-amber-600 border-amber-600 text-slate-900 shadow-xl shadow-amber-600/20"
                      : "bg-white border-slate-50 text-slate-600 hover:border-amber-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                      context === c.id
                        ? "bg-white/20"
                        : "bg-slate-50 group-hover:bg-amber-50 group-hover:text-amber-600"
                    }`}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black leading-none mb-1">
                      {c.label}
                    </p>
                    <p
                      className={`text-[9px] font-bold uppercase tracking-widest ${context === c.id ? "text-amber-100" : "text-slate-600"}`}
                    >
                      {c.id} mode
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-5 rounded-[20px] text-slate-900 shadow-xl shadow-amber-600/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200 blur-[50px] rounded-full" />
            <FiZap className="w-8 h-8 text-slate-900/50 mb-6" />
            <h4 className="text-lg font-black tracking-tighter leading-none mb-2">
              Neural Link Pro
            </h4>
            <p className="text-amber-100/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
              Upgrade for unlimited high-priority research bandwidth.
            </p>
            <button className="w-full py-4 bg-white text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-50 transition-all">
              Go Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
