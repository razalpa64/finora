import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';
import { Goal } from '../../types';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    accounts,
    contributeToGoal,
    deleteGoal,
    openQuickAdd,
    currency,
  } = useApp();

  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionAccountId, setContributionAccountId] = useState('');

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalFunded = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalMonthlyPace = goals.reduce((acc, g) => acc + g.monthlyContribution, 0);
  const totalPercent = totalTarget > 0 ? Math.floor((totalFunded / totalTarget) * 100) : 0;

  const handleOpenContribute = (g: Goal) => {
    setSelectedGoalForContribution(g);
    setContributionAmount(g.monthlyContribution > 0 ? g.monthlyContribution.toString() : '5000');
    if (accounts.length > 0) {
      setContributionAccountId(accounts[0].id);
    }
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForContribution || !contributionAccountId) return;
    const amt = parseFloat(contributionAmount);
    if (isNaN(amt) || amt <= 0) return;

    contributeToGoal(selectedGoalForContribution.id, contributionAccountId, amt);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    setSelectedGoalForContribution(null);
  };

  const calculateCompletionForecast = (g: Goal) => {
    const rem = Math.max(0, g.targetAmount - g.currentAmount);
    if (rem === 0) return { label: 'Goal Completed 🎯', onTrack: true };
    if (g.monthlyContribution <= 0) return { label: 'Set monthly pace to forecast', onTrack: false };

    const monthsNeeded = Math.ceil(rem / g.monthlyContribution);
    const d = new Date();
    d.setMonth(d.getMonth() + monthsNeeded);
    const forecastMonth = d.toLocaleString('default', { month: 'short', year: 'numeric' });

    let onTrack = true;
    if (g.deadline) {
      const deadlineDate = new Date(g.deadline);
      onTrack = d <= deadlineDate;
    }

    return {
      label: `Est. completion: ${forecastMonth} (~${monthsNeeded} mos)`,
      onTrack,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Purposeful Saving
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Fund critical outcomes first, then optimize deadlines and monthly contribution paces.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('goal')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* 3 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Target Amount
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatMoney(totalTarget, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {goals.length} active savings milestone(s)
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Currently Funded
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {formatMoney(totalFunded, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalPercent}% of aggregate goals funded
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Monthly Contribution Pace
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {formatMoney(totalMonthlyPace, currency)}
            <span className="text-xs font-normal text-slate-400 ml-1">/ mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Protected monthly earmarks
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Active Goals</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
            {goals.length} Goals
          </span>
        </div>

        {goals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl space-y-3">
            <p>No savings goals created yet. Start planning for a trip, gadget, or life milestone!</p>
            <button
              onClick={() => openQuickAdd('goal')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const forecast = calculateCompletionForecast(goal);
              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{goal.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                              goal.priority === 'CRITICAL'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : goal.priority === 'HIGH'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {goal.priority}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          {goal.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              <span>Target: {goal.deadline}</span>
                            </span>
                          )}
                          <span>·</span>
                          <span>{formatMoney(goal.monthlyContribution, currency)} / month</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-black text-white">
                          {formatMoney(goal.currentAmount, currency)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          of {formatMoney(goal.targetAmount, currency)} ({pct}% funded)
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenContribute(goal)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-colors"
                        >
                          Add Contribution
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Goal Progress Bar */}
                  <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={forecast.onTrack ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                      {forecast.label}
                    </span>
                    <span className="text-slate-400 font-mono">
                      Remaining: {formatMoney(Math.max(0, goal.targetAmount - goal.currentAmount), currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Contribution Modal */}
      {selectedGoalForContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Goal Contribution</h3>
            <p className="text-xs text-slate-400 mb-4">
              Earmark money towards <span className="font-semibold text-white">{selectedGoalForContribution.name}</span>.
              Remaining:{' '}
              {formatMoney(
                Math.max(0, selectedGoalForContribution.targetAmount - selectedGoalForContribution.currentAmount),
                currency
              )}
            </p>

            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contribution Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Earmark From Account</label>
                <select
                  value={contributionAccountId}
                  onChange={(e) => setContributionAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#131726]">
                      {a.name} ({formatMoney(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[11px] text-slate-300">
                <span className="font-bold text-white">Safe Earmarking: </span>
                Contributing to a goal earmarks assets inside your account without reducing your total net worth.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForContribution(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
