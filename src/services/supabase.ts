import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageData } from './storage';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  if (url && anonKey) {
    try {
      supabaseClient = createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      return supabaseClient;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseClient;
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; tableCount?: number }> {
  if (!url || !anonKey) {
    return { success: false, message: 'Please provide both Project URL and Anon API Key.' };
  }

  try {
    const client = createClient(url, anonKey);
    // Test basic query
    const { data, error } = await client.from('profiles').select('id').limit(1);

    if (error) {
      // Table might not exist yet if schema wasn't executed
      if (error.code === 'PGRST116' || error.message.includes('relation "public.profiles" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! The database schema has not been applied yet. Run the SQL script from Settings.',
        };
      }
      return { success: false, message: `Supabase Error: ${error.message} (Code: ${error.code})` };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase Database!',
      tableCount: data ? data.length : 0,
    };
  } catch (e: any) {
    return { success: false, message: `Connection failed: ${e.message || e}` };
  }
}

export async function pushDataToSupabase(
  url: string,
  anonKey: string,
  data: StorageData,
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);

    // Filter data for current user
    const userAccounts = data.accounts.filter((a) => a.userId === userId);
    const userIncome = data.incomeSources.filter((i) => i.userId === userId);
    const userTxs = data.transactions.filter((t) => t.userId === userId);
    const userDebts = data.debts.filter((d) => d.userId === userId);
    const userGoals = data.goals.filter((g) => g.userId === userId);
    const userBills = data.bills.filter((b) => b.userId === userId);
    const userBudgets = data.budgets.filter((b) => b.userId === userId);
    const userInvestments = data.investments.filter((i) => i.userId === userId);

    // Upsert accounts
    if (userAccounts.length > 0) {
      await client.from('accounts').upsert(
        userAccounts.map((a) => ({
          id: a.id,
          user_id: a.userId,
          name: a.name,
          account_type: a.type,
          balance: a.balance,
          currency: a.currency,
          emergency_fund: a.emergencyFund,
          created_at: a.createdAt,
          updated_at: a.updatedAt,
        }))
      );
    }

    // Upsert income sources
    if (userIncome.length > 0) {
      await client.from('income_sources').upsert(
        userIncome.map((i) => ({
          id: i.id,
          user_id: i.userId,
          name: i.name,
          amount: i.amount,
          frequency: i.frequency,
          next_income_date: i.nextIncomeDate,
          account_id: i.accountId,
          active: i.active,
          notes: i.notes || '',
          created_at: i.createdAt,
          updated_at: i.updatedAt,
        }))
      );
    }

    // Upsert transactions
    if (userTxs.length > 0) {
      await client.from('financial_transactions').upsert(
        userTxs.map((t) => ({
          id: t.id,
          user_id: t.userId,
          amount: t.amount,
          tx_type: t.type,
          category: t.category,
          account_id: t.accountId,
          related_account_id: t.relatedAccountId || null,
          tx_date: t.date,
          description: t.description,
          notes: t.notes || '',
          reference_id: t.referenceId || null,
          created_at: t.createdAt,
          updated_at: t.updatedAt,
        }))
      );
    }

    // Upsert debts
    if (userDebts.length > 0) {
      await client.from('debts').upsert(
        userDebts.map((d) => ({
          id: d.id,
          user_id: d.userId,
          name: d.name,
          debt_type: d.type,
          original_amount: d.originalAmount,
          remaining_amount: d.remainingAmount,
          interest_rate: d.interestRate,
          minimum_payment: d.minimumPayment,
          due_date: d.dueDate || null,
          user_priority: d.userPriority,
          relationship_importance: d.relationshipImportance,
          penalty_risk: d.penaltyRisk,
          notes: d.notes || '',
          created_at: d.createdAt,
          updated_at: d.updatedAt,
        }))
      );
    }

    // Upsert goals
    if (userGoals.length > 0) {
      await client.from('goals').upsert(
        userGoals.map((g) => ({
          id: g.id,
          user_id: g.userId,
          name: g.name,
          target_amount: g.targetAmount,
          current_amount: g.currentAmount,
          monthly_contribution: g.monthlyContribution,
          deadline: g.deadline || null,
          priority: g.priority,
          notes: g.notes || '',
          created_at: g.createdAt,
          updated_at: g.updatedAt,
        }))
      );
    }

    // Upsert bills
    if (userBills.length > 0) {
      await client.from('bills').upsert(
        userBills.map((b) => ({
          id: b.id,
          user_id: b.userId,
          name: b.name,
          category: b.category,
          amount: b.amount,
          due_date: b.dueDate,
          recurring: b.recurring,
          frequency: b.frequency || 'MONTHLY',
          paid: b.paid,
          subscription: b.subscription,
          last_used_date: b.lastUsedDate || null,
          created_at: b.createdAt,
          updated_at: b.updatedAt,
        }))
      );
    }

    // Upsert budgets
    if (userBudgets.length > 0) {
      await client.from('budgets').upsert(
        userBudgets.map((b) => ({
          id: b.id,
          user_id: b.userId,
          category: b.category,
          limit_amount: b.limitAmount,
          month_key: b.monthKey,
          created_at: b.createdAt,
          updated_at: b.updatedAt,
        }))
      );
    }

    // Upsert investments
    if (userInvestments.length > 0) {
      await client.from('investments').upsert(
        userInvestments.map((inv) => ({
          id: inv.id,
          user_id: inv.userId,
          name: inv.name,
          category: inv.category,
          current_value: inv.currentValue,
          monthly_contribution: inv.monthlyContribution,
          notes: inv.notes || '',
          created_at: inv.createdAt,
          updated_at: inv.updatedAt,
        }))
      );
    }

    return { success: true, message: 'All financial records synchronized to Supabase cloud!' };
  } catch (e: any) {
    return { success: false, message: `Push failed: ${e.message || e}` };
  }
}

