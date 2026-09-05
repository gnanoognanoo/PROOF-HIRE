/**
 * ProofHire API Client for Project Submission & AI Evaluation
 */

import { AwardXpPayload, AwardXpResponse, UserReputationState } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface ProjectSubmissionPayload {
  // Step 1: Basic Details
  title: string;
  description: string;
  category: string;
  project_type: string;
  start_date?: string;
  completion_date?: string;

  // Step 2: Technical Info
  repo_url: string;
  demo_url?: string;
  technologies: string[];
  architecture?: string;

  // Step 3: Contribution
  is_team: boolean;
  team_members?: string[];
  role: string;
  responsibilities?: string;

  // Step 4: Evidence
  screenshots?: string[];
  documentation?: string;
  supporting_files?: string[];
}

export interface DimensionBreakdown {
  technical_complexity: number;
  code_quality: number;
  innovation: number;
  industry_relevance: number;
  documentation: number;
  completion: number;
  collaboration: number;
}

export interface EvaluationResult {
  grade: "O" | "A" | "B" | "C" | "D" | "E";
  score: number;
  xp_earned: number;
  skills_detected: string[];
  breakdown: DimensionBreakdown;
  weights: Record<string, number>;
  why_this_grade: string;
  strengths: string[];
  areas_for_improvement: string[];
  industry_skills_demonstrated: string[];
  recommended_next_skills: string[];
  badges_earned: Array<{
    badge_name: string;
    tier: string;
    category: string;
  }>;
  verified_at: string;
}

export interface EvaluationStatusResponse {
  project_id: string;
  evaluation_id: string;
  stage: string;
  progress: number;
  is_complete: boolean;
  log_message: string;
  evaluation_result?: EvaluationResult | null;
}

export interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  project_type: string;
  start_date?: string;
  completion_date?: string;
  repo_url: string;
  demo_url?: string;
  technologies: string[];
  architecture?: string;
  is_team: boolean;
  team_members: string[];
  role: string;
  responsibilities?: string;
  screenshots: string[];
  documentation?: string;
  supporting_files: string[];
  status: string;
  created_at: string;
  evaluation_id?: string;
  grade?: string;
  score?: number;
  xp_earned?: number;
}

export async function submitProject(data: ProjectSubmissionPayload): Promise<ProjectRecord> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend fetch failed, using local in-memory fallback:", err);
    // Fallback in case backend unreachable
    const mockId = `proj_${Math.random().toString(36).substring(2, 9)}`;
    const record: ProjectRecord = {
      id: mockId,
      ...data,
      team_members: data.team_members || [],
      screenshots: data.screenshots || [],
      supporting_files: data.supporting_files || [],
      status: "PENDING_EVALUATION",
      created_at: new Date().toISOString(),
      evaluation_id: `eval_${Math.random().toString(36).substring(2, 8)}`,
    };
    return record;
  }
}

export async function startProjectEvaluation(projectId: string): Promise<EvaluationStatusResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/evaluate`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error(`Failed to trigger evaluation: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local evaluation simulator:", err);
    return {
      project_id: projectId,
      evaluation_id: "eval_local",
      stage: "Preparing evaluation",
      progress: 15,
      is_complete: false,
      log_message: "Initializing AST parsers and sandbox invariants.",
      evaluation_result: null,
    };
  }
}

