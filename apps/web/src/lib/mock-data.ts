import { CandidateProfile, AssessmentScenario, VerificationActivity, ProfessionalProfile, Project, CertificateItem, BadgeItem, CollaborationItem, AssessmentRecord } from "./types";

// ============================================================================
// 10 REALISTIC PROJECTS
// ============================================================================

export const MOCK_PROJECTS: Record<string, Project> = {
  proofhire: {
    id: "proj_proofhire",
    title: "ProofHire",
    slug: "proofhire",
    category: "AI & Skill Verification",
    evaluation_cycle_id: "#1092",
    description: "Decentralized cryptographic skill verification and engineering hiring platform. Evaluates codebases using compiler-level AST audits, multi-signal GitHub contribution attribution, and Polygon blockchain proof anchoring.",
    repo_url: "https://github.com/gnaneshwar-dev/proofhire",
    demo_url: "https://proofhire.network",
    primary_stack: ["React", "TypeScript", "FastAPI", "Python", "Polygon"],
    grade: "A",
    score: 86.0,
    xp_awarded: 620,
    metrics: {
      architecture: 91.0,
      test_coverage: 84.0,
      code_quality: 84.0,
      doc_clarity: 76.0
    },
    detailed_metrics: {
      technical_complexity: 91,
      code_quality: 84,
      innovation: 87,
      industry_relevance: 90,
      documentation: 76,
      completion: 93,
      collaboration: 82
    },
    sha256_hash: "a49f78bc021489e7100bfa28901cde901844b201f98129841029841029810298",
    polygon_tx_hash: "0x7a8109d5c3f2e14b8a21390d64a2b9104c63e8a1f7d24c0e3951ab42cf891e0a",
    merkle_root: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    commit_count: 248,
    loc_count: 14200,
    gemini_review_note: "Rigorous static analysis pass: zero type safety leaks across 14,200 LOC, deterministic 5-source XP calculation algorithm, clean separation of presentation components and REST services, and robust transaction verification on Polygon Amoy.",
    created_at: "2025-01-15T10:00:00Z",
    attributions: [
      {
        contributor_name: "GNANESHWAR R",
        github_handle: "gnaneshwar-dev",
        role_description: "System architecture, AST parser visitor, and FastAPI backend",
        lines_of_code: 9230,
        percentage: 65.0,
        is_verified_gpg: true
      },
      {
        contributor_name: "Arun Kumar",
        github_handle: "arun-kumar",
        role_description: "Frontend dashboard components & Tailwind design tokens",
        lines_of_code: 3550,
        percentage: 25.0,
        is_verified_gpg: true
      },
      {
        contributor_name: "Priya Sharma",
        github_handle: "priya-sharma",
        role_description: "Polygon smart contract integration & test suites",
        lines_of_code: 1420,
        percentage: 10.0,
        is_verified_gpg: true
      }
    ]
  },
  hyper_raft: {
    id: "proj_hyper_raft",
    title: "HyperRaft",
    slug: "hyper-raft",
    category: "Rust Systems",
    evaluation_cycle_id: "#881",
    description: "Asynchronous multi-raft consensus engine focused on sub-millisecond p99 heartbeats, lock-free batching pipelines, and zero-allocation io_uring networking on Linux kernel 6.x.",
    repo_url: "https://github.com/alexchen/hyper-raft",
    demo_url: "https://crates.io/crates/hyper-raft",
    primary_stack: ["Rust", "Tokio", "io_uring", "Raft"],
    grade: "O",
    score: 96.4,
    xp_awarded: 750,
    metrics: {
      architecture: 98.0,
      test_coverage: 96.4,
      code_quality: 95.0,
      doc_clarity: 92.0
    },
    detailed_metrics: {
      technical_complexity: 98,
      code_quality: 95,
      innovation: 94,
      industry_relevance: 96,
      documentation: 92,
      completion: 98,
      collaboration: 84
    },
    sha256_hash: "d8a2f77c8e310024ff0e6871141bc2d3e5b304cb77a118f6004b912a77c88129",
    polygon_tx_hash: "0x04f128e02c918a284e311d445218d6e3c041b3200194819aef1004918294a012",
    merkle_root: "0x892a01f9c882bc71900184910248a71928491048192a00194820194820194820",
    commit_count: 384,
    loc_count: 18400,
    gemini_review_note: "Zero-copy serialization, formally verified state transitions, zero unsafe memory violations across 18,400 LOC. Exceptional fault recovery under chaotic net-split conditions with 100% linearizability retention.",
    created_at: "2024-12-14T09:30:00Z",
    attributions: [
      {
        contributor_name: "Alex Chen",
        github_handle: "alexchen",
        role_description: "Core state machine & log replication",
        lines_of_code: 14352,
        percentage: 78.0,
        is_verified_gpg: true
      },
      {
        contributor_name: "Sarah Lin",
        github_handle: "sarahlin",
        role_description: "gRPC network transport",
        lines_of_code: 2576,
        percentage: 14.0,
        is_verified_gpg: true
      },
      {
        contributor_name: "Marcus Bell",
        github_handle: "marcusbell",
        role_description: "Criterion micro-benchmarking",
        lines_of_code: 1472,
        percentage: 8.0,
        is_verified_gpg: true
      }
    ]
  },
  tinyllm_quant: {
    id: "proj_tinyllm_quant",
    title: "TinyLLM-Quant",
    slug: "tinyllm-quant",
    category: "Machine Learning & Compilers",
    evaluation_cycle_id: "#914",
    description: "High-throughput 4-bit integer quantized attention kernel written in OpenAI Triton. Eliminates memory-bound bottlenecks in 70B parameter LLM inference with zero perplexity degradation.",
    repo_url: "https://github.com/psharma-ai/tinyllm-quant",
    demo_url: "https://huggingface.co/psharma/tinyllm-quant",
    primary_stack: ["Python", "PyTorch", "Triton", "CUDA", "C++"],
    grade: "O",
    score: 97.2,
    xp_awarded: 750,
    metrics: {
      architecture: 98.0,
      test_coverage: 96.0,
      code_quality: 97.0,
      doc_clarity: 94.0
    },
    detailed_metrics: {
      technical_complexity: 99,
      code_quality: 97,
      innovation: 96,
      industry_relevance: 98,
      documentation: 94,
      completion: 97,
      collaboration: 88
    },
    sha256_hash: "53d828e02c918a284e311d445218d6e3c0433ea1902481092841029841029810",
    polygon_tx_hash: "0x53d828e02c918a284e311d445218d6e3c0433ea1",
    commit_count: 210,
    loc_count: 11800,
    gemini_review_note: "3.4x faster attention forward pass than standard FP16 vLLM baselines on NVIDIA H100 with zero kernel panics and full PyTorch 2.4 inductor compatibility.",
    created_at: "2024-11-28T14:00:00Z",
    attributions: [
      {
        contributor_name: "Priya Sharma",
        github_handle: "psharma-ai",
        role_description: "Custom Triton JIT attention kernel & quantization pass",
        lines_of_code: 10620,
        percentage: 90.0,
        is_verified_gpg: true
      }
    ]
  },
  bpfmesh: {
    id: "proj_bpfmesh",
    title: "BpfMesh",
    slug: "bpfmesh",
    category: "Linux Kernel & Networking",
    evaluation_cycle_id: "#710",
    description: "High-speed eBPF packet-filtering engine and zero-copy ring buffer socket monitor for containerized Kubernetes workloads.",
    repo_url: "https://github.com/erostova/bpfmesh",
    primary_stack: ["Go", "C", "Linux eBPF", "XDP", "Docker"],
    grade: "A",
    score: 92.4,
    xp_awarded: 620,
    metrics: {
      architecture: 94.0,
      test_coverage: 91.0,
      code_quality: 93.0,
      doc_clarity: 90.0
    },
    sha256_hash: "12a9e3b918a284e311d445218d6e3c041fd4081b819204810298410298410298",
    polygon_tx_hash: "0x12a9e3b918a284e311d445218d6e3c041fd4081b",
    commit_count: 195,
    loc_count: 9400,
    gemini_review_note: "Passed in-kernel eBPF verifier on Linux 6.8 with 0 unbounded loop warnings and sub-microsecond packet processing latency.",
    created_at: "2024-10-10T12:00:00Z",
    attributions: [
      {
        contributor_name: "Elena Rostova",
        github_handle: "erostova",
        role_description: "eBPF C probes & Go control plane",
        lines_of_code: 8460,
        percentage: 90.0,
        is_verified_gpg: true
      }
    ]
  },
  canvas_gl: {
    id: "proj_canvas_gl",
    title: "CanvasGL Engine",
    slug: "canvas-gl",
    category: "Graphics & UI Systems",
    evaluation_cycle_id: "#642",
    description: "High-density interactive data canvas capable of rendering and streaming 500,000 nodes at sustained 60 FPS using raw WebGL shaders, spatial quadtrees, and WebAssembly vertex shaders.",
    repo_url: "https://github.com/davidkalu/canvas-gl",
    demo_url: "https://canvas-gl.demo",
    primary_stack: ["TypeScript", "WebGL", "WebGPU", "WASM", "React"],
    grade: "A",
    score: 91.8,
    xp_awarded: 580,
    metrics: {
      architecture: 93.0,
      test_coverage: 89.0,
      code_quality: 93.0,
      doc_clarity: 91.0
    },
    sha256_hash: "77c268a02c918a284e311d445218d6e3c0491b10871928410298410298102981",
    polygon_tx_hash: "0x77c268a02c918a284e311d445218d6e3c0491b10",
    commit_count: 215,
    loc_count: 14200,
    gemini_review_note: "Zero garbage collector pause spikes during rapid viewport panning, batched vertex buffer updates, and high-precision frustum culling.",
    created_at: "2024-10-18T16:00:00Z",
    attributions: [
      {
        contributor_name: "David Kalu",
        github_handle: "davidkalu",
        role_description: "Shader pipeline & Quadtree spatial index",
        lines_of_code: 12400,
        percentage: 87.0,
        is_verified_gpg: true
      }
    ]
  },
  distri_kv: {
    id: "proj_distri_kv",
    title: "DistriKV",
    slug: "distri-kv",
    category: "Storage Systems",
    evaluation_cycle_id: "#742",
    description: "Log-structured merge-tree (LSM) key-value storage engine featuring concurrent SSTable compactions, write-ahead logging (WAL), and memory-mapped bloom filters.",
    repo_url: "https://github.com/alexchen/distri-kv",
    primary_stack: ["Rust", "RocksDB", "WAL", "eBPF"],
    grade: "A",
    score: 89.4,
    xp_awarded: 550,
    metrics: {
      architecture: 91.0,
      test_coverage: 88.0,
      code_quality: 90.0,
      doc_clarity: 89.0
    },
    sha256_hash: "9b12a88ef110c4327a1998f45a0bce11a76c8109d3e87a229102984102984102",
    polygon_tx_hash: "0x64bf89d71c4a0129bc37f190e29d0089aef41010",
    commit_count: 180,
    loc_count: 10400,
    gemini_review_note: "Clean WAL implementation with SSTable compaction, comprehensive benchmark suites against RocksDB showing 18% lower p99 write latency under simulated high concurrency.",
    created_at: "2024-09-12T11:00:00Z",
    attributions: [
      {
        contributor_name: "Alex Chen",
        github_handle: "alexchen",
        role_description: "LSM compaction pipeline & bloom filter",
        lines_of_code: 9360,
        percentage: 90.0,
        is_verified_gpg: true
      }
    ]
  },
  fastapi_queue: {
    id: "proj_fastapi_queue",
    title: "FastAPI Distributed Task Queue",
    slug: "fastapi-task-queue",
    category: "Backend Architecture",
    evaluation_cycle_id: "#804",
    description: "Resilient distributed job dispatcher with automatic exponential backoff, dead-letter queue isolation, and Prometheus telemetry exporters.",
    repo_url: "https://github.com/gnaneshwar-dev/fastapi-task-queue",
    primary_stack: ["Python", "FastAPI", "Celery", "Redis", "Prometheus"],
    grade: "B",
    score: 84.0,
    xp_awarded: 450,
    metrics: {
      architecture: 86.0,
      test_coverage: 83.0,
      code_quality: 85.0,
      doc_clarity: 82.0
    },
    detailed_metrics: {
      technical_complexity: 85,
      code_quality: 84,
      innovation: 80,
      industry_relevance: 88,
      documentation: 82,
      completion: 90,
      collaboration: 80
    },
    sha256_hash: "4c8996fb92427ae41e4649b934ca495991b7852b8559b12a88ef110c4327a199",
    polygon_tx_hash: "0x4c8996fb92427ae41e4649b934ca495991b7852b",
    commit_count: 142,
    loc_count: 6800,
    gemini_review_note: "Production-ready task scheduler with async Redis connection pooling, graceful SIGTERM worker draining, and comprehensive unit tests with pytest-asyncio.",
    created_at: "2024-10-04T15:20:00Z",
    attributions: [
      {
        contributor_name: "GNANESHWAR R",
        github_handle: "gnaneshwar-dev",
        role_description: "API router, worker pool supervisor, and Redis retry logic",
        lines_of_code: 5780,
        percentage: 85.0,
        is_verified_gpg: true
      }
    ]
  },
  fleettrack: {
    id: "proj_fleettrack",
    title: "FleetTrack IoT Telemetry Platform",
    slug: "fleettrack-iot",
    category: "Full Stack & Real-time Systems",
    evaluation_cycle_id: "#765",
    description: "Real-time fleet telemetry monitoring dashboard handling 10,000 GPS events per minute with geospatial geofencing alerts and historical route playback.",
    repo_url: "https://github.com/arun-kumar/fleettrack",
    primary_stack: ["React", "Node.js", "PostgreSQL", "TimescaleDB", "TailwindCSS"],
    grade: "B",
    score: 83.0,
    xp_awarded: 430,
    metrics: {
      architecture: 84.0,
      test_coverage: 80.0,
      code_quality: 84.0,
      doc_clarity: 82.0
    },
    sha256_hash: "6e3c041aa09c88e1e02c918a284e311d445218d6e3c041aa09c88e1e02c918a2",
    polygon_tx_hash: "0x88e1e02c918a284e311d445218d6e3c041aa09c",
    commit_count: 165,
    loc_count: 7900,
    gemini_review_note: "Clean TimescaleDB hypertable schema design with spatial indexes for sub-10ms point-in-polygon queries.",
    created_at: "2024-08-22T10:00:00Z",
    attributions: [
      {
        contributor_name: "Arun Kumar",
        github_handle: "arun-kumar",
        role_description: "Full-stack integration, WebSocket stream, and map components",
        lines_of_code: 6715,
        percentage: 85.0,
        is_verified_gpg: true
      }
    ]
  },
  campus_optimizer: {
    id: "proj_campus_optimizer",
    title: "Campus Resource Optimizer",
    slug: "campus-resource-optimizer",
    category: "Web & Algorithmic Optimization",
    evaluation_cycle_id: "#680",
    description: "Automated academic classroom and laboratory schedule optimizer utilizing constraint satisfaction algorithms to eliminate scheduling conflicts across 6,000 students.",
    repo_url: "https://github.com/gnaneshwar-dev/campus-resource-optimizer",
    primary_stack: ["React", "TypeScript", "Python", "FastAPI", "SQLite"],
    grade: "B",
    score: 81.5,
    xp_awarded: 400,
    metrics: {
      architecture: 83.0,
      test_coverage: 80.0,
      code_quality: 82.0,
      doc_clarity: 80.0
    },
    detailed_metrics: {
      technical_complexity: 82,
      code_quality: 81,
      innovation: 83,
      industry_relevance: 80,
      documentation: 80,
      completion: 88,
      collaboration: 78
    },
    sha256_hash: "7852b8559b12a88ef110c4327a1998f45a0bce11a76c8109d3e87a2291029841",
    polygon_tx_hash: "0x7852b8559b12a88ef110c4327a1998f45a0bce11",
    commit_count: 110,
    loc_count: 5200,
    gemini_review_note: "Backtracking solver with forward checking and minimum-remaining-values heuristic, packaged with a clean React scheduling view.",
    created_at: "2024-07-15T09:00:00Z",
    attributions: [
      {
        contributor_name: "GNANESHWAR R",
        github_handle: "gnaneshwar-dev",
        role_description: "CSP solver engine, REST API, and interactive timetable grid",
        lines_of_code: 4680,
        percentage: 90.0,
        is_verified_gpg: true
      }
    ]
  },
  torchgraph: {
    id: "proj_torchgraph",
    title: "TorchGraph Optimizer",
    slug: "torchgraph-optimizer",
    category: "AI Infrastructure",
    evaluation_cycle_id: "#890",
    description: "PyTorch FX symbolic graph pass that detects and fuses adjacent element-wise kernels, reducing intermediate tensor memory allocations by 34%.",
    repo_url: "https://github.com/psharma-ai/torchgraph-optimizer",
    primary_stack: ["Python", "PyTorch FX", "C++", "ONNX"],
    grade: "A",
    score: 90.5,
    xp_awarded: 560,
    metrics: {
      architecture: 92.0,
      test_coverage: 88.0,
      code_quality: 91.0,
      doc_clarity: 90.0
    },
    sha256_hash: "90248109284102984102981053d828e02c918a284e311d445218d6e3c0433ea1",
    polygon_tx_hash: "0x90248109284102984102981053d828e02c918a28",
    commit_count: 135,
    loc_count: 6400,
    gemini_review_note: "Custom FX node rewriter pass with deterministic topological ordering and memory footprint regression tests.",
    created_at: "2024-09-02T13:45:00Z",
    attributions: [
      {
        contributor_name: "Priya Sharma",
        github_handle: "psharma-ai",
        role_description: "Symbolic tracer parser & kernel fusion pass",
        lines_of_code: 5760,
        percentage: 90.0,
        is_verified_gpg: true
      }
    ]
  }
};

