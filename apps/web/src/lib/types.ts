export type GradeTier = 'O' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface EvaluationMetric {
  architecture: number;
  test_coverage: number;
  code_quality: number;
  doc_clarity: number;
}

export interface ContributorAttribution {
  contributor_name: string;
  github_handle: string;
  role_description?: string;
  lines_of_code: number;
  percentage: number;
  is_verified_gpg: boolean;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  repo_url: string;
  demo_url?: string;
  primary_stack: string[];
  grade: GradeTier;
  score: number;
  xp_awarded?: number;
  metrics: EvaluationMetric;
  sha256_hash: string;
  polygon_tx_hash?: string;
  merkle_root?: string;
  commit_count: number;
  loc_count: number;
  gemini_review_note: string;
  evaluation_cycle_id?: string;
  created_at: string;
  detailed_metrics?: {
    technical_complexity?: number;
    code_quality?: number;
    innovation?: number;
    industry_relevance?: number;
    documentation?: number;
    completion?: number;
    collaboration?: number;
  };
  attributions: ContributorAttribution[];
}

export interface SkillReputation {
  name: string;
  level: number;
  score: number;
  projectsCount: number;
  verificationStrength: number; // 0-100%
  grade: GradeTier;
}

export interface BadgeItem {
  id: string;
  title: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  category: string;
  description: string;
  issuedDate: string;
  credentialId: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  verificationStatus: 'Verified' | 'Pending' | 'Expired';
  credentialUrl: string;
  credentialId: string;
  blockchainId?: string;
}

export interface CollaborationItem {
  id: string;
  project: string;
  role: string;
  teamSize: number;
  contributionPercentage: number;
  contributionScore: number;
  duration: string;
  projectGrade: GradeTier;
}

export interface AssessmentRecord {
  id: string;
  assessmentName: string;
  company: string;
  companyLogo?: string;
  score: number;
  percentile?: string;
  date: string;
  status?: string;
}

export interface ProfessionalProfile {
  id: string;
  username: string;
  fullName: string;
  isVerified: boolean;
  avatarUrl: string;
  headline: string;
  location: string;
  university: string;
  githubUsername: string;
  portfolioUrl: string;
  overallGrade: GradeTier;
  level: number;
  totalXp: number;
  targetLevelXp: number;
  xpToNextLevel: number;
  collaborationScore: number;
  verifiedProjectsCount: number;
  skills: SkillReputation[];
  badges: BadgeItem[];
  projects: Project[];
  certificates: CertificateItem[];
  collaborations: CollaborationItem[];
  assessments: AssessmentRecord[];
  activityData: { date: string; count: number; level: number }[];
  profileStrength: number;
  topSkills: string[];
  availability: {
    status: string;
    openTo: string[];
  };
  currentInterests: string[];
}

export interface SkillMatrixItem {
  skill_name: string;
  grade: GradeTier;
  score: number;
  xp: number;
  verified_projects?: number;
}

export interface CandidateProfile {
  id: string;
  username: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string;
  level: number;
  total_xp: number;
  ai_quality_index: number;
  verified_repos_count: number;
  github_username: string;
  polygon_wallet_address: string;
  location: string;
  university?: string;
  availability: 'Immediate Hire' | '2 Weeks Notice' | 'Passive / Exploring' | 'Open to Collaborations';
  is_identity_verified: boolean;
  benchmark_project?: {
    name: string;
    throughput: string;
    ast_score: number;
  };
  skills: SkillMatrixItem[];
  projects: Project[];
}

export interface AssessmentScenario {
  id: string;
  benchmark_name: string;
  tier: string;
  total_points: number;
  time_limit_minutes: number;
  scenario_title: string;
  scenario_description: string;
  architecture_diagram: string;
  question: string;
  options: {
    id: string;
    text: string;
    rationale: string;
    is_correct?: boolean;
  }[];
  code_critique: {
    language: string;
    file_name: string;
    code_snippet: string;
    vulnerability_description: string;
    solution_preview: string;
  };
}

export interface VerificationActivity {
  id: string;
  timestamp: string;
  type: 'EVALUATION_COMPLETED' | 'ONCHAIN_ANCHOR' | 'PEER_ATTESTATION' | 'BADGE_AWARDED';
  developer_name: string;
  developer_avatar: string;
  repo_name: string;
  grade: GradeTier;
  score: number;
  polygon_tx?: string;
  details: string;
}

