"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CandidateDetailModal } from "@/components/recruiter/CandidateDetailModal";
import { InterviewModal } from "@/components/recruiter/InterviewModal";
import { SendAssessmentModal } from "@/components/recruiter/SendAssessmentModal";
import {
  searchTalent,
  getRecruiterCandidateDetail,
  toggleSaveCandidate,
  sendRecruiterAssessment,
  inviteRecruiterInterview,
} from "@/lib/api-client";
import type {
  TalentCandidateResult,
  TalentSearchParams,
  CandidateDossier,
  GradeTier,
} from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  X,
  Bookmark,
  BookmarkCheck,
  Send,
  Video,
  ShieldCheck,
  Award,
  Filter,
  RefreshCw,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";

export default function TalentSearchPage() {
  // Search query state
  const [query, setQuery] = useState("");
  
  // 11 Professional Filter States
  const [filterRole, setFilterRole] = useState<string>("All Roles");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["React", "TypeScript", "Next.js"]);
  const [minSkillLevel, setMinSkillLevel] = useState<number>(0);
  const [overallGrade, setOverallGrade] = useState<string>("All Grades");
  const [minLevel, setMinLevel] = useState<number>(0);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [minVerifiedProjects, setMinVerifiedProjects] = useState<number>(0);
  const [minCollaborationScore, setMinCollaborationScore] = useState<number>(0);
  const [filterLocation, setFilterLocation] = useState<string>("All Locations");
  const [filterAvailability, setFilterAvailability] = useState<string>("All Availabilities");
  const [filterEducation, setFilterEducation] = useState<string>("All Education");

  // UI States
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(true);
  const [candidates, setCandidates] = useState<TalentCandidateResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDossier | TalentCandidateResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [assessmentModalCand, setAssessmentModalCand] = useState<{ username: string; name: string } | null>(null);
  const [interviewModalCand, setInterviewModalCand] = useState<{ username: string; name: string; role: string } | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const availableSkillsList = [
    "React", "TypeScript", "Next.js", "Python", "Rust", "FastAPI", 
    "PostgreSQL", "CUDA", "Tokio", "Raft", "Distributed Systems", "TailwindCSS"
  ];

  const availableBadgesList = [
    "Frontend Developer — Gold",
    "Team Collaborator — Silver",
    "React Developer — Gold",
    "Rust Systems Specialist — Gold",
    "Open Source Contributor — Bronze"
  ];

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3500);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params: TalentSearchParams = {
        query: query.trim() || undefined,
        role: filterRole !== "All Roles" ? filterRole : undefined,
        skills: selectedSkills.length > 0 ? selectedSkills : undefined,
        min_skill_level: minSkillLevel > 0 ? minSkillLevel : undefined,
        overall_grade: overallGrade !== "All Grades" ? overallGrade : undefined,
        min_level: minLevel > 0 ? minLevel : undefined,
        badges: selectedBadges.length > 0 ? selectedBadges : undefined,
        min_verified_projects: minVerifiedProjects > 0 ? minVerifiedProjects : undefined,
        min_collaboration_score: minCollaborationScore > 0 ? minCollaborationScore : undefined,
        location: filterLocation !== "All Locations" ? filterLocation : undefined,
        availability: filterAvailability !== "All Availabilities" ? filterAvailability : undefined,
        education: filterEducation !== "All Education" ? filterEducation : undefined,
      };
      const res = await searchTalent(params);
      setCandidates(res.candidates);
    } catch (err) {
      console.error("Talent search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [
    filterRole,
    selectedSkills,
    minSkillLevel,
    overallGrade,
    minLevel,
    selectedBadges,
    minVerifiedProjects,
    minCollaborationScore,
    filterLocation,
    filterAvailability,
    filterEducation,
  ]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const handleResetFilters = () => {
    setQuery("");
    setFilterRole("All Roles");
    setSelectedSkills(["React", "TypeScript", "Next.js"]);
    setMinSkillLevel(0);
    setOverallGrade("All Grades");
    setMinLevel(0);
    setSelectedBadges([]);
    setMinVerifiedProjects(0);
    setMinCollaborationScore(0);
    setFilterLocation("All Locations");
    setFilterAvailability("All Availabilities");
    setFilterEducation("All Education");
  };

  const handleOpenDetail = async (cand: TalentCandidateResult) => {
    try {
      const full = await getRecruiterCandidateDetail(cand.username);
      setSelectedCandidate(full);
    } catch (err) {
      setSelectedCandidate(cand);
    }
    setIsDetailOpen(true);
  };

  const handleToggleSave = async (username: string) => {
    try {
      const res = await toggleSaveCandidate(username);
      setCandidates((prev) =>
        prev.map((c) => (c.username === username ? { ...c, is_saved: res.is_saved } : c))
      );
      if (selectedCandidate && selectedCandidate.username === username) {
        setSelectedCandidate({ ...selectedCandidate, is_saved: res.is_saved });
      }
      showToast(res.is_saved ? `Saved @${username} to candidate list` : `Removed @${username} from saved`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAssessment = async (assessmentName: string) => {
    if (!assessmentModalCand) return;
    const res = await sendRecruiterAssessment(assessmentModalCand.username, assessmentName);
    showToast(`Assessment sent to @${assessmentModalCand.username}`);
    return res;
  };

  const handleInviteInterview = async (roleTitle: string, dateTime: string) => {
    if (!interviewModalCand) return;
    const res = await inviteRecruiterInterview(interviewModalCand.username, roleTitle, dateTime);
    showToast(`Interview scheduled with @${interviewModalCand.username}`);
    return res;
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col">
      <TopNav />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <Breadcrumb items={[{ label: "Recruiter Portal", href: "/recruiter" }, { label: "Talent Search" }]} />
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Talent Search</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  <Cpu className="w-3 h-3 text-brand-600" />
                  Deterministic Match Engine Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Filter verified engineers across compiler-evaluated codebases, GPG attributions, and proctored benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="px-3 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-800 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
                <span>{showFiltersPanel ? "Hide Filters" : "Show 11 Filters"}</span>
                {showFiltersPanel ? <ChevronUp className="w-3 h-3 ml-0.5 text-neutral-400" /> : <ChevronDown className="w-3 h-3 ml-0.5 text-neutral-400" />}
              </button>

              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 text-xs font-medium transition-colors shadow-xs"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Toast */}
          {activeToast && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{activeToast}</span>
            </div>
          )}

          {/* SEARCH BAR (Exact Prompt Requirement) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search React developers, AI engineers, Python developers…"
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-border rounded-md text-neutral-900 placeholder:text-neutral-400 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-xs transition-colors"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center">
              <button
                onClick={handleSearch}
                className="px-3.5 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* 11 PROFESSIONAL FILTERS PANEL */}
          {showFiltersPanel && (
            <div className="p-4 sm:p-5 rounded-lg bg-white border border-border space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    11 Deterministic Talent Filters
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  Real-time recalculation
                </span>
              </div>

              {/* Grid of 11 Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
                
                {/* Filter 1: Role */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    1. Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value="All Roles">All Roles</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Senior Distributed Systems Engineer">Distributed Systems</option>
                    <option value="Full-Stack TypeScript Infrastructure Lead">Full-Stack Lead</option>
                    <option value="ML Systems & Kernel Optimization Specialist">ML Systems Specialist</option>
                  </select>
                </div>

                {/* Filter 3: Minimum Skill Level */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    3. Minimum Skill Level: {minSkillLevel > 0 ? `${minSkillLevel}+` : "Any"}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={95}
                    step={5}
                    value={minSkillLevel}
                    onChange={(e) => setMinSkillLevel(Number(e.target.value))}
                    className="w-full accent-brand-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                    <span>Any</span>
                    <span>70+</span>
                    <span>80+</span>
                    <span>90+</span>
                  </div>
                </div>

                {/* Filter 4: Overall Grade */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    4. Overall Grade
                  </label>
                  <select
                    value={overallGrade}
                    onChange={(e) => setOverallGrade(e.target.value)}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value="All Grades">All Reputation Grades</option>
                    <option value="O">Tier O (Mastery - Levels 51+)</option>
                    <option value="A">Tier A (Principal - Levels 41-50)</option>
                    <option value="B">Tier B (Senior - Levels 31-40)</option>
                    <option value="C">Tier C (Mid - Levels 21-30)</option>
                    <option value="D">Tier D (Associate - Levels 11-20)</option>
                    <option value="E">Tier E (Foundational - Levels 1-10)</option>
                  </select>
                </div>

                {/* Filter 5: Minimum Level */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    5. Minimum Level: {minLevel > 0 ? `Lvl ${minLevel}+` : "Any"}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={5}
                    value={minLevel}
                    onChange={(e) => setMinLevel(Number(e.target.value))}
                    className="w-full accent-brand-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1">
                    <span>Lvl 0</span>
                    <span>Lvl 20</span>
                    <span>Lvl 35</span>
                    <span>Lvl 50</span>
                  </div>
                </div>

                {/* Filter 7: Verified Projects */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    7. Verified Projects
                  </label>
                  <select
                    value={minVerifiedProjects}
                    onChange={(e) => setMinVerifiedProjects(Number(e.target.value))}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value={0}>Any Projects</option>
                    <option value={1}>1+ Verified Project</option>
                    <option value={3}>3+ Verified Projects</option>
                    <option value={5}>5+ Verified Projects</option>
                  </select>
                </div>

                {/* Filter 8: Collaboration Score */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    8. Collaboration Score
                  </label>
                  <select
                    value={minCollaborationScore}
                    onChange={(e) => setMinCollaborationScore(Number(e.target.value))}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value={0}>Any Score</option>
                    <option value={70}>70+ Verified Teamwork</option>
                    <option value={80}>80+ Strong Collaboration</option>
                    <option value={85}>85+ Elite Team Lead</option>
                  </select>
                </div>

                {/* Filter 9: Location */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    9. Location
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value="All Locations">All Locations</option>
                    <option value="San Francisco">San Francisco, CA / Remote</option>
                    <option value="Remote">Remote Only</option>
                    <option value="Bangalore">Bangalore / Hybrid</option>
                    <option value="Seattle">Seattle / On-site</option>
                  </select>
                </div>

                {/* Filter 10: Availability */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    10. Availability
                  </label>
                  <select
                    value={filterAvailability}
                    onChange={(e) => setFilterAvailability(e.target.value)}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value="All Availabilities">All Availabilities</option>
                    <option value="Open to Collaborations">Open to Collaborations</option>
                    <option value="Available for Hire">Available for Hire</option>
                    <option value="Immediate">Immediate Start</option>
                  </select>
                </div>

                {/* Filter 11: Education */}
                <div>
                  <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1">
                    11. Education
                  </label>
                  <select
                    value={filterEducation}
                    onChange={(e) => setFilterEducation(e.target.value)}
                    className="w-full p-2 rounded-md bg-canvas border border-border text-neutral-800 focus:outline-none focus:border-brand-600 text-xs"
                  >
                    <option value="All Education">All Education</option>
                    <option value="Stanford">Stanford University</option>
                    <option value="MIT">MIT</option>
                    <option value="IIT">IIT Bombay / Madras</option>
                    <option value="Berkeley">UC Berkeley</option>
                  </select>
                </div>

              </div>

              {/* Filter 2: Skills (Tag Selection) */}
              <div className="pt-2 border-t border-border/80">
                <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1.5">
                  2. Skills Filter (Target Skillset)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableSkillsList.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                          isSelected
                            ? "bg-brand-50 text-brand-700 border border-brand-300 font-bold"
                            : "bg-canvas text-neutral-600 border border-border hover:bg-neutral-100"
                        }`}
                      >
                        {isSelected && <Check className="mr-1 h-3 w-3 inline text-brand-600 stroke-[3]" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter 6: Badges (Badge Selection) */}
              <div className="pt-2 border-t border-border/80">
                <label className="block font-mono text-neutral-600 uppercase text-[11px] mb-1.5">
                  6. Badges
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableBadgesList.map((badge) => {
                    const isSelected = selectedBadges.includes(badge);
                    return (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => toggleBadge(badge)}
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1 ${
                          isSelected
                            ? "bg-amber-50 text-amber-900 border border-amber-300 font-bold"
                            : "bg-canvas text-neutral-600 border border-border hover:bg-neutral-100"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* CANDIDATE SEARCH RESULTS (COMPACT PROFESSIONAL RESULTS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-600">
                Found <strong className="font-bold text-neutral-900">{candidates.length}</strong> verified candidates matching deterministic criteria
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                Sorted by Deterministic Match %
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                <span>Computing deterministic matching scores across candidate network...</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className="p-12 rounded-lg bg-white border border-border text-center space-y-3 shadow-xs">
                <p className="text-sm text-neutral-700">No candidates found matching the selected 11 filter combination.</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {candidates.map((cand) => {
                  const grade = cand.overall_grade || "B";
                  const level = cand.level || 38;
                  const gradeStyle = getGradeBadgeStyle(grade);

                  return (
                    /* COMPACT PROFESSIONAL SEARCH RESULT (Strictly Non-Oversized) */
                    <div
                      key={cand.id}
                      className="p-4 rounded-lg bg-white border border-border hover:border-neutral-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                    >
                      {/* Left: Avatar, Name, Headline */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0 lg:max-w-xs xl:max-w-sm">
                        <img
                          src={cand.avatar_url}
                          alt={cand.name}
                          className="w-12 h-12 rounded-full border border-border object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-neutral-900 truncate">{cand.name}</h3>
                            <span className="font-mono text-xs text-neutral-500">@{cand.username}</span>
                          </div>
                          <p className="text-xs text-neutral-600 truncate mt-0.5 font-medium">
                            {cand.headline}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1 font-mono">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-neutral-400" /> {cand.location}</span>
                            <span className="flex items-center gap-1 text-emerald-700 font-medium"><Clock className="w-3 h-3 text-emerald-600" /> {cand.availability}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle 1: Overall (Level 38, Grade B) */}
                      <div className="shrink-0 border-l border-border/80 pl-4 hidden sm:block">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase">Overall</div>
                        <div className="text-xs font-mono font-bold text-neutral-900 mt-0.5">
                          Level {level}
                        </div>
                        <div className="mt-0.5">
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[11px] font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                            Grade {grade}
                          </span>
                        </div>
                      </div>

                      {/* Middle 2: Top Skills (React 88, TypeScript 84, Next.js 81) */}
                      <div className="shrink-0 border-l border-border/80 pl-4">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase">Top Skills</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {cand.top_skills.slice(0, 3).map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-canvas border border-border text-neutral-700"
                            >
                              {s.skill_name} <strong className="font-bold text-brand-700">{s.score}</strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Middle 3: Badges & Verified Projects */}
                      <div className="shrink-0 border-l border-border/80 pl-4 hidden md:block">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase">Badges & Proof</div>
                        <div className="flex items-center gap-1 mt-1 flex-wrap max-w-[200px]">
                          {cand.badges.slice(0, 2).map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 truncate max-w-[190px]"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500 mt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                          <span>Verified: {cand.verified_projects_count} projects</span>
                        </div>
                      </div>

                      {/* Middle 4: Job Match (92%) */}
                      <div className="shrink-0 border-l border-border/80 pl-4 text-center lg:text-right">
                        <div className="text-[10px] font-mono text-neutral-500 uppercase">Job Match</div>
                        <div className="text-lg font-mono font-bold text-emerald-700 flex items-center justify-center lg:justify-end gap-1 mt-0.5">
                          <span>{cand.job_match}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 block">
                          Deterministic
                        </span>
                      </div>

                      {/* Right: Actions (View Profile, Save, Send Assessment, Invite to Interview) */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                        <button
                          onClick={() => handleOpenDetail(cand)}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors"
                        >
                          View Profile
                        </button>

                        <button
                          onClick={() => handleToggleSave(cand.username)}
                          className={`p-1.5 rounded-md border text-xs transition-colors ${
                            cand.is_saved
                              ? "bg-amber-50 border-amber-300 text-amber-700"
                              : "bg-white border-border text-neutral-400 hover:text-neutral-700"
                          }`}
                          title={cand.is_saved ? "Saved" : "Save candidate"}
                        >
                          {cand.is_saved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setAssessmentModalCand({ username: cand.username, name: cand.name })}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Send className="w-3 h-3 text-neutral-500" />
                          <span className="hidden xl:inline">Assessment</span>
                        </button>

                        <button
                          onClick={() =>
                            setInterviewModalCand({
                              username: cand.username,
                              name: cand.name,
                              role: cand.headline,
                            })
                          }
                          className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          <span>Interview</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Candidate Detail Modal (All 10 Recruiter Sections) */}
      <CandidateDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        candidate={selectedCandidate}
        onSave={handleToggleSave}
        onSendAssessment={(uname) => {
          setIsDetailOpen(false);
          setAssessmentModalCand({ username: uname, name: selectedCandidate?.name || uname });
        }}
        onInviteInterview={(uname, role) => {
          setIsDetailOpen(false);
          setInterviewModalCand({ username: uname, name: selectedCandidate?.name || uname, role });
        }}
      />

      {/* Send Assessment Modal */}
      {assessmentModalCand && (
        <SendAssessmentModal
          isOpen={!!assessmentModalCand}
          onClose={() => setAssessmentModalCand(null)}
          candidateUsername={assessmentModalCand.username}
          candidateName={assessmentModalCand.name}
          onConfirm={handleSendAssessment}
        />
      )}

      {/* Invite Interview Modal (Jitsi Integration) */}
      {interviewModalCand && (
        <InterviewModal
          isOpen={!!interviewModalCand}
          onClose={() => setInterviewModalCand(null)}
          candidateUsername={interviewModalCand.username}
          candidateName={interviewModalCand.name}
          defaultRoleTitle={interviewModalCand.role}
          onSuccess={handleSearch}
        />
      )}
    </div>
  );
}
