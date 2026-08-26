import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  ShieldAlert,
  Target,
  Calendar,
  BarChart3,
  BrainCircuit,
  Settings,
  Plus,
  ArrowRight,
  X,
  CreditCard,
} from 'lucide-react';
import { AppPage, useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

interface CommandOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  category: 'Navigation' | 'Actions' | 'Brain Queries' | 'Records';
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setPage,
    openQuickAdd,
    accounts,
    debts,
    goals,
    bills,
    currency,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (target: AppPage) => {
    setPage(target);
    setIsCommandPaletteOpen(false);
  };

  // Base options
  const baseOptions: CommandOption[] = [
    // Navigation
    { id: 'nav-overview', title: 'Go to Overview', subtitle: 'Financial Command Center', icon: LayoutDashboard, category: 'Navigation', action: () => navigateTo('overview') },
    { id: 'nav-income', title: 'Go to Income Streams', subtitle: 'Recurring income and inflows', icon: TrendingUp, category: 'Navigation', action: () => navigateTo('income') },
    { id: 'nav-tx', title: 'Go to Transactions Ledger', subtitle: 'Money movement audit log', icon: ArrowLeftRight, category: 'Navigation', action: () => navigateTo('transactions') },
    { id: 'nav-plan', title: 'Go to Plan & Budget', subtitle: '50/30/20 allocation rules', icon: PieChart, category: 'Navigation', action: () => navigateTo('plan') },
    { id: 'nav-debt', title: 'Go to Debt Elimination', subtitle: 'Avalanche & Snowball strategies', icon: ShieldAlert, category: 'Navigation', action: () => navigateTo('debt') },
    { id: 'nav-goals', title: 'Go to Goals', subtitle: 'Target savings milestones', icon: Target, category: 'Navigation', action: () => navigateTo('goals') },
    { id: 'nav-calendar', title: 'Go to Cash Flow Calendar', subtitle: 'Due dates and timelines', icon: Calendar, category: 'Navigation', action: () => navigateTo('calendar') },
    { id: 'nav-reports', title: 'Go to Reports & Forecasting', subtitle: 'Compound growth & metrics', icon: BarChart3, category: 'Navigation', action: () => navigateTo('reports') },
    { id: 'nav-brain', title: 'Ask FINORA Brain AI', subtitle: 'Deterministic verified intelligence', icon: BrainCircuit, category: 'Navigation', action: () => navigateTo('brain') },
    { id: 'nav-settings', title: 'Go to Settings & Supabase', subtitle: 'Database sync & preferences', icon: Settings, category: 'Navigation', action: () => navigateTo('settings') },

    // Actions
    { id: 'act-add-tx', title: 'Add Transaction Expense', subtitle: 'Record an outflow or bill payment', icon: Plus, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('EXPENSE'); } },
    { id: 'act-add-inc', title: 'Add Income Source', subtitle: 'Configure salary or side revenue', icon: TrendingUp, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('INCOME'); } },
    { id: 'act-add-debt', title: 'Add Debt Liability', subtitle: 'Track a loan or credit balance', icon: ShieldAlert, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('DEBT'); } },
    { id: 'act-add-goal', title: 'Create Savings Goal', subtitle: 'Plan a target savings milestone', icon: Target, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('GOAL'); } },

    // Brain Queries
    { id: 'bq-safe', title: 'Calculate Safe to Spend Today', subtitle: 'Conservative daily envelope', icon: BrainCircuit, category: 'Brain Queries', action: () => navigateTo('brain') },
    { id: 'bq-debt', title: 'Who Should I Pay First?', subtitle: 'Calculate Avalanche & Hybrid priority', icon: ShieldAlert, category: 'Brain Queries', action: () => navigateTo('debt') },
  ];

  // Records
  const recordOptions: CommandOption[] = [
    ...debts.map((d) => ({
      id: `debt-${d.id}`,
      title: `Debt: ${d.name}`,
      subtitle: `Balance: ${formatCurrency(d.currentBalance, currency)} (${d.interestRate}% interest)`,
      icon: ShieldAlert,
      category: 'Records' as const,
      action: () => navigateTo('debt'),
    })),
    ...goals.map((g) => ({
      id: `goal-${g.id}`,
      title: `Goal: ${g.name}`,
      subtitle: `${formatCurrency(g.currentAmount, currency)} of ${formatCurrency(g.targetAmount, currency)}`,
      icon: Target,
      category: 'Records' as const,
      action: () => navigateTo('goals'),
    })),
  ];

  const allOptions = [...baseOptions, ...recordOptions];

  const filtered = query.trim()
    ? allOptions.filter(
        (opt) =>
          opt.title.toLowerCase().includes(query.toLowerCase()) ||
          opt.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          opt.category.toLowerCase().includes(query.toLowerCase())
      )
    : allOptions.slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-xl bg-white border border-[#e5e7eb] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#e5e7eb] gap-3 bg-[#fcfdfe]">
          <Search className="w-4 h-4 text-[#5a42e8] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, query, or record name…"
            className="w-full bg-transparent text-[#111827] text-xs font-medium focus:outline-none placeholder:text-[#9ca3af]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#9ca3af] hover:text-[#111827] rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 rounded bg-[#f3f4f6] text-[10px] font-mono text-[#6b7280] border border-[#e5e7eb]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[#6b7280] text-xs">
              No matching commands or records found for <span className="text-[#5a42e8] font-bold">"{query}"</span>.
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors
                    ${
                      isSelected
                        ? 'bg-[#f3f1fc] text-[#111827] border border-[#e9e5f8]'
                        : 'text-[#4b5563] hover:bg-[#f9fafb] border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-[#5a42e8] text-white' : 'bg-[#f3f4f6] text-[#5a42e8]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-[#111827]">{item.title}</div>
                      {item.subtitle && <div className="text-[11px] text-[#6b7280] truncate">{item.subtitle}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f3f4f6] text-[#6b7280]">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#5a42e8]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#f9fafb] border-t border-[#e5e7eb] flex items-center justify-between text-[10px] text-[#6b7280]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white border border-[#e5e7eb] font-mono mr-1">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-white border border-[#e5e7eb] font-mono mr-1">↵</kbd> Select
            </span>
          </div>
          <span className="font-semibold text-[#5a42e8]">FINORA OS Intelligence</span>
        </div>
      </div>
    </div>
  );
};
