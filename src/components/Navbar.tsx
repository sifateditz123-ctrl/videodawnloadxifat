import React from 'react';

interface NavbarProps {
  title?: string;
  avatarUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'D. XIF4T',
  avatarUrl = 'https://i.ibb.co.com/qFY20Cdb/20260904-155729.png',
}) => {
  const chars = title.split('');
  const midIndex = Math.floor(chars.length / 2);

  return (
    <header className="flex items-center justify-between py-3 mb-4 border-b border-white/5 relative z-10">
      <div className="flex items-center gap-3">
        {/* Profile Avatar Icon */}
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--brda)] bg-[var(--ad)] p-0.5 shadow-[0_0_15px_var(--ad)] flex-shrink-0">
          <img
            src={avatarUrl}
            alt="Logo"
            className="w-full h-full object-cover rounded-[10px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://api.dicebear.com/7.x/bottts/svg?seed=xifat';
            }}
          />
        </div>

        {/* Dynamic Logo Text */}
        <div className="relative">
          <div className="font-orbitron text-lg font-black tracking-[4px] text-white select-none flex items-center">
            {chars.map((ch, idx) => (
              <span
                key={idx}
                className={`logo-char ${idx === midIndex ? 'r font-extrabold' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
          <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[var(--a)] to-transparent mt-0.5 opacity-80" />
        </div>
      </div>

      {/* Status Chip */}
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--ad)] border border-[var(--brda)] shadow-[0_0_10px_var(--ad)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--a)] animate-pulse" />
        <span className="font-mono-tech text-[0.6rem] text-[var(--a)] tracking-[1.5px] font-semibold">
          MEDIA PRO
        </span>
      </div>
    </header>
  );
};
