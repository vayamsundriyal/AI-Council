import React, { useState } from 'react';
import { Sparkles, Send, SlidersHorizontal, ArrowRight, CornerDownLeft, RotateCcw } from 'lucide-react';
import { SAMPLE_QUERIES } from '../data/models';
import { DeliberationDepth, DeliberationTone } from '../types';

interface QueryInputProps {
  query: string;
  setQuery: (query: string) => void;
  depth: DeliberationDepth;
  setDepth: (depth: DeliberationDepth) => void;
  tone: DeliberationTone;
  setTone: (tone: DeliberationTone) => void;
  onSubmit: () => void;
  isRunning: boolean;
}

export const QueryInput: React.FC<QueryInputProps> = ({
  query,
  setQuery,
  depth,
  setDepth,
  tone,
  setTone,
  onSubmit,
  isRunning,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (query.trim() && !isRunning) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="council-query-input"
          className="text-sm font-bold text-stone-900 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Submit Query to the Sovereign AI Council</span>
        </label>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-stone-500 hover:text-stone-900 flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Settings' : 'Debate Protocol'}</span>
        </button>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="council-query-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          rows={3}
          placeholder="Ask a question, complex architectural decision, policy debate, or high-stakes scenario for Gemini, ChatGPT, Claude, and Perplexity to thoroughly debate and resolve..."
          className="w-full rounded-xl border border-stone-300 p-3.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm sm:text-base leading-relaxed resize-y min-h-[96px] bg-stone-50/50 focus:bg-white transition-colors"
        />

        <div className="flex items-center justify-between mt-2.5">
          <div className="text-xs text-stone-400 hidden sm:block">
            <span>Press </span>
            <kbd className="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[10px] text-stone-600">
              Ctrl/Cmd + Enter
            </kbd>
            <span> to submit</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {query.length > 0 && !isRunning && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1 transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              id="convene-council-button"
              disabled={!query.trim() || isRunning}
              onClick={onSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                !query.trim() || isRunning
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:from-stone-800 hover:to-stone-700 active:scale-[0.99] ring-1 ring-stone-900'
              }`}
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Council Debating...</span>
                </>
              ) : (
                <>
                  <span>Convene Council</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Debate Protocol Controls */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Deliberation Depth
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => setDepth('quick')}
                className={`py-2 px-2.5 rounded-lg border font-medium text-center transition-all ${
                  depth === 'quick'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold">Express</div>
                <div className="text-[10px] opacity-75">1-Round + Synthesis</div>
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={() => setDepth('thorough')}
                className={`py-2 px-2.5 rounded-lg border font-medium text-center transition-all ${
                  depth === 'thorough'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold">Thorough</div>
                <div className="text-[10px] opacity-75">Cross-Exam (Standard)</div>
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={() => setDepth('deep')}
                className={`py-2 px-2.5 rounded-lg border font-medium text-center transition-all ${
                  depth === 'deep'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold">Deep Dive</div>
                <div className="text-[10px] opacity-75">Multi-Round Rebuttal</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Debate Stance & Tone
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                disabled={isRunning}
                onClick={() => setTone('balanced')}
                className={`py-2 px-2.5 rounded-lg border font-medium text-left transition-all ${
                  tone === 'balanced'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold">Balanced Consensus</div>
                <div className="text-[10px] opacity-75">Constructive synthesis</div>
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={() => setTone('adversarial')}
                className={`py-2 px-2.5 rounded-lg border font-medium text-left transition-all ${
                  tone === 'adversarial'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="font-semibold">Adversarial Test</div>
                <div className="text-[10px] opacity-75">Aggressive stress-testing</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Topics Chips */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <div className="text-xs text-stone-500 font-medium mb-2">
          Or test with high-stakes benchmark questions:
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isRunning}
              onClick={() => setQuery(sample.query)}
              className="text-xs text-left px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-800 transition-colors border border-stone-200/70"
            >
              <span className="font-medium text-stone-900">{sample.title}</span>
              <span className="text-stone-500 ml-1.5 hidden sm:inline text-[11px]">
                ({sample.category})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
