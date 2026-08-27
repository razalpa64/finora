import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Account,
  Bill,
  Budget,
  Debt,
  Goal,
  IncomeSource,
  Investment,
  TransactionRecord,
  UserProfile,
} from '../types';
import { StorageData, CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_KEY } from './storage';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient {
  const finalUrl = url || CENTRAL_SUPABASE_URL;
  const finalKey = anonKey || CENTRAL_SUPABASE_KEY;

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(finalUrl, finalKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    } catch (e) {
      console.warn('Supabase client init note:', e);
      // Fallback
      supabaseClient = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_KEY);
    }
  }
  return supabaseClient;
}

export interface SyncResult {
  success: boolean;
  message: string;
  failedTables?: string[];
}

export interface PulledCloudData {
  profiles: UserProfile[];
  accounts: Account[];
  incomeSources: IncomeSource[];
  transactions: TransactionRecord[];
  debts: Debt[];
  goals: Goal[];
  bills: Bill[];
  budgets: Budget[];
  investments: Investment[];
}

interface PostgrestErrorLike {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

function describeError(error: PostgrestErrorLike | null | undefined): string {
  if (!error) return 'Unknown error';
  const code = error.code || '';
  let hint = '';
  if (code === '42P01' || error.message?.includes('does not exist') || code === 'PGRST205') {
    hint = ' (table missing — run supabase/schema.sql and supabase/migrate_text_ids.sql in the Supabase SQL editor)';
  } else if (code === '42501' || code === 'PGRST301') {
    hint = ' (permission denied — run supabase/migrate_text_ids.sql to install access policies)';
  } else if (code === '22P02') {
    hint = ' (id format mismatch — run supabase/migrate_text_ids.sql to switch tables to text ids)';
  } else if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
    hint = ' (network unreachable — check your connection)';
  }
  return `${code ? code + ': ' : ''}${error.message || 'Request failed'}${hint}`;
}

/**
 * Turns Supabase error responses into actionable messages.
 * Honest connection test: only reports success when the REST API actually responds.
 */
export async function testSupabaseConnection(
  url?: string,
  anonKey?: string
): Promise<{ success: boolean; message: string; tableCount?: number }> {
  try {
    const client = getSupabaseClient(url, anonKey);
    const { data, error } = await client.from('accounts').select('id').limit(1);

    if (error) {
      return { success: false, message: `Database check failed — ${describeError(error)}` };
    }

    return {
      success: true,
      message: 'FINORA Cloud Database is operational.',
      tableCount: data ? data.length : 0,
    };
  } catch (e: any) {
    return { success: false, message: `Could not reach Supabase — ${e?.message || e}` };
  }
}

/** Builds a quoted PostgREST `in` filter list, e.g. `("acc_a","acc_b")`. */
function quotedIdList(ids: string[]): string {
  return `(${ids.map((id) => `"${String(id).replace(/"/g, '""')}"`).join(',')})`;
}

/**
 * Mirrors one table for a user: upserts all local rows, then deletes any
 * cloud rows for this user that no longer exist locally.
 * Returns null on success or a human-readable error string.
 */
async function mirrorTable(
  client: SupabaseClient,
  table: string,
  userId: string,
  rows: Record<string, unknown>[],
  opts?: { propagateDeletes?: boolean }
): Promise<string | null> {
  const propagateDeletes = opts?.propagateDeletes !== false;
  try {
    const ops: PromiseLike<{ error: PostgrestErrorLike | null }>[] = [];

    if (rows.length > 0) {
      ops.push(client.from(table).upsert(rows, { onConflict: 'id' }));
    }

    if (propagateDeletes) {
      let del = client.from(table).delete().eq('user_id', userId);
      if (rows.length > 0) {
        del = del.not('id', 'in', quotedIdList(rows.map((r) => String(r.id))));
      }
      ops.push(del);
    }

    const results = await Promise.all(ops);
    for (const res of results) {
      if (res?.error) return describeError(res.error);
    }
    return null;
  } catch (e: any) {
    return e?.message || String(e);
  }
}

