import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, BarChart3, Globe, ArrowRight, ShieldCheck, Cpu, Database, Layout } from 'lucide-react';
import { sounds } from '../audio/sounds';

export default function ProblemCard({ problem }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const getDomainTheme = (domain) => {
    switch (domain) {
      case 'AI / MACHINE LEARNING':
        return {
          icon: BrainCircuit,
          badgeColor: 'text-purple-300 border-purple-500/30 bg-purple-950/30',
          accentBorder: 'hover:border-purple-400/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]',
          codeIcon: Cpu,
          tag: 'NEURAL PREDICTION'
        };
      case 'DATA ANALYTICS':
        return {
          icon: BarChart3,
          badgeColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/30',
          accentBorder: 'hover:border-cyan-400/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]',
          codeIcon: Database,
          tag: 'SPATIAL TELEMETRY'
        };
      case 'WEB DEVELOPMENT':
      default:
        return {
          icon: Globe,
          badgeColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/30',
          accentBorder: 'hover:border-emerald-400/60',
          glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]',
          codeIcon: Layout,
          tag: 'DISTRIBUTED PORTAL'
        };
    }
  };

  const theme = getDomainTheme(problem.domain);
  const DomainIcon = theme.icon;
  const SubIcon = theme.codeIcon;

  // 3D subtle mouse tilt
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / rect.height) * 8,
      y: (x / rect.width) * 8
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleClick = () => {
    sounds.playClick();
    navigate(`/challenges/${problem.problemId}`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onMouseEnter={() => sounds.playHover()}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      }}
      className={`group relative rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border border-metallic-gold/25 ${theme.accentBorder} ${theme.glow} p-6 shadow-lg hover:shadow-gold-md transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden preserve-3d`}
    >
      {/* Top subtle golden scan line accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-metallic-gold/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* CARD HEADER: ID & DOMAIN BADGE */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-metallic-bright px-2.5 py-1 rounded bg-obsidian border border-metallic-gold/30">
              {problem.problemId}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-mutedsilver/70 uppercase">
              {theme.tag}
            </span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-wider ${theme.badgeColor}`}>
            <DomainIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{problem.domain}</span>
          </div>
        </div>

        {/* TITLE */}
        <h3 className="font-cinzel text-lg sm:text-xl font-bold text-softwhite group-hover:text-metallic-bright transition-colors line-clamp-2 leading-snug">
          {problem.title}
        </h3>

        {/* SUMMARY */}
        <p className="text-xs text-mutedsilver font-light mt-3 line-clamp-3 leading-relaxed">
          {problem.summary}
        </p>
      </div>

      {/* CARD FOOTER */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-metallic-gold">
          <ShieldCheck className="w-3.5 h-3.5 text-metallic-bright" />
          <span className="uppercase tracking-wider">Official Track</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-deepspace border border-metallic-gold/40 text-metallic-bright font-mono text-xs tracking-wider group-hover:bg-metallic-gold group-hover:text-obsidian group-hover:border-metallic-gold transition-all duration-200"
        >
          <span>VIEW CHALLENGE</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