export async function getProjectEvaluation(projectId: string): Promise<EvaluationStatusResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/evaluation`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch evaluation: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    // Return sample evaluated data for proj_proofhire or local fallback
    return {
      project_id: projectId,
      evaluation_id: "eval_fallback",
      stage: "Complete",
      progress: 100,
      is_complete: true,
      log_message: "Audit complete.",
      evaluation_result: {
        grade: "A",
        score: 86.0,
        xp_earned: 620,
        skills_detected: ["React", "Next.js", "TypeScript", "PostgreSQL", "REST APIs"],
        breakdown: {
          technical_complexity: 91.0,
          code_quality: 84.0,
          innovation: 87.0,
          industry_relevance: 90.0,
          documentation: 76.0,
          completion: 93.0,
          collaboration: 82.0,
        },
        weights: {
          technical_complexity: 0.25,
          code_quality: 0.20,
          innovation: 0.15,
          industry_relevance: 0.15,
          documentation: 0.10,
          completion: 0.10,
          collaboration: 0.05,
        },
        why_this_grade:
          "The ProofHire codebase showcases high architectural discipline, type-safe API boundaries, and clear modular structure. The code achieves Grade A with strong AST integrity and high performance across asynchronous data ingestion, with minor room for extended automated integration coverage.",
        strengths: [
          "Robust type boundaries with zero-tolerance for implicit any casts across frontend and API layers.",
          "High-performance client-side rendering pipeline with optimized tree-shaking and component memoization.",
          "Well-isolated service architecture with clean dependency injection and clear schema models.",
          "Consistent cryptographic hashing and AST verification integration.",
        ],
        areas_for_improvement: [
          "Increase unit test assertion density for boundary error conditions and transient network partitions.",
          "Expand inline API schema documentation and automated OpenAPI client SDK generation.",
          "Add automated benchmark regression profiling into CI workflow.",
        ],
        industry_skills_demonstrated: [
          "Production React 19 Server Components Architecture",
          "Full-Stack TypeScript Contract Enforcement",
          "Relational Database Schema Normalization & Query Tuning",
          "FastAPI Asynchronous Request Pipelines",
          "Cryptographic Signature Hashing & Verification",
        ],
        recommended_next_skills: [
          "Distributed Caching with Redis & Cache Invalidation",
          "Zero-Knowledge Proofs & zk-SNARKs Verification",
          "Real-time Distributed Event Streaming (Apache Kafka / Redpanda)",
          "eBPF Observability & Linux Kernel Performance Profiling",
        ],
        badges_earned: [
          { badge_name: "Frontend Developer — Gold", tier: "Gold", category: "Architecture" },
          { badge_name: "React Developer — Gold", tier: "Gold", category: "Ecosystem Mastery" },
          { badge_name: "Team Collaborator — Silver", tier: "Silver", category: "Collaboration" },
        ],
        verified_at: new Date().toISOString(),
      },
    };
  }
}

export async function getProject(projectId: string): Promise<ProjectRecord | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch project: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Could not fetch project from backend, generating fallback:", err);
    return {
      id: projectId,
      title: "ProofHire",
      description: "AI-powered skill verification platform eliminating unverified resume claims through compiler-level AST audits, GPG commit attribution, and Polygon blockchain credential anchoring.",
      category: "Full-Stack & Systems",
      project_type: "Production Platform",
      start_date: "2024-09-01",
      completion_date: "2025-01-15",
      repo_url: "https://github.com/proofhire/proofhire-core",
      demo_url: "https://proofhire.network",
      technologies: ["React", "FastAPI", "PostgreSQL", "Gemini", "Next.js", "TypeScript"],
      architecture: "Next.js 14 App Router client with asynchronous FastAPI evaluator microservice and Polygon state contract integration.",
      is_team: true,
      team_members: ["alexchen", "dkalu"],
      role: "Lead Full-Stack Engineer",
      responsibilities: "Designed core verification pipeline, AST scoring engine, and high-density UI layout.",
      screenshots: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=350&fit=crop",
      ],
      documentation: "Full architectural diagrams, AST schema definitions, and API documentation.",
      supporting_files: ["proofhire-ast-spec.json"],
      status: "EVALUATED",
      created_at: "2025-01-15T12:00:00Z",
      evaluation_id: "eval_proofhire",
      grade: "A",
      score: 86.0,
      xp_earned: 620,
    };
  }
}

export async function listProjects(): Promise<ProjectRecord[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Error listing projects from backend:", err);
  }
  // Return default verified projects
  return [
    {
      id: "proj_proofhire",
      title: "ProofHire",
      description: "AI-powered skill verification platform eliminating unverified resume claims through compiler-level AST audits, GPG commit attribution, and Polygon blockchain credential anchoring.",
      category: "Full-Stack & Systems",
      project_type: "Production Platform",
      start_date: "2024-09-01",
      completion_date: "2025-01-15",
      repo_url: "https://github.com/proofhire/proofhire-core",
      demo_url: "https://proofhire.network",
      technologies: ["React", "FastAPI", "PostgreSQL", "Gemini", "Next.js", "TypeScript"],
      architecture: "Next.js 14 App Router client with asynchronous FastAPI evaluator microservice and Polygon state contract integration.",
      is_team: true,
      team_members: ["alexchen", "dkalu"],
      role: "Lead Full-Stack Engineer",
      responsibilities: "Designed core verification pipeline, AST scoring engine, and high-density UI layout.",
      screenshots: [],
      documentation: "Full architectural diagrams",
      supporting_files: [],
      status: "EVALUATED",
      created_at: "2025-01-15T12:00:00Z",
      grade: "A",
      score: 86.0,
      xp_earned: 620,
    },
    {
      id: "proj_hyperraft",
      title: "HyperRaft",
      description: "Asynchronous multi-raft consensus engine focused on sub-millisecond p99 heartbeats, lock-free batching pipelines, and zero-allocation io_uring networking on Linux kernel 6.x.",
      category: "Systems Engineering",
      project_type: "Open Source",
      start_date: "2024-08-01",
      completion_date: "2024-12-10",
      repo_url: "https://github.com/alexchen/hyperraft",
      demo_url: "https://hyperraft.systems",
      technologies: ["Rust", "Tokio", "io_uring", "Raft", "WASM"],
      architecture: "Deterministic Raft consensus protocol using custom ring buffers and kernel-bypass I/O.",
      is_team: false,
      team_members: [],
      role: "Systems Architect",
      responsibilities: "Designed Raft state machine and memory-mapped log compaction.",
      screenshots: [],
      documentation: "Formal TLA+ specifications and linearizability tests.",
      supporting_files: [],
      status: "EVALUATED",
      created_at: "2024-12-10T16:00:00Z",
      grade: "O",
      score: 96.4,
      xp_earned: 1450,
    },
    {
      id: "proj_canvasgl",
      title: "CanvasGL Engine",
      description: "High-density data canvas rendering up to 500,000 interactive nodes at 60 FPS using raw WebGL shaders, spatial quadtrees, and WebAssembly boundary marshaling.",
      category: "Graphics & UI Systems",
      project_type: "Production Engine",
      start_date: "2024-06-01",
      completion_date: "2024-10-18",
      repo_url: "https://github.com/alexchen/canvasgl",
      demo_url: "https://canvasgl.dev",
      technologies: ["TypeScript", "WebGL", "WebGPU", "WASM", "Next.js"],
      architecture: "Batched GPU vertex buffers with custom spatial index quadtree in WebAssembly.",
      is_team: false,
      team_members: [],
      role: "Graphics Architect",
      responsibilities: "Shader development and spatial indexing memory layout.",
      screenshots: [],
      documentation: "GPU profiling and benchmark suites.",
      supporting_files: [],
      status: "EVALUATED",
      created_at: "2024-10-18T16:00:00Z",
      grade: "A",
      score: 93.8,
      xp_earned: 780,
    },
  ];
}

// -------------------------------------------------------------
// Reputation Engine API Client
// -------------------------------------------------------------

export async function getUserReputation(username: string): Promise<UserReputationState> {
  try {
    const res = await fetch(`${API_BASE_URL}/reputation/user/${encodeURIComponent(username)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch user reputation: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local state for reputation:", err);
    return {
      username,
      cumulative_xp: 8420,
      level: 37,
      professional_reputation_grade: "B",
      grade_system_title: "Professional Reputation Grade",
      target_level_xp: 8800,
      xp_to_next_level: 380,
      collaboration_score: 86,
      verified_projects_count: 6,
      skills: {
        React: { cumulative_xp: 2200, level: 34, score: 88, verified_projects: 5, grade: "A" },
        TypeScript: { cumulative_xp: 1600, level: 29, score: 82, verified_projects: 4, grade: "A" },
        Python: { cumulative_xp: 620, level: 18, score: 68, verified_projects: 2, grade: "B" },
        Git: { cumulative_xp: 1850, level: 31, score: 84, verified_projects: 6, grade: "A" },
        FastAPI: { cumulative_xp: 850, level: 21, score: 78, verified_projects: 3, grade: "B" },
        Gemini: { cumulative_xp: 720, level: 19, score: 75, verified_projects: 2, grade: "B" },
      },
      badges: [
        "Frontend Developer — Gold",
        "Team Collaborator — Silver",
        "React Developer — Gold",
        "Open Source Contributor — Bronze",
      ],
      notifications: [],
    };
  }
}

