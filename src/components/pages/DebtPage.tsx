import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  TrendingDown,
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Zap,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../services/currency';
import {
  calculateEMI,
  calculatePrepayment,
  DebtStrategy,
  forecastDebtPayoff,
  prioritizeDebts,
} from '../../services/brain';
import { Debt } from '../../types';

export const DebtPage: React.FC = () => {
  const {
    debts,
    accounts,
    recordDebtPayment,
    deleteDebt,
    openQuickAdd,
    brainState,
    currency,
  } = useApp();

  const snapshot = brainState.snapshot;
  const [selectedStrategy, setSelectedStrategy] = useState<DebtStrategy>('HYBRID');
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAccountId, setPaymentAccountId] = useState('');

  // Standalone EMI Calculator state
  const [emiPrincipal, setEmiPrincipal] = useState('500000');
  const [emiRate, setEmiRate] = useState('9.5');
  const [emiMonths, setEmiMonths] = useState('36');
  const [emiResult, setEmiResult] = useState(() => calculateEMI(500000, 9.5, 36));

  // Prepayment Simulator state
  const [extraPayment, setExtraPayment] = useState('50000');
  const [prepayMode, setPrepayMode] = useState<'REDUCE_TENURE' | 'REDUCE_EMI'>('REDUCE_TENURE');
  const [prepayResult, setPrepayResult] = useState(() =>
    calculatePrepayment(500000, 9.5, 36, emiResult.emi, 50000, true)
  );

  const totalDebt = snapshot.liabilities;
  const monthlyCommitments = debts.reduce((acc, d) => acc + d.minimumPayment, 0);

  // Ranked debts by selected strategy
  const prioritized = useMemo(() => {
    return prioritizeDebts(debts, selectedStrategy, snapshot.asOf);
  }, [debts, selectedStrategy, snapshot.asOf]);

  // Payoff forecast using monthly plan allocation or minimums
  const monthlyPaymentAssumption =
    brainState.monthlyPlan.debtAndEmi > 0 ? brainState.monthlyPlan.debtAndEmi : monthlyCommitments;
  const payoffForecast = useMemo(() => {
    return forecastDebtPayoff(debts, monthlyPaymentAssumption);
  }, [debts, monthlyPaymentAssumption]);

  const handleCalculateEmi = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = parseFloat(emiPrincipal);
      const r = parseFloat(emiRate);
      const m = parseInt(emiMonths);
      if (p > 0 && r >= 0 && m > 0) {
        const res = calculateEMI(p, r, m);
        setEmiResult(res);

        const x = parseFloat(extraPayment);
        if (x > 0 && x < p) {
          const prepay = calculatePrepayment(p, r, m, res.emi, x, prepayMode === 'REDUCE_TENURE');
          setPrepayResult(prepay);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrepaymentChange = (extraStr: string, mode: 'REDUCE_TENURE' | 'REDUCE_EMI') => {
    setExtraPayment(extraStr);
    setPrepayMode(mode);
    try {
      const p = parseFloat(emiPrincipal);
      const r = parseFloat(emiRate);
      const m = parseInt(emiMonths);
      const x = parseFloat(extraStr);
      if (p > 0 && r >= 0 && m > 0 && x > 0 && x < p) {
        const prepay = calculatePrepayment(p, r, m, emiResult.emi, x, mode === 'REDUCE_TENURE');
        setPrepayResult(prepay);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPaymentModal = (debt: Debt) => {
    setSelectedDebtForPayment(debt);
    setPaymentAmount(Math.min(debt.minimumPayment || debt.remainingAmount, debt.remainingAmount).toString());
    if (accounts.length > 0) {
      setPaymentAccountId(accounts[0].id);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment || !paymentAccountId) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) return;

    recordDebtPayment(selectedDebtForPayment.id, paymentAccountId, amt);
    if (amt >= selectedDebtForPayment.remainingAmount) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    setSelectedDebtForPayment(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            Debt Management & Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Debt Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Compare payoff strategies, track reducing-balance loans, and simulate prepayments.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('debt')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt or Loan</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Active Liabilities
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {formatMoney(totalDebt, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {debts.length} active recorded loan(s)
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Estimated Debt-Free Date
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {payoffForecast.debtFreeMonth || '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {payoffForecast.months > 0 ? `~${payoffForecast.months} months at planned payment pace` : 'No debts active'}
          </div>
        </div>

        <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Monthly Minimum Commitments
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatMoney(monthlyCommitments, currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Required payments before flexible spending
          </div>
        </div>
      </div>

      {/* Debt Strategy Selector & Prioritized List */}
      <div className="bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Prioritized Debt Repayment Order</h3>
            <p className="text-xs text-slate-400">
              Select a mathematical payoff strategy to rank which debt gets extra money first.
            </p>
          </div>

          {/* Strategy Pills */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto scrollbar-none">
            {[
              { id: 'HYBRID' as DebtStrategy, label: 'Hybrid' },
              { id: 'AVALANCHE' as DebtStrategy, label: 'Avalanche' },
              { id: 'SNOWBALL' as DebtStrategy, label: 'Snowball' },
              { id: 'URGENCY' as DebtStrategy, label: 'Urgency' },
              { id: 'PERSONAL_PRIORITY' as DebtStrategy, label: 'Personal' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStrategy(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedStrategy === st.id
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Debts list */}
        {debts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-xl">
            No active debts or loans recorded. You are completely debt-free! 🎯
          </div>
        ) : (
          <div className="space-y-3">
            {prioritized.map((item, index) => {
              const d = item.debt;
              const progress = Math.min(100, Math.round(((d.originalAmount - d.remainingAmount) / d.originalAmount) * 100));
              return (
                <div
                  key={d.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/30">
                        {index + 1}
                      </span>
                      <span className="font-bold text-white text-sm truncate">{d.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {d.interestRate}% Interest
                      </span>
                      {d.penaltyRisk && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Penalty Risk
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300">{item.reason}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Due: {d.dueDate || 'No due date'}</span>
                      <span>·</span>
                      <span>Min Payment: {formatMoney(d.minimumPayment, currency)}</span>
                    </div>

                    {/* Payoff Progress */}
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden max-w-md mt-2">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black text-white">
                        {formatMoney(d.remainingAmount, currency)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        of {formatMoney(d.originalAmount, currency)} ({progress}% paid)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPaymentModal(d)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-colors"
                      >
                        Record Payment
                      </button>

                      <button
                        onClick={() => deleteDebt(d.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete liability"
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

      {/* Standalone Reducing-Balance EMI Calculator & Prepayment Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* EMI Calculator (6 cols) */}
        <div className="lg:col-span-6 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Reducing-Balance EMI Calculator</h3>
          </div>

          <form onSubmit={handleCalculateEmi} className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Loan Amount</label>
                <input
                  type="number"
                  value={emiPrincipal}
                  onChange={(e) => setEmiPrincipal(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Annual Rate %</label>
                <input
                  type="number"
                  step="0.01"
                  value={emiRate}
                  onChange={(e) => setEmiRate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={emiMonths}
                  onChange={(e) => setEmiMonths(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors"
            >
              Recalculate EMI
            </button>
          </form>

          {/* EMI Results */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
            <div className="p-3 rounded-xl bg-purple-600/10 border border-purple-500/20 text-center">
              <div className="text-[10px] text-purple-300 font-bold uppercase">Monthly EMI</div>
              <div className="text-sm sm:text-base font-black text-white mt-0.5">
                {formatMoney(emiResult.emi, currency)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Interest</div>
              <div className="text-sm sm:text-base font-black text-rose-300 mt-0.5">
                {formatMoney(emiResult.totalInterest, currency)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Repayment</div>
              <div className="text-sm sm:text-base font-black text-slate-200 mt-0.5">
                {formatMoney(emiResult.totalRepayment, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Prepayment Simulator (6 cols) */}
        <div className="lg:col-span-6 bg-[#131625] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Prepayment Simulator</h3>
          </div>

          <p className="text-xs text-slate-400">
            See how much interest you save by making a lump-sum extra principal payment.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Extra Payment Amount</label>
                <input
                  type="number"
                  value={extraPayment}
                  onChange={(e) => handlePrepaymentChange(e.target.value, prepayMode)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prepayment Mode</label>
                <select
                  value={prepayMode}
                  onChange={(e) => handlePrepaymentChange(extraPayment, e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="REDUCE_TENURE" className="bg-[#131726]">Reduce Loan Tenure</option>
                  <option value="REDUCE_EMI" className="bg-[#131726]">Reduce Monthly EMI</option>
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">Estimated Interest Saved:</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatMoney(prepayResult.interestSaved, currency)}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                {prepayMode === 'REDUCE_TENURE'
                  ? `Finish your loan ${prepayResult.monthsReduced} months earlier! New tenure: ${prepayResult.newTenureMonths} months.`
                  : `New lower monthly EMI: ${formatMoney(prepayResult.newEmi, currency)} with tenure unchanged.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Debt Payment Modal */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Record Debt Payment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Payment to <span className="font-semibold text-white">{selectedDebtForPayment.name}</span>. Remaining:{' '}
              {formatMoney(selectedDebtForPayment.remainingAmount, currency)}
            </p>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Amount ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Pay From Account</label>
                <select
                  value={paymentAccountId}
                  onChange={(e) => setPaymentAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#131726]">
                      {a.name} ({formatMoney(a.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedDebtForPayment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Apply Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
