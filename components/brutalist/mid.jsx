"use client";

/* ============================================================
   BRUTALIST — Marquee (velocity-warped) + Experience + Skills
============================================================ */

import { useEffect, useRef } from "react";
import { clamp, lerp, useReduced, useInView, Reveal } from "./lib";
import { Counter } from "./hooks";

/* ---- Velocity-warped two-row tech marquee ---- */
const TECH = [
  'NODE.JS', 'PYTHON', 'TYPESCRIPT', 'CLOUDFLARE WORKERS', 'D1', 'KV', 'R2',
  'DOCKER', 'KUBERNETES', 'NGINX', 'POSTGRES', 'MONGODB', 'REACT', 'NEXT.JS',
  'HONO', 'VERTEX AI', 'VEO 3.0', 'GEMINI', 'N8N', 'RAG', 'JWT', 'AES-GCM',
];
const ALT = [
  '[ AVAILABLE ]', '↗ MAIL', '↗ LINKEDIN', '↗ GITHUB',
  '[ OPEN TO COLLAB ]', '[ REMOTE-READY ]', '[ LUDHIANA / IN ]',
];

export function Marquee() {
  const rowA = useRef(null);
  const rowB = useRef(null);
  const rowC = useRef(null);
  const reduced = useReduced();

  useEffect(() => {
    if (reduced) return;
    let raf;
    let xA = 0, xB = 0, xC = 0;
    let last = window.scrollY;
    let vel = 0;
    const tick = () => {
      const y = window.scrollY;
      const inst = y - last; last = y;
      vel = lerp(vel, inst, 0.16);
      const boost = Math.abs(vel) * 0.7;
      const skew  = clamp(vel * 0.35, -10, 10);

      xA -= 0.6 + boost;
      xB += 0.6 + boost;
      xC -= 0.45 + boost * 0.8;

      const apply = (el, x, dir) => {
        if (!el) return;
        const w = el.scrollWidth / 2;
        if (dir < 0 && -x >= w) x += w;
        if (dir > 0 && x >= w)  x -= w;
        el.style.transform = `translate3d(${x}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
        return x;
      };
      xA = apply(rowA.current, xA, -1);
      xB = apply(rowB.current, xB, +1);
      xC = apply(rowC.current, xC, -1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const renderRow = (items, refEl, kind = '') => (
    <div className="mq-wrap">
      <div ref={refEl} className={`mq-row ${kind}`}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="mq-item">
            {t}
            <span className="dot">●</span>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section className="mq" aria-hidden="true">
      {renderRow(TECH, rowA)}
      {renderRow(ALT,  rowB, 'alt')}
      {renderRow(TECH.slice().reverse(), rowC)}
    </section>
  );
}

/* ============================================================
   EXPERIENCE
============================================================ */
export function Experience() {
  return (
    <section id="experience" className="exp">
      <div className="exp-grid">
        <div className="exp-left">
          <Reveal as="div" className="eyebrow">
            <span className="red">[ Where I&apos;ve worked ]</span>
          </Reveal>
          <h2 className="d-section exp-h2">
            <Reveal as="span" style={{display:'block'}}>The day</Reveal>
            <Reveal as="span" delay={120} style={{display:'block', color: 'var(--red)'}}>job, briefly.</Reveal>
          </h2>
          <Reveal as="p" delay={220} className="exp-cap">
            One full-time engineering role at <span style={{color:'var(--fg)'}}>Cognerd</span>,
            one production internship at <span style={{color:'var(--fg)'}}>Welzin</span>,
            and a stubborn habit of drawing the data layer on a napkin before anyone has filed a Figma ticket.
          </Reveal>
        </div>

        <div className="exp-list">
          <ExpCard
            title="Software Development Engineer I"
            org="Cognerd"
            meta="FEB 2026 — PRESENT"
            stack="NODE.JS · TYPESCRIPT · PYTHON · CLOUD · AI WORKFLOWS"
            bullets={[
              "Backend development and scalable system design — building and maintaining services and APIs in Node.js, TypeScript, and Python.",
              "Working with cloud infrastructure, deployments, and AI-powered workflows across the product surface.",
              "Currently obsessed with: keeping p95 latency boring and observability honest.",
            ]}
          />

          <ExpCard
            title="Backend Developer Intern"
            org="Welzin"
            meta="AUG 2025 — JAN 2026"
            stack="NODE.JS · PYTHON · DOCKER · K8S · MONGODB · NGINX · n8n · RAG"
            bullets={[
              "Built scalable backend systems in Node.js and Python; developed and shipped production REST APIs.",
              "Deployed and managed applications on Linux servers behind Nginx — set up the deployment pipeline that replaced the previous click-and-pray process.",
              "Worked with n8n automation, Docker, Kubernetes, MongoDB, and a small RAG pipeline in a DevOps-oriented environment.",
            ]}
          />

        </div>
      </div>
    </section>
  );
}

function ExpCard({ title, org, meta, stack, bullets }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <article ref={ref} className={`exp-card fade-up ${seen ? 'is-in' : ''}`}>
      <div className="exp-card-head">
        <div>
          <h3 className="exp-card-title">{title}</h3>
          <div className="mono-s" style={{marginTop:8, color:'var(--fg-3)'}}>{org}</div>
        </div>
        <span className="exp-card-meta">{meta}</span>
      </div>
      <div className="mono-s" style={{color:'var(--red)', marginBottom:18}}>{stack}</div>
      <ul className="exp-bullets">
        {bullets.map((b, i) => <li key={i} className="exp-bullet"><span>{b}</span></li>)}
      </ul>
    </article>
  );
}

/* ============================================================
   SKILLS — 4-col grid (paper bg), bracket hover, cascade reveal
============================================================ */
const SKILLS = [
  { no: '01', title: 'LANGUAGES',       items: 'C / C++ · Python · JavaScript · TypeScript · HTML · CSS' },
  { no: '02', title: 'FRAMEWORKS',      items: 'Node.js · Express · Hono · Next.js · React · Vite · Django · EJS' },
  { no: '03', title: 'DATABASES',       items: 'MongoDB · MySQL · Cloudflare D1 (SQLite)' },
  { no: '04', title: 'CLOUD & INFRA',   items: 'CF Workers · KV · R2 · Linux · Nginx · Docker · Kubernetes' },
  { no: '05', title: 'AI & AGENTIC',    items: 'RAG · MCP · GenAI · Agentic · n8n · Vertex AI · Gemini' },
  { no: '06', title: 'SECURITY',        items: 'JWT · bcrypt · AES-GCM · SHA-256 · Web Crypto API' },
  { no: '07', title: 'DEVELOPER TOOLS', items: 'Git · GitHub · VS Code · Postman · Wrangler · Vitest' },
  { no: '08', title: 'CS FUNDAMENTALS', items: 'OOP · DSA · DBMS · Networks · Software Engineering' },
];

export function Skills() {
  return (
    <section id="skills" className="sk">
      <div className="sk-head">
        <Reveal as="div" className="eyebrow"><span className="red">[ What I reach for first ]</span></Reveal>
        <h2 className="d-section sk-h2">
          <Reveal as="span" style={{display:'block'}}>Stack</Reveal>
          <Reveal as="span" delay={120} style={{display:'block', color: 'var(--red)'}}>I trust.</Reveal>
        </h2>
        <Reveal as="p" delay={220} className="sk-lede">
          Mostly TypeScript and Python, mostly at the edge, increasingly inside AI workflows. This isn&apos;t an
          exhaustive resumé dump — it&apos;s what I actually open on a Monday morning.
        </Reveal>
      </div>

      <div className="sk-grid">
        {SKILLS.map((s, i) => <SkCell key={s.no} {...s} i={i} />)}
        <SkAvail i={SKILLS.length} />
      </div>
    </section>
  );
}

function SkCell({ no, title, items, i }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} className={`sk-cell fade-up ${seen ? 'is-in' : ''}`}
         style={{ transitionDelay: `${i * 60}ms` }} data-cursor="link">
      <div className="br-bl" />
      <div className="br-br" />
      <div className="sk-num">{no} / {String(SKILLS.length).padStart(2, '0')}</div>
      <div className="sk-title">{title}</div>
      <div className="sk-items">{items}</div>
    </div>
  );
}

function SkAvail({ i }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} className={`sk-cell fade-up ${seen ? 'is-in' : ''}`}
         style={{ transitionDelay: `${i * 60}ms`, background: 'var(--bg)', color: 'var(--fg)' }} data-cursor="link">
      <div className="br-bl" />
      <div className="br-br" />
      <div className="sk-num">/ STATUS</div>
      <div className="sk-title" style={{color:'var(--fg)', fontSize:'clamp(34px,4vw,56px)'}}>
        <Counter target={1} />
        <span style={{color:'var(--red)', fontFamily:'var(--font-mono)', fontSize:'0.4em', marginLeft:6, verticalAlign:'top', letterSpacing:'0.06em'}}>OPEN ROLE</span>
      </div>
      <div className="sk-items" style={{color:'var(--fg-2)'}}>
        Remote-ready · IST · Replying within 24h.<br/>
        Mail: <span style={{color:'var(--fg)'}}>nrana4148@gmail.com</span>
      </div>
    </div>
  );
}
