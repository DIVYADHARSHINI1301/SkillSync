# SkillSync — Evidence-Based Resume Analysis & Career Readiness

SkillSync is an evidence-based resume analysis and career readiness platform designed primarily for college students, fresh graduates, and job seekers. Unlike traditional resume tools that merely match keyword occurrences and present arbitrary, unexplained percentage scores, SkillSync evaluates whether a candidate's skills are substantiated by genuine evidence in project descriptions, work experience, education, and internship achievements.

SkillSync connects **resume evidence**, **job requirements**, **explainable matching**, and **personalized career improvement**.

---

## 1. The Evidence Distinction Principle

The central thesis of SkillSync is that a resume document represents claims that require contextual evidence:
- **Strong Evidence:** A skill is actively demonstrated in a technical project or work experience with clear implementation context and measurable impact.
- **Supported Evidence:** A skill is mentioned with moderate context within a relevant project, course, or responsibilities list.
- **Limited Evidence:** A skill is merely listed in a standalone skills matrix or bullet list with no supporting narrative.
- **Missing:** An essential requirement for the target job role is completely absent from the resume text.

SkillSync evaluates what is written in the resume document — it does not claim to independently verify real-world competency. Missing resume evidence does not automatically mean missing ability.

---

## 2. Four-Stage Development Plan

| Stage | Focus | Status |
| :--- | :--- | :--- |
| **Stage 1** | Product Foundation, Website, Database Integration, and Core User Flow | **Completed** |
| **Stage 2** | Resume Analysis Engine (PyMuPDF, Explainable Scoring Microservice) | **Completed** |
| **Stage 3** | Career Intelligence, Multi-Role Comparison, Evidence Visualization, and Personalized Learning Roadmaps | **Completed** |
| **Stage 4** | Hardening, End-to-End Testing, and Production Deployments (Vercel & Render) | *Planned* |

---

## 3. What Works in Stage 1

- [x] Professional, accessible UI with React, Vite, TypeScript, and Tailwind CSS.
- [x] Public landing page with hero section, 4-step workflow, and features overview.
- [x] Supabase authentication: registration, sign in, sign out, and session persistence.
- [x] Protected dashboard with secure route guards.
- [x] Real database role catalog from Supabase `job_roles` table.
- [x] Client-side PDF validation: drag-and-drop, 5 MB limit, `%PDF` magic byte verification.
- [x] User profile management keyed to Supabase Auth UUIDs.
- [x] Settings page with database connection diagnostics.
- [x] Authentic empty states — no fake scores or fabricated records.

---

## 4. What Works in Stage 2

- [x] PDF text extraction via PyMuPDF.
- [x] Canonical skill dictionary with alias matching (covers all 6 configured roles).
- [x] 4-tier evidence classification: `strong`, `supported`, `limited`, `missing`.
- [x] Explainable match score using documented evidence weights (1.0 / 0.7 / 0.3 / 0.0).
- [x] Supporting resume passage extraction for each classified skill.
- [x] Secure persistence to Supabase `resumes`, `analyses`, and `skill_evidence` tables.
- [x] Analysis history page with full evidence report viewer.
- [x] FastAPI backend with authentication, ownership checks, and RLS preservation.

---

## 5. What Works in Stage 3

### 5.1 Skill Insights (`/dashboard/insights`)
- Generates a human-readable insight for every required skill based on its saved evidence classification.
- Explains what each evidence level means in plain language.
- Shows the actual supporting resume passage when available.
- Provides a suggested action appropriate to the evidence level (resume improvement or skill development).
- Correctly distinguishes between missing resume evidence and missing ability — the system never claims a user lacks a skill simply because the resume does not mention it.
- Summary bar shows counts for Strong, Supported, Limited, and Missing skills.

### 5.2 Visual Skill-Evidence Map (within Insights)
- One expandable card per required skill showing evidence level, badge, resume passage, and suggested action.
- Color-coded badges with readable text labels (not color alone).
- Accessible contrast and responsive layout.

### 5.3 Multi-Role Comparison (`/dashboard/compare`)
- Select 2–4 job roles to compare against a saved resume.
- Each role is analyzed against its own required skills using the same Stage 2 scoring formula.
- Results show match score, evidence counts, and skills to address per role.
- Best-match role is highlighted.
- A plain-language summary is generated from actual comparison data.
- Each comparison analysis is saved to Supabase with correct user/resume/role associations.
- Duplicate role selections are prevented.

### 5.4 Skill-Gap Analysis (within Insights and Roadmap)
- Skills are grouped by evidence level: strong/supported, limited, missing.
- Recommendations distinguish between resume-evidence gaps (improve description) and potential learning gaps (develop the skill).
- No unsupported claims about a user's ability are made.

