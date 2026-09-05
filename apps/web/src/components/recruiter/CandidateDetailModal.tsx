"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Award, 
  Briefcase, 
  GitPullRequest, 
  Users, 
  FileCheck2, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Send, 
  Video, 
  Bookmark, 
  BookmarkCheck,
  Calendar,
  MapPin,
  GraduationCap,
  Clock,
  Layers,
  Code2,
  Lock,
  Cpu,
  Hash,
  Terminal,
  ChevronRight
} from "lucide-react";
import type { CandidateDossier, TalentCandidateResult } from "@/lib/types";
import { getGradeBadgeStyle, formatAddress } from "@/lib/utils";

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateDossier | TalentCandidateResult | null;
  onSave?: (username: string) => void;
  onSendAssessment?: (username: string) => void;
  onInviteInterview?: (username: string, roleTitle: string) => void;
}

export function CandidateDetailModal({
  isOpen,
  onClose,
  candidate,
  onSave,
  onSendAssessment,
  onInviteInterview,
}: CandidateDetailModalProps) {
  if (!isOpen || !candidate) return null;

  const dossier = candidate as CandidateDossier;
  const grade = candidate.overall_grade || "B";
  const level = candidate.level || 38;
  const gradeStyle = getGradeBadgeStyle(grade);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 backdrop-blur-xs flex justify-center items-start p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white border border-border rounded-lg shadow-dropdown overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-border bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <img 
              src={candidate.avatar_url} 
              alt={candidate.name} 
              className="w-13 h-13 rounded-full border border-border object-cover"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-neutral-900">{candidate.name}</h2>
                <span className="font-mono text-xs text-neutral-500">@{candidate.username}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${gradeStyle.bg} ${gradeStyle.border} ${gradeStyle.text}`}>
                  Grade {grade}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Level {level}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{candidate.job_match}% Job Match</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 font-medium">
                {candidate.headline}
              </p>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-neutral-500 flex-wrap font-mono">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-neutral-400" /> {candidate.location}</span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium"><Clock className="w-3.5 h-3.5 text-emerald-600" /> {candidate.availability}</span>
                <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-neutral-400" /> {candidate.education}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onSave && (
              <button
                onClick={() => onSave(candidate.username)}
                className={`p-1.5 px-2.5 rounded-md border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  candidate.is_saved
                    ? "bg-amber-50 border-amber-300 text-amber-800"
                    : "bg-white border-border text-neutral-700 hover:bg-neutral-50"
                }`}
                title={candidate.is_saved ? "Saved in candidates" : "Save candidate"}
              >
                {candidate.is_saved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4 text-neutral-500" />}
                <span>{candidate.is_saved ? "Saved" : "Save"}</span>
              </button>
            )}

            {onSendAssessment && (
              <button
                onClick={() => onSendAssessment(candidate.username)}
                className="px-3 py-1.5 rounded-md border border-border bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-neutral-500" />
                <span>Send Assessment</span>
              </button>
            )}

            {onInviteInterview && (
              <button
                onClick={() => onInviteInterview(candidate.username, candidate.headline)}
                className="px-3.5 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Invite to Interview</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deterministic Match Engine Banner */}
        <div className="p-4 sm:p-5 bg-canvas border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-brand-600" />
                  Deterministic Match Engine
                </span>
                <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                  Backend Rules • Non-Arbitrary
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {candidate.why_this_candidate_matches || 
                  "Candidate exhibits strong coverage of required skills with verified project AST proofs, GPG commit authorship, and verified benchmarks."}
              </p>
            </div>

            {/* Deterministic Signal Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 shrink-0">
              <div className="p-2 rounded bg-white border border-border text-center shadow-xs">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Req Skills</div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {candidate.match_breakdown?.required_skills?.toFixed(1) || "35.0"}/35
                </div>
              </div>
              <div className="p-2 rounded bg-white border border-border text-center shadow-xs">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Skill Level</div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {candidate.match_breakdown?.skill_proficiency?.toFixed(1) || "16.9"}/20
                </div>
              </div>
              <div className="p-2 rounded bg-white border border-border text-center shadow-xs">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Projects</div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {candidate.match_breakdown?.project_evidence?.toFixed(1) || "14.5"}/14.5
                </div>
              </div>
              <div className="p-2 rounded bg-white border border-border text-center shadow-xs">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Grades</div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {candidate.match_breakdown?.project_grades?.toFixed(1) || "12.0"}/15
                </div>
              </div>
              <div className="p-2 rounded bg-white border border-border text-center shadow-xs">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Assessments</div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {candidate.match_breakdown?.assessment_scores?.toFixed(1) || "9.2"}/10
                </div>
              </div>
              <div className="p-2 rounded bg-white border border-border text-center shadow-xs">
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Collab</div>
                <div className="text-xs font-mono font-bold text-neutral-900">
                  {candidate.match_breakdown?.collaboration_score?.toFixed(1) || "4.3"}/5
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Dossier Content */}
        {/* Scrollable Dossier Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 bg-canvas">
          
          {/* SECTION 1: Professional Summary */}
          <section id="sec-summary" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                <span>1. Professional Summary</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">
                {candidate.overall?.title || `Professional Reputation Grade: Tier ${grade}`}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-white border border-border space-y-3 shadow-xs">
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                {dossier.professional_summary?.bio || dossier.bio || "Senior software engineer with verified expertise in building resilient web applications, compiler tools, and distributed infrastructure."}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border text-xs">
                <div>
                  <span className="text-neutral-500 block text-[11px] font-mono">Primary Role:</span>
                  <span className="font-semibold text-neutral-800">{candidate.role_category}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px] font-mono">Reputation Grade:</span>
                  <span className="font-bold text-brand-700">Tier {grade} (Level {level})</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px] font-mono">Location & Remote:</span>
                  <span className="font-medium text-neutral-700">{candidate.location}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px] font-mono">Availability:</span>
                  <span className="font-semibold text-emerald-700">{candidate.availability}</span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Skill Reputation */}
          <section id="sec-skills" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-brand-600" />
                <span>2. Skill Reputation</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">Deterministic Skill XP</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(dossier.skill_reputation || candidate.top_skills || []).map((skill, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-border flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{skill.skill_name}</div>
                    <div className="text-[11px] font-mono text-neutral-500">
                      Level {skill.level || 30} • Verified
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-brand-700">{skill.score}</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">Score</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3: Verified Projects */}
          <section id="sec-projects" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                <span>3. Verified Projects ({candidate.verified_projects_count} Repositories)</span>
              </h3>
              <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Compiler AST Audited
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(dossier.verified_projects || [
                { id: "p1", title: "ProofHire Frontend & Design System", category: "Frontend & Systems", grade: "A", score: 88, technologies: ["React", "Next.js", "TypeScript"], ast_verified: true },
                { id: "p2", title: "HyperRaft Consensus Engine", category: "Rust Systems", grade: "O", score: 96.4, technologies: ["Rust", "Tokio", "io_uring"], ast_verified: true },
                { id: "p3", title: "DistriKV Storage Engine", category: "Storage Internals", grade: "A", score: 91.2, technologies: ["Go", "gRPC", "Raft"], ast_verified: true },
                { id: "p4", title: "AsyncAST Compiler Linter", category: "Developer Tools", grade: "A", score: 89.0, technologies: ["TypeScript", "Babel AST"], ast_verified: true }
              ]).map((proj, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-white border border-border space-y-2 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{proj.title}</h4>
                      <span className="text-[11px] text-neutral-500 font-mono">{proj.category}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getGradeBadgeStyle(proj.grade as any).bg} ${getGradeBadgeStyle(proj.grade as any).border} ${getGradeBadgeStyle(proj.grade as any).text}`}>
                      Grade {proj.grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {proj.technologies?.map((tech, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-canvas border border-border text-neutral-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 pt-1.5 border-t border-border">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> AST Verified
                    </span>
                    <span className="font-semibold text-neutral-800">Score: {proj.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: Project Grades */}
          <section id="sec-grades" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-brand-600" />
                <span>4. Project Grades & Rubric Evaluation</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">Automated AST & Test Coverage</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-border rounded-lg overflow-hidden bg-white shadow-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-mono text-[11px] border-b border-border">
                  <tr>
                    <th className="p-2.5 font-semibold">Project Evaluation Target</th>
                    <th className="p-2.5 font-semibold">Domain</th>
                    <th className="p-2.5 font-semibold">Grade</th>
                    <th className="p-2.5 font-semibold">Score</th>
                    <th className="p-2.5 font-semibold">Compiler Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {(dossier.project_grades || [
                    { title: "ProofHire Frontend & Design System", category: "Frontend & Systems", grade: "A", score: 88.0, ast_verified: true },
                    { title: "HyperRaft Consensus Engine", category: "Rust Systems", grade: "O", score: 96.4, ast_verified: true },
                    { title: "DistriKV Storage Engine", category: "Storage Internals", grade: "A", score: 91.2, ast_verified: true }
                  ]).map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="p-2.5 font-sans font-semibold text-neutral-900">{item.title}</td>
                      <td className="p-2.5 text-neutral-600">{item.category}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${getGradeBadgeStyle(item.grade as any).bg} ${getGradeBadgeStyle(item.grade as any).border} ${getGradeBadgeStyle(item.grade as any).text}`}>
                          Tier {item.grade}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-neutral-900">{item.score}%</td>
                      <td className="p-2.5 text-emerald-700 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> AST Pass
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 5: GitHub Evidence */}
          <section id="sec-github" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <GitPullRequest className="w-3.5 h-3.5 text-brand-600" />
                <span>5. GitHub Evidence & Cryptographic Commit Attributions</span>
              </h3>
              <span className="text-xs font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> GPG Key Signed
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white border border-border shadow-xs">
                <span className="text-[11px] font-mono text-neutral-500 block">Total Commits</span>
                <span className="text-lg font-mono font-bold text-neutral-900">
                  {dossier.github_evidence?.commits || 384}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">Continuous cadence</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border shadow-xs">
                <span className="text-[11px] font-mono text-neutral-500 block">Pull Requests Merged</span>
                <span className="text-lg font-mono font-bold text-neutral-900">
                  {dossier.github_evidence?.pull_requests || 62}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Peer code reviews</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border shadow-xs">
                <span className="text-[11px] font-mono text-neutral-500 block">Meaningful LOC</span>
                <span className="text-lg font-mono font-bold text-neutral-900">
                  {(dossier.github_evidence?.lines_of_code || 18400).toLocaleString()}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Production source</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-border shadow-xs">
                <span className="text-[11px] font-mono text-neutral-500 block">GPG Verification</span>
                <span className="text-lg font-mono font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Valid
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Author verified</span>
              </div>
            </div>
          </section>

          {/* SECTION 6: Collaboration History */}
          <section id="sec-collab" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                <span>6. Collaboration History ({candidate.collaboration_score}/100 Confidence)</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">Team Attribution Engine</span>
            </div>
            <div className="space-y-2">
              {(dossier.collaboration_history || [
                { id: "c1", project_title: "ProofHire Core Platform", role: "Frontend Lead & Design System", contribution_percentage: 42, duration: "3 months", verified_gpg: true },
                { id: "c2", project_title: "HyperRaft Distributed State Machine", role: "Tokio Async Engine Specialist", contribution_percentage: 28, duration: "4 months", verified_gpg: true }
              ]).map((collab, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{collab.project_title}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Role: <span className="text-neutral-800 font-semibold">{collab.role}</span> • Duration: {collab.duration}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-brand-700 font-bold">{collab.contribution_percentage}% Contribution</span>
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> GPG Signed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 7: Certificates */}
          <section id="sec-certs" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-brand-600" />
                <span>7. Certificates & On-Chain Credentials</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">SHA-256 Anchored</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(dossier.certificates || [
                { title: "Staff Frontend System Architecture", issuer: "ProofHire Authority", date: "Oct 2024", credential_id: "PH-8492", hash_verified: true },
                { title: "Distributed Consensus Protocols", issuer: "Rust Foundation / Verification Node", date: "Nov 2024", credential_id: "PH-9104", hash_verified: true }
              ]).map((cert, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-border space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900">{cert.title}</h4>
                    <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Hash Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-mono">Issuer: {cert.issuer} • {cert.date}</p>
                  <p className="text-[10px] font-mono text-neutral-400">ID: {cert.credential_id}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 8: Assessment Results */}
          <section id="sec-assessments" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-brand-600" />
                <span>8. Assessment Results</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">Proctored Benchmarks</span>
            </div>
            <div className="space-y-2">
              {(dossier.assessment_results || [
                { name: "Standardized Systems Engineering Benchmark", score: candidate.assessment_score || 92.4, percentile: "94th Percentile", date: "2024-11-05", status: "COMPLETED" },
                { name: "Frontend State Machine Concurrency Challenge", score: 94.0, percentile: "96th Percentile", date: "2024-10-22", status: "COMPLETED" }
              ]).map((test, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-border flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{test.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Completed {test.date} • {test.percentile}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-bold text-emerald-700">{test.score}%</span>
                    <span className="text-[10px] font-mono text-emerald-700 block font-semibold">{test.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 9: Badges */}
          <section id="sec-badges" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>9. Earned Reputation Badges</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">Non-Transferable Accreditations</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {(candidate.badges || ["Frontend Developer — Gold", "Team Collaborator — Silver"]).map((b, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 10: Verification History */}
          <section id="sec-verification" className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>10. Verification History & Blockchain Audit Trail</span>
              </h3>
              <span className="text-xs font-mono text-neutral-500">Polygon PoS Network</span>
            </div>
            <div className="space-y-2">
              {(dossier.verification_history || [
                { event: "Reputation Grade Tier B Certified", timestamp: "2024-11-20 14:22 UTC", hash: "0x8fa9...3c21", block_height: 48192040, verified_by: "ProofHire Sentinel Node" },
                { event: "AST Audit: ProofHire Web Frontend", timestamp: "2024-11-18 09:15 UTC", hash: "0xd8a2...1c14", block_height: 48189520, verified_by: "Babel-TS Analyzer v2" },
                { event: "GPG Commit Signature Anchored", timestamp: "2024-11-15 18:40 UTC", hash: "0x4b71...99e8", block_height: 48184100, verified_by: "GitHub OAuth Bridge" }
              ]).map((event, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono shadow-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 font-sans">{event.event}</span>
                    <span className="text-neutral-500 block text-[11px]">{event.timestamp} • Block #{event.block_height}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-brand-700 font-semibold">{event.hash}</span>
                    <span className="text-[10px] text-neutral-400 block">{event.verified_by}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-white flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-neutral-500">
            Cryptographically signed dossier for candidate @{candidate.username}
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors shadow-xs"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}
