import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Wallet,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';
import { TransactionRecord } from '../../types';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    accounts,
    deleteTransaction,
    openQuickAdd,
    currency,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');

  // Summary figures
  const recordedInflow = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const recordedOutflow = transactions
    .filter((t) => t.type !== 'INCOME' && t.type !== 'TRANSFER' && t.type !== 'GOAL_CONTRIBUTION')
    .reduce((acc, t) => acc + t.amount, 0);

  const netMovement = recordedInflow - recordedOutflow;

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Text search
      const matchesSearch =
        !searchQuery.trim() ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type filter
      let matchesType = true;
      if (selectedType === 'INCOME') matchesType = t.type === 'INCOME';
      else if (selectedType === 'EXPENSE') matchesType = t.type === 'EXPENSE';
      else if (selectedType === 'TRANSFER') matchesType = t.type === 'TRANSFER';
      else if (selectedType === 'DEBT') matchesType = t.type === 'DEBT_PAYMENT' || t.type === 'EMI_PAYMENT';
      else if (selectedType === 'GOALS') matchesType = t.type === 'GOAL_CONTRIBUTION' || t.type === 'INVESTMENT_CONTRIBUTION';

      // Account filter
      const matchesAccount =
        selectedAccountId === 'ALL' || t.accountId === selectedAccountId || t.relatedAccountId === selectedAccountId;

      return matchesSearch && matchesType && matchesAccount;
    });
  }, [transactions, searchQuery, selectedType, selectedAccountId]);

  const exportCsv = () => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount', 'Account', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${accountMap.get(t.accountId) || 'Account'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finora_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Money Movement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Every recorded inflow, outflow, and allocation — without double-counting transfers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => openQuickAdd('transaction')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Recorded Inflow</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            +{formatMoney(recordedInflow, currency)}
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Recorded Outflow</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">
            −{formatMoney(recordedOutflow, currency)}
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Movement</span>
            <span className={`text-xs font-bold ${netMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netMovement >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <div className={`text-2xl font-black ${netMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netMovement >= 0 ? '+' : ''}{formatMoney(netMovement, currency)}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, category, or notes…"
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL" className="bg-[#131726]">All Transaction Types</option>
              <option value="INCOME" className="bg-[#131726]">Inflows (Income)</option>
              <option value="EXPENSE" className="bg-[#131726]">Expenses</option>
              <option value="TRANSFER" className="bg-[#131726]">Transfers</option>
              <option value="DEBT" className="bg-[#131726]">Debt / EMI Payments</option>
              <option value="GOALS" className="bg-[#131726]">Goals / Investments</option>
            </select>
          </div>

          {/* Account Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
            >
              <option value="ALL" className="bg-[#131726]">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#131726]">
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
          {(searchQuery || selectedType !== 'ALL' || selectedAccountId !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedAccountId('ALL');
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold text-[11px]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions List: Table on Desktop, Cards on Mobile */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <p>No transactions match your search filter.</p>
            <button
              onClick={() => openQuickAdd('transaction')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Add New Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Account</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredTransactions.map((tx) => {
                    const isPlus = tx.type === 'INCOME';
                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono">{tx.date}</td>
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{tx.description}</div>
                          {tx.notes && <div className="text-[10px] text-slate-400 font-normal">{tx.notes}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {accountMap.get(tx.accountId) || 'Account'}
                          {tx.type === 'TRANSFER' && tx.relatedAccountId && (
                            <span className="text-purple-400"> → {accountMap.get(tx.relatedAccountId)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04]">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-black whitespace-nowrap text-sm ${
                            isPlus ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isPlus ? '+ ' : '− '}{formatMoney(tx.amount, currency)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete transaction"
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

            {/* Mobile Card Feed View */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredTransactions.map((tx) => {
                const isPlus = tx.type === 'INCOME';
                return (
                  <div key={tx.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-sm truncate">{tx.description}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{tx.date}</span>
                          <span>·</span>
                          <span className="text-purple-300">{tx.category}</span>
                        </div>
                      </div>
                      <div
                        className={`text-base font-black shrink-0 ${
                          isPlus ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {isPlus ? '+ ' : '− '}{formatMoney(tx.amount, currency)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{accountMap.get(tx.accountId) || 'Account'}</span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
