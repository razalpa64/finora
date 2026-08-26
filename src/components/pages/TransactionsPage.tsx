import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Trash2,
  Filter,
  Search,
  Download,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';
import { Transaction, TransactionType } from '../../types';

export const TransactionsPage: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction, currency, openQuickAdd } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  const totalInflows = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Full audit log of incoming revenues and verified expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openQuickAdd('EXPENSE')}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Inflow Recorded
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#059669]">
            {formatCurrency(totalInflows, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#059669]" />
            <span>Credits deposited</span>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Total Outflows Recorded
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#dc2626]">
            {formatCurrency(totalExpenses, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#dc2626]" />
            <span>Debits logged</span>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider">
            Net Activity
          </div>
          <div
            className={`mt-2 text-2xl font-extrabold ${
              totalInflows - totalExpenses >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'
            }`}
          >
            {formatCurrency(totalInflows - totalExpenses, currency)}
          </div>
          <div className="text-xs text-[#6b7280] mt-1">
            {filteredTransactions.length} records in view
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by category or description…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] focus:ring-1 focus:ring-[#5a42e8] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none font-medium text-[#374151]"
          >
            <option value="ALL">All Types</option>
            <option value="EXPENSE">Expense Only</option>
            <option value="INCOME">Income Only</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none font-medium text-[#374151]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">
              No Transactions Found
            </h3>
            <p className="text-xs text-[#6b7280] mt-1 max-w-sm mx-auto">
              {transactions.length === 0
                ? 'Your transaction register is empty. Start recording your daily income and expenditures.'
                : 'No transactions match your current search and filter criteria.'}
            </p>
            {transactions.length === 0 && (
              <button
                onClick={() => openQuickAdd('EXPENSE')}
                className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors"
              >
                Record First Transaction
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-semibold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Budget Classification</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredTransactions.map((t) => {
                  const isExp = t.type === 'EXPENSE';
                  return (
                    <tr key={t.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="p-4 text-[#4b5563] font-medium whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-[#111827]">{t.category}</span>
                      </td>
                      <td className="p-4 text-[#4b5563]">
                        {t.description || '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            t.budgetCategory === 'NEEDS'
                              ? 'bg-[#eff6ff] text-[#1d4ed8]'
                              : t.budgetCategory === 'WANTS'
                              ? 'bg-[#fdf4ff] text-[#a21caf]'
                              : 'bg-[#f0fdf4] text-[#15803d]'
                          }`}
                        >
                          {t.budgetCategory || 'NEEDS'}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`font-extrabold text-sm ${
                            isExp ? 'text-[#dc2626]' : 'text-[#16a34a]'
                          }`}
                        >
                          {isExp ? '-' : '+'}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteTransaction(t.id)}
                          className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
