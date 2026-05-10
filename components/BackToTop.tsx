"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[100] border-[1px] border-white/20 bg-[#0A0A0A]/80 text-[#F5F5F5] w-12 h-12 flex items-center justify-center hover:border-[#FF0000] transition-colors cursor-crosshair group backdrop-blur-md"
          aria-label="Back to Top"
        >
           <span className="font-mono text-[10px] tracking-[0.2em] uppercase -rotate-90 block glitch-hover flex-shrink-0">
             TOP
           </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
