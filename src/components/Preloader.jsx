import { useState, useEffect, useRef } from 'react';

export const shared = { renderer:null, scene:null, camera:null, obj:null, raf:null, t:0, mouse:{x:0,y:0}, targetRot:{x:0,y:0}, animOwner:null };
export const getSharedRenderer = () => shared.renderer;
export const getSharedScene    = () => shared.scene;
export const getSharedCamera   = () => shared.camera;
export function buildScene() {}
export function tick() {}

export default function Preloader({ onDone }) {
  const mountRef = useRef(null);
  const [phase, setPhase]       = useState('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let animId, disposed = false;

    /* Wait one frame so the element has laid out */
    const startThree = () => {
    import('three').then((THREE) => {
      if (disposed) return;

      /* Use window size as fallback — element may not have clientWidth yet on mobile */
      const size = Math.min(340, window.innerWidth * 0.80);
      const W = size;
      const H = size;

      /* Force element size explicitly before renderer init */
      el.style.width  = W + 'px';
      el.style.height = H + 'px';

      /* ── Renderer — max performance ── */
      const renderer = new THREE.WebGLRenderer({
        antialias: true, alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = false;
      el.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, W / H, 0.1, 60);
      camera.position.z = 5.2;

      /* ── Lights ── */
      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      const key = new THREE.PointLight(0xff2200, 24, 16);
      key.position.set(3, 3, 5); scene.add(key);
      const fill = new THREE.PointLight(0xffffff, 7, 12);
      fill.position.set(-3, -1, 3); scene.add(fill);
      const top = new THREE.DirectionalLight(0xffffff, 0.7);
      top.position.set(0, 6, 4); scene.add(top);

      /* ── Shared materials ── */
      const matSteel = new THREE.MeshStandardMaterial({
        color: 0xb2b2b2, metalness: 0.97, roughness: 0.05,
        emissive: 0x0d0200, emissiveIntensity: 0.12,
      });
      const matDark = new THREE.MeshStandardMaterial({
        color: 0x222222, metalness: 0.99, roughness: 0.04,
        emissive: 0x050000, emissiveIntensity: 0.08,
      });
      const matCore = new THREE.MeshStandardMaterial({
        color: 0xff1100, emissive: 0xff2200, emissiveIntensity: 3.5,
        metalness: 0.1, roughness: 0.05,
      });
      const matShell = new THREE.MeshStandardMaterial({
        color: 0x181818, metalness: 0.96, roughness: 0.08,
        emissive: 0x0a0000, emissiveIntensity: 0.18,
      });
      const matWire  = new THREE.MeshBasicMaterial({ color: 0xff2200, wireframe: true, transparent: true, opacity: 0.10 });
      const matHalo  = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.08, side: THREE.BackSide });
      const matTickMaj = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.04 });
      const matTickMin = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.90, roughness: 0.08 });

      // Glow mats — modified each frame
      const matOuterGlow = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.65 });
      const matMidGlow   = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.48 });
      const matInnerGlow = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.35 });
      const matOrbitDot  = new THREE.MeshBasicMaterial({ color: 0xff2200 });
      const matOrbitDot2 = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const matOrbitHalo = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.16, side: THREE.BackSide });

      /* ── Root ── */
      const root = new THREE.Group();
      scene.add(root);

      /* ── OUTER PRECISION RING ── */
      root.add(new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.052, 16, 110), matDark));
      const outerGlowMesh = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.016, 6, 110), matOuterGlow);
      root.add(outerGlowMesh);

      // 36 precision tick marks (major every 9, minor every 3)
      for (let i = 0; i < 36; i++) {
        const a   = (i / 36) * Math.PI * 2;
        const maj = i % 9 === 0, med = i % 3 === 0;
        const len = maj ? 0.13 : med ? 0.07 : 0.04;
        const w   = maj ? 0.013 : 0.007;
        const mat = maj ? matTickMaj : matTickMin;
        const tick = new THREE.Mesh(new THREE.BoxGeometry(w, len, w * 0.8), mat);
        tick.position.set(Math.cos(a) * 1.52, Math.sin(a) * 1.52, 0);
        tick.rotation.z = a;
        root.add(tick);
      }

      /* ── MIDDLE GYRO RING — 55° tilt ── */
      const midGroup = new THREE.Group();
      midGroup.rotation.x = Math.PI * 0.305;
      midGroup.rotation.z = Math.PI * 0.08;
      root.add(midGroup);
      midGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.036, 14, 100), matSteel));
      const midGlowMesh = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.012, 6, 100), matMidGlow);
      midGroup.add(midGlowMesh);
      // Small notches on mid ring
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const notch = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.055, 0.006), matTickMin);
        notch.position.set(Math.cos(a) * 1.08, Math.sin(a) * 1.08, 0);
        notch.rotation.z = a;
        midGroup.add(notch);
      }

      /* ── INNER GYRO RING — perpendicular ── */
      const innerGroup = new THREE.Group();
      innerGroup.rotation.y = Math.PI * 0.5;
      innerGroup.rotation.x = Math.PI * 0.12;
      root.add(innerGroup);
      innerGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.026, 12, 84), matSteel));
      const innerGlowMesh = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.009, 6, 84), matInnerGlow);
      innerGroup.add(innerGlowMesh);

      /* ── CENTRAL ASSEMBLY ── */
      // Outer dark shell
      root.add(new THREE.Mesh(new THREE.SphereGeometry(0.285, 28, 28), matShell));
      // Wireframe icosahedron
      const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), matWire);
      root.add(wire);
      // Glowing core
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 18), matCore);
      root.add(core);
      // Halo
      root.add(new THREE.Mesh(new THREE.SphereGeometry(0.46, 14, 14), matHalo));

      /* ── 4 SPOKES from centre to ring ── */
      const matSpoke = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.97, roughness: 0.05 });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 1.18, 6), matSpoke);
        spoke.position.set(Math.cos(a) * 0.59, Math.sin(a) * 0.59, 0);
        spoke.rotation.z = a + Math.PI / 2;
        root.add(spoke);
      }

      /* ── ORBITING DOT on outer ring ── */
      const orbitGroup = new THREE.Group(); root.add(orbitGroup);
      const orbitDot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), matOrbitDot);
      const orbitHalo = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), matOrbitHalo);
      orbitDot.position.x = orbitHalo.position.x = 1.52;
      orbitGroup.add(orbitDot); orbitGroup.add(orbitHalo);

      /* ── SECOND ORBITING DOT on mid ring (white) ── */
      const orbitGroup2 = new THREE.Group();
      orbitGroup2.rotation.x = Math.PI * 0.305;
      orbitGroup2.rotation.z = Math.PI * 0.08;
      root.add(orbitGroup2);
      const orbitDot2 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), matOrbitDot2);
      orbitDot2.position.x = 1.08; orbitGroup2.add(orbitDot2);

      /* ── THIRD ORBITING DOT on inner ring (dim red) ── */
      const orbitGroup3 = new THREE.Group();
      orbitGroup3.rotation.y = Math.PI * 0.5;
      orbitGroup3.rotation.x = Math.PI * 0.12;
      root.add(orbitGroup3);
      const orbitDot3 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.8 }));
      orbitDot3.position.x = 0.66; orbitGroup3.add(orbitDot3);

      /* ── PARTICLES ── */
      const PC = 90, pPos = new Float32Array(PC * 3);
      for (let i = 0; i < PC; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        const r  = 1.72 + Math.random() * 0.9;
        pPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
        pPos[i*3+1] = r * Math.sin(ph) * Math.sin(th);
        pPos[i*3+2] = r * Math.cos(ph);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const particles = new THREE.Points(pGeo,
        new THREE.PointsMaterial({ color: 0xff3300, size: 0.012, transparent: true, opacity: 0.48, sizeAttenuation: true }));
      scene.add(particles);

      /* ── Resize ── */
      const onResize = () => {
        const newSize = Math.min(340, window.innerWidth * 0.80);
        el.style.width  = newSize + 'px';
        el.style.height = newSize + 'px';
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        renderer.setSize(newSize, newSize);
      };
      window.addEventListener('resize', onResize, { passive: true });

      /* ── Animation ── */
      let t = 0;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        t += 0.016;

        // Outer ring + ticks rotate slowly
        root.children.forEach(c => {
          if (c === midGroup || c === innerGroup || c === orbitGroup ||
              c === orbitGroup2 || c === orbitGroup3 || c === wire || c === core) return;
        });
        outerGlowMesh.rotation.z += 0.0028;

        // Mid ring spins opposite
        midGroup.rotation.z += 0.0065;
        orbitGroup2.rotation.z -= 0.026;

        // Inner ring perpendicular
        innerGroup.rotation.z  -= 0.010;
        orbitGroup3.rotation.z += 0.034;

        // Outer orbit dot
        orbitGroup.rotation.z += 0.018;

        // Shell + wire tumble
        wire.rotation.y += 0.005;
        wire.rotation.z += 0.003;

        // Root gentle sway
        root.rotation.y = Math.sin(t * 0.20) * 0.32;
        root.rotation.x = Math.sin(t * 0.14) * 0.14;

        // Core pulse
        const pulse = Math.sin(t * 2.6);
        matCore.emissiveIntensity = 2.8 + pulse * 1.1;
        core.scale.setScalar(1 + Math.abs(pulse) * 0.13);
        matHalo.opacity = 0.06 + Math.abs(pulse) * 0.10;
        matWire.opacity = 0.05 + Math.abs(Math.sin(t * 1.3)) * 0.08;

        // Glow flicker
        matOuterGlow.opacity = 0.52 + Math.sin(t * 1.7) * 0.20;
        matMidGlow.opacity   = 0.36 + Math.sin(t * 2.2 + 1.0) * 0.16;
        matInnerGlow.opacity = 0.26 + Math.sin(t * 2.9 + 2.1) * 0.13;

        // Key light pulse
        key.intensity = 20 + Math.sin(t * 1.9) * 6;

        // Particles
        particles.rotation.y += 0.0008;

        // Float
        root.position.y = Math.sin(t * 0.62) * 0.05;

        renderer.render(scene, camera);
      };
      animate();

      el._cleanup = () => {
        disposed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        scene.traverse(obj => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });
    }; /* end startThree */

    /* Wait for next frame so element has laid out on mobile */
    const raf = requestAnimationFrame(startThree);
    return () => { disposed = true; cancelAnimationFrame(raf); if (el._cleanup) el._cleanup(); };
  }, []);

  useEffect(() => {
    // Preload all critical images in the background while preloader is showing
    const criticalImages = [
      '/images/background/1.webp',
      '/images/background/2.webp',
      '/images/background/3.webp',
      '/images/team/yamuna-p.webp',
      '/images/team/pawan-simha-r.webp',
      '/images/team/asra-fathima.webp',
      '/images/team/nidhi-prasad-zalki.webp',
      '/images/team/sriram-paga.webp',
      '/images/team/yashwanth-y.webp',
      '/images/gallery/1.webp',
      '/images/gallery/2.webp',
      '/images/gallery/3.webp',
      '/images/gallery/4.webp',
      '/images/gallery/5.webp',
    ];
    criticalImages.forEach(src => { const img = new Image(); img.src = src; });

    const ts = [
      setTimeout(() => setProgress(12),  300),
      setTimeout(() => setProgress(28),  800),
      setTimeout(() => setProgress(45),  1400),
      setTimeout(() => setProgress(62),  2000),
      setTimeout(() => setProgress(78),  2700),
      setTimeout(() => setProgress(90),  3300),
      setTimeout(() => setProgress(96),  3800),
      setTimeout(() => setProgress(100), 4200),
    ];
    const exp = setTimeout(() => setPhase('expanding'), 4600);
    return () => { ts.forEach(clearTimeout); clearTimeout(exp); };
  }, []);

  useEffect(() => {
    if (phase !== 'expanding') return;
    const t = setTimeout(() => { setPhase('done'); onDone?.(); }, 900);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  if (phase === 'done') return null;

  const statusLabel =
    progress < 20  ? 'INITIALISING' :
    progress < 40  ? 'LOADING ASSETS' :
    progress < 60  ? 'BUILDING SCENE' :
    progress < 80  ? 'OPTIMISING' :
    progress < 95  ? 'ALMOST READY' :
                     'READY';

  return (
    <div className={`preloader-wrap preloader-${phase}`}>
      <div className="preloader-inner">
        <div className="preloader-model" ref={mountRef} />
        <div className="preloader-content">
          <div className="preloader-logo-text">YANTHRIKA</div>
          <div className="preloader-bar-wrap">
            <div className="preloader-bar-track">
              <div className="preloader-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="preloader-loading-label">{statusLabel} — {progress}%</div>
          </div>
        </div>
      </div>
      <div className="preloader-scanlines" />
    </div>
  );
}
