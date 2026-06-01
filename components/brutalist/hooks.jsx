"use client";

/* ============================================================
   BRUTALIST — extra hooks (use with lib.jsx primitives)
============================================================ */

import { useEffect, useRef, useState } from "react";
import { lerp, useInView } from "./lib";

/* ---- Global mouse position, rAF-smoothed via lerp ---- */
export function useMouseGlobal(lerpAmt = 0.12) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let x = tx, y = ty, raf;
    const onMove = (e) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x = lerp(x, tx, lerpAmt); y = lerp(y, ty, lerpAmt);
      setPos({ x, y });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [lerpAmt]);
  return pos;
}

/* ---- Scroll velocity in px/frame, smoothed ---- */
export function useScrollVelocity() {
  const v = useRef(0);
  const [val, setVal] = useState(0);
  useEffect(() => {
    let last = window.scrollY, raf;
    const tick = () => {
      const cur = window.scrollY;
      const inst = cur - last; last = cur;
      v.current = lerp(v.current, inst, 0.18);
      setVal(v.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return val;
}

/* ---- Counter that animates 0→target on view ---- */
export function Counter({ target, suffix = '', duration = 1400, decimals }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      setV(target * e);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target, duration]);
  const isFloat = decimals != null || (target % 1 !== 0);
  return <span ref={ref}>{isFloat ? v.toFixed(decimals ?? 1) : Math.round(v)}{suffix}</span>;
}

/* ---- Pin-aware progress (0 before pin, 0..1 during, 1 after) ---- */
export function usePinProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0, ticking = false;
    const compute = () => {
      const el = ref.current; if (!el) { ticking = false; return; }
      const r = el.getBoundingClientRect();
      const dwell = el.offsetHeight - window.innerHeight;
      if (dwell <= 0)         setP(0);
      else if (r.top >= 0)    setP(0);
      else if (r.top <= -dwell) setP(1);
      else                    setP(-r.top / dwell);
      ticking = false;
    };
    const fn = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(compute);
    };
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    window.addEventListener('resize', fn);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', fn);
      window.removeEventListener('resize', fn);
    };
  }, [ref]);
  return p;
}

/* ---- LiveTime ---- */
export function LiveTime() {
  const [t, setT] = useState('');
  useEffect(() => {
    const upd = () => setT(new Date().toLocaleTimeString('en-GB', { hour12: false, timeZone: 'Asia/Kolkata' }));
    upd();
    const id = setInterval(upd, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{t || '--:--:--'}</span>;
}
