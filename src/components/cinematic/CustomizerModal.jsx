import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, RotateCcw, Play, Image, Sparkles, Check, Sliders } from 'lucide-react';

export default function CustomizerModal({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onReplay
}) {
  const [localConfig, setLocalConfig] = useState(config);
  const [previewUrl, setPreviewUrl] = useState(config.posterImage);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setLocalConfig((prev) => ({
        ...prev,
        posterImage: objectUrl,
        posterFileName: file.name
      }));
    }
  };

  const handleApply = () => {
    onUpdateConfig(localConfig);
    onClose();
    if (onReplay) onReplay();
  };

  const handleReset = () => {
    const defaults = {
      posterImage: '/innovrush_poster_bg.jpg',
      posterFileName: 'innovrush_poster_bg.jpg',
      eventName: 'INNOVRUSH 2K26',
      brandLogo: 'N.B.K.R.I.S.T · NEXUSVERSE 2K26',
      introDuration: 5500,
      enableSkip: true,
      playOncePerSession: false,
      coordinators: [
        { name: 'P. Veera Narayana', phone: '9848635931' },
        { name: 'N. Snehalatha', phone: '7674010261' },
        { name: 'M. Lekhasree', phone: '9347178378' }
      ]
    };
    setLocalConfig(defaults);
    setPreviewUrl(defaults.posterImage);
    onUpdateConfig(defaults);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-deepspace border border-metallic-gold/50 rounded-2xl shadow-gold-lg p-6 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-metallic-gold/25">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-metallic-gold/15 text-metallic-bright border border-metallic-gold/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-lg font-bold text-gold-gradient">
                  CINEMATIC INTRO CUSTOMIZER
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Universal Reference-Driven 3D Animation Settings
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="mt-5 space-y-4 text-sm font-sans">
            
            {/* 1. POSTER IMAGE UPLOAD */}
            <div>
              <label className="block text-xs font-mono text-metallic-gold uppercase tracking-wider mb-1.5">
                POSTER_IMAGE (Main Animated 3D Subject)
              </label>
              <div className="flex items-center gap-4 p-3 bg-obsidian rounded-xl border border-white/10">
                <div className="w-16 h-20 bg-black/70 rounded-lg overflow-hidden border border-metallic-gold/30 flex-shrink-0 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Poster Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-deepspace border border-metallic-gold/40 hover:border-metallic-gold rounded-lg font-mono text-xs text-metallic-bright cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Poster (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1 font-mono">
                    Replaces the car with this asset in real 3D space with matching lighting & camera tracks.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. EVENT NAME & BRAND LOGO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-metallic-gold uppercase tracking-wider mb-1">
                  EVENT_NAME
                </label>
                <input
                  type="text"
                  value={localConfig.eventName}
                  onChange={(e) => setLocalConfig({ ...localConfig, eventName: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-white/15 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-metallic-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-metallic-gold uppercase tracking-wider mb-1">
                  BRAND_LOGO / SUBTITLE
                </label>
                <input
                  type="text"
                  value={localConfig.brandLogo}
                  onChange={(e) => setLocalConfig({ ...localConfig, brandLogo: e.target.value })}
                  className="w-full px-3 py-2 bg-obsidian border border-white/15 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-metallic-gold"
                />
              </div>
            </div>

            {/* 3. DURATION SLIDER */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-mono text-metallic-gold uppercase tracking-wider">
                  INTRO_DURATION (Current: {(localConfig.introDuration / 1000).toFixed(1)}s)
                </label>
              </div>
              <input
                type="range"
                min="3000"
                max="10000"
                step="500"
                value={localConfig.introDuration}
                onChange={(e) => setLocalConfig({ ...localConfig, introDuration: Number(e.target.value) })}
                className="w-full accent-metallic-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-0.5">
                <span>3.0s (Fast)</span>
                <span>5.5s (Cinematic Default)</span>
                <span>10.0s (Extended)</span>
              </div>
            </div>

            {/* 4. TOGGLES: ENABLE_SKIP & PLAY_ONCE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2.5 bg-obsidian rounded-xl border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.enableSkip}
                  onChange={(e) => setLocalConfig({ ...localConfig, enableSkip: e.target.checked })}
                  className="accent-metallic-gold"
                />
                <span className="text-xs font-mono text-gray-200">ENABLE_SKIP (Show Skip button)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-obsidian rounded-xl border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.playOncePerSession}
                  onChange={(e) => setLocalConfig({ ...localConfig, playOncePerSession: e.target.checked })}
                  className="accent-metallic-gold"
                />
                <span className="text-xs font-mono text-gray-200">PLAY_ONCE_PER_SESSION</span>
              </label>
            </div>

            {/* 5. EVENT COORDINATORS */}
            <div className="pt-2 border-t border-metallic-gold/20">
              <label className="block text-xs font-mono text-metallic-bright uppercase tracking-wider mb-2">
                OFFICIAL EVENT COORDINATORS (Embedded on 3D Poster Banner)
              </label>
              <div className="space-y-2 text-xs font-mono bg-obsidian p-3 rounded-xl border border-white/10">
                <div className="flex items-center justify-between text-gray-300">
                  <span>1. P. Veera Narayana</span>
                  <span className="text-metallic-gold">9848635931</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>2. N. Snehalatha</span>
                  <span className="text-metallic-gold">7674010261</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>3. M. Lekhasree</span>
                  <span className="text-metallic-gold">9347178378</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-metallic-gold/25 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/20 bg-black/40 text-gray-300 font-mono text-xs hover:text-white hover:border-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>APPLY & REPLAY 3D INTRO</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
