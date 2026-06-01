"use client";

/* ============================================================
   BRUTALIST — App + render + Lenis ↔ GSAP bridge
   + inline DataStream + BlueprintGrid + BootSequence + Currently
============================================================ */

import { useEffect, useRef, useState } from "react";
import { useReduced, useCoarsePointer } from "./lib";
import { LiveTime } from "./hooks";
import { bootGsapLenis } from "./motion";
import { CrosshairCursor, Nav } from "./chrome";
import { PageTransition } from "./transition";
import { SoundToggle } from "./sound";
import { KineticHeadings } from "./kinetic";
import { Chapter } from "./chapter";
import { Hero } from "./hero";
import { Marquee, Experience, Skills } from "./mid";
import { Manifesto } from "./manifesto";
import { ArchSection } from "./arch";
import { GitHubStatus } from "./status";
import { Projects, EduAchievements, CTA, Footer } from "./work";

/* ---- DataStream: canvas nodes+edges, mouse-reactive ---- */
function DataStream() {
  const canvasRef = useRef(null);
  const reduced = useReduced();
  const coarse = useCoarsePointer();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    const target = Math.min(80, Math.max(36, Math.floor((w * h) / 22000)));
    const nodes = [];
    for (let i = 0; i < target; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() < 0.18 ? 1.6 : 1.0,
        isRed: Math.random() < 0.12,
      });
    }

    let mx = w / 2, my = h / 2;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    if (!coarse) window.addEventListener('mousemove', onMove);

    let raf;
    let lastT = 0;
    const tick = (now) => {
      if (now - lastT < 28) { raf = requestAnimationFrame(tick); return; }
      lastT = now;
      ctx.clearRect(0, 0, w, h);

      // physics + node render
      for (const n of nodes) {
        const dx = mx - n.x, dy = my - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 230 * 230) {
          const d = Math.sqrt(d2) || 1;
          const pull = (1 - d / 230) * 0.05;
          n.vx += (dx / d) * pull;
          n.vy += (dy / d) * pull;
        }
        n.vx *= 0.965;
        n.vy *= 0.965;
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;

        const md = Math.hypot(mx - n.x, my - n.y);
        const near = md < 200;
        if (near) {
          const k = 1 - md / 200;
          ctx.fillStyle = `rgba(255, ${(1 - k) * 200 | 0}, ${(1 - k) * 200 | 0}, ${0.35 + k * 0.5})`;
        } else {
          ctx.fillStyle = n.isRed ? 'rgba(255,0,0,0.55)' : 'rgba(245,245,245,0.42)';
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // edges
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const d = Math.sqrt(d2);
            const op = (1 - d / 140) * 0.13;
            const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
            const md = Math.hypot(mx - midX, my - midY);
            if (md < 170) {
              const k = 1 - md / 170;
              ctx.strokeStyle = `rgba(255, ${(1 - k) * 180 | 0}, ${(1 - k) * 180 | 0}, ${op + k * 0.22})`;
            } else {
              ctx.strokeStyle = `rgba(245, 245, 245, ${op})`;
            }
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(tick); }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      if (!coarse) window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced, coarse]);

  return <canvas ref={canvasRef} className="datastream" aria-hidden="true" />;
}

/* ---- BlueprintGrid: pure-CSS faint blueprint overlay ---- */
function BlueprintGrid() {
  return <div className="blueprint" aria-hidden="true" />;
}

/* ---- BootSequence: terminal-style init overlay (once per session) ---- */
const BOOT_SEQ = [
  ['$ portfolio.init --user=nishit',                  10, 'cmd'],
  ['  → loading fonts ........................... ', 5,  ''],
  ['  → booting WebGL context ................... ', 5,  ''],
  ['  → opening edge connections (cf-workers) ... ', 5,  ''],
  ['  → fetching projects (3) ................... ', 5,  ''],
  ['  → warming KV cache ........................ ', 5,  ''],
  ['  → all systems nominal.',                          8,  ''],
  ['  → ready.',                                        14, 'final'],
];

