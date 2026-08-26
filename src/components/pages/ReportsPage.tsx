import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
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
    currency,
  } = useApp();

  const [forecastMonths, setForecastMonths] = useState(12);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Financial Reports & Multi-Year Forecast
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Compound wealth projection models, savings rate analytics, and category breakdowns.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#6b7280]" />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* Multi-Month Growth Projection Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4 mb-5">
          <div>
            <h2 className="text-base font-extrabold text-[#111827]">
              Compound Growth Simulation
            </h2>
            <p className="text-xs text-[#6b7280]">
              Projected net worth trajectory with monthly surplus ({formatCurrency(cashFlow.netSavings, currency)}/mo) at 7% real compounding.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[6, 12, 24, 60].map((m) => (
              <button
                key={m}
                onClick={() => setForecastMonths(m)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
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
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-semibold">
                <th className="p-3">Timeline</th>
                <th className="p-3">Cumulative Contributed</th>
                <th className="p-3">Estimated Investment Yield (7%)</th>
                <th className="p-3 font-bold text-[#111827]">Projected Asset Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {[1, 3, 6, 12, 24, 36, 60]
                .filter((m) => m <= forecastMonths)
                .map((m) => {
                  const monthlyFlow = Math.max(0, cashFlow.netSavings);
                  const contributed = monthlyFlow * m;
                  const monthlyRate = 0.07 / 12;
                  // Future value of annuity: PMT * (((1 + r)^n - 1) / r)
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
                      <td className="p-3 font-extrabold text-[#5a42e8] text-sm">
                        {formatCurrency(fv, currency)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
            Cash Flow Health Metrics
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Total Monthly Inflow:</span>
              <span className="font-bold text-[#111827]">{formatCurrency(cashFlow.totalIncome, currency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Total Monthly Outflow:</span>
              <span className="font-bold text-[#111827]">{formatCurrency(cashFlow.totalExpenses, currency)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Net Savings Surplus:</span>
              <span className={`font-extrabold ${cashFlow.netSavings >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                {formatCurrency(cashFlow.netSavings, currency)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Current Savings Rate:</span>
              <span className="font-bold text-[#111827]">{cashFlow.savingsRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6b7280]">Composite Health Score:</span>
              <span className="font-extrabold text-[#5a42e8]">{healthScore.score} / 100 ({healthScore.grade})</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
            Spending Category Breakdown
          </h3>
          {transactions.length === 0 ? (
            <div className="text-xs text-[#6b7280] py-8 text-center">
              No transactions recorded to build category analytics.
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from(new Set(transactions.filter((t) => t.type === 'EXPENSE').map((t) => t.category))).map((cat) => {
                const totalInCat = transactions
                  .filter((t) => t.type === 'EXPENSE' && t.category === cat)
                  .reduce((s, t) => s + t.amount, 0);
                const totalExp = cashFlow.totalExpenses || 1;
                const pct = (totalInCat / totalExp) * 100;

                return (
                  <div key={cat} className="text-xs">
                    <div className="flex justify-between font-semibold text-[#111827] mb-1">
                      <span>{cat}</span>
                      <span>{formatCurrency(totalInCat, currency)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5a42e8] rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
