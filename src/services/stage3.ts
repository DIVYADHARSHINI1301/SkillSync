import {
  InsightsResult,
  CompareRolesResult,
  RoadmapResult,
  LearningResourcesResult,
  RecommendationStatus,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function authHeaders(token?: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<{ data: T | null; error: string | null }> {
  if (res.ok) {
    const data: T = await res.json();
    return { data, error: null };
  }
  let msg = `Request failed (${res.status})`;
  try {
    const err = await res.json();
    if (err.detail) msg = err.detail;
  } catch { /* use default */ }
  if (res.status === 401) msg = 'Your session has expired. Please sign in again.';
  if (res.status === 403) msg = 'You do not have permission to access this resource.';
  if (res.status === 404) msg = 'The requested resource was not found.';
  return { data: null, error: msg };
}

// ── Insights ──────────────────────────────────────────────────────────────────
export async function fetchInsights(
  analysisId: string,
  token?: string | null
): Promise<{ data: InsightsResult | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/stage3/insights/${encodeURIComponent(analysisId)}`, {
      headers: authHeaders(token),
    });
    return handleResponse<InsightsResult>(res);
  } catch (e) {
    return { data: null, error: 'Could not connect to the analysis backend.' };
  }
}

// ── Multi-role Comparison ─────────────────────────────────────────────────────
export async function compareRoles(
  resumeId: string,
  roleIds: string[],
  token?: string | null
): Promise<{ data: CompareRolesResult | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/stage3/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ resume_id: resumeId, role_ids: roleIds }),
    });
    return handleResponse<CompareRolesResult>(res);
  } catch (e) {
    return { data: null, error: 'Could not connect to the analysis backend.' };
  }
}

// ── Roadmaps ──────────────────────────────────────────────────────────────────
export async function createRoadmap(
  analysisId: string,
  token?: string | null
): Promise<{ data: RoadmapResult | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/stage3/roadmaps?analysis_id=${encodeURIComponent(analysisId)}`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return handleResponse<RoadmapResult>(res);
  } catch (e) {
    return { data: null, error: 'Could not create roadmap.' };
  }
}

export async function fetchRoadmapByAnalysis(
  analysisId: string,
  token?: string | null
): Promise<{ data: RoadmapResult | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/stage3/roadmaps/analysis/${encodeURIComponent(analysisId)}`, {
      headers: authHeaders(token),
    });
    if (res.status === 404) return { data: null, error: null }; // no roadmap yet — not an error
    return handleResponse<RoadmapResult>(res);
  } catch (e) {
    return { data: null, error: 'Could not load roadmap.' };
  }
}

export async function updateRecommendationStatus(
  roadmapId: string,
  recommendationId: string,
  newStatus: RecommendationStatus,
  token?: string | null
): Promise<{ data: RoadmapResult | null; error: string | null }> {
  try {
    const res = await fetch(
      `${API_BASE}/stage3/roadmaps/${encodeURIComponent(roadmapId)}/recommendations/${encodeURIComponent(recommendationId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    return handleResponse<RoadmapResult>(res);
  } catch (e) {
    return { data: null, error: 'Could not update recommendation status.' };
  }
}

// ── Learning Resources ────────────────────────────────────────────────────────
export async function fetchLearningResources(
  skills: string[]
): Promise<{ data: LearningResourcesResult[] | null; error: string | null }> {
  if (!skills.length) return { data: [], error: null };
  try {
    const params = skills.join(',');
    const res = await fetch(`${API_BASE}/stage3/learning-resources?skills=${encodeURIComponent(params)}`);
    return handleResponse<LearningResourcesResult[]>(res);
  } catch (e) {
    return { data: null, error: 'Could not load learning resources.' };
  }
}
