import React, { useState } from 'react';
import { ThemeColor } from '../types';

export const THEME_COLORS: ThemeColor[] = [
  { hex: '#ff0033', name: 'Neon Red', rgb: [255, 0, 51] },
  { hex: '#00e5ff', name: 'Cyber Cyan', rgb: [0, 229, 255] },
  { hex: '#00cc55', name: 'Matrix Green', rgb: [0, 204, 85] },
  { hex: '#b000ff', name: 'Neon Purple', rgb: [176, 0, 255] },
  { hex: '#ff5500', name: 'Solar Orange', rgb: [255, 85, 0] },
  { hex: '#0055ff', name: 'Electric Blue', rgb: [0, 85, 255] },
];

interface ThemeSelectorProps {
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Theme Button */}
      <button
        id="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Cyber Theme Color"
        className="fixed right-4 bottom-24 w-11 h-11 rounded-xl bg-[#07080f]/90 border border-[var(--brda)] flex items-center justify-center z-50 shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
        style={{
          boxShadow: `0 0 20px var(--ad), 0 8px 32px rgba(0,0,0,0.6)`,
        }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: currentTheme.hex,
            boxShadow: `0 0 10px ${currentTheme.hex}`,
          }}
        />
      </button>

      {/* Floating Theme Panel */}
      {isOpen && (
        <div
          id="theme-panel"
          className="fixed right-16 bottom-24 bg-[#05060c]/98 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-2.5 z-50 backdrop-blur-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            boxShadow: `0 0 40px rgba(0,0,0,0.9), 0 0 20px var(--ad)`,
          }}
        >
          <span className="text-[0.45rem] font-mono-tech tracking-[2px] text-[#8888aa] uppercase mb-1">
            COLOR
          </span>
          {THEME_COLORS.map((theme) => {
            const isSelected = currentTheme.hex === theme.hex;
            return (
              <button
                key={theme.hex}
                onClick={() => {
                  onSelectTheme(theme);
                  setIsOpen(false);
                }}
                title={theme.name}
                className={`w-6 h-6 rounded-full transition-all duration-300 relative flex items-center justify-center ${
                  isSelected ? 'scale-125 ring-2 ring-white/90 shadow-lg' : 'hover:scale-115 opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: theme.hex,
                  boxShadow: isSelected ? `0 0 14px ${theme.hex}` : 'none',
                }}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
