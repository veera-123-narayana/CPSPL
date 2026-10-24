import React, { useEffect, useState } from 'react';
import {
  AlertOctagon, Plus, Unlock, Lock, Sparkles, CheckCircle2,
  AlertCircle, X, Eye, Edit3, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';
import { sounds } from '../../audio/sounds';

export default function AdminConstraints() {
  const [constraints, setConstraints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [openConstraintsModal, setOpenConstraintsModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [previewConstraint, setPreviewConstraint] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Form state for creating constraint
  const [newConstraint, setNewConstraint] = useState({
    title: '',
    scope: 'ALL DOMAINS',
    problemId: '',
    description: ''
  });

  const fetchConstraints = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminConstraints();
      setConstraints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConstraints();

    const unbind = wsClient.on('*', () => {
      fetchConstraints();
    });
    return () => unbind();
  }, []);

  const handleOpenConstraints = async () => {
    try {
      sounds.playClick();
      const res = await api.releaseConstraints();
      setOpenConstraintsModal(false);
      setFeedback({ type: 'success', message: res.message });
      fetchConstraints();
      sounds.playConstraintUnlock();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleCreateConstraint = async (e) => {
    e.preventDefault();
    try {
      sounds.playClick();
      await api.createConstraint(newConstraint);
      setCreateModal(false);
      setNewConstraint({ title: '', scope: 'ALL DOMAINS', problemId: '', description: '' });
      setFeedback({ type: 'success', message: 'Surprise constraint draft saved securely.' });
      fetchConstraints();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleRevoke = async (constraintId) => {
    try {
      sounds.playClick();
      await api.revokeConstraint(constraintId);
      setFeedback({ type: 'info', message: `Constraint ${constraintId} revoked.` });
      fetchConstraints();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const draftCount = constraints.filter(c => c.publicationStatus === 'DRAFT').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER & PROMINENT "OPEN CONSTRAINTS" BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-metallic-gold/15 pb-4">
        <div>
          <div className="flex items-center gap-2 text-metallic-amber font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>CONFIDENTIAL CHALLENGE SYSTEM</span>
          </div>
          <h1 className="font-cinzel text-2xl font-black text-softwhite uppercase">
            Surprise Constraints Control
          </h1>
          <p className="text-xs text-mutedsilver font-light mt-0.5">
            Draft constraints are strictly confidential and completely isolated from public participant terminals until released.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Button */}
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-deepspace border border-white/10 hover:border-metallic-gold text-xs font-mono text-softwhite transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Draft</span>
          </button>

          {/* ======================================================== */}
          {/* PROMINENT GOLD-GLOWING "OPEN CONSTRAINTS" BUTTON (Section 6) */}
          {/* ======================================================== */}
          <button
            onClick={() => setOpenConstraintsModal(true)}
            disabled={draftCount === 0}
            className="relative group px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider uppercase shadow-gold-md hover:shadow-gold-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center gap-2"
          >
            <Unlock className="w-4 h-4 text-obsidian" />
            <span>OPEN CONSTRAINTS</span>
            {draftCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-obsidian text-metallic-bright text-[10px] font-black">
                {draftCount} DRAFT{draftCount > 1 ? 'S' : ''}
              </span>
            )}
            <div className="absolute -inset-0.5 rounded-xl bg-metallic-bright opacity-0 group-hover:opacity-30 blur transition-opacity" />
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERT */}
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

      {/* CONSTRAINTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {constraints.map((c) => {
          const isReleased = c.publicationStatus === 'RELEASED';

          return (
            <div
              key={c.constraintId}
              className={`rounded-2xl p-5 border transition-all ${
                isReleased
                  ? 'bg-deepspace border-metallic-amber/50 shadow-amber-glow'
                  : 'bg-deepspace/70 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-metallic-bright bg-obsidian px-2.5 py-1 rounded border border-metallic-gold/30">
                    {c.constraintId}
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-metallic-gold uppercase">
                    SCOPE: {c.scope} {c.problemId ? `(${c.problemId})` : ''}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isReleased
                    ? 'bg-metallic-amber/20 text-metallic-bright border border-metallic-amber'
                    : 'bg-white/5 text-mutedsilver border border-white/10'
                }`}>
                  {c.publicationStatus}
                </span>
              </div>

              <h3 className="font-cinzel text-base font-bold text-softwhite mt-2">
                {c.title}
              </h3>
              <p className="text-xs text-mutedsilver font-light mt-1 leading-relaxed">
                {c.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-mutedsilver">
                <span>
                  {isReleased ? `Released at ${new Date(c.releasedAt).toLocaleTimeString()}` : 'Confidential Draft'}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewConstraint(c)}
                    className="p-1 rounded text-mutedsilver hover:text-softwhite"
                    title="Private Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {isReleased && (
                    <button
                      onClick={() => handleRevoke(c.constraintId)}
                      className="text-red-400 hover:text-red-300 text-[10px] underline ml-2"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONFIRM "OPEN CONSTRAINTS" MODAL */}
      {openConstraintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border border-metallic-amber/60 p-6 shadow-amber-glow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-metallic-amber/20 border border-metallic-amber text-metallic-bright">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-metallic-amber uppercase font-bold">AUTHORIZATION REQUIRED</span>
                <h3 className="font-cinzel text-lg font-black text-softwhite">
                  Release Surprise Constraints?
                </h3>
              </div>
            </div>

            <p className="text-xs text-softwhite/90 leading-relaxed font-light mb-4">
              Are you sure you want to release the surprise constraints to all participants? This will broadcast immediate visual and audio notifications to all active participant terminals.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 font-mono text-xs">
              <button
                onClick={() => setOpenConstraintsModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-mutedsilver hover:text-softwhite"
              >
                CANCEL
              </button>
              <button
                onClick={handleOpenConstraints}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-obsidian font-bold shadow-gold-sm hover:shadow-gold-md"
              >
                CONFIRM RELEASE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE DRAFT CONSTRAINT MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <form onSubmit={handleCreateConstraint} className="max-w-md w-full rounded-2xl bg-deepspace border border-metallic-gold/40 p-6 shadow-gold-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="font-cinzel text-base font-bold text-softwhite uppercase">
                Create Surprise Constraint Draft
              </h3>
              <button type="button" onClick={() => setCreateModal(false)} className="text-mutedsilver hover:text-softwhite">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-mutedsilver block mb-1">Constraint Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Offline Resilience Protocol"
                  value={newConstraint.title}
                  onChange={(e) => setNewConstraint({ ...newConstraint, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite focus:outline-none focus:border-metallic-bright"
                />
              </div>

              <div>
                <label className="text-mutedsilver block mb-1">Target Scope</label>
                <select
                  value={newConstraint.scope}
                  onChange={(e) => setNewConstraint({ ...newConstraint, scope: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite focus:outline-none"
                >
                  <option value="ALL DOMAINS">ALL DOMAINS (Global Event Scope)</option>
                  <option value="AI / MACHINE LEARNING">AI / MACHINE LEARNING Track</option>
                  <option value="DATA ANALYTICS">DATA ANALYTICS Track</option>
                  <option value="WEB DEVELOPMENT">WEB DEVELOPMENT Track</option>
                </select>
              </div>

              <div>
                <label className="text-mutedsilver block mb-1">Specific Problem ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. PS-01 (leave empty for entire scope)"
                  value={newConstraint.problemId}
                  onChange={(e) => setNewConstraint({ ...newConstraint, problemId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite focus:outline-none"
                />
              </div>

              <div>
                <label className="text-mutedsilver block mb-1">Confidential Description & Criteria</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed mandatory conditions..."
                  value={newConstraint.description}
                  onChange={(e) => setNewConstraint({ ...newConstraint, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite font-sans text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-mutedsilver hover:text-softwhite"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gold-gradient text-obsidian font-bold shadow-gold-sm"
              >
                Save Confidential Draft
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRIVATE PREVIEW MODAL */}
      {previewConstraint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl bg-deepspace border border-metallic-gold/40 p-6 shadow-gold-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="font-mono text-xs text-metallic-gold font-bold">
                PRIVATE PREVIEW [{previewConstraint.constraintId}]
              </span>
              <button onClick={() => setPreviewConstraint(null)} className="text-mutedsilver hover:text-softwhite">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-cinzel text-lg font-bold text-softwhite mb-1">
              {previewConstraint.title}
            </h3>
            <div className="text-[10px] font-mono text-metallic-bright uppercase mb-3">
              Scope: {previewConstraint.scope} {previewConstraint.problemId ? `(${previewConstraint.problemId})` : ''}
            </div>

            <p className="text-xs text-mutedsilver font-light leading-relaxed mb-6">
              {previewConstraint.description}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewConstraint(null)}
                className="px-4 py-1.5 rounded-xl bg-obsidian border border-white/10 text-xs font-mono text-softwhite"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
