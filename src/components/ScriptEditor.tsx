import React, { useState } from 'react';
import { ScriptSegment, VideoConfig, PromotionalTemplate } from '../types';
import { templates, sampleProducts } from '../data';
import { 
  Play, Pause, FileText, Gift, Settings, Sparkles, Smile,
  Plus, Trash2, Sliders, Type, HelpCircle, AlertCircle, RefreshCcw, Camera
} from 'lucide-react';

interface ScriptEditorProps {
  config: VideoConfig;
  onConfigChange: (newConfig: VideoConfig) => void;
  segments: ScriptSegment[];
  onSegmentsChange: (newSegments: ScriptSegment[]) => void;
  availableVoices: SpeechSynthesisVoice[];
  activeSegmentId: string;
  onSegmentSelect: (id: string) => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  config,
  onConfigChange,
  segments,
  onSegmentsChange,
  availableVoices,
  activeSegmentId,
  onSegmentSelect
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'custom-segments'>('content');
  const [newHighlight, setNewHighlight] = useState('');

  const currentSegment = segments.find(s => s.id === activeSegmentId) || segments[0];

  // Handle template switch
  const handleTemplateSwitch = (templateId: string) => {
    const selected = templates.find(t => t.id === templateId);
    if (selected) {
      // Re-populate segments
      const clonedSegments = JSON.parse(JSON.stringify(selected.segments));
      onSegmentsChange(clonedSegments);
      onConfigChange({
        ...config,
        selectedTemplateId: templateId
      });
    }
  };

  // Handle single segment text change
  const handleSegmentTextChange = (id: string, newText: string) => {
    const updated = segments.map(seg => {
      if (seg.id === id) {
        return { ...seg, text: newText };
      }
      return seg;
    });
    onSegmentsChange(updated);
  };

  // Handle visual mode change
  const handleVisualModeChange = (id: string, mode: ScriptSegment['visualMode']) => {
    const updated = segments.map(seg => {
      if (seg.id === id) {
        return { ...seg, visualMode: mode };
      }
      return seg;
    });
    onSegmentsChange(updated);
  };

  // Handle individual segment duration change
  const handleSegmentDurationChange = (id: string, seconds: number) => {
    const updated = segments.map(seg => {
      if (seg.id === id) {
        return { ...seg, duration: Math.max(1, Math.min(30, seconds)) };
      }
      return seg;
    });
    onSegmentsChange(updated);
  };

  // Add a highlight term
  const addHighlight = () => {
    if (!newHighlight.trim() || !currentSegment) return;
    if (!currentSegment.highlights.includes(newHighlight.trim())) {
      const updated = segments.map(seg => {
        if (seg.id === currentSegment.id) {
          return {
            ...seg,
            highlights: [...seg.highlights, newHighlight.trim()]
          };
        }
        return seg;
      });
      onSegmentsChange(updated);
      setNewHighlight('');
    }
  };

  // Remove highlight term
  const removeHighlight = (term: string) => {
    const updated = segments.map(seg => {
      if (seg.id === currentSegment.id) {
        return {
          ...seg,
          highlights: seg.highlights.filter(h => h !== term)
        };
      }
      return seg;
    });
    onSegmentsChange(updated);
  };

  // Filter for Indonesian voices or female sounding voices explicitly
  const indonesianVoices = availableVoices.filter(v => 
    v.lang.toLowerCase().includes('id') || v.lang.toLowerCase().includes('indo')
  );

