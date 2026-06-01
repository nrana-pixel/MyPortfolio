"use client";

import dynamic from "next/dynamic";

// The brutalist portfolio is a fully client-rendered experience (Three.js,
// GSAP ScrollTrigger, Lenis, live time / GitHub data). Render it client-side
// only to avoid SSR/hydration mismatches.
const App = dynamic(() => import("@/components/brutalist/app"), { ssr: false });

export default function Page() {
  return <App />;
}
