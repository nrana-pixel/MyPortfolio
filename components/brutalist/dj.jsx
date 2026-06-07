"use client";

/* ============================================================
   dj.jsx — Interactive DJ panel (full feature set)
   - /public/ambient.mp3 via MediaElementSourceNode (real waveform)
   - FFT frequency bars + oscilloscope overlay in one canvas
   - Beat flash on scope border (amplitude-triggered)
   - Two vinyl discs with scratch gesture (drag to pitch-bend)
   - Track title in disc label
   - Prev/next track navigation (add entries to TRACKS array)
   - Progress bar with seek-on-click
   - A-B loop region with draggable points
   - 5 knobs: LOW / MID / HIGH / VOL / PITCH
   - Crossfader (StereoPannerNode)
   - Tap tempo (controls disc spin speed)
   - Keyboard: SPACE=play/pause  [=−10s  ]=+10s
============================================================ */

import { useEffect, useRef, useState, useCallback } from "react";

/* Add more tracks here — they appear in the prev/next navigation */
const TRACKS = [
  { title: 'CALLING OUT YOUR NAME', artist: 'MANIA', src: '/music/calling-out-your-name.mp3' },
];

function fmt(s) {
  if (!s || !isFinite(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

/* ---- Vinyl disc with scratch support ---- */
function VinylDisc({ label, playing, side, bpm, trackTitle, trackArtist, onScratch }) {
  const discRef = useRef(null);

  useEffect(() => {
    const el = discRef.current; if (!el) return;
    let active = false, startX = 0;
    // Pointer events unify mouse + touch + pen so the scratch gesture works on
    // phones/tablets too (the .dj-disc has touch-action:none so the page won't scroll).
    const down = (e) => { active = true; startX = e.clientX; onScratch('start', 0); e.preventDefault(); };
    const move = (e) => { if (!active) return; onScratch('move', e.clientX - startX); };
    const up   = () => { if (!active) return; active = false; onScratch('end', 0); };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [onScratch]);

  const dur = `${((60 / bpm) * 4).toFixed(2)}s`;
  const label1 = trackTitle.slice(0, 9);

  return (
    <div className="dj-disc-wrap">
      <div ref={discRef} className={`dj-disc${playing ? ' is-playing' : ''}`}
        style={{ '--disc-dur': dur, cursor: 'grab' }} aria-hidden="true">
        <svg viewBox="0 0 80 80" width="80" height="80">
          {[36, 32, 28, 24, 20, 16, 12].map(r => (
            <circle key={r} cx="40" cy="40" r={r} fill="none"
              stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
          ))}
          <path d="M 26 18 A 22 22 0 0 1 54 18" fill="none"
            stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="40" cy="40" r="11.5" fill="#0d0d0d" stroke="rgba(255,0,0,0.3)" strokeWidth="0.75" />
          <circle cx="40" cy="40" r="2.5" fill="#FF0000" />
          <text x="40" y="34" textAnchor="middle"
            fill="rgba(245,245,245,0.38)" fontSize="3.2" fontFamily="Space Mono, monospace">{label1}</text>
          {trackArtist && (
            <text x="40" y="39.5" textAnchor="middle"
              fill="rgba(245,245,245,0.25)" fontSize="2.8" fontFamily="Space Mono, monospace">{trackArtist}</text>
          )}
          <text x="40" y="45.5" textAnchor="middle"
            fill="rgba(255,0,0,0.6)" fontSize="3.2" fontFamily="Space Mono, monospace">{side}</text>
        </svg>
      </div>
      <span className="dj-disc-label">{label}</span>
    </div>
  );
}

/* ---- Rotary knob — drag up/down ---- */
function Knob({ label, value, onChange }) {
  const elRef = useRef(null);
  const live  = useRef({ value, onChange });
  useEffect(() => { live.current = { value, onChange }; });

  const rot = ((value / 100) * 270 - 135).toFixed(1);

  useEffect(() => {
    const el = elRef.current; if (!el) return;
    let active = false, startY = 0, startVal = 0;
    // Pointer events so the knob can be dragged by touch as well as mouse
    // (.dj-knob has touch-action:none so dragging it won't scroll the page).
    const down = (e) => { active = true; startY = e.clientY; startVal = live.current.value; e.preventDefault(); };
    const move = (e) => {
      if (!active) return;
      live.current.onChange(Math.min(100, Math.max(0, startVal + (startY - e.clientY))));
    };
    const up = () => { active = false; };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  return (
    <div className="dj-knob-wrap">
      <div ref={elRef} className="dj-knob" role="slider" aria-label={label}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}
        style={{ '--krot': `${rot}deg` }} />
      <span className="dj-knob-label">{label}</span>
    </div>
  );
}

/* ---- Combined FFT bars + oscilloscope canvas ---- */
function Visualizer({ analyserRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const c2d = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let raf;
    let freqBuf = null, timeBuf = null;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      c2d.fillStyle = '#0A0A0A';
      c2d.fillRect(0, 0, W, H);

      const analyser = analyserRef.current;
      if (!analyser) {
        c2d.beginPath(); c2d.strokeStyle = 'rgba(255,0,0,0.15)'; c2d.lineWidth = 1;
        c2d.moveTo(0, H / 2); c2d.lineTo(W, H / 2); c2d.stroke();
        return;
      }

      // Lazy-allocate buffers once analyser is ready
      if (!freqBuf) {
        freqBuf = new Uint8Array(analyser.frequencyBinCount);
        timeBuf = new Uint8Array(analyser.fftSize);
      }

      // ── Frequency bars (bass-heavy focus: first 28% of bins) ──
      analyser.getByteFrequencyData(freqBuf);
      const barCount = 52;
      const usableBins = Math.floor(analyser.frequencyBinCount * 0.28);
      const barW = W / barCount;
      for (let i = 0; i < barCount; i++) {
        const bin = Math.floor((i / barCount) * usableBins);
        const v = freqBuf[bin] / 255;
        const bH = Math.max(1, v * H * 0.72);
        const grd = c2d.createLinearGradient(0, H - bH, 0, H);
        grd.addColorStop(0, `rgba(255,${Math.floor(v * 36)},0,${0.72 * v + 0.1})`);
        grd.addColorStop(1, 'rgba(100,0,0,0.06)');
        c2d.fillStyle = grd;
        c2d.fillRect(i * barW, H - bH, barW - 1, bH);
      }

      // ── Oscilloscope waveform line ──
      analyser.getByteTimeDomainData(timeBuf);
      const sliceW = W / timeBuf.length;
      let x = 0;

      // Glow pass
      c2d.beginPath(); c2d.strokeStyle = 'rgba(255,0,0,0.13)'; c2d.lineWidth = 7;
      for (let i = 0; i < timeBuf.length; i++) {
        const y = ((timeBuf[i] / 128) * H) / 2;
        i === 0 ? c2d.moveTo(x, y) : c2d.lineTo(x, y);
        x += sliceW;
      }
      c2d.stroke();

      // Sharp line
      x = 0;
      c2d.beginPath(); c2d.strokeStyle = '#FF0000'; c2d.lineWidth = 1.5;
      for (let i = 0; i < timeBuf.length; i++) {
        const y = ((timeBuf[i] / 128) * H) / 2;
        i === 0 ? c2d.moveTo(x, y) : c2d.lineTo(x, y);
        x += sliceW;
      }
      c2d.stroke();

      // ── Beat flash: red border when amplitude spikes ──
      let maxAmp = 0;
      for (let i = 0; i < timeBuf.length; i++) {
        const a = Math.abs(timeBuf[i] - 128);
        if (a > maxAmp) maxAmp = a;
      }
      if (maxAmp > 56) {
        const alpha = Math.min(0.85, ((maxAmp - 56) / 72) * 0.85);
        c2d.strokeStyle = `rgba(255,0,0,${alpha.toFixed(2)})`;
        c2d.lineWidth = 2;
        c2d.strokeRect(1, 1, W - 2, H - 2);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyserRef]);

  return (
    <canvas ref={canvasRef} className="dj-waveform-canvas"
      width={256} height={80} aria-hidden="true" />
  );
}

/* ---- Main DJ Panel ---- */
export function DJPanel({ open, onClose, getAudio }) {
  const [trackIdx,   setTrackIdx]   = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [scratching, setScratching] = useState(false);
  const [bpm,        setBpm]        = useState(124);
  const [eq,         setEq]         = useState({ low: 50, mid: 50, high: 50 });
  const [vol,        setVol]        = useState(75);
  const [pitch,      setPitch]      = useState(50);
  const [xfade,      setXfade]      = useState(50);
  const [progress,   setProgress]   = useState({ current: 0, duration: 0 });
  const [loop,       setLoop]       = useState({ on: false, a: 0, b: 100 });

  const analyserRef  = useRef(null);
  const nodesRef     = useRef(null);
  const tapsRef      = useRef([]);
  const loopRef      = useRef(loop);
  const scratchRef   = useRef({ startRate: 1 });
  useEffect(() => { loopRef.current = loop; }, [loop]);

  /* ── Build WebAudio chain once ──
     audioEl → srcNode → master → bass → mid → treble → panner → analyser → destination */
  const setupChain = useCallback(() => {
    if (nodesRef.current) return;
    const audio = getAudio();
    if (!audio) return;
    const { ctx, master } = audio;
    try { master.disconnect(); } catch (_) {}

    const bass = ctx.createBiquadFilter();
    bass.type = 'lowshelf'; bass.frequency.value = 200; bass.gain.value = 0;
    const mid = ctx.createBiquadFilter();
    mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1; mid.gain.value = 0;
    const treble = ctx.createBiquadFilter();
    treble.type = 'highshelf'; treble.frequency.value = 4000; treble.gain.value = 0;
    const panner = ctx.createStereoPanner(); panner.pan.value = 0;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.82;

    master.connect(bass); bass.connect(mid); mid.connect(treble);
    treble.connect(panner); panner.connect(analyser); analyser.connect(ctx.destination);

    const audioEl = new Audio(TRACKS[0].src);
    audioEl.loop = true;
    const srcNode = ctx.createMediaElementSource(audioEl);
    srcNode.connect(master);

    nodesRef.current = { ctx, master, bass, mid, treble, panner, analyser, audioEl, srcNode };
    analyserRef.current = analyser;
    // Apply vol default immediately
    master.gain.value = (75 / 100) * 0.36;
  }, [getAudio]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      const n = nodesRef.current; if (!n) return;
      try {
        n.audioEl.pause();
        n.srcNode.disconnect();
        n.bass.disconnect(); n.mid.disconnect(); n.treble.disconnect();
        n.panner.disconnect(); n.analyser.disconnect();
        n.master.disconnect(); n.master.connect(n.ctx.destination);
      } catch (_) {}
    };
  }, []);

  /* ── Open / close ── */
  useEffect(() => {
    if (open) { setupChain(); setPlaying(true); }
    else setPlaying(false);
  }, [open, setupChain]);

  /* ── Play / pause audio element ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    if (playing) { const p = n.audioEl.play(); if (p?.catch) p.catch(() => {}); }
    else n.audioEl.pause();
  }, [playing]);

  /* ── Track switching ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    const wasPlaying = !n.audioEl.paused;
    n.audioEl.pause();
    n.audioEl.src = TRACKS[trackIdx].src;
    n.audioEl.load();
    if (wasPlaying) { const p = n.audioEl.play(); if (p?.catch) p.catch(() => {}); }
  }, [trackIdx]);

  /* ── Progress tracking + A-B loop ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    const onTime = () => {
      const { currentTime: c, duration: d } = n.audioEl;
      setProgress({ current: c, duration: isNaN(d) ? 0 : d });
      if (loopRef.current.on && d > 0) {
        const end = (loopRef.current.b / 100) * d;
        if (c >= end) n.audioEl.currentTime = (loopRef.current.a / 100) * d;
      }
    };
    const onMeta = () => setProgress(p => ({ ...p, duration: n.audioEl.duration || 0 }));
    n.audioEl.addEventListener('timeupdate', onTime);
    n.audioEl.addEventListener('loadedmetadata', onMeta);
    return () => {
      n.audioEl.removeEventListener('timeupdate', onTime);
      n.audioEl.removeEventListener('loadedmetadata', onMeta);
    };
  }, [playing]);

  /* ── EQ ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    const db = v => ((v / 100) * 24) - 12;
    n.bass.gain.value = db(eq.low);
    n.mid.gain.value  = db(eq.mid);
    n.treble.gain.value = db(eq.high);
  }, [eq]);

  /* ── Volume → master gain ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    n.master.gain.value = (vol / 100) * 0.36;
  }, [vol]);

  /* ── Pitch → playback rate (skipped while scratching) ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n || scratching) return;
    n.audioEl.playbackRate = 0.75 + (pitch / 100) * 0.5;
  }, [pitch, scratching]);

  /* ── Crossfader → StereoPanner ── */
  useEffect(() => {
    const n = nodesRef.current; if (!n) return;
    n.panner.pan.value = (xfade - 50) / 50;
  }, [xfade]);

  /* ── Scratch (drag on disc to pitch-bend) ── */
  const handleScratch = useCallback((type, dx) => {
    const n = nodesRef.current; if (!n) return;
    if (type === 'start') {
      scratchRef.current.startRate = n.audioEl.playbackRate;
      setScratching(true);
    } else if (type === 'move') {
      n.audioEl.playbackRate = Math.max(0.05, Math.min(3.0, 1 + dx * 0.025));
    } else {
      n.audioEl.playbackRate = scratchRef.current.startRate;
      setScratching(false);
    }
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const n = nodesRef.current;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      else if (e.code === 'BracketLeft'  && n) n.audioEl.currentTime = Math.max(0, n.audioEl.currentTime - 10);
      else if (e.code === 'BracketRight' && n) n.audioEl.currentTime = Math.min(n.audioEl.duration || 0, n.audioEl.currentTime + 10);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  /* ── Tap tempo ── */
  const handleTap = () => {
    const now = Date.now();
    tapsRef.current.push(now);
    if (tapsRef.current.length > 4) tapsRef.current.shift();
    const t = tapsRef.current;
    if (t.length >= 2) {
      const avg = (t[t.length - 1] - t[0]) / (t.length - 1);
      const next = Math.round(60000 / avg);
      if (next >= 60 && next <= 180) setBpm(next);
    }
  };

  /* ── Seek on progress bar click ── */
  const handleSeek = (e) => {
    const n = nodesRef.current; if (!n || !progress.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    n.audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * progress.duration;
  };

  const togglePlay = () => { if (!nodesRef.current) setupChain(); setPlaying(p => !p); };
  const prevTrack  = () => setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length);
  const nextTrack  = () => setTrackIdx(i => (i + 1) % TRACKS.length);
  const track = TRACKS[trackIdx];
  const pct   = progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0;

  return (
    <div className={`dj-overlay${open ? ' is-open' : ''}`}
      role="dialog" aria-label="DJ Panel" aria-hidden={!open}>

      {/* ── Header ── */}
      <div className="dj-header">
        <div className="dj-hl">
          <span className="dj-dot" data-playing={playing ? '' : undefined} aria-hidden="true" />
          <span className="dj-title">DJ·NR</span>
          <div className="dj-track-info">
            <span className="dj-track-name">{track.title}</span>
            {track.artist && <span className="dj-track-artist">{track.artist}</span>}
          </div>
        </div>
        <div className="dj-hr">
          {TRACKS.length > 1 && (
            <>
              <button className="dj-nav" onClick={prevTrack} data-cursor="link" aria-label="Prev track">‹</button>
              <button className="dj-nav" onClick={nextTrack} data-cursor="link" aria-label="Next track">›</button>
            </>
          )}
          <button className="dj-tap" onClick={handleTap} data-cursor="link" title="Tap to sync disc speed">
            TAP·<span className="dj-bpm-val">{bpm}</span>
          </button>
          <button className={`dj-play${playing ? ' is-on' : ''}`} onClick={togglePlay}
            data-cursor="link" aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? '■' : '▶'}
          </button>
          <button className="dj-x" onClick={onClose} data-cursor="link" aria-label="Close DJ panel">×</button>
        </div>
      </div>

      <div className="dj-rule" />

      {/* ── Discs + visualizer ── */}
      <div className="dj-body">
        <VinylDisc label="DECK·A" playing={playing && !scratching} side="A"
          bpm={bpm} trackTitle={track.title} trackArtist={track.artist} onScratch={handleScratch} />
        <div className="dj-scope">
          <Visualizer analyserRef={analyserRef} />
        </div>
        <VinylDisc label="DECK·B" playing={playing && !scratching} side="B"
          bpm={bpm} trackTitle={track.title} trackArtist={track.artist} onScratch={handleScratch} />
      </div>

      <div className="dj-rule" />

      {/* ── Progress + loop ── */}
      <div className="dj-progress-row">
        <span className="dj-time">{fmt(progress.current)}</span>
        <div className="dj-progress-bar" onClick={handleSeek}
          role="slider" aria-label="Seek" aria-valuenow={Math.round(pct)}
          aria-valuemin={0} aria-valuemax={100}>
          {loop.on && (
            <div className="dj-loop-rgn"
              style={{ left: `${loop.a}%`, width: `${Math.max(0, loop.b - loop.a)}%` }} />
          )}
          <div className="dj-progress-fill" style={{ width: `${pct}%` }} />
          <div className="dj-playhead" style={{ left: `${pct}%` }} />
        </div>
        <span className="dj-time">{fmt(progress.duration)}</span>
        <button className={`dj-loop-btn${loop.on ? ' is-on' : ''}`}
          onClick={() => setLoop(l => ({ ...l, on: !l.on }))}
          data-cursor="link" title="Toggle A-B loop">⇄</button>
      </div>

      {loop.on && (
        <div className="dj-loop-pts">
          <span className="dj-xl">A</span>
          <input type="range" min={0} max={loop.b - 1} value={loop.a}
            onChange={e => setLoop(l => ({ ...l, a: Number(e.target.value) }))}
            aria-label="Loop start point" />
          <input type="range" min={loop.a + 1} max={100} value={loop.b}
            onChange={e => setLoop(l => ({ ...l, b: Number(e.target.value) }))}
            aria-label="Loop end point" />
          <span className="dj-xl">B</span>
        </div>
      )}

      <div className="dj-rule" />

      {/* ── Knobs + crossfader ── */}
      <div className="dj-foot">
        <div className="dj-eq">
          <Knob label="LOW"   value={eq.low}  onChange={v => setEq(p => ({ ...p, low:  v }))} />
          <Knob label="MID"   value={eq.mid}  onChange={v => setEq(p => ({ ...p, mid:  v }))} />
          <Knob label="HIGH"  value={eq.high} onChange={v => setEq(p => ({ ...p, high: v }))} />
          <Knob label="VOL"   value={vol}     onChange={setVol} />
          <Knob label="PITCH" value={pitch}   onChange={setPitch} />
        </div>
        <div className="dj-xfade">
          <span className="dj-xl">A</span>
          <input type="range" min={0} max={100} value={xfade}
            onChange={e => setXfade(Number(e.target.value))} aria-label="Crossfader" />
          <span className="dj-xl">B</span>
        </div>
      </div>

      {/* ── Keyboard hints ── */}
      <div className="dj-shortcuts">
        <div className="dj-sc-item"><kbd className="dj-key">SPACE</kbd><span>play</span></div>
        <div className="dj-sc-item"><kbd className="dj-key">[</kbd><span>−10s</span></div>
        <div className="dj-sc-item"><kbd className="dj-key">]</kbd><span>+10s</span></div>
        {scratching && <span className="dj-scratch-ind">SCRATCHING</span>}
      </div>
    </div>
  );
}
