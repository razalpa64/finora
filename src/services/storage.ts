import {
  Account,
  AIConversation,
  AIMemoryItem,
  AIMessage,
  AISettings,
  Bill,
  Budget,
  Debt,
  Goal,
  IncomeSource,
  Investment,
  SupabaseConfig,
  TransactionRecord,
  UserProfile,
} from '../types';

const STORAGE_KEY_PREFIX = 'finora_';

export interface StorageData {
  profiles: UserProfile[];
  currentProfileId: string;
  accounts: Account[];
  incomeSources: IncomeSource[];
  transactions: TransactionRecord[];
  debts: Debt[];
  goals: Goal[];
  bills: Bill[];
  budgets: Budget[];
  investments: Investment[];
  conversations: AIConversation[];
  messages: AIMessage[];
  aiMemory: AIMemoryItem[];
  aiSettings: AISettings;
  supabaseConfig: SupabaseConfig;
}

// Realistic preloaded initial demo profile so user can immediately test drive FINORA OS
const INITIAL_DEMO_PROFILE: UserProfile = {
  id: 'usr_demo_01',
  username: 'alex.morgan',
  displayName: 'Alex Morgan',
  currency: 'INR',
  theme: 'dark',
  createdAt: '2026-01-01T00:00:00.000Z',
  lastLoginAt: new Date().toISOString(),
};

const INITIAL_DEMO_ACCOUNTS: Account[] = [
  {
    id: 'acc_01',
    userId: 'usr_demo_01',
    name: 'HDFC Primary Checking',
    type: 'CHECKING',
    balance: 84500,
    currency: 'INR',
    emergencyFund: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
  },
  {
    id: 'acc_02',
    userId: 'usr_demo_01',
    name: 'ICICI Emergency Reserve',
    type: 'SAVINGS',
    balance: 150000,
    currency: 'INR',
    emergencyFund: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'acc_03',
    userId: 'usr_demo_01',
    name: 'Zerodha Long-term Equities',
    type: 'INVESTMENT',
    balance: 320000,
    currency: 'INR',
    emergencyFund: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'acc_04',
    userId: 'usr_demo_01',
    name: 'Physical Cash Wallet',
    type: 'CASH',
    balance: 8500,
    currency: 'INR',
    emergencyFund: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-22T00:00:00.000Z',
  },
];

const INITIAL_DEMO_INCOME: IncomeSource[] = [
  {
    id: 'inc_01',
    userId: 'usr_demo_01',
    name: 'Senior Engineering Salary',
    amount: 145000,
    frequency: 'MONTHLY',
    nextIncomeDate: '2026-09-01',
    accountId: 'acc_01',
    active: true,
    notes: 'Direct deposit on the 1st of every month',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'inc_02',
    userId: 'usr_demo_01',
    name: 'Advisory Retainer',
    amount: 25000,
    frequency: 'MONTHLY',
    nextIncomeDate: '2026-09-15',
    accountId: 'acc_01',
    active: true,
    notes: 'Contract consulting services',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
];

const INITIAL_DEMO_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx_01',
    userId: 'usr_demo_01',
    amount: 145000,
    type: 'INCOME',
    category: 'Income',
    accountId: 'acc_01',
    date: '2026-08-01',
    description: 'Senior Engineering Salary - August',
    notes: 'Primary monthly payout',
    createdAt: '2026-08-01T09:00:00.000Z',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'tx_02',
    userId: 'usr_demo_01',
    amount: 32000,
    type: 'EXPENSE',
    category: 'Housing',
    accountId: 'acc_01',
    date: '2026-08-02',
    description: 'Apartment Rent - August',
    notes: 'Paid to landlord via UPI',
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'tx_03',
    userId: 'usr_demo_01',
    amount: 14200,
    type: 'EXPENSE',
    category: 'Groceries',
    accountId: 'acc_01',
    date: '2026-08-06',
    description: 'Nature Basket Organic Groceries',
    notes: 'Bi-weekly stock up',
    createdAt: '2026-08-06T14:30:00.000Z',
    updatedAt: '2026-08-06T14:30:00.000Z',
  },
  {
    id: 'tx_04',
    userId: 'usr_demo_01',
    amount: 18500,
    type: 'DEBT_PAYMENT',
    category: 'Debt',
    accountId: 'acc_01',
    date: '2026-08-10',
    description: 'HDFC Car Loan Monthly EMI',
    notes: 'Reducing balance tenure payment',
    referenceId: 'debt_01',
    createdAt: '2026-08-10T11:00:00.000Z',
    updatedAt: '2026-08-10T11:00:00.000Z',
  },
  {
    id: 'tx_05',
    userId: 'usr_demo_01',
    amount: 15000,
    type: 'GOAL_CONTRIBUTION',
    category: 'Goals',
    accountId: 'acc_02',
    date: '2026-08-15',
    description: 'Japan Trip 2027 Contribution',
    notes: 'Monthly earmarked reserve',
    referenceId: 'goal_01',
    createdAt: '2026-08-15T16:00:00.000Z',
    updatedAt: '2026-08-15T16:00:00.000Z',
  },
  {
    id: 'tx_06',
    userId: 'usr_demo_01',
    amount: 4500,
    type: 'EXPENSE',
    category: 'Utilities',
    accountId: 'acc_01',
    date: '2026-08-18',
    description: 'Electricity & High-speed Fiber',
    notes: 'Monthly home bills',
    createdAt: '2026-08-18T18:00:00.000Z',
    updatedAt: '2026-08-18T18:00:00.000Z',
  },
  {
    id: 'tx_07',
    userId: 'usr_demo_01',
    amount: 6200,
    type: 'EXPENSE',
    category: 'Dining',
    accountId: 'acc_01',
    date: '2026-08-21',
    description: 'Weekend Dining & Coffee',
    notes: 'Social expenses',
    createdAt: '2026-08-21T20:00:00.000Z',
    updatedAt: '2026-08-21T20:00:00.000Z',
  },
];

