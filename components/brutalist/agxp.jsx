"use client";

/* ============================================================
   agxp.jsx — AGXP case study detail page
============================================================ */

import { useEffect, useRef, useState } from "react";
import { useInView } from "./lib";
import { ScrambleText } from "./motion";
import { Counter } from "./hooks";
import { PageTransition } from "./transition";
import { CrosshairCursor } from "./chrome";

export default function AgxpPage() {
  // Lightweight Lenis smooth scroll (no GSAP pins on this page).
  useEffect(() => {
    if (typeof window.Lenis !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new window.Lenis({ duration: 1.1, lerp: 0.1, smoothWheel: true });
    document.documentElement.classList.add('lenis', 'lenis-smooth');
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.2 });
    };
    document.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      <PageTransition />
      <div className="blueprint" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <CrosshairCursor />

      {/* Top bar */}
      <header className="cs-nav">
        <a href="/" data-transition data-transition-label="HOME" data-cursor="link" className="cs-back">
          <span aria-hidden="true">←</span> <span>BACK</span>
        </a>
        <span className="cs-nav-title mono-s">CASE STUDY / AGXP</span>
        <a href="https://github.com/nrana-pixel/agxp-cloudflare" target="_blank" rel="noopener noreferrer" data-cursor="link" className="cs-nav-repo mono-s">GITHUB ↗</a>
      </header>

      <main className="cs">
        <AgxpHero />
        <AgxpProblem />
        <AgxpFlow />
        <AgxpCode />
        <AgxpResults />
        <AgxpLearned />
        <AgxpNext />
      </main>
    </>
  );
}

function AgxpHero() {
  const [m, setM] = useState(false);
  useEffect(() => { const t = setTimeout(() => setM(true), 80); return () => clearTimeout(t); }, []);
  return (
    <section className="cs-hero">
      <div className="cs-hero-ghost font-display" aria-hidden="true">AGXP</div>
      <div className="cs-hero-inner">
        <div className="eyebrow"><span className="red">● CASE STUDY</span><span className="dim" style={{ margin: '0 10px' }}>/</span><span style={{ color: 'var(--fg-3)' }}>2026</span></div>
        <h1 className="cs-hero-h1 font-display">
          <span className="line">
            <ScrambleText text="EDGE" delay={120} duration={800} inView={m} />
          </span>
          <span className="line">
            <ScrambleText text="DELIVERY" delay={360} duration={900} inView={m} />
          </span>
          <span className="line red">
            <ScrambleText text="PLATFORM." delay={620} duration={1000} inView={m} />
          </span>
        </h1>
        <p className="cs-hero-lede">
          A full-stack edge platform that serves a deliberately authored version of your site to AI
          crawlers — detected and routed in under 10 milliseconds, on Cloudflare&apos;s network, before your
          origin ever wakes up.
        </p>
        <div className="cs-hero-meta">
          <div className="cs-meta-cell"><span className="cs-meta-k mono-s">ROLE</span><span className="cs-meta-v">Architecture · Edge runtime · Dashboard</span></div>
          <div className="cs-meta-cell"><span className="cs-meta-k mono-s">TIMELINE</span><span className="cs-meta-v">6 weeks · solo</span></div>
          <div className="cs-meta-cell"><span className="cs-meta-k mono-s">STACK</span><span className="cs-meta-v">Hono · Workers · D1 · KV · R2 · React</span></div>
          <div className="cs-meta-cell"><span className="cs-meta-k mono-s">STATUS</span><span className="cs-meta-v red">● Live · open source</span></div>
        </div>
      </div>
    </section>
  );
}

