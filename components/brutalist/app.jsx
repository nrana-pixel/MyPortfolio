"use client";

/* ============================================================
   BRUTALIST — App + render + Lenis ↔ GSAP bridge
   + BlueprintGrid + BootSequence + Currently
============================================================ */

import { useEffect, useRef, useState } from "react";
import { useReduced } from "./lib";
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
    // Play the loading-terminal intro on every page open (single-page site,
    // so there's no internal navigation to skip it for). Honour reduced motion.
    if (reduced) { setPhase('done'); return; }

    setPhase('typing');
    const timers = [];
    let idx = 0;
    let charIdx = 0;

    const typeNext = () => {
      if (idx >= BOOT_SEQ.length) {
        timers.push(setTimeout(() => setPhase('fading'), 320));
        timers.push(setTimeout(() => setPhase('done'), 950));
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
