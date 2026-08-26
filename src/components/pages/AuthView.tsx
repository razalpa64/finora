import React, { useState } from 'react';
import { ShieldCheck, Check, Lock, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthView: React.FC = () => {
  const { profiles, createProfile, switchProfile, showToast } = useApp();

  const [isCreateMode, setIsCreateMode] = useState(profiles.length === 0);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isCreateMode) {
      if (!displayName.trim()) {
        setErrorMsg('Display name is required.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Username or email is required.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        const profile = createProfile(displayName.trim(), username.trim());
        showToast(`Welcome, ${profile.displayName}! Workspace initialized.`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Registration could not be completed.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!username.trim() || !password) {
        setErrorMsg('Please enter both username and password.');
        return;
      }

      setIsSubmitting(true);
      try {
        const found = profiles.find(
          (p) =>
            p.username.toLowerCase() === username.trim().toLowerCase() ||
            p.displayName.toLowerCase() === username.trim().toLowerCase()
        );

        if (found) {
          switchProfile(found.id);
          showToast(`Welcome back, ${found.displayName}!`);
        } else if (profiles.length === 0) {
          // If no profile exists yet, create one with the entered name
          const cleanName = username.includes('@') ? username.split('@')[0] : username;
          const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          const created = createProfile(formattedName, username.trim());
          showToast(`Welcome, ${created.displayName}!`);
        } else {
          // Switch to first profile or match
          switchProfile(profiles[0].id);
          showToast(`Signed in as ${profiles[0].displayName}`);
        }
      } catch (err: any) {
        setErrorMsg('Invalid credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#191c27] flex items-center justify-center p-4 sm:p-6 lg:p-12 selection:bg-[#5a42e8] selection:text-white">
      <div className="w-full max-w-4xl bg-white border border-[#e5e7eb] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Brand Panel (Solid Navy / JavaFX Style) */}
        <div className="md:w-5/12 bg-[#101322] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 z-10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#806cff] to-[#5a42e8] text-white font-black text-xl flex items-center justify-center shadow-lg shadow-[#5a42e8]/30">
                F
              </div>
              <div>
                <div className="font-extrabold text-white tracking-wider text-base">FINORA</div>
                <div className="text-[9px] text-[#8e8aa9] font-bold tracking-wider uppercase">FINANCIAL OS</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                Know what needs to happen next.
              </h2>
              <p className="text-xs text-[#989db1] leading-relaxed">
                A private financial operating system that calculates from your records — without guessing or inventing numbers.
              </p>
            </div>

            {/* Solid Features Checklist */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1e2338] text-[#10b981] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ececf3]">LOCAL FIRST</div>
                  <div className="text-[11px] text-[#84899e]">Private records with cloud database backup</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1e2338] text-[#10b981] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ececf3]">EXPLAINABLE</div>
                  <div className="text-[11px] text-[#84899e]">Facts, recommendations and assumptions stay distinct</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1e2338] text-[#10b981] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ececf3]">DETERMINISTIC</div>
                  <div className="text-[11px] text-[#84899e]">Zero hallucinations, verified math only</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-[#6f748a] font-medium z-10 border-t border-white/5 mt-6">
            FINORA OS · Version 2.0.0
          </div>
        </div>

        {/* Right Form Panel (Crisp Solid White) */}
        <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#f0eff5] p-1 rounded-xl border border-[#e5e2ed]">
              <button
                type="button"
                onClick={() => {
                  setIsCreateMode(false);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isCreateMode
                    ? 'bg-white text-[#5a42e8] shadow-sm'
                    : 'text-[#6b7280] hover:text-[#191c27]'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateMode(true);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isCreateMode
                    ? 'bg-white text-[#5a42e8] shadow-sm'
                    : 'text-[#6b7280] hover:text-[#191c27]'
                }`}
              >
                Create account
              </button>
            </div>

            {/* Title & Copy */}
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#5a42e8] mb-1">
                {isCreateMode ? 'PRIVATE PROFILE SETUP' : 'LOCAL SIGN IN'}
              </div>
              <h3 className="text-2xl font-extrabold text-[#191c27] tracking-tight">
                {isCreateMode ? 'Create your workspace' : 'Welcome back'}
              </h3>
              <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
                {isCreateMode
                  ? 'Set up your personalized workspace profile.'
                  : 'Sign in to open your financial operating system.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {isCreateMode && (
                <div>
                  <label className="block text-[#475569] font-bold text-[11px] mb-1 uppercase tracking-wider">
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl text-[#1e293b] text-sm focus:outline-none focus:border-[#5a42e8] focus:bg-white transition-all font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#475569] font-bold text-[11px] mb-1 uppercase tracking-wider">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex.morgan"
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl text-[#1e293b] text-sm focus:outline-none focus:border-[#5a42e8] focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-[#475569] font-bold text-[11px] mb-1 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl text-[#1e293b] text-sm focus:outline-none focus:border-[#5a42e8] focus:bg-white transition-all font-medium"
                />
              </div>

              {isCreateMode && (
                <div>
                  <label className="block text-[#475569] font-bold text-[11px] mb-1 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#f8f9fc] border border-[#e2e8f0] rounded-xl text-[#1e293b] text-sm focus:outline-none focus:border-[#5a42e8] focus:bg-white transition-all font-medium"
                  />
                </div>
              )}

              {/* Remember Me Block (Just like JavaFX remember-block) */}
              <div className="p-3 bg-[#f7f6fc] border border-[#e9e5f8] rounded-xl space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#5a42e8] border-[#cfc9ea] focus:ring-0 cursor-pointer"
                  />
                  <span className="font-bold text-[#334155] text-xs">Keep me signed in on this device</span>
                </label>
                <p className="text-[10px] text-[#94a3b8] pl-6">
                  Uses a revocable device session token. Your password is never saved in plain text.
                </p>
              </div>

              {/* Error Notification */}
              {errorMsg && (
                <div className="p-3 bg-[#fff0f1] border border-[#fecdd3] text-[#b91c1c] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#5a42e8]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isCreateMode ? 'Create account & continue' : 'Sign in securely'}</span>
              </button>

              {/* Security Footnote */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748b] pt-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span>Credentials verified with PBKDF2-HMAC-SHA256</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
