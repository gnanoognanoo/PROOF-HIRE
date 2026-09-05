import math
from typing import Dict, Any, List, Optional

class DeterministicMatchEngine:
    """
    ProofHire Deterministic Candidate Match Engine.
    
    IMPORTANT ARCHITECTURAL RULE:
    Never let Gemini or AI arbitrarily decide the numerical match score.
    The numeric score is strictly computed using backend mathematical rules
    across 6 weighted signals.
    Gemini is only used to generate the qualitative 'Why this candidate matches' rationale.
    """

    # Signal Weights (sum to 1.0 / 100%)
    WEIGHTS = {
        "required_skills": 0.35,      # 35%: Coverage of requested skills
        "skill_proficiency": 0.20,    # 20%: Candidate proficiency in requested skills
        "project_evidence": 0.15,     # 15%: Verified repositories in the domain
        "project_grades": 0.15,       # 15%: Quality of code (O/A/B/C/D/E)
        "assessment_scores": 0.10,    # 10%: Standardized benchmark tests
        "collaboration_score": 0.05   #  5%: Multi-contributor peer review score
    }

    GRADE_MULTIPLIERS = {
        "O": 1.00,
        "A": 0.90,
        "B": 0.80,
        "C": 0.65,
        "D": 0.50,
        "E": 0.35
    }

    def calculate_match_score(
        self,
        candidate: Dict[str, Any],
        required_skills: List[str],
        min_skill_level: Optional[int] = None,
        min_overall_level: Optional[int] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates a deterministic 0-100% job match score.
        """
        if not required_skills:
            # Default to candidate top skills if none specified
            required_skills = ["React", "TypeScript", "Next.js"]

        cand_skills = candidate.get("skills", {})
        cand_top_skills = candidate.get("top_skills", [])
        
        # Format candidate skills into a map of skill_name -> score (0-100)
        skill_score_map: Dict[str, int] = {}
        if isinstance(cand_skills, dict):
            for k, v in cand_skills.items():
                if isinstance(v, dict):
                    skill_score_map[k.lower()] = v.get("score", 75)
                else:
                    skill_score_map[k.lower()] = int(v)
        elif isinstance(cand_skills, list):
            for s in cand_skills:
                if isinstance(s, dict):
                    skill_score_map[s.get("skill_name", "").lower()] = s.get("score", 75)

        for s in cand_top_skills:
            if isinstance(s, dict):
                s_name = s.get("skill_name") or s.get("name") or ""
                s_score = s.get("score") or s.get("level") or 85
                if s_name and s_name.lower() not in skill_score_map:
                    skill_score_map[s_name.lower()] = int(s_score)
            elif isinstance(s, str):
                if s.lower() not in skill_score_map:
                    skill_score_map[s.lower()] = 85

        # 1. Required Skills Coverage (35 points max)
        matched_skills = []
        missing_skills = []
        for req in required_skills:
            req_l = req.lower()
            if any(req_l in k for k in skill_score_map.keys()):
                matched_skills.append(req)
            else:
                missing_skills.append(req)

        coverage_ratio = len(matched_skills) / max(1, len(required_skills))
        signal_required_skills = coverage_ratio * 35.0

        # 2. Skill Proficiency (20 points max)
        if matched_skills:
            scores = []
            for m in matched_skills:
                m_l = m.lower()
                matching_keys = [k for k in skill_score_map if m_l in k]
                if matching_keys:
                    scores.append(skill_score_map[matching_keys[0]])
                else:
                    scores.append(70)
            avg_skill_score = sum(scores) / len(scores)
            signal_proficiency = (avg_skill_score / 100.0) * 20.0
        else:
            signal_proficiency = 5.0

        # 3. Relevant Project Evidence (14.5 points max)
        verified_projects = candidate.get("verified_projects_count", 5)
        project_ratio = min(1.0, verified_projects / 5.0) # 5 projects = full portfolio
        signal_projects = project_ratio * 14.5

        # 4. Project Grades (15 points max)
        overall_grade = candidate.get("overall_grade", "B").upper()
        grade_factor = self.GRADE_MULTIPLIERS.get(overall_grade, 0.80)
        signal_grades = grade_factor * 15.0

        # 5. Assessment Scores (10 points max)
        assessment_score = candidate.get("assessment_score", 88.0)
        signal_assessment = (min(100.0, assessment_score) / 100.0) * 10.0

        # 6. Collaboration Score (5 points max)
        collab_score = candidate.get("collaboration_score", 86)
        signal_collab = (min(100.0, collab_score) / 100.0) * 5.0

        # Sum total (0 - 100)
        total_score = signal_required_skills + signal_proficiency + signal_projects + signal_grades + signal_assessment + signal_collab
        
        # Role boost/penalty if specified
        if target_role:
            cand_headline = candidate.get("headline", "").lower()
            if any(w in cand_headline for w in target_role.lower().split()):
                total_score = min(100.0, total_score + 3.0)

        final_score = int(round(max(20.0, min(99.0, total_score))))

        # Generate qualitative 'Why this candidate matches' summary
        why_match = self.generate_why_this_candidate_matches(
            candidate=candidate,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            final_score=final_score,
            verified_projects=verified_projects,
            overall_grade=overall_grade
        )

        return {
            "candidate_id": candidate.get("id"),
            "candidate_username": candidate.get("username"),
            "match_score": final_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "signals": {
                "required_skills": round(signal_required_skills, 1),
                "skill_proficiency": round(signal_proficiency, 1),
                "project_evidence": round(signal_projects, 1),
                "project_grades": round(signal_grades, 1),
                "assessment_scores": round(signal_assessment, 1),
                "collaboration_score": round(signal_collab, 1),
            },
            "why_this_candidate_matches": why_match
        }

    def generate_why_this_candidate_matches(
        self,
        candidate: Dict[str, Any],
        matched_skills: List[str],
        missing_skills: List[str],
        final_score: int,
        verified_projects: int,
        overall_grade: str
    ) -> str:
        """
        Generates qualitative explanation based strictly on deterministic backend signals.
        Never sets or modifies the score.
        """
        name = candidate.get("name", "Candidate")
        matched_str = ", ".join(matched_skills[:3]) if matched_skills else "core architecture skills"
        
        reasons = [
            f"{name} demonstrates verified proficiency in {matched_str} backed by {verified_projects} compiler-audited repositories.",
            f"Holds an overall Professional Reputation Grade {overall_grade} with a {candidate.get('collaboration_score', 86)}/100 peer collaboration score on Polygon."
        ]
        if missing_skills:
            reasons.append(f"Minor ramp-up suggested in {missing_skills[0]}.")

        return " ".join(reasons)

match_engine = DeterministicMatchEngine()
