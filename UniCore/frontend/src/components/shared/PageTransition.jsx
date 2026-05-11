/**
 * PageTransition — 2026 Smooth Page Transition Wrapper
 * Eliminates the jarring white flash between route changes.
 * Wrap any page content with this for seamless fade/slide transitions.
 */
import { motion } from 'framer-motion';

const variants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const transition = {
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
