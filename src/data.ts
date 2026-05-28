import { PromotionalTemplate } from './types';
import cashierAvatar from './assets/images/dkr_cashier_avatar_1779933424123.png';
import loyaltyQrFlyer from './assets/images/dkr_loyalty_qr_flyer_1779933446873.png';

export const templates: PromotionalTemplate[] = [
  {
    id: 'spg-ceria-cerewet',
    title: '📣 SPG Ramah, Ceria & Natural',
    description: 'Naskah ceria, ramah, dan sangat natural layaknya sapaan kasir/SPG toko profesional.',
    segments: [
      {
        id: 'seg-spg-1',
        text: 'Halo Kak! Selamat datang di DKR. Berhenti sebentar yuk, aku punya kabar gembira yang spesial banget dan gak boleh dilewatkan begitu saja!',
        duration: 7,
        visualMode: 'cashier-intro',
        highlights: ['Selamat datang di DKR', 'kabar gembira', 'spesial banget']
      },
      {
        id: 'seg-spg-2',
        text: 'Hari ini belanja di DKR bisa dapet produk gratisan loh! Iya, beneran gratis tanpa biaya tambahan, langsung bisa ditukarkan pas Kakak belanja berikutnya ya!',
        duration: 6,
        visualMode: 'cashier-intro',
        highlights: ['produk gratisan', 'beneran gratis', 'belanja berikutnya ya!']
      },
      {
        id: 'seg-spg-3',
        text: 'Caranya beneran gampang banget! Cukup keluarin HP Kakak sekarang juga, buka kamera, terus langsung scan QR Code di sebelah aku ini!',
        duration: 7,
        visualMode: 'qr-focus',
        highlights: ['gampang banget!', 'keluarin HP Kakak', 'scan QR Code']
      },
      {
        id: 'seg-spg-4',
        text: 'Nggak usah nunggu lama, Kakak bakal otomatis gabung ke program loyalitas DKR, dapet poin melimpah, dan bebas pilih camilan atau minuman segar gratis!',
        duration: 7,
        visualMode: 'reward-show',
        highlights: ['program loyalitas DKR', 'camilan atau minuman segar gratis']
      },
      {
        id: 'seg-spg-5',
        text: 'Seru banget, kan? Makanya yuk scan sekarang juga, jangan ditunda-tunda ya Kak biar gak kelupaan dan bisa langsung nikmatin untungnya!',
        duration: 7,
        visualMode: 'flyer-only',
        highlights: ['scan sekarang juga', 'jangan ditunda-tunda', 'langsung nikmatin untungnya!']
      }
    ]
  },
  {
    id: 'standard-dkr',
    title: 'Program Loyalitas DKR - Standar',
    description: 'Video ajakan umum dengan salam ramah, instruksi scan, dan janji reward produk gratis.',
    segments: [
      {
        id: 'seg-1',
        text: 'Halo Sahabat DKR! Mau belanjaan kamu berikutnya jadi lebih seru dan berlimpah hadiah?',
        duration: 5,
        visualMode: 'cashier-intro',
        highlights: ['Halo Sahabat DKR!', 'berlimpah hadiah?']
      },
      {
        id: 'seg-2',
        text: 'Yuk, gabung dengan Program Loyalitas DKR sekarang juga! Caranya gampang banget loh.',
        duration: 5,
        visualMode: 'cashier-intro',
        highlights: ['Program Loyalitas DKR', 'gampang banget']
      },
      {
        id: 'seg-3',
        text: 'Cukup ambil HP kamu, lalu scan QR Code yang ada di depan kasir ini sekarang.',
        duration: 6,
        visualMode: 'qr-focus',
        highlights: ['scan QR Code', 'depan kasir']
      },
      {
        id: 'seg-4',
        text: 'Dapatkan langsung poin instan dan dapatkan reward produk pilihan gratis untuk transaksi berikutnya!',
        duration: 6,
        visualMode: 'reward-show',
        highlights: ['produk pilihan gratis', 'transaksi berikutnya!']
      },
      {
        id: 'seg-5',
        text: 'Tunggu apa lagi? Scan dan mulai kumpulkan reward kamu sekarang juga hanya di DKR!',
        duration: 5,
        visualMode: 'flyer-only',
        highlights: ['Scan', 'hanya di DKR!']
      }
    ]
  },
  {
    id: 'free-drinks-promo',
    title: 'Kopi & Minuman Gratis Spesial',
    description: 'Menargetkan pecinta minuman segar dengan reward produk kopi/minuman instan gratis.',
    segments: [
      {
        id: 'seg-1',
        text: 'Hai Kak! Capek habis beraktivitas? Kita punya yang seger-seger nih buat kamu secara gratis!',
        duration: 5,
        visualMode: 'cashier-intro',
        highlights: ['seger-seger', 'secara gratis!']
      },
      {
        id: 'seg-2',
        text: 'Kami mengundang kamu untuk menjadi member eksklusif di Program Loyalitas DKR.',
        duration: 5,
        visualMode: 'cashier-intro',
        highlights: ['member eksklusif', 'Program Loyalitas DKR']
      },
      {
        id: 'seg-3',
        text: 'Caranya cuma tinggal scan QR Code di samping ini dan daftarkan nomor telepon kamu.',
        duration: 5,
        visualMode: 'qr-focus',
        highlights: ['scan QR Code', 'daftarkan nomor']
      },
      {
        id: 'seg-4',
        text: 'Langsung klaim kupon minuman segar gratis untuk transaksi belanja kamu selanjutnya!',
        duration: 6,
        visualMode: 'reward-show',
        highlights: ['minuman segar gratis', 'belanja kamu selanjutnya!']
      },
      {
        id: 'seg-5',
        text: 'Nikmati juga keuntungan diskon ekstra setiap hari. Scan sekarang ya, ditunggu Kak!',
        duration: 5,
        visualMode: 'flyer-only',
        highlights: ['diskon ekstra', 'Scan sekarang']
      }
    ]
  },
  {
    id: 'quick-short-dkr',
    title: 'Shorts / TikTok Kilat (15 Detik)',
    description: 'Sangat cocok untuk retensi atensi instan di TikTok, Reels, atau YouTube Shorts.',
    segments: [
      {
        id: 'seg-1',
        text: 'Kabar gembira buat kamu! Sekarang belanja di DKR bisa dapet produk gratis, loh!',
        duration: 4,
        visualMode: 'cashier-intro',
        highlights: ['produk gratis', 'belanja di DKR']
      },
      {
        id: 'seg-2',
        text: 'Buruan gabung ke Program Loyalitas DKR dengan scan QR Code ini sekarang!',
        duration: 5,
        visualMode: 'qr-focus',
        highlights: ['Program Loyalitas DKR', 'scan QR Code']
      },
      {
        id: 'seg-3',
        text: 'Transaksi berikutnya langsung gratis produk favorit kamu. Yuk, scan sekarang juga!',
        duration: 6,
        visualMode: 'reward-show',
        highlights: ['gratis produk favorit', 'scan sekarang juga!']
      }
    ]
  }
];

export const defaultImages = {
  cashier: cashierAvatar,
  flyer: loyaltyQrFlyer
};

export const sampleProducts = [
  'Teh Botol Sosro Dingin',
  'Kopi Susu Gula Aren',
  'Indomie Goreng Cup',
  'Camilan Keripik Singkong DKR',
  'Roti Manis Cokelat',
  'Es Krim Vanilla Cone'
];
