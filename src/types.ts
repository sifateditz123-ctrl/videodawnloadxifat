export interface DownloadOption {
  label: string;
  quality: string;
  ext: string;
  type: 'video' | 'audio';
  url: string;
  proxyUrl: string;
  size?: string;
}

export interface SlideImage {
  index: number;
  url: string;
  proxyUrl: string;
}

export interface ExtractedMedia {
  platform: 'youtube' | 'tiktok' | 'facebook' | 'unknown';
  id: string;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  type: 'video' | 'slideshow';
  downloads: DownloadOption[];
  images?: SlideImage[];
  botBypassed?: boolean;
  notice?: string;
  backupLinks?: Array<{ label: string; url: string }>;
}

export interface ThemeColor {
  hex: string;
  name: string;
  rgb: [number, number, number];
}

export type TabType = 'home' | 'platforms' | 'settings';

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
