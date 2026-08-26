import React, { useState } from 'react';
import {
  Settings,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Globe,
  User,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_CURRENCIES } from '../../services/currency';

export const SettingsPage: React.FC = () => {
  const {
    currentProfile,
    currency,
    setCurrency,
    syncToSupabase,
    loadFromSupabase,
    exportBackup,
    importBackup,
    addToast,
    logout,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState<string>('Live real-time sync active');

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const ok = await syncToSupabase();
      if (ok) {
        setLastSyncText(`Last synchronized just now (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
      }
    } catch (e) {
      // Handled in context
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    const json = exportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast({
      message: 'Workspace backup exported successfully.',
      type: 'SUCCESS',
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackup(content);
        if (success) {
          addToast({
            message: 'Workspace restored from backup.',
            type: 'SUCCESS',
          });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          System Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
          Manage your account profile, display currency, cloud synchronization, and offline workspace backups.
        </p>
      </div>

      {/* Central Cloud Sync Status Card (Clean, no editable credentials required) */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f4f6] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center border border-[#a7f3d0]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#111827]">
                  Cloud Database & Synchronization
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  Active
                </span>
              </div>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Centralized PostgreSQL database for automated backup and multi-device persistence.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#5a42e8] text-white hover:bg-[#4a34db] active:scale-95 flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing…' : 'Sync Now'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Sync Mode</div>
            <div className="text-xs font-extrabold text-[#111827] mt-1">Automatic Background Sync</div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">Records sync on every change</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Data Privacy</div>
            <div className="text-xs font-extrabold text-[#111827] mt-1">Row-Level Security (RLS)</div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">Partitioned per user profile</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">Status</div>
            <div className="text-xs font-extrabold text-[#059669] mt-1">{lastSyncText}</div>
            <div className="text-[10px] text-[#6b7280] mt-0.5">Offline-first local cache ready</div>
          </div>
        </div>
      </div>

      {/* User Account & Currency Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Profile Card */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-[#f3f4f6] pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#111827]">
                Active Profile Information
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#f9fafb]">
                <span className="text-[#6b7280]">Display Name:</span>
                <span className="font-bold text-[#111827]">{currentProfile?.displayName || 'Active User'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#f9fafb]">
                <span className="text-[#6b7280]">Username / Email:</span>
                <span className="font-bold text-[#111827]">{currentProfile?.username || 'user'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6b7280]">Account Created:</span>
                <span className="text-[#4b5563] font-medium">
                  {currentProfile?.createdAt ? new Date(currentProfile.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-[#f3f4f6]">
            <button
              onClick={logout}
              className="w-full py-2 text-xs font-bold text-[#b91c1c] bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded-xl transition-colors cursor-pointer"
            >
              Log Out of This Device
            </button>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4 border-b border-[#f3f4f6] pb-3">
              <div className="w-8 h-8 rounded-xl bg-[#f3f1fc] text-[#5a42e8] flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#111827]">
                Display Currency
              </h2>
            </div>

            <p className="text-xs text-[#6b7280] mb-4 leading-relaxed">
              Select your primary currency. All income, expenses, debts, and mathematical models will dynamically format using this currency.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-[#374151] mb-1 uppercase tracking-wider">
                Select Active Currency
              </label>
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
          </div>

          <div className="pt-4 text-[11px] text-[#6b7280] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Format updates immediately across all calculators</span>
          </div>
        </div>
      </div>

      {/* Offline Backup & Restore Card */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3 border-b border-[#f3f4f6] pb-3">
          <div className="w-8 h-8 rounded-xl bg-[#f8fafc] text-[#475569] flex items-center justify-center border border-[#e2e8f0]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#111827]">
              Workspace Snapshot Backup & Restore
            </h2>
            <p className="text-xs text-[#6b7280]">
              Download an offline JSON snapshot of all your local records or restore from a previous export.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Export Snapshot (.json)</span>
          </button>

          <label className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-[#d1d5db] text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Restore Snapshot</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
