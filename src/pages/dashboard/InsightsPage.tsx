import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lightbulb, CheckCircle2, AlertCircle, HelpCircle, ArrowRight, RefreshCw, BookOpen } from 'lucide-react';
import { fetchInsights } from '@/services/stage3';
import { fetchAnalysisHistory } from '@/services/analysis';
import { InsightsResult, SkillInsight, SavedAnalysisSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const levelConfig = {
  strong: { label: 'Strong Evidence', variant: 'emerald' as const, icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, border: 'border-emerald-200 bg-emerald-50/30' },
  supported: { label: 'Supported', variant: 'indigo' as const, icon: <CheckCircle2 className="w-4 h-4 text-indigo-600" />, border: 'border-indigo-200 bg-indigo-50/30' },
  limited: { label: 'Limited Evidence', variant: 'amber' as const, icon: <AlertCircle className="w-4 h-4 text-amber-600" />, border: 'border-amber-200 bg-amber-50/30' },
  missing: { label: 'Missing', variant: 'slate' as const, icon: <HelpCircle className="w-4 h-4 text-slate-400" />, border: 'border-slate-200 bg-slate-50/40' },
};

const InsightCard: React.FC<{ item: SkillInsight }> = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = levelConfig[item.evidence_level as keyof typeof levelConfig] || levelConfig.missing;
  return (
    <div className={`rounded-xl border ${cfg.border} p-4 transition-all`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {cfg.icon}
          <span className="font-bold text-slate-900">{item.skill_name}</span>
        </div>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>
      <p className="text-xs text-slate-600 mb-2 leading-relaxed">{item.insight}</p>
      {item.evidence_text && (
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs mb-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Resume Passage:</span>
          <blockquote className="font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
            "{item.evidence_text}"
          </blockquote>
        </div>
      )}
      {item.action_type !== 'none' && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1"
        >
          {expanded ? 'Hide suggestion' : 'Show suggested action'}
          <ArrowRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      )}
      {expanded && (
        <div className="mt-2 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-800 leading-relaxed">
          <strong>Suggested action:</strong> {item.suggested_action}
        </div>
      )}
    </div>
  );
};

export const InsightsPage: React.FC = () => {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const analysisIdFromUrl = searchParams.get('analysisId');

  const [analyses, setAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>(analysisIdFromUrl || '');
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoadingList(true);
      const { analyses: list } = await fetchAnalysisHistory(session?.access_token);
      setAnalyses(list);
      if (!selectedId && list.length > 0) setSelectedId(list[0].id);
      setIsLoadingList(false);
    };
    load();
  }, [session]);

  useEffect(() => {
    if (!selectedId) return;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await fetchInsights(selectedId, session?.access_token);
      if (err) setError(err);
      else setInsights(data);
      setIsLoading(false);
    };
    load();
  }, [selectedId, session]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Insights</h1>
          <Badge variant="indigo" size="sm">Stage 3</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Understand what each evidence classification means and what you can do next.
        </p>
      </div>

      {isLoadingList ? (
        <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-8 h-8 text-indigo-600" />}
          title="No analyses found"
          description="Analyze your resume first to generate skill insights."
          actionText="Analyze a Resume"
          onAction={() => window.location.href = '/dashboard/analyze'}
        />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 shrink-0">Select analysis:</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {analyses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.job_role_title} — {a.match_score.toFixed(2)}%
                </option>
              ))}
            </select>
          </div>

          {error && <Alert type="error" title="Could not load insights" message={error} onClose={() => setError(null)} />}

          {isLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner size="lg" label="Generating insights..." /></div>
          ) : insights && (
            <>
              {/* Summary bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Strong', count: insights.strong_count, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { label: 'Supported', count: insights.supported_count, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                  { label: 'Limited', count: insights.limited_count, color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { label: 'Missing', count: insights.missing_count, color: 'text-slate-600 bg-slate-50 border-slate-200' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
                    <div className="text-2xl font-bold font-mono">{s.count}</div>
                    <div className="text-xs font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Insight cards */}
              <div className="space-y-3">
                {insights.insights.map((item, i) => <InsightCard key={i} item={item} />)}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link to={`/dashboard/roadmap?analysisId=${selectedId}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Generate Roadmap
                  </Button>
                </Link>
                <Link to={`/dashboard/resources?analysisId=${selectedId}`}>
                  <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-4 h-4" />}>
                    Learning Resources
                  </Button>
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
