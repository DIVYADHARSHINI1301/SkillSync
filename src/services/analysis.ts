import { AnalysisResult, SavedAnalysisSummary } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface AnalysisError {
  message: string;
  statusCode?: number;
}

export async function checkBackendHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `Connected to ${data.service || 'backend'} (v${data.version || '0.2.0'})` };
    }
    return { ok: false, message: `Backend returned status ${res.status}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Could not reach backend at ${API_BASE}: ${msg}` };
  }
}

export async function submitResumeAnalysis(
  file: File,
  jobRoleId: string,
  accessToken?: string | null
): Promise<{ result: AnalysisResult | null; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_role_id', jobRoleId);

    const token = accessToken || (localStorage.getItem('skillsync_guest_session') ? 'guest-preview-token' : '');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/analysis`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = 'Failed to analyze resume.';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = errorData.detail;
        }
      } catch {
        // use default error message if JSON parsing fails
      }

      if (response.status === 401) {
        return { result: null, error: 'Your session has expired. Please sign in again to analyze your resume.' };
      }
      if (response.status === 413) {
        return { result: null, error: 'The uploaded file exceeds the 5 MB size limit. Please upload a smaller PDF.' };
      }
      if (response.status === 400) {
        return { result: null, error: errorMsg };
      }
      if (response.status === 404) {
        return { result: null, error: 'The selected job role was not found. Please re-select a role from the catalog.' };
      }

      return { result: null, error: errorMsg };
    }

    const data: AnalysisResult = await response.json();
    return { result: data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error connecting to analysis microservice.';
    return {
      result: null,
      error: `Could not connect to the SkillSync analysis backend. Please ensure the backend is running. (${msg})`,
    };
  }
}

export async function fetchAnalysisHistory(
  accessToken?: string | null
): Promise<{ analyses: SavedAnalysisSummary[]; error: string | null }> {
  try {
    const token = accessToken || (localStorage.getItem('skillsync_guest_session') ? 'guest-preview-token' : '');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/analysis/user/history`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return { analyses: [], error: 'Failed to retrieve analysis history.' };
    }

    const data: SavedAnalysisSummary[] = await response.json();
    return { analyses: data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error.';
    return { analyses: [], error: `Could not load history: ${msg}` };
  }
}

export async function fetchAnalysisById(
  analysisId: string,
  accessToken?: string | null
): Promise<{ analysis: AnalysisResult | null; error: string | null }> {
  try {
    const token = accessToken || (localStorage.getItem('skillsync_guest_session') ? 'guest-preview-token' : '');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/analysis/${encodeURIComponent(analysisId)}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 403) {
        return { analysis: null, error: 'You do not have permission to view this analysis.' };
      }
      if (response.status === 404) {
        return { analysis: null, error: 'Analysis record was not found.' };
      }
      return { analysis: null, error: 'Failed to load analysis details.' };
    }

    const data: AnalysisResult = await response.json();
    return { analysis: data, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error.';
    return { analysis: null, error: `Could not load analysis: ${msg}` };
  }
}
