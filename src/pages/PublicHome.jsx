import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventHero from '../components/EventHero';
import LiveStatusBanner from '../components/LiveStatusBanner';
import ChallengeSphere from '../components/ChallengeSphere';
import ProblemLaunchBoard from '../components/ProblemLaunchBoard';
import ProblemLightbox from '../components/ProblemLightbox';
import ModifiedPosterCard from '../components/ModifiedPosterCard';
import { Sparkles, RotateCcw, LayoutGrid, Globe2, Layers } from 'lucide-react';
import { sounds } from '../audio/sounds';

export default function PublicHome({ eventData, problems, timerState, onReplayIntro }) {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [viewMode, setViewMode] = useState('3D'); // '3D' | 'GRID'
  const [activeLightboxId, setActiveLightboxId] = useState(null);

  const handleSelectDomain = (domainId) => {
    sounds.playClick();
    setSelectedDomain(domainId);
    const element = document.getElementById('arena-view');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenProblem = (prob) => {
    setActiveLightboxId(prob.problemId);
  };

  const handleNavigateFull = (problemId) => {
    navigate(`/challenges/${problemId}`);
  };

  return (
    <div className="relative">
      
      {/* HERO SECTION */}
      <EventHero
        domainCounts={eventData?.domainCounts}
        onSelectDomain={handleSelectDomain}
      />

      {/* LIVE EVENT STATUS BANNER */}
      <LiveStatusBanner
        status={eventData?.status}
        rules={eventData?.rules}
        timerState={timerState}
      />

      {/* ARENA VIEW SECTION (3D SPHERE OR FLAT GRID) */}
      <section id="arena-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
        
        {/* VIEW MODE TOGGLE & DOMAIN TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-metallic-gold/15 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-metallic-gold uppercase tracking-wider">
              {viewMode === '3D' ? '3D ORBITAL ARENA' : 'FLAT CHALLENGE MATRIX'}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-xs font-mono text-mutedsilver">
              {problems.length} Published Statements
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 3D vs Grid Toggle Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setViewMode(viewMode === '3D' ? 'GRID' : '3D');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-deepspace border border-metallic-gold/30 hover:border-metallic-gold text-xs font-mono text-metallic-bright shadow-gold-sm transition-all"
            >
              {viewMode === '3D' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-metallic-gold" />
                  <span>Switch to Flat Grid</span>
                </>
              ) : (
                <>
                  <Globe2 className="w-3.5 h-3.5 text-metallic-gold" />
                  <span>Switch to 3D Sphere</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3D SPHERE OR FLAT GRID DISPLAY */}
        {viewMode === '3D' ? (
          <div className="rounded-2xl bg-gradient-to-b from-deepspace/60 to-obsidian border border-metallic-gold/20 overflow-hidden relative shadow-lg">
            {problems.length > 0 ? (
              <ChallengeSphere
                problems={problems}
                activeDomain={selectedDomain}
                onSelectProblem={handleOpenProblem}
                onDomainChange={(dom) => setSelectedDomain(dom)}
              />
            ) : (
              <div className="py-24 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-deepspace border border-metallic-gold/30 flex items-center justify-center text-metallic-gold mb-3">
                  <Layers className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="font-cinzel text-lg font-bold text-softwhite uppercase">
                  Arena Sealed
                </h3>
                <p className="text-xs text-mutedsilver mt-1">
                  Problem statements will appear in 3D orbit once published by the organizers.
                </p>
              </div>
            )}
          </div>
        ) : (
          <ProblemLaunchBoard
            problems={problems}
            activeTab={selectedDomain}
            onTabChange={(tab) => setSelectedDomain(tab)}
          />
        )}

      </section>

      {/* PROBLEM LIGHTBOX MODAL */}
      {activeLightboxId && (
        <ProblemLightbox
          problemId={activeLightboxId}
          onClose={() => setActiveLightboxId(null)}
          onNavigateFull={handleNavigateFull}
        />
      )}

      {/* MODIFIED POSTER SECTION FOR REFERENCE & REPLAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-metallic-gold/15 z-10 relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deepspace border border-metallic-gold/30 text-metallic-bright font-mono text-xs uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL EVENT IDENTITY</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-black text-gold-gradient uppercase tracking-wide">
              The Digital Launch Arena
            </h2>
            <p className="text-xs sm:text-sm text-mutedsilver font-light mt-2 leading-relaxed">
              INNOVRUSH 2K26 combines competitive algorithmic engineering with real-time constraint problem solving under N.B.K.R.I.S.T (Autonomous) and NEXUSVERSE.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={onReplayIntro}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-deepspace border border-metallic-gold/40 text-metallic-bright font-mono text-xs font-bold tracking-wider hover:border-metallic-gold hover:shadow-gold-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay 3D Cinematic Poster Intro</span>
              </button>
            </div>
          </div>

          <div className="w-full max-w-sm">
            <ModifiedPosterCard interactive={true} />
          </div>
        </div>
      </section>

    </div>
  );
}
