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
import { analyzeFinoraBrain, getNextDateAfter } from '../services/brain';
import { StorageData, StorageService } from '../services/storage';
import { pushDataToSupabase, testSupabaseConnection } from '../services/supabase';

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

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation & UI
  page: AppPage;
  setPage: (page: AppPage) => void;
  theme: UserProfile['theme'];
  setTheme: (theme: UserProfile['theme']) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddInitialTab: string;
  openQuickAdd: (tab?: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;

  // Profile & Auth
  profiles: UserProfile[];
  currentProfile: UserProfile | null;
  switchProfile: (profileId: string) => void;
  createProfile: (displayName: string, username: string) => UserProfile;
  logout: () => void;
  loadDemoData: () => void;
  resetToEmptyWorkspace: () => void;

  // Financial Data
  accounts: Account[];
  incomeSources: IncomeSource[];
  transactions: TransactionRecord[];
  debts: Debt[];
  goals: Goal[];
  bills: Bill[];
  budgets: Budget[];
  investments: Investment[];

  // FINORA Brain Calculated State
  brainState: BrainState;

  // Data Actions
  addAccount: (name: string, type: AccountType, openingBalance: number, emergencyFund: boolean) => Account;
  updateAccount: (id: string, name: string, type: AccountType, emergencyFund: boolean) => void;
  deleteAccount: (id: string) => void;

  addIncomeSource: (
    name: string,
    amount: number,
    frequency: IncomeSource['frequency'],
    nextIncomeDate: string,
    accountId: string,
    notes?: string,
    recordToday?: boolean
  ) => void;
  recordIncomeReceipt: (sourceId: string, receivedDate?: string) => void;
  deleteIncomeSource: (id: string) => void;

  addTransaction: (
    amount: number,
    type: TransactionRecord['type'],
    category: string,
    accountId: string,
    description: string,
    relatedAccountId?: string,
    date?: string,
    notes?: string
  ) => void;
  deleteTransaction: (id: string) => void;

  addDebt: (debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  recordDebtPayment: (debtId: string, accountId: string, amount: number) => void;
  deleteDebt: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  contributeToGoal: (goalId: string, accountId: string, amount: number) => void;
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
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  syncToSupabase: () => Promise<boolean>;

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
  const [quickAddInitialTab, setQuickAddInitialTab] = useState('transaction');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentProfile = useMemo(() => {
    return data.profiles.find((p) => p.id === data.currentProfileId) || data.profiles[0] || null;
  }, [data.profiles, data.currentProfileId]);

  const currency = currentProfile?.currency || 'INR';
  const theme = currentProfile?.theme || 'dark';

  // Apply dark/light theme to document body
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'midnight', 'cyberpunk');
    if (theme === 'dark' || theme === 'midnight' || theme === 'cyberpunk') {
      root.classList.add('dark');
      if (theme === 'midnight') root.classList.add('midnight');
      if (theme === 'cyberpunk') root.classList.add('cyberpunk');
    } else {
      root.classList.add('light');
    }
  }, [theme]);

  // Global keyboard shortcuts (Cmd+K for search, Escape to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const openQuickAdd = (tab = 'transaction') => {
    setQuickAddInitialTab(tab);
    setIsQuickAddOpen(true);
  };

  const setTheme = (newTheme: UserProfile['theme']) => {
    if (!currentProfile) return;
    const updated = storage.updateData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === currentProfile.id ? { ...p, theme: newTheme } : p)),
    }));
    setData(updated);
    showToast(`Theme switched to ${newTheme}`);
  };

  const setCurrency = (newCurrency: string) => {
    if (!currentProfile) return;
    const updated = storage.updateData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === currentProfile.id ? { ...p, currency: newCurrency } : p)),
    }));
    setData(updated);
    showToast(`Display currency changed to ${newCurrency}`);
  };

  const switchProfile = (profileId: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      currentProfileId: profileId,
    }));
    setData(updated);
    const p = updated.profiles.find((pr) => pr.id === profileId);
    showToast(`Switched profile to ${p?.displayName || 'User'}`);
  };

  const createProfile = (displayName: string, username: string): UserProfile => {
    const newProfile: UserProfile = {
      id: 'usr_' + Date.now().toString(36),
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      currency: 'INR',
      theme: 'dark',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      currentProfileId: newProfile.id,
    }));
    setData(updated);
    showToast(`Created profile for ${displayName}`);
    return newProfile;
  };

  const logout = () => {
    showToast('Signed out of profile', 'info');
  };

  const loadDemoData = () => {
    const demoData = storage.loadDemoWorkspace();
    setData(demoData);
    showToast('Loaded interactive sample workspace!');
  };

  const resetToEmptyWorkspace = () => {
    if (!currentProfile) return;
    const fresh = storage.resetToEmptyWorkspace(currentProfile);
    setData(fresh);
    showToast('Workspace reset to empty state', 'info');
  };

  // Filter scoped data for current active user
  const userId = currentProfile?.id || '';
  const accounts = useMemo(() => data.accounts.filter((a) => a.userId === userId), [data.accounts, userId]);
  const incomeSources = useMemo(() => data.incomeSources.filter((i) => i.userId === userId), [data.incomeSources, userId]);
  const transactions = useMemo(() => data.transactions.filter((t) => t.userId === userId), [data.transactions, userId]);
  const debts = useMemo(() => data.debts.filter((d) => d.userId === userId), [data.debts, userId]);
  const goals = useMemo(() => data.goals.filter((g) => g.userId === userId), [data.goals, userId]);
  const bills = useMemo(() => data.bills.filter((b) => b.userId === userId), [data.bills, userId]);
  const budgets = useMemo(() => data.budgets.filter((b) => b.userId === userId), [data.budgets, userId]);
  const investments = useMemo(() => data.investments.filter((i) => i.userId === userId), [data.investments, userId]);

  // Master Brain State calculated live
  const brainState = useMemo(() => {
    return analyzeFinoraBrain(
      accounts,
      incomeSources,
      transactions,
      debts,
      goals,
      bills,
      budgets,
      investments,
      currency
    );
  }, [accounts, incomeSources, transactions, debts, goals, bills, budgets, investments, currency]);

  // ATOMIC DATA MUTATIONS
  const addAccount = (name: string, type: AccountType, openingBalance: number, emergencyFund: boolean): Account => {
    const newAcc: Account = {
      id: 'acc_' + Date.now().toString(36),
      userId,
      name: name.trim(),
      type,
      balance: openingBalance,
      currency,
      emergencyFund,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAcc],
    }));
    setData(updated);
    showToast(`Account "${name}" added`);
    return newAcc;
  };

  const updateAccount = (id: string, name: string, type: AccountType, emergencyFund: boolean) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === id ? { ...a, name: name.trim(), type, emergencyFund, updatedAt: new Date().toISOString() } : a
      ),
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
    showToast('Account deleted', 'info');
  };

  const addIncomeSource = (
    name: string,
    amount: number,
    frequency: IncomeSource['frequency'],
    nextIncomeDate: string,
    accountId: string,
    notes?: string,
    recordToday?: boolean
  ) => {
    const sourceId = 'inc_' + Date.now().toString(36);
    const nowStr = new Date().toISOString();
    const source: IncomeSource = {
      id: sourceId,
      userId,
      name: name.trim(),
      amount,
      frequency,
      nextIncomeDate,
      accountId,
      active: true,
      notes,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    let nextDate = nextIncomeDate;
    const newTxs: TransactionRecord[] = [];
    let updatedAccounts = [...data.accounts];

    if (recordToday) {
      newTxs.push({
        id: 'tx_' + Date.now().toString(36),
        userId,
        amount,
        type: 'INCOME',
        category: 'Income',
        accountId,
        date: new Date().toISOString().split('T')[0],
        description: name.trim(),
        notes: 'Recorded while creating recurring income',
        referenceId: sourceId,
        createdAt: nowStr,
        updatedAt: nowStr,
      });

      // Update account balance atomically
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance + amount, updatedAt: nowStr } : a
      );

      // Advance next income date
      while (nextDate <= new Date().toISOString().split('T')[0]) {
        nextDate = getNextDateAfter(nextDate, frequency);
      }
      source.nextIncomeDate = nextDate;
    }

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: updatedAccounts,
      incomeSources: [...prev.incomeSources, source],
      transactions: [...prev.transactions, ...newTxs],
    }));
    setData(updated);
    showToast(`Income source "${name}" added`);
  };

  const recordIncomeReceipt = (sourceId: string, receivedDate?: string) => {
    const source = data.incomeSources.find((s) => s.id === sourceId);
    if (!source) return;

    const date = receivedDate || new Date().toISOString().split('T')[0];
    const nowStr = new Date().toISOString();

    const tx: TransactionRecord = {
      id: 'tx_' + Date.now().toString(36),
      userId,
      amount: source.amount,
      type: 'INCOME',
      category: 'Income',
      accountId: source.accountId,
      date,
      description: source.name,
      notes: 'Recorded from recurring income receipt',
      referenceId: source.id,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    let next = source.nextIncomeDate;
    while (next <= date) {
      next = getNextDateAfter(next, source.frequency);
    }

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === source.accountId ? { ...a, balance: a.balance + source.amount, updatedAt: nowStr } : a
      ),
      incomeSources: prev.incomeSources.map((s) =>
        s.id === sourceId ? { ...s, nextIncomeDate: next, updatedAt: nowStr } : s
      ),
      transactions: [...prev.transactions, tx],
    }));
    setData(updated);
    showToast(`Recorded income of ${source.name}`);
  };

  const deleteIncomeSource = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      incomeSources: prev.incomeSources.filter((i) => i.id !== id),
    }));
    setData(updated);
    showToast('Income source deleted', 'info');
  };

  const addTransaction = (
    amount: number,
    type: TransactionRecord['type'],
    category: string,
    accountId: string,
    description: string,
    relatedAccountId?: string,
    date?: string,
    notes?: string
  ) => {
    const nowStr = new Date().toISOString();
    const tx: TransactionRecord = {
      id: 'tx_' + Date.now().toString(36),
      userId,
      amount,
      type,
      category: category || 'General',
      accountId,
      relatedAccountId,
      date: date || new Date().toISOString().split('T')[0],
      description: description.trim(),
      notes,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    // Atomically adjust account balances
    let updatedAccounts = [...data.accounts];
    if (type === 'INCOME') {
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance + amount, updatedAt: nowStr } : a
      );
    } else if (type === 'TRANSFER') {
      if (!relatedAccountId) throw new Error('Destination account required for transfer.');
      updatedAccounts = updatedAccounts.map((a) => {
        if (a.id === accountId) return { ...a, balance: a.balance - amount, updatedAt: nowStr };
        if (a.id === relatedAccountId) return { ...a, balance: a.balance + amount, updatedAt: nowStr };
        return a;
      });
    } else if (type === 'GOAL_CONTRIBUTION') {
      // Goal earmarking does not destroy account asset
    } else {
      // EXPENSE, DEBT_PAYMENT, EMI_PAYMENT, INVESTMENT_CONTRIBUTION
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance - amount, updatedAt: nowStr } : a
      );
    }

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: updatedAccounts,
      transactions: [tx, ...prev.transactions],
    }));
    setData(updated);
    showToast(`Recorded ${description}`);
  };

  const deleteTransaction = (id: string) => {
    const tx = data.transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance effect
    let updatedAccounts = [...data.accounts];
    const nowStr = new Date().toISOString();

    if (tx.type === 'INCOME') {
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount, updatedAt: nowStr } : a
      );
    } else if (tx.type === 'TRANSFER' && tx.relatedAccountId) {
      updatedAccounts = updatedAccounts.map((a) => {
        if (a.id === tx.accountId) return { ...a, balance: a.balance + tx.amount, updatedAt: nowStr };
        if (a.id === tx.relatedAccountId) return { ...a, balance: a.balance - tx.amount, updatedAt: nowStr };
        return a;
      });
    } else if (tx.type !== 'GOAL_CONTRIBUTION') {
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount, updatedAt: nowStr } : a
      );
    }

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: updatedAccounts,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    setData(updated);
    showToast('Transaction removed', 'info');
  };

  const addDebt = (debt: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const nowStr = new Date().toISOString();
    const newDebt: Debt = {
      ...debt,
      id: 'debt_' + Date.now().toString(36),
      userId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      debts: [...prev.debts, newDebt],
    }));
    setData(updated);
    showToast(`Added liability "${debt.name}"`);
  };

  const recordDebtPayment = (debtId: string, accountId: string, amount: number) => {
    const debt = data.debts.find((d) => d.id === debtId);
    if (!debt) return;

    const nowStr = new Date().toISOString();
    const tx: TransactionRecord = {
      id: 'tx_' + Date.now().toString(36),
      userId,
      amount,
      type: 'DEBT_PAYMENT',
      category: 'Debt',
      accountId,
      date: new Date().toISOString().split('T')[0],
      description: `Payment to ${debt.name}`,
      notes: 'Recorded through Debt Center',
      referenceId: debtId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === accountId ? { ...a, balance: a.balance - amount, updatedAt: nowStr } : a
      ),
      debts: prev.debts.map((d) =>
        d.id === debtId
          ? {
              ...d,
              remainingAmount: Math.max(0, d.remainingAmount - amount),
              updatedAt: nowStr,
            }
          : d
      ),
      transactions: [tx, ...prev.transactions],
    }));
    setData(updated);
    showToast(`Payment of ${amount} applied to ${debt.name}`);
  };

  const deleteDebt = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      debts: prev.debts.filter((d) => d.id !== id),
    }));
    setData(updated);
    showToast('Debt removed', 'info');
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const nowStr = new Date().toISOString();
    const newGoal: Goal = {
      ...goal,
      id: 'goal_' + Date.now().toString(36),
      userId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
    setData(updated);
    showToast(`Goal "${goal.name}" created`);
  };

  const contributeToGoal = (goalId: string, accountId: string, amount: number) => {
    const goal = data.goals.find((g) => g.id === goalId);
    if (!goal) return;

    const nowStr = new Date().toISOString();
    const tx: TransactionRecord = {
      id: 'tx_' + Date.now().toString(36),
      userId,
      amount,
      type: 'GOAL_CONTRIBUTION',
      category: 'Goals',
      accountId,
      date: new Date().toISOString().split('T')[0],
      description: `${goal.name} contribution`,
      notes: 'Earmarked reserve for goal',
      referenceId: goalId,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    const updated = storage.updateData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: Math.min(g.targetAmount, g.currentAmount + amount),
              updatedAt: nowStr,
            }
          : g
      ),
      transactions: [tx, ...prev.transactions],
    }));
    setData(updated);
    showToast(`Contribution added to ${goal.name}`);
  };

  const deleteGoal = (id: string) => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
    setData(updated);
    showToast('Goal removed', 'info');
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
    showToast('Bill removed', 'info');
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
    showToast('Conversation deleted', 'info');
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
    showToast('Memory forgotten', 'info');
  };

  const clearAIMemory = () => {
    const updated = storage.updateData((prev) => ({
      ...prev,
      aiMemory: prev.aiMemory.filter((m) => m.userId !== userId),
    }));
    setData(updated);
    showToast('All AI memories cleared', 'info');
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

  const syncToSupabase = async (): Promise<boolean> => {
    const config = data.supabaseConfig;
    if (!config.url || !config.anonKey) {
      showToast('Please configure Supabase URL and Key in Settings', 'warning');
      return false;
    }

    const test = await testSupabaseConnection(config.url, config.anonKey);
    if (!test.success) {
      showToast(test.message, 'error');
      return false;
    }

    const res = await pushDataToSupabase(config.url, config.anonKey, data, userId);
    if (res.success) {
      updateSupabaseConfig({ connected: true, lastSyncedAt: new Date().toISOString() });
      showToast('Synced with Supabase Cloud!', 'success');
      return true;
    } else {
      showToast(res.message, 'error');
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
      showToast('Backup restored successfully!', 'success');
    } else {
      showToast('Failed to parse backup file.', 'error');
    }
    return ok;
  };

  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        theme,
        setTheme,
        currency,
        setCurrency,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddInitialTab,
        openQuickAdd,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toasts,
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

        brainState,

        addAccount,
        updateAccount,
        deleteAccount,

        addIncomeSource,
        recordIncomeReceipt,
        deleteIncomeSource,

        addTransaction,
        deleteTransaction,

        addDebt,
        recordDebtPayment,
        deleteDebt,

        addGoal,
        contributeToGoal,
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
        updateSupabaseConfig,
        syncToSupabase,

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
