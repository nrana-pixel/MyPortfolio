"use client";

/* ============================================================
   BRUTALIST — Projects (horizontal scroll trap) + Edu/Achievements
   + CTA + Footer
============================================================ */

import { useRef, useState } from "react";
import { useInView, useMagnetic, Reveal, Split } from "./lib";
import { Counter } from "./hooks";
import { useGSAPPin, useClipReveal } from "./motion";
import { SlotDistort } from "./webgl";

const PROJECTS = [
{
  no: '01',
  year: '2025',
  title: 'Cloudflare Edge',
  titleRed: 'Delivery Platform.',
  codename: 'AGXP',
  slotLabel: 'EDGE WORKER · KV VARIANT MAP',
  slotBg: 'AGXP',
  tech: 'Hono · CF Workers · D1 · KV · R2 · React · Vite · Vitest · AES-GCM',
  summary: 'Full-stack edge platform that deploys AI-optimized HTML variants on user-owned Cloudflare domains. Detects GPTBot, ClaudeBot, Perplexity at the edge and serves path-based KV variants — origin only sees real humans.',
  stats: [
  { n: 8, u: 'ms', l: 'detection p50' },
  { n: 3, u: '', l: 'bot families' },
  { n: 12, u: 'kB', l: 'worker bundle' }],

  href: 'https://github.com/nrana-pixel/agxp-cloudflare',
  cta: 'READ CASE STUDY →'
},
{
  no: '02',
  year: '2025',
  title: 'Product → UGC',
  titleRed: 'AI Video Pipeline.',
  codename: 'VEO/UGC',
  slotLabel: '9:16 REEL · 5 LOCALES',
  slotBg: 'VEO',
  tech: 'n8n · Vertex AI · Veo 3.0 · Gemini 2.5 · Cloudflare R2 · MongoDB · React',
  summary: 'End-to-end n8n pipeline. Webhook ingests a product image, Gemini Vision authors a UGC persona, three 8-second Veo 3.0 ads land in R2 — Hinglish, Punjabi, Tamil, Telugu, Marathi, each with region-specific dialogue.',
  stats: [
  { n: 3, u: '', l: 'variants per run' },
  { n: 5, u: '', l: 'locales · 9:16' },
  { n: 90, u: 's', l: 'avg generation' }],

  href: null,
  cta: 'CASE STUDY · SOON'
},
{
  no: '03',
  year: '2024',
  title: 'E-Commerce',
  titleRed: 'Backend.',
  codename: 'COMM',
  slotLabel: 'API · RBAC · JWT',
  slotBg: 'API',
  tech: 'Node.js · Express · MongoDB · JWT · bcrypt',
  summary: 'RESTful catalogue, cart, and order service with role-based access. Mongoose-modelled data, JWT middleware, the boring stuff done right.',
  stats: [
  { n: 18, u: '', l: 'endpoints' },
  { n: 3, u: '', l: 'roles · RBAC' },
  { n: 94, u: '%', l: 'test coverage' }],

  href: null,
  cta: 'WRITE-UP · SOON'
}];


export function Projects() {
  const ref = useRef(null);
  const trackRef = useRef(null);
  const [p, setP] = useState(0);

  useGSAPPin(ref, trackRef, {
    count: PROJECTS.length,
    snap: true,
    gutter: 80,
    onProgress: setP
  });

  const idx = Math.min(PROJECTS.length, Math.max(1, Math.ceil(p * PROJECTS.length) || 1));

  return (
    <section id="projects" className="work" ref={ref}>
      <div className="work-pin">
        <div className="work-head">
          <div className="work-head-l">
            <Reveal as="div" className="eyebrow"><span className="red">[ Things I&apos;ve shipped ]</span></Reveal>
            <h2 className="d-section">
              <Reveal as="span" style={{ display: 'block' }}>Selected</Reveal>
              <Reveal as="span" delay={120} style={{ display: 'block', color: 'var(--red)' }}>work.</Reveal>
            </h2>
            <Reveal as="p" delay={220} className="body-l" style={{ maxWidth: '52ch' }}>
              Three shipped systems. Scroll keeps moving — the gallery slides sideways while the page holds steady, then locks onto whichever one you stop at.
            </Reveal>
          </div>
          <div className="work-progress" aria-live="polite">
            <span>SCROLL TO ADVANCE</span>
            <div className="bar"><div className="bar-fill" style={{ right: `${100 - p * 100}%` }} /></div>
            <span>{String(idx).padStart(2, '0')} / 0{PROJECTS.length}</span>
          </div>
        </div>

        <div className="work-track-wrap">
          <div className="work-track" ref={trackRef}>
            {PROJECTS.map((proj, i) => <WorkCard key={proj.no} {...proj} i={i} />)}
          </div>
        </div>
      </div>
    </section>);

}

