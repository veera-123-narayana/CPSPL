import React from 'react';
import { Radio, AlertCircle, CheckCircle2, Flame, Lock, Unlock, Clock } from 'lucide-react';

export default function LiveStatusBanner({ status, rules, timerState }) {
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case 'CHALLENGE IN PROGRESS':
        return {
          label: 'CHALLENGE IN PROGRESS',
          description: 'Official 90-minute prototype development period is underway. Build your solution.',
          badgeColor: 'border-metallic-gold/50 bg-metallic-gold/10 text-metallic-bright',
          dotColor: 'bg-metallic-bright animate-ping',
          icon: Flame
        };
      case 'CONSTRAINTS RELEASED':
        return {
          label: 'SURPRISE CONSTRAINTS RELEASED',
          description: 'New mandatory challenge conditions are live. Review the updated criteria in your problem statement.',
          badgeColor: 'border-metallic-amber/60 bg-metallic-amber/15 text-metallic-bright',
          dotColor: 'bg-metallic-amber animate-ping',
          icon: Unlock
        };
      case 'PROBLEM STATEMENTS LIVE':
        return {
          label: 'PROBLEM STATEMENTS PUBLISHED',
          description: 'Official challenge tracks are now active. Select your problem statement and assemble your architecture.',
          badgeColor: 'border-metallic-gold/40 bg-deepspace text-metallic-gold',
          dotColor: 'bg-metallic-gold',
          icon: Radio
        };
      case 'TIME EXPIRED':
      case 'EVENT COMPLETED':
        return {
          label: 'BUILD TIME COMPLETED',
          description: 'Prototype building duration has ended. Proceed to evaluation and presentations.',
          badgeColor: 'border-red-500/40 bg-red-950/20 text-red-300',
          dotColor: 'bg-red-400',
          icon: Clock
        };
      case 'EVENT NOT STARTED':
      case 'WAITING FOR PROBLEM RELEASE':
      default:
        return {
          label: 'WAITING FOR PROBLEM RELEASE',
          description: 'The arena is on standby. Problem statements will unlock upon administrative broadcast.',
          badgeColor: 'border-mutedsilver/30 bg-deepspace text-mutedsilver',
          dotColor: 'bg-mutedsilver/60',
          icon: Lock
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 z-10 relative">
      <div className={`rounded-xl p-4 sm:p-5 border ${config.badgeColor} backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-500 shadow-gold-sm`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-deepspace border border-metallic-gold/30 text-metallic-bright">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
              <span className="font-cinzel text-sm sm:text-base font-bold tracking-wider uppercase text-softwhite">
                {config.label}
              </span>
            </div>
            <p className="text-xs text-mutedsilver font-light mt-0.5 max-w-xl">
              {config.description}
            </p>
          </div>
        </div>

        {/* Quick Rules Metadata Indicator */}
        <div className="flex items-center gap-4 text-xs font-mono text-mutedsilver border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <span className="text-[10px] uppercase text-mutedsilver/70 block">BUILD DURATION</span>
            <span className="font-bold text-metallic-bright">90 MINS</span>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div>
            <span className="text-[10px] uppercase text-mutedsilver/70 block">EVALUATION</span>
            <span className="font-bold text-softwhite">60% Pres · 40% AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
