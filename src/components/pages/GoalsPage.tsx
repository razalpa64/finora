import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  DollarSign,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addTransaction,
    currency,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [contribAmount, setContribAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('SAVINGS');

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  const handleOpenContribute = (g: any) => {
    setSelectedGoal(g);
    setContribAmount('100');
    setIsContributeModalOpen(true);
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(contribAmount);
    if (!selectedGoal || isNaN(amt) || amt <= 0) return;

    const newSaved = Math.min(selectedGoal.targetAmount, selectedGoal.currentAmount + amt);
    updateGoal(selectedGoal.id, {
      currentAmount: newSaved,
    });

    addTransaction({
      amount: amt,
      type: 'EXPENSE',
      category: 'Goals',
      description: `Contribution to ${selectedGoal.name}`,
      date: new Date().toISOString().slice(0, 10),
      budgetCategory: 'SAVINGS',
    });

    setIsContributeModalOpen(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;

    if (isNaN(target) || target <= 0) return;

    addGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: curr,
      targetDate: targetDate || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      category,
      priority,
    });

    setIsModalOpen(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            PURPOSEFUL SAVINGS
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Goals & Capital Milestones
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Plan, fund and track milestone savings goals with safe earmarking.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Target Goal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            ACCUMULATED CAPITAL
          </div>
          <div className="mt-2 text-2xl font-black text-[#059669]">
            {formatCurrency(totalSaved, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Funded across {goals.length} target goals
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            TARGET CAPITAL
          </div>
          <div className="mt-2 text-2xl font-black text-[#111827]">
            {formatCurrency(totalTarget, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Milestone target sum
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            OVERALL PACE
          </div>
          <div className="mt-2 text-2xl font-black text-[#5a42e8]">
            {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Completion velocity
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((g) => {
          const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
          const remaining = Math.max(0, g.targetAmount - g.currentAmount);

          return (
            <div
              key={g.id}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f3f4f6] text-[#4b5563]">
                    {g.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      g.priority === 'CRITICAL' || g.priority === 'HIGH'
                        ? 'bg-[#fee2e2] text-[#dc2626]'
                        : 'bg-[#fef3c7] text-[#d97706]'
                    }`}
                  >
                    {g.priority}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#111827] mt-1">
                  {g.name}
                </h3>
                <div className="text-xs text-[#6b7280] mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target: {g.targetDate}</span>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#6b7280]">Progress</span>
                    <span className="text-[#111827] font-bold">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5a42e8] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-1">
                    <span className="text-[#059669]">
                      {formatCurrency(g.currentAmount, currency)}
                    </span>
                    <span className="text-[#111827]">
                      {formatCurrency(g.targetAmount, currency)}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-[#6b7280]">
                  Remaining to goal: {formatCurrency(remaining, currency)}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#f3f4f6] flex items-center justify-between">
                <button
                  onClick={() => handleOpenContribute(g)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors cursor-pointer"
                >
                  Contribute
                </button>
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#111827]">
            No Goals Configured
          </h3>
          <p className="text-xs text-[#6b7280] max-w-sm mx-auto mt-1">
            Create milestone targets to visualize timelines for emergency reserves, property down payments, or vacations.
          </p>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-2">
              Contribute to Goal
            </h3>
            <p className="text-xs text-[#6b7280] mb-4">
              Adding funds to <strong className="text-[#111827]">{selectedGoal.name}</strong> ({formatCurrency(selectedGoal.currentAmount, currency)} of {formatCurrency(selectedGoal.targetAmount, currency)})
            </p>

            <form onSubmit={handleContributeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Contribution Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f4f6]">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors cursor-pointer"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              Create Target Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House Down Payment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">Current Saved</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f4f6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
