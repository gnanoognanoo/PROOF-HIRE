"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { submitProject, startProjectEvaluation, getProjectEvaluation, EvaluationStatusResponse } from "@/lib/api-client";
import { 
  FolderPlus, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Github, 
  Globe, 
  Layers, 
  Users, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  X,
  UploadCloud,
  FileCode,
  Award
} from "lucide-react";

export default function NewProjectSubmissionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [title, setTitle] = useState("ProofHire Core");
  const [description, setDescription] = useState(
    "AI-powered skill verification platform eliminating unverified resume claims through compiler-level AST audits, GPG commit attribution, and Polygon blockchain credential anchoring."
  );
  const [category, setCategory] = useState("Full-Stack & Systems");
  const [projectType, setProjectType] = useState("Production Platform");
  const [startDate, setStartDate] = useState("2024-09-01");
  const [completionDate, setCompletionDate] = useState("2025-01-15");

  // Step 2: Technical Info
  const [repoUrl, setRepoUrl] = useState("https://github.com/proofhire/proofhire-core");
  const [demoUrl, setDemoUrl] = useState("https://proofhire.network");
  const [technologies, setTechnologies] = useState<string[]>([
    "React", "FastAPI", "PostgreSQL", "Gemini", "Next.js", "TypeScript"
  ]);
  const [techInput, setTechInput] = useState("");
  const [architecture, setArchitecture] = useState(
    "Next.js 14 App Router client with asynchronous FastAPI evaluator microservice and Polygon state contract integration."
  );

  // Step 3: Contribution
  const [isTeam, setIsTeam] = useState(true);
  const [teamMembers, setTeamMembers] = useState<string[]>(["alexchen", "dkalu"]);
  const [memberInput, setMemberInput] = useState("");
  const [role, setRole] = useState("Lead Full-Stack Engineer");
  const [responsibilities, setResponsibilities] = useState(
    "Designed core verification pipeline, AST scoring engine, and high-density UI layout."
  );

  // Step 4: Evidence
  const [screenshots, setScreenshots] = useState<string[]>([
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=350&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=350&fit=crop"
  ]);
  const [screenshotInput, setScreenshotInput] = useState("");
  const [documentation, setDocumentation] = useState(
    "Full architectural diagrams, AST schema definitions, and API documentation."
  );
  const [supportingFiles, setSupportingFiles] = useState<string[]>([
    "proofhire-ast-spec.json", "merkle-verification.sol"
  ]);
  const [fileInput, setFileInput] = useState("");

  // Step 5: Submission & Real Pipeline Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationState, setEvaluationState] = useState<EvaluationStatusResponse | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (item: string) => {
    setTechnologies(technologies.filter((t) => t !== item));
  };

  const handleAddMember = () => {
    if (memberInput.trim() && !teamMembers.includes(memberInput.trim())) {
      setTeamMembers([...teamMembers, memberInput.trim()]);
      setMemberInput("");
    }
  };

  const handleRemoveMember = (item: string) => {
    setTeamMembers(teamMembers.filter((m) => m !== item));
  };

  const handleAddScreenshot = () => {
    if (screenshotInput.trim()) {
      setScreenshots([...screenshots, screenshotInput.trim()]);
      setScreenshotInput("");
    }
  };

  const handleAddFile = () => {
    if (fileInput.trim()) {
      setSupportingFiles([...supportingFiles, fileInput.trim()]);
      setFileInput("");
    }
  };

  // Submit and start real backend evaluation
  const handleStartEvaluation = async () => {
    setIsSubmitting(true);

    try {
      // 1. POST /projects to backend
      const created = await submitProject({
        title,
        description,
        category,
        project_type: projectType,
        start_date: startDate,
        completion_date: completionDate,
        repo_url: repoUrl,
        demo_url: demoUrl,
        technologies,
        architecture,
        is_team: isTeam,
        team_members: teamMembers,
        role,
        responsibilities,
        screenshots,
        documentation,
        supporting_files: supportingFiles,
      });

      setCreatedProjectId(created.id);

      // 2. Trigger POST /projects/{id}/evaluate
      const initialStatus = await startProjectEvaluation(created.id);
      setEvaluationState(initialStatus);

      // 3. Start Polling GET /projects/{id}/evaluation
      pollingRef.current = setInterval(async () => {
        try {
          const status = await getProjectEvaluation(created.id);
          setEvaluationState(status);

          if (status.is_complete && status.stage === "Complete") {
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 900);
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const pipelineStages = [
    "Preparing evaluation",
    "Analyzing repository",
    "Extracting skills",
    "Comparing industry standards",
    "Calculating project score",
    "Complete"
  ];

  const getCurrentStageIndex = () => {
    if (!evaluationState) return -1;
    return pipelineStages.findIndex((s) => s.toLowerCase() === evaluationState.stage.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-900 flex flex-col font-sans antialiased">
      <TopNav />

      {/* Subheader */}
      <div className="border-b border-border bg-surface/90 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              proofhire
            </Link>
            <span className="text-neutral-300">/</span>
            <Link href="/projects" className="hover:text-neutral-900 transition-colors">
              projects
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-900 font-medium">new</span>
          </div>

          <span className="text-xs font-mono text-neutral-500">
            Step {currentStep} of 5
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Step Indicator Bar */}
        <div className="rounded-lg border border-border bg-surface p-4 shadow-subtle">
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
            {[
              { num: 1, label: "Basic Details" },
              { num: 2, label: "Technical Info" },
              { num: 3, label: "Contribution" },
              { num: 4, label: "Evidence" },
              { num: 5, label: "AI Evaluation" },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-700 font-bold border border-brand-200"
                      : isPast
                      ? "text-emerald-700 font-medium"
                      : "text-neutral-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-brand-600 text-white"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className="hidden sm:inline text-[11px] truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Basic Details */}
        {currentStep === 1 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Step 1 — Basic Project Details
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Provide core metadata describing your software project.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ProofHire"
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900 font-medium focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what the software accomplishes, architectural highlights, and target users..."
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900 focus:ring-1 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900"
                  >
                    <option>Full-Stack & Systems</option>
                    <option>Distributed Systems & Networking</option>
                    <option>Graphics & UI Engineering</option>
                    <option>Machine Learning & Compilers</option>
                    <option>Security & Cryptography</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900"
                  >
                    <option>Production Platform</option>
                    <option>Open Source Core</option>
                    <option>Academic Capstone</option>
                    <option>Production Microservice</option>
                    <option>Hackathon Winner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
              >
                <span>Continue to Technical Info</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Technical Information */}
        {currentStep === 2 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Step 2 — Technical Information
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Link repository source code and define architectural boundaries for AST static analysis.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  GitHub Repository URL <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="url"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="w-full pl-9 pr-3 py-2 rounded border border-border bg-canvas text-neutral-900 font-mono focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <span className="px-2.5 py-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-medium shrink-0">
                    AST Ready
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Live Demo URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://my-app.network"
                    className="w-full pl-9 pr-3 py-2 rounded border border-border bg-canvas text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Technologies Stack
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="Type technology (e.g. Next.js, FastAPI, WebGL) and press Enter"
                    className="flex-1 rounded border border-border bg-canvas px-3 py-2 text-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3 py-2 rounded border border-border bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-neutral-100 text-neutral-800 border border-neutral-200"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        className="text-neutral-400 hover:text-neutral-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Architecture Description
                </label>
                <textarea
                  rows={3}
                  value={architecture}
                  onChange={(e) => setArchitecture(e.target.value)}
                  placeholder="Describe concurrency model, data pipeline, state machine, or API contract boundaries..."
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900 font-mono text-[11px] leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded border border-border text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
              >
                <span>Continue to Contribution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Contribution */}
        {currentStep === 3 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Step 3 — Contribution & Multi-Developer Attribution
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Attribute git commit authors and define individual responsibility boundaries.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded border border-border bg-neutral-50">
                <div>
                  <span className="font-semibold text-neutral-900 block">Project Structure</span>
                  <span className="text-neutral-500">Is this a solo project or a collaborative multi-developer repository?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTeam(false)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      !isTeam ? "bg-brand-600 text-white" : "bg-white border border-border text-neutral-700"
                    }`}
                  >
                    Solo Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTeam(true)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      isTeam ? "bg-brand-600 text-white" : "bg-white border border-border text-neutral-700"
                    }`}
                  >
                    Team Project
                  </button>
                </div>
              </div>

              {isTeam && (
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Team Members (GitHub Handles)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      placeholder="Add GitHub handle (e.g. dkalu) and press Enter"
                      className="flex-1 rounded border border-border bg-canvas px-3 py-2 text-neutral-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-2 rounded border border-border bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {teamMembers.map((m, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200"
                      >
                        <Github className="w-3 h-3 text-blue-600" />
                        <span>@{m}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m)}
                          className="text-blue-400 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Your Role in Project <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Full-Stack Engineer, Core Systems Contributor"
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Key Technical Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  placeholder="Specific modules authored, performance optimizations, bug fixes, or architecture contracts..."
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded border border-border text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
              >
                <span>Continue to Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Evidence */}
        {currentStep === 4 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-5">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Step 4 — Verifiable Evidence & Documentation
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Provide visual screenshots, architecture documentation, and supporting artifacts for the AI evaluation engine.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Visual Screenshots (Image URLs)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="url"
                    value={screenshotInput}
                    onChange={(e) => setScreenshotInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddScreenshot();
                      }
                    }}
                    placeholder="Enter image URL and press Enter"
                    className="flex-1 rounded border border-border bg-canvas px-3 py-2 text-neutral-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddScreenshot}
                    className="px-3 py-2 rounded border border-border bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium"
                  >
                    Add URL
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {screenshots.map((src, idx) => (
                    <div key={idx} className="relative rounded border border-border overflow-hidden group h-24 bg-neutral-100">
                      <img src={src} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setScreenshots(screenshots.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-neutral-900/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Architecture Documentation Notes
                </label>
                <textarea
                  rows={3}
                  value={documentation}
                  onChange={(e) => setDocumentation(e.target.value)}
                  placeholder="Paste markdown overview or describe repository README structure..."
                  className="w-full rounded border border-border bg-canvas px-3 py-2 text-neutral-900 leading-relaxed font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Supporting Invariant & Benchmark Files
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={fileInput}
                    onChange={(e) => setFileInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFile();
                      }
                    }}
                    placeholder="e.g. proofhire-ast-spec.json, merkle-verification.sol"
                    className="flex-1 rounded border border-border bg-canvas px-3 py-2 text-neutral-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddFile}
                    className="px-3 py-2 rounded border border-border bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium"
                  >
                    Add File
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {supportingFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded bg-neutral-100 text-neutral-700 border border-neutral-200"
                    >
                      <FileCode className="w-3 h-3 text-neutral-500" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() => setSupportingFiles(supportingFiles.filter((_, i) => i !== idx))}
                        className="text-neutral-400 hover:text-neutral-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded border border-border text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-subtle"
              >
                <span>Continue to AI Evaluation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Submit for Evaluation & Live Status Pipeline */}
        {currentStep === 5 && (
          <div className="rounded-lg border border-border bg-surface p-6 shadow-subtle space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Step 5 — Submit for AI Evaluation
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Trigger the Gemini compiler-level AST audit and Python deterministic scoring engine.
              </p>
            </div>

            {/* Pre-Submission Review Summary */}
            {!isSubmitting && (
              <div className="rounded border border-border bg-neutral-50 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 font-mono">
                  <span className="font-bold text-neutral-900 text-sm">{title}</span>
                  <span className="text-neutral-500">{category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600">
                  <div>
                    <span className="font-semibold text-neutral-800">Repository:</span>{" "}
                    <span className="font-mono text-neutral-900">{repoUrl}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-800">Stack:</span>{" "}
                    <span>{technologies.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-800">Structure:</span>{" "}
                    <span>{isTeam ? `Team (${teamMembers.length} members)` : "Solo Contributor"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-800">Role:</span>{" "}
                    <span>{role}</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px] leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Deterministic Evaluation Rule:</strong> Gemini generates structured AST and architectural ratings, but final grade and XP settlement are calculated deterministically in Python using ProofHire&apos;s weighted rubric.
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-4 py-2 rounded border border-border text-neutral-700 font-semibold hover:bg-neutral-100"
                  >
                    Back to Edit
                  </button>

                  <button
                    type="button"
                    onClick={handleStartEvaluation}
                    className="px-6 py-2.5 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-2 shadow-subtle transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Submit for AI Evaluation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Live Real Pipeline Progress Status */}
            {isSubmitting && (
              <div className="rounded-lg border border-border bg-neutral-900 text-white p-6 space-y-6 shadow-elevation font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      ProofHire Real-Time Evaluation Pipeline
                    </span>
                  </div>

                  <div className="text-xs">
                    {evaluationState?.is_complete ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        AUDIT COMPLETE
                      </span>
                    ) : (
                      <span className="text-brand-400 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        PROCESSING ({evaluationState?.progress || 10}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Vertical Stage Pipeline */}
                <div className="space-y-3 py-2">
                  {pipelineStages.map((stageName, idx) => {
                    const activeIdx = getCurrentStageIndex();
                    const isCompleted = activeIdx > idx || (evaluationState?.is_complete && idx === pipelineStages.length - 1);
                    const isCurrent = activeIdx === idx && !evaluationState?.is_complete;
                    const isPending = activeIdx < idx && !evaluationState?.is_complete;

                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                            isCompleted
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-brand-600 text-white ring-2 ring-brand-400 animate-pulse"
                              : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        <div className="flex-1 flex items-center justify-between">
                          <span
                            className={`font-semibold ${
                              isCompleted
                                ? "text-emerald-300"
                                : isCurrent
                                ? "text-white font-bold"
                                : "text-neutral-500"
                            }`}
                          >
                            {stageName}
                          </span>

                          {isCurrent && (
                            <span className="text-[10px] text-brand-400 font-mono animate-pulse">
                              In Progress...
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1">
                              <span>Passed</span>
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Terminal Log Console */}
                <div className="p-3 rounded bg-black/60 border border-neutral-800 text-[11px] text-neutral-300 space-y-1">
                  <div className="text-neutral-500 text-[10px] uppercase tracking-wider">
                    Telemetric Stream:
                  </div>
                  <p className="text-emerald-400">
                    &gt; {evaluationState?.log_message || "Initializing ProofHire evaluator engine..."}
                  </p>
                </div>

                {/* Final Completion Hero */}
                {evaluationState?.is_complete && evaluationState.evaluation_result && (
                  <div className="p-4 rounded-lg bg-neutral-800/80 border border-neutral-700 space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase text-neutral-400">
                          Assigned Project Grade
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-3xl font-bold text-white">
                            Grade {evaluationState.evaluation_result.grade}
                          </span>
                          <span className="text-sm font-semibold text-emerald-400">
                            {evaluationState.evaluation_result.score.toFixed(1)} / 100
                          </span>
                          <span className="text-xs text-brand-400 font-mono">
                            +{evaluationState.evaluation_result.xp_earned} XP
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/projects/${createdProjectId || "proj_proofhire"}`}
                        className="px-5 py-2.5 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-elevation transition-all"
                      >
                        <span>View Technical Evaluation Report</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
