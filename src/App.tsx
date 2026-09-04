import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { ThemeSelector, THEME_COLORS } from './components/ThemeSelector';
import { MusicPlayer } from './components/MusicPlayer';
import { Preloader } from './components/Preloader';
import { DownloadCard } from './components/DownloadCard';
import { StatsAndFeatures } from './components/StatsAndFeatures';
import { PlatformsTab } from './components/PlatformsTab';
import { SettingsFaqTab } from './components/SettingsFaqTab';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { TabType, ThemeColor, ToastNotification } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(THEME_COLORS[0]);
  const [showPreloader, setShowPreloader] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Apply theme to document root CSS variables
  const applyTheme = useCallback((theme: ThemeColor, save = false) => {
    setCurrentTheme(theme);
    const [r, g, b] = theme.rgb;
    const root = document.documentElement;

    const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    const darken = (v: number) => Math.round(v * 0.75);
    const lighten = (v: number) => Math.round(v + (255 - v) * 0.3);

    const btnDark = `#${toHex(darken(r))}${toHex(darken(g))}${toHex(darken(b))}`;
    const btnLight = `#${toHex(lighten(r))}${toHex(lighten(g))}${toHex(lighten(b))}`;

    root.style.setProperty('--a', theme.hex);
    root.style.setProperty('--ag', `rgba(${r}, ${g}, ${b}, 0.7)`);
    root.style.setProperty('--ad', `rgba(${r}, ${g}, ${b}, 0.1)`);
    root.style.setProperty('--ab', `rgba(${r}, ${g}, ${b}, 0.35)`);
    root.style.setProperty('--brda', `rgba(${r}, ${g}, ${b}, 0.28)`);
    root.style.setProperty('--btn-dark', btnDark);
    root.style.setProperty('--btn-light', btnLight);
    root.style.setProperty('--grid-line', `rgba(${r}, ${g}, ${b}, 0.02)`);

    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', theme.hex);

    if (save) {
      localStorage.setItem('D_XIF4T_theme', theme.hex);
    }
  }, []);

  // Load saved theme on initial mount
  useEffect(() => {
    const savedHex = localStorage.getItem('D_XIF4T_theme');
    if (savedHex) {
      const match = THEME_COLORS.find((t) => t.hex === savedHex);
      if (match) {
        applyTheme(match, false);
      }
    }
  }, [applyTheme]);

  const addToast = (message: string, type: ToastNotification['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  return (
    <div className="relative min-h-screen bg-[#030407] text-[#e8e8f0]">
      {/* Startup Preloader */}
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

      {/* Cyber Ambient Grid & Scanline */}
      <div className="cyber-ambient-bg" />
      <div className="cyber-grid-lines" />
      <div className="cyber-scanline" />

      {/* Particle Canvas Background */}
      <ParticleCanvas accentColor={currentTheme.hex} />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[430px] mx-auto px-3.5 pb-28 pt-2">
        <Navbar title="D. XIF4T" />

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-200">
            <DownloadCard onNotify={addToast} />
            <StatsAndFeatures />
            <footer className="text-center font-mono-tech text-[0.58rem] text-[#44445a] tracking-[3px] mt-4 mb-2">
              © 2026 <span className="text-[var(--a)]">D. XIF4T</span> · FOR PERSONAL USE ONLY
            </footer>
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="animate-in fade-in duration-200">
            <PlatformsTab
              onSelectPlatform={(platform) => {
                setActiveTab('home');
                addToast(`Ready to paste ${platform.toUpperCase()} video URL`, 'info');
              }}
            />
            <footer className="text-center font-mono-tech text-[0.58rem] text-[#44445a] tracking-[3px] mt-4 mb-2">
              © 2026 <span className="text-[var(--a)]">D. XIF4T</span> · FOR PERSONAL USE ONLY
            </footer>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in duration-200">
            <SettingsFaqTab
              currentTheme={currentTheme}
              onSelectTheme={(theme) => applyTheme(theme, true)}
              onNotify={(msg) => addToast(msg, 'info')}
            />
            <footer className="text-center font-mono-tech text-[0.58rem] text-[#44445a] tracking-[3px] mt-4 mb-2">
              © 2026 <span className="text-[var(--a)]">D. XIF4T</span> · FOR PERSONAL USE ONLY
            </footer>
          </div>
        )}
      </div>

      {/* Floating Cyber Theme Button & Selector */}
      <ThemeSelector
        currentTheme={currentTheme}
        onSelectTheme={(theme) => {
          applyTheme(theme, true);
          addToast(`Theme color updated to ${theme.name}`, 'success');
        }}
      />

      {/* Music Player Notification Bar */}
      <MusicPlayer />

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={activeTab} onSelectTab={setActiveTab} />

      {/* Cyber Toast Alerts */}
      <Toast toasts={toasts} />
    </div>
  );
}
