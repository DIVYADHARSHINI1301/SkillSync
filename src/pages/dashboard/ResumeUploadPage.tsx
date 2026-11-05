import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { fetchJobRoles, fetchJobRoleById } from '@/services/jobRoles';
import { submitResumeAnalysis } from '@/services/analysis';
import { RoleWithMeta, ValidatedFile, AnalysisResult } from '@/types';
import { ResumeDropzone } from '@/components/upload/ResumeDropzone';
import { AnalysisResultCard } from '@/components/analysis/AnalysisResultCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

export const ResumeUploadPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const roleIdFromUrl = searchParams.get('roleId');

  const [availableRoles, setAvailableRoles] = useState<RoleWithMeta[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleWithMeta | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [validatedFile, setValidatedFile] = useState<ValidatedFile | null>(null);

  // Analysis execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('Analyzing your resume against the selected job role...');

  // Load available roles from database
  useEffect(() => {
    const load = async () => {
      setIsLoadingRoles(true);
      const { roles } = await fetchJobRoles();
      setAvailableRoles(roles);

      if (roleIdFromUrl && roles.length > 0) {
        const found = roles.find((r) => r.id === roleIdFromUrl);
        if (found) {
          setSelectedRole(found);
        } else {
          const { role } = await fetchJobRoleById(roleIdFromUrl);
          if (role) setSelectedRole(role);
        }
      } else if (roles.length > 0 && !selectedRole) {
        setSelectedRole(roles[0]);
      }
      setIsLoadingRoles(false);
    };
    load();
  }, [roleIdFromUrl]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const found = availableRoles.find((r) => r.id === id);
    if (found) setSelectedRole(found);
  };

  const handleExecuteAnalysis = async () => {
    if (!selectedRole || !validatedFile) return;

    setAnalysisError(null);
    setIsAnalyzing(true);
    setProcessingStatus('Analyzing your resume against the selected job role...');

    try {
      const { result, error } = await submitResumeAnalysis(
        validatedFile.file,
        selectedRole.id,
        session?.access_token
      );

      if (error) {
        setAnalysisError(error);
      } else if (result) {
        setAnalysisResult(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAnalysis = () => {
    setAnalysisResult(null);
    setValidatedFile(null);
    setAnalysisError(null);
  };

  // If analysis result is available, render the complete Analysis Result Screen
  if (analysisResult) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <AnalysisResultCard
          result={analysisResult}
          onReset={handleResetAnalysis}
          onViewHistory={() => navigate('/dashboard/history')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Analyze Resume Alignment
          </h1>
          <Badge variant="emerald" size="sm">
            Stage 2 Engine Active
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Pair your target role from the Supabase catalog with a verified PDF resume.
        </p>
      </div>

      {/* Workflow Step Indicator */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            1
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Target Job Role
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {selectedRole ? selectedRole.title : 'Choose a role'}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
          validatedFile
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-slate-200 bg-white'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            validatedFile ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            2
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              PDF Resume File
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {validatedFile ? validatedFile.name : 'Select PDF (Max 5 MB)'}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert if any */}
      {analysisError && (
        <Alert
          type="error"
          title="Analysis Failed"
          message={analysisError}
          onClose={() => setAnalysisError(null)}
        />
      )}

      {/* Step 1: Select Target Role */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Step 1: Select Target Career Path
            </CardTitle>
            <Link to="/dashboard/job-roles" className="text-xs font-medium text-indigo-600 hover:underline">
              Browse Full Catalog
            </Link>
          </div>
          <CardDescription>
            Choose which job role's competencies will be compared against your resume evidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingRoles ? (
            <div className="py-4 text-center">
              <LoadingSpinner size="sm" label="Loading database roles..." />
            </div>
          ) : availableRoles.length === 0 ? (
            <Alert
              type="warning"
              title="Database Roles Unavailable"
              message="No job roles were loaded from Supabase. Ensure your database connection is active in .env."
            />
          ) : (
            <div className="space-y-3">
              <select
                id="role-select"
                aria-label="Select target career path"
                value={selectedRole?.id || ''}
                onChange={handleRoleChange}
                disabled={isAnalyzing}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 disabled:opacity-50"
              >
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} ({role.required_skills?.length || 0} core skills)
                  </option>
                ))}
              </select>

              {selectedRole && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="text-slate-600 leading-relaxed">
                    {selectedRole.description}
                  </p>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">
                      Required Competencies ({selectedRole.required_skills?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRole.required_skills?.map((skill, idx) => (
                        <Badge key={idx} variant="default" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Upload PDF Resume */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Step 2: Upload PDF Resume Document
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF format (maximum size: 5 MB). File magic bytes (%PDF) are verified client-side.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResumeDropzone
            selectedFile={validatedFile}
            onFileValidated={(file) => setValidatedFile(file)}
          />

          {/* Privacy statement */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Assurance:</strong> Your resume is processed through our localized NLP engine. No resume data is transmitted to third-party commercial LLMs without consent.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Button & Processing Experience */}
      <div className="space-y-4 pt-2">
        {isAnalyzing && (
          <div className="p-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 text-center space-y-3 shadow-xs">
            <LoadingSpinner size="lg" />
            <h4 className="text-base font-semibold text-slate-900">
              {processingStatus}
            </h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Extracting text using PyMuPDF, identifying canonical skills, finding supporting project passages, and computing explainable weights.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="md" disabled={isAnalyzing}>
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="lg"
            disabled={!selectedRole || !validatedFile || isAnalyzing}
            isLoading={isAnalyzing}
            onClick={handleExecuteAnalysis}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isAnalyzing ? 'Analyzing Resume...' : 'Analyze Resume'}
          </Button>
        </div>
      </div>
    </div>
  );
};
