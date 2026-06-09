import { useEffect, useRef } from 'react';

export default function ExpenditureOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let looping = false;
    const particles: Array<{
      x: number; y: number; ox: number; oy: number;
      radius: number; color: string; vx: number; vy: number; life: number;
    }> = [];
    const mouse = { x: 0, y: 0, active: false };
    let particleCount = window.innerWidth <= 600 ? 400 : 1200;

    function vectorField(x: number, y: number) {
      const t = time * 0.01;
      const vx = Math.sin(x * 0.005 + t) + Math.cos(y * 0.005 + t * 0.5);
      const vy = Math.cos(x * 0.005 + t * 0.8) - Math.sin(y * 0.005 + t);
      return { x: vx * 2, y: vy * 2 };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
      init();
    }

    function init() {
      particles.length = 0;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 80 + 40;
        const p = {
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          ox: cx + Math.cos(angle) * radius,
          oy: cy + Math.sin(angle) * radius,
          radius: Math.random() * 1.5 + 0.5,
          color: `rgba(${i % 2 === 0 ? '196, 255, 0' : '100, 200, 50'}, ${Math.random() * 0.5 + 0.3})`,
          vx: 0,
          vy: 0,
          life: Math.random() * 100 + 50,
        };
        particles.push(p);
      }
      time = 0;
    }

    function loop() {
      time++;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const dpr = Math.min(window.devicePixelRatio, 2);
      ctx!.scale(dpr, dpr);

      ctx!.save();

      // Center glow
      ctx!.fillStyle = 'rgba(100, 200, 50, 0.1)';
      ctx!.shadowBlur = 80;
      ctx!.shadowColor = '#c4ff00';
      ctx!.beginPath();
      ctx!.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.shadowBlur = 0;

      for (const p of particles) {
        const field = vectorField(p.x, p.y);
        p.vx += field.x * 0.05;
        p.vy += field.y * 0.05;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (p.ox - p.x) * 0.002;
        p.vy += (p.oy - p.y) * 0.001;
        p.life--;

        // Mouse repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const force = (100 - dist) / 100;
            p.vx += (dx / dist) * force * 2;
            p.vy += (dy / dist) * force * 2;
          }
        }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
      }

      ctx!.restore();
      rafRef.current = requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const handleMouseLeave = () => { mouse.active = false; };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    if (!looping) {
      looping = true;
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      looping = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}
