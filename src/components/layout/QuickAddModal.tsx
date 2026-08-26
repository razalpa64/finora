import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeftRight,
  TrendingUp,
  CreditCard,
  Target,
  CalendarDays,
  Wallet,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AccountType, DebtType, GoalPriority, IncomeSource, TransactionType, useApp } from '../../context/AppContext';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddInitialTab,
    accounts,
    addTransaction,
    addIncomeSource,
    addAccount,
    addDebt,
    addGoal,
    addBill,
    currency,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('transaction');

  useEffect(() => {
    if (isQuickAddOpen && quickAddInitialTab) {
      setActiveTab(quickAddInitialTab);
    }
  }, [isQuickAddOpen, quickAddInitialTab]);

  // Transaction form state
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<TransactionType>('EXPENSE');
  const [txCategory, setTxCategory] = useState('Groceries');
  const [txAccountId, setTxAccountId] = useState('');
  const [txRelatedAccountId, setTxRelatedAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txDescription, setTxDescription] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Income form state
  const [incName, setIncName] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incFrequency, setIncFrequency] = useState<IncomeSource['frequency']>('MONTHLY');
  const [incNextDate, setIncNextDate] = useState(new Date().toISOString().split('T')[0]);
  const [incAccountId, setIncAccountId] = useState('');
  const [incRecordToday, setIncRecordToday] = useState(true);
  const [incNotes, setIncNotes] = useState('');

  // Account form state
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('CHECKING');
  const [accBalance, setAccBalance] = useState('');
  const [accEmergency, setAccEmergency] = useState(false);

  // Debt form state
  const [debtName, setDebtName] = useState('');
  const [debtType, setDebtType] = useState<DebtType>('PERSONAL');
  const [debtOriginal, setDebtOriginal] = useState('');
  const [debtRemaining, setDebtRemaining] = useState('');
  const [debtRate, setDebtRate] = useState('10.5');
  const [debtMinPay, setDebtMinPay] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtPriority, setDebtPriority] = useState(3);
  const [debtPenalty, setDebtPenalty] = useState(false);

  // Goal form state
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalMonthly, setGoalMonthly] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalPriority, setGoalPriority] = useState<GoalPriority>('MEDIUM');

  // Bill form state
  const [billName, setBillName] = useState('');
  const [billCategory, setBillCategory] = useState('Utilities');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [billRecurring, setBillRecurring] = useState(true);
  const [billSubscription, setBillSubscription] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      if (!txAccountId) setTxAccountId(accounts[0].id);
      if (!incAccountId) setIncAccountId(accounts[0].id);
    }
  }, [accounts]);

  if (!isQuickAddOpen) return null;

  const handleClose = () => {
    setIsQuickAddOpen(false);
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (!txAccountId) return;

    addTransaction(
      amt,
      txType,
      txCategory,
      txAccountId,
      txDescription,
      txType === 'TRANSFER' ? txRelatedAccountId : undefined,
      txDate,
      txNotes
    );
    handleClose();
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (!incAccountId) return;

    addIncomeSource(incName, amt, incFrequency, incNextDate, incAccountId, incNotes, incRecordToday);
    handleClose();
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(accBalance || '0');
    if (!accName) return;

    addAccount(accName, accType, isNaN(bal) ? 0 : bal, accEmergency);
    handleClose();
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(debtOriginal);
    const rem = debtRemaining ? parseFloat(debtRemaining) : orig;
    const rate = parseFloat(debtRate || '0');
    const minPay = parseFloat(debtMinPay || '0');
    if (isNaN(orig) || orig <= 0) return;

    addDebt({
      name: debtName,
      type: debtType,
      originalAmount: orig,
      remainingAmount: isNaN(rem) ? orig : rem,
      interestRate: isNaN(rate) ? 0 : rate,
      minimumPayment: isNaN(minPay) ? 0 : minPay,
      dueDate: debtDueDate || undefined,
      userPriority: debtPriority,
      relationshipImportance: 3,
      penaltyRisk: debtPenalty,
    });
    handleClose();
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    const current = parseFloat(goalCurrent || '0');
    const monthly = parseFloat(goalMonthly || '0');
    if (isNaN(target) || target <= 0) return;

    addGoal({
      name: goalName,
      targetAmount: target,
      currentAmount: isNaN(current) ? 0 : current,
      monthlyContribution: isNaN(monthly) ? 0 : monthly,
      deadline: goalDeadline || undefined,
      priority: goalPriority,
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    handleClose();
  };

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(billAmount);
    if (isNaN(amt) || amt <= 0) return;

    addBill({
      name: billName,
      category: billCategory,
      amount: amt,
      dueDate: billDueDate,
      recurring: billRecurring,
      paid: false,
      subscription: billSubscription,
      lastUsedDate: billSubscription ? new Date().toISOString().split('T')[0] : undefined,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="fixed inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-xl bg-[#131726] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">Record Money Movement</h2>
            <p className="text-xs text-slate-400">Updates connected accounts and FINORA Brain atomically.</p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/5 overflow-x-auto scrollbar-none">
          {[
            { id: 'transaction', label: 'Transaction', icon: ArrowLeftRight },
            { id: 'income', label: 'Recurring Income', icon: TrendingUp },
            { id: 'account', label: 'Account', icon: Wallet },
            { id: 'debt', label: 'Debt / Loan', icon: CreditCard },
            { id: 'goal', label: 'Goal', icon: Target },
            { id: 'bill', label: 'Bill', icon: CalendarDays },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all shrink-0
                  ${
                    isActive
                      ? 'border-purple-500 text-purple-300 bg-white/[0.04]'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* 1. TRANSACTION TAB */}
          {activeTab === 'transaction' && (
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as TransactionType)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="EXPENSE" className="bg-[#131726]">Expense</option>
                    <option value="INCOME" className="bg-[#131726]">Income</option>
                    <option value="TRANSFER" className="bg-[#131726]">Transfer</option>
                    <option value="DEBT_PAYMENT" className="bg-[#131726]">Debt / EMI Payment</option>
                    <option value="GOAL_CONTRIBUTION" className="bg-[#131726]">Goal Earmark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder="e.g. Grocery shopping, Electricity bill"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    placeholder="e.g. Groceries, Housing, Dining"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {txType === 'TRANSFER' ? 'From Account' : 'Account'}
                  </label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#131726]">
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                {txType === 'TRANSFER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">To Destination Account</label>
                    <select
                      value={txRelatedAccountId}
                      onChange={(e) => setTxRelatedAccountId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="" className="bg-[#131726]">Select destination account</option>
                      {accounts
                        .filter((a) => a.id !== txAccountId)
                        .map((a) => (
                          <option key={a.id} value={a.id} className="bg-[#131726]">
                            {a.name} ({a.type})
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Optional notes or receipt tag"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          )}

          {/* 2. RECURRING INCOME TAB */}
          {activeTab === 'income' && (
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Income Source Name</label>
                <input
                  type="text"
                  required
                  value={incName}
                  onChange={(e) => setIncName(e.target.value)}
                  placeholder="e.g. Primary Tech Salary, Consulting Retainer"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                  <select
                    value={incFrequency}
                    onChange={(e) => setIncFrequency(e.target.value as IncomeSource['frequency'])}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="MONTHLY" className="bg-[#131726]">Monthly</option>
                    <option value="BIWEEKLY" className="bg-[#131726]">Every 2 Weeks</option>
                    <option value="WEEKLY" className="bg-[#131726]">Weekly</option>
                    <option value="QUARTERLY" className="bg-[#131726]">Quarterly</option>
                    <option value="ANNUAL" className="bg-[#131726]">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Next Pay Date</label>
                  <input
                    type="date"
                    required
                    value={incNextDate}
                    onChange={(e) => setIncNextDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deposit Account</label>
                  <select
                    value={incAccountId}
                    onChange={(e) => setIncAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#131726]">
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={incRecordToday}
                  onChange={(e) => setIncRecordToday(e.target.checked)}
                  className="rounded border-white/10 text-purple-600 focus:ring-0"
                />
                <span>Also record this income payment today into account balance</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Save Income Source
                </button>
              </div>
            </form>
          )}

          {/* 3. ACCOUNT TAB */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. Chase Checking, HDFC Savings"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="CHECKING" className="bg-[#131726]">Checking / Operating</option>
                    <option value="SAVINGS" className="bg-[#131726]">Savings</option>
                    <option value="CASH" className="bg-[#131726]">Cash Wallet</option>
                    <option value="INVESTMENT" className="bg-[#131726]">Investment / Brokerage</option>
                    <option value="OTHER" className="bg-[#131726]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Balance ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={accEmergency}
                  onChange={(e) => setAccEmergency(e.target.checked)}
                  className="rounded border-white/10 text-purple-600 focus:ring-0"
                />
                <span>Designate this account as Emergency Reserve fund</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* 4. DEBT TAB */}
          {activeTab === 'debt' && (
            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Creditor / Loan Name</label>
                <input
                  type="text"
                  required
                  value={debtName}
                  onChange={(e) => setDebtName(e.target.value)}
                  placeholder="e.g. Car Loan, Credit Card, Friend"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Original Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={debtOriginal}
                    onChange={(e) => setDebtOriginal(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Remaining Balance ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtRemaining}
                    onChange={(e) => setDebtRemaining(e.target.value)}
                    placeholder="Same as original if blank"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Interest Rate % (Annual)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtRate}
                    onChange={(e) => setDebtRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Payment / EMI</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtMinPay}
                    onChange={(e) => setDebtMinPay(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Debt Type</label>
                  <select
                    value={debtType}
                    onChange={(e) => setDebtType(e.target.value as DebtType)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="PERSONAL" className="bg-[#131726]">Personal Loan</option>
                    <option value="CREDIT_CARD" className="bg-[#131726]">Credit Card</option>
                    <option value="VEHICLE_LOAN" className="bg-[#131726]">Vehicle Loan</option>
                    <option value="HOME_LOAN" className="bg-[#131726]">Home Loan</option>
                    <option value="EDUCATION_LOAN" className="bg-[#131726]">Education Loan</option>
                    <option value="BNPL" className="bg-[#131726]">BNPL / Installment</option>
                    <option value="FRIEND" className="bg-[#131726]">Friend / Family</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={debtPenalty}
                  onChange={(e) => setDebtPenalty(e.target.checked)}
                  className="rounded border-white/10 text-purple-600 focus:ring-0"
                />
                <span>Missed payment has severe financial or penalty risk</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Add Liability
                </button>
              </div>
            </form>
          )}

          {/* 5. GOAL TAB */}
          {activeTab === 'goal' && (
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Vacation Trip, New Laptop, Wedding"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currently Funded ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Contribution ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalMonthly}
                    onChange={(e) => setGoalMonthly(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Deadline (Optional)</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={goalPriority}
                  onChange={(e) => setGoalPriority(e.target.value as GoalPriority)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="CRITICAL" className="bg-[#131726]">Critical Priority</option>
                  <option value="HIGH" className="bg-[#131726]">High Priority</option>
                  <option value="MEDIUM" className="bg-[#131726]">Medium Priority</option>
                  <option value="LOW" className="bg-[#131726]">Low Priority</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Savings Goal</span>
                </button>
              </div>
            </form>
          )}

          {/* 6. BILL TAB */}
          {activeTab === 'bill' && (
            <form onSubmit={handleBillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bill or Subscription Name</label>
                <input
                  type="text"
                  required
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  placeholder="e.g. Electricity, Netflix, Cloud Storage"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={billCategory}
                  onChange={(e) => setBillCategory(e.target.value)}
                  placeholder="e.g. Utilities, Software, Insurance"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billRecurring}
                    onChange={(e) => setBillRecurring(e.target.checked)}
                    className="rounded border-white/10 text-purple-600 focus:ring-0"
                  />
                  <span>Recurring payment cycle</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billSubscription}
                    onChange={(e) => setBillSubscription(e.target.checked)}
                    className="rounded border-white/10 text-purple-600 focus:ring-0"
                  />
                  <span>This is a digital recurring subscription (track usage)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Add Bill
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
