import React, { useState } from 'react';
import {
  PieChart,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const PlanPage: React.FC = () => {
  const {
    cashFlow,
    budgetAnalysis,
    emergencyFund,
    currency,
    emergencyFundMonths,
    setEmergencyFundMonths,
    openQuickAdd,
  } = useApp();

  const [simulatedIncome, setSimulatedIncome] = useState<string>(
    cashFlow.totalIncome > 0 ? cashFlow.totalIncome.toString() : '5000'
  );

  const parsedSimulatedIncome = parseFloat(simulatedIncome) || 0;
  const simNeeds = parsedSimulatedIncome * 0.5;
  const simWants = parsedSimulatedIncome * 0.3;
  const simSavings = parsedSimulatedIncome * 0.2;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Plan & Budget Engineering
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            50/30/20 allocation rules, emergency liquidity reserve, and cash flow modeling.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('EXPENSE')}
          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <span>Adjust Budget Item</span>
        </button>
      </div>

      {/* 50 / 30 / 20 Framework Card */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">
                The 50 / 30 / 20 Rule Allocation
              </h2>
              <p className="text-xs text-[#6b7280]">
                Actual vs Target breakdown based on active monthly inflows of {formatCurrency(cashFlow.totalIncome, currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Needs */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                Needs (Max 50%)
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  budgetAnalysis.needsStatus === 'OVER_BUDGET'
                    ? 'bg-[#fee2e2] text-[#dc2626]'
                    : 'bg-[#dcfce7] text-[#16a34a]'
                }`}
              >
                {budgetAnalysis.needsStatus}
              </span>
            </div>

            <div className="text-2xl font-extrabold text-[#111827]">
              {formatCurrency(budgetAnalysis.needsActual, currency)}
            </div>
            <div className="text-xs text-[#6b7280] mt-1">
              Target: {formatCurrency(budgetAnalysis.needsTarget, currency)} (
              {budgetAnalysis.needsActualPercent.toFixed(1)}% of income)
            </div>

            <div className="mt-4 h-2.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetAnalysis.needsActualPercent > 50 ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'
                }`}
                style={{ width: `${Math.min(100, budgetAnalysis.needsActualPercent)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-[#6b7280]">
              Housing, utilities, groceries, insurance, minimum debt obligations.
            </div>
          </div>

          {/* Wants */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                Wants (Max 30%)
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  budgetAnalysis.wantsStatus === 'OVER_BUDGET'
                    ? 'bg-[#fee2e2] text-[#dc2626]'
                    : 'bg-[#dcfce7] text-[#16a34a]'
                }`}
              >
                {budgetAnalysis.wantsStatus}
              </span>
            </div>

            <div className="text-2xl font-extrabold text-[#111827]">
              {formatCurrency(budgetAnalysis.wantsActual, currency)}
            </div>
            <div className="text-xs text-[#6b7280] mt-1">
              Target: {formatCurrency(budgetAnalysis.wantsTarget, currency)} (
              {budgetAnalysis.wantsActualPercent.toFixed(1)}% of income)
            </div>

            <div className="mt-4 h-2.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetAnalysis.wantsActualPercent > 30 ? 'bg-[#ef4444]' : 'bg-[#8b5cf6]'
                }`}
                style={{ width: `${Math.min(100, budgetAnalysis.wantsActualPercent)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-[#6b7280]">
              Dining out, entertainment, subscriptions, shopping, vacations.
            </div>
          </div>

          {/* Savings */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                Savings / Debt (Min 20%)
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  budgetAnalysis.savingsStatus === 'UNDER_TARGET'
                    ? 'bg-[#fef3c7] text-[#d97706]'
                    : 'bg-[#dcfce7] text-[#16a34a]'
                }`}
              >
                {budgetAnalysis.savingsStatus}
              </span>
            </div>

            <div className="text-2xl font-extrabold text-[#111827]">
              {formatCurrency(budgetAnalysis.savingsActual, currency)}
            </div>
            <div className="text-xs text-[#6b7280] mt-1">
              Target: {formatCurrency(budgetAnalysis.savingsTarget, currency)} (
              {budgetAnalysis.savingsActualPercent.toFixed(1)}% of income)
            </div>

            <div className="mt-4 h-2.5 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10b981] transition-all"
                style={{ width: `${Math.min(100, budgetAnalysis.savingsActualPercent)}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-[#6b7280]">
              Emergency fund additions, extra debt payoffs, index fund investments.
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Fund Reserve Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-[#111827]">
              Emergency Fund Telemetry
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#4b5563] font-medium">Target Months Runway:</span>
              <div className="flex items-center gap-1">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEmergencyFundMonths(m)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      emergencyFundMonths === m
                        ? 'bg-[#5a42e8] text-white'
                        : 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]'
                    }`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#6b7280]">Monthly Baseline Burn:</span>
                <span className="font-bold text-[#111827]">
                  {formatCurrency(emergencyFund.monthlyExpenses, currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b7280]">Target Reserve ({emergencyFundMonths} mo):</span>
                <span className="font-bold text-[#111827]">
                  {formatCurrency(emergencyFund.targetFundAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6b7280]">Current Reserve:</span>
                <span className="font-bold text-[#111827]">
                  {formatCurrency(emergencyFund.currentEmergencyFund, currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-[#e5e7eb]">
                <span className="text-[#6b7280]">Shortfall / Gap:</span>
                <span
                  className={`font-extrabold ${
                    emergencyFund.gapAmount > 0 ? 'text-[#dc2626]' : 'text-[#16a34a]'
                  }`}
                >
                  {formatCurrency(emergencyFund.gapAmount, currency)}
                </span>
              </div>
            </div>

            <div className="text-xs text-[#4b5563]">
              Status: <span className="font-bold text-[#111827]">{emergencyFund.status}</span>
            </div>
          </div>
        </div>

        {/* What-If Income Scenario Simulator */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-[#111827]">
              What-If Scenario Simulator
            </h2>
          </div>

          <p className="text-xs text-[#6b7280] mb-4">
            Simulate how a salary raise or freelance income expansion modifies your optimal 50/30/20 thresholds.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#374151] mb-1">
                Hypothetical Monthly Net Income
              </label>
              <input
                type="number"
                value={simulatedIncome}
                onChange={(e) => setSimulatedIncome(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] focus:ring-1 focus:ring-[#5a42e8] outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Max Needs Budget (50%):</span>
                <span className="font-bold text-[#1e293b]">
                  {formatCurrency(simNeeds, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Max Wants Budget (30%):</span>
                <span className="font-bold text-[#1e293b]">
                  {formatCurrency(simWants, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Target Wealth Savings (20%):</span>
                <span className="font-bold text-[#10b981]">
                  {formatCurrency(simSavings, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
