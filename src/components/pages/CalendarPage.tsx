import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Tv,
  Zap,
  ShieldAlert,
  Coins,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';
import { Bill } from '../../types';

export const CalendarPage: React.FC = () => {
  const {
    bills,
    toggleBillPaid,
    deleteBill,
    openQuickAdd,
    brainState,
    currency,
  } = useApp();

  const snapshot = brainState.snapshot;
  const todayStr = new Date().toISOString().split('T')[0];

  // 7 days from now
  const sevenDaysDate = new Date();
  sevenDaysDate.setDate(sevenDaysDate.getDate() + 7);
  const sevenDaysStr = sevenDaysDate.toISOString().split('T')[0];

  const dueThisWeek = bills
    .filter((b) => !b.paid && b.dueDate <= sevenDaysStr)
    .reduce((acc, b) => acc + b.amount, 0);

  const monthlySubscriptions = bills
    .filter((b) => b.subscription)
    .reduce((acc, b) => acc + b.amount, 0);

  const totalUpcoming = snapshot.upcomingBills + snapshot.upcomingDebtCommitments;

  // Sorted chronological bills
  const sortedBills = [...bills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const subscriptions = bills.filter((b) => b.subscription);

  const getUrgency = (b: Bill) => {
    if (b.paid) return { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    const diff = Math.ceil((new Date(b.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `${Math.abs(diff)}d Overdue`, color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
    if (diff === 0) return { label: 'Due Today', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    if (diff <= 7) return { label: `In ${diff} days`, color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
    return { label: `Due ${b.dueDate}`, color: 'bg-white/5 text-slate-400 border-white/5' };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Financial Calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bills & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            See every due date before it becomes a cash-flow surprise.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('bill')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bill or Subscription</span>
        </button>
      </div>

      {/* 3 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Due This Week
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {formatMoney(dueThisWeek, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {bills.filter((b) => !b.paid && b.dueDate <= sevenDaysStr).length} obligation(s) in next 7 days
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Monthly Subscriptions
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {formatMoney(monthlySubscriptions, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {subscriptions.length} recorded recurring digital service(s)
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Upcoming Total Obligations
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatMoney(totalUpcoming, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Bills + Debt EMI commitments this month
          </div>
        </div>
      </div>

      {/* Grid: Payment Timeline (7 cols) + Subscriptions Tracker (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payment Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Upcoming Payment Timeline</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300">
              {bills.length} Bills
            </span>
          </div>

          {bills.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl space-y-3">
              <p>No bills or scheduled payments recorded.</p>
              <button
                onClick={() => openQuickAdd('bill')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Add First Bill
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedBills.map((b) => {
                const urgency = getUrgency(b);
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      b.paid
                        ? 'bg-white/[0.01] border-white/5 opacity-60'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        onClick={() => toggleBillPaid(b.id)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          b.paid
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/20 text-transparent hover:border-purple-400'
                        }`}
                        title={b.paid ? 'Mark as unpaid' : 'Mark as paid'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm truncate ${b.paid ? 'line-through text-slate-400' : 'text-white'}`}>
                            {b.name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{b.category}</span>
                          <span>·</span>
                          <span>{b.recurring ? 'Recurring' : 'One-time'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-black text-sm text-white">{formatMoney(b.amount, currency)}</span>
                      <button
                        onClick={() => deleteBill(b.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscriptions Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Subscriptions & Usage</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300">
              {subscriptions.length} Services
            </span>
          </div>

          <p className="text-xs text-slate-400">
            FINORA highlights digital subscriptions and helps monitor service utilization.
          </p>

          {subscriptions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl">
              No digital subscriptions added.
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                return (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white text-xs">{sub.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {sub.lastUsedDate ? `Last marked used ${sub.lastUsedDate}` : 'Usage tracking active'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-purple-300">{formatMoney(sub.amount, currency)}</div>
                      <div className="text-[10px] text-slate-500">/ month</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
