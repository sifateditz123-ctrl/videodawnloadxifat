import React, { useState, useEffect } from 'react';
import { ChevronDown, Sliders, HelpCircle, Palette, ShieldCheck, Key, CheckCircle, Trash2 } from 'lucide-react';
import { ThemeColor } from '../types';
import { THEME_COLORS } from './ThemeSelector';

interface SettingsFaqTabProps {
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsFaqTab: React.FC<SettingsFaqTabProps> = ({
  currentTheme,
  onSelectTheme,
  onNotify,
}) => {
  const [showPreloader, setShowPreloader] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [hasCookies, setHasCookies] = useState<boolean>(false);
  const [cookieInput, setCookieInput] = useState('');
  const [isSavingCookies, setIsSavingCookies] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem('ffx_hide_preloader') === 'true';
    setShowPreloader(!isHidden);

    // Check cookies status
    fetch('/api/cookies')
      .then((res) => res.json())
      .then((data) => setHasCookies(Boolean(data.exists)))
      .catch(() => {});
  }, []);

  const handleSaveCookies = async () => {
    if (!cookieInput.trim()) {
      onNotify('Please paste cookies content first', 'error');
      return;
    }
    setIsSavingCookies(true);
    try {
      const res = await fetch('/api/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setHasCookies(true);
        setCookieInput('');
        onNotify('YouTube cookies saved successfully! All bot challenges bypassed.', 'success');
      } else {
        onNotify(data.error || 'Failed to save cookies', 'error');
      }
    } catch (e: any) {
      onNotify('Network error saving cookies', 'error');
    } finally {
      setIsSavingCookies(false);
    }
  };

  const handleDeleteCookies = async () => {
    try {
      await fetch('/api/cookies', { method: 'DELETE' });
      setHasCookies(false);
      onNotify('Custom YouTube cookies deleted', 'info');
    } catch {
      onNotify('Failed to delete cookies', 'error');
    }
  };

  const handleTogglePreloader = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowPreloader(checked);
    if (checked) {
      localStorage.removeItem('ffx_hide_preloader');
      onNotify('Loading screen will show on next refresh');
    } else {
      localStorage.setItem('ffx_hide_preloader', 'true');
      onNotify('Loading screen disabled for faster access');
    }
  };

  const faqs = [
    {
      q: 'How does D. XIF4T fix YouTube "Sign in to confirm you are not a bot" errors?',
      a: 'YouTube frequently flags cloud datacenter servers with bot challenges on copyrighted music tracks or viral videos. D. XIF4T incorporates an automated multi-stage Cloud Stream Gateway: if direct extraction encounters a bot challenge, it automatically routes through our cloud conversion engine to generate full HD MP4 and 320kbps MP3 links with zero interruption.',
    },
    {
      q: 'Is D. XIF4T completely free to use?',
      a: 'Yes! D. XIF4T is 100% free with unlimited downloads. There is no registration, no subscription, and no hidden fees.',
    },
    {
      q: 'Will TikTok videos have watermarks?',
      a: 'No! Our engine automatically bypasses TikTok watermarks and extracts the original clean HD video directly, along with any audio tracks and photo slide images.',
    },
    {
      q: 'Can I download YouTube videos and Shorts?',
      a: 'Yes! We support standard YouTube videos, YouTube Shorts, and YouTube Music links. You can choose between HD 1080p, 720p, 360p MP4 videos or download 320kbps MP3 audio.',
    },
    {
      q: 'Can I download Facebook Watch & Reels?',
      a: 'Yes! Paste any public Facebook video or reel link to get HD and SD direct download options.',
    },
    {
      q: 'Why does a download fail sometimes?',
      a: 'Make sure the post or video is Public. Private accounts or age-restricted videos cannot be downloaded without cookies. Also ensure the link is copied properly.',
    },
    {
      q: 'Where are downloaded videos saved?',
      a: 'Files are saved directly to your device’s default Downloads folder (Files app on mobile, or Downloads folder on PC/Mac).',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Settings Card */}
      <div className="cyber-card">
        <div className="font-mono-tech text-xs text-[var(--a)] tracking-[4px] uppercase mb-4 flex items-center gap-2">
          <Sliders size={15} /> SYSTEM SETTINGS
        </div>

        {/* Preloader Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
          <div>
            <div className="font-rajdhani text-sm font-bold text-white">
              Show Startup Screen
            </div>
            <div className="font-rajdhani text-xs text-[#8888aa]">
              Enable or disable the cyberpunk startup preloader animation
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showPreloader}
              onChange={handleTogglePreloader}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--a)]"></div>
          </label>
        </div>

        {/* Theme Quick Selector */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="font-rajdhani text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Palette size={15} className="text-[var(--a)]" />
            Accent Neon Palette
          </div>
          <div className="font-rajdhani text-xs text-[#8888aa] mb-3">
            Change the glow color across the downloader interface
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {THEME_COLORS.map((t) => {
              const active = currentTheme.hex === t.hex;
              return (
                <button
                  key={t.hex}
                  onClick={() => {
                    onSelectTheme(t);
                    onNotify(`Switched theme to ${t.name}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono-tech flex items-center gap-2 transition-all ${
                    active
                      ? 'border-white bg-white/10 text-white shadow-[0_0_10px_var(--ad)]'
                      : 'border-white/10 text-[#8888aa] hover:text-white'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: t.hex, boxShadow: `0 0 6px ${t.hex}` }}
                  />
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* YouTube Cloud Stream & Bot Protection Settings */}
      <div className="cyber-card">
        <div className="font-mono-tech text-xs text-[var(--a)] tracking-[4px] uppercase mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} /> YOUTUBE ENGINE & BOT BYPASS
          </div>
          <span className="px-2 py-0.5 rounded text-[0.6rem] font-mono-tech border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 flex items-center gap-1">
            <CheckCircle size={10} /> Cloud Gateway Active
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
          <div className="font-rajdhani text-sm font-bold text-white mb-1 flex items-center gap-2">
            <Key size={14} className="text-[var(--a)]" />
            Custom YouTube Session Cookies (Optional)
          </div>
          <p className="font-rajdhani text-xs text-[#8888aa] leading-relaxed mb-3">
            Our <strong>Cloud Stream Gateway</strong> already automatically bypasses YouTube bot detection. If you wish to download private or age-restricted videos, you can optionally paste your YouTube cookies here (Netscape format / cookies.txt).
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className="font-mono-tech text-[0.65rem] text-[#8888aa]">
              Current Status:{' '}
              {hasCookies ? (
                <span className="text-emerald-400 font-bold">Custom Cookies Configured</span>
              ) : (
                <span className="text-cyan-400">Using Automatic Cloud Stream Gateway</span>
              )}
            </span>

            {hasCookies && (
              <button
                type="button"
                onClick={handleDeleteCookies}
                className="px-2.5 py-1 rounded-lg text-[0.65rem] font-mono-tech border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={11} /> Remove Cookies
              </button>
            )}
          </div>

          <textarea
            value={cookieInput}
            onChange={(e) => setCookieInput(e.target.value)}
            placeholder="# Netscape HTTP Cookie File&#10;.youtube.com&#9;TRUE&#9;/&#9;TRUE&#9;1740000000&#9;VISITOR_INFO1_LIVE&#9;..."
            rows={3}
            className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 font-mono-tech text-xs text-white placeholder:text-[#555577] focus:outline-none focus:border-[var(--a)] resize-y mb-2.5"
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono-tech text-[0.6rem] text-[#666688]">
              Tip: Export cookies using Chrome/Firefox extension "Get cookies.txt locally"
            </span>
            <button
              type="button"
              disabled={isSavingCookies || !cookieInput.trim()}
              onClick={handleSaveCookies}
              className="px-3.5 py-1.5 rounded-xl font-orbitron text-xs font-bold text-black bg-[var(--a)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isSavingCookies ? 'Saving...' : 'Save YouTube Cookies'}
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Card */}
      <div className="cyber-card">
        <div className="font-mono-tech text-xs text-[var(--a)] tracking-[4px] uppercase mb-4 flex items-center gap-2">
          <HelpCircle size={15} /> FREQUENTLY ASKED QUESTIONS
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-3.5 flex items-center justify-between gap-3"
                >
                  <span className="font-rajdhani text-sm font-bold text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#8888aa] transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-[var(--a)]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 font-rajdhani text-xs text-[#8888aa] leading-relaxed border-t border-white/5 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
