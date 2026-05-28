import React, { useState, useEffect, useRef } from 'react';
import { ScriptSegment, VideoConfig } from './types';
import { templates, defaultImages } from './data';
import { VideoPlayer } from './components/VideoPlayer';
import { ScriptEditor } from './components/ScriptEditor';
import { PromoStandee } from './components/PromoStandee';
import { 
  Sparkles, Smartphone, Play, Pause, Save, HelpCircle, 
  Settings, CheckCircle, Volume2, Store, Printer, QrCode, Grid, ListCollapse
} from 'lucide-react';

export default function App() {
  // Config state
  const [config, setConfig] = useState<VideoConfig>({
    merchantName: 'DKR Retail Store',
    cashierName: 'Devi',
    rewardProduct: 'Teh Botol Sosro Dingin',
    qrValue: 'https://dkr.my.id/loyalty',
    voicePitch: 1.35, // High pitch for a cheerful female voice
    voiceRate: 1.12, // Faster speech rate for a talkative/chatty (cerewet) vibe
    selectedVoiceName: '',
    selectedTemplateId: 'spg-ceria-cerewet',
    backgroundColor: '#1d4ed8', // DKR Brand Blue
    accentColor: '#fbbf24', // DKR Yellow Accent
    captionStyle: 'tiktok-yellow',
    cameraOverlay: true
  });

  // Segments state initialized with spg-ceria-cerewet template
  const [segments, setSegments] = useState<ScriptSegment[]>(() => {
    const spgTemplate = templates.find(t => t.id === 'spg-ceria-cerewet');
    return spgTemplate ? JSON.parse(JSON.stringify(spgTemplate.segments)) : [];
  });

  // Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSegmentId, setCurrentSegmentId] = useState<string>('');
  const [currentSegmentTime, setCurrentSegmentTime] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [exportingState, setExportingState] = useState<'idle' | 'preparing' | 'rendering' | 'success'>('idle');
  const [exportProgress, setExportProgress] = useState(0);

  const activeSegmentIndex = segments.findIndex(s => s.id === currentSegmentId);
  const currentSegment = segments[activeSegmentIndex] || segments[0];

  // Speech Synth Ref
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Select Indonesian voice by default if available
        const idVoice = voices.find(v => v.lang.toLowerCase().includes('id'));
        if (idVoice && !config.selectedVoiceName) {
          setConfig(prev => ({ ...prev, selectedVoiceName: idVoice.name }));
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialize first segment
  useEffect(() => {
    if (segments.length > 0 && !currentSegmentId) {
      setCurrentSegmentId(segments[0].id);
    }
  }, [segments]);

  // Handle Play/Pause change
  const handlePlayToggle = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playVideo = (startFromId?: string) => {
    setIsPlaying(true);
    const targetId = startFromId || currentSegmentId || segments[0]?.id;
    setCurrentSegmentId(targetId);
    
    // Play with TTS audio
    speakSegment(targetId);
  };

  const handleRestart = () => {
    pauseVideo();
    setCurrentSegmentTime(0);
    setCurrentWordIndex(-1);
    setCurrentSegmentId(segments[0]?.id);
    setTimeout(() => {
      playVideo(segments[0]?.id);
    }, 100);
  };

  // Speak particular segment text
  const speakSegment = (segId: string) => {
    const segIdx = segments.findIndex(s => s.id === segId);
    if (segIdx === -1) return;
    const seg = segments[segIdx];

    // Clear previous ticker
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Reset offsets
    setCurrentSegmentTime(0);
    setCurrentWordIndex(-1);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      // Setup dynamic speech utterance with replaced variables
      let spokenText = seg.text
        .replace(/DKR/g, 'D K R')
        .replace(/HP/g, 'ha pe')
        .replace(/QR/g, 'kiu ar')
        .replace(/QR Code/g, 'kiu ar kod');
      
      // Variable replacements
      spokenText = spokenText.replace(/Kasir/g, `Kasir ${config.cashierName}`);
      
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utteranceRef.current = utterance;

      // Pitch, Rate & Voice configurations
      utterance.pitch = config.voicePitch;
      utterance.rate = config.voiceRate;
      
      if (config.selectedVoiceName) {
        const foundVoice = availableVoices.find(v => v.name === config.selectedVoiceName);
        if (foundVoice) utterance.voice = foundVoice;
      }

      // Sync character indexes on speak
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const spokenBeforeChar = utterance.text.slice(0, event.charIndex);
          const wordOffset = spokenBeforeChar.split(/\s+/).filter(Boolean).length;
          setCurrentWordIndex(wordOffset);
        }
      };

      // Handle Segment playback finished
      utterance.onend = () => {
        const nextIdx = segIdx + 1;
        if (nextIdx < segments.length) {
          setCurrentSegmentId(segments[nextIdx].id);
          speakSegment(segments[nextIdx].id);
        } else {
          setIsPlaying(false);
          setCurrentWordIndex(-1);
          setCurrentSegmentTime(0);
        }
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error, running fallback timers:', e);
        startFallbackTimer(seg);
      };

      window.speechSynthesis.speak(utterance);

      // Start Segment visual elapsed timers (matches speak progress)
      const intervalDelay = 100; // Tick every 100ms
      let elapsed = 0;
      intervalRef.current = window.setInterval(() => {
        elapsed += 0.1;
        setCurrentSegmentTime(elapsed);
        
        // If voice didn't trigger boundaries (Safari issue), simulate word pacing
        if (currentWordIndex === -1 || elapsed > seg.duration) {
          const totalWords = seg.text.split(' ').length;
          const estimatedWordIdx = Math.min(totalWords - 1, Math.floor((elapsed / seg.duration) * totalWords));
          setCurrentWordIndex(estimatedWordIdx);
        }
      }, intervalDelay);

    } else {
      // Fallback Timer driven sequence (No speechSynthesis available)
      startFallbackTimer(seg);
    }
  };

  const startFallbackTimer = (seg: ScriptSegment) => {
    const segIdx = segments.findIndex(s => s.id === seg.id);
    let elapsed = 0;
    const textWords = seg.text.split(' ');
    
    intervalRef.current = window.setInterval(() => {
      elapsed += 0.1;
      setCurrentSegmentTime(elapsed);
      
      // Progress word highlighting
      const wordProgress = Math.min(
        textWords.length - 1, 
        Math.floor((elapsed / seg.duration) * textWords.length)
      );
      setCurrentWordIndex(wordProgress);

      if (elapsed >= seg.duration) {
        clearInterval(intervalRef.current!);
        const nextIdx = segIdx + 1;
        if (nextIdx < segments.length) {
          setCurrentSegmentId(segments[nextIdx].id);
          startFallbackTimer(segments[nextIdx]);
        } else {
          setIsPlaying(false);
          setCurrentWordIndex(-1);
          setCurrentSegmentTime(0);
        }
      }
    }, 100);
  };

  // Triggered when user selects a segment in timeline
  const handleSelectSegment = (id: string) => {
    setCurrentSegmentId(id);
    setCurrentWordIndex(-1);
    setCurrentSegmentTime(0);
    if (isPlaying) {
      speakSegment(id);
    }
  };

  // Run a simulated export
  const handleExportSimulate = () => {
    setExportingState('preparing');
    setExportProgress(10);
    
    // Animate standard progress increments for high-fidelity feel
    const interval = setInterval(() => {
      setExportProgress(curr => {
        if (curr >= 100) {
          clearInterval(interval);
          setExportingState('success');
          return 100;
        }
        
        if (curr === 30) {
          setExportingState('rendering');
        }
        
        return curr + 10;
      });
    }, 350);
  };

  const closeExportModal = () => {
    setExportingState('idle');
    setExportProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-[#dfebfc] flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* GLOWING APP HEADER */}
      <header className="border-b border-slate-800 bg-[#0b101c]/90 backdrop-blur-md sticky top-0 z-40 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-2.5 rounded-2xl shadow-lg ring-4 ring-blue-500/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[11px] leading-tight flex items-center">D</span>
                <span className="bg-yellow-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[11px] leading-tight flex items-center">K</span>
                <span className="bg-blue-600 text-white font-black px-1.5 py-0.5 rounded text-[11px] leading-tight flex items-center">R</span>
                <span className="font-display font-black text-sm tracking-widest text-[#edf5ff] ml-1">LOYALTY</span>
              </div>
              <h1 className="text-xs text-slate-400 mt-1">
                Aplikasi Pembuat Video Promosi Vertikal (9:16) Kasir DKR & Standee Promosi Cetak
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="export-trigger-btn"
              onClick={handleExportSimulate}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900 animate-pulse" />
              <span>Simpan & Ekspor Video</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: 9:16 VERTICAL VIDEO PLAYER PREVIEW */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 space-y-5 w-full max-w-[360px]">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Pratinjau Video (9:16)</span>
              </span>
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase tracking-wider">
                Live Rendering
              </span>
            </div>

            {/* Video Player Display */}
            <VideoPlayer
              segments={segments}
              config={config}
              highlightedImages={{
                cashier: defaultImages.cashier,
                flyer: defaultImages.flyer
              }}
              isPlaying={isPlaying}
              activeSegmentId={currentSegmentId}
              onPlayToggle={handlePlayToggle}
              onRestart={handleRestart}
              currentTime={currentSegmentTime}
              currentWordIndex={currentWordIndex}
            />

            {/* In-store Playback Guidance Tips */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-300">🏪 Cara Menampilkan di Toko DKR:</p>
              <p>Materi 9:16 ini sangat tepat dipasang pada tablet kasir yang dihadapkan ke pembeli, atau diunggah sebagai Reels / TikTok toko DKR untuk menarik pendaftaran member baru.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SCRIPT EDITOR & CAMPAIGN CONFIGURATION TABS */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <ScriptEditor
            config={config}
            onConfigChange={setConfig}
            segments={segments}
            onSegmentsChange={setSegments}
            availableVoices={availableVoices}
            activeSegmentId={currentSegmentId}
            onSegmentSelect={handleSelectSegment}
          />

          {/* Sinergy Material: Promo Standee Cards */}
          <PromoStandee
            config={config}
            flyerImage={defaultImages.flyer}
          />
        </div>

      </main>

      {/* DETAILED USER GUIDE MANUAL */}
      <section className="bg-slate-950 border-t border-slate-800/80 py-10 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow">
            <Store className="w-6 h-6 animate-bounce-slow" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">Panduan Operasional Kampanye Pembeli DKR</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Sistem Loyalitas DKR memberikan keuntungan langsung berupa barang gratis bagi pembeli di transaksi berikutnya. Berikut alur kerja di toko bagi kasir Anda:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-804/40 space-y-2">
              <span className="text-yellow-400 font-extrabold text-sm">01 / Putar Video</span>
              <p className="text-slate-200 font-bold text-xs">Tablet Hadap Pelanggan</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">Putar video 9:16 di tablet kasir yang diletakkan di dekat mesin POS kasir agar dilihat langsung oleh pembeli saat mengantre.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-804/40 space-y-2">
              <span className="text-yellow-400 font-extrabold text-sm">02 / Pasang Cetakan</span>
              <p className="text-slate-200 font-bold text-xs">Cetak QR Standee</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">Letakkan kertas standee program loyalitas di atas meja akrilik kasir agar pembeli terbimbing memindai QR langsung ketika mengantre belanjaan.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-804/40 space-y-2">
              <span className="text-yellow-400 font-extrabold text-sm">03 / Berikan Hadiah</span>
              <p className="text-slate-200 font-bold text-xs">Klaim pada Kunjungan Berikut</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">Pada pembayaran berikutnya, pembeli menunjukkan ID loyalti hasil pendaftaran dan mendapatkan <b>{config.rewardProduct} Gratis!</b></p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center">
        <p className="text-xs text-slate-500">
          © 2026 DKR Loyalty Video Creator App. Menggunakan kecerdasan buatan, visual presisi, dan sintesis audio real-time.
        </p>
      </footer>

      {/* SIMULATED EXPORT MODAL */}
      {exportingState !== 'idle' && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            
            {exportingState === 'preparing' && (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-t-yellow-400 border-slate-800 animate-spin mx-auto" />
                <h3 className="text-white font-bold text-base">Menyiapkan Rekaman Video...</h3>
                <p className="text-slate-400 text-xs leading-relaxed">Mengompilasi materi kampanye verbal & visual DKR 9:16 dengan teks overlay transkrip Karaoke.</p>
              </>
            )}

            {exportingState === 'rendering' && (
              <>
                <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-slate-800 animate-spin mx-auto" />
                <h3 className="text-white font-bold text-base">Merender Video Vertikal</h3>
                <p className="text-slate-400 text-xs">Progres Rendering: {exportProgress}%</p>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${exportProgress}%` }} />
                </div>
              </>
            )}

            {exportingState === 'success' && (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-white font-bold text-base">Video Siap Diunduh!</h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Video kampanye DKR 9:16 dengan audio suara wanita Indonesia (Kasir {config.cashierName}) berhasil digenerate sempurna!
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left space-y-1.5 text-[11px]">
                  <p className="text-slate-400">📁 Nama File: <span className="text-white font-mono">DKR_Loyalti_Promo_9-16.mp4</span></p>
                  <p className="text-slate-400">🔊 Format Audio: <span className="text-white">Sintesis Suara Perempuan (Ramah)</span></p>
                  <p className="text-slate-400">🎁 Reward: <span className="text-yellow-400 font-bold">{config.rewardProduct}</span></p>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={closeExportModal}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2 px-4 rounded-xl"
                  >
                    Tutup
                  </button>
                  <a 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Mengunduh paket media video DKR_Loyalti_Promo_9-16.mp4 beserta transkip pelengkap! Silahkan pasang di tablet retail kasir Anda.');
                      closeExportModal();
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-slate-950 font-extrabold text-xs py-2 px-4 rounded-xl flex items-center justify-center"
                  >
                    Unduh MP4
                  </a>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
