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
  getRecruiterDashboard,
  getRecruiterCandidateDetail,
  toggleSaveCandidate,
  sendRecruiterAssessment,
  inviteRecruiterInterview,
  getUpcomingInterviews,
} from "@/lib/api-client";
import type {
  RecruiterDashboardData,
  TalentCandidateResult,
  CandidateDossier,
} from "@/lib/types";
import { getGradeBadgeStyle } from "@/lib/utils";
import {
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Send,
  Video,
  ExternalLink,
  ShieldCheck,
  Award,
  Users,
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Cpu,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  FileText,
} from "lucide-react";

export default function RecruiterDashboardPage() {
  const [dashboardData, setDashboardData] = useState<RecruiterDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDossier | TalentCandidateResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assessmentModalCand, setAssessmentModalCand] = useState<{ username: string; name: string } | null>(null);
  const [interviewModalCand, setInterviewModalCand] = useState<{ username: string; name: string; role: string } | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getRecruiterDashboard();
      try {
        const interviewRes = await getUpcomingInterviews();
        if (interviewRes?.interviews?.length) {
          const formattedInterviews = interviewRes.interviews.map((i: any) => ({
            id: i.id,
            candidate_name: i.candidate_name,
            candidate_username: i.candidate_username,
            avatar_url: i.candidate_avatar || "https://avatars.githubusercontent.com/u/1024025?v=4",
            role_title: i.job_title,
            date_time: `${i.date} at ${i.time}`,
            interviewer: i.interviewer || "Sarah Lin (VP of Engineering)",
            jitsi_url: i.jitsi_url,
            status: i.status === "ACCEPTED" ? "Confirmed" : "Pending",
          }));
          data.upcoming_interviews = formattedInterviews;
          data.metrics.upcoming_interviews = formattedInterviews.length;
        }
      } catch (e) {}
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load recruiter dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDetail = async (cand: TalentCandidateResult) => {
    try {
      const fullDossier = await getRecruiterCandidateDetail(cand.username);
      setSelectedCandidate(fullDossier);
    } catch (err) {
      setSelectedCandidate(cand);
    }
    setIsDetailOpen(true);
  };

  const handleToggleSave = async (username: string) => {
    try {
      const res = await toggleSaveCandidate(username);
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          metrics: {
            ...dashboardData.metrics,
            saved_candidates: res.total_saved,
          },
          recommended_candidates: dashboardData.recommended_candidates.map((c) =>
            c.username === username ? { ...c, is_saved: res.is_saved } : c
          ),
        });
      }
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
    showToast(`Assessment dispatched to @${assessmentModalCand.username}`);
    loadData();
    return res;
  };

  const metrics = dashboardData?.metrics || {
    open_positions: 4,
    saved_candidates: 2,
    assessments_sent: 3,
    upcoming_interviews: 3,
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col">
      <TopNav />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* Breadcrumb & Recruiter Brand Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <Breadcrumb items={[{ label: "Recruiter Portal", href: "/recruiter" }, { label: "Enterprise Dashboard" }]} />
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Recruiter Dashboard</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  <Cpu className="w-3 h-3 text-brand-600" />
                  Deterministic Match Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Verified candidate intelligence powered by compiler AST audits, GPG attributions, and deterministic skill scoring.
              </p>
            </div>

            {/* Quick Actions / Link to Talent Search & Assessments */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              <Link
                href="/recruiter/assessments"
                className="px-3 py-2 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-neutral-500" />
                <span>Assessments Hub</span>
              </Link>
              <Link
                href="/recruiter/talent"
                className="px-3.5 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Verified Talent</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Toast Notification */}
          {activeToast && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{activeToast}</span>
            </div>
          )}

          {/* COMPACT METRICS BAR */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Metric 1: Open Positions */}
              <div className="p-4 rounded-lg bg-white border border-border shadow-xs hover:border-neutral-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Open Positions
                  </span>
                  <div className="p-1.5 rounded-md bg-brand-50 text-brand-600 border border-brand-200">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-neutral-900">
                    {metrics.open_positions}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                  63 verified applications
                </div>
              </div>

              {/* Metric 2: Saved Candidates */}
              <div className="p-4 rounded-lg bg-white border border-border shadow-xs hover:border-neutral-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Saved Candidates
                  </span>
                  <div className="p-1.5 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
                    <Bookmark className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-neutral-900">
                    {metrics.saved_candidates}
                  </span>
                  <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-medium">
                    Shortlisted
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Ready for evaluation
                </div>
              </div>

              {/* Metric 3: Assessments Sent */}
              <div className="p-4 rounded-lg bg-white border border-border shadow-xs hover:border-neutral-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Assessments Sent
                  </span>
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
                    <Send className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-neutral-900">
                    {metrics.assessments_sent}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-medium">
                    Dispatched
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                  97.4% completion rate
                </div>
              </div>

              {/* Metric 4: Upcoming Interviews */}
              <div className="p-4 rounded-lg bg-white border border-border shadow-xs hover:border-neutral-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-medium">
                    Upcoming Interviews
                  </span>
                  <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Video className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-neutral-900">
                    {metrics.upcoming_interviews}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                    Jitsi Ready
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Scheduled next 48h
                </div>
              </div>

            </div>
          </section>

          {/* SECTION: Recommended Candidates */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <span>Recommended Candidates</span>
                </h2>
                <p className="text-xs text-neutral-500">
                  Algorithmic matches scored deterministically against active engineering job requirements.
                </p>
              </div>
              <Link
                href="/recruiter/talent"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
              >
                <span>View all in Talent Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {(dashboardData?.recommended_candidates || []).map((cand) => {
                const gradeStyle = getGradeBadgeStyle(cand.overall_grade);
                return (
                  <div
                    key={cand.id}
                    className="p-4 rounded-lg bg-white border border-border hover:border-neutral-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                  >
                    {/* Left: Avatar & Basic Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={cand.avatar_url}
                        alt={cand.name}
                        className="w-12 h-12 rounded-full border border-border object-cover shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-neutral-900 truncate">{cand.name}</h3>
                          <span className="font-mono text-xs text-neutral-500">@{cand.username}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                            Grade {cand.overall_grade}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                            Level {cand.level}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 truncate">{cand.headline}</p>
                        
                        {/* Skills & Badges compact inline */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          {cand.top_skills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-canvas border border-border text-neutral-700">
                              {s.skill_name} <strong className="text-brand-700 font-bold">{s.score}</strong>
                            </span>
                          ))}
                          <span className="text-[11px] font-mono text-neutral-500">
                            • {cand.verified_projects_count} verified projects
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Job Match & Actions */}
                    <div className="flex items-center gap-3.5 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-base font-mono font-bold text-emerald-700 flex items-center justify-end gap-1">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{cand.job_match}% Match</span>
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">Deterministic Score</div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
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
                          <span className="hidden sm:inline">Assessment</span>
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
                  </div>
                );
              })}
            </div>
          </section>

          {/* GRID: Recent Applications & Upcoming Interviews */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
            
            {/* Left Col (7 cols): Recent Applications */}
            <section className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    <span>Recent Applications</span>
                  </h2>
                  <p className="text-xs text-neutral-500">Direct applicant queue with deterministic match rankings.</p>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  {(dashboardData?.recent_applications || []).length} applicants
                </span>
              </div>

              <div className="bg-white border border-border rounded-lg overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 font-mono text-[11px] border-b border-border">
                      <tr>
                        <th className="p-3 font-semibold">Candidate</th>
                        <th className="p-3 font-semibold">Position</th>
                        <th className="p-3 font-semibold">Match</th>
                        <th className="p-3 font-semibold">Reputation</th>
                        <th className="p-3 font-semibold">Stage</th>
                        <th className="p-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {(dashboardData?.recent_applications || []).map((app) => (
                        <tr key={app.id} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="p-3 font-medium text-neutral-900">
                            <div>
                              <div className="font-bold">{app.candidate_name}</div>
                              <span className="text-[11px] font-mono text-neutral-500">@{app.candidate_username}</span>
                            </div>
                          </td>
                          <td className="p-3 text-neutral-700">
                            <div className="truncate max-w-[180px] font-medium">{app.role_title}</div>
                            <span className="text-[10px] text-neutral-500 font-mono">{app.applied_date}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-700">
                            {app.match_score}%
                          </td>
                          <td className="p-3 font-mono">
                            <span className="text-brand-700 font-bold">Tier {app.overall_grade}</span>
                            <span className="text-neutral-500 block text-[10px]">Lvl {app.level}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-100 text-neutral-700 border border-neutral-200 font-semibold">
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() =>
                                handleOpenDetail({
                                  id: app.id,
                                  username: app.candidate_username,
                                  name: app.candidate_name,
                                  headline: app.role_title,
                                  avatar_url: `https://avatars.githubusercontent.com/u/${app.candidate_username.length * 100000}?v=4`,
                                  level: app.level,
                                  overall_grade: app.overall_grade,
                                  top_skills: [],
                                  badges: [],
                                  verified_projects_count: 5,
                                  collaboration_score: 85,
                                  location: "San Francisco / Remote",
                                  availability: "Available for Hire",
                                  education: "Stanford University",
                                  assessment_score: 92,
                                  role_category: "Engineering",
                                  job_match: app.match_score,
                                  is_saved: false,
                                })
                              }
                              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Right Col (5 cols): Upcoming Interviews */}
            <section className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-brand-600" />
                    <span>Upcoming Interviews</span>
                  </h2>
                  <p className="text-xs text-neutral-500">Scheduled WebRTC video evaluation rooms.</p>
                </div>
                <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Jitsi Ready
                </span>
              </div>

              <div className="space-y-3">
                {(dashboardData?.upcoming_interviews || []).map((interview) => (
                  <div
                    key={interview.id}
                    className="p-3.5 rounded-lg bg-white border border-border hover:border-neutral-300 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={interview.avatar_url}
                          alt={interview.candidate_name}
                          className="w-10 h-10 rounded-full border border-border object-cover"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">{interview.candidate_name}</h4>
                          <span className="text-[11px] text-neutral-500 font-mono block truncate max-w-[200px]">
                            {interview.role_title}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        {interview.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-1 text-neutral-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{interview.date_time}</span>
                      </div>
                      <span className="text-neutral-400">Host: {interview.interviewer}</span>
                    </div>

                    <a
                      href={interview.jitsi_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Jitsi Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </section>

          </div>

        </main>
      </div>

      {/* Shared Modals */}
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

      {assessmentModalCand && (
        <SendAssessmentModal
          isOpen={!!assessmentModalCand}
          onClose={() => setAssessmentModalCand(null)}
          candidateUsername={assessmentModalCand.username}
          candidateName={assessmentModalCand.name}
          onConfirm={handleSendAssessment}
        />
      )}

      {interviewModalCand && (
        <InterviewModal
          isOpen={!!interviewModalCand}
          onClose={() => setInterviewModalCand(null)}
          candidateUsername={interviewModalCand.username}
          candidateName={interviewModalCand.name}
          defaultRoleTitle={interviewModalCand.role}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
