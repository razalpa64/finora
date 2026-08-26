import React from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CreditCard,
  Target,
  CalendarDays,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  Wallet,
  ArrowRight,
  Plus,
  Coins,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';

export const OverviewPage: React.FC = () => {
  const {
    currentProfile,
    brainState,
    accounts,
    incomeSources,
    transactions,
    debts,
    bills,
    setPage,
    openQuickAdd,
    currency,
  } = useApp();

  const snapshot = brainState.snapshot;
  const safe = brainState.safeToSpend;
  const health = brainState.health;
  const plan = brainState.monthlyPlan;
  const recommendations = brainState.recommendations;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Setup completion check
  const hasAccount = accounts.length > 0;
  const hasIncome = incomeSources.length > 0 || snapshot.recordedIncome > 0;
  const hasOutflow = transactions.length > 0 || bills.length > 0 || debts.length > 0;
  const setupStepCount = (hasAccount ? 1 : 0) + (hasIncome ? 1 : 0) + (hasOutflow ? 1 : 0);
  const isSetupComplete = setupStepCount === 3;

  // Calculate monthly surplus
  const monthlySurplus = Math.max(0, snapshot.monthlyIncome - snapshot.monthlyOutflow);

  // Next due bill
  const nextBill = bills.filter((b) => !b.paid).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner: Greeting + Workspace Mode Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Financial Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {currentProfile?.displayName || 'Alex'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Deterministic financial analysis derived from your local records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Private Local Workspace</span>
          </div>
        </div>
      </div>

      {/* Guided 3-Step Setup Card (Shown if user hasn't finished initial setup) */}
      {!isSetupComplete && (
        <div className="bg-gradient-to-r from-purple-950/40 via-[#15192b] to-[#121524] border border-purple-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Guided Setup</div>
              <h3 className="text-sm sm:text-base font-bold text-white">Get FINORA Command Center ready in 3 steps</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 self-start sm:self-auto">
              {setupStepCount} OF 3 COMPLETED
            </span>
          </div>

          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-5">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full transition-all duration-500"
              style={{ width: `${(setupStepCount / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                hasAccount
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.03] border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    hasAccount ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {hasAccount ? '✓' : '1'}
                </div>
                <div>
                  <div className="text-xs font-bold">1. Add Account</div>
                  <div className="text-[11px] text-slate-400">Where cash is held</div>
                </div>
              </div>
              {!hasAccount && (
                <button
                  onClick={() => openQuickAdd('account')}
                  className="px-2.5 py-1 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-500"
                >
                  Add
                </button>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                hasIncome
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.03] border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    hasIncome ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {hasIncome ? '✓' : '2'}
                </div>
                <div>
                  <div className="text-xs font-bold">2. Add Income</div>
                  <div className="text-[11px] text-slate-400">Monthly salary/plan</div>
                </div>
              </div>
              {!hasIncome && (
                <button
                  onClick={() => openQuickAdd('income')}
                  className="px-2.5 py-1 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-500"
                >
                  Add
                </button>
              )}
            </div>

            {/* Step 3 */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                hasOutflow
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-white/[0.03] border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    hasOutflow ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {hasOutflow ? '✓' : '3'}
                </div>
                <div>
                  <div className="text-xs font-bold">3. First Outflow</div>
                  <div className="text-[11px] text-slate-400">Expense, bill or debt</div>
                </div>
              </div>
              {!hasOutflow && (
                <button
                  onClick={() => openQuickAdd('transaction')}
                  className="px-2.5 py-1 text-xs font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-500"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section: Financial Health Card (Left) + 4 Quick Stat Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Financial Health & Net Worth Card (4 Cols on desktop) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#14182b] to-[#0f121e] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                Financial Health
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  health.overall >= 80
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : health.overall >= 60
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                ● {health.label.toUpperCase()}
              </span>
            </div>

            {/* Animated Health Score Ring */}
            <div className="flex items-center gap-5 my-3">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-white/10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#health-gradient)"
                    strokeWidth="9"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * health.overall) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{health.overall}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">/ 100</span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="text-xs font-semibold text-slate-300">6-Pillar Health Score</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <div>Savings: <span className="font-bold text-slate-200">{health.factors.Savings}%</span></div>
                  <div>Debt: <span className="font-bold text-slate-200">{health.factors.Debt}%</span></div>
                  <div>Emergency: <span className="font-bold text-slate-200">{health.factors.Emergency}%</span></div>
                  <div>Budget: <span className="font-bold text-slate-200">{health.factors.Budget}%</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Live Net Worth</div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              {formatMoney(snapshot.netWorth, currency)}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Assets</div>
                <div className="font-bold text-emerald-400">{formatMoney(snapshot.assets, currency)}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Liabilities</div>
                <div className="font-bold text-rose-400">{formatMoney(snapshot.liabilities, currency)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick Stat Cards + Today's Snapshot (8 Cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Top Row: 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Monthly Income */}
            <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Income</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-white truncate">
                  {formatMoney(snapshot.monthlyIncome, currency)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {snapshot.usesRecurringIncomePlan
                    ? `Expected · ${formatMoney(snapshot.recordedIncome, currency)} received`
                    : 'Recorded this month'}
                </div>
              </div>
            </div>

            {/* Total Outflow */}
            <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Outflow</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-white truncate">
                  {formatMoney(snapshot.monthlyOutflow, currency)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  Expenses + Debt EMI
                </div>
              </div>
            </div>

            {/* Monthly Surplus */}
            <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Surplus</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-emerald-400 truncate">
                  {formatMoney(monthlySurplus, currency)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  Before upcoming goals
                </div>
              </div>
            </div>

            {/* Active Debt */}
            <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/30 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Debt</span>
                <CreditCard className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-black text-rose-400 truncate">
                  {formatMoney(snapshot.liabilities, currency)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {debts.length} open liability(s)
                </div>
              </div>
            </div>
          </div>

          {/* Today's Financial Snapshot Card */}
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Today's Financial Snapshot
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-bold text-purple-300 mb-0.5">Safe to Spend</div>
                <div className="text-base font-extrabold text-white">{formatMoney(safe.today, currency)}</div>
                <div className="text-[10px] text-slate-400">Available today</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Next Payment</div>
                <div className="text-base font-extrabold text-white">
                  {nextBill ? formatMoney(nextBill.amount, currency) : '—'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {nextBill ? nextBill.name : 'No bill due'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Emergency Fund</div>
                <div className="text-base font-extrabold text-emerald-400">
                  {formatMoney(snapshot.emergencyFund, currency)}
                </div>
                <div className="text-[10px] text-slate-400">Protected reserve</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Plan Health</div>
                <div className="text-base font-extrabold text-purple-400">{plan.score} / 100</div>
                <div className="text-[10px] text-slate-400">Monthly allocation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Cash Flow Area & Safe to Spend Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Safe to Spend Card (4 cols) */}
        <div className="lg:col-span-5 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                Daily Control
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                {safe.remainingDays} DAYS REMAINING
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1">Safe to Spend</h3>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight my-2">
              {formatMoney(safe.today, currency)}
              <span className="text-xs font-normal text-slate-400 ml-2">/ day</span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="my-4">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                <span>Flexible Envelope</span>
                <span>{formatMoney(safe.flexibleRemaining, currency)} left</span>
              </div>
              <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      safe.operatingCapacity > 0
                        ? Math.min(100, Math.max(0, (safe.flexibleRemaining / safe.operatingCapacity) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-4 text-xs">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Flexible Capacity</div>
                <div className="font-bold text-white">{formatMoney(safe.flexibleRemaining, currency)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Protected Buffer</div>
                <div className="font-bold text-amber-300">{formatMoney(safe.protectedReserve, currency)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{safe.explanation}</p>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <button
              onClick={() => setPage('plan')}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 font-bold text-xs flex items-center justify-between transition-colors border border-purple-500/20"
            >
              <span>View Monthly Allocation Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Action Queue (7 cols) */}
        <div className="lg:col-span-7 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                  Priority Queue
                </span>
                <h3 className="text-base font-bold text-white">What needs to happen next</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {recommendations.length} Signals
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, idx) => {
                const isCrit = rec.severity === 'CRITICAL' || rec.severity === 'WARNING';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                      isCrit
                        ? 'bg-rose-500/[0.07] border-rose-500/20 text-rose-200'
                        : rec.severity === 'ATTENTION'
                        ? 'bg-amber-500/[0.07] border-amber-500/20 text-amber-200'
                        : 'bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 mt-1 ${
                        isCrit ? 'bg-rose-500' : rec.severity === 'ATTENTION' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{rec.title}</div>
                      <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{rec.message}</div>
                      <div className="text-[11px] text-slate-400 italic mt-1.5">{rec.fact}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ask FINORA Brain Card Banner */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/20 p-4 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Ask FINORA Brain AI</div>
                <div className="text-[11px] text-slate-400">Verifiable calculations without guessing</div>
              </div>
            </div>
            <button
              onClick={() => setPage('brain')}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Ask Brain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
