"use client";

/* ============================================================
   kinetic.jsx — scroll-velocity reactive headline
   Bebas has no weight axis, so we fake "kinetic weight" by
   scaling letter-spacing + scaleY + skew based on scroll speed.
============================================================ */

import { useEffect, useRef } from "react";
import { clamp, lerp, useReduced } from "./lib";

export function KineticText({ text, className = '', style }) {
  const ref = useRef(null);
  const reduced = useReduced();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current; if (!el) return;
    let raf, last = window.scrollY, vel = 0, cur = 0;
    const tick = () => {
      const now = window.scrollY;
      const inst = now - last; last = now;
      vel = lerp(vel, inst, 0.2);
      cur = lerp(cur, clamp(Math.abs(vel) / 40, 0, 1), 0.12);
      // stretch vertically + open tracking when scrolling fast
      const sy = 1 + cur * 0.16;
      const track = cur * 0.06;
      const skew = clamp(vel * 0.06, -4, 4) * cur;
      el.style.transform = `scaleY(${sy.toFixed(3)}) skewX(${skew.toFixed(2)}deg)`;
      el.style.letterSpacing = `${track.toFixed(3)}em`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <span ref={ref} className={`kinetic ${className}`} style={{ display: 'inline-block', transformOrigin: 'left bottom', willChange: 'transform', ...style }}>
      {text}
    </span>
  );
}

/* ============================================================
   KineticHeadings — global: every .d-section heading stretches
   vertically + opens tracking with scroll velocity. One listener,
   applied to the parent <h2> (safe — reveal transforms live on
   the inner spans, not the parent).
============================================================ */
export function KineticHeadings() {
  const reduced = useReduced();
  useEffect(() => {
    if (reduced) return;
    const els = Array.from(document.querySelectorAll('.d-section, .cta-h1'));
    if (!els.length) return;
    els.forEach(el => {
      el.style.transformOrigin = 'left bottom';
      el.style.willChange = 'transform';
    });
    let raf, last = window.scrollY, vel = 0, cur = 0;
    const tick = () => {
      const now = window.scrollY;
      const inst = now - last; last = now;
      vel = lerp(vel, inst, 0.2);
      cur = lerp(cur, clamp(Math.abs(vel) / 46, 0, 1), 0.1);
      const sy = 1 + cur * 0.12;
      const skew = clamp(vel * 0.05, -3.5, 3.5) * cur;
      const vh = window.innerHeight;
      for (const el of els) {
        // only transform headings near the viewport (perf)
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        el.style.transform = `scaleY(${sy.toFixed(3)}) skewX(${skew.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  return null;
}
