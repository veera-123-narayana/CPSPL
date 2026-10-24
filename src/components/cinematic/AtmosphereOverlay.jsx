import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, FastForward, Sliders, Shield, Zap, Sparkles, ExternalLink } from 'lucide-react';

export default function AtmosphereOverlay({
  progress, // 0 to 100
  muted,
  onToggleMute,
  onSkip,
  onOpenCustomizer,
  eventName = 'INNOVRUSH 2K26',
  brandLogo = 'N.B.K.R.I.S.T · NEXUSVERSE 2K26',
  referenceVideoUrl = 'https://www.youtube.com/shorts/BJnDGTmZnSE'
}) {
  // Speedometer calculation (0 to 280 km/h) mimicking sports-car telemetry
  const speedKmh = Math.min(280, Math.round((progress / 100) * 280));
  const gForce = (1.0 + (progress < 60 ? (progress / 60) * 1.8 : (100 - progress) / 40 * 0.8)).toFixed(2);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      
      {/* TOP BAR: Controls & Event Telemetry */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Left: Organization Branding & Live HUD indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-deepspace/80 border border-metallic-gold/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-metallic-gold animate-ping" />
            <span className="font-mono text-[10px] sm:text-xs tracking-widest text-metallic-bright font-bold uppercase">
              {brandLogo}
            </span>
          </div>
          <a
            href={referenceVideoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-gray-400 hover:text-metallic-gold hover:border-metallic-gold/40 transition-colors"
            title="View Original Animation Reference Video"
          >
            <span>Reference: SetupsAI 3D Reel</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Right: Audio, Customizer, and Skip to Arena Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Customizer Drawer Trigger */}
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-metallic-gold/40 bg-deepspace/90 font-mono text-xs text-metallic-gold hover:text-metallic-bright hover:border-metallic-gold transition-all shadow-md active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize Poster</span>
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="p-2 rounded-full border border-metallic-gold/30 bg-deepspace/80 text-metallic-gold hover:text-metallic-bright hover:border-metallic-gold transition-colors active:scale-95"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-metallic-gold/40 bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider hover:brightness-110 transition-all shadow-gold-sm active:scale-95"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>SKIP TO ARENA</span>
          </button>
        </div>
      </div>

      {/* CENTER HUD: Sports-Car Telemetry & Corner Brackets */}
      <div className="relative w-full flex-1 flex items-center justify-between px-2 sm:px-8 my-auto">
        
        {/* Left Telemetry (Vehicle / Acceleration HUD from reference video) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex flex-col gap-2 font-mono text-[11px] text-metallic-gold/80 bg-deepspace/75 border border-metallic-gold/25 p-3.5 rounded-xl backdrop-blur-md w-48 shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-metallic-gold/20 pb-1.5">
            <span className="text-gray-400">PROPULSION</span>
            <span className="text-metallic-bright font-bold">WARP-3D</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">TELEMETRY</span>
            <span className="text-white font-bold">{speedKmh} KM/H</span>
          </div>
          <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gold-gradient h-full transition-all duration-75"
              style={{ width: `${(speedKmh / 280) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-400">G-FORCE</span>
            <span className="text-emerald-400 font-bold">{gForce} G</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">DEPTH CHASSIS</span>
            <span className="text-metallic-gold font-bold">TITANIUM GOLD</span>
          </div>
        </motion.div>

        {/* Right Telemetry: Event Launch Status & Coordinators */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex flex-col gap-2 font-mono text-[11px] text-metallic-gold/80 bg-deepspace/75 border border-metallic-gold/25 p-3.5 rounded-xl backdrop-blur-md w-56 shadow-lg text-right"
        >
          <div className="flex items-center justify-between border-b border-metallic-gold/20 pb-1.5">
            <span className="text-metallic-bright font-bold">29 OCT 2026</span>
            <span className="text-gray-400">EVENT DATE</span>
          </div>
          <div>
            <div className="text-white font-bold text-xs">REPORTING: 9:00 AM IST</div>
            <div className="text-gray-400 text-[10px]">N.B.K.R.I.S.T CAMPUS</div>
          </div>
          <div className="border-t border-metallic-gold/20 pt-1.5 text-[10px] text-gray-300">
            <div>COORDINATOR: P. Veera Narayana</div>
            <div>PHONE: 9848635931</div>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM LETTERBOX & PROGRESS TIMELINE */}
      <div className="w-full flex flex-col items-center gap-2 pointer-events-auto">
        {/* Cinematic Progress Scrub Bar */}
        <div className="w-full max-w-xl h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm relative">
          <div
            className="h-full bg-gold-gradient transition-all duration-100 ease-out shadow-[0_0_12px_#ffd84d]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Phase Subtitle & Status */}
        <div className="flex items-center justify-between w-full max-w-xl font-mono text-[10px] tracking-widest text-metallic-gold/90 uppercase px-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-metallic-bright" />
            <span>3D CINEMATIC REVEAL</span>
          </span>
          <span className="text-gray-400">
            {progress < 30 ? 'PHASE 1: IGNITION & LASER SWEEP' : progress < 70 ? 'PHASE 2: 3D ACCELERATION & DRIFT' : progress < 90 ? 'PHASE 3: HERO STANCE & TELEMETRY' : 'PHASE 4: HYPERSPACE TRANSITION'}
          </span>
          <span className="text-metallic-bright font-bold">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* High-Tech HUD Viewport Corner Accents */}
      <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-metallic-gold/70 pointer-events-none" />
      <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-metallic-gold/70 pointer-events-none" />
      <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-metallic-gold/70 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-metallic-gold/70 pointer-events-none" />
    </div>
  );
}