// ============================================================================
// 12 VERIFIED CERTIFICATES
// ============================================================================

export const MOCK_CERTIFICATES: Record<string, CertificateItem> = {
  meta_react: {
    id: "cert_meta_react",
    title: "Meta Advanced React & Systems Engineering",
    issuer: "Meta Certified Professional",
    issueDate: "Oct 2024",
    expiryDate: "Oct 2026",
    verificationStatus: "Verified",
    credentialUrl: "https://coursera.org/verify/META-RCT-442190",
    credentialId: "PH-META-9012",
    blockchainId: "0x7a81...1e0a"
  },
  dl_python: {
    id: "cert_dl_python",
    title: "DeepLearning.AI: Python for AI & High-Performance Computing",
    issuer: "DeepLearning.AI",
    issueDate: "Aug 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://learn.deeplearning.ai/verify/PH-DLAI-3142",
    credentialId: "PH-DLAI-3142",
    blockchainId: "0x4c89...a199"
  },
  aws_cloud: {
    id: "cert_aws_cloud",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    issueDate: "Jul 2024",
    expiryDate: "Jul 2027",
    verificationStatus: "Verified",
    credentialUrl: "https://aws.amazon.com/verification/AWS-CCP-8821",
    credentialId: "PH-AWS-8821",
    blockchainId: "0x7852...9841"
  },
  stanford_consensus: {
    id: "cert_stanford_consensus",
    title: "Stanford Distributed Systems & Consensus Foundations",
    issuer: "Stanford Online",
    issueDate: "May 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://online.stanford.edu/verify/CS244B",
    credentialId: "PH-STAN-244B",
    blockchainId: "0x04f1...8294"
  },
  aws_arch: {
    id: "cert_aws_arch",
    title: "AWS Certified Solutions Architect — Associate",
    issuer: "Amazon Web Services",
    issueDate: "Sep 2024",
    expiryDate: "Sep 2027",
    verificationStatus: "Verified",
    credentialUrl: "https://aws.amazon.com/verification/AWS-SAA-7419",
    credentialId: "PH-AWS-7419",
    blockchainId: "0x64bf...4101"
  },
  nv_cuda: {
    id: "cert_nv_cuda",
    title: "NVIDIA DLI: CUDA C/C++ Accelerated Computing",
    issuer: "NVIDIA Deep Learning Institute",
    issueDate: "Nov 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://courses.nvidia.com/certificates/NV-9902",
    credentialId: "PH-NV-9902",
    blockchainId: "0x53d8...3ea1"
  },
  pytorch_dev: {
    id: "cert_pytorch_dev",
    title: "PyTorch Certified Developer",
    issuer: "Linux Foundation",
    issueDate: "Jun 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://training.linuxfoundation.org/verify/LF-6721",
    credentialId: "PH-LF-6721",
    blockchainId: "0x9024...33ea"
  },
  cka: {
    id: "cert_cka",
    title: "Certified Kubernetes Administrator (CKA)",
    issuer: "Cloud Native Computing Foundation (CNCF)",
    issueDate: "Oct 2024",
    expiryDate: "Oct 2027",
    verificationStatus: "Verified",
    credentialUrl: "https://www.cncf.io/certification/cka/verify",
    credentialId: "PH-CKA-5520",
    blockchainId: "0x12a9...081b"
  },
  ebpf_linux: {
    id: "cert_ebpf_linux",
    title: "Developing Applications for Linux with eBPF",
    issuer: "Linux Foundation",
    issueDate: "Jul 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://training.linuxfoundation.org/verify/LF-8834",
    credentialId: "PH-LF-8834",
    blockchainId: "0x12a9...e3b9"
  },
  postgres_dba: {
    id: "cert_postgres_dba",
    title: "PostgreSQL 16 Advanced Database Administration",
    issuer: "EnterpriseDB",
    issueDate: "Sep 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://enterprisedb.com/verify/EDB-4091",
    credentialId: "PH-EDB-4091",
    blockchainId: "0x88e1...aa09"
  },
  joy_react: {
    id: "cert_joy_react",
    title: "The Joy of React: Advanced React Architecture",
    issuer: "Joy of React Academy",
    issueDate: "Aug 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://joyofreact.com/verify/JOR-1205",
    credentialId: "PH-JOR-1205",
    blockchainId: "0x88e1...c918"
  },
  webgpu_shader: {
    id: "cert_webgpu_shader",
    title: "WebGPU Graphics Programming & Shader Engineering",
    issuer: "Khronos Group Academy",
    issueDate: "Nov 2024",
    verificationStatus: "Verified",
    credentialUrl: "https://khronos.org/verify/KHR-3810",
    credentialId: "PH-KHR-3810",
    blockchainId: "0x77c2...91b1"
  }
};

