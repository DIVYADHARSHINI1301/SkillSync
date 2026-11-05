from typing import Tuple
from backend.app.schemas.analysis import AnalysisResponse
from backend.app.services.pdf_parser import validate_and_extract_pdf_text
from backend.app.services.matching_engine import match_resume_against_role
from backend.app.services.scoring_engine import calculate_match_score
from backend.app.repositories.supabase_repository import repository

class AnalysisService:
    def __init__(self, repo=None):
        self.repo = repo or repository

    async def run_analysis(
        self,
        file_bytes: bytes,
        filename: str,
        job_role_id: str,
        auth_header: str
    ) -> AnalysisResponse:
        """
        Orchestrates the complete Resume Analysis workflow:
        1. Validate authentication token and get authenticated user_id
        2. Retrieve selected job role requirements from Supabase
        3. Validate PDF format and extract readable text
        4. Match resume content against required skills
        5. Calculate explainable match score and dynamic explanation
        6. Persist resume, analysis, and skill_evidence records
        7. Return structured AnalysisResponse
        """
        # 1. Authenticate user
        user_id = await self.repo.verify_token_and_get_user(auth_header)

        # 2. Retrieve job role requirements
        role = await self.repo.get_job_role(job_role_id)
        if not role:
            raise ValueError(f"Job role with ID '{job_role_id}' was not found in the database catalog.")

        role_title = role.get("title", "Target Role")
        required_skills = role.get("required_skills", [])
        if not required_skills:
            raise ValueError(f"No required skills are configured for '{role_title}'.")

        # 3. Extract text from PDF
        extracted_text, page_count = validate_and_extract_pdf_text(file_bytes, filename=filename)

        # 4. Match resume against target role
        matching_result = match_resume_against_role(
            resume_text=extracted_text,
            job_role_id=job_role_id,
            job_role_title=role_title,
            required_skills=required_skills
        )

        # 5. Calculate match score
        summary = calculate_match_score(
            strongly_supported_count=matching_result.strongly_supported_count,
            supported_count=matching_result.supported_count,
            limited_evidence_count=matching_result.limited_evidence_count,
            missing_count=matching_result.missing_count
        )

        # 6. Save resume in Supabase
        resume_id = await self.repo.save_resume(
            user_id=user_id,
            filename=filename,
            extracted_text=extracted_text
        )

        # 7. Save analysis in Supabase
        analysis_id = await self.repo.save_analysis(
            user_id=user_id,
            resume_id=resume_id,
            job_role_id=job_role_id,
            match_score=summary.match_score,
            matched_skills=matching_result.matched_skills,
            missing_skills=matching_result.missing_skills
        )

        # 8. Save skill evidence in Supabase
        await self.repo.save_skill_evidence(
            analysis_id=analysis_id,
            evidence_list=matching_result.evidence_list
        )

        # 9. Return structured response
        return AnalysisResponse(
            id=analysis_id,
            user_id=user_id,
            resume_id=resume_id,
            job_role_id=job_role_id,
            job_role_title=role_title,
            match_score=summary.match_score,
            matched_skills=matching_result.matched_skills,
            missing_skills=matching_result.missing_skills,
            evidence=matching_result.evidence_list,
            summary=summary
        )

analysis_service = AnalysisService()
