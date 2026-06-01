"use client";

/* ============================================================
   BRUTALIST — Hero
   Mouse-reactive blob · parallax depth · letter stagger · cursor-tilt fig
============================================================ */

import { useEffect, useRef, useState } from "react";
import { clamp, lerp, useReduced, useCoarsePointer, useScrollY } from "./lib";
import { LiveTime } from "./hooks";
import { CodeReveal } from "./motion";
import { EdgeGlobe } from "./webgl";

export function Hero() {
  const ref = useRef(null);
  const figRef = useRef(null);
  const blobRef = useRef(null);
  const reduced = useReduced();
  const coarse = useCoarsePointer();
  const y = useScrollY();
  const [mounted, setMounted] = useState(false);
  const [globeStats, setGlobeStats] = useState({ pops: 28, arcs: 0, route: ['DEL', 'SFO'], tilt: 0, ts: 0 });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ref.current && mounted) ref.current.classList.add('is-in');
  }, [mounted]);

  // Mouse-driven elements (blob + fig) run on rAF for smoothness
  useEffect(() => {
    if (coarse || reduced) return;
    let mx = window.innerWidth / 2,my = window.innerHeight / 2;
    let bx = mx,by = my,fr = 0;
    let raf;
    const onMove = (e) => {mx = e.clientX;my = e.clientY;};
    const tick = () => {
      bx = lerp(bx, mx, 0.085);
      by = lerp(by, my, 0.085);
      if (blobRef.current) blobRef.current.style.transform = `translate3d(${bx - 360}px, ${by - 360}px, 0)`;
      if (figRef.current) {
        const r = figRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mx - cx,dy = my - cy;
        const targetRot = clamp(Math.atan2(dy, dx) * (180 / Math.PI) * 0.06, -8, 8);
        fr = lerp(fr, targetRot, 0.08);
        figRef.current.style.transform = `rotate(${fr.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {window.removeEventListener('mousemove', onMove);cancelAnimationFrame(raf);};
  }, [coarse, reduced]);

  // Scroll parallax — content drifts up, ghost/dots drift down
  const py = reduced ? 0 : y;
  const ghostY = py * 0.20;
  const dotsY = py * 0.05;
  const fgY = py * 0.30;
  const fgOp = clamp(1 - py / 720, 0, 1);

  return (
    <section id="hero" className="hero" ref={ref}>
      {/* Mouse-reactive red glow */}
      <div ref={blobRef} className="hero-blob" />

      {/* Dot grid */}
      <div className="hero-dots dotgrid" style={{ transform: `translate3d(0, ${dotsY}px, 0)` }} />

      {/* Background ghost numeral */}
      <div className="hero-ghost font-display" style={{ transform: `translate3d(0, ${ghostY}px, 0)` }} aria-hidden="true">NR</div>

      {/* MEGA word drifting horizontally behind everything */}
      <div className="hero-mega" aria-hidden="true">
        <div className="hero-mega-track" style={{ transform: `translate3d(${-py * 0.6}px, 0, 0)` }}>
          <span className="hero-mega-word font-display">BACKEND</span>
          <span className="hero-mega-sep">●</span>
          <span className="hero-mega-word font-display">EDGE</span>
          <span className="hero-mega-sep">●</span>
          <span className="hero-mega-word font-display">AI</span>
          <span className="hero-mega-sep">●</span>
          <span className="hero-mega-word font-display">SCALE</span>
          <span className="hero-mega-sep">●</span>
          <span className="hero-mega-word font-display">BACKEND</span>
          <span className="hero-mega-sep">●</span>
          <span className="hero-mega-word font-display">EDGE</span>
          <span className="hero-mega-sep">●</span>
        </div>
      </div>

      {/* WebGL edge globe (Three.js) — wireframe globe + pulsing POPs + arc connections */}
      <EdgeGlobe onStats={setGlobeStats} />

      {/* Vertical accent line */}
      <div className="hero-line" />

      {/* Live readout (replaces the static FIG.01 box) */}
      <div ref={figRef} className="hero-readout" aria-live="polite">
        <div className="hero-readout-head">
          <span className="hero-readout-mark">
            <span className="hero-readout-dot" />
            <span>LIVE</span>
          </span>
          <span className="hero-readout-title">EDGE NETWORK</span>
          <span className="hero-readout-id">SYS-01</span>
        </div>
        <div className="hero-readout-grid">
          <div className="hero-readout-cell">
            <span className="hero-readout-k">PoPs</span>
            <span className="hero-readout-v">
              <span className="hero-readout-n">{globeStats.pops}</span>
              <span className="hero-readout-u">online</span>
            </span>
          </div>
          <div className="hero-readout-cell">
            <span className="hero-readout-k">arcs</span>
            <span className="hero-readout-v">
              <span className="hero-readout-n hero-readout-acc">{String(globeStats.arcs).padStart(2, '0')}</span>
              <span className="hero-readout-u">/5</span>
            </span>
          </div>
          <div className="hero-readout-cell hero-readout-cell-wide">
            <span className="hero-readout-k">route</span>
            <span className="hero-readout-v hero-readout-route">
              <span className="hero-readout-pop">{globeStats.route[0]}</span>
              <span className="hero-readout-arr">→</span>
              <span className="hero-readout-pop hero-readout-acc">{globeStats.route[1]}</span>
            </span>
          </div>
          <div className="hero-readout-cell">
            <span className="hero-readout-k">θ</span>
            <span className="hero-readout-v">
              <span className="hero-readout-n">{(((globeStats.tilt % 360) + 360) % 360).toFixed(0)}°</span>
            </span>
          </div>
          <div className="hero-readout-cell">
            <span className="hero-readout-k">uptime</span>
            <span className="hero-readout-v">
              <span className="hero-readout-n">{(globeStats.ts / 1000).toFixed(1)}<span className="hero-readout-u">s</span></span>
            </span>
          </div>
        </div>
        <div className="hero-readout-bar" aria-hidden="true">
          <span className="hero-readout-bar-fill" style={{ width: `${(globeStats.arcs / 5) * 100}%` }} />
        </div>
      </div>

      {/* Foreground */}
      <div className="hero-content" style={{ transform: `translate3d(0, ${-fgY}px, 0)`, opacity: fgOp }}>
        <div className="hero-top">
          <div className="eyebrow">
            <span className="dot"></span>
            <span className="red">[&nbsp;SOFTWARE&nbsp;ENGINEER&nbsp;]</span>
          </div>
          <div className="eyebrow">
            <span className="dim">SYSTEM.ONLINE</span>
            <span className="dim" style={{ margin: '0 8px' }}>·</span>
            <span className="dim">LDH/IN</span>
            <span className="dim" style={{ margin: '0 8px' }}>·</span>
            <span><LiveTime /></span>
          </div>
        </div>

        <div className="hero-display">
          <h1 className="hero-h1">
            <span className="line">
              <CodeReveal text="NISHIT" delay={160} perChar={95} hexHold={260} inView={mounted} />
            </span>
            <span className="line line-2">
              <CodeReveal text="RANA" delay={760} perChar={95} hexHold={260} inView={mounted} />
              <span className={`mask ${mounted ? 'is-in' : ''}`}>
                <span className="m-inner period" style={{ transitionDelay: '1380ms' }}>.</span>
              </span>
            </span>
          </h1>

          <p className={`hero-tag fade-up ${mounted ? 'is-in' : ''}`} style={{ transitionDelay: '1100ms' }}>
            Backend engineer. I make services that respond before<br />
            you finish reading the URL — and only wake me up when they
            <br />actually mean it.
          </p>

          <div className={`hero-actions fade-up ${mounted ? 'is-in' : ''}`} style={{ transitionDelay: '1000ms' }}>
            <a href="mailto:nrana4148@gmail.com" data-cursor="link" className="hero-btn hero-btn-primary">
              <span>GET IN TOUCH</span>
            </a>
            <a href="/resume.pdf" download="Nishit_Rana_Resume.pdf" data-cursor="link" className="hero-btn">
              <span>↓ RESUME</span>
            </a>
            <a href="https://github.com/nrana-pixel" target="_blank" rel="noopener noreferrer" data-cursor="link" className="hero-btn">
              <span>GITHUB ↗</span>
            </a>
          </div>
        </div>

        <div className="hero-foot">
          <div className="hero-status">
            <div className="hero-status-row">
              <span className="lbl">LAT/LON</span>
              <span className="val">30.901° N · 75.857° E</span>
            </div>
            <div className="hero-status-row">
              <span className="lbl">REF</span>
              <span className="val">NR—2026 / PORTFOLIO.V3</span>
            </div>
            <div className="hero-status-row">
              <span className="lbl">STATUS</span>
              <span className="val red"><span className="dot" style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--red)', marginRight: 8, verticalAlign: 'middle', animation: 'blink 1.6s steps(2,start) infinite' }}></span>OPEN TO WORK</span>
            </div>
          </div>

          <a href="#experience" data-cursor="link" className="hero-scroll">
            <span>SCROLL</span>
            <span className="arr" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>);

}
