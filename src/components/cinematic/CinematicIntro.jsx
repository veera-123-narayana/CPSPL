import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeDScene from './ThreeDScene';
import AtmosphereOverlay from './AtmosphereOverlay';
import CustomizerModal from './CustomizerModal';
import { sounds } from '../../audio/sounds';

/**
 * Universal Cinematic Website Intro & Landing Page Reveal
 * 
 * Recreates the reference 3D car animation (from https://www.youtube.com/shorts/BJnDGTmZnSE)
 * by replacing the sports car with an uploaded 3D event poster plaque.
 * 
 * Choreography:
 * 0.0s - 1.2s: Phase 1 — Dark ignition, laser headlights ignite, low-angle oblique track
 * 1.2s - 3.2s: Phase 2 — 3D camera orbit, speed drift, floor grid streaks, volumetric light sweeps
 * 3.2s - 4.6s: Phase 3 — Hero stance alignment, levitation hover, coordinator HUD telemetry
 * 4.6s - 5.5s: Phase 4 — Hyperspace warp dive & seamless unmask into the landing page
 */
export default function CinematicIntro({
  onEnter,
  posterImage: initialPosterImage = '/innovrush_poster_bg.jpg',
  eventName: initialEventName = 'INNOVRUSH 2K26',
  brandLogo: initialBrandLogo = 'N.B.K.R.I.S.T · NEXUSVERSE 2K26',
  introDuration: initialDuration = 5500,
  enableSkip: initialEnableSkip = true,
  playOncePerSession: initialPlayOnce = false
}) {
  const [config, setConfig] = useState({
    posterImage: initialPosterImage,
    eventName: initialEventName,
    brandLogo: initialBrandLogo,
    introDuration: initialDuration,
    enableSkip: initialEnableSkip,
    playOncePerSession: initialPlayOnce,
    coordinators: [
      { name: 'P. Veera Narayana', phone: '9848635931' },
      { name: 'N. Snehalatha', phone: '7674010261' },
      { name: 'M. Lekhasree', phone: '9347178378' }
    ]
  });

  const [progress, setProgress] = useState(0); // 0 to 100
  const [muted, setMuted] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isWarping, setIsWarping] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasTriggeredSoundRef = useRef({ phase1: false, phase2: false, phase3: false, phase4: false });
  const animFrameRef = useRef(null);

  // Check reduced-motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        // Automatically skip if user prefers reduced motion
        onEnter();
        return;
      }
    }
  }, []);

  // Check playOncePerSession
  useEffect(() => {
    if (config.playOncePerSession && typeof window !== 'undefined') {
      const alreadyPlayed = sessionStorage.getItem('innovrush_intro_played');
      if (alreadyPlayed) {
        onEnter();
      }
    }
  }, [config.playOncePerSession]);

  // Track mouse movement for 3D interactive tilt
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  // Run Choreographed Animation Loop
  const runAnimation = () => {
    startTimeRef.current = Date.now();
    hasTriggeredSoundRef.current = { phase1: false, phase2: false, phase3: false, phase4: false };

    const updateFrame = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = config.introDuration;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);

      // Sound triggers tied to choreographed phases
      if (p >= 2 && !hasTriggeredSoundRef.current.phase1) {
        hasTriggeredSoundRef.current.phase1 = true;
        sounds.playEngineSpool();
        sounds.playLaserIgnite();
      }
      if (p >= 28 && !hasTriggeredSoundRef.current.phase2) {
        hasTriggeredSoundRef.current.phase2 = true;
        sounds.playWhoosh();
      }
      if (p >= 68 && !hasTriggeredSoundRef.current.phase3) {
        hasTriggeredSoundRef.current.phase3 = true;
        sounds.playBassDrop();
      }
      if (p >= 92 && !hasTriggeredSoundRef.current.phase4) {
        hasTriggeredSoundRef.current.phase4 = true;
        setIsWarping(true);
        sounds.playWarp();
      }

      if (p < 100) {
        animFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        // Complete intro and transition to landing page
        handleComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);
  };

  useEffect(() => {
    runAnimation();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [config.introDuration, config.posterImage]);

  const handleComplete = () => {
    if (config.playOncePerSession && typeof window !== 'undefined') {
      sessionStorage.setItem('innovrush_intro_played', 'true');
    }
    onEnter();
  };

  const handleSkip = () => {
    sounds.playClick();
    handleComplete();
  };

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    sounds.setMuted(next);
  };

  const handleReplay = () => {
    setProgress(0);
    setIsWarping(false);
    runAnimation();
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-obsidian overflow-hidden select-none flex items-center justify-center cursor-default"
      style={{ touchAction: 'none' }}
    >
      {/* LAYER 1 & 2 & 3 & 4: Three.js 3D WebGL Canvas */}
      <ThreeDScene
        posterTextureUrl={config.posterImage}
        eventCoordinators={config.coordinators}
        eventName={config.eventName}
        progress={progress / 100}
        mousePos={mousePos}
      />

      {/* LAYER 5: Sci-Fi Vehicle Telemetry HUD & Letterbox Overlays */}
      <AtmosphereOverlay
        progress={progress}
        muted={muted}
        onToggleMute={handleToggleMute}
        onSkip={handleSkip}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        eventName={config.eventName}
        brandLogo={config.brandLogo}
      />

      {/* LAYER 6: Cinematic Lens Flare Sweep & Hyperspace Warp Transition */}
      <AnimatePresence>
        {isWarping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeInOut' }}
            className="absolute inset-0 z-40 bg-radial-gradient from-metallic-bright/60 via-metallic-gold/30 to-obsidian pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* CUSTOMIZER DRAWER / MODAL */}
      <CustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onUpdateConfig={setConfig}
        onReplay={handleReplay}
      />
    </div>
  );
}
