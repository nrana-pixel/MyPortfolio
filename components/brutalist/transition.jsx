"use client";

/* ============================================================
   transition.jsx — red curtain page transition
   - Intercepts clicks on [data-transition] links
   - Plays a red panel wipe (slats), then navigates
   - On a fresh page load, plays the reverse wipe (reveal)
============================================================ */

import { useEffect, useRef, useState } from "react";

export function PageTransition() {
  const overlayRef = useRef(null);
  // start covered on load so we can retract-reveal
  const [cls, setCls] = useState('is-cover is-instant');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setCls(''); return; }

    // Reveal: drop the instant flag, then retract the slats upward
    let r1 = requestAnimationFrame(() => {
      let r2 = requestAnimationFrame(() => setCls('is-reveal'));
      overlayRef.current && (overlayRef.current._r2 = r2);
    });

    const onClick = (e) => {
      const a = e.target.closest('a[data-transition]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || a.target === '_blank') return;
      e.preventDefault();
      if (window.sfx) window.sfx('whoosh');
      const overlay = overlayRef.current;
      const label = overlay && overlay.querySelector('.pt-label');
      if (label) label.textContent = a.dataset.transitionLabel || 'LOADING';
      if (reduced) { window.location.href = href; return; }
      setCls('is-cover');
      setTimeout(() => { window.location.href = href; }, 760);
    };
    document.addEventListener('click', onClick);
    return () => { cancelAnimationFrame(r1); document.removeEventListener('click', onClick); };
  }, []);

  return (
    <div ref={overlayRef} className={`pt ${cls}`} aria-hidden="true">
      <div className="pt-slats">
        <span className="pt-slat" /><span className="pt-slat" /><span className="pt-slat" />
        <span className="pt-slat" /><span className="pt-slat" /><span className="pt-slat" />
      </div>
      <div className="pt-center">
        <span className="pt-mark font-display">NR</span>
        <span className="pt-label mono-s">LOADING</span>
      </div>
    </div>
  );
}
