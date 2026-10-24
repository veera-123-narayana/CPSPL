import React, { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = width / 2;
    let targetMouseY = height / 3;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fluid ambient light orbs (inspired by motion.zajno.com)
    const orbs = [
      { x: width * 0.25, y: height * 0.3, radius: Math.min(width, height) * 0.45, color: 'rgba(212, 167, 44, 0.08)', vx: 0.003, vy: 0.002, phase: 0 },
      { x: width * 0.75, y: height * 0.5, radius: Math.min(width, height) * 0.5, color: 'rgba(255, 159, 28, 0.06)', vx: 0.0025, vy: 0.0035, phase: Math.PI / 2 },
      { x: width * 0.5, y: height * 0.75, radius: Math.min(width, height) * 0.55, color: 'rgba(255, 216, 77, 0.04)', vx: 0.002, vy: 0.002, phase: Math.PI },
    ];

    // Subtle golden cosmic dust motes
    const dustCount = Math.min(45, Math.floor(width / 35));
    const dust = Array.from({ length: dustCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.35 - 0.1,
      alpha: Math.random() * 0.5 + 0.15,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      phase: Math.random() * Math.PI * 2
    }));

    let time = 0;

    const render = () => {
      time += 0.008;

      // Inertial mouse smoothing
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep space solid background
      ctx.fillStyle = '#050607';
      ctx.fillRect(0, 0, width, height);

      // 2. Interactive mouse ambient glow
      const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, Math.max(width, height) * 0.35);
      mouseGrad.addColorStop(0, 'rgba(212, 167, 44, 0.07)');
      mouseGrad.addColorStop(0.5, 'rgba(255, 159, 28, 0.025)');
      mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Organic ambient fluid light blobs
      orbs.forEach((orb) => {
        const currentX = orb.x + Math.sin(time * orb.vx * 100 + orb.phase) * (width * 0.12);
        const currentY = orb.y + Math.cos(time * orb.vy * 100 + orb.phase) * (height * 0.12);

        const orbGrad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, orb.radius);
        orbGrad.addColorStop(0, orb.color);
        orbGrad.addColorStop(0.6, orb.color.replace(/[\d\.]+\)$/, '0.015)'));
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, width, height);
      });

      // 4. Subtle gold bokeh motes
      dust.forEach((d) => {
        d.x += d.speedX;
        d.y += d.speedY;
        d.phase += d.pulseSpeed;

        if (d.y < 0) {
          d.y = height + 10;
          d.x = Math.random() * width;
        }
        if (d.x < 0) d.x = width;
        if (d.x > width) d.x = 0;

        const currentAlpha = d.alpha * (0.6 + 0.4 * Math.sin(d.phase));

        const dotGrad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 2);
        dotGrad.addColorStop(0, `rgba(255, 216, 77, ${currentAlpha})`);
        dotGrad.addColorStop(0.5, `rgba(212, 167, 44, ${currentAlpha * 0.4})`);
        dotGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = dotGrad;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Fluid Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Elegant masked geometric grid mesh from NexusVerse reference */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 169, 53, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 169, 53, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 80%)'
        }}
      />

      {/* Subtle cinematic vignette */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 40%, rgba(5,6,7,0.7) 100%)'
      }} />
    </div>
  );
}
