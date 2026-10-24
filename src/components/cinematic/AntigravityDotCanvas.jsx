import React, { useRef, useEffect } from 'react';

/**
 * AntigravityDotCanvas — Interactive Nano-Cell Dot Matrix & Weightless Particle Field
 * Inspired by Google Antigravity & modern high-end interactive tech design (React Bits Antigravity).
 * Features:
 * - High-density grid of luminous golden nano-cells / dots
 * - Real-time cursor repulsion & attraction physics (spring-damper anti-gravity)
 * - Click shockwave burst: triggers expanding ripple waves that displace nano-cells
 * - Ambient harmonic wave oscillation giving weightless organic fluid motion
 * - High-DPI canvas scaling with 60fps performance
 */
export default function AntigravityDotCanvas({
  dotColor = '#D4A72C',
  glowColor = '#FFD84D',
  gridSpacing = 26,
  repelRadius = 140,
  repelStrength = 0.85
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, isHovering: false, lastX: 0, lastY: 0, speed: 0 });
  const shockwavesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Build Nano-Cell Dot Grid
    let dots = [];
    const initGrid = () => {
      dots = [];
      const cols = Math.ceil(width / gridSpacing) + 2;
      const rows = Math.ceil(height / gridSpacing) + 2;
      const offsetX = (width - (cols - 1) * gridSpacing) / 2;
      const offsetY = (height - (rows - 1) * gridSpacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const originX = offsetX + c * gridSpacing;
          const originY = offsetY + r * gridSpacing;
          dots.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            baseRadius: (r % 2 === 0 && c % 2 === 0) ? 1.8 : 1.2,
            radius: 1.2,
            alpha: 0.22,
            baseAlpha: 0.22,
            mass: Math.random() * 0.4 + 0.8
          });
        }
      }
    };

    initGrid();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };
    window.addEventListener('resize', handleResize);

    // Mouse Tracking
    const handleMouseMove = (e) => {
      const mouse = mouseRef.current;
      const dx = e.clientX - mouse.lastX;
      const dy = e.clientY - mouse.lastY;
      mouse.speed = Math.hypot(dx, dy);
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    // Click Shockwave Burst
    const handleClick = (e) => {
      shockwavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.min(width, height) * 0.65,
        speed: 14,
        strength: 22,
        alpha: 1.0
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    let time = 0;

    // Physics Animation Loop
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const shockwaves = shockwavesRef.current;

      // Update Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha *= 0.95;
        if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
          shockwaves.splice(i, 1);
        }
      }

      // Draw and Update Dots
      const len = dots.length;
      for (let i = 0; i < len; i++) {
        const dot = dots[i];

        // 1. Ambient harmonic wave motion (weightless anti-gravity drift)
        const waveX = Math.sin(time + dot.originY * 0.015) * 2.5;
        const waveY = Math.cos(time + dot.originX * 0.015) * 2.5;
        const targetX = dot.originX + waveX;
        const targetY = dot.originY + waveY;

        // 2. Cursor Repulsion / Attraction
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < repelRadius && mouse.isHovering) {
          const force = (1 - dist / repelRadius) * repelStrength * 16;
          const angle = Math.atan2(dy, dx);
          dot.vx += Math.cos(angle) * force;
          dot.vy += Math.sin(angle) * force;
          dot.alpha = Math.min(1.0, dot.alpha + 0.15);
          dot.radius = dot.baseRadius * 1.8;
        } else {
          dot.alpha += (dot.baseAlpha - dot.alpha) * 0.05;
          dot.radius += (dot.baseRadius - dot.radius) * 0.05;
        }

        // 3. Shockwave Repulsion
        for (let j = 0; j < shockwaves.length; j++) {
          const sw = shockwaves[j];
          const sDx = dot.x - sw.x;
          const sDy = dot.y - sw.y;
          const sDist = Math.hypot(sDx, sDy);
          const diff = Math.abs(sDist - sw.radius);

          if (diff < 40) {
            const push = (1 - diff / 40) * sw.strength * sw.alpha;
            const angle = Math.atan2(sDy, sDx);
            dot.vx += Math.cos(angle) * push;
            dot.vy += Math.sin(angle) * push;
            dot.alpha = 1.0;
            dot.radius = dot.baseRadius * 2.2;
          }
        }

        // 4. Spring damping physics towards target position
        const spring = 0.07;
        const damping = 0.86;
        dot.vx += (targetX - dot.x) * spring;
        dot.vy += (targetY - dot.y) * spring;
        dot.vx *= damping;
        dot.vy *= damping;
        dot.x += dot.vx;
        dot.y += dot.vy;

        // 5. Render Nano-Cell Dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.6, dot.radius), 0, Math.PI * 2);

        if (dot.alpha > 0.45) {
          ctx.fillStyle = glowColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = (dot.radius - 1) * 6;
        } else {
          ctx.fillStyle = dotColor;
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = Math.max(0.1, dot.alpha);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, [gridSpacing, repelRadius, repelStrength]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      style={{ touchAction: 'none' }}
    />
  );
}
