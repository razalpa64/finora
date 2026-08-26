import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  Maximize2,
  Minimize2,
  HelpCircle,
  LogOut,
  ChevronDown,
  Sparkles,
  Layers,
  Wallet,
  ArrowLeftRight,
  ShieldAlert,
  Target,
  CalendarDays,
  X,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopBar: React.FC = () => {
  const {
    setIsMobileDrawerOpen,
    openQuickAdd,
    brainState,
    setPage,
    logout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQuickAddMenuOpen, setIsQuickAddMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setPage('brain');
    setSearchQuery('');
  };

  const highSignals = brainState.recommendations.filter(
    (r) => r.severity === 'CRITICAL' || r.severity === 'WARNING' || r.severity === 'ATTENTION'
  );

  return (
    <>
      <header className="h-14 bg-white border-b border-[#e5e7eb] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
        {/* Left: Mobile Drawer Trigger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 text-[#64748b] hover:text-[#111827] rounded-lg hover:bg-[#f1f5f9] lg:hidden transition-colors shrink-0 cursor-pointer"
            title="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#1e293b] tracking-tight">
            <span>Your Financial Command Center</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          </div>
        </div>

        {/* Right: Search, Date, Fullscreen, Help, Signals, Quick Add, Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 max-w-2xl justify-end ml-2">
          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask FINORA or find a record…"
              className="w-full pl-3.5 pr-8 py-1.5 bg-[#f4f5f8] focus:bg-white border border-[#e2e8f0] focus:border-[#5a42e8] rounded-xl text-xs text-[#1e293b] placeholder:text-[#94a3b8] outline-none transition-all font-medium"
            />
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          {/* Date Label */}
          <div className="hidden xl:block text-[11px] font-semibold text-[#64748b] px-2.5 py-1 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] whitespace-nowrap">
            {todayStr}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-1.5 text-[#64748b] hover:text-[#111827] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition-colors cursor-pointer"
            title="Toggle full screen · F11"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Help Button (?) */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-1.5 text-[#64748b] hover:text-[#5a42e8] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-xs font-black transition-colors w-8 h-8 flex items-center justify-center cursor-pointer"
            title="How FINORA works"
          >
            ?
          </button>

          {/* Signals Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-1.5 text-[#64748b] hover:text-[#111827] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl transition-colors w-8 h-8 flex items-center justify-center cursor-pointer"
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
                <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-white border border-[#e5e7eb] rounded-2xl shadow-2xl p-4 animate-fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-2">
                    <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      FINORA Brain Signals
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f3f1fc] text-[#5a42e8]">
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
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setPage('brain');
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs font-bold text-[#5a42e8] bg-[#f3f1fc] hover:bg-[#ebe6fc] rounded-xl transition-colors border border-[#e9e5f8] cursor-pointer"
                  >
                    Open FINORA Brain →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Add Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsQuickAddMenuOpen(!isQuickAddMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-br from-[#765df1] to-[#5a42e8] hover:bg-[#4a34db] shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quick add</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {isQuickAddMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsQuickAddMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-white border border-[#e5e7eb] rounded-2xl shadow-2xl p-1.5 animate-fade-in space-y-0.5 text-xs">
                  <button
                    onClick={() => {
                      setIsQuickAddMenuOpen(false);
                      openQuickAdd('INCOME');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#374151] hover:bg-[#f3f1fc] hover:text-[#5a42e8] rounded-xl transition-colors cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#5a42e8]" />
                    <span>Monthly income source</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickAddMenuOpen(false);
                      openQuickAdd('EXPENSE');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#374151] hover:bg-[#f3f1fc] hover:text-[#5a42e8] rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#10b981]" />
                    <span>Transaction</span>
                  </button>

                  <div className="my-1 border-t border-[#f3f4f6]" />

                  <button
                    onClick={() => {
                      setIsQuickAddMenuOpen(false);
                      openQuickAdd('DEBT');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#374151] hover:bg-[#f3f1fc] hover:text-[#5a42e8] rounded-xl transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
                    <span>Debt or loan</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickAddMenuOpen(false);
                      openQuickAdd('GOAL');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#374151] hover:bg-[#f3f1fc] hover:text-[#5a42e8] rounded-xl transition-colors cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>Savings goal</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsQuickAddMenuOpen(false);
                      setPage('calendar');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[#374151] hover:bg-[#f3f1fc] hover:text-[#5a42e8] rounded-xl transition-colors cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-[#8b5cf6]" />
                    <span>Bill or subscription</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Dedicated Log Out Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#fff0f2] text-[#b54b59] hover:bg-[#ffe1e5] hover:text-[#9f3744] border border-[#ffd5db] transition-colors cursor-pointer"
            title="Log out of FINORA"
          >
            <LogOut className="w-3.5 h-3.5 text-[#c65e6b]" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* How FINORA Works Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-lg shadow-2xl p-6 animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
              <div>
                <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
                  QUICK GUIDE
                </div>
                <h3 className="text-lg font-extrabold text-[#111827]">
                  How to use FINORA OS
                </h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#4b5563] leading-relaxed">
              FINORA follows the order below. Every dashboard value is recalculated from your records.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-6 h-6 rounded-full bg-[#5a42e8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Accounts</div>
                  <div className="text-[11px] text-[#6b7280]">
                    Add where your cash, savings and investments are held.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-6 h-6 rounded-full bg-[#5a42e8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Income</div>
                  <div className="text-[11px] text-[#6b7280]">
                    Add recurring income, then record each payment when it is received.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-6 h-6 rounded-full bg-[#5a42e8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Obligations</div>
                  <div className="text-[11px] text-[#6b7280]">
                    Add spending, bills, debts and goals so FINORA can protect them.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="w-6 h-6 rounded-full bg-[#5a42e8] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Decisions</div>
                  <div className="text-[11px] text-[#6b7280]">
                    Use Safe to Spend, Monthly Plan and FINORA Brain to understand the next action.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-[#6b7280] italic border-t border-[#f3f4f6]">
              Expected values and recorded facts are shown separately throughout the application.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
