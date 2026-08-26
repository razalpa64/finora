import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'SUCCESS' || toast.type === 'success';
        const isError = toast.type === 'ERROR' || toast.type === 'error';
        const isWarning = toast.type === 'WARNING' || toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border pointer-events-auto
              animate-slide-up transition-all text-xs font-semibold bg-white
              ${
                isSuccess
                  ? 'text-[#065f46] border-[#a7f3d0] bg-[#f0fdf4]'
                  : isError
                  ? 'text-[#991b1b] border-[#fecdd3] bg-[#fff1f2]'
                  : isWarning
                  ? 'text-[#92400e] border-[#fde68a] bg-[#fffbeb]'
                  : 'text-[#334155] border-[#e2e8f0] bg-white'
              }
            `}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />}
            {isError && <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />}
            {isWarning && <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />}
            {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-[#5a42e8] shrink-0" />}
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
