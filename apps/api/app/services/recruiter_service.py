import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.services.match_engine import match_engine

class RecruiterService:
    def __init__(self):
        # 3 Companies
        self.companies = [
            {
                "id": "comp_acme",
                "name": "Acme Technologies",
                "industry": "Developer Tooling & Cloud Platforms",
                "size": "150–300 employees",
                "headquarters": "San Francisco, CA & Bengaluru, India",
                "website": "https://acmetech.io",
                "description": "Building next-generation developer tooling, automated AST linting frameworks, and high-performance web runtime engines."
            },
            {
                "id": "comp_synthetix",
                "name": "Synthetix Labs",
                "industry": "Machine Learning Systems & GPU Acceleration",
                "size": "50–100 employees",
                "headquarters": "Bengaluru, India & Seattle, WA",
                "website": "https://synthetixlabs.ai",
                "description": "Specialized research laboratory optimizing large-scale transformer inference, Triton compiler backends, and low-latency embeddings."
            },
            {
                "id": "comp_nexus",
                "name": "Nexus Cloud Infrastructure",
                "industry": "Cloud Infrastructure & Network Observability",
                "size": "200–500 employees",
                "headquarters": "London, UK",
                "website": "https://nexuscloud.io",
                "description": "Pioneering zero-trust eBPF telemetry, high-throughput distributed consensus clusters, and managed edge mesh networks."
            }
        ]

        # 3 Recruiter Profiles
        self.recruiters = [
            {
                "id": "rec_sarah",
                "name": "Sarah Lin",
                "role": "Head of Technical Talent & Engineering Recruiting",
                "company": "Acme Technologies",
                "location": "San Francisco, CA / Hybrid",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces"
            },
            {
                "id": "rec_kavita",
                "name": "Kavita Desai",
                "role": "Senior Technical Recruiter — AI & Systems",
                "company": "Synthetix Labs",
                "location": "Bengaluru, India",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces"
            },
            {
                "id": "rec_marcus",
                "name": "Marcus Vance",
                "role": "Talent Acquisition Lead — Cloud & Platform Engineering",
                "company": "Nexus Cloud Infrastructure",
                "location": "London, UK / Remote",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces"
            }
        ]

        # 4 Realistic Jobs across 3 Companies
        self.open_positions = [
            {
                "id": "pos_acme_frontend",
                "title": "Frontend Engineer",
                "company": "Acme Technologies",
                "department": "Platform Engineering",
                "location": "San Francisco / Bengaluru (Hybrid / Remote)",
                "salary_band": "$140k – $180k",
                "required_skills": ["React", "TypeScript", "Next.js", "AST Compilers"],
                "min_level": 32,
                "applicants_count": 18,
                "created_at": "2024-11-01"
            },
            {
                "id": "pos_acme_systems",
                "title": "Senior Distributed Systems Engineer",
                "company": "Acme Technologies",
                "department": "Core Infrastructure",
                "location": "Remote (US/EU/India)",
                "salary_band": "$160k – $210k",
                "required_skills": ["Rust", "Distributed Systems", "Tokio", "Raft"],
                "min_level": 35,
                "applicants_count": 14,
                "created_at": "2024-11-04"
            },
            {
                "id": "pos_synthetix_ml",
                "title": "ML Systems & Kernel Optimization Specialist",
                "company": "Synthetix Labs",
                "department": "AI Research & Systems",
                "location": "Bengaluru, India / Seattle, WA",
                "salary_band": "₹35L – ₹55L / $180k – $230k",
                "required_skills": ["Python", "CUDA", "PyTorch Internals", "Compilers"],
                "min_level": 35,
                "applicants_count": 9,
                "created_at": "2024-11-15"
            },
            {
                "id": "pos_nexus_infra",
                "title": "Cloud Infrastructure & eBPF Platform Engineer",
                "company": "Nexus Cloud Infrastructure",
                "department": "Network Observability",
                "location": "London, UK / Remote",
                "salary_band": "£90k – £125k",
                "required_skills": ["Go", "Kubernetes Internals", "Linux eBPF", "Docker"],
                "min_level": 32,
                "applicants_count": 12,
                "created_at": "2024-11-18"
            }
        ]

        # Saved candidate IDs
        self.saved_candidates: List[str] = ["gnaneshwar", "alexchen", "psharma"]

        # Assessments Sent
        self.assessments_sent = [
            {
                "id": "as_1",
                "candidate_name": "GNANESHWAR R",
                "candidate_username": "gnaneshwar",
                "assessment_name": "React 19 & TypeScript Production Architecture MCQ",
                "status": "COMPLETED",
                "score": 90.0,
                "sent_date": "2025-02-14",
                "completed_date": "2025-02-15"
            },
            {
                "id": "as_2",
                "candidate_name": "Alex Chen",
                "candidate_username": "alexchen",
                "assessment_name": "Distributed Systems & Concurrency Benchmark",
                "status": "COMPLETED",
                "score": 95.0,
                "sent_date": "2025-01-27",
                "completed_date": "2025-01-28"
            },
            {
                "id": "as_3",
                "candidate_name": "Priya Sharma",
                "candidate_username": "psharma",
                "assessment_name": "CUDA Kernels & PyTorch Performance Benchmark",
                "status": "COMPLETED",
                "score": 97.5,
                "sent_date": "2025-01-09",
                "completed_date": "2025-01-10"
            }
        ]

        # 3 Upcoming Interviews
        self.upcoming_interviews = [
            {
                "id": "int_1",
                "candidate_name": "GNANESHWAR R",
                "candidate_username": "gnaneshwar",
                "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
                "role_title": "Frontend Engineer",
                "company": "Acme Technologies",
                "date_time": "Tomorrow, 2:30 PM IST",
                "interviewer": "Sarah Lin (Head of Technical Talent)",
                "jitsi_url": "https://meet.jit.si/proofhire-acme-frontend-engineer-gnaneshwar-eval",
                "status": "Confirmed"
            },
            {
                "id": "int_2",
                "candidate_name": "Alex Chen",
                "candidate_username": "alexchen",
                "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
                "role_title": "Senior Distributed Systems Engineer",
                "company": "Acme Technologies",
                "date_time": "Thursday, 10:00 AM PST",
                "interviewer": "Sarah Lin & Chief Architect",
                "jitsi_url": "https://meet.jit.si/proofhire-acme-systems-alexchen-huddle",
                "status": "Confirmed"
            },
            {
                "id": "int_3",
                "candidate_name": "Priya Sharma",
                "candidate_username": "psharma",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
                "role_title": "ML Systems & Kernel Optimization Specialist",
                "company": "Synthetix Labs",
                "date_time": "Friday, 4:00 PM IST",
                "interviewer": "Kavita Desai (Senior Recruiter)",
                "jitsi_url": "https://meet.jit.si/proofhire-synthetix-ml-priyasharma-screen",
                "status": "Confirmed"
            }
        ]

        # Recent Applications with Realistic Matches
        self.recent_applications = [
            {
                "id": "app_1",
                "candidate_name": "GNANESHWAR R",
                "candidate_username": "gnaneshwar",
                "role_title": "Frontend Engineer",
                "company": "Acme Technologies",
                "applied_date": "2 hours ago",
                "match_score": 92,
                "overall_grade": "B",
                "level": 37,
                "status": "INTERVIEW_STAGE"
            },
            {
                "id": "app_2",
                "candidate_name": "Alex Chen",
                "candidate_username": "alexchen",
                "role_title": "Senior Distributed Systems Engineer",
                "company": "Acme Technologies",
                "applied_date": "1 day ago",
                "match_score": 96,
                "overall_grade": "B",
                "level": 38,
                "status": "INTERVIEW_STAGE"
            },
            {
                "id": "app_3",
                "candidate_name": "Priya Sharma",
                "candidate_username": "psharma",
                "role_title": "ML Systems & Kernel Optimization Specialist",
                "company": "Synthetix Labs",
                "applied_date": "2 days ago",
                "match_score": 98,
                "overall_grade": "A",
                "level": 42,
                "status": "INTERVIEW_STAGE"
            }
        ]

        # 6 Calibrated Candidates Database headed by GNANESHWAR R
        self.candidates_db: List[Dict[str, Any]] = [
            {
                "id": "cand_gnaneshwar",
                "username": "gnaneshwar",
                "name": "GNANESHWAR R",
                "headline": "Full Stack Developer | AI & Product Engineering",
                "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
                "level": 37,
                "overall_grade": "B",
                "reputation_grade_title": "Professional Reputation Grade: Tier B",
                "top_skills": [
                    {"skill_name": "React", "score": 88, "level": 34},
                    {"skill_name": "TypeScript", "score": 82, "level": 29},
                    {"skill_name": "Python", "score": 80, "level": 27},
                    {"skill_name": "FastAPI", "score": 76, "level": 23},
                    {"skill_name": "Git", "score": 84, "level": 31}
                ],
                "skills": {
                    "React": {"score": 88, "level": 34},
                    "TypeScript": {"score": 82, "level": 29},
                    "Python": {"score": 80, "level": 27},
                    "FastAPI": {"score": 76, "level": 23},
                    "Git": {"score": 84, "level": 31},
                    "Next.js": {"score": 82, "level": 30}
                },
                "badges": [
                    "Frontend Developer — Gold",
                    "React Developer — Gold",
                    "Team Collaborator — Silver",
                    "Python Developer — Silver"
                ],
                "verified_projects_count": 5,
                "collaboration_score": 86,
                "location": "Chennai, Tamil Nadu",
                "availability": "Immediate Hire",
                "education": "Rajalakshmi Institute of Technology",
                "assessment_score": 90.0,
                "role_category": "Frontend Developer",
                "bio": "Designing verified decentralized applications, compiler-level AST audits, and type-safe systems across React, TypeScript, and FastAPI.",
                "github_stats": {
                    "username": "gnaneshwar-dev",
                    "commits": 248,
                    "pull_requests": 46,
                    "gpg_verified": True,
                    "lines_of_code": 14200
                },
                "verified_projects": [
                    {
                        "id": "proj_proofhire",
                        "title": "ProofHire",
                        "category": "AI & Skill Verification",
                        "grade": "A",
                        "score": 86.0,
                        "xp_awarded": 620,
                        "technologies": ["React", "TypeScript", "FastAPI", "Python", "Polygon"],
                        "ast_verified": True,
                        "detailed_metrics": {
                            "technical_complexity": 91,
                            "code_quality": 84,
                            "innovation": 87,
                            "industry_relevance": 90,
                            "documentation": 76,
                            "completion": 93,
                            "collaboration": 82
                        }
                    },
                    {
                        "id": "proj_fastapi_queue",
                        "title": "FastAPI Distributed Task Queue",
                        "category": "Backend Architecture",
                        "grade": "B",
                        "score": 84.0,
                        "xp_awarded": 450,
                        "technologies": ["Python", "FastAPI", "Celery", "Redis", "Prometheus"],
                        "ast_verified": True
                    },
                    {
                        "id": "proj_campus_optimizer",
                        "title": "Campus Resource Optimizer",
                        "category": "Web & Optimization",
                        "grade": "B",
                        "score": 81.5,
                        "xp_awarded": 400,
                        "technologies": ["React", "TypeScript", "Python", "FastAPI"],
                        "ast_verified": True
                    }
                ],
                "collaboration_history": [
                    {
                        "project": "ProofHire Verification Engine",
                        "role": "Lead Architect",
                        "contribution_percentage": 45.0,
                        "contribution_score": 92,
                        "peer_review_status": "Verified"
                    }
                ],
                "certificates": [
                    {
                        "name": "Meta Advanced React & Systems Engineering",
                        "issuer": "Meta Certified Professional",
                        "issued_date": "October 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    },
                    {
                        "name": "DeepLearning.AI Python for AI & High-Performance Computing",
                        "issuer": "DeepLearning.AI",
                        "issued_date": "August 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    },
                    {
                        "name": "AWS Certified Cloud Practitioner",
                        "issuer": "Amazon Web Services",
                        "issued_date": "July 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    }
                ],
                "assessments": [
                    {
                        "name": "React 19 & TypeScript Production Architecture MCQ",
                        "score": 90.0,
                        "percentile": "Top 4.2% Global",
                        "date": "February 2025"
                    }
                ],
                "verification_history": [
                    {
                        "event": "Polygon Credential Anchor",
                        "tx_hash": "0x7a8109d5c3f2e14b8a21390d64a2b9104c63e8a1f7d24c0e3951ab42cf891e0a",
                        "network": "Polygon PoS",
                        "timestamp": "2025-01-15"
                    }
                ]
            },
            {
                "id": "cand_alexchen",
                "username": "alexchen",
                "name": "Alex Chen",
                "headline": "Systems Software Engineer | Rust • Distributed Systems",
                "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
                "level": 38,
                "overall_grade": "B",
                "reputation_grade_title": "Professional Reputation Grade: Tier B",
                "top_skills": [
                    {"skill_name": "Rust", "score": 91, "level": 35},
                    {"skill_name": "Distributed Systems", "score": 89, "level": 33},
                    {"skill_name": "Git", "score": 85, "level": 32},
                    {"skill_name": "Linux Systems", "score": 83, "level": 30},
                    {"skill_name": "Go", "score": 81, "level": 28},
                    {"skill_name": "React", "score": 88, "level": 34},
                    {"skill_name": "TypeScript", "score": 84, "level": 32},
                    {"skill_name": "Next.js", "score": 81, "level": 30}
                ],
                "skills": {
                    "Rust": {"score": 91, "level": 35},
                    "Distributed Systems": {"score": 89, "level": 33},
                    "React": {"score": 88, "level": 34},
                    "TypeScript": {"score": 84, "level": 32},
                    "Next.js": {"score": 81, "level": 30},
                    "Git": {"score": 85, "level": 32}
                },
                "badges": [
                    "Systems Architect — Gold",
                    "Consistent Builder — Gold",
                    "Team Collaborator — Silver",
                    "Open Source Contributor — Silver"
                ],
                "verified_projects_count": 6,
                "collaboration_score": 84,
                "location": "San Francisco, CA / Remote",
                "availability": "Immediate Hire",
                "education": "UC Berkeley (B.S. EECS)",
                "assessment_score": 95.0,
                "role_category": "Frontend Developer",
                "bio": "Specializing in high-performance Raft consensus protocols, io_uring asynchronous Linux networking, and LSM-tree storage engines.",
                "github_stats": {
                    "username": "alexchen",
                    "commits": 384,
                    "pull_requests": 62,
                    "gpg_verified": True,
                    "lines_of_code": 18400
                },
                "verified_projects": [
                    {
                        "id": "proj_hyper_raft",
                        "title": "HyperRaft",
                        "category": "Rust Systems",
                        "grade": "O",
                        "score": 96.4,
                        "technologies": ["Rust", "io_uring", "Tokio"],
                        "ast_verified": True
                    },
                    {
                        "id": "proj_distri_kv",
                        "title": "DistriKV",
                        "category": "Storage Internals",
                        "grade": "A",
                        "score": 89.4,
                        "technologies": ["Rust", "RocksDB", "WAL"],
                        "ast_verified": True
                    }
                ],
                "collaboration_history": [
                    {
                        "project": "HyperRaft Consensus Engine",
                        "role": "Lead Architect",
                        "contribution_percentage": 78.0,
                        "contribution_score": 96,
                        "peer_review_status": "Verified"
                    }
                ],
                "certificates": [
                    {
                        "name": "Stanford Distributed Systems & Consensus Foundations",
                        "issuer": "Stanford Online",
                        "issued_date": "May 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    },
                    {
                        "name": "AWS Certified Solutions Architect — Associate",
                        "issuer": "Amazon Web Services",
                        "issued_date": "September 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    }
                ],
                "assessments": [
                    {
                        "name": "Distributed Systems & Concurrency Benchmark",
                        "score": 95.0,
                        "percentile": "Top 1.5% Global",
                        "date": "January 2025"
                    }
                ],
                "verification_history": [
                    {
                        "event": "Polygon Credential Anchor",
                        "tx_hash": "0x04f128e02c918a284e311d445218d6e3c041b3200194819aef1004918294a012",
                        "network": "Polygon PoS",
                        "timestamp": "2024-12-14"
                    }
                ]
            },
            {
                "id": "cand_priyasharma",
                "username": "psharma",
                "name": "Priya Sharma",
                "headline": "ML Systems & Compiler Engineer | PyTorch • CUDA • Triton",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
                "level": 42,
                "overall_grade": "A",
                "reputation_grade_title": "Professional Reputation Grade: Tier A",
                "top_skills": [
                    {"skill_name": "Python", "score": 94, "level": 38},
                    {"skill_name": "PyTorch Internals", "score": 92, "level": 36},
                    {"skill_name": "CUDA & Triton", "score": 90, "level": 34},
                    {"skill_name": "Git", "score": 86, "level": 33},
                    {"skill_name": "C++", "score": 84, "level": 31}
                ],
                "skills": {
                    "Python": {"score": 94, "level": 38},
                    "CUDA": {"score": 90, "level": 34},
                    "PyTorch Internals": {"score": 92, "level": 36},
                    "Compilers": {"score": 90, "level": 34}
                },
                "badges": [
                    "AI Developer — Gold",
                    "Python Developer — Gold",
                    "Consistent Builder — Gold"
                ],
                "verified_projects_count": 5,
                "collaboration_score": 88,
                "location": "Bengaluru, Karnataka",
                "availability": "2 Weeks Notice",
                "education": "IIIT Hyderabad (B.Tech Computer Science)",
                "assessment_score": 97.5,
                "role_category": "AI Developer",
                "bio": "Optimizing vLLM inference kernels, custom Triton JIT flash-attention compilation, and tensor memory reuse.",
                "github_stats": {
                    "username": "psharma-ai",
                    "commits": 310,
                    "pull_requests": 42,
                    "gpg_verified": True,
                    "lines_of_code": 26800
                },
                "verified_projects": [
                    {
                        "id": "proj_tinyllm_quant",
                        "title": "TinyLLM-Quant",
                        "category": "Machine Learning",
                        "grade": "O",
                        "score": 97.2,
                        "technologies": ["Python", "PyTorch", "Triton", "CUDA"],
                        "ast_verified": True
                    }
                ],
                "collaboration_history": [
                    {
                        "project": "ProofHire Verification Engine",
                        "role": "Smart Contract Contributor",
                        "contribution_percentage": 20.0,
                        "contribution_score": 88,
                        "peer_review_status": "Verified"
                    }
                ],
                "certificates": [
                    {
                        "name": "NVIDIA DLI: CUDA C/C++ Accelerated Computing",
                        "issuer": "NVIDIA Deep Learning Institute",
                        "issued_date": "November 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    }
                ],
                "assessments": [
                    {
                        "name": "CUDA Kernels & PyTorch Performance Benchmark",
                        "score": 97.5,
                        "percentile": "Top 0.8% Global",
                        "date": "January 2025"
                    }
                ],
                "verification_history": [
                    {
                        "event": "Polygon Credential Anchor",
                        "tx_hash": "0x53d828e02c918a284e311d445218d6e3c0433ea1",
                        "network": "Polygon PoS",
                        "timestamp": "2024-11-28"
                    }
                ]
            },
            {
                "id": "cand_elenarostova",
                "username": "erostova",
                "name": "Elena Rostova",
                "headline": "Backend & Infrastructure Engineer | Go • Kubernetes • eBPF",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
                "level": 36,
                "overall_grade": "B",
                "reputation_grade_title": "Professional Reputation Grade: Tier B",
                "top_skills": [
                    {"skill_name": "Go", "score": 89, "level": 34},
                    {"skill_name": "Kubernetes Internals", "score": 85, "level": 31},
                    {"skill_name": "Docker & CI/CD", "score": 84, "level": 30},
                    {"skill_name": "Linux eBPF", "score": 83, "level": 29},
                    {"skill_name": "Git", "score": 82, "level": 29}
                ],
                "skills": {
                    "Go": {"score": 89, "level": 34},
                    "Kubernetes Internals": {"score": 85, "level": 31},
                    "Linux eBPF": {"score": 83, "level": 29},
                    "Docker": {"score": 84, "level": 30}
                },
                "badges": [
                    "Backend Developer — Gold",
                    "Team Collaborator — Silver",
                    "Open Source Contributor — Silver"
                ],
                "verified_projects_count": 5,
                "collaboration_score": 90,
                "location": "Berlin, Germany / Hybrid",
                "availability": "Immediate Hire",
                "education": "Technical University of Munich (B.Sc. Informatics)",
                "assessment_score": 92.4,
                "role_category": "Backend Developer",
                "bio": "Specializing in zero-allocation Linux eBPF networking, XDP socket filtering, and Kubernetes custom resource controllers.",
                "github_stats": {
                    "username": "erostova",
                    "commits": 410,
                    "pull_requests": 54,
                    "gpg_verified": True,
                    "lines_of_code": 22400
                },
                "verified_projects": [
                    {
                        "id": "proj_bpfmesh",
                        "title": "BpfMesh",
                        "category": "Kernel & Networking",
                        "grade": "A",
                        "score": 92.4,
                        "technologies": ["Go", "C", "Linux eBPF", "XDP"],
                        "ast_verified": True
                    }
                ],
                "collaboration_history": [
                    {
                        "project": "BpfMesh Zero-Alloc eBPF Filter",
                        "role": "Lead Architect",
                        "contribution_percentage": 68.0,
                        "contribution_score": 94,
                        "peer_review_status": "Verified"
                    }
                ],
                "certificates": [
                    {
                        "name": "Certified Kubernetes Administrator (CKA)",
                        "issuer": "CNCF",
                        "issued_date": "October 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    }
                ],
                "assessments": [],
                "verification_history": []
            },
            {
                "id": "cand_arunkumar",
                "username": "arunkumar",
                "name": "Arun Kumar",
                "headline": "Full-Stack Developer | React • Node.js • PostgreSQL",
                "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces",
                "level": 33,
                "overall_grade": "B",
                "reputation_grade_title": "Professional Reputation Grade: Tier B",
                "top_skills": [
                    {"skill_name": "React", "score": 84, "level": 31},
                    {"skill_name": "Node.js & Express", "score": 82, "level": 29},
                    {"skill_name": "TypeScript", "score": 81, "level": 28},
                    {"skill_name": "Git", "score": 80, "level": 28},
                    {"skill_name": "PostgreSQL", "score": 79, "level": 27}
                ],
                "skills": {
                    "React": {"score": 84, "level": 31},
                    "TypeScript": {"score": 81, "level": 28},
                    "PostgreSQL": {"score": 79, "level": 27}
                },
                "badges": [
                    "Frontend Developer — Silver",
                    "Backend Developer — Silver",
                    "Team Collaborator — Silver"
                ],
                "verified_projects_count": 4,
                "collaboration_score": 85,
                "location": "Hyderabad, Telangana",
                "availability": "Immediate Hire",
                "education": "PES University (B.E. Computer Science)",
                "assessment_score": 88.0,
                "role_category": "Full Stack Developer",
                "bio": "Building responsive full-stack applications with robust type-safe API boundaries and real-time state management.",
                "github_stats": {
                    "username": "arun-kumar",
                    "commits": 240,
                    "pull_requests": 38,
                    "gpg_verified": True,
                    "lines_of_code": 19200
                },
                "verified_projects": [
                    {
                        "id": "proj_fleettrack",
                        "title": "FleetTrack IoT Telemetry Platform",
                        "category": "Full Stack",
                        "grade": "B",
                        "score": 83.0,
                        "technologies": ["React", "Node.js", "PostgreSQL"],
                        "ast_verified": True
                    }
                ],
                "collaboration_history": [
                    {
                        "project": "ProofHire Verification Engine",
                        "role": "Frontend Contributor",
                        "contribution_percentage": 35.0,
                        "contribution_score": 86,
                        "peer_review_status": "Verified"
                    }
                ],
                "certificates": [
                    {
                        "name": "PostgreSQL 16 Advanced Database Administration",
                        "issuer": "EnterpriseDB",
                        "issued_date": "September 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    }
                ],
                "assessments": [],
                "verification_history": []
            },
            {
                "id": "cand_davidkalu",
                "username": "dkalu",
                "name": "David Kalu",
                "headline": "Frontend & Graphics Engineer | TypeScript • WebGL • WebGPU",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
                "level": 35,
                "overall_grade": "B",
                "reputation_grade_title": "Professional Reputation Grade: Tier B",
                "top_skills": [
                    {"skill_name": "TypeScript", "score": 87, "level": 33},
                    {"skill_name": "WebGL & WebGPU", "score": 85, "level": 31},
                    {"skill_name": "React", "score": 83, "level": 30},
                    {"skill_name": "Git", "score": 81, "level": 29},
                    {"skill_name": "Three.js", "score": 80, "level": 28}
                ],
                "skills": {
                    "TypeScript": {"score": 87, "level": 33},
                    "WebGL": {"score": 85, "level": 31},
                    "React": {"score": 83, "level": 30}
                },
                "badges": [
                    "Frontend Developer — Gold",
                    "React Developer — Silver",
                    "Team Collaborator — Silver"
                ],
                "verified_projects_count": 4,
                "collaboration_score": 82,
                "location": "London, UK / Remote",
                "availability": "Open to Collaborations",
                "education": "University of Manchester (B.Sc. Computer Science)",
                "assessment_score": 85.0,
                "role_category": "Frontend Developer",
                "bio": "Designing high-density data canvas platforms using WebGL, WebGPU, and custom streaming WebAssembly pipelines.",
                "github_stats": {
                    "username": "davidkalu",
                    "commits": 190,
                    "pull_requests": 28,
                    "gpg_verified": True,
                    "lines_of_code": 13800
                },
                "verified_projects": [
                    {
                        "id": "proj_canvas_gl",
                        "title": "CanvasGL Engine",
                        "category": "Graphics & UI Systems",
                        "grade": "A",
                        "score": 91.8,
                        "technologies": ["TypeScript", "WebGL", "WASM"],
                        "ast_verified": True
                    }
                ],
                "collaboration_history": [],
                "certificates": [
                    {
                        "name": "WebGPU Graphics Programming & Shader Engineering",
                        "issuer": "Khronos Group",
                        "issued_date": "November 2024",
                        "verification_level": "Platform Verified",
                        "document_integrity": "Valid"
                    }
                ],
                "assessments": [],
                "verification_history": []
            }
        ]

    # -------------------------------------------------------------
    # Dashboard Overview Data
    # -------------------------------------------------------------
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Returns compact metrics and overview sections for the recruiter dashboard."""
        
        # Calculate match scores for recommended candidates against default role
        recommended = []
        for c in self.candidates_db[:4]:
            match_res = match_engine.calculate_match_score(
                candidate=c,
                required_skills=["React", "TypeScript", "Next.js"],
                target_role="Frontend Developer"
            )
            rec_copy = dict(c)
            rec_copy["job_match"] = match_res["match_score"]
            rec_copy["why_match"] = match_res["why_this_candidate_matches"]
            recommended.append(rec_copy)

        # Sort recommended by job match descending
        recommended.sort(key=lambda x: x["job_match"], reverse=True)

        return {
            "metrics": {
                "open_positions": len(self.open_positions),
                "saved_candidates": len(self.saved_candidates),
                "assessments_sent": len(self.assessments_sent),
                "upcoming_interviews": len(self.upcoming_interviews)
            },
            "open_positions": self.open_positions,
            "recommended_candidates": recommended,
            "recent_applications": self.recent_applications,
            "upcoming_interviews": self.upcoming_interviews
        }

    # -------------------------------------------------------------
    # Talent Search with 11 Filters & Deterministic Match Engine
    # -------------------------------------------------------------
    def search_talent(
        self,
        query: Optional[str] = None,
        role: Optional[str] = None,
        skills: Optional[List[str]] = None,
        min_skill_level: Optional[int] = None,
        overall_grade: Optional[str] = None,
        min_level: Optional[int] = None,
        badges: Optional[List[str]] = None,
        min_verified_projects: Optional[int] = None,
        min_collaboration_score: Optional[int] = None,
        location: Optional[str] = None,
        availability: Optional[str] = None,
        education: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes talent search across 11 filters and computes deterministic job match scores.
        """
        candidates = self.candidates_db

        # Parse query for keywords if present
        req_skills = skills or []
        if query:
            q_lower = query.lower()
            # Detect common skills from query
            for potential_skill in ["react", "typescript", "next.js", "python", "rust", "go", "fastapi", "cuda", "ebpf"]:
                if potential_skill in q_lower and potential_skill.title() not in req_skills:
                    req_skills.append(potential_skill.title())

            candidates = [
                c for c in candidates
                if q_lower in c["name"].lower()
                or q_lower in c["headline"].lower()
                or any(q_lower in s["skill_name"].lower() for s in c["top_skills"])
            ]

        # 1. Role Filter
        if role and role != "All Roles":
            r_lower = role.lower()
            candidates = [c for c in candidates if r_lower in c.get("role_category", "").lower() or r_lower in c["headline"].lower()]

        # 2. Skills Filter
        if skills:
            for s in skills:
                s_lower = s.lower()
                candidates = [c for c in candidates if any(s_lower in sk["skill_name"].lower() for sk in c["top_skills"])]

        # 3. Min Skill Level Filter
        if min_skill_level is not None:
            candidates = [c for c in candidates if any(sk["score"] >= min_skill_level for sk in c["top_skills"])]

        # 4. Overall Grade Filter
        if overall_grade and overall_grade != "All Grades":
            grade_order = {"O": 5, "A": 4, "B": 3, "C": 2, "D": 1, "E": 0}
            min_grade_val = grade_order.get(overall_grade.upper(), 0)
            candidates = [c for c in candidates if grade_order.get(c["overall_grade"].upper(), 0) >= min_grade_val]

        # 5. Min Level Filter
        if min_level is not None:
            candidates = [c for c in candidates if c["level"] >= min_level]

        # 6. Badges Filter
        if badges:
            for b in badges:
                b_lower = b.lower()
                candidates = [c for c in candidates if any(b_lower in badge.lower() for badge in c["badges"])]

        # 7. Min Verified Projects Filter
        if min_verified_projects is not None:
            candidates = [c for c in candidates if c["verified_projects_count"] >= min_verified_projects]

        # 8. Min Collaboration Score Filter
        if min_collaboration_score is not None:
            candidates = [c for c in candidates if c["collaboration_score"] >= min_collaboration_score]

        # 9. Location Filter
        if location and location != "All Locations":
            loc_lower = location.lower()
            candidates = [c for c in candidates if loc_lower in c["location"].lower()]

        # 10. Availability Filter
        if availability and availability != "All Availability":
            av_lower = availability.lower()
            candidates = [c for c in candidates if av_lower in c["availability"].lower()]

        # 11. Education Filter
        if education and education != "All Education":
            ed_lower = education.lower()
            candidates = [c for c in candidates if ed_lower in c["education"].lower()]

        # Compute deterministic match score for each candidate
        results = []
        target_skills_for_match = req_skills if req_skills else ["React", "TypeScript", "Next.js"]

        for cand in candidates:
            match_res = match_engine.calculate_match_score(
                candidate=cand,
                required_skills=target_skills_for_match,
                target_role=role
            )
            item = dict(cand)
            item["overall"] = {
                "level": cand["level"],
                "grade": cand["overall_grade"],
                "title": cand.get("reputation_grade_title", f"Professional Reputation Grade: Tier {cand['overall_grade']}")
            }
            item["job_match"] = match_res["match_score"]
            item["match_breakdown"] = match_res["signals"]
            item["why_this_candidate_matches"] = match_res["why_this_candidate_matches"]
            item["is_saved"] = cand["username"] in self.saved_candidates
            results.append(item)

        # Sort descending by job match
        results.sort(key=lambda x: x["job_match"], reverse=True)
        return results

    # -------------------------------------------------------------
    # Candidate Detail (All 10 Recruiter Sections)
    # -------------------------------------------------------------
    def get_candidate_detail(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Returns full recruiter dossier across 10 sections:
        1. Professional Summary
        2. Skill Reputation
        3. Verified Projects
        4. Project Grades
        5. GitHub Evidence
        6. Collaboration History
        7. Certificates
        8. Assessment Results
        9. Badges
        10. Verification History
        """
        cand = next((c for c in self.candidates_db if c["username"].lower() == username.lower()), None)
        if not cand:
            return None

        # Calculate match against standard benchmark
        match_res = match_engine.calculate_match_score(
            candidate=cand,
            required_skills=["React", "TypeScript", "Next.js"]
        )

        dossier = dict(cand)
        dossier["overall"] = {
            "level": cand["level"],
            "grade": cand["overall_grade"],
            "title": cand.get("reputation_grade_title", f"Professional Reputation Grade: Tier {cand['overall_grade']}")
        }
        dossier["professional_summary"] = {
            "bio": cand.get("bio"),
            "headline": cand.get("headline"),
            "location": cand.get("location"),
            "availability": cand.get("availability"),
            "education": cand.get("education")
        }
        dossier["skill_reputation"] = cand.get("top_skills", [])
        dossier["project_grades"] = [
            {
                "title": p["title"],
                "grade": p.get("grade", "A"),
                "score": p.get("score", 90.0),
                "category": p.get("category", "Engineering"),
                "ast_verified": p.get("ast_verified", True)
            }
            for p in cand.get("verified_projects", [])
        ]
        dossier["github_evidence"] = cand.get("github_stats", {})
        dossier["assessment_results"] = cand.get("assessments", [])
        dossier["job_match"] = match_res["match_score"]
        dossier["match_breakdown"] = match_res["signals"]
        dossier["why_this_candidate_matches"] = match_res["why_this_candidate_matches"]
        dossier["is_saved"] = cand["username"] in self.saved_candidates
        return dossier

    # -------------------------------------------------------------
    # Recruiter Actions
    # -------------------------------------------------------------
    def toggle_save_candidate(self, username: str) -> Dict[str, Any]:
        """Toggles saved state for candidate."""
        uname = username.lower()
        if uname in self.saved_candidates:
            self.saved_candidates.remove(uname)
            is_saved = False
        else:
            self.saved_candidates.append(uname)
            is_saved = True

        return {"username": username, "is_saved": is_saved, "total_saved": len(self.saved_candidates)}

    def send_assessment(self, username: str, assessment_name: str) -> Dict[str, Any]:
        """Dispatches an assessment invite to a candidate."""
        cand = next((c for c in self.candidates_db if c["username"].lower() == username.lower()), None)
        cand_name = cand["name"] if cand else username.title()

        new_as = {
            "id": f"as_{uuid.uuid4().hex[:6]}",
            "candidate_name": cand_name,
            "candidate_username": username,
            "assessment_name": assessment_name,
            "status": "SENT",
            "score": None,
            "sent_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "completed_date": None
        }
        self.assessments_sent.insert(0, new_as)
        return {"status": "SUCCESS", "assessment": new_as, "message": f"Assessment '{assessment_name}' sent to {cand_name}."}

    def invite_to_interview(self, username: str, role_title: str, date_time: Optional[str] = None) -> Dict[str, Any]:
        """Schedules a Jitsi video interview huddle."""
        cand = next((c for c in self.candidates_db if c["username"].lower() == username.lower()), None)
        cand_name = cand["name"] if cand else username.title()
        avatar = cand["avatar_url"] if cand else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces"

        room_id = f"proofhire-{username}-{uuid.uuid4().hex[:6]}"
        jitsi_url = f"https://meet.jit.si/{room_id}"

        new_int = {
            "id": f"int_{uuid.uuid4().hex[:6]}",
            "candidate_name": cand_name,
            "candidate_username": username,
            "avatar_url": avatar,
            "role_title": role_title,
            "date_time": date_time or "Upcoming (TBD)",
            "interviewer": "Recruiting Team",
            "jitsi_url": jitsi_url,
            "status": "Scheduled"
        }
        self.upcoming_interviews.insert(0, new_int)
        return {"status": "SUCCESS", "interview": new_int, "jitsi_url": jitsi_url, "message": f"Interview scheduled with {cand_name}."}

recruiter_service = RecruiterService()
