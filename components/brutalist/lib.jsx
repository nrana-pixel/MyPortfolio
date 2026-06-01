"use client";

/* ============================================================
   Shared hooks + primitives
   - useReduced            — prefers-reduced-motion gate
   - useScrollY            — rAF-tracked window.scrollY
   - useScrollProgress     — element-relative scroll progress 0..1
   - useInView             — IntersectionObserver "fired once"
   - useMagnetic           — magnetic-button pull around element center
   - Split                 — split-text into per-word/char reveal masks
   - EASE / cubic          — easing tokens + tween helper
   - lerp / clamp / mapRange
============================================================ */

import { useEffect, useRef, useState, useMemo } from "react";

export const EASE = {
  out:    [0.22, 1, 0.36, 1],     // signature
  snap:   [0.32, 0.72, 0, 1],
  inOut:  [0.65, 0, 0.35, 1],
};

export function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
export function lerp(a, b, t)      { return a + (b - a) * t; }
export function mapRange(v, a, b, c, d) {
  const t = clamp((v - a) / (b - a), 0, 1);
  return c + (d - c) * t;
}

export function useReduced() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return coarse;
}

/* rAF-tracked scroll position, shared via a single listener */
const __scrollSubs = new Set();
let __scrollTicking = false;
function __onScroll() {
  if (__scrollTicking) return;
  __scrollTicking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY || window.pageYOffset;
    __scrollSubs.forEach(fn => fn(y));
    __scrollTicking = false;
  });
}
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', __onScroll, { passive: true });
}

export function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = (yy) => setY(yy);
    __scrollSubs.add(fn);
    fn(window.scrollY || 0);
    return () => { __scrollSubs.delete(fn); };
  }, []);
  return y;
}

/* progress 0..1 of element traveling through viewport
   start/end are relative to: 0 = element top hits viewport bottom; 1 = element bottom hits viewport top */
export function useScrollProgress(ref, opts = {}) {
  const { start = 0, end = 1 } = opts;
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh;
      const passed = vh - r.top;
      const raw = clamp(passed / total, 0, 1);
      setP(mapRange(raw, start, end, 0, 1));
    };
    const fn = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    __scrollSubs.add(fn); update();
    window.addEventListener('resize', fn);
    return () => { __scrollSubs.delete(fn); window.removeEventListener('resize', fn); cancelAnimationFrame(raf); };
  }, [ref, start, end]);
  return p;
}

/* Fires once when element enters viewport */
export function useInView(ref, opts = {}) {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.15, once = true } = opts;
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setSeen(true);
          if (once) io.disconnect();
        } else if (!once) {
          setSeen(false);
        }
      });
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return seen;
}

/* Magnetic pull — mouse inside element bounds adds easing translate */
export function useMagnetic(ref, strength = 0.35, max = 18) {
  const coarse = useCoarsePointer();
  const reduced = useReduced();
  useEffect(() => {
    if (coarse || reduced) return;
    const el = ref.current; if (!el) return;
    let raf, tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      tx = clamp(mx * strength, -max, max);
      ty = clamp(my * strength, -max, max);
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const tick = () => {
      x = lerp(x, tx, 0.16);
      y = lerp(y, ty, 0.16);
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [ref, strength, max, coarse, reduced]);
}

/* Cursor-aware tilt — returns ref + style to attach */
export function useTilt(maxDeg = 6) {
  const ref = useRef(null);
  const coarse = useCoarsePointer();
  const reduced = useReduced();
  useEffect(() => {
    if (coarse || reduced) return;
    const el = ref.current; if (!el) return;
    let raf, rx = 0, ry = 0, trx = 0, tryy = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tryy = px *  maxDeg * 2;   // rotateY
      trx  = -py * maxDeg * 2;   // rotateX
    };
    const onLeave = () => { trx = 0; tryy = 0; };
    const tick = () => {
      rx = lerp(rx, trx, 0.12);
      ry = lerp(ry, tryy, 0.12);
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [maxDeg, coarse, reduced]);
  return ref;
}

/* Split text into per-word reveal-masked spans (chars on demand) */
export function Split({ text, by = 'word', el = 'span', delay = 0, stagger = 40, inView, className = '', style }) {
  const Tag = el;
  const units = useMemo(() => {
    if (by === 'char') return Array.from(text);
    // split words, preserving spaces
    return text.split(/(\s+)/);
  }, [text, by]);
  return (
    <Tag className={className} style={style} aria-label={text}>
      {units.map((u, i) => {
        if (/^\s+$/.test(u)) return <span key={i}>{u}</span>;
        return (
          <span key={i} className={`mask ${inView ? 'is-in' : ''}`}>
            <span
              className="m-inner"
              style={{ transitionDelay: `${delay + i * stagger}ms` }}
            >{u}</span>
          </span>
        );
      })}
    </Tag>
  );
}

/* Reveal wrapper — block fade-up with optional stagger */
export function Reveal({ as = 'div', delay = 0, children, className = '', style, ...rest }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`fade-up ${seen ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >{children}</Tag>
  );
}
