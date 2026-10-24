import React, { useEffect, useState } from 'react';
import {
  Settings, Users, AlertTriangle, CheckCircle2, ShieldCheck, X,
  Database, RefreshCw, Key, Cloud, Copy, ExternalLink, Check
} from 'lucide-react';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';
import {
  getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection,
  syncTableToSupabase, getSupabaseSchemaSQL
} from '../../services/supabase';
import { sounds } from '../../audio/sounds';

export default function AdminSettings() {
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeamSize, setSelectedTeamSize] = useState('2–4 members (minimum 2)');
  const [organizerNote, setOrganizerNote] = useState('Confirmed by organizing committee for NEXUSVERSE 2K26 INNOVRUSH.');
  const [feedback, setFeedback] = useState(null);

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [syncingData, setSyncingData] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicEvent();
      setEventData(res);
      if (res.rules?.approvedTeamSize) {
        setSelectedTeamSize(res.rules.approvedTeamSize);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();

    const cfg = getSupabaseConfig();
    setSupabaseUrl(cfg.url);
    setSupabaseKey(cfg.key);
    if (cfg.isConfigured) {
      setSupabaseStatus({ success: true, message: 'Supabase credentials active.' });
    }

    const unbind = wsClient.on('EVENT_RULES_UPDATED', () => {
      fetchEvent();
    });
    return () => unbind();
  }, []);

  const handleApproveTeamSize = async (e) => {
    e.preventDefault();
    try {
      sounds.playClick();
      await api.approveTeamSize(selectedTeamSize, organizerNote);
      setFeedback({ type: 'success', message: `Team size rule confirmed: ${selectedTeamSize}` });
      fetchEvent();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleManualStatusChange = async (newStatus) => {
    try {
      sounds.playClick();
      await api.updateEventStatus(newStatus);
      setFeedback({ type: 'success', message: `Event status manually set to: ${newStatus}` });
      fetchEvent();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleSaveSupabase = async () => {
    sounds.playClick();
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setTestingSupabase(true);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setSupabaseStatus(res);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Supabase connected and credentials saved!' });
      } else {
        setFeedback({ type: 'error', message: `Supabase error: ${res.message}` });
      }
    } catch (err) {
      setSupabaseStatus({ success: false, message: err.message });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSyncToSupabase = async () => {
    try {
      sounds.playClick();
      setSyncingData(true);
      const allProblems = await api.getAdminProblems();
      await syncTableToSupabase('problems', allProblems);
      setFeedback({
        type: 'success',
        message: `Successfully synced ${allProblems.length} problem statement(s) to Supabase Cloud!`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Sync failed: ${err.message}. Make sure the 'problems' table exists in Supabase SQL editor.`
      });
    } finally {
      setSyncingData(false);
    }
  };

  const handleCopySchema = () => {
    sounds.playClick();
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* HEADER */}
      <div className="border-b border-metallic-gold/15 pb-4">
        <h1 className="font-cinzel text-2xl font-black text-softwhite uppercase">
          Rule Settings & Cloud Database
        </h1>
        <p className="text-xs text-mutedsilver font-light mt-0.5">
          Govern competition rules and integrate Supabase Cloud for real-time data sync.
        </p>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-mono border ${
          feedback.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' :
          'bg-red-950/30 border-red-500/40 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-mutedsilver hover:text-softwhite">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUPABASE CLOUD INTEGRATION CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-deepspace to-obsidian border border-metallic-gold/30 shadow-gold-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-obsidian border border-metallic-gold/40 text-metallic-bright shadow-gold-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-base font-bold text-softwhite uppercase tracking-wider">
                  Supabase Cloud Integration
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                  Dual-Engine
                </span>
              </div>
              <p className="text-xs text-mutedsilver font-light mt-0.5">
                Connect your Supabase project for real-time cloud data storage & administrator auth.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopySchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-metallic-gold/30 bg-obsidian text-xs font-mono text-metallic-gold hover:text-metallic-bright hover:border-metallic-gold transition-all"
            title="Copy SQL definitions to run in your Supabase SQL Editor"
          >
            {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSQL ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
          </button>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-mutedsilver block mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian border border-metallic-gold/25 text-softwhite focus:outline-none focus:border-metallic-gold transition-colors font-mono"
            />
          </div>

          <div>
            <label className="text-mutedsilver block mb-1">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian border border-metallic-gold/25 text-softwhite focus:outline-none focus:border-metallic-gold transition-colors font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveSupabase}
              disabled={testingSupabase}
              className="px-4 py-2 rounded-xl bg-gold-gradient text-obsidian font-bold shadow-gold-sm hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-2"
            >
              {testingSupabase ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span>Save & Test Supabase</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncingData}
              className="px-4 py-2 rounded-xl bg-obsidian border border-metallic-gold/40 text-metallic-bright font-bold hover:bg-metallic-gold/10 transition-all flex items-center gap-2"
            >
              {syncingData ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Sync Problems to Supabase</span>
            </button>

            {supabaseStatus && (
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                supabaseStatus.success
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/30 border-red-500/40 text-red-300'
              }`}>
                {supabaseStatus.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TEAM SIZE DISCREPANCY CARD */}
      <div className="p-6 rounded-2xl bg-deepspace border border-metallic-gold/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-metallic-bright">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-softwhite uppercase tracking-wider">
                Team Size Governance
              </h3>
              <p className="text-xs text-mutedsilver font-light">
                Reconciliation for official poster vs guideline documentation.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-metallic-gold/15 border border-metallic-gold/30 text-metallic-bright">
            RATIFIED
          </span>
        </div>

        <form onSubmit={handleApproveTeamSize} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-mutedsilver block mb-1">
              Select Official Enforced Team Size:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                '2–4 members (minimum 2)',
                '1–4 members (solo allowed)',
                '3–5 members'
              ].map((opt) => (
                <label
                  key={opt}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    selectedTeamSize === opt
                      ? 'bg-metallic-gold/15 border-metallic-gold text-metallic-bright'
                      : 'bg-obsidian border-white/5 text-mutedsilver hover:border-metallic-gold/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="teamSize"
                    value={opt}
                    checked={selectedTeamSize === opt}
                    onChange={(e) => setSelectedTeamSize(e.target.value)}
                    className="accent-[#d4a72c]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-mutedsilver block mb-1">
              Organizer Ratification Note (Audit Reference)
            </label>
            <input
              type="text"
              value={organizerNote}
              onChange={(e) => setOrganizerNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-obsidian border border-metallic-gold/25 text-softwhite focus:outline-none focus:border-metallic-gold"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian font-bold shadow-gold-sm hover:scale-[1.01] transition-all"
          >
            Approve & Publish Rule Update
          </button>
        </form>
      </div>

      {/* MANUAL EVENT STATUS OVERRIDE */}
      <div className="p-6 rounded-2xl bg-deepspace border border-metallic-gold/20">
        <h3 className="font-cinzel text-base font-bold text-softwhite uppercase tracking-wider mb-2">
          Manual Event Status Override
        </h3>
        <p className="text-xs text-mutedsilver font-light mb-4">
          Override current global event lifecycle state if required during live operations.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
          {[
            'WAITING FOR PROBLEM RELEASE',
            'PROBLEM STATEMENTS LIVE',
            'CHALLENGE IN PROGRESS',
            'CONSTRAINTS RELEASED',
            'TIME EXPIRED',
            'EVENT COMPLETED'
          ].map((st) => (
            <button
              key={st}
              onClick={() => handleManualStatusChange(st)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                eventData?.status === st
                  ? 'bg-metallic-gold/20 border-metallic-gold text-metallic-bright font-bold shadow-gold-sm'
                  : 'bg-obsidian border-white/5 text-mutedsilver hover:text-softwhite hover:border-metallic-gold/30'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
