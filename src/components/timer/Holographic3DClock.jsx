import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCw, Volume2, VolumeX, Eye, Maximize2 } from 'lucide-react';
import { sounds } from '../../audio/sounds';

/**
 * Holographic3DClock — Futuristic Circular 3D HUD Countdown
 * Faithfully implements the user's reference image and JSON specification:
 * - 3D Conical / Cylindrical Stack of 5 Concentric Holographic HUD Tiers
 * - Inclined 3D perspective with real-time mouse parallax tilt
 * - Tier 0: Segmented Dark Base Plate with radial wedges
 * - Tier 1: Deep Dashed Sensor Telemetry Ring
 * - Tier 2: Mid Concentric Elliptical Orbit Ring with cardinal markers
 * - Tier 3: Primary Calibrated Dial with 48 Radial Ticks & Thick Glowing Progress Arc
 * - Tier 4: Floating Upright Holographic Digits ("58 PERCENT" or "MM:SS")
 * - Cinematic Entrance Calibration Animation on page load (rings descend, arc sweeps, digits count up)
 */
export default function Holographic3DClock({
  remainingSeconds = 3480,
  durationSeconds = 5400,
  status = 'RUNNING',
  onReplay
}) {
  const [viewMode, setViewMode] = useState('percent'); // 'percent' | 'countdown' | 'seconds_loop'
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1 during calibration
  const [displayNumber, setDisplayNumber] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [sixtySecCountdown, setSixtySecCountdown] = useState(60);
  const containerRef = useRef(null);

  // Calculate live values
  const percentRemaining = (durationSeconds > 0 && typeof remainingSeconds === 'number')
    ? Math.max(0, Math.min(100, Math.round((remainingSeconds / durationSeconds) * 100)))
    : (status === 'WAITING' ? 100 : 0);

  // 60-Second Loop Countdown (matching JSON config)
  useEffect(() => {
    const interval = setInterval(() => {
      setSixtySecCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format hours, mins, secs
  const hrs = Math.floor(remainingSeconds / 3600);
  const mins = Math.floor((remainingSeconds % 3600) / 60);
  const secs = remainingSeconds % 60;
  const timeString = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Target value for the active display
  const targetValue = viewMode === 'percent'
    ? (typeof percentRemaining === 'number' && !isNaN(percentRemaining) ? percentRemaining : (status === 'WAITING' ? 100 : 0))
    : viewMode === 'seconds_loop'
    ? sixtySecCountdown
    : mins;

  // Calibration Sequence (Plays on page load)
  const runCalibration = () => {
    setIsCalibrating(true);
    setAnimProgress(0);
    setDisplayNumber(0);

    sounds.playLaserIgnite();
    setTimeout(() => sounds.playWhoosh(), 350);
    setTimeout(() => sounds.playEngineSpool(), 800);

    const startTime = Date.now();
    const animDuration = 2200; // 2.2s entrance sequence

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / animDuration);
      
      // Easing out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(ease);

      const currentNum = Math.round(ease * targetValue);
      setDisplayNumber(currentNum);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setIsCalibrating(false);
        sounds.playClick();
      }
    };

    requestAnimationFrame(tick);
  };

  useEffect(() => {
    runCalibration();
  }, [viewMode]);

  // When not calibrating, smoothly update displayNumber
  useEffect(() => {
    if (!isCalibrating) {
      setDisplayNumber(targetValue);
    }
  }, [targetValue, isCalibrating]);

  // Mouse Parallax in 3D Perspective Space
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // 3D Angles
  // Base tilt is ~58° (isometric look-down from image)
  const baseTiltX = 58;
  const tiltX = baseTiltX + mouseOffset.y * 10;
  const tiltY = mouseOffset.x * 12;

  // SVG Arc Geometry (Radius = 140)
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  // Arc angle ratio
  const activeFraction = isCalibrating ? (animProgress * (targetValue / 100)) : (targetValue / 100);
  const strokeDashoffset = circumference * (1 - Math.max(0.01, Math.min(1, activeFraction)));

  // 48 Radial Ticks Generator
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * 360;
    const isMajor = i % 4 === 0;
    const isSuperMajor = i % 12 === 0;
    return { index: i, angle, isMajor, isSuperMajor };
  });

  // Perimeter numbers (0, 20, 40, 60, 80, 100)
  const perimeterLabels = [
    { label: '0', angle: 0 },
    { label: '20', angle: 72 },
    { label: '40', angle: 144 },
    { label: '60', angle: 216 },
    { label: '80', angle: 288 }
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl py-6 flex flex-col items-center select-none"
    >
      {/* HUD MODE TOGGLE CONTROLS */}
      <div className="flex items-center gap-2 mb-6 z-20">
        <button
          onClick={() => {
            sounds.playClick();
            setViewMode('percent');
          }}
          className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'percent'
              ? 'bg-gold-gradient text-obsidian shadow-[0_0_15px_#ffd84d]'
              : 'bg-deepspace text-mutedsilver hover:text-white border border-metallic-gold/30'
          }`}
        >
          Holographic %
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setViewMode('countdown');
          }}
          className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'countdown'
              ? 'bg-gold-gradient text-obsidian shadow-[0_0_15px_#ffd84d]'
              : 'bg-deepspace text-mutedsilver hover:text-white border border-metallic-gold/30'
          }`}
        >
          Arena Live Clock
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setViewMode('seconds_loop');
          }}
          className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            viewMode === 'seconds_loop'
              ? 'bg-gold-gradient text-obsidian shadow-[0_0_15px_#ffd84d]'
              : 'bg-deepspace text-mutedsilver hover:text-white border border-metallic-gold/30'
          }`}
        >
          60S HUD Cycle
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            runCalibration();
          }}
          title="Replay Entrance Animation"
          className="p-1.5 rounded-full bg-deepspace border border-metallic-gold/40 text-metallic-gold hover:text-metallic-bright hover:rotate-180 transition-all active:scale-95 ml-2"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* 3D STAGE VIEWPORT */}
      <div
        className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[520px] md:h-[520px] flex items-center justify-center preserve-3d"
        style={{
          perspective: '1300px'
        }}
      >
        {/* Soft Ambient Blur Gradient Floor (Matching JSON configuration) */}
        <div
          className="absolute w-[440px] h-[440px] sm:w-[560px] sm:h-[560px] rounded-full pointer-events-none -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(200,211,212,0.06) 0%, rgba(158,187,112,0.04) 60%, rgba(78,109,55,0) 80%)',
            filter: 'blur(35px)',
            transform: 'translateZ(-200px)'
          }}
        />

        {/* ============================================================ */}
        {/* 3D CYLINDER PLATFORM WRAPPER (Tilted at 58deg)                */}
        {/* ============================================================ */}
        <div
          className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-100 ease-out"
          style={{
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* VOLUMETRIC HOLOGRAPHIC LIGHT BEAM CONE */}
          <div
            className="absolute w-64 sm:w-80 h-48 bg-gradient-to-t from-metallic-gold/15 via-white/5 to-transparent pointer-events-none rounded-full blur-xl opacity-60"
            style={{
              transform: 'translateZ(-80px) rotateX(-90deg)',
              transformOrigin: 'center center'
            }}
          />

          {/* ============================================================ */}
          {/* TIER 0: DEEPEST BASE PLATE (Z = -140px)                       */}
          {/* Dark pedestal with segmented radial sectors and inner ring   */}
          {/* ============================================================ */}
          <div
            className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full pointer-events-none transition-all duration-700 ease-out"
            style={{
              transform: `translateZ(${-140 * animProgress}px)`,
              opacity: animProgress * 0.85
            }}
          >
            {/* Dark sector disc */}
            <div className="w-full h-full rounded-full bg-[#111618]/90 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.9)] relative overflow-hidden flex items-center justify-center">
              {/* Radial spoke lines (12 sectors) */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-[1px] bg-white/10"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                />
              ))}
              {/* Inner dark core */}
              <div className="w-1/2 h-1/2 rounded-full bg-black/95 border border-white/15" />
            </div>
          </div>

          {/* ============================================================ */}
          {/* TIER 1: DEEP DASHED SENSOR TELEMETRY RING (Z = -95px)        */}
          {/* Rotating dashed ring                                         */}
          {/* ============================================================ */}
          <div
            className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] rounded-full pointer-events-none transition-all duration-700 ease-out"
            style={{
              transform: `translateZ(${-95 * animProgress}px)`,
              opacity: animProgress * 0.75
            }}
          >
            <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 380 380">
              <circle
                cx="190"
                cy="190"
                r="170"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeDasharray="6 14"
                strokeOpacity="0.35"
              />
            </svg>
          </div>

          {/* ============================================================ */}
          {/* TIER 2: MID CONCENTRIC ORBIT RING (Z = -50px)                */}
          {/* Double thin concentric ellipses with cardinal ticks          */}
          {/* ============================================================ */}
          <div
            className="absolute w-[320px] h-[320px] sm:w-[430px] sm:h-[430px] rounded-full pointer-events-none transition-all duration-700 ease-out"
            style={{
              transform: `translateZ(${-50 * animProgress}px)`,
              opacity: animProgress * 0.8
            }}
          >
            <svg className="w-full h-full animate-[spin_55s_linear_infinite_reverse]" viewBox="0 0 430 430">
              <circle
                cx="215"
                cy="215"
                r="195"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              <circle
                cx="215"
                cy="215"
                r="185"
                fill="none"
                stroke="#DDE5E3"
                strokeWidth="1"
                strokeDasharray="2 8"
                strokeOpacity="0.3"
              />
              {/* Cardinal degree crosshairs */}
              <line x1="215" y1="10" x2="215" y2="25" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
              <line x1="215" y1="405" x2="215" y2="420" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
              <line x1="10" y1="215" x2="25" y2="215" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
              <line x1="405" y1="215" x2="420" y2="215" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.6" />
            </svg>
          </div>

          {/* ============================================================ */}
          {/* TIER 3: MAIN CALIBRATED DIAL & GLOWING COUNTDOWN ARC (Z = 0) */}
          {/* This is the primary ring from the image                      */}
          {/* ============================================================ */}
          <div
            className="absolute w-[310px] h-[310px] sm:w-[410px] sm:h-[410px] rounded-full pointer-events-none"
            style={{
              transform: 'translateZ(0px)',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.25))'
            }}
          >
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 360 360"
            >
              <defs>
                {/* Ultra Bright Glow Filter */}
                <filter id="superGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur1" />
                  <feGaussianBlur stdDeviation="8" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Linear gradient for high-heat arc */}
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#FFF2B2" />
                  <stop offset="100%" stopColor="#FFD84D" />
                </linearGradient>
              </defs>

              {/* Base Dial Circular Track */}
              <circle
                cx="180"
                cy="180"
                r={radius}
                fill="#75888A"
                fillOpacity="0.08"
                stroke="#FFFFFF"
                strokeWidth="1.2"
                strokeOpacity="0.22"
              />

              {/* Inner Track Ring */}
              <circle
                cx="180"
                cy="180"
                r={radius - 18}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                strokeOpacity="0.18"
              />

              {/* 48 Radial Tick Marks (from JSON config) */}
              {ticks.map(({ index, angle, isMajor, isSuperMajor }) => {
                const tickLen = isSuperMajor ? 14 : isMajor ? 9 : 5;
                const r1 = radius - 18;
                const r2 = r1 + tickLen;
                const rad = (angle * Math.PI) / 180;
                const x1 = 180 + r1 * Math.cos(rad);
                const y1 = 180 + r1 * Math.sin(rad);
                const x2 = 180 + r2 * Math.cos(rad);
                const y2 = 180 + r2 * Math.sin(rad);

                return (
                  <line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#FFFFFF"
                    strokeWidth={isSuperMajor ? 1.8 : isMajor ? 1.2 : 0.8}
                    strokeOpacity={isSuperMajor ? 0.9 : isMajor ? 0.6 : 0.25}
                  />
                );
              })}

              {/* Perimeter numeric callouts (0, 20, 40, 60, 80) */}
              {perimeterLabels.map(({ label, angle }) => {
                const r = radius + 14;
                const rad = (angle * Math.PI) / 180;
                const x = 180 + r * Math.cos(rad);
                const y = 180 + r * Math.sin(rad);

                return (
                  <text
                    key={label}
                    x={x}
                    y={y}
                    fill="#FFFFFF"
                    fillOpacity="0.55"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(90 ${x} ${y})`}
                  >
                    {label}
                  </text>
                );
              })}

              {/* ============================================================ */}
              {/* PRIMARY THICK GLOWING COUNTDOWN ARC                          */}
              {/* Exactly matching the illuminated arc from the reference image */}
              {/* ============================================================ */}
              <circle
                cx="180"
                cy="180"
                r={radius}
                fill="none"
                stroke="url(#arcGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                filter="url(#superGlow)"
                className="transition-all duration-300 ease-out"
                style={{
                  opacity: Math.max(0.2, animProgress)
                }}
              />

              {/* Leading Laser Spark at tip of arc */}
              {activeFraction > 0.02 && (
                <circle
                  cx={180 + radius * Math.cos(((activeFraction * 360) * Math.PI) / 180)}
                  cy={180 + radius * Math.sin(((activeFraction * 360) * Math.PI) / 180)}
                  r="5"
                  fill="#FFFFFF"
                  filter="url(#superGlow)"
                  className="animate-ping"
                />
              )}
            </svg>
          </div>

          {/* ============================================================ */}
          {/* TIER 4: FLOATING UPRIGHT HOLOGRAPHIC DIGITS ("58 PERCENT")    */}
          {/* Stands UPWARD in 3D facing the viewer (rotateX -58deg)        */}
          {/* ============================================================ */}
          <div
            className="absolute z-30 pointer-events-none flex flex-col items-center justify-center text-center"
            style={{
              // Invert the 58deg tilt so the numbers stand perpendicular to the dial
              transform: `translateZ(60px) rotateX(-${tiltX}deg) rotateY(-${tiltY}deg)`,
              transformOrigin: 'center center',
              textShadow: '0 0 25px rgba(255, 255, 255, 0.8), 0 0 50px rgba(255, 216, 77, 0.4)'
            }}
          >
            {/* Holographic Beam Indicator */}
            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-metallic-bright to-transparent rounded-full mb-1 animate-pulse" />

            {/* Giant Bold Digits ("58" in the reference image) */}
            <div className="font-sans font-bold text-6xl sm:text-7xl md:text-8xl tracking-tight text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.9)]">
              {viewMode === 'countdown' ? timeString : displayNumber}
            </div>

            {/* Sub-label ("PERCENT" in the reference image) */}
            <div className="font-sans font-light text-xs sm:text-sm tracking-[0.35em] uppercase text-white/90 mt-1">
              {viewMode === 'percent'
                ? 'PERCENT'
                : viewMode === 'countdown'
                ? 'TIME REMAINING'
                : 'SECONDS'}
            </div>

            {/* Live Status indicator */}
            <div className="mt-2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-sm text-[9px] font-mono text-metallic-bright tracking-widest uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'RUNNING' ? 'bg-emerald-400 animate-ping' : 'bg-metallic-amber'}`} />
              <span>{status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CONTROLS & HUD DIAGNOSTICS */}
      <div className="w-full max-w-lg mt-4 px-4 flex items-center justify-between font-mono text-[11px] text-mutedsilver border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-metallic-gold" />
          <span className="text-white font-medium">3D HUD EMITTER:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
        <div className="text-gray-400">
          TILT: <span className="text-metallic-gold font-bold">{Math.round(tiltX)}°</span> / ROT: <span className="text-metallic-gold font-bold">{Math.round(tiltY)}°</span>
        </div>
        <div>
          ARC: <span className="text-metallic-bright font-bold">{Math.round(activeFraction * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
