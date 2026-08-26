import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  AccountType,
  AIConversation,
  AIMemoryItem,
  AIMessage,
  AISettings,
  Bill,
  BrainState,
  Budget,
  Debt,
  Goal,
  IncomeSource,
  Investment,
  SupabaseConfig,
  TransactionRecord,
  UserProfile,
} from '../types';
import { analyzeFinoraBrain, createFinancialSnapshot, calculateSafeToSpend, createMonthlyPlan, calculateHealthScore, forecastCashFlow } from '../services/brain';
import { StorageData, StorageService } from '../services/storage';
import { pushDataToSupabase, pullDataFromSupabase, testSupabaseConnection } from '../services/supabase';

export type AppPage =
  | 'overview'
  | 'income'
  | 'transactions'
  | 'plan'
  | 'debt'
  | 'goals'
  | 'calendar'
  | 'reports'
  | 'brain'
  | 'settings';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING' | 'success' | 'error' | 'info' | 'warning';
}

export interface CashFlowMetrics {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

export interface HealthScoreMetrics {
  score: number;
  grade: string;
  status: string;
  factors: Record<string, number>;
}

export interface EmergencyFundMetrics {
  monthsOfRunway: number;
  targetFundAmount: number;
  currentEmergencyFund: number;
  monthlyExpenses: number;
  gapAmount: number;
  status: string;
}

export interface BudgetAnalysisMetrics {
  needsActual: number;
  needsTarget: number;
  needsActualPercent: number;
  needsStatus: 'ON_TRACK' | 'OVER_BUDGET';
  wantsActual: number;
  wantsTarget: number;
  wantsActualPercent: number;
  wantsStatus: 'ON_TRACK' | 'OVER_BUDGET';
  savingsActual: number;
  savingsTarget: number;
  savingsActualPercent: number;
  savingsStatus: 'ON_TRACK' | 'UNDER_TARGET';
}

export interface DebtPayoffPlanMetrics {
  debtFreeDate: string;
  totalInterestPaid: number;
  monthsToPayoff: number;
}

export type DebtStrategy = 'AVALANCHE' | 'SNOWBALL' | 'URGENCY' | 'HYBRID';

export interface AppContextType {
  // Navigation & UI
  page: AppPage;
  setPage: (page: AppPage) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddType?: string;
  openQuickAdd: (type?: string) => void;
  closeQuickAdd: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'> | string) => void;
  showToast: (message: string, type?: ToastItem['type']) => void;

  // Profile & Auth
  profiles: UserProfile[];
  currentProfile: UserProfile | null;
  switchProfile: (profileId: string) => void;
  createProfile: (displayName: string, username: string) => UserProfile;
  logout: () => void;
  loadDemoData: () => void;
  resetToEmptyWorkspace: () => void;

  // Financial Collections
  accounts: Account[];
  incomeSources: any[];
  transactions: any[];
  debts: any[];
  goals: any[];
  bills: Bill[];
  budgets: Budget[];
  investments: Investment[];

  // Calculation Engines & Telemetry
  cashFlow: CashFlowMetrics;
  healthScore: HealthScoreMetrics;
  emergencyFund: EmergencyFundMetrics;
  budgetAnalysis: BudgetAnalysisMetrics;
  debtPayoffPlan: DebtPayoffPlanMetrics;
  debtStrategy: DebtStrategy;
  setDebtStrategy: (strat: DebtStrategy) => void;
  debtMonthlyBudget: number;
  setDebtMonthlyBudget: (amt: number) => void;
  emergencyFundMonths: number;
  setEmergencyFundMonths: (months: number) => void;
  forecast: any;
  brainState: BrainState;

  // Data Actions
  addAccount: (name: string, type: AccountType, openingBalance: number, emergencyFund: boolean) => Account;
  updateAccount: (id: string, name: string, type: AccountType, emergencyFund: boolean) => void;
  deleteAccount: (id: string) => void;

  addIncomeSource: (dataOrName: any, ...rest: any[]) => void;
  updateIncomeSource: (id: string, updates: any) => void;
  deleteIncomeSource: (id: string) => void;

  addTransaction: (dataOrAmount: any, ...rest: any[]) => void;
  deleteTransaction: (id: string) => void;

  addDebt: (dataOrDebt: any) => void;
  updateDebt: (id: string, updates: any) => void;
  deleteDebt: (id: string) => void;

  addGoal: (dataOrGoal: any) => void;
  updateGoal: (id: string, updates: any) => void;
  deleteGoal: (id: string) => void;

