# ProofHire API Specification (v1)

Base URL: `/api/v1`

---

## 1. Candidate Dossiers

### `GET /candidates`
Returns paginated verified candidates with filtering options.
- **Query Parameters**:
  - `query` (str): Free-form or structured query (e.g. `lang:rust grade:O min_xp:10000`)
  - `grades` (list[str]): Grade filter (`['O', 'A', 'B']`)
  - `languages` (list[str]): Language filter (`['Rust', 'Go', 'TypeScript']`)
  - `min_xp` (int): Minimum verifiable XP
  - `limit` (int): Items per page (default 20)
  - `offset` (int): Pagination offset

### `GET /candidates/{username}`
Retrieves complete verified dossier for a developer, including evaluated projects, skill matrix, and Polygon transaction hashes.

---

## 2. AI Evaluation Engine

### `POST /projects/evaluate`
Initiates an asynchronous Gemini 1.5 AST inspection of a repository.
- **Request Body**:
```json
{
  "repo_url": "https://github.com/alexchen/hyper-raft",
  "branch": "main",
  "commit_hash": "d8a2f77c8e310024ff0e6871141bc2d3e5b304cb"
}
```
- **Response**:
```json
{
  "evaluation_id": "eval_88192a",
  "status": "COMPLETED",
  "grade": "O",
  "score": 96.4,
  "metrics": {
    "architecture": 98.0,
    "test_coverage": 96.4,
    "code_quality": 95.0,
    "doc_clarity": 92.0
  },
  "gemini_review_note": "Zero-copy serialization, formally verified state transitions...",
  "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "polygon_tx_hash": "0x04f128e02c918a284e311d445218d6e3c041b320019"
}
```

---

## 3. Blockchain Attestation

### `GET /blockchain/verify-proof/{tx_hash}`
Verifies on-chain anchor on Polygon PoS against local SHA-256 hash.

---

## 4. Assessment & Proctored Interview

### `POST /assessments/submit`
Evaluates candidate answer submissions against formal invariants and runs WASM test suites.

### `POST /recruiter/invite`
Dispatches an instant Jitsi Meet room link or a cryptographically signed code evaluation challenge.
