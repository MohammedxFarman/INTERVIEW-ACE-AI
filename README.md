# InterviewAce AI

An elite, production-ready **AI-Powered Interview Preparation Platform** that helps students and professionals prepare for technical and HR interviews with recruiter-grade scoring, resume compatibility reviews, and real-time interactive mock sessions.

Built with a modular TypeScript/React/Express full-stack architecture, utilizing Google DeepMind's Gemini 3.5 Flash model for natural language intelligence.
###LIVE https://interview-ace-ai-w9wc.onrender.com/
---

## 🚀 Core Features

1. **Recruiter-Grade Landing Page**
   - Sleek styling with high-contrast slate-dark visual theme.
   - Interactive sections, stats banner, features descriptions, and animated Call-To-Action entry loops.

2. **Secure Authentication**
   - Native cryptographically secure password hashing (PBKDF2) and token-based state session verification.
   - Elegant protected router structures with auto-login synchronizations.

3. **User Dashboard Hub**
   - High-level candidate profiles showing completed interview metrics, average ratings, and active resume evaluation scores.

4. **AI Resume Scorecard**
   - Pastes details or uploads files to evaluate resume quality.
   - Calculates **ATS Compatibility scores** and **Resume score (out of 100)**.
   - Detects identified recruiter-grade strengths, identified deficiencies, missing core skills, and features an interactive suggested actionable Checklist.

5. **Conversational Mock Interview**
   - Select targeted technical profiles (Software Engineer, Frontend Developer, Backend Developer, Data Analyst, Data Scientist, Full Stack Developer) across multiple difficulty tiers (Easy, Medium, Hard).
   - Dynamically crafts a **10-stage interview question queue** using Gemini.
   - Micro-evaluates candidate ответы sequentially: calculates stars ratings and constructive suggestions before proceeding.

6. **Interactive Final Report Card**
   - Displays combined scores: **Technical Skill**, **Communication Fluency**, and **Confidence indicators**.
   - Outlines localized suggested focus areas and provides an AI-curated personalized Study Roadmap.
   - Includes full collapsible assessments transcripts reviewing all questions and AI micro-assessments.

7. **Historical Analytics Charts**
   - Chronological timelines mapping historical interview score timelines.
   - Radar charts mapping candidates' core competencies.
   - Comparative bar charts plotting Resume vs. ATS revisions.

8. **Admin System Telemetry**
   - Observability panels calculating registered accounts, total sessions, and platform-wide core competency scales.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion, Recharts.
- **Backend**: Node.js, Express, cryptographic security utilities, modular database models.
- **Database**: In-memory optimized relational model with robust multi-process active serialization to `data/database.json`.
- **AI Core**: Google GenAI Node SDK (`@google/genai`) defaulting to `gemini-3.5-flash` with lazy error containment.

---

## 📦 Run Instructions & local Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environmental Secrets**:
   Create a local `.env` file in the root directory:
   ```env
   # Gemini API Key for AI operations
   GEMINI_API_KEY="your_actual_gemini_api_key_here"

   # JSON secret for signature validations
   JWT_SECRET="interview-ace-ai-secret-key-1337"
   ```

3. **Launch Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000) to view the platform.

4. **Build Production Targets**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
/
├── data/
│   └── database.json          # Persistent file DB store
├── server/
│   ├── db.ts                  # SQLite-like query structures and helpers
│   └── gemini.ts              # Modular Gemini prompt configurations
├── src/
│   ├── components/            # Visual React SPA subcomponents
│   │   ├── AdminPanel.tsx
│   │   ├── Analytics.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FinalReport.tsx
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MockInterview.tsx
│   │   ├── Navbar.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ResumeAnalyzer.tsx
│   ├── context/
│   │   └── AuthContext.tsx    # State session handlers
│   ├── services/
│   │   └── api.ts             # Client-to-server endpoints proxy bindings
│   ├── App.tsx                # Context router & dispatcher mappings
│   ├── types.ts               # Shared types interfaces
│   ├── index.css              # Global Tailwinds and typography
│   └── main.tsx               # Entry point
├── server.ts                  # Full-stack developer Express boot wrapper
├── package.json               # System configuration
└── tsconfig.json              # TypeScript target setups
```
