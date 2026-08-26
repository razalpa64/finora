import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Calendar,
  Wallet,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';

export const IncomePage: React.FC = () => {
  const {
    incomeSources,
    accounts,
    brainState,
    recordIncomeReceipt,
    deleteIncomeSource,
    openQuickAdd,
    currency,
  } = useApp();

  const snapshot = brainState.snapshot;
  const expected = snapshot.expectedRecurringIncome;
  const recorded = snapshot.recordedIncome;

  // Next income date calculation
  const nextIncome = incomeSources
    .filter((s) => s.active)
    .sort((a, b) => a.nextIncomeDate.localeCompare(b.nextIncomeDate))[0];

  const getAccountName = (accId: string) => {
    const a = accounts.find((acc) => acc.id === accId);
    return a ? a.name : 'Unknown Account';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Income Foundation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Income Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Add recurring income, record receipts, and keep plans separate from money actually received.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('income')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Monthly Income</span>
        </button>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Expected Monthly Plan
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {formatMoney(expected, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {incomeSources.length} active recurring source(s)
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Received This Month
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatMoney(recorded, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Recorded inflow transactions only
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Next Scheduled Inflow
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {nextIncome ? formatMoney(nextIncome.amount, currency) : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {nextIncome ? `Due ${nextIncome.nextIncomeDate} (${nextIncome.name})` : 'No upcoming schedules'}
          </div>
        </div>
      </div>

      {/* Income Sources List */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recurring Income Streams</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
            {incomeSources.length} Sources
          </span>
        </div>

        {incomeSources.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl space-y-3">
            <p>No recurring income streams configured yet.</p>
            <button
              onClick={() => openQuickAdd('income')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Add First Income Stream
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {incomeSources.map((source) => {
              return (
                <div
                  key={source.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{source.name}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {source.frequency}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Next: {source.nextIncomeDate}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-slate-500" />
                        <span>Deposits into: {getAccountName(source.accountId)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400">
                        +{formatMoney(source.amount, currency)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">
                        per {source.frequency.toLowerCase()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => recordIncomeReceipt(source.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                        title="Record receipt today"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Record Received</span>
                      </button>

                      <button
                        onClick={() => deleteIncomeSource(source.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete income source"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Educational Fact Box */}
      <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">How FINORA treats income: </span>
          Expected recurring income configures the monthly budget baseline and cash-flow forecasts. However, Safe-to-Spend and live account balances only update when money is actually recorded as received.
        </div>
      </div>
    </div>
  );
};
