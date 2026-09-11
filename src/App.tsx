/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CouncilStage } from './components/CouncilStage';
import { QueryInput } from './components/QueryInput';
import { DeliberationFeed } from './components/DeliberationFeed';
import { ConsensusReportView } from './components/ConsensusReportView';
import { DeliberationHistoryModal } from './components/DeliberationHistoryModal';
import {
  DeliberationSession,
  DeliberationDepth,
  DeliberationTone,
  ModelId,
  DeliberationMessage,
  ConsensusReport,
} from './types';
import {
  MessageSquare,
  Award,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Columns,
  Maximize2,
} from 'lucide-react';

const STORAGE_KEY = 'ai_council_sessions_v1';

export default function App() {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<DeliberationDepth>('thorough');
  const [tone, setTone] = useState<DeliberationTone>('balanced');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentSession, setCurrentSession] = useState<DeliberationSession>({
    id: 'init',
    query: '',
    depth: 'thorough',
    tone: 'balanced',
    createdAt: Date.now(),
    status: 'idle',
    currentStage: 'Council In Recess',
    progressPercentage: 0,
    messages: [],
  });

  const [savedSessions, setSavedSessions] = useState<DeliberationSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState<ModelId | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'report' | 'debate'>('both');

  const reportRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load saved sessions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedSessions(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load sessions from localStorage', e);
    }
  }, []);

  // Save completed sessions to localStorage
  const saveSessionToHistory = (session: DeliberationSession) => {
    if (!session.report || session.messages.length === 0) return;
    setSavedSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== session.id);
      const updated = [session, ...filtered].slice(0, 30); // keep up to 30
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save session to localStorage', e);
      }
      return updated;
    });
  };

  const handleStartDeliberation = async () => {
    if (!query.trim() || isRunning) return;

    setError(null);
    setIsRunning(true);
    setSelectedModelFilter(null);

    const newSessionId = `session-${Date.now()}`;
    const initialSession: DeliberationSession = {
      id: newSessionId,
      query: query.trim(),
      depth,
      tone,
      createdAt: Date.now(),
      status: 'running',
      currentStage: 'Convening the Council',
      currentActiveModel: 'synthesizer',
      progressPercentage: 5,
      messages: [],
    };

    setCurrentSession(initialSession);

    // Abort previous if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/deliberate/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          depth,
          tone,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      let sessionAccumulator: DeliberationSession = { ...initialSession };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEventType = 'message';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEventType = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const rawData = line.replace('data:', '').trim();
            if (!rawData) continue;

            try {
              const data = JSON.parse(rawData);

              if (currentEventType === 'status') {
                sessionAccumulator = {
                  ...sessionAccumulator,
                  currentStage: data.stage || sessionAccumulator.currentStage,
                  currentActiveModel: data.activeModel || sessionAccumulator.currentActiveModel,
                  progressPercentage:
                    data.progress !== undefined
                      ? data.progress
                      : sessionAccumulator.progressPercentage,
                };
                setCurrentSession({ ...sessionAccumulator });
              } else if (currentEventType === 'message') {
                const newMsg: DeliberationMessage = data;
                sessionAccumulator = {
                  ...sessionAccumulator,
                  messages: [...sessionAccumulator.messages, newMsg],
                  currentActiveModel: newMsg.modelId,
                };
                setCurrentSession({ ...sessionAccumulator });
              } else if (currentEventType === 'report') {
                const report: ConsensusReport = data;
                sessionAccumulator = {
                  ...sessionAccumulator,
                  report,
                  progressPercentage: 100,
                  currentStage: 'Consensus Reached',
                  currentActiveModel: undefined,
                  status: 'completed',
                };
                setCurrentSession({ ...sessionAccumulator });
                saveSessionToHistory(sessionAccumulator);

                // Auto-scroll to report smoothly
                setTimeout(() => {
                  reportRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              } else if (currentEventType === 'error') {
                setError(data.error || 'Deliberation encounter an error');
              } else if (currentEventType === 'done') {
                sessionAccumulator.status = 'completed';
                sessionAccumulator.progressPercentage = 100;
                sessionAccumulator.currentStage = 'Deliberation Complete';
                sessionAccumulator.currentActiveModel = undefined;
                setCurrentSession({ ...sessionAccumulator });
              }
            } catch (err) {
              console.error('Error parsing SSE event data:', err);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Deliberation error:', err);
        setError(err.message || 'Failed to complete council deliberation.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectHistorySession = (session: DeliberationSession) => {
    setCurrentSession(session);
    setQuery(session.query);
    setDepth(session.depth || 'thorough');
    setTone(session.tone || 'balanced');
  };

  const handleDeleteHistorySession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    setSavedSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900">
      {/* Header */}
      <Header
        activeModel={currentSession.currentActiveModel}
        isRunning={isRunning}
        onOpenHistory={() => setHistoryOpen(true)}
        savedCount={savedSessions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-bold">Deliberation Alert: </span>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Chamber Stage (The 4 Seats & Live Status) */}
        <CouncilStage
          currentStage={currentSession.currentStage}
          activeModel={currentSession.currentActiveModel}
          progressPercentage={currentSession.progressPercentage}
          isRunning={isRunning}
          onSelectModelFilter={setSelectedModelFilter}
          selectedModelFilter={selectedModelFilter}
        />

        {/* Query Input Section */}
        <QueryInput
          query={query}
          setQuery={setQuery}
          depth={depth}
          setDepth={setDepth}
          tone={tone}
          setTone={setTone}
          onSubmit={handleStartDeliberation}
          isRunning={isRunning}
        />

        {/* Results / Deliberation View Controls */}
        {(currentSession.messages.length > 0 || currentSession.report) && (
          <div className="space-y-6">
            {/* View Mode Tabs */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1">
                  Chamber Output:
                </span>
                <div className="flex bg-stone-200/80 p-1 rounded-xl text-xs font-medium text-stone-700">
                  <button
                    onClick={() => setActiveTab('both')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'both'
                        ? 'bg-white text-stone-900 font-bold shadow-xs'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split Chamber</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'report'
                        ? 'bg-white text-stone-900 font-bold shadow-xs'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Consensus Report</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('debate')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      activeTab === 'debate'
                        ? 'bg-white text-stone-900 font-bold shadow-xs'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Debate Transcript ({currentSession.messages.length})</span>
                  </button>
                </div>
              </div>

              {currentSession.report && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>
                    Consensus Alignment: <strong>{currentSession.report.confidenceScore}%</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Split or Single Layout */}
            {activeTab === 'both' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Live Transcript of the Deliberation */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span>Live Debate Transcript</span>
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">
                      {currentSession.messages.length} interventions
                    </span>
                  </div>
                  <DeliberationFeed
                    messages={currentSession.messages}
                    selectedModelFilter={selectedModelFilter}
                    onSelectModelFilter={setSelectedModelFilter}
                    isRunning={isRunning}
                  />
                </div>

                {/* Right Column: Master Consensus Synthesis */}
                <div className="lg:col-span-6 space-y-4" ref={reportRef}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>The Sovereign Final Report</span>
                    </h3>
                    {isRunning && !currentSession.report && (
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Synthesizing...
                      </span>
                    )}
                  </div>

                  {currentSession.report ? (
                    <ConsensusReportView
                      report={currentSession.report}
                      query={currentSession.query}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center shadow-xs flex flex-col items-center justify-center min-h-[360px]">
                      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3 border border-stone-200 animate-pulse">
                        <Award className="w-7 h-7 text-stone-400" />
                      </div>
                      <h4 className="text-base font-bold text-stone-900 mb-1">
                        Report Under Deliberation
                      </h4>
                      <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                        Gemini, ChatGPT, Claude, and Perplexity are currently cross-examining stances. The final synthesized verdict will materialize once peer consensus is forged.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'report' && (
              <div ref={reportRef}>
                {currentSession.report ? (
                  <ConsensusReportView
                    report={currentSession.report}
                    query={currentSession.query}
                  />
                ) : (
                  <div className="bg-white rounded-2xl p-12 border border-stone-200 text-center shadow-xs">
                    <Award className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-stone-900">
                      Synthesis Not Ready
                    </h4>
                    <p className="text-sm text-stone-500 mt-1">
                      The Council is currently debating. Switch to the Debate Transcript to watch the models deliberate.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'debate' && (
              <div className="max-w-4xl mx-auto">
                <DeliberationFeed
                  messages={currentSession.messages}
                  selectedModelFilter={selectedModelFilter}
                  onSelectModelFilter={setSelectedModelFilter}
                  isRunning={isRunning}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Deliberation History Modal */}
      <DeliberationHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={savedSessions}
        onSelectSession={handleSelectHistorySession}
        onDeleteSession={handleDeleteHistorySession}
        onClearAll={handleClearAllHistory}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            AI Council &bull; Multi-model consensus deliberation engine powered by Google Gemini.
          </p>
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <span>Gemini (Google)</span>
            <span>&bull;</span>
            <span>ChatGPT (OpenAI)</span>
            <span>&bull;</span>
            <span>Claude (Anthropic)</span>
            <span>&bull;</span>
            <span>Perplexity (Perplexity AI)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