export async function pushDataToSupabase(
  url: string,
  anonKey: string,
  data: StorageData,
  userId: string
): Promise<SyncResult> {
  if (!userId) return { success: false, message: 'No active profile — sign in first.' };

  try {
    const client = getSupabaseClient(url, anonKey);

    // Current user records
    const userAccounts = data.accounts.filter((a) => a.userId === userId);
    const userIncome = data.incomeSources.filter((i) => i.userId === userId);
    const userTxs = data.transactions.filter((t) => t.userId === userId);
    const userDebts = data.debts.filter((d) => d.userId === userId);
    const userGoals = data.goals.filter((g) => g.userId === userId);
    const userBills = data.bills.filter((b) => b.userId === userId);
    const userBudgets = data.budgets.filter((b) => b.userId === userId);
    const userInvestments = data.investments.filter((i) => i.userId === userId);

    // Profiles are upsert-only (never delete-mirrored) so one device cannot
    // erase another device's profile row.
    const tasks: { table: string; run: () => Promise<string | null> }[] = [
      {
        table: 'profiles',
        run: () =>
          mirrorTable(
            client,
            'profiles',
            userId,
            data.profiles.map((p) => ({
              id: p.id,
              username: p.username,
              display_name: p.displayName,
              currency: p.currency,
              theme: p.theme,
              last_login_at: p.lastLoginAt,
              created_at: p.createdAt,
              updated_at: p.lastLoginAt || p.createdAt,
            })),
            { propagateDeletes: false }
          ),
      },
      {
        table: 'accounts',
        run: () =>
          mirrorTable(
            client,
            'accounts',
            userId,
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
          ),
      },
      {
        table: 'income_sources',
        run: () =>
          mirrorTable(
            client,
            'income_sources',
            userId,
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
          ),
      },
      {
        table: 'financial_transactions',
        run: () =>
          mirrorTable(
            client,
            'financial_transactions',
            userId,
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
          ),
      },
      {
        table: 'debts',
        run: () =>
          mirrorTable(
            client,
            'debts',
            userId,
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
          ),
      },
      {
        table: 'goals',
        run: () =>
          mirrorTable(
            client,
            'goals',
            userId,
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
          ),
      },
      {
        table: 'bills',
        run: () =>
          mirrorTable(
            client,
            'bills',
            userId,
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
          ),
      },
      {
        table: 'budgets',
        run: () =>
          mirrorTable(
            client,
            'budgets',
            userId,
            userBudgets.map((b) => ({
              id: b.id,
              user_id: b.userId,
              category: b.category,
              limit_amount: b.limitAmount,
              month_key: b.monthKey,
              created_at: b.createdAt,
              updated_at: b.updatedAt,
            }))
          ),
      },
      {
        table: 'investments',
        run: () =>
          mirrorTable(
            client,
            'investments',
            userId,
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
          ),
      },
    ];

    const errors = await Promise.all(tasks.map((t) => t.run()));
    const failed = tasks.filter((_, i) => errors[i] !== null);
    const failedTables = failed.map((t) => t.table);

    if (failed.length === 0) {
      return { success: true, message: 'All financial records synchronized to cloud.' };
    }

    const firstError = errors.find((e): e is string => e !== null);
    if (failed.length === tasks.length) {
      return {
        success: false,
        message: `Cloud sync failed — ${firstError}`,
        failedTables,
      };
    }
    return {
      success: false,
      message: `Partial sync: ${tasks.length - failed.length}/${tasks.length} tables saved. Failed: ${failedTables.join(', ')} — ${firstError}`,
      failedTables,
    };
  } catch (e: any) {
    return { success: false, message: `Push notice: ${e?.message || e}` };
  }
}

// ---------------------------------------------------------------------------
// Row mappers: database (snake_case) -> app (camelCase)
// ---------------------------------------------------------------------------

function mapProfileRow(r: any): UserProfile {
  return {
    id: String(r.id),
    username: r.username,
    displayName: r.display_name,
    currency: r.currency || 'INR',
    theme: r.theme || 'dark',
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at || r.created_at,
  };
}

