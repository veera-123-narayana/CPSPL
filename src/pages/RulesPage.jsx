import React from 'react';
import { Clock, Users, Award, ShieldAlert, CheckCircle2, AlertTriangle, Mail, Instagram, Phone } from 'lucide-react';

export default function RulesPage({ rules, coordinators }) {
  const isTeamSizeConfirmed = rules?.teamSizeConfirmed;
  const approvedSize = rules?.approvedTeamSize;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 z-10 relative">
      
      {/* HEADER */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deepspace border border-metallic-gold/30 text-metallic-bright font-mono text-xs uppercase mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>OFFICIAL EVENT REGULATIONS</span>
        </div>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-gold-gradient uppercase tracking-wide">
          Rules & Evaluation Protocol
        </h1>
        <p className="text-xs sm:text-sm text-mutedsilver font-light mt-2">
          Governing standards for INNOVRUSH 2K26 under N.B.K.R.I.S.T (Autonomous) and NEXUSVERSE.
        </p>
      </div>

      {/* CORE REGULATIONS CARDS */}
      <div className="space-y-6">
        
        {/* 1. BUILD TIME */}
        <div className="rounded-2xl bg-deepspace/80 border border-metallic-gold/25 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-metallic-gold/10 border border-metallic-gold/40 text-metallic-bright">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs text-metallic-gold uppercase tracking-wider">SECTION 01</span>
              <h2 className="font-cinzel text-lg font-bold text-softwhite uppercase">Build Duration</h2>
            </div>
          </div>
          <p className="text-sm text-softwhite/90 leading-relaxed font-light">
            Participating teams are strictly allotted <strong className="text-metallic-bright font-semibold">90 minutes</strong> to design, build, and demonstrate their working software prototype. All development must conclude when the authoritative event timer reaches expiration.
          </p>
        </div>

        {/* 2. TEAM SIZE (TRANSPARENT DISCREPANCY / CONFIRMATION STATE) */}
        <div className="rounded-2xl bg-deepspace/80 border border-metallic-gold/25 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-metallic-gold/10 border border-metallic-gold/40 text-metallic-bright">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs text-metallic-gold uppercase tracking-wider">SECTION 02</span>
              <h2 className="font-cinzel text-lg font-bold text-softwhite uppercase">Team Size Composition</h2>
            </div>
          </div>

          {isTeamSizeConfirmed ? (
            <div className="p-4 rounded-xl bg-obsidian border border-emerald-500/40 mt-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Organizer Confirmed Rule</span>
              </div>
              <p className="text-sm text-softwhite font-medium">
                Official approved composition: <span className="text-metallic-bright font-bold">{approvedSize}</span>
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-obsidian border border-metallic-amber/40 mt-2">
              <div className="flex items-center gap-2 text-metallic-amber font-mono text-xs font-bold uppercase mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Awaiting Organizer Confirmation</span>
              </div>
              <p className="text-xs text-mutedsilver leading-relaxed font-light">
                The event documentation records two differing team size statements (Section A specifies <strong>1–2 members</strong>, while Section B specifies <strong>2–4 members with a minimum of 2</strong>). In accordance with event integrity guidelines, this parameter is flagged in the administrative panel awaiting final official ratification.
              </p>
            </div>
          )}
        </div>

        {/* 3. EVALUATION CRITERIA (60% / 40% SPLIT) */}
        <div className="rounded-2xl bg-deepspace/80 border border-metallic-gold/25 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-metallic-gold/10 border border-metallic-gold/40 text-metallic-bright">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs text-metallic-gold uppercase tracking-wider">SECTION 03</span>
              <h2 className="font-cinzel text-lg font-bold text-softwhite uppercase">Evaluation & Scoring Framework</h2>
            </div>
          </div>

          <p className="text-sm text-softwhite/90 leading-relaxed font-light mb-4">
            The authoritative event documentation prescribes an explicit 60% / 40% evaluation split:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-obsidian border border-metallic-gold/30 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-mutedsilver uppercase block">PRIMARY COMPONENT</span>
                <span className="font-cinzel text-base font-bold text-softwhite">Presentation & Solution Pitch</span>
              </div>
              <span className="font-mono text-2xl font-black text-metallic-gold">60%</span>
            </div>

            <div className="p-4 rounded-xl bg-obsidian border border-metallic-bright/30 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-mutedsilver uppercase block">TECHNICAL COMPONENT</span>
                <span className="font-cinzel text-base font-bold text-softwhite">Prototype Performance (AI Evaluated)</span>
              </div>
              <span className="font-mono text-2xl font-black text-metallic-bright">40%</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-deepspace text-xs text-mutedsilver font-mono border border-white/5">
            Note: The official event document does not specify additional judge sub-rubrics or presentation time limits.
          </div>
        </div>

        {/* 4. SURPRISE CONSTRAINTS POLICY */}
        <div className="rounded-2xl bg-deepspace/80 border border-metallic-gold/25 p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-metallic-gold/10 border border-metallic-gold/40 text-metallic-bright">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-xs text-metallic-gold uppercase tracking-wider">SECTION 04</span>
              <h2 className="font-cinzel text-lg font-bold text-softwhite uppercase">Dynamic Surprise Constraints</h2>
            </div>
          </div>
          <p className="text-sm text-softwhite/90 leading-relaxed font-light">
            Authorized administrators may release surprise constraints during the active build period. Once unlocked, constraints apply immediately and are displayed on each relevant challenge detail page with real-time broadcast notification.
          </p>
        </div>

        {/* 5. CONTACT & COORDINATORS */}
        <div className="rounded-2xl bg-deepspace/80 border border-metallic-gold/25 p-6 backdrop-blur-md">
          <h2 className="font-cinzel text-base font-bold text-metallic-bright uppercase mb-3">
            Event Co-Ordinators:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono mb-4">
            <div className="p-3 rounded-xl bg-obsidian border border-white/5 hover:border-metallic-gold/30 transition-colors">
              <span className="text-[10px] text-mutedsilver uppercase block">Event Co-ordinator</span>
              <span className="text-softwhite font-bold">P. Veera Narayana</span>
              <div className="text-metallic-gold mt-1 font-semibold">+91 98486 35931</div>
            </div>
            <div className="p-3 rounded-xl bg-obsidian border border-white/5 hover:border-metallic-gold/30 transition-colors">
              <span className="text-[10px] text-mutedsilver uppercase block">Event Co-ordinator</span>
              <span className="text-softwhite font-bold">N. Snehalatha</span>
              <div className="text-metallic-gold mt-1 font-semibold">+91 76740 10261</div>
            </div>
            <div className="p-3 rounded-xl bg-obsidian border border-white/5 hover:border-metallic-gold/30 transition-colors">
              <span className="text-[10px] text-mutedsilver uppercase block">Event Co-ordinator</span>
              <span className="text-softwhite font-bold">M. Lekhasree</span>
              <div className="text-metallic-gold mt-1 font-semibold">+91 93471 78378</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-white/10 text-xs font-mono text-metallic-gold">
            <a href="mailto:nexusverse@nbkrist.org" className="flex items-center gap-1.5 hover:text-metallic-bright transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span>nexusverse@nbkrist.org</span>
            </a>
            <span className="flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5" />
              <span>@nexusverse_ieee</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
