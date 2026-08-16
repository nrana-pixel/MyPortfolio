"use client";

/*
  Gridline Velocity design system: Motion handles scroll-linked geometry while
  anime.js sequences small telemetry signals. Both are deliberately additive
  to the established GSAP/Lenis choreography and respect reduced motion.
*/

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { motion, useScroll, useSpring } from "motion/react";
import { useReduced } from "./lib";

export function ScrollTelemetry() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 155, damping: 28, mass: 0.22 });

  return (
    <div className="scroll-telemetry" aria-hidden="true">
      <motion.div className="scroll-telemetry-fill" style={{ scaleX }} />
      <span className="scroll-telemetry-label">RUN//LIVE</span>
    </div>
  );
}

export function HeroTelemetry() {
  const ref = useRef(null);
  const reduced = useReduced();

  useEffect(() => {
    if (reduced || !ref.current) return undefined;

    const bars = ref.current.querySelectorAll(".hero-signal-bar");
    const playSequence = () => {
      animate(bars, {
        scaleX: [0.18, 1],
        opacity: [0.24, 1],
        delay: stagger(70, { from: "center" }),
        duration: 780,
        ease: "out(4)",
      });
    };

    playSequence();
    const interval = window.setInterval(playSequence, 5600);
    return () => window.clearInterval(interval);
  }, [reduced]);

  return (
    <>
      {!reduced && (
        <motion.div
          className="hero-scan-rail"
          aria-hidden="true"
          initial={{ opacity: 0, x: "-18%" }}
          animate={{ opacity: [0, 0.85, 0.85, 0], x: ["-18%", "116%"] }}
          transition={{ duration: 2.8, delay: 1.65, repeat: Infinity, repeatDelay: 6.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <div className="hero-signal" ref={ref} aria-hidden="true">
        <span className="hero-signal-caption">SIGNAL / 0.08</span>
        <div className="hero-signal-bars">
          {Array.from({ length: 8 }, (_, index) => <i key={index} className="hero-signal-bar" />)}
        </div>
      </div>
    </>
  );
}
