import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, Check, ArrowRight, X } from 'lucide-react';
import { compareRoles } from '@/services/stage3';
import { fetchAnalysisHistory, fetchAnalysisById } from '@/services/analysis';
import { fetchJobRoles } from '@/services/jobRoles';
import { CompareRolesResult, RoleComparisonResult, SavedAnalysisSummary, RoleWithMeta } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-indigo-500' : 'bg-amber-500';
  return (
    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, score)}%` }} />
    </div>
  );
};

const ResultCard: React.FC<{ result: RoleComparisonResult; isBest: boolean }> = ({ result, isBest }) => (
  <Card className={isBest ? 'ring-2 ring-emerald-500' : ''}>
    <CardHeader>
      <div className="flex items-center justify-between mb-1">
        <CardTitle className="text-base">{result.job_role_title}</CardTitle>
        {isBest && <Badge variant="emerald" size="sm">Best Match</Badge>}
      </div>
      <div className="text-3xl font-black font-mono text-slate-900">{result.match_score.toFixed(2)}%</div>
      <ScoreBar score={result.match_score} />
    </CardHeader>
    <CardContent className="space-y-2 text-xs">
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
          <div className="font-bold text-emerald-700 text-lg">{result.strong_count}</div>
          <div className="text-emerald-600">Strong</div>
        </div>
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
          <div className="font-bold text-indigo-700 text-lg">{result.supported_count}</div>
          <div className="text-indigo-600">Supported</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-center">
          <div className="font-bold text-amber-700 text-lg">{result.limited_count}</div>
          <div className="text-amber-600">Limited</div>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-center">
          <div className="font-bold text-slate-600 text-lg">{result.missing_count}</div>
          <div className="text-slate-500">Missing</div>
        </div>
      </div>
      {result.missing_skills.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Skills to address:</div>
          <div className="flex flex-wrap gap-1">
            {result.missing_skills.map(s => <Badge key={s} variant="amber" size="sm">{s}</Badge>)}
          </div>
        </div>
      )}
    </CardContent>
    <CardFooter>
      <Link to={`/dashboard/insights?analysisId=${result.analysis_id}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
        View Insights <ArrowRight className="w-3 h-3" />
      </Link>
    </CardFooter>
  </Card>
);

export const CompareRolesPage: React.FC = () => {
  const { session } = useAuth();
  const [analyses, setAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [roles, setRoles] = useState<RoleWithMeta[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<CompareRolesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoadingInit(true);
      const [{ analyses: list }, { roles: roleList }] = await Promise.all([
        fetchAnalysisHistory(session?.access_token),
        fetchJobRoles(),
      ]);
      setAnalyses(list);
      setRoles(roleList);
      if (list.length > 0) {
        const first = list[0];
        setSelectedResumeId(first.id); // we use analysis id to get resume_id on backend
      }
      setIsLoadingInit(false);
    };
    load();
  }, [session]);

  const toggleRole = (id: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const handleCompare = async () => {
    if (!selectedResumeId || selectedRoleIds.length < 2) return;
    setIsComparing(true);
    setError(null);
    setResult(null);

    // Get resume_id from the selected analysis
    const selectedAnalysis = analyses.find(a => a.id === selectedResumeId);
    if (!selectedAnalysis) {
      setError('Could not find the selected analysis.');
      setIsComparing(false);
      return;
    }

    // Fetch the full analysis to get resume_id
    const { analysis } = await fetchAnalysisById(selectedResumeId, session?.access_token);
    if (!analysis?.resume_id) {
      setError('Could not retrieve the resume for this analysis. Please run a new analysis first.');
      setIsComparing(false);
      return;
    }

    const { data, error: err } = await compareRoles(analysis.resume_id, selectedRoleIds, session?.access_token);
    if (err) setError(err);
    else setResult(data);
    setIsComparing(false);
  };

  if (isLoadingInit) return <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Compare Job Roles</h1>
          <Badge variant="indigo" size="sm">Stage 3</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          See how the same resume performs against multiple job roles using the same scoring formula.
        </p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          icon={<GitCompare className="w-8 h-8 text-indigo-600" />}
          title="No analyses found"
          description="Run a resume analysis first, then return here to compare roles."
          actionText="Analyze a Resume"
          onAction={() => window.location.href = '/dashboard/analyze'}
        />
      ) : (
        <>
          {/* Step 1: Select analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 1: Select a saved analysis</CardTitle>
              <CardDescription>The resume from this analysis will be compared against your selected roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedResumeId}
                onChange={e => setSelectedResumeId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {analyses.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.job_role_title} — {a.match_score.toFixed(2)}%
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Step 2: Select roles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Step 2: Select 2–4 job roles to compare</CardTitle>
              <CardDescription>{selectedRoleIds.length} of 4 roles selected.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {roles.map(role => {
                  const isSelected = selectedRoleIds.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{role.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{role.required_skills?.length} skills</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                disabled={selectedRoleIds.length < 2 || isComparing}
                isLoading={isComparing}
                onClick={handleCompare}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isComparing ? 'Comparing...' : 'Compare Roles'}
              </Button>
            </CardFooter>
          </Card>

          {error && <Alert type="error" title="Comparison Failed" message={error} onClose={() => setError(null)} />}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 text-sm text-indigo-800">
                {result.summary}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.results.map(r => (
                  <ResultCard key={r.job_role_id} result={r} isBest={r.job_role_title === result.best_match_role} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
