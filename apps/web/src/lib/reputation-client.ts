/**
 * ProofHire Deterministic Reputation & Badge Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface SkillRepRecord {
  cumulative_xp: number;
  level: number;
  score: number;
  verified_projects: number;
  grade: string;
}

export interface ReputationNotification {
  title: string;
  badge_name: string;
  tier: string;
  message: string;
  timestamp: string;
}

export interface UserReputationState {
  username: string;
  cumulative_xp: number;
  level: number;
  professional_reputation_grade: "O" | "A" | "B" | "C" | "D" | "E" | string;
  grade_system_title: string;
  target_level_xp: number;
  xp_to_next_level: number;
  collaboration_score: number;
  verified_projects_count: number;
  skills: Record<string, SkillRepRecord>;
  badges: string[];
  notifications: ReputationNotification[];
}

export interface AwardXpPayload {
  username: string;
  source_type: "PROJECT" | "CERTIFICATE" | "COLLABORATION" | "ASSESSMENT" | "ACHIEVEMENT";
  source_title: string;
  grade?: string;
  complexity_score?: number;
  is_verified?: boolean;
  contribution_percentage?: number;
  completion_quality?: number;
  skill_weights?: Record<string, number>;
}

export async function getUserReputation(username: string): Promise<UserReputationState> {
  try {
    const res = await fetch(`${API_BASE_URL}/reputation/user/${username}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not fetch reputation from backend:", err);
  }

  // Fallback calibrated to Alex Chen specifications
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

export async function awardVerifiedXp(payload: AwardXpPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reputation/award-xp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("awardVerifiedXp backend request failed:", err);
  }
  return null;
}
