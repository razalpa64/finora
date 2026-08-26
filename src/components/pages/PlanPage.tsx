import React, { useState } from 'react';
import {
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';

export const PlanPage: React.FC = () => {
  const {
    brainState,
    setPage,
    openQuickAdd,
    addOrUpdateBudget,
    currency,
  } = useApp();

  const snapshot = brainState.snapshot;
  const plan = brainState.monthlyPlan;
  const safe = brainState.safeToSpend;

  // What-If Simulator state
  const [incomeChangePercent, setIncomeChangePercent] = useState<number>(-20);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('Dining');
  const [newBudgetLimit, setNewBudgetLimit] = useState('10000');

  // Calculate What-If scenario impact
  const deltaIncome = (snapshot.monthlyIncome * incomeChangePercent) / 100;
  const revisedIncome = Math.max(0, snapshot.monthlyIncome + deltaIncome);
  const flexibleBaseline = plan.flexible + plan.reserve;
  const shortfall = deltaIncome < 0 ? Math.max(0, Math.abs(deltaIncome) - flexibleBaseline) : 0;

  // Emergency readiness: 3 months essential expenses
  const emergencyTarget = snapshot.essentialExpenses * 3;
  const emergencyMonthsCovered =
    snapshot.essentialExpenses > 0 ? (snapshot.emergencyFund / snapshot.essentialExpenses).toFixed(1) : '0';
  const emergencyProgress =
    emergencyTarget > 0 ? Math.min(100, Math.round((snapshot.emergencyFund / emergencyTarget) * 100)) : 100;

  // Investment gating
  const isEligibleToInvest =
    snapshot.emergencyFund >= snapshot.essentialExpenses * 1.5 &&
    !snapshot.debts.some((d) => d.interestRate > 15);

  const allocationItems = [
    { name: 'Essential expenses', amount: plan.essentials, color: 'bg-indigo-500', note: 'Rent, groceries, utilities' },
    { name: 'Debt & EMI commitments', amount: plan.debtAndEmi, color: 'bg-rose-500', note: 'Required loan & credit payments' },
    { name: 'Emergency fund contribution', amount: plan.emergencySavings, color: 'bg-amber-500', note: 'Safety reserve building' },
    { name: 'Savings goals', amount: plan.goals, color: 'bg-emerald-500', note: 'Planned target milestones' },
    { name: 'Long-term investment', amount: plan.investments, color: 'bg-cyan-500', note: 'Index / diversified equities' },
    { name: 'Cash buffer reserve', amount: plan.reserve, color: 'bg-blue-400', note: 'Protected cash cushion' },
    { name: 'Flexible spending', amount: plan.flexible, color: 'bg-purple-500', note: 'Daily discretionary envelope' },
  ];

  const handleAddBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(newBudgetLimit);
    if (isNaN(limit) || limit <= 0) return;
    addOrUpdateBudget(newBudgetCategory, limit);
    setIsAddBudgetOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Monthly Control System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Financial Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            A priority-based allocation built from your records — not an arbitrary percentage rule.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
            100% Deterministic
          </span>
          <button
            onClick={() => setPage('income')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          >
            Manage Income
          </button>
        </div>
      </div>

      {/* Top Grid: Suggested Allocation Card + Plan Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Allocation Breakdown (8 cols) */}
        <div className="lg:col-span-8 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Suggested Allocation
              </span>
              <h3 className="text-lg font-bold text-white">{formatMoney(plan.income, currency)} monthly plan</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              100% Assigned
            </span>
          </div>

          <div className="space-y-3.5">
            {allocationItems.map((item, idx) => {
              const pct = plan.income > 0 ? (item.amount / plan.income) * 100 : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="font-semibold text-slate-200">{item.name}</span>
                      <span className="text-[10px] text-slate-400 hidden sm:inline">({item.note})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-mono">{pct.toFixed(1)}%</span>
                      <span className="font-bold text-white text-right w-24">
                        {formatMoney(item.amount, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Health Score Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Plan Health
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                Score
              </span>
            </div>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="text-5xl font-black text-white">{plan.score}</div>
              <div className="text-xs font-semibold text-purple-300 mt-1">
                {plan.score >= 80 ? 'Strong Allocation' : 'Review Plan Allocations'}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Engine Explanations
              </div>
              {plan.explanations.map((exp, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: What-If Income Simulator + Emergency Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* What-If Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-base font-bold text-white">What-If? Income Shock Simulator</span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                incomeChangePercent < 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {incomeChangePercent > 0 ? '+' : ''}{incomeChangePercent}% Income
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Simulate an unexpected income increase or drop. This tests if your flexible capacity and reserve can absorb the change without touching debt commitments or essential costs.
          </p>

          <div className="py-2">
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={incomeChangePercent}
              onChange={(e) => setIncomeChangePercent(parseInt(e.target.value))}
              className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1.5">
              <span>−50% drop</span>
              <span>Baseline (0%)</span>
              <span>+50% rise</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Simulated Monthly Income</div>
              <div className="text-base font-bold text-white">{formatMoney(revisedIncome, currency)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Impact on Flexible Capacity</div>
              <div className={`text-base font-bold ${shortfall > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {shortfall > 0 ? `Short by ${formatMoney(shortfall, currency)}` : 'Fully Absorbed'}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic">
            * Simulation only — does not modify your real stored records.
          </div>
        </div>

        {/* Emergency Readiness & Investment Gate (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Emergency Fund Card */}
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Emergency Readiness
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {emergencyMonthsCovered} Months Covered
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Current Reserve:</span>
              <span className="font-bold text-white">{formatMoney(snapshot.emergencyFund, currency)}</span>
            </div>

            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${emergencyProgress}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Target: {formatMoney(emergencyTarget, currency)} (3 months essential)</span>
              <span className="font-bold text-slate-300">{emergencyProgress}%</span>
            </div>
          </div>

          {/* Investment Gate Card */}
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Investment Capacity Gate
              </span>
              {isEligibleToInvest ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Gate Open
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Paused
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isEligibleToInvest
                ? 'Your emergency reserve is healthy and high-cost debts are controlled. A modest educational investment allocation is active.'
                : 'Long-term investment is paused until at least 1.5 months of essential reserves are saved and debts >15% interest are paid.'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Budgets Adherence */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Category Budgets Adherence</h3>
            <p className="text-xs text-slate-400">Tracks this month's recorded expenses against your set limits.</p>
          </div>
          <button
            onClick={() => setIsAddBudgetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Category Budget</span>
          </button>
        </div>

        {snapshot.budgets.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl">
            No category budgets configured yet. Click "Set Category Budget" to track specific spending targets.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {snapshot.budgets.map((b) => {
              const spent = snapshot.expenseByCategory[b.category] || 0;
              const ratio = spent / b.limitAmount;
              const isOver = spent > b.limitAmount;
              return (
                <div key={b.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{b.category}</span>
                    <span className={isOver ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {isOver
                        ? `${formatMoney(spent - b.limitAmount, currency)} over`
                        : `${formatMoney(b.limitAmount - spent, currency)} left`}
                    </span>
                  </div>

                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : ratio > 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, ratio * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Spent: {formatMoney(spent, currency)}</span>
                    <span>Limit: {formatMoney(b.limitAmount, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Category Budget Modal */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Set Category Budget</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter spending limit for this month. FINORA will warn you as you approach the cap.
            </p>

            <form onSubmit={handleAddBudgetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  placeholder="e.g. Dining, Entertainment, Groceries"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Limit ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newBudgetLimit}
                  onChange={(e) => setNewBudgetLimit(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
