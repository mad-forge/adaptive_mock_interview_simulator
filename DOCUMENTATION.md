# AI-Powered Adaptive Mock Interview Simulator
# Project Documentation

---

## 1. PROJECT OVERVIEW

An AI-driven mock interview platform where users select a technical role, difficulty, interview type, and duration. The AI conducts a timed, adaptive interview session — generating questions, evaluating answers in real-time, asking intelligent follow-ups, and producing a structured performance report at the end. All sessions are stored in a PostgreSQL database.

**Live URL:** https://adaptive-mock-interview-simulator.onrender.com
**GitHub:** [Repository Link]

---

## 2. TECH STACK

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 19, Vite 7, Redux Toolkit  |
| Styling    | SCSS Modules                      |
| Backend    | Express.js 4, Node.js (ES Modules) |
| Database   | PostgreSQL (Supabase hosted)      |
| AI Engine  | OpenAI GPT-4o-mini               |
| Deployment | Render (backend), Vercel/Render (frontend) |

---

## 3. STEPS FOLLOWED

### Step 1: Project Setup
- Initialized Express.js backend with ES module support
- Connected to Supabase PostgreSQL with SSL configuration
- Set up React + Vite frontend with SCSS modules and Redux Toolkit

### Step 2: Database Schema Design
- Created `sessions` table (UUID primary key, role, difficulty, type, duration, status, JSONB report, timestamps)
- Created `questions` table (session_id FK, sequence tracking, question text, answer text, score, feedback, quality, difficulty, follow-up flag)
- Added index on questions(session_id, sequence_num) for efficient queries

### Step 3: AI Prompt Engineering
- **Question Generation Prompt:** Takes role, type, difficulty, previous questions (to avoid repetition), and follow-up context. Generates one question as JSON.
- **Answer Evaluation Prompt:** Strict 6-tier scoring rubric (0-5, 6-20, 21-40, 41-65, 66-85, 86-100). Calibrated per difficulty level — easy questions scored leniently, hard questions scored harshly.
- **Report Generation Prompt:** Produces overall score, 3 strengths, 3 improvements, 2 improved sample answers, 3 practice topics. Anti-inflation rules prevent score padding.

### Step 4: Backend API Development
- `POST /api/sessions` — Creates session + generates first question
- `POST /api/sessions/:id/answer` — Submits answer, evaluates, returns score + next question
- `POST /api/sessions/:id/end` — Force-ends session, generates report
- `GET /api/sessions` — Lists all past sessions
- `GET /api/sessions/:id` — Retrieves full session with questions and report

### Step 5: Adaptive Logic
- `decideNext()` function determines whether to ask a new question or a follow-up
- Guarantees at least 1 follow-up per session (triggers after score >= 85, score <= 30, or 3+ questions)
- Questions locked to user's selected difficulty (easy/medium/hard)
- `shouldEndSession()` checks elapsed time against configured duration

### Step 6: Frontend Page Architecture
- Created 5 separate pages: Login, Setup, Session, Report, History
- Each page has a container (UI logic) and a thin page wrapper
- Protected routes redirect unauthenticated users to landing page
- Auth persisted to localStorage so refresh doesn't log out

### Step 7: UI Design
- Landing page: Clean white theme, hero section, feature cards, how-it-works steps, sign-in modal
- Setup page: Chip-based role selector, option cards for type/difficulty/duration
- Session page: Live countdown timer, progress bar, question card, feedback display
- Report page: Score header, strengths/improvements lists, sample answers, practice topics
- History page: Session cards with role, difficulty, score, date

### Step 8: Speed + Reliability Optimization
- Per-task token limits (256 for questions/evaluation, 1500 for reports)
- Lower temperature for evaluation (0.3) for deterministic scoring
- Pre-check catches garbage answers before API call
- JSON retry parsing extracts valid JSON from partial responses
- Report structure validation with fallback defaults
- Input sanitization and validation on all endpoints

---

## 4. PROMPTS USED