export interface ReputationNotification {
  title: string;
  badge_name: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  message: string;
  timestamp: string;
}

export interface AwardXpPayload {
  username: string;
  source_type: 'PROJECT' | 'CERTIFICATE' | 'COLLABORATION' | 'ASSESSMENT' | 'ACHIEVEMENT';
  source_title: string;
  grade?: GradeTier;
  complexity_score?: number;
  is_verified?: boolean;
  contribution_percentage?: number;
  completion_quality?: number;
  score?: number;
  percentile?: number;
  tier?: string;
  team_size?: number;
  skill_weights?: Record<string, number>;
}

export interface AwardXpResponse {
  awarded_xp: number;
  new_cumulative_xp: number;
  old_level: number;
  new_level: number;
  professional_reputation_grade: GradeTier;
  grade_system_title: string;
  target_level_xp: number;
  xp_to_next_level: number;
  skill_xp_distributed: Record<string, number>;
  newly_unlocked_badges: ReputationNotification[];
  notifications: ReputationNotification[];
}

export interface UserReputationState {
  username: string;
  cumulative_xp: number;
  level: number;
  professional_reputation_grade: GradeTier;
  grade_system_title: string;
  target_level_xp: number;
  xp_to_next_level: number;
  collaboration_score: number;
  verified_projects_count: number;
  skills: Record<string, {
    cumulative_xp: number;
    level: number;
    score: number;
    verified_projects: number;
    grade: GradeTier;
  }>;
  badges: string[];
  notifications: ReputationNotification[];
}

// -------------------------------------------------------------
// GitHub Verification & Multi-Signal Scoring Types
// -------------------------------------------------------------

export interface GitHubAccount {
  username: string;
  github_username: string | null;
  name?: string;
  avatar_url?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  connected_at?: string | null;
  is_connected: boolean;
}

export interface GitHubRepoLanguage {
  bytes: number;
  percentage: number;
}

export interface GitHubRepoMetadata {
  name: string;
  full_name: string;
  owner: string;
  description: string;
  primary_language: string;
  languages: Record<string, GitHubRepoLanguage>;
  created_at: string;
  updated_at: string;
  stars: number;
  forks: number;
  open_issues: number;
  default_branch: string;
  commits_count: number;
  pull_requests_count: number;
  contributors: any[];
  recent_commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
    verified: boolean;
  }>;
  pull_requests: Array<{
    id: number;
    title: string;
    author: string;
    status: string;
    created_at: string;
    comments: number;
  }>;
}

export interface ContributorSignals {
  commit_activity: { points: number; max: number; weight_pct: number };
  files_changed: { points: number; max: number; weight_pct: number };
  pull_request_participation: { points: number; max: number; weight_pct: number };
  development_consistency: { points: number; max: number; weight_pct: number };
  task_role_evidence: { points: number; max: number; weight_pct: number };
}

export interface ContributionAuditMember {
  name: string;
  login: string;
  role: string;
  contribution_score: number;
  contribution_percentage: number;
  verification_confidence: {
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    percentage: number;
    gpg_verified: boolean;
    active_weeks: number;
    tasks_completed: number;
  };
  signals: ContributorSignals;
}

// -------------------------------------------------------------
// Collaboration Workspace & Task Board Types
// -------------------------------------------------------------

export interface CollaborationMember {
  username: string;
  name: string;
  role: string;
  avatar_url: string;
  github_handle: string;
  contribution_score: number;
  contribution_percentage: number;
  last_activity: string;
  gpg_verified: boolean;
  level: number;
  grade: GradeTier;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface CollaborationTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: string;
  assignee_avatar?: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  tags: string[];
}

export interface CollaborationActivityItem {
  id: string;
  type: string;
  author: string;
  description: string;
  timestamp: string;
}

export interface CollaborationFileItem {
  path: string;
  language: string;
  lines: number;
  lead_contributor: string;
  ast_verified: boolean;
}

export interface IndividualXpAllocation {
  username: string;
  name: string;
  role: string;
  contribution_percentage: number;
  contribution_score: number;
  awarded_xp: number;
  old_level: number;
  new_level: number;
  professional_reputation_grade: GradeTier;
  unlocked_badges: ReputationNotification[];
}

