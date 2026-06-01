"use client";

/* ============================================================
   arch.jsx — AGXP Case Study, sticky scroll-scrubbed
   - One pinned section, four cross-faded phases
   - Each phase = self-contained visual + copy on left/right grid
   - Progress driven by ScrollTrigger.onUpdate → React state
============================================================ */

import { useEffect, useRef, useState } from "react";
import { clamp } from "./lib";

const ARCH_PHASES = [
  {
    no: '01',
    title: 'Request',
    titleItalic: 'arrives.',
    copy:
      "A user — or what claims to be a user — hits your pricing page. Cloudflare's edge picks it up before your origin even knows it exists.",
  },
  {
    no: '02',
    title: 'Edge',
    titleItalic: 'classifies.',
    copy:
      "One regex on the User-Agent header decides everything. GPTBot, ClaudeBot, PerplexityBot — known crawlers get flagged in under a millisecond.",
  },
  {
    no: '03',
    title: 'Route',
    titleItalic: 'splits.',
    copy:
      "Humans flow straight to origin, untouched. Bots get a KV lookup keyed by path + crawler family — a path-specific variant authored for that crawler.",
  },
  {
    no: '04',
    title: 'Respond',
    titleItalic: 'instantly.',
    copy:
      "The variant ships back from the same edge POP that received the request. p50 stays under 10ms. Origin sees zero bot traffic. The training corpus reads what you wrote for it.",
  },
];

