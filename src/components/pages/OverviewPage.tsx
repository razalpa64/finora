import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Plus,
  BrainCircuit,
  AlertTriangle,
  Layers,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const OverviewPage: React.FC = () => {
  const {
    currency,
    cashFlow,
    healthScore,
    emergencyFund,
    brainState,
    budgetAnalysis,
    debts,
    goals,
    transactions,
    openQuickAdd,
    setPage,
  } = useApp();

  const netSavings = cashFlow.netSavings;
  const isPositiveSavings = netSavings >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Real-time telemetry and health diagnostics connected to your Supabase cloud.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openQuickAdd('INCOME')}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => openQuickAdd('EXPENSE')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Monthly Income */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
              Total Inflows
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#10b981]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            {formatCurrency(cashFlow.totalIncome, currency)}
          </div>
          <div className="mt-2 flex items-center text-xs text-[#059669] font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
            <span>Active monthly run-rate</span>
          </div>
        </div>

        {/* Total Monthly Outflows */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
              Total Outflows
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center text-[#ef4444]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            {formatCurrency(cashFlow.totalExpenses, currency)}
          </div>
          <div className="mt-2 flex items-center text-xs text-[#dc2626] font-semibold">
            <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
            <span>Discretionary & fixed spending</span>
          </div>
        </div>

        {/* Net Monthly Cash Flow */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
              Net Surplus / Flow
            </span>
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isPositiveSavings
                  ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#10b981]'
                  : 'bg-[#fef2f2] border-[#fecaca] text-[#ef4444]'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isPositiveSavings ? 'text-[#059669]' : 'text-[#dc2626]'
            }`}
          >
            {formatCurrency(netSavings, currency)}
          </div>
          <div className="mt-2 text-xs font-semibold text-[#6b7280]">
            Savings Rate:{' '}
            <span className="font-bold text-[#111827]">
              {cashFlow.savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
              Health Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] border border-[#d8d3f8] flex items-center justify-center text-[#5a42e8]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {healthScore.score}
            </span>
            <span className="text-xs font-bold text-[#6b7280]">/ 100</span>
            <span
              className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                healthScore.score >= 80
                  ? 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]'
                  : healthScore.score >= 60
                  ? 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]'
                  : 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
              }`}
            >
              {healthScore.grade}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#6b7280] font-semibold truncate">
            {healthScore.status}
          </div>
        </div>
      </div>

      {/* Main Content Split: FINORA Brain Insights + Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: FINORA Brain Intelligence & Top Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* FINORA Brain Active Advice Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-[#f3f4f6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#5a42e8] text-white flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    FINORA Brain Insights
                  </h2>
                  <p className="text-[11px] text-[#6b7280]">
                    Deterministic rules & heuristic optimization engines
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPage('brain')}
                className="text-xs font-bold text-[#5a42e8] hover:text-[#432ec7] flex items-center gap-1 transition-colors"
              >
                <span>View All Signals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3">
              {brainState.recommendations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#9ca3af] bg-[#f9fafb] rounded-xl border border-dashed border-[#e5e7eb]">
                  No active warnings. Add your income, expenses, or debt to generate real-time financial telemetry.
                </div>
              ) : (
                brainState.recommendations.slice(0, 3).map((rec, idx) => {
                  const isCrit = rec.severity === 'CRITICAL' || rec.severity === 'WARNING';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border text-xs transition-all ${
                        isCrit
                          ? 'bg-[#fff5f5] border-[#fed7d7] text-[#9b2c2c]'
                          : rec.severity === 'ATTENTION'
                          ? 'bg-[#fffdf0] border-[#feebc8] text-[#744210]'
                          : 'bg-[#f0fff4] border-[#c6f6d5] text-[#22543d]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs">{rec.title}</div>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/70">
                          {rec.severity}
                        </span>
                      </div>
                      <p className="text-[#4b5563] text-xs mt-1 leading-relaxed">
                        {rec.message}
                      </p>
                      <div className="mt-2 text-[11px] text-[#6b7280] italic flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#5a42e8]" />
                        <span>{rec.fact}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Ledger Transactions */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-[#f3f4f6] pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#111827]">
                  Recent Activity
                </h2>
                <p className="text-[11px] text-[#6b7280]">
                  Latest inflows and verified expense records
                </p>
              </div>
              <button
                onClick={() => setPage('transactions')}
                className="text-xs font-bold text-[#5a42e8] hover:text-[#432ec7] flex items-center gap-1 transition-colors"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center bg-[#f9fafb] rounded-xl border border-dashed border-[#e5e7eb]">
                <div className="text-xs text-[#6b7280] font-medium">
                  No transactions recorded yet.
                </div>
                <button
                  onClick={() => openQuickAdd('EXPENSE')}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#5a42e8] text-white text-xs font-bold hover:bg-[#4a34db] transition-colors"
                >
                  Record First Expense
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#f3f4f6]">
                {transactions.slice(0, 5).map((t) => {
                  const isExpense = t.type === 'EXPENSE';
                  return (
                    <div
                      key={t.id}
                      className="py-3 flex items-center justify-between text-xs hover:bg-[#f9fafb] px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isExpense
                              ? 'bg-[#fee2e2] text-[#dc2626]'
                              : 'bg-[#dcfce7] text-[#16a34a]'
                          }`}
                        >
                          {isExpense ? '-' : '+'}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827]">
                            {t.category}
                          </div>
                          <div className="text-[11px] text-[#6b7280]">
                            {t.description || t.date} • {t.date}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`font-extrabold text-sm ${
                          isExpense ? 'text-[#dc2626]' : 'text-[#16a34a]'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(t.amount, currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: 50/30/20 Rule + Emergency Fund + Goals */}
        <div className="space-y-6">
          {/* 50 / 30 / 20 Budget Health */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">
              50 / 30 / 20 Budget Ratio
            </h3>

            <div className="space-y-3">
              {/* Needs */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#374151]">Needs (50% max)</span>
                  <span className="text-[#111827] font-bold">
                    {budgetAnalysis.needsActualPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetAnalysis.needsStatus === 'OVER_BUDGET'
                        ? 'bg-[#ef4444]'
                        : 'bg-[#3b82f6]'
                    }`}
                    style={{
                      width: `${Math.min(100, budgetAnalysis.needsActualPercent)}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[#6b7280] mt-0.5">
                  Target: {formatCurrency(budgetAnalysis.needsTarget, currency)} | Actual: {formatCurrency(budgetAnalysis.needsActual, currency)}
                </div>
              </div>

              {/* Wants */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#374151]">Wants (30% max)</span>
                  <span className="text-[#111827] font-bold">
                    {budgetAnalysis.wantsActualPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetAnalysis.wantsStatus === 'OVER_BUDGET'
                        ? 'bg-[#ef4444]'
                        : 'bg-[#8b5cf6]'
                    }`}
                    style={{
                      width: `${Math.min(100, budgetAnalysis.wantsActualPercent)}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[#6b7280] mt-0.5">
                  Target: {formatCurrency(budgetAnalysis.wantsTarget, currency)} | Actual: {formatCurrency(budgetAnalysis.wantsActual, currency)}
                </div>
              </div>

              {/* Savings */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-[#374151]">Savings (20% min)</span>
                  <span className="text-[#111827] font-bold">
                    {budgetAnalysis.savingsActualPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetAnalysis.savingsStatus === 'UNDER_TARGET'
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#10b981]'
                    }`}
                    style={{
                      width: `${Math.min(100, budgetAnalysis.savingsActualPercent)}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-[#6b7280] mt-0.5">
                  Target: {formatCurrency(budgetAnalysis.savingsTarget, currency)} | Actual: {formatCurrency(budgetAnalysis.savingsActual, currency)}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Fund Runway */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Emergency Runway
              </span>
              <ShieldCheck className="w-4 h-4 text-[#5a42e8]" />
            </div>

            <div className="text-2xl font-extrabold text-[#111827]">
              {emergencyFund.monthsOfRunway.toFixed(1)}{' '}
              <span className="text-xs font-normal text-[#6b7280]">months</span>
            </div>

            <div className="mt-2 text-xs text-[#4b5563]">
              Target: 3 to 6 months ({formatCurrency(emergencyFund.targetFundAmount, currency)})
            </div>

            <div className="mt-3 h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5a42e8] rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (emergencyFund.monthsOfRunway / 6) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-1 text-[10px] text-[#6b7280]">
              Current Reserve: {formatCurrency(emergencyFund.currentEmergencyFund, currency)}
            </div>
          </div>

          {/* Active Goals Quick Status */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Target Goals ({goals.length})
              </span>
              <Target className="w-4 h-4 text-[#5a42e8]" />
            </div>

            {goals.length === 0 ? (
              <div className="text-xs text-[#6b7280] py-2">
                No active savings goals. Set up a target in the Goals page.
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((g) => {
                  const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
                  return (
                    <div key={g.id} className="text-xs">
                      <div className="flex justify-between font-semibold text-[#111827] mb-1">
                        <span className="truncate">{g.name}</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5a42e8] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
