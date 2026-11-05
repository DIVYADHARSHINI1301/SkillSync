from typing import List, Dict, Set
from backend.app.schemas.analysis import EvidenceDetail
from backend.app.services.skill_extractor import extract_all_skill_matches
from backend.app.services.evidence_classifier import classify_skill_evidence

class MatchingResult:
    def __init__(
        self,
        job_role_id: str,
        job_role_title: str,
        required_skills: List[str],
        evidence_list: List[EvidenceDetail],
        matched_skills: List[str],
        missing_skills: List[str],
        strongly_supported_count: int,
        supported_count: int,
        limited_evidence_count: int,
        missing_count: int
    ):
        self.job_role_id = job_role_id
        self.job_role_title = job_role_title
        self.required_skills = required_skills
        self.evidence_list = evidence_list
        self.matched_skills = matched_skills
        self.missing_skills = missing_skills
        self.strongly_supported_count = strongly_supported_count
        self.supported_count = supported_count
        self.limited_evidence_count = limited_evidence_count
        self.missing_count = missing_count

def match_resume_against_role(
    resume_text: str,
    job_role_id: str,
    job_role_title: str,
    required_skills: List[str]
) -> MatchingResult:
    """
    Compares extracted resume text against required skills for a target job role.
    Extracts evidence and ensures mutually exclusive category counts.
    """
    required_set: Set[str] = set(required_skills)
    
    # 1. Extract all occurrences of relevant skills in resume
    skill_matches_map = extract_all_skill_matches(resume_text, target_skills=required_set)
    
    evidence_list: List[EvidenceDetail] = []
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    
    strong_count = 0
    supported_count = 0
    limited_count = 0
    missing_count = 0
    
    # 2. Classify each required skill deterministically
    for skill in required_skills:
        matches = skill_matches_map.get(skill)
        detail = classify_skill_evidence(skill, matches)
        evidence_list.append(detail)
        
        if detail.evidence_level == "strong":
            strong_count += 1
            matched_skills.append(skill)
        elif detail.evidence_level == "supported":
            supported_count += 1
            matched_skills.append(skill)
        elif detail.evidence_level == "limited":
            limited_count += 1
            matched_skills.append(skill)
        elif detail.evidence_level == "missing":
            missing_count += 1
            missing_skills.append(skill)

    return MatchingResult(
        job_role_id=job_role_id,
        job_role_title=job_role_title,
        required_skills=required_skills,
        evidence_list=evidence_list,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        strongly_supported_count=strong_count,
        supported_count=supported_count,
        limited_evidence_count=limited_count,
        missing_count=missing_count
    )
