import React, { useEffect, useState } from 'react';
import { X, ArrowRight, BrainCircuit, BarChart3, Globe, ShieldAlert, Award, Terminal, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../audio/sounds';

export default function ProblemLightbox({ problemId, onClose, onNavigateFull }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await api.getPublicProblemDetail(problemId);
        if (isMounted) setDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [problemId, onClose]);

  if (!problemId) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-obsidian/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border border-metallic-gold/45 shadow-gold-md p-6 sm:p-8 max-h-[88vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-obsidian border border-white/10 hover:border-metallic-gold text-mutedsilver hover:text-softwhite transition-colors"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 mx-auto rounded-full border-2 border-metallic-gold border-t-transparent animate-spin mb-3" />
            <span className="font-mono text-xs text-metallic-gold uppercase">Loading Problem Specifications...</span>
          </div>
        ) : detail ? (
          <div className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-metallic-bright bg-obsidian px-2.5 py-1 rounded border border-metallic-gold/30">
                  {detail.problemId}
                </span>
                <span className="font-mono text-xs text-metallic-gold uppercase tracking-wider">
                  {detail.domain}
                </span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-black text-softwhite uppercase">
                {detail.title}
              </h2>
              <p className="text-xs sm:text-sm text-mutedsilver font-light mt-1 leading-relaxed">
                {detail.summary}
              </p>
            </div>

            {/* Core Objective & Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-obsidian border border-white/5">
                <span className="text-[10px] text-metallic-bright uppercase block mb-1">CHALLENGE OBJECTIVE</span>
                <p className="text-softwhite/90 font-sans leading-relaxed">{detail.challenge}</p>
              </div>

              <div className="p-4 rounded-xl bg-obsidian border border-white/5">
                <span className="text-[10px] text-metallic-gold uppercase block mb-1">EXPECTED OUTPUT</span>
                <p className="text-softwhite/90 font-sans leading-relaxed">{detail.expectedOutput}</p>
              </div>
            </div>

            {/* Functional Scope */}
            <div className="p-4 rounded-xl bg-obsidian border border-white/5">
              <span className="font-mono text-[10px] text-metallic-bright uppercase block mb-2">
                KEY SYSTEM REQUIREMENTS
              </span>
              <ul className="space-y-1.5 text-xs text-softwhite/90">
                {detail.functionalScope?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-metallic-gold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dynamic Surprise Conditions */}
            <div className="p-4 rounded-xl bg-deepspace border border-metallic-amber/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono text-xs text-metallic-amber uppercase font-bold">
                  {detail.releasedConstraints && detail.releasedConstraints.length > 0 ? (
                    <Unlock className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Lock className="w-4 h-4 text-mutedsilver" />
                  )}
                  <span>Dynamic Conditions</span>
                </div>
                <span className="text-[10px] font-mono text-mutedsilver">
                  {detail.releasedConstraints && detail.releasedConstraints.length > 0 ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>

              {detail.releasedConstraints && detail.releasedConstraints.length > 0 ? (
                <div className="space-y-2">
                  {detail.releasedConstraints.map((c) => (
                    <div key={c.constraintId} className="p-3 rounded-lg bg-obsidian border border-metallic-gold/20 text-xs">
                      <div className="font-mono font-bold text-metallic-bright mb-0.5">{c.title}</div>
                      <p className="text-mutedsilver text-[11px]">{c.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-mutedsilver font-light">
                  No surprise conditions have been released yet for this track. Check back during the build duration.
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-mutedsilver">
                Build: 90 Mins · Evaluation: 60% Pres / 40% AI
              </span>
              <button
                onClick={() => {
                  onClose();
                  if (onNavigateFull) onNavigateFull(detail.problemId);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold hover:shadow-gold-sm transition-all"
              >
                <span>Full Challenge View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ) : (
          <div className="py-12 text-center text-xs font-mono text-mutedsilver">
            Problem statement details could not be loaded.
          </div>
        )}

      </div>
    </div>
  );
}
