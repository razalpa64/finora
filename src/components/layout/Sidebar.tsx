import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  CreditCard,
  Target,
  CalendarDays,
  BarChart3,
  Brain,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Database,
  Cloud,
  Sparkles,
  RefreshCw,
  X,
  Coins,
} from 'lucide-react';
import { AppPage, useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const {
    page,
    setPage,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    openQuickAdd,
    currentProfile,
    profiles,
    switchProfile,
    createProfile,
    loadDemoData,
    resetToEmptyWorkspace,
    logout,
    brainState,
    bills,
    debts,
    supabaseConfig,
    currency,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileUsername, setNewProfileUsername] = useState('');

  // Calculate dynamic badges
  const unpaidBillsCount = bills.filter((b) => !b.paid).length;
  const activeDebtsCount = debts.filter((d) => d.remainingAmount > 0).length;
  const activeSignalsCount = brainState.recommendations.filter(
    (r) => r.severity === 'WARNING' || r.severity === 'CRITICAL'
  ).length;

  const mainNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'income', label: 'Income Center', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'plan', label: 'Monthly Plan', icon: PieChart },
    {
      id: 'debt',
      label: 'Debt Center',
      icon: CreditCard,
      badge: activeDebtsCount > 0 ? activeDebtsCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    { id: 'goals', label: 'Goals', icon: Target },
    {
      id: 'calendar',
      label: 'Bills & Calendar',
      icon: CalendarDays,
      badge: unpaidBillsCount > 0 ? unpaidBillsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (target: AppPage) => {
    setPage(target);
    setIsMobileDrawerOpen(false);
  };

  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName || !newProfileUsername) return;
    createProfile(newProfileName, newProfileUsername);
    setIsNewProfileModalOpen(false);
    setNewProfileName('');
    setNewProfileUsername('');
    setIsProfileMenuOpen(false);
  };

  const userInitials = currentProfile?.displayName
    ? currentProfile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0f121d] border-r border-white/5 transition-all duration-300 ease-in-out
          lg:static lg:z-auto
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileDrawerOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => handleNavClick('overview')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-500 text-white font-black text-xl shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              F
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0f121d]" />
            </div>
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white tracking-wider text-base">FINORA</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    OS 2.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Financial Operating System</span>
              </div>
            )}
          </div>

          {/* Close drawer on mobile / Collapse on desktop */}
          <div className="flex items-center">
            {isMobileDrawerOpen && (
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Add Action Button */}
        <div className="p-3">
          <button
            onClick={() => openQuickAdd()}
            className={`
              w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm text-white
              bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500
              shadow-lg shadow-purple-600/25 active:scale-[0.98] transition-all
              ${isSidebarCollapsed && !isMobileDrawerOpen ? 'px-0' : ''}
            `}
            title="Quick Add Transaction / Record"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {(!isSidebarCollapsed || isMobileDrawerOpen) && <span>Quick Add</span>}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin">
          {/* Main Section */}
          <div className="space-y-1">
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Command Center
              </div>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group
                    ${
                      isActive
                        ? 'bg-purple-600/15 text-purple-300 font-semibold border border-purple-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }
                    ${isSidebarCollapsed && !isMobileDrawerOpen ? 'justify-center px-0' : ''}
                  `}
                  title={item.label}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {(!isSidebarCollapsed || isMobileDrawerOpen) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {item.badge !== undefined && (!isSidebarCollapsed || isMobileDrawerOpen) && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-white/10 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-purple-500 rounded-r" />
                  )}
                </button>
              );
            })}
          </div>

          {/* AI Intelligence Section */}
          <div className="space-y-1">
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-purple-400/80 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Intelligence</span>
              </div>
            )}
            <button
              onClick={() => handleNavClick('brain')}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group
                bg-gradient-to-r from-purple-950/40 to-indigo-950/30 border border-purple-500/30
                ${
                  page === 'brain'
                    ? 'bg-purple-600/25 text-purple-200 font-semibold border-purple-400/50 shadow-md shadow-purple-900/20'
                    : 'text-purple-300 hover:text-white hover:border-purple-400/40'
                }
                ${isSidebarCollapsed && !isMobileDrawerOpen ? 'justify-center px-0' : ''}
              `}
              title="FINORA Brain AI"
            >
              <Brain className="w-5 h-5 shrink-0 text-purple-400 animate-pulse-subtle" />
              {(!isSidebarCollapsed || isMobileDrawerOpen) && (
                <div className="flex-1 text-left flex items-center justify-between">
                  <span className="font-semibold text-purple-200">FINORA Brain</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    AI
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* System Section */}
          <div className="space-y-1">
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                System
              </div>
            )}
            <button
              onClick={() => handleNavClick('settings')}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all relative group
                ${
                  page === 'settings'
                    ? 'bg-purple-600/15 text-purple-300 font-semibold border border-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }
                ${isSidebarCollapsed && !isMobileDrawerOpen ? 'justify-center px-0' : ''}
              `}
              title="Settings & Supabase Sync"
            >
              <Settings
                className={`w-5 h-5 shrink-0 ${
                  page === 'settings' ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {(!isSidebarCollapsed || isMobileDrawerOpen) && (
                <div className="flex-1 text-left flex items-center justify-between">
                  <span>Settings & Cloud</span>
                  {supabaseConfig.connected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Supabase Connected" />
                  )}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* User Profile Card & Dropdown Menu */}
        <div className="p-3 border-t border-white/5 relative">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={`
              flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.06] cursor-pointer transition-colors
              ${isSidebarCollapsed && !isMobileDrawerOpen ? 'justify-center p-1.5' : ''}
            `}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
              {userInitials}
            </div>
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-200 truncate">{currentProfile?.displayName}</div>
                <div className="text-[11px] text-slate-400 truncate">@{currentProfile?.username}</div>
              </div>
            )}
            {(!isSidebarCollapsed || isMobileDrawerOpen) && (
              <div className="text-xs text-slate-500 font-bold px-1.5 py-0.5 rounded bg-white/5">
                {currency}
              </div>
            )}
          </div>

          {/* Profile Menu Popover */}
          {isProfileMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
              <div className="absolute bottom-full left-3 right-3 mb-2 z-20 bg-[#151928] border border-white/10 rounded-2xl shadow-2xl p-2 space-y-1 backdrop-blur-xl animate-fade-in">
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <div className="text-xs font-bold text-white">{currentProfile?.displayName}</div>
                  <div className="text-[11px] text-slate-400">@{currentProfile?.username} · {currency}</div>
                </div>

                {/* Profiles switcher */}
                <div className="py-1">
                  <div className="px-3 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Switch Workspace Profile
                  </div>
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setIsProfileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors
                        ${p.id === currentProfile?.id ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-slate-300 hover:bg-white/5'}
                      `}
                    >
                      <span className="truncate">{p.displayName}</span>
                      {p.id === currentProfile?.id && <span className="text-[10px] text-purple-400">Active</span>}
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/5 my-1" />

                {/* Quick actions */}
                <button
                  onClick={() => {
                    setIsNewProfileModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Create New Profile</span>
                </button>

                <button
                  onClick={() => {
                    loadDemoData();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reload Sample Demo Data</span>
                </button>

                <button
                  onClick={() => {
                    resetToEmptyWorkspace();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clear & Empty Workspace</span>
                </button>

                <div className="border-t border-white/5 my-1" />

                <button
                  onClick={() => {
                    logout();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Create Profile Modal */}
      {isNewProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Private Profile</h3>
            <p className="text-xs text-slate-400 mb-5">
              Each profile has completely isolated accounts, transactions, and FINORA Brain intelligence.
            </p>

            <form onSubmit={handleCreateProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Display Name</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newProfileUsername}
                  onChange={(e) => setNewProfileUsername(e.target.value)}
                  placeholder="e.g. sarah.j"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-colors"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
