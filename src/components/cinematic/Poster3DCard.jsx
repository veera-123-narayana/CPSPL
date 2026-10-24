import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Sparkles, ExternalLink, Phone, Mail, Instagram, Check, QrCode, Users, X } from 'lucide-react';
import { sounds } from '../../audio/sounds';

/**
 * Poster3DCard — Nano-Cell Holographic 3D Poster
 * Inspired by Google Antigravity & React Bits design:
 * - Pure, pristine display of the official INNOVRUSH 2K26 poster with ZERO opaque text clutter
 * - Nano-cell animated dot matrix overlay with subtle luminescence
 * - Real-time 3D physical perspective tilt responding to mouse position
 * - Rocket thruster plasma ignition & metallic sheen beam sweep
 * - Non-occluding holographic reticles over QR codes that open interactive modals
 */
export default function Poster3DCard({
  mousePos = { x: 0, y: 0 },
  onEnter,
  isWarping = false
}) {
  const [activeModal, setActiveModal] = useState(null); // 'register' | 'coordinators' | null
  const [copiedPhone, setCopiedPhone] = useState(null);

  const handleCopy = (phone, name) => {
    sounds.playClick();
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(name);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // 3D Tilt angles calculated from mouse position
  const tiltX = -mousePos.y * 14; // pitch
  const tiltY = mousePos.x * 16;  // yaw

  return (
    <div className="relative flex flex-col items-center">
      {/* 3D TILT STAGE CONTAINER */}
      <div
        className="relative flex items-center justify-center preserve-3d transition-transform duration-100 ease-out"
        style={{
          transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${isWarping ? 1.35 : 1}, ${isWarping ? 1.35 : 1}, 1)`,
          transition: isWarping ? 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease' : 'transform 0.12s ease-out'
        }}
      >
        {/* 3D Ambient Backlight Halo */}
        <div
          className="absolute -inset-10 rounded-3xl bg-gradient-to-r from-metallic-gold/30 via-metallic-bright/40 to-metallic-amber/30 blur-3xl opacity-70 pointer-events-none -z-10"
          style={{ transform: 'translateZ(-50px)' }}
        />

        {/* 3D POSTER FRAME WRAPPER */}
        <div className="relative w-[340px] sm:w-[460px] md:w-[540px] lg:w-[580px] aspect-square rounded-2xl overflow-hidden border-2 border-metallic-gold/80 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(212,167,44,0.35)] bg-obsidian preserve-3d group">
          
          {/* ============================================================ */}
          {/* LAYER 0: OFFICIAL POSTER BASE IMAGE (Z = 0px)                */}
          {/* 100% visible, fully readable, no overlapping duplicate text  */}
          {/* ============================================================ */}
          <img
            src="/official_innovrush_poster.jpg"
            alt="Official INNOVRUSH 2K26 Poster"
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
            style={{ transform: 'translateZ(0px)' }}
          />

          {/* ============================================================ */}
          {/* LAYER 1: NANO-CELL DOT MATRIX HOLOGRAPHIC OVERLAY (Z = 12px)  */}
          {/* Subtle high-tech antigravity dot grid across the poster     */}
          {/* ============================================================ */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFD84D 1.2px, transparent 1.2px)',
              backgroundSize: '16px 16px',
              transform: 'translateZ(12px)'
            }}
          />

          {/* Holographic animated scanline beam */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden opacity-40"
            style={{ transform: 'translateZ(18px)' }}
          >
            <div className="w-full h-24 bg-gradient-to-b from-transparent via-metallic-bright/25 to-transparent animate-scan" />
          </div>

          {/* ============================================================ */}
          {/* LAYER 2: METALLIC SHEEN SWEEP OVER INNOVRUSH TITLE (Z = 28px)*/}
          {/* ============================================================ */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ transform: 'translateZ(28px)' }}
          >
            <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25 animate-sweep" />
          </div>

          {/* ============================================================ */}
          {/* LAYER 3: ROCKET THRUSTER PLASMA IGNITION (Z = 45px)          */}
          {/* Positioned right behind the rocket's tail (~38% Y, 50% X)   */}
          {/* ============================================================ */}
          <div
            className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center"
            style={{ transform: 'translateZ(45px)' }}
          >
            {/* Pulsating golden thruster plume */}
            <div className="w-14 h-24 bg-gradient-to-t from-transparent via-metallic-amber/60 to-metallic-bright rounded-full blur-md animate-pulse opacity-90" />
            {/* Core high-heat white point */}
            <div className="w-3.5 h-7 -mt-14 bg-white rounded-full blur-[2px] animate-ping opacity-80" />
          </div>

          {/* ============================================================ */}
          {/* LAYER 4: TOP INSTITUTIONAL LOGOS AMBIENT GLOW (Z = 30px)     */}
          {/* ============================================================ */}
          <div
            className="absolute top-[3%] left-[4%] w-[16%] aspect-square rounded-full bg-metallic-gold/20 blur-md pointer-events-none animate-pulse"
            style={{ transform: 'translateZ(30px)' }}
          />
          <div
            className="absolute top-[3%] right-[4%] w-[16%] aspect-square rounded-full bg-blue-500/20 blur-md pointer-events-none animate-pulse"
            style={{ transform: 'translateZ(30px)' }}
          />

          {/* ============================================================ */}
          {/* LAYER 5: LEFT QR HOLOGRAPHIC RETICLE (FOR REGISTRATION)      */}
          {/* Transparent, non-occluding interactive hotspot (Z = 60px)    */}
          {/* ============================================================ */}
          <div
            className="absolute left-[13%] bottom-[27%] w-[23%] aspect-square cursor-pointer group/qr"
            style={{ transform: 'translateZ(60px)' }}
            onClick={() => {
              sounds.playClick();
              setActiveModal('register');
            }}
            title="Click to expand Registration QR & Fee Structure"
          >
            {/* Sci-Fi Target Reticle Corner Brackets */}
            <div className="absolute inset-0 border border-metallic-gold/30 rounded-lg group-hover/qr:border-metallic-bright group-hover/qr:shadow-[0_0_15px_#ffd84d] transition-all duration-300">
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-metallic-bright" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-metallic-bright" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-metallic-bright" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-metallic-bright" />
            </div>

            {/* Pulsating Center Nano-Pulse */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px] rounded-lg">
              <div className="flex flex-col items-center gap-1 text-center">
                <QrCode className="w-5 h-5 text-metallic-bright animate-bounce" />
                <span className="font-mono text-[8px] sm:text-[9px] text-white font-bold uppercase tracking-wider bg-black/80 px-1 rounded border border-metallic-gold/40">
                  TAP TO ZOOM
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* LAYER 6: RIGHT QR HOLOGRAPHIC RETICLE (FOR DETAILS & COORD)  */}
          {/* Transparent, non-occluding interactive hotspot (Z = 60px)    */}
          {/* ============================================================ */}
          <div
            className="absolute right-[13%] bottom-[27%] w-[23%] aspect-square cursor-pointer group/coord"
            style={{ transform: 'translateZ(60px)' }}
            onClick={() => {
              sounds.playClick();
              setActiveModal('coordinators');
            }}
            title="Click to view Coordinators & Event Contacts"
          >
            {/* Sci-Fi Target Reticle Corner Brackets */}
            <div className="absolute inset-0 border border-metallic-gold/30 rounded-lg group-hover/coord:border-metallic-bright group-hover/coord:shadow-[0_0_15px_#ffd84d] transition-all duration-300">
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-metallic-bright" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-metallic-bright" />
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-metallic-bright" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-metallic-bright" />
            </div>

            {/* Pulsating Center Nano-Pulse */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/coord:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px] rounded-lg">
              <div className="flex flex-col items-center gap-1 text-center">
                <Users className="w-5 h-5 text-metallic-bright animate-bounce" />
                <span className="font-mono text-[8px] sm:text-[9px] text-white font-bold uppercase tracking-wider bg-black/80 px-1 rounded border border-metallic-gold/40">
                  COORDINATORS
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* LAYER 7: BOTTOM SOCIAL TOUCH REGIONS                         */}
          {/* Invisible interactive click areas mapping to poster badges   */}
          {/* ============================================================ */}
          <a
            href="mailto:nexusverse@nbkrist.org"
            className="absolute left-[16%] bottom-[4.5%] w-[32%] h-[6%] rounded cursor-pointer hover:bg-metallic-gold/15 transition-colors"
            style={{ transform: 'translateZ(40px)' }}
            title="Email: nexusverse@nbkrist.org"
          />
          <a
            href="https://instagram.com/nexusverse_ieee"
            target="_blank"
            rel="noreferrer"
            className="absolute right-[16%] bottom-[4.5%] w-[32%] h-[6%] rounded cursor-pointer hover:bg-metallic-gold/15 transition-colors"
            style={{ transform: 'translateZ(40px)' }}
            title="Instagram: @nexusverse_ieee"
          />

          {/* Outer Corner Futuristic Accents */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-metallic-bright pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-metallic-bright pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-metallic-bright pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-metallic-bright pointer-events-none" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* FLOATING ANTIGRAVITY LAUNCH CTA (CLEANLY POSITIONED BELOW)   */}
      {/* Leaves the poster 100% unobstructed with stunning presence   */}
      {/* ============================================================ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-6 flex flex-col items-center gap-2 z-40 pointer-events-auto"
      >
        <button
          onClick={() => {
            sounds.playClick();
            sounds.playLaserSweep();
            onEnter();
          }}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-cinzel text-xs sm:text-sm font-black tracking-[0.25em] uppercase text-obsidian bg-gold-gradient shadow-[0_0_35px_rgba(255,216,77,0.45)] hover:shadow-[0_0_55px_rgba(255,216,77,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-metallic-bright"
        >
          <Sparkles className="w-4 h-4 text-obsidian animate-spin" />
          <span>ENTER THE ARENA</span>
          <Rocket className="w-4 h-4 text-obsidian transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          <div className="absolute -inset-1 rounded-full bg-metallic-bright opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
        </button>

        <div className="flex items-center gap-2 font-mono text-[10px] text-metallic-gold/80 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>EVENT DATE: 29TH OCT 2026 · REPORTING 9:00 AM IST</span>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/* REGISTRATION LIGHTBOX MODAL                                  */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeModal === 'register' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-deepspace border-2 border-metallic-gold p-6 rounded-2xl max-w-sm w-full text-center shadow-gold-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-metallic-gold mb-1">
                <Sparkles className="w-4 h-4 text-metallic-bright" />
                <h3 className="font-cinzel text-base font-bold text-gold-gradient">
                  REGISTRATION PORTAL
                </h3>
              </div>
              <p className="font-mono text-xs text-gray-400 mb-4">
                Scan with any UPI / Camera app to register
              </p>

              {/* QR Image Frame */}
              <div className="w-52 h-52 mx-auto bg-white p-3 rounded-xl border border-metallic-gold shadow-md flex items-center justify-center overflow-hidden">
                <img
                  src="/official_innovrush_poster.jpg"
                  alt="Registration QR Code"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '14% 82%', transform: 'scale(2.5)' }}
                />
              </div>

              {/* Fee Structure */}
              <div className="mt-4 p-3 bg-black/70 rounded-xl border border-metallic-gold/30 text-xs font-mono">
                <div className="text-metallic-bright font-bold tracking-wider mb-1">FEE STRUCTURE:</div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/10 text-gray-300">
                  <span>IEEE Member:</span>
                  <span className="text-metallic-gold font-bold text-sm">₹150/-</span>
                </div>
                <div className="flex justify-between items-center py-0.5 text-gray-300">
                  <span>Non-IEEE Member:</span>
                  <span className="text-white font-bold text-sm">₹200/-</span>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-sm"
              >
                Close Window
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* COORDINATORS LIGHTBOX MODAL                                  */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeModal === 'coordinators' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-deepspace border-2 border-metallic-gold p-6 rounded-2xl max-w-sm w-full text-center shadow-gold-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 text-metallic-gold mb-1">
                <Users className="w-4 h-4 text-metallic-bright" />
                <h3 className="font-cinzel text-base font-bold text-gold-gradient">
                  EVENT COORDINATORS
                </h3>
              </div>
              <p className="font-mono text-xs text-gray-400 mb-4">
                Click any phone number to copy to clipboard
              </p>

              {/* QR Image Frame */}
              <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-metallic-gold shadow-md flex items-center justify-center overflow-hidden mb-4">
                <img
                  src="/official_innovrush_poster.jpg"
                  alt="Event Details QR Code"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: '86% 82%', transform: 'scale(2.5)' }}
                />
              </div>

              {/* Coordinators Contact List */}
              <div className="space-y-2 text-xs font-mono text-left">
                {[
                  { name: 'P. Veera Narayana', phone: '9848635931', key: 'Veera' },
                  { name: 'N. Snehalatha', phone: '7674010261', key: 'Sneha' },
                  { name: 'M. Lekhasree', phone: '9347178378', key: 'Lekha' }
                ].map((c) => (
                  <div
                    key={c.key}
                    onClick={() => handleCopy(c.phone, c.key)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-metallic-gold/30 hover:border-metallic-bright hover:bg-metallic-gold/15 cursor-pointer transition-all"
                  >
                    <span className="text-gray-200 font-medium">{c.name}</span>
                    <span className="text-metallic-bright font-bold flex items-center gap-1.5">
                      {copiedPhone === c.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-3.5 h-3.5 text-metallic-gold" />
                          <span>{c.phone}</span>
                        </>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-sm"
              >
                Close Window
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