### 5.5 Personalized Roadmap (`/dashboard/roadmap`)
- Generates a structured action plan from the saved analysis evidence.
- Three recommendation categories:
  - **Improve Resume Evidence** — for strong, supported, and limited skills.
  - **Practise Existing Skill** — for missing skills where the user may already have experience.
  - **Develop New Skill** — for missing skills where learning may be needed.
- Missing skills generate both a practise option and a develop option, since the system cannot determine which applies.
- All recommendations start as `not_started`.
- Users can update each recommendation to `in_progress` or `completed`.
- Progress persists across sessions via Supabase `roadmaps` table.
- Progress bar and counts (not started / in progress / completed) are calculated from actual saved statuses.
- Roadmaps are saved securely — ownership is verified through the linked analysis before any read or write.

### 5.6 Learning Resources (`/dashboard/resources`)
- Curated catalogue of verified resources for each skill in the taxonomy.
- Resources are prioritized for skills with limited or missing evidence.
- Each resource includes: title, type badge, source name, description, free/paid indicator, and URL.
- All URLs are official documentation or well-established free platforms.
- Skill filter tabs allow focusing on a single skill's resources.
- Opening a resource does not alter the evidence classification — only re-analyzing an updated resume does that.

### 5.7 Dashboard Integration
- Stage 3 Career Intelligence section appears on the main dashboard when at least one analysis exists.
- Shows quick-access cards for Skill Insights, My Roadmap, Compare Roles, and Learning Resources.
- Displays the latest roadmap progress bar and status counts if a roadmap has been generated.
- All values come from real saved data — no hardcoded sample content.

### 5.8 Post-Analysis Navigation
- After completing a resume analysis, the result card shows direct links to Skill Insights and Generate Roadmap for that analysis.

---

## 6. Technology Stack

### Frontend
- **Framework:** React 19 + Vite 8 + TypeScript
- **Styling:** Tailwind CSS v4 + Lucide React icons
- **Routing:** React Router v7
- **Database & Auth Client:** `@supabase/supabase-js` v2

### Backend
- **Framework:** Python 3.13 + FastAPI
- **PDF Extraction:** PyMuPDF (`fitz`)
- **Database:** PostgreSQL hosted on Supabase (Project: **Synvora**)
- **Authentication:** Supabase Auth (JWT, email/password)

---

## 7. Project Directory Structure

```
skillsync/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── health.py          # GET /api/health
│   │   │   ├── analysis.py        # Stage 2 analysis endpoints
│   │   │   └── stage3.py          # Stage 3 insights, compare, roadmap, resources
│   │   ├── repositories/
│   │   │   └── supabase_repository.py
│   │   ├── schemas/
│   │   │   ├── analysis.py        # Stage 2 Pydantic models
│   │   │   └── stage3.py          # Stage 3 Pydantic models
│   │   ├── services/
│   │   │   ├── analysis_service.py
│   │   │   ├── evidence_classifier.py
│   │   │   ├── insights_service.py    # Stage 3: skill insight generation
│   │   │   ├── learning_resources.py  # Stage 3: verified resource catalogue
│   │   │   ├── matching_engine.py
│   │   │   ├── pdf_parser.py
│   │   │   ├── roadmap_service.py     # Stage 3: roadmap generation & progress
│   │   │   └── scoring_engine.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_stage3.py         # 22 Stage 3 tests
│   │   └── ...                    # 32 Stage 1+2 tests
│   └── requirements.txt
├── src/
│   ├── components/
│   │   ├── analysis/
│   │   │   └── AnalysisResultCard.tsx  # Links to Stage 3 after analysis
│   │   ├── layout/
│   │   │   └── Sidebar.tsx             # Career Intelligence nav group
│   │   └── ...
│   ├── pages/dashboard/
│   │   ├── DashboardPage.tsx           # Stage 3 summary cards + roadmap progress
│   │   ├── InsightsPage.tsx            # Skill insights + evidence map
│   │   ├── CompareRolesPage.tsx        # Multi-role comparison
│   │   ├── RoadmapPage.tsx             # Personalized roadmap + progress tracking
│   │   └── LearningResourcesPage.tsx   # Skill-specific learning resources
│   ├── services/
│   │   ├── analysis.ts
│   │   └── stage3.ts                   # Stage 3 API client functions
│   └── types/
│       └── index.ts                    # Stage 3 TypeScript types
└── ...
```

---

## 8. Installation and Setup

### Prerequisites
- **Node.js:** v18.0.0 or later
- **Python:** 3.11 or later
- **npm:** v9.0.0 or later

### Step 1: Install Frontend Dependencies
```bash
cd skillsync
npm install
```

