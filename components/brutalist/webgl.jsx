"use client";

/* Gridline Velocity: cinematic network visuals stay sparse, signal-led, and performance-capped. */
/* ============================================================
   webgl.jsx — Three.js components (window.THREE UMD global)
   - EdgeNode      : hero background scene (wireframe icosahedron + orbiting cubes + particles)
   - SlotDistort   : project-card slot, shader-displaced plane (RGB shift + grid + scanlines)
   - DataCube / ServerRack / EdgeGlobe : alternate hero focal points
============================================================ */

import { useEffect, useRef } from "react";
import { clamp, useReduced, useCoarsePointer } from "./lib";

/* ---- EdgeNode — abstract "edge network" hero scene ---- */
export function EdgeNode({ className = '' }) {
  const canvasRef = useRef(null);
  const reduced = useReduced();
  const coarse = useCoarsePointer();

  useEffect(() => {
    if (!window.THREE) return;
    if (reduced) return;
    const T = window.THREE;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) { w = 400; h = 400; }
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    // ---- Wireframe icosahedron ----
    const icoGeo = new T.IcosahedronGeometry(1.55, 1);
    const wfGeo = new T.WireframeGeometry(icoGeo);
    const wfMat = new T.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.78 });
    const wf = new T.LineSegments(wfGeo, wfMat);
    scene.add(wf);

    // ---- Inner solid (black with faint outline) ----
    const innerGeo = new T.IcosahedronGeometry(0.78, 0);
    const innerMat = new T.MeshBasicMaterial({ color: 0x0a0a0a });
    const inner = new T.Mesh(innerGeo, innerMat);
    scene.add(inner);
    const innerWf = new T.LineSegments(new T.WireframeGeometry(innerGeo), new T.LineBasicMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.18 }));
    scene.add(innerWf);

    // ---- Orbiting cubes (data nodes) ----
    const cubes = [];
    const cubeCount = 9;
    for (let i = 0; i < cubeCount; i++) {
      const size = 0.08 + Math.random() * 0.06;
      const c = new T.Mesh(
        new T.BoxGeometry(size, size, size),
        new T.MeshBasicMaterial({ color: i % 3 === 0 ? 0xff0000 : 0xf5f5f5 })
      );
      c.userData = {
        a: (i / cubeCount) * Math.PI * 2,
        r: 2.3 + Math.random() * 0.5,
        yOff: (Math.random() - 0.5) * 1.4,
        speed: 0.003 + Math.random() * 0.004,
      };
      cubes.push(c);
      scene.add(c);
    }

    // ---- Particle dust ----
    const particles = new T.BufferGeometry();
    const N = 240;
    const positions = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i*3+0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
      positions[i*3+2] = r * Math.cos(phi);
    }
    particles.setAttribute('position', new T.BufferAttribute(positions, 3));
    const pMat = new T.PointsMaterial({ color: 0xf5f5f5, size: 0.018, transparent: true, opacity: 0.45, sizeAttenuation: true });
    const pts = new T.Points(particles, pMat);
    scene.add(pts);

    // ---- Mouse parallax ----
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    const onMove = (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 0.8;
      tmy = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    if (!coarse) window.addEventListener('mousemove', onMove);

    let raf;
    const tick = (now) => {
      const t = now * 0.0008;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

      wf.rotation.y = t * 0.6 + mx;
      wf.rotation.x = t * 0.4 + my * 0.6;
      inner.rotation.y = -t * 0.5 + mx * 0.3;
      inner.rotation.x = -t * 0.3 + my * 0.3;
      innerWf.rotation.copy(inner.rotation);

      pts.rotation.y = t * 0.06;
      pts.rotation.x = t * 0.03;

      cubes.forEach((c, i) => {
        c.userData.a += c.userData.speed;
        c.position.x = Math.cos(c.userData.a) * c.userData.r + mx * 0.4;
        c.position.y = c.userData.yOff + Math.sin(c.userData.a * 1.4 + i) * 0.4 + my * 0.3;
        c.position.z = Math.sin(c.userData.a) * c.userData.r * 0.55;
        c.rotation.x += 0.012;
        c.rotation.y += 0.014;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const nw = canvas.clientWidth, nh = canvas.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh, false);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      if (!coarse) window.removeEventListener('mousemove', onMove);
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      wfGeo.dispose(); icoGeo.dispose(); innerGeo.dispose();
      wfMat.dispose(); innerMat.dispose();
      particles.dispose(); pMat.dispose();
      cubes.forEach(c => { c.geometry.dispose(); c.material.dispose(); });
    };
  }, [reduced, coarse]);

  return <canvas ref={canvasRef} className={`edge-node ${className}`} aria-hidden="true" />;
}