  return (
    <div className="bg-slate-900/80 rounded-[24px] border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      
      {/* Tabs Layout */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all rounded-t-lg -mb-[1px] ${
            activeTab === 'content'
              ? 'border-b-2 border-yellow-400 text-yellow-400 font-bold bg-slate-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Konten & Naskah</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all rounded-t-lg -mb-[1px] ${
            activeTab === 'settings'
              ? 'border-b-2 border-yellow-400 text-yellow-400 font-bold bg-slate-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan Video & Suara</span>
        </button>

        <button
          onClick={() => setActiveTab('custom-segments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all rounded-t-lg -mb-[1px] ${
            activeTab === 'custom-segments'
              ? 'border-b-2 border-yellow-400 text-yellow-400 font-bold bg-slate-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Alur Visual Kasir</span>
        </button>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Gunakan Template Pilihan</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSwitch(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.selectedTemplateId === t.id
                      ? 'bg-yellow-500/10 border-yellow-400/50 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm truncate">{t.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                    {t.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="h-[px] bg-slate-800/50 my-2"></div>

          {/* Quick Customization Variables */}
          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1.5">
                Nama Kasir di Badge
              </label>
              <input
                type="text"
                placeholder="Misal: Siti"
                value={config.cashierName}
                onChange={(e) => onConfigChange({ ...config, cashierName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1.5">
                Produk Reward Gratis (Hasil Transaksi)
              </label>
              <select
                value={config.rewardProduct}
                onChange={(e) => onConfigChange({ ...config, rewardProduct: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
              >
                {sampleProducts.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Kustom Lainnya...">+ Tulis Produk Kustom</option>
              </select>
            </div>

            {config.rewardProduct.includes('Kustom') && (
              <div>
                <label className="block text-slate-300 text-[11px] font-semibold mb-1.5">
                  Tulis Produk Pilihan Baru:
                </label>
                <input
                  type="text"
                  placeholder="Misal: Teh Hangat Manis"
                  onChange={(e) => onConfigChange({ ...config, rewardProduct: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-[11px] font-semibold mb-1.5">
                Target URL Tersemat di QR Code
              </label>
              <input
                type="text"
                value={config.qrValue}
                onChange={(e) => onConfigChange({ ...config, qrValue: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Core Timeline Sequence Script Editor */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Sequence Naskah Suara & Transkrip</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded">
                Edit langsung kotak teks di bawah
              </span>
            </h4>

            <div className="space-y-3">
              {segments.map((s, index) => (
                <div
                  key={s.id}
                  onClick={() => onSegmentSelect(s.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeSegmentId === s.id
                      ? 'bg-slate-800/90 border-yellow-400 text-white'
                      : 'bg-slate-950/30 border-slate-850 text-slate-300 hover:bg-slate-800/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 px-2.5 py-1 rounded flex items-center gap-1">
                      <span>🎬 Bagian {index + 1}</span>
                      <span className="text-yellow-400">({s.visualMode})</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Durasi:</span>
                      <input 
                        type="number"
                        min="2"
                        max="20"
                        value={s.duration}
                        onChange={(e) => handleSegmentDurationChange(s.id, parseInt(e.target.value) || 3)}
                        className="w-10 bg-slate-900 text-slate-200 text-center rounded border border-slate-800 py-0.5 text-[10px] focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-[10px] text-slate-400">detik</span>
                    </div>
                  </div>

                  <textarea
                    value={s.text}
                    onChange={(e) => handleSegmentTextChange(s.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs sm:text-sm leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 focus:outline-none focus:border-yellow-500/40 text-slate-200 font-sans"
                    rows={2}
                    placeholder="Tulis kalimat di sini..."
                  />

                  {/* Highlights Visual Tags */}
                  {activeSegmentId === s.id && (
                    <div className="mt-3.5 space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-semibold">Tandai Kata Tebal / Disorot:</span>
                        <div className="flex gap-1">
                          <input 
                            type="text"
                            placeholder="Tulis Kata..."
                            value={newHighlight}
                            onChange={(e) => setNewHighlight(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addHighlight();
                              }
                            }}
                            className="bg-slate-950/90 text-[10px] px-2.5 py-1 border border-slate-800 rounded placeholder-slate-500 focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addHighlight();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 rounded flex items-center justify-center"
                          >
                            Tambah
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {s.highlights.map(h => (
                          <span 
                            key={h}
                            className="bg-yellow-400 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                          >
                            <span>{h}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeHighlight(h);
                              }}
                              className="hover:text-red-600 focus:outline-none"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        {s.highlights.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">Belum ada kata khusus yang disorot kuning di layar</span>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Subtitles Style */}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span>Gaya Keterangan Teks (CapCut Caption Style)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'tiktok-yellow', label: 'Tiktok Kuning', desc: 'Latar hitam tebal, tulisan kuning' },
                { id: 'modern-white', label: 'Minimalis Putih', desc: 'Tulisan putih bersih berbayang' },
                { id: 'bold-caps', label: 'Huruf Besar Merah', desc: 'Tulisan miring, cap-lock gaya trend' },
                { id: 'gradient-bg', label: 'Gaya Gradasi Biru', desc: 'Tulisan dalam balon kapsul biru' }
              ].map(style => (
                <button
                  key={style.id}
                  onClick={() => onConfigChange({ ...config, captionStyle: style.id as any })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    config.captionStyle === style.id
                      ? 'bg-blue-600/10 border-blue-400 text-white shadow-md font-bold'
                      : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <p className="text-xs">{style.label}</p>
                  <p className="text-[9px] text-slate-500 mt-1 leading-tight">{style.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/50 my-2"></div>

          {/* Live Camera Recording Effects config.cameraOverlay */}
          <div className="bg-slate-950/45 p-5 rounded-2xl border border-slate-850 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase text-emerald-400 tracking-widest flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Simulasi Rekaman Live Kamera (Camcorder Overlay)</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                  Menampilkan elemen overlay perekaman sungguhan layaknya video yang diambil secara live (tombol merah berkedip <strong>● REC</strong>, bingkai bidikan kamera, indikator baterai, format resolusi, dan pewaktu perekaman berjalan).
                </p>
              </div>
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => onConfigChange({ ...config, cameraOverlay: !config.cameraOverlay })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    config.cameraOverlay ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.cameraOverlay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800/50 my-2"></div>

          {/* Voice Text to Speech Customizer */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850">
            <h4 className="text-xs font-bold uppercase text-yellow-500 tracking-widest mb-4 flex items-center gap-2">
              <Smile className="w-4 h-4" />
              <span>Pengaturan Suara Wanita Pembawa Acara (Suara Kasir)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 flex justify-between">
                  <span>Pilih Suara Sintetis (Web Speech API)</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Bhs. Indonesia disarankan</span>
                </label>
                <select
                  value={config.selectedVoiceName}
                  onChange={(e) => onConfigChange({ ...config, selectedVoiceName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  {indonesianVoices.length > 0 ? (
                    <optgroup label="Suara Bahasa Indonesia">
                      {indonesianVoices.map(v => (
                        <option key={v.name} value={v.name}>
                          🇮🇩 {v.name} ({v.localService ? 'Offline' : 'Online'})
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option value="">(Tidak ditemukan suara Bahasa Indonesia eksklusif, menggunakan sistem utama)</option>
                  )}
                  <optgroup label="Pilihan Suara Sistem Lain">
                    {availableVoices
                      .filter(v => !v.lang.toLowerCase().includes('id'))
                      .slice(0, 15)
                      .map(v => (
                        <option key={v.name} value={v.name}>
                          🌐 {v.name} ({v.lang})
                        </option>
                      ))}
                  </optgroup>
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                  ℹ️ Web Speech API memuat suara yang terpasang di Google Chrome / Browser HP Kakak secara lokal. Kami menyaring otomatis untuk suara Bahasa Indonesia.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-slate-300">
                    <span>Tinggi Nada Suara (Pitch)</span>
                    <span className="text-yellow-400 font-mono text-[10px]">{config.voicePitch.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={config.voicePitch}
                    onChange={(e) => onConfigChange({ ...config, voicePitch: parseFloat(e.target.value) })}
                    className="w-full accent-yellow-400 h-1 bg-slate-800 rounded-full"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>Berat/Ngebass</span>
                    <span>Tinggi/Perempuan Cempreng</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px] font-semibold text-slate-300">
                    <span>Kecepatan Berbicara (Rate)</span>
                    <span className="text-yellow-400 font-mono text-[10px]">{config.voiceRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.1"
                    value={config.voiceRate}
                    onChange={(e) => onConfigChange({ ...config, voiceRate: parseFloat(e.target.value) })}
                    className="w-full accent-yellow-400 h-1 bg-slate-800 rounded-full"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>Lambat & Santai</span>
                    <span>Cepat & Padat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/20 text-yellow-400/90 text-[10px] sm:text-xs leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Informasi Penting Terkait Suara Wanita:</p>
              <p className="mt-0.5">Kami secara cerdas mengoptimalkan parameter suara ke level sintesis feminin (Pitch 1.15 hingga 1.30) sehingga menghasilkan suara wanita yang ceria, ramah dan santun bagi pembeli DKR!</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom-segments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Ubah Mood Visual & Transisi Kamera</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((seg, idx) => (
              <div 
                key={seg.id}
                className={`p-3 rounded-xl border ${
                  activeSegmentId === seg.id ? 'bg-slate-800 border-yellow-400/80' : 'bg-slate-950/40 border-slate-850'
                } space-y-2`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Tahap {idx + 1} Visual</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    "{seg.text.slice(0, 20)}..."
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'cashier-intro', label: '👩‍💼 Kasir Halo' },
                    { id: 'qr-focus', label: '📱 Fokus QR' },
                    { id: 'reward-show', label: '🎁 Show Reward' },
                    { id: 'flyer-only', label: '📄 Brosur Poster' }
                  ].map(vMode => (
                    <button
                      key={vMode.id}
                      onClick={() => handleVisualModeChange(seg.id, vMode.id as any)}
                      className={`text-[9.5px] font-medium py-1.5 px-2 rounded-lg text-center transition-colors ${
                        seg.visualMode === vMode.id
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {vMode.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950/20 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-white">💡 Tips & Trik Kampanye DKR:</p>
            <p>1. Gunakan <b>Fokus QR</b> di bagian penutup belanja agar pelanggan langsung memegang HP mereka.</p>
            <p>2. Transisi ke <b>Show Reward</b> meningkatkan ketertarikan pembeli terhadap produk gratis yang mereka dapatkan.</p>
          </div>
        </div>
      )}

    </div>
  );
};