### Step 2: Configure Frontend Environment Variables
```bash
cp .env.example .env
```
Fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://127.0.0.1:8001/api
```

> **Security Note:** Never place service-role secret keys in the frontend `.env`. The frontend requires only the publishable/anon key.

### Step 3: Configure Backend Environment Variables
```bash
cp backend/.env.example backend/.env
```
Fill in:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

> The service role key is required for backend database writes that bypass RLS. Keep it only in `backend/.env`.

### Step 4: Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 5: Start the Backend
```bash
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8001
```

### Step 6: Start the Frontend
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## 9. Running Tests

### Backend Tests (54 tests — Stages 1, 2, and 3)
```bash
python -m pytest backend/tests/ -v
```
All tests use in-memory PDF generation and the local fallback store. No real Supabase credentials are required.

### Frontend Build Check
```bash
npm run build
```

### PDF Validator Unit Tests
```bash
npm run test:validator
```

---

## 10. Stage 3 API Endpoints

All Stage 3 endpoints are under `/api/stage3/`. Protected endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stage3/insights/{analysis_id}` | Required | Generate skill insights from a saved analysis |
| `POST` | `/api/stage3/compare` | Required | Compare a resume against 2–4 job roles |
| `POST` | `/api/stage3/roadmaps?analysis_id=` | Required | Generate a personalized roadmap |
| `GET` | `/api/stage3/roadmaps/analysis/{analysis_id}` | Required | Retrieve an existing roadmap |
| `PATCH` | `/api/stage3/roadmaps/{roadmap_id}/recommendations/{rec_id}` | Required | Update recommendation status |
| `GET` | `/api/stage3/learning-resources/{skill}` | None | Resources for a single skill |
| `GET` | `/api/stage3/learning-resources?skills=A,B,C` | None | Resources for multiple skills |

---

## 11. Supabase Database Schema

All 6 tables are used across the three completed stages:

| Table | Used In | Purpose |
|---|---|---|
| `profiles` | Stage 1 | User information keyed to `auth.users.id` |
| `job_roles` | Stage 1, 2, 3 | Career paths and required skill arrays |
| `resumes` | Stage 2, 3 | Uploaded resume metadata and extracted text |
| `analyses` | Stage 2, 3 | Match scores, matched/missing skills per analysis |
| `skill_evidence` | Stage 2, 3 | Per-skill evidence level and supporting passage |
| `roadmaps` | Stage 3 | Personalized recommendations stored as JSONB |

The `roadmaps.recommendations` JSONB field stores an array of recommendation objects. Each object contains: `id`, `skill_name`, `evidence_level`, `category`, `goal`, `action`, `activity`, `expected_outcome`, and `status`. Progress updates are persisted by replacing the full array via the backend service role key.

---

## 12. Security Model

- Every protected endpoint validates the Supabase JWT against the Supabase Auth `/auth/v1/user` endpoint.
- User identity is extracted from the verified token — never trusted from the request body.
- Ownership is verified before returning any analysis, roadmap, or evidence record.
- The service role key is used only on the backend for database writes. It is never exposed to the frontend.
- RLS policies on all tables are preserved. The backend uses the service role key only for inserts that require bypassing RLS.
- No resume text is logged in full. File bytes are discarded after processing.
- No resume data is sent to external AI providers.

---

## 13. Known Limitations

- Evidence classification is rule-based (regex + heuristics). Unusual resume formats may produce unexpected classifications.
- The skill dictionary covers the 6 configured job roles. Skills outside the taxonomy are not detected.
- Scanned or image-based PDFs are rejected. OCR is not implemented.
- Scoring weights (1.0 / 0.7 / 0.3 / 0.0) are an initial heuristic and have not been validated against hiring outcomes.
- The system evaluates resume text only. It cannot verify real-world competency.
- Learning resources are a curated static catalogue. They are not dynamically fetched from the web.
- The roadmap does not assign deadlines. Estimated durations are not included in the current version.
- AI-assisted recommendations are not implemented. All recommendations are deterministic and rule-based.

---

## 14. Troubleshooting

### "Could not connect to the analysis backend"
- Ensure the FastAPI backend is running: `uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8001`
- Verify `VITE_API_BASE_URL` in `.env` matches the backend port.

### "Database Query Error" on Job Roles Page
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`.

### "Email Confirmation Required" upon Registration
- Check your inbox, or disable email confirmations in Supabase Dashboard → Authentication → Providers → Email.

### "Invalid PDF format"
- Upload an authentic PDF generated by a word processor or exporter, not a renamed file.

### Roadmap not saving
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `backend/.env`. The roadmap insert requires the service role key to bypass RLS.
