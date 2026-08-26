import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
  Printer,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const ReportsPage: React.FC = () => {
  const {
    cashFlow,
    forecast,
    budgetAnalysis,
    healthScore,
    transactions,
    debts,
    goals,
    accounts,
    currency,
  } = useApp();

  const [forecastMonths, setForecastMonths] = useState(12);

  // Top spending category
  const expenseCategories: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'EXPENSE') {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    }
  }

  const sortedCategories = Object.entries(expenseCategories).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

  // Largest single expense
  const expensesOnly = transactions.filter((t) => t.type === 'EXPENSE');
  const largestExpense = expensesOnly.length > 0 ? [...expensesOnly].sort((a, b) => b.amount - a.amount)[0] : null;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            FINANCIAL INTELLIGENCE
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Reports & Multi-Year Forecast
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Spending mix by category, 6-pillar health diagnostics, and multi-year compound growth projections.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#111827] shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#6b7280]" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Monthly Review Scorecard (Matching JavaFX monthlyReview) */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
          <div>
            <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
              MONTHLY AUDIT
            </div>
            <h2 className="text-sm font-bold text-[#111827]">
              Current Month Diagnostic Review
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f6] text-[#4b5563]">
            Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Top Expense Category</div>
            <div className="text-base font-extrabold text-[#111827] mt-1 truncate">
              {topCategory ? topCategory[0] : 'None recorded'}
            </div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">
              {topCategory ? formatCurrency(topCategory[1], currency) : '$0'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Largest Single Outflow</div>
            <div className="text-base font-extrabold text-[#111827] mt-1 truncate">
              {largestExpense ? largestExpense.category : 'None'}
            </div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">
              {largestExpense ? formatCurrency(largestExpense.amount, currency) : '$0'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Savings Rate</div>
            <div className="text-base font-extrabold text-[#059669] mt-1">
              {cashFlow.savingsRate}%
            </div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">
              Target: 20% min.
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Composite Health</div>
            <div className="text-base font-extrabold text-[#5a42e8] mt-1">
              {healthScore.score} / 100
            </div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">
              Grade: {healthScore.grade}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Year Growth Simulation Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f3f4f6] pb-4 mb-5">
          <div>
            <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
              PROJECTIONS
            </div>
            <h2 className="text-base font-extrabold text-[#111827]">
              Multi-Year Compound Asset Trajectory
            </h2>
            <p className="text-xs text-[#6b7280]">
              Assuming monthly surplus ({formatCurrency(cashFlow.netSavings, currency)}/mo) invested at 7% real compound yield.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[6, 12, 24, 60].map((m) => (
              <button
                key={m}
                onClick={() => setForecastMonths(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  forecastMonths === m
                    ? 'bg-[#5a42e8] text-white'
                    : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                }`}
              >
                {m >= 12 ? `${m / 12} yr` : `${m} mo`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-bold">
                <th className="p-3">Timeline Milestone</th>
                <th className="p-3">Cumulative Contributed</th>
                <th className="p-3">Estimated Investment Yield (7%)</th>
                <th className="p-3 font-extrabold text-[#111827]">Projected Asset Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {[1, 3, 6, 12, 24, 36, 60]
                .filter((m) => m <= forecastMonths)
                .map((m) => {
                  const monthlyFlow = Math.max(0, cashFlow.netSavings);
                  const contributed = monthlyFlow * m;
                  const monthlyRate = 0.07 / 12;
                  const fv = monthlyFlow * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate);
                  const yieldEarned = Math.max(0, fv - contributed);

                  return (
                    <tr key={m} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="p-3 font-bold text-[#111827]">
                        {m < 12 ? `Month ${m}` : `Year ${m / 12} (${m} months)`}
                      </td>
                      <td className="p-3 text-[#4b5563]">
                        {formatCurrency(contributed, currency)}
                      </td>
                      <td className="p-3 text-[#059669] font-semibold">
                        +{formatCurrency(yieldEarned, currency)}
                      </td>
                      <td className="p-3 font-black text-[#5a42e8] text-sm">
                        {formatCurrency(fv, currency)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spending Breakdown by Category */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
          Spending Mix by Category
        </h3>

        {sortedCategories.length === 0 ? (
          <div className="text-xs text-[#6b7280] py-6 text-center">
            No expense transactions recorded to build category analytics.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([cat, amt]) => {
              const totalExp = cashFlow.totalExpenses || 1;
              const pct = (amt / totalExp) * 100;

              return (
                <div key={cat} className="text-xs">
                  <div className="flex justify-between font-semibold text-[#111827] mb-1">
                    <span>{cat}</span>
                    <span>{formatCurrency(amt, currency)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5a42e8] rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
