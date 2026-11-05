import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  FileSearch,
  Sparkles,
  Database,
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { fetchAnalysisHistory, fetchAnalysisById } from '@/services/analysis';
import { SavedAnalysisSummary, AnalysisResult } from '@/types';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert } from '@/components/common/Alert';
import { AnalysisResultCard } from '@/components/analysis/AnalysisResultCard';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export const HistoryPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState<SavedAnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected full analysis to view
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  const loadHistory = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const { analyses, error } = await fetchAnalysisHistory(session?.access_token);
    if (error) {
      setErrorMessage(error);
    } else {
      setHistoryList(analyses);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [session]);

  const handleViewAnalysis = async (id: string) => {
    setIsLoadingDetails(true);
    setErrorMessage(null);
    const { analysis, error } = await fetchAnalysisById(id, session?.access_token);
    if (error) {
      setErrorMessage(error);
    } else if (analysis) {
      setSelectedAnalysis(analysis);
    }
    setIsLoadingDetails(false);
  };

  // If a full analysis is selected, render the AnalysisResultCard
  if (selectedAnalysis) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAnalysis(null)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Analysis History
          </Button>
        </div>
        <AnalysisResultCard
          result={selectedAnalysis}
          onReset={() => setSelectedAnalysis(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Analysis History
            </h1>
            <Badge variant="emerald" size="sm">
              Real Supabase Records
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Past resume analyses and evidence classifications saved to your account
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadHistory}
          disabled={isLoading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh History
        </Button>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          title="Could Not Load History"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-600 font-medium">
            Retrieving saved analyses from database...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && historyList.length === 0 && (
        <EmptyState
          icon={<History className="w-8 h-8 text-indigo-600" />}
          title="No analyses recorded yet"
          description="You haven't run any resume evaluations yet. Upload a PDF resume and select a target role to perform your first evidence analysis."
          actionText="Analyze a Resume Now"
          onAction={() => navigate('/dashboard/analyze')}
        />
      )}

      {/* History Grid */}
      {!isLoading && historyList.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Found <strong>{historyList.length}</strong> saved resume {historyList.length === 1 ? 'evaluation' : 'evaluations'}:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyList.map((item) => {
              const score = item.match_score;
              const isHigh = score >= 70;
              const isMid = score >= 40 && score < 70;

              return (
                <Card key={item.id} hover className="flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border font-mono ${
                          isHigh
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isMid
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {score.toFixed(2)}% Match
                      </span>
                    </div>

                    <CardTitle className="text-base text-slate-900 font-bold">
                      {item.job_role_title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {item.matched_skills_count} skills supported by evidence • {item.missing_skills_count} skills missing
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      isLoading={isLoadingDetails}
                      onClick={() => handleViewAnalysis(item.id)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View Evidence Report
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
