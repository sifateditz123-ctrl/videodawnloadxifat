import React from 'react';
import { Video, Music, Image as ImageIcon, Layers, ExternalLink } from 'lucide-react';

interface PlatformsTabProps {
  onSelectPlatform: (platform: string) => void;
}

export const PlatformsTab: React.FC<PlatformsTabProps> = ({ onSelectPlatform }) => {
  return (
    <div className="space-y-3">
      {/* Platforms Grid */}
      <div className="cyber-card">
        <div className="font-mono-tech text-xs text-[var(--a)] tracking-[4px] uppercase mb-3 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-[var(--a)]" /> SUPPORTED PLATFORMS
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* YouTube */}
          <div
            onClick={() => onSelectPlatform('youtube')}
            className="p-4 rounded-xl border border-red-500/30 bg-red-950/10 hover:bg-red-950/20 transition-all cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:scale-105 transition-transform">
              <i className="ti ti-brand-youtube text-2xl"></i>
            </div>
            <div className="font-orbitron font-bold text-sm tracking-wider text-white">
              YOUTUBE
            </div>
            <div className="font-mono-tech text-[0.62rem] text-red-400 mt-1">
              Videos · Shorts · MP3
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[0.55rem] font-mono-tech bg-red-500/20 text-red-300 border border-red-500/30">
              2K & 1080P ACTIVE
            </span>
          </div>

          {/* TikTok */}
          <div
            onClick={() => onSelectPlatform('tiktok')}
            className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/20 transition-all cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2.5 shadow-[0_0_15px_rgba(6,182,212,0.2)] group-hover:scale-105 transition-transform">
              <i className="ti ti-brand-tiktok text-2xl"></i>
            </div>
            <div className="font-orbitron font-bold text-sm tracking-wider text-white">
              TIKTOK
            </div>
            <div className="font-mono-tech text-[0.62rem] text-cyan-400 mt-1">
              No Watermark · Slides
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[0.55rem] font-mono-tech bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              FAST ENGINE
            </span>
          </div>

          {/* Facebook */}
          <div
            onClick={() => onSelectPlatform('facebook')}
            className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/10 hover:bg-blue-950/20 transition-all cursor-pointer text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2.5 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-105 transition-transform">
              <i className="ti ti-brand-facebook text-2xl"></i>
            </div>
            <div className="font-orbitron font-bold text-sm tracking-wider text-white">
              FACEBOOK
            </div>
            <div className="font-mono-tech text-[0.62rem] text-blue-400 mt-1">
              Watch · Reels · HD
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[0.55rem] font-mono-tech bg-blue-500/20 text-blue-300 border border-blue-500/30">
              DIRECT HD MP4
            </span>
          </div>
        </div>
      </div>

      {/* Media Formats Breakdown */}
      <div className="cyber-card">
        <div className="font-mono-tech text-xs text-[var(--a)] tracking-[4px] uppercase mb-3 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-[var(--a)]" /> MEDIA OUTPUT FORMATS
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
            <Video size={18} className="text-[var(--a)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-orbitron text-xs font-bold text-white">2K & 1080p Video</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">Ultra HD & Full HD MP4</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
            <Music size={18} className="text-[var(--a)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-orbitron text-xs font-bold text-white">HQ Audio (MP3)</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">Original high-bitrate track</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
            <ImageIcon size={18} className="text-[var(--a)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-orbitron text-xs font-bold text-white">Photo Carousel</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">Individual HD JPG slides</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
            <Layers size={18} className="text-[var(--a)] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-orbitron text-xs font-bold text-white">Pure Quality</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">Zero re-compression loss</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Steps */}
      <div className="cyber-card">
        <div className="font-mono-tech text-xs text-[var(--a)] tracking-[4px] uppercase mb-4 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-[var(--a)]" /> 3-STEP QUICK DOWNLOAD
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--a)] text-white font-orbitron text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_var(--ab)]">
              1
            </div>
            <div>
              <div className="font-orbitron text-xs font-bold text-white">Copy Video Link</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">
                Open YouTube, TikTok, or Facebook and copy the share link of any video or short.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--a)] text-white font-orbitron text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_var(--ab)]">
              2
            </div>
            <div>
              <div className="font-orbitron text-xs font-bold text-white">Paste URL & Click Download</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">
                Paste the link in the input box on the Home tab. Our server fetches the direct HD links.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--a)] text-white font-orbitron text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_var(--ab)]">
              3
            </div>
            <div>
              <div className="font-orbitron text-xs font-bold text-white">Save to Device</div>
              <div className="font-rajdhani text-xs text-[#8888aa]">
                Select your preferred format (HD MP4, Audio MP3, or Slides) to download immediately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
