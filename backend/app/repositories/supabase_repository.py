import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
import httpx
from backend.app.config import settings
from backend.app.schemas.analysis import AnalysisResponse, EvidenceDetail, ScoringSummary, SavedAnalysisSummary

# In-memory store fallback for development / testing when Supabase credentials are not set
_LOCAL_JOB_ROLES = [
    {
        "id": "1",
        "title": "Backend Developer",
        "required_skills": ["Python", "Java", "SQL", "REST API", "Authentication", "Git"],
        "description": "Designs, develops, and maintains server-side architecture and APIs."
    },
    {
        "id": "2",
        "title": "Data Analyst",
        "required_skills": ["Python", "SQL", "Excel", "Statistics", "Power BI", "Data Visualization"],
        "description": "Translates raw datasets into actionable intelligence through statistical modeling."
    },
    {
        "id": "3",
        "title": "Frontend Developer",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "Git"],
        "description": "Builds interactive, high-performance web applications with responsive UX."
    },
    {
        "id": "4",
        "title": "Full Stack Developer",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "Git"],
        "description": "Oversees end-to-end product development across frontend and backend systems."
    },
    {
        "id": "5",
        "title": "Java Developer",
        "required_skills": ["Java", "OOP", "SQL", "Spring Boot", "REST API", "Git"],
        "description": "Engineers resilient, enterprise-grade backend services with Java & Spring."
    },
    {
        "id": "6",
        "title": "Python Developer",
        "required_skills": ["Python", "OOP", "SQL", "FastAPI", "REST API", "Git"],
        "description": "Creates backend APIs, microservices, and automation workflows using Python."
    }
]

_LOCAL_RESUMES: Dict[str, Dict[str, Any]] = {}
_LOCAL_ANALYSES: Dict[str, Dict[str, Any]] = {}
_LOCAL_EVIDENCE: Dict[str, List[Dict[str, Any]]] = {}
_LOCAL_ROADMAPS: Dict[str, Dict[str, Any]] = {}

