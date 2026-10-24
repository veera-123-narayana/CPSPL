import React, { useEffect, useState } from 'react';
import {
  Clock, Play, Pause, RotateCcw, StopCircle, CheckCircle2,
  AlertTriangle, Settings, RefreshCw, X, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';
import { sounds } from '../../audio/sounds';

export default function AdminTimer() {
  const [timer, setTimer] = useState(null);
  const [eventStatus, setEventStatus] = useState('');
  const [serverTime, setServerTime] = useState('');
  const [loading, setLoading] = useState(true);

  // Duration config form
  const [durationMinutes, setDurationMinutes] = useState(90);

  // Destructive confirmation modals
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const [confirmEndModal, setConfirmEndModal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchTimerState = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicTimer();
      setTimer(res);
      setServerTime(res.serverTime);
      setDurationMinutes(Math.floor(res.durationSeconds / 60));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimerState();

    const unbind = wsClient.on('TIMER_UPDATED', (payload) => {
      if (payload.payload?.timer) {
        setTimer(payload.payload.timer);
      } else {
        fetchTimerState();
      }
    });

    return () => unbind();
  }, []);

  const handleStart = async () => {
    try {
      sounds.playClick();
      await api.startTimer();
      setFeedback({ type: 'success', message: 'Authoritative event timer started!' });
      fetchTimerState();
      sounds.playLaserSweep();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handlePause = async () => {
    try {
      sounds.playClick();
      await api.pauseTimer();
      setFeedback({ type: 'info', message: 'Timer paused. Running seconds halted across all terminals.' });
      fetchTimerState();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleResume = async () => {
    try {
      sounds.playClick();
      await api.resumeTimer();
      setFeedback({ type: 'success', message: 'Timer resumed!' });
      fetchTimerState();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleReset = async () => {
    try {
      sounds.playClick();
      await api.resetTimer(durationMinutes);
      setConfirmResetModal(false);
      setFeedback({ type: 'info', message: `Timer reset to ${durationMinutes} minutes.` });
      fetchTimerState();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleEnd = async () => {
    try {
      sounds.playClick();
      await api.endTimer();
      setConfirmEndModal(false);
      setFeedback({ type: 'warning', message: 'Event build period manually concluded.' });
      fetchTimerState();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleConfig = async (e) => {
    e.preventDefault();
    try {
      sounds.playClick();
      await api.configTimer({ durationMinutes });
      setFeedback({ type: 'success', message: `Configured duration updated to ${durationMinutes} minutes.` });
      fetchTimerState();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const formatTimer = (totalSeconds = 0) => {
    const s = Math.max(0, Math.floor(totalSeconds));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const status = timer?.status || 'WAITING';

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-metallic-gold/15 pb-4">
        <div>
          <h1 className="font-cinzel text-2xl font-black text-softwhite uppercase">
            Official Timer Control Engine
          </h1>
          <p className="text-xs text-mutedsilver font-light mt-0.5">
            Authoritative time reference broadcasted to all participant devices via WebSocket.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-deepspace border border-white/10 font-mono text-xs text-mutedsilver">
            Server: <span className="text-metallic-bright font-bold">{serverTime ? new Date(serverTime).toLocaleTimeString() : '...'}</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK TOAST */}
      {feedback && (
        <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-mono border ${
          feedback.type === 'success' ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' :
          feedback.type === 'error' ? 'bg-red-950/30 border-red-500/40 text-red-300' :
          'bg-deepspace border-metallic-gold/30 text-metallic-bright'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-mutedsilver hover:text-softwhite">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DIGITAL TIME READOUT CARD */}
      <div className="rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border border-metallic-gold/35 p-8 text-center relative overflow-hidden shadow-gold-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian border border-metallic-gold/30 text-metallic-bright font-mono text-xs uppercase mb-4">
          <span className={`w-2 h-2 rounded-full ${status === 'RUNNING' ? 'bg-metallic-bright animate-ping' : 'bg-mutedsilver'}`} />
          <span>CURRENT CLOCK STATUS: {status}</span>
        </div>

        <div className="font-mono text-6xl sm:text-7xl font-black text-softwhite tracking-tight drop-shadow-[0_0_25px_rgba(212,167,44,0.3)] my-2">
          {formatTimer(timer?.remainingSeconds)}
        </div>

        <div className="font-mono text-xs text-mutedsilver uppercase tracking-widest">
          HOURS : MINUTES : SECONDS REMAINING
        </div>

        {/* PRIMARY TIME CONTROL BUTTONS */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-6 border-t border-white/10">
          
          {status !== 'RUNNING' ? (
            <button
              onClick={status === 'PAUSED' ? handleResume : handleStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider uppercase hover:shadow-gold-md hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{status === 'PAUSED' ? 'RESUME TIMER' : 'START 90-MIN TIMER'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-metallic-amber text-obsidian font-mono text-xs font-bold tracking-wider uppercase hover:shadow-amber-glow hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE TIMER</span>
            </button>
          )}

          {/* Reset Button */}
          <button
            onClick={() => setConfirmResetModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-deepspace border border-metallic-gold/30 text-metallic-bright font-mono text-xs font-bold tracking-wider hover:border-metallic-gold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET TIMER</span>
          </button>

          {/* End Event Button */}
          <button
            onClick={() => setConfirmEndModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 font-mono text-xs font-bold tracking-wider hover:bg-red-900/40 transition-colors"
          >
            <StopCircle className="w-4 h-4" />
            <span>END BUILD PERIOD</span>
          </button>

        </div>
      </div>

      {/* CONFIGURATION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Set Duration */}
        <div className="p-6 rounded-2xl bg-deepspace border border-metallic-gold/20">
          <div className="flex items-center gap-2 text-metallic-gold font-mono text-xs uppercase mb-3">
            <Settings className="w-4 h-4" />
            <span>Configure Build Duration</span>
          </div>

          <form onSubmit={handleConfig} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-mutedsilver block mb-1">
                Duration (in minutes)
              </label>
              <input
                type="number"
                min="1"
                max="360"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite font-mono text-xs focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-deepspace border border-metallic-gold/40 text-metallic-bright font-mono text-xs hover:bg-metallic-gold hover:text-obsidian transition-colors"
            >
              Apply Config
            </button>
          </form>
        </div>

        {/* Timestamp Diagnostics */}
        <div className="p-6 rounded-2xl bg-deepspace border border-metallic-gold/20 font-mono text-xs">
          <div className="text-metallic-gold uppercase mb-3 text-[11px]">
            Server Synchronization Telemetry
          </div>
          <div className="space-y-2 text-mutedsilver">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Configured Duration:</span>
              <span className="text-softwhite">{timer?.durationSeconds || 5400} seconds</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Official Start Time:</span>
              <span className="text-softwhite">{timer?.startedAt || 'Not Started'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Paused Timestamp:</span>
              <span className="text-softwhite">{timer?.pausedAt || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Broadcast:</span>
              <span className="text-emerald-400 font-bold">Synchronized</span>
            </div>
          </div>
        </div>

      </div>

      {/* CONFIRM RESET MODAL */}
      {confirmResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl bg-deepspace border border-metallic-gold/50 p-6 shadow-gold-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-metallic-gold/15 text-metallic-bright border border-metallic-gold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-softwhite uppercase">
                Reset Event Timer?
              </h3>
            </div>
            <p className="text-xs text-mutedsilver font-light mb-4 leading-relaxed">
              Are you sure you want to reset the authoritative clock to {durationMinutes} minutes? All connected participant clocks will be reset to the ready state.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10 font-mono text-xs">
              <button
                onClick={() => setConfirmResetModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-mutedsilver hover:text-softwhite"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-obsidian font-bold"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM END EVENT MODAL */}
      {confirmEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl bg-deepspace border border-red-500/50 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-950/40 text-red-400 border border-red-500">
                <StopCircle className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-softwhite uppercase">
                End Build Duration?
              </h3>
            </div>
            <p className="text-xs text-mutedsilver font-light mb-4 leading-relaxed">
              This will set the clock to TIME EXPIRED and update all participant screens with the "BUILD TIME COMPLETED" status.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10 font-mono text-xs">
              <button
                onClick={() => setConfirmEndModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-mutedsilver hover:text-softwhite"
              >
                Cancel
              </button>
              <button
                onClick={handleEnd}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500"
              >
                CONFIRM END
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
