import React from 'react';
import { Calendar, Clock, Mail, Instagram, Sparkles, Award, Rocket, Phone } from 'lucide-react';

export default function ModifiedPosterCard({ interactive = false }) {
  return (
    <div className={`relative w-[340px] sm:w-[400px] md:w-[440px] max-w-[92vw] aspect-square rounded-2xl overflow-hidden border border-metallic-gold/50 shadow-[0_0_50px_rgba(212,167,44,0.3)] transition-all duration-500 bg-obsidian flex flex-col justify-between ${interactive ? 'hover:scale-[1.02] hover:border-metallic-bright hover:shadow-[0_0_70px_rgba(212,167,44,0.45)]' : ''}`}>
      {/* Background Official Poster Graphic Asset */}
      <img
        src="/official_innovrush_poster.jpg"
        alt="INNOVRUSH 2K26 Official Poster"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Subtle Specular Sheen Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none animate-sweep" />

      {/* Floating Interactive Hover Badges */}
      <div className="relative p-3 flex justify-between items-center z-10 pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-black/80 border border-metallic-gold/40 text-[9px] font-mono text-metallic-bright font-bold uppercase backdrop-blur-md">
          N.B.K.R.I.S.T (AUTONOMOUS)
        </span>
        <span className="px-2.5 py-1 rounded-full bg-black/80 border border-metallic-gold/40 text-[9px] font-mono text-metallic-gold font-bold uppercase backdrop-blur-md">
          29 OCT 2026 · 9:00 AM
        </span>
      </div>

      {/* Bottom Quick-Action Panel */}
      <div className="relative p-3 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent z-10 border-t border-metallic-gold/25">
        <div className="text-center text-metallic-bright font-mono text-[9px] sm:text-[10px] tracking-wider font-bold mb-1 uppercase">
          EVENT CO-ORDINATORS
        </div>
        <div className="grid grid-cols-3 gap-1 text-[8px] sm:text-[9px] text-center font-mono">
          <div className="bg-black/60 p-1 rounded border border-white/10">
            <div className="text-gray-300 truncate">P. Veera N.</div>
            <div className="text-metallic-gold font-bold">9848635931</div>
          </div>
          <div className="bg-black/60 p-1 rounded border border-white/10">
            <div className="text-gray-300 truncate">N. Snehalatha</div>
            <div className="text-metallic-gold font-bold">7674010261</div>
          </div>
          <div className="bg-black/60 p-1 rounded border border-white/10">
            <div className="text-gray-300 truncate">M. Lekhasree</div>
            <div className="text-metallic-gold font-bold">9347178378</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-metallic-gold mt-2 pt-1 border-t border-white/10">
          <div className="text-gray-400">
            FEE: <span className="text-metallic-bright font-bold">IEEE: ₹150</span> | <span className="text-white font-bold">₹200</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="mailto:nexusverse@nbkrist.org" className="hover:text-white transition-colors">nexusverse@nbkrist.org</a>
            <span>·</span>
            <a href="https://instagram.com/nexusverse_ieee" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">@nexusverse_ieee</a>
          </div>
        </div>
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-metallic-gold pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-metallic-gold pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-metallic-gold pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-metallic-gold pointer-events-none" />
    </div>
  );
}
