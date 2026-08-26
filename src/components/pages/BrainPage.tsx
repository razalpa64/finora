import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askFinoraBrain } from '../../services/brain';
import { BrainResponse } from '../../types';

export const BrainPage: React.FC = () => {
  const { brainState, currency, healthScore, cashFlow } = useApp();

  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Array<{ q: string; response: BrainResponse }>>([
    {
      q: 'What is safe to spend today?',
      response: askFinoraBrain('What is safe to spend today?', brainState, currency),
    },
  ]);

  const handleAsk = (queryText: string) => {
    if (!queryText.trim()) return;
    const res = askFinoraBrain(queryText.trim(), brainState, currency);
    setHistory((prev) => [{ q: queryText.trim(), response: res }, ...prev]);
    setQuestion('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(question);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e7eb] pb-4">
        <div>
          <div className="text-[10px] font-extrabold text-[#5a42e8] uppercase tracking-wider">
            DECISION INTELLIGENCE
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
            FINORA Brain AI
          </h1>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Deterministic rule-based reasoning engine. Zero hallucinations, verifiable mathematical steps only.
          </p>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f3f1fc] text-[#5a42e8] border border-[#e9e5f8] self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic AI Core</span>
        </span>
      </div>

      {/* Query Bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a financial question: e.g. 'Can I afford $250?' or 'Who should I pay first?'"
            className="flex-1 px-4 py-2.5 text-xs font-medium border border-[#d1d5db] rounded-xl focus:border-[#5a42e8] focus:ring-1 focus:ring-[#5a42e8] outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-br from-[#765df1] to-[#6045df] hover:bg-[#6349e4] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Brain</span>
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-[#64748b] uppercase mr-1">Suggested:</span>
          {[
            'What is safe to spend today?',
            'Who should I pay first?',
            'Can I afford $500?',
            'How much should I save this month?',
            'What if my income drops 20%?',
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(preset)}
              className="px-2.5 py-1 rounded-lg bg-[#f8fafc] hover:bg-[#f3f1fc] text-[#374151] hover:text-[#5a42e8] border border-[#e2e8f0] text-[11px] font-medium transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Verifiable Answers Feed */}
      <div className="space-y-5">
        {history.map((item, index) => {
          const res = item.response;
          const isCrit = res.severity === 'CRITICAL' || res.severity === 'WARNING';
          const isAttn = res.severity === 'ATTENTION';

          return (
            <div
              key={index}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in"
            >
              {/* Query Header */}
              <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#5a42e8] text-white flex items-center justify-center font-bold text-xs">
                    Q
                  </div>
                  <h3 className="text-sm font-extrabold text-[#111827]">
                    "{item.q}"
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    isCrit
                      ? 'bg-[#fee2e2] text-[#dc2626]'
                      : isAttn
                      ? 'bg-[#fef3c7] text-[#d97706]'
                      : 'bg-[#ecfdf5] text-[#059669]'
                  }`}
                >
                  {res.severity} · VERIFIED
                </span>
              </div>

              {/* Headline & Summary */}
              <div>
                <div className="text-lg font-black text-[#111827]">
                  {res.headline}
                </div>
                <p className="text-xs text-[#4b5563] mt-1 leading-relaxed">
                  {res.summary}
                </p>
              </div>

              {/* Exact Mathematical Calculation Steps */}
              {res.calculations && res.calculations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                  <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                    CALCULATION STEPS
                  </div>
                  <div className="space-y-1 text-xs font-mono text-[#1e293b]">
                    {res.calculations.map((calc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[#5a42e8] font-bold">›</span>
                        <span>{calc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations & Assumptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                {res.recommendations && res.recommendations.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#dcfce7] space-y-1">
                    <div className="text-[10px] font-bold text-[#166534] uppercase tracking-wider">
                      RECOMMENDED ACTION
                    </div>
                    {res.recommendations.map((rec, i) => (
                      <div key={i} className="text-[#15803d]">
                        {rec}
                      </div>
                    ))}
                  </div>
                )}

                {res.assumptions && res.assumptions.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] space-y-1">
                    <div className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
                      STATED ASSUMPTIONS
                    </div>
                    {res.assumptions.map((ass, i) => (
                      <div key={i} className="text-[#4b5563] italic">
                        {ass}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
