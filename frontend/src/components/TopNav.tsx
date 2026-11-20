import React from 'react';
import { Page } from '../types';
import { IconSearch, IconBell, IconMenu, IconSun, IconMoon } from './Icons';

interface TopNavProps {
  currentPage: Page;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  darkMode = false,
  onToggleDarkMode,
}) => {
  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    analysis: 'Milk Quality Analysis',
    history: 'Prediction History',
    analytics: 'Analytics & Reports',
    training: 'Model Training & Evaluation',
    about: 'About the Model',
    settings: 'Settings',
  };

  return (
    <header className="sticky top-0 h-[76px] bg-[#F8FAF8]/90 backdrop-blur-md border-b border-[#E4EAE6] px-6 flex items-center justify-between z-30 transition-all">
      {/* Left: Workspace & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-[#6E7C73] hover:text-[#26332B] lg:hidden rounded-lg hover:bg-white"
        >
          <IconMenu size={22} />
        </button>
        <div>
          <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider leading-none">
            GREEN VALLEY DAIRY
          </div>
          <h1 className="text-xl font-bold text-[#26332B] tracking-tight mt-0.5 leading-snug">
            {pageTitles[currentPage]}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <IconSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E7C73]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search samples..."
            className="w-full bg-white border border-[#E4EAE6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#26332B] placeholder-[#6E7C73] focus:outline-none focus:border-[#216B45] focus:ring-1 focus:ring-[#216B45] transition-all"
          />
        </div>

        {/* Dark Mode Theme Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl border border-[#E4EAE6] bg-white text-[#6E7C73] hover:text-[#216B45] hover:border-[#D1DBD5] transition-colors"
          >
            {darkMode ? (
              <IconSun size={18} className="text-[#A5D6A7]" />
            ) : (
              <IconMoon size={18} className="text-[#26332B]" />
            )}
          </button>
        )}

        {/* Notifications Button */}
        <button className="relative p-2.5 rounded-xl border border-[#E4EAE6] bg-white text-[#6E7C73] hover:text-[#26332B] hover:border-[#D1DBD5] transition-colors">
          <IconBell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#216B45] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-xl bg-[#216B45] text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-sm cursor-pointer hover:opacity-95 transition-opacity">
          AR
        </div>
      </div>
    </header>
  );
};

