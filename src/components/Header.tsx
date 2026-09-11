import React from 'react';
import { Sparkles, Users, History, CheckCircle2 } from 'lucide-react';
import { MODELS } from '../data/models';
import { ModelId } from '../types';

interface HeaderProps {
  activeModel?: ModelId | 'synthesizer';
  isRunning: boolean;
  onOpenHistory: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeModel,
  isRunning,
  onOpenHistory,
  savedCount,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-700 flex items-center justify-center text-white shadow-sm ring-1 ring-stone-900/10">
            <Users className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                AI Council Deliberation
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                4-Model Consensus
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden md:block">
              Gemini &bull; ChatGPT &bull; Claude &bull; Perplexity
            </p>
          </div>
        </div>

        {/* Center: Live Member Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200/80 text-xs">
          <span className="text-stone-500 font-medium mr-1">Chamber:</span>
          {Object.values(MODELS).map((model) => {
            const isActive = activeModel === model.id;
            return (
              <div
                key={model.id}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${
                  isActive
                    ? `${model.bgLight} ${model.textColor} font-semibold ring-1 ${model.borderColor} shadow-xs animate-pulse`
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={`${model.name} (${model.creator}) - ${model.role}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-amber-500 animate-ping' : 'bg-stone-300'
                  }`}
                />
                <span>{model.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Council Deliberating</span>
            </div>
          )}

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 bg-stone-50 hover:bg-stone-100 hover:text-stone-900 transition-colors text-xs font-medium"
            title="View past deliberations"
            id="open-history-button"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span>History</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
