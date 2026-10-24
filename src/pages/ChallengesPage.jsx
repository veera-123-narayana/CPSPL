import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit, BarChart3, Globe, Search, Sparkles, Filter,
  ArrowRight, ShieldCheck, Clock, Award, Terminal, Layers, Orbit, ExternalLink
} from 'lucide-react';
import ProblemLightbox from '../components/ProblemLightbox';
import { sounds } from '../audio/sounds';

export default function ChallengesPage({ problems = [], timerState }) {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightboxId, setActiveLightboxId] = useState(null);

  // Filter problems by domain and search query
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      const matchDomain = selectedDomain === 'ALL' || prob.domain === selectedDomain;
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        prob.problemId.toLowerCase().includes(query) ||
        prob.title.toLowerCase().includes(query) ||
        prob.summary?.toLowerCase().includes(query) ||
        prob.domain.toLowerCase().includes(query);

      return matchDomain && matchQuery;
    });
  }, [problems, selectedDomain, searchQuery]);

  const domainStats = useMemo(() => ({
    all: problems.length,
    ai: problems.filter(p => p.domain === 'AI / MACHINE LEARNING').length,
    analytics: problems.filter(p => p.domain === 'DATA ANALYTICS').length,
    web: problems.filter(p => p.domain === 'WEB DEVELOPMENT').length
  }), [problems]);

  const handleOpenDetail = (problemId) => {
    sounds.playClick();
    setActiveLightboxId(problemId);
  };

  const handleNavigateFull = (problemId) => {
    navigate(`/challenges/${problemId}`);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-metallic-gold/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deepspace border border-metallic-gold/30 backdrop-blur-md mb-3 shadow-gold-sm">
            <Sparkles className="w-3.5 h-3.5 text-metallic-bright animate-spin" style={{ animationDuration: '8s' }} />
            <span className="font-mono text-xs tracking-widest text-metallic-bright uppercase">
              OFFICIAL PROBLEM STATEMENTS
            </span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-gold-gradient uppercase tracking-tight">
            PROBLEM STATEMENT CATALOG
          </h1>

          <p className="mt-2 text-sm sm:text-base text-mutedsilver font-light max-w-2xl leading-relaxed">
            All 12 authoritative challenges for INNOVRUSH 2K26. Build time: <span className="text-white font-medium">90 Minutes</span> · Evaluated on <span className="text-metallic-gold font-medium">60% Presentation</span> & <span className="text-metallic-bright font-medium">40% AI Prototype</span>.
          </p>
        </div>

        {/* Action Button: Return to 3D Globe */}
        <Link
          to="/"
          onClick={() => sounds.playClick()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-deepspace border border-metallic-gold/40 text-metallic-bright hover:border-metallic-gold hover:shadow-gold-sm font-mono text-xs font-bold uppercase tracking-wider transition-all self-start md:self-auto cursor-pointer"
        >
          <Orbit className="w-4 h-4 text-metallic-gold animate-spin" style={{ animationDuration: '10s' }} />
          <span>SWITCH TO 3D GLOBE ARENA</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* DOMAIN SUMMARY CARDS WITH VIBRANT COLORS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        {/* All */}
        <div
          onClick={() => { setSelectedDomain('ALL'); sounds.playClick(); }}
          className={`p-4 rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border-2 transition-all cursor-pointer ${
            selectedDomain === 'ALL'
              ? 'border-metallic-gold shadow-gold-md scale-[1.02]'
              : 'border-metallic-gold/30 hover:border-metallic-gold/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase">ALL CHALLENGES</span>
            <Layers className="w-4 h-4 text-metallic-gold" />
          </div>
          <div className="font-cinzel text-3xl font-black text-gold-gradient mt-2">
            {domainStats.all}
          </div>
          <div className="text-[11px] font-mono text-mutedsilver mt-1">Full 3D Matrix</div>
        </div>

        {/* AI & ML */}
        <div
          onClick={() => { setSelectedDomain('AI / MACHINE LEARNING'); sounds.playClick(); }}
          className={`p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 via-deepspace to-obsidian border-2 transition-all cursor-pointer ${
            selectedDomain === 'AI / MACHINE LEARNING'
              ? 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-[1.02]'
              : 'border-purple-500/40 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-purple-300 uppercase font-semibold">AI & MACHINE LEARNING</span>
            <BrainCircuit className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-cinzel text-3xl font-black text-purple-200 mt-2">
            {domainStats.ai}
          </div>
          <div className="text-[11px] font-mono text-purple-300/80 mt-1">Predictive & NLP Models</div>
        </div>

        {/* Data Analytics */}
        <div
          onClick={() => { setSelectedDomain('DATA ANALYTICS'); sounds.playClick(); }}
          className={`p-4 rounded-2xl bg-gradient-to-b from-cyan-950/40 via-deepspace to-obsidian border-2 transition-all cursor-pointer ${
            selectedDomain === 'DATA ANALYTICS'
              ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.02]'
              : 'border-cyan-500/40 hover:border-cyan-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-300 uppercase font-semibold">DATA ANALYTICS</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-cinzel text-3xl font-black text-cyan-200 mt-2">
            {domainStats.analytics}
          </div>
          <div className="text-[11px] font-mono text-cyan-300/80 mt-1">Spatial & Heatmaps</div>
        </div>

        {/* Web Development */}
        <div
          onClick={() => { setSelectedDomain('WEB DEVELOPMENT'); sounds.playClick(); }}
          className={`p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-deepspace to-obsidian border-2 transition-all cursor-pointer ${
            selectedDomain === 'WEB DEVELOPMENT'
              ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-[1.02]'
              : 'border-emerald-500/40 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-300 uppercase font-semibold">WEB DEVELOPMENT</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-cinzel text-3xl font-black text-emerald-200 mt-2">
            {domainStats.web}
          </div>
          <div className="text-[11px] font-mono text-emerald-300/80 mt-1">Real-time Portals</div>
        </div>
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-deepspace/85 border border-metallic-gold/30 backdrop-blur-md mb-8 shadow-md">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-metallic-gold" />
          <input
            type="text"
            placeholder="Search PS-01, title, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-obsidian border border-white/15 focus:border-metallic-gold rounded-xl font-mono text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'AI / MACHINE LEARNING', label: 'AI/ML' },
            { id: 'DATA ANALYTICS', label: 'Analytics' },
            { id: 'WEB DEVELOPMENT', label: 'Web Dev' }
          ].map((tab) => {
            const isActive = selectedDomain === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedDomain(tab.id);
                  sounds.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gold-gradient text-obsidian font-bold shadow-gold-sm'
                    : 'text-mutedsilver hover:text-white bg-black/40 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PROBLEM STATEMENTS GRID (VIBRANT & EFFECTIVE CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((prob) => {
          const isAi = prob.domain === 'AI / MACHINE LEARNING';
          const isAnalytics = prob.domain === 'DATA ANALYTICS';
          const Icon = isAi ? BrainCircuit : isAnalytics ? BarChart3 : Globe;

          // Domain Color Theme
          const cardBorder = isAi
            ? 'border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)]'
            : isAnalytics
            ? 'border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]'
            : 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.35)]';

          const domainPill = isAi
            ? 'bg-purple-950/80 border-purple-500/60 text-purple-300'
            : isAnalytics
            ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
            : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';

          const accentLine = isAi
            ? 'from-purple-500 to-transparent'
            : isAnalytics
            ? 'from-cyan-500 to-transparent'
            : 'from-emerald-500 to-transparent';

          return (
            <div
              key={prob.problemId}
              onClick={() => handleOpenDetail(prob.problemId)}
              className={`group relative rounded-2xl p-6 bg-gradient-to-b from-deepspace via-obsidian to-black border-2 ${cardBorder} shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:scale-[1.01]`}
            >
              {/* Subtle Ambient Glow in Card Corner */}
              <div
                className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                style={{ backgroundColor: isAi ? '#a855f7' : isAnalytics ? '#06b6d4' : '#10b981' }}
              />

              {/* Card Top: ID Badge & Domain Pill */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-obsidian border border-metallic-gold/50 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-metallic-bright animate-ping" />
                    <span className="font-mono text-sm font-bold text-metallic-bright tracking-wider">
                      {prob.problemId}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${domainPill}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isAi ? 'AI / ML' : isAnalytics ? 'Analytics' : 'Web Dev'}</span>
                  </div>
                </div>

                {/* Accent separator line */}
                <div className={`h-0.5 w-16 bg-gradient-to-r ${accentLine} mb-3`} />

                {/* Title */}
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white group-hover:text-metallic-bright transition-colors leading-snug">
                  {prob.title}
                </h3>

                {/* Summary */}
                <p className="mt-3 text-xs sm:text-sm text-mutedsilver font-light leading-relaxed line-clamp-3">
                  {prob.summary}
                </p>
              </div>

              {/* Card Bottom: Scope Highlights & Actions */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-mono text-mutedsilver mb-3">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-metallic-gold" />
                    <span>90 Min Sprint</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Award className="w-3.5 h-3.5 text-metallic-gold" />
                    <span>60% Pres. / 40% AI Eval</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-xs text-metallic-gold group-hover:text-metallic-bright font-bold tracking-wider flex items-center gap-1.5">
                    <span>INSPECT SPECIFICATION</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      handleNavigateFull(prob.problemId);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Open Full Page View"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tech Corner Accents */}
              <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-metallic-gold/50 pointer-events-none group-hover:border-metallic-bright transition-colors" />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-metallic-gold/50 pointer-events-none group-hover:border-metallic-bright transition-colors" />
              <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-metallic-gold/50 pointer-events-none group-hover:border-metallic-bright transition-colors" />
              <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-metallic-gold/50 pointer-events-none group-hover:border-metallic-bright transition-colors" />
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredProblems.length === 0 && (
        <div className="text-center py-20 bg-deepspace/50 rounded-2xl border border-metallic-gold/20 my-8">
          <Terminal className="w-12 h-12 text-metallic-gold mx-auto mb-3 opacity-60" />
          <h3 className="font-cinzel text-xl font-bold text-white uppercase">No Problem Statements Found</h3>
          <p className="text-sm font-mono text-mutedsilver mt-1">Try resetting your search query or selecting All domains.</p>
          <button
            onClick={() => { setSelectedDomain('ALL'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* FULL PROBLEM LIGHTBOX MODAL */}
      {activeLightboxId && (
        <ProblemLightbox
          problemId={activeLightboxId}
          onClose={() => setActiveLightboxId(null)}
          onNavigateFull={handleNavigateFull}
        />
      )}
    </div>
  );
}
