"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  getCandidateAssessment,
  submitCandidateAssessment,
} from "@/lib/api-client";
import type {
  AssessmentDefinition,
  AssessmentQuestion,
} from "@/lib/types";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Building,
  HelpCircle,
  FileCheck2,
  Play,
  RotateCcw,
  Check,
} from "lucide-react";

export default function CandidateTakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<AssessmentDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getCandidateAssessment(id);
        setAssessment(data);
        setSecondsRemaining(data.duration_minutes * 60);
      } catch (err) {
        console.error("Failed to load candidate assessment:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!isStarted || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, secondsRemaining]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectSingle = (qId: string, option: string) => {
    setAnswers({ ...answers, [qId]: [option] });
  };

  const handleToggleMultiple = (qId: string, option: string) => {
    const currentList: string[] = answers[qId] || [];
    const updated = currentList.includes(option)
      ? currentList.filter((o) => o !== option)
      : [...currentList, option];
    setAnswers({ ...answers, [qId]: updated });
  };

  const handleShortAnswer = (qId: string, text: string) => {
    setAnswers({ ...answers, [qId]: text });
  };

  const handleFinalSubmit = async () => {
    if (!assessment) return;
    setIsSubmitting(true);
    try {
      const elapsedSeconds = assessment.duration_minutes * 60 - secondsRemaining;
      const res = await submitCandidateAssessment(assessment.id, {
        candidate_username: "alexchen",
        candidate_name: "Alex Chen",
        candidate_avatar: "https://avatars.githubusercontent.com/u/1024025?v=4",
        answers,
        completion_time_seconds: Math.max(30, elapsedSeconds),
      });
      router.push(`/assessments/result/${res.id}`);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-600 flex items-center justify-center font-mono text-xs">
        Loading proctored assessment benchmark...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-base font-semibold text-neutral-900">Assessment not found</h2>
        <Link href="/assessments" className="text-brand-600 text-xs mt-2 underline">
          Back to Assessments
        </Link>
      </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] && (Array.isArray(answers[k]) ? answers[k].length > 0 : String(answers[k]).trim() !== "")
  ).length;

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col font-sans">
      <TopNav />

      {/* Assessment Lobby (Candidate sees Title, Company, Duration, Instructions) */}
      {!isStarted ? (
        <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center">
          <div className="p-6 sm:p-8 rounded-lg bg-white border border-border space-y-6 shadow-xs">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-medium text-brand-700 uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-brand-600" />
                <span>{assessment.company} Proctored Evaluation</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{assessment.title}</h1>
              <p className="text-xs font-mono text-neutral-500">
                Target Role: <span className="text-neutral-800 font-semibold">{assessment.job_title}</span>
              </p>
            </div>

            {/* Assessment Meta Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-canvas border border-border text-center">
                <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="text-xs font-mono text-neutral-500 block">Duration</span>
                <span className="text-sm font-mono font-semibold text-neutral-900">
                  {assessment.duration_minutes} Minutes
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-canvas border border-border text-center">
                <FileCheck2 className="w-4 h-4 text-brand-600 mx-auto mb-1" />
                <span className="text-xs font-mono text-neutral-500 block">Questions</span>
                <span className="text-sm font-mono font-semibold text-neutral-900">
                  {questions.length} Items
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-canvas border border-border text-center col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-xs font-mono text-neutral-500 block">Passing Score</span>
                <span className="text-sm font-mono font-semibold text-emerald-700">
                  {assessment.passing_score_pct}% Minimum
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-lg bg-neutral-50 border border-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 font-mono uppercase">
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <span>Instructions & Testing Protocols</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {assessment.instructions}
              </p>
              <ul className="list-disc list-inside text-[11px] text-neutral-600 space-y-1 pt-1 font-mono">
                <li>A real-time countdown timer runs throughout the session.</li>
                <li>You can jump between questions using the question navigation grid.</li>
                <li>Objective questions are scored automatically upon submission.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/assessments"
                className="px-4 py-2 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors shadow-xs"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => setIsStarted(true)}
                className="px-5 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Assessment</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Active Assessment Session */
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col space-y-5">
          
          {/* Top Bar: Title, Company, Timer, Progress */}
          <div className="p-4 rounded-lg bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-brand-600" />
                <span>{assessment.company} • {assessment.assessment_type}</span>
              </div>
              <h2 className="text-base font-semibold text-neutral-900">{assessment.title}</h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Real-time Countdown Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 font-mono text-amber-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold">{formatTime(secondsRemaining)}</span>
                <span className="text-[10px] uppercase text-amber-700 font-medium">Remaining</span>
              </div>

              <button
                onClick={() => setConfirmSubmitModal(true)}
                className="px-3.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Test</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Left Col (8 cols): Question Container */}
            <div className="md:col-span-8 space-y-4">
              {currentQ && (
                <div className="p-6 rounded-lg bg-white border border-border space-y-5 shadow-xs min-h-[380px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-xs font-mono font-semibold text-brand-700 uppercase">
                        Question {currentIndex + 1} of {questions.length}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {currentQ.points} Points • {currentQ.question_type.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed">
                      {currentQ.question_text}
                    </h3>

                    {/* Single-choice Options */}
                    {currentQ.question_type === "single_choice" && (
                      <div className="space-y-2.5 pt-2">
                        {currentQ.options.map((opt, optIdx) => {
                          const isSelected = (answers[currentQ.id] || [])[0] === opt;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectSingle(currentQ.id, opt)}
                              className={`w-full text-left p-3 rounded-md border text-xs font-medium transition-all flex items-center gap-3 ${
                                isSelected
                                  ? "bg-brand-50/70 border-brand-500 text-neutral-900 shadow-xs"
                                  : "bg-white border-border text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-brand-600 bg-brand-600 text-white"
                                    : "border-neutral-300"
                                }`}
                              >
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Multiple-choice Options */}
                    {currentQ.question_type === "multiple_choice" && (
                      <div className="space-y-2.5 pt-2">
                        <span className="text-[11px] font-mono text-neutral-500 block mb-1">
                          Select all that apply:
                        </span>
                        {currentQ.options.map((opt, optIdx) => {
                          const currentSelected = answers[currentQ.id] || [];
                          const isSelected = currentSelected.includes(opt);
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleToggleMultiple(currentQ.id, opt)}
                              className={`w-full text-left p-3 rounded-md border text-xs font-medium transition-all flex items-center gap-3 ${
                                isSelected
                                  ? "bg-brand-50/70 border-brand-500 text-neutral-900 shadow-xs"
                                  : "bg-white border-border text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "border-brand-600 bg-brand-600 text-white"
                                    : "border-neutral-300"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Short Answer Textarea */}
                    {currentQ.question_type === "short_answer" && (
                      <div className="space-y-2 pt-2">
                        <textarea
                          rows={5}
                          value={answers[currentQ.id] || ""}
                          onChange={(e) => handleShortAnswer(currentQ.id, e.target.value)}
                          placeholder="Type your explanation / technical answer here..."
                          className="w-full p-3 rounded-md bg-white border border-border text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                        />
                        <span className="text-[10px] font-mono text-neutral-500 block">
                          Provide concise technical rationale addressing the invariant principles.
                        </span>
                      </div>
                    )}

                    {/* Coding Question Type */}
                    {currentQ.question_type === "coding" && (
                      <div className="space-y-3 pt-2">
                        {/* Sandbox Status Badge */}
                        <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-mono font-bold text-[11px]">Sandbox Status: NOT CONFIGURED</span>
                          </div>
                          <span className="text-[10px] text-amber-700 font-mono">Untrusted host execution disabled</span>
                        </div>

                        {/* Examples & Constraints */}
                        {currentQ.examples && currentQ.examples.length > 0 && (
                          <div className="p-3 rounded bg-canvas border border-border text-xs space-y-1.5 font-mono">
                            <span className="font-bold text-[10px] uppercase text-neutral-500 block">Example 1</span>
                            <div className="text-neutral-700"><strong>Input:</strong> {currentQ.examples[0].input}</div>
                            <div className="text-neutral-700"><strong>Output:</strong> {currentQ.examples[0].output}</div>
                            {currentQ.examples[0].explanation && (
                              <div className="text-neutral-500 text-[11px]"><em>{currentQ.examples[0].explanation}</em></div>
                            )}
                          </div>
                        )}

                        {/* Constraints list */}
                        {currentQ.constraints && currentQ.constraints.length > 0 && (
                          <div className="text-[11px] font-mono text-neutral-600 bg-white p-2 rounded border border-border">
                            <span className="font-bold text-[10px] uppercase text-neutral-500 block mb-1">Constraints</span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {currentQ.constraints.map((c, cIdx) => (
                                <li key={cIdx}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Code Editor */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono text-neutral-600">
                            <span>Python 3 Solution</span>
                            <span className="text-[10px] text-neutral-400">Time limit: {currentQ.time_limit || 2.0}s</span>
                          </div>
                          <textarea
                            rows={8}
                            value={
                              typeof answers[currentQ.id] === "object"
                                ? answers[currentQ.id]?.code || ""
                                : answers[currentQ.id] || currentQ.starter_code?.python || ""
                            }
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [currentQ.id]: { language: "python", code: e.target.value }
                              })
                            }
                            placeholder="def solution():\n    # Implement solution\n    pass"
                            className="w-full p-3 rounded-md bg-neutral-950 border border-neutral-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-brand-500 shadow-inner"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Previous / Next Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <button
                      type="button"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                      className="px-3.5 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex(currentIndex + 1)}
                        className="px-4 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmSubmitModal(true)}
                        className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Final Test</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col (4 cols): Question Navigation Grid */}
            <div className="md:col-span-4 space-y-4">
              <div className="p-5 rounded-lg bg-white border border-border space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-mono font-semibold text-neutral-900 uppercase">
                    Question Navigation
                  </span>
                  <span className="text-xs font-mono text-brand-700 font-semibold">
                    {answeredCount}/{questions.length} Answered
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered =
                      answers[q.id] &&
                      (Array.isArray(answers[q.id])
                        ? answers[q.id].length > 0
                        : String(answers[q.id]).trim() !== "");
                    const isCurrent = idx === currentIndex;

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`p-2 rounded-md font-mono text-xs font-semibold transition-all border ${
                          isCurrent
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : isAnswered
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                            : "bg-white border-border text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border text-[11px] font-mono text-neutral-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-neutral-900 inline-block" />
                    <span>Current Question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-300 inline-block" />
                    <span>Answered Question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-white border border-border inline-block" />
                    <span>Unanswered Question</span>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmSubmitModal(true)}
                  className="w-full py-2 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 pt-2 border border-border"
                >
                  <Send className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Submit Assessment</span>
                </button>
              </div>
            </div>

          </div>

          {/* Confirm Submit Modal */}
          {confirmSubmitModal && (
            <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white border border-border rounded-lg shadow-lg p-6 space-y-4">
                <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-600" />
                  Confirm Assessment Submission
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  You have completed <span className="font-semibold text-neutral-900">{answeredCount} of {questions.length}</span> questions. Once submitted, your answers will be evaluated by the automated scoring engine.
                </p>

                {answeredCount < questions.length && (
                  <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>You have {questions.length - answeredCount} unanswered question(s).</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => setConfirmSubmitModal(false)}
                    className="px-3.5 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium shadow-xs"
                  >
                    Keep Working
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-4 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Scoring Test..." : "Yes, Submit Now"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      )}
    </div>
  );
}
