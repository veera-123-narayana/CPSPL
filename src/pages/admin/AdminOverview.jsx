import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, AlertOctagon, Clock, Activity, Radio, Users,
  CheckCircle, ArrowRight, Play, Pause, Flame, ShieldAlert, Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';
import { sounds } from '../../audio/sounds';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();

    // Listen for live state updates
    const unbind = wsClient.on('*', () => {
      fetchOverview();
    });

    return () => unbind();
  }, []);

  const formatTimer = (totalSeconds = 0) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-metallic-gold border-t-transparent animate-spin mb-3" />
        <span className="font-mono text-xs text-metallic-gold uppercase">Loading Admin Telemetry...</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const timer = data?.timer || {};

  return (
    <div className="space-y-8">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-metallic-gold/15 pb-4">
        <div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-softwhite uppercase">
            Launch Platform Overview
          </h1>
          <p className="text-xs text-mutedsilver font-light mt-0.5">
            Real-time status of challenges, timer engine, and surprise constraints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-deepspace border border-metallic-gold/30 font-mono text-xs flex items-center gap-2">
            <span className="text-mutedsilver uppercase text-[10px]">EVENT STATUS:</span>
            <span className="text-metallic-bright font-bold uppercase">{data?.eventStatus}</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Published Problems */}
        <div className="p-5 rounded-2xl bg-deepspace border border-metallic-gold/25 relative overflow-hidden">
          <div className="flex items-center justify-between text-mutedsilver mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Published Problems</span>
            <Layers className="w-4 h-4 text-metallic-gold" />
          </div>
          <div className="font-mono text-3xl font-black text-metallic-bright">
            {stats.publishedProblems || 0}
            <span className="text-xs text-mutedsilver font-normal ml-2">/ {stats.totalProblems || 12}</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-mutedsilver">
            {stats.draftProblems || 0} Problem Statements in draft
          </div>
        </div>

        {/* Surprise Constraints */}
        <div className="p-5 rounded-2xl bg-deepspace border border-metallic-gold/25 relative overflow-hidden">
          <div className="flex items-center justify-between text-mutedsilver mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Released Constraints</span>
            <AlertOctagon className="w-4 h-4 text-metallic-amber" />
          </div>
          <div className="font-mono text-3xl font-black text-metallic-amber">
            {stats.releasedConstraints || 0}
            <span className="text-xs text-mutedsilver font-normal ml-2">/ {stats.totalConstraints || 3}</span>
          </div>
          <div className="mt-2 text-[10px] font-mono text-mutedsilver">
            {stats.draftConstraints || 0} Confidential drafts stored
          </div>
        </div>

        {/* Timer State */}
        <div className="p-5 rounded-2xl bg-deepspace border border-metallic-gold/25 relative overflow-hidden">
          <div className="flex items-center justify-between text-mutedsilver mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Authoritative Timer</span>
            <Clock className="w-4 h-4 text-metallic-gold" />
          </div>
          <div className="font-mono text-3xl font-black text-softwhite">
            {formatTimer(timer.remainingSeconds)}
          </div>
          <div className="mt-2 text-[10px] font-mono text-metallic-gold uppercase">
            Status: {timer.status}
          </div>
        </div>

        {/* Connected Participants */}
        <div className="p-5 rounded-2xl bg-deepspace border border-metallic-gold/25 relative overflow-hidden">
          <div className="flex items-center justify-between text-mutedsilver mb-2">
            <span className="font-mono text-[11px] uppercase tracking-wider">Live Terminals</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-black text-emerald-400">
            {stats.connectedParticipants || 1}
          </div>
          <div className="mt-2 text-[10px] font-mono text-mutedsilver">
            Real-time WebSocket subscribers
          </div>
        </div>

      </div>

      {/* QUICK COMMAND LAUNCH SHORTCUTS */}
      <div className="rounded-2xl bg-gradient-to-r from-deepspace to-obsidian border border-metallic-gold/30 p-6">
        <h3 className="font-cinzel text-base font-bold text-softwhite uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-metallic-bright" />
          <span>Event Day Launch Shortcuts</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/problems"
            className="p-4 rounded-xl bg-obsidian border border-metallic-gold/20 hover:border-metallic-gold hover:shadow-gold-sm transition-all group"
          >
            <div className="font-mono text-xs font-bold text-metallic-bright group-hover:text-metallic-gold flex items-center justify-between">
              <span>PROBLEM LAUNCH MODULE</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-mutedsilver mt-1">
              Select and publish individual problems or perform bulk track launches.
            </p>
          </Link>

          <Link
            to="/admin/constraints"
            className="p-4 rounded-xl bg-obsidian border border-metallic-amber/30 hover:border-metallic-amber hover:shadow-amber-glow transition-all group"
          >
            <div className="font-mono text-xs font-bold text-metallic-amber flex items-center justify-between">
              <span>SURPRISE CONSTRAINTS</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-mutedsilver mt-1">
              Access the gold "OPEN CONSTRAINTS" button to release conditions.
            </p>
          </Link>

          <Link
            to="/admin/timer"
            className="p-4 rounded-xl bg-obsidian border border-metallic-gold/20 hover:border-metallic-gold hover:shadow-gold-sm transition-all group"
          >
            <div className="font-mono text-xs font-bold text-metallic-bright group-hover:text-metallic-gold flex items-center justify-between">
              <span>TIMER CONTROLS</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-mutedsilver mt-1">
              Start, pause, resume, reset, or end the synchronized 90-min clock.
            </p>
          </Link>
        </div>
      </div>

      {/* RECENT AUDIT TRAIL FEED */}
      <div className="rounded-2xl bg-deepspace border border-metallic-gold/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel text-base font-bold text-softwhite uppercase tracking-wider">
            Recent Administrative Actions
          </h3>
          <Link to="/admin/audit-log" className="text-xs font-mono text-metallic-gold hover:text-metallic-bright">
            View Full Audit Log →
          </Link>
        </div>

        <div className="space-y-2">
          {data?.recentAudit && data.recentAudit.length > 0 ? (
            data.recentAudit.map((log) => (
              <div key={log.actionId} className="p-3 rounded-xl bg-obsidian border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-metallic-gold" />
                  <span className="text-metallic-bright font-bold">{log.actionType}</span>
                  <span className="text-mutedsilver">Target: {log.targetId}</span>
                </div>
                <div className="flex items-center gap-4 text-mutedsilver text-[11px]">
                  <span>{log.administratorId}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs font-mono text-mutedsilver text-center py-4">No audit actions recorded yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}
