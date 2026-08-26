import React, { useEffect, useState } from 'react';

interface LoadingViewProps {
  onComplete?: () => void;
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [step, setStep] = useState(1);
  const [statusText, setStatusText] = useState('Checking local workspace');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStep(2);
      setStatusText('Connecting to central cloud database');
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStep(3);
      setStatusText('Initializing deterministic calculation engines');
    }, 850);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Workspace ready');
      if (onComplete) {
        setTimeout(onComplete, 250);
      }
    }, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f6fa] text-[#191c27] flex items-center justify-center p-4 selection:bg-[#5a42e8] selection:text-white select-none overflow-hidden">
      {/* Background Soft Glow Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#806cff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#5a42e8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center flex flex-col items-center space-y-5 z-10 animate-fade-in">
        {/* Animated F Logo Mark */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#806cff] to-[#5a42e8] text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-[#5a42e8]/30 animate-pulse">
            F
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-widest text-[#101322]">
            FINORA
          </h1>
          <p className="text-[9px] font-extrabold tracking-widest text-[#6f748a] uppercase">
            PERSONAL FINANCIAL OPERATING SYSTEM
          </p>
        </div>

        {/* Offline / Cloud Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span>CENTRAL CLOUD & LOCAL STORAGE</span>
        </div>

        {/* Boot Progress Bar */}
        <div className="w-full max-w-xs h-2 bg-[#e2e8f0] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#806cff] to-[#5a42e8] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Message */}
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#1e293b]">
            {statusText}…
          </div>
          <div className="text-[11px] text-[#64748b]">
            Your records stay private, verifiable and encrypted
          </div>
        </div>

        {/* 3 Step Sequence (Exact JavaFX loading-steps) */}
        <div className="flex items-center justify-center gap-8 pt-3 border-t border-[#e2e8f0]/60 w-full max-w-sm">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                step > 1
                  ? 'bg-[#10b981] text-white'
                  : step === 1
                  ? 'bg-[#5a42e8] text-white ring-4 ring-[#5a42e8]/20'
                  : 'bg-[#e2e8f0] text-[#64748b]'
              }`}
            >
              {step > 1 ? '✓' : '1'}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider ${
                step >= 1 ? 'text-[#101322]' : 'text-[#94a3b8]'
              }`}
            >
              DATABASE
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                step > 2
                  ? 'bg-[#10b981] text-white'
                  : step === 2
                  ? 'bg-[#5a42e8] text-white ring-4 ring-[#5a42e8]/20'
                  : 'bg-[#e2e8f0] text-[#64748b]'
              }`}
            >
              {step > 2 ? '✓' : '2'}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider ${
                step >= 2 ? 'text-[#101322]' : 'text-[#94a3b8]'
              }`}
            >
              SESSION
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                step === 3 && progress === 100
                  ? 'bg-[#10b981] text-white'
                  : step === 3
                  ? 'bg-[#5a42e8] text-white ring-4 ring-[#5a42e8]/20'
                  : 'bg-[#e2e8f0] text-[#64748b]'
              }`}
            >
              {step === 3 && progress === 100 ? '✓' : '3'}
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider ${
                step >= 3 ? 'text-[#101322]' : 'text-[#94a3b8]'
              }`}
            >
              ENGINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
