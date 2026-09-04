import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Check if user disabled preloader in settings
    const isDisabled = localStorage.getItem('ffx_hide_preloader') === 'true';
    if (isDisabled) {
      onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 18 + 7);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFading(true);
            setTimeout(onComplete, 400);
          }, 200);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  const rawTitle = 'D. XIF4T';

  return (
    <div
      id="preloader-overlay"
      className={`fixed inset-0 bg-[#030407] z-[99999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="font-mono-tech text-[0.65rem] tracking-[6px] text-[var(--a)] uppercase mb-5 animate-pulse">
        // SYSTEM INITIALIZING
      </div>

      <div className="font-orbitron text-4xl md:text-5xl font-black tracking-[8px] text-white uppercase flex items-center gap-1 mb-8">
        {rawTitle.split('').map((char, i) => (
          <span
            key={i}
            className={`inline-block ${
              i === Math.floor(rawTitle.length / 2)
                ? 'text-[var(--a)] drop-shadow-[0_0_20px_var(--a)]'
                : 'text-white'
            }`}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Progress Track */}
      <div className="w-60 h-[2px] bg-white/10 overflow-hidden relative rounded-full">
        <div
          className="h-full bg-gradient-to-r from-transparent via-[var(--a)] to-white transition-all duration-150 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 15px var(--a)',
          }}
        />
      </div>

      <div className="font-mono-tech text-xs tracking-[3px] text-[var(--a)] mt-4">
        {progress}%
      </div>
    </div>
  );
};
