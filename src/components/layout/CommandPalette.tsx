import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
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
  Cloud,
  Calculator,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';
import { AppPage, useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';

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
    { id: 'nav-income', title: 'Go to Income Center', subtitle: 'Recurring income and receipts', icon: TrendingUp, category: 'Navigation', action: () => navigateTo('income') },
    { id: 'nav-tx', title: 'Go to Transactions', subtitle: 'Money movement ledger', icon: ArrowLeftRight, category: 'Navigation', action: () => navigateTo('transactions') },
    { id: 'nav-plan', title: 'Go to Monthly Plan', subtitle: 'Priority-based budget allocation', icon: PieChart, category: 'Navigation', action: () => navigateTo('plan') },
    { id: 'nav-debt', title: 'Go to Debt Center', subtitle: 'Liabilities, strategies & EMI', icon: CreditCard, category: 'Navigation', action: () => navigateTo('debt') },
    { id: 'nav-goals', title: 'Go to Goals', subtitle: 'Purposeful savings milestones', icon: Target, category: 'Navigation', action: () => navigateTo('goals') },
    { id: 'nav-calendar', title: 'Go to Bills & Calendar', subtitle: 'Timeline and subscriptions', icon: CalendarDays, category: 'Navigation', action: () => navigateTo('calendar') },
    { id: 'nav-reports', title: 'Go to Reports & Analytics', subtitle: 'Spending mix and health score', icon: BarChart3, category: 'Navigation', action: () => navigateTo('reports') },
    { id: 'nav-brain', title: 'Ask FINORA Brain AI', subtitle: 'Deterministic verified intelligence', icon: Brain, category: 'Navigation', action: () => navigateTo('brain') },
    { id: 'nav-settings', title: 'Go to Settings & Supabase', subtitle: 'Cloud sync & workspace preferences', icon: Settings, category: 'Navigation', action: () => navigateTo('settings') },

    // Actions
    { id: 'act-add-tx', title: 'Add Transaction', subtitle: 'Record expense, income or transfer', icon: Plus, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('transaction'); } },
    { id: 'act-add-inc', title: 'Add Recurring Income', subtitle: 'Configure new salary or income stream', icon: TrendingUp, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('income'); } },
    { id: 'act-add-debt', title: 'Add Debt or Loan', subtitle: 'Track new liability', icon: CreditCard, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('debt'); } },
    { id: 'act-add-goal', title: 'Create Savings Goal', subtitle: 'Plan a target savings milestone', icon: Target, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('goal'); } },
    { id: 'act-add-bill', title: 'Add Bill or Subscription', subtitle: 'Track payment due dates', icon: CalendarDays, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); openQuickAdd('bill'); } },

    // Brain Queries
    { id: 'bq-safe', title: 'Calculate Safe to Spend Today', subtitle: 'Conservative daily envelope', icon: Sparkles, category: 'Brain Queries', action: () => navigateTo('brain') },
    { id: 'bq-afford', title: 'Check Affordability of a Purchase', subtitle: 'Test against flexible capacity', icon: Sparkles, category: 'Brain Queries', action: () => navigateTo('brain') },
    { id: 'bq-debt', title: 'Who Should I Pay First?', subtitle: 'Calculate Avalanche & Hybrid priority', icon: Sparkles, category: 'Brain Queries', action: () => navigateTo('debt') },
    { id: 'bq-emi', title: 'Model Loan & Prepayment in EMI Engine', subtitle: 'Reduce tenure vs reduce EMI', icon: Calculator, category: 'Brain Queries', action: () => navigateTo('debt') },
  ];

  // Records
  const recordOptions: CommandOption[] = [
    ...accounts.map((a) => ({
      id: `acc-${a.id}`,
      title: `Account: ${a.name}`,
      subtitle: `${a.type} · Balance: ${formatMoney(a.balance, currency)}`,
      icon: CreditCard,
      category: 'Records' as const,
      action: () => navigateTo('settings'),
    })),
    ...debts.map((d) => ({
      id: `debt-${d.id}`,
      title: `Debt: ${d.name}`,
      subtitle: `Remaining: ${formatMoney(d.remainingAmount, currency)} (${d.interestRate}% interest)`,
      icon: CreditCard,
      category: 'Records' as const,
      action: () => navigateTo('debt'),
    })),
    ...goals.map((g) => ({
      id: `goal-${g.id}`,
      title: `Goal: ${g.name}`,
      subtitle: `${formatMoney(g.currentAmount, currency)} of ${formatMoney(g.targetAmount, currency)}`,
      icon: Target,
      category: 'Records' as const,
      action: () => navigateTo('goals'),
    })),
    ...bills.map((b) => ({
      id: `bill-${b.id}`,
      title: `Bill: ${b.name}`,
      subtitle: `Due ${b.dueDate} · ${formatMoney(b.amount, currency)} (${b.paid ? 'Paid' : 'Unpaid'})`,
      icon: CalendarDays,
      category: 'Records' as const,
      action: () => navigateTo('calendar'),
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
    : allOptions.slice(0, 10);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-[#131625] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
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
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-500 hover:text-white rounded">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or records found for <span className="text-purple-300">"{query}"</span>.
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
                    flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-colors
                    ${
                      isSelected
                        ? 'bg-purple-600/20 text-white border border-purple-500/30'
                        : 'text-slate-300 hover:bg-white/[0.04] border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-purple-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      {item.subtitle && <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-purple-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] mr-1">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] mr-1">↵</kbd> Select
            </span>
          </div>
          <span>FINORA OS Intelligence</span>
        </div>
      </div>
    </div>
  );
};
