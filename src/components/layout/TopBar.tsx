import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Maximize2,
  Minimize2,
  Cloud,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../../services/currency';

export const TopBar: React.FC = () => {
  const {
    setIsMobileDrawerOpen,
    setIsCommandPaletteOpen,
    openQuickAdd,
    theme,
    setTheme,
    currency,
    setCurrency,
    supabaseConfig,
    syncToSupabase,
    brainState,
    setPage,
  } = useApp();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await syncToSupabase();
    setIsSyncing(false);
  };

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
    <header className="h-16 bg-[#0c0e17]/85 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Drawer Trigger & Command Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 lg:hidden transition-colors shrink-0"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Spotlight trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-all group"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
            <span className="truncate">Ask Brain or search records…</span>
          </div>
          <kbd className="hidden sm:inline px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono text-slate-400 border border-white/10">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Cloud Sync, Currency, Theme, Signals Bell, Quick Add */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-2">
        {/* Supabase Status Pill */}
        <div className="hidden md:flex items-center">
          {supabaseConfig.url && supabaseConfig.anonKey ? (
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${
                  supabaseConfig.connected
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                }
              `}
              title="Click to sync data with Supabase Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{supabaseConfig.connected ? 'Supabase Synced' : 'Sync Cloud'}</span>
            </button>
          ) : (
            <button
              onClick={() => setPage('settings')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              title="Configure Supabase cloud database in Settings"
            >
              <Cloud className="w-3.5 h-3.5 text-purple-400" />
              <span>Connect Supabase</span>
            </button>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border border-white/10 transition-colors"
            title="Change Currency"
          >
            <span>{SUPPORTED_CURRENCIES[currency]?.symbol || currency}</span>
            <span className="hidden sm:inline text-slate-400">{currency}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isCurrencyDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsCurrencyDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-[#151928] border border-white/10 rounded-2xl shadow-2xl p-1.5 backdrop-blur-2xl animate-fade-in max-h-64 overflow-y-auto">
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors
                      ${c.code === currency ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-white/5'}
                    `}
                  >
                    <span className="font-semibold">{c.symbol} {c.code}</span>
                    <span className="text-[10px] text-slate-400">{c.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
        </button>

        {/* Signals Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            title="FINORA Signals"
          >
            <Bell className="w-4 h-4" />
            {highSignals.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-[#151928] border border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-2xl animate-fade-in space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      FINORA Brain Signals
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
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
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
                            : rec.severity === 'ATTENTION'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                        }`}
                      >
                        <div className="font-bold">{rec.title}</div>
                        <div className="text-slate-300 text-[11px]">{rec.message}</div>
                        <div className="text-[10px] text-slate-400 italic pt-1">{rec.fact}</div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setPage('brain');
                    setIsNotificationsOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-purple-300 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition-colors border border-purple-500/30"
                >
                  Open FINORA Brain Intelligence →
                </button>
              </div>
            </>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          title={isFullscreen ? 'Exit full screen' : 'Full screen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Date Display */}
        <div className="hidden xl:flex text-xs font-semibold text-slate-400 px-2.5 py-1 rounded-lg bg-white/[0.03]">
          {todayStr}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => openQuickAdd()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </header>
  );
};
