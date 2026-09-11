import React from 'react';
import { X, Trash2, ArrowRight, History, Award, Calendar, MessageSquare } from 'lucide-react';
import { DeliberationSession } from '../types';

interface DeliberationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: DeliberationSession[];
  onSelectSession: (session: DeliberationSession) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const DeliberationHistoryModal: React.FC<DeliberationHistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-stone-700" />
            <h3 className="text-base font-bold text-stone-900">
              Council Deliberation Archives
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
              {sessions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <History className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">No archived deliberations yet</p>
              <p className="text-xs text-stone-400 mt-1">
                Completed council queries and their consensus reports will appear here.
              </p>
            </div>
          ) : (
            sessions.map((sess) => {
              const formattedDate = new Date(sess.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50/70 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                      <div className="flex items-center gap-2">
                        {sess.report && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {sess.report.confidenceScore}% Consensus
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => onDeleteSession(sess.id, e)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                      {sess.query}
                    </h4>

                    {sess.report?.verdict && (
                      <p className="text-xs text-stone-600 line-clamp-1 mt-1 font-medium italic">
                        Verdict: {sess.report.verdict}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {sess.messages.length} council speeches
                    </span>
                    <span className="text-stone-900 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Session</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
