import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';
import { FinancialGoal, GoalCategory, GoalPriority } from '../../types';

export const GoalsPage: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, currency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState<GoalCategory>('SAVINGS');
  const [priority, setPriority] = useState<GoalPriority>('MEDIUM');

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setCategory('SAVINGS');
    setPriority('MEDIUM');
    setIsModalOpen(true);
  };

  const openEditModal = (g: FinancialGoal) => {
    setEditingId(g.id);
    setName(g.name);
    setTargetAmount(g.targetAmount.toString());
    setCurrentAmount(g.currentAmount.toString());
    setTargetDate(g.targetDate);
    setCategory(g.category);
    setPriority(g.priority);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const curr = parseFloat(currentAmount) || 0;

    if (isNaN(target) || target <= 0) return;

    if (editingId) {
      updateGoal(editingId, {
        name,
        targetAmount: target,
        currentAmount: curr,
        targetDate: targetDate || new Date().toISOString().slice(0, 10),
        category,
        priority,
      });
    } else {
      addGoal({
        name,
        targetAmount: target,
        currentAmount: curr,
        targetDate: targetDate || new Date().toISOString().slice(0, 10),
        category,
        priority,
      });
    }
    setIsModalOpen(false);
  };

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Financial Target Goals
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Set and track milestones for house down payments, investments, vacations, and emergency cushions.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Target Goal</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Capital Accumulated
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#059669]">
            {formatCurrency(totalSaved, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Across {goals.length} target goals
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Target Requirement
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111827]">
            {formatCurrency(totalTarget, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Goal target sum
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Overall Completion Rate
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#5a42e8]">
            {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Weighted progress toward freedom
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
              className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f3f4f6] text-[#4b5563]">
                    {g.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      g.priority === 'HIGH'
                        ? 'bg-[#fee2e2] text-[#dc2626]'
                        : g.priority === 'MEDIUM'
                        ? 'bg-[#fef3c7] text-[#d97706]'
                        : 'bg-[#ecfdf5] text-[#059669]'
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
                    <span className="text-[#111827] font-bold">{pct.toFixed(1)}%</span>
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

                <div className="mt-3 text-[11px] text-[#6b7280]">
                  Remaining to goal: {formatCurrency(remaining, currency)}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#f3f4f6] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(g)}
                  className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteGoal(g.id)}
                  className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#111827]">No Goals Active</h3>
          <p className="text-xs text-[#6b7280] mt-1 max-w-sm mx-auto">
            Create milestone savings accounts or wealth targets to visualize your timeline.
          </p>
          <button
            onClick={openNewModal}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors"
          >
            Create First Goal
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              {editingId ? 'Edit Goal' : 'Create Financial Target'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Residence Down Payment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Target Sum
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Current Saved
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full px-3 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none bg-white"
                  >
                    <option value="SAVINGS">Savings</option>
                    <option value="INVESTMENT">Investment</option>
                    <option value="PURCHASE">Major Purchase</option>
                    <option value="EMERGENCY_FUND">Emergency Fund</option>
                    <option value="EDUCATION">Education</option>
                    <option value="RETIREMENT">Retirement</option>
                    <option value="TRAVEL">Travel / Vacation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as GoalPriority)}
                    className="w-full px-3 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none bg-white"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db]"
                >
                  {editingId ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
