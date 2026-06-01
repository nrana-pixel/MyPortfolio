"use client";

/* ============================================================
   motion.jsx
   - Lenis <-> GSAP ScrollTrigger bridge (boots once)
   - ScrambleText component (decoding entrance)
   - useGSAPPin: pin a section + horizontal-scrub a track with snap
   - useClipReveal: clip-path reveal on viewport enter (scroll-scrubbed)
   - CodeReveal: backend-themed "compile" entrance
   gsap / ScrollTrigger are loaded as UMD globals (window.gsap, window.ScrollTrigger).
============================================================ */

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { useInView } from "./lib";

/* ---- Boot bridge once. App calls this after the React tree mounts. ---- */
let __gsapBooted = false;
export function bootGsapLenis(lenisInstance) {
  if (__gsapBooted) return null;
  if (!window.gsap || !window.ScrollTrigger || !lenisInstance) return null;
  __gsapBooted = true;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  // Don't recalc pins when the mobile browser URL bar shows/hides — avoids
  // pinned sections (manifesto, case study) jumping on scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Lenis tick -> ScrollTrigger update
  lenisInstance.on('scroll', ScrollTrigger.update);
  // ScrollTrigger uses transforms; make sure refresh doesn't double-init
  ScrollTrigger.defaults({ markers: false });

  // Drive Lenis from GSAP's ticker so they share a clock
  const rafHandler = (time) => lenisInstance.raf(time * 1000);
  gsap.ticker.add(rafHandler);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(rafHandler);
    ScrollTrigger.getAll().forEach(st => st.kill());
    __gsapBooted = false;
  };
}

/* ---- ScrambleText — characters cycle through gibberish, locking left-to-right ---- */
export function ScrambleText({ text, delay = 0, duration = 900, className, style, inView }) {
  const ref = useRef(null);
  const seenSelf = useInView(ref);
  const seen = (inView !== undefined) ? inView : seenSelf;
  const [out, setOut] = useState(() => text.replace(/[^\s]/g, '·'));

  useEffect(() => {
    if (!seen) return;
    const chars = '!<>-_\\/[]{}—=+*^?#$%&@▒░█▓';
    const len = text.length;
    const startAt = performance.now() + delay;
    const total = duration;
    let raf;

    const tick = (now) => {
      if (now < startAt) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min(1, (now - startAt) / total);
      // ease-out the locking front
      const e = 1 - Math.pow(1 - t, 2);
      const locked = Math.floor(len * e);
      let s = '';
      for (let i = 0; i < len; i++) {
        if (text[i] === ' ') s += ' ';
        else if (i < locked) s += text[i];
        else s += chars[Math.floor(Math.random() * chars.length)];
      }
      setOut(s);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setOut(text);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, text, delay, duration]);

  return <span ref={ref} className={className} style={style} aria-label={text}>{out}</span>;
}

/* ---- useGSAPPin — install a horizontal-scroll pinned trigger on a section ----
   sectionRef: outer section
   trackRef: the inner horizontal track to translate
   options: { count: number, snap?: boolean, gutter?: number }
   onProgress: callback(p) ; sets the progress bar in the section header
*/
export function useGSAPPin(sectionRef, trackRef, { count = 3, snap = true, gutter = 80, onProgress } = {}) {
  useLayoutEffect(() => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!sectionRef.current || !trackRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // On phones the horizontal scroll-trap is replaced by a vertical stack
    // (see the mobile rules in brutalist.css) — skip pinning entirely.
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    if (mobile) return;

    const ctx = gsap.context(() => {
      const getDistance = () => {
        const trackW = trackRef.current.scrollWidth;
        return Math.max(0, trackW - window.innerWidth + gutter);
      };

      const tween = gsap.to(trackRef.current, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${getDistance()}`,
          scrub: reduced ? false : 0.6,
          snap: snap && count > 1 ? { snapTo: 1 / (count - 1), duration: 0.6, ease: 'power2.inOut' } : false,
          invalidateOnRefresh: true,
          onUpdate: (self) => onProgress && onProgress(self.progress),
        },
      });

      return () => { tween.kill(); };
    }, sectionRef);

    // Force a refresh after fonts/layout settle
    const t1 = setTimeout(() => window.ScrollTrigger?.refresh(), 60);
    const t2 = setTimeout(() => window.ScrollTrigger?.refresh(), 400);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      ctx.revert();
    };
  }, [sectionRef, trackRef, count, snap, gutter, onProgress]);
}

/* ---- useClipReveal — animate clip-path on enter ---- */
export function useClipReveal(ref, opts = {}) {
  const { delay = 0, duration = 1.1, from = 'inset(0 100% 0 0)' } = opts;
  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger || !ref.current) return;
    const gsap = window.gsap;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current,
        { clipPath: from, webkitClipPath: from },
        {
          clipPath: 'inset(0 0% 0 0)',
          webkitClipPath: 'inset(0 0% 0 0)',
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
        });
    });
    return () => ctx.revert();
  }, [ref, delay, duration, from]);
}

/* ============================================================
   CodeReveal — backend-themed "compile" entrance.
   Each character first appears as its ASCII hex code in red mono,
   then resolves into the display glyph. Stagger left-to-right.
============================================================ */
export function CodeReveal({ text, delay = 0, perChar = 85, hexHold = 240, inView, className, style }) {
  const chars = useMemo(() => Array.from(text), [text]);
  // state per char: 0 = hidden, 1 = hex code visible, 2 = letter resolved
  const [states, setStates] = useState(() => chars.map(() => 0));

  useEffect(() => {
    if (!inView) { setStates(chars.map(() => 0)); return; }
    const timers = [];
    chars.forEach((c, i) => {
      if (c === ' ') return;
      const startAt = delay + i * perChar;
      timers.push(setTimeout(() => setStates(p => { const n = p.slice(); n[i] = 1; return n; }), startAt));
      timers.push(setTimeout(() => setStates(p => { const n = p.slice(); n[i] = 2; return n; }), startAt + hexHold));
    });
    return () => timers.forEach(clearTimeout);
  }, [inView, chars, delay, perChar, hexHold]);

  return (
    <span className={className} style={style} aria-label={text}>
      {chars.map((c, i) => {
        if (c === ' ') return <span key={i}>{' '}</span>;
        const s = states[i];
        const code = c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
        return (
          <span key={i} className={`cr cr--${s}`}>
            <span className="cr-letter" aria-hidden="true">{c}</span>
            <span className="cr-hex"    aria-hidden="true">0x{code}</span>
          </span>
        );
      })}
    </span>
  );
}