// ============================================================================
// 10 BADGES WITH DETERMINISTIC QUALIFICATION
// ============================================================================

export const MOCK_BADGES: Record<string, BadgeItem> = {
  fe_gold: {
    id: "badge_fe_gold",
    title: "Frontend Developer",
    tier: "Gold",
    category: "Architecture",
    description: "Demonstrated production-grade component state isolation, zero layout shift, and strict typed contracts across 5+ verified repositories.",
    issuedDate: "Jan 2025",
    credentialId: "BADGE-FE-00912"
  },
  react_gold: {
    id: "badge_react_gold",
    title: "React Developer",
    tier: "Gold",
    category: "Ecosystem Mastery",
    description: "Deep proficiency in React 19 server actions, concurrent reconciliation hooks, custom reconcilers, and deterministic render trees.",
    issuedDate: "Dec 2024",
    credentialId: "BADGE-RCT-00811"
  },
  team_silver: {
    id: "badge_team_silver",
    title: "Team Collaborator",
    tier: "Silver",
    category: "Collaboration",
    description: "Substantiated 86+ peer code reviews with 0 reverted pull requests, verified GPG commit signatures, and active multi-contributor participation.",
    issuedDate: "Nov 2024",
    credentialId: "BADGE-COL-00418"
  },
  python_silver: {
    id: "badge_python_silver",
    title: "Python Developer",
    tier: "Silver",
    category: "Language Mastery",
    description: "Demonstrated idiomatic asynchronous Python programming, type annotations, and high-performance API design with FastAPI.",
    issuedDate: "Oct 2024",
    credentialId: "BADGE-PY-00342"
  },
  sys_arch_gold: {
    id: "badge_sys_arch_gold",
    title: "Systems Architect",
    tier: "Gold",
    category: "Architecture",
    description: "Architected fault-tolerant distributed consensus algorithms, zero-allocation network transports, and kernel-level storage engines.",
    issuedDate: "Jan 2025",
    credentialId: "BADGE-SYS-00109"
  },
  ai_gold: {
    id: "badge_ai_gold",
    title: "AI Developer",
    tier: "Gold",
    category: "Machine Learning",
    description: "Triton JIT attention kernel optimization, custom tensor parallelism, and low-latency quantization pipelines.",
    issuedDate: "Nov 2024",
    credentialId: "BADGE-AI-00720"
  },
  python_gold: {
    id: "badge_python_gold",
    title: "Python Developer",
    tier: "Gold",
    category: "Language Mastery",
    description: "Top 1% proficiency in Python C-extensions, PyTorch C++ bindings, and CUDA runtime integration.",
    issuedDate: "Dec 2024",
    credentialId: "BADGE-PY-00991"
  },
  be_gold: {
    id: "badge_be_gold",
    title: "Backend Developer",
    tier: "Gold",
    category: "Infrastructure",
    description: "Production Linux eBPF telemetry, high-throughput Go microservices, and Kubernetes operator design.",
    issuedDate: "Nov 2024",
    credentialId: "BADGE-BE-00624"
  },
  builder_gold: {
    id: "badge_builder_gold",
    title: "Consistent Builder",
    tier: "Gold",
    category: "Productivity",
    description: "Maintained 180+ consecutive days of verified GPG commit activity across public open-source codebases.",
    issuedDate: "Jan 2025",
    credentialId: "BADGE-BLD-00511"
  },
  oss_silver: {
    id: "badge_oss_silver",
    title: "Open Source Contributor",
    tier: "Silver",
    category: "Community",
    description: "Merged upstream pull requests to public repositories with audited test suites and formal code quality passes.",
    issuedDate: "Oct 2024",
    credentialId: "BADGE-OSS-00214"
  },
  problem_solver_gold: {
    id: "badge_ps_gold",
    title: "Problem Solver",
    tier: "Gold",
    category: "Problem Solving",
    description: "300+ verified algorithmic solutions (100+ medium, 25+ hard) with Problem Solving Score >= 80 across connected coding platforms.",
    issuedDate: "Feb 2025",
    credentialId: "BADGE-PS-GOLD-001"
  },
  consistent_solver_gold: {
    id: "badge_cs_gold",
    title: "Consistent Solver",
    tier: "Gold",
    category: "Problem Solving",
    description: "High-cadence deliberate practice demonstrated by verified problem solving across 10+ of the last 12 weeks.",
    issuedDate: "Jan 2025",
    credentialId: "BADGE-CS-GOLD-002"
  },
  algorithmic_thinking_silver: {
    id: "badge_at_silver",
    title: "Algorithmic Thinking",
    tier: "Silver",
    category: "Problem Solving",
    description: "Demonstrated broad domain competence with verified activity across 6+ algorithm categories and minimum topic score 60 in at least 4 categories.",
    issuedDate: "Jan 2025",
    credentialId: "BADGE-AT-SILVER-003"
  },
  competitive_programmer_silver: {
    id: "badge_cp_silver",
    title: "Competitive Programmer",
    tier: "Silver",
    category: "Problem Solving",
    description: "15+ verified tournament contests with at least one verified Top 25% percentile finish.",
    issuedDate: "Dec 2024",
    credentialId: "BADGE-CP-SILVER-004"
  }
};