export function ArchSection() {
  const ref = useRef(null);
  const [p, setP] = useState(0); // 0..1 across the whole section

  useEffect(() => {
    if (!window.gsap || !window.ScrollTrigger || !ref.current) return;
    const gsap = window.gsap;
    const ctx = gsap.context(() => {
      window.ScrollTrigger.create({
        trigger: ref.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => setP(self.progress),
      });
    }, ref);
    const t = setTimeout(() => window.ScrollTrigger?.refresh(), 200);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);

  // Map scroll progress to 0..3 (active phase index)
  const phaseCount = ARCH_PHASES.length;
  // Each phase owns 1/phaseCount of the track, with slight overlap on either side
  const phaseLocal = (i) => {
    const center = (i + 0.5) / phaseCount;
    const half   = 0.5 / phaseCount + 0.08; // overlap
    const d = Math.abs(p - center);
    return clamp(1 - d / half, 0, 1);
  };
  const activeIdx = Math.min(phaseCount - 1, Math.floor(p * phaseCount));
  const phase = ARCH_PHASES[activeIdx];

  return (
    <section className="arch" ref={ref} id="arch">
      <div className="arch-pin">
        <header className="arch-head">
          <div className="eyebrow"><span className="red">[ Case study — AGXP ]</span></div>
          <div className="arch-stepper" aria-hidden="true">
            {ARCH_PHASES.map((ph, i) => (
              <div key={i} className={`arch-step-dot ${i <= activeIdx ? 'is-passed' : ''} ${i === activeIdx ? 'is-active' : ''}`}>
                <span className="arch-step-no mono-s">{ph.no}</span>
                <span className="arch-step-bar" />
              </div>
            ))}
          </div>
        </header>

        <div className="arch-body">
          {/* LEFT — story */}
          <div className="arch-story">
            <div className="arch-story-meta mono-s">
              <span className="red">PHASE {phase.no}</span>
              <span style={{margin:'0 8px', color:'var(--fg-4)'}}>/</span>
              <span style={{color:'var(--fg-3)'}}>{String(activeIdx + 1).padStart(2,'0')} OF {String(phaseCount).padStart(2,'0')}</span>
            </div>
            <h2 className="arch-h2" key={`h-${activeIdx}`}>
              <span style={{display:'block'}}>{phase.title}</span>
              <span style={{display:'block', color:'var(--red)', fontStyle:'normal'}}>{phase.titleItalic}</span>
            </h2>
            <p className="arch-copy" key={`p-${activeIdx}`}>{phase.copy}</p>

            <div className="arch-meta">
              <div className="arch-meta-row">
                <span className="mono-s" style={{color:'var(--fg-3)'}}>STACK</span>
                <span className="mono">Hono · Workers · KV · D1 · AES-GCM</span>
              </div>
              <div className="arch-meta-row">
                <span className="mono-s" style={{color:'var(--fg-3)'}}>BUNDLE</span>
                <span className="mono">12 kB · cold start &lt;5ms</span>
              </div>
              <div className="arch-meta-row">
                <span className="mono-s" style={{color:'var(--fg-3)'}}>REPO</span>
                <a href="https://github.com/nrana-pixel/agxp-cloudflare"
                   target="_blank" rel="noopener noreferrer"
                   data-cursor="link" className="mono u-draw">github.com/nrana-pixel/agxp ↗</a>
              </div>
            </div>
          </div>

          {/* RIGHT — visualization stack */}
          <div className="arch-viz">
            <div className="arch-viz-stage">
              {ARCH_PHASES.map((ph, i) => {
                const op = phaseLocal(i);
                const offset = (p - (i + 0.5) / phaseCount) * 60;
                return (
                  <div
                    key={i}
                    className="arch-viz-frame"
                    style={{
                      opacity: op,
                      transform: `translate3d(0, ${offset.toFixed(2)}px, 0)`,
                      pointerEvents: op > 0.5 ? 'auto' : 'none',
                    }}
                    aria-hidden={op < 0.5}
                  >
                    {i === 0 && <Phase1 />}
                    {i === 1 && <Phase2 />}
                    {i === 2 && <Phase3 />}
                    {i === 3 && <Phase4 progress={p} />}
                  </div>
                );
              })}
            </div>
            <div className="arch-viz-cap mono-s">FIG.0{activeIdx + 1} / {phase.title.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PHASE 1 — Request arrives. HTTP request card.
============================================================ */
function Phase1() {
  return (
    <div className="ph ph-1">
      <div className="ph-req">
        <div className="ph-req-line ph-req-method">
          <span className="ph-req-verb">GET</span>
          <span className="ph-req-url">/pricing</span>
          <span className="ph-req-proto mono-s">HTTP/2</span>
        </div>
        <div className="ph-req-hdr"><span className="k">host</span><span className="v">nishitrana.dev</span></div>
        <div className="ph-req-hdr"><span className="k">accept</span><span className="v">text/html, */*</span></div>
        <div className="ph-req-hdr ph-req-hdr-flag">
          <span className="k">user-agent</span>
          <span className="v">
            Mozilla/5.0 <span className="hl">GPTBot/1.2</span>; +https://openai.com/gptbot
          </span>
        </div>
        <div className="ph-req-hdr"><span className="k">cf-ray</span><span className="v">8f4a3c2b1d-DEL</span></div>
        <div className="ph-req-hdr"><span className="k">cf-ipcountry</span><span className="v">IN</span></div>
      </div>
      <div className="ph-arrow-down" aria-hidden="true">↓</div>
      <div className="ph-edge">
        <span className="ph-edge-dot" />
        <span className="mono-s">CF EDGE · DELHI</span>
      </div>
    </div>
  );
}

/* ============================================================
   PHASE 2 — Edge classifies. Code block + match stamp.
============================================================ */
function Phase2() {
  return (
    <div className="ph ph-2">
      <div className="ph-code-bar">
        <span className="ph-code-dot" /><span className="ph-code-dot" /><span className="ph-code-dot" />
        <span className="mono-s">edge/router.ts</span>
        <span className="mono-s" style={{marginLeft:'auto',color:'var(--fg-3)'}}>line 14</span>
      </div>
      <pre className="ph-code">
{`const AI_BOTS = `}<span className="t-red">{`/(GPTBot|ClaudeBot|PerplexityBot|CCBot)/i`}</span>{`;

const ua = req.headers.get(`}<span className="t-grn">{`'user-agent'`}</span>{`) ?? `}<span className="t-grn">{`''`}</span>{`;
if (`}<span className="t-yel">{`AI_BOTS.test(ua)`}</span>{`) {
  `}<span className="t-com">{`// match → serve variant`}</span>{`
  return `}<span className="t-yel">{`serveVariant`}</span>{`(url, ua, env);
}`}
      </pre>
      <div className="ph-stamp">
        <span className="ph-stamp-tick">✓</span>
        <span className="ph-stamp-text mono-s">MATCH · GPTBot · 0.8ms</span>
      </div>
    </div>
  );
}

/* ============================================================
   PHASE 3 — Route splits. Branching SVG diagram.
============================================================ */
function Phase3() {
  return (
    <div className="ph ph-3">
      <svg className="ph-svg" viewBox="0 0 480 320" preserveAspectRatio="xMidYMid meet">
        {/* center top node */}
        <g>
          <rect x="180" y="14" width="120" height="42" fill="var(--bg-2)" stroke="#FF0000" />
          <text x="240" y="40" textAnchor="middle" fill="#F5F5F5" fontFamily="'Bebas Neue'" fontSize="16" letterSpacing="0.04em">EDGE WORKER</text>
        </g>
        {/* fork down */}
        <line x1="240" y1="56" x2="240" y2="98" stroke="#FF0000" strokeWidth="1.5" />
        <line x1="240" y1="98" x2="100" y2="98" stroke="rgba(245,245,245,0.5)" strokeWidth="1.5" />
        <line x1="240" y1="98" x2="380" y2="98" stroke="#FF0000" strokeWidth="1.5" />
        <line x1="100" y1="98" x2="100" y2="138" stroke="rgba(245,245,245,0.5)" strokeWidth="1.5" />
        <line x1="380" y1="98" x2="380" y2="138" stroke="#FF0000" strokeWidth="1.5" />

        {/* human branch label */}
        <text x="100" y="128" textAnchor="middle" fill="rgba(245,245,245,0.65)" fontFamily="'Space Mono'" fontSize="9" letterSpacing="0.18em">HUMAN</text>
        {/* bot branch label */}
        <text x="380" y="128" textAnchor="middle" fill="#FF0000" fontFamily="'Space Mono'" fontSize="9" letterSpacing="0.18em">BOT</text>

        {/* human → origin */}
        <line x1="100" y1="138" x2="100" y2="170" stroke="rgba(245,245,245,0.5)" strokeWidth="1.5" />
        <rect x="40" y="170" width="120" height="42" fill="var(--bg-2)" stroke="rgba(245,245,245,0.42)" />
        <text x="100" y="196" textAnchor="middle" fill="rgba(245,245,245,0.85)" fontFamily="'Bebas Neue'" fontSize="14" letterSpacing="0.04em">ORIGIN</text>
        <text x="100" y="230" textAnchor="middle" fill="rgba(245,245,245,0.5)" fontFamily="'Space Mono'" fontSize="9">nishitrana.dev</text>

        {/* bot → KV */}
        <line x1="380" y1="138" x2="380" y2="170" stroke="#FF0000" strokeWidth="1.5" />
        <rect x="320" y="170" width="120" height="42" fill="var(--bg-2)" stroke="#FF0000" />
        <text x="380" y="196" textAnchor="middle" fill="#F5F5F5" fontFamily="'Bebas Neue'" fontSize="14" letterSpacing="0.04em">KV.VARIANTS</text>
        <text x="380" y="230" textAnchor="middle" fill="rgba(245,245,245,0.5)" fontFamily="'Space Mono'" fontSize="9">key: path:crawler</text>

        {/* KV → variant */}
        <line x1="380" y1="212" x2="380" y2="244" stroke="#FF0000" strokeWidth="1.5" />
        <rect x="320" y="244" width="120" height="42" fill="rgba(255,0,0,0.10)" stroke="#FF0000" />
        <text x="380" y="270" textAnchor="middle" fill="#FF0000" fontFamily="'Bebas Neue'" fontSize="14" letterSpacing="0.04em">AI VARIANT</text>
        <text x="380" y="302" textAnchor="middle" fill="rgba(245,245,245,0.55)" fontFamily="'Space Mono'" fontSize="9">x-served-by: agxp-edge</text>
      </svg>
    </div>
  );
}

/* ============================================================
   PHASE 4 — Respond. Response card + counter row.
============================================================ */
function Phase4({ progress = 1 }) {
  // local progress within phase 4 — 0..1
  const local = clamp((progress - 0.75) / 0.25, 0, 1);
  const ms = Math.round(local * 8);
  const variants = Math.round(local * 3);
  return (
    <div className="ph ph-4">
      <div className="ph-resp">
        <div className="ph-resp-status">
          <span className="ph-resp-code">200</span>
          <span className="ph-resp-label">OK</span>
          <span className="ph-resp-ms mono-s">{ms}<span style={{color:'var(--fg-3)'}}>ms · p50</span></span>
        </div>
        <div className="ph-resp-hdr"><span className="k">content-type</span><span className="v">text/html; charset=utf-8</span></div>
        <div className="ph-resp-hdr"><span className="k">x-served-by</span><span className="v hl">agxp-edge</span></div>
        <div className="ph-resp-hdr"><span className="k">x-variant-key</span><span className="v">pricing:gptbot</span></div>
        <div className="ph-resp-hdr"><span className="k">cache</span><span className="v">HIT · KV</span></div>
        <div className="ph-resp-hdr"><span className="k">cf-ray</span><span className="v">8f4a3c2b1d-DEL</span></div>
      </div>
      <div className="ph-counters">
        <div className="ph-counter">
          <div className="ph-counter-n font-display">{ms}<span className="u">ms</span></div>
          <div className="ph-counter-l mono-s">EDGE LATENCY</div>
        </div>
        <div className="ph-counter">
          <div className="ph-counter-n font-display">0<span className="u">hits</span></div>
          <div className="ph-counter-l mono-s">ORIGIN · BOTS</div>
        </div>
        <div className="ph-counter">
          <div className="ph-counter-n font-display">{variants}</div>
          <div className="ph-counter-l mono-s">VARIANT FAMILIES</div>
        </div>
      </div>
    </div>
  );
}
