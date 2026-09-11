import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Award,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  AlertTriangle,
  FileText,
  HelpCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ConsensusReport, ModelId } from '../types';
import { MODELS } from '../data/models';

interface ConsensusReportViewProps {
  report: ConsensusReport;
  query: string;
}

export const ConsensusReportView: React.FC<ConsensusReportViewProps> = ({
  report,
  query,
}) => {
  const [activeTab, setActiveTab] = useState<'verdict' | 'consensus' | 'debates' | 'contributions'>('verdict');
  const [copied, setCopied] = useState(false);

  const handleCopyReport = async () => {
    const markdownContent = `# AI Council Consensus Report
**Query:** ${query}

## Executive Verdict
${report.verdict}
(Council Confidence & Alignment: ${report.confidenceScore}%)

## Executive Summary
${report.executiveSummary}

## Unanimous Consensus Points
${report.consensusPoints.map((p) => `- ${p}`).join('\n')}

## Reconciled Debates & Trade-Offs
${report.debatedPoints
  .map(
    (d) =>
      `### ${d.topic}\n` +
      d.stances.map((s) => `- **${s.modelId.toUpperCase()}:** ${s.stance}`).join('\n') +
      `\n*Council Resolution:* ${d.resolution}`
  )
  .join('\n\n')}

