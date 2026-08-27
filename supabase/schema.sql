-- ==============================================================================
-- FINORA OS - SUPABASE POSTGRESQL DATABASE SCHEMA (v2)
-- ==============================================================================
-- IMPORTANT: this schema matches the FINORA web app exactly.
--   * IDs are TEXT (the app generates ids like 'usr_xxx', 'acc_xxx', 'tx_xxx')
--   * There are NO foreign keys to auth.users — FINORA profiles are local
--     app profiles, not Supabase Auth users.
--   * RLS uses permissive policies for the anon role because the app talks to
--     Supabase with the project's publishable key from the browser.
--
-- If your project was created with the older v1 schema (UUID ids +
-- auth.users foreign keys), run supabase/migrate_text_ids.sql instead.
-- ==============================================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ACCOUNTS / WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(120) NOT NULL,
    account_type VARCHAR(30) NOT NULL DEFAULT 'CHECKING', -- CASH, CHECKING, SAVINGS, INVESTMENT, OTHER
    balance NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    emergency_fund BOOLEAN NOT NULL DEFAULT FALSE,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RECURRING INCOME SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.income_sources (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, ANNUAL
    next_income_date DATE NOT NULL,
    account_id TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FINANCIAL TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    tx_type VARCHAR(40) NOT NULL, -- INCOME, EXPENSE, TRANSFER, DEBT_PAYMENT, EMI_PAYMENT, GOAL_CONTRIBUTION, INVESTMENT_CONTRIBUTION
    category VARCHAR(80) NOT NULL DEFAULT 'General',
    account_id TEXT,
    related_account_id TEXT,
    tx_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description VARCHAR(240) NOT NULL,
    notes TEXT,
    reference_id TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DEBTS & LIABILITIES TABLE
CREATE TABLE IF NOT EXISTS public.debts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    debt_type VARCHAR(40) NOT NULL DEFAULT 'PERSONAL', -- PERSONAL, FAMILY, FRIEND, BANK_LOAN, CREDIT_CARD, EDUCATION_LOAN, VEHICLE_LOAN, HOME_LOAN, BNPL, OTHER
    original_amount NUMERIC(19, 2) NOT NULL CHECK (original_amount > 0),
    remaining_amount NUMERIC(19, 2) NOT NULL CHECK (remaining_amount >= 0),
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

-- 6. SAVINGS GOALS TABLE
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    target_amount NUMERIC(19, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    monthly_contribution NUMERIC(19, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- CRITICAL, HIGH, MEDIUM, LOW
    notes TEXT,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BILLS & SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Utilities',
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
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

-- 8. BUDGETS TABLE
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    limit_amount NUMERIC(19, 2) NOT NULL CHECK (limit_amount > 0),
    month_key VARCHAR(7) NOT NULL, -- YYYY-MM
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_budget_user UNIQUE(user_id, category, month_key)
);

-- 9. INVESTMENTS TABLE
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

-- 10. AI CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title VARCHAR(160) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT,
    role VARCHAR(20) NOT NULL, -- USER, ASSISTANT, SYSTEM
    content TEXT NOT NULL,
    intent VARCHAR(50),
    tool_trace TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AI STRUCTURED MEMORY
CREATE TABLE IF NOT EXISTS public.ai_memory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    memory_type VARCHAR(40) NOT NULL,
    memory_key VARCHAR(120) NOT NULL,
    memory_value TEXT NOT NULL,
    importance NUMERIC(5, 2) NOT NULL DEFAULT 0.50,
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_memory UNIQUE(user_id, memory_type, memory_key)
);

-- 12. AI SETTINGS
CREATE TABLE IF NOT EXISTS public.ai_settings (
    user_id TEXT PRIMARY KEY,
    memory_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_briefing BOOLEAN NOT NULL DEFAULT TRUE,
    provider_type VARCHAR(40) NOT NULL DEFAULT 'DETERMINISTIC',
    model_name VARCHAR(120),
    endpoint VARCHAR(500),
    response_style VARCHAR(30) NOT NULL DEFAULT 'BALANCED',
    cloud_consent BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. APP SETTINGS & SYNC CHANGELOG
CREATE TABLE IF NOT EXISTS public.app_settings (
    user_id TEXT,
    setting_key VARCHAR(120) NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, setting_key)
);

CREATE TABLE IF NOT EXISTS public.sync_changelog (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    entity_type VARCHAR(60) NOT NULL,
    entity_id TEXT NOT NULL,
    operation VARCHAR(20) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced BOOLEAN NOT NULL DEFAULT FALSE
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user ON public.income_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_tx_user_date ON public.financial_transactions(user_id, tx_date);
CREATE INDEX IF NOT EXISTS idx_tx_account ON public.financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_debts_user ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_user_date ON public.bills(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month_key);
CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON public.ai_memory(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- FINORA is a local-first personal app that talks to Supabase from the browser
-- with the project's publishable key (anon role). Policies are intentionally
-- permissive for that role. If you later adopt Supabase Auth, scope these
-- policies to auth.uid() = user_id instead.
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS finora_public_access ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY finora_public_access ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
      t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', t);
  END LOOP;
END $$;
