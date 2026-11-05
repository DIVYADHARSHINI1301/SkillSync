import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSearch,
  Briefcase,
  FileText,
  ShieldCheck,
  ArrowRight,
  Database,
  Sparkles,
  Inbox,
  Calendar,
  Lightbulb,
  Map,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAnalysisHistory } from '@/services/analysis';
import { fetchRoadmapByAnalysis } from '@/services/stage3';
import { SavedAnalysisSummary, RoadmapResult } from '@/types';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/services/supabase';

export const DashboardPage: React.FC = () => {
  const { user, profile, session } = useAuth();
  const navigate = useNavigate();
  const configured = isSupabaseConfigured();

  const greetingName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  const [recentHistory, setRecentHistory] = useState<SavedAnalysisSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [latestRoadmap, setLatestRoadmap] = useState<RoadmapResult | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoadingHistory(true);
      const { analyses } = await fetchAnalysisHistory(session?.access_token);
      setRecentHistory(analyses.slice(0, 3));
      // Try to load roadmap for the most recent analysis
      if (analyses.length > 0) {
        const { data } = await fetchRoadmapByAnalysis(analyses[0].id, session?.access_token);
        if (data) setLatestRoadmap(data);
      }
      setIsLoadingHistory(false);
    };
    load();
  }, [session]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {greetingName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Your evidence-based career readiness workspace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/dashboard/analyze">
            <Button variant="primary" leftIcon={<FileSearch className="w-4 h-4" />}>
              Start Resume Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Action Hero Card (Exact text requirement from prompt) */}
      <div className="rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Core Workflow — Step 1 &amp; 2 Active</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Your career analysis starts here.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Upload your resume and choose a target role to understand your current alignment and identify areas for improvement.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link to="/dashboard/analyze">
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Analyze Resume Now
              </Button>
            </Link>
            <Link to="/dashboard/job-roles">
              <Button variant="outline" size="md" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                Browse Job Roles
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
          <ShieldCheck className="w-64 h-64 text-indigo-400" />
        </div>
      </div>

      {/* Stage 3 Career Intelligence Summary — shown only when analysis data exists */}
      {!isLoadingHistory && recentHistory.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Career Intelligence</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to={`/dashboard/insights?analysisId=${recentHistory[0].id}`} className="group">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 hover:border-indigo-400 hover:shadow-sm transition-all">
                <Lightbulb className="w-5 h-5 text-indigo-600 mb-2" />
                <div className="text-xs font-semibold text-indigo-700">Skill Insights</div>
                <div className="text-[11px] text-indigo-500 mt-0.5 group-hover:underline">View evidence breakdown →</div>
              </div>
            </Link>
            <Link to={`/dashboard/roadmap?analysisId=${recentHistory[0].id}`} className="group">
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 hover:border-teal-400 hover:shadow-sm transition-all">
                <Map className="w-5 h-5 text-teal-600 mb-2" />
                <div className="text-xs font-semibold text-teal-700">My Roadmap</div>
                <div className="text-[11px] text-teal-500 mt-0.5">
                  {latestRoadmap
                    ? `${latestRoadmap.completion_percentage}% complete`
                    : 'Generate action plan →'}
                </div>
              </div>
            </Link>
            <Link to="/dashboard/compare" className="group">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 hover:border-slate-400 hover:shadow-sm transition-all">
                <GitCompare className="w-5 h-5 text-slate-600 mb-2" />
                <div className="text-xs font-semibold text-slate-700">Compare Roles</div>
                <div className="text-[11px] text-slate-500 mt-0.5 group-hover:underline">Multi-role analysis →</div>
              </div>
            </Link>
            <Link to={`/dashboard/resources?analysisId=${recentHistory[0].id}`} className="group">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 hover:border-amber-400 hover:shadow-sm transition-all">
                <BookOpen className="w-5 h-5 text-amber-600 mb-2" />
                <div className="text-xs font-semibold text-amber-700">Learning Resources</div>
                <div className="text-[11px] text-amber-500 mt-0.5 group-hover:underline">Skill-specific guides →</div>
              </div>
            </Link>
          </div>
          {latestRoadmap && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-slate-800">{latestRoadmap.job_role_title} Roadmap</div>
                <span className="text-xs font-bold font-mono text-indigo-600">{latestRoadmap.completion_percentage}% complete</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${latestRoadmap.completion_percentage}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs text-slate-500 mt-2">
                <span><strong className="text-slate-700">{latestRoadmap.not_started}</strong> not started</span>
                <span><strong className="text-indigo-600">{latestRoadmap.in_progress}</strong> in progress</span>
                <span><strong className="text-emerald-600">{latestRoadmap.completed}</strong> completed</span>
                <span className="ml-auto">{latestRoadmap.total} total</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3 Step Status Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Step 1: Target Role */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 1
              </span>
              <Badge variant="emerald" size="sm">
                Ready in Stage 1
              </Badge>
            </div>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Target Role Catalog
            </CardTitle>
            <CardDescription>
              6 core engineering and data paths stored in PostgreSQL database.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/dashboard/job-roles" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>View Roles</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardFooter>
        </Card>

        {/* Step 2: Resume Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 2
              </span>
              <Badge variant="emerald" size="sm">
                Ready in Stage 1
              </Badge>
            </div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              PDF File Validation
            </CardTitle>
            <CardDescription>
              Local magic byte (%PDF) and 5 MB size validation with privacy guarantee.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/dashboard/analyze" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>Test PDF Validator</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardFooter>
        </Card>

        {/* Step 3: Analysis Engine */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Step 3
              </span>
              <Badge variant="emerald" size="sm">
                Stage 2 Active
              </Badge>
            </div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Explainable Analysis
            </CardTitle>
            <CardDescription>
              PyMuPDF text extraction, rule-based skill matching, and 4-tier evidence classification.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/dashboard/analyze" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>Analyze Resume</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Analysis History — live from backend */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Analysis History
            </h3>
            <p className="text-xs text-slate-500">
              Documented analyses and evidence classification records
            </p>
          </div>
          {recentHistory.length > 0 && (
            <Link to="/dashboard/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {isLoadingHistory ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="sm" label="Loading history..." />
          </div>
        ) : recentHistory.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-7 h-7 text-indigo-600" />}
            title="No analyses recorded yet"
            description="Upload a PDF resume and select a target role to run your first evidence-based analysis."
            actionText="Analyze a Resume"
            onAction={() => navigate('/dashboard/analyze')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentHistory.map((item) => {
              const score = item.match_score;
              const isHigh = score >= 70;
              const isMid = score >= 40 && score < 70;
              return (
                <Card key={item.id} hover className="flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${
                        isHigh ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isMid ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {score.toFixed(2)}%
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900">{item.job_role_title}</CardTitle>
                    <CardDescription className="text-xs">
                      {item.matched_skills_count} skills with evidence · {item.missing_skills_count} missing
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Link to="/dashboard/history" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                      <span>View Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Database Connection Verification Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${configured ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'} shrink-0`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Supabase PostgreSQL Connection Status
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {configured
                  ? 'Connected to Synvora Supabase project. Authentication and job_roles table are active.'
                  : 'Configuration pending. Define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.'}
              </p>
            </div>
          </div>

          <Link to="/dashboard/settings" className="shrink-0 self-end sm:self-center">
            <Button variant="outline" size="sm">
              View Connection Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
