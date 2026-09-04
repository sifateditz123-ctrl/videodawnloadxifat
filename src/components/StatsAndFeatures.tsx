import React from 'react';
import { ShieldCheck, Smartphone, Infinity, Zap } from 'lucide-react';

export const StatsAndFeatures: React.FC = () => {
  return (
    <div className="space-y-3 mb-4">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3.5 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--a)] to-transparent opacity-50" />
          <div className="font-orbitron font-black text-xl text-white tracking-wider">
            <span className="text-[var(--a)]">2K</span> 1080P
          </div>
          <div className="font-mono-tech text-[0.58rem] text-[#8888aa] tracking-[2px] uppercase mt-1">
            Ultra HD Quality
          </div>
        </div>

        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3.5 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--a)] to-transparent opacity-50" />
          <div className="font-orbitron font-black text-xl text-white tracking-wider">
            <span className="text-[var(--a)]">0</span> LOGO
          </div>
          <div className="font-mono-tech text-[0.58rem] text-[#8888aa] tracking-[2px] uppercase mt-1">
            Zero Watermark
          </div>
        </div>

        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3.5 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--a)] to-transparent opacity-50" />
          <div className="font-orbitron font-black text-xl text-white tracking-wider">
            FREE
          </div>
          <div className="font-mono-tech text-[0.58rem] text-[#8888aa] tracking-[2px] uppercase mt-1">
            Always & Forever
          </div>
        </div>

        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3.5 text-center relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--a)] to-transparent opacity-50" />
          <div className="font-orbitron font-black text-xl text-white tracking-wider">
            HIGH
          </div>
          <div className="font-mono-tech text-[0.58rem] text-[#8888aa] tracking-[2px] uppercase mt-1">
            Speed Server
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-[var(--a)] mt-0.5 flex-shrink-0" />
          <div className="font-rajdhani text-xs font-semibold text-[#8888aa] leading-tight">
            No registration or login needed
          </div>
        </div>

        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
          <Smartphone size={18} className="text-[var(--a)] mt-0.5 flex-shrink-0" />
          <div className="font-rajdhani text-xs font-semibold text-[#8888aa] leading-tight">
            Works on Android, iOS & PC
          </div>
        </div>

        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
          <Infinity size={18} className="text-[var(--a)] mt-0.5 flex-shrink-0" />
          <div className="font-rajdhani text-xs font-semibold text-[#8888aa] leading-tight">
            No daily or monthly limits
          </div>
        </div>

        <div className="bg-[#07080f] border border-white/5 rounded-xl p-3 flex items-start gap-2.5">
          <Zap size={18} className="text-[var(--a)] mt-0.5 flex-shrink-0" />
          <div className="font-rajdhani text-xs font-semibold text-[#8888aa] leading-tight">
            Lightning fast direct download
          </div>
        </div>
      </div>
    </div>
  );
};
