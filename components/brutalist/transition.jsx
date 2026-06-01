"use client";

/* ============================================================
   transition.jsx — red curtain page transition
   - Starts REVEALED (no cover on load) so it never paints a
     full-screen red overlay during SSR / before hydration.
   - Intercepts clicks on [data-transition] links and plays a red
     panel wipe (slats) before navigating to another page.
============================================================ */

import { useEffect, useRef, useState } from "react";

export function PageTransition() {
  const overlayRef = useRef(null);
  // Start revealed/transparent. The boot sequence is the load intro; this
  // curtain only covers when navigating away via a [data-transition] link.
  const [cls, setCls] = useState('');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    return () => { document.removeEventListener('click', onClick); };
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
