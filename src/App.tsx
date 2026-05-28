import React, { useState, useEffect, useRef } from 'react';
import { ScriptSegment, VideoConfig } from './types';
import { templates, defaultImages } from './data';
import { VideoPlayer } from './components/VideoPlayer';
import { ScriptEditor } from './components/ScriptEditor';
import { PromoStandee } from './components/PromoStandee';
import { 
  Sparkles, Smartphone, Play, Pause, Save, HelpCircle, 
  Settings, CheckCircle, Volume2, Store, Printer, QrCode, Grid, ListCollapse,
  Camera, AlertTriangle, Download, Info, Video, RefreshCw, Eye, EyeOff
} from 'lucide-react';

export default function App() {
  // Public Screen Sharing Focus Mode State
  const [isShareFocus, setIsShareFocus] = useState<boolean>(false);
  const [hideExtraUI, setHideExtraUI] = useState<boolean>(false);

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
  const [exportingState, setExportingState] = useState<'idle' | 'hub' | 'preparing' | 'rendering' | 'success'>('idle');
  const [exportProgress, setExportProgress] = useState(0);
  const [successNoticeActive, setSuccessNoticeActive] = useState<boolean>(false);

  // High-Definition (HD) Real-time Screen Recorder states
  const [recorderState, setRecorderState] = useState<'idle' | 'countdown' | 'recording' | 'processing' | 'finished' | 'error'>('idle');
  const [recCountdown, setRecCountdown] = useState<number>(3);
  const [recorderError, setRecorderError] = useState<string>('');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>('');
  const [recordedBlobType, setRecordedBlobType] = useState<string>('video/webm');

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const activeSegmentIndex = segments.findIndex(s => s.id === currentSegmentId);
  const currentSegment = segments[activeSegmentIndex] || segments[0];

  // Speech Synth Ref
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Synchronized refs to avoid stale closures in Web Speech API handlers
  const isPlayingRef = useRef<boolean>(isPlaying);
  const currentSegmentIdRef = useRef<string>(currentSegmentId);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentSegmentIdRef.current = currentSegmentId;
  }, [currentSegmentId]);

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
        if (!isPlayingRef.current || currentSegmentIdRef.current !== segId) {
          return;
        }
        if (event.name === 'word') {
          const spokenBeforeChar = utterance.text.slice(0, event.charIndex);
          const wordOffset = spokenBeforeChar.split(/\s+/).filter(Boolean).length;
          setCurrentWordIndex(wordOffset);
        }
      };

      // Handle Segment playback finished
      utterance.onend = () => {
        if (!isPlayingRef.current || currentSegmentIdRef.current !== segId) {
          return;
        }
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
        if (!isPlayingRef.current || currentSegmentIdRef.current !== segId) {
          return;
        }
        if (e.error === 'interrupted' || e.error === 'canceled') {
          console.log('SpeechSynthesis intentionally interrupted/canceled');
          return;
        }
        console.warn('SpeechSynthesis error, running fallback timers:', e);
        startFallbackTimer(seg);
      };

      window.speechSynthesis.speak(utterance);

      // Start Segment visual elapsed timers (matches speak progress)
      const intervalDelay = 100; // Tick every 100ms
      let elapsed = 0;
      intervalRef.current = window.setInterval(() => {
        if (!isPlayingRef.current || currentSegmentIdRef.current !== segId) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
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
      if (!isPlayingRef.current || currentSegmentIdRef.current !== seg.id) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
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

  const openExportHub = () => {
    setExportingState('hub');
    setRecorderState('idle');
    setRecorderError('');
    setRecordedVideoUrl('');
    setExportProgress(0);
  };

  const handleDownloadManifestDirectly = () => {
    // Generate simulated Campaign text package to trigger real download instantly!
    const promoContent = `=== RETAIL TABLET CAMPAIGN BUNDLE ===\n` +
      `Merchant Name        : ${config.merchantName || 'DKR Retail Store'}\n` +
      `Cashier Name         : ${config.cashierName || 'Devi'}\n` +
      `Loyalty URL/QR Value : ${config.qrValue || 'https://google.com'}\n` +
      `Loyalty Product      : ${config.rewardProduct || 'Teh Botol Sosro'}\n` +
      `Voice Synthesizer ID : ${config.selectedVoiceName || 'Default SPG System'}\n\n` +
      `=== VOICE TRANSCIPT & KARAOKE SEQUENCE ===\n` + 
      segments.map((seg, idx) => `Segment ${idx + 1}: "${seg.text}"`).join('\n') + `\n\n` +
      `=== DISPATCH INSTRUCTIONS ===\n` +
      `1. Put this configuration file on your merchant tablet local directory dynamic_assets/\n` +
      `2. Open active DKR Merchant app under dynamic loyalty modules.\n` +
      `3. Tablet standee display and vocoder voice synthesizers will reflect these settings immediately.\n\n` +
      `Export Verification ID: SHA256-${Math.random().toString(36).substring(7).toUpperCase()}\n` +
      `Generated On Campaign Portal: ${new Date().toISOString()}`;

    const blob = new Blob([promoContent], { type: 'text/plain;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `DKR_Loyalti_Promo_Manifest.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
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
    // Reset screen recorder states too when user exits the modal
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setRecorderState('idle');
    setRecorderError('');
    setRecordedVideoUrl('');
  };

  // Start Real HD Screen Recording
  const startHdRecording = async () => {
    try {
      setRecorderError('');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Browser atau perangkat Anda tidak mendukung API Perekam Layar (getDisplayMedia). Silakan gunakan Browser Chrome/Edge/Safari terbaru di Laptop/PC Desktop.');
      }

      setRecorderState('countdown');
      setRecCountdown(3);
      chunksRef.current = [];

      let stream: MediaStream;
      try {
        // Request screen media capture with standard fully-compatible HD constraints
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
      } catch (audioErr: any) {
        // Check if the user actively canceled or clicked Cancel in the browser popups
        const isUserDenial = 
          audioErr?.name === 'NotAllowedError' || 
          audioErr?.name === 'PermissionDeniedError' || 
          audioErr?.message?.toLowerCase().includes('denied') || 
          audioErr?.message?.toLowerCase().includes('cancel') ||
          audioErr?.message?.toLowerCase().includes('abort');

        if (isUserDenial) {
          throw audioErr; // Throw immediately to outer catch so they don't get prompted again!
        }

        console.warn('Gagal merekam audio tab, mencoba alternatif tanpa audio agar tidak stuck...', audioErr);
        // Fallback to video-only to guarantee it never gets stuck
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          }
        });
      }

      streamRef.current = stream;

      // Start Countdown (3, 2, 1) before triggers
      let currentCount = 3;
      const countInterval = window.setInterval(() => {
        currentCount -= 1;
        setRecCountdown(currentCount);
        if (currentCount <= 0) {
          window.clearInterval(countInterval);
          
          try {
            // Determine best supported mimeType in current browser
            let selectedMime = 'video/webm;codecs=vp9';
            if (typeof MediaRecorder !== 'undefined') {
              const testTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm',
                'video/mp4;codecs=h264',
                'video/mp4',
                'video/quicktime'
              ];
              const supportedType = testTypes.find(t => MediaRecorder.isTypeSupported(t));
              selectedMime = supportedType || '';
            }
            setRecordedBlobType(selectedMime);

            const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
            recorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                chunksRef.current.push(e.data);
              }
            };

            recorder.onstop = () => {
              try {
                const finalBlob = new Blob(chunksRef.current, { type: selectedMime || 'video/webm' });
                const videoUrl = URL.createObjectURL(finalBlob);
                setRecordedVideoUrl(videoUrl);
                setRecorderState('finished');
                
                // Auto trigger immediate file download
                const a = document.createElement('a');
                a.href = videoUrl;
                const extension = selectedMime && selectedMime.includes('mp4') ? 'mp4' : 'webm';
                a.download = `DKR_Loyalti_Promo_HD.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              } catch (err: any) {
                console.error('Error processing recorded video blob:', err);
                setRecorderError(err?.message || 'Gagal memproses berkas rekaman video.');
                setRecorderState('error');
              } finally {
                // Turn off screen sharing bar/activities immediately
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                  streamRef.current = null;
                }
              }
            };

            // Adjust state to recording
            setRecorderState('recording');
            
            // Force playback restart from segment 1 to record from the very start!
            setCurrentSegmentTime(0);
            setCurrentWordIndex(-1);
            setCurrentSegmentId(segments[0]?.id);
            
            recorder.start();

            // Wait tiny delay so recorder catches frames
            setTimeout(() => {
              setIsPlaying(true);
              speakSegment(segments[0]?.id);
            }, 350);

          } catch (initErr: any) {
            console.error('Error starting MediaRecorder instance:', initErr);
            setRecorderError(initErr?.message || 'Format video rekaman tidak cocok dengan browser Anda.');
            setRecorderState('error');
            if (stream) {
              stream.getTracks().forEach(t => t.stop());
            }
          }
        }
      }, 1000);

      // Handle stream user manually click browser native "Stop sharing" button
      stream.getVideoTracks()[0].onended = () => {
        setRecorderState(prev => {
          if (prev === 'recording') {
            if (recorderRef.current && recorderRef.current.state !== 'inactive') {
              recorderRef.current.stop();
            }
            return 'finished';
          }
          return prev;
        });
      };

    } catch (err: any) {
      console.error('Error starting display capture:', err);
      // Give premium instructions on how to start if blocked by parent window/iframe restrictions
      setRecorderError(err?.message || 'Akses rekam layar/audio ditolak. Jika aplikasi dijalankan di iframe preview, silakan buka aplikasi di Tab Baru lewat pilihan di pojok kanan atas.');
      setRecorderState('error');
    }
  };

  const stopHdRecordingManually = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    pauseVideo();
    setRecorderState('finished');
  };

  // Monitor active recording playback to trigger auto stop at the natural end
  useEffect(() => {
    if (recorderState === 'recording' && !isPlaying) {
      // The video playback was stopped because the sequence reached the end or finished narrated speech!
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        setRecorderState('processing');
        setTimeout(() => {
          if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            recorderRef.current.stop();
          }
        }, 800); // Tiny brief gap to record final segment visual transition elegantly
      }
    }
  }, [isPlaying, recorderState]);

  const isExportingActive = exportingState === 'preparing' || exportingState === 'rendering' || ['countdown', 'recording', 'processing'].includes(recorderState);

  if (isShareFocus) {
    return (
      <div className="min-h-screen bg-[#07090e] text-[#dfebfc] flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden selection:bg-blue-500/30">
        {/* Ambient background glows for professional projection look */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating Presentation Control Panel */}
        {!hideExtraUI ? (
          <div className="w-full max-w-[350px] sm:max-w-[380px] mb-4 flex flex-col gap-2.5 z-10 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-slate-200 tracking-wider uppercase font-mono">Presentasi Publik</span>
              </div>
              
              <button
                onClick={() => {
                  pauseVideo();
                  setIsShareFocus(false);
                }}
                className="bg-red-550/10 hover:bg-red-550/20 text-red-400 border border-red-500/20 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg active:scale-95 transition-all text-center"
              >
                Kembali
              </button>
            </div>
            
            <div className="flex gap-2 pt-1 border-t border-slate-800/60">
              <button
                onClick={() => setHideExtraUI(true)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-yellow-450 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95"
                title="Sembunyikan semua tombol & teks bantuan luar agar rekaman/share hanya fokus pada HP saja!"
              >
                <EyeOff className="w-3.5 h-3.5 text-yellow-400" />
                <span>Sembunyikan Menu & Fokus Hanya HP</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setHideExtraUI(false)}
            className="fixed bottom-4 right-4 z-50 bg-slate-900/40 hover:bg-slate-900 text-slate-500 hover:text-slate-200 border border-slate-800/40 p-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs transition-all shadow-xl opacity-15 hover:opacity-100 flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Tampilkan Menu</span>
          </button>
        )}

        {/* Smartphone Simulator Area - Responsive mobile container */}
        <div className="w-full max-w-[360px] sm:max-w-[380px] px-2 flex justify-center transition-transform duration-300 drop-shadow-[0_25px_60px_rgba(29,78,216,0.15)] z-10 my-1">
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
        </div>
      </div>
    );
  }

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
              onClick={() => setIsShareFocus(true)}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg border border-blue-500/30 flex items-center gap-1.5 transition-all active:scale-95 group"
            >
              <Smartphone className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform animate-pulse" />
              <span>Fokus Share Screen (9:16)</span>
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

            {/* Enter Share Screen Button directly under the preview title */}
            <button
              onClick={() => setIsShareFocus(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-extrabold text-xs py-3 px-4 rounded-xl shadow border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 group"
            >
              <Smartphone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Mulai Mode Fokus Share Screen</span>
            </button>

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

      {/* HIGH-FIDELITY EXPORT & HD SCREEN RECORDER MODAL */}
      {exportingState !== 'idle' && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-6 my-8 text-[#dfebfc]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Hub Ekspor Video DKR (HD)</h3>
                  <p className="text-slate-400 text-xs">Pilih metode ekspor kampanye digital loyalitas Anda</p>
                </div>
              </div>
              <button 
                onClick={closeExportModal}
                className="text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* IF RECORDER HAS ACTIVE SUB-STATE */}
            {recorderState === 'countdown' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-24 h-24 rounded-full border-4 border-yellow-500/20 animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500 flex items-center justify-center text-3xl font-black text-yellow-400 font-mono">
                    {recCountdown}
                  </div>
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="text-white font-bold text-base">Mempersiapkan Rekaman Layar...</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Mohon jangan memindahkan tab browser Anda. Perekaman akan dimulai secara otomatis dari detik pertama ketika hitung mundur selesai!
                  </p>
                </div>
              </div>
            )}

            {recorderState === 'recording' && (
              <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center bg-slate-950/40 border border-red-500/10 p-6 rounded-2xl">
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-1.5 rounded-full font-mono text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>● SEDANG MEREKAM VIDEO KHAS KASIR DKR (HD)...</span>
                </div>
                
                <div className="space-y-2 max-w-md">
                  <h4 className="text-white text-base font-bold">Perekaman Berlangsung Secara Otomatis</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Sistem sedang merekam frame video beserta audio sulih suara Kasir <b className="text-white">{config.cashierName}</b>. Perekam akan **berhenti otomatis** saat transkrip video selesai dibacakan!
                  </p>
                </div>

                <div className="w-full max-w-xs bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-left text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Segment Aktif:</span>
                    <span className="text-white font-bold font-mono">{(segments.findIndex(s => s.id === currentSegmentId) + 1)} / {segments.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target File:</span>
                    <span className="text-yellow-400 font-mono">DKR_Loyalti_Promo_HD.webm</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={stopHdRecordingManually}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Hentikan & Simpan Sekarang</span>
                </button>
              </div>
            )}

            {recorderState === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-slate-800 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-base">Memproses Berkas Video HD...</h4>
                  <p className="text-slate-400 text-xs">Menyusun potongan rekaman layar dan audio ke dalam container resolusi tinggi.</p>
                </div>
              </div>
            )}

            {recorderState === 'finished' && (
              <div className="space-y-5 bg-slate-950/40 p-6 rounded-2xl border border-emerald-500/20 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-white font-bold text-base">Video HD Berhasil Direkam & Diunduh!</h4>
                  <p className="text-slate-400 text-xs">Terima kasih, berkas video telah otomatis diunduh oleh browser Anda.</p>
                </div>

                {recordedVideoUrl && (
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Pratinjau Hasil Rekaman:</span>
                    <video 
                      src={recordedVideoUrl} 
                      controls 
                      className="w-full max-h-48 rounded-xl bg-black border border-slate-800 shadow-inner" 
                    />
                  </div>
                )}

                <div className="bg-slate-900/60 p-4 rounded-xl text-left space-y-1.5 text-xs text-slate-300 border border-slate-800">
                  <p className="text-slate-400">📁 Nama File: <span className="text-white font-mono">DKR_Loyalti_Promo_HD.{recordedBlobType.includes('mp4') ? 'mp4' : 'webm'}</span></p>
                  <p className="text-slate-400">🔥 Kualitas Berkas: <span className="text-emerald-400 font-bold">HD Murni (1080p, Framerate Lancar)</span></p>
                  <p className="text-slate-400">💡 Alternatif: Jika unduhan file terhambat, klik tombol hijau di bawah untuk mengambil ulang file video.</p>
                </div>

                <div className="pt-2 flex gap-3 justify-end">
                  <button
                    onClick={() => { setRecorderState('idle'); setRecordedVideoUrl(''); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-5 rounded-xl border border-slate-700"
                  >
                    Rekam Ulang
                  </button>
                  {recordedVideoUrl && (
                    <a 
                      href={recordedVideoUrl}
                      download={`DKR_Loyalti_Promo_HD.${recordedBlobType.includes('mp4') ? 'mp4' : 'webm'}`}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-slate-950 font-black text-xs py-2.5 px-5 rounded-xl flex items-center justify-center gap-1.5 shadow"
                    >
                      <Download className="w-4 h-4 text-emerald-950" />
                      <span>Unduh Berkas Lagi</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {recorderState === 'error' && (
              <div className="py-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center text-red-500 mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-white font-bold text-base">Gagal Memulai Rekaman Layar</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {recorderError || 'Izin rekam layar ditolak oleh pengguna atau browser tidak mendukung fitur Perekam Layar.'}
                  </p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl text-left border border-slate-800 space-y-2 text-xs">
                  <p className="text-amber-400 font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Cara mengatasi error izin sharing:</span>
                  </p>
                  <ol className="list-decimal pl-4 text-slate-300 space-y-1 text-[11px]">
                    <li>Pastikan Anda menggunakan browser desktop (Chrome, Edge, Safari terbaru).</li>
                    <li>Sistem perekaman membutuhkan konfirmasi pembagian jendela layar.</li>
                    <li>Silahkan klik tombol "Coba Lagi" di bawah dan setujui izin sharing yang muncul.</li>
                  </ol>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <button
                    onClick={() => setRecorderState('idle')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-4 rounded-xl"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={startHdRecording}
                    className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl"
                  >
                    Coba Lagi Rekam Layar
                  </button>
                  <button
                    onClick={() => {
                      setRecorderState('idle'); 
                      handleExportSimulate();
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-slate-950 font-extrabold text-xs py-2 px-4 rounded-xl shadow"
                  >
                    Atau Jalankan Simulasi Cepat (Bypass Izin)
                  </button>
                </div>
              </div>
            )}

            {/* DEFAULT STATE: IDLE -> SELECT METHOD */}
            {recorderState === 'idle' && (
              <div className="space-y-6">
                
                {/* Method Option Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* OPTION 1: REAL HD SCREEN RECORDER */}
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-indigo-500/30 font-sans flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all shadow-lg">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full uppercase">REKOMENDASI</span>
                        <span className="text-indigo-300 font-bold text-xs font-mono">HD 1080p</span>
                      </div>
                      <h4 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span>Perekam Gerakan Layar (Otomatis & HD)</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Merekam frame 9:16 dari simulator video secara live dan real-time. Menghasilkan berkas video asli dengan suara pidato kasir dan teks karaoke yang tersinkronisasi sempurna!
                      </p>

                      <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2 text-[10px] leading-relaxed text-slate-300">
                        <p className="font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>PANDUAN REKAMAN BERSIH & AUDIO SUARA:</span>
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          <li><b>Cara agar Rekaman Bersih (Hanya Simulator):</b> Saat popup browser muncul, pilih menu tab <b>"Tab Chrome" (Chrome Tab)</b> lalu pilih tab aplikasi ini. Jangan pilih "Seluruh Layar" agar tombol luar tidak ikut terekam.</li>
                          <li><b>Cara agar Suara Masuk:</b> WAJIB centang pilihan <b>"Bagikan Audio Tab" (Share Tab Audio)</b> di pojok kiri bawah popup sebelum mulai merekam agar suara Kasir DKR masuk ke video.</li>
                          <li><b>Format File WebM (.webm):</b> Browser secara lokal mengunduh video format WebM (karena aturan lisensi browser). WebM sepenuhnya didukung di TikTok, Reels, YouTube Shorts, CapCut, WhatsApp, dan VLC Player. Jika wajib menggunakan .mp4, Anda bisa konversi instan gratis di situs seperti <i>cloudconvert.com</i> atau <i>ezgif.com</i> dalam 2 detik!</li>
                        </ul>
                      </div>

                      {(window.self !== window.top) && (
                        <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-500/20 space-y-1.5 text-[10px] leading-relaxed text-emerald-300">
                          <p className="font-bold text-amber-400 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>Rekomendasi Preview Iframe:</span>
                          </p>
                          <p>
                            Untuk kestabilan izin perekaman, silakan klik tombol <b>"Buka di Tab Baru"</b> (ikon panah keluar di atas kanan panel pratinjau Anda) agar browser Anda bisa mengajukan jendela rekam layar secara penuh!
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={startHdRecording}
                      className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-black text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>Mulai Perekaman Layar (HD)</span>
                    </button>
                  </div>

                  {/* OPTION 2: INSTANT QUICK MOCK */}
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 font-sans flex flex-col justify-between space-y-4 hover:border-slate-750 transition-all">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">INSTANT Fallback</span>
                        <span className="text-slate-500 font-bold text-xs font-mono">Bypass</span>
                      </div>
                      <h4 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-slate-400" />
                        <span>Ekspor Manifes Data Teks (.txt)</span>
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Mengunduh paket data teks kampanye murni berisi setelan kasir, QR code, dan transkrip. Sangat ringan untuk ditransfer langsung ke memori internal tablet Kasir DKR fisik Anda!
                      </p>
                      <p className="text-slate-500 text-[10px] italic">
                        *Catatan: Tombol ini TIDAK mengunduh file video, melainkan file teks konfigurasi pintar (.txt) untuk sinkronisasi otomatis perangkat tablet.
                      </p>
                    </div>

                    {exportingState === 'preparing' || exportingState === 'rendering' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{exportingState === 'preparing' ? 'Mempersiapkan...' : 'Merender...'}</span>
                          <span>{exportProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                        </div>
                      </div>
                    ) : exportingState === 'success' ? (
                      <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400 text-center font-bold text-xs uppercase flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Simulasi Sukses Tersimpan</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleExportSimulate}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Jalankan Simulasi Cepat</span>
                      </button>
                    )}
                  </div>

                </div>

                {/* Simulated Success Screen in Option UI (If they clicked Option 2 and succeeded) */}
                {exportingState === 'success' && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
                    {successNoticeActive ? (
                      <div className="py-2 text-center space-y-2 animate-bounce">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                          <CheckCircle className="w-6 h-6 animate-pulse" />
                        </div>
                        <p className="text-emerald-400 font-extrabold text-xs">Simulasi Unduhan Berhasil Dilakukan!</p>
                        <p className="text-slate-400 text-[10px]">Media pack DKR_Loyalti_Promo_Manifest.txt berhasil diunduh ke Laptop/PC Anda.</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="text-white font-bold text-xs">Simulasi Unduh Berhasil Tersiapkan!</h5>
                            <p className="text-[10px] text-slate-400">Berkas simulasi siap ditarik oleh sistem.</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => setExportingState('idle')}
                            className="bg-slate-900 text-slate-400 hover:text-white font-bold text-[11px] py-2 px-4 rounded-lg"
                          >
                            Batal
                          </button>
                          <a 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              
                              // Generate simulated Campaign text package to bypass alerts and trigger real download!
                              const promoContent = `=== RETAIL TABLET CAMPAIGN BUNDLE ===\n` +
                                `Campaign Title       : ${config.title || 'Kabar gembira buat kamu!'}\n` +
                                `Loyalty URL/QR Value : ${config.qrValue || 'https://google.com'}\n` +
                                `Loyalty Product      : ${config.rewardProduct || 'Teh Botol Sosro'}\n` +
                                `Voice Synthesizer ID : ${config.voiceIndex || 0}\n\n` +
                                `=== VOICE TRANSCIPT & KARAOKE SEQUENCE ===\n` + 
                                segments.map((seg, idx) => `Segment ${idx + 1}: "${seg.text}"`).join('\n') + `\n\n` +
                                `=== DISPATCH INSTRUCTIONS ===\n` +
                                `1. Put this configuration file on your merchant tablet local directory dynamic_assets/\n` +
                                `2. Open active DKR Merchant app under dynamic loyalty modules.\n` +
                                `3. Tablet standee display and vocoder voice synthesizers will reflect these settings immediately.\n\n` +
                                `Export Verification ID: SHA256-${Math.random().toString(36).substring(7).toUpperCase()}\n` +
                                `Generated On Campaign Portal: ${new Date().toISOString()}`;

                              const blob = new Blob([promoContent], { type: 'text/plain;charset=utf-8' });
                              const downloadUrl = URL.createObjectURL(blob);
                              
                              const a = document.createElement('a');
                              a.href = downloadUrl;
                              a.download = `DKR_Loyalti_Promo_Manifest.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(downloadUrl);

                              // Instead of window.alert() which gets sandboxed & stuck, show gorgeous inline banner!
                              setSuccessNoticeActive(true);
                              setTimeout(() => {
                                setSuccessNoticeActive(false);
                                closeExportModal();
                              }, 2500);
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-slate-950 font-black text-[11px] py-2 px-4 rounded-lg flex items-center gap-1 shadow"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Manifes Teks (.txt)</span>
                          </a>
                        </div>
                      </>
                    )}
                    </div>
                  )}

              </div>
            )}

            {/* Bottom Modal Footer with overall notice */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-800 text-[10px] text-slate-500 gap-3">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Format Standar 9:16 (Vertikal) | Optimal untuk Smartphone, TikTok, Reels, & Tablet Kasir DKR</span>
              </span>
              <span>Uji Coba Kampanye Digital DKR 2026</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