// ============================================================================
// 3 COLLABORATIONS
// ============================================================================

export const MOCK_COLLABORATIONS: Record<string, CollaborationItem> = {
  proofhire_engine: {
    id: "collab_proofhire",
    project: "ProofHire Verification Engine",
    role: "Lead Architect",
    teamSize: 3,
    contributionPercentage: 45,
    contributionScore: 92,
    duration: "Jan 2025 – Present · 2 mos",
    projectGrade: "A"
  },
  hyperraft_consensus: {
    id: "collab_hyperraft",
    project: "HyperRaft Consensus Engine",
    role: "Lead Architect",
    teamSize: 3,
    contributionPercentage: 78,
    contributionScore: 96,
    duration: "Sep 2024 – Dec 2024 · 4 mos",
    projectGrade: "O"
  },
  bpfmesh_filter: {
    id: "collab_bpfmesh",
    project: "BpfMesh — Zero-Alloc eBPF Network Filter",
    role: "Lead Systems Contributor",
    teamSize: 3,
    contributionPercentage: 68,
    contributionScore: 94,
    duration: "Jun 2024 – Sep 2024 · 3 mos",
    projectGrade: "A"
  }
};

// ============================================================================
// 3 ASSESSMENTS
// ============================================================================

export const MOCK_ASSESSMENTS: Record<string, AssessmentRecord> = {
  react_arch: {
    id: "ass_react_arch",
    assessmentName: "React 19 & TypeScript Production Architecture MCQ",
    company: "Acme Technologies",
    score: 90.0,
    percentile: "Top 4.2% Global",
    date: "Feb 15, 2025",
    status: "Passed Tier 0"
  },
  consensus_bench: {
    id: "ass_consensus_bench",
    assessmentName: "Distributed Systems & Concurrency Benchmark",
    company: "Acme Technologies",
    score: 95.0,
    percentile: "Top 1.5% Global",
    date: "Jan 28, 2025",
    status: "Passed Tier 0"
  },
  cuda_perf: {
    id: "ass_cuda_perf",
    assessmentName: "CUDA Kernels & PyTorch Performance Benchmark",
    company: "Synthetix Labs",
    score: 97.5,
    percentile: "Top 0.8% Global",
    date: "Jan 10, 2025",
    status: "Passed Tier 0"
  }
};

