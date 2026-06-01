"use client";

/* ============================================================
   chapter.jsx — Inter-section divider
   A thin red bar + chapter label that sweeps in from the right
   when scrolled into view. Visual spine for the page.
============================================================ */

import { useRef } from "react";
import { useInView } from "./lib";

export function Chapter({ no, label, sub }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.4 });
  return (
    <div ref={ref} className={`chapter ${seen ? 'is-in' : ''}`} aria-hidden="true">
      <div className="chapter-inner">
        <span className="chapter-no font-display">{no}</span>
        <span className="chapter-rule" />
        <span className="chapter-label font-display">{label}</span>
        {sub && <span className="chapter-sub mono-s">{sub}</span>}
        <span className="chapter-rule chapter-rule-end" />
        <span className="chapter-tick mono-s">▸</span>
      </div>
    </div>
  );
}
