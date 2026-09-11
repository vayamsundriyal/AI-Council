import React from 'react';
import { ModelId } from '../types';
import { MODELS } from '../data/models';
import { Bot, CheckCircle2, Flame, Layers, Search, ShieldCheck, Sparkles, MessageSquareQuote } from 'lucide-react';

interface CouncilStageProps {
  currentStage: string;
  activeModel?: ModelId | 'synthesizer';
  progressPercentage: number;
  isRunning: boolean;
  onSelectModelFilter?: (modelId: ModelId | null) => void;
  selectedModelFilter?: ModelId | null;
}

export const CouncilStage: React.FC<CouncilStageProps> = ({
  currentStage,
  activeModel,
  progressPercentage,
  isRunning,
  onSelectModelFilter,
  selectedModelFilter,
}) => {
  const getModelIcon = (id: ModelId) => {
    switch (id) {
      case 'gemini':
        return <Layers className="w-4 h-4" />;
      case 'chatgpt':
        return <Bot className="w-4 h-4" />;
      case 'claude':
        return <ShieldCheck className="w-4 h-4" />;
      case 'perplexity':
        return <Search className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-6 shadow-md border border-stone-800 relative overflow-hidden">
      {/* Subtle background ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar: Stage status & progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-semibold text-stone-400">
                Council Status
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              {currentStage || 'Awaiting Next Query'}
            </h2>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5 font-mono">
              <span>Deliberation Progress</span>
              <span className="font-semibold text-amber-400">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden p-0.5 ring-1 ring-stone-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, progressPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* The 4 Council Seats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(MODELS).map((model) => {
            const isSpeaking = activeModel === model.id;
            const isSelected = selectedModelFilter === model.id;

            return (
              <div
                key={model.id}
                onClick={() => onSelectModelFilter && onSelectModelFilter(isSelected ? null : model.id)}
                className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-stone-800 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30 -translate-y-0.5'
                    : isSelected
                    ? 'bg-stone-800/90 border-stone-600 ring-1 ring-stone-400'
                    : 'bg-stone-850/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
                }`}
              >
                {/* Active Speaking Indicator */}
                {isSpeaking && (
                  <div className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] tracking-wide flex items-center gap-1 shadow-xs">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>DELIBERATING</span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Icon Avatar */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                      isSpeaking ? 'scale-110' : 'group-hover:scale-105'
                    } ${model.avatarBg}`}
                  >
                    {getModelIcon(model.id)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {model.name}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] bg-stone-700 text-stone-300 px-1.5 py-0.5 rounded">
                          Filtered
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 truncate">
                      {model.creator}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-800/80 text-[11px] leading-relaxed text-stone-300">
                  <span className="text-amber-400/90 font-medium">{model.role}:</span>{' '}
                  <span className="text-stone-400">{model.coreStrength}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chamber Floor note */}
        <div className="mt-4 pt-3 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Council Rules:</span>
            <span>Unconstrained peer critique &bull; Mandatory counter-argument audit &bull; Unanimous preferred synthesis</span>
          </div>
          {selectedModelFilter && (
            <button
              onClick={() => onSelectModelFilter && onSelectModelFilter(null)}
              className="text-amber-400 hover:text-amber-300 underline font-medium"
            >
              Clear model filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
