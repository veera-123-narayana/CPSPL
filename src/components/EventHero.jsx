import React from 'react';
import { BrainCircuit, BarChart3, Globe, Sparkles, Terminal, Activity, ArrowUpRight } from 'lucide-react';
import { sounds } from '../audio/sounds';

export default function EventHero({ domainCounts, onSelectDomain }) {
  const domains = [
    {
      id: "AI / MACHINE LEARNING",
      name: "AI & Machine Learning",
      tagline: "Cognitive Engines & Predictive Intelligence",
      description: "Harness neural architectures, risk scoring models, NLP parsing, and automated fraud classification.",
      count: domainCounts?.aiMl || 0,
      icon: BrainCircuit,
      accentBorder: "border-purple-500/30 group-hover:border-metallic-gold",
      accentBg: "from-purple-950/20 via-deepspace to-obsidian",
      visualMotif: (
        <div className="relative w-full h-16 overflow-hidden flex items-center justify-center my-2 opacity-70 group-hover:opacity-100 transition-opacity">
          {/* Animated neural nodes */}
          <div className="flex items-center gap-6">
            <div className="w-2.5 h-2.5 rounded-full bg-metallic-bright animate-ping" />
            <div className="w-12 h-0.5 bg-gradient-to-r from-metallic-gold via-purple-400 to-metallic-bright" />
            <div className="w-3 h-3 rounded-full bg-purple-400 border border-metallic-gold" />
            <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-metallic-gold" />
            <div className="w-2.5 h-2.5 rounded-full bg-metallic-gold" />
          </div>
        </div>
      )
    },
    {
      id: "DATA ANALYTICS",
      name: "Data Analytics",
      tagline: "Telemetry, Space & Labor Intelligence",
      description: "Translate multi-source streams into actionable spatial heatmaps, ecological indices, and hiring matrices.",
      count: domainCounts?.dataAnalytics || 0,
      icon: BarChart3,
      accentBorder: "border-cyan-500/30 group-hover:border-metallic-gold",
      accentBg: "from-cyan-950/20 via-deepspace to-obsidian",
      visualMotif: (
        <div className="relative w-full h-16 overflow-hidden flex items-end justify-center gap-2 pb-2 opacity-70 group-hover:opacity-100 transition-opacity">
          {/* Animated telemetry bars */}
          <div className="w-2.5 bg-metallic-gold/50 rounded-t h-6 animate-pulse" />
          <div className="w-2.5 bg-cyan-400/60 rounded-t h-12" />
          <div className="w-2.5 bg-metallic-bright/80 rounded-t h-9 animate-pulse" style={{ animationDelay: '0.4s' }} />
          <div className="w-2.5 bg-cyan-300 rounded-t h-14" />
          <div className="w-2.5 bg-metallic-gold rounded-t h-8" />
        </div>
      )
    },
    {
      id: "WEB DEVELOPMENT",
      name: "Web Development",
      tagline: "High-Performance Unified Digital Campuses",
      description: "Engineer accessible institutional hubs, responsive opportunity aggregators, and real-time dispute engines.",
      count: domainCounts?.webDev || 0,
      icon: Globe,
      accentBorder: "border-emerald-500/30 group-hover:border-metallic-gold",
      accentBg: "from-emerald-950/20 via-deepspace to-obsidian",
      visualMotif: (
        <div className="relative w-full h-16 overflow-hidden flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
          {/* Wireframe browser mockup */}
          <div className="w-32 h-12 rounded border border-metallic-gold/40 bg-obsidian/60 p-1 flex flex-col justify-between">
            <div className="flex items-center gap-1 border-b border-metallic-gold/20 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-metallic-gold" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="h-1 w-12 bg-white/20 rounded-full ml-1" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-3 bg-white/10 rounded" />
              <div className="h-3 bg-metallic-gold/30 rounded col-span-2" />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepspace border border-metallic-gold/30 backdrop-blur-md mb-4 shadow-gold-sm">
          <Sparkles className="w-3.5 h-3.5 text-metallic-bright animate-spin" style={{ animationDuration: '8s' }} />
          <span className="font-mono text-xs tracking-widest text-metallic-bright uppercase">INNOVRUSH 2K26 ARENA</span>
        </div>

        <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gold-gradient uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          THE NEXT INNOVATION STARTS HERE
        </h1>

        <p className="mt-4 text-base sm:text-lg text-mutedsilver font-light max-w-2xl mx-auto leading-relaxed">
          Think beyond boundaries. Build bold solutions. Turn ideas into impact.
        </p>
      </div>

      {/* DOMAIN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domains.map((dom) => {
          const Icon = dom.icon;
          const isLive = dom.count > 0;

          return (
            <div
              key={dom.id}
              onClick={() => {
                sounds.playClick();
                if (onSelectDomain) onSelectDomain(dom.id);
              }}
              onMouseEnter={() => sounds.playHover()}
              className={`group relative rounded-2xl p-6 bg-gradient-to-b ${dom.accentBg} border ${dom.accentBorder} shadow-lg hover:shadow-gold-md hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between`}
            >
              {/* Background ambient glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-metallic-gold/5 rounded-full blur-2xl group-hover:bg-metallic-gold/15 transition-all" />

              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-deepspace border border-metallic-gold/30 text-metallic-bright group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-deepspace/80 border border-metallic-gold/20 font-mono text-[10px] tracking-wider">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-metallic-bright animate-pulse' : 'bg-mutedsilver'}`} />
                    <span className="text-softwhite uppercase">{isLive ? `${dom.count} LIVE` : 'STANDBY'}</span>
                  </div>
                </div>

                <h3 className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-softwhite group-hover:text-metallic-bright transition-colors">
                  {dom.name}
                </h3>
                <div className="font-mono text-[10px] tracking-wider text-metallic-gold uppercase mt-0.5">
                  {dom.tagline}
                </div>

                <p className="text-xs text-mutedsilver mt-2 leading-relaxed">
                  {dom.description}
                </p>

                {/* Decorative Visual Motif */}
                {dom.visualMotif}
              </div>

              {/* Footer status link */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-2">
                <span className="font-mono text-xs text-mutedsilver group-hover:text-metallic-bright transition-colors">
                  {dom.count === 0 ? 'Awaiting Release' : `${dom.count} Problem Statement${dom.count > 1 ? 's' : ''}`}
                </span>
                <span className="flex items-center gap-1 text-xs font-mono text-metallic-gold group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
