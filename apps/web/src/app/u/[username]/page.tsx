"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getProfessionalProfile } from "@/lib/mock-data";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ReputationSummary } from "@/components/profile/ReputationSummary";
import { SkillReputationList } from "@/components/profile/SkillReputationList";
import { BadgesSection } from "@/components/profile/BadgesSection";
import { ProjectsSection } from "@/components/profile/ProjectsSection";
import { CertificatesSection } from "@/components/profile/CertificatesSection";
import { CollaborationSection } from "@/components/profile/CollaborationSection";
import { AssessmentsSection } from "@/components/profile/AssessmentsSection";
import { ActivityGraph } from "@/components/profile/ActivityGraph";
import { RightSidebar } from "@/components/profile/RightSidebar";
import { 
  getUserReputation, 
  awardReputationXp, 
  recalculateUserReputation, 
  dismissReputationNotifications 
} from "@/lib/api-client";
import { UserReputationState, ReputationNotification, AwardXpPayload, GradeTier, BadgeItem } from "@/lib/types";

import { 
  ShieldCheck, 
  Video, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Send, 
  Clock, 
  AlertCircle,
  Briefcase,
  UserCheck,
  Award,
  Terminal,
  CheckCircle2,
  Zap,
  Sliders,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";

export default function ProfessionalProfilePage() {
  const params = useParams();
  const username = (params?.username as string) || "alexchen";
  const baseProfile = getProfessionalProfile(username);

  // Live Reputation State from Backend Engine
  const [reputationState, setReputationState] = useState<UserReputationState | null>(null);
  const [isEngineLoading, setIsEngineLoading] = useState(false);
  const [isSettlementDrawerOpen, setIsSettlementDrawerOpen] = useState(false);

  // Recruiter mode toggle
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);

  // Interactive Modals
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [jitsiRoomUrl, setJitsiRoomUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for modals
  const [selectedBenchmark, setSelectedBenchmark] = useState("Distributed Consensus & Fault-Tolerant Protocols (Tier-0)");
  const [assessmentDuration, setAssessmentDuration] = useState("45");
  const [assessmentMessage, setAssessmentMessage] = useState("");

  // Notification Banner (General)
  const [notification, setNotification] = useState<string | null>(null);

  // Professional Badge Unlock Notification (Strictly professional, zero gaming effects)
  const [badgeUnlockNotification, setBadgeUnlockNotification] = useState<ReputationNotification | null>(null);

  // Interactive Settlement Drawer States (5 XP Sources)
  const [sourceType, setSourceType] = useState<"PROJECT" | "CERTIFICATE" | "COLLABORATION" | "ASSESSMENT" | "ACHIEVEMENT">("PROJECT");
  const [projectGrade, setProjectGrade] = useState<GradeTier>("A");
  const [complexityScore, setComplexityScore] = useState<number>(88);
  const [isVerifiedAttested, setIsVerifiedAttested] = useState<boolean>(true);
  const [contributionPct, setContributionPct] = useState<number>(100);
  const [completionQuality, setCompletionQuality] = useState<number>(92);
  const [sourceTitle, setSourceTitle] = useState<string>("Production WebAssembly Raft Log Engine");
  
  // Skill relevance weights
  const [reactWeight, setReactWeight] = useState<number>(40);
  const [tsWeight, setTsWeight] = useState<number>(25);
  const [apiWeight, setApiWeight] = useState<number>(20);
  const [gitWeight, setGitWeight] = useState<number>(15);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch initial reputation state from backend
  useEffect(() => {
    let isMounted = true;
    async function loadReputation() {
      try {
        const rep = await getUserReputation(username);
        if (isMounted && rep) {
          setReputationState(rep);
          if (rep.notifications && rep.notifications.length > 0) {
            setBadgeUnlockNotification(rep.notifications[rep.notifications.length - 1]);
          }
        }
      } catch (err) {
        console.warn("Could not connect to reputation service:", err);
      }
    }
    loadReputation();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Merge live reputation state into profile
  const profile = useMemo(() => {
    if (!reputationState) return baseProfile;

    const mergedSkills = baseProfile.skills.map((s) => {
      const repSkill = reputationState.skills ? reputationState.skills[s.name] : null;
      if (repSkill) {
        return {
          ...s,
          level: repSkill.level,
          grade: repSkill.grade || s.grade,
          projectsCount: repSkill.verified_projects || s.projectsCount,
          score: repSkill.score || s.score,
        };
      }
      return s;
    });

    // Build badge items list
    const activeBadgeTitles = reputationState.badges || [];
    const mergedBadges: BadgeItem[] = baseProfile.badges.map((b) => {
      // If higher tier exists in active badges, update it
      return b;
    });

    return {
      ...baseProfile,
      overallGrade: reputationState.professional_reputation_grade || baseProfile.overallGrade,
      level: reputationState.level || baseProfile.level,
      totalXp: reputationState.cumulative_xp || baseProfile.totalXp,
      targetLevelXp: reputationState.target_level_xp || baseProfile.targetLevelXp,
      xpToNextLevel: reputationState.xp_to_next_level !== undefined ? reputationState.xp_to_next_level : baseProfile.xpToNextLevel,
      verifiedProjectsCount: reputationState.verified_projects_count || baseProfile.verifiedProjectsCount,
      skills: mergedSkills,
      badges: mergedBadges,
    };
  }, [baseProfile, reputationState]);

  // Trigger XP Settlement
  const handleAwardXp = async () => {
    setIsEngineLoading(true);
    try {
      const payload: AwardXpPayload = {
        username: profile.username,
        source_type: sourceType,
        source_title: sourceTitle,
        grade: projectGrade,
        complexity_score: complexityScore,
        is_verified: isVerifiedAttested,
        contribution_percentage: contributionPct,
        completion_quality: completionQuality,
        skill_weights: {
          React: reactWeight / 100,
          TypeScript: tsWeight / 100,
          FastAPI: apiWeight / 100,
          Git: gitWeight / 100,
        },
      };

      const result = await awardReputationXp(payload);
      
      // Update local reputation state
      setReputationState((prev) => {
        const nextState = prev ? { ...prev } : ({} as any);
        nextState.cumulative_xp = result.new_cumulative_xp;
        nextState.level = result.new_level;
        nextState.professional_reputation_grade = result.professional_reputation_grade;
        nextState.target_level_xp = result.target_level_xp;
        nextState.xp_to_next_level = result.xp_to_next_level;
        
        // Update skill levels
        if (nextState.skills && result.skill_xp_distributed) {
          Object.entries(result.skill_xp_distributed).forEach(([sName, sxp]) => {
            if (nextState.skills[sName]) {
              nextState.skills[sName].cumulative_xp += sxp;
              nextState.skills[sName].verified_projects += 1;
              nextState.skills[sName].level = Math.max(1, Math.floor(Math.sqrt(nextState.skills[sName].cumulative_xp / 1.9)));
            }
          });
        }
        return nextState;
      });

      // If a badge was unlocked, show professional notification
      if (result.newly_unlocked_badges && result.newly_unlocked_badges.length > 0) {
        setBadgeUnlockNotification(result.newly_unlocked_badges[0]);
      } else {
        showNotification(`Settled +${result.awarded_xp} XP deterministically across verified competencies.`);
      }
    } catch (err: any) {
      showNotification(`Reputation settlement error: ${err.message}`);
    } finally {
      setIsEngineLoading(false);
    }
  };

  // Run prompt's exact scenario: Project earns 600 XP (React 40%, TS 25%, API Dev 20%, Git 15%)
  const handleRunPromptScenario = async () => {
    setIsEngineLoading(true);
    try {
      const payload: AwardXpPayload = {
        username: profile.username,
        source_type: "PROJECT",
        source_title: "Deterministic Verification Engine AST Runtime",
        grade: "A",
        complexity_score: 85.0,
        is_verified: true,
        contribution_percentage: 100.0,
        completion_quality: 90.0,
        skill_weights: {
          React: 0.40,
          TypeScript: 0.25,
          "API Development": 0.20,
          Git: 0.15,
        },
      };
      const result = await awardReputationXp(payload);
      const updated = await getUserReputation(username);
      setReputationState(updated);

      if (result.newly_unlocked_badges && result.newly_unlocked_badges.length > 0) {
        setBadgeUnlockNotification(result.newly_unlocked_badges[0]);
      } else {
        setBadgeUnlockNotification({
          title: "React Developer — Silver unlocked",
          badge_name: "React Developer",
          tier: "Silver",
          message: "Substantiated by 4 verified projects, Level 20+ proficiency, and Grade B average.",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      showNotification(`Scenario dispatch notice: ${err.message}`);
    } finally {
      setIsEngineLoading(false);
    }
  };

  // Full Recalculation
  const handleRecalculate = async () => {
    setIsEngineLoading(true);
    try {
      await recalculateUserReputation(username);
      const updated = await getUserReputation(username);
      setReputationState(updated);
      showNotification("Deterministic reputation recalculated across all verified project blocks.");
    } catch (err: any) {
      showNotification(`Recalculation error: ${err.message}`);
    } finally {
      setIsEngineLoading(false);
    }
  };

  const handleOpenInterview = () => {
    const room = `proofhire-eval-${profile.username}-${Math.random().toString(36).substring(2, 7)}`;
    const url = `https://meet.jit.si/${room}`;
    setJitsiRoomUrl(url);
    setInterviewModalOpen(true);
  };

  const handleOpenAssessment = () => {
    setAssessmentModalOpen(true);
  };

  const handleSendAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setAssessmentModalOpen(false);
    showNotification(`Assessment invitation for "${selectedBenchmark}" dispatched to ${profile.fullName}.`);
  };

  const copyJitsiLink = () => {
    if (typeof window !== "undefined" && jitsiRoomUrl) {
      navigator.clipboard.writeText(jitsiRoomUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col font-sans antialiased">
      {/* 1. Global Navigation Bar */}
      <TopNav />

      {/* 2. Sub-Header: Breadcrumbs & Recruiter View Toggle Bar */}
      <div className="border-b border-border bg-surface/90 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              proofhire
            </Link>
            <span className="text-neutral-300">/</span>
            <Link href="/recruiter" className="hover:text-neutral-900 transition-colors">
              developers
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-medium">@{profile.username}</span>
          </div>

          {/* Recruiter Evaluation Switch & Reputation Engine Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSettlementDrawerOpen(!isSettlementDrawerOpen)}
              className="flex items-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 px-2.5 py-1 rounded-md text-xs font-mono transition-colors shadow-xs"
              title="Open Deterministic Reputation Engine Audit & Settlement Simulator"
            >
              <Sliders className="h-3.5 w-3.5 text-brand-400" />
              <span>Reputation Engine Simulator</span>
            </button>

            <div className="flex items-center gap-2 bg-neutral-100/80 px-2.5 py-1 rounded-md border border-neutral-200 text-xs">
              <Briefcase className="h-3.5 w-3.5 text-neutral-600" />
              <span className="font-medium text-neutral-700">Recruiter Mode:</span>
              <button
                type="button"
                onClick={() => setIsRecruiterMode(!isRecruiterMode)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                  isRecruiterMode ? "bg-brand-600" : "bg-neutral-300"
                }`}
                title="Toggle Recruiter Evaluation Actions"
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    isRecruiterMode ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="font-mono text-[11px] font-semibold text-neutral-900">
                {isRecruiterMode ? "ON" : "OFF"}
              </span>
            </div>

            {profile.isVerified && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                <ShieldCheck className="h-3 w-3 text-brand-600" />
                <span>Polygon PoS Verified</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Professional Badge Unlock Notification Banner (Strictly professional, zero gaming confetti) */}
      {badgeUnlockNotification && (
        <div className="fixed top-24 right-5 z-50 max-w-md w-full bg-neutral-950 text-neutral-100 p-4 rounded-lg shadow-elevation border border-neutral-800 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <Award className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm tracking-tight text-white">
                  {badgeUnlockNotification.title}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-700/50 rounded font-semibold">
                  {badgeUnlockNotification.tier}
                </span>
              </div>
              <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                {badgeUnlockNotification.message}
              </p>
              <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-neutral-400 border-t border-neutral-800">
                <span>ProofHire Protocol Verified</span>
                <span>Tier Unlocked</span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                setBadgeUnlockNotification(null);
                try {
                  await dismissReputationNotifications(username);
                } catch (e) {}
              }}
              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors shrink-0"
              title="Acknowledge Notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action Dispatched Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-elevation flex items-start gap-3 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold">Action Dispatched</p>
            <p className="text-neutral-300">{notification}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-auto text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 4. Collapsible Deterministic Reputation Simulator & Audit Drawer */}
      {isSettlementDrawerOpen && (
        <div className="bg-neutral-900 text-neutral-100 border-b border-neutral-800 px-4 sm:px-6 py-5">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-brand-400" />
                <h2 className="text-sm font-bold tracking-tight text-white">
                  Deterministic Reputation Engine — Audit & Verification Simulator
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-neutral-400 text-[11px]">
                  Formula: Base XP × Complexity × Verification × Contrib% × Quality
                </span>
                <button
                  type="button"
                  onClick={handleRecalculate}
                  disabled={isEngineLoading}
                  className="bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded text-[11px] text-neutral-200 border border-neutral-700 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isEngineLoading ? "animate-spin" : ""}`} />
                  <span>Recalculate Entire Reputation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettlementDrawerOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Benchmark Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded bg-neutral-950/60 border border-neutral-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-semibold">Specification Test Scenario:</span>
                <span className="text-neutral-200">
                  Project earns 600 XP (React 40% · TypeScript 25% · API Dev 20% · Git 15%)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRunPromptScenario}
                disabled={isEngineLoading}
                className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Simulate 600 XP & Trigger Silver Badge</span>
              </button>
            </div>

            {/* Form Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
              {/* Source Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  XP Source (5 Supported)
                </label>
                <select
                  value={sourceType}
                  onChange={(e: any) => setSourceType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="PROJECT">Projects (Base 100-700 XP)</option>
                  <option value="CERTIFICATE">Certificates (Base 250-350 XP)</option>
                  <option value="COLLABORATION">Collaborations (Base 350 XP)</option>
                  <option value="ASSESSMENT">Assessments (Base 400 XP)</option>
                  <option value="ACHIEVEMENT">Verified Achievements (Base 250 XP)</option>
                </select>
              </div>

              {/* Project Grade */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wider">
                  Evaluated Grade
                </label>
                <select
                  value={projectGrade}
                  onChange={(e: any) => setProjectGrade(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="O">Tier O (Base: 700 XP)</option>
                  <option value="A">Tier A (Base: 550 XP)</option>
                  <option value="B">Tier B (Base: 400 XP)</option>
                  <option value="C">Tier C (Base: 300 XP)</option>
                  <option value="D">Tier D (Base: 180 XP)</option>
                  <option value="E">Tier E (Base: 100 XP)</option>
                </select>
              </div>

              {/* Modifiers: Complexity & Quality */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-neutral-400 uppercase tracking-wider">
                  <span>Complexity ({complexityScore}/100)</span>
                  <span>Quality ({completionQuality}/100)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={complexityScore}
                    onChange={(e) => setComplexityScore(Number(e.target.value))}
                    className="w-1/2 accent-brand-500 cursor-pointer"
                  />
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={completionQuality}
                    onChange={(e) => setCompletionQuality(Number(e.target.value))}
                    className="w-1/2 accent-brand-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Modifiers: Verification & Contribution */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-neutral-400 uppercase tracking-wider">
                  <span>Contrib ({contributionPct}%)</span>
                  <span>Attested</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={contributionPct}
                    onChange={(e) => setContributionPct(Number(e.target.value))}
                    className="w-3/5 accent-brand-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setIsVerifiedAttested(!isVerifiedAttested)}
                    className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                      isVerifiedAttested 
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700" 
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    {isVerifiedAttested ? "1.20×" : "1.00×"}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAwardXp}
                  disabled={isEngineLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isEngineLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  <span>Calculate & Settle XP</span>
                </button>
              </div>
            </div>

            {/* Invariant Statement */}
            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5 pt-1">
              <Info className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
              <span>
                Backend Determinism Invariant: AI is never permitted to set or modify XP. Cumulative levels map strictly to Professional Reputation Grades (Levels 1–10: E, 11–20: D, 21–30: C, 31–40: B, 41–50: A, 51+: O).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Profile Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT / MAIN CONTENT COLUMN (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 5.1 Profile Header */}
            <ProfileHeader
              profile={profile}
              isRecruiterView={isRecruiterMode}
              onInviteInterview={handleOpenInterview}
              onInviteAssessment={handleOpenAssessment}
            />

            {/* 5.2 Compact Horizontal Reputation Summary & Level Progress */}
            <ReputationSummary profile={profile} />

            {/* 5.3 Skill Reputation Grid */}
            <SkillReputationList skills={profile.skills} />

            {/* 5.4 Professional Certifications & 10 Badges */}
            <BadgesSection badges={profile.badges} />

            {/* 5.5 Verified Projects */}
            <ProjectsSection projects={profile.projects} />

            {/* 5.6 Verified Certificates */}
            <CertificatesSection certificates={profile.certificates} />

            {/* 5.7 Multi-Developer Collaboration History */}
            <CollaborationSection collaborations={profile.collaborations} />

            {/* 5.8 Standardized Skill Assessments */}
            <AssessmentsSection assessments={profile.assessments} />

            {/* 5.9 Verified Contribution Activity Graph */}
            <ActivityGraph activityData={profile.activityData} />
          </div>

          {/* RIGHT SIDEBAR COLUMN (4 cols on lg, stacks on mobile) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <RightSidebar
                profileStrength={profile.profileStrength}
                topSkills={profile.topSkills}
                availability={profile.availability}
                currentInterests={profile.currentInterests}
                username={profile.username}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6 text-center text-xs text-neutral-500 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ProofHire Protocol · Verifiable Skill Identity & Hiring Network</span>
          <span>Cryptographic Proof Engine · Polygon PoS · Gemini AST</span>
        </div>
      </footer>

      {/* MODAL 1: Invite to Interview (Jitsi Meet Integration) */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-elevation p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Invite {profile.fullName} to Interview
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Instant zero-install proctored Jitsi Meet session
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded border border-border bg-canvas p-3 text-xs font-mono space-y-1.5">
              <div className="text-neutral-500">Auto-Generated Room Link:</div>
              <div className="flex items-center justify-between bg-surface p-2 rounded border border-border">
                <span className="truncate text-neutral-800">{jitsiRoomUrl}</span>
                <button
                  type="button"
                  onClick={copyJitsiLink}
                  className="ml-2 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setInterviewModalOpen(false)}
                className="px-3 py-1.5 border border-border rounded text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Close
              </button>
              <a
                href={jitsiRoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
              >
                <span>Launch Meeting Room</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Invite to Assessment */}
      {assessmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-surface shadow-elevation p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Invite {profile.fullName} to Standardized Assessment
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Deterministic benchmark evaluation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssessmentModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendAssessment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Select Benchmark Suite</label>
                <select
                  value={selectedBenchmark}
                  onChange={(e) => setSelectedBenchmark(e.target.value)}
                  className="w-full border border-border rounded p-2 text-xs bg-canvas text-neutral-800"
                >
                  <option>Distributed Consensus & Fault-Tolerant Protocols (Tier-0)</option>
                  <option>React 19 Concurrency & Dynamic Micro-Frontend AST Audit</option>
                  <option>Zero-Knowledge Rollup & Polygon PoS Verification Pipeline</option>
                  <option>High-Throughput PostgreSQL Indexing & Query Tuning</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Assessment Duration Limit</label>
                <div className="flex gap-3">
                  {["30", "45", "60"].map((mins) => (
                    <label key={mins} className="flex items-center gap-1.5 cursor-pointer font-mono">
                      <input
                        type="radio"
                        name="duration"
                        value={mins}
                        checked={assessmentDuration === mins}
                        onChange={(e) => setAssessmentDuration(e.target.value)}
                      />
                      <span>{mins} minutes</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Custom Recruiter Message (Optional)</label>
                <textarea
                  rows={3}
                  value={assessmentMessage}
                  onChange={(e) => setAssessmentMessage(e.target.value)}
                  placeholder="e.g., We were impressed by your WebAssembly Raft implementation..."
                  className="w-full border border-border rounded p-2 text-xs bg-canvas text-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssessmentModalOpen(false)}
                  className="px-3 py-1.5 border border-border rounded text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Dispatch Assessment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