// ============================================================================
// MAIN DEMONSTRATION CANDIDATE: GNANESHWAR R
// ============================================================================

export const MOCK_CURRENT_USER: CandidateProfile = {
  id: "cand_gnaneshwar",
  username: "gnaneshwar",
  full_name: "GNANESHWAR R",
  title: "Full Stack Developer | AI & Product Engineering",
  bio: "Designing verified decentralized applications, compiler-level AST audits, and type-safe systems across React, TypeScript, and FastAPI.",
  avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces",
  level: 37,
  total_xp: 8420,
  ai_quality_index: 92.6,
  verified_repos_count: 5,
  github_username: "gnaneshwar-dev",
  polygon_wallet_address: "0x7a8109d5c3f2e14b8a21390d64a2b9104c63e8a1",
  location: "Chennai, Tamil Nadu",
  university: "Rajalakshmi Institute of Technology",
  availability: "Immediate Hire",
  is_identity_verified: true,
  benchmark_project: {
    name: "ProofHire Verification Engine",
    throughput: "450ms AST Visitor · 14.2K LOC",
    ast_score: 91.0
  },
  skills: [
    { skill_name: "React", grade: "A", score: 88, xp: 2200, verified_projects: 5 },
    { skill_name: "TypeScript", grade: "A", score: 82, xp: 1600, verified_projects: 4 },
    { skill_name: "Git", grade: "A", score: 84, xp: 1850, verified_projects: 5 },
    { skill_name: "Python", grade: "B", score: 80, xp: 1450, verified_projects: 3 },
    { skill_name: "FastAPI", grade: "B", score: 76, xp: 1100, verified_projects: 3 }
  ],
  projects: [
    MOCK_PROJECTS.proofhire,
    MOCK_PROJECTS.fastapi_queue,
    MOCK_PROJECTS.campus_optimizer
  ]
};

// ============================================================================
// 6 STUDENT / DEVELOPER PROFILES
// ============================================================================

export const MOCK_CANDIDATES: CandidateProfile[] = [
  MOCK_CURRENT_USER,
  {
    id: "cand_alexchen",
    username: "alexchen",
    full_name: "Alex Chen",
    title: "Systems Software Engineer | Rust • Distributed Systems",
    bio: "Focusing on sub-millisecond Raft consensus protocols, io_uring asynchronous Linux networking, and LSM-tree storage engines.",
    avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
    level: 38,
    total_xp: 8750,
    ai_quality_index: 96.4,
    verified_repos_count: 6,
    github_username: "alexchen",
    polygon_wallet_address: "0x04f128e02c918a284e311d445218d6e3c041b320",
    location: "San Francisco, CA / Remote",
    university: "UC Berkeley",
    availability: "Immediate Hire",
    is_identity_verified: true,
    benchmark_project: {
      name: "HyperRaft Consensus Engine",
      throughput: "1.2M req/sec · 0-alloc",
      ast_score: 98.4
    },
    skills: [
      { skill_name: "Rust", grade: "O", score: 91, xp: 2800, verified_projects: 6 },
      { skill_name: "Distributed Systems", grade: "O", score: 89, xp: 2400, verified_projects: 5 },
      { skill_name: "Git", grade: "A", score: 85, xp: 1850, verified_projects: 6 },
      { skill_name: "Linux Systems", grade: "A", score: 83, xp: 1600, verified_projects: 4 },
      { skill_name: "Go", grade: "B", score: 81, xp: 1200, verified_projects: 3 }
    ],
    projects: [
      MOCK_PROJECTS.hyper_raft,
      MOCK_PROJECTS.distri_kv
    ]
  },
  {
    id: "cand_priyasharma",
    username: "psharma",
    full_name: "Priya Sharma",
    title: "ML Systems & Compiler Engineer | PyTorch • CUDA • Triton",
    bio: "Optimizing vLLM inference kernels, custom Triton JIT flash-attention compilation, and tensor memory reuse.",
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
    level: 42,
    total_xp: 10480,
    ai_quality_index: 97.2,
    verified_repos_count: 5,
    github_username: "psharma-ai",
    polygon_wallet_address: "0x53d828e02c918a284e311d445218d6e3c0433ea1",
    location: "Bengaluru, Karnataka",
    university: "IIIT Hyderabad",
    availability: "2 Weeks Notice",
    is_identity_verified: true,
    benchmark_project: {
      name: "TinyLLM-Quant (Triton 4-bit)",
      throughput: "3.4x vLLM speedup · 0-error",
      ast_score: 99.1
    },
    skills: [
      { skill_name: "Python", grade: "O", score: 94, xp: 3200, verified_projects: 5 },
      { skill_name: "PyTorch Internals", grade: "O", score: 92, xp: 2900, verified_projects: 5 },
      { skill_name: "CUDA & Triton", grade: "O", score: 90, xp: 2600, verified_projects: 4 },
      { skill_name: "Git", grade: "A", score: 86, xp: 1900, verified_projects: 5 },
      { skill_name: "C++", grade: "A", score: 84, xp: 1600, verified_projects: 3 }
    ],
    projects: [
      MOCK_PROJECTS.tinyllm_quant,
      MOCK_PROJECTS.torchgraph
    ]
  },
  {
    id: "cand_elenarostova",
    username: "erostova",
    full_name: "Elena Rostova",
    title: "Backend & Infrastructure Engineer | Go • Kubernetes • eBPF",
    bio: "Specializing in zero-allocation Linux eBPF networking, XDP socket filtering, and Kubernetes custom resource controllers.",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
    level: 36,
    total_xp: 8190,
    ai_quality_index: 95.1,
    verified_repos_count: 5,
    github_username: "erostova",
    polygon_wallet_address: "0x12a9e3b918a284e311d445218d6e3c041fd4081b",
    location: "Berlin, Germany / Hybrid",
    university: "Technical University of Munich",
    availability: "Immediate Hire",
    is_identity_verified: true,
    benchmark_project: {
      name: "BpfMesh Socket Monitor",
      throughput: "0-alloc eBPF ring buffer",
      ast_score: 97.2
    },
    skills: [
      { skill_name: "Go", grade: "A", score: 89, xp: 2500, verified_projects: 5 },
      { skill_name: "Kubernetes Internals", grade: "A", score: 85, xp: 2100, verified_projects: 4 },
      { skill_name: "Docker & CI/CD", grade: "A", score: 84, xp: 1800, verified_projects: 4 },
      { skill_name: "Linux eBPF", grade: "A", score: 83, xp: 1750, verified_projects: 3 },
      { skill_name: "Git", grade: "A", score: 82, xp: 1600, verified_projects: 5 }
    ],
    projects: [
      MOCK_PROJECTS.bpfmesh
    ]
  },
  {
    id: "cand_arunkumar",
    username: "arunkumar",
    full_name: "Arun Kumar",
    title: "Full-Stack Developer | React • Node.js • PostgreSQL",
    bio: "Building resilient microservices, responsive web dashboards, and streaming WebSocket data processing pipelines.",
    avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces",
    level: 33,
    total_xp: 7350,
    ai_quality_index: 89.4,
    verified_repos_count: 4,
    github_username: "arun-kumar",
    polygon_wallet_address: "0x88e1e02c918a284e311d445218d6e3c041aa09c",
    location: "Hyderabad, Telangana",
    university: "PES University",
    availability: "Immediate Hire",
    is_identity_verified: true,
    benchmark_project: {
      name: "FleetTrack IoT Platform",
      throughput: "10K events/sec · sub-10ms queries",
      ast_score: 87.5
    },
    skills: [
      { skill_name: "React", grade: "A", score: 84, xp: 2100, verified_projects: 4 },
      { skill_name: "Node.js & Express", grade: "A", score: 82, xp: 1950, verified_projects: 4 },
      { skill_name: "TypeScript", grade: "B", score: 81, xp: 1700, verified_projects: 3 },
      { skill_name: "Git", grade: "B", score: 80, xp: 1600, verified_projects: 4 },
      { skill_name: "PostgreSQL", grade: "B", score: 79, xp: 1500, verified_projects: 3 }
    ],
    projects: [
      MOCK_PROJECTS.fleettrack
    ]
  },
  {
    id: "cand_davidkalu",
    username: "dkalu",
    full_name: "David Kalu",
    title: "Frontend & Graphics Engineer | TypeScript • WebGL • WebGPU",
    bio: "Designing high-density data canvas platforms using WebGL, WebGPU, and custom streaming WebAssembly pipelines.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
    level: 35,
    total_xp: 7940,
    ai_quality_index: 92.4,
    verified_repos_count: 4,
    github_username: "davidkalu",
    polygon_wallet_address: "0x77c268a02c918a284e311d445218d6e3c0491b10",
    location: "London, UK / Remote",
    university: "University of Manchester",
    availability: "Open to Collaborations",
    is_identity_verified: true,
    benchmark_project: {
      name: "CanvasGL Engine",
      throughput: "60 FPS @ 500K Nodes",
      ast_score: 93.8
    },
    skills: [
      { skill_name: "TypeScript", grade: "A", score: 87, xp: 2300, verified_projects: 4 },
      { skill_name: "WebGL & WebGPU", grade: "A", score: 85, xp: 2100, verified_projects: 3 },
      { skill_name: "React", grade: "A", score: 83, xp: 1800, verified_projects: 4 },
      { skill_name: "Git", grade: "B", score: 81, xp: 1600, verified_projects: 4 },
      { skill_name: "Three.js", grade: "B", score: 80, xp: 1450, verified_projects: 3 }
    ],
    projects: [
      MOCK_PROJECTS.canvas_gl
    ]
  }
];

