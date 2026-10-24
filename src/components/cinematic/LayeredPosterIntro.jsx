import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, FastForward, Sparkles, Rocket } from 'lucide-react';
import FloorGrid3D from './FloorGrid3D';
import Poster3DCard from './Poster3DCard';
import AntigravityDotCanvas from './AntigravityDotCanvas';
import { sounds } from '../../audio/sounds';

/**
 * LayeredPosterIntro — Universal Reference-Driven 3D Poster Reveal
 * with Google Antigravity & React Bits Nano-Cell Dot Physics
 * 
 * Recreates the cinematic presentation with:
 * - Interactive physics-driven weightless nano-cell dot matrix reacting to cursor & clicks
 * - Shockwave ripple pulses across the space
 * - Pristine 3D physical card with rocket plasma exhaust and metallic title sweep
 * - Zero occlusion of original poster artwork & text
 * - User-controlled launch: lets the visitor explore the physics & launch into the arena when ready
 */
export default function LayeredPosterIntro({ onEnter }) {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [muted, setMuted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isWarping, setIsWarping] = useState(false);
  const startTimeRef = useRef(Date.now());
  const soundPlayedRef = useRef({ ignite: false, whoosh: false, bass: false });
  const animFrameRef = useRef(null);

  const duration = 4000; // 4.0s initial spool-up calibration

  // Check reduced-motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        onEnter();
        return;
      }
    }
  }, []);

  // Mouse move handler for physical 3D parallax
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  // Main Choreography Loop
  useEffect(() => {
    startTimeRef.current = Date.now();

    const loop = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);

      // Sound Choreography
      if (p >= 5 && !soundPlayedRef.current.ignite) {
        soundPlayedRef.current.ignite = true;
        sounds.playEngineSpool();
        sounds.playLaserIgnite();
      }
      if (p >= 35 && !soundPlayedRef.current.whoosh) {
        soundPlayedRef.current.whoosh = true;
        sounds.playWhoosh();
      }
      if (p >= 75 && !soundPlayedRef.current.bass) {
        soundPlayedRef.current.bass = true;
        sounds.playBassDrop();
      }

      if (p < 100) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleEnter = () => {
    if (isWarping) return;
    setIsWarping(true);
    sounds.playWarp();
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-obsidian overflow-hidden select-none flex flex-col justify-between items-center cursor-default"
      style={{ touchAction: 'none' }}
    >
      {/* 3D INFINITE PERSPECTIVE GOLD FLOOR */}
      <FloorGrid3D progress={progress / 100} mousePos={mousePos} />

      {/* INTERACTIVE NANO-CELL DOT MATRIX (GOOGLE ANTIGRAVITY WEIGHTLESS PHYSICS) */}
      <AntigravityDotCanvas
        dotColor="#D4A72C"
        glowColor="#FFD84D"
        gridSpacing={25}
        repelRadius={150}
        repelStrength={0.88}
      />

      {/* TOP HEADER CONTROLS */}
      <div className="relative z-40 w-full px-4 sm:px-8 pt-5 flex items-center justify-between pointer-events-auto">
        {/* Left Branding Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-deepspace/85 border border-metallic-gold/40 backdrop-blur-md shadow-md">
          <span className="w-2 h-2 rounded-full bg-metallic-gold animate-ping" />
          <span className="font-mono text-[10px] sm:text-xs tracking-widest text-metallic-bright font-bold uppercase">
            N.B.K.R.I.S.T (AUTONOMOUS) · NEXUSVERSE 2K26
          </span>
        </div>

        {/* Right Controls: Audio & Skip */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-full border border-metallic-gold/30 bg-deepspace/80 text-metallic-gold hover:text-metallic-bright hover:border-metallic-gold transition-colors active:scale-95"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              handleEnter();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-sm"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>SKIP TO ARENA</span>
          </button>
        </div>
      </div>

      {/* CENTER 3D LAYERED POSTER STAGE */}
      <div className="relative z-30 flex-1 flex items-center justify-center p-2 w-full max-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Poster3DCard
            mousePos={mousePos}
            onEnter={handleEnter}
            isWarping={isWarping}
          />
        </motion.div>
      </div>

      {/* BOTTOM LETTERBOX & TIMELINE SCRUBBER */}
      <div className="relative z-40 w-full max-w-xl px-4 pb-4 flex flex-col items-center gap-2 pointer-events-auto">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm relative">
          <div
            className="h-full bg-gold-gradient transition-all duration-100 ease-out shadow-[0_0_12px_#ffd84d]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between w-full font-mono text-[10px] tracking-widest text-metallic-gold/90 uppercase px-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-metallic-bright animate-spin" />
            <span>ANTIGRAVITY NANO-CELL MATRIX ACTIVE</span>
          </span>
          <span className="text-gray-400">
            {progress < 40 ? 'CALIBRATING DOT PARTICLES' : progress < 90 ? '3D HOLOGRAPHIC PROJECTION' : 'ARENA READY · CLICK ENTER TO WARP'}
          </span>
          <span className="text-metallic-bright font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Hyperspace Flare Flash on Reveal */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 z-50 bg-radial-gradient from-metallic-bright/70 via-metallic-gold/40 to-obsidian pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
