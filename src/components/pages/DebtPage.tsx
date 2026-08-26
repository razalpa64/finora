import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  Calculator,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';
import { DebtStrategy, DebtItem, DebtCategory } from '../../types';

export const DebtPage: React.FC = () => {
  const {
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    debtStrategy,
    setDebtStrategy,
    debtMonthlyBudget,
    setDebtMonthlyBudget,
    debtPayoffPlan,
    currency,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [category, setCategory] = useState<DebtCategory>('CREDIT_CARD');
  const [dueDate, setDueDate] = useState('15');

  const totalBalance = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setBalance('');
    setInterestRate('18.0');
    setMinPayment('');
    setCategory('CREDIT_CARD');
    setDueDate('15');
    setIsModalOpen(true);
  };

  const openEditModal = (d: DebtItem) => {
    setEditingId(d.id);
    setName(d.name);
    setBalance(d.currentBalance.toString());
    setInterestRate(d.interestRate.toString());
    setMinPayment(d.minimumPayment.toString());
    setCategory(d.category);
    setDueDate(d.dueDateDay.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance);
    const rate = parseFloat(interestRate);
    const minP = parseFloat(minPayment);
    const day = parseInt(dueDate, 10);

    if (isNaN(bal) || isNaN(rate) || isNaN(minP)) return;

    if (editingId) {
      updateDebt(editingId, {
        name,
        currentBalance: bal,
        interestRate: rate,
        minimumPayment: minP,
        category,
        dueDateDay: day || 1,
      });
    } else {
      addDebt({
        name,
        currentBalance: bal,
        interestRate: rate,
        minimumPayment: minP,
        category,
        dueDateDay: day || 1,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Debt Elimination Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Avalanche, Snowball, Urgency, and Hybrid payoff mathematical engines.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt Liability</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Outstanding Balance
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#dc2626]">
            {formatCurrency(totalBalance, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Across {debts.length} active liabilities
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Min. Monthly Due
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111827]">
            {formatCurrency(totalMinPayment, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Required baseline contractual payment
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Estimated Freedom Date
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#059669]">
            {debtPayoffPlan.debtFreeDate || (debts.length === 0 ? 'Debt Free!' : 'Calculating…')}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Total interest to be paid: {formatCurrency(debtPayoffPlan.totalInterestPaid, currency)}
          </div>
        </div>
      </div>

      {/* Payoff Engine Strategy Selector */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider mb-4">
          Select Mathematical Payoff Model
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'AVALANCHE',
              title: 'Avalanche (Optimal)',
              desc: 'Highest interest rate first. Mathematically minimizes total interest paid.',
            },
            {
              id: 'SNOWBALL',
              title: 'Snowball (Psychological)',
              desc: 'Lowest balance first. Yields quick psychological wins and momentum.',
            },
            {
              id: 'URGENCY',
              title: 'Urgency Priority',
              desc: 'Focuses on immediate due dates and severe penal rates.',
            },
            {
              id: 'HYBRID',
              title: 'Hybrid Finora AI',
              desc: 'Balances interest savings against account liquidation speed.',
            },
          ].map((strat) => (
            <button
              key={strat.id}
              onClick={() => setDebtStrategy(strat.id as DebtStrategy)}
              className={`p-4 rounded-xl border text-left transition-all ${
                debtStrategy === strat.id
                  ? 'border-[#5a42e8] bg-[#f3f1fc] text-[#111827] ring-1 ring-[#5a42e8]'
                  : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#cbd5e1]'
              }`}
            >
              <div className="font-bold text-xs text-[#111827]">{strat.title}</div>
              <div className="text-[11px] text-[#6b7280] mt-1 leading-relaxed">
                {strat.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Monthly Payment Slider */}
        <div className="mt-6 pt-5 border-t border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#111827]">
              Dedicated Monthly Debt Payoff Budget
            </div>
            <div className="text-[11px] text-[#6b7280]">
              Must be at least minimum payment total ({formatCurrency(totalMinPayment, currency)})
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              value={debtMonthlyBudget}
              onChange={(e) => setDebtMonthlyBudget(parseFloat(e.target.value) || 0)}
              className="w-32 px-3 py-1.5 text-xs font-bold border border-[#d1d5db] rounded-xl text-right focus:border-[#5a42e8] outline-none"
            />
            <span className="text-xs text-[#6b7280] font-bold">/ month</span>
          </div>
        </div>
      </div>

      {/* Debts Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111827]">
            Active Debt Accounts
          </h2>
          <span className="text-xs text-[#6b7280]">{debts.length} liabilities</span>
        </div>

        {debts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">
              No Debt Recorded
            </h3>
            <p className="text-xs text-[#6b7280] mt-1 max-w-sm mx-auto">
              You are completely debt-free! If you have credit cards, loans, or mortgages, add them to run the payoff scheduler.
            </p>
            <button
              onClick={openNewModal}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors"
            >
              Add Liability
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-semibold">
                  <th className="p-4">Account</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">APR %</th>
                  <th className="p-4">Min Payment</th>
                  <th className="p-4">Due Day</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {debts.map((d) => (
                  <tr key={d.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="p-4 font-bold text-[#111827]">{d.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#f3f4f6] text-[#374151] font-semibold text-[11px]">
                        {d.category}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-[#dc2626]">
                      {formatCurrency(d.currentBalance, currency)}
                    </td>
                    <td className="p-4 font-bold text-[#111827]">{d.interestRate}%</td>
                    <td className="p-4 font-medium text-[#4b5563]">
                      {formatCurrency(d.minimumPayment, currency)}
                    </td>
                    <td className="p-4 text-[#4b5563]">Day {d.dueDateDay} of month</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(d)}
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#e5e7eb] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDebt(d.id)}
                          className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              {editingId ? 'Edit Debt Liability' : 'Add Debt Liability'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Account / Creditor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chase Sapphire Reserve"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Current Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    APR Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="18.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Minimum Payment
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="50.00"
                    value={minPayment}
                    onChange={(e) => setMinPayment(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Due Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Debt Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DebtCategory)}
                  className="w-full px-3 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none bg-white"
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="PERSONAL_LOAN">Personal Loan</option>
                  <option value="STUDENT_LOAN">Student Loan</option>
                  <option value="AUTO_LOAN">Auto Loan</option>
                  <option value="MORTGAGE">Mortgage</option>
                  <option value="MEDICAL">Medical Debt</option>
                  <option value="OTHER">Other</option>
                </select>
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
                  {editingId ? 'Save Changes' : 'Add Liability'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
