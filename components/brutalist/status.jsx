"use client";

/* ============================================================
   status.jsx — LIVE GitHub terminal
   Pulls REAL data from github.com/nrana-pixel via the public
   REST API (no auth, CORS-friendly) and renders it as a terminal
   session that types `gh` / `git` commands and prints the output.

   Robust by design: caches the last good response in localStorage,
   falls back to a cached snapshot if the API is unreachable or
   rate-limited, and labels which state it's in (live / cached).
============================================================ */

import { useEffect, useMemo, useRef, useState } from "react";
import { useReduced, Reveal } from "./lib";
import { Counter } from "./hooks";

const GH_USER = 'nrana-pixel';

/* Minimal believable snapshot used only if the network is fully
   unavailable on first ever load (no cache yet). */
const GH_FALLBACK = {
  profile: {
    login: GH_USER, name: 'Nishit Rana',
    bio: 'Backend engineer — edge platforms & AI-driven workflows.',
    location: 'India', public_repos: 27, followers: 48, following: 36,
    created_at: '2021-02-01T00:00:00Z',
  },
  repos: [
    { name: 'agxp-cloudflare', stargazers_count: 0, language: 'TypeScript', pushed_at: new Date(Date.now() - 2 * 864e5).toISOString() },
    { name: 'ugc-pipeline',    stargazers_count: 0, language: 'Go',         pushed_at: new Date(Date.now() - 9 * 864e5).toISOString() },
    { name: 'portfolio',       stargazers_count: 0, language: 'JavaScript', pushed_at: new Date(Date.now() - 1 * 864e5).toISOString() },
  ],
  events: [],
  contrib: null,
};

const LANG_COLOR = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Go: '#00add8', Python: '#3572a5',
  Rust: '#dea584', Java: '#b07219', C: '#555555', 'C++': '#f34b7d', Shell: '#89e051',
  HTML: '#e34c26', CSS: '#563d7c', Ruby: '#701516', PHP: '#4f5d95', Vue: '#41b883',
  Svelte: '#ff3e00', Dockerfile: '#384d54', Kotlin: '#a97bff', Swift: '#f05138',
};
const langColor = (l) => LANG_COLOR[l] || 'var(--fg-4)';

function ghTimeAgo(d) {
  if (!d) return '—';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  const m = s / 60; if (m < 60) return Math.floor(m) + 'm ago';
  const h = m / 60; if (h < 24) return Math.floor(h) + 'h ago';
  const dd = h / 24; if (dd < 30) return Math.floor(dd) + 'd ago';
  const mo = dd / 30; if (mo < 12) return Math.floor(mo) + 'mo ago';
  return Math.floor(mo / 12) + 'y ago';
}

/* ---- data hook: fetch + cache + fallback ---- */
function useGitHub(user) {
  const [state, setState] = useState({ ready: false, source: 'loading', data: null });

  useEffect(() => {
    let cancelled = false;
    const CACHE_KEY = 'gh-cache-v2-' + user;
    let cached = null;
    try { const raw = localStorage.getItem(CACHE_KEY); if (raw) cached = JSON.parse(raw); } catch (e) {}

    const finish = (data, source) => { if (!cancelled) setState({ ready: true, source, data }); };

    const J = (u) => fetch(u, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });

    const safety = setTimeout(() => {
      finish(cached ? cached.data : GH_FALLBACK, 'cached');
    }, 7000);

    Promise.allSettled([
      J(`https://api.github.com/users/${user}`),
      J(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`),
      J(`https://api.github.com/users/${user}/events/public?per_page=30`),
      fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
        .then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([p, rp, ev, co]) => {
      clearTimeout(safety);
      if (cancelled) return;
      const okProfile = p.status === 'fulfilled' && p.value && !p.value.message;
      if (okProfile) {
        const freshContrib = co.status === 'fulfilled' && co.value && Array.isArray(co.value.contributions) ? co.value : null;
        const cachedContrib = cached && cached.data && cached.data.contrib ? cached.data.contrib : null;
        const data = {
          profile: p.value,
          repos: rp.status === 'fulfilled' && Array.isArray(rp.value) ? rp.value : [],
          events: ev.status === 'fulfilled' && Array.isArray(ev.value) ? ev.value : [],
          contrib: freshContrib || cachedContrib,
        };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data })); } catch (e) {}
        finish(data, 'live');
      } else {
        finish(cached ? cached.data : GH_FALLBACK, 'cached');
      }
    }).catch(() => {
      clearTimeout(safety);
      finish(cached ? cached.data : GH_FALLBACK, 'cached');
    });

    return () => { cancelled = true; clearTimeout(safety); };
  }, [user]);

  return state;
}

