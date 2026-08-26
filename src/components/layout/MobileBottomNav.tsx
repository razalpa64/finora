import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  BrainCircuit,
  Plus,
  Menu,
} from 'lucide-react';
import { AppPage, useApp } from '../../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { page, setPage, setIsMobileDrawerOpen, openQuickAdd } = useApp();

  const navItems = [
    { id: 'overview' as AppPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'income' as AppPage, label: 'Income', icon: Wallet },
    { id: 'transactions' as AppPage, label: 'Ledger', icon: ArrowLeftRight },
    { id: 'brain' as AppPage, label: 'Brain AI', icon: BrainCircuit },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#e2e8f0] px-3 py-1.5 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)] safe-area-bottom">
      {/* Overview */}
      <button
        onClick={() => setPage('overview')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
          page === 'overview'
            ? 'text-[#5a42e8] font-bold'
            : 'text-[#64748b] hover:text-[#1e293b]'
        }`}
      >
        <LayoutDashboard className={`w-5 h-5 ${page === 'overview' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">Overview</span>
      </button>

      {/* Income */}
      <button
        onClick={() => setPage('income')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
          page === 'income'
            ? 'text-[#5a42e8] font-bold'
            : 'text-[#64748b] hover:text-[#1e293b]'
        }`}
      >
        <Wallet className={`w-5 h-5 ${page === 'income' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">Income</span>
      </button>

      {/* Center Action Button (Add) */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={() => openQuickAdd()}
          className="w-10 h-10 rounded-xl bg-[#5a42e8] hover:bg-[#4a34db] active:scale-95 text-white flex items-center justify-center shadow-md shadow-[#5a42e8]/30 transition-all"
          title="Quick Record Entry"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Ledger */}
      <button
        onClick={() => setPage('transactions')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
          page === 'transactions'
            ? 'text-[#5a42e8] font-bold'
            : 'text-[#64748b] hover:text-[#1e293b]'
        }`}
      >
        <ArrowLeftRight className={`w-5 h-5 ${page === 'transactions' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">Ledger</span>
      </button>

      {/* Menu / More */}
      <button
        onClick={() => setIsMobileDrawerOpen(true)}
        className="flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[#64748b] hover:text-[#1e293b] transition-all"
        title="Open Navigation Menu"
      >
        <Menu className="w-5 h-5 stroke-2" />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">More</span>
      </button>
    </nav>
  );
};
