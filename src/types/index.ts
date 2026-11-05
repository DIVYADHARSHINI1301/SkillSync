import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { JobRoleRow, ProfileRow, EvidenceLevel } from './database.types';

export * from './database.types';

export interface AppUser {
  id: string;
  email?: string;
  fullName?: string | null;
  createdAt?: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: ProfileRow | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  error: string | null;
}

export interface ValidatedFile {
  file: File;
  name: string;
  size: number;
  sizeFormatted: string;
  isValid: boolean;
  validationError?: string;
  isPdfMagicBytesVerified: boolean;
  uploadedAt: Date;
}

export interface RoleWithMeta extends JobRoleRow {
  category?: string;
  description: string;
  skillCount: number;
}

export interface EvidenceDetail {
  skill_name: string;
  evidence_level: EvidenceLevel;
  evidence_text: string | null;
  section_found: string | null;
  explanation: string;
}

export interface ScoringSummary {
  total_required_skills: number;
  strongly_supported_count: number;
  supported_count: number;
  limited_evidence_count: number;
  missing_count: number;
  match_score: number;
  score_explanation: string;
}

export interface AnalysisResult {
  id?: string;
  user_id: string;
  resume_id?: string;
  job_role_id: string;
  job_role_title: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  evidence: EvidenceDetail[];
  summary: ScoringSummary;
  created_at: string;
}

export interface SavedAnalysisSummary {
  id: string;
  job_role_id: string;
  job_role_title: string;
  match_score: number;
  matched_skills_count: number;
  missing_skills_count: number;
  created_at: string;
}

// ── Stage 3 Types ────────────────────────────────────────────────────────────

export type RecommendationStatus = 'not_started' | 'in_progress' | 'completed';
export type RecommendationCategory = 'improve_evidence' | 'practise_skill' | 'develop_skill';

export interface RoadmapRecommendation {
  id: string;
  skill_name: string;
  evidence_level: string;
  category: RecommendationCategory;
  goal: string;
  action: string;
  activity: string;
  expected_outcome: string;
  status: RecommendationStatus;
}

export interface RoadmapResult {
  id: string;
  analysis_id: string;
  job_role_title: string;
  match_score: number;
  recommendations: RoadmapRecommendation[];
  total: number;
  not_started: number;
  in_progress: number;
  completed: number;
  completion_percentage: number;
  created_at: string;
}

export interface SkillInsight {
  skill_name: string;
  evidence_level: string;
  evidence_text: string | null;
  explanation: string;
  insight: string;
  action_type: 'resume_improvement' | 'skill_development' | 'none';
  suggested_action: string;
}

export interface InsightsResult {
  analysis_id: string;
  job_role_title: string;
  match_score: number;
  insights: SkillInsight[];
  strong_count: number;
  supported_count: number;
  limited_count: number;
  missing_count: number;
}

export interface RoleComparisonResult {
  job_role_id: string;
  job_role_title: string;
  analysis_id: string;
  match_score: number;
  total_required: number;
  strong_count: number;
  supported_count: number;
  limited_count: number;
  missing_count: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface CompareRolesResult {
  resume_id: string;
  results: RoleComparisonResult[];
  summary: string;
  best_match_role: string;
  created_at: string;
}

export interface LearningResource {
  skill: string;
  title: string;
  resource_type: 'documentation' | 'tutorial' | 'course' | 'exercise' | 'guide';
  source: string;
  url: string;
  description: string;
  is_free: boolean;
}

export interface LearningResourcesResult {
  skill: string;
  resources: LearningResource[];
}
