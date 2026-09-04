import React, { useState } from 'react';
import {
  Download,
  Link as LinkIcon,
  Clipboard,
  X,
  AlertCircle,
  CheckCircle2,
  Video,
  Music,
  Image as ImageIcon,
  Sparkles,
  ArrowDownCircle,
  ExternalLink,
} from 'lucide-react';
import { ExtractedMedia, ToastNotification } from '../types';

interface DownloadCardProps {
  onNotify: (msg: string, type?: ToastNotification['type']) => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({ onNotify }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedMedia | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'youtube' | 'tiktok' | 'facebook'>('all');

  const sampleLinks = {
    youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tiktok: 'https://www.tiktok.com/@tiktok/video/7106594312292453675',
    facebook: 'https://www.facebook.com/watch/?v=10153231379946729',
  };

  const handlePasteOrClear = async () => {
    if (url.trim()) {
      setUrl('');
      setError(null);
      onNotify('Cleared input field', 'info');
    } else {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setError(null);
          onNotify('Link pasted from clipboard', 'success');
        }
      } catch (err) {
        onNotify('Clipboard permission needed or paste manually', 'info');
      }
    }
  };

  const setSample = (platform: 'youtube' | 'tiktok' | 'facebook') => {
    setUrl(sampleLinks[platform]);
    setError(null);
    onNotify(`Loaded ${platform.toUpperCase()} sample link`, 'success');
  };

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError('Please paste a valid YouTube, TikTok, or Facebook video link.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to extract video information.');
      }

      setResult(data);
      onNotify('Media links ready for download!', 'success');
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'Failed to extract media. Make sure the video is public and the link is active.'
      );
      onNotify('Download extraction failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cyber-card">
      {/* Eyebrow Platform Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--a)] animate-pulse" />
          <span className="font-mono-tech text-[0.62rem] text-[var(--a)] uppercase tracking-[2px]">
            YouTube · TikTok (No Watermark) · Facebook
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSample('youtube')}
            className="px-2 py-0.5 rounded text-[0.55rem] font-mono-tech border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            + YT Sample
          </button>
          <button
            type="button"
            onClick={() => setSample('tiktok')}
            className="px-2 py-0.5 rounded text-[0.55rem] font-mono-tech border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors"
          >
            + TT Sample
          </button>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="font-orbitron text-2xl md:text-3xl font-black text-white leading-tight mb-2 tracking-wide">
        HD Media <span className="text-[var(--a)]">Downloader</span>
      </h1>
      <p className="font-rajdhani text-sm text-[#8888aa] mb-4 leading-relaxed">
        Paste any <strong className="text-white">YouTube</strong>, <strong className="text-white">TikTok</strong>, or <strong className="text-white">Facebook</strong> video URL. Download pristine HD video, MP3 audio, and photo carousels with no watermarks.
      </p>

      {/* Input Form */}
      <form onSubmit={handleExtract} className="mb-3">
        <div className="relative mb-3">
          <LinkIcon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a)] pointer-events-none"
          />
          <input
            id="media-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube, TikTok, or Facebook URL here..."
            className="w-full py-3.5 pl-11 pr-24 rounded-xl border border-white/10 bg-white/[0.04] text-white font-rajdhani text-sm outline-none transition-all duration-200 focus:border-[var(--a)] focus:ring-2 focus:ring-[var(--ad)] placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={handlePasteOrClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg border border-[var(--brda)] bg-[var(--ad)] text-[var(--a)] font-mono-tech text-[0.62rem] font-bold tracking-wider flex items-center gap-1 hover:bg-[var(--ab)] transition-colors active:scale-95"
          >
            {url.trim() ? (
              <>
                <X size={12} /> CLEAR
              </>
            ) : (
              <>
                <Clipboard size={12} /> PASTE
              </>
            )}
          </button>
        </div>

        {/* Download Action Button */}
        <button
          id="extract-btn"
          type="submit"
          disabled={isLoading || !url.trim()}
          className="cyber-dl-btn"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>EXTRACTING MEDIA...</span>
            </>
          ) : (
            <>
              <Download size={17} />
              <span>DOWNLOAD NOW</span>
            </>
          )}
        </button>
      </form>

      {/* Loading Status */}
      {isLoading && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 font-rajdhani text-sm text-[#8888aa] mb-4 animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-[var(--ad)] border-t-[var(--a)] animate-spin flex-shrink-0" />
          <span>Bypassing watermarks and querying video servers...</span>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-rajdhani text-sm mb-4">
          <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold mb-0.5">Extraction Notice</div>
            <div className="text-xs text-red-300/80">{error}</div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="mt-4 pt-4 border-t border-white/10 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="font-mono-tech text-[0.62rem] text-emerald-400 tracking-[3px] uppercase">
              DOWNLOAD READY · {result.platform.toUpperCase()}
            </span>
          </div>

          {/* Media Header Preview */}
          {result.botBypassed && (
            <div className="mb-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-rajdhani text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 flex-shrink-0 animate-pulse" />
                <span>
                  <strong>Cloud Stream Gateway Active:</strong> YouTube datacenter bot restriction was bypassed. Direct video and audio conversions ready.
                </span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 mb-4 flex gap-3.5 items-start">
            {result.thumbnail && (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative bg-black">
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
                {result.duration && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono-tech text-[0.55rem]">
                    {result.duration}
                  </span>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-rajdhani font-bold text-sm md:text-base text-white line-clamp-2 mb-1">
                {result.title}
              </h3>
              <p className="font-mono-tech text-xs text-[var(--a)] truncate mb-1">
                @{result.author}
              </p>
              {result.views !== undefined && (
                <div className="font-mono-tech text-[0.6rem] text-[#8888aa]">
                  Views: {result.views.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Photo Slides (if TikTok photo mode) */}
          {result.images && result.images.length > 0 && (
            <div className="mb-4">
              <div className="font-mono-tech text-xs text-[var(--a)] tracking-wider uppercase mb-2 flex items-center gap-2">
                <ImageIcon size={14} /> PHOTO SLIDESHOW ({result.images.length} PHOTOS)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                {result.images.map((img) => (
                  <div
                    key={img.index}
                    className="relative rounded-lg overflow-hidden border border-white/10 bg-black/60 group"
                  >
                    <img
                      src={img.url}
                      alt={`Slide ${img.index}`}
                      className="w-full h-32 object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90 p-2 flex flex-col justify-end">
                      <a
                        href={img.proxyUrl}
                        download={`slide_${img.index}.jpg`}
                        className="px-2 py-1 rounded bg-[var(--a)] text-white font-mono-tech text-[0.6rem] font-bold text-center flex items-center justify-center gap-1 shadow-md hover:opacity-90 active:scale-95"
                      >
                        <Download size={11} /> PHOTO #{img.index}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Buttons List */}
          <div className="space-y-2.5">
            {result.downloads.map((opt, i) => {
              const isVideo = opt.type === 'video';
              const is2K = opt.quality.includes('2K') || opt.label.includes('2K') || opt.quality.includes('1440p');
              const is1080 = opt.quality.includes('1080') || opt.label.includes('1080');

              return (
                <a
                  key={i}
                  href={opt.proxyUrl}
                  download
                  onClick={() => {
                    onNotify(`Starting ${opt.quality} download. Please wait while the high-speed stream connects...`, 'info');
                  }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 group active:scale-[0.99] ${
                    is2K
                      ? 'border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                      : is1080
                      ? 'border-cyan-500/30 bg-cyan-950/15 hover:bg-cyan-950/30 hover:border-cyan-400/50'
                      : 'border-white/10 bg-white/[0.03] hover:bg-[var(--ad)] hover:border-[var(--brda)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        is2K
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : is1080
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : isVideo
                          ? 'bg-[var(--ad)] text-[var(--a)] border border-[var(--brda)]'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                      }`}
                    >
                      {isVideo ? <Video size={20} /> : <Music size={20} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-orbitron font-bold text-xs tracking-wider text-white group-hover:text-[var(--a)] transition-colors truncate">
                          {opt.label}
                        </span>
                        {is2K && (
                          <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-mono-tech font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            2K QHD
                          </span>
                        )}
                        {is1080 && !is2K && (
                          <span className="px-1.5 py-0.2 rounded text-[0.58rem] font-mono-tech font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                            1080P FHD
                          </span>
                        )}
                      </div>
                      <div className="font-mono-tech text-[0.65rem] text-[#8888aa] flex items-center gap-2 mt-0.5">
                        <span className={is2K ? 'text-amber-200/90 font-medium' : is1080 ? 'text-cyan-200/90 font-medium' : ''}>
                          {opt.quality}
                        </span>
                        {opt.size && <span>• {opt.size}</span>}
                        <span>• Fast Direct Download</span>
                      </div>
                    </div>
                  </div>

                  <ArrowDownCircle
                    size={22}
                    className={`flex-shrink-0 ml-2 transition-all group-hover:scale-110 ${
                      is2K
                        ? 'text-amber-400'
                        : is1080
                        ? 'text-cyan-400'
                        : 'text-white/40 group-hover:text-[var(--a)]'
                    }`}
                  />
                </a>
              );
            })}
          </div>

          {/* Backup Mirrors if provided */}
          {result.backupLinks && result.backupLinks.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-mono-tech text-[0.62rem] text-[#8888aa] flex items-center gap-1">
                <ExternalLink size={11} /> Backup Web Mirrors:
              </span>
              <div className="flex items-center gap-2">
                {result.backupLinks.map((mirror, mIdx) => (
                  <a
                    key={mIdx}
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[var(--a)] font-mono-tech text-[0.62rem] flex items-center gap-1 transition-colors"
                  >
                    {mirror.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
