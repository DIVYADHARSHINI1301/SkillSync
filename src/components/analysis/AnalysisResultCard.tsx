import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AnalysisResult, EvidenceDetail } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatDate } from '@/lib/utils';

interface AnalysisResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
  onViewHistory?: () => void;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({
  result,
  onReset,
  onViewHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'strong' | 'supported' | 'limited' | 'missing'>('all');

  const { summary, evidence, job_role_title, match_score, created_at } = result;

  const strongList = evidence.filter((e) => e.evidence_level === 'strong');
  const supportedList = evidence.filter((e) => e.evidence_level === 'supported');
  const limitedList = evidence.filter((e) => e.evidence_level === 'limited');
  const missingList = evidence.filter((e) => e.evidence_level === 'missing');

  const displayedEvidence = activeTab === 'all'
    ? evidence
    : evidence.filter((e) => e.evidence_level === activeTab);

  // Score colorway determination
  const getScoreColor = (score: number) => {
    if (score >= 70) return { text: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200', bgLight: 'bg-emerald-50' };
    if (score >= 40) return { text: 'text-indigo-600', bg: 'bg-indigo-600', border: 'border-indigo-200', bgLight: 'bg-indigo-50' };
    return { text: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200', bgLight: 'bg-amber-50' };
  };

  const scoreColor = getScoreColor(match_score);

  return (
    <div className="space-y-6">
      {/* Top Banner / Match Score Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Evaluation Target
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {job_role_title}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">
                {formatDate(created_at)}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Evidence Alignment Report
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {summary.score_explanation}
            </p>
          </div>

          {/* Large Match Score Gauge Card */}
          <div className={`p-6 rounded-2xl border ${scoreColor.border} ${scoreColor.bgLight} flex flex-col items-center justify-center shrink-0 min-w-[200px] text-center`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Match Score
            </span>
            <div className={`text-4xl sm:text-5xl font-black ${scoreColor.text} tracking-tight font-mono`}>
              {match_score.toFixed(2)}%
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full ${scoreColor.bg} transition-all duration-700 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(0, match_score))}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-medium">
              Weighted by Evidence Level
            </span>
          </div>
        </div>

        {/* 4 Category Summary Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
          <div
            onClick={() => setActiveTab('strong')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'strong' ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500' : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Strong Evidence</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {summary.strongly_supported_count}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Weight 1.0 (Full demonstration)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('supported')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'supported' ? 'border-indigo-500 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500' : 'border-slate-200 bg-slate-50/60 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Supported</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {summary.supported_count}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Weight 0.7 (Contextual mention)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('limited')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'limited' ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-500' : 'border-slate-200 bg-slate-50/60 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Limited Evidence</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {summary.limited_evidence_count}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Weight 0.3 (Skills list only)
            </div>
          </div>

          <div
            onClick={() => setActiveTab('missing')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'missing' ? 'border-rose-500 bg-rose-50/60 shadow-xs ring-1 ring-rose-500' : 'border-slate-200 bg-slate-50/60 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Missing Evidence</span>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {summary.missing_count}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Weight 0.0 (Not detected)
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Competencies ({evidence.length})
        </button>
        <button
          onClick={() => setActiveTab('strong')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'strong'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Strong Evidence ({summary.strongly_supported_count})
        </button>
        <button
          onClick={() => setActiveTab('supported')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'supported'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
        >
          Supported ({summary.supported_count})
        </button>
        <button
          onClick={() => setActiveTab('limited')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'limited'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
          }`}
        >
          Limited Evidence ({summary.limited_evidence_count})
        </button>
        <button
          onClick={() => setActiveTab('missing')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'missing'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Missing ({summary.missing_count})
        </button>
      </div>

      {/* Detailed Evidence Cards List */}
      <div className="space-y-4">
        {displayedEvidence.map((item, idx) => (
          <EvidenceDetailItem key={idx} item={item} />
        ))}
      </div>

      {/* Constructive Guidance Callout */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>How to Improve Your Evidence Alignment</span>
        </div>
        <p className="leading-relaxed">
          • <strong>For Limited Evidence Skills:</strong> Instead of merely listing skills in a bulleted skills list, add 1–2 bullet points in your Projects or Experience section describing how you applied the tool to solve a specific problem.
        </p>
        <p className="leading-relaxed">
          • <strong>For Missing Skills:</strong> If you have completed academic projects, coursework, or personal repositories utilizing these skills, document them clearly with action verbs and outcomes.
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Button variant="outline" size="sm" onClick={onReset}>
          Analyze Another Resume
        </Button>
        <div className="flex items-center gap-2">
          {onViewHistory && (
            <Button variant="ghost" size="sm" onClick={onViewHistory}>
              View in History
            </Button>
          )}
          {result.id && (
            <>
              <a href={`/dashboard/insights?analysisId=${result.id}`}>
                <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                  Skill Insights
                </Button>
              </a>
              <a href={`/dashboard/roadmap?analysisId=${result.id}`}>
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Generate Roadmap
                </Button>
              </a>
            </>
          )}
          {!result.id && (
            <Button variant="primary" size="sm" onClick={onReset} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Done Reviewing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const EvidenceDetailItem: React.FC<{ item: EvidenceDetail }> = ({ item }) => {
  const badgeConfig = {
    strong: {
      variant: 'emerald' as const,
      label: 'Strong Evidence',
      border: 'border-emerald-200 bg-emerald-50/30',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    },
    supported: {
      variant: 'indigo' as const,
      label: 'Supported',
      border: 'border-indigo-200 bg-indigo-50/30',
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />,
    },
    limited: {
      variant: 'amber' as const,
      label: 'Limited Evidence',
      border: 'border-amber-200 bg-amber-50/30',
      icon: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />,
    },
    missing: {
      variant: 'slate' as const,
      label: 'Missing Evidence',
      border: 'border-slate-200 bg-slate-50/40',
      icon: <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />,
    },
  }[item.evidence_level];

  return (
    <div className={`rounded-xl border ${badgeConfig.border} p-4 sm:p-5 transition-all shadow-xs`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          {badgeConfig.icon}
          <h4 className="font-bold text-slate-900 text-base">{item.skill_name}</h4>
          {item.section_found && (
            <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              {item.section_found} Section
            </span>
          )}
        </div>
        <Badge variant={badgeConfig.variant} size="sm">
          {badgeConfig.label}
        </Badge>
      </div>

      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {item.explanation}
      </p>

      {item.evidence_text ? (
        <div className="p-3 rounded-lg bg-white border border-slate-200/90 text-xs text-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Supporting Resume Passage:
          </span>
          <blockquote className="font-mono text-slate-700 bg-slate-50/80 p-2 rounded border border-slate-100 leading-relaxed break-words">
            "{item.evidence_text}"
          </blockquote>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-slate-100/70 border border-slate-200 text-xs text-slate-500 italic">
          No supporting passage found in the uploaded resume.
        </div>
      )}
    </div>
  );
};
