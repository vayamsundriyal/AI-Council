import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Filter,
} from 'lucide-react';
import { DeliberationMessage, ModelId } from '../types';
import { MODELS } from '../data/models';

interface DeliberationFeedProps {
  messages: DeliberationMessage[];
  selectedModelFilter: ModelId | null;
  onSelectModelFilter: (modelId: ModelId | null) => void;
  isRunning: boolean;
}

export const DeliberationFeed: React.FC<DeliberationFeedProps> = ({
  messages,
  selectedModelFilter,
  onSelectModelFilter,
  isRunning,
}) => {
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    messages.forEach((m) => {
      all[m.id] = true;
    });
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (selectedRound !== 'all' && m.round !== selectedRound) return false;
    if (selectedModelFilter && m.modelId !== selectedModelFilter) return false;
    return true;
  });

  const availableRounds = Array.from(new Set(messages.map((m) => m.round))).sort(
    (a, b) => a - b
  );

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'disagree':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-2.5 h-2.5" />
            Contesting
          </span>
        );
      case 'nuanced':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Nuanced Refinement
          </span>
        );
      case 'constructive':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-2.5 h-2.5" />
            Constructive Stance
          </span>
        );
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-stone-500 shadow-sm">
        <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-stone-800">Council Chambers Empty</h3>
        <p className="text-sm text-stone-500 max-w-md mx-auto mt-1">
          Submit a query above to initiate the live multi-round deliberation between Gemini, ChatGPT, Claude, and Perplexity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feed Filters & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-stone-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Rounds:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedRound('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedRound === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Turns ({messages.length})
          </button>
          {availableRounds.map((round) => (
            <button
              key={round}
              type="button"
              onClick={() => setSelectedRound(round)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedRound === round
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Round {round}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {selectedModelFilter && (
            <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200 flex items-center gap-1">
              <span>Model: {MODELS[selectedModelFilter]?.name}</span>
              <button
                onClick={() => onSelectModelFilter(null)}
                className="hover:text-stone-900 font-bold ml-1"
              >
                &times;
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={expandAll}
            className="text-stone-600 hover:text-stone-900 font-medium px-2 py-1"
          >
            Expand All
          </button>
          <span className="text-stone-300">&bull;</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-stone-600 hover:text-stone-900 font-medium px-2 py-1"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5">
        {filteredMessages.map((msg, index) => {
          const model = MODELS[msg.modelId] || {
            name: msg.modelId,
            creator: 'AI',
            role: 'Council Member',
            avatarBg: 'bg-stone-700 text-white',
            borderColor: 'border-stone-200',
            bgLight: 'bg-stone-50',
            textColor: 'text-stone-700',
          };

          const isExpanded = expandedIds[msg.id] !== false; // Default expanded for fresh reading

          return (
            <div
              key={msg.id || index}
              className={`bg-white rounded-xl border ${model.borderColor} shadow-xs transition-all overflow-hidden`}
            >
              {/* Message Header */}
              <div
                onClick={() => toggleExpand(msg.id)}
                className={`px-4 sm:px-5 py-3.5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-stone-50/70 transition-colors ${
                  isExpanded ? 'border-b border-stone-100' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${model.avatarBg}`}
                  >
                    {model.name[0]}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">
                        {model.name}
                      </span>
                      <span className="text-xs text-stone-400 font-medium">
                        ({model.creator})
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                        {msg.roundName}
                      </span>
                      {getSentimentBadge(msg.sentiment)}
                    </div>

                    {/* Critique Targets if any */}
                    {msg.critiqueTargets && msg.critiqueTargets.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                        <span className="font-medium text-stone-600">
                          Cross-examining:
                        </span>
                        {msg.critiqueTargets.map((target) => (
                          <span
                            key={target}
                            className="px-1.5 py-0.2 rounded bg-stone-100 border border-stone-200 text-stone-700 font-mono text-[10px]"
                          >
                            @{MODELS[target]?.name.split(' ')[0] || target}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Takeaway bar if available */}
              {msg.keyTakeaway && (
                <div className="px-4 sm:px-5 py-2 bg-stone-50 border-b border-stone-100 text-xs text-stone-700 flex items-start gap-2">
                  <span className="font-semibold text-stone-900 shrink-0 uppercase tracking-wider text-[10px] bg-stone-200/80 px-1.5 py-0.5 rounded">
                    Key Stance:
                  </span>
                  <span className="italic font-medium text-stone-800">
                    "{msg.keyTakeaway}"
                  </span>
                </div>
              )}

              {/* Expanded Body Content */}
              {isExpanded && (
                <div className="px-4 sm:px-5 py-4 text-stone-800 text-sm leading-relaxed">
                  <div className="prose prose-stone max-w-none text-sm leading-relaxed prose-headings:font-bold prose-headings:text-stone-900 prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-stone-950 prose-code:text-stone-900 prose-code:bg-stone-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
