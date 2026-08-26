import React from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../services/currency';

export const BrainPage: React.FC = () => {
  const { brainState, healthScore, cashFlow, budgetAnalysis, currency } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              FINORA Brain Intelligence
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#f3f1fc] text-[#5a42e8] border border-[#d8d3f8]">
              Deterministic AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6b7280] mt-0.5">
            Rule-based financial advisory engine with 10 real-time optimization formulas.
          </p>
        </div>
      </div>

      {/* Intelligence Health Summary Banner */}
      <div className="bg-gradient-to-r from-[#101322] to-[#1e2338] text-white rounded-2xl p-6 shadow-md border border-[#2d334d]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#a594fd] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Advisory Diagnostic</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {healthScore.status} — {healthScore.score}/100 Grade {healthScore.grade}
            </h2>
            <p className="text-xs text-[#94a3b8] max-w-xl leading-relaxed">
              Based on your active income of {formatCurrency(cashFlow.totalIncome, currency)} and monthly expenses of {formatCurrency(cashFlow.totalExpenses, currency)}, FINORA Brain has evaluated your liquidity runway, budget ratios, and debt exposure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-xl bg-[#16192e] border border-[#2d334d] text-center">
              <div className="text-2xl font-black text-[#10b981]">
                {cashFlow.savingsRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">
                Savings Rate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#16192e] border border-[#2d334d] text-center">
              <div className="text-2xl font-black text-[#a594fd]">
                {brainState.recommendations.length}
              </div>
              <div className="text-[10px] text-[#94a3b8] font-semibold mt-0.5">
                Active Signals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">
          Active Recommendations & Signals
        </h3>

        {brainState.recommendations.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-12 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#111827]">
              All Financial Diagnostics Healthy
            </h4>
            <p className="text-xs text-[#6b7280] mt-1 max-w-md mx-auto">
              No anomalies, high debt ratios, or liquidity deficits detected in your active records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brainState.recommendations.map((rec, i) => {
              const isCrit = rec.severity === 'CRITICAL' || rec.severity === 'WARNING';
              const isAttn = rec.severity === 'ATTENTION';

              return (
                <div
                  key={i}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                    isCrit
                      ? 'border-[#fecdd3]'
                      : isAttn
                      ? 'border-[#fef3c7]'
                      : 'border-[#dcfce7]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCrit
                            ? 'bg-[#fee2e2] text-[#dc2626]'
                            : isAttn
                            ? 'bg-[#fef3c7] text-[#d97706]'
                            : 'bg-[#dcfce7] text-[#16a34a]'
                        }`}
                      >
                        {rec.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-[#6b7280] uppercase">
                        {rec.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-[#111827]">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-[#4b5563] mt-1.5 leading-relaxed">
                      {rec.message}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f3f4f6] text-[11px] text-[#6b7280] italic flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#5a42e8] shrink-0" />
                    <span>{rec.fact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
