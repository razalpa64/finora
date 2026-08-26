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

const STORAGE_KEY_PREFIX = 'finora_v2_';

export interface StorageData {
  profiles: UserProfile[];
  currentProfileId: string | null;
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

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://lymvbkjlqmuftzagzxol.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2aQKNtANowbPl-nUvcXAHg_NHZHs2F3',
  connected: true,
  autoSync: true,
};

const DEFAULT_AI_SETTINGS: AISettings = {
  memoryEnabled: true,
  dailyBriefing: true,
  providerType: 'DETERMINISTIC',
  modelName: 'llama3.2:3b',
  endpoint: 'http://127.0.0.1:11434',
  responseStyle: 'BALANCED',
  cloudConsent: false,
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
          supabaseConfig: {
            ...DEFAULT_SUPABASE_CONFIG,
            ...(parsed.supabaseConfig || {}),
          },
          aiSettings: parsed.aiSettings || DEFAULT_AI_SETTINGS,
        };
      }
    } catch (e) {
      console.warn('Initializing clean workspace:', e);
    }

    // Clean empty workspace by default — no fake info
    const initialData: StorageData = {
      profiles: [],
      currentProfileId: null,
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
      aiSettings: DEFAULT_AI_SETTINGS,
      supabaseConfig: DEFAULT_SUPABASE_CONFIG,
    };

    this.saveToStorage(initialData);
    return initialData;
  }

  private saveToStorage(data: StorageData): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}data`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save data:', e);
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

  public exportBackupJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid format');
      }
      this.data = {
        ...parsed,
        supabaseConfig: parsed.supabaseConfig || DEFAULT_SUPABASE_CONFIG,
      };
      this.saveToStorage(this.data);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}