### 4.1 Question Generation Prompt
```
You are an expert {type} interviewer conducting a mock interview for a {role} position.
Current difficulty level: {difficulty}
Questions already asked: [list of previous questions]
Generate exactly 1 interview question appropriate for the {difficulty} level.
Rules:
- For "technical": ask coding, architecture, or domain-specific questions
- For "behavioral": use STAR-format situational questions
- For "system_design": ask about designing systems, scalability, trade-offs
- Do not repeat any topic already covered
- Match the question complexity to the difficulty level
```

### 4.2 Follow-Up Prompt (appended when follow-up triggered)
```
Generate a FOLLOW-UP question that probes deeper into the candidate's previous answer.
Previous question: "{question}"
Previous answer: "{answer}"
Dig deeper into their reasoning, ask for specifics, edge cases, or trade-offs.
```

### 4.3 Answer Evaluation Prompt
```
You are an EXTREMELY STRICT {type} interviewer evaluating a {role} candidate.
Question ({difficulty} level): "{question}"
Candidate's answer: "{answer}"

STRICT SCORING RUBRIC:
- 0-5: Gibberish, random characters, copy-paste, "I don't know"
- 6-20: One sentence, name-dropping without explanation, vague
- 21-40: Partially correct, missing critical details
- 41-65: Correct core with some details, shows working knowledge
- 66-85: Technically accurate with depth, examples, trade-offs
- 86-100: ONLY for exceptional — deep precision, edge cases, production-level thinking

CALIBRATED TO DIFFICULTY:
- Easy: A clear correct 2-3 sentence answer can score 60-80. Mentor-like feedback.
- Medium: Expects examples and scenarios. Professional feedback.
- Hard: Expects deep trade-offs and edge cases. Senior engineer feedback.
```

### 4.4 Report Generation Prompt
```
You are a STRICT senior interviewer writing a performance report.
Role: {role}, Difficulty: {difficulty}, Questions: {count}, Avg Score: {avg}/100

RULES:
- overall_score must match actual performance — no inflation
- Strengths: specific things actually demonstrated
- Improvements: actionable, cite what was wrong
- Sample answers: 2 weakest, improved to 90+ quality appropriate for the difficulty level
- Practice topics: specific to the difficulty level

Output: overall_score, 3 strengths, 3 improvements, 2 sample_answers, 3 practice_topics
```

---

## 5. TOOLS & AGENTS USED

| Tool/Agent       | Purpose                                          |
|------------------|--------------------------------------------------|
| Claude Code (CLI)| AI coding assistant — built entire project        |
| OpenAI           | Question generation, evaluation, reports        |
| Supabase         | Hosted PostgreSQL database                        |
| Render           | Backend deployment (Express.js)                   |
| Vite             | Frontend build tool                               |
| Redux Toolkit    | Frontend state management (slices + thunks)       |
| React Router     | Client-side routing with protected routes         |
| SCSS Modules     | Scoped component styling                          |
| Node.js pg       | PostgreSQL client for Node.js                     |
| Git/GitHub       | Version control and repository hosting            |

---

## 6. DEVELOPMENT METHOD

### Architecture Pattern
- **Frontend:** Pages → Containers → Components pattern
  - Pages are thin wrappers that render containers
  - Containers hold all UI logic, API calls, and state management
  - Slices and thunks co-located with their respective pages
- **Backend:** Routes → Services → Prompts pattern
  - Routes handle HTTP, validation, and DB operations
  - Services contain AI integration and adaptive logic
  - Prompts are isolated, testable prompt-building functions

### AI Integration Method
- All AI calls go through a single `callAI()` function with per-task configuration
- Prompt engineering follows a structured approach: role definition → context → strict rules → output format
- JSON-only responses with retry parsing for reliability
- Pre-validation catches garbage input before wasting API calls
- Post-validation clamps scores and fills missing fields with defaults

### Development Workflow
1. Database schema designed first (sessions + questions tables)
2. Backend API built and tested with manual requests
3. AI prompts iterated — started lenient, then tightened scoring progressively
4. Frontend pages built one by one: Login → Setup → Session → Report → History
5. Integration testing: full flow from login to report
6. Optimization pass: speed improvements, error handling, input validation

