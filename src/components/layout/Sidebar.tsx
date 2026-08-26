import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  CreditCard,
  Target,
  CalendarDays,
  BarChart3,
  Brain,
  Settings,
  X,
  LogOut,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react';
import { AppPage, useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    page,
    setPage,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    currentProfile,
    logout,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const commandCenterNav = [
    { id: 'overview' as AppPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'income' as AppPage, label: 'Income', icon: Wallet },
    { id: 'transactions' as AppPage, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'plan' as AppPage, label: 'Monthly plan', icon: PieChart },
    { id: 'debt' as AppPage, label: 'Debt center', icon: CreditCard },
    { id: 'goals' as AppPage, label: 'Goals', icon: Target },
    { id: 'calendar' as AppPage, label: 'Bills & calendar', icon: CalendarDays },
    { id: 'reports' as AppPage, label: 'Reports', icon: BarChart3 },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'AM';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = currentProfile?.displayName || 'Alex Morgan';
  const username = currentProfile?.username || 'alex.morgan';

  const navContent = (
    <div className="flex flex-col h-full bg-[#0b0e17] text-[#989db1] border-r border-white/5 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#806cff] to-[#5a42e8] text-white flex items-center justify-center font-black text-lg shadow-lg shadow-[#5a42e8]/30">
            F
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-widest flex items-center gap-1.5">
              FINORA
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#5a42e8]/30 text-[#a998ff] border border-[#5a42e8]/40">
                PRO
              </span>
            </div>
            <div className="text-[8px] font-bold text-[#6f748a] tracking-widest uppercase">
              FINANCIAL OS
            </div>
          </div>
        </div>

        {isMobileDrawerOpen && (
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg text-[#868ba0] hover:text-white hover:bg-white/5 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Section: COMMAND CENTER */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        <div>
          <div className="px-3 pb-2 text-[9px] font-black text-[#5d6278] tracking-widest uppercase">
            COMMAND CENTER
          </div>
          <div className="space-y-1">
            {commandCenterNav.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setPage(item.id);
                    setIsMobileDrawerOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer
                    ${
                      isActive
                        ? 'bg-[#5a42e8]/20 border border-[#5a42e8]/40 text-[#a998ff] font-bold shadow-sm'
                        : 'text-[#989db1] hover:text-[#ffffff] hover:bg-white/[0.045] border border-transparent'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#8f7bff]' : 'text-[#868ba0]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav Section: INTELLIGENCE */}
        <div>
          <div className="px-3 pb-2 text-[9px] font-black text-[#5d6278] tracking-widest uppercase">
            INTELLIGENCE
          </div>
          <button
            onClick={() => {
              setPage('brain');
              setIsMobileDrawerOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left border cursor-pointer
              ${
                page === 'brain'
                  ? 'bg-[#5a42e8]/20 text-[#a998ff] border-[#7f65ff]/40 font-bold shadow-sm'
                  : 'text-[#989db1] hover:text-white hover:bg-white/[0.045] border-white/5'
              }
            `}
          >
            <Brain
              className={`w-4 h-4 ${
                page === 'brain' ? 'text-[#8f7bff]' : 'text-[#868ba0]'
              }`}
            />
            <span>FINORA Brain</span>
          </button>
        </div>
      </div>

      {/* Footer: Settings & Profile Card */}
      <div className="p-3 border-t border-white/5 space-y-2 bg-[#080a11]">
        <button
          onClick={() => {
            setPage('settings');
            setIsMobileDrawerOpen(false);
          }}
          className={`
            w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer
            ${
              page === 'settings'
                ? 'bg-[#5a42e8]/20 border border-[#5a42e8]/40 text-[#a998ff] font-bold shadow-sm'
                : 'text-[#989db1] hover:text-[#ffffff] hover:bg-white/[0.045] border border-transparent'
            }
          `}
        >
          <Settings
            className={`w-4 h-4 ${
              page === 'settings' ? 'text-[#8f7bff]' : 'text-[#868ba0]'
            }`}
          />
          <span>Settings</span>
        </button>

        {/* Profile Card */}
        <div className="relative">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="p-3 rounded-xl bg-white/[0.045] hover:bg-white/[0.08] flex items-center justify-between transition-all cursor-pointer border border-white/5"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#755cf3] to-[#5a42e8] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                {getInitials(displayName)}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-white truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-[#8e8aa9] truncate font-medium">
                  @{username}
                </div>
              </div>
            </div>

            <MoreVertical className="w-4 h-4 text-[#8e8aa9] shrink-0" />
          </div>

          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 z-50 bg-[#16192e] border border-white/10 rounded-xl shadow-2xl p-1.5 animate-fade-in space-y-1">
                <div className="px-3 py-2 text-[11px] font-semibold text-[#8e8aa9] border-b border-white/5 truncate">
                  {displayName} · @{username}
                </div>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#f87171] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col h-screen sticky top-0 shrink-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