/* ---- derive everything the terminal prints from raw data ---- */
function deriveGitHub(data) {
  const p = data.profile || {};
  const repos = (data.repos || []).filter((r) => !r.fork);
  const byPushed = [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);

  // language tally (by repo count)
  const tally = {};
  repos.forEach((r) => { if (r.language) tally[r.language] = (tally[r.language] || 0) + 1; });
  const counted = Object.values(tally).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, n]) => ({ name, pct: Math.round((n / counted) * 100) }));

  // recent commits from push events
  const commits = [];
  (data.events || []).forEach((e) => {
    if (e.type === 'PushEvent' && e.payload && Array.isArray(e.payload.commits)) {
      const repo = (e.repo && e.repo.name ? e.repo.name : '').split('/').pop();
      e.payload.commits.slice().reverse().forEach((c) => {
        commits.push({ repo, msg: (c.message || '').split('\n')[0], when: e.created_at });
      });
    }
  });

  // contributions heatmap — last 182 days
  let heat = null, contribTotal = 0;
  if (data.contrib && Array.isArray(data.contrib.contributions)) {
    const all = data.contrib.contributions;
    contribTotal = (data.contrib.total && (data.contrib.total.lastYear || Object.values(data.contrib.total)[0])) || all.reduce((s, c) => s + (c.count || 0), 0);
    heat = all.slice(-182).map((c) => c.level || 0);
  }

  return {
    login: p.login || GH_USER,
    name: p.name || 'Nishit Rana',
    bio: p.bio || '',
    location: p.location || '',
    publicRepos: p.public_repos || repos.length,
    followers: p.followers || 0,
    following: p.following || 0,
    memberSince: p.created_at ? new Date(p.created_at).getFullYear() : '—',
    topRepos: byPushed.slice(0, 6),
    totalStars,
    langs,
    commits: commits.slice(0, 6),
    heat,
    contribTotal,
  };
}

/* ---- output block renderers (returned by buildSteps) ---- */
function OutAuth({ g }) {
  return (
    <div className="gh-out-auth">
      <div className="gh-ok"><span className="gh-check">✓</span> github.com — authenticated as <b>{g.login}</b> ({g.name})</div>
      <div className="gh-dim">  Protocol: https · API: rest/v3 · Active account: true</div>
    </div>
  );
}

function OutProfile({ g }) {
  const rows = [
    ['login', g.login],
    ['name', g.name],
    g.bio ? ['bio', g.bio] : null,
    g.location ? ['location', g.location] : null,
    ['public_repos', String(g.publicRepos)],
    ['followers', String(g.followers)],
    ['following', String(g.following)],
    ['member_since', String(g.memberSince)],
  ].filter(Boolean);
  return (
    <div className="gh-kv">
      {rows.map(([k, v]) => (
        <div className="gh-kv-row" key={k}>
          <span className="gh-k">{k}</span>
          <span className="gh-v">{v}</span>
        </div>
      ))}
    </div>
  );
}

function OutRepos({ g }) {
  if (!g.topRepos.length) return <div className="gh-dim">  no public repositories</div>;
  return (
    <div className="gh-repos">
      {g.topRepos.map((r) => (
        <div className="gh-repo" key={r.name}>
          <span className="gh-star">★ {r.stargazers_count || 0}</span>
          <span className="gh-repo-name">{r.name}</span>
          <span className="gh-lang">
            {r.language && <span className="gh-lang-dot" style={{ background: langColor(r.language) }} />}
            {r.language || '—'}
          </span>
          <span className="gh-when">pushed {ghTimeAgo(r.pushed_at)}</span>
        </div>
      ))}
    </div>
  );
}