function WorkCard({ no, year, title, titleRed, codename, slotLabel, tech, summary, stats, href, cta, i }) {
  const slotWrapRef = useRef(null);
  useClipReveal(slotWrapRef, { delay: 0.05 * i });

  const slotInner = (
    <div ref={slotWrapRef} className="work-card-slot-wrap">
      <SlotDistort no={no} label={slotLabel} codename={codename} />
    </div>
  );

  return (
    <article className="work-card" data-cursor="link">
      <div className="work-card-head">
        <div className="work-card-no">/ {no} — {codename}</div>
        <div className="work-card-year">[ {year} ]</div>
      </div>

      {slotInner}

      <div className="work-card-meta">
        <h3 className="work-card-title">
          <span>{title} </span>
          <span className="red">{titleRed}</span>
        </h3>
        <div className="work-card-tech">{tech}</div>
      </div>

      <div className="work-card-foot">
        <div className="work-card-stats">
          {stats.map((s, j) =>
          <div className="work-card-stat" key={j}>
              <div className="work-card-stat-n font-display">
                <Counter target={s.n} />
                {s.u && <span className="u">{s.u}</span>}
              </div>
              <div className="work-card-stat-l">{s.l}</div>
            </div>
          )}
        </div>
        {href ?
        <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="link" className="work-card-cta">
            {cta} <span aria-hidden="true">→</span>
          </a> :

        <span className="work-card-cta" style={{ color: 'var(--fg-3)' }}>{cta}</span>
        }
      </div>

      <p className="mono-l" style={{ color: 'var(--fg-2)', maxWidth: '58ch', lineHeight: 1.6, marginTop: 8 }}>
        {summary}
      </p>
    </article>);

}

/* ============================================================
   EDUCATION + ACHIEVEMENTS
============================================================ */

export function EduAchievements() {
  return (
    <section id="education" className="edu">
      <div className="edu-side">
        <div className="edu-head">
          <Reveal as="div" className="eyebrow"><span className="red">[ Where I studied ]</span></Reveal>
          <h3 className="edu-h3">
            <Reveal as="span" style={{ display: 'block' }}>The paper</Reveal>
            <Reveal as="span" delay={120} style={{ display: 'block', color: 'var(--red)' }}>trail.</Reveal>
          </h3>
        </div>
        <div className="edu-items">
          <EduItem title="Bachelor of Computer Application" meta="2022 — 2025" sub="Arya College, Ludhiana, Punjab" />
          <EduItem title="Class 10th & 12th" meta="2020 — 2022" sub="Amrit Indo Canadian Academy, Ludhiana, Punjab" />
        </div>
      </div>

      <div className="edu-side">
        <div className="edu-head">
          <Reveal as="div" className="eyebrow"><span className="red">[ Things I&apos;ve won ]</span></Reveal>
          <h3 className="edu-h3">
            <Reveal as="span" style={{ display: 'block' }}>A few</Reveal>
            <Reveal as="span" delay={120} style={{ display: 'block', color: 'var(--red)' }}>plaques.</Reveal>
          </h3>
        </div>
        <div className="ach-items">
          <AchItem prize="FIRST PRIZE" event="Swift Surfer · Technothan" venue="Guru Nanak Khalsa College" year="2022" />
          <AchItem prize="THIRD PRIZE" event="Web Surfing · Tech Disha" venue="Arya College, Ludhiana" year="2023" />
          <AchItem prize="THIRD PRIZE" event="Web Surfing · Tech Disha" venue="Arya College, Ludhiana" year="2024" />
        </div>
      </div>
    </section>);

}

function EduItem({ title, meta, sub }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} className={`edu-item fade-up ${seen ? 'is-in' : ''}`}>
      <div className="edu-item-title">{title}</div>
      <div className="edu-item-meta">{meta}</div>
      <div className="edu-item-sub">{sub}</div>
    </div>);

}

