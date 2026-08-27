-- =============================================================================
-- FINORA OS - ONE-TIME MIGRATION: match the cloud schema to the app
-- =============================================================================
-- WHY THIS EXISTS
--   The app generates ids like 'usr_xxx', 'acc_xxx', 'tx_xxx' (text), and its
--   profiles are local profiles — NOT Supabase Auth users. The original schema
--   used UUID columns plus foreign keys to auth.users(id), and RLS policies
--   based on auth.uid(). With the publishable (anon) key that meant:
--     * every INSERT failed with 'invalid input syntax for type uuid'
--     * even valid UUIDs violated the auth.users foreign key
--     * RLS blocked every read/write for the anon role
--   So nothing ever reached the database.
--
-- WHAT THIS DOES
--   1. Drops the foreign keys inside the public schema (incl. auth.users refs)
--   2. Converts id/reference columns from UUID to TEXT
--   3. Adds last_login_at to profiles
--   4. Replaces RLS policies with permissive ones for the anon role (which is
--      what the publishable key maps to) and authenticated
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> paste this file -> Run.
--   Safe to re-run (idempotent).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Drop all foreign key constraints in the public schema
--    (auth.users references + internal table references)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conrelid::regclass AS tbl, conname AS name
    FROM pg_constraint
    WHERE contype = 'f'
      AND connamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT IF EXISTS %I', r.tbl, r.name);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Convert UUID id/reference columns to TEXT (matches app-generated ids)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type = 'uuid'
      AND column_name IN (
        'id', 'user_id', 'account_id', 'related_account_id',
        'reference_id', 'conversation_id', 'entity_id'
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN %I TYPE text USING %I::text',
      r.table_name, r.column_name, r.column_name
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. profiles: track last login (used by the app profile model)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. RLS + permissive policies for the anon role (publishable key) and
--    authenticated role, plus explicit grants.
--
--    NOTE: this project is a personal, local-first app that ships its
--    publishable key in the frontend bundle by design (central personal
--    database). These policies intentionally allow full read/write to that
--    key. If you later add Supabase Auth, replace these with user-scoped
--    policies.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 5. Verification: every public table should list the finora_public_access
--    policy, and id columns should now be of type text.
-- ---------------------------------------------------------------------------
SELECT c.table_name,
       c.column_name,
       c.data_type,
       p.policyname
FROM information_schema.columns c
JOIN pg_tables t ON t.tablename = c.table_name AND t.schemaname = 'public'
LEFT JOIN pg_policies p ON p.tablename = c.table_name AND p.policyname = 'finora_public_access'
WHERE c.table_schema = 'public' AND c.column_name IN ('id', 'user_id')
ORDER BY c.table_name, c.column_name;
