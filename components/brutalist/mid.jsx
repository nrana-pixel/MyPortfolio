"use client";

/* ============================================================
   BRUTALIST — Marquee (velocity-warped) + Experience + Skills
============================================================ */

import { useEffect, useRef } from "react";
import { clamp, lerp, useReduced, useInView, Reveal } from "./lib";
import { Counter } from "./hooks";

/* ---- Velocity-warped two-row tech marquee ---- */
const TECH = [
  'TYPESCRIPT', 'PYTHON', 'GO', 'PYDANTICAI', 'MCP', 'RAG', 'POSTGRES', 'BULLMQ',
  'REDIS / VALKEY', 'AWS', 'EC2', 'RDS', 'CLOUDFORMATION', 'CLOUDFLARE WORKERS',
  'HONO', 'NEXT.JS', 'VERTEX AI', 'VEO', 'GEMINI', 'RAZORPAY', 'N8N', 'SYSTEMD',
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
            Intern to <span style={{color:'var(--fg)'}}>founding engineer at Cognerd</span> within six months of
            graduating, after a production internship at <span style={{color:'var(--fg)'}}>Welzin</span>.
            I own planning, build, release and production support end to end, and supervise three interns.
          </Reveal>
        </div>

        <div className="exp-list">
          <ExpCard
            title="Founding Engineer (SDE 1)"
            org="Cognerd"
            meta="FEB 2026 — PRESENT"
            stack="PYDANTICAI · TYPESCRIPT · PYTHON · POSTGRES · BULLMQ · AWS · RAZORPAY"
            bullets={[
              "Ownership: planning, build, release, deployment and production support across all company platforms; lead technical delivery and supervise three interns.",
              "AI & agents: tool-using PydanticAI agents with retrieval budgets, citations, spend admission and sentence-level claim verification; golden datasets and regression gates for brand matching, sentiment and share-of-voice; an n8n + Vertex AI Veo product-to-video pipeline productised as a UGC video studio.",
              "Backend & payments: 20+ REST routes and 10+ PostgreSQL tables; three durable PostgreSQL + BullMQ job systems with atomic admission and crash recovery; Razorpay billing with webhook de-duplication and reconciliation; multi-tenant RBAC.",
              "Infrastructure: moved four production services and PostgreSQL onto EC2/RDS behind ALB, defined in CloudFormation with CodePipeline/CodeDeploy; CloudWatch + SNS alerting, ElastiCache Valkey with TLS, and a lower dev-infra bill.",
            ]}
          />

          <ExpCard
            title="Backend Developer Intern"
            org="Welzin"
            meta="AUG 2025 — JAN 2026"
            stack="NODE.JS · PYTHON · MONGODB · RAG · n8n · NGINX · DOCKER · K8S"
            bullets={[
              "Built Node.js/Python APIs for brand monitoring: user-scoped brand profiles, persona-based generation, AEO reports and AI-provider comparison.",
              "Integrated OpenRouter, OpenAI and Grok with MongoDB, RAG and n8n.",
              "Deployed Linux applications behind Nginx, worked with Docker and Kubernetes, and moved a Flask service to Vercel.",
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
  { no: '01', title: 'AI ENGINEERING',  items: 'PydanticAI · MCP · RAG · Vertex AI / Veo · Gemini · OpenAI · Anthropic · grounding · eval datasets & regression gates' },
  { no: '02', title: 'LANGUAGES',       items: 'TypeScript · Python · Go · SQL' },
  { no: '03', title: 'BACKEND',         items: 'Node.js · Express · Hono · FastAPI · Next.js · React · REST · SSE' },
  { no: '04', title: 'DATA & QUEUES',   items: 'PostgreSQL · MongoDB/Atlas · MySQL · Cloudflare D1 · Qdrant · Redis/Valkey · BullMQ · n8n' },
  { no: '05', title: 'AWS',             items: 'EC2 · RDS · ALB · ACM · S3 · CloudFront · ElastiCache · IAM · Secrets Manager · SSM · CloudWatch · SNS · CloudFormation · EventBridge · CodePipeline' },
  { no: '06', title: 'EDGE & OPS',      items: 'Cloudflare Workers/KV/R2 · Linux · systemd · Nginx · Docker · Kubernetes · Tailscale · Vercel' },
  { no: '07', title: 'AUTH & PAYMENTS', items: 'Better Auth · multi-tenant RBAC · Zod · Razorpay · idempotency keys · AES-256-GCM' },
  { no: '08', title: 'TESTING & TOOLS', items: 'Vitest · Jest · pytest · Playwright · Git · Bash · PowerShell · Claude Code · Codex' },
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
          Mostly TypeScript and Python: LLM agents and eval harnesses, the Postgres schemas and job queues
          behind them, and the AWS servers they run on.
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
