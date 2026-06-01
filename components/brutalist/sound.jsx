"use client";

/* ============================================================
   sound.jsx — WebAudio UI sound design + mute toggle
   - Synth-generated (no asset files): tick, click, whoosh, boot
   - Default MUTED (sound is opt-in; autoplay is hostile)
   - Global window.sfx(type) so any component can trigger
============================================================ */

import { useEffect, useState } from "react";

const SFX = (() => {
  let ctx = null;
  let enabled = false;
  let master = null;

  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const tone = ({ freq = 440, type = 'sine', dur = 0.08, gain = 0.5, slideTo = null, delay = 0 }) => {
    if (!enabled) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };

  const noise = ({ dur = 0.18, gain = 0.25, hp = 800, delay = 0 }) => {
    if (!enabled) return;
    const c = ensure(); if (!c) return;
    const t0 = c.currentTime + delay;
    const frames = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, frames, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = c.createBufferSource(); src.buffer = buf;
    const filter = c.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = hp;
    const g = c.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter); filter.connect(g); g.connect(master);
    src.start(t0); src.stop(t0 + dur);
  };

  const play = (kind) => {
    switch (kind) {
      case 'tick':   tone({ freq: 2200, type: 'square', dur: 0.02, gain: 0.08 }); break;
      case 'hover':  tone({ freq: 1400, type: 'sine', dur: 0.04, gain: 0.06 }); break;
      case 'click':  tone({ freq: 660, type: 'triangle', dur: 0.07, gain: 0.18, slideTo: 1200 }); break;
      case 'whoosh': noise({ dur: 0.32, gain: 0.16, hp: 500 });
                     tone({ freq: 180, type: 'sine', dur: 0.34, gain: 0.10, slideTo: 520 }); break;
      case 'boot':   tone({ freq: 440, type: 'square', dur: 0.05, gain: 0.10 });
                     tone({ freq: 660, type: 'square', dur: 0.05, gain: 0.10, delay: 0.06 });
                     tone({ freq: 880, type: 'square', dur: 0.08, gain: 0.10, delay: 0.12 }); break;
      case 'confirm':tone({ freq: 880, type: 'sine', dur: 0.10, gain: 0.14, slideTo: 1320 }); break;
      default: break;
    }
  };

  return {
    play,
    setEnabled(v) { enabled = v; if (v) ensure(); try { localStorage.setItem('sfx', v ? '1' : '0'); } catch (e) {} },
    isEnabled() { return enabled; },
    initFromStorage() {
      try { enabled = localStorage.getItem('sfx') === '1'; } catch (e) {}
      return enabled;
    },
  };
})();

if (typeof window !== 'undefined') {
  window.sfx = (k) => SFX.play(k);
}

/* Toggle button — bottom-left, mirrors the Currently widget */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(SFX.initFromStorage());
  }, []);

  // Global delegated UI sounds (only fire when enabled)
  useEffect(() => {
    if (!on) return;
    const onOver = (e) => {
      const t = e.target.closest('a, button, [data-cursor="link"]');
      if (t && !t.dataset.sfxHovered) {
        t.dataset.sfxHovered = '1';
        SFX.play('hover');
        setTimeout(() => { delete t.dataset.sfxHovered; }, 120);
      }
    };
    const onClick = (e) => {
      const t = e.target.closest('a, button, [role=button], [data-cursor="link"]');
      if (t) SFX.play('click');
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('click', onClick);
    };
  }, [on]);

  const toggle = () => {
    const next = !on;
    SFX.setEnabled(next);
    setOn(next);
    if (next) SFX.play('confirm');
  };

  return (
    <button
      className={`sfx-toggle ${on ? 'is-on' : ''}`}
      onClick={toggle}
      data-cursor="link"
      aria-pressed={on}
      aria-label={on ? 'Mute interface sounds' : 'Enable interface sounds'}
      title={on ? 'Sound: ON' : 'Sound: OFF'}
    >
      <span className="sfx-bars" aria-hidden="true">
        <span /><span /><span /><span />
      </span>
      <span className="sfx-label">{on ? 'SND·ON' : 'SND·OFF'}</span>
    </button>
  );
}

export { SFX };
