import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Lock, Sparkles, Layers } from 'lucide-react';
import ProblemCard from './ProblemCard';
import { sounds } from '../audio/sounds';

export default function ProblemLaunchBoard({ problems = [], activeTab = 'ALL', onTabChange }) {
  const [search, setSearch] = useState('');

  const tabs = [
    { id: 'ALL', label: 'All Challenges' },
    { id: 'AI / MACHINE LEARNING', label: 'AI / ML' },
    { id: 'DATA ANALYTICS', label: 'Data Analytics' },
    { id: 'WEB DEVELOPMENT', label: 'Web Development' }
  ];

  const filteredProblems = problems.filter((p) => {
    const matchesTab = activeTab === 'ALL' || p.domain === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problemId.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <section id="challenges" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 relative">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-metallic-gold/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-metallic-gold font-mono text-xs tracking-widest uppercase mb-1">
            <Layers className="w-4 h-4" />
            <span>Problem Statement Launch Board</span>
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-softwhite uppercase tracking-wider">
            Official Challenge Arena
          </h2>
          <p className="text-xs sm:text-sm text-mutedsilver font-light mt-1">
            Published problem statements authorized by the organizing committee.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedsilver" />
          <input
            type="text"
            placeholder="Search by ID or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-deepspace border border-metallic-gold/25 focus:border-metallic-gold focus:outline-none text-xs font-mono text-softwhite placeholder:text-mutedsilver/60 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* DOMAIN TABS */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.id === 'ALL'
            ? problems.length
            : problems.filter(p => p.domain === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                onTabChange(tab.id);
              }}
              onMouseEnter={() => sounds.playHover()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-metallic-gold text-obsidian font-bold shadow-gold-sm border border-metallic-bright'
                  : 'bg-deepspace/70 text-mutedsilver border border-white/5 hover:border-metallic-gold/30 hover:text-softwhite'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-obsidian/20 text-obsidian' : 'bg-white/10 text-mutedsilver'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* PROBLEMS GRID OR EMPTY STANDBY STATE */}
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((prob) => (
            <ProblemCard key={prob.problemId} problem={prob} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-metallic-gold/20 bg-deepspace/50 p-12 text-center backdrop-blur-md">
          <div className="w-14 h-14 mx-auto rounded-full bg-obsidian border border-metallic-gold/30 flex items-center justify-center text-metallic-gold mb-4 shadow-gold-sm">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-softwhite tracking-wider uppercase">
            {problems.length === 0 ? 'Problem Statements Sealed' : 'No Matching Statements Found'}
          </h3>
          <p className="text-xs sm:text-sm text-mutedsilver font-light max-w-md mx-auto mt-2 leading-relaxed">
            {problems.length === 0
              ? 'The organizing committee has not yet published problem statements for this track. Live launch broadcasts will appear here in real time.'
              : 'Try clearing your search query or selecting a different technical domain tab.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 px-4 py-1.5 rounded-lg border border-metallic-gold/40 text-xs font-mono text-metallic-bright hover:bg-metallic-gold/10 transition-colors"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}

    </section>
  );
}
