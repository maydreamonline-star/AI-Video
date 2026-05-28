import React, { useRef } from 'react';
import { VideoConfig } from '../types';
import { QrCode, Printer, CheckCircle2, Copy, Percent, Heart, ShoppingBag } from 'lucide-react';

interface PromoStandeeProps {
  config: VideoConfig;
  flyerImage: string;
}

export const PromoStandee: React.FC<PromoStandeeProps> = ({ config, flyerImage }) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Build a temporary print window
      const printWindow = window.open('', '', 'height=800,width=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print DKR Loyalty QR Standee</title>
              <style>
                body {
                  font-family: 'Inter', sans-serif;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: white;
                }
                .flyer-container {
                  width: 100%;
                  max-width: 480px;
                  border: 2px solid #e2e8f0;
                  border-radius: 24px;
                  overflow: hidden;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                  background: white;
                  padding: 24px;
                  box-sizing: border-box;
                }
                .logo-container {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  gap: 6px;
                  margin-bottom: 12px;
                }
                .logo-letter {
                  font-weight: 900;
                  color: white;
                  padding: 4px 10px;
                  border-radius: 6px;
                  font-size: 22px;
                }
                .bg-red { background: #ef4444; }
                .bg-yellow { background: #eab308; color: #0f172a; }
                .bg-blue { background: #2563eb; }
                .program-title {
                  text-align: center;
                  font-size: 24px;
                  font-weight: 800;
                  color: #1e293b;
                  margin: 0 0 24px 0;
                  letter-spacing: -0.5px;
                }
                .qr-wrapper {
                  border: 6px solid #e2e8f0;
                  border-radius: 24px;
                  padding: 16px;
                  background: white;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  margin: 0 auto;
                  max-width: 200px;
                }
                .qr-image {
                  width: 160px;
                  height: 160px;
                  color: #0f172a;
                }
                .reward-banner {
                  background: #fef08a;
                  border: 2px dashed #9a3412;
                  border-radius: 16px;
                  padding: 12px;
                  margin-top: 24px;
                  text-align: center;
                  font-weight: 700;
                  color: #9a3412;
                  font-size: 14px;
                }
                .footer {
                  margin-top: 24px;
                  background: #2563eb;
                  color: white;
                  border-radius: 16px;
                  padding: 12px;
                  text-align: center;
                  font-size: 12px;
                  font-weight: 600;
                }
              </style>
            </head>
            <body>
              <div class="flyer-container">
                <div class="logo-container">
                  <span class="logo-letter bg-red">D</span>
                  <span class="logo-letter bg-yellow">K</span>
                  <span class="logo-letter bg-blue">R</span>
                </div>
                <div class="program-title">Program Loyalitas</div>
                <div class="qr-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="qr-image"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16V21H16"/><path d="M21 12H16"/><path d="M12 21v-4"/><path d="M12 12v-4"/><path d="M3 12h5"/><rect width="2" height="2" x="11" y="11" rx="0.5"/><path d="M12 3v5"/></svg>
                </div>
                <div class="reward-banner">
                  🎁 BONUS KAKAK: ${config.rewardProduct || 'Teh Botol Sosro'} Gratis!
                </div>
                <div class="footer">
                  SCAN & Mulai Hemat Belanja Sekarang di DKR
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-[24px] border border-slate-800 p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-6">
      
      {/* 2D Physics Representation of physical standee */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950/50 p-6 rounded-2xl border border-slate-850 relative overflow-hidden">
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Dekorasi Kasir Toko</span>
        </div>

        {/* 3D Acrylic Standee Holder View */}
        <div className="relative w-56 bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-800 flex flex-col items-center">
          
          {/* Acrylic Glass Highlight Reflex effect */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-t-2xl pointer-events-none z-10" />

          {/* DKR Standee Brand Header */}
          <div className="flex items-center gap-1 mb-2.5 z-10 scale-90">
            <span className="bg-red-500 text-white font-black px-1.5 py-0.5 rounded text-[11px]">D</span>
            <span className="bg-yellow-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[11px]">K</span>
            <span className="bg-blue-600 text-white font-black px-1.5 py-0.5 rounded text-[11px]">R</span>
          </div>

          <h5 className="text-[10px] font-extrabold text-slate-200 tracking-wider text-center uppercase mb-3 text-cyan-400">
            Program Loyalti Kasir
          </h5>

          {/* QR Standee Core Card inside Holder */}
          <div className="bg-white rounded-xl p-2.5 w-full flex flex-col items-center text-slate-900 border border-slate-200 shadow-md">
            <QrCode className="w-24 h-24 text-slate-900" />
            <div className="bg-amber-100 text-amber-900 font-bold text-[8px] py-1 px-2.5 rounded-full mt-2 border border-amber-300">
              Reward Menanti Anda!
            </div>
          </div>

          {/* Table stand holder base simulation */}
          <div className="absolute -bottom-1.5 w-[240px] h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full shadow-lg border-t border-slate-500 z-10" />
        </div>

        {/* Informative tagline in panel */}
        <div className="mt-8 text-center max-w-xs">
          <p className="text-white font-semibold text-xs">Standee Promosi Kasir DKR</p>
          <p className="text-[10px] text-slate-400 mt-1">
            Letakkan di samping mesin pembayaran agar memudahkan kasir Anda memandu pelanggan melakukan scan di tempat.
          </p>
        </div>
      </div>

      {/* Editor & Actions for print material */}
      <div className="flex-1 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>Materi Cetak Pembayaran Kasir</span>
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sinergi video 9:16 di layar tablet kasir dengan cetakan standee kertas sangat efektif meningkatkan angka retensi pendaftaran member loyalitas hingga 300%.
          </p>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Label Reward: <b>{config.rewardProduct || 'Teh Botol Sosro'}</b></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Target Barcode QR: <code className="bg-slate-900 text-yellow-400 px-1 rounded text-[10px]">{config.qrValue}</code></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Slogan Cetak: "Scan di sini, ada Reward untuk Mu"</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Nama Brand: "Merchant Partner DKR"</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Standee DKR Sekarang</span>
          </button>
        </div>
      </div>

      {/* HIDDEN PRINT TARGET */}
      <div style={{ display: 'none' }}>
        <div ref={printAreaRef} id="printable-standee-container">
          <div className="flyer-container" style={{ padding: '30px', border: '5px solid #2563eb', borderRadius: '24px', maxWidth: '400px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <span style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold' }}>D</span>
              <span style={{ background: '#eab308', color: '#0f172a', padding: '6px 12px', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold' }}>K</span>
              <span style={{ background: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '24px', fontWeight: 'bold' }}>R</span>
            </div>
            
            <h1 style={{ textAlign: 'center', fontSize: '22px', color: '#111827', margin: '0 0 10px 0' }}>Program Loyalti Merchant</h1>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#4b5563', margin: '0 0 20px 0' }}>Scan Disini &amp; Dapatkan Produk Gratis Transaksi Berikutnya!</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#111827' }}><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16V21H16"/><path d="M21 12H16"/><path d="M12 21v-4"/><path d="M12 12v-4"/><path d="M3 12h5"/><rect width="2" height="2" x="11" y="11" rx="0.5"/><path d="M12 3v5"/></svg>
            </div>

            <div style={{ background: '#fef08a', color: '#854d0e', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px', border: '2px dashed #ca8a04' }}>
              🎁 GRATIS: {config.rewardProduct || 'Teh Botol Sosro'}!
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '11px', textAlign: 'center', color: '#9ca3af' }}>
              Pindai dengan handphone Anda di dekat meja kasir. Syarat dan ketentuan berlaku.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
