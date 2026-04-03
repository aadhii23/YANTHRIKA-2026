import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Cursor() {
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);
  const canvasRef = useRef(null);
  const mouse     = useRef({ x: -200, y: -200 });
  const ringPos   = useRef({ x: -200, y: -200 });
  const trail     = useRef([]);
  const hovering  = useRef(false);

  // Don't render on touch/mobile devices
  const [isTouch] = useState(() => typeof window !== 'undefined' && 'ontouchstart' in window);
  if (isTouch) return null;

  useEffect(() => {
    const dot    = dotRef.current;
    const ring   = ringRef.current;
    const canvas = canvasRef.current;
    if (!dot || !ring || !canvas) return;

    /* canvas sizing */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* dot snaps instantly via transform — no layout thrash */
    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const onEnter = () => { hovering.current = true;  dot.classList.add('active');    ring.classList.add('active'); };
    const onLeave = () => { hovering.current = false; dot.classList.remove('active'); ring.classList.remove('active'); };

    const onDown = () => {
      dot.classList.add('clicking');
      ring.classList.add('clicking');
      setTimeout(() => ring.classList.remove('clicking'), 380);
    };
    const onUp = () => dot.classList.remove('clicking');

    /* attach hover listeners — use event delegation for dynamic elements */
    const onDocEnter = (e) => { if (e.target.closest('a, button, [role="button"]')) onEnter(); };
    const onDocLeave = (e) => { if (e.target.closest('a, button, [role="button"]')) onLeave(); };
    document.addEventListener('mouseover',  onDocEnter);
    document.addEventListener('mouseout',   onDocLeave);
    window.addEventListener('mousemove',  onMove,  { passive: true });
    window.addEventListener('mousedown',  onDown);
    window.addEventListener('mouseup',    onUp);

    const ctx = canvas.getContext('2d');
    let raf;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      /* ring follows with high lerp — feels snappy not laggy */
      const lerp = hovering.current ? 0.28 : 0.22;
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * lerp;
      ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;

      /* trail */
      trail.current.push({ x: mouse.current.x, y: mouse.current.y });
      if (trail.current.length > 18) trail.current.shift();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 1; i < trail.current.length; i++) {
        const p0   = trail.current[i - 1];
        const p1   = trail.current[i];
        const prog  = i / trail.current.length;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = `rgba(255,30,30,${prog * 0.4})`;
        ctx.lineWidth   = prog * (hovering.current ? 2.5 : 1.6);
        ctx.lineCap     = 'round';
        ctx.stroke();
      }

      /* glow at head */
      if (trail.current.length > 0) {
        const h = trail.current[trail.current.length - 1];
        const r = hovering.current ? 20 : 12;
        const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
        g.addColorStop(0, 'rgba(255,30,30,0.16)');
        g.addColorStop(1, 'rgba(255,30,30,0)');
        ctx.beginPath();
        ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mouseover',  onDocEnter);
      document.removeEventListener('mouseout',   onDocLeave);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      window.removeEventListener('resize',    resize);
    };
  }, []);

  return createPortal(
    <>
      <canvas ref={canvasRef} className="cursor-trail-canvas" />
      <div ref={dotRef}  className="cursor"          style={{ position:'fixed', pointerEvents:'none', left:0, top:0, willChange:'transform' }} />
      <div ref={ringRef} className="cursor-follower" style={{ position:'fixed', pointerEvents:'none', left:0, top:0, willChange:'transform' }} />
    </>,
    document.body
  );
}
