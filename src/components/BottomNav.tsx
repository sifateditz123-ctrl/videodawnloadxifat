import React from 'react';
import { Home, Layers, Settings } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'platforms', label: 'PLATFORMS', icon: Layers },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#030407]/95 border-t border-white/5 py-2.5 px-4 flex justify-around items-center z-40 backdrop-blur-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200 active:scale-95 ${
              isActive ? 'text-[var(--a)]' : 'text-[#8888aa] hover:text-white'
            }`}
          >
            <Icon
              size={20}
              className={`transition-transform duration-200 ${
                isActive ? 'scale-110 drop-shadow-[0_0_8px_var(--a)]' : ''
              }`}
            />
            <span className="font-mono-tech text-[0.58rem] tracking-[1.5px] font-semibold">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