export const SUPABASE_SQL_SCHEMA_SCRIPT = `-- FINORA OS SUPABASE SCHEMA
-- Paste this entire script into your Supabase Dashboard -> SQL Editor -> New Query, then click RUN.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    username VARCHAR(80) NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(120) NOT NULL,
    account_type VARCHAR(30) NOT NULL DEFAULT 'CHECKING',
    balance NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    emergency_fund BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.income_sources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    next_income_date DATE NOT NULL,
    account_id TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    tx_type VARCHAR(40) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'General',
    account_id TEXT NOT NULL,
    related_account_id TEXT,
    tx_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description VARCHAR(240) NOT NULL,
    notes TEXT,
    reference_id TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.debts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    debt_type VARCHAR(40) NOT NULL DEFAULT 'PERSONAL',
    original_amount NUMERIC(19, 2) NOT NULL,
    remaining_amount NUMERIC(19, 2) NOT NULL,
    interest_rate NUMERIC(9, 4) NOT NULL DEFAULT 0.0000,
    minimum_payment NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    due_date DATE,
    user_priority INT NOT NULL DEFAULT 3,
    relationship_importance INT NOT NULL DEFAULT 3,
    penalty_risk BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    target_amount NUMERIC(19, 2) NOT NULL,
    current_amount NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    monthly_contribution NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Utilities',
    amount NUMERIC(19, 2) NOT NULL,
    due_date DATE NOT NULL,
    recurring BOOLEAN NOT NULL DEFAULT TRUE,
    frequency VARCHAR(30) DEFAULT 'MONTHLY',
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    subscription BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_date DATE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    limit_amount NUMERIC(19, 2) NOT NULL,
    month_key VARCHAR(7) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.investments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Equities',
    current_value NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    monthly_contribution NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Allow public/anon client access for self-hosted / client token
CREATE POLICY "Allow anon all on accounts" ON public.accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on income_sources" ON public.income_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on transactions" ON public.financial_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on debts" ON public.debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);
`;
