"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "motion/react";

export function Navbar() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#FF0000] z-[60] origin-left"
        style={{ scaleX }}
      />
      <nav className="fixed top-0 w-full z-50 mix-blend-difference border-b-[1px] border-white/20 text-[#F5F5F5] font-mono text-xs md:text-sm uppercase tracking-[0.2em] px-6 py-4 flex justify-between items-center backdrop-blur-md">
      <Link href="/" className="font-display text-[2rem] tracking-widest hover:text-[#FF0000] transition-colors leading-none">
        NISHIT RANA
      </Link>
      <div className="hidden md:flex gap-12">
        <Link href="#experience" className="draw-underline">Experience</Link>
        <Link href="#projects" className="draw-underline">Projects</Link>
        <Link href="#skills" className="draw-underline">Skills</Link>
        <Link href="#education" className="draw-underline">Education</Link>
      </div>
      <Link href="mailto:nrana4148@gmail.com" className="border-[1px] border-[#F5F5F5] px-6 py-2 hover:bg-[#F5F5F5] hover:text-[#0A0A0A] transition-colors font-bold tracking-widest text-[#F5F5F5]">
        CONTACT ME
      </Link>
    </nav>
    </>
  );
}
