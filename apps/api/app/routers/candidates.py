from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import CandidateProfile, GradeTier

router = APIRouter(prefix="/candidates", tags=["Candidates"])

# High-fidelity realistic developer profile mock database
CANDIDATE_DB = [
    CandidateProfile(
        id="cand_gnaneshwar",
        username="gnaneshwar",
        full_name="GNANESHWAR R",
        title="Full Stack Developer | AI & Product Engineering",
        bio="Full stack developer specializing in AI-driven web architectures, deterministic reputation protocols, and high-performance React & FastAPI applications.",
        avatar_url="https://avatars.githubusercontent.com/u/7891234?v=4",
        level=37,
        total_xp=8420,
        ai_quality_index=88.5,
        verified_repos_count=6,
        github_username="gnaneshwar",
        polygon_wallet_address="0x9a84...d872",
        location="Chennai, Tamil Nadu",
        availability="Immediate",
        is_identity_verified=True,
        skills=[
            {"skill_name": "React", "grade": GradeTier.A, "score": 88, "xp": 2200},
            {"skill_name": "TypeScript", "grade": GradeTier.A, "score": 82, "xp": 1600},
            {"skill_name": "Python", "grade": GradeTier.A, "score": 80, "xp": 1400},
            {"skill_name": "FastAPI", "grade": GradeTier.B, "score": 76, "xp": 1050},
            {"skill_name": "Git", "grade": GradeTier.A, "score": 84, "xp": 1850},
        ],
        projects=[
            {
                "id": "proj_proofhire",
                "title": "ProofHire — Cryptographic Skill Verification & Engineering Hiring Network",
                "slug": "proofhire",
                "category": "Full Stack / Web3",
                "description": "Cryptographic talent verification platform featuring deterministic XP computation, Gemini AST code audits, Polygon PoS smart contracts, and recruiter assessment workflows.",
                "repo_url": "https://github.com/gnaneshwar/proofhire",
                "primary_stack": ["React 19", "TypeScript", "FastAPI", "Polygon Amoy", "Tailwind CSS"],
                "grade": GradeTier.A,
                "score": 86.0,
                "metrics": {"architecture": 91.0, "test_coverage": 84.0, "code_quality": 87.0, "doc_clarity": 76.0},
                "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "polygon_tx_hash": "0x8f2d91a7e4b3c201948576d1e03a58b2914c67319082ef76a0d24c8b3e198762",
                "merkle_root": "0x9a837264817264901827463527183904",
                "commit_count": 284,
                "loc_count": 14200,
                "gemini_review_note": "Verified deterministic reputation engine with 6-signal candidate matching, Polygon smart contract deployment, and end-to-end recruiter evaluation suites.",
                "attributions": [
                    {"contributor_name": "GNANESHWAR R", "github_handle": "gnaneshwar", "role_description": "Full-stack architecture, deterministic reputation engine, and Polygon contracts", "lines_of_code": 11644, "percentage": 82.0, "is_verified_gpg": True}
                ]
            }
        ]
    ),
    CandidateProfile(
        id="cand_alexchen",
        username="alexchen",
        full_name="Alex Chen",
        title="Staff Distributed Systems Engineer",
        bio="ex-Stripe Fellow. Designing high-throughput consensus systems and low-latency LSM storage engines in Rust & Go.",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
        level=7,
        total_xp=14850,
        ai_quality_index=94.8,
        verified_repos_count=42,
        github_username="alexchen",
        polygon_wallet_address="0x892a...c041",
        location="San Francisco / Remote",
        availability="Immediate Hire",
        is_identity_verified=True,
        skills=[
            {"skill_name": "Distributed Systems", "grade": GradeTier.O, "score": 98, "xp": 4200},
            {"skill_name": "Rust & Systems Prog.", "grade": GradeTier.O, "score": 96, "xp": 3800},
            {"skill_name": "Concurrent Algorithms", "grade": GradeTier.A, "score": 92, "xp": 2900},
            {"skill_name": "Database Internals", "grade": GradeTier.A, "score": 89, "xp": 2400},
            {"skill_name": "Kubernetes & CI/CD", "grade": GradeTier.B, "score": 81, "xp": 1550},
        ],
        projects=[
            {
                "id": "proj_hyper_raft",
                "title": "HyperRaft — High-Throughput Raft Consensus Engine in Rust",
                "slug": "hyper-raft",
                "category": "Rust Systems",
                "description": "Asynchronous multi-raft implementation focused on sub-millisecond p99 heartbeats, lock-free batching pipelines, and zero-allocation io_uring networking on Linux kernel 6.x.",
                "repo_url": "https://github.com/alexchen/hyper-raft",
                "primary_stack": ["Rust", "Tokio", "io_uring", "Raft", "WASM"],
                "grade": GradeTier.O,
                "score": 96.4,
                "metrics": {"architecture": 98.0, "test_coverage": 96.4, "code_quality": 95.0, "doc_clarity": 92.0},
                "sha256_hash": "d8a2f77c8e310024ff0e6871141bc2d3e5b304cb77a118f6",
                "polygon_tx_hash": "0x04f128e02c918a284e311d445218d6e3c041b320019",
                "merkle_root": "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4",
                "commit_count": 384,
                "loc_count": 18400,
                "gemini_review_note": "Zero-copy serialization, formally verified state transitions, zero unsafe memory violations across 18,400 LOC. Exceptional fault recovery under chaotic net-split conditions with 100% linearizability retention.",
                "attributions": [
                    {"contributor_name": "Alex Chen", "github_handle": "alexchen", "role_description": "Core state machine & log replication", "lines_of_code": 14352, "percentage": 78.0, "is_verified_gpg": True},
                    {"contributor_name": "Sarah Lin", "github_handle": "sarahlin", "role_description": "gRPC network transport", "lines_of_code": 2576, "percentage": 14.0, "is_verified_gpg": True},
                    {"contributor_name": "Marcus Bell", "github_handle": "marcusbell", "role_description": "Criterion micro-benchmarking", "lines_of_code": 1472, "percentage": 8.0, "is_verified_gpg": True}
                ]
            },
            {
                "id": "proj_distri_kv",
                "title": "DistriKV — LSM-Tree Distributed Storage Engine",
                "slug": "distri-kv",
                "category": "C++ / Rust Storage",
                "description": "Tiered compaction LSM-Tree architecture with write-ahead logging (WAL) optimized for SSD random write amplification reduction and consistent point-in-time snapshots.",
                "repo_url": "https://github.com/alexchen/distri-kv",
                "primary_stack": ["Rust", "RocksDB Spec", "WAL", "eBPF"],
                "grade": GradeTier.A,
                "score": 91.2,
                "metrics": {"architecture": 92.0, "test_coverage": 89.1, "code_quality": 91.0, "doc_clarity": 93.0},
                "sha256_hash": "9b12a88ef110c4327a1998f45a0bce11a76c8109d3e87a22",
                "polygon_tx_hash": "0x64bf89d71c4a0129bc37f190e29d0089aef4101",
                "merkle_root": "0x892a01f9c882bc719001",
                "commit_count": 210,
                "loc_count": 12600,
                "gemini_review_note": "Clean WAL implementation with SSTable compaction, comprehensive benchmark suites against RocksDB showing 18% lower p99 write latency under simulated high-concurrency workloads.",
                "attributions": [
                    {"contributor_name": "Alex Chen", "github_handle": "alexchen", "role_description": "LSM compaction pipeline & bloom filter", "lines_of_code": 11340, "percentage": 90.0, "is_verified_gpg": True}
                ]
            }
        ]
    ),
    CandidateProfile(
        id="cand_elenarostova",
        username="erostova",
        full_name="Elena Rostova",
        title="Senior Kernel & Go Systems Engineer",
        bio="Specializing in Linux eBPF observability, fast XDP packet filtering, and zero-allocation Kubernetes networking.",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
        level=6,
        total_xp=12400,
        ai_quality_index=95.1,
        verified_repos_count=28,
        github_username="erostova",
        polygon_wallet_address="0x12a9...fd40",
        location="Berlin / Hybrid",
        availability="Immediate Hire",
        is_identity_verified=True,
        skills=[
            {"skill_name": "Linux eBPF & XDP", "grade": GradeTier.O, "score": 97, "xp": 3900},
            {"skill_name": "Go (Golang)", "grade": GradeTier.O, "score": 95, "xp": 3400},
            {"skill_name": "C / Kernel Prog", "grade": GradeTier.A, "score": 90, "xp": 2600},
            {"skill_name": "K8s Networking", "grade": GradeTier.A, "score": 88, "xp": 2500},
        ],
        projects=[]
    ),
    CandidateProfile(
        id="cand_priyasharma",
        username="psharma",
        full_name="Priya Sharma",
        title="Staff ML Systems & Compiler Engineer",
        bio="Optimizing vLLM inference kernels, Triton JIT compilers, and distributed tensor parallelism for 70B+ LLMs.",
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
        level=8,
        total_xp=16100,
        ai_quality_index=97.2,
        verified_repos_count=35,
        github_username="psharma-ai",
        polygon_wallet_address="0x53d8...33ea",
        location="Seattle / On-site",
        availability="2 Weeks Notice",
        is_identity_verified=True,
        skills=[
            {"skill_name": "CUDA & Triton", "grade": GradeTier.O, "score": 99, "xp": 4800},
            {"skill_name": "C++20 & Compilers", "grade": GradeTier.O, "score": 96, "xp": 4100},
            {"skill_name": "PyTorch Internals", "grade": GradeTier.A, "score": 93, "xp": 3600},
            {"skill_name": "Distributed GPU", "grade": GradeTier.O, "score": 97, "xp": 3600},
        ],
        projects=[]
    )
]

@router.get("", response_model=List[CandidateProfile])
async def list_candidates(
    query: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    results = CANDIDATE_DB
    if query:
        q = query.lower()
        results = [
            c for c in results
            if q in c.full_name.lower() or q in c.title.lower() or any(q in s.skill_name.lower() for s in c.skills)
        ]
    return results[:limit]

@router.get("/{username}", response_model=CandidateProfile)
async def get_candidate_by_username(username: str):
    for cand in CANDIDATE_DB:
        if cand.username.lower() == username.lower():
            return cand
    raise HTTPException(status_code=404, detail="Candidate not found")