function AgxpProblem() {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <section className="cs-block" ref={ref}>
      <div className="cs-block-grid">
        <div className="cs-block-label">
          <span className="cs-block-no font-display">01</span>
          <span className="mono-s" style={{ color: 'var(--fg-3)' }}>THE PROBLEM</span>
        </div>
        <div className="cs-block-body">
          <h2 className={`cs-h2 fade-up ${seen ? 'is-in' : ''}`}>
            AI crawlers read your site. <span className="red">They just read the wrong version.</span>
          </h2>
          <p className={`cs-p fade-up ${seen ? 'is-in' : ''}`} style={{ transitionDelay: '120ms' }}>
            GPTBot, ClaudeBot and PerplexityBot ingest whatever HTML sits in front of them — usually
            marketing copy written for humans skimming on a phone. That copy becomes training data, and
            training data becomes the answer an LLM gives when someone asks about you.
          </p>
          <p className={`cs-p fade-up ${seen ? 'is-in' : ''}`} style={{ transitionDelay: '200ms' }}>
            There was no clean way to say: <em>&quot;when a known AI crawler visits, serve this instead.&quot;</em>
            Not without forking your origin, bloating your server, or trusting a third party with your DNS.
            So I built one — at the edge, where the request already passes through.
          </p>
        </div>
      </div>
    </section>
  );
}

