from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone

RecommendationStatus = Literal['not_started', 'in_progress', 'completed']
RecommendationCategory = Literal['improve_evidence', 'practise_skill', 'develop_skill']


class RoadmapRecommendation(BaseModel):
    id: str
    skill_name: str
    evidence_level: str
    category: RecommendationCategory
    goal: str
    action: str
    activity: str
    expected_outcome: str
    status: RecommendationStatus = 'not_started'


class RoadmapResponse(BaseModel):
    id: str
    analysis_id: str
    job_role_title: str
    match_score: float
    recommendations: List[RoadmapRecommendation]
    total: int
    not_started: int
    in_progress: int
    completed: int
    completion_percentage: float
    created_at: str


class UpdateRecommendationRequest(BaseModel):
    status: RecommendationStatus


class SkillInsight(BaseModel):
    skill_name: str
    evidence_level: str
    evidence_text: Optional[str] = None
    explanation: str
    insight: str
    action_type: Literal['resume_improvement', 'skill_development', 'none']
    suggested_action: str


class InsightsResponse(BaseModel):
    analysis_id: str
    job_role_title: str
    match_score: float
    insights: List[SkillInsight]
    strong_count: int
    supported_count: int
    limited_count: int
    missing_count: int


class CompareRolesRequest(BaseModel):
    role_ids: List[str] = Field(..., min_length=2, max_length=4)
    resume_id: str


class RoleComparisonResult(BaseModel):
    job_role_id: str
    job_role_title: str
    analysis_id: str
    match_score: float
    total_required: int
    strong_count: int
    supported_count: int
    limited_count: int
    missing_count: int
    matched_skills: List[str]
    missing_skills: List[str]


class CompareRolesResponse(BaseModel):
    resume_id: str
    results: List[RoleComparisonResult]
    summary: str
    best_match_role: str
    created_at: str


class LearningResource(BaseModel):
    skill: str
    title: str
    resource_type: Literal['documentation', 'tutorial', 'course', 'exercise', 'guide']
    source: str
    url: str
    description: str
    is_free: bool = True


class LearningResourcesResponse(BaseModel):
    skill: str
    resources: List[LearningResource]