function BootSequence() {
  const [phase, setPhase] = useState('init'); // 'init' | 'typing' | 'fading' | 'done'
  const [lines, setLines] = useState([]); // [{ text, kind, ok }]
  const [active, setActive] = useState(null); // { text, kind, idx }
  const reduced = useReduced();

  useEffect(() => {
    // Play the loading-terminal intro once when the site is first opened in a
    // session — NOT on internal navigation (e.g. returning home from agxp).
    try {
      if (sessionStorage.getItem('nr-boot-seen') === '1') { setPhase('done'); return; }
    } catch (e) {}
    if (reduced) { setPhase('done'); return; }

    setPhase('typing');
    const timers = [];
    let idx = 0;
    let charIdx = 0;

    const typeNext = () => {
      if (idx >= BOOT_SEQ.length) {
        timers.push(setTimeout(() => setPhase('fading'), 320));
        timers.push(setTimeout(() => {
          setPhase('done');
          try { sessionStorage.setItem('nr-boot-seen', '1'); } catch (e) {}
        }, 950));
        return;
      }
      const [line, speed, kind] = BOOT_SEQ[idx];
      if (charIdx < line.length) {
        setActive({ text: line.slice(0, charIdx + 1), kind, idx });
        charIdx++;
        timers.push(setTimeout(typeNext, speed));
      } else {
        // commit the line; if it's a checkmark line (ends with "... "), append " ok"
        const ok = /\.\.\.\s*$/.test(line);
        setLines((p) => [...p, { text: line, kind, ok }]);
        setActive(null);
        idx++; charIdx = 0;
        timers.push(setTimeout(typeNext, ok ? 110 : 90));
      }
    };

    timers.push(setTimeout(typeNext, 120));

    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  if (phase === 'done') return null;

  const totalLines = BOOT_SEQ.length;
  const pct = Math.min(100, Math.round((lines.length / totalLines) * 100));

  return (
    <div className={`boot phase-${phase}`} aria-hidden="true">
      <div className="boot-panel">
        <div className="boot-head">
          <span className="boot-dot" />
          <span className="boot-dot" />
          <span className="boot-dot" />
          <span className="boot-title">~/nishit-rana — zsh</span>
          <span className="boot-pct">{String(pct).padStart(3, '0')}%</span>
        </div>
        <div className="boot-body">
          {lines.map((l, i) => (
            <div key={i} className={`boot-line ${l.kind === 'cmd' ? 'is-cmd' : ''}`}>
              {l.text}{l.ok && <span className="ok">ok</span>}
            </div>
          ))}
          {active && (
            <div className={`boot-line is-active ${active.kind === 'cmd' ? 'is-cmd' : ''}`}>
              {active.text}<span className="boot-caret">▍</span>
            </div>
          )}
        </div>
        <div className="boot-progress" aria-hidden="true">
          <span className="boot-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Currently() {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('currently-dismissed') === '1') {
        setDismissed(true);
        return;
      }
    } catch (e) {}
    const t = setTimeout(() => setMounted(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setMounted(false);
    setTimeout(() => setDismissed(true), 700);
    try { sessionStorage.setItem('currently-dismissed', '1'); } catch (e) {}
  };

  if (dismissed) return null;

  return (
    <aside
      ref={ref}
      className={`currently ${mounted ? 'is-in' : ''}`}
      aria-label="What I'm currently working on"
      data-cursor="link"
    >
      <button className="currently-close" onClick={dismiss} aria-label="Dismiss" data-cursor="link">×</button>
      <div className="currently-head">
        <span className="red"><span className="dot" />NOW</span>
        <span><LiveTime /></span>
      </div>
      <div className="currently-row">
        <span className="k">building</span>
        <span className="v">Learning Go (golang)</span>
      </div>
      <div className="currently-row">
        <span className="k">reading</span>
        <span className="v">The Go Programming Language</span>
      </div>
      <div className="currently-row">
        <span className="k">mood</span>
        <span className="v red">filter coffee, no. 3</span>
      </div>
    </aside>
  );
}

export default function App() {
  useEffect(() => {
    if (typeof window.Lenis !== 'function') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.1,
      smoothWheel: true,
    });
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Prefer GSAP ticker if GSAP is available — drives both Lenis + ScrollTrigger
    let cleanupTicker;
    if (window.gsap && window.ScrollTrigger) {
      cleanupTicker = bootGsapLenis(lenis);
    }
    if (!cleanupTicker) {
      // Fallback rAF loop
      let raf;
      const loop = (time) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      cleanupTicker = () => cancelAnimationFrame(raf);
    }

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.3 });
    };
    document.addEventListener('click', onClick);

    // After things settle, refresh ScrollTrigger so pins know their final dimensions
    const r1 = setTimeout(() => window.ScrollTrigger?.refresh(), 250);
    const r2 = setTimeout(() => window.ScrollTrigger?.refresh(), 1200);

    return () => {
      clearTimeout(r1); clearTimeout(r2);
      cleanupTicker && cleanupTicker();
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      <BootSequence />
      <PageTransition />
      <BlueprintGrid />
      <div className="grain" aria-hidden="true" />
      <CrosshairCursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Chapter no="01" label="WHAT I DO" sub="MANIFESTO" />
        <Manifesto />
        <Chapter no="02" label="THE DAY JOB" sub="EXPERIENCE · 2024 → NOW" />
        <Experience />
        <Chapter no="03" label="STACK" sub="WHAT I REACH FOR FIRST" />
        <Skills />
        <Chapter no="04" label="CASE STUDY" sub="AGXP · ANATOMY OF ONE REQUEST" />
        <ArchSection />
        <Chapter no="05" label="GITHUB" sub="LIVE FROM GITHUB.COM" />
        <GitHubStatus />
        <Chapter no="06" label="SELECTED WORK" sub="THREE THINGS I'VE SHIPPED" />
        <Projects />
        <Chapter no="07" label="THE PAPER TRAIL" sub="EDUCATION · ACHIEVEMENTS" />
        <EduAchievements />
        <CTA />
      </main>
      <Currently />
      <SoundToggle />
      <KineticHeadings />
      <Footer />
    </>
  );
}
