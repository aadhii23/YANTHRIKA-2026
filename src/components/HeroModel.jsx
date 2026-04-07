import React, { useEffect, useRef } from 'react';

export default function HeroModel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let animId, disposed = false;

    import('three').then((THREE) => {
      if (disposed) return;

      const W = el.clientWidth  || 500;
      const H = el.clientHeight || 500;

      /* ── Renderer ── */
      const renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2, // skip AA on retina — saves ~40% GPU
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap at 1.5
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 2.2;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const scene  = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
      camera.position.set(0, 0.4, 7.2);

      /* ── PMREMGenerator — build env map from a simple lit box scene ── */
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      // Build a simple room-like env scene: coloured rect lights on each wall
      const envScene = new THREE.Scene();
      const addPanel = (color, intensity, x, y, z, rx, ry) => {
        const light = new THREE.Mesh(
          new THREE.PlaneGeometry(4, 4),
          new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
        );
        light.position.set(x, y, z);
        light.rotation.set(rx, ry, 0);
        envScene.add(light);
      };
      addPanel(0xfff5e0, 1,  0,  6,  0, -Math.PI/2, 0);   // warm top
      addPanel(0xffffff, 1,  0, -6,  0,  Math.PI/2, 0);   // cool bottom
      addPanel(0xffd0a0, 1,  6,  0,  0,  0, -Math.PI/2);  // warm right
      addPanel(0xc8d8ff, 1, -6,  0,  0,  0,  Math.PI/2);  // cool blue left
      addPanel(0xffffff, 1,  0,  0, -6,  0, Math.PI);     // back
      addPanel(0xff4400, 0.3, 0,  0,  6,  0, 0);          // red front glow

      const envTexture = pmrem.fromScene(envScene).texture;
      scene.environment = envTexture;
      pmrem.dispose();

      /* ── Lights — minimal, env map does the heavy lifting ── */
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));

      const keyLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
      keyLight.position.set(6, 10, 8);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xc8d8ff, 1.2);
      fillLight.position.set(-8, -2, 4);
      scene.add(fillLight);

      const redCore = new THREE.PointLight(0xff2200, 40, 10);
      redCore.position.set(0, 0, 2);
      scene.add(redCore);

      const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
      rimLight.position.set(0, -6, -4);
      scene.add(rimLight);

      /* ── PBR Materials ── */
      // Polished machined steel — like a crankshaft
      const mSteel = new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        metalness: 1.0,
        roughness: 0.12,
        envMapIntensity: 2.5,
      });
      // Darker steel for recessed parts
      const mDarkSteel = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 1.0,
        roughness: 0.25,
        envMapIntensity: 2.0,
      });
      // Brass — like real gear bushings
      const mBrass = new THREE.MeshStandardMaterial({
        color: 0xc8820a,
        metalness: 0.95,
        roughness: 0.18,
        envMapIntensity: 2.2,
      });
      // Red glowing core
      const mRedGlow = new THREE.MeshStandardMaterial({
        color: 0xff1800,
        emissive: 0xff1800,
        emissiveIntensity: 3.5,
        metalness: 0.0,
        roughness: 0.3,
      });
      // Red accent — like anodised aluminium
      const mRedAnodised = new THREE.MeshStandardMaterial({
        color: 0xcc2200,
        emissive: 0x440000,
        emissiveIntensity: 0.4,
        metalness: 0.8,
        roughness: 0.2,
        envMapIntensity: 1.8,
      });


      /* ══════════════════════════════════════
         GEAR BUILDER — realistic involute profile
      ══════════════════════════════════════ */
      function buildGear({ teeth, outerR, innerR, toothH, thick, mat, spokes = 0 }) {
        const g = new THREE.Group();
        const total = teeth * 2;
        const shape = new THREE.Shape();

        for (let i = 0; i < total; i++) {
          const a0 = (i / total) * Math.PI * 2;
          const a1 = ((i + 1) / total) * Math.PI * 2;
          const isTop = i % 2 === 0;
          const r  = isTop ? outerR : outerR - toothH;
          const rn = isTop ? outerR - toothH : outerR;
          const chamfer = (Math.PI * 2 / total) * 0.15;
          if (i === 0) shape.moveTo(Math.cos(a0 + chamfer) * r, Math.sin(a0 + chamfer) * r);
          shape.lineTo(Math.cos(a1 - chamfer) * r,  Math.sin(a1 - chamfer) * r);
          shape.lineTo(Math.cos(a1 + chamfer) * rn, Math.sin(a1 + chamfer) * rn);
        }
        shape.closePath();

        // Bore
        const bore = new THREE.Path();
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          i === 0
            ? bore.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR)
            : bore.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
        }
        shape.holes.push(bore);

        const geo = new THREE.ExtrudeGeometry(shape, {
          depth: thick,
          bevelEnabled: true,
          bevelThickness: 0.055,
          bevelSize: 0.04,
          bevelSegments: 4,
        });
        geo.center();
        g.add(new THREE.Mesh(geo, mat));

        // Spokes — tapered like real gears
        for (let i = 0; i < spokes; i++) {
          const a = (i / spokes) * Math.PI * 2 + Math.PI / spokes;
          const spokeLen = outerR - innerR - toothH - 0.1;
          const mid = innerR + spokeLen / 2 + 0.05;
          const sp = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, spokeLen, thick * 0.72),
            mDarkSteel
          );
          sp.position.set(Math.cos(a) * mid, Math.sin(a) * mid, 0);
          sp.rotation.z = a;
          g.add(sp);
        }

        // Hub cylinder
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(innerR * 0.9, innerR * 0.9, thick * 1.55, 32),
          mDarkSteel
        );
        hub.rotation.x = Math.PI / 2;
        g.add(hub);

        // Brass bushing rings on both faces
        [-thick * 0.52, thick * 0.52].forEach(z => {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(innerR * 0.9, 0.042, 12, 40),
            mBrass
          );
          ring.position.z = z;
          g.add(ring);
        });

        // Red anodised axle
        const axle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.075, 0.075, thick * 2.4, 16),
          mRedAnodised
        );
        axle.rotation.x = Math.PI / 2;
        g.add(axle);

        return g;
      }

      /* ── Scene assembly ── */
      const root = new THREE.Group();
      scene.add(root);

      const gearMain   = buildGear({ teeth:20, outerR:1.68, innerR:0.46, toothH:0.21, thick:0.36, mat:mSteel,     spokes:6 });
      const gearMid    = buildGear({ teeth:12, outerR:1.02, innerR:0.26, toothH:0.17, thick:0.30, mat:mDarkSteel, spokes:4 });
      const gearSmall  = buildGear({ teeth:8,  outerR:0.66, innerR:0.17, toothH:0.13, thick:0.26, mat:mSteel,     spokes:3 });
      const gearAccent = buildGear({ teeth:7,  outerR:0.56, innerR:0.14, toothH:0.11, thick:0.22, mat:mBrass,     spokes:3 });

      gearMid.position.set(2.56, 1.48, 0.04);
      gearSmall.position.set(2.22, -1.38, 0.03);
      gearAccent.position.set(-2.12, 1.24, -0.06);

      root.add(gearMain, gearMid, gearSmall, gearAccent);

      /* ── Glowing core ── */
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 2), mRedGlow);
      const coreHalo = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16),
        new THREE.MeshBasicMaterial({ color:0xff2200, transparent:true, opacity:0.07, side:THREE.BackSide }));
      const coreWire = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1),
        new THREE.MeshBasicMaterial({ color:0xff3300, wireframe:true, transparent:true, opacity:0.14 }));
      root.add(core, coreHalo, coreWire);

      /* ── Outer precision ring ── */
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(2.26, 0.046, 18, 120), mDarkSteel);
      const outerGlow = new THREE.Mesh(new THREE.TorusGeometry(2.26, 0.014, 8, 120),
        new THREE.MeshBasicMaterial({ color:0xff2200, transparent:true, opacity:0.55 }));
      root.add(outerRing, outerGlow);

      // Tick marks
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const maj = i % 12 === 0, med = i % 4 === 0;
        const tick = new THREE.Mesh(
          new THREE.BoxGeometry(maj?0.018:0.009, maj?0.14:med?0.08:0.045, 0.01),
          maj ? mBrass : mDarkSteel
        );
        tick.position.set(Math.cos(a)*2.26, Math.sin(a)*2.26, 0.18);
        tick.rotation.z = a;
        root.add(tick);
      }

      /* ── Orbiting dot ── */
      const orbitGroup = new THREE.Group();
      root.add(orbitGroup);
      const orbitDot = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), mRedGlow);
      orbitDot.position.x = 2.26;
      const orbitHalo = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshBasicMaterial({ color:0xff2200, transparent:true, opacity:0.22, side:THREE.BackSide }));
      orbitHalo.position.x = 2.26;
      orbitGroup.add(orbitDot, orbitHalo);

      /* ── Tilted orbit ring ── */
      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.x = Math.PI * 0.32;
      tiltGroup.rotation.z = Math.PI * 0.08;
      root.add(tiltGroup);
      tiltGroup.add(new THREE.Mesh(
        new THREE.TorusGeometry(2.58, 0.012, 6, 100),
        new THREE.MeshBasicMaterial({ color:0xff2200, transparent:true, opacity:0.2 })
      ));
      const tiltDot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.9 }));
      tiltDot.position.x = 2.58;
      const tiltSpin = new THREE.Group();
      tiltSpin.rotation.x = Math.PI * 0.32;
      tiltSpin.rotation.z = Math.PI * 0.08;
      tiltSpin.add(tiltDot);
      root.add(tiltSpin);

      /* ── Connecting rods ── */
      [[0,0,2.56,1.48],[0,0,2.22,-1.38],[0,0,-2.12,1.24]].forEach(([x1,y1,x2,y2]) => {
        const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,len,8), mDarkSteel);
        rod.position.set((x1+x2)/2,(y1+y2)/2,0);
        rod.rotation.z = Math.atan2(dy,dx)+Math.PI/2;
        root.add(rod);
      });

      /* ── Particles ── */
      const PC=70, pPos=new Float32Array(PC*3);
      for (let i=0;i<PC;i++) {
        const th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1), r=2.8+Math.random()*1.2;
        pPos[i*3]=r*Math.sin(ph)*Math.cos(th); pPos[i*3+1]=r*Math.sin(ph)*Math.sin(th); pPos[i*3+2]=r*Math.cos(ph);
      }
      const pGeo=new THREE.BufferGeometry();
      pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
      scene.add(new THREE.Points(pGeo,
        new THREE.PointsMaterial({color:0xff3300,size:0.015,transparent:true,opacity:0.45,sizeAttenuation:true})));


      /* ── Mouse parallax — skip on touch devices ── */
      const pointer={x:0,y:0}, targetRot={x:0,y:0};
      const isTouchDevice = 'ontouchstart' in window;
      const onMouse=e=>{ pointer.x=(e.clientX/window.innerWidth)*2-1; pointer.y=-(e.clientY/window.innerHeight)*2+1; };
      if (!isTouchDevice) window.addEventListener('mousemove',onMouse,{passive:true,capture:false});

      const onResize=()=>{
        const w=el.clientWidth||500, h=el.clientHeight||500;
        camera.aspect=w/h;
        camera.fov = w/h < 1 ? 58 : 42;
        camera.updateProjectionMatrix();
        renderer.setSize(w,h);
      };
      window.addEventListener('resize',onResize,{passive:true});
      onResize();

      const onVis=()=>{ if(document.hidden) cancelAnimationFrame(animId); else loop(); };
      document.addEventListener('visibilitychange',onVis);

      const R_MID=20/12, R_SMALL=20/8, R_ACC=20/7;
      let t=0, lastTime=0;

      const loop=(now=0)=>{
        animId=requestAnimationFrame(loop);
        // Throttle to ~60fps — skip frame if less than 14ms since last
        if (now - lastTime < 14) return;
        const dt = Math.min((now - lastTime) / 1000, 0.05); // cap delta at 50ms
        lastTime = now;
        t += dt;

        targetRot.x+=(pointer.y*0.36-targetRot.x)*0.18;
        targetRot.y+=(pointer.x*0.36-targetRot.y)*0.18;
        root.rotation.x=targetRot.x+Math.sin(t*0.17)*0.08;
        root.rotation.y=targetRot.y+Math.sin(t*0.21)*0.12;

        const base=t*0.40;
        gearMain.rotation.z   =  base;
        gearMid.rotation.z    = -base*R_MID;
        gearSmall.rotation.z  = -base*R_SMALL;
        gearAccent.rotation.z =  base*R_ACC;

        outerRing.rotation.z  = t*0.055;
        outerGlow.rotation.z  = -t*0.09;
        orbitGroup.rotation.z = t*0.68;
        tiltSpin.rotation.z  -= 0.022 * dt * 60;

        const pulse=Math.sin(t*3.0);
        mRedGlow.emissiveIntensity=3.0+Math.abs(pulse)*3.2;
        core.scale.setScalar(1+Math.abs(pulse)*0.13);
        coreHalo.scale.setScalar(1+Math.abs(pulse)*0.09);
        coreWire.rotation.y+=0.008 * dt * 60;
        coreWire.rotation.z+=0.005 * dt * 60;

        redCore.intensity=35+Math.sin(t*2.2)*18;
        root.position.y=Math.sin(t*0.5)*0.08;

        renderer.render(scene,camera);
      };
      loop();

      el._cleanup=()=>{
        disposed=true; cancelAnimationFrame(animId);
        if (!isTouchDevice) window.removeEventListener('mousemove',onMouse);
        window.removeEventListener('resize',onResize);
        document.removeEventListener('visibilitychange',onVis);
        envTexture.dispose();
        scene.traverse(obj=>{
          if(obj.geometry) obj.geometry.dispose();
          if(obj.material){ Array.isArray(obj.material)?obj.material.forEach(m=>m.dispose()):obj.material.dispose(); }
        });
        renderer.dispose();
        if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      };
    });

    return ()=>{ disposed=true; if(el._cleanup) el._cleanup(); };
  },[]);

  return (
    <div ref={mountRef} style={{width:'100%',height:'100%',position:'absolute',inset:0,pointerEvents:'none'}} />
  );
}