export interface ProjectCompletionRecord {
  completed_at: string;
  project_name: string;
  total_xp_pool: number;
  evaluation_grade: GradeTier;
  allocations: IndividualXpAllocation[];
  verification_confidence: string;
}

export interface CollaborationWorkspace {
  id: string;
  name: string;
  tagline: string;
  status: 'In Progress' | 'Completed';
  repo_url: string;
  repo_name: string;
  primary_stack: string[];
  created_at: string;
  target_completion_date: string;
  xp_pool: number;
  description: string;
  members: CollaborationMember[];
  tasks: CollaborationTask[];
  activity: CollaborationActivityItem[];
  files: CollaborationFileItem[];
  completion_record?: ProjectCompletionRecord | null;
}

// -------------------------------------------------------------
// Developer Discovery Types
// -------------------------------------------------------------

export interface DeveloperDiscoveryItem {
  id: string;
  username: string;
  name: string;
  headline: string;
  avatar_url: string;
  level: number;
  overall_grade: GradeTier;
  reputation_title: string;
  top_skills: string[];
  badges: string[];
  availability: string;
  location: string;
  verified_repos: number;
  collaboration_score: number;
  bio: string;
}

// -------------------------------------------------------------
// Credential Verification Types
// -------------------------------------------------------------

export type VerificationLevelType = 'User Submitted' | 'Platform Verified' | 'Issuer Verified';

export interface VerifiedCredentialRecord {
  credential_id: string;
  owner_id: string;
  owner_username?: string;
  credential_type: string;
  issuer: string;
  entity_id: string;
  document_hash: string;
  issue_timestamp: string;
  issued_date_formatted: string;
  status: 'Verified' | 'Revoked' | 'Pending';
  verification_level: VerificationLevelType;
  blockchain: string;
  network: string;
  contract_address: string;
  transaction_hash: string;
  block_number: number;
  document_integrity: 'Valid' | 'TAMPERED_OR_ALTERED' | 'REVOKED';
  storage_provider: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string;
  file_size_bytes: number;
  revocation_reason?: string | null;
  revoked_at?: string | null;
  description: string;
  verification_notes: string;
}

export interface DocumentVerificationResult {
  credential_id: string;
  is_found: boolean;
  is_authentic: boolean;
  status: string;
  verification_level: string;
  expected_hash: string;
  computed_hash: string;
  document_integrity: string;
  transaction_hash: string;
  blockchain: string;
  owner: string;
  issuer: string;
  message: string;
}

// -------------------------------------------------------------
// Recruiter Experience & Deterministic Match Engine Types
// -------------------------------------------------------------

export interface RecruiterMetrics {
  open_positions: number;
  saved_candidates: number;
  assessments_sent: number;
  upcoming_interviews: number;
}

export interface OpenPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  salary_band: string;
  required_skills: string[];
  min_level: number;
  applicants_count: number;
  created_at: string;
}

export interface AssessmentSentRecord {
  id: string;
  candidate_name: string;
  candidate_username: string;
  assessment_name: string;
  status: string;
  score: number | null;
  sent_date: string;
  completed_date: string | null;
}

export interface UpcomingInterviewRecord {
  id: string;
  candidate_name: string;
  candidate_username: string;
  avatar_url: string;
  role_title: string;
  date_time: string;
  interviewer: string;
  jitsi_url: string;
  status: string;
}

export interface RecentApplicationRecord {
  id: string;
  candidate_name: string;
  candidate_username: string;
  role_title: string;
  applied_date: string;
  match_score: number;
  overall_grade: GradeTier;
  level: number;
  status: string;
}

export interface CandidateSkillItem {
  skill_name: string;
  score: number;
  level?: number;
}

export interface MatchEngineSignals {
  required_skills: number;
  skill_proficiency: number;
  project_evidence: number;
  project_grades: number;
  assessment_scores: number;
  collaboration_score: number;
}

export interface TalentCandidateResult {
  id: string;
  username: string;
  name: string;
  headline: string;
  avatar_url: string;
  level: number;
  overall_grade: GradeTier;
  overall?: {
    level: number;
    grade: GradeTier;
    title: string;
  };
  top_skills: CandidateSkillItem[];
  badges: string[];
  verified_projects_count: number;
  collaboration_score: number;
  location: string;
  availability: string;
  education: string;
  assessment_score: number;
  role_category: string;
  bio?: string;
  job_match: number;
  match_breakdown?: MatchEngineSignals;
  why_this_candidate_matches?: string;
  is_saved: boolean;
}

