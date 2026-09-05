"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Building2, 
  GraduationCap, 
  Code2, 
  Github, 
  Award, 
  Sparkles,
  Terminal,
  Layers,
  Fingerprint,
  Check,
  Plus,
} from "lucide-react";
import { useAuth, AccountRole } from "@/context/auth-context";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, completeOnboarding } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    role: (profile?.role || "developer") as AccountRole,
    full_name: profile?.full_name || "Alex Chen",
    username: profile?.username || "alexchen",
    headline: profile?.headline || "Distributed Systems Engineer | Rust & Concurrency",
    bio: profile?.bio || "Designing fault-tolerant consensus engines and low-latency storage architectures.",
    location: profile?.location || "San Francisco, CA / Remote",
    university: profile?.university || "UC Berkeley",
    graduation_year: profile?.graduation_year || 2023,
    company_name: profile?.company_name || "HyperScale Labs",
    position: "Lead Infrastructure Architect",
    skills: ["Distributed Systems", "Rust", "Go (Golang)", "Concurrency", "Linux eBPF"],
    github_username: profile?.github_username || "alexchen_dev",
    sync_repos: true,
  });

  const availableSkills = [
    "Distributed Systems",
    "Rust",
    "Go (Golang)",
    "Concurrency",
    "Linux eBPF",
    "Database Internals",
    "Kubernetes & CRI",
    "CUDA & Triton",
    "TypeScript / Node",
    "WebGL / WebGPU",
    "Solidity / EVM",
    "PyTorch Internals"
  ];

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding(formData);
    if (formData.role === "recruiter") {
      router.push("/recruiter");
    } else {
      router.push("/");
    }
  };

  const steps = [
    { num: 1, label: "Account Type" },
    { num: 2, label: "Basic Info" },
    { num: 3, label: formData.role === "recruiter" ? "Company Info" : "Education" },
    { num: 4, label: "Skills" },
    { num: 5, label: "GitHub" },
    { num: 6, label: "Preview" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-neutral-900 pb-12">
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-neutral-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white shadow-subtle">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight">ProofHire</span>
        </Link>
        <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
          <span>Step {currentStep} of 6</span>
          <span>•</span>
          <span className="text-brand-700 font-semibold">{steps[currentStep - 1].label}</span>
        </div>
      </header>

      {/* Step Progress Stepper */}
      <div className="border-b border-border bg-white px-6 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-brand-600 text-white"
                        : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : s.num}
                  </div>
                  <span
                    className={`hidden md:inline text-xs font-medium ${
                      isCurrent ? "text-neutral-900 font-bold" : "text-neutral-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 mx-2 h-0.5 transition-colors ${
                      isCompleted ? "bg-emerald-600" : "bg-neutral-200"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-2xl rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-subtle space-y-6">
          {/* STEP 1: Account Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Choose your account type</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select your primary objective on the ProofHire network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: "developer",
                    title: "Software Engineer / Developer",
                    desc: "Prove skills via GitHub repos, automated AST audits, and earn blockchain credentials.",
                    icon: Code2,
                  },
                  {
                    id: "student",
                    title: "Student / Academic",
                    desc: "Build a verified dossier with course benchmarks, project grades, and verified XP.",
                    icon: GraduationCap,
                  },
                  {
                    id: "recruiter",
                    title: "Technical Recruiter / Talent",
                    desc: "Source substantiated engineering talent filtered by AST grades and peer verification.",
                    icon: Building2,
                  },
                  {
                    id: "institution",
                    title: "Institution / University",
                    desc: "Issue cryptographically signed credentials and assess cohort code quality.",
                    icon: ShieldCheck,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.role === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFormData({ ...formData, role: item.id as AccountRole })}
                      className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-brand-600 bg-brand-50/50 shadow-subtle ring-1 ring-brand-600"
                          : "border-border bg-white hover:bg-neutral-50 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-md ${isSelected ? "bg-brand-600 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xs text-neutral-900">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Basic Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Basic Information</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Set up your public identity on the verified engineering directory.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-800">Legal Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Alex Chen"
                      className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-800">Unique Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">@</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="alexchen"
                        className="w-full h-9 pl-7 pr-3 rounded-md border border-border bg-canvas text-xs font-mono text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="Staff Distributed Systems Engineer"
                    className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA / Remote"
                    className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">Technical Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief summary of your systems focus, languages, or research interests..."
                    className="w-full p-2.5 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Education / Company Information */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  {formData.role === "recruiter" ? "Company & Recruiting Organization" : "Academic Background"}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {formData.role === "recruiter" 
                    ? "Provide verified corporate credentials for candidate outreach."
                    : "Connect your alma mater or current institution for peer cohort benchmarking."}
                </p>
              </div>

              {formData.role === "recruiter" ? (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-800">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="Datadog / Stripe / Scale AI"
                      className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-800">Recruiting Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Lead Technical Talent Partner"
                      className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-800">University / Institution</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      placeholder="e.g. UC Berkeley, MIT, Stanford, IIT"
                      className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-800">Graduation Year</label>
                    <input
                      type="number"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: Number(e.target.value) })}
                      placeholder="2024"
                      className="w-full h-9 px-3 rounded-md border border-border bg-canvas text-xs text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Skills */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Verified Skill Matrix Tags</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select core engineering disciplines to seed your initial 24-point evaluation radar.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {availableSkills.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-brand-600 text-white font-bold shadow-subtle"
                          : "bg-canvas border border-border text-neutral-700 hover:bg-neutral-100"
                      }`}
                    >
                      {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-md border border-border bg-canvas font-mono text-[11px] text-neutral-600 space-y-1">
                <div className="font-bold text-neutral-800">Seed XP Calculation:</div>
                <p className="text-neutral-500">
                  Selecting {formData.skills.length} domains establishes an initial foundation of {(formData.skills.length * 200).toLocaleString()} Verifiable XP.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: GitHub Username */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">GitHub Commit Attribution</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Connect your GitHub profile for automated PR analysis, line count tracking, and GPG signature validation.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-800">GitHub Handle</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.github_username}
                      onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                      placeholder="alexchen_dev"
                      className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-canvas text-xs font-mono text-neutral-900 focus:border-brand-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 p-3 rounded-md border border-border bg-canvas cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sync_repos}
                    onChange={(e) => setFormData({ ...formData, sync_repos: e.target.checked })}
                    className="mt-0.5 rounded border-border text-brand-600 focus:ring-0"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-semibold text-neutral-900">Enable Automated Git Tree Audits</span>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Allows ProofHire to calculate AST invariants and commit attribution deltas across public repositories.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Profile Preview */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Verify & Complete Dossier</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review your initial verifiable credentials before anchoring to the network.
                </p>
              </div>

              {/* Dossier Card Preview */}
              <div className="rounded-lg border border-border bg-white p-4 shadow-subtle space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-neutral-900">{formData.full_name}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                    </div>
                    <div className="text-xs font-mono text-neutral-500">
                      @{formData.username} • {formData.location}
                    </div>
                    <div className="text-xs text-neutral-700 font-medium pt-0.5">
                      {formData.headline}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-brand-50 border border-brand-200 text-right font-mono">
                    <div className="text-[10px] uppercase text-brand-700">Initial Rank</div>
                    <div className="text-xs font-bold text-brand-900">Level 1 Novice</div>
                    <div className="text-[10px] text-neutral-500">1,000 XP Seed</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/80">
                  {formData.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-neutral-100 border border-border text-[10px] font-mono text-neutral-700">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/80 text-[11px] font-mono text-neutral-500">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Fingerprint className="h-3 w-3" />
                    <span>Genesis Attestation Ready</span>
                  </span>
                  <span>GitHub: @{formData.github_username}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-3 py-1.5 rounded-md border border-border bg-white hover:bg-neutral-50 disabled:opacity-40 text-neutral-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={nextStep}
              className="px-4 py-1.5 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-colors flex items-center gap-1.5"
            >
              <span>{currentStep === 6 ? "Complete Onboarding & Enter ProofHire" : "Continue"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
