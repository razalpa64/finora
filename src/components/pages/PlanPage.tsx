import React, { useState } from 'react';
import {
  PieChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Sliders,
  AlertTriangle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const PlanPage: React.FC = () => {
  const {
    cashFlow,
    budgetAnalysis,
    emergencyFund,
    brainState,
    debts,
    currency,
    emergencyFundMonths,
    setEmergencyFundMonths,
    setPage,
  } = useApp();

  // Income shock simulation percentage (-50% to +50%)
  const [shockPercent, setShockPercent] = useState<number>(0);

  const baseIncome = cashFlow.totalIncome;
  const shockFactor = 1 + shockPercent / 100;
  const simulatedIncome = Math.max(0, baseIncome * shockFactor);
  const incomeDrop = baseIncome - simulatedIncome;

  const plan = brainState.monthlyPlan;
  const flexibleCapacity = plan.flexible + plan.reserve;
  const shockExceedsCapacity = shockPercent < 0 && Math.abs(incomeDrop) > flexibleCapacity;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            ALLOCATION CONTROL
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Monthly Plan & Budget Engine
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Priority-based suggested allocation, 50/30/20 rules, and real-time income shock stress testing.
          </p>
        </div>

        <button
          onClick={() => setPage('income')}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#111827] shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          Adjust Income Assumptions
        </button>
      </div>

      {/* Suggested Allocation Cards (Essentials, Debt & EMI, Emergency, Goals, Investments, Flexible, Reserve) */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3 mb-5">
          <div>
            <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
              PRIORITY ALLOCATION
            </div>
            <h2 className="text-sm font-bold text-[#111827]">
              Suggested Monthly Allocation Framework
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f6] text-[#4b5563]">
            Income Base: {formatCurrency(baseIncome, currency)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          {/* Essentials */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Essentials</div>
            <div className="text-base font-extrabold text-[#111827] mt-1">
              {formatCurrency(plan.essentials, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Housing & needs</div>
          </div>

          {/* Debt & EMI */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Debt & EMI</div>
            <div className="text-base font-extrabold text-[#dc2626] mt-1">
              {formatCurrency(plan.debtAndEmi, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Required min.</div>
          </div>

          {/* Emergency Reserve */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Emergency</div>
            <div className="text-base font-extrabold text-[#10b981] mt-1">
              {formatCurrency(plan.emergencySavings, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Reserve funding</div>
          </div>

          {/* Goals */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Goals</div>
            <div className="text-base font-extrabold text-[#5a42e8] mt-1">
              {formatCurrency(plan.goals, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Milestone targets</div>
          </div>

          {/* Investments */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Investments</div>
            <div className="text-base font-extrabold text-[#111827] mt-1">
              {formatCurrency(plan.investments, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Long-term wealth</div>
          </div>

          {/* Flexible Capacity */}
          <div className="p-3.5 rounded-xl bg-[#f3f1fc] border border-[#e9e5f8]">
            <div className="text-[10px] font-bold text-[#5a42e8] uppercase">Flexible</div>
            <div className="text-base font-extrabold text-[#5a42e8] mt-1">
              {formatCurrency(plan.flexible, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Discretionary</div>
          </div>

          {/* Reserve Buffer */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[10px] font-bold text-[#64748b] uppercase">Cash Reserve</div>
            <div className="text-base font-extrabold text-[#111827] mt-1">
              {formatCurrency(plan.reserve, currency)}
            </div>
            <div className="text-[9px] text-[#6b7280] mt-0.5">Safety cushion</div>
          </div>
        </div>
      </div>

      {/* 50 / 30 / 20 Framework Card */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
          The 50 / 30 / 20 Rule Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Needs */}
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Needs (50% Target)</span>
              <span className={budgetAnalysis.needsStatus === 'OVER_BUDGET' ? 'text-[#dc2626]' : 'text-[#059669]'}>
                {budgetAnalysis.needsActualPercent}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${budgetAnalysis.needsActualPercent > 50 ? 'bg-[#ef4444]' : 'bg-[#3b82f6]'}`}
                style={{ width: `${Math.min(100, budgetAnalysis.needsActualPercent)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#6b7280] flex justify-between">
              <span>Actual: {formatCurrency(budgetAnalysis.needsActual, currency)}</span>
              <span>Target: {formatCurrency(budgetAnalysis.needsTarget, currency)}</span>
            </div>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Wants (30% Target)</span>
              <span className={budgetAnalysis.wantsStatus === 'OVER_BUDGET' ? 'text-[#dc2626]' : 'text-[#059669]'}>
                {budgetAnalysis.wantsActualPercent}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${budgetAnalysis.wantsActualPercent > 30 ? 'bg-[#ef4444]' : 'bg-[#8b5cf6]'}`}
                style={{ width: `${Math.min(100, budgetAnalysis.wantsActualPercent)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#6b7280] flex justify-between">
              <span>Actual: {formatCurrency(budgetAnalysis.wantsActual, currency)}</span>
              <span>Target: {formatCurrency(budgetAnalysis.wantsTarget, currency)}</span>
            </div>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Savings (20% Target)</span>
              <span className={budgetAnalysis.savingsStatus === 'UNDER_TARGET' ? 'text-[#d97706]' : 'text-[#059669]'}>
                {budgetAnalysis.savingsActualPercent}%
              </span>
            </div>
            <div className="h-2 w-full bg-[#e2e8f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10b981]"
                style={{ width: `${Math.min(100, budgetAnalysis.savingsActualPercent)}%` }}
              />
            </div>
            <div className="text-[11px] text-[#6b7280] flex justify-between">
              <span>Actual: {formatCurrency(budgetAnalysis.savingsActual, currency)}</span>
              <span>Target: {formatCurrency(budgetAnalysis.savingsTarget, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive "What-If" Income Shock Stress Simulator */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-5 h-5 text-[#5a42e8]" />
          <h2 className="text-base font-extrabold text-[#111827]">
            "What-If" Income Shock Simulator
          </h2>
        </div>
        <p className="text-xs text-[#6b7280] mb-5 leading-relaxed">
          Test how a sudden salary drop or raise absorbs your flexible capacity without affecting contractual debt or emergency commitments.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#4b5563]">Adjust Income Variance:</span>
            <span className={`text-sm ${shockPercent < 0 ? 'text-[#dc2626]' : shockPercent > 0 ? 'text-[#059669]' : 'text-[#111827]'}`}>
              {shockPercent > 0 ? `+${shockPercent}%` : `${shockPercent}%`}
            </span>
          </div>

          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={shockPercent}
            onChange={(e) => setShockPercent(parseInt(e.target.value, 10))}
            className="w-full accent-[#5a42e8] cursor-pointer"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="text-[10px] text-[#6b7280] font-bold uppercase">Simulated Income</div>
              <div className="text-base font-extrabold text-[#111827] mt-1">
                {formatCurrency(simulatedIncome, currency)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="text-[10px] text-[#6b7280] font-bold uppercase">Income Delta</div>
              <div className={`text-base font-extrabold mt-1 ${incomeDrop > 0 ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
                {incomeDrop > 0 ? `-${formatCurrency(incomeDrop, currency)}` : `+${formatCurrency(Math.abs(incomeDrop), currency)}`}
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border ${shockExceedsCapacity ? 'bg-[#fff0f1] border-[#fecdd3] text-[#991b1b]' : 'bg-[#f0fdf4] border-[#dcfce7] text-[#166534]'}`}>
              <div className="text-[10px] font-bold uppercase">Resilience Status</div>
              <div className="text-xs font-extrabold mt-1">
                {shockExceedsCapacity
                  ? 'Exceeds Flexible Capacity'
                  : 'Absorbed by Flexible Envelope'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