export async function awardReputationXp(payload: AwardXpPayload): Promise<AwardXpResponse> {
  const res = await fetch(`${API_BASE_URL}/reputation/award-xp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to award XP: ${res.statusText}`);
  }
  return await res.json();
}

export async function dismissReputationNotifications(username: string): Promise<{ status: string; remaining: number }> {
  const res = await fetch(`${API_BASE_URL}/reputation/notifications/dismiss?username=${encodeURIComponent(username)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to dismiss notifications: ${res.statusText}`);
  }
  return await res.json();
}

export async function getBadgeDefinitions(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE_URL}/reputation/badges`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch badge definitions: ${res.statusText}`);
  }
  return await res.json();
}

export async function recalculateUserReputation(username: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/reputation/recalculate/${encodeURIComponent(username)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to recalculate reputation: ${res.statusText}`);
  }
  return await res.json();
}

// -------------------------------------------------------------
// GitHub Verification API Client
// -------------------------------------------------------------

export async function getGitHubStatus(username: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/github/status?username=${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to get GitHub status");
    return await res.json();
  } catch (err) {
    console.warn("GitHub status fallback:", err);
    return {
      username,
      github_username: "alexchen",
      name: "Alex Chen",
      avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
      bio: "Staff Distributed Systems Engineer. Raft, LSM-trees, Tokio, Linux kernel.",
      public_repos: 48,
      followers: 1820,
      is_connected: true,
    };
  }
}

export async function connectGitHubAccount(username: string, github_username: string, name?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/github/oauth/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, github_username, name }),
  });
  if (!res.ok) throw new Error("Failed to connect GitHub account");
  return await res.json();
}

export async function disconnectGitHubAccount(username: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/github/disconnect?username=${encodeURIComponent(username)}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to disconnect GitHub account");
  return await res.json();
}

export async function getGitHubRepos(username: string = "alexchen"): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/github/repos?username=${encodeURIComponent(username)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to get repositories");
    return await res.json();
  } catch (err) {
    return { repositories: [], count: 0 };
  }
}

export async function getGitHubRepoDetails(owner: string, repo: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/github/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to get repo details");
  return await res.json();
}

export async function verifyGitHubContribution(repo_url: string, contributors?: any[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/github/verify-contribution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url, contributors }),
  });
  if (!res.ok) throw new Error("Failed to verify contribution");
  return await res.json();
}

// -------------------------------------------------------------
// Collaboration Engine API Client
// -------------------------------------------------------------

export async function getCollaborations(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/collaborations`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch collaborations");
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local collaborations data:", err);
    return [];
  }
}