  addBill: (bill: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  toggleBillPaid: (id: string) => void;
  deleteBill: (id: string) => void;

  addOrUpdateBudget: (category: string, limitAmount: number, monthKey?: string) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;

  // AI State
  conversations: AIConversation[];
  messages: AIMessage[];
  aiMemory: AIMemoryItem[];
  aiSettings: AISettings;
  addAIMessage: (conversationId: string, role: AIMessage['role'], content: string, intent?: string, tools?: string[]) => void;
  createAIConversation: (title: string) => AIConversation;
  deleteAIConversation: (id: string) => void;
  updateAIMemory: (id: string, value: string) => void;
  deleteAIMemory: (id: string) => void;
  clearAIMemory: () => void;
  updateAISettings: (settings: Partial<AISettings>) => void;

  // Supabase Sync
  supabaseConfig: SupabaseConfig;
  setSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncToSupabase: () => Promise<boolean>;
  loadFromSupabase: () => Promise<boolean>;

  // Backup
  exportBackup: () => string;
  importBackup: (json: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storage = StorageService.getInstance();
  const [data, setData] = useState<StorageData>(() => storage.getData());

  // UI state
  const [page, setPage] = useState<AppPage>('overview');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<string>('EXPENSE');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Simulation controls
  const [debtStrategy, setDebtStrategy] = useState<DebtStrategy>('AVALANCHE');
  const [debtMonthlyBudget, setDebtMonthlyBudget] = useState<number>(0);
  const [emergencyFundMonths, setEmergencyFundMonths] = useState<number>(6);

  const currentProfile = useMemo(() => {
    if (!data.currentProfileId) return null;
    return data.profiles.find((p) => p.id === data.currentProfileId) || null;
  }, [data.profiles, data.currentProfileId]);

  const currency = currentProfile?.currency || 'USD';

  const showToast = (message: string, type: ToastItem['type'] = 'SUCCESS') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const normalizedType = String(type).toUpperCase() as ToastItem['type'];
    setToasts((prev) => [...prev, { id, message, type: normalizedType }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const addToast = (toast: Omit<ToastItem, 'id'> | string) => {
    if (typeof toast === 'string') {
      showToast(toast);
    } else {
      showToast(toast.message, toast.type);
    }
  };

  const openQuickAdd = (type = 'EXPENSE') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
  };

  const setCurrency = (newCurrency: string) => {
    if (!currentProfile) return;
    const updated = storage.updateData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === currentProfile.id ? { ...p, currency: newCurrency } : p)),
    }));
    setData(updated);
    showToast(`Currency changed to ${newCurrency}`);
  };

  const switchProfile = (profileId: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      currentProfileId: profileId,
    }));
    setData(updated);
    const p = updated.profiles.find((pr) => pr.id === profileId);
    showToast(`Signed in as ${p?.displayName || 'User'}`);
  };

  const createProfile = (displayName: string, username: string): UserProfile => {
    const newProfile: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      currency: 'USD',
      theme: 'light',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      currentProfileId: newProfile.id,
    }));
    setData(updated);
    showToast(`Welcome, ${displayName}!`);
    return newProfile;
  };

  const logout = () => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      currentProfileId: null,
    }));
    setData(updated);
    showToast('Signed out of profile', 'INFO');
  };

  const loadDemoData = () => {
    const demo = storage.loadDemoWorkspace();
    setData(demo);
    showToast('Demo workspace loaded!');
  };

  const resetToEmptyWorkspace = () => {
    if (!currentProfile) return;
    const fresh = storage.resetToEmptyWorkspace(currentProfile);
    setData(fresh);
    showToast('Workspace reset to empty', 'INFO');
  };

  // Filter scoped data for current active user
  const userId = currentProfile?.id || '';
  const accounts = useMemo(() => data.accounts.filter((a) => a.userId === userId), [data.accounts, userId]);
  
  // Format income sources consistently
  const rawIncomeSources = useMemo(() => data.incomeSources.filter((i) => i.userId === userId), [data.incomeSources, userId]);
  const incomeSources = useMemo(() => {
    return rawIncomeSources.map((s: any) => ({
      id: s.id,
      name: s.name,
      amount: Number(s.amount) || 0,
      type: s.type || 'PRIMARY',
      frequency: s.frequency || 'MONTHLY',
      isGuaranteed: s.isGuaranteed ?? true,
      notes: s.notes || '',
      nextIncomeDate: s.nextIncomeDate || new Date().toISOString().slice(0, 10),
    }));
  }, [rawIncomeSources]);

  // Format transactions consistently
  const rawTransactions = useMemo(() => data.transactions.filter((t) => t.userId === userId), [data.transactions, userId]);
  const transactions = useMemo(() => {
    return rawTransactions.map((t: any) => ({
      id: t.id,
      amount: Number(t.amount) || 0,
      type: t.type || 'EXPENSE',
      category: t.category || 'General',
      budgetCategory: t.budgetCategory || (t.type === 'INCOME' ? 'SAVINGS' : 'NEEDS'),
      description: t.description || t.category || '',
      date: t.date || new Date().toISOString().slice(0, 10),
    }));
  }, [rawTransactions]);

  // Format debts consistently
  const rawDebts = useMemo(() => data.debts.filter((d) => d.userId === userId), [data.debts, userId]);
  const debts = useMemo(() => {
    return rawDebts.map((d: any) => ({
      id: d.id,
      name: d.name,
      currentBalance: Number(d.currentBalance ?? d.remainingAmount) || 0,
      remainingAmount: Number(d.remainingAmount ?? d.currentBalance) || 0,
      interestRate: Number(d.interestRate) || 0,
      minimumPayment: Number(d.minimumPayment) || 0,
      category: d.category || d.type || 'CREDIT_CARD',
      dueDateDay: Number(d.dueDateDay) || 15,
      dueDate: d.dueDate || '',
    }));
  }, [rawDebts]);

  // Format goals consistently
  const rawGoals = useMemo(() => data.goals.filter((g) => g.userId === userId), [data.goals, userId]);
  const goals = useMemo(() => {
    return rawGoals.map((g: any) => ({
      id: g.id,
      name: g.name,
      targetAmount: Number(g.targetAmount) || 0,
      currentAmount: Number(g.currentAmount) || 0,
      targetDate: g.targetDate || g.deadline || new Date().toISOString().slice(0, 10),
      category: g.category || 'SAVINGS',
      priority: g.priority || 'MEDIUM',
    }));
  }, [rawGoals]);

  const bills = useMemo(() => data.bills.filter((b) => b.userId === userId), [data.bills, userId]);
  const budgets = useMemo(() => data.budgets.filter((b) => b.userId === userId), [data.budgets, userId]);
  const investments = useMemo(() => data.investments.filter((i) => i.userId === userId), [data.investments, userId]);

  // CALCULATION ENGINES
  // 1. Cash Flow
  const cashFlow: CashFlowMetrics = useMemo(() => {
    // Total income from recurring income sources (monthly equivalent)
    const incomeSourceTotal = incomeSources.reduce((sum, s) => {
      let monthly = s.amount;
      if (s.frequency === 'WEEKLY') monthly = (s.amount * 52) / 12;
      if (s.frequency === 'BI_WEEKLY' || s.frequency === 'BIWEEKLY') monthly = (s.amount * 26) / 12;
      if (s.frequency === 'ANNUALLY' || s.frequency === 'ANNUAL') monthly = s.amount / 12;
      if (s.frequency === 'ONE_TIME') monthly = 0;
      return sum + monthly;
    }, 0);

    // If no recurring sources, check transactions marked as income
    const txIncomeTotal = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = incomeSourceTotal > 0 ? incomeSourceTotal : txIncomeTotal;

    // Total expenses from transactions
    const totalExpenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
    };
  }, [incomeSources, transactions]);

  // 2. 50/30/20 Budget Analysis
  const budgetAnalysis: BudgetAnalysisMetrics = useMemo(() => {
    const inc = cashFlow.totalIncome;
    const needsTarget = inc * 0.5;
    const wantsTarget = inc * 0.3;
    const savingsTarget = inc * 0.2;

    const needsActual = transactions
      .filter((t) => t.type === 'EXPENSE' && (t.budgetCategory === 'NEEDS' || !t.budgetCategory))
      .reduce((sum, t) => sum + t.amount, 0);

    const wantsActual = transactions
      .filter((t) => t.type === 'EXPENSE' && t.budgetCategory === 'WANTS')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsActual = Math.max(0, inc - (needsActual + wantsActual));

    const needsActualPercent = inc > 0 ? (needsActual / inc) * 100 : 0;
    const wantsActualPercent = inc > 0 ? (wantsActual / inc) * 100 : 0;
    const savingsActualPercent = inc > 0 ? (savingsActual / inc) * 100 : 0;

    return {
      needsActual: Math.round(needsActual * 100) / 100,
      needsTarget: Math.round(needsTarget * 100) / 100,
      needsActualPercent: Math.round(needsActualPercent * 10) / 10,
      needsStatus: needsActualPercent > 50 ? 'OVER_BUDGET' : 'ON_TRACK',

      wantsActual: Math.round(wantsActual * 100) / 100,
      wantsTarget: Math.round(wantsTarget * 100) / 100,
      wantsActualPercent: Math.round(wantsActualPercent * 10) / 10,
      wantsStatus: wantsActualPercent > 30 ? 'OVER_BUDGET' : 'ON_TRACK',

      savingsActual: Math.round(savingsActual * 100) / 100,
      savingsTarget: Math.round(savingsTarget * 100) / 100,
      savingsActualPercent: Math.round(savingsActualPercent * 10) / 10,
      savingsStatus: savingsActualPercent < 20 ? 'UNDER_TARGET' : 'ON_TRACK',
    };
  }, [cashFlow, transactions]);

  // 3. Emergency Fund
  const emergencyFund: EmergencyFundMetrics = useMemo(() => {
    const monthlyExpenses = cashFlow.totalExpenses > 0 ? cashFlow.totalExpenses : (cashFlow.totalIncome * 0.5) || 1000;
    const targetFundAmount = monthlyExpenses * emergencyFundMonths;

    // Check goals or accounts earmarked for emergency
    const goalFund = goals
      .filter((g) => g.category === 'EMERGENCY_FUND' || g.name.toLowerCase().includes('emergency'))
      .reduce((sum, g) => sum + g.currentAmount, 0);

    const accountFund = accounts
      .filter((a) => a.emergencyFund)
      .reduce((sum, a) => sum + a.balance, 0);

    const currentEmergencyFund = goalFund + accountFund;
    const monthsOfRunway = monthlyExpenses > 0 ? currentEmergencyFund / monthlyExpenses : 0;
    const gapAmount = Math.max(0, targetFundAmount - currentEmergencyFund);

    let status = 'Sufficient';
    if (monthsOfRunway < 1) status = 'Critically Low';
    else if (monthsOfRunway < 3) status = 'Needs Building';
    else if (monthsOfRunway < 6) status = 'Adequate';
    else status = 'Excellent Fortress';

    return {
      monthsOfRunway: Math.round(monthsOfRunway * 10) / 10,
      targetFundAmount: Math.round(targetFundAmount * 100) / 100,
      currentEmergencyFund: Math.round(currentEmergencyFund * 100) / 100,
      monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
      gapAmount: Math.round(gapAmount * 100) / 100,
      status,
    };
  }, [cashFlow, goals, accounts, emergencyFundMonths]);

  // 4. Financial Health Score
  const healthScore: HealthScoreMetrics = useMemo(() => {
    let score = 50;

    // Positive cash flow
    if (cashFlow.netSavings > 0) score += 15;
    else if (cashFlow.netSavings < 0) score -= 15;

    // Savings rate
    if (cashFlow.savingsRate >= 20) score += 15;
    else if (cashFlow.savingsRate >= 10) score += 8;

    // Emergency fund
    if (emergencyFund.monthsOfRunway >= 6) score += 15;
    else if (emergencyFund.monthsOfRunway >= 3) score += 10;
    else if (emergencyFund.monthsOfRunway >= 1) score += 5;

    // Debt burden
    const totalDebt = debts.reduce((s, d) => s + d.currentBalance, 0);
    if (totalDebt === 0) score += 10;
    else if (totalDebt < cashFlow.totalIncome * 2) score += 5;
    else score -= 10;

    // Cap between 0 and 100
    score = Math.max(10, Math.min(100, score));

    let grade = 'A';
    let status = 'Excellent Financial Standing';

    if (score >= 85) {
      grade = 'A+';
      status = 'Optimal Financial Health';
    } else if (score >= 75) {
      grade = 'A';
      status = 'Healthy & Balanced';
    } else if (score >= 60) {
      grade = 'B';
      status = 'Stable, Room to Optimize';
    } else if (score >= 45) {
      grade = 'C';
      status = 'Needs Attention & Action';
    } else {
      grade = 'D';
      status = 'High Financial Vulnerability';
    }

    return {
      score,
      grade,
      status,
      factors: {
        'Cash Flow': cashFlow.netSavings > 0 ? 85 : 40,
        'Savings Rate': Math.min(100, cashFlow.savingsRate * 4),
        'Emergency Reserve': Math.min(100, emergencyFund.monthsOfRunway * 16.6),
        'Debt Exposure': totalDebt === 0 ? 100 : Math.max(20, 100 - (totalDebt / (cashFlow.totalIncome || 1)) * 20),
      },
    };
  }, [cashFlow, emergencyFund, debts]);

  // 5. Debt Payoff Plan
  const debtPayoffPlan: DebtPayoffPlanMetrics = useMemo(() => {
    const totalBal = debts.reduce((s, d) => s + d.currentBalance, 0);
    const minDue = debts.reduce((s, d) => s + d.minimumPayment, 0);

    if (totalBal <= 0) {
      return {
        debtFreeDate: 'Debt Free Today!',
        totalInterestPaid: 0,
        monthsToPayoff: 0,
      };
    }

    const monthlyPayment = Math.max(minDue, debtMonthlyBudget || minDue || 100);
    const avgRate = debts.length > 0 ? debts.reduce((s, d) => s + d.interestRate, 0) / debts.length / 100 / 12 : 0.015;

    let balance = totalBal;
    let months = 0;
    let totalInterest = 0;

    while (balance > 0 && months < 360) {
      months++;
      const interest = balance * avgRate;
      totalInterest += interest;
      const principal = Math.min(balance, monthlyPayment - interest);
      if (principal <= 0) {
        // Payment doesn't cover interest
        months = 360;
        break;
      }
      balance -= principal;
    }

    const freeDate = new Date();
    freeDate.setMonth(freeDate.getMonth() + months);
    const debtFreeDate = freeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      debtFreeDate: months >= 360 ? '30+ Years' : debtFreeDate,
      totalInterestPaid: Math.round(totalInterest * 100) / 100,
      monthsToPayoff: months,
    };
  }, [debts, debtMonthlyBudget]);

  // 6. Forecast & Brain State
  const brainState: BrainState = useMemo(() => {
    const recommendations: any[] = [];

    // Check emergency fund
    if (emergencyFund.monthsOfRunway < 3) {
      recommendations.push({
        severity: 'CRITICAL',
        category: 'Emergency Liquidity',
        title: 'Emergency Cushion Below 3 Months',
        message: `Your current liquid reserves cover ${emergencyFund.monthsOfRunway} months of expenses. Target at least 3-6 months (${emergencyFund.targetFundAmount}) to insulate against sudden income shocks.`,
        fact: `Monthly burn rate is calculated at ${emergencyFund.monthlyExpenses}.`,
        action: 'Build emergency reserve',
      });
    }

    // Check high APR debt
    const highInterestDebts = debts.filter((d) => d.interestRate >= 15);
    if (highInterestDebts.length > 0) {
      recommendations.push({
        severity: 'WARNING',
        category: 'High-Interest Debt',
        title: `${highInterestDebts.length} High-Interest Liabilities Detected`,
        message: `You have debt accounts carrying APRs above 15.0%. Utilize the Avalanche repayment engine to minimize interest drain.`,
        fact: `Total high-APR balance: ${highInterestDebts.reduce((s, d) => s + d.currentBalance, 0)}.`,
        action: 'Accelerate debt payoff',
      });
    }

    // Check budget wants
    if (budgetAnalysis.wantsActualPercent > 35) {
      recommendations.push({
        severity: 'ATTENTION',
        category: 'Discretionary Outflow',
        title: 'Discretionary Spending Exceeds 35%',
        message: `Wants currently consume ${budgetAnalysis.wantsActualPercent}% of your active income (50/30/20 target is 30%).`,
        fact: `Wants spending: ${budgetAnalysis.wantsActual}.`,
        action: 'Review non-essential subscriptions and dining out',
      });
    }

    // Default positive signal if empty or healthy
    if (recommendations.length === 0) {
      recommendations.push({
        severity: 'HEALTHY',
        category: 'Financial Telemetry',
        title: 'System Operating Within Healthy Parameters',
        message: 'Your cash flow surplus, emergency reserves, and budget ratios are in solid alignment.',
        fact: `Current savings rate is ${cashFlow.savingsRate}%.`,
        action: 'Continue disciplined wealth building',
      });
    }

    const snapshot = createFinancialSnapshot(accounts, incomeSources as any, transactions as any, debts as any, goals as any, bills, budgets, investments);
    const safeToSpend = calculateSafeToSpend(snapshot);
    const monthlyPlan = createMonthlyPlan(snapshot);
    const health = calculateHealthScore(snapshot);
    const forecast = forecastCashFlow(snapshot);

    return {
      snapshot,
      safeToSpend,
      monthlyPlan,
      health,
      recommendations,
      forecast,
    };
  }, [accounts, incomeSources, transactions, debts, goals, bills, budgets, investments, emergencyFund, budgetAnalysis, cashFlow]);

  const forecast = brainState.forecast;

  // CRUD Implementations
  const addAccount = (name: string, type: AccountType, openingBalance: number, emergencyFund: boolean): Account => {
    const nowStr = new Date().toISOString();
    const newAccount: Account = {
      id: 'acc_' + Date.now().toString(36),
      userId,
      name,
      type,
      balance: openingBalance,
      currency,
      emergencyFund,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
    }));
    setData(updated);
    showToast(`Account "${name}" created`);
    return newAccount;
  };

  const updateAccount = (id: string, name: string, type: AccountType, emergencyFund: boolean) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) => (a.id === id ? { ...a, name, type, emergencyFund, updatedAt: new Date().toISOString() } : a)),
    }));
    setData(updated);
    showToast('Account updated');
  };

  const deleteAccount = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== id),
    }));
    setData(updated);
    showToast('Account removed', 'INFO');
  };

  const addIncomeSource = (dataOrName: any, ...rest: any[]) => {
    const nowStr = new Date().toISOString();
    let newSource: any;

    if (typeof dataOrName === 'object' && dataOrName !== null) {
      newSource = {
        id: 'inc_' + Date.now().toString(36),
        userId,
        name: dataOrName.name || 'Income Stream',
        amount: Number(dataOrName.amount) || 0,
        type: dataOrName.type || 'PRIMARY',
        frequency: dataOrName.frequency || 'MONTHLY',
        isGuaranteed: dataOrName.isGuaranteed ?? true,
        notes: dataOrName.notes || '',
        active: true,
        nextIncomeDate: dataOrName.nextIncomeDate || new Date().toISOString().slice(0, 10),
        createdAt: nowStr,
        updatedAt: nowStr,
      };
    } else {
      const name = dataOrName;
      const amount = rest[0];
      const frequency = rest[1] || 'MONTHLY';
      const nextIncomeDate = rest[2] || new Date().toISOString().slice(0, 10);
      const accountId = rest[3] || '';
      const notes = rest[4] || '';

      newSource = {
        id: 'inc_' + Date.now().toString(36),
        userId,
        name,
        amount: Number(amount) || 0,
        type: 'PRIMARY',
        frequency,
        isGuaranteed: true,
        nextIncomeDate,
        accountId,
        active: true,
        notes,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
    }

    const updated = storage.updateData((prev) => ({
      ...prev,
      incomeSources: [...prev.incomeSources, newSource],
    }));
    setData(updated);
    showToast(`Income source "${newSource.name}" added`);
  };

  const updateIncomeSource = (id: string, updates: any) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)),
    }));
    setData(updated);
    showToast('Income source updated');
  };

  const deleteIncomeSource = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.filter((s) => s.id !== id),
    }));
    setData(updated);
    showToast('Income source deleted', 'INFO');
  };

  const addTransaction = (dataOrAmount: any, ...rest: any[]) => {
    const nowStr = new Date().toISOString();
    let newTx: any;

    if (typeof dataOrAmount === 'object' && dataOrAmount !== null) {
      newTx = {
        id: 'tx_' + Date.now().toString(36),
        userId,
        amount: Number(dataOrAmount.amount) || 0,
        type: dataOrAmount.type || 'EXPENSE',
        category: dataOrAmount.category || 'General',
        budgetCategory: dataOrAmount.budgetCategory || 'NEEDS',
        description: dataOrAmount.description || dataOrAmount.category || '',
        date: dataOrAmount.date || new Date().toISOString().slice(0, 10),
        notes: dataOrAmount.notes || '',
        createdAt: nowStr,
        updatedAt: nowStr,
      };
    } else {
      const amount = Number(dataOrAmount) || 0;
      const type = rest[0] || 'EXPENSE';
      const category = rest[1] || 'General';
      const accountId = rest[2] || '';
      const description = rest[3] || '';
      const date = rest[5] || new Date().toISOString().slice(0, 10);

      newTx = {
        id: 'tx_' + Date.now().toString(36),
        userId,
        amount,
        type,
        category,
        accountId,
        budgetCategory: type === 'INCOME' ? 'SAVINGS' : 'NEEDS',
        description: description || category,
        date,
        createdAt: nowStr,
        updatedAt: nowStr,
      };
    }

    const updated = storage.updateData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
    setData(updated);
    showToast(`Transaction recorded: ${newTx.category}`);
  };

  const deleteTransaction = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    setData(updated);
    showToast('Transaction removed', 'INFO');
  };

  const addDebt = (dataOrDebt: any) => {
    const nowStr = new Date().toISOString();
    const newDebt: any = {
      id: 'debt_' + Date.now().toString(36),
      userId,
      name: dataOrDebt.name || 'Liability',
      currentBalance: Number(dataOrDebt.currentBalance ?? dataOrDebt.remainingAmount) || 0,
      remainingAmount: Number(dataOrDebt.remainingAmount ?? dataOrDebt.currentBalance) || 0,
      originalAmount: Number(dataOrDebt.originalAmount ?? dataOrDebt.currentBalance) || 0,
      interestRate: Number(dataOrDebt.interestRate) || 0,
      minimumPayment: Number(dataOrDebt.minimumPayment) || 0,
      category: dataOrDebt.category || dataOrDebt.type || 'CREDIT_CARD',
      type: dataOrDebt.type || 'CREDIT_CARD',
      dueDateDay: Number(dataOrDebt.dueDateDay) || 15,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      debts: [...prev.debts, newDebt],
    }));
    setData(updated);
    showToast(`Debt liability "${newDebt.name}" added`);
  };

  const updateDebt = (id: string, updates: any) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      debts: prev.debts.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d)),
    }));
    setData(updated);
    showToast('Debt liability updated');
  };

  const deleteDebt = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
    setData(updated);
    showToast('Debt liability removed', 'INFO');
  };

  const addGoal = (dataOrGoal: any) => {
    const nowStr = new Date().toISOString();
    const newGoal: any = {
      id: 'goal_' + Date.now().toString(36),
      userId,
      name: dataOrGoal.name || 'Savings Goal',
      targetAmount: Number(dataOrGoal.targetAmount) || 0,
      currentAmount: Number(dataOrGoal.currentAmount) || 0,
      monthlyContribution: Number(dataOrGoal.monthlyContribution) || 0,
      targetDate: dataOrGoal.targetDate || dataOrGoal.deadline || new Date().toISOString().slice(0, 10),
      category: dataOrGoal.category || 'SAVINGS',
      priority: dataOrGoal.priority || 'MEDIUM',
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
    setData(updated);
    showToast(`Goal "${newGoal.name}" created`);
  };

  const updateGoal = (id: string, updates: any) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g)),
    }));
    setData(updated);
    showToast('Goal updated');
  };

  const deleteGoal = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
    setData(updated);
    showToast('Goal removed', 'INFO');
  };

  const addBill = (bill: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const nowStr = new Date().toISOString();
    const newBill: Bill = {
      ...bill,
      id: 'bill_' + Date.now().toString(36),
      userId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      bills: [...prev.bills, newBill],
    }));
    setData(updated);
    showToast(`Added bill "${bill.name}"`);
  };

  const toggleBillPaid = (id: string) => {
    const nowStr = new Date().toISOString();
    let isNowPaid = false;
    const updated = storage.updateData((prev) => ({
      ...prev,
      bills: prev.bills.map((b) => {
        if (b.id === id) {
          isNowPaid = !b.paid;
          return { ...b, paid: isNowPaid, updatedAt: nowStr };
        }
        return b;
      }),
    }));
    setData(updated);
    showToast(isNowPaid ? 'Marked as paid' : 'Marked as unpaid');
  };

  const deleteBill = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      bills: prev.bills.filter((b) => b.id !== id),
    }));
    setData(updated);
    showToast('Bill removed', 'INFO');
  };

  const addOrUpdateBudget = (category: string, limitAmount: number, monthKey?: string) => {
    const mKey = monthKey || new Date().toISOString().substring(0, 7);
    const nowStr = new Date().toISOString();

    const updated = storage.updateData((prev) => {
      const existing = prev.budgets.find(
        (b) => b.userId === userId && b.category === category && b.monthKey === mKey
      );
      if (existing) {
        return {
          ...prev,
          budgets: prev.budgets.map((b) =>
            b.id === existing.id ? { ...b, limitAmount, updatedAt: nowStr } : b
          ),
        };
      } else {
        const newBudget: Budget = {
          id: 'bud_' + Date.now().toString(36),
          userId,
          category,
          limitAmount,
          monthKey: mKey,
          createdAt: nowStr,
          updatedAt: nowStr,
        };
        return { ...prev, budgets: [...prev.budgets, newBudget] };
      }
    });
    setData(updated);
    showToast(`Budget for ${category} set`);
  };

  const addInvestment = (inv: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const nowStr = new Date().toISOString();
    const newInv: Investment = {
      ...inv,
      id: 'inv_' + Date.now().toString(36),
      userId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      investments: [...prev.investments, newInv],
    }));
    setData(updated);
    showToast(`Added investment "${inv.name}"`);
  };

  // AI Actions
  const addAIMessage = (
    conversationId: string,
    role: AIMessage['role'],
    content: string,
    intent?: string,
    tools?: string[]
  ) => {
    const msg: AIMessage = {
      id: 'msg_' + Date.now().toString(36),
      conversationId,
      role,
      content,
      intent,
      toolTrace: tools,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
    setData(updated);
  };

  const createAIConversation = (title: string): AIConversation => {
    const nowStr = new Date().toISOString();
    const conv: AIConversation = {
      id: 'conv_' + Date.now().toString(36),
      userId,
      title,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      conversations: [conv, ...prev.conversations],
    }));
    setData(updated);
    return conv;
  };

  const deleteAIConversation = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      conversations: prev.conversations.filter((c) => c.id !== id),
      messages: prev.messages.filter((m) => m.conversationId !== id),
    }));
    setData(updated);
    showToast('Conversation deleted', 'INFO');
  };

  const updateAIMemory = (id: string, value: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      aiMemory: prev.aiMemory.map((m) =>
        m.id === id ? { ...m, value, lastUsedAt: new Date().toISOString() } : m
      ),
    }));
    setData(updated);
    showToast('Memory updated');
  };

  const deleteAIMemory = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      aiMemory: prev.aiMemory.filter((m) => m.id !== id),
    }));
    setData(updated);
    showToast('Memory forgotten', 'INFO');
  };

  const clearAIMemory = () => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      aiMemory: prev.aiMemory.filter((m) => m.userId !== userId),
    }));
    setData(updated);
    showToast('All AI memories cleared', 'INFO');
  };

  const updateAISettings = (settings: Partial<AISettings>) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      aiSettings: { ...prev.aiSettings, ...settings },
    }));
    setData(updated);
    showToast('AI settings saved');
  };

  // Supabase Actions
  const updateSupabaseConfig = (config: Partial<SupabaseConfig>) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      supabaseConfig: { ...prev.supabaseConfig, ...config },
    }));
    setData(updated);
  };

  const setSupabaseConfig = updateSupabaseConfig;

  const syncToSupabase = async (): Promise<boolean> => {
    const config = data.supabaseConfig;
    if (!config.url || !config.anonKey) {
      showToast('Please configure Supabase URL and Key in Settings', 'WARNING');
      return false;
    }

    const test = await testSupabaseConnection(config.url, config.anonKey);
    if (!test.success) {
      showToast(test.message, 'ERROR');
      return false;
    }

    const res = await pushDataToSupabase(config.url, config.anonKey, data, userId);
    if (res.success) {
      updateSupabaseConfig({ connected: true, lastSyncedAt: new Date().toISOString() });
      showToast('Synced with Supabase Cloud!', 'SUCCESS');
      return true;
    } else {
      showToast(res.message, 'ERROR');
      return false;
    }
  };

  const loadFromSupabase = async (): Promise<boolean> => {
    const config = data.supabaseConfig;
    if (!config.url || !config.anonKey) {
      showToast('Please configure Supabase credentials', 'WARNING');
      return false;
    }

    const res = await pullDataFromSupabase(config.url, config.anonKey, userId);
    if (res.success && res.data) {
      showToast('Data loaded from Supabase!', 'SUCCESS');
      return true;
    } else {
      showToast(res.message || 'Failed to pull data', 'ERROR');
      return false;
    }
  };

  const exportBackup = (): string => {
    return storage.exportBackupJson();
  };

  const importBackup = (json: string): boolean => {
    const ok = storage.importBackupJson(json);
    if (ok) {
      setData(storage.getData());
      showToast('Backup restored successfully!', 'SUCCESS');
    } else {
      showToast('Failed to parse backup file.', 'ERROR');
    }
    return ok;
  };

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        currency,
        setCurrency,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddType,
        openQuickAdd,
        closeQuickAdd,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
        addToast,
        showToast,

        profiles: data.profiles,
        currentProfile,
        switchProfile,
        createProfile,
        logout,
        loadDemoData,
        resetToEmptyWorkspace,

        accounts,
        incomeSources,
        transactions,
        debts,
        goals,
        bills,
        budgets,
        investments,

        cashFlow,
        healthScore,
        emergencyFund,
        budgetAnalysis,
        debtPayoffPlan,
        debtStrategy,
        setDebtStrategy,
        debtMonthlyBudget,
        setDebtMonthlyBudget,
        emergencyFundMonths,
        setEmergencyFundMonths,
        forecast,
        brainState,

        addAccount,
        updateAccount,
        deleteAccount,

        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,

        addTransaction,
        deleteTransaction,

        addDebt,
        updateDebt,
        deleteDebt,

        addGoal,
        updateGoal,
        deleteGoal,

        addBill,
        toggleBillPaid,
        deleteBill,

        addOrUpdateBudget,
        addInvestment,

        conversations: data.conversations.filter((c) => c.userId === userId),
        messages: data.messages,
        aiMemory: data.aiMemory.filter((m) => m.userId === userId),
        aiSettings: data.aiSettings,
        addAIMessage,
        createAIConversation,
        deleteAIConversation,
        updateAIMemory,
        deleteAIMemory,
        clearAIMemory,
        updateAISettings,

        supabaseConfig: data.supabaseConfig,
        setSupabaseConfig,
        updateSupabaseConfig,
        syncToSupabase,
        loadFromSupabase,

        exportBackup,
        importBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
