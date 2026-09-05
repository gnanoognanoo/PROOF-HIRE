# ProofHire Architecture & System Specification

## 1. Overview & Core Philosophy

ProofHire inverts traditional tech hiring resumes by replacing unverifiable claims with **cryptographically attested and AI-evaluated engineering artifacts**. Every skill badge, project grade, and level must be backed by reproducible data:

1. **AST & Static Analysis**: Syntactic complexity, unsafe code usage, and branch coverage audited by Gemini 1.5 Pro.
2. **Deterministic Grading Scale**:
   - **Grade O (Outstanding)**: Top 1.5% percentile. Flawless concurrency invariants, zero memory violations, exhaustive fuzzing.
   - **Grade A (Distinction)**: Top 7% percentile. Clean architecture, high test coverage, idiomatic design.
   - **Grade B (Proficient)**: Top 25% percentile. Solid implementations, production-ready patterns, standard testing.
   - **Grade C (Competent)**: Working implementations with minor linting or architectural tech debt.
   - **Grade D (Needs Improvement)**: Flawed error handling or missing test suites.
   - **Grade E (Unverified)**: Syntax failures or uncompilable stubs.
3. **Multi-Author Commit Attribution**: Real Git tree audits prevent code misappropriation by attributing lines of code, commit frequency, and GPG signature verification to individual contributors.
4. **On-Chain Attestation**: Immutable SHA-256 Merkle root anchors committed to Polygon PoS smart contracts (`ProofRegistry.sol`).

---

## 2. Monorepo Structural Components

```
proofhire/
├── apps/
│   ├── web/                     # Next.js 14 App Router, TypeScript, Tailwind, Lucide
│   │   ├── src/app/             # Workstation, Recruiter Pipeline, Evaluator, Assessments, Feed
│   │   ├── src/components/      # Pure UI & modular domain components
│   │   └── src/lib/             # Types, Mock DB, Web3 & API services
│   └── api/                     # Python 3.11 FastAPI backend
│       ├── app/routers/         # Endpoints for candidate profiles, grading, blockchain
│       ├── app/services/        # Gemini API engine, GitHub client, Web3 ledger
│       └── app/db/              # SQLAlchemy models & database session
├── contracts/                   # Hardhat + Solidity (Polygon Proof Registry)
├── supabase/
│   └── migrations/              # PostgreSQL schema with pgvector & RLS
└── docs/                        # Specifications
```

---

## 3. Data Flow Diagram

```
[Developer GitHub Repo]
        │
        ▼
[FastAPI /api/v1/projects/evaluate]
        │
        ├──> [GitHub REST API]: Fetches PRs, Commits, AST files, GPG signatures
        ├──> [Gemini 1.5 Pro]: Evaluates concurrency invariants, cyclomatic complexity, test efficacy
        └──> [Polygon Web3 Service]: Computes SHA-256 Merkle Root & anchors to ProofRegistry.sol
        │
        ▼
[Supabase PostgreSQL + pgvector]
        │
        ▼
[Next.js Web Workstation / Recruiter Pipeline]
```