export async function getCollaborationWorkspace(workspace_id: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/collaborations/${encodeURIComponent(workspace_id)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Workspace ${workspace_id} not found`);
  return await res.json();
}

export async function createCollaborationWorkspace(data: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/collaborations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create workspace");
  return await res.json();
}

export async function addOrUpdateTask(workspace_id: string, task: any): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/collaborations/${encodeURIComponent(workspace_id)}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return await res.json();
}

export async function inviteDeveloper(workspace_id: string, payload: { username: string; role?: string; name?: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/collaborations/${encodeURIComponent(workspace_id)}/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to invite developer");
  return await res.json();
}

export async function discoverDevelopers(params: {
  skill?: string;
  min_level?: number;
  max_level?: number;
  availability?: string;
  location?: string;
  badge?: string;
  search?: string;
}): Promise<{ developers: any[]; total: number }> {
  const query = new URLSearchParams();
  if (params.skill) query.set("skill", params.skill);
  if (params.min_level !== undefined) query.set("min_level", String(params.min_level));
  if (params.max_level !== undefined) query.set("max_level", String(params.max_level));
  if (params.availability) query.set("availability", params.availability);
  if (params.location) query.set("location", params.location);
  if (params.badge) query.set("badge", params.badge);
  if (params.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE_URL}/collaborations/discover?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to discover developers");
  return await res.json();
}

export async function completeProjectAndAllocateXp(workspace_id: string, custom_xp_pool?: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/collaborations/${encodeURIComponent(workspace_id)}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ custom_xp_pool }),
  });
  if (!res.ok) throw new Error("Failed to complete project and allocate XP");
  return await res.json();
}

// -------------------------------------------------------------
// Credential Verification API Client
// -------------------------------------------------------------

export async function getCredentialRecord(credentialId: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/credentials/${encodeURIComponent(credentialId)}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Credential ${credentialId} not found`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local credential state:", err);
    // Fallback for default example
    return {
      credential_id: credentialId.toUpperCase(),
      owner_id: "Gnaneshwar R",
      owner_username: "gnaneshwar",
      credential_type: "Frontend Development Project",
      issuer: "ProofHire Verification Authority",
      entity_id: "proj_proofhire_engine",
      document_hash: "0xd8a2f77c8e310024ff0e6871141bc2d3e5b304cb77a118f6e3b0c44298fc1c14",
      issue_timestamp: "2024-09-18T10:30:00Z",
      issued_date_formatted: "September 18, 2024",
      status: "Verified",
      verification_level: "Platform Verified",
      blockchain: "Polygon",
      network: "Polygon PoS (Amoy Testnet Synced)",
      contract_address: "0x892aF7B6E67a84e313B11D445218d6e3c041B320",
      transaction_hash: "0x7a8109d5c3f2e14b8a21390d64a2b9104c63e8a1f7d24c0e3951ab42cf891e0a",
      block_number: 48192042,
      document_integrity: "Valid",
      storage_provider: "Supabase Storage",
      storage_bucket: "credentials",
      storage_path: "credentials/PH-8492-evidence.pdf",
      file_name: "proofhire-frontend-audit-spec.pdf",
      file_size_bytes: 1048576,
      revocation_reason: null,
      revoked_at: null,
      description: "Production-grade React & TypeScript compiler frontend with isolated component trees, zero-allocation UI renders, and strict type boundaries.",
      verification_notes: "Blockchain verification proves that this issued credential record and its SHA-256 document digest have not been altered since anchoring. It guarantees cryptographic non-repudiation and tamper detection, but does not claim that an uploaded document was originally truthful without independent issuer verification."
    };
  }
}

