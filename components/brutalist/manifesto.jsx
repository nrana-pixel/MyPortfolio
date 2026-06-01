"use client";

/* ============================================================
   manifesto.jsx — Sticky "what I believe about backend" pause
   - Scroll-scrubbed word-by-word reveal
   - Cinematic display type, Bebas + italic mix
   - One held beat at full reveal before unlocking
============================================================ */

import { useEffect, useRef, useState } from "react";
import { clamp } from "./lib";

// Each "word" can carry a kind: '' (neutral), 'em' (red), 'it' (italic), 'br' (line break)
const MANIFESTO = [
  { t: 'I',        k: '' },
  { t: 'make',     k: 'it' },
  { t: 'services', k: '' },
  { t: 'that',     k: '' },
  { t: 'respond',  k: 'em' },
  { t: 'before',   k: '' },
  { t: 'you',      k: '' },
  { t: 'finish',   k: 'it' },
  { t: 'reading',  k: '' },
  { t: 'the',      k: '' },
  { t: 'URL.',     k: 'em' },
  { t: '',         k: 'br' },
  { t: 'Origin',   k: '' },
  { t: 'sleeps,',  k: 'it' },
  { t: 'users',    k: '' },
  { t: "don't",    k: '' },
  { t: 'notice.',  k: 'em' },
];

export function Manifesto() {
  const ref = useRef(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger || !ref.current) return;
    const gsap = window.gsap;
    const ctx = gsap.context(() => {
      window.ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => setP(self.progress),
      });
    }, ref);
    const t = setTimeout(() => window.ScrollTrigger?.refresh(), 200);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  // Reveal words across the first 70% of scroll, then hold
  const visible = MANIFESTO.filter(w => w.k !== 'br').length;
  const revealEnd = 0.7;
  const eased = clamp(p / revealEnd, 0, 1);
  const easedOut = 1 - Math.pow(1 - eased, 2);

  // Compute per-word opacity & translate. Each word gets a small "window" of progress.
  let visibleIdx = 0;
  const wordOp = (k) => {
    if (k === 'br') return 1;
    const start = visibleIdx / visible;
    const end   = (visibleIdx + 1) / visible;
    visibleIdx++;
    if (easedOut <= start) return 0;
    if (easedOut >= end)   return 1;
    return (easedOut - start) / (end - start);
  };

  // Camera drift — subtle vertical movement as text reveals
  const camY = (1 - eased) * 40 - 10;

  return (
    <section className="manifesto" ref={ref} id="manifesto">
      <div className="manifesto-pin">
        {/* Background ghost rule */}
        <div className="manifesto-ghost" aria-hidden="true">
          <span className="manifesto-ghost-text">MANIFESTO</span>
        </div>

        {/* Eyebrow + chapter mark */}
        <div className="manifesto-head">
          <div className="eyebrow"><span className="red">// MANIFESTO</span></div>
          <div className="manifesto-counter mono-s">
            <span style={{color:'var(--fg)'}}>{String(Math.min(visible, Math.floor(easedOut * visible))).padStart(2,'0')}</span>
            <span style={{color:'var(--fg-4)'}}> / {String(visible).padStart(2,'0')}</span>
          </div>
        </div>

        {/* The statement */}
        <div className="manifesto-body" style={{ transform: `translate3d(0, ${camY}px, 0)` }}>
          <p className="manifesto-text">
            {(() => {
              visibleIdx = 0;
              return MANIFESTO.map((w, i) => {
                if (w.k === 'br') return <br key={i} />;
                const op = wordOp(w.k);
                const ty = (1 - op) * 32;
                const cls = `mw mw-${w.k || 'n'}`;
                return (
                  <span
                    key={i}
                    className={cls}
                    style={{
                      opacity: op,
                      transform: `translate3d(0, ${ty.toFixed(2)}px, 0)`,
                    }}
                  >{w.t}{' '}</span>
                );
              });
            })()}
          </p>
        </div>

        {/* Foot */}
        <div className="manifesto-foot">
          <span className="mono-s" style={{color:'var(--fg-3)'}}>That&apos;s the job.</span>
          <div className="manifesto-bar" aria-hidden="true">
            <span className="manifesto-bar-fill" style={{ width: `${(eased * 100).toFixed(1)}%` }} />
          </div>
          <span className="mono-s" style={{color:'var(--fg-3)'}}>{(eased * 100).toFixed(0)}%</span>
        </div>
      </div>
    </section>
  );
}
