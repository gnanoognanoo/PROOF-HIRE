# ProofHire — Verifiable Engineering Skill & Hiring Network

ProofHire is a production-quality professional skill-verification and hiring platform for developers, recruiters, students, and institutions.

Instead of self-reported claims, ProofHire establishes cryptographic and AI-backed **proof** through static code AST evaluation, verified GitHub activity, commit contribution graphs, deterministic assessment benchmarks, and Polygon blockchain proof attestations.

---

## Key Features

- **Candidate Workstation & Cryptographic Dossier**:
  - AI Codebase Quality Index & Level/XP progression (Level 1–10, verifiable XP).
  - Project Grades: `Grade O` (Outstanding / Top 1.5%), `Grade A` (Distinction), `Grade B` (Proficient), `Grade C` (Competent), `Grade D`, `Grade E`.
  - SHA-256 Merkle tree hashing and Polygon smart contract anchor.
  - Multi-author commit attribution tracking and verified GPG signatures.
- **Recruiter Talent Search & Verification Pipeline**:
  - Filter candidates by verified grade tier (`Grade O`, `Grade A`), verifiable XP range, AST clean security scans, and availability.
  - Granular query syntax (`lang:rust,go grade:0 min_xp:10000`).
  - Candidate dossiers with benchmark projects and instant interview / challenge dispatch.
- **Live AI Codebase Evaluator**:
  - Powered by Google Gemini 1.5 Pro to analyze repository ASTs, cyclomatic complexity, safe concurrency invariants, and test coverage.
  - Line-by-line diff inspector with semantic proof badges.
- **Timed Proctored Assessments**:
  - High-concurrency systems scenarios (e.g. Distributed Consensus Split-Brain Quorum, Rust Race Invariant detection).
  - Built-in Jitsi Meet proctored video peer link and WASM test harness verification.
- **Verification Feed**:
  - Live immutable stream of evaluated repositories and mined blockchain attestations.

---

## Design System

Designed strictly around mature, high-density principles inspired by **GitHub**, **Linear**, **Stripe Dashboard**, and **LinkedIn**:
- Canvas background: `#F6F8FA`
- Clean white surfaces: `#FFFFFF`
- Sharp, subtle 1px borders: `#D0D7DE` / `#E2E8F0`
- Clear typographic hierarchy using Inter and JetBrains Mono for cryptographic hashes.
- Zero AI-generated visual fluff (no excessive gradients, no glowing buttons, no floating blobs).

---

## Monorepo Layout

```
proofhire/
├── apps/
│   ├── web/               # Next.js App Router, TypeScript, Tailwind CSS
│   └── api/               # FastAPI (Python 3.11), Pydantic, SQLAlchemy, Gemini AI
├── contracts/             # Solidity Smart Contract (ProofRegistry.sol), Hardhat
├── supabase/
│   └── migrations/        # PostgreSQL DDL + pgvector schema & RLS
├── docs/                  # Architectural specs & API blueprints
├── .env.example
└── README.md
```

---

## Quickstart

### Prerequisites
- Node.js >= 18.x
- Python >= 3.10
- npm / yarn / pnpm

### Running Frontend (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Running Backend API (`apps/api`)
```bash
cd apps/api
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Unix:
# source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation available at `http://localhost:8000/docs`.
