"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  getRecruiterAssessments,
  createRecruiterAssessment,
  getAssessmentSubmissions,
  toggleAssessmentAnswers,
} from "@/lib/api-client";
import type {
  AssessmentDefinition,
  AssessmentSubmissionRecord,
  AssessmentCategoryType,
  AssessmentQuestionType,
} from "@/lib/types";
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";

export default function RecruiterAssessmentsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "create" | "submissions">("active");
  const [assessments, setAssessments] = useState<AssessmentDefinition[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Form State for creating assessment
  const [title, setTitle] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentCategoryType>("Technical MCQ");
  const [jobTitle, setJobTitle] = useState("Staff Frontend & Compiler Architect");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [passingScorePct, setPassingScorePct] = useState(80);
  const [instructions, setInstructions] = useState(
    "Complete all questions before the countdown timer expires. Objective questions are graded automatically upon submission."
  );
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [questions, setQuestions] = useState<
    Array<{
      question_text: string;
      question_type: AssessmentQuestionType;
      options: string[];
      correct_answers: string[];
      points: number;
      explanation: string;
    }>
  >([
    {
      question_text: "Which React 19 hook allows form actions with automatic pending transitions?",
      question_type: "single_choice",
      options: ["useOptimistic", "useActionState", "useTransition", "useFormStatus"],
      correct_answers: ["useActionState"],
      points: 10,
      explanation: "useActionState accepts an action handler and returns [state, formAction, isPending].",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setActiveToast(msg);
    setTimeout(() => setActiveToast(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getRecruiterAssessments();
      setAssessments(res.assessments);

      // Load all submissions
      const allSubs: AssessmentSubmissionRecord[] = [];
      for (const a of res.assessments) {
        try {
          const subRes = await getAssessmentSubmissions(a.id);
          allSubs.push(...subRes.submissions);
        } catch (e) {}
      }
      setSubmissions(allSubs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "single_choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_answers: ["Option A"],
        points: 10,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createRecruiterAssessment({
        title,
        assessment_type: assessmentType,
        job_title: jobTitle,
        duration_minutes: durationMinutes,
        passing_score_pct: passingScorePct,
        instructions,
        show_correct_answers: showCorrectAnswers,
        questions,
      });
      showToast(`Created assessment: "${title}"`);
      // Reset form
      setTitle("");
      setActiveTab("active");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to create assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAnswers = async (id: string) => {
    try {
      const res = await toggleAssessmentAnswers(id);
      setAssessments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, show_correct_answers: res.show_correct_answers } : a))
      );
      setSubmissions((prev) =>
        prev.map((s) => (s.assessment_id === id ? { ...s, show_correct_answers: res.show_correct_answers } : s))
      );
      showToast(
        res.show_correct_answers
          ? "Correct answers are now visible to candidates upon test completion"
          : "Correct answers are now confidential and hidden from candidates"
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col font-sans">
      <TopNav />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <Breadcrumb
                items={[
                  { label: "Recruiter Portal", href: "/recruiter" },
                  { label: "Assessment Management & Scoring" },
                ]}
              />
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Assessments & Proctored Tests
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-50 text-brand-700 border border-brand-200">
                  <Cpu className="w-3 h-3 text-brand-600" />
                  Auto-Scoring Engine Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                Create custom evaluations, automated MCQs, and track candidate submissions with confidential answer control.
              </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 bg-neutral-100 border border-border p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "active"
                    ? "bg-white text-neutral-900 shadow-xs border border-border/80 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Active Tests ({assessments.length})
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "create"
                    ? "bg-white text-neutral-900 shadow-xs border border-border/80 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Test</span>
              </button>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === "submissions"
                    ? "bg-white text-neutral-900 shadow-xs border border-border/80 font-semibold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Candidate Submissions ({submissions.length})</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {activeToast && (
            <div className="p-3 rounded-md bg-brand-50 border border-brand-200 text-brand-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{activeToast}</span>
            </div>
          )}

          {/* TAB 1: Active Assessments */}
          {activeTab === "active" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-500">
                  {assessments.length} assessment modules deployed across open requisitions
                </span>
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Assessment</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assessments.map((a) => (
                  <div
                    key={a.id}
                    className="p-5 rounded-lg bg-white border border-border hover:border-neutral-300 transition-all space-y-4 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-neutral-100 text-neutral-700 border border-neutral-200">
                          {a.assessment_type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleAnswers(a.id)}
                            className={`p-1.5 rounded-md text-xs transition-colors border ${
                              a.show_correct_answers
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                : "text-neutral-500 bg-white border-border hover:bg-neutral-50"
                            }`}
                            title={
                              a.show_correct_answers
                                ? "Answers visible to candidate. Click to hide."
                                : "Answers hidden from candidate. Click to reveal."
                            }
                          >
                            {a.show_correct_answers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-neutral-900 leading-snug">{a.title}</h3>
                      <p className="text-xs text-neutral-500 font-mono">Role: {a.job_title}</p>
                    </div>

                    <div className="p-3 rounded-md bg-canvas border border-border text-xs font-mono space-y-1.5 text-neutral-600">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-neutral-400" /> Duration:</span>
                        <span className="text-neutral-900 font-medium">{a.duration_minutes} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-neutral-400" /> Passing Score:</span>
                        <span className="text-emerald-700 font-semibold">{a.passing_score_pct}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-neutral-400" /> Submissions:</span>
                        <span className="text-brand-700 font-semibold">{a.submissions_count || 0}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-border text-[11px]">
                        <span>Answer Privacy:</span>
                        <span className={a.show_correct_answers ? "text-emerald-700 font-semibold" : "text-amber-700 font-medium"}>
                          {a.show_correct_answers ? "Revealed to Candidate" : "Confidential (Hidden)"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <Link
                        href={`/assessments/take/${a.id}`}
                        target="_blank"
                        className="w-full py-1.5 px-3 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Preview / Take Test</span>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Create Assessment */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateAssessment} className="p-6 rounded-lg bg-white border border-border space-y-6 shadow-xs">
              <div className="border-b border-border pb-4">
                <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Assessment Specification
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Define proctored candidate test parameters, passing threshold, and question rubric.
                </p>
              </div>

              {/* Assessment Type, Title & Job */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Assessment Type
                  </label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as any)}
                    className="w-full p-2 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  >
                    <option value="Aptitude Test">Aptitude Test</option>
                    <option value="Technical MCQ">Technical MCQ</option>
                    <option value="Custom Assessment">Custom Assessment</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React 19 & TypeScript Production Architecture MCQ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white border border-border text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Target Job
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={passingScorePct}
                    onChange={(e) => setPassingScorePct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                  Candidate Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                />
              </div>

              {/* Show Correct Answers Toggle */}
              <div className="p-3.5 rounded-md bg-neutral-50 border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-900">
                    Show Correct Answers to Candidate after Submission
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Keep disabled to protect test integrity and prevent answer leaks.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showCorrectAnswers}
                  onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                  className="h-4 w-4 rounded accent-brand-600 border-neutral-300"
                />
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-brand-600" />
                    Questions Rubric ({questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-neutral-50/50 border border-border space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-neutral-700">
                          Question #{idx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-neutral-400 hover:text-red-600 p-1"
                            title="Remove Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            required
                            placeholder="Enter question prompt..."
                            value={q.question_text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].question_text = e.target.value;
                              setQuestions(updated);
                            }}
                            className="w-full px-3 py-2 rounded-md bg-white border border-border text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                          />
                        </div>

                        <div>
                          <select
                            value={q.question_type}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].question_type = e.target.value as any;
                              setQuestions(updated);
                            }}
                            className="w-full p-2 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                          >
                            <option value="single_choice">Single-choice</option>
                            <option value="multiple_choice">Multiple-choice</option>
                            <option value="short_answer">Short answer</option>
                          </select>
                        </div>
                      </div>

                      {/* Options for single/multiple choice */}
                      {q.question_type !== "short_answer" && (
                        <div className="space-y-2 pt-2 border-t border-border">
                          <label className="block text-[11px] font-mono text-neutral-600">
                            Options (comma-separated):
                          </label>
                          <input
                            type="text"
                            placeholder="Option A, Option B, Option C, Option D"
                            value={q.options.join(", ")}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].options = e.target.value.split(",").map((s) => s.trim());
                              setQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                          />

                          <label className="block text-[11px] font-mono text-neutral-600 mt-2">
                            Correct Answer(s) (must match option exactly):
                          </label>
                          <input
                            type="text"
                            placeholder="Option A"
                            value={q.correct_answers.join(", ")}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].correct_answers = e.target.value
                                .split(",")
                                .map((s) => s.trim());
                              setQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                          />
                        </div>
                      )}

                      {/* Short answer criteria */}
                      {q.question_type === "short_answer" && (
                        <div className="pt-2 border-t border-border">
                          <label className="block text-[11px] font-mono text-neutral-600">
                            Required Key Concepts / Rubric Keywords (comma-separated):
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. type inference, preserves literal types, satisfies"
                            value={q.correct_answers.join(", ")}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].correct_answers = e.target.value
                                .split(",")
                                .map((s) => s.trim());
                              setQuestions(updated);
                            }}
                            className="w-full px-3 py-1.5 rounded-md bg-white border border-border text-neutral-900 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                          />
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <input
                          type="text"
                          placeholder="Explanation / Solution rationale (shown if recruiter reveals answers)..."
                          value={q.explanation}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].explanation = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-md bg-white border border-border text-neutral-600 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Form */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className="px-4 py-2 rounded-md bg-white border border-border hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Assessment..." : "Publish Assessment"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Candidate Submissions (Show Recruiter) */}
          {activeTab === "submissions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-600" />
                    Candidate Submissions & Automated Scores
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Graded automatically upon objective question completion.
                  </p>
                </div>
                <span className="text-xs font-mono text-neutral-500">
                  {submissions.length} total attempts
                </span>
              </div>

              <div className="bg-white border border-border rounded-lg overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-600 font-mono text-[11px] uppercase tracking-wider border-b border-border">
                      <tr>
                        <th className="p-3">Candidate</th>
                        <th className="p-3">Assessment</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Percentage</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Completion Time</th>
                        <th className="p-3">Answer Visibility</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-xs text-neutral-500 font-mono">
                            No candidate submissions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-neutral-50/75 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={sub.candidate_avatar}
                                  alt={sub.candidate_name}
                                  className="w-8 h-8 rounded-full border border-border object-cover"
                                />
                                <div>
                                  <div className="font-semibold text-neutral-900">{sub.candidate_name}</div>
                                  <div className="text-[11px] font-mono text-neutral-500">
                                    @{sub.candidate_username}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-medium text-neutral-900 max-w-[200px] truncate">
                                {sub.assessment_title}
                              </div>
                              <span className="text-[10px] font-mono text-neutral-500">{sub.job_title}</span>
                            </td>

                            <td className="p-3 font-mono font-semibold text-neutral-900">
                              {sub.score} / {sub.total_points}
                            </td>

                            <td className="p-3 font-mono font-semibold">
                              <span
                                className={sub.percentage >= sub.passing_score_pct ? "text-emerald-700" : "text-red-700"}
                              >
                                {sub.percentage}%
                              </span>
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                                  sub.status === "PASSED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {sub.status}
                              </span>
                            </td>

                            <td className="p-3 font-mono text-neutral-600">
                              {sub.completion_time_formatted}
                            </td>

                            <td className="p-3">
                              <button
                                onClick={() => handleToggleAnswers(sub.assessment_id)}
                                className={`px-2 py-1 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
                                  sub.show_correct_answers
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-white text-neutral-600 border-border hover:bg-neutral-50"
                                }`}
                              >
                                {sub.show_correct_answers ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{sub.show_correct_answers ? "Revealed" : "Hidden"}</span>
                              </button>
                            </td>

                            <td className="p-3 text-right">
                              <Link
                                href={`/assessments/result/${sub.id}?as_recruiter=true`}
                                target="_blank"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-border hover:bg-neutral-50 text-xs font-medium text-neutral-700 shadow-xs transition-colors"
                              >
                                <span>View Result</span>
                                <ExternalLink className="w-3 h-3 text-neutral-400" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