function AchItem({ prize, event, venue, year }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} className={`ach-item fade-up ${seen ? 'is-in' : ''}`} data-cursor="link">
      <div className="ach-item-title">
        <strong>{prize}</strong>{event} <span style={{ color: 'var(--fg-3)' }}>· {venue}</span>
      </div>
      <span className="ach-item-year">{year}</span>
    </div>);

}

/* ============================================================
   CTA — magnetic, big, letter-stagger
============================================================ */
export function CTA() {
  const mailRef = useRef(null);
  const liRef = useRef(null);
  const resRef = useRef(null);
  useMagnetic(mailRef, 0.45, 22);
  useMagnetic(liRef, 0.35, 16);
  useMagnetic(resRef, 0.35, 16);

  const ref = useRef(null);
  const seen = useInView(ref);

  return (
    <section id="contact" className="cta" ref={ref}>
      <div className="cta-inner">
        <Reveal as="div" className="eyebrow cta-eyebrow">[ Get in touch ]</Reveal>
        <h2 className="cta-h1">
          <span className="line">
            <Split text="LET'S BUILD" inView={seen} by="char" stagger={42} delay={120} el="span" />
          </span>
          <span className="line">
            <Split text="SOMETHING" inView={seen} by="char" stagger={42} delay={460} el="span" />
            <span className={`mask ${seen ? 'is-in' : ''}`}>
              <span className="m-inner red" style={{ transitionDelay: '820ms' }}>.</span>
            </span>
          </span>
        </h2>
        <Reveal as="p" delay={300} className="cta-lede">
          Backend infrastructure, AI agentic pipelines, edge experiments — or just a long email about
          databases. Both welcome. Replies within 24h, usually within 4.
        </Reveal>
        <div className="cta-buttons">
          <a ref={mailRef} href="mailto:nrana4148@gmail.com" data-cursor="link" className="cta-btn cta-btn-primary">
            <span>Say hello</span>
            <span aria-hidden="true">→</span>
          </a>
          <a ref={liRef} href="https://linkedin.com/in/NishitRana" target="_blank" rel="noopener noreferrer" data-cursor="link" className="cta-btn">
            <span>LinkedIn ↗</span>
          </a>
          <a ref={resRef} href="/resume.pdf" download="resume.pdf" data-cursor="link" className="cta-btn">
            <span>↓ Résumé</span>
          </a>
        </div>

        <Reveal as="div" delay={500} style={{ marginTop: 64, display: 'grid', gap: 8, justifyItems: 'center' }}>
          <div className="sig">— Nishit</div>
          <div className="mono-s" style={{ color: 'var(--fg-3)' }}>
            Hand-written, Ludhiana, May 2026.
          </div>
        </Reveal>
      </div>
    </section>);

}

/* ============================================================
   FOOTER
============================================================ */
export function Footer() {
  return (
    <footer className="ft">
      <div className="ft-grid">
        <div>
          <div className="ft-sig">NISHIT <span className="red">RANA.</span></div>
          <div className="ft-tag">Backend · Edge · AI ·  Portfolio v.03</div>
        </div>
        <div>
          <div className="ft-col-h">LINKS</div>
          <a href="#experience" data-cursor="link" className="ft-col-link">Experience</a>
          <a href="#skills" data-cursor="link" className="ft-col-link">Skills</a>
          <a href="#projects" data-cursor="link" className="ft-col-link">Projects</a>
          <a href="#education" data-cursor="link" className="ft-col-link">Education</a>
        </div>
        <div>
          <div className="ft-col-h">SOCIAL</div>
          <a href="https://github.com/nrana-pixel" target="_blank" rel="noopener noreferrer" data-cursor="link" className="ft-col-link">GitHub ↗</a>
          <a href="https://linkedin.com/in/NishitRana" target="_blank" rel="noopener noreferrer" data-cursor="link" className="ft-col-link">LinkedIn ↗</a>
        </div>
        <div>
          <div className="ft-col-h">CONTACT</div>
          <a href="mailto:nrana4148@gmail.com" data-cursor="link" className="ft-col-link" style={{ textTransform: 'lowercase', letterSpacing: '0.04em' }}>nrana4148@gmail.com</a>
          <span className="ft-col-link">+91 70099 59067</span>
        </div>
      </div>
      <div className="ft-bot">
        <span className="ft-cp">© MMXXVI · NISHIT RANA · LUDHIANA / IN</span>
        <span className="ft-stat"><span className="dot"></span>OPEN TO WORK · MAY 2026</span>
      </div>
    </footer>);

}