function AgxpFlow() {
  const steps = [
    { n: '01', t: 'Request hits the edge', d: 'Every request to a connected domain passes through a Cloudflare Worker before it reaches origin. Zero added infrastructure.' },
    { n: '02', t: 'Classify the User-Agent', d: 'A single compiled regex tests for known AI crawler families. Match resolves in well under a millisecond.' },
    { n: '03', t: 'Route on the verdict', d: 'Humans pass straight through to origin, untouched. Bots trigger a KV lookup keyed by path + crawler family.' },
    { n: '04', t: 'Serve the variant', d: 'The authored variant ships from the same edge POP. Origin sees zero bot traffic; p50 stays under 10ms.' },
  ];
  return (
    <section className="cs-block cs-flow">
      <div className="cs-block-grid">
        <div className="cs-block-label">
          <span className="cs-block-no font-display">02</span>
          <span className="mono-s" style={{ color: 'var(--fg-3)' }}>HOW IT WORKS</span>
        </div>
        <div className="cs-block-body">
          <h2 className="cs-h2">Four steps, one round-trip.</h2>
          <div className="cs-steps">
            {steps.map((s, i) => <FlowStep key={i} {...s} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowStep({ n, t, d }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <div ref={ref} className={`cs-step fade-up ${seen ? 'is-in' : ''}`} data-cursor="link">
      <div className="cs-step-no mono">{n}</div>
      <div className="cs-step-t font-display">{t}</div>
      <div className="cs-step-d">{d}</div>
    </div>
  );
}

function AgxpCode() {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <section className="cs-block" ref={ref}>
      <div className="cs-block-grid">
        <div className="cs-block-label">
          <span className="cs-block-no font-display">03</span>
          <span className="mono-s" style={{ color: 'var(--fg-3)' }}>THE CORE</span>
        </div>
        <div className="cs-block-body">
          <h2 className="cs-h2">54 lines at the edge.</h2>
          <p className="cs-p" style={{ marginBottom: 24 }}>
            The entire hot path is one Worker. No framework overhead, no cold-start penalty worth measuring —
            it ships as a 12&nbsp;kB bundle.
          </p>
          <div className={`cs-code-wrap clip-reveal ${seen ? 'is-in' : ''}`}>
            <div className="cs-code-bar">
              <span className="cs-code-dot" /><span className="cs-code-dot" /><span className="cs-code-dot" />
              <span className="mono-s">edge/router.ts</span>
              <span className="mono-s" style={{ marginLeft: 'auto', color: 'var(--fg-3)' }}>TypeScript</span>
            </div>
            <pre className="cs-code">
{`const AI_BOTS = `}<span className="t-red">{`/(GPTBot|ClaudeBot|PerplexityBot|CCBot)/i`}</span>{`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const ua  = req.headers.get(`}<span className="t-grn">{`'user-agent'`}</span>{`) ?? `}<span className="t-grn">{`''`}</span>{`;

    `}<span className="t-com">{`// Known crawler? Look up an authored variant.`}</span>{`
    if (`}<span className="t-yel">{`AI_BOTS.test(ua)`}</span>{`) {
      const key = \`\${url.pathname}:\${`}<span className="t-yel">{`classify(ua)`}</span>{`}\`;
      const variant = await env.VARIANTS.get(key, { type: `}<span className="t-grn">{`'text'`}</span>{` });
      if (variant) {
        return new Response(variant, {
          headers: {
            `}<span className="t-grn">{`'content-type'`}</span>{`: `}<span className="t-grn">{`'text/html; charset=utf-8'`}</span>{`,
            `}<span className="t-grn">{`'x-served-by'`}</span>{`:  `}<span className="t-grn">{`'agxp-edge'`}</span>{`,
          },
        });
      }
    }

    `}<span className="t-com">{`// Everyone else → origin, untouched.`}</span>{`
    return fetch(\`https://\${env.ORIGIN}\${url.pathname}\`, req);
  },
};`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgxpResults() {
  const stats = [
    { n: 8, u: 'ms', l: 'detection p50' },
    { n: 0, u: 'ms', l: 'origin hits · bots' },
    { n: 12, u: 'kB', l: 'worker bundle' },
    { n: 3, u: '', l: 'crawler families' },
  ];
  return (
    <section className="cs-block cs-results">
      <div className="cs-block-grid">
        <div className="cs-block-label">
          <span className="cs-block-no font-display">04</span>
          <span className="mono-s" style={{ color: 'var(--fg-3)' }}>RESULTS</span>
        </div>
        <div className="cs-block-body">
          <h2 className="cs-h2">What it ships at.</h2>
          <div className="cs-stats">
            {stats.map((s, i) => (
              <div className="cs-stat" key={i}>
                <div className="cs-stat-n font-display"><Counter target={s.n} />{s.u && <span className="u">{s.u}</span>}</div>
                <div className="cs-stat-l mono-s">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AgxpLearned() {
  const ref = useRef(null);
  const seen = useInView(ref);
  return (
    <section className="cs-block" ref={ref}>
      <div className="cs-block-grid">
        <div className="cs-block-label">
          <span className="cs-block-no font-display">05</span>
          <span className="mono-s" style={{ color: 'var(--fg-3)' }}>WHAT I LEARNED</span>
        </div>
        <div className="cs-block-body">
          <h2 className={`cs-h2 fade-up ${seen ? 'is-in' : ''}`}>The edge is a feature, not a place.</h2>
          <p className={`cs-p fade-up ${seen ? 'is-in' : ''}`} style={{ transitionDelay: '120ms' }}>
            Putting logic in the request path — before origin — collapses an entire class of problems.
            No sync job, no cache invalidation dance, no origin load. The variant <em>is</em> the response.
          </p>
          <p className={`cs-p fade-up ${seen ? 'is-in' : ''}`} style={{ transitionDelay: '200ms' }}>
            The hard part wasn&apos;t the Worker — it was the dashboard: auth, per-domain token encryption
            (AES-GCM at rest), deployment orchestration, and variant generation via Firecrawl + OpenRouter.
            The 54 lines are the easy 54 lines. The other 4,000 are where the product lives.
          </p>
        </div>
      </div>
    </section>
  );
}

function AgxpNext() {
  return (
    <section className="cs-next">
      <a href="/#projects" data-transition data-transition-label="WORK" data-cursor="link" className="cs-next-link">
        <span className="mono-s" style={{ color: 'var(--fg-3)' }}>← BACK TO</span>
        <span className="cs-next-big font-display">ALL WORK</span>
      </a>
      <a href="mailto:nrana4148@gmail.com" data-cursor="link" className="cs-next-link cs-next-right">
        <span className="mono-s" style={{ color: 'var(--fg-3)' }}>BUILD WITH ME →</span>
        <span className="cs-next-big font-display red">SAY HELLO</span>
      </a>
    </section>
  );
}
