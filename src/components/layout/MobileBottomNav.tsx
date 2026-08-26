import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  Brain,
  Menu,
  Plus,
} from 'lucide-react';
import { AppPage, useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { page, setPage, isMobileDrawerOpen, setIsMobileDrawerOpen, openQuickAdd } = useApp();

  const navItems = [
    { id: 'overview' as AppPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'income' as AppPage, label: 'Income', icon: TrendingUp },
    { id: 'transactions' as AppPage, label: 'Money', icon: ArrowLeftRight },
    { id: 'brain' as AppPage, label: 'Brain AI', icon: Brain },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0c0e17]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Center Floating Quick Add Button */}
      <div className="relative -top-3">
        <button
          onClick={() => openQuickAdd()}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 active:scale-95 transition-transform border-2 border-[#0c0e17]"
          title="Quick Add"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = page === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* More / Menu trigger */}
      <button
        onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px] tracking-tight mt-0.5">More</span>
      </button>
    </nav>
  );
};
