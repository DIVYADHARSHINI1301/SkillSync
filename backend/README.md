# SkillSync Backend — Stage 2 Resume Analysis Engine

This directory contains the Python FastAPI backend that powers the SkillSync resume analysis engine.

---

## 1. What the Stage 2 Engine Does

When a user uploads a PDF resume and selects a job role, the backend:

1. Validates the user's Supabase authentication token.
2. Retrieves the selected role's required skills from the Supabase `job_roles` table.
3. Validates the uploaded PDF (size, magic bytes, readability).
4. Extracts readable text from the PDF using **PyMuPDF**.
5. Identifies which required skills appear in the resume text using a canonical skill dictionary with aliases.
6. Finds the most relevant supporting passage for each skill.
7. Classifies each skill into one of four evidence levels: `strong`, `supported`, `limited`, or `missing`.
8. Calculates an explainable match score using documented evidence weights.
9. Saves the resume, analysis, and skill evidence records to Supabase.
10. Returns a structured JSON response that the frontend displays.

---

## 2. Evidence Classification Rules

| Level | Meaning | Example |
|---|---|---|
| **Strong** | Skill applied in a project or experience with an action verb and implementation context | "Developed a REST API using FastAPI and implemented JWT authentication." |
| **Supported** | Skill connected to a project or activity but with limited implementation detail | "Used React for a college web portal." |
| **Limited** | Skill listed in a skills section with no project or experience context | "Technical Skills: Python, SQL, Git." |
| **Missing** | Required skill not found anywhere in the resume | — |

These rules are heuristic. The same resume text always produces the same classification (deterministic).

---

## 3. Scoring Formula

```
Match Score = (Sum of Evidence Weights / Total Required Skills) × 100
```

| Evidence Level | Weight |
|---|---|
| Strong | 1.0 |
| Supported | 0.7 |
| Limited | 0.3 |
| Missing | 0.0 |

**Example** (Python Developer role, 6 required skills):

| Skill | Level | Weight |
|---|---|---|
| Python | Strong | 1.0 |
| SQL | Supported | 0.7 |
| FastAPI | Supported | 0.7 |
| REST API | Limited | 0.3 |
| OOP | Missing | 0.0 |
| Git | Missing | 0.0 |

Score = (2.7 / 6) × 100 = **45.00%**

Weights are configured in `app/config.py` under `EVIDENCE_WEIGHTS`. They are an initial heuristic and have not been scientifically validated.

---

## 4. Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── health.py          # GET /api/health
│   │       ├── analysis.py        # POST /api/analysis, GET /api/analysis/{id}, GET /api/analysis/user/history
│   │       └── stage3.py          # Stage 3: insights, compare, roadmap, learning resources
│   ├── core/
│   │   └── config.py              # Re-exports settings
│   ├── repositories/
│   │   └── supabase_repository.py # All Supabase read/write operations + token verification
│   ├── schemas/
│   │   ├── analysis.py            # Stage 2 Pydantic request/response models
│   │   └── stage3.py              # Stage 3 Pydantic models
│   ├── services/
│   │   ├── pdf_parser.py          # PyMuPDF text extraction and validation
│   │   ├── skill_extractor.py     # Canonical skill dictionary + regex matching
│   │   ├── evidence_classifier.py # 4-tier evidence classification rules
│   │   ├── matching_engine.py     # Compares resume against role requirements
│   │   ├── scoring_engine.py      # Calculates weighted match score
│   │   ├── analysis_service.py    # Orchestrates the full analysis pipeline
│   │   ├── insights_service.py    # Stage 3: generates skill insights from evidence
│   │   ├── roadmap_service.py     # Stage 3: generates and manages roadmap recommendations
│   │   └── learning_resources.py  # Stage 3: verified learning resource catalogue
│   ├── utils/
│   │   └── text_normalizer.py     # Text cleaning, section segmentation, sentence splitting
│   ├── config.py                  # Settings loaded from environment variables
│   └── main.py                    # FastAPI application entry point
├── tests/
│   ├── test_health.py
│   ├── test_pdf_parser.py
│   ├── test_skill_extractor.py
│   ├── test_evidence_classifier.py
│   ├── test_matching_engine.py
│   ├── test_scoring_engine.py
│   ├── test_analysis_api.py
│   └── test_stage3.py             # 22 Stage 3 tests
├── .env                           # Your local credentials (not committed)
├── .env.example                   # Template — copy to .env and fill in values
├── requirements.txt
└── README.md
```

---

## 5. API Endpoints

### Stage 2 Endpoints

#### `GET /api/health`
Returns service status. No authentication required.

```json
{ "status": "ok", "service": "skillsync-backend", "version": "0.2.0" }
```

#### `POST /api/analysis`
Analyzes a resume PDF against a selected job role.

- **Auth:** `Authorization: Bearer <supabase_access_token>` (required)
- **Body:** `multipart/form-data` with `file` (PDF) and `job_role_id` (string)
- **Returns:** Full `AnalysisResponse` with score, evidence, and summary

#### `GET /api/analysis/{analysis_id}`
Retrieves a saved analysis by ID. Returns `403` if the authenticated user does not own it.

#### `GET /api/analysis/user/history`
Returns all past analyses for the authenticated user, ordered newest first.

### Stage 3 Endpoints

#### `GET /api/stage3/insights/{analysis_id}`
Generates skill insights from a saved analysis. Returns one insight per required skill with evidence level, supporting passage, explanation, and suggested action.

#### `POST /api/stage3/compare`
Compares a resume against 2–4 job roles. Body: `{ "resume_id": "...", "role_ids": ["...", "..."] }`. Each role is analyzed against its own requirements using the Stage 2 scoring formula. Results are saved to Supabase.

#### `POST /api/stage3/roadmaps?analysis_id=`
Generates a personalized roadmap from a saved analysis. Returns existing roadmap if one already exists for that analysis.

#### `GET /api/stage3/roadmaps/analysis/{analysis_id}`
Retrieves an existing roadmap by analysis ID. Returns `404` if no roadmap has been generated yet.

#### `PATCH /api/stage3/roadmaps/{roadmap_id}/recommendations/{rec_id}`
Updates a single recommendation's status. Body: `{ "status": "not_started" | "in_progress" | "completed" }`. Ownership is verified before any update.

#### `GET /api/stage3/learning-resources/{skill}`
Returns verified learning resources for a single skill name.

#### `GET /api/stage3/learning-resources?skills=Python,SQL,Git`
Returns resources for multiple comma-separated skill names.

---

## 6. Local Development Setup (Windows)

### Prerequisites
- Python 3.11 or later
- Node.js v18 or later (for the frontend)

### Step 1 — Create and activate a virtual environment

```powershell
cd C:\Users\Admin\OneDrive\Desktop\skillsync
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### Step 2 — Install backend dependencies

