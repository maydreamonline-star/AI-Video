import React, { useEffect, useState, useRef } from 'react';
import { ScriptSegment, VideoConfig } from '../types';
import { Play, Pause, RefreshCw, Volume2, Sparkles, Smartphone, QrCode, Gift, BadgeAlert, Layers, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoPlayerProps {
  segments: ScriptSegment[];
  config: VideoConfig;
  highlightedImages: { cashier: string; flyer: string };
  currentTime: number;
  isPlaying: boolean;
  activeSegmentId: string;
  onPlayToggle: () => void;
  onRestart: () => void;
  currentWordIndex: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  segments,
  config,
  highlightedImages,
  isPlaying,
  activeSegmentId,
  onPlayToggle,
  onRestart,
  currentTime,
  currentWordIndex
}) => {
  const activeSegment = segments.find(s => s.id === activeSegmentId) || segments[0];
  const activeIndex = segments.findIndex(s => s.id === activeSegmentId);
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  // Calculate overall timeline progress
  let progressBeforeActive = 0;
  for (let i = 0; i < activeIndex; i++) {
    progressBeforeActive += segments[i].duration;
  }
  const overallProgressPercentage = totalDuration > 0 
    ? ((progressBeforeActive + currentTime) / totalDuration) * 100 
    : 0;

  // Format dynamic live recording camcorder timecode (00:MM:SS:FF)
  const getFormattedTimecode = () => {
    let elapsedSeconds = progressBeforeActive + currentTime;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    const ms = Math.floor((elapsedSeconds % 1) * 100);
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  // Split words for animated lyric captions
  const words = activeSegment ? activeSegment.text.split(' ') : [];

  // Helper to determine if a word is key highlight
  const isKeyHighlight = (word: string) => {
    if (!activeSegment) return false;
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    return activeSegment.highlights.some(h => 
      h.toLowerCase().includes(cleanWord) || cleanWord.includes(h.toLowerCase())
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* 9:16 Vertical Smartphone Viewport */}
      <div 
        id="vertical-viewport-container"
        className="relative w-[340px] h-[600px] sm:w-[360px] sm:h-[640px] rounded-[36px] bg-slate-950 shadow-2xl border-8 border-slate-800 overflow-hidden flex flex-col transition-all duration-300 ring-2 ring-blue-500/20"
        style={{ borderColor: '#1e293b' }}
      >
        {/* Decorative Smartphone Speaker & Sensor Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-5 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-2">
          <div className="w-12 h-1 bg-slate-950 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full"></div>
        </div>

        {/* Video Active Content Container */}
        <div className="relative flex-1 w-full h-full overflow-hidden select-none bg-slate-900">
          
          {/* BACKGROUND LAYER WITH DYNAMIC MOOD COLORS */}
          <div 
            className="absolute inset-0 transition-all duration-1000 ease-in-out"
            style={{ 
              background: activeSegment?.visualMode === 'qr-focus' 
                ? `radial-gradient(circle at 50% 30%, ${config.backgroundColor}cc, #040815)`
                : `radial-gradient(circle at 50% 40%, ${config.backgroundColor}, #020617)`
            }}
          />

          {/* DYNAMIC VISUAL STAGES */}
          <AnimatePresence mode="wait">
            {activeSegment?.visualMode === 'cashier-intro' && (
              <motion.div
                key="cashier-intro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-end"
              >
                {/* Presenter Portrait with dynamic motion (Video Bergerak) */}
                <div className="absolute inset-x-0 top-0 bottom-16 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <div className="w-full h-full">
                      <img 
                        id="presenter-portrait-img"
                        src={highlightedImages.cashier} 
                        alt="Kasir DKR" 
                        className="w-full h-full object-cover object-center"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* Glowing live conversation rings around the SPG indicating vocal speech waves */}
                    {isPlaying && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <span className="absolute w-44 h-44 rounded-full border-2 border-yellow-400/30 animate-ping" />
                        <span className="absolute w-32 h-32 rounded-full border border-blue-400/20 animate-pulse-ring" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* Cashier Badge Overlay */}
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="absolute left-4 top-16 bg-blue-600/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-400/30 shadow-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span>Kasir {config.cashierName || 'Devi'}</span>
                </motion.div>
                
                {/* Visual Cue: Mini Signage */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-36 right-4 max-w-[120px] bg-yellow-500 text-slate-950 p-2 rounded-xl text-[10px] font-bold shadow-lg leading-tight text-center border border-white"
                >
                  Reward Produk Gratis Menanti!
                </motion.div>
              </motion.div>
            )}

            {activeSegment?.visualMode === 'qr-focus' && (
              <motion.div
                key="qr-focus"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
              >
                {/* DKR Logo Header */}
                <div className="mt-8 mb-2 flex items-center gap-1.5">
                  <span className="bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded text-xs">D</span>
                  <span className="bg-yellow-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded text-xs">K</span>
                  <span className="bg-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded text-xs">R</span>
                  <span className="text-white text-xs font-bold font-display ml-1">LOYALTY</span>
                </div>

                <h3 className="text-white text-base font-bold font-display leading-tight mb-4">
                  SCAN DENGAN HP SEKARANG
                </h3>

                {/* QR Code Presentation */}
                <div className="relative p-4 bg-white rounded-3xl shadow-2xl border-4 border-slate-700/50 flex flex-col items-center">
                  <div className="relative w-36 h-36 bg-white flex items-center justify-center rounded-xl p-1 overflow-hidden">
                    {/* Simulated Scanner Laser Beam Line */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-red-500 shadow-md shadow-red-500/80 z-10"
                    />
                    
                    {/* Interactive functional QR Code display */}
                    <div className="bg-slate-100 p-2 rounded-lg flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(config.qrValue || 'https://google.com')}`}
                        alt="DKR Loyalty QR"
                        className="w-32 h-32 object-contain qr-image bg-white"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* QR Core Instruction Badge */}
                  <div className="absolute -bottom-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md tracking-wider">
                    SCAN UNTUK REWARD
                  </div>
                </div>

                <p className="text-slate-300 text-xs mt-6 max-w-[200px] leading-relaxed">
                  Daftar gratis hanya dalam 10 detik langsung dari ponsel Kakak!
                </p>

                {/* Floating Confetti Elements */}
                <div className="absolute top-24 left-6 w-3 h-3 bg-yellow-400 rotate-12 rounded opacity-70"></div>
                <div className="absolute top-36 right-8 w-4 h-4 bg-blue-400 -rotate-12 rounded-full opacity-70"></div>
                <div className="absolute bottom-28 left-8 w-3 h-3 bg-red-400 rotate-45 rounded opacity-70"></div>
              </motion.div>
            )}

            {activeSegment?.visualMode === 'reward-show' && (
              <motion.div
                key="reward-show"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-slate-950/90"
              >
                <div className="text-center mb-3">
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    🎁 TOTAL HADIAH PROMO
                  </span>
                  <h3 className="text-white text-base font-bold font-display mt-1.5 leading-tight">
                    Untung Melimpah dari DKR!
                  </h3>
                </div>

                {/* Grid of floating rewards matching screenshot frames */}
                <div className="w-full max-w-[280px] space-y-2.5">
                  {/* Card 1: 50RB VOUCHER */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className="bg-gradient-to-r from-red-600 to-rose-500 rounded-2xl p-3 border border-red-400/30 flex items-center justify-between shadow-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-inner">
                        Rp
                      </div>
                      <div className="text-left">
                        <p className="text-white font-extrabold font-display text-sm leading-none">VOUCHER 50RB</p>
                        <p className="text-red-100 text-[9px] mt-0.5">Potongan Belanja Langsung</p>
                      </div>
                    </div>
                    <span className="bg-white text-red-650 font-black text-[9px] px-2 py-1 rounded-lg shadow-sm">Klaim</span>
                  </motion.div>

                  {/* Card 2: GRATIS CAMILAN / KOPI */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-3 border border-yellow-400/30 flex items-center justify-between shadow-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-slate-950/30 rounded-xl flex items-center justify-center text-slate-950">
                        <Gift className="w-5 h-5 text-slate-950" />
                      </div>
                      <div className="text-left">
                        <p className="text-slate-950 font-extrabold font-display text-xs leading-none">GRATIS CAMILAN/KOPI</p>
                        <p className="text-amber-955 font-bold text-[9px] mt-0.5 truncate max-w-[130px]" title={config.rewardProduct}>
                          {config.rewardProduct || 'Teh Botol Sosro'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-slate-950 text-yellow-400 font-extrabold text-[9px] px-2 py-1 rounded-lg shadow-sm">Bebas</span>
                  </motion.div>

                  {/* Card 3: EXTRA DISCOUNT POINTS */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-3 border border-cyan-400/30 flex items-center justify-between shadow-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-extrabold font-display text-xs leading-none">DOUBLE POIN MEMBER</p>
                        <p className="text-cyan-100 text-[9px] mt-0.5">Tukar Hadiah Eksklusif</p>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-lg">Aktif</span>
                  </motion.div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5 animate-pulse" />
                  <span>Cukup Scan QR Code Di Samping</span>
                </div>
              </motion.div>
            )}

            {activeSegment?.visualMode === 'flyer-only' && (
              <motion.div
                key="flyer-only"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col justify-between"
              >
                {/* Full screen DKR Loyalty flyer background */}
                <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden">
                  <img 
                    id="loyalty-flyer-bg-img"
                    src={highlightedImages.flyer} 
                    alt="DKR Loyalty Flyer" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent"></div>
                </div>

                {/* Decorative glowing scan ring */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-12 flex flex-col items-center">
                  <span className="w-24 h-24 rounded-full border-4 border-dashed border-yellow-400 animate-spin absolute -top-2" style={{ animationDuration: '10s' }} />
                  <span className="w-20 h-20 rounded-full border border-blue-400 animate-pulse absolute top-0" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Camera (Camcorder HUD) Overlay */}
          {config.cameraOverlay && (
            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 pt-12 pb-16">
              {/* Camera Frame Corners [ ] */}
              <div className="absolute top-12 left-4 w-4 h-4 border-t border-l border-white/60 rounded-tl-sm pointer-events-none"></div>
              <div className="absolute top-12 right-4 w-4 h-4 border-t border-r border-white/60 rounded-tr-sm pointer-events-none"></div>
              <div className="absolute bottom-16 left-4 w-4 h-4 border-b border-l border-white/60 rounded-bl-sm pointer-events-none"></div>
              <div className="absolute bottom-16 right-4 w-4 h-4 border-b border-r border-white/60 rounded-br-sm pointer-events-none"></div>

              {/* Top Bar HUD */}
              <div className="flex justify-between items-center w-full bg-slate-950/20 backdrop-blur-[0.5px] px-2 py-1 rounded bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
                {/* REC Status Indicator */}
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-black tracking-wider text-rose-500">
                  <span className={`w-2 h-2 rounded-full bg-rose-500 ${isPlaying ? 'animate-pulse' : ''}`} />
                  <span className={isPlaying ? 'text-rose-500' : 'text-slate-400'}>
                    {isPlaying ? '● REC' : 'STBY'}
                  </span>
                </div>

                {/* Dynamic Real-time Video Timecode */}
                <div className="font-mono text-[9px] font-bold text-white tracking-widest bg-black/40 px-2 py-0.5 rounded border border-white/10 uppercase">
                  {getFormattedTimecode()}
                </div>

                {/* Battery Status Layout */}
                <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-white/90">
                  <span>95%</span>
                  <div className="w-5 h-2.5 border border-white/60 rounded-xs p-[1.5px] flex items-center gap-[1px]">
                    <div className="h-full w-4 bg-emerald-500 rounded-xxs"></div>
                  </div>
                </div>
              </div>

              {/* Subdued Target Crosshair in Center */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <div className="absolute w-4 h-[1px] bg-white"></div>
                  <div className="absolute h-4 w-[1px] bg-white"></div>
                  <div className="w-1.5 h-1.5 rounded-full border border-white"></div>
                </div>
              </div>

              {/* Bottom HUD Bar (Digital Audio Decibels & Metadata Settings) */}
              <div className="flex justify-between items-end w-full font-mono text-[8px] text-white/80 bg-gradient-to-t from-black/40 to-transparent px-2 pointer-events-none">
                {/* Audio Levels Db Bars */}
                <div className="space-y-[2px] w-20 bg-black/40 p-1 rounded border border-white/5">
                  <div className="flex justify-between text-[7px] text-white/50 leading-none">
                    <span>L+R Lvl</span>
                    <span>-12dB</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-xs overflow-hidden flex p-[1px] gap-[1px]">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      style={{ width: '60%' }}
                      animate={isPlaying ? {
                        width: ['30%', '85%', '50%', '98%', '40%', '75%', '20%']
                      } : {
                        width: '10%'
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                </div>

                {/* Camera Hardware Stats */}
                <div className="text-right space-y-0.5 bg-black/45 px-1.5 py-1 rounded border border-white/5 text-[7.5px] text-yellow-500">
                  <div>AUTO S-LOG3 | 4K 60FPS</div>
                  <div className="text-white/60">F2.8 | 1/125s | ISO 250</div>
                </div>
              </div>
            </div>
          )}

          {/* WATERMARK OVERLAY OR FLOATING SOCIAL UI */}
          <div className="absolute right-3 top-20 flex flex-col gap-3.5 items-center">
            <div className="w-9 h-9 rounded-full bg-slate-950/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-950/70 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow">
              <span className="text-[10px] font-bold text-red-500 font-mono">9:16</span>
            </div>
          </div>

          {/* PROGRESS INDICATORS (Segment markers at the very top of player) */}
          <div className="absolute top-8 left-0 right-0 px-3.5 flex gap-1 z-30">
            {segments.map((s, idx) => (
              <div 
                key={s.id} 
                className="h-1 flex-1 bg-white/25 overflow-hidden rounded-full"
              >
                <div 
                  className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
                  style={{ 
                    width: idx < activeIndex 
                      ? '100%' 
                      : idx === activeIndex 
                        ? `${(currentTime / s.duration) * 100}%` 
                        : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* DYNAMIC PROGRESS ACCRUED DURATION */}
          <div className="absolute top-11 left-4 font-mono text-[9px] text-white/70 bg-slate-950/40 px-2 py-0.5 rounded-full backdrop-blur-[2px] z-30">
            {overallProgressPercentage.toFixed(0)}% Selesai | Segment {activeIndex + 1}/{segments.length}
          </div>

          {/* SUBTITLES CAPTION RENDER LAYER */}
          <div className="absolute inset-x-4 bottom-16 z-20 flex flex-col items-center justify-end text-center pointer-events-none mb-2">
            
            {/* Template Dependent Caption Styles */}
            {config.captionStyle === 'tiktok-yellow' && (
              <div className="bg-slate-950/95 text-yellow-300 font-display font-extrabold text-sm sm:text-base px-5 py-2.5 rounded-2xl border border-yellow-500/40 shadow-2xl leading-relaxed max-w-[280px]">
                {words.map((word, idx) => (
                  <span 
                    key={idx}
                    className={`inline-block mx-0.5 transition-all duration-200 ${
                      idx === currentWordIndex 
                        ? 'text-white scale-110 font-black underline decoration-yellow-400 decoration-2 underline-offset-4' 
                        : isKeyHighlight(word) 
                          ? 'text-yellow-400 font-bold' 
                          : 'text-yellow-200/80 font-normal'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}

            {config.captionStyle === 'modern-white' && (
              <div className="text-white font-sans font-bold text-sm sm:text-base px-3.5 py-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-[280px]">
                {words.map((word, idx) => (
                  <span 
                    key={idx}
                    className={`inline-block mx-0.5 transition-all duration-200 ${
                      idx === currentWordIndex 
                        ? 'text-yellow-400 scale-115' 
                        : isKeyHighlight(word) 
                          ? 'text-blue-300' 
                          : 'text-white'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}

            {config.captionStyle === 'bold-caps' && (
              <div className="bg-red-600 text-white font-display font-black tracking-wider uppercase text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xl transform skew-x-[-3deg] max-w-[280px]">
                {words.map((word, idx) => (
                  <span 
                    key={idx}
                    className={`inline-block mx-0.5 ${
                      idx === currentWordIndex 
                        ? 'text-black bg-white px-1 rounded transition-colors duration-150' 
                        : isKeyHighlight(word) 
                          ? 'text-yellow-300' 
                          : 'text-white'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}

            {config.captionStyle === 'gradient-bg' && (
              <div className="bg-gradient-to-r from-blue-700/90 to-cyan-500/90 text-white font-sans font-semibold text-xs sm:text-sm px-4.5 py-2.5 rounded-full border border-cyan-400/40 shadow-xl max-w-[280px]">
                {words.map((word, idx) => (
                  <span 
                    key={idx}
                    className={`inline-block mx-0.5 ${
                      idx === currentWordIndex 
                        ? 'text-yellow-300 font-extrabold translate-y-[-1px]' 
                        : isKeyHighlight(word) 
                          ? 'text-yellow-200 font-bold' 
                          : 'text-white/90'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CONTRAINED ACTION CONTROLS ON BOTTOM OF SCREEN */}
          <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between items-center z-30">
            <button
              id="player-play-btn"
              onClick={onPlayToggle}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-slate-950 hover:bg-green-600 scale-105'
              } shadow-lg pointer-events-auto`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-slate-950" />}
            </button>

            {/* Simulated Live Audio Waves Indicator */}
            {isPlaying && (
              <div className="flex items-center gap-0.5 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-xs">
                <Volume2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <div className="flex items-end gap-[2px] h-3 ml-1 w-6">
                  <div className="w-[3px] bg-blue-500 rounded-xs" style={{ height: '70%', animation: 'wave 0.8s ease-in-out infinite alternate 0.1s' }}></div>
                  <div className="w-[3px] bg-cyan-400 rounded-xs" style={{ height: '100%', animation: 'wave 0.8s ease-in-out infinite alternate 0.3s' }}></div>
                  <div className="w-[3px] bg-yellow-400 rounded-xs" style={{ height: '40%', animation: 'wave 0.8s ease-in-out infinite alternate 0.5s' }}></div>
                  <div className="w-[3px] bg-rose-500 rounded-xs" style={{ height: '85%', animation: 'wave 0.8s ease-in-out infinite alternate 0.2s' }}></div>
                </div>
              </div>
            )}

            <button
              id="player-restart-btn"
              onClick={onRestart}
              className="w-8 h-8 rounded-full bg-slate-900/90 text-slate-300 flex items-center justify-center hover:bg-slate-800 hover:text-white border border-slate-700/50 shadow pointer-events-auto"
              title="Restart Video"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
