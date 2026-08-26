import React, { useState } from 'react';
import {
  Settings,
  Cloud,
  Database,
  User,
  Shield,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../../services/currency';

export const SettingsPage: React.FC = () => {
  const {
    currentProfile,
    currency,
    setCurrency,
    supabaseConfig,
    setSupabaseConfig,
    syncToSupabase,
    loadFromSupabase,
    addToast,
    logout,
  } = useApp();

  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
      autoSync: true,
    });
    addToast({
      title: 'Supabase Configured',
      message: 'Supabase credentials saved successfully.',
      type: 'SUCCESS',
    });
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncToSupabase();
    setIsSyncing(false);
  };

  const sqlSchemaText = `-- FINORA Supabase Schema
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  email text not null,
  name text not null,
  currency text default 'USD',
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  amount numeric not null,
  category text not null,
  type text not null,
  budget_category text,
  description text,
  date text not null,
  created_at timestamptz default now()
);

create table if not exists income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  amount numeric not null,
  type text not null,
  frequency text not null,
  is_guaranteed boolean default true,
  notes text,
  created_at timestamptz default now()
);

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  current_balance numeric not null,
  interest_rate numeric not null,
  minimum_payment numeric not null,
  category text not null,
  due_date_day integer default 1,
  created_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  target_date text,
  category text not null,
  priority text not null,
  created_at timestamptz default now()
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          Settings & Cloud Synchronization
        </h1>
        <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
          Configure Supabase PostgreSQL connection, authentication, default currency, and profile preferences.
        </p>
      </div>

      {/* Supabase Cloud Connection Settings */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">
                Supabase Database Engine
              </h2>
              <p className="text-xs text-[#6b7280]">
                Connected directly to your Supabase project instance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              Cloud Sync Ready
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#374151] mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              required
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3.5 py-2 text-xs font-mono border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#374151] mb-1">
              Supabase Publishable / Anon Key
            </label>
            <input
              type="password"
              required
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="sb_publishable_... or anon JWT key"
              className="w-full px-3.5 py-2 text-xs font-mono border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Pushing to Supabase…' : 'Force Sync Now'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#5a42e8] text-white rounded-xl hover:bg-[#4a34db] transition-colors"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>

      {/* Preferences: Currency & Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Switcher */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-[#111827]">
              Default Display Currency
            </h2>
          </div>

          <p className="text-xs text-[#6b7280] mb-4">
            Select the currency symbol and format applied across all calculators and tables.
          </p>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold border border-[#d1d5db] rounded-xl bg-white focus:border-[#5a42e8] outline-none"
          >
            {Object.values(SUPPORTED_CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} — {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        {/* Current User Info */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-[#111827]">
              Current Account
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Account Name:</span>
              <span className="font-bold text-[#111827]">{currentProfile?.name || 'Local User'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#f3f4f6]">
              <span className="text-[#6b7280]">Email:</span>
              <span className="font-bold text-[#111827]">{currentProfile?.email || 'user@finora.app'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#6b7280]">Profile ID:</span>
              <span className="font-mono text-[11px] text-[#6b7280]">{currentProfile?.id || 'default-user'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-4 w-full py-2 text-xs font-bold text-[#dc2626] bg-[#fee2e2] hover:bg-[#fecaca] rounded-xl transition-colors"
          >
            Sign Out of Profile
          </button>
        </div>
      </div>

      {/* SQL Schema Viewer */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#111827]">
                PostgreSQL Schema Reference
              </h2>
              <p className="text-xs text-[#6b7280]">
                SQL DDL tables configured for your Supabase SQL Editor.
              </p>
            </div>
          </div>

          <button
            onClick={copySql}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#374151] flex items-center gap-1.5 transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>

        <pre className="p-4 bg-[#101322] text-[#e2e8f0] rounded-xl text-xs font-mono overflow-x-auto max-h-64 scrollbar-thin">
          {sqlSchemaText}
        </pre>
      </div>
    </div>
  );
};
