import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const IncomePage: React.FC = () => {
  const {
    incomeSources,
    transactions,
    accounts,
    currency,
    addIncomeSource,
    deleteIncomeSource,
    addTransaction,
    setPage,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');

  // 1. Expected Monthly
  const expectedMonthly = incomeSources.reduce((sum, s) => {
    let monthly = s.amount;
    if (s.frequency === 'WEEKLY') monthly = (s.amount * 52) / 12;
    if (s.frequency === 'BI_WEEKLY' || s.frequency === 'BIWEEKLY') monthly = (s.amount * 26) / 12;
    if (s.frequency === 'ANNUALLY' || s.frequency === 'ANNUAL') monthly = s.amount / 12;
    if (s.frequency === 'ONE_TIME') monthly = 0;
    return sum + monthly;
  }, 0);

  // 2. Received this month from transactions
  const receivedThisMonth = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. Next expected income source
  const sortedByDate = [...incomeSources].sort((a, b) => (a.nextIncomeDate || '').localeCompare(b.nextIncomeDate || ''));
  const nextSource = sortedByDate.length > 0 ? sortedByDate[0] : null;

  const handleRecordReceived = (source: any) => {
    addTransaction({
      amount: source.amount,
      type: 'INCOME',
      category: source.name || 'Salary',
      description: `Income receipt: ${source.name}`,
      date: new Date().toISOString().slice(0, 10),
      budgetCategory: 'SAVINGS',
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addIncomeSource({
      name: name.trim(),
      amount: numAmount,
      frequency,
      nextIncomeDate: nextDate,
      accountId,
      notes,
      isGuaranteed: true,
      active: true,
    });

    setIsModalOpen(false);
    setName('');
    setAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            INCOME FOUNDATION
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Income Center
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Add recurring income, record each receipt and keep plans separate from money actually received.
          </p>
        </div>

        <button
          onClick={() => {
            if (accounts.length === 0) {
              setPage('settings');
            } else {
              setIsModalOpen(true);
            }
          }}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{accounts.length === 0 ? 'Add account first' : 'Add monthly income'}</span>
        </button>
      </div>

      {/* Summary KPI Cards Grid (Matching JavaFX stat cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            EXPECTED MONTHLY
          </div>
          <div className="mt-2 text-2xl font-black text-[#059669]">
            {formatCurrency(expectedMonthly, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            {incomeSources.length} active source{incomeSources.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            RECEIVED THIS MONTH
          </div>
          <div className="mt-2 text-2xl font-black text-[#111827]">
            {formatCurrency(receivedThisMonth, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Recorded transactions only
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            NEXT EXPECTED
          </div>
          <div className="mt-2 text-2xl font-black text-[#5a42e8]">
            {nextSource ? formatCurrency(nextSource.amount, currency) : 'Not scheduled'}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            {nextSource ? nextSource.nextIncomeDate : 'Add a recurring source'}
          </div>
        </div>
      </div>

      {/* Account Required Warning or Empty State or Active List */}
      {accounts.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 text-center shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef2f2] text-[#ef4444] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-[10px] font-extrabold text-[#dc2626] uppercase tracking-wider">
            ACCOUNT REQUIRED
          </div>
          <h2 className="text-base font-extrabold text-[#111827]">
            Add where your income is received
          </h2>
          <p className="text-xs text-[#6b7280] max-w-md mx-auto leading-relaxed">
            Income must be deposited into an account so FINORA can update cash and net worth correctly.
          </p>
          <button
            onClick={() => setPage('settings')}
            className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors cursor-pointer"
          >
            Create an account in Settings
          </button>
        </div>
      ) : incomeSources.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-10 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center mx-auto mb-2">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-[#111827]">
            No recurring income yet
          </h2>
          <p className="text-xs text-[#6b7280] max-w-md mx-auto leading-relaxed">
            No income assumptions are active. Add salary, freelance income, pension or another recurring source.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-[#765df1] to-[#6045df] text-white hover:bg-[#6349e4] transition-colors cursor-pointer"
          >
            Add monthly income
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#f3f4f6] flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
                ACTIVE INCOME
              </div>
              <h2 className="text-sm font-bold text-[#111827]">
                Recurring income schedule
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f6] text-[#4b5563]">
              {incomeSources.length} SOURCES
            </span>
          </div>

          <div className="divide-y divide-[#f3f4f6]">
            {incomeSources.map((source) => (
              <div
                key={source.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f9fafb] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center font-bold text-xs shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#111827]">
                      {source.name}
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      {source.frequency} · {source.notes || 'Direct deposit'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#111827]">
                      {source.nextIncomeDate}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">
                      Scheduled date
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-[#059669]">
                      {formatCurrency(source.amount, currency)}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">
                      per cycle
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRecordReceived(source)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111827] transition-colors cursor-pointer"
                      title="1-Click Record Received into Ledger"
                    >
                      Record received
                    </button>
                    <button
                      onClick={() => deleteIncomeSource(source.id)}
                      className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                      title="Remove Income Source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explanatory Note (Matching JavaFX explanation()) */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs space-y-1">
        <div className="text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">
          HOW FINORA USES INCOME
        </div>
        <p className="text-xs text-[#4b5563] leading-relaxed">
          EXPECTED MONTHLY is a planning fact derived from active recurring sources. RECEIVED THIS MONTH only includes recorded income transactions. Forecasts use scheduled dates; FINORA does not assume that unscheduled income will repeat.
        </p>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              Add Recurring Income Source
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Salary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">
                    Next Pay Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">
                    Deposit Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#374151] mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. After tax deduction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                />
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
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
