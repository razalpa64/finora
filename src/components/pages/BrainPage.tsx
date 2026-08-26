import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Send,
  Sparkles,
  CheckCircle2,
  Copy,
  RotateCcw,
  Plus,
  Trash2,
  Database,
  Sliders,
  Check,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { processAIRequest } from '../../services/ai';
import { AIMessage } from '../../types';

export const BrainPage: React.FC = () => {
  const {
    brainState,
    conversations,
    messages,
    aiMemory,
    aiSettings,
    addAIMessage,
    createAIConversation,
    deleteAIConversation,
    updateAIMemory,
    deleteAIMemory,
    clearAIMemory,
    updateAISettings,
    currency,
    showToast,
  } = useApp();

  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Memory & Settings modals
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Settings form
  const [settingsProvider, setSettingsProvider] = useState(aiSettings.providerType);
  const [settingsEndpoint, setSettingsEndpoint] = useState(aiSettings.endpoint);
  const [settingsModel, setSettingsModel] = useState(aiSettings.modelName);
  const [settingsStyle, setSettingsStyle] = useState(aiSettings.responseStyle);
  const [settingsMemoryEnabled, setSettingsMemoryEnabled] = useState(aiSettings.memoryEnabled);
  const [settingsDailyBriefing, setSettingsDailyBriefing] = useState(aiSettings.dailyBriefing);
  const [settingsCloudConsent, setSettingsCloudConsent] = useState(aiSettings.cloudConsent);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const activeMessages = messages.filter((m) => m.conversationId === activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isProcessing]);

  const handleCreateNewChat = () => {
    const conv = createAIConversation('Financial Intelligence Session');
    setActiveConversationId(conv.id);
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isProcessing) return;

    let convId = activeConversationId;
    if (!convId) {
      const conv = createAIConversation(q.slice(0, 32));
      convId = conv.id;
      setActiveConversationId(convId);
    }

    addAIMessage(convId, 'user', q);
    setInputQuery('');
    setIsProcessing(true);

    try {
      const res = await processAIRequest(q, brainState, activeMessages, aiSettings, currency);
      addAIMessage(convId, 'assistant', res.text, res.intent, res.toolsUsed);
    } catch (err) {
      console.error(err);
      addAIMessage(
        convId,
        'assistant',
        'Unable to complete calculation from current records. Please check your data and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    showToast('Copied to clipboard');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAISettings({
      providerType: settingsProvider,
      endpoint: settingsEndpoint,
      modelName: settingsModel,
      responseStyle: settingsStyle,
      memoryEnabled: settingsMemoryEnabled,
      dailyBriefing: settingsDailyBriefing,
      cloudConsent: settingsCloudConsent,
    });
    setIsSettingsModalOpen(false);
  };

  const quickPrompts = [
    'What is safe to spend today?',
    'Can I afford ₹15,000 for a purchase?',
    'Who should I pay first?',
    'When will I be debt free?',
    'What if my income drops 20%?',
    'How much should I save this month?',
    'Run a daily briefing from my records',
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-8.5rem)] animate-fade-in pb-4">
      {/* Sidebar: Conversation Threads & Controls (Hidden on small mobile, drawer toggleable) */}
      <div className="hidden lg:flex flex-col w-64 bg-[#131625] border border-white/10 rounded-2xl p-4 shrink-0 justify-between shadow-xl">
        <div className="space-y-3 overflow-hidden flex flex-col flex-1">
          <button
            onClick={handleCreateNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1 pt-2">
            Chat Sessions ({conversations.length})
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {conversations.length === 0 ? (
              <div className="text-center p-4 text-xs text-slate-500">No previous sessions</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                    conv.id === activeConversationId
                      ? 'bg-purple-600/20 text-purple-200 font-semibold border border-purple-500/30'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                  onClick={() => setActiveConversationId(conv.id)}
                >
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAIConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Memory & Privacy Settings Buttons */}
        <div className="border-t border-white/5 pt-3 space-y-2">
          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Memory</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
              {aiMemory.length}
            </span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Privacy & Model</span>
            </div>
            <span className="text-[10px] text-slate-500">{aiSettings.providerType}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#131625] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between bg-[#151928]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">FINORA Brain AI</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Tool-First Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Calculates before explaining · Never hallucinates financial balances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMemoryModalOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-white/5"
              title="AI Memory"
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg bg-white/5"
              title="AI Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {activeMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-8 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-600/20">
                <Sparkles className="w-7 h-7 animate-pulse-subtle" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Ask with confidence. I calculate before I explain.</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  I read your current FINORA records through restricted tools, calculate deterministic answers, explain trade-offs, and tell you exactly what data is missing.
                </p>
              </div>

              {/* Quick suggestion prompt chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendQuery(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-purple-600/20 text-slate-300 hover:text-purple-200 border border-white/5 hover:border-purple-500/30 text-xs transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeMessages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {isUser ? (
                    <div className="max-w-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md text-xs sm:text-sm font-medium leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-2xl bg-[#171b2d] border border-white/10 p-5 rounded-2xl rounded-tl-sm shadow-xl space-y-3 text-xs sm:text-sm text-slate-200">
                      {/* Meta header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                            {msg.intent ? msg.intent.replace(/_/g, ' ') : 'FINORA Brain'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.verified && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> VERIFIED
                            </span>
                          )}
                          <button
                            onClick={() => handleCopyText(msg.content, index)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
                            title="Copy response"
                          >
                            {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Rendered content */}
                      <div className="space-y-2 whitespace-pre-wrap leading-relaxed font-sans">
                        {msg.content}
                      </div>

                      {/* Tool trace footer */}
                      {msg.toolTrace && msg.toolTrace.length > 0 && (
                        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          <span className="font-bold text-slate-500">Tools:</span>
                          {msg.toolTrace.map((tool, ti) => (
                            <span key={ti} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-purple-300 font-mono">
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-[#171b2d] border border-white/10 p-4 rounded-2xl rounded-tl-sm text-xs text-purple-300 flex items-center gap-3 animate-pulse">
                <Brain className="w-4 h-4 text-purple-400 animate-spin" />
                <span>Running verified financial tools and analyzing records…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-3 sm:p-4 bg-[#151928] border-t border-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-purple-500 focus-within:bg-white/[0.08] transition-all"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about safe spending, affordability, debt order, or forecasts…"
              className="w-full bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isProcessing}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* AI Memory Manager Modal */}
      {isMemoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Structured AI Memory</h3>
                <p className="text-xs text-slate-400">Explicit user preferences that guide reasoning.</p>
              </div>
              <button
                onClick={() => setIsMemoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {aiMemory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No saved memories.</div>
              ) : (
                aiMemory.map((mem) => (
                  <div key={mem.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-300 uppercase text-[10px]">{mem.key}</span>
                      <button
                        onClick={() => deleteAIMemory(mem.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs"
                      >
                        Forget
                      </button>
                    </div>
                    <input
                      type="text"
                      defaultValue={mem.value}
                      onBlur={(e) => updateAIMemory(mem.id, e.target.value)}
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between">
              <button
                onClick={clearAIMemory}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Clear All Memory
              </button>
              <button
                onClick={() => setIsMemoryModalOpen(false)}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#131726] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">AI Provider & Privacy</h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure deterministic fallback, local Ollama, or llama.cpp endpoints.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Type</label>
                <select
                  value={settingsProvider}
                  onChange={(e) => setSettingsProvider(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="DETERMINISTIC" className="bg-[#131726]">Deterministic Fallback (Built-in)</option>
                  <option value="OLLAMA" className="bg-[#131726]">Local Ollama</option>
                  <option value="LLAMA_CPP" className="bg-[#131726]">Local llama.cpp / GGUF</option>
                  <option value="CLOUD" className="bg-[#131726]">Cloud Provider (Requires Consent)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Local Endpoint URL</label>
                <input
                  type="text"
                  value={settingsEndpoint}
                  onChange={(e) => setSettingsEndpoint(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Model Name</label>
                <input
                  type="text"
                  value={settingsModel}
                  onChange={(e) => setSettingsModel(e.target.value)}
                  placeholder="llama3.2:3b"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsMemoryEnabled}
                    onChange={(e) => setSettingsMemoryEnabled(e.target.checked)}
                    className="rounded border-white/10 text-purple-600 focus:ring-0"
                  />
                  <span>Enable structured user memory</span>
                </label>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsDailyBriefing}
                    onChange={(e) => setSettingsDailyBriefing(e.target.checked)}
                    className="rounded border-white/10 text-purple-600 focus:ring-0"
                  />
                  <span>Enable daily briefing prompts</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
