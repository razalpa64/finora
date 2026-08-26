import {
  Account,
  Bill,
  BrainResponse,
  BrainState,
  Budget,
  Debt,
  FinancialSnapshot,
  Forecast,
  ForecastPoint,
  Goal,
  HealthScore,
  IncomeSource,
  Investment,
  MonthlyPlan,
  Recommendation,
  SafeToSpendResult,
  Severity,
  TransactionRecord,
} from '../types';
import { formatMoney } from './currency';

const ESSENTIAL_CATEGORIES = new Set([
  'housing',
  'rent',
  'utilities',
  'groceries',
  'transport',
  'insurance',
  'healthcare',
  'medical',
  'education',
]);

export function calculateMonthlyEquivalent(amount: number, frequency: IncomeSource['frequency']): number {
  switch (frequency) {
    case 'WEEKLY':
      return Math.round((amount * 52) / 12 * 100) / 100;
    case 'BIWEEKLY':
      return Math.round((amount * 26) / 12 * 100) / 100;
    case 'MONTHLY':
      return amount;
    case 'QUARTERLY':
      return Math.round((amount / 3) * 100) / 100;
    case 'ANNUAL':
      return Math.round((amount / 12) * 100) / 100;
    default:
      return amount;
  }
}

export function getNextDateAfter(dateStr: string, frequency: IncomeSource['frequency']): string {
  const date = new Date(dateStr);
  switch (frequency) {
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'BIWEEKLY':
      date.setDate(date.getDate() + 14);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'QUARTERLY':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'ANNUAL':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

// 1. CASH FLOW ENGINE
export function createFinancialSnapshot(
  accounts: Account[],
  incomeSources: IncomeSource[],
  transactions: TransactionRecord[],
  debts: Debt[],
  goals: Goal[],
  bills: Bill[],
  budgets: Budget[],
  investmentsList: Investment[],
  asOfDateStr?: string
): FinancialSnapshot {
  const asOf = asOfDateStr || new Date().toISOString().split('T')[0];
  const currentDate = new Date(asOf);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Current month bounds
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
  const endOfMonthStr = endOfMonth.toISOString().split('T')[0];

  // Assets & Cash
  const assets = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
  const cash = accounts
    .filter((a) => a.type === 'CASH' || a.type === 'CHECKING')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const emergencyFund = accounts
    .filter((a) => a.emergencyFund)
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const investments = accounts
    .filter((a) => a.type === 'INVESTMENT')
    .reduce((acc, a) => acc + (a.balance || 0), 0);

  // Liabilities
  const liabilities = debts.reduce((acc, d) => acc + (d.remainingAmount || 0), 0);
  const netWorth = assets - liabilities;

  // Filter transactions this month
  const thisMonthTxs = transactions.filter((t) => t.date >= startOfMonthStr && t.date <= endOfMonthStr);

  const recordedIncome = thisMonthTxs
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const expectedRecurringIncome = incomeSources
    .filter((s) => s.active)
    .reduce((acc, s) => acc + calculateMonthlyEquivalent(s.amount, s.frequency), 0);

  const monthlyIncome = expectedRecurringIncome > 0 ? expectedRecurringIncome : recordedIncome;
  const usesRecurringIncomePlan = expectedRecurringIncome > 0;

  const monthlyExpenses = thisMonthTxs
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyDebtPayments = thisMonthTxs
    .filter((t) => t.type === 'DEBT_PAYMENT' || t.type === 'EMI_PAYMENT')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyOutflow = monthlyExpenses + monthlyDebtPayments;

  // Expense by category
  const expenseByCategory: Record<string, number> = {};
  for (const t of thisMonthTxs) {
    if (t.type === 'EXPENSE') {
      const cat = t.category || 'General';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
    }
  }

  // Essential expenses
  let essentialExpenses = 0;
  for (const [cat, amt] of Object.entries(expenseByCategory)) {
    if (ESSENTIAL_CATEGORIES.has(cat.toLowerCase())) {
      essentialExpenses += amt;
    }
  }

  // Upcoming bills this month (due between asOf and endOfMonth and not paid)
  const upcomingBills = bills
    .filter((b) => !b.paid && b.dueDate >= asOf && b.dueDate <= endOfMonthStr)
    .reduce((acc, b) => acc + b.amount, 0);

  // Upcoming debts this month
  const upcomingDebtCommitments = debts
    .filter((d) => d.dueDate && d.dueDate >= asOf && d.dueDate <= endOfMonthStr && d.remainingAmount > 0)
    .reduce((acc, d) => acc + Math.min(d.minimumPayment, d.remainingAmount), 0);

  // Planned goal contributions
  const plannedGoalContributions = goals.reduce((acc, g) => acc + (g.monthlyContribution || 0), 0);

  return {
    asOf,
    assets: Math.round(assets * 100) / 100,
    cash: Math.round(cash * 100) / 100,
    emergencyFund: Math.round(emergencyFund * 100) / 100,
    investments: Math.round(investments * 100) / 100,
    liabilities: Math.round(liabilities * 100) / 100,
    netWorth: Math.round(netWorth * 100) / 100,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    recordedIncome: Math.round(recordedIncome * 100) / 100,
    expectedRecurringIncome: Math.round(expectedRecurringIncome * 100) / 100,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    monthlyDebtPayments: Math.round(monthlyDebtPayments * 100) / 100,
    monthlyOutflow: Math.round(monthlyOutflow * 100) / 100,
    essentialExpenses: Math.round(essentialExpenses * 100) / 100,
    upcomingBills: Math.round(upcomingBills * 100) / 100,
    upcomingDebtCommitments: Math.round(upcomingDebtCommitments * 100) / 100,
    plannedGoalContributions: Math.round(plannedGoalContributions * 100) / 100,
    usesRecurringIncomePlan,
    accounts,
    incomeSources,
    transactions,
    debts,
    goals,
    bills,
    budgets,
    investmentsList,
    expenseByCategory,
  };
}

// 2. BUDGET ENGINE (Safe-to-spend & Priority Monthly Plan)
export function calculateSafeToSpend(snapshot: FinancialSnapshot): SafeToSpendResult {
  const asOfDate = new Date(snapshot.asOf);
  const endOfMonth = new Date(asOfDate.getFullYear(), asOfDate.getMonth() + 1, 0);
  const remainingDays = Math.max(1, endOfMonth.getDate() - asOfDate.getDate() + 1);

  const incomeCapacity =
    snapshot.monthlyIncome -
    snapshot.monthlyOutflow -
    snapshot.upcomingBills -
    snapshot.upcomingDebtCommitments;

  const operating = Math.min(Math.max(0, incomeCapacity), Math.max(0, snapshot.cash));

  const emergencyTarget = snapshot.essentialExpenses * 3;
  const emergencyGap = Math.max(0, emergencyTarget - snapshot.emergencyFund);
  const protectedReserve = Math.min(emergencyGap, snapshot.monthlyIncome * 0.05);

  const goals = Math.min(snapshot.plannedGoalContributions, snapshot.monthlyIncome * 0.12);
  const beforeBuffer = Math.max(0, operating - protectedReserve - goals);
  const safetyBuffer = beforeBuffer * 0.3;
  const flexible = Math.max(0, beforeBuffer - safetyBuffer);

  const today = Math.floor((flexible / remainingDays) * 100) / 100;

  const explanation = `Operating capacity after recorded outflow and obligations is protected by a 30% cash-flow buffer before it is divided across ${remainingDays} remaining day${
    remainingDays === 1 ? '' : 's'
  }.`;

  return {
    today: Math.max(0, today),
    flexibleRemaining: Math.round(flexible * 100) / 100,
    operatingCapacity: Math.round(operating * 100) / 100,
    protectedReserve: Math.round((protectedReserve + safetyBuffer) * 100) / 100,
    remainingDays,
    explanation,
  };
}

export function createMonthlyPlan(snapshot: FinancialSnapshot): MonthlyPlan {
  const income = snapshot.monthlyIncome;
  if (income <= 0) {
    return {
      income: 0,
      essentials: 0,
      debtAndEmi: 0,
      emergencySavings: 0,
      goals: 0,
      investments: 0,
      flexible: 0,
      reserve: 0,
      score: 0,
      explanations: ['Add reliable monthly income to build an allocation plan.'],
    };
  }

  const essentials = Math.min(snapshot.essentialExpenses * 1.03, income * 0.65);
  let available = Math.max(0, income - essentials);

  const requestedDebt = snapshot.debts.reduce((acc, d) => acc + d.minimumPayment, 0);
  const debt = Math.min(available, Math.min(requestedDebt, income * 0.18));
  available -= debt;

  const emergencyGap = Math.max(0, snapshot.essentialExpenses * 3 - snapshot.emergencyFund);
  const emergency = Math.min(available, Math.min(emergencyGap, income * 0.08));
  available -= emergency;

  const goals = Math.min(available, Math.min(snapshot.plannedGoalContributions, income * 0.08));
  available -= goals;

  const readyToInvest =
    snapshot.emergencyFund >= snapshot.essentialExpenses * 1.5 &&
    !snapshot.debts.some((d) => d.interestRate > 15);

  const investments = readyToInvest ? Math.min(available, income * 0.05) : 0;
  available -= investments;

  const reserve = Math.min(available, income * 0.05);
  available -= reserve;

  const flexible = Math.max(0, available);

  let score = 75;
  const notes: string[] = [];

  if (essentials <= income * 0.55) {
    score += 6;
    notes.push('Essential costs remain within 55% of recorded income.');
  } else {
    score -= 5;
    notes.push('Essential costs use more than 55% of income.');
  }

  if (debt > 0) {
    score += 4;
    notes.push('The plan protects required debt and EMI payments before discretionary spending.');
  }

  if (emergency > 0) {
    score += 5;
    notes.push('Emergency reserves receive funding based on the actual reserve gap.');
  }

  if (flexible > income * 0.2) {
    score -= 4;
    notes.push('Flexible spending is relatively high; keep the reserve unspent.');
  }

  if (!readyToInvest) {
    notes.push('Investment allocation is paused because emergency-fund or high-cost-debt conditions come first.');
  } else {
    notes.push('A modest investment allocation is included after near-term obligations.');
  }

  return {
    income: Math.round(income * 100) / 100,
    essentials: Math.round(essentials * 100) / 100,
    debtAndEmi: Math.round(debt * 100) / 100,
    emergencySavings: Math.round(emergency * 100) / 100,
    goals: Math.round(goals * 100) / 100,
    investments: Math.round(investments * 100) / 100,
    flexible: Math.round(flexible * 100) / 100,
    reserve: Math.round(reserve * 100) / 100,
    score: Math.max(0, Math.min(100, score)),
    explanations: notes,
  };
}

// 3. DEBT ENGINE
export type DebtStrategy = 'AVALANCHE' | 'SNOWBALL' | 'URGENCY' | 'HYBRID' | 'PERSONAL_PRIORITY';

export interface PrioritizedDebt {
  debt: Debt;
  score: number;
  reason: string;
}

export function calculateHybridScore(debt: Debt, todayStr: string): number {
  const today = new Date(todayStr);
  const due = debt.dueDate ? new Date(debt.dueDate) : null;
  const days = due ? Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 120;

  const dueScore = days <= 0 ? 45 : days <= 7 ? 40 : days <= 14 ? 32 : days <= 30 ? 20 : 8;
  const rateScore = Math.min(25, Math.round(debt.interestRate * 1.2));
  const relationshipScore = (debt.relationshipImportance || 3) * 3;
  const personalScore = (6 - Math.max(1, Math.min(5, debt.userPriority || 3))) * 3;
  const penaltyScore = debt.penaltyRisk ? 12 : 0;

  return dueScore + rateScore + relationshipScore + personalScore + penaltyScore;
}

export function prioritizeDebts(debts: Debt[], strategy: DebtStrategy, todayStr: string): PrioritizedDebt[] {
  const list = [...debts];

  if (strategy === 'AVALANCHE') {
    list.sort((a, b) => b.interestRate - a.interestRate || (a.dueDate || '').localeCompare(b.dueDate || ''));
  } else if (strategy === 'SNOWBALL') {
    list.sort((a, b) => a.remainingAmount - b.remainingAmount);
  } else if (strategy === 'URGENCY') {
    list.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  } else if (strategy === 'PERSONAL_PRIORITY') {
    list.sort((a, b) => (a.userPriority || 3) - (b.userPriority || 3) || (a.dueDate || '').localeCompare(b.dueDate || ''));
  } else {
    // HYBRID
    list.sort((a, b) => calculateHybridScore(b, todayStr) - calculateHybridScore(a, todayStr));
  }

  return list.map((d) => {
    const score = calculateHybridScore(d, todayStr);
    let reason = '';
    if (strategy === 'AVALANCHE') {
      reason = `Prioritized by interest cost (${d.interestRate}%).`;
    } else if (strategy === 'SNOWBALL') {
      reason = 'Prioritized by remaining balance.';
    } else if (strategy === 'PERSONAL_PRIORITY') {
      reason = 'Uses your manual priority ranking.';
    } else {
      if (d.dueDate) {
        const diff = Math.ceil((new Date(d.dueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 7) {
          reason = diff < 0 ? 'Overdue — immediate attention needed.' : 'Due within seven days.';
        }
      }
      if (!reason) {
        reason = d.penaltyRisk
          ? 'Payment delay may have a financial penalty.'
          : 'Balanced priority based on urgency, rate and importance.';
      }
    }
    return { debt: d, score, reason };
  });
}

export interface DebtForecast {
  months: number;
  debtFreeMonth: string | null; // e.g. "December 2026"
  estimatedInterest: number;
  totalPaid: number;
  balances: number[];
}

export function forecastDebtPayoff(debts: Debt[], monthlyPayment: number): DebtForecast {
  const balance = debts.reduce((acc, d) => acc + d.remainingAmount, 0);
  if (balance <= 0) {
    return {
      months: 0,
      debtFreeMonth: 'Now',
      estimatedInterest: 0,
      totalPaid: 0,
      balances: [0],
    };
  }

  if (!monthlyPayment || monthlyPayment <= 0) {
    return {
      months: -1,
      debtFreeMonth: null,
      estimatedInterest: 0,
      totalPaid: 0,
      balances: [balance],
    };
  }

  // Weighted annual interest rate
  let weightedRate = 0;
  for (const d of debts) {
    weightedRate += d.remainingAmount * d.interestRate;
  }
  const monthlyRate = weightedRate / balance / 1200;

  let currentBal = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  const points: number[] = [balance];
  let months = 0;

  while (currentBal > 0 && months < 600) {
    const mInterest = currentBal * monthlyRate;
    totalInterest += mInterest;
    currentBal += mInterest;
    const paid = Math.min(monthlyPayment, currentBal);
    currentBal -= paid;
    totalPaid += paid;
    months++;
    points.push(Math.max(0, Math.round(currentBal * 100) / 100));
  }

  const freeDate = new Date();
  freeDate.setMonth(freeDate.getMonth() + months);
  const debtFreeMonth =
    months >= 600
      ? null
      : freeDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return {
    months,
    debtFreeMonth,
    estimatedInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    balances: points,
  };
}

// 4. EMI ENGINE
export interface EMIResult {
  emi: number;
  totalInterest: number;
  totalRepayment: number;
}

export function calculateEMI(principal: number, annualRate: number, months: number): EMIResult {
  if (principal <= 0 || annualRate < 0 || months <= 0) {
    throw new Error('Principal, rate, and tenure must be valid positive numbers.');
  }

  let emi = 0;
  if (annualRate === 0) {
    emi = principal / months;
  } else {
    const r = annualRate / 1200;
    const factor = Math.pow(1 + r, months);
    emi = (principal * r * factor) / (factor - 1);
  }

  const totalRepayment = emi * months;
  const totalInterest = totalRepayment - principal;

  return {
    emi: Math.round(emi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
}

export interface PrepaymentResult {
  newEmi: number;
  newTenureMonths: number;
  interestSaved: number;
  monthsReduced: number;
  mode: 'REDUCE_EMI' | 'REDUCE_TENURE';
}

export function calculatePrepayment(
  principal: number,
  annualRate: number,
  remainingMonths: number,
  currentEmi: number,
  extraPayment: number,
  reduceTenure: boolean
): PrepaymentResult {
  if (extraPayment <= 0 || extraPayment >= principal) {
    throw new Error('Extra payment must be positive and lower than remaining principal.');
  }

  const original = calculateEMI(principal, annualRate, remainingMonths);
  const reducedPrincipal = principal - extraPayment;

  if (!reduceTenure) {
    const next = calculateEMI(reducedPrincipal, annualRate, remainingMonths);
    return {
      newEmi: next.emi,
      newTenureMonths: remainingMonths,
      interestSaved: Math.max(0, Math.round((original.totalInterest - next.totalInterest) * 100) / 100),
      monthsReduced: 0,
      mode: 'REDUCE_EMI',
    };
  }

  const monthlyRate = annualRate / 1200;
  let bal = reducedPrincipal;
  let months = 0;
  let interest = 0;

  while (bal > 0 && months < remainingMonths) {
    const charge = bal * monthlyRate;
    interest += charge;
    bal = bal + charge - currentEmi;
    months++;
  }

  return {
    newEmi: currentEmi,
    newTenureMonths: months,
    interestSaved: Math.max(0, Math.round((original.totalInterest - interest) * 100) / 100),
    monthsReduced: Math.max(0, remainingMonths - months),
    mode: 'REDUCE_TENURE',
  };
}

// 5. FINANCIAL HEALTH ENGINE
export function calculateFinancialHealth(snapshot: FinancialSnapshot): HealthScore {
  const factors: Record<string, number> = {};
  const income = snapshot.monthlyIncome;

  // Savings score (target 25% savings rate)
  const savingsAmount = Math.max(0, income - snapshot.monthlyOutflow);
  const savings = income === 0 ? 0 : Math.min(100, Math.round(((savingsAmount / income) / 0.25) * 100));

  // Debt score
  const minPayments = snapshot.debts.reduce((acc, d) => acc + d.minimumPayment, 0);
  let debt = 100;
  if (income === 0) {
    debt = snapshot.liabilities === 0 ? 100 : 20;
  } else {
    const ratio = (minPayments / income) / 0.35;
    debt = Math.max(0, Math.min(100, Math.round((1 - ratio * 0.75) * 100)));
  }

  // Emergency readiness (6 months target)
  const emergencyTarget = snapshot.essentialExpenses * 6;
  const emergency =
    emergencyTarget === 0
      ? 60
      : Math.min(100, Math.round((snapshot.emergencyFund / emergencyTarget) * 100));

  // Budget score
  let budget = 60;
  if (snapshot.budgets.length > 0) {
    let sum = 0;
    for (const b of snapshot.budgets) {
      const spent = snapshot.expenseByCategory[b.category] || 0;
      const r = spent / b.limitAmount;
      sum += r <= 0.85 ? 95 : r <= 1.0 ? 82 : Math.max(20, 82 - (r - 1) * 100);
    }
    budget = Math.round(sum / snapshot.budgets.length);
  }

  // Goals score
  let goals = 70;
  if (snapshot.goals.length > 0) {
    const sum = snapshot.goals.reduce((acc, g) => acc + Math.min(1, g.currentAmount / g.targetAmount), 0);
    goals = Math.round((sum / snapshot.goals.length) * 100);
  }

  // Cash flow score
  let cashFlow = 30;
  if (income > 0) {
    const upcoming = snapshot.upcomingBills + snapshot.upcomingDebtCommitments;
    const ratio = (upcoming / income) / 0.5;
    cashFlow = Math.max(0, Math.min(100, Math.round((1 - ratio * 0.75) * 100)));
  }

  factors['Savings'] = savings;
  factors['Debt'] = debt;
  factors['Emergency'] = emergency;
  factors['Budget'] = budget;
  factors['Goals'] = goals;
  factors['Cash flow'] = cashFlow;

  const overall = Math.round(
    savings * 0.18 + debt * 0.2 + emergency * 0.18 + budget * 0.16 + goals * 0.12 + cashFlow * 0.16
  );

  const label =
    overall >= 85 ? 'Excellent' : overall >= 70 ? 'Stable' : overall >= 55 ? 'Needs attention' : 'At risk';

  const reasons = [
    "Savings is based on recorded income minus this month's outflow.",
    'Debt and cash-flow scores use minimum commitments relative to recorded income.',
    'Emergency readiness is measured against six months of recorded essential expenses.',
  ];

  return {
    overall: Math.max(0, Math.min(100, overall)),
    factors,
    reasons,
    label,
  };
}

// 6. FORECAST ENGINE (30-day timeline)
export function calculateForecast(snapshot: FinancialSnapshot, days = 30): Forecast {
  let balance = snapshot.cash;
  const reserve = snapshot.essentialExpenses;
  const points: ForecastPoint[] = [];
  let pressureDate: string | null = null;
  const startDate = new Date(snapshot.asOf);

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    let income = 0;
    let out = 0;

    // Recurring income occurrences
    for (const src of snapshot.incomeSources) {
      if (src.active && src.nextIncomeDate) {
        let occ = src.nextIncomeDate;
        while (occ < dateStr) {
          occ = getNextDateAfter(occ, src.frequency);
        }
        if (occ === dateStr) {
          income += src.amount;
        }
      }
    }

    // Bills due on this date
    for (const b of snapshot.bills) {
      if (!b.paid && b.dueDate === dateStr) {
        out += b.amount;
      }
    }

    // Debts due on this date
    for (const debt of snapshot.debts) {
      if (debt.dueDate === dateStr && debt.remainingAmount > 0) {
        out += Math.min(debt.minimumPayment, debt.remainingAmount);
      }
    }

    // Goal contribution on 1st of month
    if (i > 0 && d.getDate() === 1) {
      out += snapshot.plannedGoalContributions;
    }

    balance = balance + income - out;
    const belowReserve = balance < reserve;
    if (belowReserve && !pressureDate) {
      pressureDate = dateStr;
    }

    points.push({
      date: dateStr,
      income,
      outflow: out,
      endingBalance: Math.round(balance * 100) / 100,
      belowReserve,
    });
  }

  return {
    points,
    firstPressureDate: pressureDate,
    projectedEndingBalance: Math.round(balance * 100) / 100,
    assumption:
      'Only configured recurring income schedules are forecast; unrecorded income and variable spending are excluded.',
  };
}

// 7. RECOMMENDATION ENGINE
export function generateRecommendations(
  snapshot: FinancialSnapshot,
  safe: SafeToSpendResult,
  health: HealthScore,
  currencyCode = 'INR'
): Recommendation[] {
  const list: Recommendation[] = [];
  const today = snapshot.asOf;

  // 1. Urgent debt due
  const urgentDebt = snapshot.debts
    .filter((d) => d.dueDate && d.remainingAmount > 0)
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];

  if (urgentDebt && urgentDebt.dueDate) {
    const diff = Math.ceil((new Date(urgentDebt.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 7) {
      list.push({
        severity: diff < 0 ? 'CRITICAL' : 'WARNING',
        title: `${urgentDebt.name} payment ${diff < 0 ? 'is overdue' : `due in ${diff} days`}`,
        message: `Protect ${formatMoney(urgentDebt.minimumPayment, currencyCode)} for this obligation before flexible spending.`,
        action: 'Review debt',
        fact: `Recorded balance: ${formatMoney(urgentDebt.remainingAmount, currencyCode)}`,
        assumption: 'Assumes the recorded due date and minimum payment are current.',
      });
    }
  }

  // 2. Emergency fund readiness
  const target = snapshot.essentialExpenses * 3;
  if (target > 0 && snapshot.emergencyFund < target) {
    const pct = Math.floor((snapshot.emergencyFund / target) * 100);
    list.push({
      severity: pct < 30 ? 'WARNING' : 'ATTENTION',
      title: `Emergency reserve is ${pct}% funded`,
      message: 'Your reserve is below three months of recorded essential expenses.',
      action: 'Build reserve',
      fact: `Current reserve: ${formatMoney(snapshot.emergencyFund, currencyCode)}`,
      assumption: "Target uses three months of this month's essential spending.",
    });
  }

  // 3. Subscription load
  const subs = snapshot.bills.filter((b) => b.subscription).reduce((acc, b) => acc + b.amount, 0);
  if (snapshot.monthlyIncome > 0 && subs > snapshot.monthlyIncome * 0.05) {
    list.push({
      severity: 'ATTENTION',
      title: 'Subscription load is elevated',
      message: 'Recorded subscriptions exceed 5% of monthly income.',
      action: 'Review subscriptions',
      fact: `Monthly subscriptions: ${formatMoney(subs, currencyCode)}`,
      assumption: 'All recurring subscriptions are assumed active.',
    });
  }

  // 4. Safe to spend zero
  if (safe.today === 0) {
    list.push({
      severity: 'WARNING',
      title: 'Flexible spending is paused',
      message: 'Recorded obligations and protected allocations use the available operating capacity.',
      action: "Review this month's plan",
      fact: `Safe-to-spend today: ${formatMoney(0, currencyCode)}`,
      assumption: 'Unrecorded income is not included.',
    });
  }

  // 5. Default healthy recommendation
  if (list.length === 0 || health.overall >= 75) {
    list.push({
      severity: 'HEALTHY',
      title: 'Monthly plan is on track',
      message: 'Your recorded cash flow can protect current priorities and a safety buffer.',
      action: 'Keep plan',
      fact: `Health score: ${health.overall} / 100`,
      assumption: 'Assumes recorded income and due dates remain stable.',
    });
  }

  return list;
}

// 8. MASTER FINORA BRAIN ANALYZE
export function analyzeFinoraBrain(
  accounts: Account[],
  incomeSources: IncomeSource[],
  transactions: TransactionRecord[],
  debts: Debt[],
  goals: Goal[],
  bills: Bill[],
  budgets: Budget[],
  investmentsList: Investment[],
  currencyCode = 'INR'
): BrainState {
  const snapshot = createFinancialSnapshot(
    accounts,
    incomeSources,
    transactions,
    debts,
    goals,
    bills,
    budgets,
    investmentsList
  );
  const safeToSpend = calculateSafeToSpend(snapshot);
  const monthlyPlan = createMonthlyPlan(snapshot);
  const health = calculateFinancialHealth(snapshot);
  const recommendations = generateRecommendations(snapshot, safeToSpend, health, currencyCode);
  const forecast = calculateForecast(snapshot, 30);

  return {
    snapshot,
    safeToSpend,
    monthlyPlan,
    health,
    recommendations,
    forecast,
  };
}

// 9. BRAIN ASK / NATURAL LANGUAGE QUERY HANDLER
export function askFinoraBrain(question: string, state: BrainState, currencyCode = 'INR'): BrainResponse {
  if (!question || !question.trim()) {
    return {
      intent: 'UNKNOWN',
      headline: "I don't have enough information to calculate that.",
      summary: 'Ask a specific question about your financial records.',
      calculations: [],
      recommendations: ['Add or update the relevant financial record, then ask again.'],
      assumptions: ['FINORA never invents missing financial values.'],
      severity: 'ATTENTION',
    };
  }

  const q = question.toLowerCase();
  const s = state.snapshot;
  const safe = state.safeToSpend;

  // Check for amount in question
  const amountMatch = question.match(/(?:₹|\$|€|£|rs\.?\s*)?([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i);
  const extractedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  // Safe to spend
  if (q.includes('safe') || q.includes('how much can i spend') || q.includes('spend today')) {
    return {
      intent: 'SAFE_TO_SPEND',
      headline: `${formatMoney(safe.today, currencyCode)} today`,
      summary: 'This is a conservative daily allowance for the rest of the current month.',
      calculations: [
        `Planned monthly income: ${formatMoney(s.monthlyIncome, currencyCode)}`,
        `Received this month: ${formatMoney(s.recordedIncome, currencyCode)}`,
        `Recorded outflow: ${formatMoney(s.monthlyOutflow, currencyCode)}`,
        `Upcoming bills: ${formatMoney(s.upcomingBills, currencyCode)}`,
        `Debt commitments: ${formatMoney(s.upcomingDebtCommitments, currencyCode)}`,
        `Protected reserve: ${formatMoney(safe.protectedReserve, currencyCode)}`,
        `Flexible remainder: ${formatMoney(safe.flexibleRemaining, currencyCode)}`,
      ],
      recommendations: ['Recalculate after adding a transaction or changing an obligation.'],
      assumptions: [
        'Active recurring income schedules, bills and due dates are assumed to remain configured.',
        'This is an educational planning limit, not a guarantee that spending is risk-free.',
      ],
      severity: safe.today > 0 ? 'HEALTHY' : 'WARNING',
    };
  }

  // Affordability
  if (q.includes('afford') || q.includes('buy') || q.includes('purchase')) {
    if (!extractedAmount) {
      return {
        intent: 'AFFORDABILITY',
        headline: 'Purchase amount required',
        summary: 'Please include the purchase amount so I can test affordability against your flexible capacity and cash.',
        calculations: [
          `Available operating cash: ${formatMoney(s.cash, currencyCode)}`,
          `Flexible remainder: ${formatMoney(safe.flexibleRemaining, currencyCode)}`,
        ],
        recommendations: ['Example: "Can I afford ₹15,000 for a laptop?"'],
        assumptions: ['No financing or unrecorded credit is assumed.'],
        severity: 'ATTENTION',
      };
    }

    const withinFlexible = extractedAmount <= safe.flexibleRemaining;
    const withinCash = extractedAmount <= s.cash;
    const headline = withinFlexible
      ? "Comfortable within this month's flexible capacity"
      : withinCash
      ? 'Proceed carefully — uses operating cash beyond flexible capacity'
      : 'Not currently supported by recorded cash';

    const severity: Severity = withinFlexible ? 'HEALTHY' : withinCash ? 'WARNING' : 'CRITICAL';

    return {
      intent: 'AFFORDABILITY',
      headline,
      summary: `Purchase tested: ${formatMoney(extractedAmount, currencyCode)}`,
      calculations: [
        `Available operating cash: ${formatMoney(s.cash, currencyCode)}`,
        `Flexible remainder: ${formatMoney(safe.flexibleRemaining, currencyCode)}`,
        `Emergency reserve: ${formatMoney(s.emergencyFund, currencyCode)}`,
        `Upcoming obligations: ${formatMoney(s.upcomingBills + s.upcomingDebtCommitments, currencyCode)}`,
      ],
      recommendations: withinFlexible
        ? ['If the purchase is necessary, it fits the current flexible envelope.']
        : withinCash
        ? [
            `Consider saving ${formatMoney(Math.ceil(extractedAmount / 5), currencyCode)}/mo for 5 months.`,
            'Or reassess after the next recorded income cycle.',
          ]
        : ['Build a dedicated savings goal instead of depleting emergency funds.'],
      assumptions: [
        'No unrecorded income, financing cost or resale value is assumed.',
        'FINORA explains trade-offs; the decision remains yours.',
      ],
      severity,
    };
  }

  // Debt priority
  if (
    (q.includes('who') && q.includes('pay')) ||
    q.includes('pay first') ||
    q.includes('priority debt') ||
    q.includes('avalanche') ||
    q.includes('snowball')
  ) {
    if (s.debts.length === 0) {
      return {
        intent: 'DEBT_PRIORITY',
        headline: 'No active debts recorded',
        summary: 'Add liabilities in the Debt Center to view priority rankings.',
        calculations: [],
        recommendations: ['Keep building savings and goals.'],
        assumptions: ['No unrecorded loans exist.'],
        severity: 'HEALTHY',
      };
    }

    const ranked = prioritizeDebts(s.debts, 'HYBRID', s.asOf);
    const first = ranked[0].debt;

    return {
      intent: 'DEBT_PRIORITY',
      headline: `Pay ${first.name} first`,
      summary: 'A hybrid order balances due dates, interest cost, penalties, and relationship importance.',
      calculations: ranked.slice(0, 4).map((p, idx) => `#${idx + 1}  ${p.debt.name} · ${formatMoney(p.debt.remainingAmount, currencyCode)} — ${p.reason}`),
      recommendations: ['Protect minimum payments on every obligation before sending extra money to the first-ranked debt.'],
      assumptions: [
        'Ranking uses the stored due dates, rates, penalty risk, relationship importance and manual priority.',
        'You can override this order in Debt Center.',
      ],
      severity: 'WARNING',
    };
  }

  // Debt Free Timing
  if (q.includes('debt free') || q.includes('debt-free')) {
    const payment = state.monthlyPlan.debtAndEmi || s.debts.reduce((acc, d) => acc + d.minimumPayment, 0);
    const forecast = forecastDebtPayoff(s.debts, payment);
    if (forecast.months <= 0 || !forecast.debtFreeMonth) {
      return {
        intent: 'DEBT_FREE_FORECAST',
        headline: 'Debt-free now',
        summary: 'You have no recorded active liabilities.',
        calculations: [],
        recommendations: ['Focus on emergency reserves and investments.'],
        assumptions: [],
        severity: 'HEALTHY',
      };
    }

    return {
      intent: 'DEBT_FREE_FORECAST',
      headline: `Estimated ${forecast.debtFreeMonth}`,
      summary: "Estimated from the plan's monthly debt allocation.",
      calculations: [
        `Current total debt: ${formatMoney(s.liabilities, currencyCode)}`,
        `Monthly payment assumption: ${formatMoney(payment, currencyCode)}`,
        `Estimated interest: ${formatMoney(forecast.estimatedInterest, currencyCode)}`,
        `Estimated duration: ${forecast.months} months`,
      ],
      recommendations: ['Paying extra can shorten the estimate; use the Debt Center simulator to compare.'],
      assumptions: [
        'Rates and monthly payment are assumed constant.',
        'Fees, late penalties and rate changes are excluded unless recorded.',
      ],
      severity: 'ATTENTION',
    };
  }

  // Financial Health
  if (q.includes('health') || q.includes('score')) {
    const h = state.health;
    const weakest = Object.entries(h.factors).sort((a, b) => a[1] - b[1])[0];
    return {
      intent: 'FINANCIAL_HEALTH',
      headline: `${h.overall} / 100 · ${h.label}`,
      summary: `The lowest contributing area is ${weakest ? weakest[0] : 'records'} (${weakest ? weakest[1] : 0}/100).`,
      calculations: Object.entries(h.factors).map(([k, v]) => `${k}: ${v}/100`),
      recommendations: ['Improve the lowest factor first; it has the clearest effect on the internal score.'],
      assumptions: ['This is an educational FINORA score, not a credit score or professional financial rating.'],
      severity: h.overall >= 70 ? 'HEALTHY' : 'WARNING',
    };
  }

  // Biggest expenses
  if (q.includes('biggest expense') || q.includes('top expense') || q.includes('spending')) {
    const entries = Object.entries(s.expenseByCategory).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      return {
        intent: 'SPENDING_ANALYSIS',
        headline: 'No expenses recorded this month',
        summary: 'Record outflow transactions to see category breakdowns.',
        calculations: [],
        recommendations: ['Add transactions in Money Movement.'],
        assumptions: ['Only transactions recorded in the current calendar month are included.'],
        severity: 'ATTENTION',
      };
    }

    return {
      intent: 'SPENDING_ANALYSIS',
      headline: `${entries[0][0]} is the largest category`,
      summary: `Recorded category total: ${formatMoney(entries[0][1], currencyCode)}`,
      calculations: entries.slice(0, 5).map(([cat, amt]) => `${cat}: ${formatMoney(amt, currencyCode)}`),
      recommendations: ['Review the category detail before changing its budget.'],
      assumptions: ['Only transactions recorded in the current calendar month are included.'],
      severity: 'ATTENTION',
    };
  }

  // Savings capacity
  if (q.includes('how much should i save') || q.includes('save this month') || q.includes('savings')) {
    const p = state.monthlyPlan;
    const total = p.emergencySavings + p.goals + p.investments + p.reserve;
    return {
      intent: 'SAVINGS_CAPACITY',
      headline: `${formatMoney(total, currencyCode)} planned this month`,
      summary: 'The amount is allocated only after essentials and debt/EMI commitments.',
      calculations: [
        `Emergency savings: ${formatMoney(p.emergencySavings, currencyCode)}`,
        `Goals: ${formatMoney(p.goals, currencyCode)}`,
        `Long-term allocation: ${formatMoney(p.investments, currencyCode)}`,
        `Cash reserve: ${formatMoney(p.reserve, currencyCode)}`,
      ],
      recommendations: ['Edit the monthly plan if your income is variable or an obligation is missing.'],
      assumptions: [
        `Assumes monthly income remains ${formatMoney(p.income, currencyCode)}.`,
        'Investment allocation is educational and has no guaranteed return.',
      ],
      severity: 'HEALTHY',
    };
  }

  // Income Shock
  if (q.includes('income') && (q.includes('drop') || q.includes('decrease') || q.includes('lose') || q.includes('shock'))) {
    const shockAmt = extractedAmount || s.monthlyIncome * 0.2;
    const revisedIncome = Math.max(0, s.monthlyIncome - shockAmt);
    const presentFlexible = state.monthlyPlan.flexible + state.monthlyPlan.reserve;
    const impact = Math.min(shockAmt, presentFlexible);
    const exceeds = shockAmt > presentFlexible;

    return {
      intent: 'INCOME_SHOCK',
      headline: `${formatMoney(revisedIncome, currencyCode)} revised monthly income`,
      summary: `A reduction of ${formatMoney(shockAmt, currencyCode)} would first absorb flexible capacity and reserve.`,
      calculations: [
        `Current income: ${formatMoney(s.monthlyIncome, currencyCode)}`,
        `Revised income: ${formatMoney(revisedIncome, currencyCode)}`,
        `Flexible capacity affected: ${formatMoney(impact, currencyCode)}`,
        `Recorded obligations: ${formatMoney(s.upcomingBills + s.upcomingDebtCommitments, currencyCode)}`,
      ],
      recommendations: [
        exceeds
          ? 'The shock exceeds flexible capacity. Review goals and creditor timing before it occurs.'
          : 'The current plan can absorb this shock without changing recorded essential costs.',
      ],
      assumptions: ['The scenario does not modify real data.', 'Expenses and obligations are held constant.'],
      severity: exceeds ? 'CRITICAL' : 'WARNING',
    };
  }

  // EMI Capacity
  if (q.includes('emi')) {
    const room = Math.max(0, state.monthlyPlan.flexible - state.monthlyPlan.reserve);
    return {
      intent: 'EMI_CAPACITY',
      headline: room > 0 ? `Up to ${formatMoney(room, currencyCode)} / mo visible in plan` : 'No additional EMI capacity visible',
      summary: 'FINORA does not recommend using the entire amount; a new EMI would reduce flexibility every month.',
      calculations: [
        `Plan flexible amount: ${formatMoney(state.monthlyPlan.flexible, currencyCode)}`,
        `Protected cash reserve: ${formatMoney(state.monthlyPlan.reserve, currencyCode)}`,
        `Existing debt allocation: ${formatMoney(state.monthlyPlan.debtAndEmi, currencyCode)}`,
      ],
      recommendations: ['Test the exact EMI in Scenario Planner before committing.'],
      assumptions: [
        'Income and essential costs are assumed stable.',
        'Lender eligibility, fees and credit decisions are not assessed.',
      ],
      severity: room > 0 ? 'ATTENTION' : 'WARNING',
    };
  }

  // Upcoming bills
  if (q.includes('bill') || q.includes('due this week') || q.includes('obligations')) {
    const unpaid = s.bills.filter((b) => !b.paid).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (unpaid.length === 0) {
      return {
        intent: 'UPCOMING_OBLIGATIONS',
        headline: 'No unpaid bills recorded',
        summary: 'You have no pending bills before the end of this month.',
        calculations: [],
        recommendations: ['Keep recurring bills updated.'],
        assumptions: [],
        severity: 'HEALTHY',
      };
    }

    return {
      intent: 'UPCOMING_OBLIGATIONS',
      headline: `${formatMoney(s.upcomingBills, currencyCode)} in recorded bills`,
      summary: `There are ${unpaid.length} unpaid bill${unpaid.length === 1 ? '' : 's'} before month end.`,
      calculations: unpaid.map((b) => `${b.dueDate} · ${b.name}: ${formatMoney(b.amount, currencyCode)}`),
      recommendations: ['Keep these amounts protected in your operating account.'],
      assumptions: ['Recurring bills beyond their currently stored due date are not included here.'],
      severity: 'ATTENTION',
    };
  }

  // 30-Day Forecast
  if (q.includes('forecast') || q.includes('projection') || q.includes('balance in')) {
    const f = state.forecast;
    return {
      intent: '30_DAY_FORECAST',
      headline: `${formatMoney(f.projectedEndingBalance, currencyCode)} projected operating balance`,
      summary: f.firstPressureDate
        ? `Reserve pressure may begin around ${f.firstPressureDate}.`
        : 'No reserve pressure is detected from configured events.',
      calculations: [
        `Starting cash: ${formatMoney(s.cash, currencyCode)}`,
        `Projected ending cash: ${formatMoney(f.projectedEndingBalance, currencyCode)}`,
        `Upcoming bills: ${formatMoney(s.upcomingBills, currencyCode)}`,
        `Upcoming debt commitments: ${formatMoney(s.upcomingDebtCommitments, currencyCode)}`,
      ],
      recommendations: ['Add missing recurring events to improve the forecast.'],
      assumptions: [f.assumption],
      severity: f.firstPressureDate ? 'WARNING' : 'HEALTHY',
    };
  }

  // Default fallback
  return {
    intent: 'GENERAL_INQUIRY',
    headline: 'FINORA Brain Intelligence Ready',
    summary: 'I calculate safe spending, affordability, debt priority, debt-free timing, savings, bills, forecasts, health, income shocks and EMI capacity from your records.',
    calculations: [
      `Net worth: ${formatMoney(s.netWorth, currencyCode)}`,
      `Safe to spend today: ${formatMoney(safe.today, currencyCode)}`,
      `Financial health: ${state.health.overall} / 100`,
    ],
    recommendations: [
      'Try asking: "What is safe to spend today?"',
      'Try asking: "Can I afford ₹10,000?"',
      'Try asking: "Who should I pay first?"',
      'Try asking: "What if my income drops 20%?"',
    ],
    assumptions: ['All calculations are directly derived from stored local records.'],
    severity: 'HEALTHY',
  };
}