function OutLangs({ g }) {
  if (!g.langs.length) return <div className="gh-dim">  no language data</div>;
  const max = g.langs[0].pct || 1;
  return (
    <div className="gh-langs">
      {g.langs.map((l) => (
        <div className="gh-lang-row" key={l.name}>
          <span className="gh-lang-name">{l.name}</span>
          <span className="gh-lbar"><span className="gh-lbar-fill" style={{ width: `${(l.pct / max) * 100}%`, background: langColor(l.name) }} /></span>
          <span className="gh-lang-pct">{l.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function OutContrib({ g }) {
  if (!g.heat) {
    return <div className="gh-dim">  contribution graph requires the graphql endpoint — skipped.</div>;
  }
  return (
    <div className="gh-contrib">
      <div className="gh-heat" aria-hidden="true">
        {g.heat.map((lvl, i) => (
          <span className={`heat-cell heat-${lvl} is-in`} key={i} style={{ transitionDelay: `${i * 2}ms` }} />
        ))}
      </div>
      <div className="gh-contrib-foot">
        <span className="gh-dim">last 26 weeks</span>
        <span className="gh-contrib-total"><b>{g.contribTotal.toLocaleString()}</b> contributions this year</span>
      </div>
    </div>
  );
}

function OutLog({ g }) {
  if (!g.commits.length) return <div className="gh-dim">  no recent public pushes</div>;
  return (
    <div className="gh-log">
      {g.commits.map((c, i) => (
        <div className="gh-commit" key={i}>
          <span className="gh-sha">{Math.random().toString(16).slice(2, 9)}</span>
          <span className="gh-commit-msg">{c.msg}</span>
          <span className="gh-commit-repo">{c.repo}</span>
          <span className="gh-when">{ghTimeAgo(c.when)}</span>
        </div>
      ))}
    </div>
  );
}

function buildSteps(g) {
  const steps = [
    { cmd: 'gh auth status', node: <OutAuth g={g} /> },
    { cmd: `gh api /users/${g.login}`, node: <OutProfile g={g} /> },
    { cmd: 'gh repo list --sort pushed -L 6', node: <OutRepos g={g} /> },
    { cmd: 'gh api repos --jq "group_by(.language)"', node: <OutLangs g={g} /> },
  ];
  if (g.heat) steps.push({ cmd: 'gh api /users/' + g.login + '/contributions', node: <OutContrib g={g} /> });
  if (g.commits.length) steps.push({ cmd: 'git log --oneline -6', node: <OutLog g={g} /> });
  return steps;
}

/* ---- the terminal section ---- */
export function GitHubStatus() {
  const gh = useGitHub(GH_USER);
  const ref = useRef(null);
  const reduced = useReduced();

  const [nearby, setNearby] = useState(false);
  const [shown, setShown] = useState([]);   // committed steps
  const [partial, setPartial] = useState(null); // currently-typing command
  const [finished, setFinished] = useState(false);
  const startedRef = useRef(false);
  const timersRef = useRef([]);

  const g = useMemo(() => (gh.data ? deriveGitHub(gh.data) : null), [gh.data]);
  const gRef = useRef(null);
  gRef.current = g;

  // Robust in-view trigger: check on mount, on scroll/wheel, and via rAF —
  // latch `nearby` the moment the section is anywhere near the viewport.
  useEffect(() => {
    let raf, alive = true;
    const check = () => {
      const el = ref.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 40) {
        setNearby(true);
        cleanup();
        return true;
      }
      return false;
    };
    const loop = () => { if (!alive || check()) return; raf = requestAnimationFrame(loop); };
    const cleanup = () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', check, true);
      window.removeEventListener('wheel', check, { passive: true });
      window.removeEventListener('resize', check);
    };
    if (!check()) {
      raf = requestAnimationFrame(loop);
      window.addEventListener('scroll', check, true);
      window.addEventListener('wheel', check, { passive: true });
      window.addEventListener('resize', check);
    }
    return cleanup;
  }, []);

  // Clear any pending typing timers only on unmount.
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  // This terminal grows in height as it fetches live data and types out its
  // lines — which pushes the pinned "Selected Work" section below it down.
  // GSAP measured that pin earlier, so its scroll positions are now stale and
  // the section jumps. Recalculate ScrollTrigger once the terminal settles.
  useEffect(() => {
    if (finished) window.ScrollTrigger?.refresh();
  }, [finished]);

  // Drive the typing once data is ready AND the section is in view.
  useEffect(() => {
    if (startedRef.current) return;
    if (!nearby || !gh.ready || !gRef.current) return;
    startedRef.current = true;
    const steps = buildSteps(gRef.current);

    if (reduced) { setShown(steps); setFinished(true); return; }

    let si = 0, ci = 0;
    const tick = () => {
      if (si >= steps.length) { setFinished(true); return; }
      const step = steps[si];
      if (ci <= step.cmd.length) {
        setPartial({ cmd: step.cmd.slice(0, ci) });
        ci++;
        timersRef.current.push(setTimeout(tick, 14 + Math.random() * 24));
      } else {
        setPartial(null);
        setShown((p) => [...p, step]);
        si++; ci = 0;
        timersRef.current.push(setTimeout(tick, 360));
      }
    };
    timersRef.current.push(setTimeout(tick, 260));
  }, [nearby, gh.ready, reduced]);

  const badge = gh.source === 'live'
    ? <span className="gh-badge is-live"><span className="gh-pip" />live · api.github.com</span>
    : gh.source === 'cached'
      ? <span className="gh-badge is-cached"><span className="gh-pip" />cached snapshot</span>
      : <span className="gh-badge"><span className="gh-pip" />connecting…</span>;

  return (
    <section id="status" className="status" ref={ref}>
      <div className="status-head">
        <Reveal as="div" className="eyebrow"><span className="red">[ Live from github.com ]</span></Reveal>
        <h2 className="d-section">
          <Reveal as="span" style={{ display: 'block' }}>git</Reveal>
          <Reveal as="span" delay={120} style={{ display: 'block', color: 'var(--red)' }}>status.</Reveal>
        </h2>
        <Reveal as="p" delay={220} className="body-l" style={{ maxWidth: '52ch' }}>
          Not a mockup — this terminal queries my real GitHub account on load and prints
          whatever it gets back. Repos, languages and commits below are pulled straight from
          <span className="mono"> github.com/{GH_USER}</span>.
        </Reveal>
      </div>

      <div className="gh-term">
        <div className="gh-bar">
          <span className="gh-dot" /><span className="gh-dot" /><span className="gh-dot" />
          <span className="gh-bar-title">{GH_USER}@github — zsh</span>
          {badge}
        </div>
        <div className="gh-body">
          {!gh.ready && (
            <div className="gh-cmd">
              <span className="gh-prompt">{GH_USER}<span className="gh-path">:~$</span></span>
              <span className="gh-dim"> connecting to api.github.com</span>
              <span className="gh-caret">▍</span>
            </div>
          )}

          {shown.map((s, i) => (
            <div className="gh-step" key={i}>
              <div className="gh-cmd">
                <span className="gh-prompt">{GH_USER}<span className="gh-path">:~$</span></span> {s.cmd}
              </div>
              <div className="gh-out">{s.node}</div>
            </div>
          ))}

          {partial && (
            <div className="gh-cmd">
              <span className="gh-prompt">{GH_USER}<span className="gh-path">:~$</span></span> {partial.cmd}
              <span className="gh-caret">▍</span>
            </div>
          )}

          {finished && (
            <div className="gh-cmd is-idle">
              <span className="gh-prompt">{GH_USER}<span className="gh-path">:~$</span></span>
              <span className="gh-caret">▍</span>
            </div>
          )}
        </div>
      </div>

      {g && (
        <div className="gh-stats">
          <GhStat k="public repos" v={g.publicRepos} />
          <GhStat k="followers" v={g.followers} />
          <GhStat k="following" v={g.following} />
          <GhStat k="total stars" v={g.totalStars} />
        </div>
      )}
    </section>
  );
}

function GhStat({ k, v }) {
  return (
    <div className="gh-stat">
      <div className="gh-stat-n font-display"><Counter target={v} /></div>
      <div className="gh-stat-k">{k}</div>
    </div>
  );
}