export interface RecruiterDashboardData {
  metrics: RecruiterMetrics;
  open_positions: OpenPosition[];
  recommended_candidates: TalentCandidateResult[];
  recent_applications: RecentApplicationRecord[];
  upcoming_interviews: UpcomingInterviewRecord[];
}

export interface TalentSearchParams {
  query?: string;
  role?: string;
  skills?: string[];
  min_skill_level?: number;
  overall_grade?: string;
  min_level?: number;
  badges?: string[];
  min_verified_projects?: number;
  min_collaboration_score?: number;
  location?: string;
  availability?: string;
  education?: string;
}

export interface CandidateDossier extends TalentCandidateResult {
  professional_summary: {
    bio: string;
    headline: string;
    location: string;
    availability: string;
    education: string;
  };
  skill_reputation: CandidateSkillItem[];
  verified_projects: Array<{
    id: string;
    title: string;
    category: string;
    grade: GradeTier;
    score: number;
    technologies: string[];
    ast_verified: boolean;
  }>;
  project_grades: Array<{
    title: string;
    grade: GradeTier;
    score: number;
    category: string;
    ast_verified: boolean;
  }>;
  github_evidence: {
    username: string;
    commits: number;
    pull_requests: number;
    gpg_verified: boolean;
    lines_of_code: number;
  };
  collaboration_history: Array<{
    id: string;
    project_title: string;
    role: string;
    contribution_percentage: number;
    duration: string;
    verified_gpg: boolean;
  }>;
  certificates: Array<{
    title: string;
    issuer: string;
    date: string;
    credential_id: string;
    hash_verified: boolean;
  }>;
  assessment_results: Array<{
    name: string;
    score: number;
    percentile: string;
    date: string;
    status: string;
  }>;
  verification_history: Array<{
    event: string;
    timestamp: string;
    hash: string;
    block_height: number;
    verified_by: string;
  }>;
}

// -------------------------------------------------------------
// Recruiter Assessments & Interview Coordination Types
// -------------------------------------------------------------

export type AssessmentCategoryType = "Aptitude Test" | "Technical MCQ" | "Custom Assessment";
export type AssessmentQuestionType = "single_choice" | "multiple_choice" | "short_answer";

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  question_type: AssessmentQuestionType;
  options: string[];
  correct_answers?: string[];
  explanation?: string;
  points: number;
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  assessment_type: AssessmentCategoryType;
  job_title: string;
  company: string;
  duration_minutes: number;
  passing_score_pct: number;
  show_correct_answers: boolean;
  instructions: string;
  questions: AssessmentQuestion[];
  submissions_count?: number;
  created_at: string;
}

export interface ScoredQuestion {
  question_id: string;
  question_text: string;
  question_type: AssessmentQuestionType;
  candidate_answer: any;
  is_correct: boolean;
  points_awarded: number;
  max_points: number;
  correct_answers?: string[] | null;
  explanation?: string | null;
}

export interface AssessmentSubmissionRecord {
  id: string;
  assessment_id: string;
  assessment_title: string;
  assessment_type: string;
  company: string;
  job_title: string;
  passing_score_pct: number;
  candidate_username: string;
  candidate_name: string;
  candidate_avatar: string;
  score: number;
  total_points: number;
  percentage: number;
  status: "PASSED" | "FAILED";
  completion_time_seconds: number;
  completion_time_formatted: string;
  submitted_at: string;
  answers: Record<string, any>;
  scored_questions: ScoredQuestion[];
  show_correct_answers: boolean;
}

export interface InterviewInvitationPayload {
  candidate_username: string;
  candidate_name: string;
  job_title: string;
  date: string;
  time: string;
  duration: string;
  message: string;
  company?: string;
  interviewer?: string;
  candidate_avatar?: string;
}

export interface CandidateInterviewNotification {
  id: string;
  candidate_username: string;
  title: string;
  message: string;
  job_title: string;
  company: string;
  date: string;
  time: string;
  duration: string;
  interview_id: string;
  jitsi_url: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  read: boolean;
  created_at: string;
}


