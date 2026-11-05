import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, ExternalLink, FileText, Video, Code, BookMarked, Wrench } from 'lucide-react';
import { fetchLearningResources } from '@/services/stage3';
import { fetchAnalysisHistory, fetchAnalysisById } from '@/services/analysis';
import { LearningResourcesResult, LearningResource, SavedAnalysisSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/common/Badge';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const typeConfig = {
  documentation: { label: 'Docs', icon: <FileText className="w-3.5 h-3.5" />, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  tutorial: { label: 'Tutorial', icon: <BookMarked className="w-3.5 h-3.5" />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  course: { label: 'Course', icon: <Video className="w-3.5 h-3.5" />, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  exercise: { label: 'Exercise', icon: <Code className="w-3.5 h-3.5" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  guide: { label: 'Guide', icon: <Wrench className="w-3.5 h-3.5" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

const ResourceCard: React.FC<{ resource: LearningResource }> = ({ resource }) => {
  const cfg = typeConfig[resource.resource_type] || typeConfig.guide;
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors leading-snug">
          {resource.title}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 mt-0.5" />
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">{resource.description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${cfg.color}`}>
          {cfg.icon}{cfg.label}
        </span>
        <span className="text-[11px] text-slate-500">{resource.source}</span>
        {resource.is_free && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Free</span>
        )}
      </div>
    </a>
  );
};

export const LearningResourcesPage: React.FC = () => {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const analysisIdFromUrl = searchParams.get('analysisId');

  const [analyses, setAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [selectedId, setSelectedId] = useState(analysisIdFromUrl || '');
  const [resources, setResources] = useState<LearningResourcesResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusSkill, setFocusSkill] = useState<string>('all');

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
      setFocusSkill('all');

      // Get the full analysis to extract skill names
      const { analysis } = await fetchAnalysisById(selectedId, session?.access_token);
      if (!analysis) {
        setError('Could not load the selected analysis.');
        setIsLoading(false);
        return;
      }

      // Prioritize limited and missing skills, then all
      const prioritySkills = analysis.evidence
        .filter(e => e.evidence_level === 'limited' || e.evidence_level === 'missing')
        .map(e => e.skill_name);
      const allSkills = analysis.evidence.map(e => e.skill_name);
      const skillsToFetch = prioritySkills.length > 0 ? prioritySkills : allSkills;

      const { data, error: err } = await fetchLearningResources(skillsToFetch);
      if (err) setError(err);
      else setResources(data || []);
      setIsLoading(false);
    };
    load();
  }, [selectedId, session]);

  const allSkillsWithResources = resources.map(r => r.skill);
  const displayedResources = focusSkill === 'all'
    ? resources
    : resources.filter(r => r.skill === focusSkill);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Learning Resources</h1>
          <Badge variant="indigo" size="sm">Stage 3</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Verified resources for skills that need attention in your resume. Resources are prioritized for limited and missing skills.
        </p>
      </div>

      {isLoadingList ? (
        <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-indigo-600" />}
          title="No analyses found"
          description="Run a resume analysis first to get relevant learning resources."
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
                <option key={a.id} value={a.id}>{a.job_role_title} — {a.match_score.toFixed(2)}%</option>
              ))}
            </select>
          </div>

          {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}

          {isLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner size="lg" label="Loading resources..." /></div>
          ) : resources.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No resources found for the skills in this analysis. All skills may already have strong evidence.
            </div>
          ) : (
            <>
              {/* Skill filter tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFocusSkill('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${focusSkill === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  All Skills ({resources.reduce((s, r) => s + r.resources.length, 0)} resources)
                </button>
                {allSkillsWithResources.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setFocusSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${focusSkill === skill ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {displayedResources.map(group => (
                  <div key={group.skill}>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      {group.skill}
                      <span className="text-xs font-normal text-slate-500">({group.resources.length} resources)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.resources.map((r, i) => <ResourceCard key={i} resource={r} />)}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 pt-2">
                Resources are verified official documentation and established free platforms. Opening a resource does not update your evidence classification — only re-analyzing an updated resume will do that.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};
