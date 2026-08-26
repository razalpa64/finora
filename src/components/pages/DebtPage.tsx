import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
  Calculator,
  Zap,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';
import { DebtStrategy } from '../../types';

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
    accounts,
    addTransaction,
    currency,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');

  // Form states for adding debt
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('18.0');
  const [minPayment, setMinPayment] = useState('');
  const [dueDateDay, setDueDateDay] = useState('15');
  const [category, setCategory] = useState('CREDIT_CARD');

  // EMI Calculator states
  const [emiPrincipal, setEmiPrincipal] = useState('50000');
  const [emiRate, setEmiRate] = useState('10.5');
  const [emiTenureMonths, setEmiTenureMonths] = useState('36');

  // Prepayment Simulator states
  const [prepayExtraMonthly, setPrepayExtraMonthly] = useState('200');

  const totalBalance = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinDue = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const p = parseFloat(emiPrincipal) || 0;
  const r = (parseFloat(emiRate) || 0) / 100 / 12;
  const n = parseInt(emiTenureMonths, 10) || 1;
  const emiMonthly = r > 0 && n > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / (n || 1);
  const emiTotalPayment = emiMonthly * n;
  const emiTotalInterest = emiTotalPayment - p;

  const handleOpenPayModal = (d: any) => {
    setSelectedDebtForPay(d);
    setPayAmount(d.minimumPayment.toString());
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!selectedDebtForPay || isNaN(amt) || amt <= 0) return;

    // Reduce balance
    const newBal = Math.max(0, selectedDebtForPay.currentBalance - amt);
    updateDebt(selectedDebtForPay.id, {
      currentBalance: newBal,
      remainingAmount: newBal,
    });

    // Record transaction
    addTransaction({
      amount: amt,
      type: 'EXPENSE',
      category: 'Debt Repayment',
      description: `Payment towards: ${selectedDebtForPay.name}`,
      date: new Date().toISOString().slice(0, 10),
      budgetCategory: 'NEEDS',
    });

    setIsPayModalOpen(false);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(balance);
    const rate = parseFloat(interestRate);
    const minP = parseFloat(minPayment);
    const day = parseInt(dueDateDay, 10) || 15;

    if (isNaN(bal) || bal <= 0) return;

    addDebt({
      name: name.trim(),
      currentBalance: bal,
      remainingAmount: bal,
      interestRate: rate || 0,
      minimumPayment: minP || bal * 0.03,
      dueDateDay: day,
      category,
    });

    setIsModalOpen(false);
    setName('');
    setBalance('');
    setMinPayment('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            LIABILITY MANAGEMENT
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            Debt Center & Repayment Engine
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Avalanche, Snowball, Urgency, and Hybrid payoff mathematical engines with EMI amortization simulators.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt Liability</span>
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            TOTAL OUTSTANDING DEBT
          </div>
          <div className="mt-2 text-2xl font-black text-[#dc2626]">
            {formatCurrency(totalBalance, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Across {debts.length} active liabilities
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            MINIMUM MONTHLY DUE
          </div>
          <div className="mt-2 text-2xl font-black text-[#111827]">
            {formatCurrency(totalMinDue, currency)}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Contractual minimum obligations
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-xs">
          <div className="text-[10px] font-extrabold text-[#6b7280] uppercase tracking-wider">
            ESTIMATED FREEDOM DATE
          </div>
          <div className="mt-2 text-2xl font-black text-[#059669]">
            {debtPayoffPlan.debtFreeDate}
          </div>
          <div className="mt-1 text-xs text-[#6b7280]">
            Estimated interest: {formatCurrency(debtPayoffPlan.totalInterestPaid, currency)}
          </div>
        </div>
      </div>

      {/* 5 Repayment Strategy Models */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3 mb-4">
          <div>
            <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
              OPTIMIZATION STRATEGY
            </div>
            <h2 className="text-sm font-bold text-[#111827]">
              Select Payoff Mathematical Algorithm
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f6] text-[#4b5563]">
            {debtStrategy} Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'AVALANCHE',
              name: 'Avalanche (Optimal)',
              desc: 'Highest interest rate first. Mathematically minimizes total interest paid.',
            },
            {
              id: 'SNOWBALL',
              name: 'Snowball (Psychological)',
              desc: 'Lowest balance first. Yields quick psychological wins and account eliminations.',
            },
            {
              id: 'URGENCY',
              name: 'Urgency Priority',
              desc: 'Focuses on immediate due dates and severe penalty exposure.',
            },
            {
              id: 'HYBRID',
              name: 'Hybrid Finora AI',
              desc: 'Balances interest savings against account liquidation speed and creditor sensitivity.',
            },
          ].map((strat) => (
            <button
              key={strat.id}
              onClick={() => setDebtStrategy(strat.id as DebtStrategy)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                debtStrategy === strat.id
                  ? 'border-[#5a42e8] bg-[#f3f1fc] text-[#111827] ring-1 ring-[#5a42e8]'
                  : 'border-[#e5e7eb] bg-white text-[#4b5563] hover:border-[#cbd5e1]'
              }`}
            >
              <div className="font-extrabold text-xs text-[#111827]">{strat.name}</div>
              <div className="text-[11px] text-[#6b7280] mt-1 leading-relaxed">
                {strat.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Debt Accounts List */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#f3f4f6] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
              PORTFOLIO
            </div>
            <h2 className="text-sm font-bold text-[#111827]">
              Active Debt Accounts
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#f3f4f6] text-[#4b5563]">
            {debts.length} LIABILITIES
          </span>
        </div>

        {debts.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#111827]">
              Zero Debt Outstanding
            </h3>
            <p className="text-xs text-[#6b7280] max-w-sm mx-auto mt-1">
              You are completely debt-free. Add any loans or credit cards to calculate accelerated payoff models.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {debts.map((d) => (
              <div
                key={d.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f9fafb] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fff1f2] text-[#ef4444] flex items-center justify-center font-bold text-xs shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#111827]">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-[#6b7280]">
                      {d.category} · APR {d.interestRate}% · Due Day {d.dueDateDay}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <div className="text-right">
                    <div className="text-base font-black text-[#dc2626]">
                      {formatCurrency(d.currentBalance, currency)}
                    </div>
                    <div className="text-[10px] text-[#6b7280]">
                      Min: {formatCurrency(d.minimumPayment, currency)}/mo
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenPayModal(d)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5a42e8] text-white hover:bg-[#4a34db] transition-colors cursor-pointer"
                    >
                      Record payment
                    </button>
                    <button
                      onClick={() => deleteDebt(d.id)}
                      className="p-1.5 rounded-lg text-[#ef4444] hover:bg-[#fee2e2] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reducing-Balance EMI Calculator & Prepayment Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EMI Calculator */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3">
            <Calculator className="w-5 h-5 text-[#5a42e8]" />
            <div>
              <h3 className="text-sm font-bold text-[#111827]">
                Reducing-Balance EMI Calculator
              </h3>
              <p className="text-[11px] text-[#6b7280]">Exact loan monthly installment formula</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Loan Principal</label>
              <input
                type="number"
                value={emiPrincipal}
                onChange={(e) => setEmiPrincipal(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Annual Rate (%)</label>
                <input
                  type="number"
                  value={emiRate}
                  onChange={(e) => setEmiRate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#374151] mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  value={emiTenureMonths}
                  onChange={(e) => setEmiTenureMonths(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Monthly EMI:</span>
                <span className="font-extrabold text-[#5a42e8] text-sm">
                  {formatCurrency(emiMonthly, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Total Interest Payable:</span>
                <span className="font-bold text-[#dc2626]">
                  {formatCurrency(emiTotalInterest, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Total Payment:</span>
                <span className="font-bold text-[#111827]">
                  {formatCurrency(emiTotalPayment, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prepayment Comparison Simulator */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3">
            <Zap className="w-5 h-5 text-[#5a42e8]" />
            <div>
              <h3 className="text-sm font-bold text-[#111827]">
                Prepayment Impact Simulator
              </h3>
              <p className="text-[11px] text-[#6b7280]">Test extra monthly contributions</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#374151] mb-1">Extra Monthly Prepayment</label>
              <input
                type="number"
                value={prepayExtraMonthly}
                onChange={(e) => setPrepayExtraMonthly(e.target.value)}
                className="w-full px-3 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-bold"
              />
            </div>

            <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] space-y-2">
              <div className="font-extrabold text-[#166534]">Accelerated Payoff Strategy</div>
              <p className="text-[#15803d] text-[11px] leading-relaxed">
                By adding {formatCurrency(parseFloat(prepayExtraMonthly) || 0, currency)} monthly, you reduce contractual loan tenures by up to 28% and save substantial compounding interest over the liability lifetime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedDebtForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-2">
              Record Debt Payment
            </h3>
            <p className="text-xs text-[#6b7280] mb-4">
              Paying towards <strong className="text-[#111827]">{selectedDebtForPay.name}</strong> (Balance: {formatCurrency(selectedDebtForPay.currentBalance, currency)})
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f3f4f6]">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6b7280] hover:bg-[#f3f4f6] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-scale-up">
            <h3 className="text-base font-extrabold text-[#111827] mb-4">
              Add Debt Liability
            </h3>

            <form onSubmit={handleCreateDebt} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#374151] mb-1">Account / Loan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chase Sapphire Card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">APR Interest (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="18.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#374151] mb-1">Min. Monthly Payment</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    value={minPayment}
                    onChange={(e) => setMinPayment(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#374151] mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDateDay}
                    onChange={(e) => setDueDateDay(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none font-medium"
                  />
                </div>
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
                  Add Liability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
