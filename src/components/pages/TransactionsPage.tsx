import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Trash2,
  Filter,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    accounts,
    currency,
    openQuickAdd,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

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

  const totalOutflows = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const netMovement = totalInflows - totalOutflows;

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

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTransactions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `finora_transactions_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            MONEY MOVEMENT
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Full audit log of incoming revenues and verified expenditures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#374151] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#d1d5db] hover:bg-[#f9fafb] text-[#374151] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>JSON</span>
          </button>
          <button
            onClick={() => openQuickAdd('EXPENSE')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            INFLOW THIS MONTH
          </div>
          <div className="mt-2 text-2xl font-black text-[#059669]">
            {formatCurrency(totalInflows, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Credits and income receipts
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            OUTFLOW THIS MONTH
          </div>
          <div className="mt-2 text-2xl font-black text-[#dc2626]">
            {formatCurrency(totalOutflows, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Expenses and bill charges
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            NET MOVEMENT
          </div>
          <div
            className={`mt-2 text-2xl font-black ${
              netMovement >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'
            }`}
          >
            {formatCurrency(netMovement, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            {filteredTransactions.length} records in view
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by category or description…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none font-semibold text-[#374151]"
          >
            <option value="ALL">All Movement Types</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Inflows Only</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none font-semibold text-[#374151]"
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

      {/* Ledger Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#111827]">
              No Transactions Recorded
            </h3>
            <p className="text-xs text-[#6b7280] mt-1 max-w-sm mx-auto">
              Record your daily income and expenditures to generate real-time ledger telemetry.
            </p>
            <button
              onClick={() => openQuickAdd('EXPENSE')}
              className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors cursor-pointer"
            >
              Add First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-bold">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">50/30/20 Tag</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {filteredTransactions.map((t) => {
                  const isExp = t.type === 'EXPENSE';
                  return (
                    <tr key={t.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="p-4 font-medium text-[#4b5563] whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="p-4 font-bold text-[#111827]">
                        {t.category}
                      </td>
                      <td className="p-4 text-[#4b5563]">
                        {t.description || '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
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
                          className={`font-black text-sm ${
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
                          className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
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
