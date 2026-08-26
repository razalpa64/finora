import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Briefcase,
  TrendingUp,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';
import { IncomeSource, IncomeType, IncomeFrequency } from '../../types';

export const IncomePage: React.FC = () => {
  const { incomeSources, addIncomeSource, updateIncomeSource, deleteIncomeSource, currency } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<IncomeType>('PRIMARY');
  const [frequency, setFrequency] = useState<IncomeFrequency>('MONTHLY');
  const [isGuaranteed, setIsGuaranteed] = useState(true);
  const [notes, setNotes] = useState('');

  const totalMonthlyIncome = incomeSources.reduce((sum, item) => {
    let monthlyVal = item.amount;
    if (item.frequency === 'WEEKLY') monthlyVal = (item.amount * 52) / 12;
    if (item.frequency === 'BI_WEEKLY') monthlyVal = (item.amount * 26) / 12;
    if (item.frequency === 'ANNUALLY') monthlyVal = item.amount / 12;
    if (item.frequency === 'ONE_TIME') monthlyVal = 0;
    return sum + monthlyVal;
  }, 0);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setAmount('');
    setType('PRIMARY');
    setFrequency('MONTHLY');
    setIsGuaranteed(true);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (inc: IncomeSource) => {
    setEditingId(inc.id);
    setName(inc.name);
    setAmount(inc.amount.toString());
    setType(inc.type);
    setFrequency(inc.frequency);
    setIsGuaranteed(inc.isGuaranteed);
    setNotes(inc.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (editingId) {
      updateIncomeSource(editingId, {
        name,
        amount: numAmount,
        type,
        frequency,
        isGuaranteed,
        notes,
      });
    } else {
      addIncomeSource({
        name,
        amount: numAmount,
        type,
        frequency,
        isGuaranteed,
        notes,
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
            Income Streams
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Manage your salaries, side hustles, dividends, and cash inflows.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income Source</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Monthly Inflow
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111827]">
            {formatCurrency(totalMonthlyIncome, currency)}
          </div>
          <div className="text-xs text-[#059669] mt-1 font-semibold">
            Normalized monthly recurring
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Active Streams
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111827]">
            {incomeSources.length}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            {incomeSources.filter((s) => s.isGuaranteed).length} guaranteed sources
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Annual Projected
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111827]">
            {formatCurrency(totalMonthlyIncome * 12, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            Gross annual earnings run-rate
          </div>
        </div>
      </div>

      {/* Income List Table / Cards */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111827]">
            All Income Channels
          </h2>
          <span className="text-xs text-[#6b7280]">
            {incomeSources.length} entries
          </span>
        </div>

        {incomeSources.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">
              No Income Sources Added Yet
            </h3>
            <p className="text-xs text-[#6b7280] mt-1 max-w-sm mx-auto">
              Add your primary salary, freelance clients, dividends, or rental income to start tracking.
            </p>
            <button
              onClick={openNewModal}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors"
            >
              Add First Income Stream
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-semibold">
                  <th className="p-4">Source Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Frequency</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Guaranteed</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {incomeSources.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="p-4 font-bold text-[#111827]">
                      {item.name}
                      {item.notes && (
                        <div className="text-[11px] font-normal text-[#6b7280]">{item.notes}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#f3f4f6] text-[#374151] font-semibold text-[11px]">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-[#4b5563] font-medium">{item.frequency}</td>
                    <td className="p-4 font-extrabold text-[#111827]">
                      {formatCurrency(item.amount, currency)}
                    </td>
                    <td className="p-4">
                      {item.isGuaranteed ? (
                        <span className="text-[#059669] font-bold">Yes</span>
                      ) : (
                        <span className="text-[#dc2626] font-bold">Variable</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#e5e7eb] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteIncomeSource(item.id)}
                          className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
                          title="Delete"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              {editingId ? 'Edit Income Source' : 'Add New Income Source'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Source Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer Salary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] focus:ring-1 focus:ring-[#5a42e8] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] focus:ring-1 focus:ring-[#5a42e8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#374151] mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as IncomeFrequency)}
                    className="w-full px-3 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none bg-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="BI_WEEKLY">Bi-Weekly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="ANNUALLY">Annually</option>
                    <option value="ONE_TIME">One Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Income Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IncomeType)}
                  className="w-full px-3 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none bg-white"
                >
                  <option value="PRIMARY">Primary Salary</option>
                  <option value="SIDE_HUSTLE">Side Hustle / Freelance</option>
                  <option value="INVESTMENT">Investments / Dividends</option>
                  <option value="RENTAL">Rental Real Estate</option>
                  <option value="OTHER">Other Inflow</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="guaranteed-cb"
                  checked={isGuaranteed}
                  onChange={(e) => setIsGuaranteed(e.target.checked)}
                  className="w-4 h-4 rounded text-[#5a42e8] border-[#d1d5db]"
                />
                <label htmlFor="guaranteed-cb" className="text-xs text-[#374151] font-medium">
                  Guaranteed recurring monthly inflow
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">
                  Notes / Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Net after tax deduction"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Create Stream'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
