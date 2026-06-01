# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # next dev — local development server (http://localhost:3000)
npm run build    # next build — production build (output: 'standalone')
npm run start    # next start — serve the production build
npm run lint     # eslint . (eslint-config-next)
npm run clean    # next clean
```

There is no test suite. `next.config.ts` sets `eslint.ignoreDuringBuilds: true` (lint failures do NOT block builds) but `typescript.ignoreBuildErrors: false` (type errors DO block builds) — so run `npm run lint` manually, and expect `npm run build` to fail on any TS error.

## What this is

A single-person portfolio site for Nishit Rana (backend engineer). Next.js 15 App Router + React 19 + TypeScript. It originated as a Google AI Studio applet (package name `ai-studio-applet`, `metadata.json`, and `.env.example`'s `GEMINI_API_KEY`/`APP_URL` are AI Studio artifacts) but the live design is a custom "brutalist" animated site deployed standalone. There is currently no AI/Gemini code wired up in the app — those env vars are vestigial.

## Architecture

### Two routes, server-renders-client pattern
- `app/page.tsx` (`/`) renders `<App>` from `components/brutalist/app.jsx`.
- `app/agxp/page.tsx` (`/agxp`) renders `<AgxpPage>` — the "AGXP" case-study detail page.

Both route files are thin **Server Components** that set `metadata` (SEO/OpenGraph) and render a `"use client"` component. This server-renders the markup into the initial HTML for SEO/link-previews, then hydrates on the client. **Critical constraint:** every interactive piece (WebGL, GSAP, live time, GitHub data) must initialize to a *stable default* and only update inside `useEffect`/effects — otherwise you get hydration mismatches. Preserve this when adding dynamic content.

### Animation libraries are UMD globals, not npm imports
`app/layout.tsx` loads Lenis, GSAP + ScrollTrigger, and Three.js via `<Script strategy="beforeInteractive">` from unpkg. Components access them as `window.Lenis`, `window.gsap`, `window.ScrollTrigger`, `window.THREE` — **there are no npm packages for these and no imports**. Always guard usage (`if (!window.gsap) return;`) because the script may not have loaded yet. Do not `npm install` gsap/three/lenis to "fix" a reference; that breaks the loading model.

The Lenis ↔ GSAP bridge is booted once in `App`'s effect via `bootGsapLenis()` (in `motion.jsx`), which drives Lenis from GSAP's ticker so smooth-scroll and ScrollTrigger share one clock. Anchor-link clicks (`a[href^="#"]`) are intercepted there and routed through `lenis.scrollTo`.

### Component layout (`components/brutalist/`)
All visual components are `.jsx` with `"use client"`. Each file has a header comment block describing its responsibility. Key files:
- **`lib.jsx`** — shared foundation: hooks (`useReduced`, `useCoarsePointer`, `useScrollY`, `useScrollProgress`, `useInView`, `useMagnetic`, `useTilt`), helpers (`clamp`, `lerp`, `mapRange`, `EASE` tokens), and the `Split` / `Reveal` text-reveal primitives. Import shared utilities from here.
- **`motion.jsx`** — GSAP/Lenis bridge + scroll-driven effects (`useGSAPPin` for pinned horizontal-scroll sections, `useClipReveal`, `ScrambleText`, `CodeReveal`).
- **`app.jsx`** — top-level `App`, the boot sequence overlay, blueprint grid, "Currently" widget, and the section ordering in `<main>`.
- **`webgl.jsx`** — Three.js scenes (hero `EdgeGlobe`/`EdgeNode`, project-card `SlotDistort` shader).
- **`status.jsx`** — live GitHub terminal: fetches real data from `api.github.com/users/nrana-pixel` (no auth), caches the last good response in `localStorage`, and falls back to a cached/`GH_FALLBACK` snapshot when offline or rate-limited. The `useGitHub` hook + `deriveGitHub` transform are the data layer; `Out*` components render each terminal block.
- Section components: `hero`, `mid` (marquee/experience/skills), `manifesto`, `arch` (AGXP scroll-scrubbed case study), `work` (projects/education/CTA/footer), `chapter` (dividers), `chrome` (cursor + nav), `transition`, `sound`, `kinetic`, `hooks`.

### Conventions to follow when editing
- **Always gate motion behind `useReduced()`** (`prefers-reduced-motion`) and skip pointer-driven effects on coarse pointers via `useCoarsePointer()`. Existing components fall back to a static/instant state when reduced.
- **Scroll listeners are shared.** `lib.jsx` runs one global `scroll` listener (`__scrollSubs`) and rAF-throttles it; subscribe via the provided hooks rather than adding new `window.addEventListener('scroll', ...)`.
- ScrollTrigger pins are skipped on mobile (`max-width: 760px`) — `useGSAPPin` returns early and CSS replaces the horizontal trap with a vertical stack.
- Styling is global CSS, not modules: `app/brutalist.css` (main site) and `app/agxp/agxp.css` (case study). Components use plain `className` strings and CSS custom properties (`var(--red)`, `var(--fg-4)`, etc.). Fonts are loaded from Google Fonts in `layout.tsx`.
- TypeScript path alias `@/*` maps to the repo root (e.g. `@/components/brutalist/app`).