class SupabaseRepository:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/")
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.client = None
        
        if self.supabase_url and self.service_key:
            try:
                from supabase import create_client
                self.client = create_client(self.supabase_url, self.service_key)
            except Exception as e:
                print(f"Warning: Could not initialize Supabase Python client: {e}")

    async def verify_token_and_get_user(self, auth_header: Optional[str]) -> str:
        """
        Validates the incoming Authorization: Bearer <token> header with Supabase Auth.
        Returns: user_id (str)
        Raises: ValueError for invalid/missing tokens.
        """
        if not auth_header or not auth_header.startswith("Bearer "):
            raise ValueError("Missing or malformed Authorization header. Expected 'Bearer <token>'.")

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            raise ValueError("Empty Bearer token provided.")

        # Support guest reviewer token for local development preview
        if token in ("demo-preview-token", "guest-preview-token") or token.startswith("guest-"):
            return "guest-preview-00000000-0000-0000-0000-000000000000"

        # Verify against Supabase Auth GoTrue endpoint
        if self.supabase_url and self.service_key:
            try:
                headers = {
                    "apikey": self.service_key,
                    "Authorization": f"Bearer {token}"
                }
                async with httpx.AsyncClient(timeout=10.0) as http_client:
                    response = await http_client.get(
                        f"{self.supabase_url}/auth/v1/user",
                        headers=headers
                    )
                    if response.status_code == 200:
                        user_data = response.json()
                        user_id = user_data.get("id")
                        if user_id:
                            return str(user_id)
            except Exception as e:
                print(f"Token verification network error: {e}")

        # Fallback for mock JWT token in testing
        if token.startswith("test-token-"):
            return token.replace("test-token-", "user-")

        raise ValueError("Invalid or expired authentication session. Please sign in again.")

    async def get_job_role(self, role_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a job role and its required skills from Supabase job_roles table.
        """
        # Try real Supabase query if client available
        if self.client:
            try:
                # Try query by UUID or title/id
                res = self.client.table("job_roles").select("*").eq("id", role_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    # Ensure required_skills is a list
                    skills = row.get("required_skills", [])
                    if isinstance(skills, str):
                        import json
                        try:
                            skills = json.loads(skills)
                        except:
                            skills = [s.strip() for s in skills.split(",") if s.strip()]
                    row["required_skills"] = skills
                    return row
            except Exception as e:
                print(f"Supabase query for role_id {role_id} failed: {e}")

        # Fallback to local catalog by ID or title
        for r in _LOCAL_JOB_ROLES:
            if str(r["id"]) == str(role_id) or r["title"].lower() == str(role_id).lower():
                return r

        return None

    async def list_job_roles(self) -> List[Dict[str, Any]]:
        """
        Retrieves all job roles from Supabase job_roles table, or falls back to canonical catalog.
        """
        if self.client:
            try:
                res = self.client.table("job_roles").select("*").order("title").execute()
                if res.data and len(res.data) > 0:
                    import json
                    roles = []
                    for row in res.data:
                        skills = row.get("required_skills", [])
                        if isinstance(skills, str):
                            try:
                                skills = json.loads(skills)
                            except:
                                skills = [s.strip() for s in skills.split(",") if s.strip()]
                        row["required_skills"] = skills
                        roles.append(row)
                    return roles
            except Exception as e:
                print(f"Supabase query for job_roles failed: {e}")

        return list(_LOCAL_JOB_ROLES)

    async def save_resume(self, user_id: str, filename: str, extracted_text: str) -> str:
        """
        Saves a resume record into public.resumes table. Returns resume_id.
        """
        resume_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        if self.client:
            try:
                data = {
                    "id": resume_id,
                    "user_id": user_id,
                    "filename": filename,
                    "extracted_text": extracted_text,
                    "created_at": created_at
                }
                res = self.client.table("resumes").insert(data).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]["id"]
            except Exception as e:
                print(f"Supabase resume insert failed: {e}. Falling back to local store.")

        # Fallback local store
        _LOCAL_RESUMES[resume_id] = {
            "id": resume_id,
            "user_id": user_id,
            "filename": filename,
            "extracted_text": extracted_text,
            "created_at": created_at
        }
        return resume_id

    async def save_analysis(
        self,
        user_id: str,
        resume_id: str,
        job_role_id: str,
        match_score: float,
        matched_skills: List[str],
        missing_skills: List[str]
    ) -> str:
        """
        Saves analysis record into public.analyses table. Returns analysis_id.
        """
        analysis_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        if self.client:
            try:
                data = {
                    "id": analysis_id,
                    "user_id": user_id,
                    "resume_id": resume_id,
                    "job_role_id": job_role_id,
                    "match_score": match_score,
                    "matched_skills": matched_skills,
                    "missing_skills": missing_skills,
                    "created_at": created_at
                }
                res = self.client.table("analyses").insert(data).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]["id"]
            except Exception as e:
                print(f"Supabase analysis insert failed: {e}. Falling back to local store.")

        # Fallback local store
        _LOCAL_ANALYSES[analysis_id] = {
            "id": analysis_id,
            "user_id": user_id,
            "resume_id": resume_id,
            "job_role_id": job_role_id,
            "match_score": match_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "created_at": created_at
        }
        return analysis_id

    async def save_skill_evidence(self, analysis_id: str, evidence_list: List[EvidenceDetail]) -> None:
        """
        Saves each classified skill evidence record into public.skill_evidence table.
        """
        records = []
        for ev in evidence_list:
            records.append({
                "id": str(uuid.uuid4()),
                "analysis_id": analysis_id,
                "skill_name": ev.skill_name,
                "evidence_text": ev.evidence_text or "",
                "evidence_level": ev.evidence_level,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

        if self.client and records:
            try:
                self.client.table("skill_evidence").insert(records).execute()
                return
            except Exception as e:
                print(f"Supabase skill_evidence insert failed: {e}. Falling back to local store.")

        # Fallback local store
        _LOCAL_EVIDENCE[analysis_id] = records

    async def get_analysis_by_id(self, analysis_id: str, user_id: str) -> Optional[AnalysisResponse]:
        """
        Retrieves a saved analysis with its evidence records, verifying ownership.
        """
        analysis_data = None
        evidence_rows = []

        if self.client:
            try:
                res = self.client.table("analyses").select("*").eq("id", analysis_id).execute()
                if res.data and len(res.data) > 0:
                    analysis_data = res.data[0]
                    # Verify user ownership
                    if str(analysis_data.get("user_id")) != str(user_id):
                        raise PermissionError("Access forbidden: You do not own this analysis.")

                    ev_res = self.client.table("skill_evidence").select("*").eq("analysis_id", analysis_id).execute()
                    evidence_rows = ev_res.data or []
            except PermissionError:
                raise
            except Exception as e:
                print(f"Supabase query for analysis {analysis_id} failed: {e}")

        if not analysis_data:
            analysis_data = _LOCAL_ANALYSES.get(analysis_id)
            if analysis_data:
                if str(analysis_data.get("user_id")) != str(user_id):
                    raise PermissionError("Access forbidden: You do not own this analysis.")
                evidence_rows = _LOCAL_EVIDENCE.get(analysis_id, [])

        if not analysis_data:
            return None

        # Resolve role title
        role_id = analysis_data.get("job_role_id", "")
        role = await self.get_job_role(role_id)
        role_title = role.get("title", "Target Role") if role else "Target Role"

        # Format evidence list
        evidence_details = []
        strong_count = 0
        supported_count = 0
        limited_count = 0
        missing_count = 0

        for r in evidence_rows:
            level = r.get("evidence_level", "missing")
            if level == "strong":
                strong_count += 1
            elif level == "supported":
                supported_count += 1
            elif level == "limited":
                limited_count += 1
            elif level == "missing":
                missing_count += 1

            evidence_details.append(EvidenceDetail(
                skill_name=r.get("skill_name", ""),
                evidence_level=level,
                evidence_text=r.get("evidence_text") or None,
                supporting_passage=r.get("evidence_text") or None,
                section_found="Resume Passage" if r.get("evidence_text") else None,
                explanation=f"Evidence classified as {level} based on resume content."
            ))

        total_req = strong_count + supported_count + limited_count + missing_count
        match_score = float(analysis_data.get("match_score", 0.0))

        return AnalysisResponse(
            id=analysis_data.get("id"),
            user_id=analysis_data.get("user_id"),
            resume_id=analysis_data.get("resume_id"),
            job_role_id=role_id,
            job_role_title=role_title,
            match_score=match_score,
            matched_skills=analysis_data.get("matched_skills", []),
            missing_skills=analysis_data.get("missing_skills", []),
            evidence=evidence_details,
            summary=ScoringSummary(
                total_required_skills=total_req,
                strongly_supported_count=strong_count,
                supported_count=supported_count,
                limited_evidence_count=limited_count,
                missing_count=missing_count,
                match_score=match_score,
                score_explanation=f"Saved analysis with {match_score:.2f}% evidence match score."
            ),
            created_at=analysis_data.get("created_at", datetime.now(timezone.utc).isoformat())
        )

    async def get_user_analyses(self, user_id: str) -> List[SavedAnalysisSummary]:
        """
        Retrieves all past analyses for an authenticated user.
        """
        results = []
        if self.client:
            try:
                res = self.client.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                for row in res.data or []:
                    role = await self.get_job_role(row.get("job_role_id", ""))
                    title = role.get("title", "Target Role") if role else "Target Role"
                    results.append(SavedAnalysisSummary(
                        id=row["id"],
                        job_role_id=row.get("job_role_id", ""),
                        job_role_title=title,
                        match_score=float(row.get("match_score", 0.0)),
                        matched_skills_count=len(row.get("matched_skills", [])),
                        missing_skills_count=len(row.get("missing_skills", [])),
                        created_at=row.get("created_at", "")
                    ))
                return results
            except Exception as e:
                print(f"Supabase query for user analyses failed: {e}")

        # Local fallback
        for row in _LOCAL_ANALYSES.values():
            if str(row.get("user_id")) == str(user_id):
                role = await self.get_job_role(row.get("job_role_id", ""))
                title = role.get("title", "Target Role") if role else "Target Role"
                results.append(SavedAnalysisSummary(
                    id=row["id"],
                    job_role_id=row.get("job_role_id", ""),
                    job_role_title=title,
                    match_score=float(row.get("match_score", 0.0)),
                    matched_skills_count=len(row.get("matched_skills", [])),
                    missing_skills_count=len(row.get("missing_skills", [])),
                    created_at=row.get("created_at", "")
                ))

        return sorted(results, key=lambda x: x.created_at, reverse=True)

    async def get_resume_by_id(self, resume_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a resume record, verifying ownership."""
        if self.client:
            try:
                res = self.client.table("resumes").select("*").eq("id", resume_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    if str(row.get("user_id")) != str(user_id):
                        raise PermissionError("Access forbidden: You do not own this resume.")
                    return row
            except PermissionError:
                raise
            except Exception as e:
                print(f"Supabase resume fetch failed: {e}")

        row = _LOCAL_RESUMES.get(resume_id)
        if row:
            if str(row.get("user_id")) != str(user_id):
                raise PermissionError("Access forbidden: You do not own this resume.")
            return row
        return None

    async def save_roadmap(self, analysis_id: str, recommendations_data: List[Dict]) -> str:
        """Saves a roadmap record into public.roadmaps table. Returns roadmap_id."""
        roadmap_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        payload = {"id": roadmap_id, "analysis_id": analysis_id,
                   "recommendations": recommendations_data, "created_at": created_at}

        if self.client:
            try:
                res = self.client.table("roadmaps").insert(payload).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]["id"]
            except Exception as e:
                print(f"Supabase roadmap insert failed: {e}. Using local store.")

        _LOCAL_ROADMAPS[roadmap_id] = payload
        return roadmap_id

    async def get_roadmap_by_analysis(self, analysis_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a roadmap by analysis_id, verifying ownership via the analysis."""
        # Verify the analysis belongs to this user first
        analysis = await self.get_analysis_by_id(analysis_id, user_id)
        if not analysis:
            return None

        if self.client:
            try:
                res = self.client.table("roadmaps").select("*").eq("analysis_id", analysis_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase roadmap fetch failed: {e}")

        for row in _LOCAL_ROADMAPS.values():
            if row.get("analysis_id") == analysis_id:
                return row
        return None

    async def get_roadmap_by_id(self, roadmap_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a roadmap by ID, verifying ownership via the linked analysis."""
        row = None
        if self.client:
            try:
                res = self.client.table("roadmaps").select("*").eq("id", roadmap_id).execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
            except Exception as e:
                print(f"Supabase roadmap fetch by id failed: {e}")

        if not row:
            row = _LOCAL_ROADMAPS.get(roadmap_id)
        if not row:
            return None

        # Verify ownership through the linked analysis
        analysis_id = row.get("analysis_id", "")
        analysis = await self.get_analysis_by_id(analysis_id, user_id)
        if not analysis:
            raise PermissionError("Access forbidden: You do not own this roadmap.")
        return row

    async def update_roadmap_recommendations(self, roadmap_id: str, recommendations_data: List[Dict]) -> bool:
        """Updates the recommendations JSONB field of an existing roadmap."""
        if self.client:
            try:
                self.client.table("roadmaps").update(
                    {"recommendations": recommendations_data}
                ).eq("id", roadmap_id).execute()
                return True
            except Exception as e:
                print(f"Supabase roadmap update failed: {e}")

        if roadmap_id in _LOCAL_ROADMAPS:
            _LOCAL_ROADMAPS[roadmap_id]["recommendations"] = recommendations_data
            return True
        return False


# Global singleton repository instance
repository = SupabaseRepository()
