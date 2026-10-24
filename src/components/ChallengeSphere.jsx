import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, BarChart3, Globe, ArrowRight, Sparkles, Orbit, RotateCcw, LayoutGrid, Check } from 'lucide-react';
import { sounds } from '../audio/sounds';

export default function ChallengeSphere({
  problems = [],
  onSelectProblem,
  activeDomain = 'ALL',
  onDomainChange
}) {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const headlineRef = useRef(null);
  const orbRef = useRef(null);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [internalDomain, setInternalDomain] = useState(activeDomain);

  // Sync internal domain with parent prop
  useEffect(() => {
    setInternalDomain(activeDomain);
  }, [activeDomain]);

  const handleDomainSelect = (dom) => {
    sounds.playClick();
    setInternalDomain(dom);
    if (onDomainChange) onDomainChange(dom);
  };

  // Filter problems based on selected domain
  const displayProblems = useMemo(() => {
    if (internalDomain === 'ALL') return problems;
    return problems.filter(p => p.domain === internalDomain);
  }, [problems, internalDomain]);

  // Spherical Coordinates & Distribution
  // Ensures ALL cards are visible and distributed gracefully across 360°
  const cardsData = useMemo(() => {
    const N = displayProblems.length || 1;

    // When 4 cards in a domain: distribute evenly on an equatorial belt (lat = 0°)
    // spaced 90° apart so they are immediately visible and rotate 360°
    if (N <= 4) {
      const lonStep = 360 / N;
      return displayProblems.map((prob, i) => {
        const lon = i * lonStep; // 0, 90, 180, 270
        const lat = (i % 2 === 0 ? 6 : -6); // subtle alternating tilt
        const radLat = lat * (Math.PI / 180);
        const radLon = lon * (Math.PI / 180);

        const y = Math.sin(radLat);
        const cosLat = Math.cos(radLat);
        const x = Math.sin(radLon) * cosLat;
        const z = Math.cos(radLon) * cosLat;

        return { prob, x, y, z, lat, lon };
      });
    }

    // When ALL (12 cards): distribute in 3 balanced rings (4 top, 4 middle, 4 bottom)
    // spaced 90° apart with offset for maximum visual balance
    const ringConfigs = [
      { lat: 24, count: 4, offsetLon: 0 },
      { lat: 0, count: 4, offsetLon: 45 },
      { lat: -24, count: 4, offsetLon: 0 }
    ];

    let cardIndex = 0;
    const cards = [];

    ringConfigs.forEach((ring) => {
      const step = 360 / ring.count;
      for (let j = 0; j < ring.count; j++) {
        if (cardIndex < displayProblems.length) {
          const prob = displayProblems[cardIndex];
          const lon = (j * step + ring.offsetLon) % 360;
          const lat = ring.lat;
          const radLat = lat * (Math.PI / 180);
          const radLon = lon * (Math.PI / 180);

          const y = Math.sin(radLat);
          const cosLat = Math.cos(radLat);
          const x = Math.sin(radLon) * cosLat;
          const z = Math.cos(radLon) * cosLat;

          cards.push({ prob, x, y, z, lat, lon });
          cardIndex++;
        }
      }
    });

    return cards;
  }, [displayProblems]);

  useEffect(() => {
    let animId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Radius R calculation: expanded for larger, bolder cards
    const calcRadius = () => {
      const hr = width <= 380 ? 0.44 : width <= 640 ? 0.5 : 0.54;
      const wr = width <= 380 ? 0.54 : width <= 640 ? 0.6 : 0.66;
      const floor = width <= 380 ? 150 : width <= 640 ? 200 : 270;
      return Math.max(floor, Math.min(500, height * hr, width * wr));
    };

    let R = calcRadius();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      R = calcRadius();
    };
    window.addEventListener('resize', handleResize);

    // Camera and physics state (FULL 360 DEGREE ROTATION IN BOTH AXES)
    let spin = 0;
    let tilt = -4;
    let dragX = 0;
    let dragY = 0;
    let velX = 0.05; // auto-drift
    let velY = 0;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const handlePointerDown = (e) => {
      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    };

    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      velX = dx * 0.18;
      velY = -dy * 0.18;
      dragX += velX;
      dragY += velY;

      // Full 360-degree rotation: clamp vertical pitch softly inside ±75° to keep readable
      dragY = Math.max(-75 - tilt, Math.min(75 - tilt, dragY));
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    // Main Camera Loop
    const loop = () => {
      if (!isDragging) {
        dragX += velX;
        dragY += velY;
        velX *= 0.94;
        velY *= 0.94;
        if (Math.abs(velX) < 0.002) velX = 0;
        if (Math.abs(velY) < 0.002) velY = 0;

        // Continuous subtle rotation drift when idle
        if (velX === 0 && velY === 0) {
          dragX += 0.04;
        }

        dragY = Math.max(-75 - tilt, Math.min(75 - tilt, dragY));
      }

      const sx = tilt + dragY;
      const sy = spin + dragX;

      // Apply transform to world
      if (worldRef.current) {
        worldRef.current.style.transform = `rotateY(${sy}deg) rotateX(${sx}deg)`;
      }

      // Counter-rotate headline to keep it legible in 3D center
      if (headlineRef.current) {
        headlineRef.current.style.transform = `rotateX(${-sx}deg) rotateY(${-sy}deg) translateZ(${R * 0.35}px)`;
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('pointerdown', handlePointerDown);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      
      {/* FLOATING DOMAIN SELECTOR TOOLBAR */}
      <div className="w-full max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-20">
        
        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-deepspace/90 border border-metallic-gold/30 backdrop-blur-md shadow-md">
          {[
            { id: 'ALL', label: 'All Challenges', count: problems.length },
            { id: 'AI / MACHINE LEARNING', label: 'AI & ML', count: problems.filter(p => p.domain === 'AI / MACHINE LEARNING').length },
            { id: 'DATA ANALYTICS', label: 'Data Analytics', count: problems.filter(p => p.domain === 'DATA ANALYTICS').length },
            { id: 'WEB DEVELOPMENT', label: 'Web Development', count: problems.filter(p => p.domain === 'WEB DEVELOPMENT').length }
          ].map((tab) => {
            const isActive = internalDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleDomainSelect(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gold-gradient text-obsidian font-bold shadow-gold-sm'
                    : 'text-mutedsilver hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-black/25 text-obsidian font-bold' : 'bg-white/10 text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Link to Dedicated Full Problem Statements Page */}
        <button
          onClick={() => {
            sounds.playClick();
            navigate('/challenges');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-deepspace/90 border border-metallic-gold/50 text-metallic-bright hover:border-metallic-bright hover:bg-metallic-gold/15 transition-all text-xs font-mono font-bold tracking-wider shadow-gold-sm cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-metallic-gold" />
          <span>OPEN FULL CHALLENGES PAGE</span>
          <ArrowRight className="w-3 h-3 text-metallic-gold" />
        </button>
      </div>

      {/* 3D SPHERE STAGE */}
      <div
        ref={containerRef}
        className="relative w-full h-[720px] sm:h-[820px] lg:h-[880px] overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing flex items-center justify-center bg-radial-gradient from-deepspace/80 via-obsidian/95 to-obsidian"
        style={{
          perspective: '1300px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Ambient orbital rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
          <div className="w-[600px] h-[600px] sm:w-[780px] sm:h-[780px] rounded-full border border-dashed border-metallic-gold/30 animate-spin" style={{ animationDuration: '65s' }} />
          <div className="absolute w-[460px] h-[460px] sm:w-[600px] sm:h-[600px] rounded-full border border-metallic-bright/20 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        </div>

        {/* 3D World Origin (0x0 point at 50% 50%) */}
        <div
          ref={worldRef}
          id="world"
          className="absolute top-1/2 left-1/2 w-0 h-0 preserve-3d will-change-transform"
        >
          {/* Holographic Equatorial 3D Rings */}
          <div
            className="absolute -top-[380px] -left-[380px] w-[760px] h-[760px] rounded-full border-2 border-dashed border-metallic-gold/30 pointer-events-none preserve-3d"
            style={{ transform: 'rotateX(80deg)' }}
          />
          <div
            className="absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full border border-metallic-bright/20 pointer-events-none preserve-3d"
            style={{ transform: 'rotateY(75deg)' }}
          />

          {/* Sphere Container for Floating Problem Cards */}
          <div ref={orbRef} id="orb" className="absolute top-0 left-0 w-0 h-0 preserve-3d">
            {cardsData.map(({ prob, x, y, z, lat, lon }) => {
              const isAi = prob.domain === 'AI / MACHINE LEARNING';
              const isAnalytics = prob.domain === 'DATA ANALYTICS';
              const Icon = isAi ? BrainCircuit : isAnalytics ? BarChart3 : Globe;

              const isHovered = hoveredCard === prob.problemId;

              // Large, prominent card dimensions
              const cw = 300;
              const ch = 190;

              // VIBRANT DOMAIN COLOR SYSTEM
              const domainBadgeBg = isAi 
                ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                : isAnalytics 
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]';

              const domainCardBorder = isAi 
                ? 'border-purple-500/50 hover:border-purple-400' 
                : isAnalytics 
                ? 'border-cyan-500/50 hover:border-cyan-400' 
                : 'border-emerald-500/50 hover:border-emerald-400';

              const domainGlow = isAi ? 'rgba(168,85,247,0.45)' : isAnalytics ? 'rgba(6,182,212,0.45)' : 'rgba(16,185,129,0.45)';

              return (
                <div
                  key={prob.problemId}
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playClick();
                    onSelectProblem(prob);
                  }}
                  onMouseEnter={() => {
                    setHoveredCard(prob.problemId);
                    sounds.playHover();
                  }}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${cw}px`,
                    height: `${ch}px`,
                    marginLeft: `${-cw / 2}px`,
                    marginTop: `${-ch / 2}px`,
                    transform: `translate3d(calc(${x} * min(54vw, 440px)), calc(${-y} * min(54vw, 440px)), calc(${z} * min(54vw, 440px))) rotateY(${lon}deg) rotateX(${lat}deg) translateZ(${isHovered ? 45 : 0}px) scale(${isHovered ? 1.08 : 1})`,
                    transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease',
                    boxShadow: isHovered 
                      ? `0 25px 60px rgba(0,0,0,0.95), 0 0 40px ${domainGlow}, 0 0 20px rgba(212,167,44,0.4)` 
                      : '0 12px 35px rgba(0,0,0,0.85), 0 0 15px rgba(212,167,44,0.15)'
                  }}
                  className={`group rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-deepspace via-obsidian to-black border-2 ${domainCardBorder} cursor-pointer overflow-hidden flex flex-col justify-between backdrop-blur-md select-none`}
                >
                  {/* Diagonal Specular Sheen */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/18 to-transparent -skew-x-25 animate-sweep" />
                  </div>

                  {/* Ambient Back Glow */}
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-25 group-hover:opacity-55 transition-opacity pointer-events-none"
                    style={{ backgroundColor: isAi ? '#a855f7' : isAnalytics ? '#06b6d4' : '#10b981' }}
                  />

                  {/* Top Row: Problem ID Badge & Domain Icon */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-obsidian border border-metallic-gold/50 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-metallic-bright animate-ping" />
                      <span className="font-mono text-xs font-bold text-metallic-bright tracking-wider">
                        {prob.problemId}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-xl border ${domainBadgeBg} group-hover:scale-110 transition-all shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Center: Title & Domain Tag */}
                  <div className="my-auto relative z-10">
                    <h4 className="font-cinzel text-sm sm:text-[15px] font-bold text-softwhite group-hover:text-metallic-bright transition-colors line-clamp-2 leading-snug drop-shadow-sm">
                      {prob.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${domainBadgeBg}`}>
                        {prob.domain}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">90 MIN SPRINT</span>
                    </div>
                  </div>

                  {/* Bottom Row: View Details Action */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] sm:text-xs font-mono text-metallic-gold group-hover:text-metallic-bright transition-colors relative z-10">
                    <span className="flex items-center gap-1 font-bold tracking-wider">
                      <Sparkles className="w-3 h-3 text-metallic-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>VIEW DETAILS</span>
                    </span>
                    <div className="p-1 rounded-full bg-white/5 group-hover:bg-metallic-gold group-hover:text-obsidian transition-all group-hover:translate-x-1">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Tech Corner Brackets */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-metallic-gold/70 pointer-events-none group-hover:border-metallic-bright transition-colors" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-metallic-gold/70 pointer-events-none group-hover:border-metallic-bright transition-colors" />
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-metallic-gold/70 pointer-events-none group-hover:border-metallic-bright transition-colors" />
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-metallic-gold/70 pointer-events-none group-hover:border-metallic-bright transition-colors" />
                </div>
              );
            })}
          </div>

          {/* Headline Centered inside 3D Sphere Origin with Glow */}
          <h1
            ref={headlineRef}
            id="headline"
            className="absolute top-0 left-0 text-center font-cinzel font-black tracking-tight text-white drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)] pointer-events-none select-none uppercase"
            style={{
              width: 'min(80vw, 580px)',
              marginLeft: 'calc(min(80vw, 580px) / -2)',
              fontSize: 'clamp(28px, 4.5vw, 54px)',
              lineHeight: 1.05
            }}
          >
            <span className="inner absolute top-0 left-0 w-full -translate-y-1/2 block">
              <span className="text-gold-gradient block drop-shadow-[0_0_25px_rgba(212,167,44,0.5)]">
                INNOVRUSH 2K26
              </span>
              <span className="font-mono text-xs sm:text-sm tracking-[0.25em] text-metallic-bright/90 font-medium block mt-2.5">
                {internalDomain === 'ALL' ? '3D ORBITAL ARENA (12 PROBLEMS)' : `${internalDomain} (4 PROBLEMS)`}
              </span>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-deepspace/90 border border-metallic-gold/30 text-[10px] font-mono text-gray-400 tracking-widest uppercase">
                Drag to Rotate 360° · Click to Open
              </span>
            </span>
          </h1>
        </div>

        {/* Drag Cue Indicator at Bottom */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-metallic-gold pointer-events-none bg-deepspace/85 px-4 py-1.5 rounded-full border border-metallic-gold/40 backdrop-blur-md shadow-lg">
          <Orbit className="w-3.5 h-3.5 text-metallic-bright animate-spin" style={{ animationDuration: '8s' }} />
          <span>DRAG 360° TO ROTATE ARENA · {displayProblems.length} STATEMENTS LOADED</span>
        </div>
      </div>
    </div>
  );
}
