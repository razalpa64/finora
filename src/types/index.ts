// FINORA OS Type Definitions

export type AccountType = 'CASH' | 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'OTHER';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  emergencyFund: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Frequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface IncomeSource {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: Frequency;
  nextIncomeDate: string; // YYYY-MM-DD
  accountId: string;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TRANSFER'
  | 'DEBT_PAYMENT'
  | 'EMI_PAYMENT'
  | 'GOAL_CONTRIBUTION'
  | 'INVESTMENT_CONTRIBUTION';

export interface TransactionRecord {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  relatedAccountId?: string;
  date: string; // YYYY-MM-DD
  description: string;
  notes?: string;
  referenceId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DebtType =
  | 'PERSONAL'
  | 'FAMILY'
  | 'FRIEND'
  | 'BANK_LOAN'
  | 'CREDIT_CARD'
  | 'EDUCATION_LOAN'
  | 'VEHICLE_LOAN'
  | 'HOME_LOAN'
  | 'BNPL'
  | 'OTHER';

export interface Debt {
  id: string;
  userId: string;
  name: string;
  type: DebtType;
  originalAmount: number;
  remainingAmount: number;
  interestRate: number; // percentage, e.g. 10.5
  minimumPayment: number;
  dueDate?: string; // YYYY-MM-DD
  userPriority: number; // 1 to 5 (1 = highest)
  relationshipImportance: number; // 1 to 5
  penaltyRisk: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  deadline?: string; // YYYY-MM-DD
  priority: GoalPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  recurring: boolean;
  frequency?: string;
  paid: boolean;
  subscription: boolean;
  lastUsedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limitAmount: number;
  monthKey: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  category: string;
  currentValue: number;
  monthlyContribution: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  currency: string;
  theme: 'dark' | 'light' | 'midnight' | 'cyberpunk';
  createdAt: string;
  lastLoginAt: string;
}

// FINORA Brain Engine Result Types
export type Severity = 'HEALTHY' | 'ATTENTION' | 'WARNING' | 'CRITICAL';

export interface Recommendation {
  severity: Severity;
  title: string;
  message: string;
  action: string;
  fact: string;
  assumption: string;
}

export interface HealthScore {
  overall: number; // 0 - 100
  factors: Record<string, number>;
  reasons: string[];
  label: 'Excellent' | 'Stable' | 'Needs attention' | 'At risk';
}

export interface SafeToSpendResult {
  today: number;
  flexibleRemaining: number;
  operatingCapacity: number;
  protectedReserve: number;
  remainingDays: number;
  explanation: string;
}

export interface MonthlyPlan {
  income: number;
  essentials: number;
  debtAndEmi: number;
  emergencySavings: number;
  goals: number;
  investments: number;
  flexible: number;
  reserve: number;
  score: number;
  explanations: string[];
}

export interface ForecastPoint {
  date: string;
  income: number;
  outflow: number;
  endingBalance: number;
  belowReserve: boolean;
}

export interface Forecast {
  points: ForecastPoint[];
  firstPressureDate: string | null;
  projectedEndingBalance: number;
  assumption: string;
}

export interface FinancialSnapshot {
  asOf: string;
  assets: number;
  cash: number;
  emergencyFund: number;
  investments: number;
  liabilities: number;
  netWorth: number;
  monthlyIncome: number;
  recordedIncome: number;
  expectedRecurringIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayments: number;
  monthlyOutflow: number;
  essentialExpenses: number;
  upcomingBills: number;
  upcomingDebtCommitments: number;
  plannedGoalContributions: number;
  usesRecurringIncomePlan: boolean;
  accounts: Account[];
  incomeSources: IncomeSource[];
  transactions: TransactionRecord[];
  debts: Debt[];
  goals: Goal[];
  bills: Bill[];
  budgets: Budget[];
  investmentsList: Investment[];
  expenseByCategory: Record<string, number>;
}

export interface BrainState {
  snapshot: FinancialSnapshot;
  safeToSpend: SafeToSpendResult;
  monthlyPlan: MonthlyPlan;
  health: HealthScore;
  recommendations: Recommendation[];
  forecast: Forecast;
}

export interface BrainResponse {
  intent: string;
  headline: string;
  summary: string;
  calculations: string[];
  recommendations: string[];
  assumptions: string[];
  severity: Severity;
}

// AI Chat & Memory Types
export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  toolTrace?: string[];
  verified: boolean;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMemoryItem {
  id: string;
  userId: string;
  type: string;
  key: string;
  value: string;
  importance: number;
  confidence: number;
  lastUsedAt: string;
}

export interface AISettings {
  memoryEnabled: boolean;
  dailyBriefing: boolean;
  providerType: 'DETERMINISTIC' | 'OLLAMA' | 'LLAMA_CPP' | 'CLOUD';
  modelName: string;
  endpoint: string;
  responseStyle: 'CONCISE' | 'BALANCED' | 'DETAILED';
  cloudConsent: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastSyncedAt?: string;
  autoSync: boolean;
}
