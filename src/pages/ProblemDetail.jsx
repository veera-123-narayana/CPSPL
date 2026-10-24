import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BrainCircuit, BarChart3, Globe, ShieldAlert,
  Clock, CheckCircle, Terminal, Layers, Sparkles, Award, Lock, Unlock, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { sounds } from '../audio/sounds';

export default function ProblemDetail({ timerState }) {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPublicProblemDetail(problemId);
      setProblem(data);
    } catch (err) {
      setError(err.message || 'Problem statement is sealed or does not exist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();

    // Listen for live updates or constraint releases in real-time
    const unbind1 = wsClient.on('PROBLEM_UPDATED', (payload) => {
      if (payload.payload?.problemId?.toUpperCase() === problemId?.toUpperCase()) {
        fetchProblem();
      }
    });

    const unbind2 = wsClient.on('CONSTRAINTS_RELEASED', () => {
      fetchProblem();
    });

    const unbind3 = wsClient.on('CONSTRAINT_REVOKED', () => {
      fetchProblem();
    });

    return () => {
      unbind1();
      unbind2();
      unbind3();
    };
  }, [problemId]);

  // Format timer
  const formatTimer = (totalSeconds = 0) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center z-10 relative">
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-metallic-gold border-t-transparent animate-spin mb-4" />
        <div className="font-mono text-xs tracking-widest text-metallic-gold uppercase">
          Decrypting Official Problem Record [{problemId}]...
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center z-10 relative">
        <div className="p-8 rounded-2xl bg-deepspace/80 border border-red-500/30 backdrop-blur-md">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-cinzel text-xl font-bold text-softwhite uppercase">
            Access Restricted / Sealed Track
          </h2>
          <p className="text-xs sm:text-sm text-mutedsilver font-light mt-2 max-w-md mx-auto leading-relaxed">
            {error || 'This problem statement has not been published or requires authorized administrative launch.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              to="/challenges"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-metallic-gold text-obsidian font-mono text-xs font-bold tracking-wider hover:bg-metallic-bright transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Challenge Board</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAi = problem.domain === 'AI / MACHINE LEARNING';
  const isAnalytics = problem.domain === 'DATA ANALYTICS';
  const isWebDev = problem.domain === 'WEB DEVELOPMENT';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10 relative">
      
      {/* NAVIGATION & STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-metallic-gold/15 pb-4">
        <Link
          to="/challenges"
          onClick={() => sounds.playClick()}
          className="inline-flex items-center gap-2 text-xs font-mono text-metallic-gold hover:text-metallic-bright transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO CHALLENGES</span>
        </Link>

        {/* Challenge Timer Widget */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-deepspace border border-metallic-gold/30">
            <Clock className={`w-4 h-4 ${timerState?.status === 'RUNNING' ? 'text-metallic-bright animate-spin' : 'text-mutedsilver'}`} style={{ animationDuration: '6s' }} />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-mutedsilver uppercase">TIME REMAINING</span>
              <span className="font-mono text-xs font-bold text-metallic-bright tracking-wider">
                {formatTimer(timerState?.remainingSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER SECTION WITH DOMAIN ADAPTIVE THEMING */}
      <div className={`rounded-2xl p-6 sm:p-8 mb-8 border backdrop-blur-md ${
        isAi
          ? 'bg-gradient-to-r from-purple-950/30 via-deepspace to-obsidian border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
          : isAnalytics
          ? 'bg-gradient-to-r from-cyan-950/30 via-deepspace to-obsidian border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
          : 'bg-gradient-to-r from-emerald-950/30 via-deepspace to-obsidian border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
      }`}>
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded bg-obsidian border border-metallic-gold text-metallic-bright font-mono text-xs font-bold">
            {problem.problemId}
          </span>
          <span className="px-3 py-1 rounded-full bg-deepspace border border-white/10 text-softwhite font-mono text-xs tracking-wider uppercase">
            {problem.domain}
          </span>
          <span className="px-3 py-1 rounded-full bg-metallic-gold/15 border border-metallic-gold/40 text-metallic-gold font-mono text-xs tracking-wider uppercase">
            Status: {problem.publicationStatus}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-cinzel text-2xl sm:text-4xl font-black text-softwhite tracking-tight uppercase">
          {problem.title}
        </h1>

        <p className="mt-3 text-sm sm:text-base text-mutedsilver font-light leading-relaxed max-w-4xl">
          {problem.summary}
        </p>

        {/* DOMAIN ADAPTIVE VISUALIZER PANEL */}
        {isAi && (
          <div className="mt-6 p-4 rounded-xl bg-obsidian/70 border border-purple-500/30 font-mono text-xs text-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
              <span>AI Engine Architecture: Risk Probabilities · Causal Explanations · Intervention Recommendations</span>
            </div>
            <span className="hidden sm:inline text-[10px] text-metallic-gold">TENSOR_READY</span>
          </div>
        )}

        {isAnalytics && (
          <div className="mt-6 p-4 rounded-xl bg-obsidian/70 border border-cyan-500/30 font-mono text-xs text-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span>Telemetry Streams: Spatial Occupancy · Longitudinal Trends · Gap Matrices</span>
            </div>
            <span className="hidden sm:inline text-[10px] text-metallic-gold">TIME_SERIES_ACTIVE</span>
          </div>
        )}

        {isWebDev && (
          <div className="mt-6 p-4 rounded-xl bg-obsidian/70 border border-emerald-500/30 font-mono text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Portal Wireframe: Unified Views · Reactive Ticket Pipelines · Role Architecture</span>
            </div>
            <span className="hidden sm:inline text-[10px] text-metallic-gold">UI_FRAMEWORK_OPEN</span>
          </div>
        )}

      </div>

      {/* CORE SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLUMNS: DETAILED SOURCE CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* PROBLEM DESCRIPTION */}
          <div className="rounded-2xl bg-deepspace/70 border border-metallic-gold/20 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-metallic-gold font-mono text-xs tracking-wider uppercase mb-3">
              <Layers className="w-4 h-4" />
              <span>Full Problem Statement & Background</span>
            </div>
            <p className="text-sm text-softwhite/90 leading-relaxed font-light whitespace-pre-line">
              {problem.problemDescription}
            </p>
          </div>

          {/* CHALLENGE CORE */}
          <div className="rounded-2xl bg-deepspace/70 border border-metallic-gold/20 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-metallic-bright font-mono text-xs tracking-wider uppercase mb-3">
              <Terminal className="w-4 h-4" />
              <span>Core Challenge Objective</span>
            </div>
            <p className="text-sm text-softwhite/90 leading-relaxed font-light">
              {problem.challenge}
            </p>
          </div>

          {/* EXPECTED OUTPUT */}
          <div className="rounded-2xl bg-deepspace/70 border border-metallic-gold/20 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-metallic-gold font-mono text-xs tracking-wider uppercase mb-3">
              <Award className="w-4 h-4" />
              <span>Expected Output & Deliverable Scope</span>
            </div>
            <p className="text-sm text-softwhite/90 leading-relaxed font-light">
              {problem.expectedOutput}
            </p>
          </div>

          {/* FUNCTIONAL SCOPE AND FEATURES */}
          <div className="rounded-2xl bg-deepspace/70 border border-metallic-gold/20 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 text-metallic-bright font-mono text-xs tracking-wider uppercase mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>Functional Scope & Required System Features</span>
            </div>
            <ul className="space-y-3">
              {problem.functionalScope?.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-softwhite/90">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-metallic-gold/20 border border-metallic-gold flex items-center justify-center font-mono text-[10px] text-metallic-bright mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* RIGHT COLUMN: RULES, EVALUATION & SURPRISE CONSTRAINTS */}
        <div className="space-y-6">
          
          {/* SURPRISE CONSTRAINTS MODULE (CRITICAL REQUIREMENT) */}
          <div className="rounded-2xl bg-deepspace/90 border border-metallic-amber/40 p-6 shadow-amber-glow backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-metallic-bright font-mono text-xs tracking-wider uppercase">
                {problem.releasedConstraints && problem.releasedConstraints.length > 0 ? (
                  <Unlock className="w-4 h-4 text-metallic-amber animate-pulse" />
                ) : (
                  <Lock className="w-4 h-4 text-mutedsilver" />
                )}
                <span>Dynamic Challenge Conditions</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider ${
                problem.releasedConstraints && problem.releasedConstraints.length > 0
                  ? 'bg-metallic-amber/20 text-metallic-bright border border-metallic-amber'
                  : 'bg-white/5 text-mutedsilver border border-white/10'
              }`}>
                {problem.releasedConstraints && problem.releasedConstraints.length > 0 ? 'RELEASED' : 'STANDBY'}
              </span>
            </div>

            {/* If released: display real constraints */}
            {problem.releasedConstraints && problem.releasedConstraints.length > 0 ? (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-metallic-amber/10 border border-metallic-amber/40 text-xs text-metallic-bright font-mono mb-2">
                  Official surprise conditions released by administrative control.
                </div>
                {problem.releasedConstraints.map((c) => (
                  <div key={c.constraintId} className="p-3.5 rounded-xl bg-obsidian border border-metallic-gold/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-metallic-bright">
                        {c.constraintId}: {c.title}
                      </span>
                      <span className="text-[9px] font-mono text-metallic-gold uppercase">
                        {c.scope}
                      </span>
                    </div>
                    <p className="text-xs text-mutedsilver mt-1 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Before release: neutral label, ZERO secret leaks! */
              <div className="p-4 rounded-xl bg-obsidian/60 border border-white/10 text-center">
                <div className="font-mono text-xs text-softwhite font-medium mb-1">
                  ADDITIONAL CHALLENGE CONDITIONS
                </div>
                <p className="text-xs text-mutedsilver font-light">
                  Additional conditions may be released during the event.
                </p>
              </div>
            )}
          </div>

          {/* RULES AND EVALUATION BREAKDOWN */}
          <div className="rounded-2xl bg-deepspace/70 border border-metallic-gold/20 p-6 backdrop-blur-md">
            <h3 className="font-cinzel text-base font-bold text-softwhite uppercase tracking-wider mb-4">
              Evaluation & Rules
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-obsidian/70 border border-white/5">
                <span className="text-mutedsilver text-[10px] uppercase block mb-1">BUILD DURATION</span>
                <span className="text-metallic-bright font-bold">90 Minutes Prototype Building</span>
              </div>

              <div className="p-3 rounded-xl bg-obsidian/70 border border-white/5">
                <span className="text-mutedsilver text-[10px] uppercase block mb-1">OFFICIAL EVALUATION SPLIT</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2 rounded bg-deepspace border border-metallic-gold/20 text-center">
                    <div className="text-lg font-black text-metallic-gold">60%</div>
                    <div className="text-[9px] text-mutedsilver uppercase">Presentation</div>
                  </div>
                  <div className="p-2 rounded bg-deepspace border border-metallic-gold/20 text-center">
                    <div className="text-lg font-black text-metallic-bright">40%</div>
                    <div className="text-[9px] text-mutedsilver uppercase">Prototype (AI)</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-obsidian/70 border border-white/5">
                <span className="text-mutedsilver text-[10px] uppercase block mb-1">ADDITIONAL JUDGING CRITERIA</span>
                <span className="text-softwhite/80 font-sans text-xs">
                  Not specified in the event document.
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <Link
            to="/event/timer"
            className="w-full block text-center py-3 rounded-xl bg-deepspace border border-metallic-gold/40 text-metallic-bright font-mono text-xs font-bold tracking-wider hover:border-metallic-gold hover:shadow-gold-sm transition-all"
          >
            OPEN FULLSCREEN TIMER HUD
          </Link>

        </div>

      </div>

    </div>
  );
}
