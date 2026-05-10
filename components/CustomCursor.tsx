"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.cursor-crosshair') ||
        target.classList.contains('glitch-hover')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-6 h-6 border-[1px] border-[#FF0000] z-[10000] mix-blend-difference pointer-events-none flex items-center justify-center"
      animate={{
        x: mousePos.x - 12,
        y: mousePos.y - 12,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? "rgba(255,0,0,0.2)" : "transparent"
      }}
      transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
    >
      <div className="w-1 h-1 bg-[#FF0000]" />
    </motion.div>
  );
}
