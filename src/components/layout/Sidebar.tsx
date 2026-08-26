import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  ShieldAlert,
  Target,
  Calendar,
  BarChart3,
  BrainCircuit,
  Settings,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    page,
    setPage,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    currentProfile,
    healthScore,
    logout,
  } = useApp();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'plan', label: 'Plan & Budget', icon: PieChart },
    { id: 'debt', label: 'Debt Repayment', icon: ShieldAlert },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'brain', label: 'FINORA Brain', icon: BrainCircuit, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#10b981] bg-[#ecfdf5] border-[#a7f3d0]';
    if (score >= 60) return 'text-[#f59e0b] bg-[#fffbeb] border-[#fde68a]';
    return 'text-[#ef4444] bg-[#fef2f2] border-[#fecaca]';
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#101322] text-[#f8fafc] border-r border-[#1e2338]">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#1e2338]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5a42e8] to-[#432ec7] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              FINORA
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-[#5a42e8]/30 text-[#a594fd] border border-[#5a42e8]/40">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-[#94a3b8] font-medium">
              Financial Command Center
            </div>
          </div>
        </div>

        {isMobileDrawerOpen && (
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#1e2338] lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
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
                w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group
                ${
                  isActive
                    ? 'bg-[#5a42e8] text-white shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#1a1e34]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-[#64748b] group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#5a42e8]/20 text-[#a594fd]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-t border-[#1e2338] bg-[#0c0e1a]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1e2338] border border-[#2d334d] flex items-center justify-center font-bold text-xs text-white">
              {currentProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate max-w-[110px]">
                {currentProfile?.name || 'User'}
              </div>
              <div className="text-[10px] text-[#64748b] truncate max-w-[110px]">
                {currentProfile?.email || 'user@finora.app'}
              </div>
            </div>
          </div>

          <div
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreColor(
              healthScore.score
            )}`}
            title="Financial Health Score"
          >
            {healthScore.score}/100
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-[#f87171] hover:bg-[#2d1519] border border-[#4c1d24]/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col h-screen sticky top-0 shrink-0 z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-right">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
