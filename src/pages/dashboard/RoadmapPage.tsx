import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Map, CheckCircle2, Clock, Circle, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { createRoadmap, fetchRoadmapByAnalysis, updateRecommendationStatus } from '@/services/stage3';
import { fetchAnalysisHistory } from '@/services/analysis';
import { RoadmapResult, RoadmapRecommendation, RecommendationStatus, SavedAnalysisSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const categoryConfig = {
  improve_evidence: { label: 'Improve Resume Evidence', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  practise_skill: { label: 'Practise Existing Skill', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  develop_skill: { label: 'Develop New Skill', color: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const statusConfig = {
  not_started: { label: 'Not Started', icon: <Circle className="w-4 h-4 text-slate-400" />, color: 'text-slate-500' },
  in_progress: { label: 'In Progress', icon: <Clock className="w-4 h-4 text-indigo-500" />, color: 'text-indigo-600' },
  completed: { label: 'Completed', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'text-emerald-600' },
};

const RecommendationCard: React.FC<{
  rec: RoadmapRecommendation;
  roadmapId: string;
  onUpdate: (roadmapId: string, recId: string, status: RecommendationStatus) => Promise<void>;
  isUpdating: boolean;
}> = ({ rec, roadmapId, onUpdate, isUpdating }) => {
  const catCfg = categoryConfig[rec.category];
  const stCfg = statusConfig[rec.status];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-4 transition-all ${rec.status === 'completed' ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900">{rec.skill_name}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${catCfg.color}`}>{catCfg.label}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium shrink-0 ${stCfg.color}`}>
          {stCfg.icon}
          <span>{stCfg.label}</span>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-700 mb-1">{rec.goal}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{rec.action}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-2 flex items-center gap-1"
      >
        {expanded ? 'Hide details' : 'Show activity & outcome'}
        <ArrowRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="font-semibold text-slate-700 block mb-0.5">Activity:</span>
            <span className="text-slate-600">{rec.activity}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200">
            <span className="font-semibold text-teal-700 block mb-0.5">Expected outcome:</span>
            <span className="text-teal-700">{rec.expected_outcome}</span>
          </div>
        </div>
      )}

      {/* Status controls */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 font-medium">Update progress:</span>
        {(['not_started', 'in_progress', 'completed'] as RecommendationStatus[]).map(s => (
          <button
            key={s}
            disabled={isUpdating || rec.status === s}
            onClick={() => onUpdate(roadmapId, rec.id, s)}
            className={`text-[11px] px-2 py-0.5 rounded border font-medium transition-colors disabled:opacity-50 ${
              rec.status === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {statusConfig[s].label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const RoadmapPage: React.FC = () => {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const analysisIdFromUrl = searchParams.get('analysisId');

  const [analyses, setAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [selectedId, setSelectedId] = useState(analysisIdFromUrl || '');
  const [roadmap, setRoadmap] = useState<RoadmapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
      const { data, error: err } = await fetchRoadmapByAnalysis(selectedId, session?.access_token);
      if (err) setError(err);
      else setRoadmap(data); // null means no roadmap yet — not an error
      setIsLoading(false);
    };
    load();
  }, [selectedId, session]);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await createRoadmap(selectedId, session?.access_token);
    if (err) setError(err);
    else setRoadmap(data);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (roadmapId: string, recId: string, newStatus: RecommendationStatus) => {
    setIsUpdating(true);
    const { data, error: err } = await updateRecommendationStatus(roadmapId, recId, newStatus, session?.access_token);
    if (err) setError(err);
    else if (data) setRoadmap(data);
    setIsUpdating(false);
  };

  const groupedRecs = roadmap ? {
    improve_evidence: roadmap.recommendations.filter(r => r.category === 'improve_evidence'),
    practise_skill: roadmap.recommendations.filter(r => r.category === 'practise_skill'),
    develop_skill: roadmap.recommendations.filter(r => r.category === 'develop_skill'),
  } : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Roadmap</h1>
          <Badge variant="indigo" size="sm">Stage 3</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Personalized action plan based on your resume evidence. Track your progress as you improve.
        </p>
      </div>

      {isLoadingList ? (
        <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={<Map className="w-8 h-8 text-indigo-600" />}
          title="No analyses found"
          description="Run a resume analysis first to generate a personalized roadmap."
          actionText="Analyze a Resume"
          onAction={() => window.location.href = '/dashboard/analyze'}
        />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 shrink-0">Select analysis:</label>
            <select
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setRoadmap(null); }}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              {analyses.map(a => (
                <option key={a.id} value={a.id}>{a.job_role_title} — {a.match_score.toFixed(2)}%</option>
              ))}
            </select>
          </div>

          {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}

          {isLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner size="lg" label="Loading roadmap..." /></div>
          ) : !roadmap ? (
            <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/40 p-8 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No roadmap yet for this analysis</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Generate a personalized action plan based on your evidence classifications.
              </p>
              <Button variant="primary" onClick={handleGenerate} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Generate My Roadmap
              </Button>
            </div>
          ) : (
            <>
              {/* Progress summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{roadmap.job_role_title} Roadmap</h3>
                    <p className="text-xs text-slate-500">{roadmap.total} recommendations total</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-indigo-600">{roadmap.completion_percentage}%</div>
                    <div className="text-xs text-slate-500">complete</div>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${roadmap.completion_percentage}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span><strong className="text-slate-800">{roadmap.not_started}</strong> not started</span>
                  <span><strong className="text-indigo-600">{roadmap.in_progress}</strong> in progress</span>
                  <span><strong className="text-emerald-600">{roadmap.completed}</strong> completed</span>
                </div>
              </div>

              {/* Grouped recommendations */}
              {groupedRecs && Object.entries(groupedRecs).map(([cat, recs]) => recs.length > 0 && (
                <div key={cat} className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {categoryConfig[cat as keyof typeof categoryConfig].label}
                  </h3>
                  {recs.map(rec => (
                    <RecommendationCard
                      key={rec.id}
                      rec={rec}
                      roadmapId={roadmap.id}
                      onUpdate={handleUpdateStatus}
                      isUpdating={isUpdating}
                    />
                  ))}
                </div>
              ))}

              <div className="flex items-center gap-3 pt-2">
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
