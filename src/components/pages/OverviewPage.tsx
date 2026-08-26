import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Plus,
  Brain,
  Layers,
  ChevronRight,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const OverviewPage: React.FC = () => {
  const {
    currentProfile,
    currency,
    cashFlow,
    healthScore,
    emergencyFund,
    brainState,
    budgetAnalysis,
    debts,
    goals,
    bills,
    accounts,
    transactions,
    incomeSources,
    openQuickAdd,
    setPage,
  } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = currentProfile?.displayName || 'User';

  const hasAccount = accounts.length > 0;
  const hasIncome = incomeSources.length > 0;
  const hasActivity = transactions.length > 0 || bills.length > 0 || debts.length > 0;
  const showSetupGuide = !(hasAccount && hasIncome && hasActivity);

  const completedSteps = (hasAccount ? 1 : 0) + (hasIncome ? 1 : 0) + (hasActivity ? 1 : 0);

  // Safe to spend metrics
  const safeToday = brainState.safeToSpend.today;
  const safeExplanation = brainState.safeToSpend.explanation;
  const remainingDays = brainState.safeToSpend.remainingDays;

  // Next due bill
  const upcomingBills = bills.filter((b) => !b.paid).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const nextBill = upcomingBills.length > 0 ? upcomingBills[0] : null;

  // Assets & Liabilities
  const totalAssets = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const totalLiabilities = debts.reduce((s, d) => s + (d.currentBalance || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            FINANCIAL COMMAND CENTER
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            {greeting}, {displayName}
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Calculated only from the records in your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            CLOUD WORKSPACE
          </span>
        </div>
      </div>

      {/* 3-Step Guided Setup Card (Faithful to JavaFX setupGuideCard) */}
      {showSetupGuide && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
                GUIDED SETUP
              </div>
              <h2 className="text-base font-extrabold text-[#111827]">
                Set up FINORA in three steps
              </h2>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#f3f4f6] text-[#4b5563]">
              {completedSteps} OF 3 COMPLETE
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5a42e8] rounded-full transition-all"
              style={{ width: `${(completedSteps / 3) * 100}%` }}
            />
          </div>

          <p className="text-xs text-[#4b5563]">
            Complete these steps in order. FINORA will recalculate the dashboard automatically after every entry.
          </p>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasAccount ? 'bg-[#10b981] text-white' : 'bg-[#5a42e8] text-white'
                  }`}
                >
                  {hasAccount ? '✓' : '1'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Create an account</div>
                  <div className="text-[11px] text-[#6b7280]">Tell FINORA where money is held.</div>
                </div>
              </div>
              <button
                onClick={() => setPage('settings')}
                disabled={hasAccount}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  hasAccount
                    ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-default'
                    : 'bg-white border border-[#d1d5db] text-[#111827] hover:bg-[#f9fafb]'
                }`}
              >
                {hasAccount ? 'Completed' : 'Add account'}
              </button>
            </div>

            {/* Step 2 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasIncome ? 'bg-[#10b981] text-white' : 'bg-[#5a42e8] text-white'
                  }`}
                >
                  {hasIncome ? '✓' : '2'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Add monthly income</div>
                  <div className="text-[11px] text-[#6b7280]">Create the income plan used by budgets and forecasts.</div>
                </div>
              </div>
              <button
                onClick={() => setPage('income')}
                disabled={hasIncome}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  hasIncome
                    ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-default'
                    : 'bg-white border border-[#d1d5db] text-[#111827] hover:bg-[#f9fafb]'
                }`}
              >
                {hasIncome ? 'Completed' : 'Add income'}
              </button>
            </div>

            {/* Step 3 */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    hasActivity ? 'bg-[#10b981] text-white' : 'bg-[#5a42e8] text-white'
                  }`}
                >
                  {hasActivity ? '✓' : '3'}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#111827]">Record your first outflow</div>
                  <div className="text-[11px] text-[#6b7280]">Add spending, a bill or a debt so priorities become useful.</div>
                </div>
              </div>
              <button
                onClick={() => openQuickAdd('EXPENSE')}
                disabled={hasActivity}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  hasActivity
                    ? 'bg-[#f3f4f6] text-[#9ca3af] cursor-default'
                    : 'bg-white border border-[#d1d5db] text-[#111827] hover:bg-[#f9fafb]'
                }`}
              >
                {hasActivity ? 'Completed' : 'Add transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Grid: Health Score Card (Left) + 4 Stat Cards & Daily Snapshot (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Financial Health Score Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#f3f4f6] pb-3">
              <div>
                <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
                  FINANCIAL HEALTH
                </div>
                <h3 className="text-base font-extrabold text-[#111827]">
                  Composite Health Score
                </h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  healthScore.score >= 80
                    ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                    : healthScore.score >= 60
                    ? 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]'
                    : 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
                }`}
              >
                {healthScore.grade} · {healthScore.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-[#111827] tracking-tight">
                {healthScore.score}
              </span>
              <span className="text-sm font-bold text-[#6b7280]">/ 100</span>
            </div>

            {/* Net Worth mini bar */}
            <div className="mt-5 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-[#64748b]">Total Net Worth:</span>
                <span className={`font-extrabold ${netWorth >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                  {formatCurrency(netWorth, currency)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-[#6b7280]">
                <span>Assets: {formatCurrency(totalAssets, currency)}</span>
                <span>Liabilities: {formatCurrency(totalLiabilities, currency)}</span>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="mt-5 space-y-2.5">
              {Object.entries(healthScore.factors).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <div className="flex justify-between font-semibold text-[#374151] mb-1">
                    <span>{k}</span>
                    <span>{v}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5a42e8] rounded-full"
                      style={{ width: `${Math.min(100, v)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#f3f4f6] text-[10px] text-[#6b7280] italic">
            Calculated deterministically from cash flow, emergency reserve & debt exposure.
          </div>
        </div>

        {/* Right 8 cols: 4 Stat Cards + Daily Snapshot */}
        <div className="lg:col-span-8 space-y-5">
          {/* 4 Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Monthly Income */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
                MONTHLY INCOME
              </div>
              <div className="mt-2 text-lg sm:text-xl font-black text-[#111827]">
                {formatCurrency(cashFlow.totalIncome, currency)}
              </div>
              <div className="mt-1 text-[10px] text-[#059669] font-medium truncate">
                Expected recurring
              </div>
            </div>

            {/* Total Outflow */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
                TOTAL OUTFLOW
              </div>
              <div className="mt-2 text-lg sm:text-xl font-black text-[#111827]">
                {formatCurrency(cashFlow.totalExpenses, currency)}
              </div>
              <div className="mt-1 text-[10px] text-[#6b7280] font-medium truncate">
                Expenses + Debt
              </div>
            </div>

            {/* Monthly Surplus */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
                MONTHLY SURPLUS
              </div>
              <div
                className={`mt-2 text-lg sm:text-xl font-black ${
                  cashFlow.netSavings >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'
                }`}
              >
                {formatCurrency(cashFlow.netSavings, currency)}
              </div>
              <div className="mt-1 text-[10px] text-[#059669] font-medium truncate">
                Rate: {cashFlow.savingsRate}%
              </div>
            </div>

            {/* Active Debt */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-3.5 shadow-xs">
              <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
                ACTIVE DEBT
              </div>
              <div className="mt-2 text-lg sm:text-xl font-black text-[#dc2626]">
                {formatCurrency(totalLiabilities, currency)}
              </div>
              <div className="mt-1 text-[10px] text-[#6b7280] font-medium truncate">
                {debts.length} open obligations
              </div>
            </div>
          </div>

          {/* Today's Daily Snapshot Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5a42e8]" />
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Today's Financial Snapshot
                </h3>
              </div>
              <span className="text-[10px] text-[#6b7280]">
                {remainingDays} days remaining in month
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Safe to Spend Today */}
              <div className="p-3.5 rounded-xl bg-[#f3f1fc] border border-[#e9e5f8]">
                <div className="text-[10px] font-bold text-[#5a42e8] uppercase tracking-wider">
                  Safe to Spend Today
                </div>
                <div className="text-xl font-black text-[#5a42e8] mt-1">
                  {formatCurrency(safeToday, currency)}
                </div>
                <div className="text-[10px] text-[#6b7280] mt-1 leading-tight">
                  Protected with a 30% cash-flow buffer across {remainingDays} days.
                </div>
              </div>

              {/* Next Due Bill */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                  Next Due Bill
                </div>
                <div className="text-base font-bold text-[#111827] mt-1 truncate">
                  {nextBill ? nextBill.name : 'No bills pending'}
                </div>
                <div className="text-[10px] text-[#6b7280] mt-1">
                  {nextBill
                    ? `${formatCurrency(nextBill.amount, currency)} due ${nextBill.dueDate}`
                    : 'All obligations up to date'}
                </div>
              </div>

              {/* Emergency Reserve */}
              <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                  Emergency Runway
                </div>
                <div className="text-base font-bold text-[#111827] mt-1">
                  {emergencyFund.monthsOfRunway} months
                </div>
                <div className="text-[10px] text-[#6b7280] mt-1">
                  Target: 6 months ({formatCurrency(emergencyFund.targetFundAmount, currency)})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Priorities Action Queue & FINORA Brain Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Priority Action Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3 mb-4">
            <div>
              <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
                PRIORITY QUEUE
              </div>
              <h3 className="text-sm font-bold text-[#111827]">
                Active Financial Actions
              </h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f3f4f6] text-[#4b5563]">
              Ranked by Urgency
            </span>
          </div>

          <div className="space-y-3">
            {brainState.recommendations.map((rec, i) => {
              const isCrit = rec.severity === 'CRITICAL' || rec.severity === 'WARNING';
              const isAttn = rec.severity === 'ATTENTION';

              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                    isCrit
                      ? 'bg-[#fff5f5] border-[#fed7d7] text-[#9b2c2c]'
                      : isAttn
                      ? 'bg-[#fffdf0] border-[#feebc8] text-[#744210]'
                      : 'bg-[#f0fff4] border-[#c6f6d5] text-[#22543d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs">{rec.title}</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/70">
                      {rec.severity}
                    </span>
                  </div>
                  <p className="text-[#4b5563] text-xs leading-relaxed">{rec.message}</p>
                  <div className="text-[10px] text-[#6b7280] italic pt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#5a42e8]" />
                    <span>{rec.fact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FINORA Brain Quick Launcher Card (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#5a42e8]" />
                <h3 className="text-sm font-bold text-[#111827]">
                  FINORA Brain AI
                </h3>
              </div>
              <button
                onClick={() => setPage('brain')}
                className="text-xs font-bold text-[#5a42e8] hover:text-[#4a34db] flex items-center gap-1 cursor-pointer"
              >
                <span>Open Assistant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#6b7280] mb-4 leading-relaxed">
              Ask deterministic questions derived straight from your stored balances and transactions:
            </p>

            <div className="space-y-2">
              {[
                'What is safe to spend today?',
                'Who should I pay first?',
                'Can I afford a $500 discretionary purchase?',
                'What if my income drops 20%?',
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage('brain')}
                  className="w-full p-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f3f1fc] border border-[#e2e8f0] hover:border-[#d8d3f8] text-left text-xs font-semibold text-[#374151] hover:text-[#5a42e8] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>"{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 text-[10px] text-[#6b7280] italic border-t border-[#f3f4f6] mt-4">
            Zero hallucinations · Verified mathematical logic only
          </div>
        </div>
      </div>
    </div>
  );
};
