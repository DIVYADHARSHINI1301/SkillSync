from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime, timezone

EvidenceLevel = Literal['strong', 'supported', 'limited', 'missing']

class EvidenceDetail(BaseModel):
    skill_name: str
    evidence_level: EvidenceLevel
    evidence_text: Optional[str] = Field(None, description="Exact passage extracted from resume supporting the skill")
    supporting_passage: Optional[str] = Field(None, description="Supporting passage alias for test clients")
    section_found: Optional[str] = Field(None, description="Section where evidence was found: Skills, Projects, Experience, Education, etc.")
    explanation: str = Field(..., description="Clear explanation of why this evidence level was assigned")

class ScoringSummary(BaseModel):
    total_required_skills: int
    strongly_supported_count: int
    supported_count: int
    limited_evidence_count: int
    missing_count: int
    match_score: float
    score_explanation: str

class AnalysisResponse(BaseModel):
    id: Optional[str] = None
    user_id: str
    resume_id: Optional[str] = None
    job_role_id: str
    job_role_title: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    evidence: List[EvidenceDetail]
    summary: ScoringSummary
    scoring_summary: Optional[ScoringSummary] = None
    evidence_breakdown: Optional[List[EvidenceDetail]] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def model_post_init(self, __context):
        if self.scoring_summary is None:
            self.scoring_summary = self.summary
        if self.evidence_breakdown is None:
            self.evidence_breakdown = self.evidence

class SavedAnalysisSummary(BaseModel):
    id: str
    job_role_id: str
    job_role_title: str
    match_score: float
    matched_skills_count: int
    missing_skills_count: int
    created_at: str
    filename: Optional[str] = "resume.pdf"

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