```powershell
pip install -r backend/requirements.txt
```

### Step 3 — Configure environment variables

```powershell
copy backend\.env.example backend\.env
```

Open `backend\.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

> The service role key is required for backend inserts that bypass RLS. Keep it only in the backend `.env`. Never put it in the frontend `.env`.

### Step 4 — Start the FastAPI backend

```powershell
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

### Step 5 — Start the Vite frontend (separate terminal)

```powershell
npm install
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://127.0.0.1:8000`, so the frontend and backend work together at `http://localhost:5173`.

### Step 6 — Verify the health endpoint

```powershell
python -c "import urllib.request, json; r=urllib.request.urlopen('http://127.0.0.1:8000/api/health'); print(json.loads(r.read()))"
```

Expected output: `{'status': 'ok', 'service': 'skillsync-backend', 'version': '0.2.0'}`

### Step 7 — Run a live analysis test

```powershell
python test_live_analysis.py
```

This sends `test_resume_alex_chen.pdf` to the backend using the guest preview token and prints the full evidence report.

---

## 7. Running Tests

Run all 54 backend tests (Stages 1, 2, and 3) from the project root:

```powershell
python -m pytest backend/tests/ -v
```

All tests use in-memory PDF generation (PyMuPDF) and the local in-memory fallback store. No real Supabase credentials are required to run the tests.

---

## 8. Security Model

- The backend validates every request's Supabase JWT against the Supabase Auth `/auth/v1/user` endpoint.
- User identity is extracted from the verified token — never trusted from the request body.
- The service role key is used only on the backend for database writes that require bypassing RLS.
- Resume ownership is verified before returning any saved analysis.
- No resume text is logged in full. Temporary file bytes are discarded after processing.
- RLS policies on `skill_evidence` and `roadmaps` are preserved. Inserts go through the service role key on the backend only.

---

## 9. Current Limitations

- Evidence classification is rule-based (regex + heuristics). It may misclassify unusual resume formats.
- The skill dictionary covers the 6 configured job roles. Skills outside the taxonomy are not detected.
- Scanned or image-based PDFs are rejected with a clear message. OCR is not implemented in Stage 2.
- The scoring weights (1.0 / 0.7 / 0.3 / 0.0) are an initial heuristic and have not been validated against hiring outcomes.
- The system evaluates resume text only. It cannot verify real-world competency.

---

## 10. Stage 3 Extension Points

Stage 3 is fully implemented. The following hooks remain available for Stage 4:

- `AnalysisResponse` includes `evidence` and `summary` fields used by all Stage 3 services.
- The `roadmaps` Supabase table stores recommendations as JSONB. The schema is compatible with future extensions (e.g., adding `due_date` or `notes` fields without breaking existing records).
- `matching_engine.py` returns a `MatchingResult` object reused by both the Stage 2 analysis endpoint and the Stage 3 compare endpoint.
- `insights_service.py` and `roadmap_service.py` are deterministic and stateless — they can be extended with AI-assisted wording without changing the core evidence logic.
- `learning_resources.py` uses a static catalogue. It can be replaced with a dynamic lookup without changing the API contract.
