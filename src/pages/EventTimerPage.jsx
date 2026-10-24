import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Volume2, VolumeX, Shield, AlertTriangle, Layers, RotateCw, Sparkles } from 'lucide-react';
import FloorGrid3D from '../components/cinematic/FloorGrid3D';
import AntigravityDotCanvas from '../components/cinematic/AntigravityDotCanvas';
import Holographic3DClock from '../components/timer/Holographic3DClock';
import { sounds } from '../audio/sounds';

/**
 * EventTimerPage — 3D Holographic Synchronized Arena Clock
 * Backed by the official launch platform background:
 * - 3D Infinite Perspective Gold Grid Floor with Volumetric Laser Beams & Embers
 * - Weightless Interactive Antigravity Nano-Cell Dot Matrix reacting to cursor & shockwaves
 * - 3D Conical HUD Countdown with glowing effects and live WebSocket synchronization
 */
export default function EventTimerPage({ timerState, eventStatus }) {
  const [muted, setMuted] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const durationSeconds = timerState?.durationSeconds || 5400;
  const remainingSeconds = Math.max(0, timerState?.remainingSeconds || 0);
  const status = timerState?.status || 'WAITING';

  // Mouse move handler for 3D parallax
  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth) * 2 - 1;
    const y = (e.clientY / innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  // Audio countdown tick on last 10 seconds
  useEffect(() => {
    if (status === 'RUNNING' && remainingSeconds <= 10 && remainingSeconds > 0) {
      sounds.playTimerTick();
    }
  }, [remainingSeconds, status]);

  const handleToggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const handleReplayAnimation = () => {
    sounds.playClick();
    setReplayKey((k) => k + 1);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex flex-col items-center justify-between select-none py-8 sm:py-12"
    >
      {/* 3D INFINITE GOLD FLOOR & VOLUMETRIC LASER BEAMS (FROM LAUNCHING PAGE) */}
      <div className="fixed inset-0 pointer-events-none -z-20">
        <FloorGrid3D mousePos={mousePos} />
      </div>

      {/* INTERACTIVE NANO-CELL DOT MATRIX (ANTIGRAVITY WEIGHTLESS PHYSICS) */}
      <AntigravityDotCanvas
        dotColor="#D4A72C"
        glowColor="#FFD84D"
        gridSpacing={25}
        repelRadius={150}
        repelStrength={0.88}
      />

      {/* FOREGROUND CONTENT */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 z-20 relative flex flex-col items-center">
        
        {/* TOP CONTROLS BAR */}
        <div className="w-full flex items-center justify-between mb-6 border-b border-metallic-gold/20 pb-4">
          <Link
            to="/challenges"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-2 text-xs font-mono text-metallic-gold hover:text-metallic-bright transition-colors bg-deepspace/80 px-3 py-1.5 rounded-full border border-metallic-gold/30 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO CHALLENGES</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReplayAnimation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-metallic-gold/40 bg-deepspace/85 text-metallic-gold hover:text-white font-mono text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="Replay 3D Calibration Animation"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>RECALIBRATE HUD</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="p-2 rounded-full border border-metallic-gold/40 bg-deepspace/85 text-metallic-gold hover:text-metallic-bright transition-colors active:scale-95"
              title={muted ? 'Unmute countdown audio' : 'Mute countdown audio'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* EVENT TITLE */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-deepspace/90 border border-metallic-gold/40 text-metallic-bright font-mono text-xs uppercase mb-2 shadow-gold-sm">
            <Sparkles className="w-3.5 h-3.5 text-metallic-gold animate-spin" />
            <span>INNOVRUSH 2K26</span>
            <span className="text-mutedsilver">·</span>
            <span>SYNCHRONIZED HOLOGRAPHIC CLOCK</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-4xl md:text-5xl font-black text-gold-gradient uppercase tracking-wide drop-shadow-[0_0_30px_rgba(212,167,44,0.4)]">
            ARENA COUNTDOWN SYSTEM
          </h1>
          <p className="text-xs sm:text-sm text-mutedsilver font-light mt-1 max-w-lg mx-auto">
            3D Perspective HUD synchronized in real-time across participant terminals and jury review platforms.
          </p>
        </div>

        {/* 3D HOLOGRAPHIC CLOCK HUD (Recreates user image & JSON animation) */}
        <Holographic3DClock
          key={replayKey}
          remainingSeconds={remainingSeconds}
          durationSeconds={durationSeconds}
          status={status}
          onReplay={handleReplayAnimation}
        />

        {/* METADATA TELEMETRY CARDS */}
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-center">
          <div className="p-3 rounded-xl bg-deepspace/85 border border-metallic-gold/30 shadow-md backdrop-blur-sm">
            <span className="text-[10px] font-mono text-mutedsilver uppercase block">SESSION BUDGET</span>
            <span className="font-mono text-xs font-bold text-metallic-bright">
              {Math.floor(durationSeconds / 60)} Mins
            </span>
          </div>
          <div className="p-3 rounded-xl bg-deepspace/85 border border-metallic-gold/30 shadow-md backdrop-blur-sm">
            <span className="text-[10px] font-mono text-mutedsilver uppercase block">INITIATED AT</span>
            <span className="font-mono text-xs text-softwhite">
              {timerState?.startedAt ? new Date(timerState.startedAt).toLocaleTimeString() : 'Standby'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-deepspace/85 border border-metallic-gold/30 shadow-md backdrop-blur-sm">
            <span className="text-[10px] font-mono text-mutedsilver uppercase block">EVENT STATUS</span>
            <span className="font-mono text-xs text-metallic-gold font-bold uppercase">
              {eventStatus || 'ONLINE'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-deepspace/85 border border-metallic-gold/30 shadow-md backdrop-blur-sm">
            <span className="text-[10px] font-mono text-mutedsilver uppercase block">SYNCHRONIZATION</span>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              Authoritative WS
            </span>
          </div>
        </div>

        {/* NAVIGATION ACTION */}
        <div className="mt-8 mb-4">
          <Link
            to="/challenges"
            onClick={() => sounds.playClick()}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider hover:scale-105 shadow-gold-md hover:shadow-gold-lg transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>EXPLORE ARENA CHALLENGES</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
