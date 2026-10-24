import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, AlertTriangle, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { sounds } from '../audio/sounds';

export default function ConstraintUnlockModal({ payload, onClose, onViewDetails }) {
  useEffect(() => {
    sounds.playConstraintUnlock();
    // Gold and amber confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD84D', '#D4A72C', '#FF9F1C', '#FFFFFF']
      });
    } catch (e) {}
  }, []);

  if (!payload) return null;

  const releasedList = payload.releasedConstraints || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg w-full rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border border-metallic-amber/60 shadow-amber-glow p-6 sm:p-8 overflow-hidden">
        {/* Ambient gold glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-metallic-amber/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/10 hover:border-metallic-gold/40 text-mutedsilver hover:text-softwhite transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-metallic-amber/20 border border-metallic-amber text-metallic-bright animate-bounce">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-metallic-amber animate-ping" />
              <span className="font-mono text-xs tracking-widest text-metallic-bright uppercase">OFFICIAL BROADCAST</span>
            </div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-black text-gold-gradient tracking-wide uppercase">
              NEW CONDITIONS UNLOCKED
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-softwhite/90 font-light mb-6 leading-relaxed">
          The event administrators have officially introduced dynamic surprise constraints. All active participants must review and adhere to these parameters.
        </p>

        {/* CONSTRAINTS LIST */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
          {releasedList.map((c) => (
            <div key={c.constraintId} className="p-3.5 rounded-xl bg-obsidian/80 border border-metallic-gold/30">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-metallic-bright">
                  {c.constraintId}: {c.title}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/30">
                  {c.scope}
                </span>
              </div>
              <p className="text-xs text-mutedsilver leading-relaxed">
                {c.description}
              </p>
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-mutedsilver hover:text-softwhite transition-colors"
          >
            Acknowledge
          </button>
          <button
            onClick={() => {
              onClose();
              if (onViewDetails) onViewDetails();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider hover:scale-[1.02] shadow-gold-sm transition-all"
          >
            <span>Review Challenges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