const INITIAL_DEMO_DEBTS: Debt[] = [
  {
    id: 'debt_01',
    userId: 'usr_demo_01',
    name: 'HDFC Vehicle Loan',
    type: 'VEHICLE_LOAN',
    originalAmount: 650000,
    remainingAmount: 245000,
    interestRate: 8.75,
    minimumPayment: 18500,
    dueDate: '2026-09-10',
    userPriority: 1,
    relationshipImportance: 3,
    penaltyRisk: true,
    notes: '36-month loan term, 14 months remaining',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'debt_02',
    userId: 'usr_demo_01',
    name: 'Amex Platinum Credit Card',
    type: 'CREDIT_CARD',
    originalAmount: 42000,
    remainingAmount: 18400,
    interestRate: 36.0,
    minimumPayment: 3500,
    dueDate: '2026-08-29',
    userPriority: 1,
    relationshipImportance: 3,
    penaltyRisk: true,
    notes: 'High interest rate liability; prioritize repayment via Avalanche',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
  },
];

const INITIAL_DEMO_GOALS: Goal[] = [
  {
    id: 'goal_01',
    userId: 'usr_demo_01',
    name: 'Japan Autumn Trip 2027',
    targetAmount: 250000,
    currentAmount: 120000,
    monthlyContribution: 15000,
    deadline: '2027-10-15',
    priority: 'HIGH',
    notes: 'Two weeks autumn foliage travel in Tokyo & Kyoto',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'goal_02',
    userId: 'usr_demo_01',
    name: 'MacBook Pro M4 Max Upgrade',
    targetAmount: 280000,
    currentAmount: 95000,
    monthlyContribution: 20000,
    deadline: '2027-02-28',
    priority: 'MEDIUM',
    notes: 'Workstation hardware refresh',
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
  },
];

