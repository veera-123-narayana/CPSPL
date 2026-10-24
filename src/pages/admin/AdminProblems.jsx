import React, { useEffect, useState } from 'react';
import {
  Layers, Search, Eye, Rocket, CheckCircle2, AlertCircle, X,
  RotateCcw, Sparkles, Filter, Edit3, ArrowUpRight
} from 'lucide-react';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';
import { sounds } from '../../audio/sounds';

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');

  // Modals
  const [previewProblem, setPreviewProblem] = useState(null);
  const [launchConfirmProblem, setLaunchConfirmProblem] = useState(null);
  const [bulkLaunchModal, setBulkLaunchModal] = useState(false);
  const [editProblem, setEditProblem] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminProblems();
      setProblems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();

    const unbind = wsClient.on('*', () => {
      fetchProblems();
    });
    return () => unbind();
  }, []);

  const handleLaunch = async (problemId) => {
    try {
      sounds.playClick();
      await api.launchProblem(problemId);
      setLaunchConfirmProblem(null);
      setFeedback({ type: 'success', message: `Problem statement ${problemId} launched live!` });
      fetchProblems();
      sounds.playLaserSweep();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleUnpublish = async (problemId) => {
    try {
      sounds.playClick();
      await api.unpublishProblem(problemId);
      setFeedback({ type: 'info', message: `Problem statement ${problemId} reverted to draft.` });
      fetchProblems();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleBulkLaunch = async () => {
    try {
      sounds.playClick();
      const res = await api.bulkLaunchProblems([]);
      setBulkLaunchModal(false);
      setFeedback({ type: 'success', message: res.message });
      fetchProblems();
      sounds.playLaserSweep();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editProblem) return;
    try {
      sounds.playClick();
      await api.updateProblem(editProblem.problemId, editProblem);
      setEditProblem(null);
      setFeedback({ type: 'success', message: `Problem ${editProblem.problemId} updated successfully.` });
      fetchProblems();
    } catch (e) {
      setFeedback({ type: 'error', message: e.message });
    }
  };

  const filtered = problems.filter((p) => {
    const matchesDomain = domainFilter === 'ALL' || p.domain === domainFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problemId.toLowerCase().includes(search.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-metallic-gold/15 pb-4">
        <div>
          <h1 className="font-cinzel text-2xl font-black text-softwhite uppercase">
            Problem Statement Management
          </h1>
          <p className="text-xs text-mutedsilver font-light mt-0.5">
            12 authoritative event records. Launch statements individually or in bulk.
          </p>
        </div>

        {/* BULK LAUNCH BUTTON (SEPARATED ACCORDING TO SPECIFICATION) */}
        <button
          onClick={() => setBulkLaunchModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-deepspace border border-metallic-bright/40 text-metallic-bright font-mono text-xs font-bold hover:bg-metallic-gold hover:text-obsidian hover:border-metallic-gold transition-all"
        >
          <Rocket className="w-4 h-4" />
          <span>LAUNCH ALL PROBLEMS</span>
        </button>
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

      {/* FILTERS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Domain Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'AI / MACHINE LEARNING', 'DATA ANALYTICS', 'WEB DEVELOPMENT'].map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all ${
                domainFilter === d
                  ? 'bg-metallic-gold text-obsidian font-bold shadow-gold-sm'
                  : 'bg-deepspace text-mutedsilver hover:text-softwhite border border-white/5'
              }`}
            >
              {d === 'ALL' ? 'ALL DOMAINS' : d}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedsilver" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-deepspace border border-metallic-gold/25 focus:border-metallic-gold text-xs font-mono text-softwhite focus:outline-none"
          />
        </div>
      </div>

      {/* PROBLEMS TABLE */}
      <div className="rounded-2xl bg-deepspace border border-metallic-gold/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian/80 border-b border-metallic-gold/15 text-metallic-gold uppercase">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Problem Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Published At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((prob) => {
                const isPublished = prob.publicationStatus === 'PUBLISHED';

                return (
                  <tr key={prob.problemId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-metallic-bright">
                      {prob.problemId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-softwhite max-w-xs truncate">
                      {prob.title}
                    </td>
                    <td className="py-3.5 px-4 text-mutedsilver">
                      {prob.domain}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPublished
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/5 text-mutedsilver border border-white/10'
                      }`}>
                        {prob.publicationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-mutedsilver">
                      {prob.publishedAt ? new Date(prob.publishedAt).toLocaleTimeString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Preview Button */}
                      <button
                        onClick={() => setPreviewProblem(prob)}
                        title="Private Preview"
                        className="p-1.5 rounded-lg border border-white/10 text-mutedsilver hover:text-softwhite hover:border-metallic-gold/40 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => setEditProblem({ ...prob })}
                        title="Edit Problem"
                        className="p-1.5 rounded-lg border border-white/10 text-mutedsilver hover:text-softwhite hover:border-metallic-gold/40 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Launch / Unpublish Button */}
                      {isPublished ? (
                        <button
                          onClick={() => handleUnpublish(prob.problemId)}
                          className="px-2.5 py-1 rounded-lg bg-obsidian border border-white/15 text-mutedsilver hover:text-softwhite hover:border-red-400 transition-colors text-[10px]"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => setLaunchConfirmProblem(prob)}
                          className="px-3 py-1 rounded-lg bg-gold-gradient text-obsidian font-bold hover:shadow-gold-sm transition-all text-[10px]"
                        >
                          LAUNCH
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM SINGLE LAUNCH MODAL */}
      {launchConfirmProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-deepspace border border-metallic-gold/50 p-6 shadow-gold-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-metallic-gold/15 text-metallic-bright border border-metallic-gold">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-metallic-gold uppercase">CONFIRM LAUNCH</span>
                <h3 className="font-cinzel text-lg font-bold text-softwhite">
                  Publish {launchConfirmProblem.problemId}?
                </h3>
              </div>
            </div>

            <p className="text-xs text-mutedsilver font-light mb-4 leading-relaxed">
              This action will immediately make <strong className="text-softwhite">{launchConfirmProblem.title}</strong> accessible to all connected participants on the public launch board.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setLaunchConfirmProblem(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-mutedsilver hover:text-softwhite"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLaunch(launchConfirmProblem.problemId)}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold hover:shadow-gold-sm"
              >
                CONFIRM LAUNCH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK LAUNCH MODAL */}
      {bulkLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-2xl bg-deepspace border border-metallic-bright/50 p-6 shadow-gold-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-metallic-bright/20 text-metallic-bright border border-metallic-bright">
                <Rocket className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-metallic-bright uppercase">ALL TRACKS LAUNCH</span>
                <h3 className="font-cinzel text-lg font-bold text-softwhite">
                  Launch All Problem Statements?
                </h3>
              </div>
            </div>

            <p className="text-xs text-mutedsilver font-light mb-4 leading-relaxed">
              This will publish all 12 problem statements simultaneously across AI/ML, Data Analytics, and Web Development tracks for all participants.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setBulkLaunchModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-mutedsilver hover:text-softwhite"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkLaunch}
                className="px-5 py-2 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold hover:shadow-gold-md"
              >
                CONFIRM BULK LAUNCH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVATE PREVIEW MODAL */}
      {previewProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <div className="max-w-2xl w-full rounded-2xl bg-deepspace border border-metallic-gold/40 p-6 shadow-gold-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-metallic-bright bg-obsidian px-2.5 py-1 rounded border border-metallic-gold/30">
                  {previewProblem.problemId}
                </span>
                <span className="font-mono text-xs text-metallic-gold uppercase">
                  {previewProblem.domain}
                </span>
              </div>
              <button onClick={() => setPreviewProblem(null)} className="text-mutedsilver hover:text-softwhite">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-cinzel text-xl font-bold text-softwhite mb-2">
              {previewProblem.title}
            </h3>
            <p className="text-xs text-mutedsilver font-light mb-4 leading-relaxed">
              {previewProblem.summary}
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                <span className="font-mono text-metallic-gold text-[10px] uppercase block mb-1">CHALLENGE OBJECTIVE</span>
                <p className="text-softwhite/90 leading-relaxed font-light">{previewProblem.challenge}</p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                <span className="font-mono text-metallic-gold text-[10px] uppercase block mb-1">EXPECTED OUTPUT</span>
                <p className="text-softwhite/90 leading-relaxed font-light">{previewProblem.expectedOutput}</p>
              </div>

              <div className="p-3 rounded-xl bg-obsidian border border-white/5">
                <span className="font-mono text-metallic-gold text-[10px] uppercase block mb-1">FUNCTIONAL SCOPE</span>
                <ul className="list-disc pl-4 space-y-1 text-softwhite/90">
                  {previewProblem.functionalScope?.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setPreviewProblem(null)}
                className="px-4 py-2 rounded-xl bg-obsidian border border-white/10 font-mono text-xs text-softwhite hover:border-metallic-gold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md">
          <form onSubmit={handleSaveEdit} className="max-w-2xl w-full rounded-2xl bg-deepspace border border-metallic-gold/40 p-6 shadow-gold-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="font-cinzel text-lg font-bold text-softwhite uppercase">
                Edit Problem Statement [{editProblem.problemId}]
              </h3>
              <button type="button" onClick={() => setEditProblem(null)} className="text-mutedsilver hover:text-softwhite">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-mutedsilver block mb-1">Title</label>
                <input
                  type="text"
                  value={editProblem.title}
                  onChange={(e) => setEditProblem({ ...editProblem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite"
                />
              </div>

              <div>
                <label className="text-mutedsilver block mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={editProblem.summary}
                  onChange={(e) => setEditProblem({ ...editProblem, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-mutedsilver block mb-1">Challenge Objective</label>
                <textarea
                  rows={3}
                  value={editProblem.challenge}
                  onChange={(e) => setEditProblem({ ...editProblem, challenge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite font-sans text-xs"
                />
              </div>

              <div>
                <label className="text-mutedsilver block mb-1">Expected Output</label>
                <textarea
                  rows={3}
                  value={editProblem.expectedOutput}
                  onChange={(e) => setEditProblem({ ...editProblem, expectedOutput: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-obsidian border border-metallic-gold/30 text-softwhite font-sans text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditProblem(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-mono text-mutedsilver hover:text-softwhite"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold hover:shadow-gold-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