function mapAccountRow(r: any): Account {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    name: r.name,
    type: r.account_type,
    balance: Number(r.balance ?? 0),
    currency: r.currency || 'INR',
    emergencyFund: !!r.emergency_fund,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapIncomeRow(r: any): IncomeSource {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    name: r.name,
    amount: Number(r.amount ?? 0),
    frequency: r.frequency,
    nextIncomeDate: r.next_income_date,
    accountId: r.account_id ? String(r.account_id) : '',
    active: r.active !== false,
    notes: r.notes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapTransactionRow(r: any): TransactionRecord {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    amount: Number(r.amount ?? 0),
    type: r.tx_type,
    category: r.category,
    accountId: r.account_id ? String(r.account_id) : '',
    relatedAccountId: r.related_account_id ? String(r.related_account_id) : undefined,
    date: r.tx_date,
    description: r.description,
    notes: r.notes || '',
    referenceId: r.reference_id ? String(r.reference_id) : undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapDebtRow(r: any): Debt {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    name: r.name,
    type: r.debt_type,
    originalAmount: Number(r.original_amount ?? 0),
    remainingAmount: Number(r.remaining_amount ?? 0),
    interestRate: Number(r.interest_rate ?? 0),
    minimumPayment: Number(r.minimum_payment ?? 0),
    dueDate: r.due_date || undefined,
    userPriority: r.user_priority ?? 3,
    relationshipImportance: r.relationship_importance ?? 3,
    penaltyRisk: !!r.penalty_risk,
    notes: r.notes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapGoalRow(r: any): Goal {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    name: r.name,
    targetAmount: Number(r.target_amount ?? 0),
    currentAmount: Number(r.current_amount ?? 0),
    monthlyContribution: Number(r.monthly_contribution ?? 0),
    deadline: r.deadline || undefined,
    priority: r.priority,
    notes: r.notes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapBillRow(r: any): Bill {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    name: r.name,
    category: r.category,
    amount: Number(r.amount ?? 0),
    dueDate: r.due_date,
    recurring: !!r.recurring,
    frequency: r.frequency || 'MONTHLY',
    paid: !!r.paid,
    subscription: !!r.subscription,
    lastUsedDate: r.last_used_date || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapBudgetRow(r: any): Budget {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    category: r.category,
    limitAmount: Number(r.limit_amount ?? 0),
    monthKey: r.month_key,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapInvestmentRow(r: any): Investment {
  return {
    id: String(r.id),
    userId: String(r.user_id || ''),
    name: r.name,
    category: r.category,
    currentValue: Number(r.current_value ?? 0),
    monthlyContribution: Number(r.monthly_contribution ?? 0),
    notes: r.notes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function pullDataFromSupabase(
  url: string,
  anonKey: string,
  userId: string
): Promise<{ success: boolean; message: string; data?: PulledCloudData }> {
  if (!userId) return { success: false, message: 'User ID missing' };

  try {
    const client = getSupabaseClient(url, anonKey);
    const [
      profilesRes,
      accountsRes,
      incomeRes,
      txsRes,
      debtsRes,
      goalsRes,
      billsRes,
      budgetsRes,
      investmentsRes,
    ] = await Promise.allSettled([
      client.from('profiles').select('*').eq('id', userId),
      client.from('accounts').select('*').eq('user_id', userId),
      client.from('income_sources').select('*').eq('user_id', userId),
      client.from('financial_transactions').select('*').eq('user_id', userId),
      client.from('debts').select('*').eq('user_id', userId),
      client.from('goals').select('*').eq('user_id', userId),
      client.from('bills').select('*').eq('user_id', userId),
      client.from('budgets').select('*').eq('user_id', userId),
      client.from('investments').select('*').eq('user_id', userId),
    ]);

    const rows = (res: PromiseSettledResult<{ data: any[] | null; error: PostgrestErrorLike | null }>) =>
      res.status === 'fulfilled' && !res.value.error && res.value.data ? res.value.data : [];

    const firstError = (
      [
        profilesRes,
        accountsRes,
        incomeRes,
        txsRes,
        debtsRes,
        goalsRes,
        billsRes,
        budgetsRes,
        investmentsRes,
      ] as PromiseSettledResult<{ data: any[] | null; error: PostgrestErrorLike | null }>[]
    )
      .filter((r) => r.status === 'fulfilled' && r.value.error)
      .map((r) => (r as PromiseFulfilledResult<{ data: any[] | null; error: PostgrestErrorLike | null }>).value.error)
      .find(() => true);

    // If even one table hard-fails, surface it — silent empty results are how
    // "the database looks empty" bugs hide.
    if (firstError) {
      return { success: false, message: `Pull failed — ${describeError(firstError)}` };
    }

    return {
      success: true,
      message: 'Pulled data successfully',
      data: {
        profiles: rows(profilesRes).map(mapProfileRow),
        accounts: rows(accountsRes).map(mapAccountRow),
        incomeSources: rows(incomeRes).map(mapIncomeRow),
        transactions: rows(txsRes).map(mapTransactionRow),
        debts: rows(debtsRes).map(mapDebtRow),
        goals: rows(goalsRes).map(mapGoalRow),
        bills: rows(billsRes).map(mapBillRow),
        budgets: rows(budgetsRes).map(mapBudgetRow),
        investments: rows(investmentsRes).map(mapInvestmentRow),
      },
    };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Failed to pull data from Supabase' };
  }
}
