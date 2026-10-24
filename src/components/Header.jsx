import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Timer, ShieldAlert, Award, FileText, Zap, ChevronRight, RotateCcw } from 'lucide-react';
import { sounds } from '../audio/sounds';

export default function Header({ eventStatus, timerState, onReplayIntro }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminTooltip, setAdminTooltip] = useState(false);

  // Format seconds to HH:MM:SS
  const formatTimer = (totalSeconds = 0) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Challenges', path: '/challenges' },
    { name: 'Rules', path: '/rules' },
    { name: 'Timer HUD', path: '/event/timer' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian/90 backdrop-blur-md border-b border-metallic-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO & NEXUSVERSE TAG */}
        <Link 
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 rounded-lg bg-deepspace border border-metallic-gold/40 flex items-center justify-center overflow-hidden group-hover:border-metallic-gold transition-colors">
            <span className="font-cinzel text-base font-black text-metallic-bright">IN</span>
            <div className="absolute inset-0 bg-gold-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel text-base sm:text-lg font-bold tracking-wider text-gold-gradient leading-none">
              INNOVRUSH 2K26
            </span>
            <span className="font-mono text-[9px] tracking-widest text-mutedsilver/80 uppercase mt-0.5">
              NEXUSVERSE · N.B.K.R.I.S.T
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => sounds.playHover()}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'text-metallic-bright bg-metallic-gold/10 border border-metallic-gold/30 shadow-gold-sm'
                    : 'text-mutedsilver hover:text-softwhite hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT AREA: LIVE STATUS + COMPACT TIMER + DISCREET ADMIN DOT */}
        <div className="flex items-center gap-3">
          
          {/* Replay Intro Button */}
          {onReplayIntro && (
            <button
              onClick={() => {
                sounds.playClick();
                onReplayIntro();
              }}
              title="Replay Cinematic Poster Opening"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md border border-white/10 hover:border-metallic-gold/40 text-[10px] font-mono text-mutedsilver hover:text-metallic-bright transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Poster</span>
            </button>
          )}

          {/* Compact Countdown Indicator */}
          <Link
            to="/event/timer"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-deepspace border border-metallic-gold/25 hover:border-metallic-gold/50 transition-colors"
          >
            <Timer className={`w-3.5 h-3.5 ${timerState?.status === 'RUNNING' ? 'text-metallic-gold animate-pulse' : 'text-mutedsilver'}`} />
            <span className="font-mono text-xs font-bold text-metallic-bright tracking-wider">
              {formatTimer(timerState?.remainingSeconds)}
            </span>
          </Link>

          {/* Event Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-deepspace/80 border border-metallic-gold/20 text-[10px] font-mono tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full ${
              eventStatus === 'CHALLENGE IN PROGRESS' || eventStatus === 'CONSTRAINTS RELEASED'
                ? 'bg-metallic-bright animate-ping'
                : eventStatus === 'PROBLEM STATEMENTS LIVE'
                ? 'bg-metallic-gold'
                : 'bg-mutedsilver'
            }`} />
            <span className="text-softwhite/90 uppercase">{eventStatus || 'WAITING'}</span>
          </div>

          {/* ======================================================== */}
          {/* DISCREET GLOWING ADMIN ACCESS INDICATOR DOT (Section 2.B) */}
          {/* ======================================================== */}
          <div className="relative ml-2 flex items-center justify-center">
            <button
              onClick={() => {
                sounds.playClick();
                navigate('/admin/login');
              }}
              onMouseEnter={() => {
                sounds.playHover();
                setAdminTooltip(true);
              }}
              onMouseLeave={() => setAdminTooltip(false)}
              aria-label="Admin Access"
              className="relative p-2.5 focus:outline-none group cursor-pointer"
            >
              {/* Tiny gold/neon-yellow glowing dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-metallic-gold shadow-[0_0_8px_#FFD84D] group-hover:scale-125 group-hover:bg-metallic-bright group-hover:shadow-[0_0_14px_#FFD84D] transition-all duration-300" />
              {/* Animated surrounding ring on hover */}
              <div className="absolute inset-1 rounded-full border border-metallic-gold/0 group-hover:border-metallic-bright/80 group-hover:scale-125 transition-all duration-300 animate-spin" style={{ animationDuration: '6s' }} />
            </button>

            {/* Subtle Tooltip "Admin Access" */}
            {adminTooltip && (
              <div className="absolute right-0 top-10 z-50 whitespace-nowrap px-2.5 py-1 rounded bg-deepspace/95 border border-metallic-gold/40 text-[11px] font-mono text-metallic-bright shadow-gold-sm pointer-events-none transition-all">
                Admin Access
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
