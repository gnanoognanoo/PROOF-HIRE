"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getSubmissionResult } from "@/lib/api-client";
import type { AssessmentSubmissionRecord } from "@/lib/types";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  Share2,
  Lock,
  Cpu,
  HelpCircle,
  FileCheck2,
} from "lucide-react";

export default function AssessmentResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const submissionId = params?.submissionId as string;
  const asRecruiter = searchParams.get("as_recruiter") === "true";

  const [result, setResult] = useState<AssessmentSubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!submissionId) return;
      setIsLoading(true);
      try {
        const data = await getSubmissionResult("", submissionId, asRecruiter);
        setResult(data);
      } catch (err) {
        console.error("Failed to load result:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [submissionId, asRecruiter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-100 flex items-center justify-center font-mono text-xs">
        Loading verified assessment certificate & score...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-base font-bold text-neutral-200">Assessment submission not found</h2>
        <Link href="/assessments" className="text-brand-400 text-xs mt-2 underline">
          Back to Assessments
        </Link>
      </div>
    );
  }

  const isPassed = result.status === "PASSED";

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col font-sans">
      <TopNav />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/assessments"
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assessments</span>
          </Link>
          <div className="text-xs font-mono text-neutral-500">
            ID: {result.id} • Proctored
          </div>
        </div>

        {/* HERO SCORE CARD */}
        <div className="p-6 sm:p-8 rounded-lg bg-white border border-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-brand-700 uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-brand-600" />
                <span>{result.company} Verified Benchmark</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-1">
                {result.assessment_title}
              </h1>
              <p className="text-xs font-mono text-neutral-500 mt-0.5">
                Target Role: <span className="text-neutral-800 font-semibold">{result.job_title}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-md text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 border ${
                  isPassed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <span>{result.status}</span>
              </span>
            </div>
          </div>

          {/* Compact 4 Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-4 rounded-lg bg-canvas border border-border text-center">
              <span className="text-[11px] text-neutral-500 uppercase block font-medium">Score Achieved</span>
              <span className="text-2xl font-bold text-neutral-900 mt-1 block">
                {result.score} <span className="text-xs text-neutral-500 font-normal">/ {result.total_points}</span>
              </span>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-border text-center">
              <span className="text-[11px] text-neutral-500 uppercase block font-medium">Percentage</span>
              <span
                className={`text-2xl font-bold mt-1 block ${
                  isPassed ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.percentage}%
              </span>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-border text-center">
              <span className="text-[11px] text-neutral-500 uppercase block font-medium">Passing Threshold</span>
              <span className="text-2xl font-bold text-neutral-700 mt-1 block">
                {result.passing_score_pct}%
              </span>
            </div>

            <div className="p-4 rounded-lg bg-canvas border border-border text-center">
              <span className="text-[11px] text-neutral-500 uppercase block font-medium">Completion Time</span>
              <span className="text-2xl font-bold text-brand-700 mt-1 block">
                {result.completion_time_formatted}
              </span>
            </div>
          </div>

          {/* Candidate & Verification Attestation */}
          <div className="p-4 rounded-lg bg-neutral-50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <img
                src={result.candidate_avatar}
                alt={result.candidate_name}
                className="w-9 h-9 rounded-full border border-border object-cover"
              />
              <div>
                <span className="text-neutral-900 font-semibold block">{result.candidate_name}</span>
                <span className="text-neutral-500 text-[11px]">@{result.candidate_username}</span>
              </div>
            </div>

            <div className="text-neutral-600 flex items-center gap-1.5 sm:text-right">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Attested by ProofHire Sentinel Engine</span>
            </div>
          </div>
        </div>

        {/* DETAILED QUESTION BREAKDOWN (With Answer Privacy Rule) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              Itemized Evaluation Breakdown
            </h2>

            {/* Answer Privacy Banner */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              {result.show_correct_answers ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" /> Answers Revealed by Recruiter
                </span>
              ) : (
                <span className="text-amber-800 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" /> Answers Kept Confidential by {result.company}
                </span>
              )}
            </div>
          </div>

          {!result.show_correct_answers && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                To protect evaluation integrity and benchmark security, detailed answer keys and explanations are confidential. Only scores and pass/fail indicators are shown.
              </span>
            </div>
          )}

          <div className="space-y-3">
            {result.scored_questions.map((q, idx) => (
              <div
                key={idx}
                className="p-5 rounded-lg bg-white border border-border space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-medium text-neutral-500 uppercase block">
                      Question #{idx + 1} • {q.question_type.replace("_", " ")}
                    </span>
                    <h3 className="text-sm font-semibold text-neutral-900 mt-1">
                      {q.question_text}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                        q.is_correct
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {q.points_awarded} / {q.max_points} pts
                    </span>
                  </div>
                </div>

                {/* Candidate Answer */}
                <div className="p-3 rounded-md bg-canvas border border-border text-xs font-mono space-y-1">
                  <span className="text-neutral-500 text-[11px] block">Your Answer:</span>
                  <div className="text-neutral-900 font-medium">
                    {Array.isArray(q.candidate_answer)
                      ? q.candidate_answer.join(", ")
                      : String(q.candidate_answer || "No response provided")}
                  </div>
                </div>

                {/* Revealed Correct Answer & Explanation (Only if recruiter enables it) */}
                {result.show_correct_answers && (
                  <div className="p-3 rounded-md bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                    <div>
                      <span className="text-emerald-800 font-mono text-[11px] font-semibold block">
                        Correct Answer Key:
                      </span>
                      <div className="text-emerald-900 font-mono font-medium">
                        {Array.isArray(q.correct_answers)
                          ? q.correct_answers.join(", ")
                          : String(q.correct_answers || "—")}
                      </div>
                    </div>
                    {q.explanation && (
                      <p className="text-neutral-700 text-[11px] pt-1.5 border-t border-emerald-200">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
