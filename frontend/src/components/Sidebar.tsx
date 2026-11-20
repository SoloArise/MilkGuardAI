import React from 'react';
import { Page } from '../types';
import {
  IconGrid,
  IconFlask,
  IconClock,
  IconBarChart,
  IconCpu,
  IconSettings,
  IconMilkDrop,
  IconChevron,
  IconShield,
  IconMore,
  IconClose,
  IconLayers,
} from './Icons';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  historyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  historyCount = 24,
}) => {
  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: IconGrid },
    { id: 'analysis' as Page, label: 'Milk Quality Analysis', icon: IconFlask },
    { id: 'history' as Page, label: 'Prediction History', icon: IconClock, badge: historyCount },
    { id: 'analytics' as Page, label: 'Analytics & Reports', icon: IconBarChart },
    { id: 'training' as Page, label: 'Model Training & Evaluation', icon: IconLayers },
    { id: 'about' as Page, label: 'About the Model', icon: IconCpu },
  ];

  const prefItems = [
    { id: 'settings' as Page, label: 'Settings', icon: IconSettings },
  ];

  const handleNavClick = (page: Page) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-[#E4EAE6] flex flex-col z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-[76px] px-6 border-b border-[#E4EAE6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#216B45] flex items-center justify-center text-white shadow-sm shadow-[#216B45]/20">
              <IconMilkDrop size={22} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-[#26332B] leading-none">
                MilkGuard <span className="text-[#216B45]">AI</span>
              </div>
              <div className="text-[11px] text-[#6E7C73] font-medium mt-0.5">
                Intelligent Quality System
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-[#6E7C73] hover:text-[#26332B] lg:hidden rounded-lg hover:bg-[#F8FAF8]"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Workspace Card */}
        <div className="p-4">
          <div className="p-2.5 rounded-xl border border-[#E4EAE6] bg-[#F8FAF8] flex items-center justify-between hover:border-[#D1DBD5] transition-colors cursor-pointer group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E8F5EC] text-[#216B45] font-bold text-xs flex items-center justify-center">
                MG
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#6E7C73] uppercase tracking-wider">
                  WORKSPACE
                </div>
                <div className="text-xs font-semibold text-[#26332B] group-hover:text-[#216B45] transition-colors">
                  Green Valley Dairy
                </div>
              </div>
            </div>
            <IconChevron direction="down" className="text-[#6E7C73] group-hover:text-[#26332B]" />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 space-y-6">
          {/* Main Menu */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-[#6E7C73] uppercase">
              MAIN MENU
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-[#E8F5EC] text-[#216B45]'
                        : 'text-[#6E7C73] hover:text-[#26332B] hover:bg-[#F8FAF8]'
                    }`}
                  >
                    {/* Active vertical indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#216B45] rounded-r-full" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={isActive ? 'text-[#216B45]' : 'text-[#6E7C73]'} size={18} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#216B45] text-white'
                            : 'bg-[#F8FAF8] text-[#6E7C73] border border-[#E4EAE6]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Preferences */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-[#6E7C73] uppercase">
              PREFERENCES
            </div>
            <nav className="space-y-1">
              {prefItems.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? 'bg-[#E8F5EC] text-[#216B45]'
                        : 'text-[#6E7C73] hover:text-[#26332B] hover:bg-[#F8FAF8]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#216B45] rounded-r-full" />
                    )}
                    <Icon className={isActive ? 'text-[#216B45]' : 'text-[#6E7C73]'} size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#6E7C73] hover:text-[#26332B] hover:bg-[#F8FAF8] cursor-pointer">
                <IconShield size={18} className="text-[#6E7C73]" />
                <span>Help & Support</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-3 border-t border-[#E4EAE6]">
          <div className="p-2 rounded-xl flex items-center justify-between hover:bg-[#F8FAF8] transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#216B45] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[#E8F5EC]">
                AR
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#26332B] leading-snug">
                  Alex Morgan
                </div>
                <div className="text-[11px] text-[#6E7C73] leading-none">
                  Quality Inspector
                </div>
              </div>
            </div>
            <IconMore size={18} className="text-[#6E7C73] hover:text-[#26332B]" />
          </div>
        </div>
      </aside>
    </>
  );
};

