/**
 * SkillSync Supabase Database Types
 * Reflects the 6 core tables of the Synvora / SkillSync database
 */

export interface ProfileRow {
  id: string; // references auth.users.id
  full_name: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface JobRoleRow {
  id: string;
  title: string;
  required_skills: string[];
  created_at: string;
  description?: string | null;
}

export interface ResumeRow {
  id: string;
  user_id: string;
  filename: string;
  extracted_text: string | null;
  created_at: string;
}

export interface AnalysisRow {
  id: string;
  user_id: string;
  resume_id: string;
  job_role_id: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  created_at: string;
}

export type EvidenceLevel = 'strong' | 'supported' | 'limited' | 'missing';

export interface SkillEvidenceRow {
  id: string;
  analysis_id: string;
  skill_name: string;
  evidence_text: string;
  evidence_level: EvidenceLevel;
  created_at: string;
}

export interface RoadmapRow {
  id: string;
  analysis_id: string;
  recommendations: Record<string, unknown> | unknown[];
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      job_roles: {
        Row: JobRoleRow;
        Insert: {
          id?: string;
          title: string;
          required_skills: string[];
          created_at?: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          required_skills?: string[];
          created_at?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      resumes: {
        Row: ResumeRow;
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          extracted_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          extracted_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: AnalysisRow;
        Insert: {
          id?: string;
          user_id: string;
          resume_id: string;
          job_role_id: string;
          match_score?: number;
          matched_skills?: string[];
          missing_skills?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string;
          job_role_id?: string;
          match_score?: number;
          matched_skills?: string[];
          missing_skills?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      skill_evidence: {
        Row: SkillEvidenceRow;
        Insert: {
          id?: string;
          analysis_id: string;
          skill_name: string;
          evidence_text: string;
          evidence_level: EvidenceLevel;
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          skill_name?: string;
          evidence_text?: string;
          evidence_level?: EvidenceLevel;
          created_at?: string;
        };
        Relationships: [];
      };
      roadmaps: {
        Row: RoadmapRow;
        Insert: {
          id?: string;
          analysis_id: string;
          recommendations: Record<string, unknown> | unknown[];
          created_at?: string;
        };
        Update: {
          id?: string;
          analysis_id?: string;
          recommendations?: Record<string, unknown> | unknown[];
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
