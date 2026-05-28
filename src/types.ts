export interface ScriptSegment {
  id: string;
  text: string; // Full text of the segment
  duration: number; // Approximate duration in seconds for progress bar
  visualMode: 'cashier-intro' | 'qr-focus' | 'reward-show' | 'flyer-only'; // Camera state
  highlights: string[]; // Key words to highlight visually
}

export interface VideoConfig {
  merchantName: string;
  cashierName: string;
  rewardProduct: string;
  qrValue: string;
  voicePitch: number; // 0.5 to 2
  voiceRate: number; // 0.5 to 2
  selectedVoiceName: string;
  selectedTemplateId: string;
  backgroundColor: string;
  accentColor: string;
  captionStyle: 'tiktok-yellow' | 'modern-white' | 'bold-caps' | 'gradient-bg';
  cameraOverlay: boolean; // Enables live camcorder vintage UI borders and REC indicators
  ttsEngine: 'browser-native' | 'cloud-google' | 'cloud-elevenlabs';
  elevenlabsApiKey?: string;
  elevenlabsVoiceId?: string;
}

export interface PromotionalTemplate {
  id: string;
  title: string;
  description: string;
  segments: ScriptSegment[];
}
