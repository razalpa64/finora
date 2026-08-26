import React from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  Coins,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';

export const ReportsPage: React.FC = () => {
  const { brainState, currency } = useApp();
  const snapshot = brainState.snapshot;
  const health = brainState.health;

  const surplus = snapshot.recordedIncome - snapshot.monthlyOutflow;
  const surplusRate =
    snapshot.recordedIncome > 0 ? ((Math.max(0, surplus) / snapshot.recordedIncome) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryEntries = Object.entries(snapshot.expenseByCategory).sort((a, b) => b[1] - a[1]);
  const totalExpense = snapshot.monthlyExpenses;

  // Largest expense transaction
  const largestExpense = snapshot.transactions
    .filter((t) => t.type === 'EXPENSE')
    .sort((a, b) => b.amount - a.amount)[0];

  const colors = ['bg-purple-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-pink-500'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Decision Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Calculated from local records. No live market data, no invented comparisons.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 self-start sm:self-auto">
          Current Month Review
        </span>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Recorded Inflow
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatMoney(snapshot.recordedIncome, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recorded this month</div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Monthly Expenses
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatMoney(snapshot.monthlyExpenses, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Excludes transfers</div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Debt Reduction
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-400">
            {formatMoney(snapshot.monthlyDebtPayments, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recorded debt payments</div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Surplus Rate
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {surplusRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{formatMoney(Math.max(0, surplus), currency)} net surplus</div>
        </div>
      </div>

      {/* Grid: Spending Mix (7 cols) + Monthly Review (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Spending Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Spending Mix
              </span>
              <h3 className="text-base font-bold text-white">Where money went this month</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total: {formatMoney(totalExpense, currency)}
            </span>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl">
              No expenses recorded in the current calendar month.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {categoryEntries.map(([category, amount], idx) => {
                const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                const barColor = colors[idx % colors.length];
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                        <span className="font-semibold text-slate-200">{category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 font-mono">{pct.toFixed(1)}%</span>
                        <span className="font-bold text-white">{formatMoney(amount, currency)}</span>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Review Summary (5 cols) */}
        <div className="lg:col-span-5 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Monthly Review
            </span>
            <h3 className="text-base font-bold text-white mb-4">Financial Summary</h3>

            <div className="space-y-3 text-xs divide-y divide-white/5">
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Top Expense Category:</span>
                <span className="font-bold text-white">
                  {categoryEntries[0] ? `${categoryEntries[0][0]} (${formatMoney(categoryEntries[0][1], currency)})` : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Largest Single Expense:</span>
                <span className="font-bold text-white">
                  {largestExpense ? `${largestExpense.description} (${formatMoney(largestExpense.amount, currency)})` : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Current Net Worth:</span>
                <span className="font-bold text-purple-300">{formatMoney(snapshot.netWorth, currency)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">Active Goals Pace:</span>
                <span className="font-bold text-emerald-400">
                  {formatMoney(snapshot.plannedGoalContributions, currency)} / month
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-300">
            <div className="text-[10px] font-bold uppercase text-purple-300 mb-1">FINORA Insight</div>
            <p className="leading-relaxed">“{brainState.recommendations[0]?.message}”</p>
          </div>
        </div>
      </div>

      {/* 6-Pillar Health Score Breakdown */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Health Breakdown
          </span>
          <h3 className="text-base font-bold text-white">Internal Financial Pillars</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(health.factors).map(([factor, score]) => (
            <div key={factor} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">{factor}</div>
              <div className="text-xl font-extrabold text-white">{score} <span className="text-[10px] text-slate-500 font-normal">/ 100</span></div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-purple-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>This is an educational FINORA score, not a credit score or professional financial rating.</span>
        </div>
      </div>
    </div>
  );
};