## Actionable Recommendations
${report.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Risks & Caveats
${report.risksAndCaveats.map((c) => `- ⚠️ ${c}`).join('\n')}

## Individual AI Contributions
${report.modelContributions.map((m) => `- **${MODELS[m.modelId]?.name || m.modelId}:** ${m.contribution}`).join('\n')}

---
${report.fullMarkdownAnswer}
`;

    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([report.fullMarkdownAnswer || report.executiveSummary], {
      type: 'text/markdown',
    });
    element.href = URL.createObjectURL(file);
    element.download = `council-report-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-900 shadow-lg overflow-hidden">
      {/* Top Banner: Verdict & Council Seal */}
      <div className="bg-stone-900 text-white p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-stone-950 uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                Vetted Council Verdict
              </span>
              <span className="text-xs text-stone-400">
                Peer-Deliberated by 4 Models
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {report.verdict}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-300">
              <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Council Agreement:</span>
                <span className="font-bold text-white text-sm">
                  {report.confidenceScore}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-400">Signatories:</span>
                <span className="font-medium text-stone-200">
                  Gemini &bull; ChatGPT &bull; Claude &bull; Perplexity
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 text-xs font-medium transition-all shadow-xs"
              title="Copy entire report as Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 text-xs font-medium transition-all shadow-xs"
              title="Download Markdown file"
            >
              <Download className="w-4 h-4" />
              <span>Export .md</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 bg-stone-50/70 px-4 sm:px-6 overflow-x-auto text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('verdict')}
          className={`py-3.5 px-3 sm:px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'verdict'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Preferred Answer & Action Plan
        </button>
        <button
          onClick={() => setActiveTab('consensus')}
          className={`py-3.5 px-3 sm:px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'consensus'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Consensus & Invariants ({report.consensusPoints?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('debates')}
          className={`py-3.5 px-3 sm:px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'debates'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Debated Trade-Offs ({report.debatedPoints?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('contributions')}
          className={`py-3.5 px-3 sm:px-4 border-b-2 font-semibold transition-all whitespace-nowrap ${
            activeTab === 'contributions'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Model Synergies (4)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8">
        {/* Tab 1: Preferred Answer & Action Plan */}
        {activeTab === 'verdict' && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-5 text-stone-900">
              <h3 className="text-xs uppercase tracking-wider font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Executive Synthesis
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line text-stone-800 font-medium">
                {report.executiveSummary}
              </p>
            </div>

            {/* Actionable Recommendations Checklist */}
            {report.actionableRecommendations && report.actionableRecommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Vetted Implementation Roadmap</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.actionableRecommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Markdown Answer */}
            {report.fullMarkdownAnswer && (
              <div className="pt-6 border-t border-stone-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Comprehensive Council Solution</span>
                </h3>
                <div className="prose prose-stone max-w-none text-stone-800 leading-relaxed text-sm sm:text-base prose-headings:font-bold prose-headings:text-stone-900 prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-3 prose-p:my-2.5 prose-ul:my-3 prose-li:my-1 prose-strong:text-stone-950 prose-code:bg-stone-100 prose-code:text-stone-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none">
                  <Markdown>{report.fullMarkdownAnswer}</Markdown>
                </div>
              </div>
            )}

            {/* Risks and Caveats */}
            {report.risksAndCaveats && report.risksAndCaveats.length > 0 && (
              <div className="pt-6 border-t border-stone-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Council-Flagged Risks & Failure Modes</span>
                </h3>
                <div className="space-y-2">
                  {report.risksAndCaveats.map((risk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-rose-200 bg-rose-50/60 text-xs sm:text-sm text-rose-900 flex items-start gap-2.5"
                    >
                      <span className="font-bold text-rose-700 shrink-0">⚠️</span>
                      <span className="leading-relaxed font-medium">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Consensus Points */}
        {activeTab === 'consensus' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-base font-bold text-stone-900">
                Unanimous Alignment Across All 4 Intelligences
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                These principles and facts achieved 100% agreement between Gemini, ChatGPT, Claude, and Perplexity with zero dissent.
              </p>
            </div>

            <div className="space-y-3">
              {report.consensusPoints?.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                      Consensus Invariant #{idx + 1}
                    </h4>
                    <p className="text-sm text-stone-800 leading-relaxed font-medium">
                      {pt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Debated Trade-Offs & Reconciliations */}
        {activeTab === 'debates' && (
          <div className="space-y-5">
            <div className="mb-4">
              <h3 className="text-base font-bold text-stone-900">
                Core Disputes & How The Council Reconciled Them
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                The hardest questions debated during peer cross-examination and their resulting consensus resolution.
              </p>
            </div>

            <div className="space-y-4">
              {report.debatedPoints?.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-stone-200 rounded-xl p-5 bg-white shadow-xs"
                >
                  <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span>{item.topic}</span>
                  </h4>

                  {/* Opposing Stances */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                    {item.stances?.map((s, sIdx) => {
                      const model = MODELS[s.modelId] || {
                        name: s.modelId,
                        bgLight: 'bg-stone-100',
                        textColor: 'text-stone-800',
                        borderColor: 'border-stone-200',
                      };
                      return (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-lg border ${model.borderColor} ${model.bgLight} text-xs`}
                        >
                          <div className={`font-bold mb-1 ${model.textColor}`}>
                            {MODELS[s.modelId]?.name || s.modelId.toUpperCase()}
                          </div>
                          <div className="text-stone-700 leading-relaxed">
                            "{s.stance}"
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resolution */}
                  <div className="p-3.5 rounded-lg bg-stone-900 text-stone-100 text-xs sm:text-sm">
                    <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Council Resolution:
                    </div>
                    <p className="leading-relaxed text-stone-200">
                      {item.resolution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Model Synergies */}
        {activeTab === 'contributions' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-base font-bold text-stone-900">
                Individual AI Architectural Value-Add
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Every model brought a critical perspective that shaped the ultimate consensus report.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report.modelContributions?.map((mc) => {
                const model = MODELS[mc.modelId] || {
                  name: mc.modelId,
                  creator: 'AI',
                  role: 'Council Member',
                  avatarBg: 'bg-stone-700 text-white',
                  borderColor: 'border-stone-200',
                  bgLight: 'bg-stone-50',
                  textColor: 'text-stone-900',
                  coreStrength: '',
                };

                return (
                  <div
                    key={mc.modelId}
                    className={`rounded-xl border ${model.borderColor} p-4 bg-white shadow-xs flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs ${model.avatarBg}`}
                        >
                          {model.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">
                            {model.name}
                          </h4>
                          <p className="text-xs text-stone-500">
                            {model.role}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                        <span className="font-semibold text-stone-900 block mb-1">
                          Signature Contribution:
                        </span>
                        {mc.contribution}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-[11px] text-stone-400 border-t border-stone-100">
                      Core strength: {model.coreStrength}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