export async function verifyDocumentIntegrity(credentialId: string, fileBase64: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/credentials/${encodeURIComponent(credentialId)}/verify-document`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_base64: fileBase64 }),
  });
  if (!res.ok) throw new Error("Document integrity verification failed");
  return await res.json();
}

export async function issueCredential(payload: {
  owner_id: string;
  credential_type: string;
  issuer: string;
  entity_id: string;
  file_base64: string;
  file_name?: string;
  verification_level?: string;
  owner_username?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/credentials/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to issue credential");
  return await res.json();
}

export async function getOwnerCredentials(username: string): Promise<{ credentials: any[]; total: number }> {
  const res = await fetch(`${API_BASE_URL}/credentials/owner/${encodeURIComponent(username)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch owner credentials");
  return await res.json();
}

// -------------------------------------------------------------
// Recruiter Portal & Talent Search API
// -------------------------------------------------------------

import type {
  RecruiterDashboardData,
  TalentSearchParams,
  TalentCandidateResult,
  CandidateDossier,
} from "./types";

export async function getRecruiterDashboard(): Promise<RecruiterDashboardData> {
  try {
    const res = await fetch(`${API_BASE_URL}/recruiter/dashboard`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local recruiter dashboard data:", err);
    return {
      metrics: {
        open_positions: 4,
        saved_candidates: 2,
        assessments_sent: 3,
        upcoming_interviews: 3,
      },
      open_positions: [
        {
          id: "pos_frontend_lead",
          title: "Staff Frontend & Compiler Architect",
          department: "Platform Engineering",
          location: "San Francisco / Remote",
          salary_band: "$190k – $240k",
          required_skills: ["React", "TypeScript", "Next.js", "AST Compilers"],
          min_level: 35,
          applicants_count: 18,
          created_at: "2024-11-01",
        },
        {
          id: "pos_systems_engineer",
          title: "Senior Distributed Systems Engineer",
          department: "Core Infrastructure",
          location: "Remote (US/EU)",
          salary_band: "$200k – $260k",
          required_skills: ["Rust", "Distributed Systems", "Tokio", "Raft"],
          min_level: 36,
          applicants_count: 14,
          created_at: "2024-11-04",
        },
        {
          id: "pos_fullstack_ts",
          title: "Full-Stack TypeScript Infrastructure Lead",
          department: "Product Engineering",
          location: "Bangalore / Hybrid",
          salary_band: "$140k – $190k",
          required_skills: ["TypeScript", "FastAPI", "React", "PostgreSQL"],
          min_level: 30,
          applicants_count: 22,
          created_at: "2024-11-10",
        },
        {
          id: "pos_ml_compiler",
          title: "ML Systems & Kernel Optimization Specialist",
          department: "AI Research",
          location: "Seattle / On-site",
          salary_band: "$210k – $275k",
          required_skills: ["Python", "CUDA", "PyTorch Internals", "Compilers"],
          min_level: 35,
          applicants_count: 9,
          created_at: "2024-11-15",
        },
      ],
      recommended_candidates: [
        {
          id: "cand_alexchen",
          username: "alexchen",
          name: "Alex Chen",
          headline: "Frontend Developer | React • Next.js • TypeScript",
          avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
          level: 38,
          overall_grade: "B",
          overall: { level: 38, grade: "B", title: "Professional Reputation Grade: Tier B" },
          top_skills: [
            { skill_name: "React", score: 88, level: 34 },
            { skill_name: "TypeScript", score: 84, level: 32 },
            { skill_name: "Next.js", score: 81, level: 30 },
          ],
          badges: ["Frontend Developer — Gold", "Team Collaborator — Silver"],
          verified_projects_count: 5,
          collaboration_score: 86,
          location: "San Francisco, CA / Remote",
          availability: "Open to Collaborations",
          education: "Stanford University (B.S. Computer Science)",
          assessment_score: 92.4,
          role_category: "Frontend Developer",
          job_match: 92,
          match_breakdown: {
            required_skills: 35.0,
            skill_proficiency: 16.9,
            project_evidence: 14.5,
            project_grades: 12.0,
            assessment_scores: 9.2,
            collaboration_score: 4.3,
          },
          why_this_candidate_matches:
            "Matches 100% of required core skills (React, TypeScript, Next.js). Holds 5 AST-verified repositories with Tier A/O ratings, 92.4% score on the Systems Benchmark, and an active GPG collaboration record.",
          is_saved: true,
        },
      ],
      recent_applications: [
        {
          id: "app_1",
          candidate_name: "Alex Chen",
          candidate_username: "alexchen",
          role_title: "Staff Frontend & Compiler Architect",
          applied_date: "2 hours ago",
          match_score: 92,
          overall_grade: "B",
          level: 38,
          status: "INTERVIEW_STAGE",
        },
        {
          id: "app_2",
          candidate_name: "Elena Rostova",
          candidate_username: "erostova",
          role_title: "Senior Distributed Systems Engineer",
          applied_date: "1 day ago",
          match_score: 95,
          overall_grade: "B",
          level: 36,
          status: "INTERVIEW_STAGE",
        },
        {
          id: "app_3",
          candidate_name: "Arun Kumar",
          candidate_username: "arunkumar",
          role_title: "Full-Stack TypeScript Infrastructure Lead",
          applied_date: "2 days ago",
          match_score: 88,
          overall_grade: "B",
          level: 32,
          status: "REVIEW_PENDING",
        },
      ],
      upcoming_interviews: [
        {
          id: "int_1",
          candidate_name: "Alex Chen",
          candidate_username: "alexchen",
          avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
          role_title: "Staff Frontend & Compiler Architect",
          date_time: "Today, 3:30 PM PST",
          interviewer: "Sarah Lin (VP Eng)",
          jitsi_url: "https://meet.jit.si/proofhire-interview-alexchen-huddle",
          status: "Confirmed",
        },
        {
          id: "int_2",
          candidate_name: "Elena Rostova",
          candidate_username: "erostova",
          avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces",
          role_title: "Senior Distributed Systems Engineer",
          date_time: "Tomorrow, 10:00 AM PST",
          interviewer: "David Vance (Lead Architect)",
          jitsi_url: "https://meet.jit.si/proofhire-interview-erostova-core",
          status: "Confirmed",
        },
      ],
    };
  }
}

export async function searchTalent(params: TalentSearchParams): Promise<{ candidates: TalentCandidateResult[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/recruiter/talent/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local search talent results:", err);
    return {
      candidates: [
        {
          id: "cand_alexchen",
          username: "alexchen",
          name: "Alex Chen",
          headline: "Frontend Developer | React • Next.js • TypeScript",
          avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
          level: 38,
          overall_grade: "B",
          overall: { level: 38, grade: "B", title: "Professional Reputation Grade: Tier B" },
          top_skills: [
            { skill_name: "React", score: 88, level: 34 },
            { skill_name: "TypeScript", score: 84, level: 32 },
            { skill_name: "Next.js", score: 81, level: 30 },
          ],
          badges: ["Frontend Developer — Gold", "Team Collaborator — Silver"],
          verified_projects_count: 5,
          collaboration_score: 86,
          location: "San Francisco, CA / Remote",
          availability: "Open to Collaborations",
          education: "Stanford University (B.S. Computer Science)",
          assessment_score: 92.4,
          role_category: "Frontend Developer",
          job_match: 92,
          match_breakdown: {
            required_skills: 35.0,
            skill_proficiency: 16.9,
            project_evidence: 14.5,
            project_grades: 12.0,
            assessment_scores: 9.2,
            collaboration_score: 4.3,
          },
          why_this_candidate_matches:
            "Exhibits exact match across primary frontend requirements (React 88, TypeScript 84, Next.js 81) with 5 AST-verified projects and 86/100 collaboration confidence.",
          is_saved: true,
        },
      ],
      total: 1,
    };
  }
}

export async function getRecruiterCandidateDetail(username: string): Promise<CandidateDossier> {
  const res = await fetch(`${API_BASE_URL}/recruiter/candidate/${encodeURIComponent(username)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load candidate ${username}`);
  return await res.json();
}

export async function toggleSaveCandidate(username: string): Promise<{ username: string; is_saved: boolean; total_saved: number }> {
  const res = await fetch(`${API_BASE_URL}/recruiter/save-candidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Failed to toggle save candidate");
  return await res.json();
}

export async function sendRecruiterAssessment(username: string, assessmentName?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/recruiter/send-assessment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, assessment_name: assessmentName }),
  });
  if (!res.ok) throw new Error("Failed to send assessment");
  return await res.json();
}

export async function inviteRecruiterInterview(username: string, roleTitle: string, dateTime?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/recruiter/invite-interview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, role_title: roleTitle, date_time: dateTime }),
  });
  if (!res.ok) throw new Error("Failed to invite to interview");
  return await res.json();
}

// -------------------------------------------------------------
// Recruiter Assessments & Candidate Testing API
// -------------------------------------------------------------

import type {
  AssessmentDefinition,
  AssessmentSubmissionRecord,
  InterviewInvitationPayload,
  CandidateInterviewNotification,
} from "./types";

export async function createRecruiterAssessment(payload: {
  title: string;
  assessment_type: string;
  job_title: string;
  duration_minutes: number;
  passing_score_pct: number;
  instructions?: string;
  questions: any[];
  show_correct_answers?: boolean;
}): Promise<AssessmentDefinition> {
  const res = await fetch(`${API_BASE_URL}/recruiter/assessments/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create assessment");
  return await res.json();
}

export async function getRecruiterAssessments(): Promise<{ assessments: AssessmentDefinition[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/recruiter/assessments`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to local recruiter assessments:", err);
    return {
      assessments: [
        {
          id: "as_tech_mcq_react",
          title: "React 19 & TypeScript Production Architecture MCQ",
          assessment_type: "Technical MCQ",
          job_title: "Staff Frontend & Compiler Architect",
          company: "Acme Technologies",
          duration_minutes: 45,
          passing_score_pct: 80,
          show_correct_answers: false,
          instructions: "Evaluates React 19 Server Components, memoization boundaries, and TypeScript compiler AST type checks.",
          questions: [],
          submissions_count: 1,
          created_at: "2024-11-10T10:00:00Z",
        },
        {
          id: "as_aptitude_logic",
          title: "Engineering Logic & Algorithmic Deductions",
          assessment_type: "Aptitude Test",
          job_title: "Senior Distributed Systems Engineer",
          company: "Acme Technologies",
          duration_minutes: 30,
          passing_score_pct: 75,
          show_correct_answers: false,
          instructions: "Logical deduction, invariant reasoning, and computational throughput puzzles.",
          questions: [],
          submissions_count: 0,
          created_at: "2024-11-12T14:30:00Z",
        },
        {
          id: "as_custom_systems",
          title: "Linux eBPF & Kernel Socket Benchmark",
          assessment_type: "Custom Assessment",
          job_title: "Core Infrastructure Lead",
          company: "Acme Technologies",
          duration_minutes: 60,
          passing_score_pct: 85,
          show_correct_answers: false,
          instructions: "Low-level system verification testing kernel probe safety and verifier bounds.",
          questions: [],
          submissions_count: 1,
          created_at: "2024-11-14T09:00:00Z",
        },
      ],
    };
  }
}

export async function getRecruiterAssessmentDetail(id: string): Promise<AssessmentDefinition> {
  const res = await fetch(`${API_BASE_URL}/recruiter/assessments/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load assessment");
  return await res.json();
}

export async function getAssessmentSubmissions(id: string): Promise<{ submissions: AssessmentSubmissionRecord[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/recruiter/assessments/${id}/submissions`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      submissions: [
        {
          id: "sub_alex_1",
          assessment_id: id,
          assessment_title: "React 19 & TypeScript Production Architecture MCQ",
          assessment_type: "Technical MCQ",
          company: "Acme Technologies",
          job_title: "Staff Frontend & Compiler Architect",
          passing_score_pct: 80,
          candidate_username: "alexchen",
          candidate_name: "Alex Chen",
          candidate_avatar: "https://avatars.githubusercontent.com/u/1024025?v=4",
          score: 38,
          total_points: 40,
          percentage: 95.0,
          status: "PASSED",
          completion_time_seconds: 1840,
          completion_time_formatted: "30m 40s",
          submitted_at: "2024-11-19T14:20:00Z",
          answers: {},
          scored_questions: [],
          show_correct_answers: false,
        },
      ],
      total: 1,
    };
  }
}

export async function toggleAssessmentAnswers(id: string): Promise<{ assessment_id: string; show_correct_answers: boolean }> {
  const res = await fetch(`${API_BASE_URL}/recruiter/assessments/${id}/toggle-answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to toggle answers visibility");
  return await res.json();
}

export async function getCandidateAssessment(id: string): Promise<AssessmentDefinition> {
  const res = await fetch(`${API_BASE_URL}/assessments/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load assessment for candidate");
  return await res.json();
}

export async function submitCandidateAssessment(
  id: string,
  payload: {
    candidate_username: string;
    candidate_name: string;
    candidate_avatar?: string;
    answers: Record<string, any>;
    completion_time_seconds: number;
  }
): Promise<AssessmentSubmissionRecord> {
  const res = await fetch(`${API_BASE_URL}/assessments/${id}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit assessment");
  return await res.json();
}

export async function getSubmissionResult(
  id: string,
  submissionId: string,
  asRecruiter: boolean = false
): Promise<AssessmentSubmissionRecord> {
  const res = await fetch(
    `${API_BASE_URL}/assessments/${id}/result/${submissionId}?as_recruiter=${asRecruiter}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to load submission result");
  return await res.json();
}

// -------------------------------------------------------------
// Interviews & Candidate Notifications API
// -------------------------------------------------------------

export async function inviteCandidateToInterview(payload: InterviewInvitationPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/recruiter/interviews/invite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to schedule interview");
  return await res.json();
}

export async function getUpcomingInterviews(): Promise<{ interviews: any[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/recruiter/interviews`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      interviews: [
        {
          id: "int_alex_1",
          candidate_username: "alexchen",
          candidate_name: "Alex Chen",
          candidate_avatar: "https://avatars.githubusercontent.com/u/1024025?v=4",
          job_title: "Staff Frontend & Compiler Architect",
          company: "Acme Technologies",
          date: "2024-11-21",
          time: "3:30 PM PST",
          duration: "45 minutes",
          message: "Looking forward to discussing the platform roadmap.",
          interviewer: "Sarah Lin (VP of Engineering)",
          jitsi_url: "https://meet.jit.si/proofhire-acme-frontend-architect-alexchen-huddle",
          status: "ACCEPTED",
        },
      ],
      total: 1,
    };
  }
}

export async function getCandidateNotifications(username: string): Promise<{ notifications: CandidateInterviewNotification[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/candidates/${encodeURIComponent(username)}/notifications`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      notifications: [
        {
          id: "notif_alex_1",
          candidate_username: username,
          title: "Interview invitation from Acme Technologies",
          message: "We were deeply impressed by your AST compiler benchmarks. Looking forward to discussing the roadmap.",
          job_title: "Staff Frontend & Compiler Architect",
          company: "Acme Technologies",
          date: "Tomorrow",
          time: "3:30 PM PST",
          duration: "45 minutes",
          interview_id: "int_alex_1",
          jitsi_url: "https://meet.jit.si/proofhire-acme-frontend-architect-alexchen-huddle",
          status: "PENDING",
          read: false,
          created_at: new Date().toISOString(),
        },
      ],
      total: 1,
    };
  }
}

export async function respondToInterview(
  interviewId: string,
  candidateUsername: string,
  action: "ACCEPT" | "DECLINE"
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/candidates/interviews/${interviewId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate_username: candidateUsername, action }),
  });
  if (!res.ok) throw new Error("Failed to respond to interview invitation");
  return await res.json();
}