/* ---- SlotDistort — shader plane for project card slots ---- */
export function SlotDistort({ no, label, codename, accent = 0xff0000 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reduced = useReduced();

  useEffect(() => {
    if (!window.THREE || reduced) return;
    const T = window.THREE;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let w = container.clientWidth, h = container.clientHeight;
    if (w === 0 || h === 0) { w = 400; h = 260; }
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime:   { value: 0 },
      uMouse:  { value: new T.Vector2(0.5, 0.5) },
      uHover:  { value: 0 },
      uAspect: { value: w / h },
      uAccent: { value: new T.Color(accent) },
    };

    const mat = new T.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uHover;
        uniform float uAspect;
        uniform vec3 uAccent;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i),               hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main() {
          vec2 uv = vUv;

          // aspect-correct mouse distance
          vec2 mp = uMouse;
          vec2 d2 = (uv - mp);
          d2.x *= uAspect;
          float d = length(d2);

          // displacement pull
          float pull = uHover * exp(-d * 5.5) * 0.10;
          uv -= (uv - mp) * pull;

          // grid
          vec2 g = abs(fract(uv * 30.0) - 0.5);
          float grid = smoothstep(0.46, 0.5, max(g.x, g.y)) * 0.18;

          // coarser grid
          vec2 g2 = abs(fract(uv * 6.0) - 0.5);
          float grid2 = smoothstep(0.48, 0.5, max(g2.x, g2.y)) * 0.10;

          // noise
          float n = noise(uv * 5.0 + uTime * 0.08) * 0.04;

          // scanline
          float scan = step(0.5, fract(uv.y * 110.0 + uTime * 0.7)) * 0.018;

          // hover glow near mouse
          float glow = uHover * exp(-d * 6.0) * 0.55;

          // RGB shift offset (chromatic aberration), aspect-corrected
          float shiftAmt = uHover * exp(-d * 5.0) * 0.012;
          vec2 shift = normalize(uv - mp + 1e-5) * shiftAmt;

          float gR = smoothstep(0.46, 0.5, max(abs(fract((uv + shift).x * 30.0) - 0.5), abs(fract((uv + shift).y * 30.0) - 0.5))) * 0.18;
          float gB = smoothstep(0.46, 0.5, max(abs(fract((uv - shift).x * 30.0) - 0.5), abs(fract((uv - shift).y * 30.0) - 0.5))) * 0.18;

          vec3 col = vec3(0.06);
          col += vec3(grid + grid2 + n + scan);
          col.r = mix(col.r, gR + n + scan, uHover);
          col.b = mix(col.b, gB + n + scan, uHover);
          col += uAccent * glow;

          // vignette
          float v = smoothstep(1.0, 0.3, length(vUv - 0.5));
          col *= 0.75 + v * 0.25;

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const plane = new T.Mesh(new T.PlaneGeometry(2, 2), mat);
    scene.add(plane);

    let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    let hover = 0, thover = 0;
    const onMove = (e) => {
      const r = container.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width;
      tmy = 1 - (e.clientY - r.top) / r.height;
    };
    const onEnter = () => { thover = 1; };
    const onLeave = () => { thover = 0; tmx = 0.5; tmy = 0.5; };
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    let raf;
    const tick = (now) => {
      mx += (tmx - mx) * 0.10;
      my += (tmy - my) * 0.10;
      hover += (thover - hover) * 0.08;
      uniforms.uTime.value  = now * 0.001;
      uniforms.uMouse.value.set(mx, my);
      uniforms.uHover.value = hover;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Pause the shader loop when the tab is hidden or the card is off-screen
    // (saves GPU/battery, especially on mobile where 3 of these stack).
    let visible = !document.hidden, onscreen = true;
    const setRunning = () => {
      const shouldRun = visible && onscreen;
      if (shouldRun && !raf) raf = requestAnimationFrame(tick);
      else if (!shouldRun && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const onVis = () => { visible = !document.hidden; setRunning(); };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver((entries) => {
      onscreen = entries[0].isIntersecting;
      setRunning();
    }, { threshold: 0 });
    io.observe(container);

    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh, false);
      uniforms.uAspect.value = nw / nh;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
      ro.disconnect();
      renderer.dispose();
      mat.dispose();
      plane.geometry.dispose();
    };
  }, [reduced, accent]);

  return (
    <div ref={containerRef} className="slot-distort" data-cursor="link">
      <canvas ref={canvasRef} className="slot-distort-canvas" />
      <div className="slot-distort-overlay">
        <div className="slot-distort-stamp mono-s" style={{color:'var(--red)'}}>FIG.0{Number(no)} / ASSET</div>
        <div className="slot-distort-label mono-s">{label}</div>
        <div className="slot-distort-glyph font-display" aria-hidden="true">{codename}</div>
      </div>
    </div>
  );
}

/* ============================================================
   EdgeGlobe — wireframe globe with pulsing POPs + arc connections
   The Cloudflare-network look. Reactive to cursor + auto rotation.
============================================================ */

// Real-ish CF POP cities (lat, lon, label)
const __EDGE_POPS = [
  [28.61, 77.21, 'DEL'], [19.07, 72.87, 'BOM'], [12.97, 77.59, 'BLR'], [22.57, 88.36, 'CCU'],
  [1.35, 103.81, 'SIN'], [13.75, 100.50, 'BKK'], [35.68, 139.69, 'NRT'], [37.56, 126.97, 'ICN'],
  [22.30, 114.16, 'HKG'], [25.27, 55.30, 'DXB'], [-33.86, 151.20, 'SYD'],
  [51.50, -0.12, 'LHR'], [48.85, 2.35, 'CDG'], [52.52, 13.40, 'FRA'], [55.75, 37.61, 'DME'],
  [41.00, 28.97, 'IST'], [59.93, 30.33, 'LED'],
  [40.71, -74.00, 'EWR'], [37.77, -122.41, 'SFO'], [41.87, -87.62, 'ORD'], [29.76, -95.36, 'IAH'],
  [34.05, -118.24, 'LAX'], [25.76, -80.19, 'MIA'], [43.65, -79.38, 'YYZ'],
  [-23.55, -46.63, 'GRU'], [-34.61, -58.38, 'EZE'], [-33.92, 18.42, 'CPT'], [6.52, 3.38, 'LOS'],
];

function __latLonToVec3(lat, lon, r, T) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new T.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

export function EdgeGlobe({ className = '', onStats }) {
  const canvasRef = useRef(null);
  const reduced = useReduced();
  const coarse  = useCoarsePointer();

  useEffect(() => {
    if (!window.THREE) return;
    if (reduced) return;
    const T = window.THREE;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) { w = 480; h = 600; }

    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const root = new T.Group();
    scene.add(root);
    // Slight tilt
    root.rotation.x = 0.32;
    root.rotation.z = -0.08;

    const R = 1.7;

    // ---- Wireframe globe (latitude + longitude lines) ----
    const sphereGeo = new T.SphereGeometry(R, 32, 18);
    const wireMat = new T.LineBasicMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.18 });
    const wireGlobe = new T.LineSegments(new T.WireframeGeometry(sphereGeo), wireMat);
    root.add(wireGlobe);

    // Faint solid inner sphere (occlude back faces a touch)
    const solidGeo = new T.SphereGeometry(R * 0.985, 48, 28);
    const solidMat = new T.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.92 });
    const solid = new T.Mesh(solidGeo, solidMat);
    root.add(solid);

    // ---- Bold equator + prime meridian ----
    const ringGeo = new T.TorusGeometry(R, 0.004, 6, 96);
    const ringMat = new T.MeshBasicMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.42 });
    const eq = new T.Mesh(ringGeo, ringMat);
    eq.rotation.x = Math.PI / 2;
    root.add(eq);
    const mer = new T.Mesh(ringGeo, ringMat);
    root.add(mer);

    // Gridline Velocity: a slim orbital signal gives the globe a clearer
    // directional rhythm without adding another scene or expensive geometry.
    const orbitGeo = new T.TorusGeometry(R * 1.27, 0.006, 5, 128);
    const orbitMat = new T.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.34 });
    const orbit = new T.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = 1.03;
    orbit.rotation.y = -0.42;
    root.add(orbit);

    // ---- POPs ----
    const popsGroup = new T.Group();
    root.add(popsGroup);
    const pops = [];
    const popGeo = new T.SphereGeometry(0.028, 12, 10);
    const popHaloGeo = new T.RingGeometry(0.04, 0.06, 24);
    for (let i = 0; i < __EDGE_POPS.length; i++) {
      const [lat, lon] = __EDGE_POPS[i];
      const pos = __latLonToVec3(lat, lon, R * 1.005, T);
      const isAccent = i % 3 === 0;
      const mat = new T.MeshBasicMaterial({ color: isAccent ? 0xff0000 : 0xf5f5f5 });
      const dot = new T.Mesh(popGeo, mat);
      dot.position.copy(pos);
      popsGroup.add(dot);

      // Halo ring facing outward
      const haloMat = new T.MeshBasicMaterial({ color: isAccent ? 0xff0000 : 0xf5f5f5, transparent: true, opacity: 0.0, side: T.DoubleSide });
      const halo = new T.Mesh(popHaloGeo, haloMat);
      halo.position.copy(pos);
      halo.lookAt(new T.Vector3(0, 0, 0));
      halo.scale.setScalar(1);
      popsGroup.add(halo);

      pops.push({
        dot, mat, halo, haloMat, pos: pos.clone(),
        phase: Math.random() * Math.PI * 2,
        isAccent,
      });
    }

    // ---- Arc connections (great-circle quadratic bezier) ----
    const ARC_POOL = 5;
    const arcs = [];
    const arcMat = new T.LineBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 });
    const arcMatW = new T.LineBasicMaterial({ color: 0xf5f5f5, transparent: true, opacity: 0.6 });
    const arcEnd = new T.MeshBasicMaterial({ color: 0xff0000 });

    const spawnArc = () => {
      const a = pops[Math.floor(Math.random() * pops.length)].pos;
      const b = pops[Math.floor(Math.random() * pops.length)].pos;
      if (a.equals(b)) return null;
      // mid point lifted outward
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * (1.18 + a.distanceTo(b) * 0.06));
      const curve = new T.QuadraticBezierCurve3(a.clone(), mid, b.clone());
      const SEGMENTS = 48;
      const points = curve.getPoints(SEGMENTS);
      const geo = new T.BufferGeometry().setFromPoints(points);
      geo.setDrawRange(0, 0);
      const accent = Math.random() < 0.7;
      const line = new T.Line(geo, accent ? arcMat.clone() : arcMatW.clone());
      // travelling endpoint marker
      const endDot = new T.Mesh(new T.SphereGeometry(0.025, 10, 8), arcEnd.clone());
      line.material.opacity = 0;
      root.add(line);
      root.add(endDot);
      return {
        line, geo, endDot,
        curve, segments: SEGMENTS,
        t0: performance.now(),
        life: 1500 + Math.random() * 900,
      };
    };

    // ---- Mouse / scroll ----
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let scrollAmt = 0;
    let cursorX = -9999, cursorY = -9999;
    const onMove = (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 1.6;
      tmy = (e.clientY / window.innerHeight - 0.5) * 1.0;
      cursorX = e.clientX; cursorY = e.clientY;
    };
    const onScroll = () => { scrollAmt = window.scrollY; };
    if (!coarse) window.addEventListener('mousemove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    const _proj = new T.Vector3();

    let raf;
    let lastSpawn = 0;
    let lastRoute = ['DEL', 'SFO'];
    let lastEmit = 0;
    const tick = (now) => {
      const t = now * 0.001;

      // mouse rotation + auto drift + scroll tilt
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      root.rotation.y = t * 0.06 + mx * 0.9;
      root.rotation.x = 0.32 + my * 0.4 - Math.min(scrollAmt * 0.0002, 0.3);
      orbit.rotation.z = -t * 0.16;
      orbitMat.opacity = 0.2 + Math.sin(t * 1.1) * 0.11;

      // cursor position relative to canvas, for proximity glow
      const rect = canvas.getBoundingClientRect();
      const cxLocal = cursorX - rect.left;
      const cyLocal = cursorY - rect.top;
      const cursorOn = cursorX > -9000 && rect.width > 0;
      const GLOW_R = Math.min(rect.width, rect.height) * 0.28;

      // POP pulse + cursor proximity
      for (let i = 0; i < pops.length; i++) {
        const p = pops[i];
        const k = (Math.sin(t * 1.6 + p.phase) + 1) * 0.5;
        let glow = 0;
        if (cursorOn) {
          // project world pos → screen
          p.dot.getWorldPosition(_proj);
          _proj.project(camera);
          const sx = (_proj.x * 0.5 + 0.5) * rect.width;
          const sy = (-_proj.y * 0.5 + 0.5) * rect.height;
          const front = _proj.z < 1;
          if (front) {
            const dist = Math.hypot(sx - cxLocal, sy - cyLocal);
            if (dist < GLOW_R) glow = Math.pow(1 - dist / GLOW_R, 2);
          }
        }
        p.mat.opacity = clamp(0.5 + k * 0.5 + glow * 0.6, 0, 1);
        const sc = 1 + glow * 1.8;
        p.dot.scale.setScalar(sc);
        // accent any POP the cursor is near, even non-accent ones
        if (glow > 0.35 && !p.isAccent) p.mat.color.setRGB(1, 1 - glow * 0.7, 1 - glow * 0.7);
        else if (!p.isAccent) p.mat.color.setRGB(0.96, 0.96, 0.96);
        // Halo expanding (boosted near cursor)
        const cycle = ((t * 0.7 + p.phase) % 1);
        const hScale = 1 + cycle * 1.6 + glow * 1.2;
        p.halo.scale.setScalar(hScale);
        p.haloMat.opacity = (1 - cycle) * (p.isAccent ? 0.55 : 0.25) + glow * 0.5;
      }

      // Arcs — draw, then fade, then dispose
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        const elapsed = now - a.t0;
        const k = clamp(elapsed / a.life, 0, 1);
        const ease = 1 - Math.pow(1 - k, 3);
        a.geo.setDrawRange(0, Math.floor(ease * (a.segments + 1)));
        a.line.material.opacity = k < 0.7 ? 0.85 : 0.85 * (1 - (k - 0.7) / 0.3);
        // travelling endpoint
        const pt = a.curve.getPoint(ease);
        a.endDot.position.copy(pt);
        a.endDot.material.opacity = k < 0.85 ? 1 : 1 - (k - 0.85) / 0.15;
        a.endDot.material.transparent = true;

        if (k >= 1) {
          root.remove(a.line);
          root.remove(a.endDot);
          a.geo.dispose();
          a.line.material.dispose();
          a.endDot.geometry.dispose();
          a.endDot.material.dispose();
          arcs.splice(i, 1);
        }
      }
      if (arcs.length < ARC_POOL && now - lastSpawn > 280) {
        const a = pops[Math.floor(Math.random() * pops.length)];
        const b = pops[Math.floor(Math.random() * pops.length)];
        const arc = spawnArc();
        if (arc) {
          arcs.push(arc);
          lastRoute = [__EDGE_POPS[pops.indexOf(a)][2], __EDGE_POPS[pops.indexOf(b)][2]];
        }
        lastSpawn = now;
      }
      // Emit live stats every ~220ms
      if (onStats && now - lastEmit > 220) {
        onStats({
          pops: pops.length,
          arcs: arcs.length,
          route: lastRoute,
          tilt: ((root.rotation.y % (Math.PI * 2)) * 180 / Math.PI),
          ts: now,
        });
        lastEmit = now;
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Pause the render loop when the tab is hidden or the globe is scrolled
    // off-screen — this is the heaviest loop on the page.
    let visible = !document.hidden, onscreen = true;
    const setRunning = () => {
      const shouldRun = visible && onscreen;
      if (shouldRun && !raf) raf = requestAnimationFrame(tick);
      else if (!shouldRun && raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    const onVis = () => { visible = !document.hidden; setRunning(); };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver((entries) => {
      onscreen = entries[0].isIntersecting;
      setRunning();
    }, { threshold: 0 });
    io.observe(canvas);

    const onResize = () => {
      const nw = canvas.clientWidth, nh = canvas.clientHeight;
      if (!nw || !nh) return;
      renderer.setSize(nw, nh, false);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      if (!coarse) window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
      ro.disconnect();
      arcs.forEach(a => {
        a.geo.dispose();
        a.line.material.dispose();
        a.endDot.geometry.dispose();
        a.endDot.material.dispose();
      });
      pops.forEach(p => {
        p.mat.dispose(); p.haloMat.dispose();
      });
      popGeo.dispose(); popHaloGeo.dispose();
      sphereGeo.dispose(); wireMat.dispose();
      solidGeo.dispose(); solidMat.dispose();
      ringGeo.dispose(); ringMat.dispose();
      orbitGeo.dispose(); orbitMat.dispose();
      arcMat.dispose(); arcMatW.dispose(); arcEnd.dispose();
      renderer.dispose();
    };
  }, [reduced, coarse, onStats]);

  return <canvas ref={canvasRef} className={`edge-globe ${className}`} aria-hidden="true" />;
}
