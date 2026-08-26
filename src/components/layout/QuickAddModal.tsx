import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, ShieldAlert, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BudgetCategory, TransactionType } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    quickAddType,
    closeQuickAdd,
    addTransaction,
    addIncomeSource,
    addDebt,
    addGoal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME' | 'DEBT' | 'GOAL'>('EXPENSE');

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [description, setDescription] = useState('');
  const [budgetCategory, setBudgetCategory] = useState<BudgetCategory>('NEEDS');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Debt states
  const [debtRate, setDebtRate] = useState('18.0');
  const [debtMinPayment, setDebtMinPayment] = useState('50.00');

  // Goal states
  const [goalTargetDate, setGoalTargetDate] = useState('');

  useEffect(() => {
    if (quickAddType) {
      if (quickAddType === 'EXPENSE') setActiveTab('EXPENSE');
      if (quickAddType === 'INCOME') setActiveTab('INCOME');
      if (quickAddType === 'DEBT') setActiveTab('DEBT');
      if (quickAddType === 'GOAL') setActiveTab('GOAL');
    }
  }, [quickAddType]);

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (activeTab === 'EXPENSE') {
      addTransaction({
        amount: numAmount,
        category,
        description: description || category,
        type: 'EXPENSE',
        budgetCategory,
        date,
      });
    } else if (activeTab === 'INCOME') {
      addTransaction({
        amount: numAmount,
        category: category || 'Salary',
        description: description || 'Income Inflow',
        type: 'INCOME',
        budgetCategory: 'SAVINGS',
        date,
      });
      addIncomeSource({
        name: description || category || 'Income Stream',
        amount: numAmount,
        type: 'PRIMARY',
        frequency: 'MONTHLY',
        isGuaranteed: true,
      });
    } else if (activeTab === 'DEBT') {
      addDebt({
        name: description || category || 'Credit Card',
        currentBalance: numAmount,
        interestRate: parseFloat(debtRate) || 18,
        minimumPayment: parseFloat(debtMinPayment) || numAmount * 0.03,
        category: 'CREDIT_CARD',
        dueDateDay: 15,
      });
    } else if (activeTab === 'GOAL') {
      addGoal({
        name: description || category || 'Savings Target',
        targetAmount: numAmount,
        currentAmount: 0,
        targetDate: goalTargetDate || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        category: 'SAVINGS',
        priority: 'HIGH',
      });
    }

    closeQuickAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
        <div className="flex items-center justify-between pb-4 border-b border-[#e5e7eb]">
          <h2 className="text-base font-extrabold text-[#111827]">
            Quick Record Entry
          </h2>
          <button
            onClick={closeQuickAdd}
            className="p-1 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#f3f4f6] rounded-xl my-4">
          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'EXPENSE'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setActiveTab('INCOME')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'INCOME'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('DEBT')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'DEBT'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            Debt
          </button>
          <button
            onClick={() => setActiveTab('GOAL')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'GOAL'
                ? 'bg-white text-[#111827] shadow-xs'
                : 'text-[#6b7280] hover:text-[#111827]'
            }`}
          >
            Goal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-[#374151] mb-1">
              {activeTab === 'EXPENSE'
                ? 'Amount ($)'
                : activeTab === 'INCOME'
                ? 'Monthly Inflow Amount ($)'
                : activeTab === 'DEBT'
                ? 'Outstanding Debt Balance ($)'
                : 'Goal Target Amount ($)'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-bold border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] focus:ring-1 focus:ring-[#5a42e8] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#374151] mb-1">
              {activeTab === 'EXPENSE'
                ? 'Category'
                : activeTab === 'INCOME'
                ? 'Stream Type'
                : activeTab === 'DEBT'
                ? 'Creditor / Card Name'
                : 'Goal Title'}
            </label>
            {activeTab === 'EXPENSE' ? (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none"
              >
                <option value="Groceries">Groceries & Supermarket</option>
                <option value="Rent/Mortgage">Rent / Mortgage</option>
                <option value="Utilities">Utilities & Bills</option>
                <option value="Dining Out">Restaurants & Dining Out</option>
                <option value="Transportation">Gas & Transportation</option>
                <option value="Subscriptions">Software & Subscriptions</option>
                <option value="Entertainment">Entertainment & Hobbies</option>
                <option value="Shopping">Shopping & Apparel</option>
                <option value="Healthcare">Healthcare & Fitness</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder={
                  activeTab === 'INCOME'
                    ? 'e.g. Salary, Dividend, Side Hustle'
                    : activeTab === 'DEBT'
                    ? 'e.g. Chase Sapphire Card'
                    : 'e.g. Emergency Fund Cushion'
                }
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
              />
            )}
          </div>

          {activeTab === 'EXPENSE' && (
            <div>
              <label className="block font-bold text-[#374151] mb-1">
                Budget Classification
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['NEEDS', 'WANTS', 'SAVINGS'] as BudgetCategory[]).map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBudgetCategory(b)}
                    className={`py-1.5 rounded-lg font-bold border transition-colors ${
                      budgetCategory === b
                        ? 'border-[#5a42e8] bg-[#f3f1fc] text-[#5a42e8]'
                        : 'border-[#e5e7eb] text-[#6b7280]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#374151] mb-1">
              Description / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Weekly grocery haul"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="px-4 py-2 font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors"
            >
              Record Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
