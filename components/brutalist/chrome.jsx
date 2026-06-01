"use client";

/* ============================================================
   BRUTALIST — Crosshair cursor + Nav
============================================================ */

import { useEffect, useRef, useState } from "react";
import { lerp, useReduced, useCoarsePointer } from "./lib";

const SECT = [
  { id: 'hero',       label: 'Top' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills',     label: 'Skills' },
  { id: 'projects',   label: 'Projects' },
  { id: 'education',  label: 'Education' },
  { id: 'contact',    label: 'Contact' },
];

export function CrosshairCursor() {
  const cursor = useRef(null);
  const ring   = useRef(null);
  const coarse  = useCoarsePointer();
  const reduced = useReduced();

  useEffect(() => {
    if (coarse || reduced) return;
    document.documentElement.classList.add('has-xh');
    let raf;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;
    let isLink = false, isPress = false;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onOver = (e) => {
      const t = e.target.closest('[data-cursor], a, button, [role=button]');
      isLink = !!t && (t.getAttribute('data-cursor') !== 'none');
    };
    const onDown = () => { isPress = true; };
    const onUp   = () => { isPress = false; };
    const tick = () => {
      dx = lerp(dx, mx, 0.55); dy = lerp(dy, my, 0.55);
      rx = lerp(rx, mx, 0.20); ry = lerp(ry, my, 0.20);
      if (cursor.current) {
        const s = isPress ? 0.6 : 1;
        cursor.current.style.transform = `translate3d(${dx - 14}px, ${dy - 14}px, 0) scale(${s})`;
        cursor.current.classList.toggle('is-link',  isLink);
        cursor.current.classList.toggle('is-press', isPress);
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
        ring.current.classList.toggle('is-link', isLink);
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove('has-xh');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(raf);
    };
  }, [coarse, reduced]);

  if (coarse || reduced) return null;
  return (
    <>
      <div ref={ring}   className="xh-ring"   />
      <div ref={cursor} className="xh-cursor" />
    </>
  );
}

/* ---- Top nav with scrolled state + active section detection ---- */
export function Nav() {
  const [active, setActive]     = useState('hero');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      });
      if (best && best.isIntersecting) setActive(best.target.id);
    }, { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    SECT.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    const onS = () => setScrolled(window.scrollY > 32);
    onS();
    window.addEventListener('scroll', onS, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onS); };
  }, []);

  return (
    <header className="nav" data-scrolled={scrolled ? 'true' : 'false'}>
      <a href="#hero" data-cursor="link" className="nav-mark">NISHIT RANA</a>
      <nav className="nav-links">
        <a href="#experience" data-cursor="link" className={active === 'experience' ? 'is-active' : ''}>Experience</a>
        <a href="#skills"     data-cursor="link" className={active === 'skills' ? 'is-active' : ''}>Skills</a>
        <a href="#projects"   data-cursor="link" className={active === 'projects' ? 'is-active' : ''}>Projects</a>
        <a href="#education"  data-cursor="link" className={active === 'education' ? 'is-active' : ''}>Education</a>
      </nav>
      <a href="mailto:nrana4148@gmail.com" data-cursor="link" className="nav-cta">
        <span>CONTACT ME</span>
      </a>
    </header>
  );
}