const INITIAL_DEMO_BILLS: Bill[] = [
  {
    id: 'bill_01',
    userId: 'usr_demo_01',
    name: 'Gigabit Fiber Internet',
    category: 'Utilities',
    amount: 1499,
    dueDate: '2026-08-28',
    recurring: true,
    frequency: 'MONTHLY',
    paid: false,
    subscription: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'bill_02',
    userId: 'usr_demo_01',
    name: 'ChatGPT Plus & Claude Pro',
    category: 'Software',
    amount: 3800,
    dueDate: '2026-08-30',
    recurring: true,
    frequency: 'MONTHLY',
    paid: false,
    subscription: true,
    lastUsedDate: '2026-08-25',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    id: 'bill_03',
    userId: 'usr_demo_01',
    name: 'Health Insurance Family Float',
    category: 'Insurance',
    amount: 22000,
    dueDate: '2026-09-05',
    recurring: true,
    frequency: 'ANNUAL',
    paid: false,
    subscription: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

const INITIAL_DEMO_BUDGETS: Budget[] = [
  {
    id: 'bud_01',
    userId: 'usr_demo_01',
    category: 'Groceries',
    limitAmount: 20000,
    monthKey: '2026-08',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'bud_02',
    userId: 'usr_demo_01',
    category: 'Dining',
    limitAmount: 12000,
    monthKey: '2026-08',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'bud_03',
    userId: 'usr_demo_01',
    category: 'Utilities',
    limitAmount: 8000,
    monthKey: '2026-08',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

const INITIAL_DEMO_INVESTMENTS: Investment[] = [
  {
    id: 'inv_01',
    userId: 'usr_demo_01',
    name: 'Nifty 50 Index Fund Direct Growth',
    category: 'Equities',
    currentValue: 240000,
    monthlyContribution: 15000,
    notes: 'Low expense ratio index SIP',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'inv_02',
    userId: 'usr_demo_01',
    name: 'Sovereign Gold Bonds 2028',
    category: 'Commodities',
    currentValue: 80000,
    monthlyContribution: 0,
    notes: '2.5% semi-annual coupon + sovereign gold backing',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

const INITIAL_DEMO_AI_SETTINGS: AISettings = {
  memoryEnabled: true,
  dailyBriefing: true,
  providerType: 'DETERMINISTIC',
  modelName: 'llama3.2:3b',
  endpoint: 'http://127.0.0.1:11434',
  responseStyle: 'BALANCED',
  cloudConsent: false,
};

const INITIAL_DEMO_SUPABASE_CONFIG: SupabaseConfig = {
  url: '',
  anonKey: '',
  connected: false,
  autoSync: false,
};

export class StorageService {
  private static instance: StorageService;
  private data: StorageData;

  private constructor() {
    this.data = this.loadFromStorage();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private loadFromStorage(): StorageData {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}data`);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          supabaseConfig: parsed.supabaseConfig || INITIAL_DEMO_SUPABASE_CONFIG,
          aiSettings: parsed.aiSettings || INITIAL_DEMO_AI_SETTINGS,
        };
      }
    } catch (e) {
      console.warn('Failed to parse local storage, initializing default workspace:', e);
    }

    // Default seed
    const initialData: StorageData = {
      profiles: [INITIAL_DEMO_PROFILE],
      currentProfileId: INITIAL_DEMO_PROFILE.id,
      accounts: INITIAL_DEMO_ACCOUNTS,
      incomeSources: INITIAL_DEMO_INCOME,
      transactions: INITIAL_DEMO_TRANSACTIONS,
      debts: INITIAL_DEMO_DEBTS,
      goals: INITIAL_DEMO_GOALS,
      bills: INITIAL_DEMO_BILLS,
      budgets: INITIAL_DEMO_BUDGETS,
      investments: INITIAL_DEMO_INVESTMENTS,
      conversations: [],
      messages: [],
      aiMemory: [
        {
          id: 'mem_01',
          userId: 'usr_demo_01',
          type: 'PREFERENCE',
          key: 'risk_tolerance',
          value: 'Moderate growth with strict 6-month emergency reserve requirement',
          importance: 0.9,
          confidence: 1.0,
          lastUsedAt: new Date().toISOString(),
        },
      ],
      aiSettings: INITIAL_DEMO_AI_SETTINGS,
      supabaseConfig: INITIAL_DEMO_SUPABASE_CONFIG,
    };

    this.saveToStorage(initialData);
    return initialData;
  }

  private saveToStorage(data: StorageData): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}data`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }

  public getData(): StorageData {
    return { ...this.data };
  }

  public updateData(updater: (data: StorageData) => StorageData): StorageData {
    this.data = updater(this.data);
    this.saveToStorage(this.data);
    return { ...this.data };
  }

  public resetToEmptyWorkspace(profile: UserProfile): StorageData {
    const freshData: StorageData = {
      profiles: [profile],
      currentProfileId: profile.id,
      accounts: [],
      incomeSources: [],
      transactions: [],
      debts: [],
      goals: [],
      bills: [],
      budgets: [],
      investments: [],
      conversations: [],
      messages: [],
      aiMemory: [],
      aiSettings: INITIAL_DEMO_AI_SETTINGS,
      supabaseConfig: INITIAL_DEMO_SUPABASE_CONFIG,
    };
    this.data = freshData;
    this.saveToStorage(freshData);
    return freshData;
  }

  public loadDemoWorkspace(): StorageData {
    const demoData: StorageData = {
      profiles: [INITIAL_DEMO_PROFILE],
      currentProfileId: INITIAL_DEMO_PROFILE.id,
      accounts: INITIAL_DEMO_ACCOUNTS,
      incomeSources: INITIAL_DEMO_INCOME,
      transactions: INITIAL_DEMO_TRANSACTIONS,
      debts: INITIAL_DEMO_DEBTS,
      goals: INITIAL_DEMO_GOALS,
      bills: INITIAL_DEMO_BILLS,
      budgets: INITIAL_DEMO_BUDGETS,
      investments: INITIAL_DEMO_INVESTMENTS,
      conversations: [],
      messages: [],
      aiMemory: [
        {
          id: 'mem_01',
          userId: 'usr_demo_01',
          type: 'PREFERENCE',
          key: 'risk_tolerance',
          value: 'Moderate growth with strict 6-month emergency reserve requirement',
          importance: 0.9,
          confidence: 1.0,
          lastUsedAt: new Date().toISOString(),
        },
      ],
      aiSettings: INITIAL_DEMO_AI_SETTINGS,
      supabaseConfig: this.data.supabaseConfig || INITIAL_DEMO_SUPABASE_CONFIG,
    };
    this.data = demoData;
    this.saveToStorage(demoData);
    return demoData;
  }

  public exportBackupJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profiles || !Array.isArray(parsed.accounts)) {
        throw new Error('Invalid backup file format.');
      }
      this.data = parsed;
      this.saveToStorage(parsed);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }
}
