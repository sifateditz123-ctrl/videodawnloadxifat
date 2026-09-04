import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';

interface MusicPlayerProps {
  musicSrc?: string;
  coverSrc?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  musicSrc = 'https://files.catbox.moe/x2c0ae.mp3',
  coverSrc = 'https://i.ibb.co.com/qFY20Cdb/20260904-155729.png',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(musicSrc);
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    // Reveal music bar after page loads
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 1800);

    return () => {
      clearTimeout(timer);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [musicSrc, isDismissed]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // User interaction required on some browsers
        });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
      id="music-notification"
      className="fixed bottom-20 left-3 right-3 max-w-[420px] mx-auto z-40 animate-in slide-in-from-bottom duration-300 pointer-events-auto"
    >
      <div className="relative bg-[#121216]/95 border border-white/10 rounded-2xl p-3 flex items-center gap-3 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--ad)] to-transparent pointer-events-none" />

        {/* Album Art */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg relative z-10 group">
          <img
            src={coverSrc}
            alt="Track Artwork"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://api.dicebear.com/7.x/identicon/svg?seed=music';
            }}
          />
          <div className="absolute inset-0 rounded-xl border border-[var(--ab)] pointer-events-none" />
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0 z-10">
          <div className="font-mono-tech text-[0.48rem] tracking-[2px] text-white/40 uppercase">
            NOW PLAYING
          </div>
          <div className="font-orbitron text-xs font-bold text-white tracking-wider truncate">
            ♫ CYBER BEATS
          </div>
          <div className="font-mono-tech text-[0.55rem] text-white/50 truncate">
            {isPlaying ? 'Streaming high quality audio...' : 'Tap ▶ to play background track'}
          </div>
        </div>

        {/* Live Equalizer Waveform */}
        <div className="flex items-center gap-[3px] h-5 z-10 px-1">
          {[12, 20, 14, 18, 10].map((h, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-[var(--a)] transition-all"
              style={{
                height: isPlaying ? `${Math.max(4, (h * (i % 2 === 0 ? 0.9 : 1.2)))}px` : '4px',
                animation: isPlaying
                  ? `waveBar ${0.6 + i * 0.15}s ease-in-out infinite alternate`
                  : 'none',
                boxShadow: '0 0 4px var(--a)',
              }}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
            className="w-9 h-9 rounded-full bg-[var(--a)] text-white flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 hover:scale-105"
            style={{ boxShadow: '0 0 15px var(--ab)' }}
          >
            {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
          </button>

          <button
            onClick={handleClose}
            aria-label="Dismiss music player"
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={12} />
          </button>
        </div>

        {/* Bottom Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-[2.5px] bg-gradient-to-r from-[var(--a)] to-[var(--btn-light)] transition-all duration-300 ease-linear rounded-bl-2xl"
          style={{ width: `${progress}%`, boxShadow: '0 0 8px var(--a)' }}
        />
      </div>
    </div>
  );
};
