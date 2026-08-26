import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cloud,
  Wallet,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  Coins,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney, SUPPORTED_CURRENCIES } from '../../services/currency';
import { SUPABASE_SQL_SCHEMA_SCRIPT, testSupabaseConnection } from '../../services/supabase';

export const SettingsPage: React.FC = () => {
  const {
    supabaseConfig,
    updateSupabaseConfig,
    syncToSupabase,
    accounts,
    deleteAccount,
    openQuickAdd,
    currency,
    setCurrency,
    theme,
    setTheme,
    exportBackup,
    importBackup,
    resetToEmptyWorkspace,
    loadDemoData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'supabase' | 'accounts' | 'appearance' | 'backup'>('supabase');

  // Supabase form
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseKey, setSupabaseKey] = useState(supabaseConfig.anonKey || '');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingSupabase(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(res);
    setIsTestingSupabase(false);

    if (res.success) {
      updateSupabaseConfig({
        url: supabaseUrl,
        anonKey: supabaseKey,
        connected: true,
      });
      showToast('Supabase settings saved and verified!');
    }
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    showToast('SQL schema copied to clipboard!');
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora_os_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported successfully');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackup(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 mb-1">
            System Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Settings & Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage cloud Supabase database, asset wallets, backups, and appearance.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto scrollbar-none">
        {[
          { id: 'supabase' as const, label: 'Supabase Cloud Database', icon: Cloud },
          { id: 'accounts' as const, label: 'Accounts & Wallets', icon: Wallet },
          { id: 'appearance' as const, label: 'Currency & Appearance', icon: Sun },
          { id: 'backup' as const, label: 'Backup & Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-xs font-semibold rounded-t-xl border-b-2 transition-all shrink-0
                ${
                  isActive
                    ? 'border-purple-500 text-purple-300 bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SUPABASE CONFIGURATION */}
      {activeTab === 'supabase' && (
        <div className="space-y-5">
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Supabase PostgreSQL Connection</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronize your accounts, transactions, debts, and goals to your own private Supabase project.
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                  supabaseConfig.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${supabaseConfig.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span>{supabaseConfig.connected ? 'Connected' : 'Offline / Standalone'}</span>
              </span>
            </div>

            <form onSubmit={handleSaveSupabase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supabase Project URL</label>
                <input
                  type="url"
                  required
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzprojectid.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supabase Anon Public API Key</label>
                <input
                  type="password"
                  required
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSchemaModalOpen(true)}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>View Supabase SQL Schema</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isTestingSupabase}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
                  >
                    {isTestingSupabase && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Test & Save Connection</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => syncToSupabase()}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sync Now</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Offline-First Architecture</span>
            </div>
            <p className="leading-relaxed">
              FINORA is offline-first: all calculations, transactions, and state changes work instantly in memory and local storage. When you connect Supabase, data is backed up to your PostgreSQL database with Row Level Security (RLS).
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNTS & WALLETS */}
      {activeTab === 'accounts' && (
        <div className="bg-[#131625] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Asset Accounts & Wallets</h3>
              <p className="text-xs text-slate-400">Total balance: {formatMoney(accounts.reduce((a, b) => a + b.balance, 0), currency)}</p>
            </div>
            <button
              onClick={() => openQuickAdd('account')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{a.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-300 uppercase">
                      {a.type}
                    </span>
                    {a.emergencyFund && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Emergency Reserve
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Created on {a.createdAt.split('T')[0]}</div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-white text-base">{formatMoney(a.balance, currency)}</span>
                  <button
                    onClick={() => deleteAccount(a.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Delete account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CURRENCY & APPEARANCE */}
      {activeTab === 'appearance' && (
        <div className="space-y-5">
          {/* Currency selection */}
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Display Currency</h3>
              <p className="text-xs text-slate-400">Select standard currency symbol for formatting values.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    currency === c.code
                      ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md shadow-purple-600/20'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-base font-black text-white">{c.symbol} {c.code}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{c.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme selection */}
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Visual Design Theme</h3>
              <p className="text-xs text-slate-400">Choose between dark fintech, midnight OLED, and daylight themes.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'dark' as const, name: 'Dark Fintech (Default)', desc: 'Slate navy background with purple accents' },
                { id: 'light' as const, name: 'Daylight Light', desc: 'Crisp light fintech interface' },
                { id: 'midnight' as const, name: 'Midnight OLED', desc: 'True pitch black contrast' },
              ].map((th) => (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    theme === th.id
                      ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md shadow-purple-600/20'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="font-bold text-white text-sm">{th.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{th.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKUP & SECURITY */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          <div className="bg-[#131625] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Local Workspace Backup</h3>
              <p className="text-xs text-slate-400">
                Export and restore a full encrypted snapshot of your profiles and records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Restore JSON Backup</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                onClick={loadDemoData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/20 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Sample Workspace</span>
              </button>

              <button
                onClick={resetToEmptyWorkspace}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear & Empty Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Supabase SQL Schema Modal */}
      {isSchemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Supabase PostgreSQL Schema Script</h3>
                <p className="text-xs text-slate-400">Copy and run this in your Supabase SQL Editor.</p>
              </div>
              <button
                onClick={() => setIsSchemaModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 whitespace-pre scrollbar-thin">
              {SUPABASE_SQL_SCHEMA_SCRIPT}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
              <button
                onClick={handleCopySchema}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition-all"
              >
                {copiedSchema ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