---

## 7. DATABASE SCHEMA

```sql
CREATE TABLE sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role          VARCHAR(100) NOT NULL,
    difficulty    VARCHAR(20)  NOT NULL,    -- easy | medium | hard
    type          VARCHAR(50)  NOT NULL,    -- technical | behavioral | system_design
    duration_min  INTEGER      NOT NULL,    -- 15 | 30 | 45 | 60
    status        VARCHAR(20)  DEFAULT 'in_progress',  -- in_progress | completed
    report        JSONB,                    -- full AI-generated report
    created_at    TIMESTAMP DEFAULT NOW(),
    completed_at  TIMESTAMP
);

CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
    sequence_num    INTEGER NOT NULL,
    question_text   TEXT NOT NULL,
    answer_text     TEXT,
    score           INTEGER,               -- 0-100
    feedback        TEXT,                  -- AI feedback
    quality         VARCHAR(20),           -- poor | fair | good | excellent
    difficulty      VARCHAR(20) NOT NULL,
    is_followup     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## 8. PROJECT STRUCTURE

```
ai-mock-interview/
├── backend/
│   ├── db/
│   │   ├── migrate.js          # Database schema migration
│   │   └── pool.js             # PostgreSQL connection pool
│   ├── prompts/
│   │   ├── evaluate.js         # Answer evaluation prompt
│   │   ├── questionGen.js      # Question generation prompt
│   │   └── report.js           # Report generation prompt
│   ├── routes/
│   │   ├── interview.js        # Session + answer + end APIs
│   │   └── sessions.js         # History + session detail APIs
│   ├── services/
│   │   ├── adaptive.js         # Follow-up + difficulty logic
│   │   └── ai.js               # OpenAI integration layer
│   ├── index.js                # Express server entry point
│   └── package.json
├── frontend/
│   └── src/
│       ├── containers/
│       │   ├── loginContainer/     # Landing page + sign-in modal
│       │   ├── setupContainer/     # Interview configuration
│       │   ├── sessionContainer/   # Live interview with timer
│       │   ├── reportContainer/    # Performance report display
│       │   └── historyContainer/   # Past sessions list
│       ├── pages/
│       │   ├── loginPage/          # Auth slice + page wrapper
│       │   ├── setupPage/          # Page wrapper
│       │   ├── sessionPage/        # Page wrapper
│       │   ├── reportPage/         # Page wrapper
│       │   ├── historyPage/        # Page wrapper
│       │   └── interviewPage/      # Interview slice + thunks
│       ├── apiCall/interview/      # API functions
│       ├── routes/index.jsx        # React Router with protected routes
│       └── store/rootReducer.js    # Redux store configuration
└── DOCUMENTATION.md
```

---

## 9. SETUP & INSTALLATION STEPS

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- OpenAI API key

### Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=sk-your-key-here
```

Run migration and start:
```bash
npm run migrate
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3001
```

Start development server:
```bash
npm run dev
```

### Login Credentials
- Name: Any name
- Password: 1234

---

## 10. KEY FEATURES SUMMARY

| # | Feature                          | Status |
|---|----------------------------------|--------|
| 1 | Role + difficulty selection       | Done   |
| 2 | Interview type selection          | Done   |
| 3 | Duration selection (15-60 min)    | Done   |
| 4 | Live countdown timer              | Done   |
| 5 | Progress tracking (Q X of ~Y)    | Done   |
| 6 | AI-generated questions            | Done   |
| 7 | At least 1 follow-up per session  | Done   |
| 8 | Difficulty-locked questions       | Done   |
| 9 | AI answer evaluation (0-100)      | Done   |
| 10| Difficulty-calibrated feedback    | Done   |
| 11| Structured performance report     | Done   |
| 12| Session history in PostgreSQL     | Done   |
| 13| Auth with session persistence     | Done   |
| 14| Responsive UI                     | Done   |

---
