import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';

// 1. Spotlight Hover Card (Aceternity UI)
export const SpotlightCard = ({ children, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-black/10 ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(245,158,11,0.15),
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
};

// 2. Shiny Text (Magic UI)
export const ShinyText = ({ text, className = "" }) => {
  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <span className="text-slate-400">{text}</span>
      <motion.div
        className="absolute inset-0 z-10 w-full"
        style={{
          backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          backgroundSize: "200% 100%"
        }}
        animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
    </div>
  );
};

// 3. Number Ticker
export const NumberTicker = ({ value, duration = 2, className = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;
    const totalMilSecDur = duration * 1000;
    const incrementTime = (totalMilSecDur / end) * 5;
    const timer = setInterval(() => {
      start += end / 20; // jump chunks
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span className={className}>{count.toLocaleString()}</span>;
};

// 4. Meteors Background (Aceternity UI)
export const Meteors = ({ number = 20 }) => {
  const meteors = new Array(number).fill(true);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[0]">
      {meteors.map((el, idx) => (
        <motion.span
          key={idx}
          initial={{ top: -50, left: Math.floor(Math.random() * (800 - -400) + -400), opacity: 1 }}
          animate={{
            top: "120vh",
            left: Math.floor(Math.random() * (800 - -400) + -400) + 500, // Move diagonally
            opacity: 0
          }}
          transition={{
            duration: Math.floor(Math.random() * (8 - 2) + 2),
            ease: "linear",
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          className="absolute h-1 w-1 rounded-[9999px] bg-white shadow-[0_0_10px_2px_#ffffff] rotate-[215deg]"
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[80px] -translate-y-1/2 bg-gradient-to-r from-white to-transparent" />
        </motion.span>
      ))}
    </div>
  );
};

// 5. Magnetic Button
export const MagneticButton = ({ children, className = "", onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// 6. Animated Grid Pattern
export const GridPattern = () => (
  <div className="absolute inset-0 z-[0] pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent)] overflow-hidden">
    <motion.div 
      className="absolute w-full h-[200%] top-[-100%] left-0"
      style={{
        backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwaGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4yKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')",
        backgroundSize: "40px 40px"
      }}
      animate={{ y: ["0%", "50%"] }}
      transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
    />
  </div>
);

// 7. Sparkles Effect
export const Sparkles = ({ text }) => {
  return (
    <div className="relative inline-block">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute -top-4 -left-4 text-amber-400 text-[10px]">✨</motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} className="absolute -bottom-2 -right-4 text-amber-500 text-[8px]">✨</motion.div>
      {text}
    </div>
  );
};

// 8. Border Beam Card (Magic UI)
export const BorderBeamCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 opacity-0 group-hover:opacity-100 animate-[spin_3s_linear_infinite] rounded-2xl" />
    <div className="absolute inset-[1px] bg-white dark:bg-slate-900 rounded-2xl z-10" />
    <div className="relative z-20 h-full">{children}</div>
  </div>
);

// 9. Glitch Text
export const GlitchText = ({ text, className = "" }) => (
  <div className={`relative inline-block ${className}`}>
    <motion.span animate={{ x: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 0.1 }} className="absolute inset-0 text-red-500 mix-blend-screen -z-10">{text}</motion.span>
    <motion.span animate={{ x: [1, -1, 1] }} transition={{ repeat: Infinity, duration: 0.1 }} className="absolute inset-0 text-blue-500 mix-blend-screen -z-10">{text}</motion.span>
    {text}
  </div>
);

// 10. Blur Fade
export const BlurFade = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.div>
);

// 11. Interactive Dock (Aceternity UI)
export const FloatingDock = ({ items }) => (
  <motion.div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-white/10 dark:bg-black/30 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
    {items.map((item, idx) => (
      <motion.div key={idx} whileHover={{ scale: 1.4, y: -10 }} className="cursor-pointer text-slate-500 hover:text-amber-500 transition-colors">
        {item.icon}
      </motion.div>
    ))}
  </motion.div>
);

// 12. Flip Words
export const FlipWords = ({ words }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setIndex(curr => (curr + 1) % words.length), 3000);
    return () => clearInterval(i);
  }, [words]);
  return (
    <AnimatePresence mode="wait">
      <motion.span key={words[index]} initial={{ opacity: 0, y: 10, rotateX: 90 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: -10, rotateX: -90 }} className="inline-block text-amber-500 font-black">
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

// 13. Ripple Effect Background
export const RippleBackground = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1] overflow-hidden">
    <motion.div animate={{ scale: [1, 4], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute w-32 h-32 border border-amber-500/20 rounded-full" />
    <motion.div animate={{ scale: [1, 4], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="absolute w-32 h-32 border border-amber-500/20 rounded-full" />
  </div>
);

// 14. Retro Grid 3D
export const RetroGrid = () => (
  <div className="absolute inset-0 overflow-hidden perspective-[1000px] z-[-1] pointer-events-none">
    <div className="absolute w-[200%] h-[200%] bottom-0 left-[-50%] bg-[linear-gradient(rgba(245,158,11,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)] origin-bottom animate-[grid-scroll_20s_linear_infinite]" />
    <style>{`@keyframes grid-scroll { from { transform: rotateX(60deg) translateY(0); } to { transform: rotateX(60deg) translateY(40px); } }`}</style>
  </div>
);

// 15. Typewriter Effect
export const TypewriterText = ({ text }) => {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplay('');
    const t = setInterval(() => {
      setDisplay(prev => prev + text.charAt(i));
      i++;
      if (i === text.length) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, [text]);
  return <span>{display}<span className="animate-pulse">_</span></span>;
};

// 16. Evervault Hover Card (Cryptographic Text)
export const EvervaultCard = ({ text, className="" }) => {
  const [randomStr, setRandomStr] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  const onHover = () => {
    let iter = 0;
    const interval = setInterval(() => {
      setRandomStr(text.split('').map((letter, index) => {
        if(index < iter) return text[index];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if(iter >= text.length) clearInterval(interval);
      iter += 1 / 3;
    }, 30);
  };
  return <div onMouseEnter={onHover} className={`font-mono ${className}`}>{randomStr}</div>;
};

// 17. Aurora Background
export const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-2] opacity-30">
    <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,transparent_50%)] animate-[spin_10s_linear_infinite]" />
    <div className="absolute -bottom-[50%] -right-[50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1)_0%,transparent_50%)] animate-[spin_15s_linear_infinite_reverse]" />
  </div>
);

// 18. Ultra-Advanced Starfield 3D Projection
export const Starfield3D = ({ density = 150 }) => {
  const stars = new Array(density).fill(true);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[0] [perspective:800px]">
      {stars.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            z: Math.random() * -2000, 
            x: Math.random() * window.innerWidth - window.innerWidth / 2, 
            y: Math.random() * window.innerHeight - window.innerHeight / 2,
            opacity: 0 
          }}
          animate={{ 
            z: [null, 800], 
            opacity: [0, 1, 1, 0] 
          }}
          transition={{ 
            duration: Math.random() * 5 + 4, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5 
          }}
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_3px_rgba(255,255,255,1)]"
        />
      ))}
    </div>
  );
};

// 19. Cybernetic Grid Hologram
export const CyberGrid = () => (
  <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-[pulse_4s_ease-in-out_infinite]" />
    <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_20px_5px_rgba(16,185,129,0.5)] animate-[scan_3s_linear_infinite]" />
    <style>{`@keyframes scan { 0% { top: -10%; } 100% { top: 110%; } }`}</style>
  </div>
);

// 20. Particle Vortex Array
export const ParticleVortex = () => {
  const particles = new Array(40).fill(true);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[0] flex items-center justify-center mix-blend-screen">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotate: 360,
            scale: [1, 2, 1],
            borderRadius: ["20%", "50%", "20%"]
          }}
          transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
          className="absolute w-[40vw] h-[40vw] border border-amber-500/5 rounded-full"
          style={{ transformOrigin: `${Math.random() * 100}% ${Math.random() * 100}%` }}
        />
      ))}
    </div>
  );
};