// ============================================================================
// MAIN DEMONSTRATION PROFESSIONAL PROFILE: GNANESHWAR R
// ============================================================================

export const MOCK_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  id: "prof_gnaneshwar",
  username: "gnaneshwar",
  fullName: "GNANESHWAR R",
  isVerified: true,
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&h=240&fit=crop&crop=faces",
  headline: "Full Stack Developer | AI & Product Engineering",
  location: "Chennai, Tamil Nadu",
  university: "Rajalakshmi Institute of Technology",
  githubUsername: "gnaneshwar-dev",
  portfolioUrl: "https://github.com/gnaneshwar-dev",
  overallGrade: "B",
  level: 37,
  totalXp: 8420,
  targetLevelXp: 8800,
  xpToNextLevel: 380,
  collaborationScore: 86,
  verifiedProjectsCount: 5,
  profileStrength: 94,
  topSkills: ["React", "TypeScript", "Python", "FastAPI", "Git"],
  availability: {
    status: "Immediate Hire",
    openTo: ["Full-time", "Internship", "Engineering Collaboration"]
  },
  currentInterests: [
    "Compiler AST Static Analysis",
    "Decentralized Verification Proofs",
    "React 19 Server Actions & Architecture",
    "High-Throughput Asynchronous APIs"
  ],
  skills: [
    {
      name: "React",
      level: 34,
      score: 88,
      projectsCount: 5,
      verificationStrength: 95,
      grade: "A"
    },
    {
      name: "TypeScript",
      level: 29,
      score: 82,
      projectsCount: 4,
      verificationStrength: 91,
      grade: "A"
    },
    {
      name: "Python",
      level: 27,
      score: 80,
      projectsCount: 3,
      verificationStrength: 86,
      grade: "B"
    },
    {
      name: "FastAPI",
      level: 23,
      score: 76,
      projectsCount: 3,
      verificationStrength: 82,
      grade: "B"
    },
    {
      name: "Git",
      level: 31,
      score: 84,
      projectsCount: 5,
      verificationStrength: 94,
      grade: "A"
    }
  ],
  badges: [
    MOCK_BADGES.problem_solver_gold,
    MOCK_BADGES.consistent_solver_gold,
    MOCK_BADGES.algorithmic_thinking_silver,
    MOCK_BADGES.fe_gold,
    MOCK_BADGES.react_gold,
    MOCK_BADGES.team_silver,
    MOCK_BADGES.python_silver
  ],
  projects: [
    MOCK_PROJECTS.proofhire,
    MOCK_PROJECTS.fastapi_queue,
    MOCK_PROJECTS.campus_optimizer
  ],
  certificates: [
    MOCK_CERTIFICATES.meta_react,
    MOCK_CERTIFICATES.dl_python,
    MOCK_CERTIFICATES.aws_cloud
  ],
  collaborations: [
    MOCK_COLLABORATIONS.proofhire_engine
  ],
  assessments: [
    MOCK_ASSESSMENTS.react_arch
  ],
  activityData: Array.from({ length: 98 }).map((_, i) => {
    const isWeekend = i % 7 === 0 || i % 7 === 6;
    const seed = (i * 17 + 5) % 100;
    let count = 0;
    let level = 0;
    if (!isWeekend && seed > 20) {
      if (seed > 80) { count = 7; level = 4; }
      else if (seed > 60) { count = 4; level = 3; }
      else if (seed > 40) { count = 2; level = 2; }
      else { count = 1; level = 1; }
    } else if (seed > 85) {
      count = 2; level = 1;
    }
    return {
      date: `2025-W${Math.floor(i / 7) + 1}`,
      count,
      level
    };
  })
};

// ============================================================================
// PROFILE RETRIEVAL HELPER
// ============================================================================

