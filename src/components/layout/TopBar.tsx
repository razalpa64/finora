import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Maximize2,
  Minimize2,
  Cloud,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../../services/currency';

export const TopBar: React.FC = () => {
  const {
    setIsMobileDrawerOpen,
    setIsCommandPaletteOpen,
    openQuickAdd,
    currency,
    setCurrency,
    supabaseConfig,
    syncToSupabase,
    brainState,
    setPage,
    logout,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const highSignals = brainState.recommendations.filter(
    (r) => r.severity === 'CRITICAL' || r.severity === 'WARNING' || r.severity === 'ATTENTION'
  );

  return (
    <header className="h-16 bg-white border-b border-[#e5e7eb] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Drawer Trigger & Command Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="p-2 text-[#64748b] hover:text-[#191c27] rounded-xl hover:bg-[#f1f5f9] lg:hidden transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:block text-xs font-bold text-[#1e293b] truncate">
          Your Financial Command Center
        </div>

        {/* Global Spotlight trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full max-w-sm flex items-center justify-between gap-2 px-3.5 py-1.5 bg-[#f4f5f8] hover:bg-[#ebeef5] border border-[#e2e8f0] rounded-xl text-[#64748b] hover:text-[#191c27] text-xs transition-all group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#5a42e8] transition-colors shrink-0" />
            <span className="truncate">Ask FINORA or find a record…</span>
          </div>
          <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white rounded text-[10px] font-mono text-[#64748b] border border-[#cbd5e1] font-bold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Date, Cloud Status, Currency, Signals Bell, Quick Add, Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-2">
        {/* Supabase Status */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => setPage('settings')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#f3f1fc] text-[#5a42e8] border border-[#e9e5f8] hover:bg-[#eae6fb] transition-colors"
            title="Supabase Database Connected"
          >
            <Cloud className="w-3.5 h-3.5 text-[#5a42e8]" />
            <span>Supabase Cloud</span>
          </button>
        </div>

        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] transition-colors"
            title="Change Currency"
          >
            <span>{SUPPORTED_CURRENCIES[currency]?.symbol || currency}</span>
            <span className="hidden sm:inline text-[#64748b]">{currency}</span>
            <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
          </button>

          {isCurrencyDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsCurrencyDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-white border border-[#e2e8f0] rounded-2xl shadow-xl p-1.5 animate-fade-in max-h-64 overflow-y-auto">
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors
                      ${c.code === currency ? 'bg-[#f3f1fc] text-[#5a42e8] font-bold' : 'text-[#334155] hover:bg-[#f8fafc]'}
                    `}
                  >
                    <span className="font-bold">{c.symbol} {c.code}</span>
                    <span className="text-[10px] text-[#64748b]">{c.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Signals Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-[#64748b] hover:text-[#191c27] rounded-xl hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors"
            title="FINORA Signals"
          >
            <Bell className="w-4 h-4" />
            {highSignals.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#dc2626]" />
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl p-4 animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2">
                  <span className="text-xs font-bold text-[#191c27] uppercase tracking-wider">
                    FINORA Brain Signals
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f3f1fc] text-[#5a42e8]">
                    {brainState.recommendations.length} Active
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {brainState.recommendations.map((rec, i) => {
                    const isCrit = rec.severity === 'CRITICAL' || rec.severity === 'WARNING';
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                          isCrit
                            ? 'bg-[#fff0f1] border-[#fecdd3] text-[#991b1b]'
                            : rec.severity === 'ATTENTION'
                            ? 'bg-[#fffbeb] border-[#fef3c7] text-[#92400e]'
                            : 'bg-[#f0fdf4] border-[#dcfce7] text-[#166534]'
                        }`}
                      >
                        <div className="font-bold">{rec.title}</div>
                        <div className="text-[#475569] text-[11px]">{rec.message}</div>
                        <div className="text-[10px] text-[#64748b] italic pt-1">{rec.fact}</div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setPage('brain');
                    setIsNotificationsOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-[#5a42e8] bg-[#f3f1fc] hover:bg-[#ebe6fc] rounded-xl transition-colors border border-[#e9e5f8]"
                >
                  Open FINORA Brain →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 text-[#64748b] hover:text-[#191c27] rounded-xl hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-colors"
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Date Display */}
        <div className="hidden xl:flex text-xs font-semibold text-[#64748b] px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
          {todayStr}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => openQuickAdd()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#5a42e8] hover:bg-[#4c35d4] shadow-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* Prominent Log Out Button (Exact JavaFX top-logout style) */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#fff0f2] text-[#b54b59] hover:bg-[#ffe1e5] hover:text-[#9f3744] border border-[#ffd5db] transition-colors"
          title="Log out of FINORA"
        >
          <LogOut className="w-3.5 h-3.5 text-[#c65e6b]" />
          <span className="hidden md:inline">Log out</span>
        </button>
      </div>
    </header>
  );
};