export function getProfessionalProfile(username: string): ProfessionalProfile {
  const uname = username.toLowerCase();
  
  if (uname === "alexchen") {
    return {
      ...MOCK_PROFESSIONAL_PROFILE,
      id: "prof_alexchen",
      username: "alexchen",
      fullName: "Alex Chen",
      headline: "Systems Software Engineer | Rust • Distributed Systems",
      location: "San Francisco, CA / Remote",
      university: "UC Berkeley",
      githubUsername: "alexchen",
      overallGrade: "B",
      level: 38,
      totalXp: 8750,
      targetLevelXp: 9100,
      xpToNextLevel: 350,
      collaborationScore: 84,
      verifiedProjectsCount: 6,
      topSkills: ["Rust", "Distributed Systems", "Git", "Linux Systems", "Go"],
      skills: [
        { name: "Rust", level: 35, score: 91, projectsCount: 6, verificationStrength: 96, grade: "A" },
        { name: "Distributed Systems", level: 33, score: 89, projectsCount: 5, verificationStrength: 93, grade: "A" },
        { name: "Git", level: 32, score: 85, projectsCount: 6, verificationStrength: 94, grade: "A" },
        { name: "Linux Systems", level: 30, score: 83, projectsCount: 4, verificationStrength: 88, grade: "B" },
        { name: "Go", level: 28, score: 81, projectsCount: 3, verificationStrength: 85, grade: "B" }
      ],
      badges: [
        MOCK_BADGES.sys_arch_gold,
        MOCK_BADGES.builder_gold,
        MOCK_BADGES.team_silver,
        MOCK_BADGES.oss_silver
      ],
      projects: [
        MOCK_PROJECTS.hyper_raft,
        MOCK_PROJECTS.distri_kv
      ],
      certificates: [
        MOCK_CERTIFICATES.stanford_consensus,
        MOCK_CERTIFICATES.aws_arch
      ],
      collaborations: [
        MOCK_COLLABORATIONS.hyperraft_consensus
      ],
      assessments: [
        MOCK_ASSESSMENTS.consensus_bench
      ]
    };
  }

  if (uname === "psharma" || uname === "priyasharma") {
    return {
      ...MOCK_PROFESSIONAL_PROFILE,
      id: "prof_priyasharma",
      username: "psharma",
      fullName: "Priya Sharma",
      headline: "ML Systems & Compiler Engineer | PyTorch • CUDA • Triton",
      location: "Bengaluru, Karnataka",
      university: "IIIT Hyderabad",
      githubUsername: "psharma-ai",
      overallGrade: "A",
      level: 42,
      totalXp: 10480,
      targetLevelXp: 11000,
      xpToNextLevel: 520,
      collaborationScore: 88,
      verifiedProjectsCount: 5,
      topSkills: ["Python", "PyTorch Internals", "CUDA & Triton", "Git", "C++"],
      skills: [
        { name: "Python", level: 38, score: 94, projectsCount: 5, verificationStrength: 97, grade: "A" },
        { name: "PyTorch Internals", level: 36, score: 92, projectsCount: 5, verificationStrength: 95, grade: "A" },
        { name: "CUDA & Triton", level: 34, score: 90, projectsCount: 4, verificationStrength: 94, grade: "A" },
        { name: "Git", level: 33, score: 86, projectsCount: 5, verificationStrength: 92, grade: "A" },
        { name: "C++", level: 31, score: 84, projectsCount: 3, verificationStrength: 88, grade: "A" }
      ],
      badges: [
        MOCK_BADGES.ai_gold,
        MOCK_BADGES.python_gold,
        MOCK_BADGES.builder_gold
      ],
      projects: [
        MOCK_PROJECTS.tinyllm_quant,
        MOCK_PROJECTS.torchgraph
      ],
      certificates: [
        MOCK_CERTIFICATES.nv_cuda,
        MOCK_CERTIFICATES.pytorch_dev
      ],
      collaborations: [
        MOCK_COLLABORATIONS.proofhire_engine
      ],
      assessments: [
        MOCK_ASSESSMENTS.cuda_perf
      ]
    };
  }

  if (uname === "erostova" || uname === "elenarostova") {
    return {
      ...MOCK_PROFESSIONAL_PROFILE,
      id: "prof_elenarostova",
      username: "erostova",
      fullName: "Elena Rostova",
      headline: "Backend & Infrastructure Engineer | Go • Kubernetes • eBPF",
      location: "Berlin, Germany / Hybrid",
      university: "Technical University of Munich",
      githubUsername: "erostova",
      overallGrade: "B",
      level: 36,
      totalXp: 8190,
      targetLevelXp: 8600,
      xpToNextLevel: 410,
      collaborationScore: 90,
      verifiedProjectsCount: 5,
      topSkills: ["Go", "Kubernetes Internals", "Docker & CI/CD", "Linux eBPF", "Git"],
      skills: [
        { name: "Go", level: 34, score: 89, projectsCount: 5, verificationStrength: 95, grade: "A" },
        { name: "Kubernetes Internals", level: 31, score: 85, projectsCount: 4, verificationStrength: 91, grade: "A" },
        { name: "Docker & CI/CD", level: 30, score: 84, projectsCount: 4, verificationStrength: 89, grade: "A" },
        { name: "Linux eBPF", level: 29, score: 83, projectsCount: 3, verificationStrength: 88, grade: "B" },
        { name: "Git", level: 29, score: 82, projectsCount: 5, verificationStrength: 87, grade: "B" }
      ],
      badges: [
        MOCK_BADGES.be_gold,
        MOCK_BADGES.team_silver,
        MOCK_BADGES.oss_silver
      ],
      projects: [
        MOCK_PROJECTS.bpfmesh
      ],
      certificates: [
        MOCK_CERTIFICATES.cka,
        MOCK_CERTIFICATES.ebpf_linux
      ],
      collaborations: [
        MOCK_COLLABORATIONS.bpfmesh_filter
      ],
      assessments: []
    };
  }

  if (uname === "arunkumar") {
    return {
      ...MOCK_PROFESSIONAL_PROFILE,
      id: "prof_arunkumar",
      username: "arunkumar",
      fullName: "Arun Kumar",
      headline: "Full-Stack Developer | React • Node.js • PostgreSQL",
      location: "Hyderabad, Telangana",
      university: "PES University",
      githubUsername: "arun-kumar",
      overallGrade: "B",
      level: 33,
      totalXp: 7350,
      targetLevelXp: 7800,
      xpToNextLevel: 450,
      collaborationScore: 85,
      verifiedProjectsCount: 4,
      topSkills: ["React", "Node.js & Express", "TypeScript", "Git", "PostgreSQL"],
      skills: [
        { name: "React", level: 31, score: 84, projectsCount: 4, verificationStrength: 91, grade: "A" },
        { name: "Node.js & Express", level: 29, score: 82, projectsCount: 4, verificationStrength: 89, grade: "A" },
        { name: "TypeScript", level: 28, score: 81, projectsCount: 3, verificationStrength: 87, grade: "B" },
        { name: "Git", level: 28, score: 80, projectsCount: 4, verificationStrength: 86, grade: "B" },
        { name: "PostgreSQL", level: 27, score: 79, projectsCount: 3, verificationStrength: 84, grade: "B" }
      ],
      badges: [
        MOCK_BADGES.fe_gold,
        MOCK_BADGES.team_silver
      ],
      projects: [
        MOCK_PROJECTS.fleettrack
      ],
      certificates: [
        MOCK_CERTIFICATES.postgres_dba,
        MOCK_CERTIFICATES.joy_react
      ],
      collaborations: [
        MOCK_COLLABORATIONS.proofhire_engine
      ],
      assessments: []
    };
  }

  if (uname === "dkalu" || uname === "davidkalu") {
    return {
      ...MOCK_PROFESSIONAL_PROFILE,
      id: "prof_davidkalu",
      username: "dkalu",
      fullName: "David Kalu",
      headline: "Frontend & Graphics Engineer | TypeScript • WebGL • WebGPU",
      location: "London, UK / Remote",
      university: "University of Manchester",
      githubUsername: "davidkalu",
      overallGrade: "B",
      level: 35,
      totalXp: 7940,
      targetLevelXp: 8400,
      xpToNextLevel: 460,
      collaborationScore: 82,
      verifiedProjectsCount: 4,
      topSkills: ["TypeScript", "WebGL & WebGPU", "React", "Git", "Three.js"],
      skills: [
        { name: "TypeScript", level: 33, score: 87, projectsCount: 4, verificationStrength: 94, grade: "A" },
        { name: "WebGL & WebGPU", level: 31, score: 85, projectsCount: 3, verificationStrength: 91, grade: "A" },
        { name: "React", level: 30, score: 83, projectsCount: 4, verificationStrength: 89, grade: "A" },
        { name: "Git", level: 29, score: 81, projectsCount: 4, verificationStrength: 87, grade: "B" },
        { name: "Three.js", level: 28, score: 80, projectsCount: 3, verificationStrength: 85, grade: "B" }
      ],
      badges: [
        MOCK_BADGES.fe_gold,
        MOCK_BADGES.team_silver
      ],
      projects: [
        MOCK_PROJECTS.canvas_gl
      ],
      certificates: [
        MOCK_CERTIFICATES.webgpu_shader
      ],
      collaborations: [],
      assessments: []
    };
  }

  // Default to GNANESHWAR R
  return MOCK_PROFESSIONAL_PROFILE;
}

// ============================================================================
// REALISTIC VERIFICATION ACTIVITY FEED
// ============================================================================

export const MOCK_VERIFICATION_FEED: VerificationActivity[] = [
  {
    id: "act_1",
    timestamp: "10 mins ago",
    type: "ONCHAIN_ANCHOR",
    developer_name: "GNANESHWAR R",
    developer_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    repo_name: "proofhire",
    grade: "A",
    score: 86.0,
    polygon_tx: "0x7a8109d5c3f2e14b8a21390d64a2b9104c63e8a1f7d24c0e3951ab42cf891e0a",
    details: "AST static analysis verified across 14,200 LOC. Anchored on Polygon Block #49,210,812."
  },
  {
    id: "act_2",
    timestamp: "28 mins ago",
    type: "EVALUATION_COMPLETED",
    developer_name: "Alex Chen",
    developer_avatar: "https://avatars.githubusercontent.com/u/1024025?v=4",
    repo_name: "hyper-raft",
    grade: "O",
    score: 96.4,
    polygon_tx: "0x04f128e02c918a284e311d445218d6e3c041b3200194819aef1004918294a012",
    details: "Formally verified Raft consensus state machine. Zero unsafe memory violations in Rust."
  },
  {
    id: "act_3",
    timestamp: "45 mins ago",
    type: "BADGE_AWARDED",
    developer_name: "Priya Sharma",
    developer_avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
    repo_name: "tinyllm-quant",
    grade: "O",
    score: 97.2,
    details: "Earned AI Developer — Gold Badge (Top 0.8% Global Percentile)."
  },
  {
    id: "act_4",
    timestamp: "2 hours ago",
    type: "PEER_ATTESTATION",
    developer_name: "Elena Rostova",
    developer_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    repo_name: "bpfmesh",
    grade: "A",
    score: 92.4,
    details: "Zero-copy eBPF socket monitoring passed Linux 6.8 kernel verifier tests with 100% GPG signed commits."
  }
];

export const MOCK_ASSESSMENT_SCENARIO: AssessmentScenario = {
  id: "bench_dist_consensus",
  benchmark_name: "Distributed Consensus & Fault-Tolerant Protocols Benchmark",
  tier: "Tier-0 Systems",
  total_points: 35,
  time_limit_minutes: 45,
  scenario_title: "Scenario 3: Split-Brain Quorum Recovery under Network Partition",
  scenario_description: "A 5-node distributed Raft-based metadata cluster (node_a through node_e) experiences an asymmetric partition separating {node_a, node_b} from {node_c, node_d, node_e}. During the partition, a transient packet drop allows stale heartbeats from node_a to corrupt downstream election leases on node_c.",
  architecture_diagram: `+------------------- Region US-East -------------------+     +------------------- Region EU-West -------------------+
|  [Node A] (Term 12: Leader-Degraded)                  |     |  [Node C] (Term 13: Candidate)                        |
|       |                                               |     |       |                                               |
|  [Node B] (Term 12: Follower)                         |     |  [Node D] (Term 13: Follower)                         |
+-------------------------------------------------------+     |       |                                               |
                           |                                  |  [Node E] (Term 13: Follower)                         |
                           X  <-- ASYMMETRIC PARTITION        +-------------------------------------------------------+
                           |      (Unidirectional Drop: C drops A, but D still routes delayed ACKs)`,
  question: "Which protocol adjustment guarantees strict linearizability without provoking an indefinite election deadlock when partition heals?",
  options: [
    {
      id: "opt_a",
      text: "A. Force a cluster-wide joint consensus reconfiguration (C_old,new) initiated by Node C using cached epoch terms.",
      rationale: "Fails quorum invariant: Node C does not hold majority consensus across both subsets.",
      is_correct: false
    },
    {
      id: "opt_b",
      text: "B. Implement Pre-Vote phase with monotonic lease verification before incrementing Node D's term to Term 14.",
      rationale: "Prevents disrupted nodes from incrementing terms globally and guarantees majority verification.",
      is_correct: true
    },
    {
      id: "opt_c",
      text: "C. Immediately degrade Node A to Observer role via local TCP probe timeouts on Node B.",
      rationale: "Local heuristics cannot unilaterally strip primary quorum leadership safely.",
      is_correct: false
    },
    {
      id: "opt_d",
      text: "D. Elevate Node E's election timer randomization window from 150-300ms to 900-1200ms.",
      rationale: "Merely mitigates split elections; does not prevent phantom term inflation.",
      is_correct: false
    }
  ],
  code_critique: {
    language: "rust",
    file_name: "src/consensus/lease_manager.rs",
    code_snippet: `pub async fn renew_lease(&mut self, node_id: u64) -> Result<LeaseToken, LeaseErr> {
    let current = self.lease_registry.read().await;
    if current.is_valid_for(node_id) && !current.is_expired() {
        drop(current);
        let mut write_guard = self.lease_registry.write().await;
        return write_guard.extend_unconditional(node_id, LEASE_DURATION).await;
    }
    Err(LeaseErr::PreemptionDetected)
}`,
    vulnerability_description: "TOCTOU (Time-of-Check to Time-of-Use) race window between drop(current) and acquiring write_guard. A concurrent leader preemption packet could invalidate node_id's lease in this interim.",
    solution_preview: "Acquire an upgradeable read lock atomically or execute the check directly within write_guard scope."
  }
};
